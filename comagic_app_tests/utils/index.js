const {Args, isOneOf, isTrue} = require('./arguments'),
    fs = require('fs'),
    execute = require('./execute'),
    rm = require('./rm'),
    {application, nodeModules, nginxConfig, applicationPatch, preCommitHook} = require('./paths'),
    cda = `cd ${application} &&`;

const actions = {},
    overridenFiles = 'public/index.html src/index.tsx src/history.ts config/webpack.config.js';

actions['fix-permissions'] =
    [`if [ -n "$APPLICATION_OWNER" ]; then chown -R $APPLICATION_OWNER:$APPLICATION_OWNER $1 ${application}; fi`];

actions['initialize'] = !fs.existsSync(nodeModules) ?
    [`chown -R root:root ${application}`, `${cda} npm install`].concat(actions['fix-permissions']) : [];

actions['reset'] = [() => rm(nodeModules)];
actions['bash'] = [];

actions['create-patch'] = [
    `${cda} git diff -- ${overridenFiles} > ${applicationPatch}`
];

actions['restore-code'] = [
    `${cda} git checkout ${overridenFiles}`
];

actions['modify-code'] = actions['restore-code'].
    concat([`${cda} patch -p1 < ${applicationPatch}`].
    concat(actions['fix-permissions']));

actions['commit'] = [`chmod +x ${preCommitHook}`, `${cda} git commit`, `chmod -x ${preCommitHook}`];

actions['run-server'] = actions['modify-code'].concat([
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
