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

    describe('Открываю страницу чатов. Ввожу значение в поле поиска.', function() {
        let tester,
            searchResultsRequest,
            chatSettingsRequest,
            offlineMessageListRequest,
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

        describe('Нет доступа к чужим чатам. Ввожу номер телефона в поле поиска.', function() {
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

                offlineMessageListRequest.receiveResponse();

                chatSettingsRequest.receiveResponse();
                employeeStatusesRequest.receiveResponse();
                countersRequest.receiveResponse();

                chatListRequest.receiveResponse();
                thirdChatListRequest.receiveResponse();
                secondChatListRequest.receiveResponse();

                tester.chatList.
                    header.
                    button.
                    atIndex(1).
                    click();

                spendTime(0);
                spendTime(0);
                spendTime(0);
                spendTime(0);
                spendTime(0);

                tester.input.fill('79283810988');
                
                tester.input.pressEnter();

                searchResultsRequest = tester.searchResultsRequest().
                    anotherSearchString().
                    expectToBeSent();
            });

            describe('Контакт не найден.', function() {
                beforeEach(function() {
                    searchResultsRequest.receiveResponse();
                });

                describe('Нажимаю на найденный чат.', function() {
                    beforeEach(function() {
                        tester.chatListItem('Сообщение #75').click();

                        chatListRequest = tester.chatListRequest().
                            thirdChat().
                            expectToBeSent();
                    });

                    describe('Получен канал Telegram.', function() {
                        let messageListRequest,
                            visitorCardRequest;

                        beforeEach(function() {
                            chatListRequest.
                                noVisitorName().
                                extIdSpecified().
                                receiveResponse();

                            visitorCardRequest = tester.visitorCardRequest().
                                expectToBeSent();

                            messageListRequest = tester.messageListRequest().
                                expectToBeSent();

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

                                xdescribe('Открываю меню телефона.', function() {
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
                                        'Изменяю номер телефона. Отправлен запрос ' +
                                        'обновления посетителя.',
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
                                xdescribe('Раскрываю панель "Заметки".', function() {
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
                                                'Снова нажимаю на кнопку "По алфавиту". ' +
                                                'Теги отсортированы по алфавиту в ' +
                                                'обратном порядке.',
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
                                                        'искалицезиюнашлипоздноутромсвис' +
                                                        'тящегохна ' +

                                                        'Генератор лидов ' +
                                                        'В обработке'
                                                    );
                                            });
                                            it(
                                                'Теги отсортированы по алфавиту.',
                                            function() {
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
                                            'Измению теги. Отправлен запрос изменения ' +
                                            'тегов.',
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

                                            tester.button('По алфавиту').
                                                expectNotToBeChecked();

                                            tester.button('Проставлено').
                                                expectNotToBeChecked();

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
                                            'Нажата кнопка "Проставлено". Теги ' +
                                            'отсортированы по отмеченности.',
                                        function() {
                                            tester.button('По популярности').
                                                expectNotToBeChecked();

                                            tester.button('По алфавиту').
                                                expectNotToBeChecked();

                                            tester.button('Проставлено').
                                                expectToBeChecked();

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
                                xit(
                                    'Раскрываю панель "Дополнительная информация". ' +
                                    'Оторажена дополнительная информация.',
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
                                xit(
                                    'Изменяю имя посетителя. В списке чатов отображено ' +
                                    'новое имя посетителя.',
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
                                xit('Нажимаю на кнопку "Создать контакт".', function() {
                                    tester.button('Создать контакт').click();

                                    tester.contactCreatingRequest().
                                        fromVisitor().
                                        receiveResponse();

                                    tester.groupsContainingContactRequest().
                                        anotherContact().
                                        receiveResponse();

                                    tester.chatListRequest().
                                        thirdChat().
                                        expectToBeSent();

                                    tester.contactRequest().
                                        fifthContact().
                                        receiveResponse();

                                    tester.contactBar.
                                        title.
                                        expectToHaveTextContent('Контакт');

                                    tester.contactBar.
                                        section('Телефоны').
                                        svg.
                                        expectToBeVisible();

                                    tester.contactBar.
                                        section('E-Mail').
                                        svg.
                                        expectToBeVisible();
                                });
                                xit(
                                    'Нажимаю на иконку с плюсом рядом с текстом ' +
                                    '"Персональный менеджер". Выпадающий список ' +
                                    'менеджеров скрыт.',
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
                                xit(
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
                                xit(
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
                                xit(
                                    'Приходит трансфер без подтверждения от другого ' +
                                    'сотрудника. Отображено уведомление.',
                                function() {
                                    tester.forcedTransferMessage().
                                        noLastMessage().
                                        receive();

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
                                xit(
                                    'Приходит трансфер от другого сотрудника. Отображено ' +
                                    'уведомление.',
                                function() {
                                    tester.transferCreatingMessage().
                                        noLastMessage().
                                        receive();

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
                            return;
                            describe('Сообщение много.', function() {
                                let chatListRequest;

                                beforeEach(function() {
                                    messageListRequest.firstPage().receiveResponse();
                                });

                                describe(
                                    'Прокрутил список чатов до конца. Отправлен запрос ' +
                                    'чатов.',
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
                                        'Прокрутил список чатов до конца. Запрос не ' +
                                        'отправлен.',
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
                                    'История сообщений прокручена вверх. Отправлен ' +
                                    'запрос сообщений.',
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
                                    'Получено событие изменения статуса сообщения. ' +
                                    'Отправлен запрос количества чатов. Прокрутил список ' +
                                    'чатов до конца. Запрос не отправлен.',
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
                                'Получен ответ на сообщение. Отображено сообщение на ' +
                                'которое отвечает пользователь.',
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
                                'В чате присутсвует сообщение с аудио-вложением. ' +
                                'Отображен плеер.',
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
                        return;
                        describe('Сообщений немного.', function() {
                            beforeEach(function() {
                                messageListRequest.receiveResponse();
                            });

                            describe('У посетителя есть два телефона.', function() {
                                beforeEach(function() {
                                    visitorCardRequest.
                                        addSecondPhoneNumber().
                                        receiveResponse();

                                    tester.contactGroupsRequest().receiveResponse();
                                    tester.usersRequest().forContacts().receiveResponse();
                                });

                                describe('Нажимаю на кнопку перевода чата.', function() {
                                    beforeEach(function() {
                                        tester.button('Принять обращение в работу').click();
                                        tester.acceptChatRequest().receiveResponse();

                                        tester.chatTransferButton.click();
                                        tester.transferPanel.select.click();

                                        tester.chatTransferGroupsRequest().
                                            receiveResponse();
                                    });

                                    it('Выбераю доступного оператора.', function() {
                                        tester.select.
                                            option('Чакърова Райна Илковна').
                                            click();

                                        tester.transferPanel.
                                            select.
                                            expectToHaveTextContent(
                                                'Чакърова Райна Илковна'
                                            );
                                    });
                                    it(
                                        'Выбераю недоступного оператора. Оператор не ' +
                                        'выбран.',
                                    function() {
                                        tester.select.
                                            option('Костова Марвуда Любенова').
                                            click();

                                        tester.transferPanel.
                                            select.
                                            expectToHaveTextContent(
                                                'Костова Марвуда Любенова'
                                            );
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

                                            describe(
                                                'Токен авторизации истек.',
                                            function() {
                                                let refreshRequest;

                                                beforeEach(function() {
                                                    messageAddingRequest.
                                                        accessTokenExpired().
                                                        receiveResponse();

                                                    refreshRequest = tester.
                                                        refreshRequest().
                                                        expectToBeSent();
                                                });

                                                it(
                                                    'Не удалось обновить токен ' +
                                                    'авторизации.',
                                                function() {
                                                    refreshRequest.
                                                        refreshTokenExpired().
                                                        receiveResponse();

                                                    tester.userLogoutRequest().
                                                        receiveResponse();

                                                    tester.chatsWebSocket.
                                                        finishDisconnecting();

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

                                                tester.messageAddingRequest().
                                                    receiveResponse();

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
                                                'Не удалось отправить сообщение. ' +
                                                'Отправляю следующее сообщение. ' +
                                                'Сообщение успешно отправлено.',
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
                                        'добавления шаблона. Нажимаю на кнопку ' +
                                        '"Добавить". Отправлен запрос создания шаблона.',
                                    function() {
                                        tester.button('Шаблон').click();
                                        tester.button('Добавить шаблон').click();

                                        tester.modalWindow.endTransition('transform');
                                        tester.modalWindow.fileButton.click();
                                        
                                        tester.fileField.last.upload('some-file.zip');
                                        fileReader.accomplishFileLoading('some-file.zip');

                                        tester.button('Добавить').click();

                                        tester.resourceRequest().receiveResponse();

                                        tester.messageTemplateCreationRequest().
                                            receiveResponse();

                                        tester.messageTemplateListRequest().
                                            receiveResponse();
                                    });
                                    it('Кнопка завершения чата доступна.', function() {
                                        tester.button('Закончить чат').click();
                                        tester.chatClosingRequest().receiveResponse();
                                    });
                                });
                                it(
                                    'Редактирование первого телефона недоступно.',
                                function() {
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

                                tester.contactBar.
                                    section('Телефоны').
                                    svg.
                                    expectNotToExist();

                                tester.contactBar.section('E-Mail').svg.expectToBeVisible();
                            });
                            it('У посетителя нет телефона.', function() {
                                visitorCardRequest.noPhone().receiveResponse();
                                tester.contactGroupsRequest().receiveResponse();
                                tester.usersRequest().forContacts().receiveResponse();

                                tester.contactBar.
                                    section('Телефоны').
                                    svg.
                                    expectToBeVisible();

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

                            tester.chatHistory.
                                message.
                                atTime('12:13').
                                expectToHaveTextContent(
                                    'Помакова Бисерка Драгановна ' +
                                    'Как дела? ' +
                                    'Привет 12:13 Ответить'
                                );
                        });
                    });
                    return;
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

                                tester.contactBar.
                                    section('Телефоны').
                                    svg.
                                    expectToBeVisible();

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
                return;
                it('Отображена иконка телеграм.', function() {
                    tester.chatList.
                        item('Сообщение #75').
                        expectTextContentToHaveSubstring('Помакова Бисерка Драгановна');

                    tester.chatList.
                        item('Сообщение #75').
                        sourceIcon.
                        expectToHaveClass('ui-icon-source-24-telegram');

                    tester.chatList.expectTextContentToHaveSubstring(
                        'Новые ' +
                        'Помакова Бисерка Драгановна'
                    );
                });
            });
            return;
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
                                receiveResponse();

                            tester.accountRequest().
                                forChats().
                                webAccountLoginUnavailable().
                                softphoneFeatureFlagDisabled().
                                operatorWorkplaceAvailable().
                                receiveResponse();

                            tester.chatSettingsRequest().receiveResponse();
                            tester.chatChannelListRequest().receiveResponse(); 
                            tester.listRequest().receiveResponse(); 
                            tester.siteListRequest().receiveResponse(); 
                            tester.messageTemplateListRequest().receiveResponse(); 
                            tester.usersRequest().forContacts().receiveResponse();
                            tester.contactGroupsRequest().receiveResponse();

                            tester.countersRequest().receiveResponse();
                            
                            tester.offlineMessageCountersRequest().receiveResponse();
                            tester.chatChannelListRequest().receiveResponse();
                            tester.siteListRequest().receiveResponse();
                            tester.markListRequest().receiveResponse();

                            tester.chatListRequest().
                                forCurrentEmployee().
                                receiveResponse();

                            tester.chatListRequest().
                                forCurrentEmployee().
                                active().
                                receiveResponse();

                            tester.chatListRequest().
                                forCurrentEmployee().
                                closed().
                                receiveResponse();

                            tester.chatChannelTypeListRequest().receiveResponse();

                            tester.offlineMessageListRequest().
                                notProcessed().
                                receiveResponse();

                            tester.offlineMessageListRequest().
                                processing().
                                receiveResponse();

                            tester.offlineMessageListRequest().
                                processed().
                                receiveResponse();

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
                    searchResultsRequest = searchResultsRequest.newVisitor();
                });

                describe('Чат имеет тип WhatsApp.', function() {
                    beforeEach(function() {
                        searchResultsRequest.whatsApp();
                    });

                    describe('Получен только один чат.', function() {
                        beforeEach(function() {
                            searchResultsRequest.receiveResponse();
                        });

                        describe('Нажимаю на кнпоку "Начать чат". Чат начат.', function() {
                            let chatChannelSearchRequest;

                            beforeEach(function() {
                                tester.button('Начать чат').click();

                                chatChannelSearchRequest = tester.
                                    chatChannelSearchRequest().
                                    noChat().
                                    expectToBeSent();
                            });

                            describe('Найден также канал Telegram.', function() {
                                let searchResultsRequest;

                                beforeEach(function() {
                                    chatChannelSearchRequest.
                                        addTelegram().
                                        receiveResponse();

                                    searchResultsRequest = tester.searchResultsRequest().
                                        onlyWhatsAppOut().
                                        whatsApp().
                                        anotherSearchString().
                                        expectToBeSent();
                                });
                                
                                describe('Номер не был найден в канеле Telegram.', function() {
                                    beforeEach(function() {
                                        searchResultsRequest.receiveResponse();
                                    });

                                    it('Над каналом Telegram отображено сообщение об ошибке.', function() {
                                        tester.channelList.
                                            item('Telegram 79283810988').
                                            putMouseOver();

                                        tester.tooltip.expectToHaveTextContent('Номер не найден в канале');
                                    });
                                    it('Отображены найденные каналы.', function() {
                                        tester.body.expectTextContentToHaveSubstring(
                                            'Выберите канал отправки ' +

                                            'WhatsApp 79283810988 ' +
                                            'Telegram 79283810988'
                                        );
                                    });
                                });
                                it('Номер был найден в канеле Telegram.', function() {
                                    searchResultsRequest.
                                        addNewTelegram().
                                        receiveResponse();

                                    tester.channelList.
                                        item('Telegram 79283810988').
                                        click();

                                    tester.channelList.button('Начать чат').click();

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

                                    tester.chatStartingRequest().
                                        anotherChannel().
                                        receiveResponse();

                                    tester.chatListRequest().thirdChat().receiveResponse();
                                    tester.visitorCardRequest().receiveResponse();
                                    tester.usersRequest().forContacts().receiveResponse();
                                    tester.contactGroupsRequest().receiveResponse();
                                    tester.contactGroupsRequest().receiveResponse();
                                    tester.usersRequest().forContacts().receiveResponse();
                                });
                            });
                            describe('Найден только один канал.', function() {
                                let searchResultsRequest;

                                beforeEach(function() {
                                    chatChannelSearchRequest.receiveResponse();

                                    searchResultsRequest = tester.searchResultsRequest().
                                        onlyWhatsAppOut().
                                        anotherSearchString().
                                        expectToBeSent();
                                });

                                it('Номер найден в канале.', function() {
                                    searchResultsRequest.
                                        whatsApp().
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
                                it('Номер найден в канале Telegram. Отображено сообщение об ошибке.', function() {
                                    searchResultsRequest.receiveResponse();
                                    tester.notificationWindow.expectToHaveTextContent('Нет активных каналов');
                                });
                                it('Номер не найден в канале. Отображено сообщение об ошибке.', function() {
                                    searchResultsRequest.
                                        noData().
                                        receiveResponse();

                                    tester.notificationWindow.expectToHaveTextContent('Нет активных каналов');
                                });
                            });
                            it('Найден также чат Telegram Private.', function() {
                                chatChannelSearchRequest.
                                    addTelegramPrivate().
                                    receiveResponse();

                                tester.searchResultsRequest().
                                    onlyWhatsAppOut().
                                    whatsApp().
                                    anotherSearchString().
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
                        });
                        it('Отображена кнопка "Начать чат".', function() {
                            tester.body.expectTextContentToHaveSubstring(
                                'Новые ' +
                                '79283810988 Начать чат'
                            );

                            tester.chatList.
                                item('79283810988').
                                sourceIcon.
                                expectToHaveClass('ui-icon-source-24-whatsapp');
                        });
                    });
                    describe('Получен также чат Waba.', function() {
                        beforeEach(function() {
                            searchResultsRequest.
                                addNewWaba().
                                receiveResponse();
                        });
                        
                        it('Нажимаю на кнпоку "Начать чат". Чат начат.', function() {
                            tester.button('Начать чат').click();

                            tester.chatChannelSearchRequest().
                                noChat().
                                receiveResponse();

                            tester.searchResultsRequest().
                                onlyWhatsAppOut().
                                whatsApp().
                                anotherSearchString().
                                addNewWaba().
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
                        it('Чат Waba не отображен.', function() {
                            tester.chatList.
                                first.
                                item.
                                first.
                                expectToHaveTextContent('79283810988 Начать чат');

                            tester.chatList.
                                first.
                                item.
                                atIndex(1).
                                expectNotToExist();
                        });
                    });
                    it('Получены чаты в разных статусах. Отображены чаты.', function() {
                        searchResultsRequest.
                            addNew().
                            addNewChatOfCurrentEmployee().
                            addActive().
                            addActiveChatOfOtherEmployee().
                            addClosed().
                            addClosedChatOfOtherEmployee().
                            receiveResponse();

                        tester.body.expectTextContentToHaveSubstring(
                            'Новые ' +

                            '79283810988 Начать чат ' +

                            'Помакова Бисерка Драгановна 20 янв 2020 ' +
                            'Сообщение в новом чате ' +

                            'Активные ' +

                            'Помакова Бисерка Драгановна 20 янв 2020 ' +
                            'Сообщение в активном чате ' +

                            'Завершённые ' +

                            'Помакова Бисерка Драгановна 20 янв 2020 ' +
                            'Сообщение в закрытом чате ' +

                            'Чужие чаты ' +

                            'Помакова Бисерка Драгановна 20 янв 2020 ' +
                            'Сообщение в активном чате другого сотрудника ' +

                            'Помакова Бисерка Драгановна 20 янв 2020 ' +
                            'Сообщение в закрытом чате дргугого сотрудника'
                        );
                    });
                    it(
                        'Получен контакт. Нажимаю на кнпоку "Начать чат". Чат начат.',
                    function() {
                        searchResultsRequest.
                            contactExists().
                            receiveResponse();

                        tester.button('Начать чат').click();

                        tester.chatChannelSearchRequest().
                            noChat().
                            receiveResponse();

                        tester.searchResultsRequest().
                            onlyWhatsAppOut().
                            whatsApp().
                            anotherSearchString().
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
                });
                describe('Чат имеет тип Waba. Получен также чат WhatsApp.', function() {
                    beforeEach(function() {
                        searchResultsRequest.
                            waba().
                            addNewWhatsApp().
                            receiveResponse();
                    });

                    describe('Нажимаю на кнпоку "Начать чат".', function() {
                        let searchResultsRequest;

                        beforeEach(function() {
                            tester.button('Начать чат').click();

                            tester.chatChannelSearchRequest().
                                noChat().
                                receiveResponse();

                            searchResultsRequest = tester.searchResultsRequest().
                                onlyWhatsAppOut().
                                anotherSearchString().
                                addNewWhatsApp().
                                waba().
                                expectToBeSent();
                        });

                        it('Номер был найден в канале Waba. Чат начат.', function() {
                            searchResultsRequest.
                                waba().
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
                        it(
                            'Номер был найден в канале WhatsApp. Чат начат. Отображено сообщение об ошибке.',
                        function() {
                            searchResultsRequest.
                                whatsApp().
                                receiveResponse();

                            tester.notificationWindow.expectToHaveTextContent('Нет активных каналов');
                        });
                    });
                    it('Чат WhatsApp не отображен.', function() {
                        tester.chatList.
                            first.
                            item.
                            first.
                            expectToHaveTextContent('79283810988 Начать чат');

                        tester.chatList.
                            first.
                            item.
                            atIndex(1).
                            expectNotToExist();
                    });
                });
                describe('Чат имеет тип Telegram Private.', function() {
                    beforeEach(function() {
                        searchResultsRequest.
                            telegramPrivate().
                            receiveResponse();
                    });

                    describe('Нажимаю на кнпоку "Начать чат".', function() {
                        let chatChannelSearchRequest;

                        beforeEach(function() {
                            tester.button('Начать чат').click();

                            chatChannelSearchRequest = tester.chatChannelSearchRequest().
                                telegramPrivate().
                                expectToBeSent();
                        });

                        describe('Найден закрытый чат.', function() {
                            beforeEach(function() {
                                chatChannelSearchRequest.closed();
                            });

                            it(
                                'Чат принадлжит авторизованному сотруднику. Открыт ' +
                                'закрытый чат.',
                            function() {
                                chatChannelSearchRequest.receiveResponse();

                                tester.searchResultsRequest().
                                    onlyWhatsAppOut().
                                    anotherSearchString().
                                    telegramPrivate().
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

                                tester.chatListRequest().
                                    thirdChat().
                                    receiveResponse();

                                tester.messageListRequest().receiveResponse();
                                tester.visitorCardRequest().receiveResponse();
                                tester.usersRequest().forContacts().receiveResponse();
                                tester.contactGroupsRequest().receiveResponse();
                                tester.contactGroupsRequest().receiveResponse();
                                tester.usersRequest().forContacts().receiveResponse();
                            });
                            it('Чат принадлжит другому сотруднику.', function() {
                                chatChannelSearchRequest.
                                    anotherEmployee().
                                    receiveResponse();

                                tester.searchResultsRequest().
                                    onlyWhatsAppOut().
                                    anotherSearchString().
                                    telegramPrivate().
                                    receiveResponse();

                                tester.channelList.
                                    item('WhatsApp 79283810988').
                                    putMouseOver();

                                tester.channelList.
                                    item('WhatsApp 79283810988').
                                    click();

                                tester.tooltip.expectToHaveTextContent(
                                    'По этому номеру уже был создан чат другим оператором'
                                );
                            });
                        });
                        describe('В каналах нет чатов.', function() {
                            beforeEach(function() {
                                chatChannelSearchRequest.noChat();
                            });

                            it('Чат начат.', function() {
                                chatChannelSearchRequest.receiveResponse();

                                tester.searchResultsRequest().
                                    onlyWhatsAppOut().
                                    anotherSearchString().
                                    telegramPrivate().
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

                                tester.chatListRequest().
                                    thirdChat().
                                    receiveResponse();

                                tester.visitorCardRequest().receiveResponse();
                                tester.usersRequest().forContacts().receiveResponse();
                                tester.contactGroupsRequest().receiveResponse();
                                tester.contactGroupsRequest().receiveResponse();
                                tester.usersRequest().forContacts().receiveResponse();

                            });
                            it('Получен также чат WhatsApp.', function() {
                                chatChannelSearchRequest.
                                    addWhatsApp().
                                    receiveResponse();

                                tester.searchResultsRequest().
                                    onlyWhatsAppOut().
                                    anotherSearchString().
                                    telegramPrivate().
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

                                tester.chatListRequest().
                                    thirdChat().
                                    receiveResponse();

                                tester.visitorCardRequest().receiveResponse();
                                tester.usersRequest().forContacts().receiveResponse();
                                tester.contactGroupsRequest().receiveResponse();
                                tester.contactGroupsRequest().receiveResponse();
                                tester.usersRequest().forContacts().receiveResponse();
                            });
                        });
                        it('Найден активный чат. Открыт активный чат.', function() {
                            chatChannelSearchRequest.receiveResponse();

                            tester.searchResultsRequest().
                                onlyWhatsAppOut().
                                anotherSearchString().
                                telegramPrivate().
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

                            tester.chatListRequest().
                                thirdChat().
                                receiveResponse();

                            tester.messageListRequest().receiveResponse();
                            tester.visitorCardRequest().receiveResponse();
                            tester.usersRequest().forContacts().receiveResponse();
                            tester.contactGroupsRequest().receiveResponse();
                            tester.contactGroupsRequest().receiveResponse();
                            tester.usersRequest().forContacts().receiveResponse();
                        });
                    });
                    it('Отображёна иконка Telegram.', function() {
                        tester.chatList.
                            item('79283810988').
                            sourceIcon.
                            expectToHaveClass('ui-icon-source-24-telegram');
                    });
                });
                it('Чат имеет тип Telegram. Чат не отображён.', function() {
                    searchResultsRequest.receiveResponse();
                    tester.chatList.item('79283810988').expectNotToExist();
                });
            });
            it('Имя посетителя не было получено. Отображено имя чата.', function() {
                searchResultsRequest.
                    noVisitorName().
                    receiveResponse();
         
                tester.chatList.
                    item('Сообщение #75').
                    expectTextContentToHaveSubstring('Памакова Бисерка');
            });
            it(
                'Ни имя посетителя, ни имя чата не было получено. Отображен ' +
                'идентификатор посетителя.',
            function() {
                searchResultsRequest.
                    noName().
                    noVisitorName().
                    receiveResponse();
         
                tester.chatList.
                    item('Сообщение #75').
                    expectTextContentToHaveSubstring('#16479303');
            });
        });
return;
        it(
            'Есть доступ к чужим чатам. Ввожу номер телефона в поле поиска. Получен новый чат. Чат принадлежит ' +
            'другому сотруднику. Нажимаю на кнпоку "Начать чат". Чат начат.',
        function() {
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
                otherEmployeeChatsAccessAvailable().
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
                    otherEmployeeChatsAccessAvailable().
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

            countersRequest = tester.countersRequest().
                otherEmployeeChats().
                otherChatsExist().
                expectToBeSent();

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

            offlineMessageListRequest.receiveResponse();

            chatSettingsRequest.receiveResponse();
            employeeStatusesRequest.receiveResponse();
            countersRequest.receiveResponse();

            chatListRequest.receiveResponse();
            thirdChatListRequest.receiveResponse();
            secondChatListRequest.receiveResponse();

            tester.countersRequest().receiveResponse();

            tester.chatList.
                header.
                button.
                atIndex(1).
                click();

            tester.input.fill('79283810988');
            tester.input.pressEnter();

            tester.searchResultsRequest().
                anotherSearchString().
                newVisitor().
                telegramPrivate().
                receiveResponse();

            tester.button('Начать чат').click();

            tester.chatChannelSearchRequest().
                telegramPrivate().
                closed().
                anotherEmployee().
                receiveResponse();

            tester.searchResultsRequest().
                onlyWhatsAppOut().
                anotherSearchString().
                telegramPrivate().
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

            tester.chatListRequest().
                thirdChat().
                receiveResponse();

            tester.visitorCardRequest().receiveResponse();
            tester.usersRequest().forContacts().receiveResponse();
            tester.contactGroupsRequest().receiveResponse();
            tester.contactGroupsRequest().receiveResponse();
            tester.usersRequest().forContacts().receiveResponse();
        });
    });
});
