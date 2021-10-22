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
    misc,
    sipLib
} = require('./paths');

const cda = `cd ${application} &&`,
    actions = {};

const overridenFiles = [
    'public/index.html',
    'src/bootstrap.tsx',
    'config/webpack.config.js',
    'package.json',
    'src/models/RootStore.ts'
].join(' ');

actions['create-patch'] = overridenFiles ? [
    `${cda} git diff -- ${overridenFiles} > ${applicationPatch}`
] : [];

actions['restore-code'] = overridenFiles ? [
    `${cda} git checkout ${overridenFiles}`
] : [];

actions['modify-code'] = actions['restore-code'].
    concat(overridenFiles ? [`${cda} patch -p1 < ${applicationPatch}`] : [].
    concat(actions['fix-permissions']));

actions['fix-permissions'] =
    [`if [ -n "$APPLICATION_OWNER" ]; then chown -R $APPLICATION_OWNER:$APPLICATION_OWNER $1 ${application}; fi`];

actions['initialize'] = actions['modify-code'].concat((
    !fs.existsSync(sipLib) ?
        [() => mkdir(misc), `cd ${misc} && git clone --branch tasks/PBL-2487 git@gitlab.uis.dev:web/sip_lib.git`] : []
).concat(
    !fs.existsSync(nodeModules) ?
        [`chown -R root:root ${application}`, `${cda} npm install --verbose`].concat(actions['fix-permissions']) : []
));

actions['reset'] = [() => rm(nodeModules)];
actions['bash'] = [];

actions['run-server'] = actions['initialize'].concat([
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
    `${cda} npm run start`
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
