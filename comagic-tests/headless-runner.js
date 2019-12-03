require('colors');

Error.stackTraceLimit = Infinity;

const puppeteer = require('puppeteer');

(async function () {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });
    const page = await browser.newPage();

    page.setViewport({
        width: 1280,
        height: 960
    });

    page.on('console', async function(message) {
        message = message.text();
        var matches = message.match(/^(?:\s)*%c%s(?:\s)*color:(?:\s)*([a-z]*); *((?:.*\n*)*)$/m);

        if (matches && matches[1] && matches[2]) {
            message = matches[2][matches[1]];
        }

        console.log(message);
    });
    page.on('pageerror', function(error) {
        console.log(error.message.red);
    });

    await page.goto('http://127.0.0.1/tests/html/' + process.argv[2] + '.html');
    await page.waitForFunction('testsComplete', {
        timeout: 120000
    });
    
    await page.screenshot({
        path: 'screenshots/page.png'
    });

    await browser.close();
})();
