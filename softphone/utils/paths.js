const src = '/usr/local/src',
    application = `${src}/softphone`,
    nodeModules = `${application}/node_modules`,
    packageLockJson = `${application}/package-lock.json`,
    tests = `${src}/tests`,
    nginxConfig = `${tests}/utils/nginx.conf`,
    preCommitHook = `${application}/.husky/pre-commit`,
    misc = `${application}/misc`,
    sipLib = `${misc}/sip_lib`;

module.exports = {
    application,
    tests,
    nodeModules,
    packageLockJson,
    nginxConfig,
    preCommitHook,
    indexHtml: `${application}/build/index.html`,
    testsHtml: `${tests}/tests/tests.html`,
    applicationPatch: `${tests}/application-patch.diff`,
    devApplicationPatch: `${tests}/dev-application-patch.diff`,
    sipLibPatch: `${tests}/sip-lib-patch.diff`,
    misc,
    sipLib,
    uisWebRTC: `${sipLib}/uis_webrtc`
};
