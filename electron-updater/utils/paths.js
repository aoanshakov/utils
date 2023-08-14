const src = '/usr/local/src',
    updater = `${src}/updater`,
    utils = `${src}/utils`,
    sailsPgSession = `${src}/sails_pg_session`,
    updaterConfig =`${updater}/config`,
    publisherDir = `${src}/publisher`;

module.exports = {
    src,
    updaterPatch: `${src}/updater-patch.diff`,
    updater,
    updaterPackageJson: `${updater}/package.json`,
    updaterNodeModules: `${updater}/node_modules`,
    updaterBowerComponents: `${updater}/assets/bower_components`,
    pgHbaConf: `${src}/pg_hba.conf`,
    localJsSource: `${src}/local.js`,
    localJsTarget: `${updaterConfig}/local.js`,
    sailsPgSession,
    sailsPgSessionPackageJson: `${sailsPgSession}/package.json`,
    sailsPgSessionSql: `${sailsPgSession}/sql/sails-pg-session-support.sql`,
    updaterLog: `${src}/updater.log`,
    publisherDir,
    publisherNodeModules: `${publisherDir}/node_modules`,
    assets: `${src}/assets`,
    publisher: `${publisherDir}/index.js`,
    softphoneInstaller: '/usr/local/src/dist/Softphone-installer.exe'
};
