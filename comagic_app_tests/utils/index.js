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
    devApplicationPatch,
    chatsPatch,
    magicUiPatch,
    huskyPatch,
    softphonePatch,
    analyticsPatch,
    devSoftphonePatch,
    preCommitHook,
    chats,
    magicUi,
    softphone,
    analytics,
    analyticsDir,
    misc,
    softphoneMisc,
    sipLib,
    sipLibPatch,
    uisWebRTC,
    packageLockJson,
    stub
} = require('./paths');

const cda = `cd ${application} &&`,
    cdc = `cd ${chats} &&`,
    actions = {},
    chatOverridenFiles = 'src/models/RootStore.ts package.json src/history.ts src/App.tsx src/models/auth/AuthStore.ts',
    magicUiOverridenFiles = 'package.json',
    devSoftphoneOverridenFiles = magicUiOverridenFiles,
    softphoneOverridenFiles = 'src/models/RootStore.ts package.json',
    analyticsOverridenFiles = 'package.json',
    sipLibOverridenFiles = devSoftphoneOverridenFiles,
    devOverridenFiles = 'config/webpack.config.js .env';

const overridenFiles = [
    '.env',
    'public/index.html',
    'src/bootstrap.tsx',
    'src/history.ts',
    'config/webpack.config.js',
    'package.json',
    'src/models/RootStore.ts',
    'src/models/auth/AuthStore.ts',
    'src/rpc/httpRpc.ts'
].join(' ');

actions['fix-permissions'] =
    [`if [ -n "$APPLICATION_OWNER" ]; then chown -R $APPLICATION_OWNER:$APPLICATION_OWNER $1 ${application}; fi`];

const overriding = [{
    application,
    dev: {
        overridenFiles: devOverridenFiles,
        applicationPatch: devApplicationPatch
    },
    test: {
        overridenFiles,
        applicationPatch
    }
}, {
    application: chats,
    dev: {
        overridenFiles: chatOverridenFiles,
        applicationPatch: chatsPatch
    },
    test: {
        overridenFiles: chatOverridenFiles,
        applicationPatch: chatsPatch
    }
}, {
    application: magicUi,
    dev: {
        overridenFiles: magicUiOverridenFiles,
        applicationPatch: magicUiPatch
    },
    test: {
        overridenFiles: magicUiOverridenFiles,
        applicationPatch: magicUiPatch
    }
}, {
    application: softphone,
    dev: {
        overridenFiles: devSoftphoneOverridenFiles,
        applicationPatch: devSoftphonePatch
    },
    test: {
        overridenFiles: softphoneOverridenFiles,
        applicationPatch: softphonePatch
    }
}, {
    application: sipLib,
    dev: {
        overridenFiles: sipLibOverridenFiles,
        applicationPatch: sipLibPatch
    },
    test: {
        overridenFiles: sipLibOverridenFiles,
        applicationPatch: sipLibPatch
    }
}, {
    application: analytics,
    dev: {
        overridenFiles: analyticsOverridenFiles,
        applicationPatch: analyticsPatch
    },
    test: {
        overridenFiles: analyticsOverridenFiles,
        applicationPatch: analyticsPatch
    }
}];

const getOverriding = ({dev}) => overriding.map(overriding => ({
    application: overriding.application,
    ...overriding[dev ? 'dev' : 'test']
})).filter(({overridenFiles}) => overridenFiles);

actions['create-patch'] = params => getOverriding(params).reduce((result, {
    application,
    overridenFiles,
    applicationPatch
}) => result.concat(fs.existsSync(application) ? [
    `cd ${application} && git diff -- ${overridenFiles} > ${applicationPatch}`
] : []), []);

actions['restore-code'] = params => getOverriding(params).reduce((result, {
    application,
    overridenFiles
}) => result.concat([
    `if [ -d ${application} ]; ` +
        `then cd ${application} && git checkout ${overridenFiles}; ` +
    `fi`
]), []);

actions['modify-code'] = params => actions['restore-code']({}).
    concat(actions['restore-code']({dev: true})).
    concat(getOverriding(params).reduce((result, {
        application,
        applicationPatch
    }) => result.concat([
        `if [ -d ${application} ] && [ -f ${applicationPatch} ]; ` +
            `then cd ${application} && patch -p1 < ${applicationPatch}; ` +
        `fi`
    ]), [])).
    concat(`cp ${stub} ${misc}`).
    concat(
        actions['fix-permissions']
    );

const appModule = ([module, path, args]) => [`web/comagic_app_modules/${module}`, path, args, misc];

actions['initialize'] = params => [
    appModule(['chats', chats, '']),
    appModule(['softphone', softphone, '']),
    ['web/magic_ui', magicUi, '', misc],
    ['analytics/frontend', analytics, '', analyticsDir],
    ['web/sip_lib', sipLib, '', softphoneMisc],
    ['web/uis_webrtc', uisWebRTC, '', sipLib]
].map(([module, path, args, misc]) => (!fs.existsSync(path) ? [
    () => mkdir(misc),
    `cd ${misc} && git clone${args} git@gitlab.uis.dev:${module}.git`
] : [])).reduce((result, item) => result.concat(item), []).concat(
    actions['modify-code'](params)
).concat(!fs.existsSync(nodeModules) ?
    [`chown -R root:root ${application}`, `${cda} npm install --verbose`].concat(actions['fix-permissions']) : []);

const rmVerbose = target => `if [ -e ${target} ]; then rm -rvf ${target}; fi`;

actions['reset'] = [
    rmVerbose(nodeModules),
    rmVerbose(misc),
    rmVerbose(packageLockJson)
].concat(actions['restore-code']({}));

actions['bash'] = [];
actions['disable-hook'] = [`chmod +x ${preCommitHook}`, `${cda} patch -p1 < ${huskyPatch}`];
actions['enable-hook'] = [`${cda} git checkout ${preCommitHook}`];

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
    `${cda} npm run dev`
]);

const {action, ...params} = (new Args({
    action: {
        validate: isOneOf.apply(null, Object.keys(actions))
    },
    dev: {
        validate: isTrue
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
