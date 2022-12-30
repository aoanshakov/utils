tests.addTest(options => {
    const {
        utils,
        Tester,
        spendTime,
        windowOpener,
        mediaStreamsTester,
        unload,
        ajax,
        fetch,
        soundSources,
        setNow,
        fileReader,
        userMedia,
        audioDecodingTester,
        blobsTester,
        windowSize,
        notificationTester,
        setDocumentVisible
    } = options;

    const getPackage = Tester.createPackagesGetter(options);

    describe('Открываю страницу чатов.', function() {
        let tester,
            reportGroupsRequest,
            settingsRequest,
            accountRequest,
            permissionsRequest,
            authenticatedUserRequest,
            registrationRequest,
            statsRequest,
            statusesRequest,
            chatListRequest,
            secondChatListRequest,
            thirdChatListRequest,
            countersRequest;

        beforeEach(function() {
            setNow('2019-12-19T12:10:06');

            tester = new Tester(options);

            tester.input.withFieldLabel('Логин').fill('botusharova');
            tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

            tester.button('Войти').click();

            tester.loginRequest().receiveResponse();

            accountRequest = tester.accountRequest().
                webAccountLoginUnavailable().
                softphoneFeatureFlagDisabled().
                operatorWorkplaceAvailable().
                expectToBeSent();
        });

        describe('Телеграм каналы в контактах доступны.', function() {
            beforeEach(function() {
                accountRequest.receiveResponse();

                tester.notificationChannel().applyLeader().expectToBeSent();
                spendTime(1000);
                tester.notificationChannel().applyLeader().expectToBeSent();
                spendTime(1000);
                tester.notificationChannel().tellIsLeader().expectToBeSent();

                const requests = ajax.inAnyOrder();

                const reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests),
                    reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                    reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests);

                const secondAccountRequest = tester.accountRequest().
                    forChats().
                    webAccountLoginUnavailable().
                    softphoneFeatureFlagDisabled().
                    operatorWorkplaceAvailable().
                    expectToBeSent(requests);

                requests.expectToBeSent();

                reportsListRequest.receiveResponse();
                reportTypesRequest.receiveResponse();
                secondAccountRequest.receiveResponse();
                reportGroupsRequest.receiveResponse();

                tester.chatChannelListRequest().receiveResponse();
                tester.statusListRequest().receiveResponse();
                tester.listRequest().receiveResponse();
                tester.siteListRequest().receiveResponse();
                tester.messageTemplateListRequest().receiveResponse();

                tester.chatsWebSocket.connect();
                tester.chatsInitMessage().expectToBeSent();
                tester.chatSettingsRequest().receiveResponse();
                
                tester.accountRequest().
                    forChats().
                    softphoneFeatureFlagDisabled().
                    operatorWorkplaceAvailable().
                    receiveResponse();

                tester.accountRequest().
                    forChats().
                    softphoneFeatureFlagDisabled().
                    operatorWorkplaceAvailable().
                    receiveResponse();
                
                tester.offlineMessageCountersRequest().receiveResponse();
                tester.chatChannelListRequest().receiveResponse();
                tester.siteListRequest().receiveResponse();
                tester.markListRequest().receiveResponse();
                tester.chatChannelTypeListRequest().receiveResponse();

                tester.offlineMessageListRequest().notProcessed().receiveResponse();
                tester.offlineMessageListRequest().processing().receiveResponse();
                tester.offlineMessageListRequest().processed().receiveResponse();

                countersRequest = tester.countersRequest().expectToBeSent();

                chatListRequest = tester.chatListRequest().forCurrentEmployee().expectToBeSent();
                secondChatListRequest = tester.chatListRequest().forCurrentEmployee().active().expectToBeSent();
                thirdChatListRequest = tester.chatListRequest().forCurrentEmployee().closed().expectToBeSent();
            });

            describe('Много непрочитанных сообщений.', function() {
                beforeEach(function() {
                    countersRequest.receiveResponse();
                });

                describe('Данные чатов успешно получены.', function() {
                    beforeEach(function() {
                        chatListRequest.receiveResponse();
                        secondChatListRequest.receiveResponse();
                        thirdChatListRequest.receiveResponse();
                    });

                    describe('Ввожу значение в поле поиска.', function() {
                        let searchResultsRequest;

                        beforeEach(function() {
                            tester.input.fill('Сообщение #75');
                            
                            tester.input.pressEnter();
                            searchResultsRequest = tester.searchResultsRequest().expectToBeSent();
                        });

                        describe('Контакт не найден. Нажимаю на найденный чат.', function() {
                            beforeEach(function() {
                                searchResultsRequest.receiveResponse();

                                tester.chatListItem('Сообщение #75').click();
                                chatListRequest = tester.chatListRequest().thirdChat().expectToBeSent();
                            });

                            describe('Получены данные чата.', function() {
                                let messageListRequest,
                                    visitorCardRequest;

                                beforeEach(function() {
                                    chatListRequest.noVisitorName().extIdSpecified().receiveResponse();
                                    tester.acceptChatRequest().receiveResponse();
                                    visitorCardRequest = tester.visitorCardRequest().expectToBeSent();
                                    messageListRequest = tester.messageListRequest().expectToBeSent();
                                });

                                describe('У посетителя есть и номера и E-Mail.', function() {
                                    beforeEach(function() {
                                        visitorCardRequest.receiveResponse();
                                    });

                                    describe('Сообщений немного.', function() {
                                        beforeEach(function() {
                                            messageListRequest.receiveResponse();

                                            tester.usersRequest().forContacts().receiveResponse();
                                            tester.usersRequest().forContacts().receiveResponse();

                                            tester.changeMessageStatusRequest().
                                                anotherChat().
                                                anotherMessage().
                                                read().
                                                receiveResponse();

                                            tester.changeMessageStatusRequest().
                                                anotherChat().
                                                anotherMessage().
                                                read().
                                                receiveResponse();

                                            tester.changeMessageStatusRequest().
                                                anotherChat().
                                                anotherMessage().
                                                read().
                                                receiveResponse();
                                        });

                                        describe('Открываю меню телефона.', function() {
                                            beforeEach(function() {
                                                tester.contactBar.
                                                    section('Телефоны').
                                                    option('79164725823').
                                                    putMouseOver();

                                                tester.contactBar.
                                                    section('Телефоны').
                                                    option('79164725823').
                                                    toolsIcon.
                                                    click();
                                            });

                                            it(
                                                'Изменяю номер телефона. Отправлен запрос обновления посетителя.',
                                            function() {
                                                tester.select.option('Редактировать').click();

                                                tester.contactBar.
                                                    section('Телефоны').
                                                    input.
                                                    fill('79162729534');

                                                tester.contactBar.
                                                    section('Телефоны').
                                                    button('Сохранить').
                                                    click();

                                                tester.contactsRequest().phoneSearching().noData().receiveResponse();
                                                tester.chatPhoneUpdatingRequest().receiveResponse();
                                                tester.visitorCardUpdatingRequest().anotherPhone().receiveResponse();
                                            });
                                            it(
                                                'Нажимаю на кнопку удаления телефона. Отправлен запрос обновления ' +
                                                'посетителя.',
                                            function() {
                                                tester.select.option('Удалить').click();
                                                tester.visitorCardUpdatingRequest().noPhone().receiveResponse();

                                                tester.contactBar.
                                                    section('Телефоны').
                                                    option('79164725823').
                                                    expectNotToExist();
                                            });
                                        });
                                        describe('Раскрываю панель "Заметки".', function() {
                                            beforeEach(function() {
                                                tester.collapsablePanel('Заметки').title.click();
                                            });

                                            it('Измению теги. Отправлен запрос изменения тегов.', function() {
                                                tester.collapsablePanel('Заметки').
                                                    content.
                                                    row('Тэги').
                                                    tagField.
                                                    button.
                                                    click();

                                                tester.select.option('Продажа').click();
                                                tester.contactBar.click();

                                                tester.chatMarkingRequest().receiveResponse();
                                                tester.chatListRequest().thirdChat().receiveResponse();
                                            });
                                            it('Оторажены заметки.', function() {
                                                tester.collapsablePanel('Заметки').
                                                    content.
                                                    row('Тэги').
                                                    tagField.
                                                    putMouseOver();

                                                tester.tooltip.expectToHaveTextContent(
                                                    'Нереализованная сделка, Продажа'
                                                );
                                            });
                                        });
                                        it(
                                            'Раскрываю панель "Дополнительная информация". Оторажена дополнительная ' +
                                            'информация.',
                                        function() {
                                            tester.collapsablePanel('Дополнительная информация').title.click();
                                            tester.chatInfoRequest().receiveResponse();

                                            tester.collapsablePanel('Дополнительная информация').title.click();

                                            tester.collapsablePanel('Дополнительная информация').content.
                                                expectToHaveTextContent(
                                                    'Канал ' +
                                                    'Некое имя канала ' +
                                                    
                                                    'Страница обращения ' +

                                                    'Источник входа ' +
                                                    'Некиий источник трафика ' +

                                                    'Рекламная кампания ' +
                                                    'Некая рекламная кампания ' +

                                                    'UTM метки ' +

                                                    'Source yandex_direct ' +
                                                    'Medium smm ' +
                                                    'Concept some_concept ' +
                                                    'Campaign deyskie_igrushki ' +
                                                    'Expid 67183125-2 ' +
                                                    'Referrer example-source.com ' +
                                                    'Term gde_kupit_igrushki'
                                                );
                                        });
                                        it('Нажимаю на кнопку "Создать контакт".', function() {
                                            tester.button('Создать контакт').click();
                                            tester.contactCreatingRequest().fromVisitor().receiveResponse();
                                            tester.contactRequest().fifthContact().receiveResponse();
                                            tester.chatListRequest().thirdChat().expectToBeSent();

                                            tester.contactBar.title.expectToHaveTextContent('Контакт');
                                            tester.contactBar.section('Телефоны').svg.expectToBeVisible();
                                            tester.contactBar.section('E-Mail').svg.expectToBeVisible();
                                        });
                                        it(
                                            'Нажимаю на иконку с плюсом рядом с текстом "Персональный менеджер". ' +
                                            'Выпадающий список менеджеров скрыт.',
                                        function() {
                                            tester.contactBar.
                                                section('Персональный менеджер').
                                                plusButton.
                                                click();

                                            tester.contactBar.
                                                section('Персональный менеджер').
                                                select.
                                                expectNotToExist();
                                        });
                                        it('Отображены сообщения чата.', function() {
                                            tester.contactBar.title.expectToHaveTextContent('Посетитель');

                                            tester.chatHistory.message.atTime('12:13').expectToBeDelivered();

                                            tester.chatHistory.expectToHaveTextContent(
                                                '10 февраля 2020 ' +

                                                'Привет 12:13 Ответить ' +
                                                'Здравствуйте 12:12 Ответить'
                                            );

                                            tester.contactBar.expectTextContentToHaveSubstring(
                                                'ФИО ' +
                                                'Помакова Бисерка Драгановна ' +

                                                'Телефоны ' +
                                                '79164725823 ' +

                                                'E-Mail ' +
                                                'pomakova@gmail.com ' +

                                                'Каналы связи ' +
                                                'Помакова Бисерка Драгановна'
                                            );

                                            tester.spin.expectNotToExist();

                                            tester.contactBar.
                                                section('Телефоны').
                                                plusButton.
                                                expectNotToExist();

                                            tester.contactBar.
                                                section('E-Mail').
                                                plusButton.
                                                expectNotToExist();

                                            tester.contactBar.
                                                section('Каналы связи').
                                                option('Помакова Бисерка Драгановна').
                                                telegram.
                                                expectToBeVisible();

                                            tester.contactBar.
                                                section('Персональный менеджер').
                                                plusButton.
                                                expectToBeDisabled();

                                            tester.contactBar.
                                                section('Персональный менеджер').
                                                plusButton.
                                                putMouseOver();

                                            tester.tooltip.expectToHaveTextContent('Доступно после создания контакта');
                                        });
                                    });
                                    it(
                                        'Получен ответ на сообщение. Отображено сообщение на которое отвечает ' +
                                        'пользователь.',
                                    function() {
                                        messageListRequest.reply().receiveResponse();

                                        tester.usersRequest().forContacts().receiveResponse();
                                        tester.usersRequest().forContacts().receiveResponse();

                                        tester.changeMessageStatusRequest().
                                            anotherChat().
                                            anotherMessage().
                                            read().
                                            receiveResponse();

                                        tester.changeMessageStatusRequest().
                                            anotherChat().
                                            anotherMessage().
                                            read().
                                            receiveResponse();

                                        tester.changeMessageStatusRequest().
                                            anotherChat().
                                            anotherMessage().
                                            read().
                                            receiveResponse();

                                        tester.chatHistory.message.atTime('12:13').expectToHaveTextContent(
                                            'Помакова Бисерка Драгановна ' +
                                            'Как дела? ' +
                                            'Привет 12:13 Ответить'
                                        );
                                    });
                                    it('Сообщение много.', function() {
                                        messageListRequest.firstPage().receiveResponse();

                                        tester.usersRequest().forContacts().receiveResponse();
                                        tester.usersRequest().forContacts().receiveResponse();

                                        tester.changeMessageStatusRequest().
                                            anotherChat().
                                            thirdMessage().
                                            read().
                                            receiveResponse();

                                        tester.changeMessageStatusRequest().
                                            anotherChat().
                                            thirdMessage().
                                            read().
                                            receiveResponse();

                                        tester.changeMessageStatusRequest().
                                            anotherChat().
                                            thirdMessage().
                                            read().
                                            receiveResponse();
                                    });
                                });
                                describe('Сообщений немного.', function() {
                                    beforeEach(function() {
                                        messageListRequest.receiveResponse();
                                        tester.usersRequest().forContacts().receiveResponse();

                                        tester.changeMessageStatusRequest().
                                            anotherChat().
                                            anotherMessage().
                                            read().
                                            receiveResponse();

                                        tester.changeMessageStatusRequest().
                                            anotherChat().
                                            anotherMessage().
                                            read().
                                            receiveResponse();

                                        tester.changeMessageStatusRequest().
                                            anotherChat().
                                            anotherMessage().
                                            read().
                                            receiveResponse();
                                    });

                                    describe('У посетителя есть два телефона.', function() {
                                        beforeEach(function() {
                                            visitorCardRequest.addSecondPhoneNumber().receiveResponse();
                                            tester.usersRequest().forContacts().receiveResponse();
                                        });

                                        it('Редактирование первого телефона недоступно.', function() {
                                            tester.contactBar.
                                                section('Телефоны').
                                                option('79164725823').
                                                putMouseOver();

                                            tester.contactBar.
                                                section('Телефоны').
                                                option('79164725823').
                                                toolsIcon.
                                                expectToBeVisible();
                                        });
                                        it('Редактирование второго телефона доступно.', function() {
                                            tester.contactBar.
                                                section('Телефоны').
                                                option('79164725824').
                                                putMouseOver();

                                            tester.contactBar.
                                                section('Телефоны').
                                                option('79164725824').
                                                toolsIcon.
                                                expectToBeVisible();
                                        });
                                    });
                                    it('У посетителя нет E-Mail.', function() {
                                        visitorCardRequest.noEmail().receiveResponse();
                                        tester.usersRequest().forContacts().receiveResponse();

                                        tester.contactBar.section('Телефоны').svg.expectNotToExist();
                                        tester.contactBar.section('E-Mail').svg.expectToBeVisible();
                                    });
                                    it('У посетителя нет телефона.', function() {
                                        visitorCardRequest.noPhone().receiveResponse();
                                        tester.usersRequest().forContacts().receiveResponse();

                                        tester.contactBar.section('Телефоны').svg.expectToBeVisible();
                                        tester.contactBar.section('E-Mail').svg.expectNotToExist();
                                    });
                                });
                                it(
                                    'Среди сообщений есть ответ посетителя на другое сообщение. Данные посетителя ' +
                                    'получены позже списка сообщений. Имя посетителя отображено в ответе.',
                                function() {
                                    messageListRequest.reply().receiveResponse();
                                    visitorCardRequest.receiveResponse();

                                    tester.usersRequest().forContacts().receiveResponse();

                                    tester.changeMessageStatusRequest().
                                        anotherChat().
                                        anotherMessage().
                                        read().
                                        receiveResponse();

                                    tester.changeMessageStatusRequest().
                                        anotherChat().
                                        anotherMessage().
                                        read().
                                        receiveResponse();

                                    tester.changeMessageStatusRequest().
                                        anotherChat().
                                        anotherMessage().
                                        read().
                                        receiveResponse();

                                    tester.usersRequest().forContacts().receiveResponse();

                                    tester.chatHistory.message.atTime('12:13').expectToHaveTextContent(
                                        'Помакова Бисерка Драгановна ' +
                                        'Как дела? ' +
                                        'Привет 12:13 Ответить'
                                    );
                                });
                            });
                            describe('Получен канал WhatsApp.', function() {
                                beforeEach(function() {
                                    chatListRequest = chatListRequest.whatsapp();
                                });

                                describe('Определен ext_id.', function() {
                                    beforeEach(function() {
                                        chatListRequest.extIdSpecified().receiveResponse();

                                        tester.acceptChatRequest().receiveResponse();
                                        tester.visitorCardRequest().addSecondPhoneNumber().receiveResponse();
                                        tester.messageListRequest().receiveResponse();

                                        tester.usersRequest().forContacts().receiveResponse();
                                        tester.usersRequest().forContacts().receiveResponse();

                                        tester.changeMessageStatusRequest().
                                            anotherChat().
                                            anotherMessage().
                                            read().
                                            receiveResponse();

                                        tester.changeMessageStatusRequest().
                                            anotherChat().
                                            anotherMessage().
                                            read().
                                            receiveResponse();

                                        tester.changeMessageStatusRequest().
                                            anotherChat().
                                            anotherMessage().
                                            read().
                                            receiveResponse();
                                    });

                                    it('Нажимаю на кнопку "Создать контакт".', function() {
                                        tester.button('Создать контакт').click();

                                        tester.contactCreatingRequest().whatsapp().fromVisitor().receiveResponse();
                                        tester.contactRequest().fifthContact().receiveResponse();
                                        tester.chatListRequest().thirdChat().expectToBeSent();

                                        tester.contactBar.title.expectToHaveTextContent('Контакт');
                                        tester.contactBar.section('Телефоны').svg.expectToBeVisible();
                                        tester.contactBar.section('E-Mail').svg.expectToBeVisible();
                                    });
                                    it('Отображен канал WhatsApp.', function() {
                                        tester.contactBar.
                                            section('Каналы связи').
                                            option('79283810928').
                                            whatsApp.
                                            expectToBeVisible();
                                    });
                                });
                                it('Не определен ext_id. Отображен канал WhatsApp.', function() {
                                    chatListRequest.receiveResponse();

                                    tester.acceptChatRequest().receiveResponse();
                                    tester.visitorCardRequest().addSecondPhoneNumber().receiveResponse();
                                    tester.messageListRequest().receiveResponse();

                                    tester.usersRequest().forContacts().receiveResponse();
                                    tester.usersRequest().forContacts().receiveResponse();

                                    tester.changeMessageStatusRequest().
                                        anotherChat().
                                        anotherMessage().
                                        read().
                                        receiveResponse();

                                    tester.changeMessageStatusRequest().
                                        anotherChat().
                                        anotherMessage().
                                        read().
                                        receiveResponse();

                                    tester.changeMessageStatusRequest().
                                        anotherChat().
                                        anotherMessage().
                                        read().
                                        receiveResponse();

                                    tester.contactBar.
                                        section('Каналы связи').
                                        option('79164725823').
                                        whatsApp.
                                        expectToBeVisible();
                                });
                            });
                            describe('Номер заполнен автоматически.', function() {
                                beforeEach(function() {
                                    chatListRequest.phoneAutoFilled().receiveResponse();

                                    tester.acceptChatRequest().receiveResponse();
                                    tester.visitorCardRequest().addSecondPhoneNumber().receiveResponse();
                                    tester.messageListRequest().receiveResponse();

                                    tester.usersRequest().forContacts().receiveResponse();
                                    tester.usersRequest().forContacts().receiveResponse();

                                    tester.changeMessageStatusRequest().
                                        anotherChat().
                                        anotherMessage().
                                        read().
                                        receiveResponse();

                                    tester.changeMessageStatusRequest().
                                        anotherChat().
                                        anotherMessage().
                                        read().
                                        receiveResponse();

                                    tester.changeMessageStatusRequest().
                                        anotherChat().
                                        anotherMessage().
                                        read().
                                        receiveResponse();
                                });

                                it('Редактирование первого телефона недоступно.', function() {
                                    tester.contactBar.
                                        section('Телефоны').
                                        option('79164725823').
                                        putMouseOver();

                                    tester.contactBar.
                                        section('Телефоны').
                                        option('79164725823').
                                        toolsIcon.
                                        expectNotToExist();
                                });
                                it('Редактирование второго телефона доступно.', function() {
                                    tester.contactBar.
                                        section('Телефоны').
                                        option('79164725824').
                                        putMouseOver();

                                    tester.contactBar.
                                        section('Телефоны').
                                        option('79164725824').
                                        toolsIcon.
                                        expectToBeVisible();
                                });
                            });
                        });
                        describe('Контакт найден. Нажимаю на найденный чат. ', function() {
                            let chatListRequest;

                            beforeEach(function() {
                                searchResultsRequest.contactExists().receiveResponse();

                                tester.chatListItem('Сообщение #75').click();
                                chatListRequest = tester.chatListRequest().contactExists().thirdChat().expectToBeSent();
                            });

                            it('Определен ext_id. Текущий канал связи выделен.', function() {
                                chatListRequest.extIdSpecified().receiveResponse();
                                tester.acceptChatRequest().receiveResponse();
                                tester.visitorCardRequest().receiveResponse();
                                tester.messageListRequest().receiveResponse();

                                tester.usersRequest().forContacts().receiveResponse();
                                tester.contactRequest().addTelegram().addFourthTelegram().receiveResponse();

                                tester.changeMessageStatusRequest().
                                    anotherChat().
                                    anotherMessage().
                                    read().
                                    receiveResponse();

                                tester.changeMessageStatusRequest().
                                    anotherChat().
                                    anotherMessage().
                                    read().
                                    receiveResponse();

                                tester.changeMessageStatusRequest().
                                    anotherChat().
                                    anotherMessage().
                                    read().
                                    receiveResponse();

                                tester.contactBar.
                                    section('Каналы связи').
                                    option('79283810988').
                                    expectNotToBeSelected();

                                tester.contactBar.
                                    section('Каналы связи').
                                    option('79283810928').
                                    whatsApp.
                                    expectNotToBeSelected();

                                tester.contactBar.
                                    section('Каналы связи').
                                    option('79218307632').
                                    telegram.
                                    expectNotToBeSelected();

                                tester.contactBar.
                                    section('Каналы связи').
                                    option('79283810928').
                                    telegram.
                                    expectToBeSelected();

                                tester.contactBar.expectTextContentToHaveSubstring(
                                    'ФИО ' +
                                    'Бележкова Грета Ервиновна ' +

                                    'Телефоны ' +
                                    '79162729533 ' +
                                    
                                    'E-Mail ' +
                                    'endlesssprinп.of@comagic.dev ' +

                                    'Каналы связи ' +
                                    '79283810988 ' +
                                    '79283810928'
                                );
                            });
                            it('Определен телефон. Текущий канал связи выделен.', function() {
                                chatListRequest.phoneSpecified().receiveResponse();
                                tester.acceptChatRequest().receiveResponse();
                                tester.visitorCardRequest().receiveResponse();
                                tester.messageListRequest().receiveResponse();

                                tester.usersRequest().forContacts().receiveResponse();
                                tester.contactRequest().addTelegram().addFourthTelegram().receiveResponse();

                                tester.changeMessageStatusRequest().
                                    anotherChat().
                                    anotherMessage().
                                    read().
                                    receiveResponse();

                                tester.changeMessageStatusRequest().
                                    anotherChat().
                                    anotherMessage().
                                    read().
                                    receiveResponse();

                                tester.changeMessageStatusRequest().
                                    anotherChat().
                                    anotherMessage().
                                    read().
                                    receiveResponse();

                                tester.contactBar.
                                    section('Каналы связи').
                                    option('79283810988').
                                    expectNotToBeSelected();

                                tester.contactBar.
                                    section('Каналы связи').
                                    option('79283810928').
                                    whatsApp.
                                    expectNotToBeSelected();

                                tester.contactBar.
                                    section('Каналы связи').
                                    option('79218307632').
                                    telegram.
                                    expectNotToBeSelected();

                                tester.contactBar.
                                    section('Каналы связи').
                                    option('79283810928').
                                    telegram.
                                    expectToBeSelected();

                                tester.contactBar.expectTextContentToHaveSubstring(
                                    'ФИО ' +
                                    'Бележкова Грета Ервиновна ' +

                                    'Телефоны ' +
                                    '79162729533 ' +
                                    
                                    'E-Mail ' +
                                    'endlesssprinп.of@comagic.dev ' +

                                    'Каналы связи ' +
                                    '79283810988 ' +
                                    '79283810928'
                                );
                            });
                            it('Определен контекст. Текущий канал связи выделен.', function() {
                                chatListRequest.receiveResponse();
                                tester.acceptChatRequest().receiveResponse();
                                tester.visitorCardRequest().receiveResponse();
                                tester.messageListRequest().receiveResponse();

                                tester.usersRequest().forContacts().receiveResponse();
                                tester.contactRequest().addFourthTelegram().receiveResponse();

                                tester.changeMessageStatusRequest().
                                    anotherChat().
                                    anotherMessage().
                                    read().
                                    receiveResponse();

                                tester.changeMessageStatusRequest().
                                    anotherChat().
                                    anotherMessage().
                                    read().
                                    receiveResponse();

                                tester.changeMessageStatusRequest().
                                    anotherChat().
                                    anotherMessage().
                                    read().
                                    receiveResponse();

                                tester.contactBar.title.expectToHaveTextContent('Контакт');
                                tester.contactBar.title.deleteButton.expectNotToExist();

                                tester.contactBar.
                                    section('Каналы связи').
                                    option('79283810988').
                                    expectNotToBeSelected();

                                tester.contactBar.
                                    section('Каналы связи').
                                    option('79283810928').
                                    telegram.
                                    expectToBeSelected();

                                tester.contactBar.expectTextContentToHaveSubstring(
                                    'ФИО ' +
                                    'Бележкова Грета Ервиновна ' +

                                    'Телефоны ' +
                                    '79162729533 ' +
                                    
                                    'E-Mail ' +
                                    'endlesssprinп.of@comagic.dev ' +

                                    'Каналы связи ' +
                                    '79283810988 ' +
                                    '79283810928 ' +
                                    '79283810928'
                                );
                            });
                        });
                        describe('Получен новый чат.', function() {
                            beforeEach(function() {
                                searchResultsRequest = searchResultsRequest.newVisitor().whatsApp();
                            });

                            describe('Получен phone.', function() {
                                beforeEach(function() {
                                    searchResultsRequest.newVisitor().receiveResponse();
                                });

                                it('Нажимаю на кнпоку "Начать чат". Чат начат.', function() {
                                    tester.button('Начать чат').click();
                                    tester.chatStartingRequest().receiveResponse();

                                    tester.chatListRequest().thirdChat().receiveResponse();

                                    tester.acceptChatRequest().receiveResponse();
                                    tester.visitorCardRequest().receiveResponse();

                                    tester.usersRequest().forContacts().receiveResponse();
                                    tester.usersRequest().forContacts().receiveResponse();
                                });
                                it('Отображена кнопка "Начать чат".', function() {
                                    tester.body.expectTextContentToHaveSubstring(
                                        '79283810988 Начать чат ' +
                                        '#679729 Гость'
                                    );
                                });
                            });
                            describe('Получен ext_id.', function() {
                                beforeEach(function() {
                                    searchResultsRequest.newVisitor().extIdSpecified().receiveResponse();
                                });

                                it('Нажимаю на кнпоку "Начать чат". Чат начат.', function() {
                                    tester.button('Начать чат').click();
                                    tester.chatStartingRequest().receiveResponse();

                                    tester.chatListRequest().thirdChat().receiveResponse();

                                    tester.acceptChatRequest().receiveResponse();
                                    tester.visitorCardRequest().receiveResponse();

                                    tester.usersRequest().forContacts().receiveResponse();
                                    tester.usersRequest().forContacts().receiveResponse();
                                });
                                it('Отображена кнопка "Начать чат".', function() {
                                    tester.body.expectTextContentToHaveSubstring(
                                        '79283810988 Начать чат ' +
                                        '#679729 Гость'
                                    );
                                });
                            });
                        });
                    });
                    describe('Получена новая заявка.', function() {
                        let newOfflineMessage;

                        beforeEach(function() {
                            newOfflineMessage = tester.newOfflineMessage();
                        });

                        describe('Имя посетителя указано.', function() {
                            beforeEach(function() {
                                newOfflineMessage.receive();
                                notificationTester.grantPermission();
                                tester.offlineMessageCountersRequest().newMessage().receiveResponse();
                            });

                            describe('Открываю раздел заявок. Открываю заявку.', function() {
                                let visitorCardRequest;

                                beforeEach(function() {
                                    tester.leftMenu.button('1 Заявки').click();
                                    tester.chatListItem('Томова Денка Райчовна').click();

                                    tester.offlineMessageAcceptingRequest().anotherMessage().receiveResponse();
                                    visitorCardRequest = tester.visitorCardRequest().expectToBeSent();
                                    tester.usersRequest().forContacts().receiveResponse();
                                });

                                it('Отображена заявка.', function() {
                                    visitorCardRequest.receiveResponse();

                                    tester.chatHistory.message.atTime('11:17').expectToHaveTextContent(
                                        'Заявка ' +

                                        'Имя: Помакова Бисерка Драгановна ' +
                                        'Телефон: 74951523643 ' +
                                        'Email: tomova@gmail.com ' +

                                        '11:17'
                                    );
                                });
                                it('Отображена заявка.', function() {
                                    tester.chatHistory.message.atTime('11:17').expectToHaveTextContent(
                                        'Заявка ' +

                                        'Имя: Рангелова Невена Цветковна ' +
                                        'Телефон: 74951523643 ' +
                                        'Email: tomova@gmail.com ' +

                                        '11:17'
                                    );
                                });
                            });
                            it('Оторажено количество непросмотренных заявок.', function() {
                                tester.notificationSection.expectToHaveTextContent(
                                    'РН ' +
                                    'Рангелова Невена Цветковна ' +
                                    'Заявка с сайта'
                                );
                            });
                        });
                        it('Имя посетителя неуказано. Оторажено количество непросмотренных заявок.', function() {
                            newOfflineMessage.noVisitorName().receive();
                            notificationTester.grantPermission();
                            tester.offlineMessageCountersRequest().newMessage().receiveResponse();

                            tester.notificationSection.expectToHaveTextContent(
                                '03 ' +
                                '#16479303 Гость ' +
                                'Заявка с сайта'
                            );

                            tester.leftMenu.button('1 Заявки').expectToBeVisible();
                        });
                    });
                    it('Открываю раздел заявок.', function() {
                        tester.leftMenu.button('Заявки').click();
                        tester.chatListItem('Заявка с сайта').click();

                        tester.offlineMessageAcceptingRequest().receiveResponse();
                        tester.visitorCardRequest().receiveResponse();
                        tester.usersRequest().forContacts().receiveResponse();

                        tester.chatHistory.message.atTime('12:10').expectToHaveTextContent(
                            'Заявка ' +

                            'Я хочу о чем-то заявить. ' +
                            'Имя: Помакова Бисерка Драгановна ' +
                            'Телефон: 79161212122 ' +
                            'Email: msjdasj@mail.com ' +

                            '12:10'
                        );
                    });
                    it('Открываю раздел контактов. Соединение с вебсокетом чатов разрывается.', function() {
                        tester.leftMenu.button('Контакты').click();

                        tester.contactsRequest().differentNames().receiveResponse();
                        tester.chatsWebSocket.finishDisconnecting();

                        tester.contactList.item('Бележкова Грета Ервиновна').expectToBeVisible();
                    });
                    it('Отображен список чатов.', function() {
                        tester.body.expectTextContentToHaveSubstring(
                            'Помакова Бисерка Драгановна 21 янв 2022 ' +
                            'Привет 3'
                        );

                        tester.spin.expectNotToExist();
                    });
                });
                it('Не удалось получить данные чатов. Перехожу на вкладку "В работе".', function() {
                    chatListRequest.failed().receiveResponse();
                    secondChatListRequest.failed().receiveResponse();
                    thirdChatListRequest.failed().receiveResponse();

                    tester.chatListRequest().
                        forCurrentEmployee().
                        failed().
                        receiveResponse();

                    tester.button('В работе 75').click();
                    tester.collapsablePanel('Активные').content.spinWrapper.scrollIntoView();

                    tester.chatListRequest().
                        active().
                        forCurrentEmployee().
                        failed().
                        expectToBeSent();
                });
            });
            describe('Мало непрочитанных сообщений.', function() {
                beforeEach(function() {
                    countersRequest.fewUnreadMessages().receiveResponse();

                    chatListRequest.
                        count(5).
                        fewUnreadMessages().
                        receiveResponse();

                    secondChatListRequest.
                        count(4).
                        fewUnreadMessages().
                        receiveResponse();
                    
                    thirdChatListRequest.
                        count(2).
                        fewUnreadMessages().
                        receiveResponse();
                });

                it(
                    'Открываю чат с непрочитанным сообщением. Отображено количество непрочитанных сообщений.',
                function() {
                    tester.chatListItem('Сообщение #5').click();

                    tester.visitorCardRequest().receiveResponse();
                    tester.messageListRequest().receiveResponse();
                    tester.usersRequest().forContacts().receiveResponse();

                    tester.changeMessageStatusRequest().
                        thirdChat().
                        anotherMessage().
                        read().
                        receiveResponse();

                    tester.changeMessageStatusRequest().
                        thirdChat().
                        anotherMessage().
                        read().
                        receiveResponse();
                        
                    tester.changeMessageStatusRequest().
                        thirdChat().
                        anotherMessage().
                        read().
                        receiveResponse();

                    tester.statusChangedMessage().receive();
                    tester.countersRequest().readMessage().fewUnreadMessages().receiveResponse();

                    tester.button('7 Чаты').expectToBeVisible();
                });
                it('Получено новое сообщение. Отображено количество непрочитанных сообщений.', function() {
                    tester.newMessage().receive();
                    tester.chatListRequest().chat().receiveResponse();
                    tester.countersRequest().newMessage().fewUnreadMessages().receiveResponse();

                    tester.button('9 Чаты').expectToBeVisible();
                });
                it('Отображено количество непрочитанных сообщений.', function() {
                    tester.button('8 Чаты').expectToBeVisible();
                });
            });
        });
        describe('Телеграм каналы в контактах недоступны.', function() {
            beforeEach(function() {
                accountRequest.telegramContactChannelFeatureFlagDisabled().receiveResponse();

                tester.notificationChannel().applyLeader().expectToBeSent();
                spendTime(1000);
                tester.notificationChannel().applyLeader().expectToBeSent();
                spendTime(1000);
                tester.notificationChannel().tellIsLeader().expectToBeSent();

                const requests = ajax.inAnyOrder();

                const reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests),
                    reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                    reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests);

                const secondAccountRequest = tester.accountRequest().
                    forChats().
                    webAccountLoginUnavailable().
                    softphoneFeatureFlagDisabled().
                    operatorWorkplaceAvailable().
                    telegramContactChannelFeatureFlagDisabled().
                    expectToBeSent(requests);

                requests.expectToBeSent();

                reportsListRequest.receiveResponse();
                reportTypesRequest.receiveResponse();
                secondAccountRequest.receiveResponse();
                reportGroupsRequest.receiveResponse();

                tester.chatChannelListRequest().receiveResponse();
                tester.statusListRequest().receiveResponse();
                tester.listRequest().receiveResponse();
                tester.siteListRequest().receiveResponse();
                tester.messageTemplateListRequest().receiveResponse();

                tester.chatsWebSocket.connect();
                tester.chatsInitMessage().expectToBeSent();
                tester.chatSettingsRequest().receiveResponse();

                tester.accountRequest().
                    forChats().
                    softphoneFeatureFlagDisabled().
                    operatorWorkplaceAvailable().
                    telegramContactChannelFeatureFlagDisabled().
                    receiveResponse();

                tester.accountRequest().
                    forChats().
                    softphoneFeatureFlagDisabled().
                    operatorWorkplaceAvailable().
                    telegramContactChannelFeatureFlagDisabled().
                    receiveResponse();

                tester.offlineMessageCountersRequest().receiveResponse();
                tester.chatChannelListRequest().receiveResponse();
                tester.siteListRequest().receiveResponse();
                tester.markListRequest().receiveResponse();
                tester.chatChannelTypeListRequest().receiveResponse();

                tester.offlineMessageListRequest().notProcessed().receiveResponse();
                tester.offlineMessageListRequest().processing().receiveResponse();
                tester.offlineMessageListRequest().processed().receiveResponse();

                tester.countersRequest().receiveResponse();

                tester.chatListRequest().forCurrentEmployee().receiveResponse();
                tester.chatListRequest().forCurrentEmployee().active().receiveResponse();
                tester.chatListRequest().forCurrentEmployee().closed().receiveResponse();
                tester.input.fill('Сообщение #75');

                tester.input.pressEnter();
                tester.searchResultsRequest().receiveResponse();

                tester.chatListItem('Сообщение #75').click();

                chatListRequest = tester.chatListRequest().
                    thirdChat().
                    noVisitorName().
                    legacyChannel().
                    expectToBeSent();
            });

            describe('Получен чат Telegram.', function() {
                beforeEach(function() {
                    chatListRequest.receiveResponse();

                    tester.acceptChatRequest().receiveResponse();
                    tester.visitorCardRequest().receiveResponse();
                    tester.messageListRequest().receiveResponse();

                    tester.usersRequest().forContacts().receiveResponse();
                    tester.usersRequest().forContacts().receiveResponse();

                    tester.changeMessageStatusRequest().
                        anotherChat().
                        anotherMessage().
                        read().
                        receiveResponse();

                    tester.changeMessageStatusRequest().
                        anotherChat().
                        anotherMessage().
                        read().
                        receiveResponse();

                    tester.changeMessageStatusRequest().
                        anotherChat().
                        anotherMessage().
                        read().
                        receiveResponse();
                });

                it('Нажимаю на кнопку "Создать контакт".', function() {
                    tester.button('Создать контакт').click();

                    tester.contactCreatingRequest().
                        fromVisitor().
                        legacyChannelList().
                        receiveResponse();

                    tester.contactRequest().
                        fifthContact().
                        legacyChannelList().
                        receiveResponse();

                    tester.chatListRequest().
                        thirdChat().
                        noVisitorName().
                        legacyChannel().
                        receiveResponse();

                    tester.contactBar.title.expectToHaveTextContent('Контакт');
                    tester.contactBar.section('Телефоны').svg.expectToBeVisible();
                    tester.contactBar.section('E-Mail').svg.expectToBeVisible();
                });
                it('В качестве имени канала используется имя посетителя.', function() {
                    tester.contactBar.
                        section('Каналы связи').
                        option('Помакова Бисерка Драгановна').
                        telegram.
                        expectToBeVisible();
                });
            });
            describe('Получен чат WhatsApp.', function() {
                beforeEach(function() {
                    chatListRequest.whatsapp().receiveResponse();

                    tester.acceptChatRequest().receiveResponse();
                    tester.visitorCardRequest().receiveResponse();
                    tester.messageListRequest().receiveResponse();

                    tester.usersRequest().forContacts().receiveResponse();
                    tester.usersRequest().forContacts().receiveResponse();

                    tester.changeMessageStatusRequest().
                        anotherChat().
                        anotherMessage().
                        read().
                        receiveResponse();

                    tester.changeMessageStatusRequest().
                        anotherChat().
                        anotherMessage().
                        read().
                        receiveResponse();

                    tester.changeMessageStatusRequest().
                        anotherChat().
                        anotherMessage().
                        read().
                        receiveResponse();
                });

                it('Нажимаю на кнопку "Создать контакт".', function() {
                    tester.button('Создать контакт').click();

                    tester.contactCreatingRequest().
                        whatsapp().
                        fromVisitor().
                        legacyChannelList().
                        anotherChannelExtId().
                        receiveResponse();

                    tester.contactRequest().fifthContact().receiveResponse();
                    tester.chatListRequest().thirdChat().expectToBeSent();

                    tester.contactBar.title.expectToHaveTextContent('Контакт');
                    tester.contactBar.section('Телефоны').svg.expectToBeVisible();
                    tester.contactBar.section('E-Mail').svg.expectToBeVisible();
                });
                it('Отображен канал WhatsApp.', function() {
                    tester.contactBar.
                        section('Каналы связи').
                        option('79164725823').
                        whatsApp.
                        expectToBeVisible();
                });
            });
        });
    });
});
