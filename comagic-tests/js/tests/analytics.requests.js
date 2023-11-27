tests.addTest(function({
    requestsManager,
    testersFactory,
    wait,
    utils,
}) {
    describe((
        'Открываю разел "Отчеты/Обзор". Нажимаю на ссылку в колонке "Сайт" строки таблицы. Открылся раздел "Отчеты/' +
        'Список обращений/Заявки".'
    ), function() {
        var tester;

        beforeEach(function() {
            if (tester) {
                tester.destroy();
            }

            tester = new AnalyticsRequests({
                requestsManager,
                testersFactory,
                utils,
            });

            tester.goalsRequest().receiveResponse();
            tester.actionIndex();

            tester.requestsSettingsRequest().receiveResponse();
            tester.requestsReferenceDataRequest().receiveResponse();
            tester.secondDimentionRequest().receiveResponse();
            tester.requestsSettingsRequest().setNotDefault().receiveResponse();
            tester.eventTrackingRequest().receiveResponse();
            tester.gridDataRequest().receiveResponse();
            tester.requestsFiltersRequest().receiveResponse();
            tester.requestsChartDataRequest().receiveResponse();
            tester.eventTrackingRequest().setLoad().receiveResponse();
            wait();
            tester.eventTrackingRequest().setGridRendered().receiveResponse();

            return;

            Comagic.Directory.load();
            tester.batchReloadRequest().send();

            tester.requestCallColumns().send();
            tester.requestCallSettings().send();
            tester.requestCallSettings().setNotDefault().send();
            tester.requestCallFilters().send();
            tester.requestCallChartData().setCameFromReview().send();
            tester.eventTrackingRequest().setLoad().receiveResponse();
            wait();
            tester.eventTrackingRequest().setGridRendered().receiveResponse();
            tester.tagsRequest().receiveResponse();
        });

        it('', function() {
        });
    });
});
