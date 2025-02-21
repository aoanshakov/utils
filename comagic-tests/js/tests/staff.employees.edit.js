tests.addTest(function(args) {
    const {
        requestsManager,
        testersFactory,
        wait,
        utils,
    } = args;

    describe('Открываю страницу сотрудника.', function() {
        var tester,
            employeeRequest;

        beforeEach(function() {
            tester && tester.destroy();
            tester = new StaffEmployeesEdit(args);

            Comagic.Directory.load();
            tester.batchReloadRequest().receiveResponse();

            tester.actionIndex({
                recordId: 104561
            });

            employeeRequest = tester.employeeRequest().expectToBeSent();
        });

        describe('Уровень доступа к чужим чатам не указан. Открываю вкладку "Чаты и заявки".', function() {
            beforeEach(function() {
                employeeRequest.receiveResponse();
                wait();

                tester.loginValidationRequest().receiveResponse();
                wait();
                tester.loginValidationRequest().receiveResponse();
                wait();

                tester.tab('Чаты и заявки').click();
                wait();

                tester.loginValidationRequest().receiveResponse();
                wait();
                tester.loginValidationRequest().receiveResponse();
                wait();
            });

            describe('Включи свитчбокс "Доступ к чужим чатам".', function() {
                beforeEach(function() {
                    tester.switchbox('Доступ к чужим чатам').click();
                    wait();

                    tester.loginValidationRequest().receiveResponse();
                    wait();
                });
                
                describe('Открываю выпадающий список Доступ к чатам на уровне". Выбираю опцию "Группы".', function() {
                    beforeEach(function() {
                        tester.combobox('Доступ к чатам на уровне').click();
                        wait();

                        tester.combobox('Доступ к чатам на уровне')
                            .option('Группы')
                            .click();

                        wait();

                        tester.loginValidationRequest().receiveResponse();
                        wait();
                    });

                    describe('Выбираю группы из списка.', function() {
                        beforeEach(function() {
                            tester.tags('Список групп *').
                                addButton.
                                click();
                            wait();

                            tester.grid('Выберите группы').
                                row().
                                atIndex(1).
                                column().
                                first().
                                checkbox().
                                click();
                            wait();

                            tester.loginValidationRequest().receiveResponse();
                            wait();

                            tester.grid('Выберите группы').
                                row().
                                atIndex(3).
                                column().
                                first().
                                checkbox().
                                click();
                            wait();

                            tester.loginValidationRequest().receiveResponse();
                            wait();

                            tester.grid('Выберите группы').
                                closeButton.
                                click();
                            wait();
                        });

                        xit('Нажимаю на кнопку "Сохранить". Данные сохранены.', function() {
                            tester.button('Сохранить').click();
                            wait();

                            tester.employeeChangeRequest().
                                someGroupsHaveAccessToOtherEmployeesChats().
                                receiveResponse();

                            wait();
                            tester.batchReloadRequest().receiveResponse();
                            wait();
                        });
                        it('Группы выбраны.', function() {
                            tester.tags('Список групп *').
                                expectToHaveTextContent('Список групп * 123 amo_dzigit');
                        });
                    });
                    return;
                    it('Список сотрудников скрыт. Список групп видим.', function() {
                        tester.tags('Список групп *').expectToBeVisible();
                        tester.tags('Список сотрудников *').expectToBeHiddenOrNotExist();
                    });
                });
                return;
                it('Список групп скрыт. Список сотрудников видим.', function() {
                    tester.tags('Список групп *').expectToBeHiddenOrNotExist();
                    tester.tags('Список сотрудников *').expectToBeVisible();
                });
            });
            return;
            it('Список "Доступ к чужим чатам" скрыт.', function() {
                tester.combobox('Доступ к чатам на уровне').expectToBeHiddenOrNotExist();
            });
        });
        return;
        it(
            'Чужие чаты доступны для некоторых групп. Открываю вкладку "Чаты и заявки". Форма заполнена данными ' +
            'полученными от сервера.',
        function() {
            employeeRequest.
                someGroupsHaveAccessToOtherEmployeesChats().
                receiveResponse();

            wait();

            tester.loginValidationRequest().receiveResponse();
            wait();
            tester.loginValidationRequest().receiveResponse();
            wait();

            tester.tab('Чаты и заявки').click();
            wait();
            wait();
            tester.loginValidationRequest().receiveResponse();
            wait();

            tester.combobox('Доступ к чатам на уровне').expectToBeVisible();

            tester.tags('Список групп *').expectToBeVisible();
            tester.tags('Список сотрудников *').expectToBeHiddenOrNotExist();
        });
    });
});
