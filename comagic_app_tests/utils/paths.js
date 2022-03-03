const src = '/usr/local/src',
    application = `${src}/comagic_app`,
    nodeModules = `${application}/node_modules`,
    packageLockJson = `${application}/package-lock.json`,
    tests = `${src}/tests`,
    updater = `${tests}/updater`,
    nginxConfig = `${tests}/utils/nginx.conf`,
    preCommitHook = `${application}/.husky/pre-commit`,
    misc = `${application}/misc`,
    softphoneMisc = `${misc}/softphone/misc`,
    analyticsDir = `${misc}/analytics`,
    analytics = `${analyticsDir}/frontend`,
    sipLib = `${softphoneMisc}/sip_lib`,
    sailsPgSession = `${tests}/sails_pg_session`,
    updaterConfig =`${updater}/config`,
    publisherDir = `${tests}/publisher`;

module.exports = {
    application,
    tests,
    nodeModules,
    packageLockJson,
    nginxConfig,
    preCommitHook,
    indexHtml: `${application}/build/index.html`,
    testsHtml: `${tests}/tests/tests.html`,
    stub: `${tests}/Stub.js`,
    shadowContentTsxSource: `${tests}/ShadowContent.tsx`,
    shadowContentTsxTarget: `${analytics}/src/components/ShadowContent.tsx`,
    applicationPatch: `${tests}/application-patch.diff`,
    devApplicationPatch: `${tests}/dev-application-patch.diff`,
    chatsPatch: `${tests}/chats-patch.diff`,
    magicUiPatch: `${tests}/magic-ui-patch.diff`,
    softphonePatch: `${tests}/softphone-patch.diff`,
    analyticsPatch: `${tests}/analytics-patch.diff`,
    devSoftphonePatch: `${tests}/dev-softphone-patch.diff`,
    sipLibPatch: `${tests}/sip-lib-patch.diff`,
    huskyPatch: `${tests}/husky-patch.diff`,
    updaterPatch: `${tests}/updater-patch.diff`,
    misc,
    chats: `${misc}/chats`,
    magicUi: `${misc}/magic_ui`,
    softphone: `${misc}/softphone`,
    analyticsDir,
    analytics,
    softphoneMisc,
    sipLib,
    uisWebRTC: `${sipLib}/uis_webrtc`,
    updater,
    pgHbaConf: `${tests}/pg_hba.conf`,
    localJsSource: `${tests}/local.js`,
    localJsTarget: `${updaterConfig}/local.js`,
    sailsPgSession,
    sailsPgSessionSql: `${sailsPgSession}/sql/sails-pg-session-support.sql`,
    updaterLog: `${tests}/updater.log`,
    publisherDir,
    assets: `${tests}/assets`,
    publisher: `${publisherDir}/index.js`
};
