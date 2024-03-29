const { Args, isOneOf, isListOf, isString } = require('./arguments'),
    fs = require('fs'),
    execute = require('./execute'),
    mkdir = require('./mkdir'),
    write = require('./write');
    JSON3 = require('json3'),
    readJson = path => JSON.parse(fs.readFileSync(path)),
    encodeJson = content => JSON3.stringify(content, null, 2);

const {
    src,
    envJson,
} = require('./paths');

const actions = {},
    rmVerbose = target => `if [ -e ${target} ]; then rm -rvf ${target}; fi`,
    modulePath = directory => `${src}/${directory}`;

actions['fix-permissions'] =
    [`if [ -n "$APPLICATION_OWNER" ]; then chown -R $APPLICATION_OWNER:$APPLICATION_OWNER $1 ${src}; fi`];

const modules = [{
    repository: 'comagic-app/desktop',
    directory: 'desktop',
    configSection: 'host',
    envFileName: '.env',
    script: 'dev',
    branch: '{stand}'
}, {
    repository: 'comagic-app/frontend',
    directory: 'comagic-app',
    configSection: 'host',
    envFileName: '.env',
    script: 'dev',
}, {
    repository: 'chats/frontend',
    directory: 'chats',
    param: 'REACT_APP_MODULE_CHATS',
}, {
    repository: 'softphone/frontend',
    directory: 'softphone',
    param: 'REACT_APP_MODULE_SOFTPHONE',
    linkedModules: [{
        module: '@comagic/softphone-widget',
        repository: 'web/sip_lib',
        directory: 'softphone-widget',
        linkedModules: [{
            module: '@comagic/softphone-core',
            repository: 'web/uis_webrtc',
            directory: 'softphone-core',
        }],
    }],
}, {
    repository: 'web/comagic_app_modules/contacts',
    directory: 'contacts',
    param: 'REACT_APP_MODULE_CONTACTS',
}, {
    repository: 'web/comagic_app_modules/operator-workplace',
    directory: 'operator-workplace',
    param: 'REACT_APP_MODULE_EMPLOYEES',
}];

const moduleNames = modules.map(({ repository, directory }) => directory),
    isHost = directory => ['desktop', 'comagic-app'].includes(directory),
    submoduleNames = moduleNames.filter(directory => !isHost(directory)),
    replaceWithStand = ({ value, params }) => value?.split('{stand}').join(params.stand || ''),
    linkedModulePath = ({ path, directory}) => `${path}/linked_modules/${directory}`;

const envParams = modules.filter(
    ({ param }) => !!param,
).reduce(
    (result, { directory, param }) => (result[directory] = param, result),
    {},
);

