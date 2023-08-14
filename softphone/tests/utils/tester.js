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
                REACT_APP_LOCALE: 'ru'
            }));

            Promise.runAll(false, true);
            spendTime(0)
            Promise.runAll(false, true);
        }
    });
        
    window.application.run({
        callback: store => (me.store = store)
    });

    spendTime(0);
    return me;
});
