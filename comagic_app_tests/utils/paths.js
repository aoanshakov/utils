const src = '/usr/local/src',
    application = `${src}/comagic_app`,
    nodeModules = `${application}/node_modules`,
    packageLockJson = `${application}/package-lock.json`,
    tests = `${src}/tests`,
    nginxConfig = `${tests}/utils/nginx.conf`,
    preCommitHook = `${application}/.husky/pre-commit`,
    misc = `${application}/misc`,
    softphoneMisc = `${misc}/softphone/misc`,
    sipLib = `${softphoneMisc}/sip_lib`;

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
    applicationPatch: `${tests}/application-patch.diff`,
    devApplicationPatch: `${tests}/dev-application-patch.diff`,
    chatsPatch: `${tests}/chats-patch.diff`,
    employeesPatch: `${tests}/employees-patch.diff`,
    softphonePatch: `${tests}/softphone-patch.diff`,
    sipLibPatch: `${tests}/sip-lib-patch.diff`,
    huskyPatch: `${tests}/husky-patch.diff`,
    misc,
    chats: `${misc}/chats`,
    employees: `${misc}/employees`,
    softphone: `${misc}/softphone`,
    softphoneMisc,
    sipLib,
    uisWebRTC: `${sipLib}/uis_webrtc`
};
