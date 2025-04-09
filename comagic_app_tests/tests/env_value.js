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

    it('', function() {
        new Tester({
            ...options,
            appName: 'env_value',
        });
    });
});
