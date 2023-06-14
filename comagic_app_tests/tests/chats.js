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

                                            describe('Открываю редактор тегов.', function() {
                                                beforeEach(function() {
                                                    tester.collapsablePanel('Заметки').
                                                        content.
                                                        row('Тэги').
                                                        tagField.
                                                        button.
                                                        click();
                                                });

                                                describe('Нажимаю на кнопку "По алфавиту".', function() {
                                                    beforeEach(function() {
                                                        tester.button('По алфавиту').click();
                                                    });

                                                    it(
                                                        'Снова нажимаю на кнопку "По алфавиту". Теги отсортированы ' +
                                                        'по алфавиту в обратном порядке.',
                                                    function() {
                                                        tester.button('По алфавиту').click();
                                                        
                                                        tester.button('По популярности').expectNotToBeChecked();
                                                        tester.button('По алфавиту').expectToBeChecked();
                                                        tester.button('Проставлено').expectNotToBeChecked();

                                                        tester.select.popup.expectTextContentToHaveSubstring(
                                                            'искалицезиюнашлипоздноутромсвистящегохна ' +
                                                            'Генератор лидов ' +
                                                            'В обработке'
                                                        );
                                                    });
                                                    it('Теги отсортированы по алфавиту.', function() {
                                                        tester.button('По популярности').expectNotToBeChecked();
                                                        tester.button('По алфавиту').expectToBeChecked();
                                                        tester.button('Проставлено').expectNotToBeChecked();

                                                        tester.select.popup.expectTextContentToHaveSubstring(
                                                            'В обработке ' +
                                                            'Генератор лидов ' +
                                                            'Кобыла и трупоглазые жабы'
                                                        );
                                                    });
                                                });
                                                describe('Измению теги. Отправлен запрос изменения тегов.', function() {
                                                    let chatMarkingRequest;

                                                    beforeEach(function() {
                                                        tester.select.option('Продажа').click();
                                                        tester.contactBar.click();

                                                        chatMarkingRequest = tester.chatMarkingRequest().
                                                            expectToBeSent();
                                                    });

                                                    it('Получен ответ на запрос. Спиннер скрыт.', function() {
                                                        chatMarkingRequest.receiveResponse();
                                                        tester.chatListRequest().thirdChat().receiveResponse();

                                                        tester.collapsablePanel('Заметки').
                                                            content.
                                                            row('Тэги').
                                                            spin.
                                                            expectNotToExist();
                                                    });
                                                    it('Отображен спиннер.', function() {
                                                        tester.collapsablePanel('Заметки').
                                                            content.
                                                            row('Тэги').
                                                            spin.
                                                            expectToBeVisible();
                                                    });
                                                });
                                                it(
                                                    'Нажимаю на кнопку "По популярности". Теги отсортированы по ' +
                                                    'популярности.',
                                                function() {
                                                    tester.button('По популярности').click();

                                                    tester.button('По популярности').expectToBeChecked();
                                                    tester.button('По алфавиту').expectNotToBeChecked();
                                                    tester.button('Проставлено').expectNotToBeChecked();

                                                    tester.select.popup.expectTextContentToHaveSubstring(
                                                        'Продажа ' +
                                                        'Нереализованная сделка ' +
                                                        'Нецелевой контакт ' +
                                                        'Фрод'
                                                    );
                                                });
                                                it('Ввожу значение в поле поиска.', function() {
                                                    tester.select.popup.input.fill('не');

                                                    tester.select.popup.expectToHaveTextContent(
                                                        'По популярности ' +
                                                        'По алфавиту ' +
                                                        'Проставлено ' +

                                                        'Нереализованная сделка ' +
                                                        'Нецелевой контакт ' +
                                                        'Генератор лидов ' +
                                                        'Не обработано'
                                                    );
                                                });
                                                it(
                                                    'Нажата кнопка "Проставлено". Теги отсортированы по отмеченности.',
                                                function() {
                                                    tester.button('По популярности').expectNotToBeChecked();
                                                    tester.button('По алфавиту').expectNotToBeChecked();
                                                    tester.button('Проставлено').expectToBeChecked();

                                                    tester.select.popup.expectTextContentToHaveSubstring(
                                                        'Нереализованная сделка ' +
                                                        'Продажа ' +
                                                        'Спам'
                                                    );
                                                });
                                            });
                                            it('Оторажены заметки.', function() {
                                                tester.collapsablePanel('Заметки').
                                                    content.
                                                    row('Тэги').
                                                    tagField.
                                                    display.
                                                    putMouseOver();

                                                tester.tooltip.
                                                    expectToHaveTextContent('Нереализованная сделка, Продажа');
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
                                    describe('Сообщение много.', function() {
                                        let chatListRequest;

                                        beforeEach(function() {
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

                                        describe(
                                            'Прокрутил список чатов до конца. Отправлен запрос чатов.',
                                        function() {
                                            beforeEach(function() {
                                                tester.chatList.spinWrapper.scrollIntoView();

                                                chatListRequest = tester.chatListRequest().
                                                    forCurrentEmployee().
                                                    secondPage().
                                                    expectToBeSent();
                                            });

                                            describe('Получен ответ на запрос.', function() {
                                                beforeEach(function() {
                                                    chatListRequest.receiveResponse();
                                                });

                                                it('Прокрутил список чатов до конца. Запрос отправлен.', function() {
                                                    tester.chatList.spinWrapper.scrollIntoView();

                                                    tester.chatListRequest().
                                                        forCurrentEmployee().
                                                        thirdPage().
                                                        receiveResponse();
                                                });
                                                it('Спиннер скрыт.', function() {
                                                    tester.spin.expectNotToExist();
                                                    tester.chatList.item('Сообщение #30').expectToBeVisible();
                                                    tester.chatList.item('Сообщение #31').expectToBeVisible();
                                                });
                                            });
                                            it('Прокрутил список чатов до конца. Запрос не отправлен.', function() {
                                                tester.chatList.spinWrapper.scrollIntoView();
                                                ajax.expectNoRequestsToBeSent();
                                            });
                                            it('Отображен спиннер.', function() {
                                                tester.spin.expectToBeVisible();
                                                tester.chatList.item('Сообщение #31').expectNotToExist();
                                            });
                                        });
                                        /*describe(
                                            'История сообщений прокручена вверх. Отправлен запрос сообщений.',
                                        function() {
                                            beforeEach(function() {
                                                tester.chatHistory.scrollTo(0);

                                                messageListRequest = tester.messageListRequest().
                                                    secondPage().
                                                    expectToBeSent();
                                            });

                                            it('Получен ответ. Спиннер скрыт.', function() {
                                                messageListRequest.receiveResponse();

                                                tester.changeMessageStatusRequest().
                                                    anotherChat().
                                                    thirdMessage().
                                                    read().
                                                    receiveResponse();

                                                tester.spin.expectNotToExist();

                                                tester.chatHistory.message.
                                                    containsSubstring('Понг # 50').
                                                    expectToBeVisible();

                                                tester.chatHistory.message.
                                                    containsSubstring('Понг # 49').
                                                    expectToBeHidden();
                                            });
                                            it('Отображен спиннер.', function() {
                                                tester.spin.expectToBeVisible();
                                            });
                                        });
                                        */
                                        it(
                                            'Получено Новое сообщение. Отправлен запрос чата. Прокрутил список чатов ' +
                                            'до конца. Запрос не отправлен.',
                                        function() {
                                            tester.newMessage().anotherChat().receive();
                                            tester.chatListRequest().fourthChat().expectToBeSent();
                                            tester.countersRequest().receiveResponse();

                                            tester.chatList.spinWrapper.scrollIntoView();
                                            ajax.expectNoRequestsToBeSent();
                                        });
                                        it(
                                            'Получено событие изменения статуса сообщения. Отправлен запрос ' +
                                            'количества чатов. Прокрутил список чатов до конца. Запрос не отправлен.',
                                        function() {
                                            tester.statusChangedMessage().receive();
                                            const countersRequest = tester.countersRequest().expectToBeSent();

                                            tester.chatList.spinWrapper.scrollIntoView();
                                            ajax.expectNoRequestsToBeSent();
                                        });
                                        it('История сообщений прокручена вниз.', function() {
                                            tester.chatHistory.bottom.expectToBeVisible();
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
                                    it('В чате присутсвует сообщение с аудио-вложением. Отображен плеер.', function() {
                                        messageListRequest.audioAttachment().receiveResponse();

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

                                        tester.chatHistory.message.atTime('12:12').
                                            expectToHaveTextContent(
                                                'call.mp3 ' +

                                                '53:40 ' +
                                                '12:12 ' +

                                                'Ответить'
                                            );
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

                                    tester.chatChannelSearchRequest().
                                        noChat().
                                        receiveResponse();

                                    tester.searchResultsRequest().
                                        onlyWhatsAppOut().
                                        channelSearch().
                                        receiveResponse();

                                    tester.select.
                                        option('WhatsApp 79283810988').
                                        click();

                                    tester.whatsAppChannelSelect.
                                        button('Начать чат').
                                        click();

                                    tester.chatListRequest().
                                        forCurrentEmployee().
                                        secondPage().
                                        receiveResponse();

                                    tester.chatListRequest().
                                        active().
                                        forCurrentEmployee().
                                        secondPage().
                                        receiveResponse();

                                    tester.chatListRequest().
                                        closed().
                                        forCurrentEmployee().
                                        secondPage().
                                        receiveResponse();

                                    tester.chatListRequest().
                                        active().
                                        forCurrentEmployee().
                                        isOtherEmployeesAppeals().
                                        receiveResponse();

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

                                    tester.chatChannelSearchRequest().
                                        noPhone().
                                        noChat().
                                        receiveResponse();

                                    tester.searchResultsRequest().
                                        onlyWhatsAppOut().
                                        noSearchString().
                                        receiveResponse();

                                    tester.select.
                                        option('WhatsApp 79283810988').
                                        click();

                                    tester.whatsAppChannelSelect.
                                        button('Начать чат').
                                        click();

                                    tester.chatListRequest().
                                        forCurrentEmployee().
                                        secondPage().
                                        receiveResponse();

                                    tester.chatListRequest().
                                        active().
                                        forCurrentEmployee().
                                        secondPage().
                                        receiveResponse();

                                    tester.chatListRequest().
                                        closed().
                                        forCurrentEmployee().
                                        secondPage().
                                        receiveResponse();

                                    tester.chatListRequest().
                                        active().
                                        forCurrentEmployee().
                                        isOtherEmployeesAppeals().
                                        receiveResponse();

                                    tester.chatStartingRequest().noPhone().receiveResponse();
                                    tester.chatListRequest().thirdChat().receiveResponse();

                                    tester.acceptChatRequest().receiveResponse();
                                    tester.visitorCardRequest().receiveResponse();

                                    tester.usersRequest().forContacts().receiveResponse();
                                    tester.usersRequest().forContacts().receiveResponse();
                                });
                                it('Отображена кнопка "Начать чат".', function() {
                                    tester.body.expectTextContentToHaveSubstring(
                                        'Начать чат ' +
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
                                    tester.leftMenu.button('Заявки').click();
                                    tester.chatListItem('Томова Денка Райчовна').click();

                                    tester.offlineMessageAcceptingRequest().anotherMessage().receiveResponse();
                                    tester.visitorCardRequest().receiveResponse();
                                    tester.usersRequest().forContacts().receiveResponse();
                                });

                                describe('Раскрываю панель "Заметки".', function() {
                                    beforeEach(function() {
                                        tester.collapsablePanel('Заметки').title.click();
                                    });

                                    describe('Открываю редактор тегов.', function() {
                                        beforeEach(function() {
                                            tester.collapsablePanel('Заметки').
                                                content.
                                                row('Тэги').
                                                tagField.
                                                button.
                                                click();
                                        });

                                        describe('Измению теги. Отправлен запрос изменения тегов.', function() {
                                            let offlineMessageMarkRequest;

                                            beforeEach(function() {
                                                tester.select.option('Продажа').click();
                                                tester.contactBar.click();

                                                offlineMessageMarkRequest = tester.offlineMessageMarkRequest().
                                                    expectToBeSent();
                                            });

                                            it('Получен ответ на запрос. Спиннер скрыт.', function() {
                                                offlineMessageMarkRequest.receiveResponse();
                                                tester.offlineMessageListRequest().singleMessage().receiveResponse();

                                                tester.collapsablePanel('Заметки').
                                                    content.
                                                    row('Тэги').
                                                    spin.
                                                    expectNotToExist();
                                            });
                                            it('Отображен спиннер.', function() {
                                                tester.collapsablePanel('Заметки').
                                                    content.
                                                    row('Тэги').
                                                    spin.
                                                    expectToBeVisible();
                                            });
                                        });
                                        it('Теги отсортированы по отмеченности.', function() {
                                            tester.select.popup.expectTextContentToHaveSubstring(
                                                'Нереализованная сделка ' +
                                                'Продажа ' +
                                                'Спам'
                                            );
                                        });
                                    });
                                    it('Помещаю курсор над полем тегов. Отображены выбранные теги.', function() {
                                        tester.collapsablePanel('Заметки').
                                            content.
                                            row('Тэги').
                                            tagField.
                                            display.
                                            putMouseOver();

                                        tester.tooltip.expectToHaveTextContent('Нереализованная сделка, Продажа');
                                    });
                                });
                                it('Отображена заявка.', function() {
                                    tester.chatHistory.message.atTime('11:17').expectToHaveTextContent(
                                        'Заявка ' +

                                        'Имя: Помакова Бисерка Драгановна ' +
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

                            tester.leftMenu.button('Заявки').expectToBeVisible();
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

                        tester.contactList.item('Бележкова Грета Ервиновна').expectToBeVisible();
                    });
                    it('Прокручиваю список чатов до конца. Запрошена вторая страница.', function() {
                        tester.chatList.spinWrapper.scrollIntoView();
                        tester.chatListRequest().forCurrentEmployee().secondPage().expectToBeSent();
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
                    tester.chatListRequest().forCurrentEmployee().expectToBeSent();

                    secondChatListRequest.failed().receiveResponse();
                    thirdChatListRequest.failed().receiveResponse();

                    tester.button('В работе 75').click();
                    tester.collapsablePanel('Активные').content.spinWrapper.scrollIntoView();

                    tester.chatListRequest().
                        active().
                        forCurrentEmployee().
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
                    tester.countersRequest().readMessage().fewUnreadMessages().receiveResponse();

                    tester.leftMenu.item('Чаты').counter.expectToHaveTextContent('7');
                });
                it('Получено новое сообщение. Отображено количество непрочитанных сообщений.', function() {
                    tester.newMessage().receive();
                    tester.chatListRequest().chat().receiveResponse();
                    tester.countersRequest().newMessage().fewUnreadMessages().receiveResponse();

                    tester.leftMenu.item('Чаты').counter.expectToHaveTextContent('9');
                });
                it('Отображено количество непрочитанных сообщений.', function() {
                    tester.leftMenu.item('Чаты').counter.expectToHaveTextContent('8');
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
        describe('Выбор тегов недоступен.', function() {
            beforeEach(function() {
                accountRequest.tagsUpdatingUnavailable().receiveResponse();

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
                    tagsUpdatingUnavailable().
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
                    tagsUpdatingUnavailable().
                    receiveResponse();

                tester.accountRequest().
                    forChats().
                    softphoneFeatureFlagDisabled().
                    operatorWorkplaceAvailable().
                    tagsUpdatingUnavailable().
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
            });

            it('Открываю чат. Раскрываю панель "Заметки". Опции тегов заблокированы.', function() {
                tester.input.fill('Сообщение #75');

                tester.input.pressEnter();
                tester.searchResultsRequest().receiveResponse();

                tester.chatListItem('Сообщение #75').click();
                
                tester.chatListRequest().thirdChat().receiveResponse();
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

                tester.collapsablePanel('Заметки').title.click();

                tester.collapsablePanel('Заметки').
                    content.
                    row('Тэги').
                    tagField.
                    button.
                    expectNotToExist();
            });
            it('Открываю заявку. Раскрываю панель "Заметки". Опции тегов заблокированы.', function() {
                tester.leftMenu.button('Заявки').click();
                tester.chatListItem('прива').click();

                tester.offlineMessageAcceptingRequest().receiveResponse();
                tester.visitorCardRequest().receiveResponse();
                tester.usersRequest().forContacts().receiveResponse();

                tester.collapsablePanel('Заметки').title.click();

                tester.collapsablePanel('Заметки').
                    content.
                    row('Тэги').
                    tagField.
                    button.
                    expectNotToExist();
            });
        });
    });
});
