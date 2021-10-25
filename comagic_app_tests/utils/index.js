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
    softphonePatch,
    preCommitHook,
    chats,
    employees,
    softphone,
    misc,
    softphoneMisc,
    sipLib,
    sipLibPatch,
    uisWebRTC
} = require('./paths');

const cda = `cd ${application} &&`,
    cdc = `cd ${chats} &&`,
    actions = {},
    chatOverridenFiles = 'src/models/RootStore.ts package.json',
    employeesOverridenFiles = chatOverridenFiles,
    softphoneOverridenFiles = 'package.json src/models/RootStore.ts',
    sipLibOverridenFiles = softphoneOverridenFiles;

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
}, {
    application: softphone,
    overridenFiles: softphoneOverridenFiles,
    applicationPatch: softphonePatch
}, {
    application: sipLib,
    overridenFiles: sipLibOverridenFiles,
    applicationPatch: sipLibPatch
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
}) => result.concat([
    `if [ -d ${application} ] && [ -f ${applicationPatch} ]; ` +
        `then cd ${application} && patch -p1 < ${applicationPatch}; ` +
    `fi`
]), [])).concat(
    actions['fix-permissions']
);

const appModule = ([module, path, args]) => [`comagic_app_modules/${module}`, path, args, misc],
    branch2487 = ' --branch tasks/PBL-2487';

actions['initialize'] = () => [
    appModule(['chats', chats, ' --branch stand-va0']),
    appModule(['employees', employees, '']),
    appModule(['softphone', softphone, '']),
    ['sip_lib', sipLib, branch2487, softphoneMisc],
    ['uis_webrtc', uisWebRTC, branch2487, sipLib]
].map(([module, path, args, misc]) => (!fs.existsSync(path) ? [
    () => mkdir(misc),
    `cd ${misc} && git clone${args} git@gitlab.uis.dev:web/${module}.git`
] : [])).reduce((result, item) => result.concat(item), []).concat(
    actions['modify-code']()
).concat(!fs.existsSync(nodeModules) ?
    [`chown -R root:root ${application}`, `${cda} npm install --verbose`].concat(actions['fix-permissions']) : []);

actions['reset'] = [() => rm(nodeModules), () => rm(misc)];
actions['bash'] = [];
actions['disable-hook'] = [`chmod +x ${preCommitHook}`, `${cda} patch -p1 < ${huskyPatch}`];
actions['enable-hook'] = [`${cda} git checkout ${preCommitHook}`];

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
