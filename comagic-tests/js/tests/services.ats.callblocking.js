tests.addTest(function(requestsManager, testersFactory, wait, utils) {
    describe('Открываю раздел "Сервисы/Виртуальная АТС/Блокировка звонков". Исходящий обзвон доступен.', function() {
        var tester;

        beforeEach(function() {
            tester = new ServicesAtsCallblocking(requestsManager, testersFactory, utils);
            tester.blackListRequest().receiveResponse();
        });

        afterEach(function() {
            tester.destroy();
        });

        xit('Нажимаю на свитчбокс "Блокировка входящих с номера". Отправлен запрос обновления записи.', function() {
            tester.blackListGrid.row().atIndex(0).column().withHeader('Блокировка входящих с номера').
                createTester().forDescendant('.x-form-type-switchbox a').click();

            tester.requestOfBlackListItemUpdate().receiveResponse();
            tester.blackListRequest().receiveResponse();
        });
        it('Нажимаю на свитчбокс "Запрет исходящего обзвона". Отправлен запрос обновления записи.', function() {
            tester.blackListGrid.row().atIndex(0).column().withHeader('Запрет исходящего обзвона').
                createTester().forDescendant('.x-form-type-switchbox a').click();

            tester.requestOfBlackListItemUpdate().createResponse().setOutgoingEnabled().receive();
            tester.blackListRequest().receiveResponse();
        });
        return;
        it('Отображены данные таблицы блокировки звонков.', function() {
            tester.blackListGrid.row().atIndex(0).column().withHeader('Запрет исходящего обзвона').
                createTester().forDescendant('.x-form-type-switchbox').expectNotToHaveClass('x-item-disabled');

            tester.blackListGrid.row().atIndex(0).column().withHeader('Блокировка входящих с номера').
                createTester().forDescendant('.x-form-type-switchbox').expectToHaveClass('x-form-cb-checked');
            tester.blackListGrid.row().atIndex(0).column().withHeader('Запрет исходящего обзвона').
                createTester().forDescendant('.x-form-type-switchbox').expectNotToHaveClass('x-form-cb-checked');

            tester.blackListGrid.row().atIndex(1).column().withHeader('Блокировка входящих с номера').
                createTester().forDescendant('.x-form-type-switchbox').expectNotToHaveClass('x-form-cb-checked');
            tester.blackListGrid.row().atIndex(1).column().withHeader('Запрет исходящего обзвона').
                createTester().forDescendant('.x-form-type-switchbox').expectToHaveClass('x-form-cb-checked');
        });
    });
    return;
    it(
        'Открываю раздел "Сервисы/Виртуальная АТС/Блокировка звонков". Исходящий обзвон недоступен. Отображены ' +
        'данные таблицы блокировки звонков.',
    function() {
        var tester;

        Comagic.getApplication().setHasNotComponent('auto_out_calls');
        tester = new ServicesAtsCallblocking(requestsManager, testersFactory, utils);
        tester.blackListRequest().receiveResponse();

        tester.blackListGrid.row().atIndex(0).column().withHeader('Запрет исходящего обзвона').
            createTester().forDescendant('.x-form-type-switchbox').expectToHaveClass('x-item-disabled');

        tester.destroy();
    });
});
