define(function () {
    return function (options) {
        var root = document.getElementById('root'),
            testersFactory = options.testersFactory,
            utils = options.utils,
            ajax = options.ajax,
            Sip = options.Sip,
            webSockets = options.webSockets,
            spendTime = options.spendTime,
            rtcConnectionsMock = options.rtcConnectionsMock,
            userMedia = options.userMedia,
            soundSources = options.soundSources,
            mediaStreamsTester = options.mediaStreamsTester,
            sip,
            eventsWebSocket;

        function authenticatedUser () {
            return {
                first_name: 'Стефка',
                id: 20816,
                is_in_call: false,
                last_name: 'Ганева',
                position_id: null,
                short_phone: '9119',
                status: 'available'
            };
        }

        if (root) {
            application.exit();
            root.remove();
        }

        document.body.innerHTML = '<div id="root"></div>';
        application.run();

        this.loginField = testersFactory.createTextFieldTester(function () {
            return document.querySelector('input[placeholder="Логин"]');
        });

        this.passwordField = testersFactory.createTextFieldTester(function () {
            return document.querySelector('input[placeholder="Пароль"]');
        });

        this.phoneField = testersFactory.createTextFieldTester(function () {
            return document.querySelector('input[placeholder="Введите номер..."]');
        });

        this.enterButton = testersFactory.createDomElementTester(function () {
            return utils.descendantOfBody().matchesSelector('button').textEquals('Войти').find();
        });

        this.rememberMeCheckbox = testersFactory.createDomElementTester(function () {
            return utils.descendantOfBody().matchesSelector('span').textEquals('Запомнить меня').find().
                closest('label').querySelector('input');
        });

        this.dialpadButton = function (text) {
            return testersFactory.createDomElementTester(function () {
                return utils.descendantOfBody().matchesSelector('.clct-adress-book__dialpad-button').textEquals(text).
                    find();
            });
        };

        this.callButton = testersFactory.createDomElementTester(function () {
            return document.querySelector('.clct-adress-book__dialpad-callbutton');
        });

        this.dialpadHeader = testersFactory.createDomElementTester(function () {
            return document.querySelector('.clct-adress-book__dialpad-header');
        });

        this.callNotification = testersFactory.createDomElementTester(function () {
            return document.querySelector('.clct-notification');
        });

        this.acceptIncomingCallButton = testersFactory.createDomElementTester(function () {
            return document.querySelector('.clct-notification__button--startcall');
        });

        this.declineIncomingCallButton = testersFactory.createDomElementTester(function () {
            return document.querySelector('.clct-notification__button--stopcall');
        });

        this.firstLineButton = testersFactory.createDomElementTester(function () {
            return utils.descendantOfBody().matchesSelector('.clct-radio-button-default-inner').textEquals('1 линия').
                find().closest('.clct-c-button');
        });

        this.secondLineButton = testersFactory.createDomElementTester(function () {
            return utils.descendantOfBody().matchesSelector('.clct-radio-button-default-inner').textEquals('2 линия').
                find().closest('.clct-c-button');
        });

        this.requestContactCalls = function () {
            var queryParams = {
                numa: '79161234567'
            };

            return {
                setAnotherNumber: function () {
                    queryParams.numa = '79161234569';
                    return this;
                },
                send: function () {
                    ajax.recentRequest().
                        expectPathToContain('/sup/api/v1/calls').
                        expectQueryToContain(queryParams).
                        respondSuccessfullyWith({
                            data: [{
                                call_session_id: 980925444,
                                comment: null,
                                contact_id: null,
                                direction: 'in',
                                duration: 20,
                                full_name: 'Гяурова Марийка',
                                is_internal: false,
                                is_lost: false,
                                mark_ids: [],
                                phone: '74950230625',
                                start_time: '2019-12-17 18:07:25.522'
                            }]
                        });

                    Promise.runAll();
                }
            };
        };

        this.requestCalls = function () {
            return {
                send: function () {
                    ajax.recentRequest().
                        expectPathToContain('/sup/api/v1/users/me/calls').
                        respondSuccessfullyWith({
                            data: [{
                                call_session_id: 980925444,
                                comment: null,
                                contact_id: null,
                                direction: 'in',
                                duration: 20,
                                full_name: 'Гяурова Марийка',
                                is_internal: false,
                                is_lost: false,
                                mark_ids: [],
                                phone: '74950230625',
                                start_time: '2019-12-17 18:07:25.522'
                            }]
                        });

                    Promise.runAll();
                }
            };
        };

        this.requestAuthorization = function () {
            return {
                send: function () {
                    ajax.recentRequest().
                        expectPathToContain('/sup/auth/login/ganeva@gmail.com').
                        expectToHaveMethod('HEAD').
                        respondSuccessfullyWith('');

                    ajax.recentRequest().
                        expectPathToContain('/sup/auth/login').
                        expectBodyToContain({
                            login: 'ganeva@gmail.com',
                            password: '83JfoekKs28Fx'
                        }).
                        respondSuccessfullyWith({
                            data: {
                                employee_id: 20816,
                                token: 'XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0'
                            }
                        });

                    Promise.runAll();
                }
            };
        };

        this.requestAuthCheck = function () {
            return {
                send: function () {
                    ajax.recentRequest().expectPathToContain('/sup/auth/check').respondSuccessfullyWith('');
                    Promise.runAll();
                }
            };
        };

        this.requestMarks = function () {
            return {
                send: function () {
                    ajax.recentRequest().expectPathToContain('/sup/api/v1/marks').respondSuccessfullyWith({
                        data: [{
                            id: 2,
                            name: 'В обработке',
                            is_system: true
                        }, {
                            id: 148,
                            name: 'Генератор лидов',
                            is_system: true
                        }, {
                            id: 89,
                            name: 'Лид',
                            is_system: true
                        }, {
                            id: 1,
                            name: 'Не обработано',
                            is_system: true
                        }, {
                            id: 587,
                            name: 'Нереализованная сделка',
                            is_system: true
                        }, {
                            id: 88,
                            name: 'Нецелевой контакт',
                            is_system: true
                        }, {
                            id: 511,
                            name: 'Обработано',
                            is_system: true
                        }, {
                            id: 495,
                            name: 'Отложенный звонок',
                            is_system: true
                        }, {
                            id: 212,
                            name: 'Продажа',
                            is_system: true
                        }, {
                            id: 87,
                            name: 'Спам',
                            is_system: true
                        }, {
                            id: 86,
                            name: 'Фрод',
                            is_system: true
                        }]
                    });

                    Promise.runAll();
                }
            };
        };

        this.requestSettings = function () {
            return {
                send: function () {
                    ajax.recentRequest().expectPathToContain('/sup/api/v1/settings').respondSuccessfullyWith({
                        data: {
                            application_version: '1.3.2',
                            ice_servers: [{
                                urls: ['stun:stun.uiscom.ru:19302']
                            }],
                            sip_channels_count: 2,
                            sip_host: 'vo19.uiscom.ru',
                            sip_login: '077368',
                            sip_password: 'e2tcXhxbfr',
                            webrtc_url: 'wss://webrtc.uiscom.ru',
                            ws_url: '/ws/L1G1MyQy6uz624BkJWuy1BW1L9INRWNt5_DW8Ik836A'
                        }
                    });

                    Promise.runAll();
                }
            };
        };

        this.requestMe = function () {
            return {
                send: function () {
                    ajax.recentRequest().expectPathToContain('/sup/api/v1/users/me').respondSuccessfullyWith({
                        data: authenticatedUser()
                    });

                    Promise.runAll();
                }
            };
        };

        this.requestUsers = function () {
            return {
                send: function () {
                    ajax.recentRequest().expectPathToContain('/sup/api/v1/users').respondSuccessfullyWith({
                        data: [authenticatedUser(), {
                            first_name: 'Дора',
                            id: 82756,
                            is_in_call: false,
                            last_name: 'Шалева',
                            position_id: null,
                            short_phone: '8258',
                            status: 'unknown'
                        }]
                    });

                    Promise.runAll();
                }
            };
        };

        this.requestTalkOptions = function () {
            return {
                send: function () {
                    ajax.recentRequest().expectPathToContain('/sup/api/v1/talk_options').respondSuccessfullyWith({
                        data: [{
                            button: '#',
                            mnemonic: 'transfer_call'
                        }, {
                            button: '8',
                            mnemonic: 'run_scenario'
                        }, {
                            button: '9',
                            mnemonic: 'assign_personal_manager'
                        }, {
                            button: '3',
                            mnemonic: 'record_talk'
                        }, {
                            button: '4',
                            mnemonic: 'finish_conversation'
                        }, {
                            button: '7',
                            mnemonic: 'call_coach'
                        }, {
                            button: '1',
                            mnemonic: 'receive_fax'
                        }, {
                            button: '6',
                            mnemonic: 'run_scenario'
                        }, {
                            button: '2',
                            mnemonic: 'tag_call'
                        }, {
                            button: '5',
                            mnemonic: 'save_numa'
                        }, {
                            button: '0',
                            mnemonic: 'save_numa'
                        }]
                    });

                    Promise.runAll();
                }
            };
        };

        this.requestPermissions = function () {
            return {
                send: function () {
                    ajax.recentRequest().expectPathToContain('/sup/api/v1/permissions/me').respondSuccessfullyWith({
                        data: {
                            address_book: {
                                is_delete: true,
                                is_insert: true,
                                is_select: true,
                                is_update: true
                            },
                            tag_management: {
                                is_delete: true,
                                is_insert: true,
                                is_select: true,
                                is_update: true
                            },
                            call_session_commenting: {
                                is_delete: true,
                                is_insert: true,
                                is_select: true,
                                is_update: true
                            }
                        }
                    });

                    Promise.runAll();
                }
            };
        };

        this.requestFinishReasons = function () {
            return {
                send: function () {
                    ajax.recentRequest().expectPathToContain('/sup/api/v1/finish_reasons').respondSuccessfullyWith({
                        data: [{
                            id: 'numb_not_exists',
                            name: 'Виртуальный номер не найден'
                        }]
                    });

                    Promise.runAll();
                }
            };
        };

        this.requestGroups = function () {
            return {
                send: function () {
                    ajax.recentRequest().expectPathToContain('/sup/api/v1/phone_book/groups').respondSuccessfullyWith({
                        data: [{
                            id: 48706,
                            name: 'Отдел маркетинга'
                        }]
                    });

                    Promise.runAll();
                }
            };
        };

        this.connectWebSockets = function () {
            sip = new Sip(webSockets.getSocket('wss://webrtc.uiscom.ru').connect());
            eventsWebSocket = webSockets.getSocket(/sup\/ws\/L1G1MyQy6uz624BkJWuy1BW1L9INRWNt5_DW8Ik836A$/).connect();
        };

        this.allowMediaInput = function () {
            userMedia.allowMediaInput();
            Promise.runAll();
        };

        this.requestRegistration = function () {
            return {
                send: function () {
                    sip.recentRequest().
                        expectToHaveMethod('REGISTER').
                        expectToHaveServerName('sip:vo19.uiscom.ru').
                        expectHeaderToContain('From', '<sip:077368@vo19.uiscom.ru>').
                        expectHeaderToContain('To', '<sip:077368@vo19.uiscom.ru>').
                        response().
                        setUnauthorized().
                        addHeader('WWW-Authenticate: Digest realm="{server_name}", nonce="{to_tag}"').
                        send();

                    sip.recentRequest().
                        expectToHaveMethod('REGISTER').
                        expectToHaveHeader('Authorization').
                        response().
                        copyHeader('Contact').
                        send();
                }
            };
        };

        this.requestNameByNumber = function () {
            var phone = '79161234567',
                name = 'Шалева Дора';

            return {
                setAnotherNumber: function () {
                    phone = '79161234569';
                    name = 'Гигова Петранка';
                    return this;
                },
                send: function () {
                    ajax.recentRequest().
                        expectPathToContain('/sup/api/v1/numa/' + phone).
                        respondSuccessfullyWith({
                            data: name
                        });

                    Promise.runAll();
                }
            };
        };

        this.outboundCall = function () {
            var request = sip.recentRequest().
                expectToHaveMethod('INVITE').
                expectToHaveServerName('sip:79161234567@vo19.uiscom.ru').
                expectHeaderToContain('From', '<sip:077368@vo19.uiscom.ru>').
                expectHeaderToContain('To', '<sip:79161234567@vo19.uiscom.ru>');

            var response = request.response().
                setTrying().
                copyHeader('Contact');

            response.send();

            return {
                setRinging: function () {
                    request.response().
                        setToTag(response.getToTag()).
                        setRinging().
                        copyHeader('Contact').
                        send();
                },
                setAccepted: function () {
                    request.response().
                        setToTag(response.getToTag()).
                        copyHeader('Contact').
                        setBody('v=0').
                        send();

                    Promise.runAll();

                    sip.recentRequest().
                        expectToHaveMethod('ACK').
                        expectHeaderToContain('From', '<sip:077368@vo19.uiscom.ru>').
                        expectHeaderToContain('To', '<sip:79161234567@vo19.uiscom.ru>');

                    eventsWebSocket.receiveMessage({
                        name: 'employee_changed',
                        type: 'event',
                        params: {
                            action: 'update',
                            data: {
                                id: 20816,
                                is_in_call: true
                            }
                        }
                    });
                }
            };
        };

        this.incomingCall = function () {
            var phone = '79161234567';

            return {
                setAnotherNumber: function () {
                    phone = '79161234569';
                    return this;
                },
                receive: function () {
                    sip.request().
                        setServerName('vo19.uiscom.ru').
                        setMethod('INVITE').
                        setCallReceiverLogin('077368').
                        setSdpType().
                        addHeader('From: <sip:' + phone + '@132.121.82.37:5060;user=phone>').
                        addHeader('Contact: <sip:' + phone + '@132.121.82.37:5060;user=phone>').
                        setBody(
                            'v=0',
                            'o=bell 53655765 2353687637 IN IР4 12.3.4.5',
                            'c=IN IP4 kton.bell-tel.com',
                            'm=audio 3456 RTP/AVP 0345'
                        ).
                        receive();
                    
                    sip.recentResponse().expectTrying();
                    var response = sip.recentResponse().expectRinging();

                    return {
                        cancel: function () {
                            response.request().
                                setServerName('vo19.uiscom.ru').
                                setMethod('CANCEL').
                                receive();

                            sip.recentResponse().expectOk();
                            sip.recentResponse().expectRequestTerminated();
                        }
                    };
                }
            };
        };

        this.incomingCallProceeding = function () {
            var params = {
                calling_phone_number: '79161234567',
                contact_phone_number: '79161234567',
                virtual_phone_number: '79161234568',
                call_source: 'va',
                contact_id: null,
                call_session_id: 980925456,
                mark_ids: null,
                is_transfer: false,
                is_internal: false,
                site_domain_name: 'somesite.com',
                search_query: 'Какой-то поисковый запрос',
                campaign_name: 'Некая рекламная кампания',
                contact_full_name: 'Шалева Дора Добриновна',
                organization_name: 'ООО "Некая Организация"',
            };

            return {
                setAnotherNumber: function () {
                    params.calling_phone_number = '79161234569';
                    params.contact_phone_number = '79161234569';
                    params.virtual_phone_number = '79161234570';
                    params.contact_full_name = 'Гигова Петранка Атанасьевна';
                    return this;
                },
                receive: function () {
                    eventsWebSocket.receiveMessage({
                        name: 'call_proceeding',
                        type: 'event',
                        params: params 
                    });
                }
            };
        };

        this.requestAcceptIncomingCall = function () {
            sip.recentResponse().
                expectOk().
                request().
                setServerName('vo19.uiscom.ru').
                setMethod('ACK').
                setCallReceiverLogin('077368').
                receive();

            eventsWebSocket.receiveMessage({
                name: 'employee_changed',
                type: 'event',
                params: {
                    action: 'update',
                    data: {
                        id: 20816,
                        is_in_call: true
                    }
                }
            });
        };

        function Connection(index) {
            function getConnection () {
                return rtcConnectionsMock.getConnectionAtIndex(index);
            }
            this.connectWebRTC = function () {
                getConnection().connect();
                Promise.runAll();
            };
            this.addCandidate = function () {
                getConnection().addCandidate();
                Promise.runAll();
            };
            this.expectRemoteStreamToPlay = function () {
                mediaStreamsTester.expectStreamsToPlay(
                    getConnection().getRemoteStream()
                );
            };
        }

        this.firstConnection = new Connection(0);
        this.secondConnection = new Connection(1);

        this.expectOutgoingCallSoundAndRemoteStreamToPlay = function () {
            mediaStreamsTester.expectStreamsToPlay(
                soundSources.outgoingCall,
                rtcConnectionsMock.getConnectionAtIndex(1).getRemoteStream()
            );
        };

        this.expectOutgoingAndIncomingCallSoundsToPlay = function () {
            mediaStreamsTester.expectStreamsToPlay(soundSources.outgoingCall, soundSources.incomingCall);
        };

        this.expectOutgoingCallSoundToPlay = function () {
            mediaStreamsTester.expectStreamsToPlay(soundSources.outgoingCall);
        };

        this.expectIncomingCallSoundToPlay = function () {
            mediaStreamsTester.expectStreamsToPlay(soundSources.incomingCall);
        };

        this.expectBusyCallSoundToPlay = function () {
            mediaStreamsTester.expectStreamsToPlay(soundSources.busyCall);
        };

        this.expectNoSoundToPlay = function () {
            mediaStreamsTester.expectNoStreamToPlay();
        };

        function finishCall () {
            eventsWebSocket.receiveMessage({
                name: 'employee_changed',
                type: 'event',
                params: {
                    action: 'update',
                    data: {
                        id: 20816,
                        is_in_call: false
                    }
                }
            });

            eventsWebSocket.receiveMessage({
                id: 314723705,
                name: 'call_session_finished',
                type: 'event',
                params: {
                    call_session_id: 980925450
                }
            });
        }

        this.requestCallFinish = function () {
            sip.recentRequest().expectToHaveMethod('BYE').response().send();
            finishCall();
        };

        this.requestCancelOutgoingCall = function () {
            sip.recentRequest().expectToHaveMethod('CANCEL').response().send();
            finishCall();
        };

        this.requestDeclineIncomingCall = function () {
            sip.recentResponse().expectTemporarilyUnavailable();
            finishCall();
        };
    };
});
