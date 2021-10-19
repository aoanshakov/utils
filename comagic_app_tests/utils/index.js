const {Args, isOneOf, isTrue} = require('./arguments'),
    fs = require('fs'),
    execute = require('./execute'),
    rm = require('./rm'),
    mkdir = require('./mkdir');

const {
    application,
    nodeModules,
    nginxConfig,
    applicationPatch,
    chatsPatch,
    employeesPatch,
    huskyPatch,
    preCommitHook,
    chats,
    employees,
    misc
} = require('./paths');

const cda = `cd ${application} &&`,
    cdc = `cd ${chats} &&`,
    actions = {},
    chatOverridenFiles = 'src/models/RootStore.ts',
    employeesOverridenFiles = chatOverridenFiles;

const overridenFiles = [
    'public/index.html',
    'src/bootstrap.tsx',
    'src/history.ts',
    'config/webpack.config.js',
    'package.json',
    'src/models/RootStore.ts'
].join(' ');
    
actions['fix-permissions'] =
    [`if [ -n "$APPLICATION_OWNER" ]; then chown -R $APPLICATION_OWNER:$APPLICATION_OWNER $1 ${application}; fi`];

const overriding = [{
    application,
    overridenFiles,
    applicationPatch
}, {
    application: chats,
    overridenFiles: chatOverridenFiles,
    applicationPatch: chatsPatch
}, {
    application: employees,
    overridenFiles: employeesOverridenFiles,
    applicationPatch: employeesPatch
}];

actions['create-patch'] = overriding.reduce((result, {
    application,
    overridenFiles,
    applicationPatch
}) => result.concat(fs.existsSync(application) ? [
    `cd ${application} && git diff -- ${overridenFiles} > ${applicationPatch}`
] : []), []);

actions['restore-code'] = () => overriding.reduce((result, {
    application,
    overridenFiles
}) => result.concat(fs.existsSync(application) ? [
    `cd ${application} && git checkout ${overridenFiles}`
] : []), []);

actions['modify-code'] = () => actions['restore-code']().concat(overriding.reduce((result, {
    application,
    applicationPatch
}) => result.concat(fs.existsSync(application) ? [
    `cd ${application} && patch -p1 < ${applicationPatch}`
] : []), [])).concat(
    actions['fix-permissions']
);

actions['initialize'] = () => actions['modify-code']().concat([
    ['chats', chats, ' --branch stand-va0'],
    ['employees', employees, '']
].map(([module, path, args]) => (!fs.existsSync(path) ? [
    () => mkdir(misc),
    `cd ${misc} && git clone${args} git@gitlab.uis.dev:web/comagic_app_modules/${module}.git`
] : [])).reduce((result, item) => result.concat(item), []).concat(!fs.existsSync(nodeModules) ?
    [`chown -R root:root ${application}`, `${cda} npm install --verbose`].concat(actions['fix-permissions']) : []));

actions['reset'] = [() => rm(nodeModules), () => rm(misc)];
actions['bash'] = [];
actions['disable-hook'] = [`chmod +x ${preCommitHook}`, `${cda} patch -p1 < ${huskyPatch}`];
actions['enable-hook'] = [/*`chmod -x ${preCommitHook}`, */`${cda} git checkout ${preCommitHook}`];

actions['run-server'] = () => actions['initialize']().concat([
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
    `${cda} npm run dev`
]);

const {action, ...params} = (new Args({
    action: {
        validate: isOneOf.apply(null, Object.keys(actions))
    }
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
