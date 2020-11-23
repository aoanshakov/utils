tests.addTest(function(requestsManager, testersFactory, wait, utils) {
    describe('Открываю раздел "Общие настройки сайта".', function() {
        var tester;

        beforeEach(function() {
            if (tester) {
                tester.destroy();
            }

            tester = new SitemanagementSitesettings(requestsManager, testersFactory, utils);
            tester.extraDayDtVisitorCostRequest().receiveResponse();
            tester.siteSettingsRequest().receiveResponse();
        });

        describe('Открываю вкладку "Интеграция с сервисами". Открываю вкладку "Аналитические системы".', function() {
            beforeEach(function() {
                tester.tab('Интеграция с сервисами').click();

                tester.tab('Аналитические системы').mousedown();
                tester.integrationRecordsRequest().receiveResponse();
                tester.integrationRequest().receiveResponse();
                tester.uaIntegrationRequest().receiveResponse();
                tester.yandexMetrikaExtUnitsRequest().receiveResponse();
                tester.yandexMetrikaGoalsRequest().receiveResponse();
            });

            describe(
                'Фильтр Яндекс.Метрики не получен. Нажимаю на кнпоку "Настроить передачу обращений" в строке Яндекс.' +
                'Метрики. Заполняю форму.',
            function() {
                beforeEach(function() {
                    tester.yandexMetrikaCallsRequest().receiveResponse();

                    tester.setupYandexCallSendingButton.click();
                    wait();

                    tester.floatingForm.combobox().withFieldLabel('Вид обращения').clickArrow().
                        option('Первые качественные').click();
                    wait();

                    tester.button('Добавить фильтр').click();
                    wait();
                    tester.floatingForm.combobox().withPlaceholder('Параметр').clickArrow().option('Теги').click();
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

                    tester.button('Выбрать').click();
                    wait();

                    tester.button('Добавить фильтр').click();
                    wait();
                    tester.floatingForm.combobox().withPlaceholder('Параметр').clickArrow().
                        option('Теги').click();
                    wait();
                    tester.floatingForm.combobox().withPlaceholder('Условие').clickArrow().option('равно').click();
                    wait();
                    tester.floatingForm.combobox().withPlaceholder('Значение').clickArrow().
                        option('Не обработано').click();
                    wait();

                    tester.button('Выбрать').click();
                    wait();
                });

                xdescribe('Открываю меню условия.', function() {
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
                        });

                        it('Нажимаю на кнопку "Сохранить". Отправлен запрос обновления настроек.', function() {
                            tester.button('Сохранить').click();
                            wait();
                            tester.yandexMetrikaCallsUpdatingRequest().duplicateFirstGroup().receiveResponse();
                        });
                        it('Отображены выбранные теги.', function() {
                            tester.filterContainer.expectToHaveTextContent(
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
                            tester.button('Сохранить').click();
                            wait();
                            tester.yandexMetrikaCallsUpdatingRequest().removeFirstTag().receiveResponse();
                        });
                        it('Отображены выбранные теги.', function() {
                            tester.filterContainer.expectToHaveTextContent(
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
                            tester.button('Сохранить').click();
                            wait();
                            tester.yandexMetrikaCallsUpdatingRequest().removeFirstMarkGroup().receiveResponse();
                        });
                        it('Отображены выбранные теги.', function() {
                            tester.filterContainer.expectToHaveTextContent(
                                'Теги равно Не обработано ' +
                                'Применить'
                            );
                        });
                    });
                });
                it('Нажимаю на кнопку "Сохранить". Отправлен запрос обновления настроек.', function() {
                    tester.button('Сохранить').click();
                    wait();
                    tester.yandexMetrikaCallsUpdatingRequest().receiveResponse();
                });
                return;
                it('Отображены выбранные теги.', function() {
                    tester.filterContainer.expectToHaveTextContent(
                        'Теги равно В обработке или Нецелевой контакт ' +
                        'и ' +
                        'Теги равно Не обработано ' +

                        'Применить'
                    );
                });
            });
            return;
            it('Фильтр Яндекс.Метрики получен. Отображены выбранные теги.', function() {
                tester.yandexMetrikaCallsRequest().setFilters().receiveResponse();

                tester.setupYandexCallSendingButton.click();
                wait();

                tester.floatingForm.combobox().withFieldLabel('Вид обращения').expectToHaveValue('Первые качественные');

                tester.filterContainer.expectToHaveTextContent(
                    'Теги равно В обработке или Нецелевой контакт ' +
                    'и ' +
                    'Теги равно Не обработано ' +

                    'Применить'
                );
            });
        });
    });
});
