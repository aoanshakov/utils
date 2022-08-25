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
            countersRequest;

        beforeEach(function() {
            setNow('2019-12-19T12:10:06');

            tester = new Tester(options);

            tester.input.withFieldLabel('Логин').fill('botusharova');
            tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

            tester.button('Войти').click();

            tester.loginRequest().receiveResponse();

            accountRequest = tester.accountRequest().
                contactsFeatureFlagDisabled().
                softphoneFeatureFlagDisabled().
                operatorWorkplaceAvailable().
                expectToBeSent();

            tester.masterInfoMessage().receive();
            tester.masterInfoMessage().tellIsLeader().expectToBeSent();

            accountRequest.receiveResponse();

            tester.notificationChannel().applyLeader().expectToBeSent();
            spendTime(1000);
            tester.notificationChannel().applyLeader().expectToBeSent();
            spendTime(1000);
            tester.notificationChannel().tellIsLeader().expectToBeSent();

            tester.accountRequest().
                forChats().
                softphoneFeatureFlagDisabled().
                operatorWorkplaceAvailable().
                receiveResponse();

            tester.reportGroupsRequest().receiveResponse();
            tester.reportsListRequest().receiveResponse(),
            tester.reportTypesRequest().receiveResponse();

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
            
            countersRequest = tester.countersRequest().expectToBeSent();
            tester.chatChannelListRequest().receiveResponse();
            tester.siteListRequest().receiveResponse();
            tester.markListRequest().receiveResponse();
            tester.chatChannelTypeListRequest().receiveResponse();
            tester.offlineMessageListRequest().receiveResponse();
            chatListRequest = tester.chatListRequest().expectToBeSent();
            tester.chatListRequest().active().receiveResponse();
            tester.chatListRequest().closed().receiveResponse();
        });

        describe('Получены данные чата.', function() {
            beforeEach(function() {
                chatListRequest.receiveResponse();
            });

            describe('Чатов много.', function() {
                beforeEach(function() {
                    countersRequest.receiveResponse();
                });

                describe('Ввожу значение в поле поиска. Нажимаю на найденный чат.', function() {
                    beforeEach(function() {
                        tester.input.fill('Сообщение #75');
                        
                        tester.input.pressEnter();
                        tester.searchResultsRequest().receiveResponse();

                        tester.chatListItem('Сообщение #75').click();
                        chatListRequest = tester.chatListRequest().thirdChat().expectToBeSent();
                    });

                    describe('Получены данные чата.', function() {
                        let messageListRequest;

                        beforeEach(function() {
                            chatListRequest.receiveResponse();
                            tester.acceptChatRequest().receiveResponse();
                            tester.visitorCardRequest().receiveResponse();
                            messageListRequest = tester.messageListRequest().expectToBeSent();
                        });

                        describe('Сообщение немного.', function() {
                            beforeEach(function() {
                                messageListRequest.receiveResponse();

                                tester.changeMessageStatusRequest().
                                    anotherChat().
                                    anotherMessage().
                                    read().
                                    receiveResponse();
                            });

                            it('Прокручиваю список чатов до конца. Отправлен запрос следующей страницы.', function() {
                                tester.spinWrapper.scrollIntoView();
                                tester.chatListRequest().secondPage().receiveResponse();
                            });
                            it('Отображены сообщения чата.', function() {
                                tester.chatHistory.expectToHaveTextContent(
                                    '10 февраля 2020 ' +

                                    'Привет 12:13 Ответить ' +
                                    'Здравствуйте 12:12 Ответить'
                                );

                                tester.spin.expectNotToExist();
                            });
                        });
                        it('Сообщение много.', function() {
                            messageListRequest.firstPage().receiveResponse();

                            tester.changeMessageStatusRequest().
                                anotherChat().
                                thirdMessage().
                                read().
                                receiveResponse();
                        });
                    });
                    it('Прокручиваю список чатов до конца. Запрос следующей страницы не отправлен', function() {
                        tester.spinWrapper.scrollIntoView();
                        tester.spin.expectToBeVisible();
                    });
                });
                describe('Прокручиваю список чатов до конца. Отправлен запрос следующей страницы.', function() {
                    beforeEach(function() {
                        tester.spinWrapper.scrollIntoView();
                        chatListRequest = tester.chatListRequest().secondPage().expectToBeSent();
                    });

                    it(
                        'Получены данные для следующей старницы. Прокручиваю список чатов до конца. Получены все ' +
                        'чаты. Отображены все чаты.',
                    function() {
                        chatListRequest.receiveResponse();
                        tester.spinWrapper.scrollIntoView();
                        tester.chatListRequest().thirdPage().receiveResponse();
                        tester.spinWrapper.scrollIntoView();

                        tester.body.expectTextContentToHaveSubstringsConsideringOrder(
                            'Помакова Бисерка Драгановна 21 янв 2022 ' +
                            'Привет 3',

                            'Помакова Бисерка Драгановна 31 дек 2021 ' +
                            'Сообщение #75'
                        );

                        tester.spin.expectNotToExist();
                    });
                    it(
                        'Прокручиваю список чатов до конца еще раз. Запрос следующей страницы не отправлен.',
                    function() {
                        tester.spinWrapper.scrollIntoView();
                    });
                    it('Отображен спиннер.', function() {
                        tester.spin.expectToBeVisible();
                    });
                });
                it('Отображен список чатов.', function() {
                    tester.body.expectTextContentToHaveSubstring(
                        'Помакова Бисерка Драгановна 21 янв 2022 ' +
                        'Привет 3'
                    );

                    tester.spin.expectNotToExist();
                });
            });
            it('Чатов мало. Прокручиваю список чатов до конца. Запрос следующей страницы не отправлен.', function() {
                countersRequest.singlePage().receiveResponse();
                tester.spinWrapper.scrollIntoView();

                tester.spin.expectNotToExist();
            });
            it('Прокручиваю список чатов до конца. Запрос следующей страницы не отправлен.', function() {
                tester.spinWrapper.scrollIntoView();
                tester.spin.expectToBeVisible();
            });
        });
        it('Отображен спиннер.', function() {
            tester.spin.expectToBeVisible();
        });
    });
});