actions['initialize'] = params => modules.reduce(
    (result, {
        repository,
        directory,
        branch = 'stand-{stand}',
        linkedModules = [],
    }) => {
        const path = modulePath(directory);

        const clone = ({ path, repository }) => !fs.existsSync(path) ? [
            () => mkdir(path),

            `cd ${path} && git clone${
                params.stand ? ` --branch ${replaceWithStand({ value: branch, params })}` : ''
            } git@gitlab.uis.dev:${repository}.git .`
        ] : [];

        const cloneLinkedModules = ({ path, linkedModules }) => linkedModules?.reduce((result, {
            repository,
            directory,
            linkedModules,
        }) => {
            path = linkedModulePath({ path, directory });

            return result.concat(clone({
                path,
                repository,
            })).concat(cloneLinkedModules({ linkedModules, path }));
        }, []);

        const eachLinkedModuleHost = ({
            onBeforeModulesTraverse = () => null,
            onAfterModulesTraverse = () => null,
            handleModule = () => null,
        }) => {
            const handleLinkedModuleHost = ({ path, linkedModules }) => {
                if (!linkedModules?.length) {
                    return;
                }
                
                const packageJsonPath = `${path}/package.json`,
                    backupPath = `${path}/package-backup.json`,
                    packageJson = readJson(packageJsonPath);

                const params = {
                    path,
                    backupPath,
                    packageJson,
                    packageJsonPath,
                };

                onBeforeModulesTraverse(params);

                linkedModules.forEach(item => {
                    const {
                        directory,
                        linkedModules,
                    } = item;

                    handleModule({
                        ...item,
                        path,
                        packageJson,
                    });

                    handleLinkedModuleHost({
                        path: linkedModulePath({ path, directory }),
                        linkedModules,
                    });
                });

                onAfterModulesTraverse(params);
            };

            handleLinkedModuleHost({ path, linkedModules });
        };

        return result.concat(
            [`git config --global --add safe.directory ${path}`].
                concat(clone({ path, repository })).
                concat(!fs.existsSync(`${path}/node_modules`) ? [
                    `cd ${path} && npm set registry http://npm.dev.uis.st:80`,
                ].concat(cloneLinkedModules({ path, linkedModules })).concat((linkedModules?.length ? [() => {
                    const packageJsons = [];

                    eachLinkedModuleHost({
                        onBeforeModulesTraverse: ({
                            packageJsonPath,
                            packageJson,
                            backupPath,
                            path,
                        }) => {
                            !fs.existsSync(backupPath) && write(backupPath, fs.readFileSync(packageJsonPath));

                            packageJsons.push({
                                path,
                                packageJson,
                            });
                        },

                        handleModule: ({
                            path,
                            module,
                            directory,
                            packageJson,
                        }) => packageJsons.forEach(
                            ({ packageJson, path: basePath }) => [
                                'dependencies',
                                'peerDependencies',
                            ].forEach(key => module in (packageJson[key] || {}) && (
                                packageJson[key][module] = linkedModulePath({
                                    path: `.${path.substr(basePath.length)}`,
                                    directory,
                                })
                            )) 
                        ),

                        onAfterModulesTraverse: ({
                            packageJsonPath,
                            packageJson,
                        }) => write(packageJsonPath, encodeJson(packageJson)),
                    });
                }] : []).concat([
                    `cd ${path} && npm install --verbose`
                ]).concat([() => eachLinkedModuleHost({
                    onAfterModulesTraverse: ({
                        packageJsonPath,
                        backupPath,
                    }) => {
                        if (!fs.existsSync(backupPath)) {
                            return;
                        }

                        write(packageJsonPath, fs.readFileSync(backupPath));
                        fs.unlinkSync(backupPath);
                    },
                })]).concat(actions['fix-permissions'])) : []),
        );
    },
    [],
);

const local = params => 
    params.local ?
        params.local.length > 0 ?
            params.local :
            submoduleNames :
        [];

actions['set-env'] = params => [
    () => {
        const key = params?.stand ? 'stand' : 'pp',
            values = require(envJson);

        modules.forEach(({
            repository,
            directory,
            configSection,
            envFileName = '.env.local',
        }) => write(`${modulePath(directory)}/${envFileName}`, Object.entries({
            ...(values.common || {}),
            ...(values[key]?.common || {}),
            ...(values[key]?.[configSection || directory] || {}),
            ...(local(params)).reduce(
                (result, name) => {
                    const envParam = envParams[name];

                    result[envParam] = values?.local?.[envParam];
                    return result;
                },
                {},
            ),
        }).map(
            ([key, value]) => [key, replaceWithStand({ value, params })].join('='),
        ).join("\n")));
    }
];

actions['remove-node-modules'] = params => (
    params.module ?
        modules.filter(({ directory }) => params.module.includes(directory)) :
        modules
).map(({ repository, directory }) => rmVerbose(`${modulePath(directory)}/node_modules`));

actions['clear'] = modules.map(({ repository, directory }) => rmVerbose(modulePath(directory)));
actions['bash'] = [];

actions['run'] = params =>
    actions['initialize'](params).
    concat(actions['set-env'](params)).
    concat(modules.reduce((result, { directory, script = 'start' }) => {
        const path = modulePath(directory),
            serverLog = `${path}/server.log`;

        if (!isHost(directory) && !local(params).includes(directory)) {
            return result;
        }

        return result.concat([
            rmVerbose(serverLog),
            `touch ${serverLog}`,
            `cd ${path} && npm run ${script} > ${serverLog} 2>&1 &`,
        ]);
    }, []));

const {action, ...params} = (new Args({
    action: {
        validate: isOneOf.apply(null, Object.keys(actions))
    },
    stand: {
        validate: isString,
    },
    local: {
        validate: isListOf.apply(null, submoduleNames),
    },
    module: {
        validate: isListOf.apply(null, moduleNames),
    },
})).createObjectFromArgsArray(process.argv);

if (!action) {
    console.log('Действие не указано');
    return;
}

const utils = Object.entries(actions).reduce((result, [action, commands]) => {
    result[action] = params => execute(typeof commands == 'function' ? commands(params || {}) : commands);
    return result;
}, {});

utils[action](params);
