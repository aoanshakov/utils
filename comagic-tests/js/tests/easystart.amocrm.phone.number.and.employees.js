tests.addTest(function(requestsManager, testersFactory, wait, utils, windowOpener, debug, fakeNow) {
    var tester;
    
    beforeEach(function() {
        tester = new EasystartAmocrm(requestsManager, testersFactory, utils);
    });

    it(
        'Открываю страницу легкого входа amoCRM. От сервера получен выделенный номер телефона. Отображен номер ' +
        'телефона. Открываю страницу легкого входа amoCRM. От сервера получен выделенный номер телефона. Отображен ' +
        'номер телефона.',
    function() {
        EasyStart.getApplication().checkIfPartnerReady();
        wait(10);

        tester.phoneNumber.expectToHaveTextContent('+7 (903) 123-45-67');

        tester.tooltipTrigger.putMouseOver();
        tester.titleOfPhoneNumberTooltip.expectToBeVisible();
    });
    describe('Открываю страницу легкого входа amoCRM. Нажимаю на кнопку "Продолжить".', function() {
        beforeEach(function() {
            EasyStart.getApplication().checkIfPartnerReady();
            wait(10);

            tester.settingsStep('Номер телефона').nextButton().click();
            wait();
        });

        it(
            'Сервер оповестил об истечении времени действия сессии. Отображено окно с сообщением о том, что время ' +
            'действия сессии истекло.',
        function() {
            tester.requestSyncEmployees().setError().send();
            wait();

            tester.sessionErrorMessage.expectToBeVisible();
        });
        describe('Отправлен запрос синхронизации с amoCRM. Синхронизация еще не завершена.', function() {
            beforeEach(function() {
                tester.requestSyncEmployees().send();
            });

            it('Спиннер загрузки видим.', function() {
                tester.expectSpinnerToBeVisible();
            });
            describe('Отправлен запрос проверки синхронизации. Синхронизация еще не завершена.', function() {
                beforeEach(function() {
                    wait();
                    tester.requestUserSyncState().send();
                });

                it('Спиннер загрузки видим.', function() {
                    tester.expectSpinnerToBeVisible();
                });
                it(
                    'Отправлен запрос проверки синхронизации. Синхронизация завершена. Отправлен запрос списка ' +
                    'сотрудников. Список сотрудников получен от сервера. Спиннер загрузки скрыт.',
                function() {
                    wait();
                    tester.requestUserSyncState().setDone().send();
                    wait(2);
                    tester.requestEmployees().send();
                    wait();

                    tester.expectSpinnerToBeHidden();
                });
            });
        });
    });
    describe(
        'Открываю страницу легкого входа amoCRM. Нажимаю на кнопку "Тестировать бесплатно". Нажимаю на кнпоку ' +
        '"Продолжить". В соответствии с данными, полученными от сервера ранее были выбраны три сотрудника.',
    function() {
        beforeEach(function() {
            EasyStart.getApplication().checkIfPartnerReady();
            wait(100);

            tester.settingsStep('Номер телефона').nextButton().click();
            tester.requestSyncEmployees().setDone().send();
            tester.requestEmployees().send();
            wait(100);
        });

        it('Чебоксы отмечены в трех строках таблицы сотрудников.', function() {
            tester.employeesGrid.row().first().expectNotToBeSelected();
            tester.employeesGrid.row().atIndex(1).expectToBeSelected();
            tester.employeesGrid.row().atIndex(2).expectNotToBeSelected();
            tester.employeesGrid.row().atIndex(3).expectToBeSelected();
            tester.employeesGrid.row().atIndex(4).expectNotToBeSelected();
            tester.employeesGrid.row().atIndex(5).expectNotToBeSelected();
            tester.employeesGrid.row().atIndex(6).expectNotToBeSelected();
            tester.employeesGrid.row().atIndex(7).expectNotToBeSelected();
            tester.employeesGrid.row().atIndex(8).expectToBeSelected();
            tester.employeesGrid.row().atIndex(9).expectNotToBeSelected();
        });
    });
});
