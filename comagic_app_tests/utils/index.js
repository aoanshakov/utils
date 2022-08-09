const {Args, isOneOf, isTrue, isInteger} = require('./arguments'),
    fs = require('fs'),
    execute = require('./execute'),
    rm = require('./rm'),
    mkdir = require('./mkdir'),
    https = require('https'),
    { JSDOM } = require("jsdom");

const {
    application,
    nodeModules,
    nginxConfig,
    applicationPatch,
    devApplicationPatch,
    chatsPatch,
    corePatch,
    magicUiPatch,
    magicUiLibPatch,
    huskyPatch,
    softphonePatch,
    analyticsPatch,
    devSoftphonePatch,
    preCommitHook,
    core,
    chats,
    magicUi,
    contactsMagicUi,
    softphoneMagicUi,
    sipLibMagiUi,
    softphone,
    analytics,
    analyticsDir,
    misc,
    softphoneMisc,
    sipLib,
    sipLibPatch,
    contacts,
    contactsPatch,
    uisWebRTC,
    packageLockJson,
    stub,
    shadowContentTsxSource,
    shadowContentTsxTarget,
    updater,
    assets,
    pgHbaConf,
    localJsSource,
    localJsTarget,
    sailsPgSession,
    sailsPgSessionSql,
    updaterPatch,
    updaterLog,
    publisher,
    publisherDir,
    broadcastChannel,
    broadcastChannelPatch,
    webpackDevServer,
    webpackDevServerPatch,
    server,
    testsServerLog,
    testsServerPid,
    femaleNames,
    contactList,
    maleNames
} = require('./paths');

const cda = `cd ${application} &&`,
    cdc = `cd ${chats} &&`,
    actions = {},
    magicUiOverridenFiles = 'package.json',
    coreOverridenFiles = magicUiOverridenFiles,
    devSoftphoneOverridenFiles = magicUiOverridenFiles,
    contactsOverridenFiles = magicUiOverridenFiles,
    softphoneOverridenFiles = 'src/models/RootStore.ts package.json',
    sipLibOverridenFiles = devSoftphoneOverridenFiles,
    devOverridenFiles = 'config/webpack.config.js';

const chatOverridenFiles = 'src/models/RootStore.ts ' +
    'package.json ' +
    'src/history.ts ' +
    'src/App.tsx ' +
    'src/models/auth/AuthStore.ts ' +
    'src/utils/index.ts';

const analyticsOverridenFiles = 'src/models/RootStore.ts src/models/reports/RootReportStore.ts ' +
    'src/components/ShadowContent.ts package.json';

const overridenFiles = [
    'scripts/dev.js',
    'src/utils/cookie.ts',
    'public/index.html',
    'src/bootstrap.tsx',
    'src/history.ts',
    'config/webpack.config.js',
    'package.json',
    'src/models/RootStore.ts',
    'src/models/auth/AuthStore.ts',
    'src/rpc/httpRpc.ts'
].join(' ');

actions['install-publisher'] = [`cd ${publisherDir} && npm install --verbose`];

actions['install-updater'] = [
    () => mkdir(assets),
    () => mkdir(updater),
    `cd ${updater} && git clone https://github.com/ArekSredzki/electron-release-server.git .`,
    `cd ${updater} && patch -p1 < ${updaterPatch}`,
    `cd ${updater} && npm install --verbose`,

     () => mkdir(sailsPgSession),
    `cd ${sailsPgSession} && git clone https://github.com/ravitej91/sails-pg-session.git .`
];

actions['run-updater-db-server'] = [
    `cp ${localJsSource} ${localJsTarget}`,
    `cp ${pgHbaConf} /etc/postgresql/9.6/main/pg_hba.conf`,
    'service postgresql start'
];

