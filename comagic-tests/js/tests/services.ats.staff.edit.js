tests.addTest(function(args) {
    const {
        requestsManager,
        testersFactory,
        wait,
        utils,
    } = args;

    describe('Открываю страницу сотрудника.', function() {
        let tester;

        beforeEach(function() {
            tester && tester.destroy();
        });

        describe('Открываю вкладку "Использование сервисов".', function() {
            let employeeRequest;

            beforeEach(function() {
                tester = new ServicesAtsStaffContactEditPage(args);

                Comagic.Directory.load();
                tester.batchReloadRequest().receiveResponse();

                tester.actionIndex({
                    recordId: 104561
                });

                employeeRequest = tester.employeeRequest().expectToBeSent();
            });

            describe('Уровень доступа к чужим чатам не указан.', function() {
                beforeEach(function() {
                    employeeRequest.receiveResponse();

                    tester.sipLimitsRequest().receiveResponse();
                    wait();
                    tester.employeeUserRequest().receiveResponse();
                    wait();
                        
                    tester.form.textfield().withFieldLabel('Имя').fill('Веселина');
                    wait();

                    tester.form.scrollIntoView();

                    tester.tab('Использование сервисов').click();
                    wait();

                    tester.form.textfield().withFieldLabel('Логин *').fill('chenkova');
                    tester.form.textfield().withFieldLabel('Логин *').blur('chenkova');
                    wait();
                    tester.softphoneLoginValidationRequest().receiveResponse();
                    wait();

                    tester.form.textfield().withFieldLabel('Пароль *').fill('Qwerty123');
                    wait();
                    tester.form.textfield().withFieldLabel('Пароль *').blur();
                    wait();

                    tester.softphoneLoginValidationRequest().receiveResponse();
                    wait();
                });

                /*
                describe('Отмечаю свитч "Использование софтфона UIS".', function() {
                    beforeEach(function() {
                        tester.switchbox('Использование софтфона UIS').click()
                        wait();
                    });

                    it('Включаю скрытие номеров. Сохраняю изменения. Изменения сохранены.', function() {
                        tester.switchbox('Скрытие номеров').click()
                        wait();
                        tester.softphoneLoginValidationRequest().receiveResponse();
                        wait();

                        tester.button('Сохранить').click();
                        wait();
                        tester.softphoneLoginValidationRequest().receiveResponse();
                        wait();
                        tester.employeeChangeRequest().isNeedHideNumbers().receiveResponse();
                        wait();
                        tester.batchReloadRequest().receiveResponse();
                        wait();
                        tester.employeeUserAddingRequest().receiveResponse();
                        wait();
                        tester.userAppPermissionRequest().receiveResponse();
                    });
                    it('Включаю автоответ для звонков по клику. Сохраняю изменения. Изменения сохранены.', function() {
                        tester.form.checkbox().withBoxLabel('Звонки по клику').click();
                        wait();
                        tester.softphoneLoginValidationRequest().receiveResponse();
                        wait();

                        tester.button('Сохранить').click();
                        wait();
                        tester.softphoneLoginValidationRequest().receiveResponse();
                        wait();
                        tester.employeeChangeRequest().isClickToCallAutoAnswerEnabled().receiveResponse();
                        wait();
                        tester.batchReloadRequest().receiveResponse();
                        wait();
                        tester.employeeUserAddingRequest().receiveResponse();
                        wait();
                    });
                    it('Включаю автоответ для других звонков. Сохраняю изменения. Изменения сохранены.', function() {
                        tester.form.checkbox().withBoxLabel('Другие исходящие звонки').click();
                        wait();
                        tester.softphoneLoginValidationRequest().receiveResponse();
                        wait();

                        tester.button('Сохранить').click();
                        wait();
                        tester.softphoneLoginValidationRequest().receiveResponse();
                        wait();
                        tester.employeeChangeRequest().isOtherOutgoingCallsAutoAnswerEnabled().receiveResponse();
                        wait();
                        tester.batchReloadRequest().receiveResponse();
                        wait();
                        tester.employeeUserAddingRequest().receiveResponse();
                        wait();
                    });
                });
                */
                describe('Отмечаю свитчбокс "Чаты и заявки".', function() {
                    beforeEach(function() {
                        tester.switchbox('Чаты и заявки').click()
                        wait();
                        tester.softphoneLoginValidationRequest().receiveResponse();
                        wait();
                    });

                    describe(
                        'Включи свитчбокс "Доступ к чужим чатам". Открываю выпадающий список "Доступ к чатам на ' +
                        'уровне".',
                    function() {
                        beforeEach(function() {
                            tester.switchbox('Доступ к чужим чатам').click()
                            wait();
                            tester.softphoneLoginValidationRequest().receiveResponse();
                            wait();
                            tester.softphoneLoginValidationRequest().receiveResponse();
                            wait();

                            tester.combobox('Доступ к чатам на уровне').click();
                            wait();
                        });

                        xdescribe('Выбираю опцию "Группы".', function() {
                            beforeEach(function() {
                                tester.combobox('Доступ к чатам на уровне')
                                    .option('Группы')
                                    .click();
                                wait();

                                tester.softphoneLoginValidationRequest().receiveResponse();
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

                                    tester.softphoneLoginValidationRequest().receiveResponse();
                                    wait();

                                    tester.grid('Выберите группы').
                                        row().
                                        atIndex(3).
                                        column().
                                        first().
                                        checkbox().
                                        click();
                                    wait();

                                    tester.softphoneLoginValidationRequest().receiveResponse();
                                    wait();

                                    tester.grid('Выберите группы').
                                        closeButton.
                                        click();
                                    wait();
                                });

                                it('Нажимаю на кнопку "Сохранить". Данные сохранены.', function() {
                                    tester.button('Сохранить').click();
                                    wait();

                                    tester.employeeChangeRequest().
                                        someGroupsHaveAccessToOtherEmployeesChats().
                                        receiveResponse();

                                    wait();
                                    tester.batchReloadRequest().receiveResponse();
                                    wait();

                                    tester.employeeUserAddingRequest().
                                        operatorWorkplaceSelectAvailable().
                                        receiveResponse();

                                    wait();
                                    tester.userAppPermissionRequest().receiveResponse();
                                });
                                it('Группы выбраны.', function() {
                                    tester.tags('Список групп *').
                                        expectToHaveTextContent('Список групп * 123 amo_dzigit');
                                });
                            });
                            it('Список сотрудников скрыт.', function() {
                                tester.tags('Список сотрудников *').expectToBeHiddenOrNotExist();
                            });
                        });
                        describe('Выбираю опцию "Сотрудники".', function() {
                            beforeEach(function() {
                                tester.combobox('Доступ к чатам на уровне')
                                    .option('Сотрудники')
                                    .click();
                                wait();
                            });

                            xdescribe('Выбираю сотрудников из списка.', function() {
                                beforeEach(function() {
                                    tester.tags('Список сотрудников *').
                                        addButton.
                                        click();
                                    wait();

                                    tester.grid('Выберите сотрудников').
                                        row().
                                        atIndex(1).
                                        column().
                                        first().
                                        checkbox().
                                        click();
                                    wait();

                                    tester.softphoneLoginValidationRequest().receiveResponse();
                                    wait();
                                    tester.softphoneLoginValidationRequest().receiveResponse();
                                    wait();

                                    tester.grid('Выберите сотрудников').
                                        row().
                                        atIndex(3).
                                        column().
                                        first().
                                        checkbox().
                                        click();
                                    wait();

                                    tester.softphoneLoginValidationRequest().receiveResponse();
                                    wait();
                                    tester.softphoneLoginValidationRequest().receiveResponse();
                                    wait();

                                    tester.grid('Выберите сотрудников').
                                        closeButton.
                                        click();
                                    wait();
                                });

                                it('Нажимаю на кнопку "Сохранить". Данные сохранены.', function() {
                                    tester.button('Сохранить').click();
                                    wait();

                                    tester.employeeChangeRequest().
                                        someEmployeesHaveAccessToOtherEmployeesChats().
                                        receiveResponse();

                                    wait();
                                    tester.batchReloadRequest().receiveResponse();
                                    wait();

                                    tester.employeeUserAddingRequest().
                                        operatorWorkplaceSelectAvailable().
                                        receiveResponse();

                                    wait();
                                    tester.userAppPermissionRequest().receiveResponse();
                                });
                                it('Сотрудники выбраны.', function() {
                                    tester.tags('Список сотрудников *').
                                        expectToHaveTextContent('Список сотрудников * 00005 905');
                                });
                            });
                            it('Список групп скрыт.', function() {
                                tester.tags('Список групп *').expectToBeHiddenOrNotExist();
                            });
                        });
                    });
                    return;
                    it('Список "Доступ к чужим чатам" скрыт.', function() {
                        tester.switchbox('Доступ к чатам на уровне').expectToBeHiddenOrNotExist();
                    });
                });
                return;
                /*
                it('Нажимаю на кнопку "Сохранить". Сотруднику не предоставлены права на РМО.', function() {
                    tester.button('Сохранить').click();
                    wait();

                    tester.employeeChangeRequest().receiveResponse();
                    wait();
                    tester.batchReloadRequest().receiveResponse();
                    wait();
                    tester.employeeUserAddingRequest().receiveResponse();
                    wait();
                    tester.userAppPermissionRequest().receiveResponse();
                });
                */
            });
            return;
            it('Чужие чаты доступны для некоторых групп. Группы выбраны.', function() {
                employeeRequest.
                    someGroupsHaveAccessToOtherEmployeesChats().
                    receiveResponse();

                tester.sipLimitsRequest().receiveResponse();
                wait();

                tester.employeeUserRequest().
                    userExists().
                    receiveResponse();

                wait();

                tester.tab('Использование сервисов').click();
                wait();

                tester.softphoneLoginValidationRequest().receiveResponse();
                wait();
                tester.softphoneLoginValidationRequest().receiveResponse();
                wait();

                tester.tags('Список групп *').
                    expectToHaveTextContent('Список групп * 123 amo_dzigit');
            });
        });
        return;
        /*
        it('Скрытие номеров недоступно. Переключатель "Скрытие номеров" скрыт.', function() {
            tester = new ServicesAtsStaff(args);
            tester.setFeatureUnavailable();

            Comagic.Directory.load();
            tester.batchReloadRequest().receiveResponse();

            tester.actionIndex({
                recordId: 104561
            });

            tester.employeeRequest().receiveResponse();
            tester.sipLimitsRequest().receiveResponse();
            wait();
            tester.employeeUserRequest().receiveResponse();
            wait();

            tester.tab('Использование сервисов').click();
            wait();
            tester.switchbox('Использование софтфона UIS').click()
            wait();

            tester.switchbox('Скрытие номеров').expectToBeHiddenOrNotExist();
            wait();
        });
        */
    });
});
