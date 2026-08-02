tests.addTest(options => {
    const {
        Tester,
        setFocus,
        notificationTester,
        spendTime,
        postMessages,
        unfilteredPostMessages,
        setNow,
        setDocumentVisible,
        windowOpener,
        ajax,
        utils,
        webSockets,
        audioDecodingTester,
        fileReader,
        unload,
    } = options;

    describe('Включено расширение Chrome или виджет интеграции с CRM.', function() {
        let tester;

        beforeEach(function() {
            setNow('2019-12-19T12:10:06');
        });

        afterEach(function() {
            postMessages.nextMessage().expectNotToExist();

            if (!tester) {
                return;
            }

            tester.restoreSalesbotIFrameContentWindow();
            tester.restoreSoftphoneIFrameContentWindow();
            tester.restoreNotificationIFrameContentWindow();

            tester.chrome.
                tabs.
                current.
                nextMessage().
                expectNotToExist();

            tester.chrome.
                runtime.
                background.
                nextMessage().
                expectNotToExist();

            tester.chrome.
                runtime.
                popup.
                nextMessage().
                expectNotToExist();

            tester.chrome.
                identity.
                authFlow.
                nextLaunching().
                expectNotToExist();

            tester.chrome.
                permissions.
                nextRequest().
                expectNotToExist();
        });

        xdescribe('Открываю виджет amoCRM.', function() {
            beforeEach(function() {
                tester = new Tester({
                    softphoneHost: 'my.uiscom.ru',
                    ...options,
                    application: 'amocrm',
                    env: { REACT_APP_CUSTOM_SETTINGS_ENABLED: 'true' },
                });
            });

            describe('Получено состояние софтфона. Софтфон должен быть видимым.', function() {
                beforeEach(function() {
                    tester.stateSettingRequest().
                        visible().
                        leader().
                        receive();

                    tester.amocrmStateSettingRequest().expectToBeSent();

                    tester.tokenInitializationRequest().
                        emptyToken().
                        receive();

                    postMessages.nextMessage().expectMessageToContain({
                        method: 'set_token',
                        data: '',
                    });
                });

                describe('Получен дубайский токен авторизации.', function() {
                    beforeEach(function() {
                        postMessages.receive({
                            method: 'set_token',
                            data: tester.anotherOauthToken,
                        });
                    });

                    it('Получен запрос изменения состояния.', function() {
                        tester.stateSettingRequest().
                            leader().
                            receive();

                        tester.amocrmStateSettingRequest().expectToBeSent();
                        tester.softphoneVisibilityToggleRequest().expectToBeSent();

                        tester.stateSettingRequest().
                            visible().
                            leader().
                            receive();

                        tester.tokenInitializationRequest().
                            emptyToken().
                            receive();

                        postMessages.nextMessage().expectMessageToContain({
                            method: 'set_token',
                            data: tester.anotherOauthToken,
                        });

                        postMessages.receive({
                            method: 'set_token',
                            data: tester.anotherOauthToken,
                        });
                    });
                    it('IFrame изменился.', function() {
                        tester.iframe.expectToBeVisible();

                        tester.localStorage.
                            key('data_center').
                            expectToHaveValue('dubai');

                        tester.iframe.expectAttributeToHaveValue(
                            'src',
                            'https://prod-msk-softphone-widget-iframe.callgear.ae/amocrm/softphone'
                        );
                    });
                });
                describe('Получен токен авторизации.', function() {
                    beforeEach(function() {
                        postMessages.receive({
                            method: 'set_token',
                            data: tester.oauthToken,
                        });
                    });

                    it('Получен запрос скачивания лога. Лог скачивается.', function() {
                        postMessages.receive(
                            'ignore:log:[https://somedomain] POST https://my.uiscom.ru/sup/auth/token'
                        );

                        tester.logDownloadingRequest().
                            windowMessage().
                            receive();
                        
                        tester.anchor.
                            withFileName('20191219.121006.000.log.txt').
                            expectHrefToBeBlobWithSubstrings([
                                'Thu Dec 19 2019 12:10:06 GMT+0300 (Moscow Standard Time) Window message received',
                                '{"method":"set_token","data":"eyJ',//}
                                
                                'POST https://my.uiscom.ru/sup/auth/token',
                            ]);
                    });
                    it('Получен пустой токен. Предыдущий сохраненный токен не был передан в IFrame.', function() {
                        tester.stateSettingRequest().
                            leader().
                            receive();

                        postMessages.receive({
                            method: 'set_token',
                            data: '',
                        });
                    });
                    it('URL IFrame не изменился.', function() {
                        tester.iframe.expectToBeVisible();

                        tester.localStorage.
                            key('data_center').
                            expectToBeEmpty();

                        tester.iframe.expectAttributeToHaveValue(
                            'src',
                            'https://prod-msk-softphone-widget-iframe.uiscom.ru/amocrm/softphone',
                        );
                    });
                });
                describe('Софтфон недоступен.', function() {
                    beforeEach(function() {
                        tester.availabilitySettingRequest().
                            unavailable().
                            receive();
                    });

                    it(
                        'Нажимаю на иконку с телефоном. Запрос изменения видимости не был отправлен в IFrame софтфона.',
                    function() {
                        tester.phoneIcon.click();
                    });
                    it('Софтфон скрыт.', function() {
                        tester.iframe.expectToBeHidden();
                    });
                });
                describe('Софтфон доступен.', function() {
                    beforeEach(function() {
                        tester.availabilitySettingRequest().receive();
                    });

                    it(
                        'Нажимаю на иконку с телефоном. Запрос изменения видимости не был отправлен В IFrame софтфона.',
                    function() {
                        tester.phoneIcon.click();
                        tester.softphoneVisibilityToggleRequest().expectToBeSent();
                    });
                    it('Софтфон отображен.', function() {
                        tester.iframe.expectToBeVisible();
                    });
                });
                it('Нажимаю на номер телефона. В софтфон отправлен запрос звонка.', function() {
                    tester.contactPhone('79161234567').click();

                    postMessages.nextMessage().expectMessageToContain({
                        method: 'start_call',
                        data: '79161234567',
                    });
                });
                it(
                    'Нажимаю на иконку с телефоном. В IFrame софтфона отправлен запрос изменения видимости.',
                function() {
                    tester.phoneIcon.click();
                    tester.softphoneVisibilityToggleRequest().expectToBeSent();
                });
                it('Софтфон отображен.', function() {
                    tester.iframe.expectToBeVisible();

                    tester.iframe.expectAttributeToHaveValue(
                        'src',
                        'https://prod-msk-softphone-widget-iframe.uiscom.ru/amocrm/softphone',
                    );
                });
            });
            it(
                'Открываю настройки. Нажимаю на кнопку установки. Открыто окно установки. Нажимаю на кнопоку ' +
                'настроек. Открыто окно настроек.',
            function() {
                tester.openSettings();
                tester.button('Завершить установку').click();

                windowOpener.
                    expectToHavePath('https://uc-sso-prod-api.uiscom.ru/login').
                    expectQueryToContain({
                        continue: 'https://www.amocrm.ru/oauth?client_id=e4830af5-279e-440b-a955-18a3cf60fd3c',
                    });

                tester.button('Перейти к настройкам').click();
                windowOpener.expectToHavePath('https://go.uiscom.ru/marketplace/integration_list');
            });
            it('IFrame скрыт.', function() {
                tester.iframe.expectToBeHidden();
            });
        });
        xdescribe('Открываю виджет чатов amoCRM.', function() {
            beforeEach(function() {
                tester = new Tester({
                    softphoneHost: 'my.uiscom.ru',
                    ...options,
                    application: 'amocrmChats',
                    renderAmocrmLead: true,
                    env: { REACT_APP_CUSTOM_SETTINGS_ENABLED: 'true' },
                });

                tester.chatsParentBroadcastChannel().
                    applyLeader().
                    expectToBeSent().
                    waitForSecond();

                tester.chatsParentBroadcastChannel().
                    applyLeader().
                    expectToBeSent().
                    waitForSecond();

                tester.chatsParentBroadcastChannel().
                    tellIsLeader().
                    expectToBeSent();

                notificationTester.grantPermission();
            });

            describe('Открываю страницу контакта.', function() {
                beforeEach(function() {
                    tester.renderContact();
                });

                describe('Инициализировано содержимое IFrame.', function() {
                    beforeEach(function() {
                        tester.unreadMessagesCountSettingRequest().receive();

                        tester.iconRequest().
                            arrow().
                            receiveResponse();

                        tester.amocrmStateSettingRequest().
                            chats().
                            expectToBeSent();

                        tester.shortPhoneSettingRequest().expectToBeSent();

                        tester.tokenInitializationRequest().
                            chats().
                            emptyToken().
                            receive();

                        postMessages.nextMessage().expectMessageToContain({
                            method: 'set_token',
                            data: '',
                        });
                    });

                    describe('Сотрудник авторизован.', function() {
                        beforeEach(function() {
                            postMessages.receive({
                                method: 'set_token',
                                data: tester.oauthToken,
                            });

                            tester.sourcesSettingRequest().receive();
                            spendTime(0);

                            tester.iconRequest().receiveResponse();

                            tester.channelsSearchingRequest().
                                second().anotherPhone().
                                atIndex(2).email().
                                atIndex(3).thirdPhone().
                                expectToBeSent();
                        });

                        describe('Получен список каналов.', function() {
                            beforeEach(function() {
                                tester.channelsSearchingResponse().
                                    addChannel().
                                    addThirdChannel().
                                    unavailable().
                                    receive();

                                tester.channelsSearchingResponse().
                                    anotherChannel().
                                    receive();

                                tester.channelsSearchingResponse().
                                    thirdChannel().
                                    receive();

                                tester.channelsSearchingResponse().
                                    fourthChannel().
                                    receive();

                                tester.channelsSearchingResponse().
                                    email().
                                    receive();
                            });

                            describe('Раскрываю группу.', function() {
                                beforeEach(function() {
                                    tester.rightPanel.
                                        group('74951234575').
                                        title.
                                        click();
                                });

                                describe('Выбираю канал.', function() {
                                    beforeEach(function() {
                                        tester.button('Белгород').click();

                                        tester.chatOpeningRequest().
                                            fifthChannel().
                                            expectToBeSent();
                                    });

                                    it('Появилась левая панель. IFrame не закрывает левую панель.', function() {
                                        tester.page.triggerMutation();

                                        tester.iframe.
                                            withSrc(
                                                'https://prod-msk-softphone-widget-iframe.uiscom.ru/' +
                                                'amocrm/chats/messages'
                                            ).
                                            expectToHaveLeftOffset(200);
                                    });
                                    it('IFrame не закрывает левое меню.', function() {
                                        tester.iframe.
                                            withSrc(
                                                'https://prod-msk-softphone-widget-iframe.uiscom.ru/' +
                                                'amocrm/chats/messages'
                                            ).
                                            expectToHaveLeftOffset(65);
                                    });
                                });
                                it('Скрываю группу. Группа скрыта.', function() {
                                    tester.rightPanel.
                                        group('74951234575').
                                        title.
                                        click();

                                    tester.rightPanel.
                                        group('74951234575').
                                        expectToBeCollapsed();
                                });
                                it('Группа раскрыта.', function() {
                                    tester.rightPanel.
                                        group('74951234575').
                                        expectToBeExpanded();
                                });
                                it(
                                    'При наведении курсора мыши на недоступный канал отображается сообщение об ошибке.',
                                function() {
                                    tester.rightPanel.
                                        group('74951234575').
                                        item('Нижний Новгород').
                                        expectAttributeToHaveValue(
                                            'title',
                                            'По этим контактным данным уже был создан чат другим оператором',
                                        )
                                });
                                it('Выбираю недоступный канал. Ничего не происходит.', function() {
                                    tester.button('Нижний Новгород').click();
                                });
                            });
                            describe('Нажимаю на номер телефона контакта.', function() {
                                beforeEach(function() {
                                    tester.contactPhonePopup.show();
                                });

                                it('Нажимаю на канал являющийся моим. Открывается окно РМО.', function() {
                                    tester.contactPhonePopup.
                                        item('WhatsApp Web 21 (UIS WhatsApp)').
                                        click();

                                    tester.chatOpeningRequest().
                                        fourthChannel().
                                        expectToBeSent();
                                });
                                it('Нажимаю на канал не являющийся моим. Окно РМО не открывается.', function() {
                                    tester.contactPhonePopup.
                                        item('WhatsApp Web 31 (UIS WhatsApp)').
                                        click();
                                });
                                it('Отображён список каналов.', function() {
                                    tester.contactPhonePopup.expectToHaveTextContent(
                                        'Позвонить UIS ' +
                                        'Mango Chats ' +

                                        'WhatsApp Web 21 (UIS WhatsApp) ' +
                                        'WhatsApp Web 31 (UIS WhatsApp) ' +
                                        'lykov_test_bot (UIS Telegram Bot) ' +
                                        'ASK_TGbot (UIS Telegram Bot) ' +
                                        'bykov_test_bot (UIS Telegram Bot) ' +
                                        'pykov_test_bot ' +

                                        'Копировать ' +
                                        'Редактировать'
                                    );
                                });
                            });
                            it(
                                'Получено сообщение об очистке кэша поиска каналов. Запрос поиска каналов отправлен ' +
                                'повторно.',
                            function() {
                                tester.channelsCacheClearingEvent().receive();

                                tester.channelsSearchingRequest().
                                    second().anotherPhone().
                                    atIndex(2).email().
                                    atIndex(3).thirdPhone().
                                    expectToBeSent();
                            });
                            it('Отображён список каналов.', function() {
                                tester.rightPanel.
                                    group('74951234575').
                                    expectToBeCollapsed();

                                tester.rightPanel.expectToHaveTextContent(
                                    '74951234575 ' +

                                    'Нижний Новгород ' +
                                    'Белгород ' +
                                    'Астана ' +

                                    '74951234576 ' +
                                    'Ереван ' +

                                    'a.anshakov@comagic.dev ' +
                                    'Сантьяго ' +

                                    '74951234584 ' +
                                    'Тбилиси'
                                );
                            });
                        });
                        describe('Получено состояние софтфона.', function() {
                            beforeEach(function() {
                                tester.stateSettingRequest().receive();
                                tester.amocrmStateSettingRequest().expectToBeSent();
                            });

                            it('Получен запрос скачивания лога. Лог скачивается.', function() {
                                postMessages.receive(
                                    'ignore:log:[https://somedomain] ' +
                                    'POST https://dev-int0-chats-logic.uis.st/v1/operator?method=get_account'
                                );

                                tester.logDownloadingRequest().
                                    windowMessage().
                                    receive();

                                tester.anchor.
                                    withFileName('20191219.121006.000.log.txt').
                                    expectHrefToBeBlobWithSubstrings([
                                        'Thu Dec 19 2019 12:10:06 GMT+0300 (Moscow Standard Time) ' +
                                        'Window message received',

                                        '{"method":"set_token","data":"eyJ',//}
                                        
                                        'POST https://dev-int0-chats-logic.uis.st/v1/operator?method=get_account',
                                    ]);
                            });
                            it('Нажимаю на иконку трубки. Софтфон видим.', function() {
                                tester.phoneIcon.click();
                                tester.softphoneVisibilityToggleRequest().expectToBeSent();

                                tester.stateSettingRequest().
                                    visible().
                                    receive();

                                tester.iframe.
                                    withSrc('https://prod-msk-softphone-widget-iframe.uiscom.ru/amocrm/softphone').
                                    expectToBeVisible();

                                tester.navMenu.item('UIS Софтфон').expectNotToExist();
                            });
                            it(
                                'Установлен виджет Мегафон. Проходит некоторое время. Нажимаю на иконку трубки. ' +
                                'Софтфон скрыт.',
                            function() {
                                tester.addInstalledWidget('amo_megafon2');
                                spendTime(1000);

                                tester.phoneIcon.click();
                                tester.navMenu.item('UIS Софтфон').expectToBeVisible();
                            });
                            it(
                                'В софтфоне получены данные сотрудника. Короткий номер сотрудника отправлен В IFrame ' +
                                'чатов.',
                            function() {
                                tester.stateSettingRequest().
                                    userDataFetched().
                                    leader().
                                    receive();

                                tester.shortPhoneSettingRequest().
                                    userDataFetched().
                                    expectToBeSent();
                            });
                            it('Софтфон скрыт.', function() {
                                tester.iframe.
                                    withSrc('https://prod-msk-softphone-widget-iframe.uiscom.ru/amocrm/softphone').
                                    expectToBeHidden();
                            });
                        });
                        describe('Установлен виджет Мегафон. Получено состояние софтфона.', function() {
                            beforeEach(function() {
                                tester.addInstalledWidget('amo_megafon2');

                                tester.stateSettingRequest().receive();
                                tester.amocrmStateSettingRequest().expectToBeSent();
                            });

                            it('Нажимаю на пункт меню софтфона.', function() {
                                tester.navMenu.
                                    item('UIS Софтфон').
                                    click();

                                tester.softphoneVisibilityToggleRequest().expectToBeSent();
                            });
                            it('Иконка трубки отсутствует.', function() {
                                tester.phoneIcon.click();
                            });
                        });
                        it('Отбражен список номера телефонов и E-Mail.', function() {
                            tester.iframe.
                                withSrc('https://prod-msk-softphone-widget-iframe.uiscom.ru/amocrm/softphone').
                                expectToBeHidden();

                            tester.body.expectTextContentToHaveSubstring(
                                '74951234575 ' +
                                '74951234576 ' +
                                'a.anshakov@comagic.dev ' +
                                '74951234584'
                            );
                        });
                    });
                    describe('Получен дубайский токен авторизации.', function() {
                        beforeEach(function() {
                            postMessages.receive({
                                method: 'set_token',
                                data: tester.anotherOauthToken,
                            });

                            tester.unreadMessagesCountSettingRequest().receive();
                            tester.iconRequest().receiveResponse();

                            tester.channelsSearchingRequest().
                                second().anotherPhone().
                                atIndex(2).email().
                                atIndex(3).thirdPhone().
                                expectToBeSent();

                            tester.amocrmStateSettingRequest().
                                chats().
                                expectToBeSent();

                            tester.channelsSearchingRequest().
                                second().anotherPhone().
                                atIndex(2).email().
                                atIndex(3).thirdPhone().
                                expectToBeSent();

                            tester.tokenInitializationRequest().
                                chats().
                                emptyToken().
                                receive();

                            postMessages.nextMessage().expectMessageToContain({
                                method: 'set_token',
                                data: tester.anotherOauthToken,
                            });
                        });

                        describe('Раскрываю группу. Спиннер видим.', function() {
                            beforeEach(function() {
                                tester.rightPanel.
                                    group('74951234575').
                                    title.
                                    click();
                            });

                            it('Получен список каналов.', function() {
                                tester.channelsSearchingResponse().
                                    addChannel().
                                    addThirdChannel().
                                    unavailable().
                                    receive();

                                tester.channelsSearchingResponse().
                                    anotherChannel().
                                    receive();

                                tester.channelsSearchingResponse().
                                    thirdChannel().
                                    receive();

                                tester.channelsSearchingResponse().
                                    fourthChannel().
                                    receive();

                                tester.channelsSearchingResponse().
                                    email().
                                    receive();

                                tester.button('Нижний Новгород').expectToBeVisible();
                            });
                            it('Отображён спиннер.', function() {
                                tester.button('Нижний Новгород').expectNotToExist();
                                tester.spin.expectToBeVisible();
                            });
                        });
                        it('URL содержимого IFrame был изменён.', function() {
                            tester.spin.expectNotToExist();

                            tester.iframe.
                                withSrc('https://prod-msk-softphone-widget-iframe.uiscom.ru/amocrm/chats/messages').
                                expectNotToExist();

                            tester.iframe.
                                withSrc('https://prod-msk-softphone-widget-iframe.callgear.ae/amocrm/chats/messages').
                                expectToBeHidden();
                        });
                    });
                    describe('Нажимаю на пункт меню.', function() {
                        beforeEach(function() {
                            tester.navMenuItem.click();
                            tester.chatListOpeningRequest().expectToBeSent();
                        });

                        it('Чаты недоступны. IFrame и пункт меню чатов видимы.', function() {
                            tester.availabilitySettingRequest().
                                unavailable().
                                chats().
                                receive();

                            tester.iframe.
                                withSrc('https://prod-msk-softphone-widget-iframe.uiscom.ru/amocrm/chats/messages').
                                expectToBeHidden();

                            tester.navMenuItem.expectToBeHiddenOrNotExist();
                        });
                        it('Чаты доступны. IFrame и пункт меню чатов видимы.', function() {
                            tester.availabilitySettingRequest().
                                chats().
                                receive();

                            tester.iframe.
                                withSrc('https://prod-msk-softphone-widget-iframe.uiscom.ru/amocrm/chats/messages').
                                expectToBeVisible();

                            tester.navMenuItem.expectToBeVisible();
                        });
                        it('Покидаю страницу чатов. IFrame чатов скрыт.', function() {
                            tester.leavePage();

                            tester.iframe.
                                withSrc('https://prod-msk-softphone-widget-iframe.uiscom.ru/amocrm/chats/messages').
                                expectToBeHidden();
                        });
                        it('Отображён IFrame чатов.', function() {
                            tester.iframe.
                                withSrc('https://prod-msk-softphone-widget-iframe.uiscom.ru/amocrm/chats/messages').
                                expectToBeVisible();
                        });
                    });
                    describe('Получены сообщения.', function() {
                        beforeEach(function() {
                            tester.unreadMessagesCountSettingRequest().
                                value(75).
                                receive();
                        });

                        it('Получены ещё больше сообщений.', function() {
                            tester.unreadMessagesCountSettingRequest().
                                value(76).
                                receive();

                            tester.navMenuItem.expectToHaveTextContent('UIS Чаты 76');
                        });
                        it('Отображено количество непросмотренных сообщений.', function() {
                            tester.navMenuItem.expectToHaveTextContent('UIS Чаты 75');
                            tester.navMenuItem.counter.expectToBeVisible();
                        });
                    });
                    it('Нажимаю на номер телефона контакта. Отображён список каналов.', function() {
                        postMessages.receive({
                            method: 'set_token',
                            data: tester.oauthToken,
                        });

                        tester.sourcesSettingRequest().
                            noOrigins().
                            receive();

                        tester.iconRequest().receiveResponse();

                        tester.channelsSearchingRequest().
                            second().anotherPhone().
                            atIndex(2).email().
                            atIndex(3).thirdPhone().
                            expectToBeSent();

                        tester.channelsSearchingResponse().
                            addChannel().
                            addThirdChannel().
                            unavailable().
                            receive();

                        tester.channelsSearchingResponse().
                            anotherChannel().
                            receive();

                        tester.channelsSearchingResponse().
                            thirdChannel().
                            receive();

                        tester.channelsSearchingResponse().
                            fourthChannel().
                            receive();

                        tester.channelsSearchingResponse().
                            email().
                            receive();

                        tester.contactPhonePopup.show();

                        tester.contactPhonePopup.expectToHaveTextContent(
                            'Позвонить UIS ' +
                            'Mango Chats ' +

                            'WhatsApp Web 21 (UIS WhatsApp) ' +
                            'WhatsApp Web 31 (UIS WhatsApp) ' +
                            'lykov_test_bot (UIS Telegram Bot) ' +
                            'ASK_TGbot (UIS Telegram Bot) ' +
                            'bykov_test_bot (UIS Telegram Bot) ' +

                            'Копировать ' +
                            'Редактировать'
                        );
                    });
                    it('Получен запрос скачивания лога. Лог скачан.', function() {
                        tester.logDownloadingRequest().
                            windowMessage().
                            receive();

                        tester.anchor.
                            withFileName('20191219.121006.000.log.txt').
                            expectHrefToBeBlobWithSubstring(
                                'Thu Dec 19 2019 12:10:06 GMT+0300 (Moscow Standard Time) ' +
                                'Widget installation is not finished'
                            );
                    });
                    it('Открываю окно настроек. Лог скачан.', function() {
                        tester.openSettings();
                        tester.button('Скачать лог').click();

                        tester.anchor.
                            withFileName('20191219.121006.000.log.txt').
                            expectHrefToBeBlobWithSubstring(
                                'Thu Dec 19 2019 12:10:06 GMT+0300 (Moscow Standard Time) ' +
                                'Widget installation is not finished'
                            );
                    });
                    it('Количество нетвеченных сообщений не отображено.', function() {
                        tester.navMenuItem.expectToHaveTextContent('UIS Чаты 0');

                        tester.navMenuItem.counter.expectToBeHiddenOrNotExist();
                        tester.navMenuItem.expectToBeEnabled();

                        tester.iframe.
                            withSrc('https://prod-msk-softphone-widget-iframe.uiscom.ru/amocrm/chats/messages').
                            expectToBeHidden();
                    });
                });
                it('Нажимаю на пункт меню. IFrame чатов не отображён.', function() {
                    tester.navMenuItem.click();
                });
                it('В DOM добавлен IFrame чатов.', function() {
                    tester.iframe.
                        withSrc('https://prod-msk-softphone-widget-iframe.uiscom.ru/amocrm/chats/messages').
                        expectToBeHidden();

                    tester.navMenuItem.expectToBeDisabled();
                });
            });
            describe('Инициализировано содержимое IFrame чатов. Сотрудник авторизован.', function() {
                let salesbotChannelsRequest;

                beforeEach(function() {
                    tester.unreadMessagesCountSettingRequest().receive();

                    tester.iconRequest().
                        arrow().
                        receiveResponse();

                    tester.amocrmStateSettingRequest().
                        chats().
                        expectToBeSent();

                    tester.shortPhoneSettingRequest().expectToBeSent();

                    tester.tokenInitializationRequest().
                        chats().
                        emptyToken().
                        receive();

                    postMessages.nextMessage().expectMessageToContain({
                        method: 'set_token',
                        data: '',
                    });

                    postMessages.receive({
                        method: 'set_token',
                        data: tester.oauthToken,
                    });
                });

                describe('Открываю настройки Salesbot.', function() {
                    beforeEach(function() {
                        tester.salesbot().open();
                        salesbotChannelsRequest = tester.salesbotChannelsRequest().expectToBeSent();
                    });

                    describe('Получены каналы.', function() {
                        beforeEach(function() {
                            salesbotChannelsRequest.receiveResponse();
                        });

                        describe('Содержимое IFrame Salesbot инициализировано.', function() {
                            beforeEach(function() {
                                tester.salesbotParamsSettingRequest().receive();

                                tester.amocrmStateSettingRequest().
                                    salesbot().
                                    expectToBeSent();

                                tester.savedValuesSettingRequest().expectToBeSent();
                            });

                            describe('Открываю вторую фомру настроек Salesbot.', function() {
                                beforeEach(function() {
                                    tester.salesbot().open();
                                    salesbotChannelsRequest = tester.salesbotChannelsRequest().expectToBeSent();

                                    tester.salesbotParamsSettingRequest().
                                        shouldMessageToLastChat().
                                        receive();

                                    tester.salesbotParamsSettingRequest().
                                        notShouldMessageToLastChat().
                                        receive();
                                });

                                describe('Получены каналы. Содержимое IFrame Salesbot инициализировано.', function() {
                                    beforeEach(function() {
                                        salesbotChannelsRequest.receiveResponse();
                                        tester.savedValuesSettingRequest().expectToBeSent();

                                        tester.salesbotParamsSettingRequest().
                                            second().
                                            filled().
                                            receive();

                                        tester.amocrmStateSettingRequest().
                                            salesbot().
                                            expectToBeSent();

                                        tester.savedValuesSettingRequest().expectToBeSent();
                                    });

                                    it('Значения форм различаются.', function() {
                                        tester.salesbot().
                                            hook().
                                            first.
                                            expectBodyToContain({
                                                should_message_to_last_chat: false,
                                                channel_id: 101,
                                                message: '',
                                            });

                                        tester.salesbot().
                                            hook().
                                            atIndex(1).
                                            expectUrlToBe(
                                                'https://prod-msk-mrkt-app-nodes-amocrm.uiscom.ru/amocrm_trigger/' +
                                                    'salesbot/hook'
                                            ).
                                            expectBodyToContain({
                                                should_message_to_last_chat: true,
                                                channel_id: 216400,
                                                message: 'Некое сообщение, отправляемое при каких-то изменениях ' +
                                                    'свойств сделки',
                                                user_id: '7e3c6faf-3723-46ba-a12f-5f52875b4eac',
                                                account_id: '8gls8gka-5829-85ns-sdi3-82glapnzpdkw',
                                            });
                                    });
                                    it(
                                        'Получен запрос шаблонов WABA. Ответ на запрос отправлен в IFrame Salesbot.',
                                    function() {
                                        tester.messageTemplatesRequest().receive();
                                        response = tester.messageTemplatesRequest().receiveResponse();

                                        response.expectResponseToBeSent();
                                        response.expectResponseToBeSent();
                                    });
                                });
                                it('Открыты две формы настроек.', function() {
                                    tester.iframe.atIndex(2).expectAttributeToHaveValue(
                                        'src',
                                        'https://prod-msk-softphone-widget-iframe.uiscom.ru/amocrm/salesbot/1',
                                    );

                                    tester.iframe.atIndex(3).expectAttributeToHaveValue(
                                        'src',
                                        'https://prod-msk-softphone-widget-iframe.uiscom.ru/amocrm/salesbot/2',
                                    );

                                    tester.salesbot().
                                        hook().
                                        atIndex(1).
                                        expectBodyToContain({
                                            should_message_to_last_chat: false,
                                            channel_id: 0,
                                            message: '',
                                        });
                                });
                            });
                            it(
                                'Закрываю настройки Salsebot. Открываю настройки Salesbot ещё раз. Список каналов ' +
                                'отправлен в содержимое IFrame.',
                            function() {
                                tester.salesbot().close();
                                tester.salesbot().open();

                                tester.salesbotChannelsRequest().receiveResponse();

                                tester.salesbotParamsSettingRequest().
                                    second().
                                    filled().
                                    receive();

                                tester.amocrmStateSettingRequest().
                                    salesbot().
                                    expectToBeSent();

                                tester.savedValuesSettingRequest().expectToBeSent();
                            });
                            it(
                                'Открываю вторую фомру настроек Salesbot. Форма была заполнена ранее. Значения формы ' +
                                'отправлены в IFrame.',
                            function() {
                                tester.salesbot().
                                    settingsSaved().
                                    open();

                                tester.salesbotChannelsRequest().receiveResponse();
                                tester.savedValuesSettingRequest().expectToBeSent();

                                tester.salesbotParamsSettingRequest().
                                    second().
                                    receive();

                                tester.amocrmStateSettingRequest().
                                    salesbot().
                                    expectToBeSent();

                                tester.savedValuesSettingRequest().
                                    settingsSaved().
                                    expectToBeSent();
                            });
                            it('Получены новые значения формы настроек.', function() {
                                tester.salesbotParamsSettingRequest().
                                    filled().
                                    receive();

                                tester.salesbot().
                                    hook().
                                    first.
                                    expectUrlToBe(
                                        'https://prod-msk-mrkt-app-nodes-amocrm.uiscom.ru/amocrm_trigger/salesbot/hook'
                                    ).
                                    expectBodyToContain({
                                        should_message_to_last_chat: true,
                                        channel_id: 216400,
                                        message: 'Некое сообщение, отправляемое при каких-то изменениях свойств сделки',
                                        user_id: '7e3c6faf-3723-46ba-a12f-5f52875b4eac',
                                        account_id: '8gls8gka-5829-85ns-sdi3-82glapnzpdkw',
                                    });
                            });
                            it('Получен запрос шаблонов WABA. Ответ на запрос отправлен в IFrame Salesbot.', function() {
                                tester.messageTemplatesRequest().receive();

                                tester.messageTemplatesRequest().
                                    receiveResponse().
                                    expectResponseToBeSent();
                            });
                            it(
                                'Определёно значение по умолчанию для выпадающего списка "Приоритетный канал ' +
                                'WhatsApp".',
                            function() {
                                tester.salesbot().
                                    hook().
                                    first.
                                    expectBodyToContain({
                                        should_message_to_last_chat: false,
                                        channel_id: 101,
                                        message: '',
                                    });
                            });
                        });
                        it(
                            'Определёно значение по умолчанию для выпадающего списка "Приоритетный канал WhatsApp".',
                        function() {
                            tester.salesbot().
                                hook().
                                first.
                                expectBodyToContain({
                                    should_message_to_last_chat: false,
                                    channel_id: 101,
                                    message: '',
                                });
                        });
                    });
                    it('Настройки не заданы.', function() {
                        tester.salesbot().
                            hook().
                            first.
                            expectBodyToContain({
                                should_message_to_last_chat: false,
                                channel_id: 0,
                                message_template_id: 0,
                                message: '',
                                files: '[]',
                            });

                        tester.iframe.first.expectAttributeToHaveValue(
                            'src',
                            'https://prod-msk-softphone-widget-iframe.uiscom.ru/amocrm/chats/messages',
                        );
                        
                        tester.iframe.atIndex(1).expectAttributeToHaveValue(
                            'src',
                            'https://prod-msk-softphone-widget-iframe.uiscom.ru/amocrm/softphone',
                        );

                        tester.iframe.atIndex(2).expectAttributeToHaveValue(
                            'src',
                            'https://prod-msk-softphone-widget-iframe.uiscom.ru/amocrm/salesbot/1',
                        );
                    });
                });
                describe('Открываю настройки Salesbot. Форма была заполнена ранее.', function() {
                    beforeEach(function() {
                        tester.salesbot().
                            settingsSaved().
                            open();

                        tester.salesbotChannelsRequest().receiveResponse();
                    });

                    it('Содержимое IFrame Salesbot инициализировано.', function() {
                        tester.salesbotParamsSettingRequest().receive();

                        tester.amocrmStateSettingRequest().
                            salesbot().
                            expectToBeSent();

                        tester.savedValuesSettingRequest().
                            settingsSaved().
                            expectToBeSent();
                    });
                    it('Настройки были сохранены ранее.', function() {
                        tester.salesbot().
                            hook().
                            first.
                            expectBodyToContain({
                                should_message_to_last_chat: true,
                                channel_id: 216400,
                                message: 'Некое сообщение, отправляемое при каких-то изменениях свойств сделки',
                            });
                    });
                });
                it(
                    'Загрузился старый виджет. Инициализировано содержимое IFrame софтфона. Нажимаю на иконку с ' +
                    'телефоном. Запрос изменения видимости не был отправлен в IFrame софтфона.',
                function() {
                    tester.addInstalledWidget('uis_widget');

                    tester.stateSettingRequest().receive();
                    tester.amocrmStateSettingRequest().expectToBeSent();

                    tester.stateSettingRequest().
                        userDataFetched().
                        leader().
                        receive();

                    tester.shortPhoneSettingRequest().
                        userDataFetched().
                        expectToBeSent();

                    tester.phoneIcon.click();
                    tester.contactPhone('79161234567').click();
                });
                it(
                    'Инициализировано содержимое IFrame софтфона. Нажимаю на иконку с телефоном. Запрос изменения ' +
                    'видимости был отправлен в IFrame софтфона.',
                function() {
                    tester.stateSettingRequest().receive();
                    tester.amocrmStateSettingRequest().expectToBeSent();

                    tester.stateSettingRequest().
                        userDataFetched().
                        leader().
                        receive();

                    tester.shortPhoneSettingRequest().
                        userDataFetched().
                        expectToBeSent();

                    tester.phoneIcon.click();
                    tester.softphoneVisibilityToggleRequest().expectToBeSent();
                });
                it('Открываю страницу контакта. Был отправлен запрос каналов.', function() {
                    tester.renderContact();
                    tester.iconRequest().receiveResponse();

                    tester.channelsSearchingRequest().
                        second().anotherPhone().
                        atIndex(2).email().
                        atIndex(3).thirdPhone().
                        expectToBeSent();
                });
                it(
                    'Нажимаю на иконку с телефоном. Запрос изменения видимости не был отправлен в IFrame софтфона.',
                function() {
                    tester.phoneIcon.click();
                });
                it('Запрос каналов не был отправлен.', function() {
                    postMessages.
                        nextMessage().
                        expectNotToExist();
                });
            });
        });
        xit('Открываю виджет чатов amoCRM. Софтфон выключен. В IFrame передана недоступность софтфона.', function() {
            tester = new Tester({
                softphoneHost: 'my.uiscom.ru',
                ...options,
                application: 'amocrmChats',
                renderAmocrmLead: true,
                env: { REACT_APP_OMNI_SOFTPHONE_ENABLED: 'false' },
            });

            tester.chatsParentBroadcastChannel().
                applyLeader().
                expectToBeSent().
                waitForSecond();

            tester.chatsParentBroadcastChannel().
                applyLeader().
                expectToBeSent().
                waitForSecond();

            tester.chatsParentBroadcastChannel().
                tellIsLeader().
                expectToBeSent();

            notificationTester.grantPermission();

            tester.renderContact();
            tester.unreadMessagesCountSettingRequest().receive();

            tester.iconRequest().
                arrow().
                receiveResponse();

            tester.amocrmStateSettingRequest().
                chats().
                softphoneDisabled().
                expectToBeSent();

            tester.shortPhoneSettingRequest().expectToBeSent();

            tester.tokenInitializationRequest().
                chats().
                emptyToken().
                receive();

            postMessages.nextMessage().expectMessageToContain({
                method: 'set_token',
                data: '',
            });

            tester.navMenuItem.click();
            tester.chatListOpeningRequest().expectToBeSent();

            tester.availabilitySettingRequest().
                chats().
                receive();

            tester.iframe.
                withSrc('https://prod-msk-softphone-widget-iframe.uiscom.ru/amocrm/chats/messages').
                expectToBeVisible();

            tester.navMenuItem.expectToBeVisible();
        });
        xit('Ранее был открыт дубайский IFrame. Дубайский IFrame снова открыт.', function() {
            window.localStorage.setItem('data_center', 'dubai'),

            tester = new Tester({
                softphoneHost: 'my.uiscom.ru',
                ...options,
                application: 'amocrm',
            });

            tester.stateSettingRequest().
                visible().
                receive();

            tester.amocrmStateSettingRequest().expectToBeSent();

            tester.tokenInitializationRequest().
                emptyToken().
                receive();

            postMessages.nextMessage().expectMessageToContain({
                method: 'set_token',
                data: '',
            });

            tester.iframe.expectToBeVisible();

            tester.iframe.expectAttributeToHaveValue(
                'src',
                'https://prod-msk-softphone-widget-iframe.callgear.ae/amocrm/softphone',
            );
        });
        xit(
           'Виджет установлен. Кастомная страница настроек включена. Открываю настройки. Кнопока настроек видима.',
        function() {
            tester = new Tester({
                softphoneHost: 'my.uiscom.ru',
                ...options,
                application: 'amocrm',
                active: true,
                env: { REACT_APP_CUSTOM_SETTINGS_ENABLED: 'true' },
            });

            tester.openSettings();
            tester.button('Перейти к настройкам').expectToBeVisible();
        });
        xit('Виджет установлен. Открываю настройки. Кнопока настроек видима.', function() {
            tester = new Tester({
                softphoneHost: 'my.uiscom.ru',
                ...options,
                application: 'amocrm',
                active: true,
            });

            tester.openSettings();
            tester.button('Перейти к настройкам').expectNotToExist();

            tester.body.expectTextContentToHaveSubstringsConsideringOrder(
                'Некое описание ' +
                'Включить интеграцию'
            );
        });
        xit('Должен использоваться английский язык. Открываю настройки. Используется английский язык.', function() {
            tester = new Tester({
                softphoneHost: 'my.uiscom.ru',
                ...options,
                application: 'amocrm',
                lang: 'en',
                active: true,
                env: { REACT_APP_CUSTOM_SETTINGS_ENABLED: 'true' },
            });

            tester.openSettings();
            tester.button('Open settings').expectToBeVisible();
        });
        it('Открываю виджет софтфона amoCRM. Софтфон выключен. IFrame отсутствует.', function() {
            tester = new Tester({
                softphoneHost: 'my.uiscom.ru',
                ...options,
                application: 'amocrm',
                env: { REACT_APP_OMNI_SOFTPHONE_ENABLED: 'false' },
            });

            postMessages.receive({
                method: 'set_token',
                data: '',
            });

            tester.iframe.expectNotToExist();
        });
    });
});
