tests.addTest(function(requestsManager, testersFactory, wait, utils) {
    describe('Открываю раздел "Сервисы/Виртуальная АТС/Виртуальные номера и правила".', function() {
        var helper;

        beforeEach(function() {
            helper = new ServicesAtsCallProcessing(requestsManager, testersFactory, utils);
            helper.requestAtsCallProcessing().send();
        });
        afterEach(function() {
            helper.destroy();
        });

        it((
            'Ввожу номер телефона в поле поиска. Отправлен запрос данных для таблицы номеров с фильтрацией по номеру ' +
            'телефона.'
        ), function() {
            helper.filtersToolbar.textfield().withPlaceholder(
                'Укажите номер телефона, рекламную кампанию, график активности, список АОНов, сценарий'
            ).fill('79161234567');

            helper.requestAtsCallProcessing().filterByNumber().send();
        });
        it('В выпадающем списке "Сценарий" выбрана опция "Не важно".', function() {
            helper.filtersToolbar.combobox().withFieldLabel('Сценарий').expectToHaveValue('Не важно');
        });
        it((
            'Выбираю опцию "Не задан" в выпадающем списке "Сценарий". Отправляется запрос номеров не имеющих ' +
            'сценария. Выбираю опцию "Не важно" в выпадающем списке "Сценарий". Отправляется запрос номеров без ' +
            'фильтрации по сценариям.'
        ), function() {
            helper.filtersToolbar.combobox().withFieldLabel('Сценарий').clickArrow().option('Не задан').click();
            helper.requestAtsCallProcessing().filterByAbsenceOfScenario().send();

            helper.filtersToolbar.combobox().withFieldLabel('Сценарий').clickArrow().option('Не важно').click();
            helper.requestAtsCallProcessing().doNotFilterByScenario().send();
        });
    });
});
