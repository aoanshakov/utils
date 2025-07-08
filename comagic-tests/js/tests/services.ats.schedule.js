tests.addTest(function(args) {
    var requestsManager = args.requestsManager,
        testersFactory = args.testersFactory,
        wait = args.wait,
        utils = args.utils;

    describe('Открываю раздел "Настройки/Графики активности". Нажимаю на кнопку удаления графика.', function() {
        var tester,
            scheduleRemovingAvailabilityRequest;

        beforeEach(function() {
            tester && tester.destroy();
            tester = new ServicesAtsSchedule(args);

            tester.actionIndex();
            tester.schedulesRequest().receiveResponse();

            tester.grid.
                row().first().
                createTester().forDescendant('.ul-action-remove').
                click();

            tester.win.button('Да').click();

            scheduleRemovingAvailabilityRequest = tester.scheduleRemovingAvailabilityRequest().
                expectToBeSent();
        });

        describe('Удаление доступно. Производится удаление.', function() {
            let scheduleRemovingRequest;

            beforeEach(function() {
                scheduleRemovingAvailabilityRequest.receiveResponse();
                scheduleRemovingRequest = tester.scheduleRemovingRequest().expectToBeSent();
            });
            
            it('Не удалось удалить номер. Отображается сообщение об ошибке.', function() {
                scheduleRemovingRequest.
                    failed().
                    receiveResponse();

                tester.win.expectTextContentToHaveSubstring(
                    'Ошибка ' +

                    'График активности используется в сценариях обратного звонка: ' +
                    'ljnflw;k. ' +
                    'Для удаления графика активности измените сценарии.'
                );
            });
            return;
            it('Удаление произведено успешно. Сообщение об ошибке не отображается.', function() {
                scheduleRemovingRequest.receiveResponse();

                tester.schedulesRequest().receiveResponse();
                tester.win.expectToBeHiddenOrNotExist();
            });
        });
        return;
        it('Удаление недоступно. Отображено сообщение об ошибке.', function() {
            scheduleRemovingAvailabilityRequest.unavailable().receiveResponse();

            tester.win.expectTextContentToHaveSubstring(
                'Ошибка ' +
                'Удаление невозможно. График используется: Некий график, Другой график'
            );
        });
    });
});
