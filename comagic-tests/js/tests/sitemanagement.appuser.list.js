tests.addTest(function({
    requestsManager,
    testersFactory,
    wait,
    utils,
}) {
    describe('Открываю раздел "Управление пользователями". Выбираю пользователия для редактирования.', function() {
        var tester;

        beforeEach(function() {
            if (tester) {
                tester.destroy();
            }

            tester = new SitemanagementAppuserList({
                requestsManager,
                testersFactory,
                utils,
            });

            Comagic.Directory.load();
            //tester.batchReloadRequest().receiveResponse();

            tester.actionIndex({
                siteId: 23523
            }, {
                recordId: 104561
            });

            tester.requestAppUser().send();
            tester.requestEmployeesUnattachedToUser().send();
            tester.requestPermissions().send();

            wait();

            tester.requestValidateLogin().send();
            wait();
            tester.requestValidateLogin().send();
            wait(10);
        });

        xdescribe('Выбираю сотрудника для связывания с пользователем.', function() {
            beforeEach(function() {
                tester.employeesCombo().clickArrow();
                tester.requestEmployeesUnattachedToUser().send();

                tester.employeesCombo().option('Ченкова Веселина Добриновна').click();
            });

            describe('SIP-линия сотрудника имеет канальность два.', function() {
                beforeEach(function() {
                    tester.requestChannelsCount().setMoreThanTwo().send();

                    wait();
                    tester.requestValidateLogin().send();
                    wait(10);
                });

                it(
                    'Отображается окно с сообщением о том, что канальность SIP-линии не должна быть больше двух.',
                function() {
                    tester.warningWindow.expectTextContentToHaveSubstring(
                        'Канальность SIP-линии +7 (495) 123-45-67 равна 12.'
                    );
                });
                it('Нажимаю на кнопку закрытия окна. Возвращено прежнее значение привязанного сотрудника.', function() {
                    tester.closeButton.click();

                    wait();
                    tester.requestValidateLogin().send();
                    wait(10);

                    tester.employeesCombo().expectToHaveValue('Костадинова Галина Добромировна');
                });
                it('Нажимаю на кнопку "Отмена". Возвращено прежнее значение привязанного сотрудника.', function() {
                    tester.cancelButton.click();

                    wait();
                    tester.requestValidateLogin().send();
                    wait(10);

                    tester.employeesCombo().expectToHaveValue('Костадинова Галина Добромировна');
                });
                describe('Нажимаю на кнопку "Да".', function() {
                    beforeEach(function() {
                        tester.yesButton.click();
                    });

                    it(
                        'Не удалось изменить канальность SIP-линии. Возвращено прежнее значение привязанного ' +
                        'сотрудника.',
                    function() {
                        tester.requestSetSipLineChannelsCount().setFatalError().send();

                        wait();
                        tester.requestValidateLogin().send();
                        wait(10);

                        tester.employeesCombo().expectToHaveValue('Костадинова Галина Добромировна');
                    });
                    it(
                        'Канальность SIP-линии изменена. Прежнее значение привязанного сотрудника возвращено не было.',
                    function() {
                        tester.requestSetSipLineChannelsCount().send();
                        tester.employeesCombo().expectToHaveValue('Ченкова Веселина Добриновна');
                    });
                });
            });
            it(
                'SIP-линия сотрудника имеет канальность два. Окно с сообщением о том, что канальность SIP-линии не ' +
                'должна быть больше двух не отображается.',
            function() {
                tester.requestChannelsCount().send();

                wait();
                tester.requestValidateLogin().send();
                wait(10);

                tester.warningWindow.expectToBeHiddenOrNotExist();
                tester.employeesCombo().expectToHaveValue('Ченкова Веселина Добриновна');
            });
            it(
                'Не удалось выяснить канальность SIP-линии сотрудника. Окно с сообщением о том, что канальность ' +
                'SIP-линии не должна быть больше двух не отображается.',
            function() {
                tester.requestChannelsCount().setError().send();

                wait();
                tester.requestValidateLogin().send();
                wait(10);

                tester.warningWindow.expectToBeHiddenOrNotExist();
                tester.employeesCombo().expectToHaveValue('Ченкова Веселина Добриновна');
            });
            it(
                'Попытка выяснить канальность SIP-линии сотрудника завершилась фатальной ошибкой. Окно с сообщением ' +
                'о том, что канальность SIP-линии не должна быть больше двух не отображается.',
            function() {
                tester.requestChannelsCount().setFatalError().send();

                wait();
                tester.requestValidateLogin().send();
                wait(10);

                tester.warningWindow.expectToBeHiddenOrNotExist();
                tester.employeesCombo().expectToHaveValue('Ченкова Веселина Добриновна');
            });
            it(
                'При попытке выяснить канальность SIP-линии сотрудника был получен некорректный ответ сервера. Окно ' +
                'с сообщением о том, что канальность SIP-линии не должна быть больше двух не отображается.',
            function() {
                tester.requestChannelsCount().setNotJSON().send();

                wait();
                tester.requestValidateLogin().send();
                wait(10);

                tester.warningWindow.expectToBeHiddenOrNotExist();
                tester.employeesCombo().expectToHaveValue('Ченкова Веселина Добриновна');
            });
            it(
                'Сотрудник не имеет SIP-линии. Окно с сообщением о том, что канальность SIP-линии не должна быть ' +
                'больше двух не отображается.',
            function() {
                tester.requestChannelsCount().setNoSipLineFound().send();

                wait();
                tester.requestValidateLogin().send();
                wait(10);

                tester.warningWindow.expectToBeHiddenOrNotExist();
                tester.employeesCombo().expectToHaveValue('Ченкова Веселина Добриновна');
            });
        });
        it('', function() {
        });
    });
});
