tests.addTest(options => {
    const {
        utils,
        Tester,
        spendTime,
        addSecond,
        windowOpener,
        setFocus,
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

    describe('Софтфон не должен отображаться поверх окон при входящем.', function() {
        let tester;

        beforeEach(function() {
            tester = new Tester({
                ...options,
                appName: 'fiber'
            });
        });

        it('', function() {
        });
    });
});
