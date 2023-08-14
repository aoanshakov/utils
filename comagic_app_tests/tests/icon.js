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

    it('Отображаю иконку.', function() {
        Promise.uninstall();
        Promise.runAll = () => null;
        Promise.clear = () => null;

        new Tester({
            ...options,
            appName: 'icon',
        })
    });
});
