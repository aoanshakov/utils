tests.addTest(function(requestsManager, testersFactory, wait, utils) {
    describe(
        'Открываю раздел "Управление пользователями". Выбираю пользователия для редактирования. Выбираю сотрудника ' +
        'для связывания с пользователем.',
    function() {
        var helper;

        beforeEach(function() {
            if (helper) {
                helper.destroy();
            }

            helper = new SitemanagementAppuser(requestsManager, testersFactory, utils);

            helper.actionIndex({
                siteId: 23523
            }, {
                recordId: 104561
            });

            helper.requestAppUser().send();
            helper.requestEmployeesUnattachedToUser().send();
            helper.requestPermissions().send();

            wait();

            helper.requestValidateLogin().send();
            wait();
            helper.requestValidateLogin().send();
            wait(10);

            helper.employeesCombo().clickArrow();
            helper.requestEmployeesUnattachedToUser().send();

            helper.employeesCombo().option('Ченкова Веселина Добриновна').click();
        });

        xit(
            'SIP-линия сотрудника имеет канальность два. Окно с сообщением о том, что канальность SIP-линии не ' +
            'должна быть больше двух не отображается.',
        function() {
            helper.requestChannelsCount().send();

            wait();
            helper.requestValidateLogin().send();
            wait(10);

            helper.warningWindow.expectToBeHiddenOrNotExist();
            helper.employeesCombo().expectToHaveValue('Ченкова Веселина Добриновна');
        });
        xit(
            'Не удалось выяснить канальность SIP-линии сотрудника. Окно с сообщением о том, что канальность ' +
            'SIP-линии не должна быть больше двух не отображается.',
        function() {
            helper.requestChannelsCount().setError().send();

            wait();
            helper.requestValidateLogin().send();
            wait(10);

            helper.warningWindow.expectToBeHiddenOrNotExist();
            helper.employeesCombo().expectToHaveValue('Ченкова Веселина Добриновна');
        });
        xit(
            'Попытка выяснить канальность SIP-линии сотрудника завершилась фатальной ошибкой. Окно с сообщением о ' +
            'том, что канальность SIP-линии не должна быть больше двух не отображается.',
        function() {
            helper.requestChannelsCount().setFatalError().send();

            wait();
            helper.requestValidateLogin().send();
            wait(10);

            helper.warningWindow.expectToBeHiddenOrNotExist();
            helper.employeesCombo().expectToHaveValue('Ченкова Веселина Добриновна');
        });
        xit(
            'При попытке выяснить канальность SIP-линии сотрудника был получен некорректный ответ сервера. Окно с ' +
            'сообщением о том, что канальность SIP-линии не должна быть больше двух не отображается.',
        function() {
            helper.requestChannelsCount().setNotJSON().send();

            wait();
            helper.requestValidateLogin().send();
            wait(10);

            helper.warningWindow.expectToBeHiddenOrNotExist();
            helper.employeesCombo().expectToHaveValue('Ченкова Веселина Добриновна');
        });
        xit(
            'Сотрудник не имеет SIP-линии. Окно с сообщением о том, что канальность SIP-линии не должна быть больше ' +
            'двух не отображается.',
        function() {
            helper.requestChannelsCount().setNoSipLineFound().send();

            wait();
            helper.requestValidateLogin().send();
            wait(10);

            helper.warningWindow.expectToBeHiddenOrNotExist();
            helper.employeesCombo().expectToHaveValue('Ченкова Веселина Добриновна');
        });
        describe('SIP-линия сотрудника имеет канальность два.', function() {
            beforeEach(function() {
                helper.requestChannelsCount().setMoreThanTwo().send();

                wait();
                helper.requestValidateLogin().send();
                wait(10);
            });

            it(
                'Отображается окно с сообщением о том, что канальность SIP-линии не должна быть больше двух.',
            function() {
                helper.warningWindow.expectTextContentToHaveSubstring(
                    'Канальность SIP-линии +7 (495) 123-45-67 равна 12.'
                );
            });
            return;
            it('Нажимаю на кнопку закрытия окна. Возвращено прежнее значение привязанного сотрудника.', function() {
                helper.closeButton.click();

                wait();
                helper.requestValidateLogin().send();
                wait(10);

                helper.employeesCombo().expectToHaveValue('Костадинова Галина Добромировна');
            });
            it('Нажимаю на кнопку "Отмена". Возвращено прежнее значение привязанного сотрудника.', function() {
                helper.cancelButton.click();

                wait();
                helper.requestValidateLogin().send();
                wait(10);

                helper.employeesCombo().expectToHaveValue('Костадинова Галина Добромировна');
            });
            describe('Нажимаю на кнопку "Да".', function() {
                beforeEach(function() {
                    helper.yesButton.click();
                });

                it(
                    'Не удалось изменить канальность SIP-линии. Возвращено прежнее значение привязанного сотрудника.',
                function() {
                    helper.requestSetSipLineChannelsCount().setFatalError().send();

                    wait();
                    helper.requestValidateLogin().send();
                    wait(10);

                    helper.employeesCombo().expectToHaveValue('Костадинова Галина Добромировна');
                });
                it(
                    'Канальность SIP-линии изменена. Прежнее значение привязанного сотрудника возвращено не было.',
                function() {
                    helper.requestSetSipLineChannelsCount().send();
                    helper.employeesCombo().expectToHaveValue('Ченкова Веселина Добриновна');
                });
            });
        });
    });
});
