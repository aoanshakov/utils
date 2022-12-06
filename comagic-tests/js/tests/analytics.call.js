tests.addTest(function({
    requestsManager,
    testersFactory,
    wait,
    utils
}) {
    describe((
        'Открываю разел "Отчеты/Обзор". Нажимаю на ссылку в колонке "Сайт" строки таблицы. Открылся раздел "Отчеты/' +
        'Список обращений/Звонки".'
    ), function() {
        var tester;

        beforeEach(function() {
            if (tester) {
                tester.destroy();
            }

            tester = new AnalyticsCall({
                requestsManager,
                testersFactory,
                utils
            });

            tester.requestGoals().send();

            Comagic.Directory.load();
            tester.batchReloadRequest().send();

            tester.setCameFromReview().actionIndex();

            tester.requestCallColumns().send();
            tester.requestCallSettings().send();
            tester.requestCallReferenceData().send();
            tester.requestSecondDimention().send();
            tester.requestCallSettings().setNotDefault().send();
            tester.eventTrackingRequest().receiveResponse();
            tester.requestGridData().checkFilterAtServer().setCameFromReview().send();
            tester.requestCallFilters().send();
            tester.requestCallChartData().setCameFromReview().send();
            tester.eventTrackingRequest().setLoad().receiveResponse();
            wait();
            tester.eventTrackingRequest().setGridRendered().receiveResponse();
            tester.tagsRequest().receiveResponse();
        });

        describe('Нажимаю на кнопку "Добавить фильтр".', function() {
            beforeEach(function() {
                tester.addFilterButton.click();
                wait();
            });

            describe(
                'Заполняю поля формы всплывающего окна, чтобы добавить фильтр по рекламной кампании. Нажимаю на ' +
                'кнопку "Выбрать". Нажимаю на кнопку "Применить". Нажимаю на кнопку "Настроить столбцы".',
            function() {
                beforeEach(function() {
                    tester.floatingForm.combobox().withPlaceholder('Параметр').clickArrow().
                        option('Рекламная кампания').click();
                    wait();

                    tester.requestParameterHints().send();
                    wait();

                    tester.floatingForm.combobox().withPlaceholder('Условие').clickArrow().option('не равно').click();
                    wait();

                    tester.floatingForm.combobox().withPlaceholder('Значение').clickArrow().
                        option('Посетители без рекламной кампании').click();
                    wait();

                    tester.chooseButton.click();
                    wait();

                    tester.applyFilterButton.click();
                    tester.eventTrackingRequest().receiveResponse();
                    tester.requestGridData().checkFilterAtServer().setCameFromReview().
                        setNotWithoutAdvertisingCampaign().send();
                    tester.requestCallChartData().setCameFromReview().setNotWithoutAdvertisingCampaign().send();
                    wait();
                    tester.eventTrackingRequest().setLoad().receiveResponse();
                    tester.eventTrackingRequest().setGridRendered().receiveResponse();
                    tester.tagsRequest().receiveResponse();

                    tester.setupColumnsButton.click();
                    tester.requestCallSettings().setCallsColumns().send();
                    wait();
                });

                it((
                    'Нажимаю на кнопку скрывающую колонку "Рекламная кампания". Нажимаю на кнопку "Сохранить". ' +
                    'Фильтр по рекламной кампании скрыт.'
                ), function() {
                    tester.advertisingCampaignExcludeButton.click();
                    wait();

                    tester.saveButton.click();
                    wait();

                    tester.requestSettingsUpdate().setOnlyEmployeeName().send();
                    tester.requestCallReferenceData().send();
                    tester.requestCallSettings().setNotDefault().send();
                    tester.eventTrackingRequest().receiveResponse();
                    tester.requestGridData().setCameFromReview().setNotWithoutAdvertisingCampaign().
                        setOnlyEmployeeName().send();
                    tester.requestCallFilters().send();
                    tester.requestCallChartData().setCameFromReview().setNotWithoutAdvertisingCampaign().send();
                    wait();
                    tester.eventTrackingRequest().setLoad().receiveResponse();
                    tester.eventTrackingRequest().setGridRendered().receiveResponse();
                    tester.tagsRequest().receiveResponse();

                    tester.advertisingCampaignFilterDescription.expectToBeHiddenOrNotExist();
                });
                it((
                    'Нажимаю на кнопку скрывающую колонку "Сотрудник". Нажимаю на кнопку "Сохранить". Фильтр по ' +
                    'рекламной кампании видим.'
                ), function() {
                    tester.employeeNameExcludeButton.click();
                    wait();

                    tester.saveButton.click();
                    wait();

                    tester.requestSettingsUpdate().setOnlyAdvertisingCampaign().send();
                    tester.requestCallReferenceData().send();
                    tester.requestCallSettings().setNotDefault().send();
                    tester.eventTrackingRequest().receiveResponse();
                    tester.requestGridData().setCameFromReview().setNotWithoutAdvertisingCampaign().
                        setOnlyAdvertisingCampaign().send();
                    tester.requestCallFilters().send();
                    tester.requestCallChartData().setCameFromReview().setNotWithoutAdvertisingCampaign().send();
                    wait();
                    tester.eventTrackingRequest().setLoad().receiveResponse();
                    tester.eventTrackingRequest().setGridRendered().receiveResponse();
                    tester.tagsRequest().receiveResponse();

                    tester.advertisingCampaignFilterDescription.expectToBeVisible();
                });
            });
            describe(
                'Заполняю поля формы всплывающего окна, чтобы добавить фильтр по тегам. Нажимаю на кнопку "Выбрать".',
            function() {
                beforeEach(function() {
                    tester.floatingForm.combobox().withPlaceholder('Параметр').clickArrow().
                        option('Теги').click();
                    wait();
                    tester.floatingForm.combobox().withPlaceholder('Условие').clickArrow().option('равно').click();
                    wait();
                    tester.floatingForm.combobox().withPlaceholder('Значение').clickArrow().
                        option('В обработке').click();
                    wait();
                        
                    tester.button('Значение').click();
                    wait();
                    tester.floatingForm.combobox().withValue('').clickArrow().option('Нецелевой контакт').click();
                    wait();

                    tester.chooseButton.click();
                    wait();

                    tester.addFilterButton.click();
                    wait();
                    tester.floatingForm.combobox().withPlaceholder('Параметр').clickArrow().
                        option('Теги').click();
                    wait();
                    tester.floatingForm.combobox().withPlaceholder('Условие').clickArrow().option('равно').click();
                    wait();
                    tester.floatingForm.combobox().withPlaceholder('Значение').clickArrow().
                        option('Не обработано').click();
                    wait();

                    tester.chooseButton.click();
                    wait();
                });

                describe('Открываю меню условия.', function() {
                    beforeEach(function() {
                        tester.conditionMenu('Теги равно В обработке или Нецелевой контакт').click();
                        wait();
                    });

                    describe(
                        'Нажимаю на пункт меню "Добавить похожий". Нажимаю на кнпоку удаления тега. Нажимаю на ' +
                        'кнопку "Изменить".',
                    function() {
                        beforeEach(function() {
                            tester.menuItem('Добавить похожий').click();
                            wait();
                            tester.button('Изменить').click();
                            wait();
                        });

                        it('Нажимаю на кнопку "Сохранить". Отправлен запрос обновления настроек.', function() {
                            tester.applyFilterButton.click();
                            tester.eventTrackingRequest().receiveResponse();
                            
                            tester.requestGridData().
                                checkFilterAtServer().
                                setCameFromReview().
                                setSecondSetOfTags().
                                send();

                            tester.requestCallChartData().setCameFromReview().send();
                            wait();
                            tester.eventTrackingRequest().setLoad().receiveResponse();
                            tester.eventTrackingRequest().setGridRendered().receiveResponse();
                            tester.tagsRequest().receiveResponse();
                        });
                        it('Отображены выбранные теги.', function() {
                            tester.filterContainer.expectToHaveTextContent(
                                'Переход из отчёта Обзорный отчет ' +
                                'и ' +
                                'Теги равно В обработке или Нецелевой контакт ' +
                                'и ' +
                                'Теги равно Не обработано ' +
                                'и ' +
                                'Теги равно В обработке или Нецелевой контакт ' +

                                'Применить'
                            );
                        });
                    });
                    describe(
                        'Нажимаю на пункт меню "Редактировать". Нажимаю на кнпоку удаления тега. Нажимаю на кнопку ' +
                        '"Изменить".',
                    function() {
                        beforeEach(function() {
                            tester.menuItem('Редактировать').click();
                            wait();
                            tester.clearButton().first().click();
                            wait();
                            tester.button('Изменить').click();
                            wait();
                       });

                        it('Нажимаю на кнопку "Сохранить". Отправлен запрос обновления настроек.', function() {
                            tester.applyFilterButton.click();
                            tester.eventTrackingRequest().receiveResponse();
                            
                            tester.requestGridData().
                                checkFilterAtServer().
                                setCameFromReview().
                                setThirdSetOfTags().
                                send();

                            tester.requestCallChartData().setCameFromReview().send();
                            wait();
                            tester.eventTrackingRequest().setLoad().receiveResponse();
                            tester.eventTrackingRequest().setGridRendered().receiveResponse();
                            tester.tagsRequest().receiveResponse();
                        });
                        it('Отображены выбранные теги.', function() {
                            tester.filterContainer.expectToHaveTextContent(
                                'Переход из отчёта Обзорный отчет ' +
                                'и ' +
                                'Теги равно Нецелевой контакт ' +
                                'и ' +
                                'Теги равно Не обработано ' +

                                'Применить'
                            );
                        });
                    });
                    describe('Нажимаю на пункт меню "Удалить".', function() {
                        beforeEach(function() {
                            tester.menuItem('Удалить').click();
                            wait();
                        });

                        it('Нажимаю на кнопку "Сохранить". Отправлен запрос обновления настроек.', function() {
                            tester.applyFilterButton.click();
                            tester.eventTrackingRequest().receiveResponse();
                            
                            tester.requestGridData().
                                checkFilterAtServer().
                                setCameFromReview().
                                setFourthSetOfTags().
                                send();

                            tester.requestCallChartData().setCameFromReview().send();
                            wait();
                            tester.eventTrackingRequest().setLoad().receiveResponse();
                            tester.eventTrackingRequest().setGridRendered().receiveResponse();
                            tester.tagsRequest().receiveResponse();
                        });
                        it('Отображены выбранные теги.', function() {
                            tester.filterContainer.expectToHaveTextContent(
                                'Переход из отчёта Обзорный отчет ' +
                                'и ' +
                                'Теги равно Не обработано ' +
                                'Применить'
                            );
                        });
                    });
                });
                it('Нажимаю на кнопку "Применить". Отправлен запрос данных для таблицы с фильтрацией.', function() {
                    tester.applyFilterButton.click();
                    tester.eventTrackingRequest().receiveResponse();
                    tester.requestGridData().checkFilterAtServer().setCameFromReview().setTags().send();
                    tester.requestCallChartData().setCameFromReview().send();
                    wait();
                    tester.eventTrackingRequest().setLoad().receiveResponse();
                    tester.eventTrackingRequest().setGridRendered().receiveResponse();
                    tester.tagsRequest().receiveResponse();
                });
                it('Отображены выбранные теги.', function() {
                    tester.filterContainer.expectToHaveTextContent(
                        'Переход из отчёта Обзорный отчет ' +
                        'и ' +
                        'Теги равно В обработке или Нецелевой контакт ' +
                        'и ' +
                        'Теги равно Не обработано ' +

                        'Применить'
                    );
                });
            });
        });
        it(
            'Нажимаю на кнопку сохранения фильтра. Ввожу название фильтра. Нажимаю на кнпоку "Сохранить". Отправлен ' +
            'запрос сохранения фильтра.',
        function() {
            tester.saveFilterButton.click();
            wait();

            tester.floatingForm.textfield().withPlaceholder('Название фильтра').fill('Некий фильтр');
            wait();

            tester.saveButton.click();
            wait();
            tester.filtersUpdatingRequest().receiveResponse();
            tester.eventTrackingRequest().receiveResponse();
            tester.requestGridData().checkFilterAtServer().setCameFromReview().send();
            tester.requestCallChartData().setCameFromReview().send();
            wait();
            tester.eventTrackingRequest().setLoad().receiveResponse();
            tester.eventTrackingRequest().setGridRendered().receiveResponse();
            tester.tagsRequest().receiveResponse();
        });
        it(
            'Нажимаю на кнопку удаления условий. Условия не отображены. Отправлен запрос данных для таблицы без ' +
            'фильтрации.',
        function() {
            tester.cancelButton.click();
            tester.eventTrackingRequest().receiveResponse();
            tester.requestGridData().checkFilterAtServer().setNoFilter().send();
            tester.requestCallChartData().setNoFilter().send();
            wait();
            tester.eventTrackingRequest().setLoad().receiveResponse();
            tester.eventTrackingRequest().setGridRendered().receiveResponse();
            tester.tagsRequest().receiveResponse();

            tester.filterContainer.expectToBeHiddenOrNotExist();
        });
        it('Нажимаю на кнпоку экспорта.', function() {
            tester.exportBtn.click();
            tester.menuItem('CSV-файл').click();
        });
        it('Отображен фильтр перехода из раздела обзора. Кнопка "Применить" заблокирована.', function() {
            tester.anchor('Ивановский Иваний Иваниевич').
                expectHrefToHavePath('https://comaigc.amocrm.ru/contacts/detail/42574735');

            tester.reviewItemFilterDescription.expectToBeVisible();

            tester.button('Применить').expectToBeDisabled();

            tester.filterContainer.expectToHaveTextContent(
                'Переход из отчёта Обзорный отчет ' +
                'Применить'
            );
        });
    });
});
