tests.addTest(options => {
   const {
        utils,
        setFocus,
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
            accountRequest,
            permissionsRequest,
            authenticatedUserRequest,
            registrationRequest,
            statsRequest,
            chatListRequest,
            secondChatListRequest,
            thirdChatListRequest,
            countersRequest,
            employeeStatusesRequest;

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
            let chatSettingsRequest,
                offlineMessageListRequest;

            beforeEach(function() {
                accountRequest.receiveResponse();

                tester.notificationChannel().applyLeader().expectToBeSent();
                tester.masterInfoMessage().receive();
                tester.notificationChannel().tellIsLeader().expectToBeSent();
                tester.masterInfoMessage().tellIsLeader().expectToBeSent();
                tester.notificationChannel().applyLeader().expectToBeSent();

                tester.employeesWebSocket.connect();
                tester.employeesInitMessage().expectToBeSent();

                requests = ajax.inAnyOrder();

                tester.ticketsContactsRequest().receiveResponse();

                reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
                const reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                    reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests);

                employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests);
                const employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(requests),
                    employeeRequest = tester.employeeRequest().expectToBeSent(requests);

                requests.expectToBeSent();

                reportGroupsRequest.receiveResponse();
                reportsListRequest.receiveResponse();
                reportTypesRequest.receiveResponse();

                employeeSettingsRequest.receiveResponse();
                employeeRequest.receiveResponse();

                tester.accountRequest().
                    forChats().
                    webAccountLoginUnavailable().
                    softphoneFeatureFlagDisabled().
                    operatorWorkplaceAvailable().
                    receiveResponse();

                tester.chatsWebSocket.connect();
                tester.chatsInitMessage().expectToBeSent();

                {
                    const requests = ajax.inAnyOrder();

                    const accountRequest = tester.accountRequest().
                        forChats().
                        webAccountLoginUnavailable().
                        softphoneFeatureFlagDisabled().
                        operatorWorkplaceAvailable().
                        expectToBeSent(requests);

                    chatSettingsRequest = tester.chatSettingsRequest().expectToBeSent(requests);
                    const chatChannelListRequest = tester.chatChannelListRequest().expectToBeSent(requests),
                        listRequest = tester.listRequest().expectToBeSent(requests),
                        siteListRequest = tester.siteListRequest().expectToBeSent(requests),
                        messageTemplateListRequest = tester.messageTemplateListRequest().expectToBeSent(requests),
                        reportsListRequest = tester.reportsListRequest().expectToBeSent(requests);

                    requests.expectToBeSent();

                    accountRequest.receiveResponse();
                    chatChannelListRequest.receiveResponse();
                    listRequest.receiveResponse();
                    siteListRequest.receiveResponse();
                    messageTemplateListRequest.receiveResponse();
                    reportsListRequest.receiveResponse();
                }

                countersRequest = tester.countersRequest().expectToBeSent();

                tester.offlineMessageCountersRequest().receiveResponse();
                tester.chatChannelListRequest().receiveResponse();
                tester.siteListRequest().receiveResponse();
                tester.markListRequest().receiveResponse();

                chatListRequest = tester.chatListRequest().forCurrentEmployee().expectToBeSent();
                secondChatListRequest = tester.chatListRequest().forCurrentEmployee().active().expectToBeSent();
                thirdChatListRequest = tester.chatListRequest().forCurrentEmployee().closed().expectToBeSent();

                tester.chatChannelTypeListRequest().receiveResponse();

                offlineMessageListRequest = tester.offlineMessageListRequest().notProcessed().expectToBeSent();
                tester.offlineMessageListRequest().processing().receiveResponse();
                tester.offlineMessageListRequest().processed().receiveResponse();
            });

            describe('Имя заявки определено.', function() {
                beforeEach(function() {
                    offlineMessageListRequest.receiveResponse();
                });

                describe('Подтверждение принятия чата в работу включено.', function() {
                    beforeEach(function() {
                        chatSettingsRequest.receiveResponse();
                    });

                    describe('Получены статусы.', function() {
                        beforeEach(function() {
                            employeeStatusesRequest.receiveResponse();
                        });

                        describe('Много непрочитанных сообщений.', function() {
                            beforeEach(function() {
                                countersRequest.receiveResponse();
                            });

                            describe('Данные чатов успешно получены.', function() {
                                beforeEach(function() {
                                    chatListRequest.receiveResponse();
                                    thirdChatListRequest.receiveResponse();
                                });

                                describe('Закрепленных чатов нет.', function() {
                                    beforeEach(function() {
                                        secondChatListRequest.receiveResponse();
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
                                                    visitorCardRequest = tester.visitorCardRequest().expectToBeSent();
                                                    messageListRequest = tester.messageListRequest().expectToBeSent();

                                                    tester.usersRequest().forContacts().receiveResponse();
                                                    tester.contactGroupsRequest().receiveResponse();
                                                });

                                                describe('У посетителя есть и номера и E-Mail.', function() {
                                                    beforeEach(function() {
                                                        visitorCardRequest.receiveResponse();

                                                        tester.contactGroupsRequest().receiveResponse();
                                                        tester.usersRequest().forContacts().receiveResponse();
                                                    });

                                                    describe('Сообщений немного.', function() {
                                                        beforeEach(function() {
                                                            messageListRequest.receiveResponse();
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

                                                            describe(
                                                                'Изменяю номер телефона. Отправлен запрос обновления ' +
                                                                'посетителя.',
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

                                                                tester.contactsRequest().
                                                                    phoneSearching().
                                                                    noData().
                                                                    receiveResponse();

                                                                tester.visitorCardUpdatingRequest().
                                                                    anotherPhone().
                                                                    receiveResponse();

                                                                tester.chatPhoneUpdatingRequest().receiveResponse();
                                                            });
                                                            it(
                                                                'Нажимаю на кнопку удаления телефона. Отправлен ' +
                                                                'запрос обновления посетителя.',
                                                            function() {
                                                                tester.select.option('Удалить').click();

                                                                spendTime(0);
                                                                spendTime(0);
                                                                tester.modalWindow.endTransition('transform');

                                                                tester.modalWindow.button('Удалить').click();

                                                                tester.visitorCardUpdatingRequest().
                                                                    noPhone().
                                                                    receiveResponse();

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

                                                                describe(
                                                                    'Нажимаю на кнопку "По алфавиту".',
                                                                function() {
                                                                    beforeEach(function() {
                                                                        tester.button('По алфавиту').click();
                                                                    });

                                                                    it(
                                                                        'Снова нажимаю на кнопку "По алфавиту". Теги ' +
                                                                        'отсортированы по алфавиту в обратном порядке.',
                                                                    function() {
                                                                        tester.button('По алфавиту').click();
                                                                        
                                                                        tester.button('По популярности').
                                                                            expectNotToBeChecked();

                                                                        tester.button('По алфавиту').
                                                                            expectToBeChecked();
                                                                        tester.button('Проставлено').
                                                                            expectNotToBeChecked();

                                                                        tester.select.popup.
                                                                            expectTextContentToHaveSubstring(
                                                                                'искалицезиюнашлипоздноутромсвистящ' +
                                                                                'егохна ' +

                                                                                'Генератор лидов ' +
                                                                                'В обработке'
                                                                            );
                                                                    });
                                                                    it('Теги отсортированы по алфавиту.', function() {
                                                                        tester.button('По популярности').
                                                                            expectNotToBeChecked();

                                                                        tester.button('По алфавиту').
                                                                            expectToBeChecked();
                                                                        tester.button('Проставлено').
                                                                            expectNotToBeChecked();

                                                                        tester.select.popup.
                                                                            expectTextContentToHaveSubstring(
                                                                                'В обработке ' +
                                                                                'Генератор лидов ' +
                                                                                'Кобыла и трупоглазые жабы'
                                                                            );
                                                                    });
                                                                });
                                                                describe(
                                                                    'Измению теги. Отправлен запрос изменения тегов.',
                                                                function() {
                                                                    let chatMarkingRequest;

                                                                    beforeEach(function() {
                                                                        tester.select.option('Продажа').click();
                                                                        tester.contactBar.click();

                                                                        chatMarkingRequest = tester.
                                                                            chatMarkingRequest().
                                                                            expectToBeSent();
                                                                    });

                                                                    it(
                                                                        'Получен ответ на запрос. Спиннер скрыт.',
                                                                    function() {
                                                                        chatMarkingRequest.receiveResponse();

                                                                        tester.chatListRequest().
                                                                            thirdChat().
                                                                            receiveResponse();

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
                                                                    'Нажимаю на кнопку "По популярности". Теги ' +
                                                                    'отсортированы по популярности.',
                                                                function() {
                                                                    tester.button('По популярности').click();

                                                                    tester.button('По популярности').
                                                                        expectToBeChecked();
                                                                    tester.button('По алфавиту').expectNotToBeChecked();
                                                                    tester.button('Проставлено').expectNotToBeChecked();

                                                                    tester.select.popup.
                                                                        expectTextContentToHaveSubstring(
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
                                                                    'Нажата кнопка "Проставлено". Теги отсортированы ' +
                                                                    'по отмеченности.',
                                                                function() {
                                                                    tester.button('По популярности').
                                                                        expectNotToBeChecked();
                                                                    tester.button('По алфавиту').expectNotToBeChecked();
                                                                    tester.button('Проставлено').expectToBeChecked();

                                                                    tester.select.popup.
                                                                        expectTextContentToHaveSubstring(
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

                                                                tester.tooltip.expectToHaveTextContent(
                                                                    'Продажа, Нереализованная сделка'
                                                                );
                                                            });
                                                        });
                                                        it(
                                                            'Раскрываю панель "Дополнительная информация". Оторажена ' +
                                                            'дополнительная информация.',
                                                        function() {
                                                            tester.collapsablePanel('Дополнительная информация').
                                                                title.
                                                                click();

                                                            tester.chatInfoRequest().receiveResponse();

                                                            tester.collapsablePanel('Дополнительная информация').
                                                                title.
                                                                click();

                                                            tester.collapsablePanel('Дополнительная информация').
                                                                content.
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
                                                        it(
                                                            'Изменяю имя посетителя. В списке чатов отображено новое ' +
                                                            'имя посетителя.',
                                                        function() {
                                                            tester.contactBar.section('ФИО').svg.click();

                                                            tester.input.
                                                                withPlaceholder('Фамилия (Обязательное поле)').
                                                                fill('Неделчева');

                                                            tester.input.
                                                                withPlaceholder('Имя').
                                                                fill('Роза');

                                                            tester.input.
                                                                withPlaceholder('Отчество').
                                                                fill('Ангеловна');

                                                            tester.contactBar.
                                                                section('Телефоны').
                                                                option('79164725823').
                                                                putMouseOver();

                                                            tester.contactBar.
                                                                section('Телефоны').
                                                                option('79164725823').
                                                                toolsIcon.
                                                                click();
                                                            tester.select.option('Редактировать').click();

                                                            tester.contactBar.
                                                                section('Телефоны').
                                                                input.
                                                                fill('79162729534');

                                                            tester.contactBar.
                                                                section('Телефоны').
                                                                button('Сохранить').
                                                                click();

                                                            tester.contactsRequest().
                                                                phoneSearching().
                                                                noData().
                                                                receiveResponse();

                                                            tester.visitorCardUpdatingRequest().
                                                                anotherName().
                                                                anotherPhone().
                                                                receiveResponse();

                                                            tester.chatPhoneUpdatingRequest().receiveResponse();

                                                            tester.chatListItem('Сообщение #75').
                                                                expectToHaveTextContent(
                                                                    'Неделчева Роза Ангеловна ' +
                                                                    '20 янв 2020 ' +
                                                                    'Сообщение #75 1'
                                                                );
                                                        });
                                                        it('Нажимаю на кнопку "Создать контакт".', function() {
                                                            tester.button('Создать контакт').click();

                                                            tester.contactCreatingRequest().
                                                                fromVisitor().
                                                                receiveResponse();

                                                            tester.groupsContainingContactRequest().
                                                                anotherContact().
                                                                receiveResponse();

                                                            tester.chatListRequest().thirdChat().expectToBeSent();
                                                            tester.contactRequest().fifthContact().receiveResponse();

                                                            tester.contactBar.title.expectToHaveTextContent('Контакт');

                                                            tester.contactBar.section('Телефоны').svg.
                                                                expectToBeVisible();

                                                            tester.contactBar.section('E-Mail').svg.expectToBeVisible();
                                                        });
                                                        it(
                                                            'Нажимаю на иконку с плюсом рядом с текстом ' +
                                                            '"Персональный менеджер". Выпадающий список менеджеров ' +
                                                            'скрыт.',
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
                                                        it(
                                                            'Приходит трансфер без подтверждения от другого ' +
                                                            'сотрудника. Отображено уведомление.',
                                                        function() {
                                                            tester.forcedTransferMessage().receive();

                                                            tester.body.expectTextContentToHaveSubstring(
                                                               'Перевод обращения ' +
                                                               'От сотрудника: Чакърова Райна Илковна ' +
                                                               'Клиент: #16479304 Гость ' +
                                                               'Комментарий: Поговори с ней сама, я уже устала'
                                                            );

                                                            tester.body.expectTextContentNotToHaveSubstring(
                                                                'Принять Отказаться'
                                                            );
                                                        });
                                                        it(
                                                            'Приходит трансфер от другого сотрудника. Отображено ' +
                                                            'уведомление.',
                                                        function() {
                                                            tester.transferCreatingMessage().receive();

                                                            tester.body.expectTextContentToHaveSubstring(
                                                               'Перевод обращения ' +
                                                               'От сотрудника: Чакърова Райна Илковна ' +
                                                               'Клиент: #16479304 Гость ' +
                                                               'Комментарий: Поговори с ней сама, я уже устала ' +
                                                                'Принять Отказаться'
                                                            );
                                                        });
                                                        it(
                                                            'Приходит трансфер без подтверждения от другого ' +
                                                            'сотрудника. Отображено уведомление.',
                                                        function() {
                                                            tester.forcedTransferMessage().noLastMessage().receive();

                                                            tester.body.expectTextContentToHaveSubstring(
                                                               'Перевод обращения ' +
                                                               'От сотрудника: Чакърова Райна Илковна ' +
                                                               'Клиент: #16479304 Гость ' +
                                                               'Комментарий: Поговори с ней сама, я уже устала'
                                                            );

                                                            tester.body.expectTextContentNotToHaveSubstring(
                                                                'Принять Отказаться'
                                                            );
                                                        });
                                                        it(
                                                            'Приходит трансфер от другого сотрудника. Отображено ' +
                                                            'уведомление.',
                                                        function() {
                                                            tester.transferCreatingMessage().noLastMessage().receive();

                                                            tester.body.expectTextContentToHaveSubstring(
                                                               'Перевод обращения ' +
                                                               'От сотрудника: Чакърова Райна Илковна ' +
                                                               'Клиент: #16479304 Гость ' +
                                                               'Комментарий: Поговори с ней сама, я уже устала ' +
                                                               'Принять Отказаться'
                                                            );
                                                        });
                                                        it('Отображены сообщения чата.', function() {
                                                            tester.contactBar.
                                                                title.
                                                                expectToHaveTextContent('Посетитель');

                                                            tester.chatHistory.
                                                                message.atTime('12:13').
                                                                expectToBeDelivered();

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
                                                                option('Помакова Бисерка Драгановна (bot)').
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

                                                            tester.tooltip.expectToHaveTextContent(
                                                                'Доступно после создания контакта'
                                                            );
                                                        });
                                                    });
                                                    describe('Сообщение много.', function() {
                                                        let chatListRequest;

                                                        beforeEach(function() {
                                                            messageListRequest.firstPage().receiveResponse();
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

                                                                it(
                                                                    'Прокрутил список чатов до конца. Запрос ' +
                                                                    'отправлен.',
                                                                function() {
                                                                    tester.chatList.spinWrapper.scrollIntoView();

                                                                    tester.chatListRequest().
                                                                        forCurrentEmployee().
                                                                        thirdPage().
                                                                        receiveResponse();
                                                                });
                                                                it('Спиннер скрыт.', function() {
                                                                    tester.spin.expectNotToExist();

                                                                    tester.chatList.item('Сообщение #30').
                                                                        expectToBeVisible();

                                                                    tester.chatList.item('Сообщение #31').
                                                                        expectToBeVisible();
                                                                });
                                                            });
                                                            it(
                                                                'Прокрутил список чатов до конца. Запрос не отправлен.',
                                                            function() {
                                                                tester.chatList.spinWrapper.scrollIntoView();
                                                                ajax.expectNoRequestsToBeSent();
                                                            });
                                                            it('Отображен спиннер.', function() {
                                                                tester.spin.expectToBeVisible();

                                                                tester.chatList.
                                                                    item('Сообщение #31').
                                                                    expectNotToExist();
                                                            });

                                                        });
                                                        /*describe(
                                                            'История сообщений прокручена вверх. Отправлен запрос ' +
                                                            'сообщений.',
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
                                                            'Получено Новое сообщение. Отправлен запрос чата. ' +
                                                            'Прокрутил список чатов до конца. Запрос не отправлен.',
                                                        function() {
                                                            tester.newMessage().anotherChat().receive();
                                                            tester.chatListRequest().fourthChat().expectToBeSent();
                                                            tester.countersRequest().receiveResponse();

                                                            tester.chatList.spinWrapper.scrollIntoView();
                                                            ajax.expectNoRequestsToBeSent();
                                                        });
                                                        it(
                                                            'Получено событие изменения статуса сообщения. Отправлен ' +
                                                            'запрос количества чатов. Прокрутил список чатов до ' +
                                                            'конца. Запрос не отправлен.',
                                                        function() {
                                                            tester.statusChangedMessage().receive();

                                                            const countersRequest = tester.countersRequest().
                                                                expectToBeSent();

                                                            tester.chatList.spinWrapper.scrollIntoView();
                                                            ajax.expectNoRequestsToBeSent();
                                                        });
                                                        it('История сообщений прокручена вниз.', function() {
                                                            tester.chatHistory.bottom.expectToBeVisible();
                                                        });
                                                    });
                                                    it(
                                                        'Получен ответ на сообщение. Отображено сообщение на которое ' +
                                                        'отвечает пользователь.',
                                                    function() {
                                                        messageListRequest.reply().receiveResponse();

                                                        tester.chatHistory.message.atTime('12:13').
                                                            expectToHaveTextContent(
                                                                'Помакова Бисерка Драгановна ' +
                                                                'Как дела? ' +
                                                                'Привет 12:13 Ответить'
                                                            );
                                                    });
                                                    it(
                                                        'В чате присутсвует сообщение с аудио-вложением. Отображен ' +
                                                        'плеер.',
                                                    function() {
                                                        messageListRequest.audioAttachment().receiveResponse();

                                                        tester.chatHistory.message.atTime('12:12').
                                                            expectToHaveTextContent(
                                                                'call.mp3 ' +

                                                                '53:40 ' +
                                                                '12:12 ' +

                                                                'Ответить'
                                                            );
                                                    });
                                                    it('В чате присутсвтует сообщение со ссылкой.', function() {
                                                        messageListRequest.link().receiveResponse();

                                                        tester.anchor('https://meduza.io').expectToBeVisible();
                                                        tester.anchor('https://google.com').expectToBeVisible();
                                                    });
                                                });
                                                describe('Сообщений немного.', function() {
                                                    beforeEach(function() {
                                                        messageListRequest.receiveResponse();
                                                    });

                                                    describe('У посетителя есть два телефона.', function() {
                                                        beforeEach(function() {
                                                            visitorCardRequest.addSecondPhoneNumber().receiveResponse();
                                                            tester.contactGroupsRequest().receiveResponse();
                                                            tester.usersRequest().forContacts().receiveResponse();
                                                        });

                                                        describe('Нажимаю на кнопку перевода чата.', function() {
                                                            beforeEach(function() {
                                                                tester.button('Принять обращение в работу').click();
                                                                tester.acceptChatRequest().receiveResponse();

                                                                tester.chatTransferButton.click();
                                                                tester.transferPanel.select.click();

                                                                tester.chatTransferGroupsRequest().receiveResponse();
                                                            });

                                                            it('Выбераю доступного оператора.', function() {
                                                                tester.select.
                                                                    option('Чакърова Райна Илковна').
                                                                    click();

                                                                tester.transferPanel.
                                                                    select.
                                                                    expectToHaveTextContent('Чакърова Райна Илковна');
                                                            });
                                                            it(
                                                                'Выбераю недоступного оператора. Оператор не выбран.',
                                                            function() {
                                                                tester.select.
                                                                    option('Костова Марвуда Любенова').
                                                                    click();

                                                                tester.transferPanel.
                                                                    select.
                                                                    expectToHaveTextContent('Костова Марвуда Любенова');
                                                            });
                                                        });
                                                        describe(
                                                            'Нажимаю на кнопку принятия чата. Чат принят.',
                                                        function() {
                                                            beforeEach(function() {
                                                                tester.button('Принять обращение в работу').click();
                                                                tester.acceptChatRequest().receiveResponse();
                                                            });
                                                            
                                                            describe('Ввожу сообщение.', function() {
                                                                beforeEach(function() {
                                                                    tester.textarea.
                                                                        withPlaceholder('Введите сообщение...').
                                                                        fill('Мне тревожно, успокой меня');
                                                                });

                                                                describe(
                                                                    'Нажимаю на кнопку отправки сообщения.',
                                                                function() {
                                                                    beforeEach(function() {
                                                                        tester.chatMessageSendingButton.click();

                                                                        messageAddingRequest =
                                                                            tester.messageAddingRequest().
                                                                            expectToBeSent();

                                                                        tester.changeMessageStatusRequest().
                                                                            anotherChat().
                                                                            anotherMessage().
                                                                            read().
                                                                            receiveResponse();
                                                                    });

                                                                    describe('Токен авторизации истек.', function() {
                                                                        let refreshRequest;

                                                                        beforeEach(function() {
                                                                            messageAddingRequest.
                                                                                accessTokenExpired().
                                                                                receiveResponse();

                                                                            refreshRequest = tester.refreshRequest().
                                                                                expectToBeSent();
                                                                        });

                                                                        it(
                                                                            'Не удалось обновить токен авторизации.',
                                                                        function() {
                                                                            refreshRequest.
                                                                                refreshTokenExpired().
                                                                                receiveResponse();

                                                                            tester.userLogoutRequest().
                                                                                receiveResponse();

                                                                            tester.chatsWebSocket.finishDisconnecting();

                                                                            tester.employeesWebSocket.
                                                                                finishDisconnecting();
                                                                        });
                                                                        it(
                                                                            'Удалось обновить токен авторизации. ' +
                                                                            'Сообщение отправлено.',
                                                                        function() {
                                                                            refreshRequest.receiveResponse();

                                                                            tester.messageAddingRequest().
                                                                                receiveResponse();
                                                                        });
                                                                    });
                                                                    it('Сообщение отправлено.', function() {
                                                                        messageAddingRequest.receiveResponse();
                                                                    });
                                                                });
                                                                describe(
                                                                    'Прикладываю файл. Отправляю сообщение.',
                                                                function() {
                                                                    let messageAddingRequest;

                                                                    beforeEach(function() {
                                                                        tester.fileField.upload('some-file.zip');

                                                                        fileReader.
                                                                            accomplishFileLoading('some-file.zip');

                                                                        tester.chatMessageSendingButton.click();
                                                                        tester.messageAddingRequest().receiveResponse();

                                                                        tester.changeMessageStatusRequest().
                                                                            anotherChat().
                                                                            anotherMessage().
                                                                            read().
                                                                            receiveResponse();

                                                                        tester.resourceRequest().receiveResponse();

                                                                        messageAddingRequest =
                                                                            tester.messageAddingRequest().
                                                                            resource().
                                                                            anotherMessage().
                                                                            expectToBeSent();
                                                                    });

                                                                    it(
                                                                        'Не удалось отправить сообщение. Отправляю ' +
                                                                        'следующее сообщение. Сообщение успешно ' +
                                                                        'отправлено.',
                                                                    function() {
                                                                        messageAddingRequest.
                                                                            failed().
                                                                            receiveResponse();

                                                                        tester.textarea.
                                                                            withPlaceholder('Введите сообщение...').
                                                                            fill('Я хочу спать');

                                                                        tester.chatMessageSendingButton.click();

                                                                        tester.messageAddingRequest().
                                                                            thirdMessage().
                                                                            receiveResponse();
                                                                    });
                                                                    it('Удалось отправить сообщение.', function() {
                                                                        tester.textarea.
                                                                            withPlaceholder('Введите сообщение...').
                                                                            fill('Я хочу спать');

                                                                        tester.chatMessageSendingButton.click();

                                                                        messageAddingRequest.
                                                                            failed().
                                                                            receiveResponse();

                                                                        tester.messageAddingRequest().
                                                                            thirdMessage().
                                                                            receiveResponse();
                                                                    });
                                                                });
                                                            });
                                                            it(
                                                                'Нажимаю на кнопку "Шаблон". Нажимаю на кнопку ' +
                                                                'добавления шаблона. Нажимаю на кнопку "Добавить". ' +
                                                                'Отправлен запрос создания шаблона.',
                                                            function() {
                                                                tester.button('Шаблон').click();
                                                                tester.chatTemplateMenu.button.first.click();

                                                                tester.modalWindow.fileField.upload('some-file.zip');
                                                                fileReader.accomplishFileLoading('some-file.zip');

                                                                tester.button('Добавить').click();

                                                                tester.resourceRequest().receiveResponse();

                                                                tester.messageTemplateCreationRequest().
                                                                    receiveResponse();

                                                                tester.messageTemplateListRequest().receiveResponse();
                                                            });
                                                            it('Кнопка завершения чата доступна.', function() {
                                                                tester.button('Закончить чат').click();
                                                                tester.chatClosingRequest().receiveResponse();
                                                            });
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
                                                        tester.contactGroupsRequest().receiveResponse();
                                                        tester.usersRequest().forContacts().receiveResponse();

                                                        tester.contactBar.section('Телефоны').svg.expectNotToExist();
                                                        tester.contactBar.section('E-Mail').svg.expectToBeVisible();
                                                    });
                                                    it('У посетителя нет телефона.', function() {
                                                        visitorCardRequest.noPhone().receiveResponse();
                                                        tester.contactGroupsRequest().receiveResponse();
                                                        tester.usersRequest().forContacts().receiveResponse();

                                                        tester.contactBar.section('Телефоны').svg.expectToBeVisible();
                                                        tester.contactBar.section('E-Mail').svg.expectNotToExist();
                                                    });
                                                });
                                                it(
                                                    'Среди сообщений есть ответ посетителя на другое сообщение. ' +
                                                    'Данные посетителя получены позже списка сообщений. Имя ' +
                                                    'посетителя отображено в ответе.',
                                                function() {
                                                    messageListRequest.reply().receiveResponse();
                                                    visitorCardRequest.receiveResponse();

                                                    tester.contactGroupsRequest().receiveResponse();
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

                                                        tester.visitorCardRequest().
                                                            addSecondPhoneNumber().
                                                            receiveResponse();

                                                        tester.messageListRequest().receiveResponse();
                                                        tester.usersRequest().forContacts().receiveResponse();
                                                        tester.contactGroupsRequest().receiveResponse();
                                                        tester.contactGroupsRequest().receiveResponse();
                                                        tester.usersRequest().forContacts().receiveResponse();
                                                    });

                                                    it('Нажимаю на кнопку "Создать контакт".', function() {
                                                        tester.button('Создать контакт').click();

                                                        tester.contactCreatingRequest().
                                                            whatsapp().
                                                            fromVisitor().
                                                            receiveResponse();

                                                        tester.groupsContainingContactRequest().
                                                            anotherContact().
                                                            receiveResponse();

                                                        tester.chatListRequest().thirdChat().expectToBeSent();
                                                        tester.contactRequest().fifthContact().receiveResponse();

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

                                                    tester.visitorCardRequest().
                                                        addSecondPhoneNumber().
                                                        receiveResponse();

                                                    tester.messageListRequest().receiveResponse();

                                                    tester.usersRequest().forContacts().receiveResponse();
                                                    tester.contactGroupsRequest().receiveResponse();
                                                    tester.contactGroupsRequest().receiveResponse();
                                                    tester.usersRequest().forContacts().receiveResponse();

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

                                                    tester.visitorCardRequest().
                                                        addSecondPhoneNumber().
                                                        receiveResponse();

                                                    tester.messageListRequest().receiveResponse();

                                                    tester.usersRequest().forContacts().receiveResponse();
                                                    tester.contactGroupsRequest().receiveResponse();
                                                    tester.contactGroupsRequest().receiveResponse();
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

                                                chatListRequest = tester.chatListRequest().
                                                    contactExists().
                                                    thirdChat().
                                                    expectToBeSent();
                                            });

                                            describe('Определен ext_id.', function() {
                                                let contactRequest;

                                                beforeEach(function() {
                                                    chatListRequest.extIdSpecified().receiveResponse();

                                                    tester.visitorCardRequest().receiveResponse();
                                                    tester.messageListRequest().receiveResponse();
                                                    tester.usersRequest().forContacts().receiveResponse();

                                                    contactRequest = tester.contactRequest().
                                                        addTelegram().
                                                        addFourthTelegram().
                                                        expectToBeSent();
                                                });

                                                describe('Получены данные контакта, связанного с чатом. ', function() {
                                                    beforeEach(function() {
                                                        contactRequest.receiveResponse();
                                                        tester.groupsContainingContactRequest().receiveResponse();
                                                        tester.contactGroupsRequest().receiveResponse();
                                                    });

                                                    it(
                                                        'Добавляю номер телефона. Он дублируется. Сливаю контакты. В ' +
                                                        'списке чатов поменялось имя контакта.',
                                                    function() {
                                                        tester.contactBar.
                                                            section('Телефоны').
                                                            option('79162729533').
                                                            putMouseOver();

                                                        tester.contactBar.
                                                            section('Телефоны').
                                                            option('79162729533').
                                                            toolsIcon.
                                                            click();

                                                        tester.select.option('Редактировать').click();

                                                        tester.contactBar.
                                                            section('Телефоны').
                                                            input.
                                                            fill('79162729534');

                                                        tester.contactBar.
                                                            section('Телефоны').
                                                            button('Сохранить').
                                                            click();

                                                        tester.contactsRequest().
                                                            phoneSearching().
                                                            oneItem().
                                                            receiveResponse();

                                                        tester.contactBar.
                                                            section('Телефоны').
                                                            select.
                                                            first.
                                                            click();

                                                        tester.select.option(
                                                            'Паскалева Бисера Илковна ' +
                                                            '79162729533 ' +
                                                            '79162722748'
                                                        ).click();
                                                        
                                                        tester.button('Объединить').click();

                                                        tester.contactsMergingRequest().
                                                            deleteCurrent().
                                                            changeFirstPhone().
                                                            addTelegram().
                                                            addAnotherTelegram().
                                                            receiveResponse();

                                                        tester.groupsContainingContactRequest().
                                                            fourthContact().
                                                            receiveResponse();

                                                        tester.groupsContainingContactRequest().
                                                            fourthContact().
                                                            receiveResponse();

                                                        tester.contactGroupsRequest().receiveResponse();
                                                        tester.usersRequest().forContacts().receiveResponse();
                                                        tester.contactRequest().thirdContact().receiveResponse();

                                                        tester.chatListItem('Сообщение #75').expectToHaveTextContent(
                                                            'Паскалева Бисера Илковна ' +
                                                            '20 янв 2020 ' +
                                                            'Сообщение #75 1'
                                                        );
                                                    });
                                                    it(
                                                        'Открываю раздел контактов. Удаляю контакт. Возвращаюсь в ' +
                                                        'раздел чатов. В списке чатов имя контакта поменялось на имя ' +
                                                        'посетителя.',
                                                    function() {
                                                        tester.leftMenu.button('Контакты').click();
                                                        tester.contactsRequest().differentNames().receiveResponse();

                                                        tester.contactList.item('Бележкова Грета Ервиновна').click();

                                                        const requests = ajax.inAnyOrder();

                                                        contactCommunicationsRequest = tester.
                                                            contactCommunicationsRequest().
                                                            secondEarlier().
                                                            expectToBeSent(requests);

                                                        contactRequest = tester.contactRequest().
                                                            expectToBeSent(requests);

                                                        const contactGroupsRequest = tester.contactGroupsRequest().
                                                            expectToBeSent(requests);

                                                        const usersRequest = tester.usersRequest().
                                                            forContacts().
                                                            expectToBeSent(requests);

                                                        requests.expectToBeSent();

                                                        usersRequest.receiveResponse();
                                                        contactRequest.receiveResponse();
                                                        contactCommunicationsRequest.receiveResponse();
                                                        contactGroupsRequest.receiveResponse();
                                                        tester.groupsContainingContactRequest().receiveResponse();
                                                        tester.contactGroupsRequest().receiveResponse();

                                                        tester.contactBar.title.deleteButton.click();

                                                        tester.modalWindow.button('Удалить').click();
                                                        tester.contactDeletingRequest().receiveResponse();

                                                        tester.leftMenu.button('99+ Чаты').click();

                                                        tester.accountRequest().
                                                            forChats().
                                                            webAccountLoginUnavailable().
                                                            softphoneFeatureFlagDisabled().
                                                            operatorWorkplaceAvailable().
                                                            expectToBeSent();

                                                        tester.chatSettingsRequest().receiveResponse();
                                                        tester.chatChannelListRequest().receiveResponse(); 
                                                        tester.listRequest().receiveResponse(); 
                                                        tester.siteListRequest().receiveResponse(); 
                                                        tester.messageTemplateListRequest().receiveResponse(); 
                                                        tester.usersRequest().forContacts().receiveResponse();
                                                        tester.contactGroupsRequest().receiveResponse();

                                                        tester.chatList.expectTextContentToHaveSubstring(
                                                            'Помакова Бисерка Драгановна ' +
                                                            '20 янв 2020 ' +
                                                            'Сообщение #75 1 ' +

                                                            'Помакова Бисерка Драгановна ' +
                                                            '21 янв 2022 ' +
                                                            'Привет 3'
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
                                                    });
                                                    it('Текущий канал связи выделен.', function() {
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
                                                            option('79218307632 (bot)').
                                                            telegram.
                                                            expectNotToBeSelected();

                                                        tester.contactBar.
                                                            section('Каналы связи').
                                                            option('79283810928 (bot)').
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
                                                });
                                                it('Данные контакта, связанного с чатом не были получены.', function() {
                                                    contactRequest.notFound().receiveResponse();

                                                    tester.chatListRequest().
                                                        thirdChat().
                                                        anotherContactExists().
                                                        receiveResponse();

                                                    tester.usersRequest().forContacts().receiveResponse();

                                                    tester.contactRequest().
                                                        sixthContact().
                                                        receiveResponse();

                                                    tester.groupsContainingContactRequest().
                                                        thirdContact().
                                                        receiveResponse();

                                                    tester.contactGroupsRequest().receiveResponse();
                                                });
                                            });
                                            it('Определен телефон. Текущий канал связи выделен.', function() {
                                                chatListRequest.phoneSpecified().receiveResponse();

                                                tester.visitorCardRequest().receiveResponse();
                                                tester.messageListRequest().receiveResponse();

                                                tester.usersRequest().forContacts().receiveResponse();

                                                tester.contactRequest().
                                                    addTelegram().
                                                    addFourthTelegram().
                                                    receiveResponse();

                                                tester.groupsContainingContactRequest().receiveResponse();
                                                tester.contactGroupsRequest().receiveResponse();

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
                                                    option('79218307632 (bot)').
                                                    telegram.
                                                    expectNotToBeSelected();

                                                tester.contactBar.
                                                    section('Каналы связи').
                                                    option('79283810928 (bot)').
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

                                                tester.visitorCardRequest().receiveResponse();
                                                tester.messageListRequest().receiveResponse();

                                                tester.usersRequest().forContacts().receiveResponse();
                                                tester.contactRequest().addFourthTelegram().receiveResponse();
                                                tester.groupsContainingContactRequest().receiveResponse();
                                                tester.contactGroupsRequest().receiveResponse();

                                                tester.contactBar.title.expectToHaveTextContent('Контакт');
                                                tester.contactBar.title.deleteButton.expectNotToExist();

                                                tester.contactBar.
                                                    section('Каналы связи').
                                                    option('79283810988').
                                                    expectNotToBeSelected();

                                                tester.contactBar.
                                                    section('Каналы связи').
                                                    option('79283810928 (bot)').
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
                                                    '79283810928 (bot)'
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
                                                    tester.visitorCardRequest().receiveResponse();
                                                    tester.usersRequest().forContacts().receiveResponse();
                                                    tester.contactGroupsRequest().receiveResponse();
                                                    tester.contactGroupsRequest().receiveResponse();
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
                                                    searchResultsRequest.
                                                        newVisitor().
                                                        extIdSpecified().
                                                        receiveResponse();
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

                                                    tester.chatListRequest().
                                                        forCurrentEmployee().
                                                        secondPage().
                                                        receiveResponse();

                                                    tester.chatListRequest().
                                                        forCurrentEmployee().
                                                        active().
                                                        secondPage().
                                                        receiveResponse();

                                                    tester.chatListRequest().
                                                        forCurrentEmployee().
                                                        closed().
                                                        secondPage().
                                                        receiveResponse();

                                                    tester.chatListRequest().
                                                        forCurrentEmployee().
                                                        isOtherEmployeesAppeals().
                                                        active().
                                                        receiveResponse();

                                                    tester.chatStartingRequest().noPhone().receiveResponse();
                                                    tester.chatListRequest().thirdChat().receiveResponse();
                                                    tester.visitorCardRequest().receiveResponse();
                                                    tester.usersRequest().forContacts().receiveResponse();
                                                    tester.contactGroupsRequest().receiveResponse();
                                                    tester.contactGroupsRequest().receiveResponse();
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
                                                    tester.leftMenu.button('1 Заявки').click();
                                                    tester.chatListItem('Томова Денка Райчовна').click();

                                                    tester.offlineMessageAcceptingRequest().
                                                        anotherMessage().
                                                        receiveResponse();

                                                    tester.visitorCardRequest().receiveResponse();
                                                    tester.usersRequest().forContacts().receiveResponse();
                                                    tester.contactGroupsRequest().receiveResponse();
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

                                                        describe(
                                                            'Измению теги. Отправлен запрос изменения тегов.',
                                                        function() {
                                                            let offlineMessageMarkRequest;

                                                            beforeEach(function() {
                                                                tester.select.option('Продажа').click();
                                                                tester.contactBar.click();

                                                                offlineMessageMarkRequest =
                                                                    tester.offlineMessageMarkRequest().
                                                                    expectToBeSent();
                                                            });

                                                            it('Получен ответ на запрос. Спиннер скрыт.', function() {
                                                                offlineMessageMarkRequest.receiveResponse();

                                                                tester.offlineMessageListRequest().
                                                                    singleMessage().
                                                                    receiveResponse();

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
                                                    it(
                                                        'Помещаю курсор над полем тегов. Отображены выбранные теги.',
                                                    function() {
                                                        tester.collapsablePanel('Заметки').
                                                            content.
                                                            row('Тэги').
                                                            tagField.
                                                            display.
                                                            putMouseOver();

                                                        tester.tooltip.
                                                            expectToHaveTextContent('Продажа, Нереализованная сделка');
                                                    });
                                                });
                                                it('Отображена заявка.', function() {
                                                    tester.chatHistory.message.atTime('11:17').expectToHaveTextContent(
                                                        'Заявка ' +

                                                        'Имя клиента: Помакова Бисерка Драгановна ' +
                                                        'Телефон: 74951523643 ' +
                                                        'Email: tomova@gmail.com ' +

                                                        '11:17'
                                                    );
                                                });
                                            });
                                            it('Оторажено количество непросмотренных заявок.', function() {
                                                tester.notificationSection.expectToHaveTextContent(
                                                    'ТД ' +
                                                    'Томова Денка Райчовна ' +
                                                    'Заявка с сайта'
                                                );
                                            });
                                        });
                                        it(
                                            'Имя посетителя неуказано. Оторажено количество непросмотренных заявок.',
                                        function() {
                                            newOfflineMessage.noName().receive();
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
                                    describe(
                                        'Открываю список статусов. Выбираю другой статус. Отправлен запрос смены ' +
                                        'статуса.',
                                    function() {
                                        beforeEach(function() {
                                            tester.userName.click();

                                            tester.statusesList.
                                                item('Нет на месте').
                                                click();

                                            tester.employeeUpdatingRequest().receiveResponse();

                                            tester.entityChangeEvent().receive();
                                            tester.entityChangeEvent().slavesNotification().expectToBeSent();

                                            tester.chatTransferGroupsRequest().receiveResponse();
                                        });
                                        
                                        it(
                                            'Нажимаю на элемент списка чатов. Кнопка принятия чата заблокирована.',
                                        function() {
                                            tester.input.fill('Сообщение #75');

                                            tester.input.pressEnter();
                                            tester.searchResultsRequest().receiveResponse();

                                            tester.chatListItem('Сообщение #75').click();

                                            tester.chatListRequest().
                                                thirdChat().
                                                noVisitorName().
                                                extIdSpecified().
                                                receiveResponse();

                                            const visitorCardRequest = tester.visitorCardRequest().expectToBeSent(),
                                                messageListRequest = tester.messageListRequest().expectToBeSent();

                                            tester.usersRequest().forContacts().receiveResponse();
                                            tester.contactGroupsRequest().receiveResponse();

                                            visitorCardRequest.receiveResponse();
                                            tester.contactGroupsRequest().receiveResponse();
                                            tester.usersRequest().forContacts().receiveResponse();

                                            messageListRequest.receiveResponse();

                                            tester.button('Принять обращение в работу').click();
                                        });
                                        it('Другой статус выбран.', function() {
                                            tester.userName.expectToHaveTextContent(
                                                'Гонева Стевка ' +
                                                'Перерыв'
                                            );
                                        });
                                    });
                                    describe(
                                        'Перехожу на вкладку "В работе". Нажимаю на кнопку закрепления чата.',
                                    function() {
                                        let chatPinningRequest;

                                        beforeEach(function() {
                                            tester.button('В работе 75').click();

                                            tester.chatList.
                                                first.
                                                item('Сообщение #7').
                                                putMouseOver();

                                            tester.chatList.
                                                first.
                                                item('Сообщение #7').
                                                pin.
                                                click();

                                            chatPinningRequest = tester.chatPinningRequest().
                                                expectToBeSent();
                                        });

                                        describe('Не удалось закрепить чат.', function() {
                                            beforeEach(function() {
                                                chatPinningRequest.
                                                    limitExceeded().
                                                    receiveResponse();
                                            });

                                            it(
                                                'Нажимаю на кнопку закрытия сообщения об ошибке. Сообщение закрыто.',
                                            function() {
                                                tester.modalWindow.closeButton.click();
                                                tester.modalWindow.expectNotToExist();
                                            });
                                            it('Нажимаю на кнопку "Закрыть". Сообщение закрыто.', function() {
                                                tester.modalWindow.button('Закрыть').click();
                                                tester.modalWindow.expectNotToExist();
                                            });
                                            it('Отображено сообщение об ошибке.', function() {
                                                tester.modalWindow.expectTextContentToHaveSubstring(
                                                    'Достигнут лимит ' +
                                                    'Максимальное количество закрепленных чатов - 5'
                                                );
                                            });
                                        });
                                        it('Чат закреплен. Спиннер скрыт.', function() {
                                            chatPinningRequest.receiveResponse();
                                            tester.chatList.first.spin.expectNotToExist();

                                            tester.chatList.
                                                first.
                                                item('Сообщение #7').
                                                pin.
                                                expectToBeVisible();

                                            tester.chatList.
                                                first.
                                                item('Привет').
                                                pin.
                                                expectNotToExist();

                                            tester.body.expectTextContentToHaveSubstring(
                                                'Помакова Бисерка Драгановна 17 янв 2022 ' +
                                                'Сообщение #7 ' +

                                                'Помакова Бисерка Драгановна 21 янв 2022 ' +
                                                'Привет 3'
                                            );

                                            tester.body.expectTextContentToHaveSubstring(
                                                'Помакова Бисерка Драгановна 18 янв 2022 ' +
                                                'Сообщение #6 ' +

                                                'Помакова Бисерка Драгановна 17 янв 2022 ' +
                                                'Сообщение #8'
                                            );
                                        });
                                        it('Случилась фатальная ошибка. Отображено сообщение об ошибке.', function() {
                                            chatPinningRequest.
                                                failed().
                                                receiveResponse();

                                            tester.modalWindow.expectTextContentToHaveSubstring(
                                                'Ошибка ' +
                                                'Максимальное количество закрепленных чатов - 5'
                                            );
                                        });
                                        it('Случилась фатальная ошибка. Отображено сообщение об ошибке.', function() {
                                            chatPinningRequest.
                                                fatal().
                                                receiveResponse();

                                            tester.modalWindow.expectTextContentToHaveSubstring(
                                                'Ошибка ' +
                                                '403: Максимальное количество закрепленных чатов - 5'
                                            );
                                        });
                                        it('Отображен спиннер.', function() {
                                            tester.chatList.first.spin.expectToBeVisible();
                                        });
                                    });
                                    describe('Открываю настройки чатов.', function() {
                                        beforeEach(function() {
                                            tester.button('Настройки').click();
                                            tester.popover.button('Чаты').click();

                                            tester.offlineMessageDisplayTypesRequest().receiveResponse();
                                        });

                                        describe('Выбираю другие типы заявок.', function() {
                                            beforeEach(function() {
                                                tester.chips('Property Finder').click();
                                                tester.chips('VK Ads').click();
                                            });

                                            describe('Нажимаю на кнопку "Сохранить".', function() {
                                                let offlineMessageDisplayTypesSavingRequest;

                                                beforeEach(function() {
                                                    tester.button('Сохранить').click();

                                                    offlineMessageDisplayTypesSavingRequest =
                                                        tester.
                                                            offlineMessageDisplayTypesSavingRequest().
                                                            expectToBeSent();
                                                });

                                                describe('Выбранные типы заявок сохранены.', function() {
                                                    beforeEach(function() {
                                                        offlineMessageDisplayTypesSavingRequest.receiveResponse();
                                                        tester.offlineMessageCountersRequest().receiveResponse();

                                                        tester.offlineMessageListRequest().
                                                            anotherInquiry().
                                                            notProcessed().
                                                            receiveResponse();

                                                        tester.offlineMessageListRequest().
                                                            processing().
                                                            receiveResponse();

                                                        tester.offlineMessageListRequest().
                                                            processed().
                                                            receiveResponse();
                                                    });

                                                    it('Открываю рзадел заявок.', function() {
                                                        tester.leftMenu.button('Заявки').click();

                                                        tester.chatListItem('Добрый день').expectToBeVisible();
                                                        tester.chatListItem('прива').expectNotToExist();
                                                    });
                                                    it(
                                                        'Выбираю другие типы заявок. Кнопка сохранения доступнна.',
                                                    function() {
                                                        tester.chips('Property Finder').click();
                                                        tester.chips('VK Ads').click();

                                                        tester.button('Сохранить').expectToBeEnabled();
                                                    });
                                                    it('Спиннер скрыт.', function() {
                                                        tester.button('Сохранить').expectToBeDisabled();
                                                        tester.spin.expectNotToExist();

                                                        tester.body.
                                                            expectTextContentToHaveSubstring('Настройки сохранены');
                                                    });
                                                });
                                                it('Спиннер видим.', function() {
                                                    tester.spin.expectToBeVisible();
                                                });
                                            });
                                            it(
                                                'Возвращаю выбранные ранее типы заявок. Кнопка сохранения ' +
                                                'заблокирована.',
                                            function() {
                                                tester.chips('Property Finder').click();
                                                tester.chips('VK Ads').click();

                                                tester.button('Сохранить').expectToBeDisabled();
                                            });
                                            it('Выбраны другие типы заявок.', function() {
                                                tester.chips('Facebook Ads').expectToBeSelected();
                                                tester.chips('Property Finder').expectNotToBeSelected();
                                                tester.chips('VK Ads').expectToBeSelected();
                                                tester.chips('VK Реклама').expectNotToBeSelected();
                                            });
                                        });
                                        describe('Нажимаю на чекбокс "Выбрать все".', function() {
                                            beforeEach(function() {
                                                tester.checkbox.click();
                                            });

                                            describe('Снимаю отметку с одного из типов заявок.', function() {
                                                beforeEach(function() {
                                                    tester.chips('Facebook Ads').click();
                                                });

                                                it(
                                                    'Возвращаю отметку на тип заявки, с которого была снята отметка. ' +
                                                    'Чекбокс "Выбрать все" отмечен.',
                                                function() {
                                                    tester.chips('Facebook Ads').click();
                                                    tester.checkbox.expectToBeChecked();
                                                });
                                                it('Чекбокс "Выбрать все" неотмечен.', function() {
                                                    tester.checkbox.expectNotToBeChecked();
                                                });
                                            });
                                            it(
                                                'Еще раз нажимаю на чекбокс "Выбрать все". Ни один тип заявок не ' +
                                                'выбраны.',
                                            function() {
                                                tester.checkbox.click();

                                                tester.chips('Facebook Ads').expectNotToBeSelected();
                                                tester.chips('Property Finder').expectNotToBeSelected();
                                                tester.chips('VK Ads').expectNotToBeSelected();
                                                tester.chips('VK Реклама').expectNotToBeSelected();

                                                tester.checkbox.expectNotToBeChecked();
                                            });
                                            it(
                                                'Нажимаю на кнопку "Сохранить". Сохранены выбранные типы заявок.',
                                            function() {
                                                tester.button('Сохранить').click();

                                                offlineMessageDisplayTypesSavingRequest =
                                                    tester.
                                                        offlineMessageDisplayTypesSavingRequest().
                                                        allSelected().
                                                        receiveResponse();

                                                tester.offlineMessageCountersRequest().receiveResponse();

                                                tester.offlineMessageListRequest().notProcessed().receiveResponse();
                                                tester.offlineMessageListRequest().processing().receiveResponse();
                                                tester.offlineMessageListRequest().processed().receiveResponse();
                                            });
                                            it('Все типы заявок выбраны.', function() {
                                                tester.checkbox.expectToBeChecked();

                                                tester.chips('Facebook Ads').expectToBeSelected();
                                                tester.chips('Property Finder').expectToBeSelected();
                                                tester.chips('VK Ads').expectToBeSelected();
                                                tester.chips('VK Реклама').expectToBeSelected();
                                            });
                                        });
                                        it('Раскрываю список типов заявок. Отображены все типы заявок.', function() {
                                            tester.chips('...').click();

                                            tester.body.expectTextContentToHaveSubstring(
                                                'VK Ads ' +
                                                'Inquiry 13'
                                            );
                                        });
                                        it('Отображены некоторые типы заявок.', function() {
                                            tester.checkbox.expectNotToBeChecked();

                                            tester.chips('Facebook Ads').expectToBeSelected();
                                            tester.chips('Property Finder').expectToBeSelected();
                                            tester.chips('VK Ads').expectNotToBeSelected();
                                            tester.chips('VK Реклама').expectNotToBeSelected();

                                            tester.button('Сохранить').expectToBeDisabled();

                                            tester.body.expectTextContentToHaveSubstring(
                                                'VK Ads ' +
                                                '...'
                                            );
                                        });
                                    });
                                    describe('Открываю раздел заявок.', function() {
                                        beforeEach(function() {
                                            tester.leftMenu.button('Заявки').click();
                                        });

                                        it('Настройки заявок изменились. Список заявок обновлен.', function() {
                                            tester.offlineMessagesSettingsChangedMessage().receive();
                                            tester.offlineMessageCountersRequest().receiveResponse();

                                            tester.offlineMessageListRequest().
                                                anotherInquiry().
                                                notProcessed().
                                                receiveResponse();

                                            tester.offlineMessageListRequest().
                                                processing().
                                                receiveResponse();

                                            tester.offlineMessageListRequest().
                                                processed().
                                                receiveResponse();

                                            tester.chatListItem('Добрый день').expectToBeVisible();
                                            tester.chatListItem('прива').expectNotToExist();
                                        });
                                        it('Выбираю заявку. Отображена заявка.', function() {
                                            tester.chatListItem('Заявка с сайта').click();

                                            tester.offlineMessageAcceptingRequest().receiveResponse();
                                            tester.visitorCardRequest().receiveResponse();
                                            tester.usersRequest().forContacts().receiveResponse();
                                            tester.contactGroupsRequest().receiveResponse();

                                            tester.chatHistory.message.atTime('12:10').expectToHaveTextContent(
                                                'Заявка ' +

                                                'Имя клиента: Помакова Бисерка Драгановна ' +
                                                'Телефон: 79161212122 ' +
                                                'Email: msjdasj@mail.com ' +
                                                'Комментарий клиента: Я хочу о чем-то заявить. ' +

                                                '12:10'
                                            );
                                        });
                                    });
                                    it(
                                        'Открываю раздел контактов. Соединение с вебсокетом чатов не разрывается.',
                                    function() {
                                        tester.leftMenu.button('Контакты').click();

                                        tester.contactsRequest().differentNames().receiveResponse();
                                        tester.contactGroupsRequest().receiveResponse();

                                        tester.contactList.item('Бележкова Грета Ервиновна').expectToBeVisible();
                                    });
                                    it('Прокручиваю список чатов до конца. Запрошена вторая страница.', function() {
                                        tester.chatList.spinWrapper.scrollIntoView();
                                        tester.chatListRequest().forCurrentEmployee().secondPage().expectToBeSent();
                                    });
                                    it(
                                        'Нажимаю на кнопку "Поддержка". Открыто окно формы для ввода сообщения в ' +
                                        'техническую поддержку.',
                                    function() {
                                        tester.button('Поддержка').click();
                                        spendTime(10);

                                        tester.input.
                                            withPlaceholder('Фамилия Имя Отчество').
                                            fill('Валчева Албена Станимир');

                                        tester.input.withPlaceholder('7').fill('79161234567');
                                        tester.input.withPlaceholder('example@example.com').fill('valcheva@gmail.com');

                                        tester.textarea.
                                            withPlaceholder('Опишите проблему').
                                            fill('Что-то нехорошее произошло');

                                        tester.button('Отправить').click();
                                        tester.ticketCreatingRequest().receiveResponse();
                                    });
                                    it('Ввожу URL страницы настроек. Открыта страница настроек.', function() {
                                        tester.history.push('/chats/settings');
                                        tester.offlineMessageDisplayTypesRequest().receiveResponse();
                                    });
                                    it('Отображен список чатов.', function() {
                                        tester.userName.expectToHaveTextContent(
                                            'Ганева Стефка ' +
                                            'Доступен'
                                        );

                                        tester.body.expectTextContentToHaveSubstring(
                                            'Помакова Бисерка Драгановна 21 янв 2022 ' +
                                            'Привет 3'
                                        );

                                        tester.chatList.
                                            first.
                                            item('Сообщение #7').
                                            putMouseOver();

                                        tester.chatList.
                                            first.
                                            item('Сообщение #7').
                                            pin.
                                            expectNotToExist();

                                        tester.spin.expectNotToExist();
                                    });
                                });
                                describe('Закрепленные чаты есть.', function() {
                                    beforeEach(function() {
                                        secondChatListRequest.
                                            pinnedChatExist().
                                            receiveResponse();
                                    });

                                    describe('Перехожу на вкладку "В работе".', function() {
                                        beforeEach(function() {
                                            tester.button('В работе 75').click();
                                        });

                                        it(
                                            'Нажимаю на кнопку закрепления чата. Чат исключен из закрепленных.',
                                        function() {
                                            tester.chatList.first.spinWrapper.scrollIntoView();

                                            tester.chatListRequest().
                                                forCurrentEmployee().
                                                active().
                                                secondPage().
                                                receiveResponse();

                                            tester.chatList.
                                                first.
                                                item('Сообщение #7').
                                                pin.
                                                click();

                                            tester.chatUnpinningRequest().receiveResponse();

                                            tester.chatListRequest().
                                                forCurrentEmployee().
                                                active().
                                                receiveResponse();

                                            tester.body.expectTextContentNotToHaveSubstring(
                                                'Помакова Бисерка Драгановна 17 янв 2022 ' +
                                                'Сообщение #7 ' +

                                                'Помакова Бисерка Драгановна 21 янв 2022 ' +
                                                'Привет 3'
                                            );

                                            tester.body.expectTextContentToHaveSubstring(
                                                'Помакова Бисерка Драгановна 18 янв 2022 ' +
                                                'Сообщение #6 ' +

                                                'Помакова Бисерка Драгановна 17 янв 2022 ' +
                                                'Сообщение #7'
                                            );

                                            tester.chatList.
                                                first.
                                                item('Сообщение #7').
                                                pin.
                                                expectNotToExist();

                                            tester.chatList.
                                                first.
                                                item('Сообщение #31').
                                                expectNotToExist();
                                        });
                                        it('Рядом с закремленными чатами отображена кнопка.', function() {
                                            tester.chatList.
                                                first.
                                                item('Привет').
                                                pin.
                                                expectNotToExist();
                                            
                                            tester.body.expectTextContentToHaveSubstring(
                                                'Помакова Бисерка Драгановна 17 янв 2022 ' +
                                                'Сообщение #7 ' +

                                                'Помакова Бисерка Драгановна 21 янв 2022 ' +
                                                'Привет 3'
                                            );

                                            tester.body.expectTextContentToHaveSubstring(
                                                'Помакова Бисерка Драгановна 18 янв 2022 ' +
                                                'Сообщение #6 ' +

                                                'Помакова Бисерка Драгановна 17 янв 2022 ' +
                                                'Сообщение #8'
                                            );
                                        });
                                    });
                                    it(
                                        'Принимаю новый чат в работу. Перехожу на вкладку "В работе". Закрепленные ' +
                                        'чаты находятся наверху.',
                                    function() {
                                        tester.input.fill('Сообщение #75');

                                        tester.input.pressEnter();
                                        tester.searchResultsRequest().receiveResponse();

                                        tester.chatListItem('Сообщение #75').click();

                                        tester.chatListRequest().thirdChat().receiveResponse();
                                        tester.visitorCardRequest().receiveResponse();
                                        tester.messageListRequest().receiveResponse();

                                        tester.usersRequest().forContacts().receiveResponse();
                                        tester.contactGroupsRequest().receiveResponse();
                                        tester.contactGroupsRequest().receiveResponse();
                                        tester.usersRequest().forContacts().receiveResponse();

                                        tester.button('Принять обращение в работу').click();
                                        tester.acceptChatRequest().receiveResponse();

                                        tester.button('В работе 75').click();

                                        tester.body.expectTextContentToHaveSubstring(
                                            'Помакова Бисерка Драгановна ' +
                                            '17 янв 2022 ' +
                                            'Сообщение #7 ' +

                                            'Помакова Бисерка Драгановна ' +
                                            '20 янв 2020 ' +
                                            'Сообщение #75 ' +
                                            '1 ' +

                                            'Помакова Бисерка Драгановна ' +
                                            '21 янв 2022 ' +
                                            'Привет ' +
                                            '3'
                                        );
                                    });
                                });
                            });
                            it('Не удалось получить данные чатов. Перехожу на вкладку "В работе".', function() {
                                chatListRequest.failed().receiveResponse();
                                secondChatListRequest.failed().receiveResponse();
                                thirdChatListRequest.failed().receiveResponse();

                                tester.button('В работе 75').click();
                                tester.collapsablePanel('Активные').content.spinWrapper.scrollIntoView();

                                tester.chatListRequest().
                                    active().
                                    forCurrentEmployee().
                                    expectToBeSent();

                                tester.chatListRequest().
                                    closed().
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

                            describe('Получено новое сообщение.', function() {
                                beforeEach(function() {
                                    tester.newMessage().receive();
                                    tester.chatListRequest().chat().receiveResponse();

                                    tester.countersRequest().
                                        newMessage().
                                        fewUnreadMessages().
                                        receiveResponse();
                                });

                                it('Нажимаю на кнпоку "Поддержка". ', function() {
                                    tester.button('Поддержка').click();
                                    spendTime(10);

                                    tester.input.withPlaceholder('Фамилия Имя Отчество').
                                        fill('Валчева Албена Станимир');

                                    tester.input.withPlaceholder('7').fill('79161234567');

                                    tester.input.withPlaceholder('example@example.com').
                                        fill('valcheva@gmail.com');

                                    tester.textarea.withPlaceholder('Опишите проблему').
                                        fill('Что-то нехорошее произошло');

                                    tester.button('Отправить').click();

                                    tester.ticketCreatingRequest().
                                        anotherLogAttached().
                                        receiveResponse();

                                    blobsTester.some(blob => blob.expectToHaveSubstring(
                                        '{"method":"new_message","params":{"chat_id":2718935,'//}}
                                    ));
                                });
                                it('Отображено количество непрочитанных сообщений.', function() {
                                    tester.leftMenu.item('9 Чаты').expectToBeVisible();
                                });
                            });
                            it(
                                'Открываю чат с непрочитанным сообщением. Отображено количество непрочитанных ' +
                                'cообщений.',
                            function() {
                                tester.chatListItem('Сообщение #5').click();

                                tester.visitorCardRequest().receiveResponse();
                                tester.messageListRequest().receiveResponse();
                                tester.usersRequest().forContacts().receiveResponse();
                                tester.contactGroupsRequest().receiveResponse();
                                tester.countersRequest().readMessage().fewUnreadMessages().receiveResponse();

                                tester.leftMenu.item('7 Чаты').expectToBeVisible();
                            });
                            it('Отображено количество непрочитанных сообщений.', function() {
                                tester.leftMenu.item('8 Чаты').expectToBeVisible();
                            });
                        });
                        describe('Есть только активные чаты. Открываю вкладку "В работе".', function() {
                            beforeEach(function() {
                                countersRequest.
                                    noNewChats().
                                    noClosedChats().
                                    receiveResponse();

                                chatListRequest.
                                    noData().
                                    receiveResponse();

                                secondChatListRequest.
                                    twoPinnedChatExist().
                                    receiveResponse();

                                thirdChatListRequest.
                                    noData().
                                    receiveResponse();

                                tester.button('В работе 75').click();
                            });

                            describe('Приходит новое сообщение в чат,', function() {
                                let newMessage;

                                beforeEach(function() {
                                    newMessage = tester.newMessage();
                                });

                                describe('данные которого не были получены ранее.', function() {
                                    let chatListRequest;

                                    beforeEach(function() {
                                        newMessage.tenthChat().receive();
                                        notificationTester.grantPermission();

                                        chatListRequest = tester.chatListRequest().
                                            active().
                                            thirdChat().
                                            expectToBeSent();

                                        tester.countersRequest().
                                            noNewChats().
                                            noClosedChats().
                                            receiveResponse();
                                    });

                                    it('Каким-то образом чат оказался закрепленным. Чат размещен первым.', function() {
                                        chatListRequest.
                                            pinned().
                                            receiveResponse();

                                        tester.body.expectTextContentToHaveSubstring(
                                            'Помакова Бисерка Драгановна ' +
                                            '20 янв 2020 ' +
                                            'Сообщение #75 ' +

                                            'Помакова Бисерка Драгановна ' +
                                            '18 янв 2022 ' +
                                            'Сообщение #6 ' +

                                            'Помакова Бисерка Драгановна ' +
                                            '17 янв 2022 ' +
                                            'Сообщение #7 ' +

                                            'Помакова Бисерка Драгановна ' +
                                            '21 янв 2022 ' +
                                            'Привет 3'
                                        );
                                    });
                                    it('Чат размещён после закрепленных.', function() {
                                        chatListRequest.receiveResponse();

                                        tester.body.expectTextContentToHaveSubstring(
                                            'Помакова Бисерка Драгановна ' +
                                            '18 янв 2022 ' +
                                            'Сообщение #6 ' +

                                            'Помакова Бисерка Драгановна ' +
                                            '17 янв 2022 ' +
                                            'Сообщение #7 ' +

                                            'Помакова Бисерка Драгановна ' +
                                            '20 янв 2020 ' +
                                            'Сообщение #75 ' +

                                            'Помакова Бисерка Драгановна ' +
                                            '21 янв 2022 ' +
                                            'Привет 3'
                                        );
                                    });
                                });
                                it('данные которого были получены ранее. Чат размещён после закрепленных.', function() {
                                    newMessage.ninthChat().receive();
                                    notificationTester.grantPermission();

                                    tester.chatListRequest().
                                        active().
                                        anotherChat().
                                        receiveResponse();

                                    tester.countersRequest().
                                        noNewChats().
                                        noClosedChats().
                                        receiveResponse();

                                    tester.body.expectTextContentToHaveSubstring(
                                        'Помакова Бисерка Драгановна ' +
                                        '18 янв 2022 ' +
                                        'Сообщение #6 ' +

                                        'Помакова Бисерка Драгановна ' +
                                        '17 янв 2022 ' +
                                        'Сообщение #7 ' +

                                        'Помакова Бисерка Драгановна ' +
                                        '21 февр 2021 ' +
                                        'Я люблю тебя ' +

                                        'Помакова Бисерка Драгановна ' +
                                        '21 янв 2022 ' +
                                        'Привет 3'
                                    );
                                });
                                it(
                                    'Получено сообщение в закрепленный чат. Чат переместился в начало списка.',
                                function() {
                                    newMessage.seventhChat().receive();
                                    notificationTester.grantPermission();

                                    tester.chatListRequest().
                                        active().
                                        ninethChat().
                                        receiveResponse();

                                    tester.countersRequest().
                                        noNewChats().
                                        noClosedChats().
                                        receiveResponse();

                                    tester.body.expectTextContentToHaveSubstring(
                                        'Помакова Бисерка Драгановна ' +
                                        '18 янв 2022 ' +
                                        'Сообщение #6 ' +

                                        'Помакова Бисерка Драгановна ' +
                                        '21 февр 2021 ' +
                                        'Я люблю тебя 1 ' +

                                        'Помакова Бисерка Драгановна ' +
                                        '21 янв 2022 ' +
                                        'Привет 3'
                                    );
                                });
                            });
                            it('Открываю незакрепленный чат. Закрепляю чат. Чат остается открытым.', function() {
                                tester.chatList.
                                    first.
                                    item('Привет').
                                    click();

                                tester.visitorCardRequest().receiveResponse();
                                tester.messageListRequest().receiveResponse();
                                tester.usersRequest().forContacts().receiveResponse();
                                tester.contactGroupsRequest().receiveResponse();

                                tester.changeMessageStatusRequest().
                                    read().
                                    anotherMessage().
                                    receiveResponse();

                                tester.countersRequest().receiveResponse();

                                tester.chatList.
                                    first.
                                    item('Привет').
                                    putMouseOver();

                                tester.chatList.
                                    first.
                                    item('Привет').
                                    pin.
                                    click();

                                tester.chatPinningRequest().
                                    anotherChat().
                                    receiveResponse();

                                tester.body.expectTextContentToHaveSubstring(
                                    'Помакова Бисерка Драгановна ' +
                                    '21 янв 2022 ' +
                                    'Привет ' +

                                    'Помакова Бисерка Драгановна ' +
                                    '18 янв 2022 ' +
                                    'Сообщение #6 ' +

                                    'Помакова Бисерка Драгановна ' +
                                    '17 янв 2022 ' +
                                    'Сообщение #7 ' +

                                    'Помакова Бисерка Драгановна ' +
                                    '20 янв 2022 ' +
                                    'Здравствуй'
                                );

                                tester.chatHistory.expectToHaveTextContent(
                                    '10 февраля 2020 ' +

                                    'Привет 12:13 Ответить ' +
                                    'Здравствуйте 12:12 Ответить'
                                );
                            });
                            it('Открываю закрепленный чат. Открепляю чат. Чат остается открытым.', function() {
                                tester.chatList.
                                    first.
                                    item('Сообщение #7').
                                    click();

                                tester.visitorCardRequest().receiveResponse();
                                tester.messageListRequest().receiveResponse();
                                tester.usersRequest().forContacts().receiveResponse();
                                tester.contactGroupsRequest().receiveResponse();

                                tester.changeMessageStatusRequest().
                                    fifthChat().
                                    anotherMessage().
                                    read().
                                    receiveResponse();

                                tester.countersRequest().receiveResponse();

                                tester.chatList.
                                    first.
                                    item('Сообщение #7').
                                    pin.
                                    click();

                                tester.chatUnpinningRequest().receiveResponse();

                                tester.chatListRequest().
                                    forCurrentEmployee().
                                    count(7).
                                    active().
                                    receiveResponse();

                                tester.chatList.
                                    item('Сообщение #6').
                                    expectToBeVisible();

                                tester.chatList.
                                    item('Сообщение #7').
                                    expectToBeVisible();

                                tester.chatList.
                                    item('Сообщение #7').
                                    pin.
                                    expectNotToExist();

                                tester.chatList.
                                    item('Сообщение #8').
                                    expectNotToExist();

                                tester.chatHistory.expectToHaveTextContent(
                                    '10 февраля 2020 ' +

                                    'Привет 12:13 Ответить ' +
                                    'Здравствуйте 12:12 Ответить'
                                );
                            });
                            it(
                                'Открываю чат. Получено новое сообщение в открытый чат. В списке сообщений появилось ' +
                                'новое сообщение.',
                            function() {
                                tester.chatList.
                                    item('Здравствуй').
                                    click();

                                tester.visitorCardRequest().receiveResponse();
                                tester.messageListRequest().receiveResponse();
                                tester.usersRequest().forContacts().receiveResponse();
                                tester.contactGroupsRequest().receiveResponse();

                                tester.changeMessageStatusRequest().
                                    fourthChat().
                                    anotherMessage().
                                    read().
                                    receiveResponse();

                                tester.countersRequest().receiveResponse();

                                tester.newMessage().
                                    ninthChat().
                                    receive();

                                tester.chatListRequest().
                                    active().
                                    anotherChat().
                                    receiveResponse();

                                tester.countersRequest().
                                    noNewChats().
                                    noClosedChats().
                                    receiveResponse();

                                tester.changeMessageStatusRequest().
                                    fourthChat().
                                    read().
                                    receiveResponse();

                                tester.chatHistory.expectToHaveTextContent(
                                    '10 февраля 2020 ' +

                                    'Привет 12:13 Ответить ' +
                                    'Здравствуйте 12:12 Ответить ' +

                                    '21 февраля 2021 ' +

                                    'Я люблю тебя 15:24 Ответить'
                                );
                            });
                            it('Получено сообщение о смене сотрудника канала. Список чатов обновлен.', function() {
                                tester.channelEmployeeChangedMessage().receive();

                                tester.chatListRequest().
                                    forCurrentEmployee().
                                    onlyActiveChats(3).
                                    noData().
                                    receiveResponse();

                                tester.chatListRequest().
                                    forCurrentEmployee().
                                    onlyActiveChats(3).
                                    count(3).
                                    active().
                                    receiveResponse();

                                tester.chatListRequest().
                                    forCurrentEmployee().
                                    onlyActiveChats(3).
                                    noData().
                                    closed().
                                    receiveResponse();

                                tester.chatListRequest().
                                    forCurrentEmployee().
                                    onlyActiveChats(3).
                                    noData().
                                    active().
                                    isOtherEmployeesAppeals().
                                    receiveResponse();

                                tester.chatList.
                                    item('Сообщение #3').
                                    expectToBeVisible();

                                tester.chatList.
                                    item('Сообщение #4').
                                    expectNotToExist();
                            });
                        });
                        it(
                            'Пока нет ни одного чата. Получаю много уведомлений о новых чатах. Открываю полный ' +
                            'список уведомлений. Закрываю уведомление. Список уведомлений видим.',
                        function() {
                            countersRequest.noData().receiveResponse();

                            chatListRequest.noData().receiveResponse();
                            secondChatListRequest.noData().receiveResponse();
                            thirdChatListRequest.noData().receiveResponse();

                            tester.newChatCreatingMessage().receive();
                            tester.newMessage().thirdChat().receive();

                            tester.countersRequest().receiveResponse();

                            notificationTester.grantPermission();
                            tester.chatListRequest().fifthChat().receiveResponse();

                            tester.newChatCreatingMessage().anotherChat().receive();
                            tester.newMessage().fourthChat().receive();

                            tester.countersRequest().receiveResponse();

                            notificationTester.grantPermission();
                            tester.chatListRequest().sixthChat().receiveResponse();

                            tester.newChatCreatingMessage().thirdChat().receive();
                            tester.newMessage().fifthChat().receive();

                            tester.countersRequest().receiveResponse();

                            notificationTester.grantPermission();
                            tester.chatListRequest().seventhChat().receiveResponse();

                            tester.newChatCreatingMessage().fourthChat().receive();
                            tester.newMessage().sixthChat().receive();

                            tester.countersRequest().receiveResponse();

                            notificationTester.grantPermission();
                            tester.chatListRequest().eighthChat().receiveResponse();

                            tester.newChatCreatingMessage().fifthChat().receive();
                            tester.newMessage().seventhChat().receive();

                            tester.countersRequest().receiveResponse();

                            notificationTester.grantPermission();
                            tester.chatListRequest().ninethChat().receiveResponse();

                            tester.newChatCreatingMessage().sixthChat().receive();
                            tester.newMessage().eighthChat().receive();

                            tester.countersRequest().receiveResponse();

                            notificationTester.grantPermission();
                            tester.chatListRequest().tenthChat().receiveResponse();

                            tester.button('Посмотреть все').click();

                            tester.notificationsList.
                                notification.
                                withVisitorName('#16479305 Гость').
                                closeButton.
                                click();

                            tester.notificationsList.
                                notification.
                                withVisitorName('#16479306 Гость').
                                closeButton.
                                click();
                        });
                    });
                    describe('Завершение чатов и заявок недоступно для текущего статуса.', function() {
                        beforeEach(function() {
                            employeeStatusesRequest.
                                unableToCloseChatOfflineMessage().
                                receiveResponse();

                            countersRequest.receiveResponse();
                            chatListRequest.receiveResponse();
                            secondChatListRequest.receiveResponse();
                            thirdChatListRequest.receiveResponse();
                        });

                        it('Открываю заявку. Кнопка завершения заявки заблокирована.', function() {
                            tester.leftMenu.button('Заявки').click();
                            tester.chatListItem('прива').click();

                            tester.offlineMessageAcceptingRequest().receiveResponse();
                            tester.visitorCardRequest().receiveResponse();
                            tester.usersRequest().forContacts().receiveResponse();
                            tester.contactGroupsRequest().receiveResponse();

                            tester.button('Завершить заявку').putMouseOver();
                            tester.button('Завершить заявку').click();

                            tester.body.expectTextContentToHaveSubstring('Невозможно закрыть заявку в текущем статусе');
                        });
                        it(
                            'Открываю чат. Кнопка завершения чата заблокирована. Нажимаю на кнопку принятия чата. ' +
                            'Кнопка завершения чата заблокирована.',
                        function() {
                            tester.input.fill('Сообщение #75');

                            tester.input.pressEnter();
                            tester.searchResultsRequest().receiveResponse();

                            tester.chatListItem('Сообщение #75').click();

                            tester.chatListRequest().
                                thirdChat().
                                noVisitorName().
                                extIdSpecified().
                                receiveResponse();

                            tester.visitorCardRequest().receiveResponse();
                            tester.messageListRequest().receiveResponse();
                            tester.usersRequest().forContacts().receiveResponse();
                            tester.contactGroupsRequest().receiveResponse();
                            tester.contactGroupsRequest().receiveResponse();
                            tester.usersRequest().forContacts().receiveResponse();

                            tester.button('Принять обращение в работу').click();
                            tester.acceptChatRequest().receiveResponse();

                            tester.button('Закончить чат').putMouseOver();
                            tester.button('Закончить чат').click();

                            tester.body.expectTextContentToHaveSubstring('Невозможно закрыть чат в текущем статусе');
                        });
                    });
                    describe(
                        'Прием трансфер чата недоступен для некого статуса. Открываю чат. Открываю список сотрудников.',
                    function() {
                        beforeEach(function() {
                            employeeStatusesRequest.
                                unableToAcceptChatTransfer().
                                receiveResponse();

                            countersRequest.receiveResponse();
                            chatListRequest.receiveResponse();
                            secondChatListRequest.receiveResponse();
                            thirdChatListRequest.receiveResponse();

                            tester.input.fill('Сообщение #75');

                            tester.input.pressEnter();
                            tester.searchResultsRequest().receiveResponse();

                            tester.chatListItem('Сообщение #75').click();

                            tester.chatListRequest().
                                thirdChat().
                                noVisitorName().
                                extIdSpecified().
                                receiveResponse();

                            tester.visitorCardRequest().receiveResponse();
                            tester.messageListRequest().receiveResponse();
                            tester.usersRequest().forContacts().receiveResponse();
                            tester.contactGroupsRequest().receiveResponse();
                            tester.contactGroupsRequest().receiveResponse();
                            tester.usersRequest().forContacts().receiveResponse();

                            tester.button('Принять обращение в работу').click();
                            tester.acceptChatRequest().receiveResponse();

                            tester.chatTransferButton.click();
                            tester.transferPanel.select.click();

                            tester.chatTransferGroupsRequest().receiveResponse();
                        });

                        it('Получено сообщение об изменении статуса сотрудника.', function() {
                            tester.entityChangeEvent().
                                anotherEmployee().
                                receive();

                            tester.entityChangeEvent().
                                anotherEmployee().
                                slavesNotification().
                                expectToBeSent();

                            tester.chatTransferGroupsRequest().receiveResponse();
                            
                            tester.select.
                                option('Костова Марвуда Любенова').
                                click();

                            tester.transferPanel.
                                select.
                                expectTextContentNotToHaveSubstring('Костова Марвуда Любенова');
                        });
                        it('Выбираю доступного сотрудника. Сотрудник выбран.', function() {
                            tester.select.
                                option('Костова Марвуда Любенова').
                                click();

                            tester.transferPanel.
                                select.
                                expectTextContentToHaveSubstring('Костова Марвуда Любенова');
                        });
                        it('Выбираю недоступного сотрудника.', function() {
                            tester.select.
                                option('Чакърова Райна Илковна').
                                click();

                            tester.transferPanel.
                                select.
                                expectTextContentNotToHaveSubstring('Чакърова Райна Илковна');
                        });
                    });
                    describe('Переписка в чате недоступна для текущего статуса.', function() {
                        let searchResultsRequest;

                        beforeEach(function() {
                            employeeStatusesRequest.
                                unableToSendChatMessages().
                                receiveResponse();

                            countersRequest.receiveResponse();
                            chatListRequest.receiveResponse();
                            secondChatListRequest.receiveResponse();
                            thirdChatListRequest.receiveResponse();

                            tester.input.fill('Сообщение #75');

                            tester.input.pressEnter();
                            searchResultsRequest = tester.searchResultsRequest().expectToBeSent();
                        });

                        describe('Открываю чат.', function() {
                            beforeEach(function() {
                                searchResultsRequest.receiveResponse();
                                tester.chatListItem('Сообщение #75').click();

                                tester.chatListRequest().
                                    thirdChat().
                                    noVisitorName().
                                    extIdSpecified().
                                    receiveResponse();

                                tester.visitorCardRequest().receiveResponse();
                                tester.messageListRequest().receiveResponse();
                                tester.usersRequest().forContacts().receiveResponse();
                                tester.contactGroupsRequest().receiveResponse();
                                tester.contactGroupsRequest().receiveResponse();
                                tester.usersRequest().forContacts().receiveResponse();

                                tester.button('Принять обращение в работу').click();
                                tester.acceptChatRequest().receiveResponse();
                            });

                            it('Отображена подсказка рядом с кнопкой добавления файла.', function() {
                                tester.chatPanelFooterToolbar.button.first.closest('div').putMouseOver();
                                spendTime(100);
                                spendTime(0);

                                tester.body.expectTextContentToHaveSubstring(
                                    'Невозможно вести переписку в текущем статусе'
                                );
                            });
                            it('Отображена подсказка рядом с полем.', function() {
                                tester.textarea.
                                    withPlaceholder('Введите сообщение...').
                                    expectToHaveAttribute('disabled');

                                tester.textarea.withPlaceholder('Введите сообщение...').putMouseOver();
                                spendTime(100);
                                spendTime(0);

                                tester.body.expectTextContentToHaveSubstring(
                                    'Невозможно вести переписку в текущем статусе'
                                );
                            });
                            it('Отображена подсказка рядом с кнопкой очистки.', function() {
                                tester.button('Очистить').expectToBeDisabled();

                                tester.button('Очистить').closest('div').putMouseOver();
                                spendTime(100);
                                spendTime(0);

                                tester.body.expectTextContentToHaveSubstring(
                                    'Невозможно вести переписку в текущем статусе'
                                );
                            });
                            it('Отображена подсказка рядом с кнопкой шаблона.', function() {
                                tester.button('Шаблон').expectToBeDisabled();

                                tester.button('Шаблон').closest('div').putMouseOver();
                                spendTime(100);
                                spendTime(0);

                                tester.body.expectTextContentToHaveSubstring(
                                    'Невозможно вести переписку в текущем статусе'
                                );
                            });
                            it('Отображена подсказка рядом с кнопкой добавления файла.', function() {
                                tester.chatPanelFooterToolbar.button.atIndex(3).closest('div').putMouseOver();
                                spendTime(100);
                                spendTime(0);

                                tester.body.expectTextContentToHaveSubstring(
                                    'Невозможно вести переписку в текущем статусе'
                                );
                            });
                            it('Отображена подсказка рядом с кнопкой голосового сообщения.', function() {
                                tester.chatsVoiceRecorderButton.expectToBeDisabled();

                                tester.chatsVoiceRecorderButton.closest('div').putMouseOver();
                                spendTime(100);
                                spendTime(0);

                                tester.body.expectTextContentToHaveSubstring(
                                    'Невозможно вести переписку в текущем статусе'
                                );
                            });
                        });
                        it('Кнопка "Начать чат" заблокирована.', function() {
                            searchResultsRequest.newVisitor().whatsApp().receiveResponse();

                            tester.button('Начать чат').expectToBeDisabled();
                            tester.button('Начать чат').putMouseOver();

                            tester.body.expectTextContentToHaveSubstring(
                                'Невозможно вести переписку в текущем статусе'
                            );
                        });
                    });
                    describe('Прием чата недоступен для текущего статуса.', function() {
                        beforeEach(function() {
                            employeeStatusesRequest.
                                unableToAcceptChat().
                                receiveResponse();
                        });

                        it('Чаты есть. Открываю чат. Кнопка приема чата заблокирована.', function() {
                            countersRequest.receiveResponse();
                            chatListRequest.receiveResponse();
                            secondChatListRequest.receiveResponse();
                            thirdChatListRequest.receiveResponse();

                            tester.input.fill('Сообщение #75');

                            tester.input.pressEnter();
                            tester.searchResultsRequest().receiveResponse();

                            tester.chatListItem('Сообщение #75').click();

                            tester.chatListRequest().
                                thirdChat().
                                noVisitorName().
                                extIdSpecified().
                                receiveResponse();

                            tester.visitorCardRequest().receiveResponse();
                            tester.messageListRequest().receiveResponse();
                            tester.usersRequest().forContacts().receiveResponse();
                            tester.contactGroupsRequest().receiveResponse();
                            tester.contactGroupsRequest().receiveResponse();
                            tester.usersRequest().forContacts().receiveResponse();

                            tester.button('Принять обращение в работу').putMouseOver();
                            tester.button('Принять обращение в работу').click();

                            tester.body.
                                expectTextContentToHaveSubstring('Невозможно взять в работу чат в текущем статусе');
                        });
                        it(
                            'Пока нет ни одного чата. Нажимаю на уведомление о новом сообщение. Чат был открыт.',
                        function() {
                            countersRequest.noData().receiveResponse();
                            chatListRequest.noData().receiveResponse();
                            secondChatListRequest.noData().receiveResponse();
                            thirdChatListRequest.noData().receiveResponse();

                            tester.newChatCreatingMessage().receive();
                            tester.newMessage().thirdChat().receive();

                            tester.countersRequest().receiveResponse();

                            notificationTester.grantPermission();
                            tester.chatListRequest().fifthChat().receiveResponse();

                            tester.notificationSection.message.click();

                            tester.visitorCardRequest().anotherVisitor().expectToBeSent();
                            tester.employeesRequest().expectToBeSent();
                            tester.contactGroupsRequest().receiveResponse();
                        });
                    });
                    it(
                        'Трансфер чата недоступен для текущего статуса. Открываю чат. Кнопка трансфера заблокирована.',
                    function() {
                        employeeStatusesRequest.
                            unableToTransferChat().
                            receiveResponse();

                        countersRequest.receiveResponse();
                        chatListRequest.receiveResponse();
                        secondChatListRequest.receiveResponse();
                        thirdChatListRequest.receiveResponse();

                        tester.input.fill('Сообщение #75');

                        tester.input.pressEnter();
                        tester.searchResultsRequest().receiveResponse();

                        tester.chatListItem('Сообщение #75').click();

                        tester.chatListRequest().
                            thirdChat().
                            noVisitorName().
                            extIdSpecified().
                            receiveResponse();

                        tester.visitorCardRequest().receiveResponse();
                        tester.messageListRequest().receiveResponse();
                        tester.usersRequest().forContacts().receiveResponse();
                        tester.contactGroupsRequest().receiveResponse();
                        tester.contactGroupsRequest().receiveResponse();
                        tester.usersRequest().forContacts().receiveResponse();

                        tester.chatTransferButton.putMouseOver();
                        tester.chatTransferButton.click();

                        tester.transferPanel.expectNotToExist();

                        tester.body.
                            expectTextContentToHaveSubstring('Невозможно сделать трансфер чата в текущем статусе');
                    });
                });
                describe('Подтверждение принятия чата в работу выключено.', function() {
                    beforeEach(function() {
                        chatSettingsRequest.
                            disabledChatAcceptanceConfirmation().
                            receiveResponse();
                    });

                    descibe('Пока нет ни одного чата.', function() {
                        beforeEach(function() {
                            countersRequest.noData().receiveResponse();
                            chatListRequest.noData().receiveResponse();
                            secondChatListRequest.noData().receiveResponse();
                            thirdChatListRequest.noData().receiveResponse();
                        });

                        it(
                            'Принятие чата запрещено для текущего статуса. Нажимаю на уведомление о новом сообщение. ' +
                            'Чат не был открыт.',
                        function() {
                            employeeStatusesRequest.
                                unableToAcceptChat().
                                receiveResponse();

                            tester.newChatCreatingMessage().receive();
                            tester.newMessage().thirdChat().receive();

                            tester.countersRequest().receiveResponse();

                            notificationTester.grantPermission();
                            tester.chatListRequest().fifthChat().receiveResponse();

                            tester.notificationSection.message.click();
                            tester.notificationSection.message.putMouseOver();

                            tester.body.
                                expectTextContentToHaveSubstring('Невозможно взять в работу чат в текущем статусе');
                        });
                        it(
                            'Принятие чата для текущего статуса. Нажимаю на уведомление о новом сообщение. Чат был ' +
                            'открыт.',
                        function() {
                            employeeStatusesRequest.receiveResponse();

                            tester.newChatCreatingMessage().receive();
                            tester.newMessage().thirdChat().receive();

                            tester.countersRequest().receiveResponse();

                            notificationTester.grantPermission();
                            tester.chatListRequest().fifthChat().receiveResponse();

                            tester.notificationSection.message.click();

                            tester.acceptChatRequest().
                                thirdChat().
                                anotherVisitor().
                                expectToBeSent();

                            tester.visitorCardRequest().anotherVisitor().expectToBeSent();
                            tester.employeesRequest().expectToBeSent();
                        });
                    });
                    describe('Чаты есть.', function() {
                        beforeEach(function() {
                            countersRequest.receiveResponse();
                            chatListRequest.receiveResponse();
                            secondChatListRequest.receiveResponse();
                            thirdChatListRequest.receiveResponse();
                        });

                        it(
                            'Принятие чата доступно для текущего статуса. Нажимаю на элемент списка чатов. Отправлен ' +
                            'запрос принятия чата.',
                        function() {
                            employeeStatusesRequest.receiveResponse();

                            tester.input.fill('Сообщение #75');

                            tester.input.pressEnter();
                            tester.searchResultsRequest().receiveResponse();

                            tester.chatListItem('Сообщение #75').click();

                            tester.chatListRequest().
                                thirdChat().
                                noVisitorName().
                                extIdSpecified().
                                receiveResponse();

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

                            tester.statusChangedMessage().receive();

                            tester.countersRequest().
                                readMessage().
                                fewUnreadMessages().
                                receiveResponse();
                        });
                        it(
                            'Принятие чата запрещено для текущего статуса. Помещаю курсор мыши над элементом списка ' +
                            'чатов. Отображено сообщение о невозможности принять чат.',
                        function() {
                            employeeStatusesRequest.
                                unableToAcceptChat().
                                receiveResponse();

                            tester.chatListItem('Привет').click();
                            tester.chatListItem('Привет').putMouseOver();

                            tester.body.expectTextContentToHaveSubstring(
                                'Невозможно взять в работу чат в текущем статусе'
                            );
                        });
                    });
                    describe(
                        'Есть только активные чаты. Открываю вкладку "В работе". Нажимаю на чат.',
                    function() {
                        let changeMessageStatusRequest;

                        beforeEach(function() {
                            countersRequest.
                                noNewChatsWithUnreadMessages().
                                noClosedChats().
                                receiveResponse();

                            chatListRequest.noData().receiveResponse();
                            secondChatListRequest.receiveResponse();
                            thirdChatListRequest.noData().receiveResponse();

                            employeeStatusesRequest.unableToAcceptChat().receiveResponse();

                            tester.button('В работе 75').click();
                            tester.chatListItem('Здравствуй').click();

                            tester.visitorCardRequest().receiveResponse();
                            tester.messageListRequest().addVisitorMessage().receiveResponse();
                            tester.employeesRequest().receiveResponse();

                            changeMessageStatusRequest = tester.changeMessageStatusRequest().
                                fourthChat().
                                anotherMessage().
                                read().
                                expectToBeSent();
                        });

                        it(
                            'Не удалось отметить все сообщения, как прочитанные. Отправляю сообщение. Отправлен ' +
                            'запрос отмечания сообщений чата, как прочитанных.',
                        function() {
                            changeMessageStatusRequest.failed().receiveResponse();

                            tester.countersRequest().
                                noNewChatsWithUnreadMessages().
                                noClosedChats().
                                receiveResponse();

                            tester.textarea.withPlaceholder('Введите сообщение...').fill('Мне тревожно, успокой меня');
                            tester.chatMessageSendingButton.click();

                            tester.messageAddingRequest().anotherChat().expectToBeSent();

                            tester.changeMessageStatusRequest().
                                fourthChat().
                                anotherMessage().
                                read().
                                expectToBeSent();
                        });
                        it(
                            'Удалось отметить все сообщения, как прочитанные. Чат открыт. Отправляю сообщение. ' +
                            'Запрос отмечания сообщений чата, как прочитанных не был отправлен.',
                        function() {
                            changeMessageStatusRequest.receiveResponse();

                            tester.countersRequest().
                                noNewChatsWithUnreadMessages().
                                noClosedChats().
                                receiveResponse();

                            tester.textarea.withPlaceholder('Введите сообщение...').fill('Мне тревожно, успокой меня');
                            tester.chatMessageSendingButton.click();

                            tester.messageAddingRequest().anotherChat().expectToBeSent();
                        });
                    });
                });
            });
            it('Имя заявки не определено. Открываю раздел заявок. Отображены заявки.', function() {
                offlineMessageListRequest.
                    noName().
                    noEmployee().
                    noVisitorName().
                    receiveResponse();

                chatSettingsRequest.receiveResponse();
                employeeStatusesRequest.receiveResponse();
                countersRequest.receiveResponse();
                chatListRequest.receiveResponse();
                secondChatListRequest.receiveResponse();
                thirdChatListRequest.receiveResponse();

                tester.leftMenu.button('Заявки').click();
                tester.chatListItem('16479303').expectToBeVisible();
            });
        });
        describe('Телеграм каналы в контактах недоступны.', function() {
            beforeEach(function() {
                accountRequest.telegramContactChannelFeatureFlagDisabled().receiveResponse();

                tester.notificationChannel().applyLeader().expectToBeSent();
                tester.masterInfoMessage().receive();
                tester.notificationChannel().tellIsLeader().expectToBeSent();
                tester.masterInfoMessage().tellIsLeader().expectToBeSent();
                tester.notificationChannel().applyLeader().expectToBeSent();

                tester.employeesWebSocket.connect();
                tester.employeesInitMessage().expectToBeSent();

                tester.ticketsContactsRequest().expectToBeSent();

                const requests = ajax.inAnyOrder();

                const reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests),
                    reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                    reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                    employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests),
                    employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(requests),
                    employeeRequest = tester.employeeRequest().expectToBeSent(requests);

                requests.expectToBeSent();

                reportsListRequest.receiveResponse();
                reportTypesRequest.receiveResponse();
                reportGroupsRequest.receiveResponse();
                employeeStatusesRequest.receiveResponse();
                employeeRequest.receiveResponse();
                employeeSettingsRequest.receiveResponse();

                tester.accountRequest().
                    forChats().
                    softphoneFeatureFlagDisabled().
                    operatorWorkplaceAvailable().
                    telegramContactChannelFeatureFlagDisabled().
                    receiveResponse();

                tester.chatsWebSocket.connect();
                tester.chatsInitMessage().expectToBeSent();

                {
                    const requests = ajax.inAnyOrder();

                    const chatSettingsRequest = tester.chatSettingsRequest().expectToBeSent(requests),
                        chatChannelListRequest = tester.chatChannelListRequest().expectToBeSent(requests),
                        listRequest = tester.listRequest().expectToBeSent(requests),
                        siteListRequest = tester.siteListRequest().expectToBeSent(requests),
                        messageTemplateListRequest = tester.messageTemplateListRequest().expectToBeSent(requests),
                        reportsListRequest = tester.reportsListRequest().expectToBeSent(requests);

                    const accountRequest = tester.accountRequest().
                        forChats().
                        softphoneFeatureFlagDisabled().
                        operatorWorkplaceAvailable().
                        telegramContactChannelFeatureFlagDisabled().
                        expectToBeSent(requests);

                    requests.expectToBeSent();

                    chatSettingsRequest.receiveResponse();
                    chatChannelListRequest.receiveResponse();
                    listRequest.receiveResponse();
                    siteListRequest.receiveResponse();
                    messageTemplateListRequest.receiveResponse();
                    accountRequest.receiveResponse();
                    reportsListRequest.receiveResponse();
                }

                tester.countersRequest().receiveResponse();

                tester.offlineMessageCountersRequest().receiveResponse();
                tester.chatChannelListRequest().receiveResponse();
                tester.siteListRequest().receiveResponse();
                tester.markListRequest().receiveResponse();

                tester.chatListRequest().forCurrentEmployee().receiveResponse();
                tester.chatListRequest().forCurrentEmployee().active().receiveResponse();
                tester.chatListRequest().forCurrentEmployee().closed().receiveResponse();

                tester.chatChannelTypeListRequest().receiveResponse();

                tester.offlineMessageListRequest().notProcessed().receiveResponse();
                tester.offlineMessageListRequest().processing().receiveResponse();
                tester.offlineMessageListRequest().processed().receiveResponse();


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
                    tester.visitorCardRequest().receiveResponse();
                    tester.messageListRequest().receiveResponse();
                    tester.usersRequest().forContacts().receiveResponse();
                    tester.contactGroupsRequest().receiveResponse();
                    tester.contactGroupsRequest().receiveResponse();
                    tester.usersRequest().forContacts().receiveResponse();
                });

                it('Нажимаю на кнопку "Создать контакт".', function() {
                    tester.button('Создать контакт').click();

                    tester.contactCreatingRequest().
                        fromVisitor().
                        legacyChannelList().
                        receiveResponse();

                    tester.groupsContainingContactRequest().
                        anotherContact().
                        receiveResponse();

                    tester.chatListRequest().
                        thirdChat().
                        noVisitorName().
                        legacyChannel().
                        receiveResponse();

                    tester.contactRequest().
                        fifthContact().
                        legacyChannelList().
                        receiveResponse();

                    tester.contactBar.title.expectToHaveTextContent('Контакт');
                    tester.contactBar.section('Телефоны').svg.expectToBeVisible();
                    tester.contactBar.section('E-Mail').svg.expectToBeVisible();
                });
                it('В качестве имени канала используется имя посетителя.', function() {
                    tester.contactBar.
                        section('Каналы связи').
                        option('Помакова Бисерка Драгановна (bot)').
                        telegram.
                        expectToBeVisible();
                });
            });
            describe('Получен чат WhatsApp.', function() {
                beforeEach(function() {
                    chatListRequest.whatsapp().receiveResponse();
                    tester.visitorCardRequest().receiveResponse();
                    tester.messageListRequest().receiveResponse();
                    tester.usersRequest().forContacts().receiveResponse();
                    tester.contactGroupsRequest().receiveResponse();
                    tester.contactGroupsRequest().receiveResponse();
                    tester.usersRequest().forContacts().receiveResponse();
                });

                it('Нажимаю на кнопку "Создать контакт".', function() {
                    tester.button('Создать контакт').click();

                    tester.contactCreatingRequest().
                        whatsapp().
                        fromVisitor().
                        legacyChannelList().
                        anotherChannelExtId().
                        receiveResponse();

                    tester.groupsContainingContactRequest().
                        anotherContact().
                        receiveResponse();

                    tester.chatListRequest().thirdChat().expectToBeSent();
                    tester.contactRequest().fifthContact().receiveResponse();

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
                tester.masterInfoMessage().receive();
                tester.notificationChannel().tellIsLeader().expectToBeSent();
                tester.masterInfoMessage().tellIsLeader().expectToBeSent();
                tester.notificationChannel().applyLeader().expectToBeSent();

                tester.employeesWebSocket.connect();
                tester.employeesInitMessage().expectToBeSent();

                tester.ticketsContactsRequest().receiveResponse();

                const requests = ajax.inAnyOrder();

                const reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests),
                    reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                    reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                    employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests),
                    employeeRequest = tester.employeeRequest().expectToBeSent(requests),
                    employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(requests);

                requests.expectToBeSent();

                reportsListRequest.receiveResponse();
                reportTypesRequest.receiveResponse();
                reportGroupsRequest.receiveResponse();
                employeeStatusesRequest.receiveResponse();
                employeeRequest.receiveResponse();
                employeeSettingsRequest.receiveResponse();

                tester.accountRequest().
                    forChats().
                    softphoneFeatureFlagDisabled().
                    operatorWorkplaceAvailable().
                    tagsUpdatingUnavailable().
                    receiveResponse();

                tester.chatsWebSocket.connect();
                tester.chatsInitMessage().expectToBeSent();
                    
                {
                    const requests = ajax.inAnyOrder();

                    const reportsListRequest = tester.reportsListRequest().expectToBeSent(requests);
                    const chatSettingsRequest = tester.chatSettingsRequest().expectToBeSent(requests);
                    const chatChannelListRequest = tester.chatChannelListRequest().expectToBeSent(requests);
                    const listRequest = tester.listRequest().expectToBeSent(requests);
                    const siteListRequest = tester.siteListRequest().expectToBeSent(requests);
                    const messageTemplateListRequest = tester.messageTemplateListRequest().expectToBeSent(requests);

                    const accountRequest = tester.accountRequest().
                        forChats().
                        softphoneFeatureFlagDisabled().
                        operatorWorkplaceAvailable().
                        tagsUpdatingUnavailable().
                        expectToBeSent(requests);

                    requests.expectToBeSent();

                    reportsListRequest.receiveResponse();
                    chatSettingsRequest.receiveResponse();
                    chatChannelListRequest.receiveResponse();
                    listRequest.receiveResponse();
                    siteListRequest.receiveResponse();
                    messageTemplateListRequest.receiveResponse();
                    accountRequest.receiveResponse();
                }

                tester.countersRequest().receiveResponse();

                tester.offlineMessageCountersRequest().receiveResponse();
                tester.chatChannelListRequest().receiveResponse();
                tester.siteListRequest().receiveResponse();
                tester.markListRequest().receiveResponse();

                tester.chatListRequest().forCurrentEmployee().receiveResponse();
                tester.chatListRequest().forCurrentEmployee().active().receiveResponse();
                tester.chatListRequest().forCurrentEmployee().closed().receiveResponse();

                tester.chatChannelTypeListRequest().receiveResponse();

                tester.offlineMessageListRequest().notProcessed().receiveResponse();
                tester.offlineMessageListRequest().processing().receiveResponse();
                tester.offlineMessageListRequest().processed().receiveResponse();
            });

            describe('Открываю заявку.', function() {
                beforeEach(function() {
                    tester.leftMenu.button('Заявки').click();
                    tester.chatListItem('прива').click();

                    tester.offlineMessageAcceptingRequest().receiveResponse();
                    tester.visitorCardRequest().receiveResponse();
                    tester.usersRequest().forContacts().receiveResponse();
                    tester.contactGroupsRequest().receiveResponse();
                });

                it('Раскрываю панель "Заметки". Опции тегов заблокированы.', function() {
                    tester.collapsablePanel('Заметки').title.click();

                    tester.collapsablePanel('Заметки').
                        content.
                        row('Тэги').
                        tagField.
                        button.
                        click();

                    tester.select.
                        option('Продажа').
                        expectToBeDisabled();
                });
                it('Нажимаю на кнопку завершения заявки. Отправлен запрос завершения заявки.', function() {
                    tester.button('Завершить заявку').click();

                    tester.offlineMessageDeletingRequest().receiveResponse();
                    tester.offlineMessageCountersRequest().receiveResponse();
                });
            });
            it('Открываю чат. Раскрываю панель "Заметки". Опции тегов заблокированы.', function() {
                tester.input.fill('Сообщение #75');

                tester.input.pressEnter();
                tester.searchResultsRequest().receiveResponse();

                tester.chatListItem('Сообщение #75').click();
                
                tester.chatListRequest().thirdChat().receiveResponse();
                tester.visitorCardRequest().receiveResponse();
                tester.messageListRequest().receiveResponse();
                tester.usersRequest().forContacts().receiveResponse();
                tester.contactGroupsRequest().receiveResponse();
                tester.contactGroupsRequest().receiveResponse();
                tester.usersRequest().forContacts().receiveResponse();

                tester.collapsablePanel('Заметки').title.click();

                tester.collapsablePanel('Заметки').
                    content.
                    row('Тэги').
                    tagField.
                    button.
                    click();

                tester.select.
                    option('Продажа').
                    expectToBeDisabled();
            });
        });
        describe('Есть доступ к чужим чатам. Открываю вкладку чужих чатов.', function() {
            let employeeStatusesRequest;

            beforeEach(function() {
                accountRequest.otherEmployeeChatsAccessAvailable().receiveResponse();

                tester.notificationChannel().applyLeader().expectToBeSent();
                tester.masterInfoMessage().receive();
                tester.notificationChannel().tellIsLeader().expectToBeSent();
                tester.masterInfoMessage().tellIsLeader().expectToBeSent();
                tester.notificationChannel().applyLeader().expectToBeSent();

                tester.employeesWebSocket.connect();
                tester.employeesInitMessage().expectToBeSent();

                let requests = ajax.inAnyOrder();

                const ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests),
                    reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests),
                    reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                    reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                    employeeRequest = tester.employeeRequest().expectToBeSent(requests),
                    employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(requests);
                employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests);

                requests.expectToBeSent();

                ticketsContactsRequest.receiveResponse();
                reportGroupsRequest.receiveResponse();
                reportsListRequest.receiveResponse();
                reportTypesRequest.receiveResponse();
                employeeRequest.receiveResponse();
                employeeSettingsRequest.receiveResponse();

                const secondAccountRequest = tester.accountRequest().
                    forChats().
                    webAccountLoginUnavailable().
                    softphoneFeatureFlagDisabled().
                    operatorWorkplaceAvailable().
                    tagsUpdatingUnavailable().
                    otherEmployeeChatsAccessAvailable().
                    expectToBeSent();

                requests = ajax.inAnyOrder();

                const secondReportsListRequest = tester.reportsListRequest().expectToBeSent(requests);

                const thirdAccountRequest = tester.accountRequest().
                    forChats().
                    webAccountLoginUnavailable().
                    softphoneFeatureFlagDisabled().
                    operatorWorkplaceAvailable().
                    tagsUpdatingUnavailable().
                    otherEmployeeChatsAccessAvailable().
                    expectToBeSent(requests);

                const chatSettingsRequest = tester.chatSettingsRequest().expectToBeSent(requests),
                    chatChannelListRequest = tester.chatChannelListRequest().expectToBeSent(requests),
                    listRequest = tester.listRequest().expectToBeSent(requests),
                    siteListRequest = tester.siteListRequest().expectToBeSent(requests),
                    messageTemplateListRequest = tester.messageTemplateListRequest().expectToBeSent(requests);

                requests.expectToBeSent();
                secondAccountRequest.receiveResponse();

                tester.chatsWebSocket.connect();
                tester.chatsInitMessage().expectToBeSent();

                thirdAccountRequest.receiveResponse();
                chatSettingsRequest.receiveResponse();
                chatChannelListRequest.receiveResponse();
                listRequest.receiveResponse();
                siteListRequest.receiveResponse();
                messageTemplateListRequest.receiveResponse();

                tester.countersRequest().
                    otherEmployeeChats().
                    otherChatsExist().
                    noNewChats().
                    noClosedChats().
                    noActiveChats().
                    receiveResponse();

                tester.offlineMessageCountersRequest().receiveResponse();
                tester.chatChannelListRequest().receiveResponse();
                tester.siteListRequest().receiveResponse();
                tester.markListRequest().receiveResponse();

                tester.chatListRequest().
                    forCurrentEmployee().
                    noData().
                    receiveResponse();

                tester.chatListRequest().
                    forCurrentEmployee().
                    active().
                    noData().
                    receiveResponse();

                tester.chatListRequest().
                    forCurrentEmployee().
                    closed().
                    noData().
                    receiveResponse();

                tester.chatChannelTypeListRequest().receiveResponse();

                tester.offlineMessageListRequest().notProcessed().receiveResponse();
                tester.offlineMessageListRequest().processing().receiveResponse();
                tester.offlineMessageListRequest().processed().receiveResponse();

                tester.countersRequest().
                    noNewChats().
                    noClosedChats().
                    noActiveChats().
                    receiveResponse();

                tester.button('Чужие чаты').click();

                tester.chatListRequest().
                    active().
                    forCurrentEmployee().
                    isOtherEmployeesAppeals().
                    pinnedChatExist().
                    receiveResponse();

                tester.countersRequest().
                    otherEmployeeChats().
                    otherChatsExist().
                    noNewChats().
                    noClosedChats().
                    noActiveChats().
                    receiveResponse();

                tester.countersRequest().
                    noNewChats().
                    noClosedChats().
                    noActiveChats().
                    receiveResponse();
            });

            describe(
                'Прием трансфера недоступен для сотрудника. Нажимаю на кнопку переадресации.',
            function() {
                beforeEach(function() {
                    employeeStatusesRequest.
                        unableToAcceptChatTransfer().
                        receiveResponse();

                    tester.button('Переадресовать чат').click();

                    tester.redirectEmployeeSelectCover.click();
                    tester.select.withPlaceholder('Выбрать сотрудника').arrow.click();
                    tester.listRequest().receiveResponse();
                });

                describe('Выбираю сотрудника для трансфера.', function() {
                    beforeEach(function() {
                        tester.select.option('Костова Марвуда Любенова').click();
                    });

                    it('Выбираю чат для трансфера. Нажимаю на кнопку "Переадресовать". Чат переадресован.', function() {
                        tester.chatListItem('Привет').click();
                        tester.button('Переадресовать').click();

                        tester.forceTransferRequest().receiveResponse();
                        tester.listRequest().receiveResponse();

                        tester.chatListRequest().forCurrentEmployee().active().receiveResponse();

                        tester.chatListRequest().
                            forCurrentEmployee().
                            active().
                            isOtherEmployeesAppeals().
                            receiveResponse();

                        tester.chatListRequest().forCurrentEmployee().receiveResponse();
                        tester.chatListRequest().forCurrentEmployee().closed().receiveResponse();
                    });
                    it('Сотрудник, для трансфера выбран.', function() {
                        tester.select.withValue('Костова Марвуда Любенова').expectToBeVisible();
                    });
                });
                it('Сотрудник, не имеющий права на трансфер заблокирован.', function() {
                    tester.select.option('Чакърова Райна Илковна').click();
                    tester.select.withValue('Чакърова Райна Илковна').expectNotToExist();
                });
            });
            describe('Прием трансфера доступен для сотрудника.', function() {
                beforeEach(function() {
                    employeeStatusesRequest.receiveResponse();
                });

                it(
                    'Получено новое сообщение в закрепленный чат. Открываю вкладку "В работе". Чат не закреплен.',
                function() {
                    tester.newMessage().seventhChat().receive();
                    notificationTester.grantPermission();

                    tester.chatListRequest().
                        active().
                        ninethChat().
                        receiveResponse();

                    tester.countersRequest().
                        otherEmployeeChats().
                        anotherOtherChatsCount().
                        noNewChats().
                        noClosedChats().
                        oneActiveChat().
                        receiveResponse();

                    tester.countersRequest().
                        noNewChats().
                        noClosedChats().
                        oneActiveChat().
                        receiveResponse();

                    tester.button('В работе 1').click();

                    tester.chatList.
                        item('Я люблю тебя').
                        pin.
                        expectNotToExist();
                });
                it('Нажимаю на кнопку переадресации. Отображен список сотрудников.', function() {
                    tester.button('Переадресовать чат').click();
                    tester.body.expectTextContentToHaveSubstring('Кому передать');
                });
            });
            it('Трансфер недоступен. Нажимаю на кнопку переадресации. Список сотрудников не отображен.', function() {
                employeeStatusesRequest.
                    unableToTransferChat().
                    receiveResponse();

                tester.button('Переадресовать чат').putMouseOver();
                tester.button('Переадресовать чат').click();

                tester.body.expectTextContentNotToHaveSubstring('Кому передать');
                tester.body.expectTextContentToHaveSubstring('Невозможно сделать трансфер чата в текущем статусе');
            });
        });
        describe('Сохранение списка типов заявок недоступно. Открываю настройки чатов.', function() {
            beforeEach(function() {
                accountRequest.
                    offlineMessagesManagementUpdatingUnavailable().
                    chatPinningDisabled().
                    receiveResponse();

                tester.notificationChannel().applyLeader().expectToBeSent();
                tester.masterInfoMessage().receive();
                tester.notificationChannel().tellIsLeader().expectToBeSent();
                tester.masterInfoMessage().tellIsLeader().expectToBeSent();
                tester.notificationChannel().applyLeader().expectToBeSent();

                tester.employeesWebSocket.connect();
                tester.employeesInitMessage().expectToBeSent();

                let requests = ajax.inAnyOrder();

                const ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests),
                    reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests),
                    reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                    reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                    employeeRequest = tester.employeeRequest().expectToBeSent(requests),
                    employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests),
                    employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(requests);

                requests.expectToBeSent();

                ticketsContactsRequest.receiveResponse();
                reportGroupsRequest.receiveResponse();
                reportsListRequest.receiveResponse();
                reportTypesRequest.receiveResponse();
                employeeRequest.receiveResponse();
                employeeStatusesRequest.receiveResponse();
                employeeSettingsRequest.receiveResponse();

                const secondAccountRequest = tester.accountRequest().
                    forChats().
                    webAccountLoginUnavailable().
                    softphoneFeatureFlagDisabled().
                    operatorWorkplaceAvailable().
                    offlineMessagesManagementUpdatingUnavailable().
                    chatPinningDisabled().
                    expectToBeSent();

                requests = ajax.inAnyOrder();

                const secondReportsListRequest = tester.reportsListRequest().expectToBeSent(requests);

                const thirdAccountRequest = tester.accountRequest().
                    forChats().
                    webAccountLoginUnavailable().
                    softphoneFeatureFlagDisabled().
                    operatorWorkplaceAvailable().
                    offlineMessagesManagementUpdatingUnavailable().
                    chatPinningDisabled().
                    expectToBeSent(requests);

                const chatSettingsRequest = tester.chatSettingsRequest().expectToBeSent(requests),
                    chatChannelListRequest = tester.chatChannelListRequest().expectToBeSent(requests),
                    listRequest = tester.listRequest().expectToBeSent(requests),
                    siteListRequest = tester.siteListRequest().expectToBeSent(requests),
                    messageTemplateListRequest = tester.messageTemplateListRequest().expectToBeSent(requests);

                requests.expectToBeSent();
                secondAccountRequest.receiveResponse();

                tester.chatsWebSocket.connect();
                tester.chatsInitMessage().expectToBeSent();

                thirdAccountRequest.receiveResponse();
                chatSettingsRequest.receiveResponse();
                chatChannelListRequest.receiveResponse();
                listRequest.receiveResponse();
                siteListRequest.receiveResponse();
                messageTemplateListRequest.receiveResponse();
                secondReportsListRequest.receiveResponse();

                tester.countersRequest().receiveResponse();

                tester.offlineMessageCountersRequest().receiveResponse();
                tester.chatChannelListRequest().receiveResponse();
                tester.siteListRequest().receiveResponse();
                tester.markListRequest().receiveResponse();

                tester.chatListRequest().forCurrentEmployee().receiveResponse();
                tester.chatListRequest().forCurrentEmployee().active().receiveResponse();
                tester.chatListRequest().forCurrentEmployee().closed().receiveResponse();

                tester.chatChannelTypeListRequest().receiveResponse();

                tester.offlineMessageListRequest().notProcessed().receiveResponse();
                tester.offlineMessageListRequest().processing().receiveResponse();
                tester.offlineMessageListRequest().processed().receiveResponse();

                tester.button('Настройки').click();
                tester.popover.button('Чаты').click();

                tester.offlineMessageDisplayTypesRequest().receiveResponse();
            });

            it('Нажимаю на чекбокс "Выбрать все". Чекбокс не был отмечен.', function() {
                tester.checkbox.click();
                tester.checkbox.expectNotToBeChecked();

                tester.chips('Facebook Ads').expectToBeSelected();
                tester.chips('Property Finder').expectToBeSelected();
                tester.chips('VK Ads').expectNotToBeSelected();
                tester.chips('VK Реклама').expectNotToBeSelected();
            });
            it('Помещаю курсор над чекбоксом. Отображена подсказка об отсутствии прав.', function() {
                tester.checkbox.putMouseOver();
                tester.body.expectTextContentToHaveSubstring('Ошибка прав доступа');
            });
            it('Помещаю курсор над кнопкой "Сохранить". Отображена подсказка об отсутствии прав.', function() {
                tester.button('Сохранить').putMouseOver();
                tester.body.expectTextContentToHaveSubstring('Ошибка прав доступа');
            });
            it('Помещаю курсор над опцией. Отображена подсказка об отсутствии прав.', function() {
                tester.chips('Facebook Ads').putMouseOver();
                tester.body.expectTextContentToHaveSubstring('Ошибка прав доступа');
            });
            it('Безуспешно пытаюсь выбрать другие типы заявок.', function() {
                tester.chips('Property Finder').click();
                tester.chips('VK Ads').click();

                tester.chips('Facebook Ads').expectToBeSelected();
                tester.chips('Property Finder').expectToBeSelected();
                tester.chips('VK Ads').expectNotToBeSelected();
                tester.chips('VK Реклама').expectNotToBeSelected();
            });
        });
        describe('Просмотр списка типов заявок недоступен. Настройки чатов скрыты.', function() {
            beforeEach(function() {
                accountRequest.
                    chatPinningDisabled().
                    offlineMessagesManagementUnavailable().
                    receiveResponse();

                tester.notificationChannel().applyLeader().expectToBeSent();
                tester.masterInfoMessage().receive();
                tester.notificationChannel().tellIsLeader().expectToBeSent();
                tester.masterInfoMessage().tellIsLeader().expectToBeSent();
                tester.notificationChannel().applyLeader().expectToBeSent();

                tester.employeesWebSocket.connect();
                tester.employeesInitMessage().expectToBeSent();

                let requests = ajax.inAnyOrder();

                const ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests),
                    reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests),
                    reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                    reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                    employeeRequest = tester.employeeRequest().expectToBeSent(requests),
                    employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests),
                    employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(requests);

                requests.expectToBeSent();

                ticketsContactsRequest.receiveResponse();
                reportGroupsRequest.receiveResponse();
                reportsListRequest.receiveResponse();
                reportTypesRequest.receiveResponse();
                employeeRequest.receiveResponse();
                employeeStatusesRequest.receiveResponse();
                employeeSettingsRequest.receiveResponse();

                const secondAccountRequest = tester.accountRequest().
                    forChats().
                    webAccountLoginUnavailable().
                    softphoneFeatureFlagDisabled().
                    operatorWorkplaceAvailable().
                    tagsUpdatingUnavailable().
                    chatPinningDisabled().
                    offlineMessagesManagementUnavailable().
                    expectToBeSent();

                requests = ajax.inAnyOrder();

                const secondReportsListRequest = tester.reportsListRequest().expectToBeSent(requests);

                const thirdAccountRequest = tester.accountRequest().
                    forChats().
                    webAccountLoginUnavailable().
                    softphoneFeatureFlagDisabled().
                    operatorWorkplaceAvailable().
                    tagsUpdatingUnavailable().
                    chatPinningDisabled().
                    offlineMessagesManagementUnavailable().
                    expectToBeSent(requests);

                const chatSettingsRequest = tester.chatSettingsRequest().expectToBeSent(requests),
                    chatChannelListRequest = tester.chatChannelListRequest().expectToBeSent(requests),
                    listRequest = tester.listRequest().expectToBeSent(requests),
                    siteListRequest = tester.siteListRequest().expectToBeSent(requests),
                    messageTemplateListRequest = tester.messageTemplateListRequest().expectToBeSent(requests);

                requests.expectToBeSent();
                secondAccountRequest.receiveResponse();

                tester.chatsWebSocket.connect();
                tester.chatsInitMessage().expectToBeSent();

                thirdAccountRequest.receiveResponse();
                chatSettingsRequest.receiveResponse();
                chatChannelListRequest.receiveResponse();
                listRequest.receiveResponse();
                siteListRequest.receiveResponse();
                messageTemplateListRequest.receiveResponse();
                secondReportsListRequest.receiveResponse();

                tester.countersRequest().receiveResponse();

                tester.offlineMessageCountersRequest().receiveResponse();
                tester.chatChannelListRequest().receiveResponse();
                tester.siteListRequest().receiveResponse();
                tester.markListRequest().receiveResponse();

                tester.chatListRequest().forCurrentEmployee().receiveResponse();
                tester.chatListRequest().forCurrentEmployee().active().receiveResponse();
                tester.chatListRequest().forCurrentEmployee().closed().receiveResponse();

                tester.chatChannelTypeListRequest().receiveResponse();

                tester.offlineMessageListRequest().notProcessed().receiveResponse();
                tester.offlineMessageListRequest().processing().receiveResponse();
                tester.offlineMessageListRequest().processed().receiveResponse();
            });

            it('Ввожу URL страницы настроек. Страница настроек не была открыта.', function() {
                tester.history.push('/chats/settings');
            });
            it('Просмотр списка типов заявок недоступен. Настройки чатов скрыты.', function() {
                tester.button('Настройки').click();
                tester.popover.button('Чаты').expectNotToExist();
            });
        });
        it(
            'Закрепление чатов недоступно. Открываю вкладку чатов, находящихся в работе. Иконки кнопки скрыты.',
        function() {
            accountRequest.
                chatPinningDisabled().
                receiveResponse();

            tester.notificationChannel().applyLeader().expectToBeSent();
            tester.masterInfoMessage().receive();
            tester.notificationChannel().tellIsLeader().expectToBeSent();
            tester.masterInfoMessage().tellIsLeader().expectToBeSent();
            tester.notificationChannel().applyLeader().expectToBeSent();

            tester.employeesWebSocket.connect();
            tester.employeesInitMessage().expectToBeSent();

            let requests = ajax.inAnyOrder();

            const ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests),
                reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests),
                reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                employeeRequest = tester.employeeRequest().expectToBeSent(requests),
                employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests),
                employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(requests);

            requests.expectToBeSent();

            ticketsContactsRequest.receiveResponse();
            reportGroupsRequest.receiveResponse();
            reportsListRequest.receiveResponse();
            reportTypesRequest.receiveResponse();
            employeeRequest.receiveResponse();
            employeeStatusesRequest.receiveResponse();
            employeeSettingsRequest.receiveResponse();

            const secondAccountRequest = tester.accountRequest().
                forChats().
                webAccountLoginUnavailable().
                softphoneFeatureFlagDisabled().
                operatorWorkplaceAvailable().
                tagsUpdatingUnavailable().
                chatPinningDisabled().
                expectToBeSent();

            requests = ajax.inAnyOrder();

            const secondReportsListRequest = tester.reportsListRequest().expectToBeSent(requests);

            const thirdAccountRequest = tester.accountRequest().
                forChats().
                webAccountLoginUnavailable().
                softphoneFeatureFlagDisabled().
                operatorWorkplaceAvailable().
                tagsUpdatingUnavailable().
                chatPinningDisabled().
                expectToBeSent(requests);

            const chatSettingsRequest = tester.chatSettingsRequest().expectToBeSent(requests),
                chatChannelListRequest = tester.chatChannelListRequest().expectToBeSent(requests),
                listRequest = tester.listRequest().expectToBeSent(requests),
                siteListRequest = tester.siteListRequest().expectToBeSent(requests),
                messageTemplateListRequest = tester.messageTemplateListRequest().expectToBeSent(requests);

            requests.expectToBeSent();
            secondAccountRequest.receiveResponse();

            tester.chatsWebSocket.connect();
            tester.chatsInitMessage().expectToBeSent();

            thirdAccountRequest.receiveResponse();
            chatSettingsRequest.receiveResponse();
            chatChannelListRequest.receiveResponse();
            listRequest.receiveResponse();
            siteListRequest.receiveResponse();
            messageTemplateListRequest.receiveResponse();
            secondReportsListRequest.receiveResponse();

            tester.countersRequest().receiveResponse();

            tester.offlineMessageCountersRequest().receiveResponse();
            tester.chatChannelListRequest().receiveResponse();
            tester.siteListRequest().receiveResponse();
            tester.markListRequest().receiveResponse();

            tester.chatListRequest().forCurrentEmployee().receiveResponse();
            tester.chatListRequest().forCurrentEmployee().active().receiveResponse();
            tester.chatListRequest().forCurrentEmployee().closed().receiveResponse();

            tester.chatChannelTypeListRequest().receiveResponse();

            tester.offlineMessageListRequest().notProcessed().receiveResponse();
            tester.offlineMessageListRequest().processing().receiveResponse();
            tester.offlineMessageListRequest().processed().receiveResponse();

            tester.button('В работе 75').click();

            tester.chatList.
                first.
                item('Сообщение #6').
                putMouseOver();

            tester.chatList.
                first.
                item('Сообщение #6').
                pin.
                expectNotToExist();
        });
        it('Выбираю чат. Раскрываю вкладку "Дополнительная информация". Отображена рекламная кампания.', function() {
            accountRequest.
                otherEmployeeChatsAccessAvailable().
                receiveResponse();

            tester.notificationChannel().applyLeader().expectToBeSent();
            tester.masterInfoMessage().receive();
            tester.notificationChannel().tellIsLeader().expectToBeSent();
            tester.masterInfoMessage().tellIsLeader().expectToBeSent();
            tester.notificationChannel().applyLeader().expectToBeSent();

            tester.employeesWebSocket.connect();
            tester.employeesInitMessage().expectToBeSent();

            let requests = ajax.inAnyOrder();

            const ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests),
                reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests),
                reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                employeeRequest = tester.employeeRequest().expectToBeSent(requests),
                employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests),
                employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(requests);

            requests.expectToBeSent();

            ticketsContactsRequest.receiveResponse();
            reportGroupsRequest.receiveResponse();
            reportsListRequest.receiveResponse();
            reportTypesRequest.receiveResponse();
            employeeRequest.receiveResponse();
            employeeStatusesRequest.receiveResponse();
            employeeSettingsRequest.receiveResponse();

            const secondAccountRequest = tester.accountRequest().
                forChats().
                webAccountLoginUnavailable().
                softphoneFeatureFlagDisabled().
                operatorWorkplaceAvailable().
                tagsUpdatingUnavailable().
                otherEmployeeChatsAccessAvailable().
                expectToBeSent();

            requests = ajax.inAnyOrder();

            const secondReportsListRequest = tester.reportsListRequest().expectToBeSent(requests);

            const thirdAccountRequest = tester.accountRequest().
                forChats().
                webAccountLoginUnavailable().
                softphoneFeatureFlagDisabled().
                operatorWorkplaceAvailable().
                tagsUpdatingUnavailable().
                otherEmployeeChatsAccessAvailable().
                expectToBeSent(requests);

            const chatSettingsRequest = tester.chatSettingsRequest().expectToBeSent(requests),
                chatChannelListRequest = tester.chatChannelListRequest().expectToBeSent(requests),
                listRequest = tester.listRequest().expectToBeSent(requests),
                siteListRequest = tester.siteListRequest().expectToBeSent(requests),
                messageTemplateListRequest = tester.messageTemplateListRequest().expectToBeSent(requests);

            requests.expectToBeSent();
            secondAccountRequest.receiveResponse();

            tester.chatsWebSocket.connect();
            tester.chatsInitMessage().expectToBeSent();

            thirdAccountRequest.receiveResponse();
            chatSettingsRequest.receiveResponse();
            chatChannelListRequest.receiveResponse();
            listRequest.receiveResponse();
            siteListRequest.receiveResponse();
            messageTemplateListRequest.receiveResponse();
            secondReportsListRequest.receiveResponse();

            tester.countersRequest().
                otherEmployeeChats().
                receiveResponse();

            tester.offlineMessageCountersRequest().receiveResponse();
            tester.chatChannelListRequest().receiveResponse();
            tester.siteListRequest().receiveResponse();
            tester.markListRequest().receiveResponse();

            tester.chatListRequest().forCurrentEmployee().receiveResponse();
            tester.chatListRequest().forCurrentEmployee().active().receiveResponse();
            tester.chatListRequest().forCurrentEmployee().closed().receiveResponse();

            tester.chatChannelTypeListRequest().receiveResponse();

            tester.offlineMessageListRequest().notProcessed().receiveResponse();
            tester.offlineMessageListRequest().processing().receiveResponse();
            tester.offlineMessageListRequest().processed().receiveResponse();

            tester.countersRequest().receiveResponse();

            tester.input.fill('Сообщение #75');

            tester.input.pressEnter();
            tester.searchResultsRequest().receiveResponse();

            tester.chatListItem('Сообщение #75').click();

            const chatListRequest = tester.chatListRequest().
                thirdChat().
                noVisitorName().
                extIdSpecified().
                receiveResponse();

            const visitorCardRequest = tester.visitorCardRequest().expectToBeSent();
            tester.messageListRequest().receiveResponse();

            tester.usersRequest().forContacts().receiveResponse();
            tester.contactGroupsRequest().receiveResponse();

            visitorCardRequest.receiveResponse();

            tester.contactGroupsRequest().receiveResponse();
            tester.usersRequest().forContacts().receiveResponse();

            tester.collapsablePanel('Дополнительная информация').title.click();
            tester.chatInfoRequest().receiveResponse();

            tester.collapsablePanel('Дополнительная информация').content.expectToHaveTextContent(
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
    });
});
