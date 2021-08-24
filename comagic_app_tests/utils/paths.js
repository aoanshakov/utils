const src = '/usr/local/src',
    application = `${src}/comagic_app`,
    nodeModules = `${application}/node_modules`,
    packageLockJson = `${application}/package-lock.json`,
    tests = `${src}/tests`,
    nginxConfig = `${tests}/utils/nginx.conf`,
    preCommitHook = `${application}/.husky/pre-commit`;

module.exports = {
    application,
    tests,
    nodeModules,
    packageLockJson,
    nginxConfig,
    preCommitHook,
    indexHtml: `${application}/build/index.html`,
    testsHtml: `${tests}/tests/tests.html`,
    applicationPatch: `${tests}/application-patch.diff`
};
