tests.addTest(options => {
    const {
        utils,
        Tester,
        spendTime,
        addSecond,
        windowOpener,
        mediaStreamsTester,
        unload,
        ajax,
        fetch,
        soundSources,
        setNow,
        fileReader,
        userMedia,
        audioDecodingTester,
        blobsTester,
        windowSize,
        notificationTester,
        setDocumentVisible
    } = options;

    const getPackage = Tester.createPackagesGetter(options);

    describe('Открываю список контактов.', function() {
        let tester;

        beforeEach(function() {
            setNow('2019-12-19T12:10:06');

            tester = new Tester({
                ...options,
                appName: 'infiniteScroll'
            });
        });

        it('', function() {
        });
    });
});
