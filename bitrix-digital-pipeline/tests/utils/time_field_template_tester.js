define(() => {
    return function ({
        testersFactory,
        utils,
        ajax
    }) {
        return {
            body: testersFactory.createDomElementTester('body'),

            application: () => {
                const me = {
                    run: () => runApplication('America/New_York')
                };

                return me;
            }
        };
    };
});
