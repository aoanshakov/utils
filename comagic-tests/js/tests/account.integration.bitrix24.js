tests.addTest(function(requestsManager, testersFactory, wait, utils, windowOpener) {
    describe('Открываю раздел "Аккаунт/Интеграция/Bitrix 24".', function() {
        var helper;

        beforeEach(function() {
            if (helper) {
                helper.destroy();
            }
        });
        
        describe('Открыта вкладка "Доступ к данным".', function() {
            beforeEach(function() {
                helper = new AccountIntegrationBitrix24(requestsManager, testersFactory, utils);

                Comagic.Directory.load();
                helper.batchReloadRequest().send();

                helper.actionIndex();
                helper.requestRegionsTreeDirectory().send();
                helper.requestBitrix24Data().send();
                helper.requestSalesFunnelComponentAvailability().send();
                helper.requestTariffs().send();
                helper.requestBitrix24Status().send();
                wait(10);
            });

            it('Открываю вкладку "Сквозная аналитика".', function() {
                helper.tabPanel.tab('Сквозная аналитика').click();
                wait(10);
                helper.requestSalesFunnels().send();

                helper.form.combobox().withFieldLabel('Из какого поля передавать категорию продаж').clickArrow().
                    option('Второе поле для категорий и причин').click();
                helper.form.combobox().withFieldLabel('Из какого поля передавать категорию продаж').
                    option('Четвертое поле для категорий и причин').click();
                helper.form.combobox().withFieldLabel('Из какого поля передавать категорию продаж').clickArrow();
                wait(10);

                helper.form.combobox().withFieldLabel('Из какого поля передавать причину отказа').clickArrow().
                    option('Первое поле для категорий и причин').click();
                helper.form.combobox().withFieldLabel('Из какого поля передавать причину отказа').
                    option('Пятое поле для категорий и причин').click();
                helper.form.combobox().withFieldLabel('Из какого поля передавать причину отказа').clickArrow();
                wait(10);

                helper.saveButton.click();
                wait(10);

                helper.requestBitrix24DataSave().setSaleCategoryUserFieldValueIds().setLossReasonUserFieldValueId().
                    send();
                helper.requestTariffs().send();
            });
            return;
            it('Открываю вкладку "Чаты и заявки".', function() {
                helper.tabPanel.tab('Чаты и заявки').click();
                wait(10);
            });
            it('Открываю вкладку "Дополнительные поля".', function() {
                helper.tabPanel.tab('Дополнительные поля').click();
                wait(10);
                helper.requestAdditionalFields().send();
                wait(10);
                helper.requestUserFieldDirectory().send();
                wait(10);
            });
            it('Открываю вкладку "Воронки продаж".', function() {
                helper.tabPanel.tab('Воронки продаж').click();
                wait(10);
                helper.requestSalesFunnels().send();
                wait(10);
            });
            it(
                'Открываю вкладку "Ответственные". Выбираю другого ответственного. Нажимаю на кнопку "Сохранить".',
            function() {
                helper.tabPanel.tab('Ответственные').click();
                helper.requestResponsibleUsers().send();
                wait();

                helper.form.combobox().withValue('Иванов Иван Иванович').clickArrow().
                    option('Андреев Андрей Андреевич').click();
                wait(10);

                helper.saveButton.click();
                wait(10);
                helper.requestResponsibleUsersSaving().send();
                wait(10);
                helper.requestResponsibleUsers().send();
                wait(10);
            });
        });
        return;
        it(
            'В аккаунте Битрикс24 мало сотрудников. Открываю вкладку "Ответственные". Нажимаю на кнопку "Добавить ' +
            'сотрудника". В выпадающем списке сотрудников нет скроллера.',
        function() {
            helper = new AccountIntegrationBitrix24(requestsManager, testersFactory, utils);

            Comagic.Directory.load();
            helper.batchReloadRequest().addManyUsers().send();
            
            helper.actionIndex();
            helper.requestRegionsTreeDirectory().send();
            helper.requestBitrix24Data().send();
            helper.requestSalesFunnelComponentAvailability().send();
            helper.requestSalesFunnelComponentTariffInfo().send();
            helper.requestBitrix24Status().send();

            helper.tabPanel.tab('Ответственные').click();
            helper.requestResponsibleUsers().send();
            wait();

            helper.addEmployeeButton.click();
        });
        it('В аккаунте Битрикс24 много сотрудников. В выпадающем списке сотрудников есть скроллер.', function() {
            helper = new AccountIntegrationBitrix24(requestsManager, testersFactory, utils);

            Comagic.Directory.load();
            helper.batchReloadRequest().addManyUsers().send();
            
            helper.actionIndex();
            helper.requestRegionsTreeDirectory().send();
            helper.requestBitrix24Data().send();
            helper.requestSalesFunnelComponentAvailability().send();
            helper.requestSalesFunnelComponentTariffInfo().send();
            helper.requestBitrix24Status().send();

            helper.tabPanel.tab('Ответственные').click();
            helper.requestResponsibleUsers().send();
            wait();

            helper.addEmployeeButton.click();
        });
    });
});
