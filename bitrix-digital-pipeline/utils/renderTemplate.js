const {template, getRandomFileName, pyRenderer} = require('./paths'),
    fs = require('fs'),
    execute = require('./execute');

module.exports = {
    renderSimple: ({target, variables, callback = () => null}) => {
        let html = (fs.readFileSync(template) || '') + '';

        Object.entries(variables).forEach(([variableName, value]) => {
            html = html.split(`{{ ${variableName} }}`).join(value);
        });
        
        fs.writeFileSync(target, html);
        callback();
    },

    renderAdvanced: ({target, variables, callback}) => {
        const temporaryJsonFile = getRandomFileName();
        fs.writeFileSync(temporaryJsonFile, JSON.stringify(variables));

        execute([
            `/root/venv/bin/python3 ${pyRenderer} ${temporaryJsonFile} ${template} ${target}`,
            () => fs.unlinkSync(temporaryJsonFile),
            callback
        ]);
    }
};