actions['init-updater-db'] = [
    ...actions['run-updater-db-server'],

    'psql --username=postgres -c "CREATE ROLE electron_release_server_user ENCRYPTED ' +
        'PASSWORD \'cZSNa6Qc0zdqtljZZ08bMZNJrrTK0ory0De8qlENuqvD31XVGtXIeGadPqmLgHj\' LOGIN;"',

    'psql --username=postgres -c \'CREATE DATABASE electron_release_server OWNER "electron_release_server_user";\'',

    'psql --username=postgres -c \'CREATE DATABASE electron_release_server_sessions OWNER ' +
        '"electron_release_server_user";\'',
        
    `psql electron_release_server_sessions < ${sailsPgSessionSql} postgres`
];

const rmVerbose = target => `if [ -e ${target} ]; then rm -rvf ${target}; fi`;

actions['publish-update'] = [
    `cd ${publisherDir} && node ${publisher}`
];

actions['run-updater-app-js'] = [
    rmVerbose(updaterLog),
    `touch ${updaterLog}`,
    `cd ${updater} && node app.js > ${updaterLog} 2>&1 &`
];

actions['run-updater'] = [
    ...actions['init-updater-db'],
    ...actions['run-updater-app-js']
];

actions['fix-permissions'] =
    [`if [ -n "$APPLICATION_OWNER" ]; then chown -R $APPLICATION_OWNER:$APPLICATION_OWNER $1 ${application}; fi`];

const overriding = [{
    application,
    dev: {
        overridenFiles: devOverridenFiles,
        applicationPatch: devApplicationPatch
    },
    test: {
        overridenFiles,
        applicationPatch
    }
}, {
    application: chats,
    dev: {
        overridenFiles: chatOverridenFiles,
        applicationPatch: chatsPatch
    },
    test: {
        overridenFiles: chatOverridenFiles,
        applicationPatch: chatsPatch
    }
}, {
    application: magicUi,
    dev: {
        overridenFiles: magicUiOverridenFiles,
        applicationPatch: magicUiPatch
    },
    test: {
        overridenFiles: magicUiOverridenFiles,
        applicationPatch: magicUiPatch
    }
}, {
    application: core,
    dev: {
        overridenFiles: coreOverridenFiles,
        applicationPatch: corePatch
    },
    test: {
        overridenFiles: coreOverridenFiles,
        applicationPatch: corePatch
    }
}, {
    application: softphone,
    dev: {
        overridenFiles: devSoftphoneOverridenFiles,
        applicationPatch: devSoftphonePatch
    },
    test: {
        overridenFiles: softphoneOverridenFiles,
        applicationPatch: softphonePatch
    }
}, {
    application: sipLib,
    dev: {
        overridenFiles: sipLibOverridenFiles,
        applicationPatch: sipLibPatch
    },
    test: {
        overridenFiles: sipLibOverridenFiles,
        applicationPatch: sipLibPatch
    }
}, {
    application: analytics,
    dev: {
        overridenFiles: analyticsOverridenFiles,
        applicationPatch: analyticsPatch
    },
    test: {
        overridenFiles: analyticsOverridenFiles,
        applicationPatch: analyticsPatch
    }
}, {
    application: contacts,
    dev: {
        overridenFiles: contactsOverridenFiles,
        applicationPatch: contactsPatch
    },
    test: {
        overridenFiles: contactsOverridenFiles,
        applicationPatch: contactsPatch
    }
}];

const getOverriding = ({dev}) => overriding.map(overriding => ({
    application: overriding.application,
    ...overriding[dev ? 'dev' : 'test']
})).filter(({overridenFiles}) => overridenFiles);

actions['create-patch'] = params => getOverriding(params).reduce((result, {
    application,
    overridenFiles,
    applicationPatch
}) => result.concat(fs.existsSync(application) ? [
    `cd ${application} && git diff -- ${overridenFiles} > ${applicationPatch}`
] : []), []).concat([
    `if [ -e ${shadowContentTsxTarget} ]; then cp ${shadowContentTsxTarget} ${shadowContentTsxSource}; fi`
]);

