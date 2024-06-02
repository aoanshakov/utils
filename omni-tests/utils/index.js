const { Args, isOneOf, isListOf, isString } = require('./arguments'),
    fs = require('fs'),
    execute = require('./execute'),
    mkdir = require('./mkdir'),
    write = require('./write'),
    JSON3 = require('json3'),
    { v4: uuid } = require('uuid'),
    readJson = path => JSON.parse(fs.readFileSync(path)),
    encodeJson = content => JSON3.stringify(content, null, 2);

const {
    src,
    envJson,
    tmpJson,
    tmp,
} = require('./paths');

const actions = {},
    ifExists = (resource, command, not = '') => `if [ ${not}-e ${resource} ]; then ${command}; fi`,
    ifNotExists = (resource, command) => ifExists(resource, command, '! '),
    rmVerbose = target => ifExists(target, `rm -rvf ${target}`),
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
    dependenciesParams = ['peerDependencies', 'dependencies'];

const envParams = modules.filter(
    ({ param }) => !!param,
).reduce(
    (result, { directory, param }) => (result[directory] = param, result),
    {},
);

const linkedModules = [{
    module: '@comagic/softphone-widget',
    repository: 'web/sip_lib',
}, {
    module: '@comagic/softphone-core',
    repository: 'web/uis_webrtc',
}].map(item => {
    item.isLinkedModule = true;

    if (item.directory) {
        return item;
    }

    item.directory = (module => {
        if (!module.length || module.length > 2) {
            return '';
        }

        if (module.length == 1) {
            return module[0];
        }

        if (module[0] !== '@comagic') {
            return '';
        }

        return module[1];
    })(item.module.split('/'));

    return item;
}).reduce((linkedModules, item) => (linkedModules[item.module] = item, linkedModules), {});

const allModules = Object.values(linkedModules).concat(modules),
    addDescription = (task, message) => (task.getDescription = () => message, task);

const show = tasks => ['', ...tasks, ''].forEach(
    task => {
        task?.getDescription && console.log(task.getDescription());
        typeof task === 'string' && console.log(task);
    },
);

const handlePackageJson = type => fs.existsSync(tmpJson)
    ?  Object.entries(readJson(tmpJson) || {}).reduce(
        (tasks, [directory, item]) => [
            ...tasks,
            `cp ${item[type]} ${modulePath(directory)}/package.json`
        ],

        [],
    )

    : [];

actions['restore-package-json'] = () => handlePackageJson('original');

const removeTmp = [
    rmVerbose(tmp),
    rmVerbose(tmpJson),
];

