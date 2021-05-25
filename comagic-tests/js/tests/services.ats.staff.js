tests.addTest(function(requestsManager, testersFactory, wait, utils) {
    it('Открываю страницу сотрудника. Включаю скрытие номеров. Сохраняю изменения. Изменения сохранены.', function() {
        var tester;

        tester && tester.destroy();
        tester = new ServicesAtsStaff(requestsManager, testersFactory, utils);

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
        tester.switchbox('Использование софтфона UIS').click()
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

        tester.switchbox('Скрытие номеров').click()
        wait();
        tester.softphoneLoginValidationRequest().receiveResponse();
        wait();

        tester.button('Сохранить').click();
        wait();
        tester.softphoneLoginValidationRequest().receiveResponse();
        wait();
        tester.employeeChangeRequest().receiveResponse();
        wait();
        tester.batchReloadRequest().receiveResponse();
        wait();
        tester.employeeUserAddingRequest().receiveResponse();
        wait();
    });
});
