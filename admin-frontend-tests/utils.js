const {Args, isOneOf} = require('./utils/arguments'),
    {adminFrontend, adminFrontendPatch} = require('./utils/paths'),
    execute = require('./utils/execute'),
    openAdminFrontendDir = `cd ${adminFrontend} &&`;

const actions = {};

const overridenFiles =
    'package.json ' +
    'src/history.js ' +
    'src/index.js ' +
    'src/index.js ' +
    'src/App.js ' +
    'public/index.html ' +
    'config-overrides.js';

actions['create-patch'] = [
    `${openAdminFrontendDir} git diff -- ${overridenFiles} > ${adminFrontendPatch}`
];

actions['restore-code'] = [
    `${openAdminFrontendDir} git checkout ${overridenFiles}`
];

actions['modify-code'] = actions['restore-code'].concat([
    `${openAdminFrontendDir} patch -p1 < ${adminFrontendPatch}`,
    `fix-permissions ${adminFrontend}`
]);

actions['run-server'] = actions['modify-code'].concat(['service nginx start', `${openAdminFrontendDir} npm start`]);

const args = (new Args({
    'action': {
        validate: isOneOf.apply(null, Object.keys(actions))
    }
})).createObjectFromArgsArray(process.argv);

const {action} = args;

if (!action) {
    console.log('Действие не указано');
    return;
}

Object.entries(actions).reduce((result, [key, value]) => {
    result[key] = () => execute(value);
    return result;
}, {})[action]();
