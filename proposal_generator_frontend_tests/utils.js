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

actions['initialize'] = (!fs.existsSync(uiKit) ? [
    `${openApplicationDir} git clone git@gitlab.uis.dev:web/ui_kit.git`
] : []).concat(!fs.existsSync(nodeModules) ? [() => {
    fs.copyFileSync(packageJson, packageJsonCopy);
    overridenPackageJson.dependencies['uis-ui-kit'] = './ui_kit';
    fs.writeFileSync(packageJson, JSON.stringify(overridenPackageJson));
},  `${openApplicationDir} npm install`, () => {
    fs.copyFileSync(packageJsonCopy, packageJson);
    fs.unlinkSync(packageJsonCopy);
}] :  []).concat(
    actions['fix-permissions']
);

actions['remove-all'] = [() => {
    fs.existsSync(build) && fs.rmdirSync(build, {recursive: true});
    fs.existsSync(uiKitNodeModules) && fs.rmdirSync(uiKitNodeModules, {recursive: true});
    fs.existsSync(nodeModules) && fs.rmdirSync(nodeModules, {recursive: true});
    fs.existsSync(packageLockJson) && fs.unlinkSync(packageLockJson);
}];

const watch = `${openApplicationDir} npm run watch -- --test`;

actions['watch'] = actions['initialize'].concat([watch]);
actions['run-server'] = actions['initialize'].concat(['service nginx start']).concat([watch]);

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
