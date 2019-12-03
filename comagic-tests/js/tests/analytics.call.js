tests.addTest(function(requestsManager, testersFactory, wait, utils) {
    describe((
        'Открываю разел "Отчеты/Обзор". Нажимаю на ссылку в колонке "Сайт" строки таблицы. Открылся раздел "Отчеты/' +
        'Список обращений/Звонки".'
    ), function() {
        var helper;

        beforeEach(function() {
            if (helper) {
                helper.destroy();
            }

            helper = new AnalyticsCall(requestsManager, testersFactory, utils);

            helper.requestGoals().send();

            Comagic.Directory.load();
            helper.batchReloadRequest().send();

            helper.setCameFromReview().actionIndex();

            helper.requestCallColumns().send();
            helper.requestCallSettings().send();
            helper.requestCallReferenceData().send();
            helper.requestSecondDimention().send();
            helper.requestCallSettings().setNotDefault().send();
            helper.requestGridData().checkFilterAtServer().setCameFromReview().send();
            helper.requestCallFilters().send();
            helper.requestCallChartData().setCameFromReview().send();
            wait();
        });

        it('Отображен фильтр перехода из раздела обзора.', function() {
            helper.reviewItemFilterDescription.expectToBeVisible();
        });
        describe((
            'Нажимаю на кнопку "Добавить фильтр". Заполняю поля формы всплывающего окна, чтобы добавить фильтр по ' +
            'рекламной кампании. Нажимаю на кнопку "Выбрать". Нажимаю на кнопку "Применить". Нажимаю на кнопку ' +
            '"Настроить столбцы".'
        ), function() {
            beforeEach(function() {
                helper.addFilterButton.click();
                wait();

                helper.floatingForm.combobox().withPlaceholder('Параметр').clickArrow().option('Рекламная кампания').
                    click();
                wait();

                helper.requestParameterHints().send();
                wait();

                helper.floatingForm.combobox().withPlaceholder('Условие').clickArrow().option('не равно').click();
                wait();

                helper.floatingForm.combobox().withPlaceholder('Значение').clickArrow().
                    option('Посетители без рекламной кампании').click();
                wait();

                helper.chooseButton.click();
                wait();

                helper.applyFilterButton.click();
                helper.requestGridData().checkFilterAtServer().setCameFromReview().setNotWithoutAdvertisingCampaign().
                    send();
                helper.requestCallChartData().setCameFromReview().setNotWithoutAdvertisingCampaign().send();
                wait();

                helper.setupColumnsButton.click();
                helper.requestCallSettings().setCallsColumns().send();
                wait();
            });

            it((
                'Нажимаю на кнопку скрывающую колонку "Рекламная кампания". Нажимаю на кнопку "Сохранить". Фильтр по ' +
                'рекламной кампании скрыт.'
            ), function() {
                helper.advertisingCampaignExcludeButton.click();
                wait();

                helper.saveButton.click();
                wait();

                helper.requestSettingsUpdate().setOnlyEmployeeName().send();
                helper.requestCallReferenceData().send();
                helper.requestCallSettings().setNotDefault().send();
                helper.requestGridData().setCameFromReview().setNotWithoutAdvertisingCampaign().setOnlyEmployeeName().
                    send();
                helper.requestCallFilters().send();
                helper.requestCallChartData().setCameFromReview().setNotWithoutAdvertisingCampaign().send();
                wait();

                helper.advertisingCampaignFilterDescription.expectToBeHiddenOrNotExist();
            });
            it((
                'Нажимаю на кнопку скрывающую колонку "Сотрудник". Нажимаю на кнопку "Сохранить". Фильтр по ' +
                'рекламной кампании видим.'
            ), function() {
                helper.employeeNameExcludeButton.click();
                wait();

                helper.saveButton.click();
                wait();

                helper.requestSettingsUpdate().setOnlyAdvertisingCampaign().send();
                helper.requestCallReferenceData().send();
                helper.requestCallSettings().setNotDefault().send();
                helper.requestGridData().setCameFromReview().setNotWithoutAdvertisingCampaign().
                    setOnlyAdvertisingCampaign().send();
                helper.requestCallFilters().send();
                helper.requestCallChartData().setCameFromReview().setNotWithoutAdvertisingCampaign().send();
                wait();

                helper.advertisingCampaignFilterDescription.expectToBeVisible();
            });
        });
        it((
            'Нажимаю на иконку с календарем. Изменяю период. Нажмаю на кнопку "Применить". Фильтр перехода из ' +
            'раздела обзора видим.'
        ), function() {
            helper.calendarButton.click();
            wait();

            helper.augustThirteenthButton.click();
            wait();

            helper.applyButton.click();
            wait();

            helper.requestGridData().changeStartDate().send();
            helper.requestCallChartData().changeStartDate().send();
            wait();

            helper.reviewItemFilterDescription.expectToBeVisible();
        });
    });
});
