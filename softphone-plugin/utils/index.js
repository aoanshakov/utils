process.env.ENTRY_POINT = 'tests';
process.env.REACT_APP_TEST_MODE = 'true';

const { Args, isOneOf, isTrue, isInteger } = require('./arguments'),
    fs = require('fs'),
    execute = require('./execute'),
    rm = require('./rm'),
    mkdir = require('./mkdir');

const {
    application,
    nodeModules,
    nginxConfig,
    applicationPatch,
    magicUiPatch,
    logger,
    loggerPatch,
    magicUi,
    misc,
    sipLib,
    sipLibPatch,
    uisWebRTC,
    stub,
    stubCss,
    fileSaver,
    fileSaverPatch,
    scheduler,
    schedulerPatch,
    broadcastChannel,
    broadcastChannelPatch,
    webpackDevServer,
    webpackDevServerPatch,
    server,
    testsServerLog,
    testsServerPid,
    testsEntripointSource,
    testsEntripointTarget
} = require('./paths');

const cda = `cd ${application} &&`,
    actions = {},
    packageJson = 'package.json';

const overridenFiles = [
    'package.json',
    'src/models/RootStore.ts',
    'src/models/auth/AuthStore.ts',
    'src/rpc/httpRpc.ts',
    'src/utils/index.ts',
].join(' ');

const rmVerbose = target => `if [ -e ${target} ]; then rm -rvf ${target}; fi`;

actions['fix-permissions'] =
    [`if [ -n "$APPLICATION_OWNER" ]; then chown -R $APPLICATION_OWNER:$APPLICATION_OWNER $1 ${application}; fi`];

const overriding = [{
    application,
    overridenFiles: packageJson,
    applicationPatch,
}, {
    application: magicUi,
    overridenFiles: packageJson,
    applicationPatch: magicUiPatch,
}, {
    application: logger,
    overridenFiles: packageJson,
    applicationPatch: loggerPatch,
}, {
    application: sipLib,
    overridenFiles: packageJson,
    applicationPatch: sipLibPatch,
}];

const getOverriding = () => overriding.map(overriding => ({
    application: overriding.application,
    ...overriding,
})).filter(({ overridenFiles }) => overridenFiles);

actions['create-patch'] = getOverriding().reduce((result, {
    application,
    overridenFiles,
    applicationPatch
}) => result.concat(fs.existsSync(application) ? [
    `git config --global --add safe.directory ${application}`,
    `cd ${application} && git diff -- ${overridenFiles} > ${applicationPatch}`
] : []), []).concat([
    [testsEntripointTarget, testsEntripointSource]
].map(([target, source]) => `if [ -e ${target} ]; then cp ${target} ${source}; fi`));

actions['restore-code'] = getOverriding().reduce((result, {
    application,
    overridenFiles
}) => [`git config --global --add safe.directory ${application}`].concat(result.concat([
    `if [ -d ${application} ]; ` +
        `then cd ${application} && git checkout ${overridenFiles}; ` +
    `fi`,
])), []).concat([
    rmVerbose(testsEntripointTarget)
]);

actions['modify-code'] = actions['restore-code'].
    concat(actions['restore-code']).
    concat(getOverriding().reduce((result, {
        application,
        applicationPatch
    }) => result.concat([
        `if [ -d ${application} ] && [ -f ${applicationPatch} ]; ` +
            `then cd ${application} && patch -p1 < ${applicationPatch}; ` +
        `fi`
    ]), [])).
    concat([
        `cp ${testsEntripointSource} ${testsEntripointTarget}`,
        `cp ${stub} ${misc}`,
        `cp ${stubCss} ${misc}`,
    ]).concat(actions['fix-permissions']);

actions['patch-node-modules'] = [
    [broadcastChannel, broadcastChannelPatch],
    [webpackDevServer, webpackDevServerPatch],
    [scheduler, schedulerPatch],
    [fileSaver, fileSaverPatch]
].map(([path, patch]) => `cd ${path} && patch -p1 < ${patch}`);

actions['initialize'] = params => [`git config --global --add safe.directory ${application}`].concat([
    [`web/logger`, logger, 'master', misc],
    ['web/magic_ui', magicUi, 'feature/softphone', misc],
    ['web/sip_lib', sipLib, 'stand-int0', misc],
    ['web/uis_webrtc', uisWebRTC, 'stand-int0', sipLib]
].map(([module, path, branch, misc]) => [`git config --global --add safe.directory ${path}`].
    concat(!fs.existsSync(path) ? [
        () => mkdir(misc),
        `cd ${misc} && git clone --branch ${branch} git@gitlab.uis.dev:${module}.git`
    ] : [])).reduce((result, item) => result.concat(item), [])).concat(
    actions['modify-code'],
).concat(!fs.existsSync(nodeModules) ?  [
    `${cda} npm set registry http://npm.dev.uis.st:80`,
    `${cda} npm install --verbose`
].concat(actions['patch-node-modules']).concat(actions['fix-permissions']) : []);

actions['remove-node-modules'] = [uisWebRTC].map(application => ({ application })).
    concat(overriding).
    map(({ application }) => [
        rmVerbose(`${application}/node_modules`),
        rmVerbose(`${application}/package-lock.json`)
    ]).
    reduce((allCommands, commands) => allCommands.concat(commands), []);

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

const { action, ...params } = (new Args({
    action: {
        validate: isOneOf.apply(null, Object.keys(actions))
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
