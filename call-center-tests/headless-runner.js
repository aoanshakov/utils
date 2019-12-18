require('colors');
Error.stackTraceLimit = Infinity;

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async function () {
    var failedTestsCount = 0,
        passedTestsCount = 0,
        failedSuites = [],
        time = Date.now(),
        suites = process.argv.slice(2),
        suitesCount = suites.length,
        limit = 5;

    function eachHtmlFile (directory, callback, namespace) {
        namespace = namespace || '';

        fs.readdirSync(directory).forEach(function (item) {
            var itemPath = path.resolve(directory, item),
                suiteName = namespace + item;

            if (fs.statSync(itemPath).isDirectory()) {
                eachHtmlFile(itemPath, callback, suiteName + '/');
            } else {
                if (/\.html$/.test(itemPath)) {
                    callback(suiteName.split('.').slice(0, -1).join('.'));
                }
            }
        });
    }

    if (!suitesCount) {
        eachHtmlFile(path.resolve(__dirname, 'html'), function (filePath) {
            suites.push(filePath);
        });

        suitesCount = suites.length;
    }

    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ],
        env: {
            TZ: 'Europe/Moscow',
            ...process.env
        }
    });

    function handleSuiteDone () {
        suitesCount --;

        if (!suitesCount) {
            (async function () {
                await browser.close();

                time = Date.now() - time;
                var hours = Math.floor(time / (60 * 60 * 1000));
                time = time % (60 * 60 * 1000);
                var minutes = Math.floor(time / (60 * 1000));
                time = time % (60 * 1000);
                var seconds = Math.floor(time / 1000);
                var milliseconds = time % 1000;

                console.log("\n" + 'Time: ' + [
                    [hours, 'hours'], [minutes, 'minutes'], [seconds, 'seconds'], [milliseconds, 'milliseconds']
                ].filter(function (options) {
                    return options[0] > 0;
                }).map(function (options) {
                    return options[0] + ' ' + options[1];
                }).join(', ') + '. Passed tests: ' + passedTestsCount + '. Failed tests: ' + failedTestsCount + '.');

                if (failedSuites.length) {
                    console.log("\n" + 'Failed tests suites: ' + failedSuites.join(', ') + '.');
                }

                console.log("\n");
            })();
        } else {
            runSuite(suites.pop());
        }
    }

    var runSuite = async function (suite) {
        if (!suite) {
            return;
        }

        const page = await browser.newPage();

        var addFailedSuite = function () {
            failedSuites.push(suite);
            addFailedSuite = function () {};
        };

        page.setViewport({
            width: 1280,
            height: 960
        });

        page.on('console', async function(message) {
            message = message.text();
            var matches = message.match(/^(?:\s)*%c%s(?:\s)*color:(?:\s)*([a-z]*); *((?:.*\n*)*)$/m);

            if (matches && matches[1] && matches[2]) {
                var color = matches[1];
                matches[2] = "\n" + suite + "\n" + matches[2];
                message = matches[2][color];

                switch (color) {
                    case 'red':
                        addFailedSuite();
                        failedTestsCount ++;
                        break;
                    case 'green': 
                        passedTestsCount ++;
                        break;
                }
            }

            console.log(message);
        });
        page.on('pageerror', function(error) {
            console.log(error.message.red);
            addFailedSuite();
            failedTestsCount ++;
        });

        await page.goto('http://127.0.0.1/tests/html/' + suite + '.html');
        await page.waitForFunction('testsComplete', {
            timeout: 24 * 60 * 60 * 1000
        });

        await page.close();
        handleSuiteDone();
    };

    var firstSuites = suites.slice(0, limit);
    suites = suites.slice(limit);

    firstSuites.forEach(runSuite);
})();
