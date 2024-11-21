tests.addTest(options => {
    const {
        utils,
        Tester,
        broadcastChannels,
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
        setDocumentVisible,
        setFocus,
        clipboard,
    } = options;

    const getPackage = Tester.createPackagesGetter(options);

    describe('', function() {
        let tester,
            reportGroupsRequest,
            settingsRequest,
            accountRequest,
            permissionsRequest,
            authCheckRequest,
            authenticatedUserRequest,
            registrationRequest;

        beforeEach(function() {
            localStorage.setItem('softphone-position-x', '174');
            setNow('2019-12-19T12:10:06');

            tester = new Tester({
                ...options,
                shouldShowNewSoftphone: true,
            });
        });

        describe('Открываю новый личный кабинет.', function() {
            beforeEach(function() {
                tester.input.withFieldLabel('Логин').fill('botusharova');
                tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

                tester.button('Войти').click();

                tester.loginRequest().receiveResponse();
                tester.accountRequest().receiveResponse();

                tester.notificationChannel().
                    applyLeader().
                    expectToBeSent();

                tester.masterInfoMessage().receive();

                tester.slavesNotification().
                    additional().
                    expectToBeSent();

                tester.slavesNotification().expectToBeSent();

                tester.masterInfoMessage().
                    tellIsLeader().
                    expectToBeSent();

                tester.notificationChannel().
                    tellIsLeader().
                    expectToBeSent();

                tester.employeesBroadcastChannel().
                    tellIsLeader().
                    expectToBeSent();

                tester.notificationChannel().
                    applyLeader().
                    expectToBeSent();

                tester.employeesBroadcastChannel().
                    applyLeader().
                    expectToBeSent();

                tester.employeesBroadcastChannel().
                    applyLeader().
                    expectToBeSent();

                tester.employeesWebSocket.connect();
                tester.employeesInitMessage().expectToBeSent();

                const requests = ajax.inAnyOrder();

                const ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent(requests);
                reportGroupsRequest = tester.reportGroupsRequest().expectToBeSent(requests);
                const reportsListRequest = tester.reportsListRequest().expectToBeSent(requests),
                    reportTypesRequest = tester.reportTypesRequest().expectToBeSent(requests),
                    employeeStatusesRequest = tester.employeeStatusesRequest().expectToBeSent(requests),
                    employeeRequest = tester.employeeRequest().expectToBeSent(requests),
                    employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(requests);
                authCheckRequest = tester.authCheckRequest().expectToBeSent(requests);

                requests.expectToBeSent();

                ticketsContactsRequest.receiveResponse();
                reportGroupsRequest.receiveResponse();
                reportsListRequest.receiveResponse();
                reportTypesRequest.receiveResponse();
                employeeSettingsRequest.receiveResponse();
                employeeStatusesRequest.receiveResponse();
                employeeRequest.receiveResponse();

                tester.callsRequest().receiveResponse();

                authCheckRequest.receiveResponse();
                tester.talkOptionsRequest().receiveResponse();
                permissionsRequest = tester.permissionsRequest().expectToBeSent();
            });

            describe('Пользователь не имеет права на список номеров.', function() {
                beforeEach(function() {
                    permissionsRequest.receiveResponse();
                    settingsRequest = tester.settingsRequest().expectToBeSent();
                });

                describe('Нет необходимости скрывать номера.', function() {
                    beforeEach(function() {
                        settingsRequest.receiveResponse();

                        tester.slavesNotification().
                            twoChannels().
                            enabled().
                            expectToBeSent();

                        tester.connectEventsWebSocket();

                        tester.slavesNotification().
                            twoChannels().
                            enabled().
                            softphoneServerConnected().
                            expectToBeSent();

                        tester.connectSIPWebSocket();

                        tester.slavesNotification().
                            twoChannels().
                            webRTCServerConnected().
                            softphoneServerConnected().
                            expectToBeSent();

                        notificationTester.grantPermission();
                        authenticatedUserRequest = tester.authenticatedUserRequest().expectToBeSent();

                        tester.registrationRequest().receiveUnauthorized();

                        registrationRequest = tester.registrationRequest().
                            authorization().
                            expectToBeSent();
                        
                        tester.allowMediaInput();

                        tester.slavesNotification().
                            twoChannels().
                            softphoneServerConnected().
                            webRTCServerConnected().
                            microphoneAccessGranted().
                            expectToBeSent();

                        authenticatedUserRequest.receiveResponse();

                        tester.slavesNotification().
                            twoChannels().
                            softphoneServerConnected().
                            webRTCServerConnected().
                            microphoneAccessGranted().
                            userDataFetched().
                            expectToBeSent();

                        tester.button('Софтфон').click();

                        tester.slavesNotification().
                            additional().
                            visible().
                            expectToBeSent();

                        registrationRequest.receiveResponse();

                        tester.slavesNotification().
                            twoChannels().
                            available().
                            expectToBeSent();
                    });

                    xdescribe('Поступил входящий звонок.', function() {
                       let incomingCall;
                        
                        beforeEach(function() {
                            incomingCall = tester.incomingCall().receive();

                            tester.slavesNotification().
                                twoChannels().
                                available().
                                incoming().
                                progress().
                                expectToBeSent();

                            tester.numaRequest().receiveResponse();
                        });

                        describe('Получены данные звонка.', function() {
                            beforeEach(function() {
                                tester.outCallEvent().receive();
                                tester.outCallEvent().slavesNotification().expectToBeSent();

                                tester.usersRequest().forContacts().receiveResponse();
                                tester.contactGroupsRequest().receiveResponse();
                            });

                            describe('Принимаю звонок.', function() {
                                beforeEach(function() {
                                    tester.callStartingButton.click();

                                    tester.firstConnection.connectWebRTC();
                                    tester.firstConnection.callTrackHandler();

                                    tester.allowMediaInput();
                                    tester.firstConnection.addCandidate();

                                    incomingCall.expectOkToBeSent().receiveAck();

                                    tester.slavesNotification().
                                        available().
                                        twoChannels().
                                        incoming().
                                        confirmed().
                                        expectToBeSent();
                                });

                                describe('Нажимаю на кнопку трансфера.', function() {
                                    let usersRequest;

                                    beforeEach(function() {
                                        tester.transferButton.click();
                                        usersRequest = tester.usersRequest().expectToBeSent();
                                    });

                                    describe('Сотрудников мало.', function() {
                                        beforeEach(function() {
                                            usersRequest.receiveResponse();
                                        });

                                        describe('Открываю вкладку "Группы".', function() {
                                            let usersRequest,
                                                usersInGroupsRequest,
                                                groupsRequest;

                                            beforeEach(function() {
                                                tester.button('Группы').click();

                                                usersRequest = tester.usersRequest().expectToBeSent();
                                                usersInGroupsRequest = tester.usersInGroupsRequest().expectToBeSent();
                                                groupsRequest = tester.groupsRequest().expectToBeSent();
                                            });

                                            it(
                                                'Раскрываю выпадающий список групп. Отображён список групп.',
                                            function() {
                                                usersRequest.receiveResponse();
                                                usersInGroupsRequest.receiveResponse();
                                                groupsRequest.receiveResponse();

                                                tester.select.click();

                                                tester.select.
                                                    option(
                                                        'Отдел дистрибуции ' +
                                                        '1 /1 298'
                                                    ).
                                                    findElement(
                                                        '.misc-softphone-misc-sip_lib-src-new-softphone-transfer-' +
                                                        'styles-module__list-item'
                                                    ).
                                                    expectNotToHaveClass(
                                                        'misc-softphone-misc-sip_lib-src-new-softphone-transfer-' +
                                                        'styles-module__disabled'
                                                    );
                                                    
                                                tester.select.
                                                    option(
                                                        'Отдел по работе с ключевыми клиентами ' +
                                                        '0 /1 726'
                                                    ).
                                                    findElement(
                                                        '.misc-softphone-misc-sip_lib-src-new-softphone-transfer-' +
                                                        'styles-module__list-item'
                                                    ).
                                                    expectToHaveClass(
                                                        'misc-softphone-misc-sip_lib-src-new-softphone-transfer-' +
                                                        'styles-module__disabled'
                                                    );


                                                tester.body.expectTextContentToHaveSubstring(
                                                    'Отдел дистрибуции ' +
                                                    '1 /1 298 ' +

                                                    'Отдел по работе с ключевыми клиентами ' +
                                                    '0 /1 726 ' +

                                                    'Отдел региональных продаж ' +
                                                    '2 /2 828'
                                                );
                                            });
                                            /*
                                            it(
                                                'Групп много. Очень часто меняются статусы. Не смотря на это список ' +
                                                'не тормозит.',
                                            function() {
                                                let time = (new Date()).getTime();

                                                groupsRequest.addMore().receiveResponse();
                                                usersRequest.addMore().receiveResponse();
                                                usersInGroupsRequest.addMore().receiveResponse();

                                                console.log('BEFORE OPEN LIST', (new Date()).getTime() - time);
                                                time = (new Date()).getTime();

                                                tester.select.click();
                                                console.log('AFTER OPEN LIST', (new Date()).getTime() - time);

                                                time = (new Date()).getTime();

                                                for (let i = 0; i < 20; i ++) {
                                                    const time = (new Date()).getTime();

                                                    tester.entityChangeEvent().
                                                        fourthEmployee().
                                                        receive();

                                                    tester.entityChangeEvent().
                                                        fourthEmployee().
                                                        slavesNotification().
                                                        expectToBeSent();

                                                    tester.entityChangeEvent().
                                                        fourthEmployee().
                                                        thirdStatus().
                                                        receive();

                                                    tester.entityChangeEvent().
                                                        fourthEmployee().
                                                        thirdStatus().
                                                        slavesNotification().
                                                        expectToBeSent();

                                                    console.log('ITERATION', (new Date()).getTime() - time);
                                                }

                                                console.log('DONE', (new Date()).getTime() - time);
                                            });
                                            */
                                        });
                                        describe('Раскрываю выпадающий список сотрудников.', function() {
                                            beforeEach(function() {
                                                tester.select.click();
                                            });

                                            it('Нажимаю на доступную опцию. Опция выбрана.', function() {
                                                tester.select.
                                                    option('Господинова Николина 295').
                                                    findElement(
                                                        '.misc-softphone-misc-sip_lib-src-new-softphone-transfer-' +
                                                        'styles-module__list-item'
                                                    ).
                                                    click();

                                                spendTime(0);
                                                spendTime(0);

                                                tester.select.expectToHaveTextContent('Господинова Николина 295');
                                            });
                                            it('Нажимаю на заблокированную опцию. Опция не выбрана.', function() {
                                                tester.select.
                                                    option('Божилова Йовка 296').
                                                    findElement(
                                                        '.misc-softphone-misc-sip_lib-src-new-softphone-transfer-' +
                                                        'styles-module__list-item'
                                                    ).
                                                    click();

                                                spendTime(0);
                                                spendTime(0);

                                                tester.select.expectToHaveTextContent('Выберите сотрудника *');
                                            });
                                            it('Отображён список сотрудников.', function() {
                                                tester.select.
                                                    option('Божилова Йовка 296').
                                                    findElement(
                                                        '.misc-softphone-misc-sip_lib-src-new-softphone-transfer-' +
                                                        'styles-module__list-item'
                                                    ).
                                                    expectToHaveClass(
                                                        'misc-softphone-misc-sip_lib-src-new-softphone-transfer-' +
                                                        'styles-module__disabled'
                                                    );
                                                    
                                                tester.select.
                                                    option('Господинова Николина 295').
                                                    findElement(
                                                        '.misc-softphone-misc-sip_lib-src-new-softphone-transfer-' +
                                                        'styles-module__list-item'
                                                    ).
                                                    expectNotToHaveClass(
                                                        'misc-softphone-misc-sip_lib-src-new-softphone-transfer-' +
                                                        'styles-module__disabled'
                                                    );

                                                tester.body.expectTextContentToHaveSubstring(
                                                    'Божилова Йовка 296 ' +
                                                    'Господинова Николина 295 ' +
                                                    'Шалева Дора 8258'
                                                );
                                            });
                                        });
                                    });
                                    /*
                                    it(
                                        'Сотрудников много. Очень часто меняются статусы. Не смотря на это список не ' +
                                        'тормозит.',
                                    function() {
                                        let time = (new Date()).getTime();
                                        usersRequest.addMore().receiveResponse();

                                        console.log('BEFORE OPEN LIST', (new Date()).getTime() - time);
                                        time = (new Date()).getTime();

                                        tester.select.click();
                                        console.log('AFTER OPEN LIST', (new Date()).getTime() - time);

                                        time = (new Date()).getTime();

                                        for (let i = 0; i < 20; i ++) {
                                            const time = (new Date()).getTime();

                                            tester.entityChangeEvent().
                                                fourthEmployee().
                                                receive();

                                            tester.entityChangeEvent().
                                                fourthEmployee().
                                                slavesNotification().
                                                expectToBeSent();

                                            tester.entityChangeEvent().
                                                fourthEmployee().
                                                thirdStatus().
                                                receive();

                                            tester.entityChangeEvent().
                                                fourthEmployee().
                                                thirdStatus().
                                                slavesNotification().
                                                expectToBeSent();

                                            console.log('ITERATION', (new Date()).getTime() - time);
                                        }

                                        console.log('DONE', (new Date()).getTime() - time);
                                    });
                                    */
                                });
                                it('Отображено время разговора.', function() {
                                    tester.body.expectTextContentToHaveSubstring(
                                        'ШД Шалева Дора ' +
                                        '00:00'
                                    );

                                    tester.body.expectTextContentToHaveSubstring(
                                        '1 Линия: В разговоре 00:00'
                                    );
                                });
                            });
                            it(
                                'Поступил второй входящий звонок. Отображено сообщение о звонке ' +
                                'на вторую линию.',
                            function() {
                                tester.incomingCall().thirdNumber().receive();

                                tester.slavesNotification().
                                    twoChannels().
                                    available().
                                    incoming().
                                    progress().
                                    secondChannel().
                                        incoming().
                                        progress().
                                        fifthPhoneNumber().
                                    expectToBeSent();

                                tester.numaRequest().thirdNumber().receiveResponse();

                                tester.outCallEvent().
                                    anotherPerson().
                                    receive();

                                tester.outCallEvent().
                                    anotherPerson().
                                    slavesNotification().
                                    expectToBeSent();

                                tester.body.expectTextContentToHaveSubstring(
                                    'Гигова Петранка Входящий (2-ая линия)...'
                                );
                            });
                            it('Нажимаю на номер телефона. Номер телефона скопирован.', function() {
                                tester.phone.click();
                                clipboard.expectToHaveValue('79161234567');
                            });
                            it('Нажимаю на кнопку копирования номера телефона. Номер телефона скопирован.', function() {
                                tester.copyIcon.click();
                                clipboard.expectToHaveValue('79161234567');
                            });
                            it('Отображёна информация о звонке.', function() {
                                tester.body.expectTextContentToHaveSubstring(
                                    'ШД Шалева Дора ' +
                                    'Входящий звонок ' +

                                    'Информация о звонке ' +

                                    'Номер абонента ' +
                                    '+7 (916) 123-45-67 ' +

                                    'Виртуальный номер ' +
                                    '+7 (916) 123-45-68 ' +

                                    'Сайт ' +
                                    'somesite.com ' +

                                    'Поисковый запрос ' +
                                    'Какой-то поисковый запрос, который не помещается в одну строчку ' +

                                    'Рекламная кампания ' +
                                    'Некая рекламная кампания'
                                );

                                tester.body.expectTextContentToHaveSubstring('1 Линия: Входящий звонок');

                                tester.body.expectTextContentNotToHaveSubstring('Найти контакт');
                                tester.body.expectTextContentNotToHaveSubstring('Кампания исходящего обзвона');
                                tester.body.expectTextContentNotToHaveSubstring('Комментарий');

                                tester.body.expectTextContentToHaveSubstring(
                                    'О контакте ' +

                                    'ФИО ' +
                                    '980925456 ' +

                                    'Телефоны ' +
                                    '79161234567'
                                );
                            });
                        });
                        it(
                            'Звонок оказался исходящим проведенным из CRM. Звонок отображается, как исходящий.',
                        function() {
                            tester.outCallEvent().
                                outgoing().
                                receive();

                            tester.outCallEvent().
                                outgoing().
                                slavesNotification().
                                expectToBeSent();

                            tester.usersRequest().forContacts().receiveResponse();
                            tester.contactGroupsRequest().receiveResponse();

                            tester.body.expectTextContentToHaveSubstring(
                                'ШД Шалева Дора ' +
                                'Идет вызов ' +
                                
                                'Информация о звонке ' +

                                'Номер абонента ' +
                                '+7 (916) 123-45-67 ' +

                                'Виртуальный номер ' +
                                '+7 (916) 123-45-68 ' +

                                'Сайт ' +
                                'somesite.com ' +

                                'Поисковый запрос ' +
                                'Какой-то поисковый запрос, который не помещается в одну строчку ' +

                                'Рекламная кампания ' +
                                'Некая рекламная кампания'
                            );

                            tester.body.expectTextContentToHaveSubstring(
                                '1 Линия: Исходящий звонок'
                            );
                        });
                        it(
                            'Звонок был совершён в рамках кампании исходящего обзвона. Отображено название кампании.',
                        function() {
                            tester.outCallEvent().
                                subscriberCommentSpecified().
                                autoCallCampaignName().
                                receive();

                            tester.outCallEvent().
                                subscriberCommentSpecified().
                                autoCallCampaignName().
                                slavesNotification().
                                expectToBeSent();

                            tester.usersRequest().forContacts().receiveResponse();
                            tester.contactGroupsRequest().receiveResponse();

                            tester.body.expectTextContentToHaveSubstring(
                                'ШД Шалева Дора ' +
                                'Идет вызов ' +
                                
                                'Информация о звонке ' +

                                'Номер абонента ' +
                                '+7 (916) 123-45-67 ' +

                                'Кампания исходящего обзвона ' +
                                'Обзвон лидов ЖК Солнцево Парк ' +

                                'Комментарий ' +
                                'Некий комментарий'
                            );

                            tester.body.expectTextContentToHaveSubstring(
                                '1 Линия: Исходящий звонок'
                            );
                        });
                        it('Звонок был переведён от другого сотрудника.', function() {
                            tester.outCallEvent().
                                isTransfer().
                                receive();

                            tester.outCallEvent().
                                isTransfer().
                                slavesNotification().
                                expectToBeSent();

                            tester.usersRequest().forContacts().receiveResponse();
                            tester.contactGroupsRequest().receiveResponse();

                            tester.body.expectTextContentToHaveSubstring(
                                'ШД Шалева Дора ' +
                                'Идёт переадресация 00:00 ' +

                                'Трансфер от Бисерка Макавеева'
                            );
                        });
                        it('Отображён номер телефона.', function() {
                            tester.body.expectTextContentToHaveSubstring(
                                '+7 (916) 123-45-67 ' +
                                'Входящий звонок ' +

                                'Информация о звонке ' +

                                'Номер абонента ' +
                                '+7 (916) 123-45-67'
                            );

                            tester.body.expectTextContentToHaveSubstring('Найти контакт');
                        });
                    });
                    xdescribe('Запролняю поле ввода номера телефона.', function() {
                        beforeEach(function() {
                            tester.input.fill('79161234567ghi');
                        });

                        it('Нажимаю на кнопку удаления цифры. Цифра удалена.', function() {
                            tester.dialpad.removeButton.click();
                            tester.input.expectToHaveValue('7916123456');
                        });
                        it('Поле заполнено.', function() {
                            tester.input.expectToHaveValue('79161234567');
                        });
                    });
                    it('Отображена история звонков.', function() {
                        tester.dialpad.removeButton.expectNotToExist();

                        tester.body.expectTextContentToHaveSubstring(
                            'Информация ' +
                            'История звонков Контакты ' +

                            'Сегодня ' +

                            'Гяурова Марийка ' +
                            'Входящий 08:03 ' +

                            'Вчера ' +

                            'Манова Тома ' +
                            'Исходящий 18:08 ' +

                            '17 декабря 2019 ' +

                            'Сотирова Атанаска ' +
                            'Входящий 12:02 ' +

                            'Сотирова Атанаска ' +
                            'Входящий 05:57'
                        );
                    });
                });
                return;
                it('Нужно скрывать номера. Поступил входящий звонок. Кнопка копирования скрыта.', function() {
                    settingsRequest.
                        shouldHideNumbers().
                        receiveResponse();

                    tester.slavesNotification().
                        twoChannels().
                        enabled().
                        expectToBeSent();

                    tester.connectEventsWebSocket();

                    tester.slavesNotification().
                        twoChannels().
                        enabled().
                        softphoneServerConnected().
                        expectToBeSent();

                    tester.connectSIPWebSocket();

                    tester.slavesNotification().
                        twoChannels().
                        webRTCServerConnected().
                        softphoneServerConnected().
                        expectToBeSent();

                    notificationTester.grantPermission();
                    authenticatedUserRequest = tester.authenticatedUserRequest().expectToBeSent();

                    tester.registrationRequest().receiveUnauthorized();

                    registrationRequest = tester.registrationRequest().
                        authorization().
                        expectToBeSent();
                    
                    tester.allowMediaInput();

                    tester.slavesNotification().
                        twoChannels().
                        softphoneServerConnected().
                        webRTCServerConnected().
                        microphoneAccessGranted().
                        expectToBeSent();

                    authenticatedUserRequest.receiveResponse();

                    tester.slavesNotification().
                        twoChannels().
                        softphoneServerConnected().
                        webRTCServerConnected().
                        microphoneAccessGranted().
                        userDataFetched().
                        expectToBeSent();

                    tester.button('Софтфон').click();

                    tester.slavesNotification().
                        additional().
                        visible().
                        expectToBeSent();

                    registrationRequest.receiveResponse();

                    tester.slavesNotification().
                        twoChannels().
                        available().
                        expectToBeSent();

                    tester.incomingCall().receive();

                    tester.slavesNotification().
                        twoChannels().
                        available().
                        incoming().
                        progress().
                        expectToBeSent();

                    tester.numaRequest().receiveResponse();

                    tester.outCallEvent().receive();
                    tester.outCallEvent().slavesNotification().expectToBeSent();

                    tester.usersRequest().forContacts().receiveResponse();
                    tester.contactGroupsRequest().receiveResponse();

                    tester.copyIcon.expectNotToExist();
                    tester.phone.click();

                    clipboard.expectToHaveValue(null);
                });
            });
            return;
            it('Пользователь имеет права на список номеров.', function() {
                 permissionsRequest.
                    allowNumberCapacitySelect().
                    allowNumberCapacityUpdate().
                    receiveResponse();

                tester.settingsRequest().
                    allowNumberCapacitySelect().
                    receiveResponse();

                tester.slavesNotification().
                    twoChannels().
                    enabled().
                    expectToBeSent();

                tester.connectEventsWebSocket();

                tester.slavesNotification().
                    twoChannels().
                    enabled().
                    softphoneServerConnected().
                    expectToBeSent();

                tester.connectSIPWebSocket();

                tester.slavesNotification().
                    twoChannels().
                    webRTCServerConnected().
                    softphoneServerConnected().
                    expectToBeSent();

                notificationTester.grantPermission();

                tester.numberCapacityRequest().receiveResponse();
                authenticatedUserRequest = tester.authenticatedUserRequest().expectToBeSent();

                tester.registrationRequest().receiveUnauthorized();

                registrationRequest = tester.registrationRequest().
                    authorization().
                    expectToBeSent();
                
                tester.allowMediaInput();

                tester.slavesNotification().
                    twoChannels().
                    softphoneServerConnected().
                    webRTCServerConnected().
                    microphoneAccessGranted().
                    expectToBeSent();

                authenticatedUserRequest.receiveResponse();

                tester.slavesNotification().
                    twoChannels().
                    softphoneServerConnected().
                    webRTCServerConnected().
                    microphoneAccessGranted().
                    userDataFetched().
                    expectToBeSent();

                registrationRequest.receiveResponse();

                tester.slavesNotification().
                    twoChannels().
                    available().
                    expectToBeSent();
            });
        });
        return;
        it(
            'Открываю новый личный кабинет. Использую SSO. Запрос истории звонков не отправляется раньше логина.',
        function() {
            localStorage.setItem('softphone-position-x', '174');
            setNow('2019-12-19T12:10:06');

            tester = new Tester({
                ...options,
                shouldShowNewSoftphone: true,
                hasSSOAuth: true,
            });

            tester.ssoCheckRequest().receiveResponse();

            tester.input.withFieldLabel('Логин').fill('botusharova');
            tester.input.withFieldLabel('Пароль').fill('8Gls8h31agwLf5k');

            tester.button('Войти').click();
            tester.apiLoginRequest().receiveResponse();

            tester.accountRequest().
                noAuthorizationHeader().
                receiveResponse();

            tester.notificationChannel().
                applyLeader().
                expectToBeSent();

            tester.masterInfoMessage().receive();

            tester.employeesBroadcastChannel().
                applyLeader().
                expectToBeSent();

            tester.notificationChannel().
                applyLeader().
                expectToBeSent();

            tester.masterInfoMessage().
                applyLeader().
                expectToBeSent();

            tester.employeesBroadcastChannel().
                tellIsLeader().
                expectToBeSent();

            tester.notificationChannel().
                tellIsLeader().
                expectToBeSent();

            tester.masterInfoMessage().
                tellIsLeader().
                expectToBeSent();

            tester.employeesWebSocket.
                ssoAuth().
                connect();

            tester.employeesInitMessage().
                ssoAuth().
                expectToBeSent();

            tester.slavesNotification().expectToBeSent();

            tester.slavesNotification().
                additional().
                expectToBeSent();

            const ticketsContactsRequest = tester.ticketsContactsRequest().expectToBeSent();

            const reportGroupsRequest = tester.reportGroupsRequest().
                noAuthorizationHeader().
                expectToBeSent();

            const reportsListRequest = tester.reportsListRequest().expectToBeSent(),
                reportTypesRequest = tester.reportTypesRequest().expectToBeSent();

            const employeeStatusesRequest = tester.employeeStatusesRequest().
                noAuthorizationHeader().
                expectToBeSent();

            employeeSettingsRequest = tester.employeeSettingsRequest().expectToBeSent(),

            employeeRequest = tester.employeeRequest().
                noAuthorizationHeader().
                expectToBeSent();

            authTokenRequest = tester.authTokenRequest().expectToBeSent();

            ticketsContactsRequest.receiveResponse();
            reportGroupsRequest.receiveResponse();
            reportsListRequest.receiveResponse();
            reportTypesRequest.receiveResponse();
            employeeStatusesRequest.receiveResponse();
            employeeSettingsRequest.receiveResponse();
            employeeRequest.receiveResponse();
            authTokenRequest.receiveResponse();

            const authCheckRequest = tester.authCheckRequest().
                ssoAuth().
                receiveResponse();

            tester.callsRequest().receiveResponse();
            tester.talkOptionsRequest().receiveResponse();
            tester.permissionsRequest().receiveResponse();

            tester.settingsRequest().
                ssoAuth().
                receiveResponse();

            tester.slavesNotification().
                twoChannels().
                enabled().
                expectToBeSent();

            tester.connectEventsWebSocket();

            tester.slavesNotification().
                twoChannels().
                enabled().
                softphoneServerConnected().
                expectToBeSent();

            tester.connectSIPWebSocket();

            tester.slavesNotification().
                twoChannels().
                webRTCServerConnected().
                softphoneServerConnected().
                expectToBeSent();

            notificationTester.grantPermission();
            authenticatedUserRequest = tester.authenticatedUserRequest().expectToBeSent();

            tester.registrationRequest().receiveUnauthorized();

            registrationRequest = tester.registrationRequest().
                authorization().
                expectToBeSent();
            
            tester.allowMediaInput();

            tester.slavesNotification().
                twoChannels().
                softphoneServerConnected().
                webRTCServerConnected().
                microphoneAccessGranted().
                expectToBeSent();

            authenticatedUserRequest.receiveResponse();

            tester.slavesNotification().
                twoChannels().
                softphoneServerConnected().
                webRTCServerConnected().
                microphoneAccessGranted().
                userDataFetched().
                expectToBeSent();
                
            tester.ssoWsCheckingRequest().receiveResponse();
            tester.ssoWsCheckingRequest().receiveResponse();
        });
    });
});
