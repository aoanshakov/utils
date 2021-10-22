const src = '/usr/local/src',
    application = `${src}/softphone`,
    nodeModules = `${application}/node_modules`,
    packageLockJson = `${application}/package-lock.json`,
    tests = `${src}/tests`,
    nginxConfig = `${tests}/utils/nginx.conf`,
    preCommitHook = `${application}/.husky/pre-commit`,
    misc = `${application}/misc`;

module.exports = {
    application,
    tests,
    misc,
    nodeModules,
    packageLockJson,
    nginxConfig,
    preCommitHook,
    sipLib: `${misc}/sip_lib`,
    indexHtml: `${application}/build/index.html`,
    testsHtml: `${tests}/tests/tests.html`,
    applicationPatch: `${tests}/application-patch.diff`
};
