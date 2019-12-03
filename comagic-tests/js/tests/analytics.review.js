tests.addTest(function(requestsManager, testersFactory, wait, utils) {
    it('Открываю раздел "Отчеты/Обзор".', function() {
        var helper;

        if (helper) {
            helper.destroy();
        }

        helper = new AnalyticsReview(requestsManager, testersFactory, utils);

        helper.actionIndex();
        helper.requestReview().send();
        helper.requestWarnings().send();

        helper.reviewGrid.row().first().column().withHeader('Сайт').findAnchor('www.rian.ru').click();
    });
});
