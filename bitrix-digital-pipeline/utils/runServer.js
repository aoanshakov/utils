const http = require('http'),
    fs = require('fs'),
    {renderAdvanced} = require('./renderTemplate'),
    {getRandomFileName, applications} = require('./paths');

const scriptFile = path => `<script src="${path}"></script>`,
    styleFile = path => `<link rel="stylesheet" href="${path}" />`,
    content = content => `<script>${content}</script>`,
    scriptFiles = paths => paths.reduce((result, path) => ((result += scriptFile(path)), result), '');

module.exports = () => {
    const server = http.createServer(({url}, response) => {
        response.setHeader('Content-Type', 'text/html; charset=utf-8;');
        const application = applications.find(({directory}) => url == `/${directory}/`)

        if (!application) {
            response.end();
            return;
        }

        const temporaryHtmlFile = getRandomFileName(),
            {directory, template} = application;

        renderAdvanced({
            template,
            target: temporaryHtmlFile,
            variables: {
                head: [styleFile(
                    `/${directory}/style.css`
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
                    `/tests/${directory}.js`,
                    '/tests/utils/tests.js',
                    `/${directory}/script.js`
                ])].join(''),

                properties: Object.entries({
                    virtual_number_numb: ['Звонить абоненту с номера'],
                    scenario_id: ['По сценарию ВАТС'],
                    employee_message: ['Голосовое сообщение для сотрудника'],
                    auto_call_on: ['Звонить', {
                        OPTIONS: {
                            personal_manager: 'Персональному менеджеру',
                            employee: 'Сотруднику',
                            virtual_number: 'На виртуальный номер',
                            scenario: 'По сценарию ВАТС'
                        }
                    }]
                }).reduce((result, [key, [value, params = {}]]) => ((result[key] = {
                    NAME: value,
                    ...params
                }), result), {}),

                token: 'Fl298gw0e2Foiweoa4Ua-0923gLwe84we3LErwiI230'
            },
            callback: () => {
                response.write(fs.readFileSync(temporaryHtmlFile));
                fs.unlinkSync(temporaryHtmlFile);

                response.end();
            }
        });

        isHandled = true;
    });

    server.on('listening', () => console.log('Сервер запущен.'));
    server.listen(3000);
};
