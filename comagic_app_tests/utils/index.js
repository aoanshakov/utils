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
    corePatch,
    magicUiPatch,
    huskyPatch,
    softphonePatch,
    analyticsPatch,
    devSoftphonePatch,
    preCommitHook,
    core,
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
    stub,
    shadowContentTsxSource,
    shadowContentTsxTarget,
    updater,
    assets,
    pgHbaConf,
    localJsSource,
    localJsTarget,
    sailsPgSession,
    sailsPgSessionSql,
    updaterPatch,
    updaterLog,
    publisher,
    publisherDir,
    broadcastChannel,
    broadcastChannelPatch,
    webpackDevServer,
    webpackDevServerPatch,
    server,
    testsServerLog,
    testsServerPid
} = require('./paths');

const cda = `cd ${application} &&`,
    cdc = `cd ${chats} &&`,
    actions = {},
    chatOverridenFiles = 'src/models/RootStore.ts package.json src/history.ts src/App.tsx src/models/auth/AuthStore.ts',
    magicUiOverridenFiles = 'package.json',
    coreOverridenFiles = magicUiOverridenFiles,
    devSoftphoneOverridenFiles = magicUiOverridenFiles,
    softphoneOverridenFiles = 'src/models/RootStore.ts package.json',
    sipLibOverridenFiles = devSoftphoneOverridenFiles,
    devOverridenFiles = 'config/webpack.config.js';

const analyticsOverridenFiles = 'src/models/RootStore.ts src/models/reports/RootReportStore.ts ' +
    'src/components/ShadowContent.ts package.json';

const overridenFiles = [
    'scripts/dev.js',
    'src/utils/cookie.ts',
    'public/index.html',
    'src/bootstrap.tsx',
    'src/history.ts',
    'config/webpack.config.js',
    'package.json',
    'src/models/RootStore.ts',
    'src/models/auth/AuthStore.ts',
    'src/rpc/httpRpc.ts'
].join(' ');

actions['install-publisher'] = [`cd ${publisherDir} && npm install --verbose`];

actions['install-updater'] = [
    () => mkdir(assets),
    () => mkdir(updater),
    `cd ${updater} && git clone https://github.com/ArekSredzki/electron-release-server.git .`,
    `cd ${updater} && patch -p1 < ${updaterPatch}`,
    `cd ${updater} && npm install --verbose`,

     () => mkdir(sailsPgSession),
    `cd ${sailsPgSession} && git clone https://github.com/ravitej91/sails-pg-session.git .`
];

actions['run-updater-db-server'] = [
    `cp ${localJsSource} ${localJsTarget}`,
    `cp ${pgHbaConf} /etc/postgresql/9.6/main/pg_hba.conf`,
    'service postgresql start'
];

actions['init-updater-db'] = [
    ...actions['run-updater-db-server'],

    'psql --username=postgres -c "CREATE ROLE electron_release_server_user ENCRYPTED ' +
        'PASSWORD \'cZSNa6Qc0zdqtljZZ08bMZNJrrTK0ory0De8qlENuqvD31XVGtXIeGadPqmLgHj\' LOGIN;"',

    'psql --username=postgres -c \'CREATE DATABASE electron_release_server OWNER "electron_release_server_user";\'',

    'psql --username=postgres -c \'CREATE DATABASE electron_release_server_sessions OWNER ' +
        '"electron_release_server_user";\'',
        
    `psql electron_release_server_sessions < ${sailsPgSessionSql} postgres`
];

const rmVerbose = target => `if [ -e ${target} ]; then rm -rvf ${target}; fi`;

actions['publish-update'] = [
    `cd ${publisherDir} && node ${publisher}`
];

actions['run-updater-app-js'] = [
    rmVerbose(updaterLog),
    `touch ${updaterLog}`,
    `cd ${updater} && node app.js > ${updaterLog} 2>&1 &`
];

actions['run-updater'] = [
    ...actions['init-updater-db'],
    ...actions['run-updater-app-js']
];

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
    application: core,
    dev: {
        overridenFiles: coreOverridenFiles,
        applicationPatch: corePatch
    },
    test: {
        overridenFiles: coreOverridenFiles,
        applicationPatch: corePatch
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
] : []), []).concat([
    `if [ -e ${shadowContentTsxTarget} ]; then cp ${shadowContentTsxTarget} ${shadowContentTsxSource}; fi`
]);

actions['restore-code'] = params => getOverriding(params).reduce((result, {
    application,
    overridenFiles
}) => result.concat([
    `if [ -d ${application} ]; ` +
        `then cd ${application} && git checkout ${overridenFiles}; ` +
    `fi`,

    rmVerbose(shadowContentTsxTarget)
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
    concat([
        `cp ${stub} ${misc}`,
        `cp ${shadowContentTsxSource} ${shadowContentTsxTarget}`
    ]).concat(actions['fix-permissions']);

const appModule = ([module, path, args]) => [`web/comagic_app_modules/${module}`, path, args, misc];

actions['patch-node-modules'] = [
    [broadcastChannel, broadcastChannelPatch],
    [webpackDevServer, webpackDevServerPatch]
].map(([path, patch]) => `cd ${path} && patch -p1 < ${patch}`);

actions['initialize'] = params => [
    appModule(['chats', chats, '']),
    appModule(['softphone', softphone, '']),
    appModule(['core', core, '']),
    ['web/magic_ui', magicUi, '', misc],
    ['analytics/frontend', analytics, '', analyticsDir],
    ['web/sip_lib', sipLib, '', softphoneMisc],
    ['web/uis_webrtc', uisWebRTC, '', sipLib]
].map(([module, path, args, misc]) => (!fs.existsSync(path) ? [
    () => mkdir(misc),
    `cd ${misc} && git clone${args} git@gitlab.uis.dev:${module}.git`
] : [])).reduce((result, item) => result.concat(item), []).concat(
    actions['modify-code'](params)
).concat(!fs.existsSync(nodeModules) ?  [
    `chown -R root:root ${application}`,
    `${cda} npm install --verbose`
].concat(actions['patch-broadcast-channel']).concat(actions['fix-permissions']) : []);

actions['remove-node-modules'] = overriding.map(({application}) => [
    rmVerbose(`${application}/node_modules`),
    rmVerbose(`${application}/package-lock.json`)
]).reduce((allCommands, commands) => allCommands.concat(commands), []);

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

    `if [ -e ${testsServerPid} ]; then kill -9 $(cat ${testsServerPid}); echo "Return code: $?"; fi`,
    rmVerbose(testsServerLog),
    rmVerbose(testsServerPid),
    `touch ${testsServerLog}`,
    'service nginx stop',
    `cp ${nginxConfig} /etc/nginx/nginx.conf`,
    'service nginx start',
    `node ${server} > ${testsServerLog} 2>&1 &`,
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
