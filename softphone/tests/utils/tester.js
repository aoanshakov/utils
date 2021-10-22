define(() => function ({
    testersFactory,
    utils,
    ajax,
    fetch,
    spendTime,
    softphoneTester: me
}) {
    me.configRequest = () => ({
        receiveResponse: () => {
            fetch.recentRequest().expectPathToContain('/config.json').respondSuccessfullyWith(JSON.stringify({
                REACT_APP_LOCALE: 'ru',
                SOFTPHONE_HOST: 'myint0.dev.uis.st'
            }));

            Promise.runAll(false, true);
            spendTime(0)
            Promise.runAll(false, true);
        }
    });
        
    window.application.run({
        callback: (args) => Object.entries(args).forEach(([key, value]) => (me[key] = (...args) => {
            const result = value(...args);
            spendTime(0);
            return result;
        }))
    });

    spendTime(0);

    return me;
});
