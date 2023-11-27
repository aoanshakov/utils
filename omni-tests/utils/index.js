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

const submoduleNames = modules.map(({ module, name }) => name).filter(name => name != 'desktop');

const envParams = modules.filter(
    ({ param }) => !!param,
).reduce(
    (result, { name, param }) => (result[name] = param, result),
    {},
);

actions['initialize'] = params => modules.map(({ module, name }) => [module, modulePath(name)]).reduce(
    (result, [module, path]) => result.concat(
        [`git config --global --add safe.directory ${path}`].
            concat(!fs.existsSync(path) ? [
                () => mkdir(path),
                `cd ${path} && git clone${
                    params.stand ? ` --branch stand-${params.stand}` : ''
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
            ...(
                params.local ?
                    params.local.length > 0 ?
                        params.local :
                        submoduleNames :
                    []
            ).reduce(
                (result, name) => {
                    const envParam = envParams[name];

                    result[envParam] = values?.local?.[envParam];
                    return result;
                },
                {},
            ),
        }).map(
            ([key, value]) => [key, value.split('{stand}').join(params.stand || '')].join('='),
        ).join("\n")));
    }
];

actions['remove-node-modules'] = modules.map(({ module, path }) => rmVerbose(`${path}/node_modules`));
actions['clear'] = modules.map(({ module, path }) => rmVerbose(path));
actions['bash'] = [];

actions['run-server'] = params => actions['initialize'](params).concat([
    [
        'openssl req -x509',
            '-nodes',
            '-days 365',
            '-newkey rsa:2048',
            '-keyout /etc/ssl/private/nginx-selfsigned.key',
            '-out /etc/ssl/certs/nginx-selfsigned.crt',
            '-subj "/C=GB/ST=London/L=London/O=Global Security/OU=IT Department/CN=example.com"'
    ].join(' '),

    'service nginx stop',
    `cp ${nginxConfig} /etc/nginx/nginx.conf`,
    'service nginx start',
    //`cd ${desktop} && npm run dev`
]);

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