actions['mount-linked-modules'] = () => [
    ...actions['restore-package-json'](),
    ...removeTmp,
    `mkdir -p ${tmp}`,

    addDescription(
        () => write(tmpJson, encodeJson({})),
        `Creating ${tmpJson}`,
    ),

    () => {
        const getDependencies = moduleName => {
            const directory = linkedModules[moduleName]?.directory;

            if (!directory) {
                return [];
            }

            const packageParams = readJson(`${modulePath(directory)}/package.json`);

            const dependencies =  Object.keys(['dependencies', 'peerDependencies'].reduce(
                (dependencies, param) => {
                    return {
                        ...dependencies,
                        ...packageParams[param],
                    };
                },

                {},
            )).filter(name => linkedModules[name]).reduce((dependencies, moduleName) => [
                ...dependencies,
                moduleName,
                ...getDependencies(moduleName),
            ], []);

            return dependencies;
        };

        const linkedModuleDependencies = Object.keys(linkedModules).reduce((linkedModuleDependencies, moduleName) => ({
            ...linkedModuleDependencies,
            [moduleName]: getDependencies(moduleName),
        }), {});

        const tasks = allModules.reduce((tasks, { directory: moduleDirectory, isLinkedModule }) => {
            const path = modulePath(moduleDirectory),
                packageJsonPath = `${path}/package.json`,
                packageParams = readJson(packageJsonPath),
                originalPackageParams = readJson(packageJsonPath);

            let hasLinkedModules = false;

            tasks = dependenciesParams.reduce(
                (tasks, param) => Object.keys(packageParams[param] || {}).reduce(
                    (tasks, moduleName) => {
                        const item = linkedModules[moduleName];

                        if (!item) {
                            return tasks;
                        }

                        hasLinkedModules = true;

                        if (isLinkedModule) {
                            delete(packageParams[param][moduleName]);
                            console.log(`Remove ${moduleName} from ${moduleDirectory}/package.json`);

                            return tasks;
                        } else {
                            const command = 'npm link ';

                            return [
                                moduleName,
                                ...linkedModuleDependencies[moduleName],
                            ].reduce((tasks, moduleName) => {
                                const { directory } = linkedModules[moduleName],
                                    relativeDirectory = `linked_modules/${directory}`,
                                    relativeDirectoryWithDot = `./${relativeDirectory}`,
                                    linkedModulePath = `${path}/${relativeDirectory}`;

                                packageParams.scripts?.postinstall?.indexOf?.(command) !== 0 && (
                                    (packageParams.scripts || (packageParams.scripts = {})).postinstall = (
                                        packageParams.scripts?.postinstall
                                            ? `${packageParams.scripts.postinstall} &&`
                                            : ''
                                    ) + command
                                );

                                packageParams.scripts.postinstall += ` ${relativeDirectoryWithDot}`;
                                packageParams[param][moduleName] = relativeDirectoryWithDot;

                                return [
                                    ...tasks,
                                    ifNotExists(linkedModulePath, `mkdir -p ${linkedModulePath}`),

                                    ifNotExists(
                                        `${linkedModulePath}/package.json`,
                                        `mount --bind ${modulePath(directory)} ${linkedModulePath}`,
                                    )
                                ];
                            }, tasks);
                        }
                    },

                    tasks,
                ),
                tasks,
            );

            return [
                ...((hasLinkedModules ? [
                    {
                        name: 'modified',
                        params: packageParams,
                    },
                    {
                        name: 'original',
                        params: originalPackageParams,
                    },
                ].map(({ name, params }) => {
                    const filePath = `${tmp}/${uuid()}`;

                    return addDescription(
                        () => {
                            const tmpParams = readJson(tmpJson);

                            (tmpParams[moduleDirectory] || (tmpParams[moduleDirectory] = {}))[name] = filePath;

                            write(filePath, encodeJson(params));
                            write(tmpJson, encodeJson(tmpParams));
                        },

                        `Copy ${name} package.json from ${packageJsonPath} to ${filePath}`,
                    );
                }) : [])),

                ...tasks,
            ]
        }, []);

        return execute(tasks);
    },
];

actions['install-node-modules'] = () => {
    return [
        () => execute(actions['mount-linked-modules']()),

        () => execute([
            ...handlePackageJson('modified'),

            ...modules.reduce((tasks, { directory }) => {
                const path = modulePath(directory);

                return [
                    ...tasks,

                    ifNotExists(
                        `${path}/node_modules`,
                        `cd ${path} && npm set registry http://npm.dev.uis.st:80 && npm install --verbose`,
                    ),
                ];
            }, []),

            ...handlePackageJson('original'),
        ]),

        ...removeTmp,
    ];
};

actions['initialize'] = params => {
    const clone = ({
        path,
        repository,
        branch = 'stand-{stand}',
    }) => !fs.existsSync(path) ? [
        `mkdir -p ${path}`,

        `cd ${path} && git clone --progress --verbose${
            params.stand ? ` --branch ${replaceWithStand({ value: branch, params })}` : ''
        } git@gitlab.uis.dev:${repository}.git .`
    ] : [];

    return [
        ...allModules.reduce((clones, {
            repository,
            directory,
        }) => clones.concat(directory ? clone({
            path: modulePath(directory),
            repository,
        }) : []), []),

        () => execute(actions['install-node-modules']()),
        ...actions['fix-permissions'],
    ];
};

/*
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
*/

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
        allModules.filter(({ directory }) => params.module.includes(directory)) :
        allModules
).map(({ repository, directory }) => rmVerbose(`${modulePath(directory)}/node_modules`));

actions['remove-linked-modules'] = params => (
    params.module ?
        allModules.filter(({ directory }) => params.module.includes(directory)) :
        allModules
).map(({ repository, directory }) => rmVerbose(`${modulePath(directory)}/linked_modules`));

actions['clear'] = [
    rmVerbose(tmp),
    rmVerbose(tmpJson),

    ...allModules.map(({ repository, directory }) => rmVerbose(modulePath(directory))),
];
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
            ifNotExists(serverLog, `touch ${serverLog}`),
            `cat /dev/null > ${serverLog}`,
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
