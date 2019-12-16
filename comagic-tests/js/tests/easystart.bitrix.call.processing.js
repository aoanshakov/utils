tests.addTest(function(requestsManager, testersFactory, wait, utils) {
    var tester;
    
    beforeEach(function() {
        tester = new EasystartBitrix(requestsManager, testersFactory, utils);
    });

    describe(
        'Открываю страницу легкого входа amoCRM. Нажимаю на кнопку "Тестировать бесплатно". Нажимаю на кнпоку ' +
        '"Продолжить". В соответствии с данными, полученными от сервера ранее были выбраны три сотрудника. Отмечаю ' +
        'других трех сотрудников. Нажимаю на кнопку "Продолжить".',
    function() {
        beforeEach(function() {
            EasyStart.getApplication().checkIfPartnerReady();
            tester.tryForFreeButton.click();
            tester.requestCreateAccount().send();
            wait(100);

            tester.settingsStep('Номер телефона').nextButton().click();
            tester.requestEmployees().send();
            wait(100);

            tester.employeesGrid.row().atIndex(1).column().first().checkbox().click();
            tester.employeesGrid.row().first().column().first().checkbox().click();
            tester.employeesGrid.row().atIndex(3).column().first().checkbox().click();
            tester.employeesGrid.row().atIndex(2).column().first().checkbox().click();
            wait(100);

            tester.settingsStep('Сотрудники').nextButton().click();
            wait(100);
        });

        describe(
            'В соответствии с данными, полученными от сервера ранее был выбран тип переадресации "По очереди" и ' +
            'у одного из сотрудников номер был подтвержден.',
        function() {
            beforeEach(function() {
                tester.requestChooseEmployees().setQueue().setVerified().send();
                tester.requestSyncEmployees().setDone().send();
                wait(100);
            });

            it('Кнопка "Получить SMS" скрыта.', function() {
                tester.receiveSmsButton.expectToBeHidden();
            });
            describe('Изменяю номер телефона.', function() {
                beforeEach(function() {
                    tester.employeePhoneField().fill('9161234568');
                    wait(100);
                });

                it('Кнопка "Получить SMS" видима.', function() {
                    tester.receiveSmsButton.expectToBeVisible();
                });
                it('Нажимаю на кнопку "Одновременно всем". Кнопка "Получить SMS" видима.', function() {
                    tester.simoultaneousForwardingTypeButton().click();
                    wait(100);

                    tester.receiveSmsButton.expectToBeVisible();
                });
            });
        });
        describe(
            'В соответствии с данными, полученными от сервера ранее был выбран тип переадресации "Одновременно ' +
            'всем" и ни у одного из них не номер не был подтвержден.',
        function() {
            beforeEach(function() {
                tester.requestChooseEmployees().send();
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
                        'Отправлен запрос проверки синхронизации. Синхронизация завершена. Спиннер загрузки скрыт.',
                    function() {
                        wait();
                        tester.requestUserSyncState().setDone().send();
                        wait(100);
                        
                        tester.expectSpinnerToBeHidden();
                    });
                });
            });
            describe('Синхронизация сотрудников завершена.', function() {
                beforeEach(function() {
                    tester.requestSyncEmployees().setDone().send();
                    wait(100);
                });

                it('Колонка "Время дозвона" скрыта. Колонка изменения порядка строк скрыта.', function() {
                    tester.callProcessingGrid.column().withHeader('Время дозвона').expectToBeHiddenOrNotExist();

                    tester.callProcessingGrid.row().first().column().first().createTester().
                        forDescendant('.ul-drag-handle').expectToBeHiddenOrNotExist();
                });
                it(
                    'Нажимаю на кнопку "По очереди". Колонка "Время дозвона" видима. Колонка изменения порядка строк ' +
                    'видима.',
                function() {
                    tester.sequentialForwardingTypeButton().click();
                    wait(100);

                    tester.callProcessingGrid.column().withHeader('Время дозвона').expectToBeVisible();

                    tester.callProcessingGrid.row().first().column().first().createTester().
                        forDescendant('.ul-drag-handle').expectToBeVisible();
                });
            });
        });
    });
});
