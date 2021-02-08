const fs = require('fs'),
    {Args, isOneOf, isTrue} = require('./utils/arguments'),
    execute = require('./utils/execute');

const {
    nodeModules,
    application,
    packageLockJson,
    patches,
    mainPatch
} = require('./utils/paths');
    
const openApplicationDir = `cd ${application} &&`;

const actions = {},
    overridenFiles = 'package.json public/index.html src/index.js src/history.js config-overrides.js';

actions['fix-permissions'] = [
    `if [ -n "$APPLICATION_OWNER" ]; then chown -R $APPLICATION_OWNER:$APPLICATION_OWNER $1 ${application}; fi`
];
    
actions['create-patch'] = [`${openApplicationDir} git diff -- ${overridenFiles} > ${mainPatch}`];
actions['restore-code'] = [`${openApplicationDir} git checkout ${overridenFiles}`].concat(actions['fix-permissions']);

actions['remove-all'] = actions['restore-code'].concat([() => {
    fs.existsSync(nodeModules) && fs.rmdirSync(nodeModules, {recursive: true});
    fs.existsSync(packageLockJson) && fs.unlinkSync(packageLockJson);
}]);

const initialize = ({test}) => (test ? fs.readdirSync(patches).filter(fileName => !/\.sw(p|o)$/.test(fileName)).map(
    fileName => `${openApplicationDir} patch -p1 ${test ? '' : '-R'} -N -r- < ${patches}/${fileName}`
) :  []).concat(
    !fs.existsSync(nodeModules) ? [`${openApplicationDir} npm install`] : []
).concat(
    actions['fix-permissions']
);

actions['initialize'] = initialize;

actions['start'] = ({test}) =>
    initialize({test}).
    concat(test ? ['service nginx start'] : []).
    concat([`${openApplicationDir} npm start`]);

const args = (new Args({
    action: {
        validate: isOneOf.apply(null, Object.keys(actions)),
    },
    test: {
        validate: isTrue
    }
})).createObjectFromArgsArray(process.argv);

const {action, test} = args;

if (!action) {
    console.log('Действие не указано');
    return;
}

Object.entries(actions).reduce((result, [key, value]) => {
    result[key] = () => execute(typeof value == 'function' ? value(args) : value);
    return result;
}, {})[action]();