actions['create-magic-ui-lib-patch'] = params => [
    `cd ${magicUi} && git diff -- ${magicUiOverridenFiles} > ${magicUiLibPatch}`
];

actions['restore-code'] = params => getOverriding(params).reduce((result, {
    application,
    overridenFiles
}) => result.concat([
    `if [ -d ${application} ]; ` +
        `then cd ${application} && git checkout ${overridenFiles}; ` +
    `fi`,

    rmVerbose(shadowContentTsxTarget)
]), []);

actions['modify-code'] = params => actions['restore-code']({}).
    concat(actions['restore-code']({dev: true})).
    concat(getOverriding(params).reduce((result, {
        application,
        applicationPatch
    }) => result.concat([
        `if [ -d ${application} ] && [ -f ${applicationPatch} ]; ` +
            `then cd ${application} && patch -p1 < ${applicationPatch}; ` +
        `fi`
    ]), [])).
    concat([
        `cp ${stub} ${misc}`,
        `cp ${shadowContentTsxSource} ${shadowContentTsxTarget}`
    ]).concat(actions['fix-permissions']);

const appModule = ([module, path, args]) => [`web/comagic_app_modules/${module}`, path, args, misc];

actions['patch-node-modules'] = [
    [broadcastChannel, broadcastChannelPatch],
    [webpackDevServer, webpackDevServerPatch]
].map(([path, patch]) => `cd ${path} && patch -p1 < ${patch}`);

actions['copy-magic-ui'] = [
    `cd ${magicUi} && git checkout ${magicUiOverridenFiles}`,
    `cd ${magicUi} && patch -p1 < ${magicUiLibPatch}`
].concat([
    softphoneMagicUi,
    sipLibMagiUi,
    contactsMagicUi
].reduce((result, magicUiTarget) => result.concat([
    rmVerbose(magicUiTarget),
    `mkdir ${magicUiTarget}`,
    `cp -r ${magicUi}/lib ${magicUi}/package.json ${magicUiTarget}`
]), []));

actions['initialize'] = params => [
    appModule(['chats', chats, '']),
    appModule(['softphone', softphone, '']),
    appModule(['core', core, '']),
    ['web/magic_ui', magicUi, '', misc],
    ['analytics/frontend', analytics, '', analyticsDir],
    ['web/sip_lib', sipLib, '', softphoneMisc],
    ['web/uis_webrtc', uisWebRTC, '', sipLib]
].map(([module, path, args, misc]) => (!fs.existsSync(path) ? [
    () => mkdir(misc),
    `cd ${misc} && git clone${args} git@gitlab.uis.dev:${module}.git`
] : [])).reduce((result, item) => result.concat(item), []).concat(
    actions['modify-code'](params)
).concat(!fs.existsSync(nodeModules) ?  [
    `chown -R root:root ${application}`,
    `${cda} npm install --verbose`
].concat(actions['patch-node-modules']).concat(actions['fix-permissions']) : []);

actions['remove-node-modules'] = overriding.map(({application}) => [
    rmVerbose(`${application}/node_modules`),
    rmVerbose(`${application}/package-lock.json`)
]).reduce((allCommands, commands) => allCommands.concat(commands), []);

actions['bash'] = [];
actions['disable-hook'] = [`chmod +x ${preCommitHook}`, `${cda} patch -p1 < ${huskyPatch}`];
actions['enable-hook'] = [`${cda} git checkout ${preCommitHook}`];

