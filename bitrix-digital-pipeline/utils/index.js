const {Args, isOneOf} = require('./arguments'),
    execute = require('./execute'),
    {nginxConfig, template, build, script, style} = require('./paths'),
    runServer = require('./runServer'),
    replaceVariables = require('./replaceVariables'),
    fs = require('fs');

const actions = {};

actions['bash'] = [];

actions['build'] = [() => fs.writeFileSync(build, replaceVariables({
    html: fs.readFileSync(template),
    variables: {
        head:
            `<script src="//api.bitrix24.com/api/v1/"></script>\n\n` +
            `<script>\n\n${fs.readFileSync(script)}\n</script>\n\n` +
            `<style>\n\n${fs.readFileSync(style)}\n</style>\n\n` +
            '<script>' +
                'document.addEventListener("DOMContentLoaded", function () {' +
                    'runApplication({{ current_values|safe }});' +
                '})' +
            '</script>'
    }
}))];


actions['run-server'] = [
    'service nginx stop',
    `cp ${nginxConfig} /etc/nginx/nginx.conf`,
    'service nginx start',
    runServer
];

const {action, ...params} = (new Args({
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
