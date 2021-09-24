const {getRandomFileName, pyRenderer} = require('./paths'),
    fs = require('fs'),
    execute = require('./execute'),
    write = require('./write');

module.exports = {
    renderSimple: ({target, variables, template, callback = () => null}) => {
        let html = (fs.readFileSync(template) || '') + '';

        Object.entries(variables).forEach(([variableName, value]) => {
            html = html.split(`{{ ${variableName} }}`).join(value);
        });
        
        write(target, html);
        callback();
    },

    renderAdvanced: ({target, variables, callback, template}) => {
        const temporaryJsonFile = getRandomFileName();
        write(temporaryJsonFile, JSON.stringify(variables));

        execute([
            `/root/venv/bin/python3 ${pyRenderer} ${temporaryJsonFile} ${template} ${target}`,
            () => fs.unlinkSync(temporaryJsonFile),
            callback
        ]);
    }
};