actions['run-server'] = params => actions['initialize'](params).concat([
    [
        'openssl req -x509',
            '-nodes',
            '-days 365',
            '-newkey rsa:2048',
            '-keyout /etc/ssl/private/nginx-selfsigned.key',
            '-out /etc/ssl/certs/nginx-selfsigned.crt',
            '-subj "/C=GB/ST=London/L=London/O=Global Security/OU=IT Department/CN=example.com"'
    ].join(' '),

    `if [ -e ${testsServerPid} ]; then kill -9 $(cat ${testsServerPid}); echo "Return code: $?"; fi`,
    rmVerbose(testsServerLog),
    rmVerbose(testsServerPid),
    `touch ${testsServerLog}`,
    'service nginx stop',
    `cp ${nginxConfig} /etc/nginx/nginx.conf`,
    'service nginx start',
    `node ${server} > ${testsServerLog} 2>&1 &`,
    `${cda} npm run dev -- --entry ./src/tests.tsx`
]);

const generateContactList = () => {
    const parseNames = ({
        url,
        keyName
    }) => (fs.readFileSync(url) + '').split("\n").filter(name => !!name).map(name => {
        name = name.split(' ');
        name = name.slice(name.length - 2);

        return {
            first_name: name[0],
            last_name: name[1]
        };
    }).reduce((names, name) => (names[name[keyName]] = name, names), {});

    const femaleNamesContent = parseNames({
        url: femaleNames,
        keyName: 'last_name'
    });

    const maleNamesContent = parseNames({
        url: maleNames,
        keyName: 'first_name'
    });

    const items = Object.values(femaleNamesContent).map((item, index) => {
        item = {
            ...item,
            id: 1689273 + index,
            email_list: [],
            messenger_list: [],
            organization_name: 'UIS',
            phone_list: ['79162729533'],
            group_list: [] ,
            personal_manager_id: 8539841,
            patronymic: ((name => name ? `${name}овна` : '')(Object.keys(maleNamesContent)[index])).
                split(/оо|ао|ио/).join('о'),
        };

        item.full_name = ['last_name', 'first_name', 'patronymic'].map(name => item[name]).join(' ')
        return item;
    });

    return items;
};

actions['generate-contact-list'] = [() => {
    let items = generateContactList();

    items.sort(({full_name: a}, {full_name: b}) => a.localeCompare(b));

    items = items.
        map(
            item => Object.entries(item).map(([key, value]) => `    ${key}: ${JSON.stringify(value)}`).join(",\n")
        ).
        map(
            item => `{\n${item}\n}`
        ).
        join(", ");

    fs.writeFileSync(
        contactList,
        `data = [${items}];`.split('"').join("'")
    );
}];

actions['make-female-names-unique'] = [() => fs.writeFileSync(
    femaleNames,
    generateContactList().map(({first_name, last_name}) => [first_name, last_name].join(' ')).concat(['']).join("\n")
)];

actions['generate-names'] = ({
    count = 1,
    gender = 'female'
}) => [() => {
    if (!count) {
        console.log('Не указано количество имен, которое должно быть сгенерировано.');
        return;
    }

    console.log(`Должно быть сгенерировано ${count} имен.`);

    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
    const url = `https://generatefakename.com/ru/name/${gender}/bg/bg`;

    const generateName = (iteration = 0) => {
        const stream = fs.createWriteStream(gender == 'female' ? femaleNames : maleNames, {
            flags:'a'
        });

        console.log(`Отправляю ${iteration + 1}-й запрос по URL ${url}.`);

        const request = https.request(url, response => {
            let result = '';

            console.log(`Получаю имена по URL ${url}.`);
            response.on('data', chunk => (result += chunk));

            response.on('end', () => {
                const name = (new JSDOM(result)).window.document.querySelector('.panel-body h3')?.textContent;
                console.log(`Получено имя "${name}"`);

                stream.write(name + "\n") 
                iteration == (count - 1) ? stream.end() : generateName(iteration + 1);
            });
        })

        request.on('error', error => console.error(error));
        request.end();
    };

    generateName();
}];

const {action, ...params} = (new Args({
    action: {
        validate: isOneOf.apply(null, Object.keys(actions))
    },
    dev: {
        validate: isTrue
    },
    count: {
        validate: isInteger
    },
    gender: {
        validate: isOneOf.apply(null, ['female', 'male'])
    },
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
