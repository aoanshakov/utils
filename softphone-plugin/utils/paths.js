const src = '/usr/local/src',
    application = `${src}/softphone-chrome-widget`,
    nodeModules = `${application}/node_modules`,
    tests = `${src}/tests`,
    utils = `${tests}/utils`,
    misc = `${application}/misc`,
    sipLib = `${misc}/sip_lib`;

module.exports = {
    application,
    tests,
    nodeModules,
    scheduler: `${nodeModules}/scheduler`,
    fileSaver: `${nodeModules}/file-saver`,
    broadcastChannel: `${nodeModules}/broadcast-channel`,
    webpackDevServer: `${nodeModules}/webpack-dev-server`,
    nginxConfig: `${utils}/nginx.conf`,
    server: `${utils}/server.js`,
    testsServerLog: `${tests}/tests-server-log.log`,
    testsServerPid: `${tests}/tests-server.pid`,
    stub: `${tests}/Stub.js`,
    stubCss: `${tests}/stub.css`,
    testsEntripointSource: `${tests}/tests.tsx`,
    testsEntripointTarget: `${application}/src/tests.tsx`,
    fileSaverPatch: `${tests}/file-saver-patch.diff`,
    schedulerPatch: `${tests}/scheduler-patch.diff`,
    broadcastChannelPatch: `${tests}/broadcast-channel-patch.diff`,
    webpackDevServerPatch: `${tests}/webpack-dev-server-patch.diff`,
    applicationPatch: `${tests}/application-patch.diff`,
    magicUiPatch: `${tests}/magic-ui-patch.diff`,
    loggerPatch: `${tests}/logger-patch.diff`,
    sipLibPatch: `${tests}/sip-lib-patch.diff`,
    uisWebRTCPatch: `${tests}/uis-webrtc-patch.diff`,
    chatsPatch: `${tests}/chats-patch.diff`,
    employeesPatch: `${tests}/employees-patch.diff`,
    contactsPatch: `${tests}/contacts-patch.diff`,
    misc,
    magicUi: `${misc}/magic_ui`,
    logger: `${misc}/logger`,
    sipLib,
    uisWebRTC: `${sipLib}/uis_webrtc`,
    sipLibMagiUi: `${sipLib}/magic_ui`,
    testsScriptsDir: `${tests}/tests`,
    contacts: `${misc}/contacts`,
    employees: `${misc}/operator-workplace`,
    chats: `${misc}/chats`,
    corePatch: `${tests}/core-patch.diff`,
    core: `${misc}/core`,
};
