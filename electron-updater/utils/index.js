const {Args, isOneOf, isString} = require('./arguments'),
    fs = require('fs'),
    execute = require('./execute'),
    rm = require('./rm'),
    mkdir = require('./mkdir');

const {
    src,
    assets,
    pgHbaConf,
    localJsSource,
    localJsTarget,
    sailsPgSession,
    sailsPgSessionSql,
    sailsPgSessionPackageJson,
    updaterPatch,
    updaterLog,
    publisher,
    updater,
    updaterPackageJson,
    updaterNodeModules,
    updaterBowerComponents,
    publisherDir,
    publisherNodeModules,
    softphoneInstaller
} = require('./paths');

const actions = {};

actions['create-patch'] = [
    `cd ${updater} && git diff -- config/session.js package.json tasks/config/sass.js > ${updaterPatch}`
];

actions['install-publisher'] = fs.existsSync(publisherNodeModules) ? [] :
    [`cd ${publisherDir} && npm install --verbose`];

actions['install-sails'] = fs.existsSync(sailsPgSessionPackageJson) ? [] : [
     () => mkdir(sailsPgSession),
    `cd ${sailsPgSession} && git clone https://github.com/ravitej91/sails-pg-session.git .`
];

actions['install-updater-node-modules'] = [`cd ${updater} && npm install --verbose`];
actions['install-updater-bower-components'] = [`cd ${updater} && bower install --verbose`];

actions['install-updater'] = [
    () => mkdir(assets),
    () => mkdir(updater),

    ...(fs.existsSync(updaterPackageJson) ? [] : [
        `cd ${updater} && git clone --branch nsis-updates-specific-flavor-#285 ` +
            `https://github.com/JJ-8/electron-release-server.git .`,
        `cd ${updater} && patch -p1 < ${updaterPatch}`,
        ...actions['install-updater-node-modules'],
        ...actions['install-updater-bower-components']
    ]),

    ...(fs.existsSync(updaterNodeModules) ? [] : actions['install-updater-node-modules']),
    ...(fs.existsSync(updaterBowerComponents) ? [] : actions['install-updater-bower-components']),
];

actions['initialize'] = [
    ...actions['install-publisher'],
    ...actions['install-updater'],
    ...actions['install-sails']
];

actions['run-db-server'] = [
    `cp ${localJsSource} ${localJsTarget}`,
    `cp ${pgHbaConf} /etc/postgresql/9.6/main/pg_hba.conf`,
    'service postgresql start'
];

actions['init-db'] = [
    ...actions['run-db-server'],

    'psql --username=postgres -c "CREATE ROLE electron_release_server_user ENCRYPTED ' +
        'PASSWORD \'cZSNa6Qc0zdqtljZZ08bMZNJrrTK0ory0De8qlENuqvD31XVGtXIeGadPqmLgHj\' LOGIN;"',

    'psql --username=postgres -c \'CREATE DATABASE electron_release_server OWNER "electron_release_server_user";\'',

    'psql --username=postgres -c \'CREATE DATABASE electron_release_server_sessions OWNER ' +
        '"electron_release_server_user";\'',
        
    `psql electron_release_server_sessions < ${sailsPgSessionSql} postgres`
];

const rmVerbose = target => `if [ -e ${target} ]; then rm -rvf ${target}; fi`;

const {
    username,
    password
} = require(localJsSource).auth.static;

actions['publish'] = ({version, project}) => [
    `cd ${publisherDir} && node ${publisher} ` + Object.entries({
        version,
        project,
        username,
        password,
        filepath: softphoneInstaller,
        apiurl: 'http://127.0.0.1/api'
    }).map(([key, value]) => `--${key} ${value}`).join(' ')
];

actions['run-app-js'] = [
    rmVerbose(updaterLog),
    `touch ${updaterLog}`,
    `cd ${updater} && node app.js > ${updaterLog} 2>&1 &`
];

actions['run-server'] = [
    ...actions['initialize'],
    ...actions['init-db'],
    ...actions['run-app-js']
];

actions['fix-permissions'] =
    [`if [ -n "$APPLICATION_OWNER" ]; then chown -Rv $APPLICATION_OWNER:$APPLICATION_OWNER $1 ${src}; fi`];

actions['remove-node-modules'] = [updater, publisherDir].map(application => [
    rmVerbose(`${application}/node_modules`),
    rmVerbose(`${application}/package-lock.json`)
]).reduce((allCommands, commands) => allCommands.concat(commands), []);

const {action, ...params} = (new Args({
    version: {
        validate: isString
    },
    project: {
        validate: isOneOf.apply(null, ['comagic', 'uis2', 'usa'])
    },
    action: {
        validate: isOneOf.apply(null, Object.keys(actions))
    }
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
