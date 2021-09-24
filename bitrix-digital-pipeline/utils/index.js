const {Args, isOneOf} = require('./arguments'),
    execute = require('./execute'),
    {nginxConfig, pyBuilder, applications} = require('./paths'),
    runServer = require('./runServer'),
    {renderSimple} = require('./renderTemplate'),
    fs = require('fs');

const actions = {};

actions['bash'] = [];

actions['build'] = applications.reduce((
    commands,
    {
        template,
        dependencies,
        script,
        style,
        htmlBuild,
        pyBuild,
        args
    }
) => commands.concat([
    () => renderSimple({
        template,
        target: htmlBuild,
        variables: {
            head:
                dependencies.map(src =>  `<script src="${src}"></script>\n\n`).join('') +
                `<script>\n\n${fs.readFileSync(script)}\n</script>\n\n` +
                `<style>\n\n${fs.readFileSync(style)}\n</style>\n\n` +
                '<script>' +
                    'document.addEventListener("DOMContentLoaded", function () {' +
                        `runApplication(${args});` +
                    '})' +
                '</script>'
        }
    }),
    `/root/venv/bin/python3 ${pyBuilder} ${htmlBuild} ${pyBuild}`
]), []);


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
