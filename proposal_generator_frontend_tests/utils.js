const fs = require('fs'),
    {Args, isOneOf, isString} = require('./utils/arguments'),
    execute = require('./utils/execute');

const {
    nodeModules,
    application,
    packageJson,
    packageJsonCopy,
    packageLockJson,
    uiKit,
    uiKitNodeModules,
    build
} = require('./utils/paths');
    
const overridenPackageJson = JSON.parse(fs.readFileSync(packageJson)),
    openApplicationDir = `cd ${application} &&`;

const actions = {};

actions['fix-permissions'] = [
    `if [ -n "$APPLICATION_OWNER" ]; then chown -R $APPLICATION_OWNER:$APPLICATION_OWNER $1 ${application}; fi`
];

const initialize = isForTest => (isForTest ? (!fs.existsSync(uiKit) ? [
    `${openApplicationDir} git clone git@gitlab.uis.dev:web/ui_kit.git`
] : []) : [
    `${openApplicationDir} npm set registry http://npm.dev.uis.st:80`
]).concat(!fs.existsSync(nodeModules) ? (isForTest ? [() => {
    fs.copyFileSync(packageJson, packageJsonCopy);
    overridenPackageJson.dependencies['uis-ui-kit'] = './ui_kit';
    fs.writeFileSync(packageJson, JSON.stringify(overridenPackageJson));
}] : []).concat([`${openApplicationDir} npm install`]).concat(isForTest ? [() => {
    fs.copyFileSync(packageJsonCopy, packageJson);
    fs.unlinkSync(packageJsonCopy);
}] : []) :  []).concat(
    actions['fix-permissions']
);

actions['initialize'] = initialize(true);

actions['remove-all'] = [() => {
    fs.existsSync(build) && fs.rmdirSync(build, {recursive: true});
    fs.existsSync(uiKitNodeModules) && fs.rmdirSync(uiKitNodeModules, {recursive: true});
    fs.existsSync(nodeModules) && fs.rmdirSync(nodeModules, {recursive: true});
    fs.existsSync(packageLockJson) && fs.unlinkSync(packageLockJson);
}];

const watchTest = `${openApplicationDir} npm run watch -- --test`;

actions['watch-test'] = initialize(true).concat([watchTest]);
actions['run-test-server'] = initialize(true).concat(['service nginx start']).concat([watchTest]);
actions['run-dev-server'] = initialize().concat([`${openApplicationDir} npm run start`]);
actions['lint'] = initialize(true).concat([`${openApplicationDir} npm run lint`]);

const args = (new Args({
    action: {
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
