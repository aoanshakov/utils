const src = '/usr/local/src',
    application = `${src}/proposal_generator_frontend`,
    nodeModules = `${application}/node_modules`,
    packageJson = `${application}/package.json`,
    packageJsonCopy = `${application}/package-copy.json`,
    packageLockJson = `${application}/package-lock.json`,
    uiKit = `${application}/ui_kit`,
    uiKitNodeModules = `${uiKit}/node_modules`,
    build = `${application}/build`;

module.exports = {
    application,
    nodeModules,
    packageJson,
    packageJsonCopy,
    packageLockJson,
    uiKit,
    uiKitNodeModules,
    build
};
