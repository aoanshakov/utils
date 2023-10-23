tests.addTest(function(args) {
    const {
        requestsManager,
        testersFactory,
        wait,
        utils,
    } = args;

    describe('Открываю страницу сотрудника.', function() {
        var tester;

        beforeEach(function() {
            tester && tester.destroy();
        });

        describe('Открываю вкладку "Использование сервисов".', function() {
            beforeEach(function() {
                tester = new ServicesAtsStaffContactEditPage(args);

                Comagic.Directory.load();
                tester.batchReloadRequest().receiveResponse();

                tester.actionIndex({
                    recordId: 104561
                });

                tester.employeesRequest().receiveResponse();
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

            xdescribe('Отмечаю свитч "Использование софтфона UIS".', function() {
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
            it(
                'Отмечаю свитчбокс "Чаты и заявки". Нажимаю на кнопку "Сохранить". Сотруднику предоставлены права на ' +
                'РМО.',
            function() {
                tester.switchbox('Чаты и заявки').click()
                wait();
                tester.softphoneLoginValidationRequest().receiveResponse();
                wait();
                        
                tester.button('Сохранить').click();
                wait();

                tester.employeeChangeRequest().receiveResponse();
                wait();
                tester.batchReloadRequest().receiveResponse();
                wait();

                tester.employeeUserAddingRequest().
                    operatorWorkplaceSelectAvailable().
                    receiveResponse();

                wait();
                tester.userAppPermissionRequest().receiveResponse();
            });
            return;
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
        });
        return;
        it('Скрытие номеров недоступно. Переключатель "Скрытие номеров" скрыт.', function() {
            tester = new ServicesAtsStaff(args);
            tester.setFeatureUnavailable();

            Comagic.Directory.load();
            tester.batchReloadRequest().receiveResponse();

            tester.actionIndex({
                recordId: 104561
            });

            tester.employeesRequest().receiveResponse();
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
    });
});
