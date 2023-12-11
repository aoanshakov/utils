tests.addTest(function(params) {
    const {
        requestsManager,
        testersFactory,
        wait,
        utils,
        windowOpener,
        postMessagesTester,
    } = params;

    describe('Окно', function() {
        var tester;

        beforeEach(function() {
            tester && tester.destroy();
        });

        describe('не было открыто в iframe. Открываю раздел "Общие настройки сайта" ', function() {
            beforeEach(function() {
                tester = new SitemanagementSitesettings(params);
            });

            describe('из меню. Открываю вкладку "Интеграция с сервисами".', function() {
                let integrationRecordsRequest;

                beforeEach(function() {
                    tester.actionIndex();

                    tester.extraDayDtVisitorCostRequest().receiveResponse();
                    tester.siteSettingsRequest().receiveResponse();

                    tester.tab('Интеграция с сервисами').click();
                    integrationRecordsRequest = tester.integrationRecordsRequest().expectToBeSent();
                });

                describe('Интеграция с Facebook подключена.', function() {
                    beforeEach(function() {
                        integrationRecordsRequest.receiveResponse();
                    });

                    describe('Открываю вкладку "Аналитические системы".', function() {
                        beforeEach(function() {
                            tester.tab('Аналитические системы').mousedown();

                            tester.integrationRequest().receiveResponse();
                            tester.uaIntegrationRequest().receiveResponse();
                            tester.yandexMetrikaExtUnitsRequest().receiveResponse();
                            tester.yandexMetrikaGoalsRequest().receiveResponse();
                        });

                        describe(
                            'Фильтр Яндекс.Метрики не получен. Нажимаю на кнпоку "Настроить передачу обращений" в ' +
                            'строке Яндекс.Метрики. Выбираю условию "равно".',
                        function() {
                            beforeEach(function() {
                                tester.yandexMetrikaCallsRequest().receiveResponse();
                                tester.button('Настроить передачу обращений и сделок').click();

                                tester.floatingForm.
                                    combobox().
                                    withFieldLabel('Вид обращения').
                                    clickArrow().
                                    option('Первые качественные').
                                    click();

                                wait();

                                tester.addButton.click();
                                wait();

                                tester.floatingForm.
                                    combobox().
                                    withPlaceholder('Условие').
                                    clickArrow().
                                    option('равно').
                                    click();

                                wait();
                            });

                            describe('Заполняю форму.', function() {
                                beforeEach(function() {
                                    tester.floatingForm.combobox().withPlaceholder('Значение').clickArrow().
                                        option('В обработке').click();
                                    wait();

                                    tester.button('Значение').click();
                                    wait();

                                    tester.floatingForm.combobox().
                                        withValue('').
                                        clickArrow().
                                        option('Нецелевой контакт').
                                        click();

                                    wait();

                                    tester.button('Выбрать').click();
                                    wait();

                                    tester.addButton.click();
                                    wait();

                                    tester.floatingForm.combobox().
                                        withPlaceholder('Условие').
                                        clickArrow().
                                        option('не равно').
                                        click();

                                    wait();

                                    tester.floatingForm.combobox().
                                        withPlaceholder('Значение').
                                        clickArrow().
                                        option('Не обработано').
                                        click();

                                    wait();

                                    tester.button('Выбрать').click();
                                    wait();
                                });

                                describe('Открываю меню условия.', function() {
                                    beforeEach(function() {
                                        tester.conditionMenu('Теги равно В обработке или Нецелевой контакт').click();
                                        wait();
                                    });

                                    describe(
                                        'Нажимаю на пункт меню "Добавить похожий". Нажимаю на кнпоку удаления тега. ' +
                                        'Нажимаю на кнопку "Изменить".',
                                    function() {
                                        beforeEach(function() {
                                            tester.menu.item('Добавить похожий').click();
                                            tester.button('Выбрать').click();
                                        });

                                        it(
                                            'Нажимаю на кнопку "Сохранить". Отправлен запрос обновления настроек.',
                                        function() {
                                            tester.button('Сохранить').click();

                                            tester.yandexMetrikaCallsUpdatingRequest().
                                                duplicateFirstGroup().
                                                receiveResponse();
                                        });
                                        it('Отображены выбранные теги.', function() {
                                            tester.filterContainer.expectToHaveTextContent(
                                                'Теги равно В обработке или Нецелевой контакт ' +
                                                'и ' +
                                                'Теги не равно Не обработано ' +
                                                'и ' +
                                                'Теги равно В обработке или Нецелевой контакт ' +

                                                'Применить'
                                            );
                                        });
                                    });
                                    describe(
                                        'Нажимаю на пункт меню "Редактировать". Нажимаю на кнпоку удаления тега. ' +
                                        'Нажимаю на кнопку "Изменить".',
                                    function() {
                                        beforeEach(function() {
                                            tester.menuItem('Редактировать').click();
                                            wait();
                                            tester.clearButton().first().click();
                                            wait();
                                            tester.button('Изменить').click();
                                            wait();
                                       });

                                        it(
                                            'Нажимаю на кнопку "Сохранить". Отправлен запрос обновления настроек.',
                                        function() {
                                            tester.button('Сохранить').click();
                                            wait();

                                            tester.yandexMetrikaCallsUpdatingRequest().
                                                removeFirstTag().
                                                receiveResponse();
                                        });
                                        it('Отображены выбранные теги.', function() {
                                            tester.filterContainer.expectToHaveTextContent(
                                                'Теги равно Нецелевой контакт ' +
                                                'и ' +
                                                'Теги не равно Не обработано ' +

                                                'Применить'
                                            );
                                        });
                                    });
                                    describe('Нажимаю на пункт меню "Удалить".', function() {
                                        beforeEach(function() {
                                            tester.menuItem('Удалить').click();
                                            wait();
                                        });

                                        it(
                                            'Нажимаю на кнопку "Сохранить". Отправлен запрос обновления настроек.',
                                        function() {
                                            tester.button('Сохранить').click();
                                            wait();

                                            tester.yandexMetrikaCallsUpdatingRequest().
                                                removeFirstMarkGroup().
                                                receiveResponse();
                                        });
                                        it('Отображены выбранные теги.', function() {
                                            tester.filterContainer.expectToHaveTextContent(
                                                'Теги не равно Не обработано ' +
                                                'Применить'
                                            );
                                        });
                                    });
                                });
                                it(
                                    'Снимаю отметку с чекбокса "Включить передачу звонков в Яндекс.Метрику".',
                                function() {
                                    tester.floatingForm.checkbox().
                                        withBoxLabel('Включить передачу звонков в Яндекс.Метрику').
                                        click();

                                    wait();

                                    tester.floatingForm.combobox().withFieldLabel('Вид обращения').expectToBeDisabled();

                                    tester.addButton.click();
                                    wait();

                                    tester.floatingForm.combobox().
                                        withPlaceholder('Значение').
                                        expectToBeHiddenOrNotExist();

                                    tester.conditionMenu('Теги равно В обработке или Нецелевой контакт').click();
                                    wait();

                                    tester.menuItem('Добавить похожий').expectToBeHiddenOrNotExist();
                                });
                                it('Нажимаю на кнопку "Сохранить". Отправлен запрос обновления настроек.', function() {
                                    tester.button('Сохранить').click();
                                    wait();
                                    tester.yandexMetrikaCallsUpdatingRequest().receiveResponse();
                                });
                                it('Отображены выбранные теги.', function() {
                                    tester.filterContainer.expectToHaveTextContent(
                                        'Теги равно В обработке или Нецелевой контакт ' +
                                        'и ' +
                                        'Теги не равно Не обработано ' +

                                        'Применить'
                                    );
                            
                                });
                            });
                            it('Выбираю длинный тег.', function() {
                                tester.floatingForm.combobox().withPlaceholder('Значение').clickArrow().
                                    option('Кобыла и трупоглазые жабы искали цезию нашли поздно утром свистящего хна').
                                    click();

                                wait();

                                tester.button('Выбрать').click();
                                wait();

                                tester.addButton.click();
                                wait();

                                tester.floatingForm.combobox().
                                    withPlaceholder('Условие').
                                    clickArrow().
                                    option('равно').
                                    click();

                                wait();

                                tester.floatingForm.combobox().
                                    withPlaceholder('Значение').
                                    clickArrow().
                                    option('В обработке').
                                    click();

                                wait();

                                tester.button('Выбрать').click();
                                wait();
                            });
                        });
                        it('Фильтр Яндекс.Метрики получен. Отображены выбранные теги.', function() {
                            tester.yandexMetrikaCallsRequest().setFilters().receiveResponse();
                            tester.button('Настроить передачу обращений и сделок').click();

                            tester.floatingForm.
                                combobox().
                                withFieldLabel('Вид обращения').
                                expectToHaveValue('Первые качественные');

                            tester.filterContainer.expectToHaveTextContent(
                                'Теги равно В обработке или Нецелевой контакт ' +
                                'и ' +
                                'Теги не равно Не обработано ' +

                                'Применить'
                            );
                        });
                        it('Фильтр тегов некорректен. Отображены выбранные теги.', function() {
                            tester.yandexMetrikaCallsRequest().
                                setInvalidMarkGroupsFilter().
                                receiveResponse();

                            tester.button('Настроить передачу обращений и сделок').click();
                            tester.filterContainer.expectToHaveTextContent('Применить');
                        });
                    });
                    it('Нажимаю на кнопку "Настроить интеграцию".', function() {
                        tester.button('Настроить интеграцию').click();
                        tester.extFbRequest().receiveResponse();

                        tester.checkbox.click();
                        tester.button('Сохранить').click();

                        tester.autoIntegrationSettingsUpdateRequest().receiveResponse();
                        tester.leadsUpdateRequest().receiveResponse();

                        tester.authUrlRequest().
                            vkAds().
                            vkGroupChecked().
                            receiveResponse();

                        tester.batchReloadRequest().receiveResponse();
                        tester.integrationRecordsRequest().receiveResponse();

                        tester.openedUrl.expectToBe('https://somedomain.com');
                        windowOpener.expectNoWindowToBeOpened();
                    });
                });
                it(
                    'В интеграции с Facebook истек токен авторизации. Нажимаю на кнопку "Переподключить". Страница ' +
                    'авторизации открыта в том же окне.',
                function() {
                    integrationRecordsRequest.
                        tokenExpired().
                        receiveResponse();

                    tester.button('Переподключить').click();

                    tester.authUrlRequest().
                        vkAds().
                        receiveResponse();

                    tester.openedUrl.expectToBe('https://somedomain.com');
                    windowOpener.expectNoWindowToBeOpened();
                });
            });
            it(
                'из раздела событий. Яндекс.Метрика не подключена. Нажимаю на кнопку "Подключить сервис". Страница ' +
                'авторизации открыта в том же окне.',
            function() {
                tester.actionIndex({}, {
                    tabIndex: 4,
                    integrationList: 'analyticsList',
                });

                tester.extraDayDtVisitorCostRequest().receiveResponse();
                tester.siteSettingsRequest().receiveResponse();
                tester.integrationRequest().noSiteAnalytics().receiveResponse();
                tester.uaIntegrationRequest().receiveResponse();

                tester.integration('Яндекс.Метрика').
                    button('Подключить сервис').
                    click();

                tester.authUrlRequest().receiveResponse();
                tester.ymSiteIntegrationRequest().receiveResponse();

                tester.openedUrl.expectToBe('https://somedomain.com');
                windowOpener.expectNoWindowToBeOpened();
            });
        });
        describe('было открыто в iframe.', function() {
            beforeEach(function() {
                window.isIFrame = true;
                tester = new SitemanagementSitesettings(params);
            });

            it(
                'Открываю вкладку рекламы. Нажимаю на кнопку "Переподключить". Страница авторизации открыта в том же ' +
                'окне.',
            function() {
                tester.actionIndex({}, {
                    tabIndex: 4,
                    integrationList: 'advertisementList',
                });

                tester.extraDayDtVisitorCostRequest().receiveResponse();
                tester.siteSettingsRequest().receiveResponse();

                tester.integrationRecordsRequest().
                    tokenExpired().
                    receiveResponse();

                postMessagesTester.expectMessageToBeSent('onAdvertismentListStoreLoad');

                tester.button('Переподключить').click();

                tester.authUrlRequest().
                    vkAds().
                    isIframe().
                    receiveResponse();

                tester.openedUrl.expectNone();
                windowOpener.expectToHavePath('https://somedomain.com');
            });
            it(
                'Открываю раздел "Общие настройки сайта" из раздела событий. Яндекс.Метрика не подключена. Нажимаю ' +
                'на кнопку "Подключить сервис". В новом окне открыта страница авторизаци.',
            function() {
                tester.actionIndex({}, {
                    tabIndex: 4,
                    integrationList: 'analyticsList',
                });

                tester.extraDayDtVisitorCostRequest().receiveResponse();
                tester.siteSettingsRequest().receiveResponse();
                tester.integrationRequest().noSiteAnalytics().receiveResponse();
                tester.uaIntegrationRequest().receiveResponse();

                tester.integration('Яндекс.Метрика').
                    button('Подключить сервис').
                    click();

                tester.authUrlRequest().
                    isIframe().
                    receiveResponse();

                tester.ymSiteIntegrationRequest().receiveResponse();

                tester.openedUrl.expectNone();
                windowOpener.expectToHavePath('https://somedomain.com');
            });
        });
    });
});
