tests.addTest(function (options) {
    var webSocketLogger = options.webSocketLogger,
        timeoutLogger = options.timeoutLogger,
        AdminFrontendTester = options.AdminFrontendTester,
        spendTime = options.spendTime,
        setNow = options.setNow,
        ajax = options.ajax,
        utils = options.utils,
        webSockets = options.webSockets,
        audioDecodingTester = options.audioDecodingTester,
        setFocus = options.setFocus,
        notificationTester = options.notificationTester,
        webSockets = options.webSockets;

    webSocketLogger.disable();
    timeoutLogger.disable();

    describe('Открываю новую админку. Аутентифицируюсь.', function() {
        let tester,
            userRequest;

        beforeEach(function() {
            const notificationsContainer = document.querySelector('.ant-notification span');
            notificationsContainer && (notificationsContainer.innerHTML = '');

            setNow('2020-08-24 13:21:55');
            tester = new AdminFrontendTester(options);
            tester.path.open('/');

            tester.textfield().withPlaceholder('Username').fill('s.karamanova');
            tester.textfield().withPlaceholder('Password').fill('2i3g8h89sdG32r');

            tester.button('Sign in').click();
            Promise.runAll();
            tester.userLoginRequest().receiveResponse();

            userRequest = tester.userRequest().expectToBeSent();
        });

        describe(
            'Доступны разделы "Пользователи", "CRM-интеграции", "Переотправка событий" и "Фичефлаги".',
        function() {
            beforeEach(function() {
                userRequest.
                    allowReadEventResending().
                    allowWriteEventResending().
                    allowReadCrmIntegration().
                    allowReadUsers().
                    allowReadFeatureFlags().
                    allowWriteFeatureFlags().
                    receiveResponse();
            });

            describe('Открываю раздел "Фичефлаги".', function() {
                let featureFlagsRequest;

                beforeEach(function() {
                    tester.path.open('/feature-flags');
                    Promise.runAll(false, true);

                    tester.featureFlagNamespacesRequest().receiveResponse();
                });

                describe('Ввожу значение в поле поиска.', function() {
                    beforeEach(function() {
                        tester.textfield().withPlaceholder('Название флага, Мнемоника, Пространство имен, AppID').
                            fill('whatsapp');
                    });

                    describe('Нажимаю на кнопку "Поиск".', function() {
                        beforeEach(function() {
                            tester.button('Поиск').click();
                            Promise.runAll();

                            featureFlagsRequest = tester.featureFlagsRequest().searchString().expectToBeSent();
                        });

                        describe('Фичефлаг включен, фичефлаг связан с конкретными пользователями.', function() {
                            beforeEach(function() {
                                featureFlagsRequest.receiveResponse();
                            });

                            describe('Нажимаю на иконку редактирования.', function() {
                                var featureFlagRequest;

                                beforeEach(function() {
                                    tester.table().cell().withContent('Чаты в WhatsApp').row().
                                        querySelector('.comagic-edit-icon').click();
                                    Promise.runAll(false, true);

                                    featureFlagRequest = tester.featureFlagRequest().expectToBeSent();
                                });

                                describe('Флаг связан с клиентами.', function() {
                                    beforeEach(function() {
                                        featureFlagRequest.receiveResponse();
                                        tester.appsRequest().changeLimit().receiveResponse();
                                    });

                                    describe('Снимаю отметку с первого клиента.', function() {
                                        beforeEach(function() {
                                            tester.table().cell().withContent('ООО "Трупоглазые жабы" # 2').row().
                                                checkbox().click();
                                        });

                                        describe('Отмечаю других клиентов.', function() {
                                            beforeEach(function() {
                                                tester.table().cell().withContent('ООО "Трупоглазые жабы" # 3').row().
                                                    checkbox().click();

                                                Promise.runAll(false, true);
                                            });

                                            describe('Изменяю значение формы.', function() {
                                                beforeEach(function() {
                                                    tester.textfield().withPlaceholder('Введите название флага').
                                                        fill('Чат в WhatsApp');
                                                    tester.textfield().withPlaceholder('Введите название мнемоники').
                                                        fill('whatsapp_chat');

                                                    tester.select().withPlaceholder('Выберите пространство имен').
                                                        arrowIcon().click();
                                                    tester.select().option('amocrm').click();
                                                    tester.select().withPlaceholder('Выберите пространство имен').
                                                        arrowIcon().click();

                                                    tester.switchField().withLabel('Состояние').click();
                                                });

                                                describe(
                                                    'Изменяю дату истечения. Нажимаю на кнопку сохранения. Отправлен ' +
                                                    'запрос обновление флага.',
                                                function() {
                                                    let featureFlagUpdatingRequest;

                                                    beforeEach(function() {
                                                        tester.textfield().withPlaceholder('Введте дату истечения').
                                                            click();
                                                        tester.calendar().nextMonth().click();
                                                        tester.calendar().cell('29').second().click();

                                                        Promise.runAll(false, true);
                                                        tester.button('Сохранить').click();
                                                        Promise.runAll(false, true);

                                                        featureFlagUpdatingRequest =
                                                            tester.featureFlagUpdatingRequest().
                                                                changeName().
                                                                changeMnemonic().
                                                                changeNamespaces().
                                                                changeExpireDate().
                                                                expectToBeSent();
                                                    });

                                                    it(
                                                        'Не удалось сохранить флаг. Отображено сообщение об ошибке.',
                                                    function() {
                                                        featureFlagUpdatingRequest.failed().receiveResponse();

                                                        tester.notification.expectToHaveTextContent(
                                                            'Произошла ошибка! ' +

                                                            'Флаг с данной мнемоникой уже существует в одном из ' +
                                                            'выбранных пространств имён'
                                                        );

                                                        tester.button('Добавить флаг').expectNotToExist();

                                                        tester.textfield().withPlaceholder('Введите название флага').
                                                            expectToBeVisible();
                                                    });
                                                    it('Удалось сохранить флаг. Отображен список флагов.', function() {
                                                        featureFlagUpdatingRequest.receiveResponse();
                                                        
                                                        Promise.runAll(false, true);
                                                        Promise.runAll(false, true);
                                                        tester.featureFlagsRequest().searchString().receiveResponse();

                                                        tester.textfield().withPlaceholder(
                                                            'Название флага, Мнемоника, Пространство имен, AppID'
                                                        ).expectToBeVisible();
                                                    });
                                                });
                                                it(
                                                    'Нажимаю на кнопку сохранения. Отправлен запрос обновление флага.',
                                                function() {
                                                    Promise.runAll(false, true);
                                                    tester.button('Сохранить').click();
                                                    Promise.runAll(false, true);

                                                    tester.featureFlagUpdatingRequest().
                                                        changeName().
                                                        changeMnemonic().
                                                        changeNamespaces().
                                                        receiveResponse();

                                                    Promise.runAll(false, true);
                                                    Promise.runAll(false, true);
                                                    tester.featureFlagsRequest().searchString().receiveResponse();

                                                    tester.textfield().withPlaceholder(
                                                        'Название флага, Мнемоника, Пространство имен, AppID'
                                                    ).expectToBeVisible();
                                                });
                                            });
                                            it('Другие клиенты отмечены.', function() {
                                                tester.table().cell().withContent('ООО "Трупоглазые жабы" # 1').row().
                                                    checkbox().expectNotToBeChecked();
                                                tester.table().cell().withContent('ООО "Трупоглазые жабы" # 2').row().
                                                    checkbox().expectNotToBeChecked();
                                                tester.table().cell().withContent('ООО "Трупоглазые жабы" # 3').row().
                                                    checkbox().expectToBeChecked();
                                                tester.table().cell().withContent('ООО "Трупоглазые жабы" # 4').row().
                                                    checkbox().expectToBeChecked();
                                                tester.table().cell().withContent('ООО "Трупоглазые жабы" # 5').row().
                                                    checkbox().expectNotToBeChecked();
                                            });
                                        });
                                        it('Возвращаю первого клиента. Кнопка "Сохранить" заблокирована.', function() {
                                            tester.table().cell().withContent('ООО "Трупоглазые жабы" # 2').row().
                                                checkbox().click();

                                            tester.button('Сохранить').expectToHaveAttribute('disabled');
                                        });
                                        it('Кнопка "Сохранить" доступна.', function() {
                                            tester.button('Сохранить').expectNotToHaveAttribute('disabled');
                                        });
                                    });
                                    describe('Нажимаю на ссылку "Фичефлаги".', function() {
                                        beforeEach(function() {
                                            tester.page.anchor('Фичефлаги').click();
                                            Promise.runAll(false, true);
                                        });

                                        it('Нажимаю на кнопку "Добавить флаг". Форма незаполнена.', function() {
                                            tester.button('Добавить флаг').click();
                                            Promise.runAll(false, true);

                                            tester.textfield().withPlaceholder('Введите название флага').
                                                expectToHaveValue('');
                                            tester.textfield().withPlaceholder('Введите название мнемоники').
                                                expectToHaveValue('');
                                            tester.select().withPlaceholder('Выберите пространство имен').
                                                expectToHaveValue('');
                                            tester.textfield().withPlaceholder('Введте дату истечения').
                                                expectToHaveValue('');
                                            tester.switchField().withLabel('Состояние').expectNotToBeChecked();

                                            tester.radioButton('Global').expectToBeChecked();
                                            tester.radioButton('Выбрать AppID').expectNotToBeChecked();
                                        });
                                        it(
                                            'Нажимаю на переключатель в строке флага. Нажимаю на кнопку выключения. ' +
                                            'Флаг выключен.',
                                        function() {
                                            tester.table().cell().withContent('Чаты в WhatsApp').row().switchField().
                                                click();
                                            spendTime(100);

                                            tester.modal().button('Выключить').click();

                                            Promise.runAll(false, true);
                                            tester.featureFlagUpdatingRequest().switching().receiveResponse();

                                            spendTime(200);
                                            spendTime(100);

                                            tester.table().cell().withContent('Чаты в WhatsApp').row().
                                                querySelector('.comagic-edit-icon').click();
                                            Promise.runAll(false, true);

                                            tester.featureFlagRequest().disabled().receiveResponse();
                                            tester.appsRequest().changeLimit().receiveResponse();

                                            tester.switchField().withLabel('Состояние').expectNotToBeChecked();
                                        });
                                        it('Открыта страница списка фичефлагов.', function() {
                                            tester.textfield().withPlaceholder(
                                                'Название флага, Мнемоника, Пространство имен, AppID'
                                            ).expectToHaveValue('whatsapp');

                                            tester.root.expectTextContentToHaveSubstring(
                                                'Название флага ' +
                                                'Мнемоника ' +
                                                'Пространство имен ' +
                                                'AppID ' +
                                                'Дата истечения ' +
                                                'Состояние ' +

                                                'Чаты в WhatsApp ' +
                                                'whatsapp_chats ' +
                                                'amocrm, comagic_web, db ' +
                                                '4735, 29572 ' +
                                                '26.07.2020 ' +
                                                'Вкл'
                                            );
                                        });
                                    });
                                    describe(
                                        'Отмечаю радиокнопку "Global". Нажимаю на кнопку "Сохранить". Отправлен ' +
                                        'запрос обновления флага.',
                                    function() {
                                        beforeEach(function() {
                                            tester.radioButton('Global').click();
                                            Promise.runAll(false, true);

                                            tester.button('Сохранить').click();
                                            Promise.runAll(false, true)
                                        });

                                        it(
                                            'Нажимаю на кнопку "Сохранить". Отправлен запрос сохранения флага.',
                                        function() {
                                            tester.modal().button('Сохранить').click();
                                            Promise.runAll(false, true);

                                            tester.featureFlagUpdatingRequest().enabled().global().expectToBeSent();

                                            spendTime(100);
                                            spendTime(100);
                                            spendTime(100);
                                            spendTime(100);

                                            tester.modal().expectToBeHiddenOrNotExist();
                                        });
                                        it('Отображено предупреждение.', function() {
                                            tester.modal().expectTextContentToHaveSubstring(
                                                'Подтвердите смену типа флага ' +
                                                'После сохранения флаг будет доступен всем клиентам. Подтвердить?'
                                            );
                                        });
                                    });
                                    describe('Убираю последнее пространство имен.', function() {
                                        beforeEach(function() {
                                            tester.select().withPlaceholder('Выберите пространство имен').
                                                arrowIcon().click();
                                            tester.select().option('db').click();
                                            tester.select().withPlaceholder('Выберите пространство имен').
                                                arrowIcon().click();
                                            Promise.runAll(false, true);
                                        });

                                        it(
                                            'Возвращаю последнее пространство имен. Кнопка "Сохранить" заблокирована.',
                                        function() {
                                            tester.select().withPlaceholder('Выберите пространство имен').
                                                arrowIcon().click();
                                            tester.select().option('db').click();
                                            tester.select().withPlaceholder('Выберите пространство имен').
                                                arrowIcon().click();
                                            Promise.runAll(false, true);

                                            spendTime(100);
                                            spendTime(100);
                                            spendTime(100);

                                            tester.button('Сохранить').expectToHaveAttribute('disabled');
                                        });
                                        it('Кнопка "Сохранить" доступна.', function() {
                                            tester.button('Сохранить').expectNotToHaveAttribute('disabled');
                                        });
                                    });
                                    describe('Убираю первое пространство имен.', function() {
                                        beforeEach(function() {
                                            tester.select().withPlaceholder('Выберите пространство имен').
                                                arrowIcon().click();
                                            tester.select().option('amocrm').click();
                                            tester.select().withPlaceholder('Выберите пространство имен').
                                                arrowIcon().click();
                                            Promise.runAll(false, true);
                                        });

                                        it(
                                            'Возвращаю первое пространство имен. Кнопка "Сохранить" заблокирована.',
                                        function() {
                                            tester.select().withPlaceholder('Выберите пространство имен').
                                                arrowIcon().click();
                                            tester.select().option('amocrm').click();
                                            tester.select().withPlaceholder('Выберите пространство имен').
                                                arrowIcon().click();
                                            Promise.runAll(false, true);

                                            spendTime(100);
                                            spendTime(100);
                                            spendTime(100);

                                            tester.button('Сохранить').expectToHaveAttribute('disabled');
                                        });
                                        it('Кнопка "Сохранить" доступна.', function() {
                                            tester.button('Сохранить').expectNotToHaveAttribute('disabled');
                                        });
                                    });
                                    describe('Снимаю отметку с последнего клиента.', function() {
                                        beforeEach(function() {
                                            tester.table().paging().page(2).click();
                                            Promise.runAll();
                                            tester.appsRequest().changeLimit().setSecondPage().receiveResponse();

                                            tester.table().cell().withContent('ООО "Трупоглазые жабы" # 8').row().
                                                checkbox().click();
                                        });

                                        it(
                                            'Возвращаю последнего клиента. Кнопка "Сохранить" заблокирована.',
                                        function() {
                                            tester.table().cell().withContent('ООО "Трупоглазые жабы" # 8').row().
                                                checkbox().click();

                                            tester.button('Сохранить').expectToHaveAttribute('disabled');
                                        });
                                        it('Кнопка "Сохранить" доступна.', function() {
                                            tester.button('Сохранить').expectNotToHaveAttribute('disabled');
                                        });
                                    });
                                    it(
                                        'Клиенты, связанные с флагом отмечены. Форма заполнена получеными данными.',
                                    function() {
                                        tester.table().cell().withContent('ООО "Трупоглазые жабы" # 1').row().
                                            checkbox().expectNotToBeChecked();
                                        tester.table().cell().withContent('ООО "Трупоглазые жабы" # 2').row().
                                            checkbox().expectToBeChecked();
                                        tester.table().cell().withContent('ООО "Трупоглазые жабы" # 3').row().
                                            checkbox().expectNotToBeChecked();
                                        tester.table().cell().withContent('ООО "Трупоглазые жабы" # 4').row().
                                            checkbox().expectToBeChecked();
                                        tester.table().cell().withContent('ООО "Трупоглазые жабы" # 5').row().
                                            checkbox().expectNotToBeChecked();

                                        tester.textfield().withPlaceholder('Введите название флага').
                                            expectToHaveValue('Чаты в WhatsApp');
                                        tester.textfield().withPlaceholder('Введите название мнемоники').
                                            expectToHaveValue('whatsapp_chats');
                                        tester.select().withPlaceholder('Выберите пространство имен').
                                            expectToHaveValue('amocrm comagic_web db');
                                        tester.textfield().withPlaceholder('Введте дату истечения').
                                            expectToHaveValue('26.07.2020');
                                        tester.switchField().withLabel('Состояние').expectToBeChecked();

                                        tester.radioButton('Global').expectNotToBeChecked();
                                        tester.radioButton('Выбрать AppID').expectToBeChecked();

                                        tester.button('Сохранить').expectToHaveAttribute('disabled');
                                    });
                                });
                                describe(
                                    'Флаг выключен. Флаг глобален. Дата истечения не указана. ',
                                function() {
                                    beforeEach(function() {
                                        featureFlagRequest.disabled().global().noExpireDate().receiveResponse();
                                        Promise.runAll(false, true);
                                    });

                                    it('Изменяю одно из полей. Кнопка "Сохранить" доступна.', function() {
                                        tester.textfield().withPlaceholder('Введите название мнемоники').
                                            putCursorAtEnd().pressBackspace();
                                        Promise.runAll(false, true);

                                        tester.button('Сохранить').expectNotToHaveAttribute('disabled');
                                    });
                                    it(
                                        'Форма заполнена получеными данными. Кнопка "Сохранить" заблокирована.',
                                    function() {
                                        tester.textfield().withPlaceholder('Введте дату истечения').
                                            expectToHaveValue('');

                                        tester.switchField().withLabel('Состояние').expectNotToBeChecked();

                                        tester.radioButton('Global').expectToBeChecked();
                                        tester.radioButton('Выбрать AppID').expectNotToBeChecked();
                                        
                                        tester.button('Сохранить').expectToHaveAttribute('disabled');

                                        tester.root.expectTextContentToHaveSubstring('Редактирование фичефлага');
                                    });
                                });
                                it(
                                    'Флаг связан с клиентами. Отмечаю радиокнопку "Global". Нажимаю на кнопку ' +
                                    '"Сохранить". Отправлен запрос обновления флага.',
                                function() {
                                    featureFlagRequest.noAppIds().receiveResponse();
                                    tester.appsRequest().changeLimit().receiveResponse();

                                    tester.radioButton('Global').click();
                                    Promise.runAll(false, true);

                                    tester.button('Сохранить').click();
                                    Promise.runAll(false, true)

                                    tester.featureFlagUpdatingRequest().enabled().global().expectToBeSent();
                                    tester.modal().expectToBeHiddenOrNotExist();
                                });
                            });
                            describe('Нажимаю на иконку удаления.', function() {
                                beforeEach(function() {
                                    tester.table().cell().withContent('Чаты в WhatsApp').row().
                                        querySelector('.comagic-delete-icon').click();

                                    spendTime(100);
                                });

                                it(
                                    'Нажимаю на кнопку удаления. Флаг удален. Отправляен запрос списка флагов.',
                                function() {
                                    tester.modal().button('Удалить').click();

                                    Promise.runAll(false, true);
                                    tester.featureFlagDeletingRequest().receiveResponse();
                                    tester.featureFlagsRequest().searchString().receiveResponse();

                                    spendTime(200);
                                    spendTime(100);
                                    tester.modal().expectToBeHiddenOrNotExist();
                                });
                                it('Нажимаю на кнопку скрытия модального окна. Модальное окно скрыто.', function() {
                                    tester.modal().closeIcon().click();
                                    spendTime(200);
                                    spendTime(100);

                                    tester.modal().expectToBeHiddenOrNotExist();
                                });
                                it('Нажимаю на кнопку отмены. Модальное окно скрыто.', function() {
                                    tester.modal().button('Отмена').click();
                                    spendTime(200);
                                    spendTime(100);

                                    tester.modal().expectToBeHiddenOrNotExist();
                                });
                                it('Отображено окно подтверждения.', function() {
                                    tester.modal().expectTextContentToHaveSubstring(
                                        'Подтвердите удаление ' +

                                        'Вы удаляете флаг "Чаты в WhatsApp". Связанная с ним функциональность станет ' +
                                        'недоступной для всех клиентов. Подтвердить?'
                                    );
                                });
                            });
                            describe('Нажимаю на переключатель в строке флага.', function() {
                                beforeEach(function() {
                                    tester.table().cell().withContent('Чаты в WhatsApp').row().switchField().click();
                                    spendTime(100);
                                });

                                it('Нажимаю на кнопку выключения. Флаг выключен.', function() {
                                    tester.modal().button('Выключить').click();

                                    Promise.runAll(false, true);
                                    tester.featureFlagUpdatingRequest().switching().receiveResponse();

                                    spendTime(200);
                                    spendTime(100);
                                    tester.modal().expectToBeHiddenOrNotExist();
                                    
                                    tester.root.expectTextContentToHaveSubstring('Выкл');
                                });
                                it('Отображено окно подтверждения.', function() {
                                    tester.modal().expectTextContentToHaveSubstring(
                                        'Подтвердите выключение ' +

                                        'После отключения флага "Чаты в WhatsApp" скрытая функциональность станет ' +
                                        'недоступной для всех клиентов. Подтвердить?'
                                    );
                                });
                            });
                            it(
                                'Нажимаю на заголовок. Отправлен запрос флагов. Нажимаю на иконку сортировки. ' +
                                'Отправлен запрос флагов.',
                            function() {
                                tester.table().header().withContent('Название флага').click();
                                Promise.runAll(false, true);
                                tester.featureFlagsRequest().searchString().sortedByName().ascending().
                                    receiveResponse();
                                
                                tester.table().header().withContent('Название флага').sortIcon().click();
                                Promise.runAll(false, true);
                                tester.featureFlagsRequest().searchString().sortedByName().receiveResponse();
                            });
                            it('Данные корретно отобржаены в таблице.', function() {
                                tester.root.expectTextContentToHaveSubstring(
                                    'Название флага ' +
                                    'Мнемоника ' +
                                    'Пространство имен ' +
                                    'AppID ' +
                                    'Дата истечения ' +
                                    'Состояние ' +

                                    'Чаты в WhatsApp ' +
                                    'whatsapp_chats ' +
                                    'amocrm, comagic_web, db ' +
                                    '4735, 29572 ' +
                                    '26.07.2020 ' +
                                    'Вкл'
                                );
                            });
                        });
                        describe('Фичефлаг выключен, фичефлаг глобален, дата истечения пуста.', function() {
                            beforeEach(function() {
                                featureFlagsRequest.disabled().global().noExpireDate().receiveResponse();
                            });

                            describe('Нажимаю на переключатель в строке флага.', function() {
                                beforeEach(function() {
                                    tester.table().cell().withContent('Чаты в WhatsApp').row().switchField().click();
                                    spendTime(100);
                                });

                                it('Нажимаю на кнопку включения. Флаг включен.', function() {
                                    tester.modal().button('Включить').click();

                                    Promise.runAll(false, true);
                                    tester.featureFlagUpdatingRequest().switching().enabled().receiveResponse();

                                    spendTime(200);
                                    spendTime(100);
                                    tester.modal().expectToBeHiddenOrNotExist();

                                    tester.root.expectTextContentToHaveSubstring('Вкл');
                                });
                                it('Отображено окно подтверждения.', function() {
                                    tester.modal().expectTextContentToHaveSubstring(
                                        'Подтвердите включение ' +

                                        'Флаг "Чаты в WhatsApp" включит скрытую функциональность в amocrm, ' +
                                        'comagic_web и db для всех клиентов. Подтвердить?'
                                    );
                                });
                            });
                            it('Данные корректно отобржаены в таблице.', function() {
                                tester.root.expectTextContentToHaveSubstring(
                                    'Название флага ' +
                                    'Мнемоника ' +
                                    'Пространство имен ' +
                                    'AppID ' +
                                    'Дата истечения ' +
                                    'Состояние ' +

                                    'Чаты в WhatsApp ' +
                                    'whatsapp_chats ' +
                                    'amocrm, comagic_web, db ' +
                                    'Global ' +
                                    'Выкл'
                                );
                            });
                        });
                        describe('AppID не указаны.', function() {
                            beforeEach(function() {
                                featureFlagsRequest.noAppIds().receiveResponse();
                            });

                            it('Нажимаю на иконку удаления. Отображено окно подтверждения.', function() {
                                tester.table().cell().withContent('Чаты в WhatsApp').row().
                                    querySelector('.comagic-delete-icon').click();

                                spendTime(100);

                                tester.modal().expectTextContentToHaveSubstring(
                                    'Подтвердите удаление ' +
                                    'Флаг "Чаты в WhatsApp" будет удален. Подтвердить?'
                                );
                            });
                            it('Нажимаю на переключатель в строке флага. Отображено окно подтверждения.', function() {
                                tester.table().cell().withContent('Чаты в WhatsApp').row().switchField().click();
                                spendTime(100);

                                tester.modal().expectTextContentToHaveSubstring(
                                    'Подтвердите выключение ' +
                                    'Флаг "Чаты в WhatsApp" будет выключен. Подтвердить?'
                                );
                            });
                            it('Данные корректно отобржаены в таблице.', function() {
                                tester.root.expectTextContentToHaveSubstring(
                                    'Название флага ' +
                                    'Мнемоника ' +
                                    'Пространство имен ' +
                                    'AppID ' +
                                    'Дата истечения ' +
                                    'Состояние ' +

                                    'Чаты в WhatsApp ' +
                                    'whatsapp_chats ' +
                                    'amocrm, comagic_web, db ' +
                                    '26.07.2020 ' +
                                    'Вкл'
                                );
                            });
                        });
                        describe('Фичефлагов много.', function() {
                            beforeEach(function() {
                                featureFlagsRequest.addMore().receiveResponse();
                            });

                            describe('Нажимаю на вторую страницу.', function() {
                                beforeEach(function() {
                                    tester.table().paging().page(2).click();
                                    Promise.runAll(false, true);

                                    tester.featureFlagsRequest().searchString().addMore().secondPage().
                                        receiveResponse();
                                });

                                it('Нажимаю на первую страницу. Выбрана первая страница.', function() {
                                    tester.table().paging().page(1).click();
                                    Promise.runAll(false, true);

                                    tester.featureFlagsRequest().searchString().addMore().receiveResponse();

                                    tester.table().paging().page(1).expectToBeChecked();
                                    tester.table().paging().page(2).expectNotToBeChecked();
                                    tester.table().paging().page(3).expectNotToBeChecked();
                                });
                                it('Выбрана вторая страница.', function() {
                                    tester.table().paging().page(1).expectNotToBeChecked();
                                    tester.table().paging().page(2).expectToBeChecked();
                                    tester.table().paging().page(3).expectNotToBeChecked();
                                });
                            });
                            it('Выбрана первая страница.', function() {
                                tester.table().paging().page(1).expectToBeChecked();
                                tester.table().paging().page(2).expectNotToBeChecked();
                                tester.table().paging().page(3).expectNotToBeChecked();
                                tester.table().paging().page(4).expectNotToExist();
                            });
                        });
                        it(
                            'Фичефлаг выключен, фичефлаг связан с конкретными пользователями. Нажимаю на ' +
                            'переключатель в строке флага. Отображено окно подтверждения.',
                        function() {
                            featureFlagsRequest.disabled().receiveResponse();

                            tester.table().cell().withContent('Чаты в WhatsApp').row().switchField().click();
                            spendTime(100);

                            tester.modal().expectTextContentToHaveSubstring(
                                'Подтвердите включение ' +

                                'Флаг "Чаты в WhatsApp" включит скрытую функциональность в amocrm, comagic_web и ' +
                                'db для 4735 и 29572. Подтвердить?'
                            );
                        });
                        it(
                            'Фичефлаг выключен, фичефлаг связан с конкретным пользователем. Нажимаю на переключатель ' +
                            'в строке флага. Отображено окно подтверждения.',
                        function() {
                            featureFlagsRequest.disabled().onlyOneAppId().receiveResponse();

                            tester.table().cell().withContent('Чаты в WhatsApp').row().switchField().click();
                            spendTime(100);

                            tester.modal().expectTextContentToHaveSubstring(
                                'Подтвердите включение ' +

                                'Флаг "Чаты в WhatsApp" включит скрытую функциональность в amocrm, comagic_web и db ' +
                                'для 4735. Подтвердить?'
                            );
                        });
                        it(
                            'Фичефлаг выключен. AppID не указаны. Нажимаю на переключатель в строке флага. ' +
                            'Отображено окно подтверждения.',
                        function() {
                            featureFlagsRequest.disabled().noAppIds().receiveResponse();

                            tester.table().cell().withContent('Чаты в WhatsApp').row().switchField().click();
                            spendTime(100);

                            tester.modal().expectTextContentToHaveSubstring(
                                'Подтвердите включение ' +
                                'Флаг "Чаты в WhatsApp" будет включен. Подтвердить?'
                            );
                        });
                    });
                    describe(
                        'Выбираю пространства имен. Нажмаю на кнопку "Поиск". Отправлен запрос флагов.',
                    function() {
                        beforeEach(function() {
                            tester.select().withPlaceholder('Выберите пространство имен').arrowIcon().click();
                            tester.select().option('comagic_web').click();
                            tester.select().option('amocrm').click();
                            tester.select().withPlaceholder('Выберите пространство имен').arrowIcon().click();

                            tester.button('Поиск').click();
                            Promise.runAll();

                            tester.featureFlagsRequest().searchString().namespaces().receiveResponse();
                        });

                        it('Нажимаю на иконку редактирования. Флаг включен. Флаг связан с клиентами.', function() {
                            tester.table().cell().withContent('Чаты в WhatsApp').row().
                                querySelector('.comagic-edit-icon').click();
                            Promise.runAll(false, true);

                            tester.featureFlagRequest().receiveResponse();
                            tester.appsRequest().changeLimit().receiveResponse();

                            tester.page.anchor('Отмена').click();
                            Promise.runAll(false, true);
                        });
                        it(
                            'Снимаю отметки с пространств имен. Нажмаю на кнопку "Поиск". Отправлен запрос флагов.',
                        function() {
                            tester.select().withPlaceholder('Выберите пространство имен').arrowIcon().click();
                            tester.select().option('comagic_web').click();
                            spendTime(100);
                            tester.select().option('amocrm').click();
                            spendTime(100);
                            tester.select().withPlaceholder('Выберите пространство имен').arrowIcon().click();

                            tester.button('Поиск').click();
                            Promise.runAll();

                            tester.featureFlagsRequest().searchString().receiveResponse();
                        });
                    });
                    it('Отмечаю радиокнопку "Global". Нажмаю на кнопку "Поиск". Отправлен запрос флагов.', function() {
                        tester.radioButton('Global').click();

                        tester.button('Поиск').click();
                        Promise.runAll();

                        tester.featureFlagsRequest().searchString().global().expectToBeSent();
                    });
                    it(
                        'Отмечаю радиокнопку "Связанные с AppID". Нажмаю на кнопку "Поиск". Отправлен запрос флагов.',
                    function() {
                        tester.radioButton('Связанные с AppID').click();

                        tester.button('Поиск').click();
                        Promise.runAll();

                        tester.featureFlagsRequest().searchString().notGlobal().expectToBeSent();
                    });
                });
                describe('Нажимаю на кнопку "Добавить флаг".', function() {
                    beforeEach(function() {
                        tester.button('Добавить флаг').click();
                        Promise.runAll(false, true);
                    });

                    describe('Заполняю форму.', function() {
                        beforeEach(function() {
                            tester.textfield().withPlaceholder('Введите название флага').fill('Чаты в WhatsApp');
                            tester.textfield().withPlaceholder('Введите название мнемоники').fill('whatsapp_chats');

                            tester.select().withPlaceholder('Выберите пространство имен').arrowIcon().click();
                            tester.select().option('comagic_web').click();
                            tester.select().option('amocrm').click();
                            tester.select().withPlaceholder('Выберите пространство имен').arrowIcon().click();
                            Promise.runAll(false, true);

                            tester.textfield().withPlaceholder('Введте дату истечения').click();
                        });

                        describe('Выбираю дату позднее сегдняшнего дня.', function() {
                            beforeEach(function() {
                                tester.calendar().cell('29').second().click();
                            });

                            describe('Нажимаю на кнопку "Выбрать AppID".', function() {
                                beforeEach(function() {
                                    tester.radioButton('Выбрать AppID').click();
                                    Promise.runAll(false, true);

                                    tester.appsRequest().changeLimit().receiveResponse();
                                });

                                describe('Отмечаю строки. Открываю вторую страницу. Отмечаю строки.', function() {
                                    beforeEach(function() {
                                        tester.table().cell().withContent('ООО "Трупоглазые жабы" # 2').row().
                                            checkbox().click();

                                        tester.table().cell().withContent('ООО "Трупоглазые жабы" # 4').row().
                                            checkbox().click();

                                        tester.table().paging().page(2).click();
                                        Promise.runAll();
                                        tester.appsRequest().changeLimit().setSecondPage().receiveResponse();

                                        tester.table().cell().withContent('ООО "Трупоглазые жабы" # 7').row().
                                            checkbox().click();

                                        tester.table().cell().withContent('ООО "Трупоглазые жабы" # 8').row().
                                            checkbox().click();

                                        Promise.runAll(false, true);
                                    });

                                    describe('Открываю первую страницу.', function() {
                                        beforeEach(function() {
                                            tester.table().paging().page(1).click();
                                            Promise.runAll();
                                            tester.appsRequest().changeLimit().receiveResponse();
                                        });

                                        it('Открываю вторую страницу. Строки отмечены.', function() {
                                            tester.table().paging().page(2).click();
                                            Promise.runAll();
                                            tester.appsRequest().changeLimit().setSecondPage().receiveResponse();

                                            tester.table().cell().withContent('ООО "Трупоглазые жабы" # 6').row().
                                                checkbox().expectNotToBeChecked();
                                            tester.table().cell().withContent('ООО "Трупоглазые жабы" # 7').row().
                                                checkbox().expectToBeChecked();
                                            tester.table().cell().withContent('ООО "Трупоглазые жабы" # 8').row().
                                                checkbox().expectToBeChecked();
                                            tester.table().cell().withContent('ООО "Трупоглазые жабы" # 9').row().
                                                checkbox().expectNotToBeChecked();
                                            tester.table().cell().withContent('ООО "Трупоглазые жабы" # 10').row().
                                                checkbox().expectNotToBeChecked();
                                        });
                                        it('Строки отмечены.', function() {
                                            tester.table().cell().withContent('ООО "Трупоглазые жабы" # 1').row().
                                                checkbox().expectNotToBeChecked();
                                            tester.table().cell().withContent('ООО "Трупоглазые жабы" # 2').row().
                                                checkbox().expectToBeChecked();
                                            tester.table().cell().withContent('ООО "Трупоглазые жабы" # 3').row().
                                                checkbox().expectNotToBeChecked();
                                            tester.table().cell().withContent('ООО "Трупоглазые жабы" # 4').row().
                                                checkbox().expectToBeChecked();
                                            tester.table().cell().withContent('ООО "Трупоглазые жабы" # 5').row().
                                                checkbox().expectNotToBeChecked();

                                            tester.page.expectTextContentToHaveSubstring(
                                                'Выбрано 4 из 75'
                                            );
                                        });
                                    });
                                    describe('Нажимаю на кнопку "Сохранить". Отправлен запрос сохранения.', function() {
                                        let featureFlagCreatingRequest;

                                        beforeEach(function() {
                                            tester.button('Сохранить').click();
                                            Promise.runAll(false, true);

                                            featureFlagCreatingRequest = tester.featureFlagCreatingRequest().
                                                expectToBeSent();
                                        });

                                        it('Не удалось сохранить флаг. Отображено сообщение об ошибке.', function() {
                                            featureFlagCreatingRequest.failed().receiveResponse();

                                            tester.notification.expectToHaveTextContent(
                                                'Произошла ошибка! ' +

                                                'Флаг с данной мнемоникой уже существует в одном из выбранных ' +
                                                'пространств имён'
                                            );

                                            tester.button('Добавить флаг').expectNotToExist();

                                            tester.textfield().withPlaceholder('Введите название флага').
                                                expectToBeVisible();
                                        });
                                        it('Удалось сохранить флаг. Отображен список флагов.', function() {
                                            window.isLogEnabled = true;
                                            featureFlagCreatingRequest.receiveResponse();
                                            tester.featureFlagsRequest().receiveResponse();

                                            tester.button('Добавить флаг').expectToBeVisible();
                                            tester.textfield().withPlaceholder('Введите название флага').
                                                expectNotToExist();
                                        });
                                    });
                                });
                                describe('Нажимаю на чекбокс в заголовке.', function() {
                                    beforeEach(function() {
                                        tester.table().header().checkbox().click();
                                    });

                                    it('Нажимаю на чекбокс в заголовке. Ни одна строка не отмечена.', function() {
                                        tester.table().header().checkbox().click();

                                        tester.table().cell().withContent('ООО "Трупоглазые жабы" # 1').row().
                                            checkbox().expectNotToBeChecked();
                                        tester.table().cell().withContent('ООО "Трупоглазые жабы" # 2').row().
                                            checkbox().expectNotToBeChecked();
                                        tester.table().cell().withContent('ООО "Трупоглазые жабы" # 3').row().
                                            checkbox().expectNotToBeChecked();
                                        tester.table().cell().withContent('ООО "Трупоглазые жабы" # 4').row().
                                            checkbox().expectNotToBeChecked();
                                        tester.table().cell().withContent('ООО "Трупоглазые жабы" # 5').row().
                                            checkbox().expectNotToBeChecked();
                                    });
                                    it('Все строки отмечены.', function() {
                                        tester.table().cell().withContent('ООО "Трупоглазые жабы" # 1').row().
                                            checkbox().expectToBeChecked();
                                        tester.table().cell().withContent('ООО "Трупоглазые жабы" # 2').row().
                                            checkbox().expectToBeChecked();
                                        tester.table().cell().withContent('ООО "Трупоглазые жабы" # 3').row().
                                            checkbox().expectToBeChecked();
                                        tester.table().cell().withContent('ООО "Трупоглазые жабы" # 4').row().
                                            checkbox().expectToBeChecked();
                                        tester.table().cell().withContent('ООО "Трупоглазые жабы" # 5').row().
                                            checkbox().expectToBeChecked();
                                    });
                                });
                                it(
                                    'Ввожу строку поиска. Нажимаю на кнопку "Поиск". Отправлен запрос клиентов.',
                                function() {
                                    tester.textfield().withPlaceholder(
                                        'Customer ID, Имя клиента, Номер, Сайт, Лицевой счет, логин/e-mail, РТУ'
                                    ).fill('Шунин');

                                    tester.button('Поиск').click();
                                    Promise.runAll(false, true);

                                    tester.appsRequest().setSearch().changeLimit().receiveResponse();
                                });
                                it('Отображены клиенты.', function() {
                                    tester.page.expectTextContentToHaveSubstring(
                                        'ООО "Трупоглазые жабы" # 1'
                                    );

                                    tester.page.expectTextContentToHaveSubstring(
                                        '1 2 3 4 5 в конец ' +
                                        'Строк на странице 5 ' +
                                        'Выбрано 0 из 75'
                                    );
                                });
                            });
                            it(
                                'Отмечаю свичбокс "Состояние". Нажимаю на кнопку "Сохранить". Отправлен запрос ' +
                                'сохранения.',
                            function() {
                                tester.switchField().withLabel('Состояние').click();

                                Promise.runAll(false, true);
                                tester.button('Сохранить').click();
                                Promise.runAll(false, true);

                                tester.featureFlagCreatingRequest().global().enabled().receiveResponse();
                                tester.featureFlagsRequest().receiveResponse();
                            });
                            it('Кнопка "Global" нажата.', function() {
                                tester.radioButton('Global').expectToBeChecked();
                                tester.radioButton('Выбрать AppID').expectNotToBeChecked();

                                tester.textfield().withPlaceholder(
                                    'Customer ID, Имя клиента, Номер, Сайт, Лицевой счет, логин/e-mail, РТУ'
                                ).expectNotToExist();

                                tester.root.expectTextContentToHaveSubstring('Добавление фичефлага');

                                tester.calendar().cell('23').expectToBeHiddenOrNotExist();
                                tester.textfield().withPlaceholder('Введте дату истечения').
                                    expectToHaveValue('29.08.2020');
                            });
                        });
                        it('Снимаю отметку со всех пространств имен. Кнопка "Сохранить" заблокирована.', function() {
                            tester.select().withPlaceholder('Выберите пространство имен').arrowIcon().click();

                            tester.select().option('comagic_web').click();
                            spendTime(100);
                            tester.select().option('amocrm').click();
                            spendTime(100);

                            tester.select().withPlaceholder('Выберите пространство имен').arrowIcon().click();
                            Promise.runAll(false, true);
                            
                            tester.select().withPlaceholder('Выберите пространство имен').errorIcon().putMouseOver();
                            spendTime(100);
                            tester.tooltip.expectToHaveTextContent('Это поле является обязательным для заполнения');

                            tester.button('Сохранить').expectToHaveAttribute('disabled');
                        });
                        it(
                            'Ввожу некорректные символы в пол для ввода мнемоники. Кнопка "Сохранить" заблокирована.',
                        function() {
                            tester.textfield().withPlaceholder('Введите название мнемоники').fill('вацап чат');
                            Promise.runAll(false, true);

                            tester.textfield().withPlaceholder('Введите название мнемоники').errorIcon().putMouseOver();
                            spendTime(100);

                            tester.tooltip.expectToHaveTextContent(
                                'В поле могут быть введены только латинские строчные буквы, цифры и подчеркивание'
                            );

                            tester.button('Сохранить').expectToHaveAttribute('disabled');
                        });
                        it('Стираю название флага. Кнопка "Сохранить" заблокирована.', function() {
                            tester.textfield().withPlaceholder('Введите название флага').clear();
                            Promise.runAll(false, true);

                            tester.button('Сохранить').click();
                            Promise.runAll(false, true);
                        });
                        it('Безуспешно пытаюсь выбрать дату раньше сегдняшнего дня.', function() {
                            tester.calendar().cell('23').click();

                            tester.calendar().cell('23').expectToBeVisible();
                            tester.textfield().withPlaceholder('Введте дату истечения').expectToHaveValue('');
                        });
                        it('Кнопка "Сохранить" доступна.', function() {
                            tester.button('Сохранить').expectNotToHaveAttribute('disabled');
                        });
                    });
                    it('Нажимаю на ссылку "Фичефлаги". Открыта страница списка фичефлагов.', function() {
                        tester.page.anchor('Фичефлаги').click();
                        tester.button('Добавить флаг').expectToBeVisible();
                    });
                    it('Нажимаю на ссылку "Отмена". Открыта страница списка фичефлагов.', function() {
                        tester.page.anchor('Отмена').click();
                        tester.button('Добавить флаг').expectToBeVisible();
                    });
                    it('Помещаю курсор над выпадающим списком пространств имен. Отображается подсказка.', function() {
                        tester.select().withPlaceholder('Выберите пространство имен').putMouseOver();
                        spendTime(100);
                        
                        tester.tooltip.expectToHaveTextContent(
                            'Если хотите использовать пространство имен отсутствующее в списке, то попросите базиста ' +
                            'добавить новое значение в enum feature.flag_namespace_mnemonic'
                        );
                    });
                    it('Кнопка "Сохранить" заблокирована.', function() {
                        tester.button('Сохранить').expectToHaveAttribute('disabled');
                    });
                });
                it('Нажимаю на кнопку "Поиск". Отправлен запрос фичафлагов.', function() {
                    tester.button('Поиск').click();
                    Promise.runAll();

                    tester.featureFlagsRequest().expectToBeSent();
                });
                it('Отмечена радиокнопка "Все".', function() {
                    tester.radioButton('Global').expectNotToBeChecked();
                    tester.radioButton('Связанные с AppID').expectNotToBeChecked();
                    tester.radioButton('Все').expectToBeChecked();
                });
            });
            describe('Открываю раздел "Переотправка событий" без фильтра.', function() {
                beforeEach(function() {
                    tester.path.open('/event-resending');
                    Promise.runAll();
                });

                describe('Заполняю поле "App ID".', function() {
                    beforeEach(function() {
                        tester.textfield().withPlaceholder('App ID').fill('4735');
                    });
                    
                    describe('Выбираю amoCRM.', function() {
                        beforeEach(function() {
                            tester.select().withPlaceholder('Тип CRM').arrowIcon().click();
                            tester.select().option('amoCRM').click();
                        });

                        describe('Заполняю остальные поля фильтра.', function() {
                            beforeEach(function() {
                                tester.textfield().withPlaceholder('ID сессии').fill('28394');
                                tester.textfield().withPlaceholder('Номер абонента').fill('79162937183');
                                tester.textfield().withPlaceholder('Начальная дата').click();
                                tester.forceUpdate();
                            });

                            describe('Дата окончания меньше текущей.', function() {
                                beforeEach(function() {
                                    tester.calendar().left().prevMonth().click();
                                    tester.calendar().left().cell('26').click();
                                    tester.forceUpdate();
                                    tester.calendar().right().cell('17').click();
                                });

                                describe('Применяю выбранные даты.', function() {
                                    beforeEach(function() {
                                        tester.calendar().okButton().click();
                                        tester.forceUpdate();
                                    });

                                    describe('Нажимаю на кнопку "Применить".', function() {
                                        var amocrmEventsRequest;

                                        beforeEach(function() {
                                            tester.button('Применить').click();
                                            Promise.runAll();
                                            amocrmEventsRequest = tester.amocrmEventsRequest().expectToBeSent();
                                        });

                                        describe('Событий много.', function() {
                                            beforeEach(function() {
                                                amocrmEventsRequest.addEvents(0, 24).receiveResponse();
                                            });

                                            describe(
                                                'Нажимаю на кнпоку "дальше". Отправлен запрос второй страницы.',
                                            function() {
                                                beforeEach(function() {
                                                    tester.button('дальше').click();
                                                    Promise.runAll();
                                                    amocrmEventsRequest = tester.amocrmEventsRequest().setOffset(25).
                                                        expectToBeSent();
                                                });

                                                describe('На второй странице есть события.', function() {
                                                    beforeEach(function() {
                                                        amocrmEventsRequest.addEvents(25, 49).receiveResponse()
                                                    });

                                                    describe('Перехожу на третью страницу.', function() {
                                                        beforeEach(function() {
                                                            tester.button('дальше').click();
                                                            Promise.runAll();
                                                            tester.amocrmEventsRequest().setOffset(50).expectToBeSent().
                                                                addEvents(50, 74).receiveResponse();
                                                        });

                                                        describe(
                                                            'Нажимаю на кнопку второй страницы. Отправлен запрос ' +
                                                            'четвертой страницы.',
                                                        function() {
                                                            beforeEach(function() {
                                                                tester.table().paging().page(2).click();
                                                                Promise.runAll();
                                                                amocrmEventsRequest = tester.amocrmEventsRequest().
                                                                    setOffset(25).expectToBeSent();
                                                            });

                                                            it(
                                                                'На второй странице есть события. Отображена вторая ' +
                                                                'страница.',
                                                            function() {
                                                                amocrmEventsRequest.addEvents(25, 49).receiveResponse();

                                                                tester.root.expectTextContentToHaveSubstring(
                                                                    '39339 ' +

                                                                    '1 ' +
                                                                    '2 ' +
                                                                    'дальше ' +
                                                                    'Строк на странице 25'
                                                                );
                                                            });
                                                            it(
                                                                'На второй странице нет событий. Отображена вторая ' +
                                                                'страница.',
                                                            function() {
                                                                amocrmEventsRequest.setNoEvents().receiveResponse();

                                                                tester.root.expectTextContentToHaveSubstring(
                                                                    'Нет данных ' +

                                                                    '1 ' +
                                                                    '2 ' +
                                                                    'Строк на странице 25'
                                                                );
                                                            });
                                                        });
                                                        describe('Перехожу на четвертую страницу.', function() {
                                                            beforeEach(function() {
                                                                tester.button('дальше').click();
                                                                Promise.runAll();

                                                                tester.amocrmEventsRequest().
                                                                    setOffset(75).
                                                                    expectToBeSent().
                                                                    addEvents(75, 99).
                                                                    receiveResponse();
                                                            });

                                                            it(
                                                                'Нажимаю на кнопку "В начало". Запрошена первая ' +
                                                                'страница.',
                                                            function() {
                                                                tester.button('В начало').click();
                                                                Promise.runAll();
                                                                tester.amocrmEventsRequest().expectToBeSent();
                                                            });
                                                            it('Отображены три кнопки страниц.', function() {
                                                                tester.root.expectTextContentToHaveSubstring(
                                                                    'В начало ' +
                                                                    '2 ' +
                                                                    '3 ' +
                                                                    '4 ' +
                                                                    'дальше ' +
                                                                    'Строк на странице 25'
                                                                );
                                                            });
                                                        });
                                                        it('Отображены три кнопки страниц.', function() {
                                                            tester.root.expectTextContentToHaveSubstring(
                                                                '39364 ' +

                                                                '1 ' +
                                                                '2 ' +
                                                                '3 ' +
                                                                'дальше ' +
                                                                'Строк на странице 25'
                                                            );
                                                        });
                                                    });
                                                    it('Отображена вторая страница.', function() {
                                                        tester.table().paging().page(1).
                                                            expectNotToHaveClass('pagination-item-active');
                                                        tester.table().paging().page(2).expectToHaveClass(
                                                            'pagination-item-active'
                                                        );

                                                        tester.root.expectTextContentToHaveSubstring(
                                                            '79157389337 ' +
                                                            '05.02.2021 в 09:56 ' +
                                                            '10.06.2021 в 18:59 ' +
                                                            '39339 ' +

                                                            '1 ' +
                                                            '2 ' +
                                                            'дальше ' +
                                                            'Строк на странице 25'
                                                        );
                                                    });
                                                });
                                                it(
                                                    'На второй странице нет событий. Отображена пустая страница.',
                                                function() {
                                                    amocrmEventsRequest.setNoEvents().receiveResponse()

                                                    tester.table().paging().page(1).
                                                        expectNotToHaveClass('pagination-item-active');
                                                    tester.table().paging().page(2).
                                                        expectToHaveClass('pagination-item-active');

                                                    tester.root.expectTextContentToHaveSubstring(
                                                        'Нет данных ' +

                                                        '1 ' +
                                                        '2 ' +
                                                        'Строк на странице 25'
                                                    );
                                                });
                                            });
                                            it('Отображена первая страница.', function() {
                                                tester.table().paging().page(1).
                                                    expectToHaveClass('pagination-item-active');

                                                tester.root.expectTextContentToHaveSubstring(
                                                    '39314 ' +

                                                    '1 ' +
                                                    'дальше ' +
                                                    'Строк на странице 25'
                                                );
                                            });
                                        });
                                        describe(
                                            'Событий мало. Ни одно событие не отправляется в данный момент.',
                                        function() {
                                            beforeEach(function() {
                                                amocrmEventsRequest.receiveResponse();
                                            });
                                            
                                            describe(
                                                'Отмечаю две строки. Нажимаю на кнопку "Повторить отправку". ' +
                                                'Отправлен запрос переотправки событий.',
                                            function() {
                                                var amocrmEventsResendingRequest;
                                                
                                                beforeEach(function() {
                                                    tester.table().cell().withContent('79157389283').row().checkbox().
                                                        click();
                                                    tester.table().cell().withContent('79157389285').row().checkbox().
                                                        click();

                                                    tester.button('Повторить отправку').click();
                                                    Promise.runAll();
                                                    amocrmEventsResendingRequest =
                                                        tester.amocrmEventsResendingRequest().
                                                            setTwoEvents().
                                                            expectToBeSent();
                                                });

                                                describe(
                                                    'Получен ответ сервера. Отправлен запрос событий.',
                                                function() {
                                                    beforeEach(function() {
                                                        amocrmEventsResendingRequest.receiveResponse();
                                                        amocrmEventsRequest = tester.amocrmEventsRequest().
                                                            expectToBeSent();
                                                    });

                                                    it(
                                                        'Таблица заблокирована. Отображено оповещение о добавлении ' +
                                                        'событий в очередь.',
                                                    function() {
                                                        tester.spinner.expectToBeVisible();
                                                        tester.notification.
                                                            expectToHaveTextContent('В очередь добавлено 2 события');
                                                    });
                                                    it(
                                                        'Получен ответ сервера. Таблица доступна. Ни одна строка не ' +
                                                        'выбрана.',
                                                    function() {
                                                        amocrmEventsRequest.receiveResponse();

                                                        tester.spinner.expectToBeHiddenOrNotExist();
                                                        tester.button('Применить').expectNotToHaveAttribute('disabled');
                                                        tester.button('Повторить отправку').
                                                            expectToHaveAttribute('disabled');

                                                        tester.table().cell().withContent('79157389283').row().
                                                            checkbox().expectNotToBeChecked();
                                                        tester.table().cell().withContent('79157389284').row().
                                                            checkbox().expectNotToBeChecked();
                                                        tester.table().cell().withContent('79157389285').row().
                                                            checkbox().expectNotToBeChecked();
                                                    });
                                                });
                                                it('Таблица заблокирована.', function() {
                                                    tester.spinner.expectToBeVisible();
                                                    tester.button('Применить').expectToHaveAttribute('disabled');
                                                    tester.button('Повторить отправку').
                                                        expectToHaveAttribute('disabled');
                                                });
                                            });
                                            describe(
                                                'Нажимаю на заголовок колонки "Дата и время события". Запрошены ' +
                                                'события без сортировки.',
                                            function() {
                                                beforeEach(function() {
                                                    tester.table().header().withContent('Дата и время события').click();
                                                    Promise.runAll();
                                                    tester.amocrmEventsRequest().setNoSort().receiveResponse();
                                                });

                                                describe(
                                                    'Нажимаю на заголовок колонки "Дата и время события". Запрошены ' +
                                                    'события с сортировкой по возрастанию.',
                                                function() {
                                                    beforeEach(function() {
                                                        tester.table().header().withContent('Дата и время события').
                                                            click();
                                                        Promise.runAll();
                                                        tester.amocrmEventsRequest().setAscDirection().
                                                            receiveResponse();
                                                    });

                                                    it(
                                                        'Нажимаю на заголовок колонки "Дата и время события". Под ' +
                                                        'заголовком колонки "Дата и время события" отображена ' +
                                                        'стрелочка вниз.',
                                                    function() {
                                                        tester.table().header().withContent('Дата и время события').
                                                            click();
                                                        Promise.runAll();
                                                        tester.amocrmEventsRequest().receiveResponse();

                                                        tester.table().header().withContent('Дата и время события').
                                                            sortIcon().expectToBeArrowDown();

                                                        tester.path.expectQueryToContain({
                                                            sort: ['{"field":"event_time","order":"desc"}']
                                                        })
                                                    });
                                                    it(
                                                        'Под заголовком колонки "Дата и время события" отображена ' +
                                                        'стрелочка вверх.',
                                                    function() {
                                                        tester.table().header().withContent('Дата и время события').
                                                            sortIcon().expectToBeArrowUp();

                                                        tester.path.expectQueryToContain({
                                                            sort: ['{"field":"event_time","order":"asc"}']
                                                        })
                                                    });
                                                });
                                                it(
                                                    'Стрелочка не отображена под заголовком колонки "Дата и время ' +
                                                    'события".',
                                                function() {
                                                    tester.table().header().withContent('Дата и время события').
                                                        sortIcon().expectNotToExist();

                                                    tester.path.expectQueryToContain({
                                                        sort: undefined
                                                    })
                                                });
                                            });
                                            it(
                                                'Отмечаю одну строку. Нажимаю на кнопку "Повторить отправку". ' +
                                                'Отображено оповещение о добавлении события в очередь.',
                                            function() {
                                                tester.table().cell().withContent('79157389283').row().checkbox().
                                                    click();

                                                tester.button('Повторить отправку').click();
                                                Promise.runAll();

                                                tester.amocrmEventsResendingRequest().receiveResponse();
                                                tester.amocrmEventsRequest().expectToBeSent();

                                                tester.notification.
                                                    expectToHaveTextContent('В очередь добавлено 1 событие');
                                            });
                                            it(
                                                'Отмечаю пять строк. Нажимаю на кнопку "Повторить отправку". ' +
                                                'Отображено оповещение о добавлении события в очередь.',
                                            function() {
                                                tester.table().cell().withContent('79157389283').row().checkbox().
                                                    click();
                                                tester.table().cell().withContent('79157389284').row().checkbox().
                                                    click();
                                                tester.table().cell().withContent('79157389285').row().checkbox().
                                                    click();
                                                tester.table().cell().withContent('79157389286').row().checkbox().
                                                    click();
                                                tester.table().cell().withContent('79157389287').row().checkbox().
                                                    click();

                                                tester.button('Повторить отправку').click();
                                                Promise.runAll();

                                                tester.amocrmEventsResendingRequest().receiveResponse();
                                                tester.amocrmEventsRequest().expectToBeSent();

                                                tester.notification.expectToHaveTextContent(
                                                    'В очередь добавлено 5 событий'
                                                );
                                            });
                                            it(
                                                'Нажимаю на кнопку "Выбрать все недоставленные". Все недоставленные ' +
                                                'события выбраны.',
                                            function() {
                                                tester.button('Выбрать все недоставленные').click();
                                                Promise.runAll(false, true);

                                                tester.table().cell().withContent('79157389283').row().checkbox().
                                                    expectToBeChecked();
                                                tester.table().cell().withContent('79157389284').row().checkbox().
                                                    expectNotToBeChecked();
                                                tester.table().cell().withContent('79157389285').row().checkbox().
                                                    expectNotToBeChecked();
                                            });
                                            it(
                                                'Навожу курсор на иконку условия. Отображается подсказка с описанием ' +
                                                'условия.',
                                            function() {
                                                tester.table().cell().withContent('79157389283').row().
                                                    querySelector(
                                                        '.event-resending-condition-icon-is_common_conditions_passed'
                                                    ).
                                                    putMouseOver();

                                                tester.tooltip.expectToHaveTextContent(
                                                    'Общие для всех клиентов условия отправки в CRM'
                                                );
                                            });
                                            it(
                                                'Отображена таблица событий. Кнопка "Повторить отправку" ' +
                                                'заблокирована. Таблица доступна. Под заголовком колонки "Дата и ' +
                                                'время события" отображена стрелочка вниз.',
                                            function() {
                                                tester.table().header().withContent('Дата и время события').sortIcon().
                                                    expectToBeArrowDown();

                                                tester.spinner.expectNotToExist();
                                                tester.button('Повторить отправку').expectToHaveAttribute('disabled');

                                                tester.root.expectToHaveTextContent(
                                                    'Новосистем ' +
                                                    'Admin Panel ' +

                                                    'Пользователи ' +
                                                    'CRM-интеграции ' +
                                                    'Переотправка событий ' +
                                                    'Фичефлаги ' +

                                                    'Переотправка событий ' +

                                                    'Фильтры: ' +

                                                    'Тип CRM amoCRM ' +
                                                    '~ ' +
                                                    'Доставленные ' +
                                                    'Недоставленные ' +
                                                    'Отправляются ' +
                                                    'Не отправлялись ' +

                                                    'Применить ' +
                                                    'Повторить отправку ' +
                                                    'Выбрать все недоставленные ' +

                                                    'Номер абонента ' +
                                                    'Дата и время события ' +
                                                    'Дата и время доставки в CRM ' +
                                                    'ID сессии ' +

                                                    '79157389283 ' +
                                                    '03.02.2021 в 09:58 ' +
                                                    'Exception in thread "main" java.lang.NullPointerException: ' +
                                                        'Oops! at com.ericgoebelbecker.stacktraces.StackTrace.d ' +
                                                        'StackTrace.java... 10.04.2021 в 16:59 ' +
                                                    '39285 ' +

                                                    '79157389284 ' +
                                                    '04.02.2021 в 09:59 ' +
                                                    '10.04.2021 в 17:59 ' +
                                                    '39286 ' +

                                                    '79157389285 ' +
                                                    '05.02.2021 в 09:56 ' +
                                                    '10.06.2021 в 18:59 ' +
                                                    '39287 ' +

                                                    '79157389286 ' +
                                                    '05.02.2021 в 09:56 ' +
                                                    '10.06.2021 в 18:59 ' +
                                                    '39288 ' +

                                                    '79157389287 ' +
                                                    '05.02.2021 в 09:56 ' +
                                                    '10.06.2021 в 18:59 ' +
                                                    '39289 ' +

                                                    '1 ' +
                                                    'Строк на странице 25'
                                                );

                                                tester.checkbox().withLabel('Недоставленные').expectToBeChecked();
                                                tester.checkbox().withLabel('Доставленные').expectToBeChecked();
                                                tester.checkbox().withLabel('Отправляются').expectToBeChecked();
                                                tester.checkbox().withLabel('Не отправлялись').expectNotToBeChecked();

                                                tester.path.expectQueryToContain({
                                                    date_from: '2020-07-26 00:00:00',
                                                    id: '28394',
                                                    app_id: '4735',
                                                    numa: '79162937183',
                                                    date_till: '2020-08-17 13:21:55',
                                                    is_show_not_sent: 'false',
                                                    is_show_in_process: 'true',
                                                    is_show_undelivered: 'true',
                                                    is_show_delivered: 'true',
                                                    limit: '25',
                                                    offset: '0',
                                                    sort: ['{"field":"event_time","order":"desc"}']
                                                });

                                                tester.table().cell().withContent('79157389283').row().
                                                    querySelector(
                                                        '.event-resending-condition-icon-is_common_conditions_passed'
                                                    ).
                                                    expectNotToHaveClass('event-resending-condition-icon-complied');
                                                tester.table().cell().withContent('79157389283').row().
                                                    querySelector(
                                                        '.event-resending-condition-icon-is_setting_conditions_passed'
                                                    ).
                                                    expectToHaveClass('event-resending-condition-icon-complied');
                                                tester.table().cell().withContent('79157389283').row().
                                                    querySelector(
                                                        '.event-resending-condition-icon-is_filter_conditions_passed'
                                                    ).
                                                    expectToHaveClass('event-resending-condition-icon-complied');

                                                tester.table().cell().withContent('79157389284').row().
                                                    querySelector(
                                                        '.event-resending-condition-icon-is_common_conditions_passed'
                                                    ).
                                                    expectToHaveClass('event-resending-condition-icon-complied');
                                                tester.table().cell().withContent('79157389284').row().
                                                    querySelector(
                                                        '.event-resending-condition-icon-is_setting_conditions_passed'
                                                    ).
                                                    expectNotToHaveClass('event-resending-condition-icon-complied');
                                                tester.table().cell().withContent('79157389284').row().
                                                    querySelector(
                                                        '.event-resending-condition-icon-is_filter_conditions_passed'
                                                    ).
                                                    expectToHaveClass('event-resending-condition-icon-complied');

                                                tester.table().cell().withContent('79157389285').row().
                                                    querySelector(
                                                        '.event-resending-condition-icon-is_common_conditions_passed'
                                                    ).
                                                    expectToHaveClass('event-resending-condition-icon-complied');
                                                tester.table().cell().withContent('79157389285').row().
                                                    querySelector(
                                                        '.event-resending-condition-icon-is_setting_conditions_passed'
                                                    ).
                                                    expectToHaveClass('event-resending-condition-icon-complied');
                                                tester.table().cell().withContent('79157389285').row().
                                                    querySelector(
                                                        '.event-resending-condition-icon-is_filter_conditions_passed'
                                                    ).
                                                    expectNotToHaveClass('event-resending-condition-icon-complied');
                                            });
                                        });
                                        it('Некоторые события никогда не отправлялись.', function() {
                                            amocrmEventsRequest.setNoSendTime().receiveResponse();

                                            tester.root.expectTextContentToHaveSubstring(
                                                '79157389284 ' +
                                                '04.02.2021 в 09:59 ' +
                                                'Не отправлялось ' +
                                                '39286'
                                            );
                                        });
                                        it(
                                            'Некоторые события отправляются в данный момент. Вместо даты отображен ' +
                                            'текст "Отправляется".',
                                        function() {
                                            amocrmEventsRequest.setSending().receiveResponse();

                                            tester.root.expectTextContentToHaveSubstring(
                                                '79157389284 ' +
                                                '04.02.2021 в 09:59 ' +
                                                'Отправляется ' +
                                                '39286'
                                            );
                                        });
                                        it(
                                            'Сообщение об ошибке отсутствует. Отображается сообщение "Неизвестная ' +
                                            'ошибка".',
                                        function() {
                                            amocrmEventsRequest.setNoErrorMessage().receiveResponse();

                                            tester.root.expectTextContentToHaveSubstring(
                                                '79157389283 ' +
                                                '03.02.2021 в 09:58 ' +
                                                'Неизвестная ошибка 10.04.2021 в 16:59 ' +
                                                '39285'
                                            );
                                        });
                                        it(
                                            'Сообщение об ошибке является коротким. Многоточие не отображается.',
                                        function() {
                                            amocrmEventsRequest.setShortErrorMessage().receiveResponse();

                                            tester.root.expectTextContentToHaveSubstring(
                                                '79157389283 ' +
                                                '03.02.2021 в 09:58 ' +
                                                'Сервер не отвечает 10.04.2021 в 16:59 ' +
                                                '39285'
                                            );
                                        });
                                    });
                                });
                                describe('Отмечаю чекбокс "Не отправлялись".', function() {
                                    beforeEach(function() {
                                        tester.checkbox().withLabel('Не отправлялись').click();
                                    });

                                    it(
                                        'Снимаю отметку с чекбокса "Недоставленные". Нажимаю на кнопку "Применить". ' +
                                        'Отправлен запрос событий.',
                                    function() {
                                        tester.checkbox().withLabel('Недоставленные').click();

                                        tester.button('Применить').click();
                                        Promise.runAll();
                                        tester.amocrmEventsRequest().setAllExceptUndelivered().receiveResponse();

                                        tester.path.expectQueryToContain({
                                            is_show_not_sent: 'true',
                                            is_show_in_process: 'true',
                                            is_show_undelivered: 'false',
                                            is_show_delivered: 'true'
                                        });
                                    });
                                    it(
                                        'Снимаю отметку с чекбокса "Доставленные". Нажимаю на кнопку "Применить". ' +
                                        'Отправлен запрос событий.',
                                    function() {
                                        tester.checkbox().withLabel('Доставленные').click();

                                        tester.button('Применить').click();
                                        Promise.runAll();
                                        tester.amocrmEventsRequest().setAllExceptDelivered().receiveResponse();

                                        tester.path.expectQueryToContain({
                                            is_show_not_sent: 'true',
                                            is_show_in_process: 'true',
                                            is_show_undelivered: 'true',
                                            is_show_delivered: 'false'
                                        });
                                    });
                                });
                                it(
                                    'Указываю другое время. Нажимаю на кнопку "Применить". Отправляется запрос с ' +
                                    'другим временем.',
                                function() {
                                    tester.calendar().timePickerButton().click();
                                    tester.forceUpdate();

                                    tester.calendar().timePicker().left().hour('06').click();
                                    tester.calendar().timePicker().left().minute('07').click();
                                    tester.calendar().timePicker().left().second('08').click();

                                    tester.calendar().timePicker().right().hour('07').click();
                                    tester.calendar().timePicker().right().minute('09').click();
                                    tester.calendar().timePicker().right().second('10').click();

                                    tester.calendar().okButton().click();

                                    tester.button('Применить').click();
                                    Promise.runAll();
                                    tester.amocrmEventsRequest().changeRangeTime().receiveResponse();
                                });
                            });
                            describe('Дата начала и дата окончания больше текущей.', function() {
                                beforeEach(function() {
                                    tester.calendar().left().cell('26').click();
                                    tester.forceUpdate();
                                    tester.calendar().right().cell('17').click();
                                    tester.forceUpdate();
                                    tester.calendar().okButton().click();
                                });

                                it('Выбрана сегодняшняя дата.', function() {
                                    tester.textfield().withPlaceholder('Начальная дата').
                                        expectToHaveValue('24.08.2020 00:00:00');
                                    tester.textfield().withPlaceholder('Конечная дата').
                                        expectToHaveValue('24.08.2020 13:21:55');
                                });
                                it(
                                    'Нажимаю на кнопку "Применить". Отправляется запрос сегодняшних событий.',
                                function() {
                                    tester.button('Применить').click();
                                    Promise.runAll();
                                    tester.amocrmEventsRequest().setDefaultDateRange().expectToBeSent();
                                });
                            });
                            describe('Дата начала меньше текущей, а дата окончания больше текущей.', function() {
                                beforeEach(function() {
                                    tester.calendar().left().cell('10').click();
                                    tester.forceUpdate();
                                    tester.calendar().right().cell('17').click();
                                    tester.forceUpdate();
                                    tester.calendar().okButton().click();
                                });

                                it('Выбрана сегодняшняя дата в качестве конечной.', function() {
                                    tester.textfield().withPlaceholder('Начальная дата').
                                        expectToHaveValue('10.08.2020 00:00:00');
                                    tester.textfield().withPlaceholder('Конечная дата').
                                        expectToHaveValue('24.08.2020 13:21:55');
                                });
                                it(
                                    'Нажимаю на кнопку "Применить". Отправляется запрос событий отфильтрованый по ' +
                                    'периоду, окончанием которого является сегодняшний день.',
                                function() {
                                    tester.button('Применить').click();
                                    Promise.runAll();
                                    tester.amocrmEventsRequest().setAnotherDateRange().expectToBeSent();
                                });
                            });
                        });
                        it(
                            'Нажимаю на кнопка "Применить". Отправляется запрос событий с дефолтными параметрами.',
                        function() {
                            tester.button('Применить').click();
                            Promise.runAll();
                            tester.amocrmEventsRequest().setDefaultParams().receiveResponse();
                        });
                    });
                    it('Выбираю bitrix.', function() {
                        tester.select().withPlaceholder('Тип CRM').arrowIcon().click();
                        tester.select().option('bitrix').click();

                        tester.button('Применить').click();
                        Promise.runAll();
                        tester.amocrmEventsRequest().setDefaultParams().setBitrix().receiveResponse();

                        tester.table().cell().withContent('79157389283').row().checkbox().click();
                        tester.table().cell().withContent('79157389285').row().checkbox().click();

                        tester.button('Повторить отправку').click();
                        Promise.runAll();
                        tester.amocrmEventsResendingRequest().setTwoEvents().setBitrix().expectToBeSent();
                    });
                });
                it('Кнопка "Применить" заблокирована. Выбран период со вчерашнего дня по сегдняшний.', function() {
                    tester.button('Применить').expectToHaveAttribute('disabled');

                    tester.textfield().withPlaceholder('Начальная дата').expectToHaveValue('24.08.2020 00:00:00');
                    tester.textfield().withPlaceholder('Конечная дата').expectToHaveValue('24.08.2020 13:21:55');
                });
            });
            describe('Открываю раздел "CRM-интеграции". Нажимаю на кнопку "Применить".', function() {
                beforeEach(function() {
                    tester.path.open('/crm-integrations');
                    Promise.runAll();
                    tester.directionRequest().addAppStates().receiveResponse();

                    tester.button('Применить').click();
                    Promise.runAll();
                    tester.integrationsRequest().receiveResponse();
                });

                it(
                    'Нажимаю на кнопку действий в строке, относящейся к amoCRM. Отображена ссылка на раздел ' +
                    'переотправки событий.',
                function() {
                    tester.table().cell().withContent('amoCRM').row().actionsMenu().click();

                    tester.menuitem('Переотправить события').expectHrefToHavePath('/event-resending');
                    tester.menuitem('Переотправить события').expectHrefQueryToContain({
                        app_id: '295684',
                        partner: 'amocrm'
                    });
                });
                it(
                    'В строках, не относящихся к amoCRM отображается ссылка на раздел переотправки событий.',
                function() {
                    tester.table().cell().withContent('customCRM').row().actionsMenu().click();
                    tester.menuitem('Переотправить события').expectToHaveClass('ant-dropdown-menu-item-disabled');
                });
            });
            it(
                'Открываю раздел "Переотправка событий" с фильтром. Дата начала и дата окончания больше текущей. ' +
                'Выбрана сегодняшняя дата.',
            function() {
                tester.path.open('/event-resending', {
                    date_from: '2020-08-26 00:00:00',
                    date_till: '2020-09-17 23:59:59',
                    id: '28394',
                    app_id: '4735',
                    partner: 'amocrm',
                    numa: '79162937183',
                    is_show_not_sent: 'false',
                    is_show_in_process: 'true',
                    is_show_undelivered: 'true',
                    is_show_delivered: 'true',
                    limit: '25',
                    offset: '0',
                    sort: ['{"field":"event_time","order":"desc"}']
                });

                Promise.runAll();
                tester.amocrmEventsRequest().setDefaultDateRange().receiveResponse();

                tester.textfield().withPlaceholder('Начальная дата').expectToHaveValue('24.08.2020 00:00:00');
                tester.textfield().withPlaceholder('Конечная дата').expectToHaveValue('24.08.2020 13:21:55');
            });
            it(
                'Открываю раздел "Переотправка событий" с фильтром. Дата начала меньше текущей, а дата окончания ' +
                'больше текущей. Выбрана сегодняшняя дата в качестве конечной.',
            function() {
                tester.path.open('/event-resending', {
                    date_from: '2020-08-10 00:00:00',
                    date_till: '2020-09-17 23:59:59',
                    id: '28394',
                    app_id: '4735',
                    partner: 'amocrm',
                    numa: '79162937183',
                    is_show_not_sent: 'false',
                    is_show_in_process: 'true',
                    is_show_undelivered: 'true',
                    is_show_delivered: 'true',
                    limit: '25',
                    offset: '0',
                    sort: ['{"field":"event_time","order":"desc"}']
                });

                Promise.runAll();
                tester.amocrmEventsRequest().setAnotherDateRange().receiveResponse();

                tester.textfield().withPlaceholder('Начальная дата').expectToHaveValue('10.08.2020 00:00:00');
                tester.textfield().withPlaceholder('Конечная дата').expectToHaveValue('24.08.2020 13:21:55');
            });
            it(
                'Открываю раздел "Переотправка событий" с фильтром. Дата окончания меншье текущей. Отправлен запрос ' +
                'событий с фильтрацией. Поля фильтра заполнены.',
            function() {
                tester.path.open('/event-resending', {
                    date_from: '2020-07-26 00:00:00',
                    date_till: '2020-08-17 13:21:55',
                    id: '28394',
                    app_id: '4735',
                    partner: 'customCRM',
                    numa: '79162937183',
                    is_show_not_sent: 'false',
                    is_show_in_process: 'false',
                    is_show_undelivered: 'true',
                    is_show_delivered: 'false',
                    limit: '25',
                    offset: '0',
                    sort: ['{"field":"event_time","order":"asc"}']
                });

                Promise.runAll();
                tester.amocrmEventsRequest().setAscDirection().setUndeliveredOnly().setCustomCRM().receiveResponse();

                tester.select().withPlaceholder('Тип CRM').expectToHaveValue('customCRM');
                tester.textfield().withPlaceholder('App ID').expectToHaveValue('4735');
                tester.textfield().withPlaceholder('ID сессии').expectToHaveValue('28394');
                tester.textfield().withPlaceholder('Номер абонента').expectToHaveValue('79162937183');
                tester.textfield().withPlaceholder('Начальная дата').expectToHaveValue('26.07.2020 00:00:00');
                tester.textfield().withPlaceholder('Конечная дата').expectToHaveValue('17.08.2020 13:21:55');
                tester.checkbox().withLabel('Недоставленные').expectToBeChecked();
                tester.checkbox().withLabel('Доставленные').expectNotToBeChecked();
                tester.checkbox().withLabel('Отправляются').expectNotToBeChecked();
                tester.checkbox().withLabel('Не отправлялись').expectNotToBeChecked();
            });
            it('Пункты меню "Переотправка событий" и "Фичефлаги" отображены.', function() {
                tester.menuitem('Переотправка событий').expectHrefToHavePath('/event-resending');
                tester.menuitem('Фичефлаги').expectHrefToHavePath('/feature-flags');
            });
        });
        describe('Доступен только раздел "Пользовтатели".', function() {
            beforeEach(function() {
                userRequest.allowReadUsers().receiveResponse();
            });

            it('Заполняю поле "App ID". Нажимаю на кнопку "Применить".', function() {
                tester.textfield().withPlaceholder('App ID').fill('4735');

                tester.button('Применить').click();
                Promise.runAll();
                tester.usersRequest().receiveResponse();

                tester.root.expectToHaveTextContent(
                    'Новосистем ' +
                    'Admin Panel ' +
                    'Пользователи ' +

                    'Пользователи ' +

                    'Фильтры: Пользователь софтфона Применить ' +

                    'App ID ' +
                    'Customer ID ' +
                    'Имя клиента ' +
                    'Пользователь ' +
                    'Сотрудник ' +
                    'Логин в софтфоне ' +
                    'Номер ' +

                    '4735 ' +
                    '94285 ' +
                    'ООО "Трупоглазые жабы" ' +
                    'Администратор ' +
                    'Барова Елена ' +
                    'admin@corpseeydtoads.com ' +
                    '79162938296 ' +

                    '1 ' +
                    'Строк на странице 50 ' +
                    'Всего записей 1'
                );
            });
            it('Отображен только пункт меню "Пользователи".', function() {
                tester.menuitem('Переотправка событий').expectNotToExist();
                tester.menuitem('Пользователи').expectToBeVisible();

                tester.root.expectToHaveTextContent(
                    'Новосистем ' +
                    'Admin Panel ' +
                    'Пользователи ' +

                    'Пользователи ' +

                    'Фильтры: Пользователь софтфона Применить ' +

                    'App ID ' +
                    'Customer ID ' +
                    'Имя клиента ' +
                    'Пользователь ' +
                    'Сотрудник ' +
                    'Логин в софтфоне ' +
                    'Номер ' +

                    'Нет данных ' +

                    '1 ' +
                    'Строк на странице 50 ' +
                    'Всего записей 0'
                );
            });
        });
        describe('Доступен только раздел "Клиенты".', function() {
            beforeEach(function() {
                userRequest.
                    allowReadStatisticsRevisionHistory().
                    allowReadmanagementAppsLoginToApp().
                    allowReadApps().
                    allowWriteApps().
                    receiveResponse();

                tester.directionRequest().addAppStates().addTpTpvAll().receiveResponse();
            });

            describe('Нажимаю на кнпоку "Применить".', function() {
                beforeEach(function() {
                    tester.button('Применить').click();
                    Promise.runAll();
                    tester.appsRequest().receiveResponse();
                });

                describe('Нажимаю на заголовок колонки "App ID". Отправлен запрос без сортировки.', function() {
                    beforeEach(function() {
                        tester.table().header().withContent('App ID').click();
                        Promise.runAll();
                        tester.appsRequest().setNoSort().receiveResponse();
                    });

                    it(
                        'Нажимаю на заголовок колонки "App ID". Отправлен запрос с сортировкой по возрастанию. ' +
                        'Отображена стрелочка вверх под заголовком колонки "App ID".',
                    function() {
                        tester.table().header().withContent('App ID').click();
                        Promise.runAll();
                        tester.appsRequest().setAscDirection().receiveResponse();

                        tester.table().header().withContent('App ID').sortIcon().expectToBeArrowUp();
                    });
                    it('Под заголовком "App ID" нет стрелочки.', function() {
                        tester.table().header().withContent('App ID').sortIcon().expectNotToExist();
                    });
                });
                it('Нажимаю на кнпоку меню в строке таблицы. Открывается меню.', function() {
                    tester.table().cell().withContent('ООО "Трупоглазые жабы" # 1').row().actionsMenu().click();
                    Promise.runAll(false, true);
                    tester.appUsersRequest().receiveResponse();

                    tester.dropdown.expectToHaveTextContent(
                        'История изменений ' +
                        'Редактирование клиента ' +

                        'Перейти в ЛК ' +
                        'Ок ' +

                        'Перейти в Новый ЛК ' +
                        'Ок'
                    );
                });
                it(
                    'Нажимаю на кнопку второй страницы. Получены данные второй страницы. Отображена вторая страница.',
                function() {
                    tester.table().paging().page(2).click();
                    Promise.runAll();
                    tester.appsRequest().setSecondPage().receiveResponse();

                    tester.table().paging().page(1).expectNotToHaveClass('pagination-item-active');
                    tester.table().paging().page(2).expectToHaveClass('pagination-item-active');
                });
                it(
                    'Отображена первая страница. Отображена стрелочка вниз под заголовком колонки "App ID".',
                function() {
                    tester.table().header().withContent('App ID').sortIcon().expectToBeArrowDown();
                    
                    tester.table().paging().page(1).expectToHaveClass('pagination-item-active');
                    tester.table().paging().page(2).expectNotToHaveClass('pagination-item-active');

                    tester.root.expectTextContentToHaveSubstring(
                        '1 2 ' +
                        'Строк на странице 50 ' +
                        'Всего записей 75'
                    );
                });
            });
            it('В поле статусов отображены названия статусов.', function() {
                tester.root.expectTextContentToHaveSubstring(
                    'Статусы ' +

                    'Ждет ' +
                    'Активен ' +
                    'Заблокирован вручную ' +
                    'Заблокирован по лимиту ' +
                    'Заблокирован по долгу ' +

                    'Применить'
                );
            });
        });
        it(
            'Доступен только раздел "CRM-интеграции". Нажимаю на кнопку действий в строке, относящейся к amoCRM. ' +
            'Ссылка на раздел переотправки событий заблокирована. ',
        function() {
            userRequest.allowReadCrmIntegration().receiveResponse();
            tester.directionRequest().addAppStates().receiveResponse();

            tester.button('Применить').click();
            Promise.runAll();
            tester.integrationsRequest().receiveResponse();

            tester.table().cell().withContent('amoCRM').row().actionsMenu().click();
            tester.menuitem('Переотправить события').expectToHaveClass('ant-dropdown-menu-item-disabled');
        });
        it(
            'Доступен раздел "Переотправка событий". Прав на запись в разделе нет. Заполняю поля фильтра. Кнопка ' +
            '"Повторить отправку" заблокирована.',
        function() {
            userRequest.allowReadEventResending().receiveResponse();

            tester.select().withPlaceholder('Тип CRM').arrowIcon().click();
            tester.select().option('amoCRM').click();

            tester.textfield().withPlaceholder('App ID').fill('4735');
            tester.textfield().withPlaceholder('ID сессии').fill('28394');
            tester.textfield().withPlaceholder('Номер абонента').fill('79162937183');
            tester.textfield().withPlaceholder('Начальная дата').click();
            tester.forceUpdate();

            tester.calendar().left().prevMonth().click();
            tester.calendar().left().cell('26').click();
            tester.forceUpdate();
            tester.calendar().right().cell('17').click();
            tester.forceUpdate();
            tester.calendar().okButton().click();

            tester.button('Применить').click();
            Promise.runAll();
            tester.amocrmEventsRequest().receiveResponse();

            tester.table().cell().withContent('79157389283').row().checkbox().click();
            tester.button('Повторить отправку').expectToHaveAttribute('disabled');
        });
    });
});
