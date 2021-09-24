tests.addTest(options => {
    const {TimeFieldTemplateTester, spendTime, setNow} = options,
        body = document.body.innerHTML;

    describe('Открываю поле времени.', function() {
        let tester,
            application;

        beforeEach(function() {
            setNow('2021-09-13T12:53:24');

            document.body.innerHTML = '';
            tester = new TimeFieldTemplateTester(options);
            tester.application().run();
        });

        it('Прошло пять минут. Время обновилось.', function() {
            setNow('2021-09-13T12:58:24');
            spendTime(5 * 60 * 1000);
            tester.body.expectToHaveTextContent('05:58');
        });
        it('Отображено текущее время.', function() {
            tester.body.expectToHaveTextContent('05:53');
        });
    });
});
