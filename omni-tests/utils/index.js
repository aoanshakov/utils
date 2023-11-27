const { Args, isOneOf, isListOf, isString } = require('./arguments'),
    fs = require('fs'),
    execute = require('./execute'),
    mkdir = require('./mkdir'),
    write = require('./write');

const {
    src,
    envJson,
} = require('./paths');

const actions = {},
    rmVerbose = target => `if [ -e ${target} ]; then rm -rvf ${target}; fi`,
    modulePath = name => `${src}/${name}`;

actions['fix-permissions'] =
    [`if [ -n "$APPLICATION_OWNER" ]; then chown -R $APPLICATION_OWNER:$APPLICATION_OWNER $1 ${src}; fi`];

const modules = [{
    module: 'comagic-app/desktop',
    name: 'desktop',
    envFileName: '.env',
    script: 'dev',
    branch: '{stand}'
}, {
    module: 'chats/frontend',
    name: 'chats',
    param: 'REACT_APP_MODULE_CHATS',
}, {
    module: 'softphone/frontend',
    name: 'softphone',
    param: 'REACT_APP_MODULE_SOFTPHONE',
}, {
    module: 'web/comagic_app_modules/contacts',
    name: 'contacts',
    param: 'REACT_APP_MODULE_CONTACTS',
}, {
    module: 'web/comagic_app_modules/operator-workplace',
    name: 'operator-workplace',
    param: 'REACT_APP_MODULE_EMPLOYEES',
}];

const submoduleNames = modules.map(({ module, name }) => name).filter(name => name != 'desktop'),
    replaceWithStand = ({ value, params }) => value.split('{stand}').join(params.stand || '');

const envParams = modules.filter(
    ({ param }) => !!param,
).reduce(
    (result, { name, param }) => (result[name] = param, result),
    {},
);

actions['initialize'] = params => modules.map(({ name, ...module }) => ({
    path: modulePath(name),
    ...module, 
})).reduce(
    (result, {
        module,
        path,
        branch = 'stand-{stand}',
    }) => result.concat(
        [`git config --global --add safe.directory ${path}`].
            concat(!fs.existsSync(path) ? [
                () => mkdir(path),
                `cd ${path} && git clone${
                    params.stand ? ` --branch ${replaceWithStand({ value: branch, params })}` : ''
                } git@gitlab.uis.dev:${module}.git .`
            ] : []).
            concat(!fs.existsSync(`${path}/node_modules`) ? [
                `cd ${path} && npm set registry http://npm.dev.uis.st:80`,
                `cd ${path} && npm install --verbose`
            ].
            concat(actions['fix-permissions']) : []),
    ),
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
            module,
            name,
            envFileName = '.env.local',
        }) => write(`${modulePath(name)}/${envFileName}`, Object.entries({
            ...(values.common || {}),
            ...(values[key]?.common || {}),
            ...(values[key]?.[name] || {}),
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

actions['remove-node-modules'] = modules.map(({ module, name }) => rmVerbose(`${modulePath(name)}/node_modules`));
actions['clear'] = modules.map(({ module, name }) => rmVerbose(modulePath(name)));
actions['bash'] = [];

actions['run'] = params =>
    actions['initialize'](params).
    concat(actions['set-env'](params)).
    concat(modules.reduce((result, { name, script = 'start' }) => {
        const path = modulePath(name),
            serverLog = `${path}/server.log`;

        if (name != 'desktop' && !local(params).includes(name)) {
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
