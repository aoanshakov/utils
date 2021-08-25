const http = require('http'),
    fs = require('fs'),
    replaceVariables = require('./replaceVariables');

const {template} = require('./paths');

const scriptFile = path => `<script src="${path}"></script>`,
    styleFile = path => `<link rel="stylesheet" href="${path}" />`,
    content = content => `<script>${content}</script>`,
    scriptFiles = paths => paths.reduce((result, path) => ((result += scriptFile(path)), result), '');

module.exports = () => {
    const server = http.createServer((request, response) => {
        response.setHeader('Content-Type', 'text/html; charset=utf-8;');

        response.write(replaceVariables({
            html: fs.readFileSync(template),
            variables: {
                head: [styleFile(
                    '/style.css'
                ), scriptFiles([
                    '/tests/utils/jasmine/lib/jasmine-3.4.0/jasmine.js',
                    '/tests/utils/jasmine/lib/jasmine-3.4.0/jasmine-html.js'
                ]), content(
                    'var windowLoadHandler = window.onload;'
                ), scriptFile(
                    '/tests/utils/jasmine/lib/jasmine-3.4.0/boot.js'
                ), content(
                    'window.onload = windowLoadHandler;'
                ), scriptFiles([
                    '/tests/utils/jasmine/lib/jasmine-ajax/lib/mock-ajax.js',
                    '/tests/utils/jasmine/console-reporter.js',
                    '/tests/utils/js-tester.js'
                ]), content(
                    'var tests = new JsTester_Tests(new JsTester_Factory());' +
                    'tests.exposeDebugUtils("jsTestDebug");'
                ), scriptFiles([
                    '/tests/utils/require.js',
                    '/tests/tests.js',
                    '/tests/utils/tests.js',
                    '/script.js'
                ])].join(''),

                ...(Object.entries({
                    employee_id: 'Сотруднику',
                    virtual_number: 'На виртуальный номер',
                    virtual_number_numb: 'Звонить абоненту с номера',
                    scenario_id: 'По сценарию ВАТС',
                    employee_message: 'Голосовое сообщение для сотрудника',
                    autocall_on: 'Звонить'
                }).reduce((result, [key, value]) => ((result[`properties.${key}.NAME`] = value), result), {})),

                'token': 'Fl298gw0e2Foiweoa4Ua-0923gLwe84we3LErwiI230',
                'submit_button_text': 'Сохранить',
                'to_personal_manager': 'Персональному менеджеру'
            }
        }));

        response.end();
    });

    server.on('listening', () => console.log('Сервер запущен.'));
    server.listen(3000);
};
