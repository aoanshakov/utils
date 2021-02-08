const src = '/usr/local/src',
    tests = `${src}/tests`,
    patches = `${tests}/utils/patches`
    mainPatch = `${tests}/utils/patches/consultant.diff`,
    application = `${src}/consultant`,
    nodeModules = `${application}/node_modules`,
    packageLockJson = `${application}/package-lock.json`;

module.exports = {
    application,
    nodeModules,
    packageLockJson,
    tests,
    patches,
    mainPatch
};
