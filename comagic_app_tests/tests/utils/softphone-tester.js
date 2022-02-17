define(function () {
    return function (options) {
        var initialize = options.initialize || (() => null),
            testersFactory = options.testersFactory,
            utils = options.utils,
            ajax = options.ajax,
            Sip = options.Sip,
            webSockets = options.webSockets,
            rtcConnectionsMock = options.rtcConnectionsMock,
            userMedia = options.userMedia,
            soundSources = options.soundSources,
            mediaStreamsTester = options.mediaStreamsTester,
            playingOscillatorsTester = options.playingOscillatorsTester,
            decodedTracksTester = options.decodedTracksTester,
            spendTime = options.spendTime,
            addSecond = options.addSecond,
            triggerMutation = options.triggerMutation,
            sip,
            eventsWebSocket,
            me = this,
            webRtcUrlParam = 'webrtc_url',
            webRtcUrl = 'wss://webrtc.uiscom.ru',
            webRtcUrlForGettingSocket = webRtcUrl;

        var updateWebRtcUrlForGettingSocket = function (index) {
            return {
                webRtcUrlForGettingSocket: webRtcUrlForGettingSocket,
                index: index
            };
        };

        initialize();

        function getSipLineButton (index) {
            return document.querySelectorAll('.cmg-sip-line-button')[index];
        }

        this.innerContainer = testersFactory.createDomElementTester('#cmg-inner-container');
        this.microphoneButton = testersFactory.createDomElementTester('.cmg-microphone-button');

        this.firstLineButton = testersFactory.createDomElementTester(function () {
            return getSipLineButton(0);
        });

        this.secondLineButton = testersFactory.createDomElementTester(function () {
            return getSipLineButton(1);
        });

        this.expectMicrophoneDeviceIdToEqual = function (mediaStream, expectedDeviceId) {
            var actualDeviceId = mediaStream.getAudioTracks()[0].getSettings().deviceId;

            if (!actualDeviceId && expectedDeviceId) {
                throw new Error('Устройство не указано, тогда как его идентификатор должено быть таким - "' +
                    expectedDeviceId + '".');
            }

            if (actualDeviceId != expectedDeviceId) {
                throw new Error('Идентификатор устройства должен быть таким - "' + expectedDeviceId + '", а не ' +
                    'таким - "' + actualDeviceId + '".');
            }
        }

        this.getPCMA8000sdp = function () {
            return [
                'v=0',
                'o=- 6845874344053138478 2 IN IP4 127.0.0.1',
                's=-',
                't=0 0',
                'a=msid-semantic: WMS 2c90093a-9b17-4821-aaf3-7b858065ff07',
                'a=group:BUNDLE 0',
                'm=audio 9 UDP/TLS/RTP/SAVPF 8',
                'c=IN IP4 0.0.0.0',
                'a=rtpmap:8 PCMA/8000',
                'a=rtcp:9 IN IP4 0.0.0.0',
                'a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level',
                'a=extmap:2 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01',
                'a=extmap:3 urn:ietf:params:rtp-hdrext:sdes:mid',
                'a=extmap:4 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id',
                'a=extmap:5 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id',
                'a=setup:actpass',
                'a=mid:0',
                'a=msid:2c90093a-9b17-4821-aaf3-7b858065ff07 f807f562-5698-4b34-a298-bc3f780934c3',
                'a=sendrecv',
                'a=ice-ufrag:7MXY',
                'a=ice-pwd:KAoEygUaHA9Mla0gjHYN9/tK',
                'a=fingerprint:sha-256 59:53:4D:AF:66:F5:F1:CE:3A:F7:93:13:5A:E6:07:19:1E:03:E9:22:A1:19:B2:49:6B:C7:37:86:90:21:2B:42',
                'a=ice-options:trickle',
                'a=ssrc:3906726496 cname:bn9leCsdnF9+R5yv',
                'a=ssrc:3906726496 msid:2c90093a-9b17-4821-aaf3-7b858065ff07 f807f562-5698-4b34-a298-bc3f780934c3',
                'a=ssrc:3906726496 mslabel:2c90093a-9b17-4821-aaf3-7b858065ff07',
                'a=ssrc:3906726496 label:f807f562-5698-4b34-a298-bc3f780934c3',
                'a=rtcp-mux',
                ''
            ].join("\r\n");
        };

        this.anchor = function (text) {
            return testersFactory.createDomElementTester(
                utils.descendantOfBody().matchesSelector('a').textEquals(text).find()
            );
        }

        this.clctPopover = testersFactory.createDomElementTester('.clct-popover');

        this.flushUpdates = function () {
            utils.pressKey('j');
        };

        this.setJanusWebrtcUrl = function () {
            webRtcUrl = 'wss://webrtc-test.callgear.com:8989/ws';
            webRtcUrlForGettingSocket = webRtcUrl;
        };

        this.setJanusAndJsSIPUrls = function () {
            webRtcUrl = ['wss://webrtc.uiscom.ru', 'wss://webrtc-test.callgear.com:8989/ws'],
            webRtcUrlForGettingSocket = /^wss:\/\/webrtc/;
        };

        this.setTwoJanusUrls = function () {
            webRtcUrl = ['wss://pp-janus-1.uiscom.ru:8989', 'wss://pp-janus-2.uiscom.ru:8989'],
            webRtcUrlForGettingSocket = /^wss:\/\/pp-janus-\d{1}.uiscom.ru:8989$/;
        };

        function setCallGearWebRtcUrlUpdater () {
            updateWebRtcUrlForGettingSocket = function (index) {
                return {
                    webRtcUrlForGettingSocket: webRtcUrl[index],
                    index: 0
                };
            };
        }

        this.setTwoCallGearJanusUrls = function () {
            setCallGearWebRtcUrlUpdater();
            this.setTwoJanusUrls();
        };

        this.setTwoJsSIPUrls = function () {
            webRtcUrl = ['wss://webrtc-1.uiscom.ru', 'wss://webrtc-2.uiscom.ru'],
            webRtcUrlForGettingSocket = /^wss:\/\/webrtc-\d{1}.uiscom.ru$/;
        };

        this.setTwoJsSIPCallGearUrls = function () {
            setCallGearWebRtcUrlUpdater();
            this.setTwoJsSIPUrls();
        };

        this.setTwoJsSIPUrlsInWebrtcUrls = function () {
            this.setTwoJsSIPUrls();
            webRtcUrlParam = 'webrtc_urls';
        };

        this.setJsSIPRTUUrl = function () {
            webRtcUrl = ['wss://rtu-webrtc.uiscom.ru'],
            webRtcUrlParam = 'rtu_webrtc_urls';
            webRtcUrlForGettingSocket = 'wss://rtu-webrtc.uiscom.ru';
        };

        this.body = testersFactory.createDomElementTester(function () {
            return document.body;
        });

        this.callButton = testersFactory.createDomElementTester(function () {
            return document.querySelector('#cmg-top-buttons .cmg-call-button-start');
        });

        this.stopButton = testersFactory.createDomElementTester(function () {
            return document.querySelector('#cmg-top-buttons .cmg-call-button-stop');
        });
        
        this.clctCButton = function (text) {
            return testersFactory.createDomElementTester(utils.descendantOfBody().
                matchesSelector('.clct-c-button').textEquals(text).find());
        };

        this.dialpadButton = function (text) {
            return testersFactory.createDomElementTester(function () {
                return utils.descendantOfBody().matchesSelector('.clct-adress-book__dialpad-button').textEquals(text).
                    find();
            });
        };

        this.removeDigitButton = testersFactory.createDomElementTester(function () {
            return document.querySelector('.clct-adress-book__dialpad-header-clear');
        });

        this.settingsSelect = function (text) {
            function getSelector () {
                return utils.descendantOfBody().
                    matchesSelector('.ant-select-selector .clct-settings__config__content__selector__label').
                    textEquals(text).
                    find().
                    closest('.ant-select-selector');
            };

            var selectorTester = testersFactory.createDomElementTester(getSelector);

            var valueTester = testersFactory.createDomElementTester(function () {
                return getSelector().querySelector('.clct-settings__config__content__selector__value');
            });

            selectorTester.expectToHaveValue = function (expectedValue) {
                return valueTester.expectToHaveTextContent(expectedValue);
            };

            selectorTester.option = function (text) {
                return testersFactory.createDomElementTester(
                    utils.descendantOfBody().
                        matchesSelector('.ant-select-item-option .clct-settings__config__content__selector__value').
                        textEquals(text).
                        find().
                        closest('.ant-select-item-option')
                );
            };

            return selectorTester;
        };

        this.selectOption = function (numb) {
            return testersFactory.createDomElementTester(
                utils.descendantOfBody().matchesSelector('.clct-select__option').textEquals(numb).find()
            );
        };

        this.selectOptions = testersFactory.createDomElementTester(function () {
            return utils.descendantOfBody().matchesSelector('.clct-select__options');
        });

        this.radioButton = function (text) {
            return testersFactory.createDomElementTester(utils.descendantOfBody().matchesSelector('.clct-radio-button').
                textEquals(text).find());
        };

        this.modalWindow = testersFactory.createDomElementTester(function () {
            return document.querySelector('.clct-modal');
        });

        function getCallsGrid () {
            return document.querySelector('.clct-calls-history__items');
        }

        function getCallsGridItemNameContainer (name, index) {
            const conditions = utils.descendantOf(getCallsGrid()).
                matchesSelector('.clct-calls-history__item-inner-row').
                textEquals(name);

            if (!index && index !== 0) {
                return conditions.find();
            }

            return conditions.findAll()[index];
        }

        function getCallsGridItem (name) {
            var callsGridItemNameContainer = getCallsGridItemNameContainer(name);

            if (!callsGridItemNameContainer) {
                throw new Error('Не найдена строка с именем "' + name + '" в таблице истории звонков.');
            }
            
            return callsGridItemNameContainer.closest('.clct-calls-history__item');
        }

        this.getCallsGridItem = getCallsGridItem;

        this.spinner = testersFactory.createDomElementTester('.clct-spinner, .ant-spin, .ui-spin-icon');

        this.callsGridItemNameContainer = function (name) {
            function createTester (index) {
                return testersFactory.createDomElementTester(function () {
                    return getCallsGridItemNameContainer(name, index);
                });
            };

            var tester = createTester();

            tester.first = function () {
                return createTester(0);
            };

            return tester;
        };

        this.callsGridScrolling = function () {
            var callsGrid = getCallsGrid().querySelector('.simplebar-content-wrapper');

            if (!callsGrid) {
                throw new Error('Таблица звонков не найдена.');
            }

            var end = callsGrid.scrollHeight - callsGrid.clientHeight,
                top = Math.round(end / 2) || 1;

            return {
                toTheEnd: function () {
                    top = end;
                    return this;
                },
                scroll: function () {
                    var element = callsGrid,
                        event = new Event('scroll');

                    event.target = element;
                    element.scrollTop = top;
                    element.dispatchEvent(event);

                    Promise.runAll(false, true);
                }
            };
        };

        this.callButtonInCallsGridItem = function (name) {
            return testersFactory.createDomElementTester(
                getCallsGridItem(name).querySelector('.clct-calls-history__start-call')
            );
        };

        this.callDirectionIcon = function (name) {
            return testersFactory.createDomElementTester(
                getCallsGridItem(name).querySelectorAll('.clct-calls-history__item-direction path')[0]
            );
        };

        this.callsGrid = testersFactory.createDomElementTester(getCallsGrid);

        function getStatusesGrid () {
            return document.querySelector('.clct-status-popover');
        };

        this.statusesGrid = testersFactory.createDomElementTester(getStatusesGrid);

        this.userStatusOption = function (text) {
            return testersFactory.createDomElementTester(function () {
                return utils.descendantOf(getStatusesGrid()).matchesSelector('.clct-status-popover-item').
                    textEquals(text).find();
            });
        };

        this.currentStatusIcon = testersFactory.createDomElementTester(function () {
            return document.querySelector('.clct-current-status');
        });

        this.userStatusesButton =  testersFactory.createDomElementTester(function () {
            return document.querySelector('.clct-status-menu');
        });

        this.authenticatedUser = function () {
            return {
                first_name: 'Стефка',
                id: 20816,
                is_in_call: false,
                last_name: 'Ганева',
                position_id: null,
                short_phone: '9119',
                status_id: 3,
                is_sip_online: true,
                image: 'https://thispersondoesnotexist.com/image'
            };
        };

        this.requestSaveNumberCapacity = function () {
            return {
                receiveResponse: function () {
                    this.send();
                },
                send: function () {
                    ajax.recentRequest().
                        expectPathToContain('number_capacity/077368').
                        expectToHaveMethod('PATCH').
                        expectBodyToContain({
                            number_capacity_id: 124825
                        }).
                        respondSuccessfullyWith({
                            data: true
                        });

                    Promise.runAll();
                    spendTime(0);
                }
            };
        };

        this.saveNumberCapacityRequest = this.requestSaveNumberCapacity;

        this.requestContactCalls = function () {
            var queryParams = {
                numa: '79161234567'
            };

            return {
                setThirdNumber: function () {
                    queryParams.numa = '74950230626';
                    return this;
                },
                setSecondNumber: function () {
                    queryParams.numa = '74950230625';
                    return this;
                },
                setAnotherNumber: function () {
                    queryParams.numa = '79161234569';
                    return this;
                },
                receiveResponse: function () {
                    ajax.recentRequest().
                        expectPathToContain('/sup/api/v1/calls').
                        expectQueryToContain(queryParams).
                        respondSuccessfullyWith({
                            data: [{
                                cdr_type: 'default',
                                call_session_id: 980925444,
                                comment: null,
                                phone_book_contact_id: null,
                                direction: 'in',
                                duration: 20,
                                contact_name: 'Гяурова Марийка',
                                is_failed: false,
                                mark_ids: [],
                                number: '74950230625',
                                start_time: '2019-12-17 18:07:25.522'
                            }]
                        });

                    Promise.runAll();
                },
                send: function () {
                    this.receiveResponse();
                }
            };
        };

        this.contactCallsRequest = function () {
            return this.requestContactCalls();
        };

        this.getCalls = function (args) {
            var date = args.date,
                process = args.process || function () {},
                name = args.name,
                i = args.start || 0,
                count = (args.count || 100) + i,
                interval = (1000 * 60 * 60 * 6) + (5 * 1000 * 60) + (12 * 1000) + 231,
                data = [];

            date = new Date(date);
            date = new Date(date.getTime() - (interval * i));

            for (;i < count; i ++) {
                date = new Date(date.getTime() - interval);

                var item = {
                    cdr_type: 'default',
                    call_session_id: 928502921 + i,
                    cdr_id: 931875921 + i,
                    comment: null,
                    direction: 'in',
                    duration: 22,
                    is_failed: false,
                    mark_ids: [],
                    number: '74950230627',
                    start_time: utils.formatDate(date),
                    contact_name: 'Сотирова Атанаска'
                };

                process(item);
                data.push(item);
            }

            return data;
        };

        this.requestMarks = function () {
            return {
                expectToBeSent: function (requests) {
                    var request = requests ? requests.someRequest() : ajax.recentRequest();

                    return {
                        receiveResponse: function () {
                            request.expectPathToContain('/sup/api/v1/marks').respondSuccessfullyWith({
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

                            Promise.runAll(false, true);
                        },
                    };
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                },
                send: function () {
                    this.receiveResponse();
                }
            };
        };

        this.marksRequest = function () {
            return this.requestMarks();
        };

        this.addDefaultSettings = function (settings) {
            settings[webRtcUrlParam] = webRtcUrl;
            return settings;
        };

        this.settingsRequest = function () {
            return this.requestSettings();
        };

        this.requestMe = function () {
            var user = this.authenticatedUser();

            function addMethods (me) {
                me.sipIsOffline = function () {
                    user.is_sip_online = false;
                    return me;
                };

                me.setUnknownState = function () {
                    user.status_id = 6;
                    return me;
                };

                return me;
            }

            var testRequest = function (request) {
                return request;
            };

            return addMethods({
                anotherAuthorizationToken: function () {
                    testRequest = function (request) {
                        return request.expectToHaveHeaders({
                            Authorization: 'Bearer 935jhw5klatxx2582jh5zrlq38hglq43o9jlrg8j3lqj8jf'
                        });
                    };

                    return this;
                },
                expectToBeSent: function () {
                    var request = testRequest(ajax.recentRequest().expectPathToContain('/sup/api/v1/users/me'));

                    return addMethods({
                        receiveResponse: function () {
                            request.respondSuccessfullyWith({
                                data: user 
                            });

                            Promise.runAll();
                        }
                    });
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                },
                send: function () {
                    this.receiveResponse();
                }
            });
        };

        this.authenticatedUserRequest = this.requestMe;

        this.getUsers = function (is_in_call) {
            if (is_in_call === undefined) {
                is_in_call = true;
            }

            return [this.authenticatedUser(), {
                full_name: 'Шалева Дора',
                first_name: 'Дора',
                id: 82756,
                is_in_call: is_in_call,
                last_name: 'Шалева',
                position_id: null,
                short_phone: '8258',
                status_id: 6,
                is_sip_online: true,
                image: 'https://thispersondoesnotexist.com/image'
            }, {
                first_name: 'Николина',
                id: 583783,
                is_in_call: false,
                last_name: 'Господинова',
                full_name: 'Господинова Николина',
                position_id: null,
                short_phone: '295',
                status_id: 1,
                is_sip_online: true
            }, {
                full_name: 'Божилова Йовка',
                first_name: 'Йовка',
                id: 79582,
                is_in_call: false,
                last_name: 'Божилова',
                position_id: null,
                short_phone: '296',
                status_id: 2,
                is_sip_online: true,
                color: '#00aaea'
            }];
        };

        const triggerScrollRecalculation = () => {
            Array.prototype.slice.call(document.querySelectorAll('.simplebar-content'), 0).
                forEach(domElement => {
                    triggerMutation(domElement, {
                        childList: true,
                        subtree: true
                    }, []);
                });

            addSecond();
        };
        
        this.triggerScrollRecalculation = triggerScrollRecalculation;

        this.requestUsers = function () {
            var params = {
                with_active_phones: undefined
            };

            var additionalUsers = [];

            var respond = function (request) {
                request.respondSuccessfullyWith({
                    data: me.getUsers().concat(additionalUsers)
                });
            };

            function addResponseModifiers (me) {
                me.accessTokenExpired = () => {
                    respond = request => request.respondUnauthorizedWith({
                        error: {
                            code: 401,
                            message: 'Token has been expired',
                            mnemonic: 'expired_token',
                            is_smart: false
                        }
                    });

                    return me;
                };

                me.addMoreUsers = me.addMore = function () {
                    var i;

                    for (i = 0; i < 100; i ++) {
                        additionalUsers.push({
                            first_name: 'Иван',
                            id: 583784 + i,
                            is_in_call: false,
                            last_name: 'Иванов',
                            position_id: null,
                            short_phone: '123',
                            status_id: 6
                        });
                    }

                    return me;
                };

                return me;
            }

            return addResponseModifiers({
                setHavingActivePhones: function () {
                    params.with_active_phones = '1';
                    return this;
                },
                expectToBeSent: function (requests) {
                    var request = (requests ? requests.someRequest() : ajax.recentRequest()).
                        expectPathToContain('/sup/api/v1/users').
                        expectQueryToContain(params);

                    return addResponseModifiers({
                        receiveError: function () {
                            request.respondUnsuccessfullyWith('500 Internal Server Error Server got itself in trouble');
                            Promise.runAll();
                        },
                        receiveResponse: function () {
                            respond(request);

                            Promise.runAll(false, true);
                            triggerScrollRecalculation();
                        }
                    });
                },
                send: function () {
                    this.expectToBeSent().receiveResponse();
                }
            });
        };

        this.usersRequest = function () {
            var request = me.requestUsers();

            return {
                accessTokenExpired: function () {
                    request.accessTokenExpired();
                    return this;
                },
                addMore: function () {
                    request.addMoreUsers();
                    return this;
                },
                expectToBeSent: function (requests) {
                    return request.expectToBeSent(requests);
                },
                receiveResponse: function () {
                    return request.send();
                }
            };
        };

        this.requestUsersInGroups = function () {
            var additionalUsersInGroups = [];

            var respond = request =>  request.respondSuccessfullyWith({
                data: [{
                    employee_id: 20816,
                    group_id: 89203,
                    id: 293032
                }, {
                    employee_id: 82756,
                    group_id: 89203,
                    id: 293033
                }, {
                    employee_id: 82756,
                    group_id: 82958,
                    id: 293034
                }, {
                    employee_id: 583783,
                    group_id: 82958,
                    id: 293035
                }, {
                    employee_id: 79582,
                    group_id: 17589,
                    id: 293036
                }].concat(additionalUsersInGroups)
            });

            function addResponseModifiers (me) {
                me.accessTokenExpired = () => {
                    respond = request => request.respondUnauthorizedWith({
                        error: {
                            code: 401,
                            message: 'Token has been expired',
                            mnemonic: 'expired_token',
                            is_smart: false
                        }
                    });

                    return me;
                };

                me.addMore = function () {
                    var i;

                    for (i = 0; i < 100; i ++) {
                        additionalUsersInGroups.push({
                            id: 293037 + i,
                            employee_id: 20816,
                            group_id: 89204 + i
                        });
                    }

                    return me;
                };

                return me;
            }

            return addResponseModifiers({
                expectToBeSent: function () {
                    var request = ajax.recentRequest().expectPathToContain('/sup/api/v1/users_in_groups');

                    return addResponseModifiers({
                        receiveResponse: function () {
                            respond(request);
                            Promise.runAll();
                        }
                    });
                },
                receiveResponse: function () {
                    this.send();
                },
                send: function () {
                    this.expectToBeSent().receiveResponse();
                }
            });
        };

        this.usersInGroupsRequest = this.requestUsersInGroups;

        this.requestGroups = function () {
            var additionalGroups = [];

            var respond = request => request.respondSuccessfullyWith({
                data: [{
                    id: 89203,
                    name: 'Отдел дистрибуции',
                    short_phone: '298'
                }, {
                    id: 82958,
                    name: 'Отдел региональных продаж',
                    short_phone: '828'
                }, {
                    id: 17589,
                    name: 'Отдел по работе с ключевыми клиентами',
                    short_phone: '726'
                }].concat(additionalGroups)
            });

            function addResponseModifiers (me) {
                me.accessTokenExpired = function () {
                    respond = request => request.respondUnauthorizedWith({
                        error: {
                            code: 401,
                            message: 'Token has been expired',
                            mnemonic: 'expired_token',
                            is_smart: false
                        }
                    });

                    return me;
                };

                return me;
            }

            return addResponseModifiers({
                addMore: function () {
                    var i;

                    for (i = 0; i < 100; i ++) {
                        additionalGroups.push({
                            id: 89204 + i,
                            name: 'Отдел № ' + (i + 1),
                            short_phone: 100 + i
                        });
                    }

                    return this;
                },
                receiveResponse: function () {
                    this.send();
                },
                expectToBeSent: function () {
                    var request = ajax.recentRequest().expectPathToContain('/sup/api/v1/groups');

                    return addResponseModifiers({
                        receiveResponse: function () {
                            respond(request);
                            Promise.runAll();
                        }
                    });
                },
                send: function () {
                    this.expectToBeSent().receiveResponse();
                }
            });
        };

        this.groupsRequest = function () {
            var request = this.requestGroups();

            return {
                accessTokenExpired: function () {
                    request.accessTokenExpired();
                    return this;
                },
                addMore: function () {
                    request.addMore();
                    return this;
                },
                expectToBeSent: function () {
                    return request.expectToBeSent();
                },
                receiveResponse: function () {
                    return request.send();
                }
            };
        };

        this.getTalkOptions = function (transferOption) {
            return [{
                button: transferOption,
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
            }];
        };

        this.requestTalkOptions = function () {
            var button = '#',
                me = this;

            function addMethods (me) {
                me.setTransferButtonIsNotHash = function () {
                    button = '*';
                    return me;
                };

                return me;
            }

            return addMethods({
                expectToBeSent: function () {
                    var request = ajax.recentRequest();

                    return addMethods({
                        receiveResponse: function () {
                            request.expectPathToContain('/sup/api/v1/talk_options').
                                respondSuccessfullyWith({
                                    data: me.getTalkOptions(button) 
                                });

                            Promise.runAll();
                        }
                    });
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                },
                send: function () {
                    this.receiveResponse();
                }
            });
        };

        this.talkOptionsRequest = this.requestTalkOptions;

        this.requestNumberCapacity = function () {
            var data = [{
                id: 124823,
                numb: '79161238927'
            }, {
                id: 124824,
                numb: '74950216806'
            }, {
                id: 124825,
                numb: '79161238929',
                comment: 'Некий номер'
            }, {
                id: 124826,
                numb: '79161238930'
            }, {
                id: 124827,
                numb: '79161238931'
            }, {
                id: 124828,
                numb: '79161238932'
            }, {
                id: 124829,
                numb: '79161238933'
            }, {
                id: 124830,
                numb: '79162594727',
                comment: 'Другой номер'
            }, {
                id: 124831,
                numb: '79161238935',
                comment: 'Еще один номер'
            }, {
                id: 124832,
                numb: '79161238936'
            }, {
                id: 124833,
                numb: '79161238937'
            }, {
                id: 124834,
                numb: '79161238938'
            }];

            function addMethods (me) {
                me.setOnlyOneNumber = function () {
                    data = [{
                        id: 124824,
                        numb: '74950216806'
                    }];

                    return me;
                };

                me.onlyOneNumber = me.setOnlyOneNumber;

                me.withoutFourthNumber = function () {
                    data.splice(3, 1);
                    return me;
                };

                me.withoutThirdNumber = function () {
                    data.splice(2, 1);
                    return me;
                };

                return me;
            }

            return addMethods({
                expectToBeSent: function () {
                    var request = ajax.recentRequest().
                        expectPathToContain('/sup/api/v1/number_capacity/077368');

                    return addMethods({
                        receiveResponse: function () {
                            request.respondSuccessfullyWith({
                                data: data 
                            });

                            Promise.runAll();
                        }
                    });
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                },
                send: function () {
                    this.receiveResponse();
                }
            });
        };

        this.numberCapacityRequest = this.requestNumberCapacity;

        this.requestPermissions = function () {
            var data = {
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
                },
                sip_line_number_capacity: {
                    is_delete: false,
                    is_insert: false,
                    is_select: false,
                    is_update: false
                },
                softphone_login: {
                    is_delete: false,
                    is_insert: false,
                    is_select: true,
                    is_update: false
                }
            };

            var me = {
                disallowSoftphoneLogin: function () {
                    data.softphone_login.is_select = false;
                    return this;
                },
                allowNumberCapacitySelect: function () {
                    data.sip_line_number_capacity.is_select = true;
                    return this;
                },
                allowNumberCapacityUpdate: function () {
                    data.sip_line_number_capacity.is_update = true;
                    return this;
                },
                receiveChangeEvent: function () {
                    eventsWebSocket.receiveMessage({
                        name: 'permissions_changed',
                        type: 'event',
                        params: {
                            data: data
                        } 
                    });
                },
                expectToBeSent: function () {
                    var request = ajax.recentRequest().expectPathToContain('/sup/api/v1/permissions/me');

                    var requestSender = {
                        receiveResponse: function () {
                            request.respondSuccessfullyWith({
                                data: data 
                            });

                            Promise.runAll();
                        }
                    };

                    Object.entries(me).forEach(function (entry) {
                        var key = entry[0],
                            value = entry[1];

                        if (!['expectToBeSent', 'receiveResponse', 'send'].includes(key)) {
                            requestSender[key] = function () {
                                me[key].apply(me, arguments);
                                return requestSender;
                            };
                        }
                    });

                    return requestSender;
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                },
                send: function () {
                    this.receiveResponse();
                }
            };

            return me;
        };

        this.permissionsRequest = function () {
            return this.requestPermissions();
        };

        this.requestFinishReasons = function () {
            return {
                expectToBeSent: function (requests) {
                    var request = (requests ? requests.someRequest() : ajax.recentRequest()).
                        expectPathToContain('/sup/api/v1/finish_reasons');

                    return {
                        receiveResponse: function () {
                            request.respondSuccessfullyWith({
                                data: [{
                                    id: 'numb_not_exists',
                                    name: 'Виртуальный номер не найден'
                                }]
                            });

                            Promise.runAll(false, true);
                        }
                    };
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                },
                send: function () {
                    this.receiveResponse();
                }
            };
        };

        this.finishReasonsRequest = this.requestFinishReasons;

        this.requestPhoneBookGroups = function () {
            return {
                expectToBeSent: function (requests) {
                    var request = (requests ? requests.someRequest() : ajax.recentRequest()).
                        expectPathToContain('/sup/api/v1/phone_book/groups');

                    return {
                        receiveResponse: function () {
                            request.respondSuccessfullyWith({
                                data: [{
                                    id: 48706,
                                    name: 'Отдел маркетинга'
                                }]
                            });

                            Promise.runAll(false, true);
                        }
                    };
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                },
                send: function () {
                    this.receiveResponse();
                }
            };
        };

        this.phoneBookGroupsRequest = this.requestPhoneBookGroups;

        var webSocketRegExp = /sup\/ws\/XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0$/;

        this.anotherEventWebSocketPath = () => {
            webSocketRegExp = /sup\/ws\/935jhw5klatxx2582jh5zrlq38hglq43o9jlrg8j3lqj8jf$/;
        };

        this.getEventsWebSocket = function (index) {
            return this.eventsWebSocket = eventsWebSocket =
                webSockets.getSocket(webSocketRegExp, index || 0);
        };

        this.connectEventsWebSocket = function (index) {
            this.getEventsWebSocket(index).connect();
        };

        this.expectBrowserIdToHaveKnownValue = function (browser_id) {
            browser_id = browser_id ? (browser_id + '') : '';

            if (browser_id != 'a51f1a00-4e1b-4cc9-bf42-defbcd66d772') {
                throw new Error('Идентификатор браузера должен иметь значение ' +
                    '"a51f1a00-4e1b-4cc9-bf42-defbcd66d772", а не "' + browser_id + '"');
            }
        };

        this.expectBrowserIdNotToBeEmpty = function (browser_id) {
            browser_id = browser_id ? (browser_id + '') : '';

            if (!/^[a-zA-Z0-9\-]+$/.test(browser_id)) {
                throw new Error('Некорректный идентификатор браузера "' + browser_id + '".');
            }
        };

        this.disconnectEventsWebSocket = function (index) {
            webSockets.getSocket(/sup\/ws\/XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0$/, index || 0).disconnect();
        };

        function getWebRtcSocket (index) {
            index = index || 0;
            ret = updateWebRtcUrlForGettingSocket(index);
            return webSockets.getSocket(ret.webRtcUrlForGettingSocket, ret.index);
        }

        this.getWebRtcSocket = getWebRtcSocket;

        this.changeSipWebSocket = function (index) {
            var webrtcWebsocket = this.webrtcWebsocket = getWebRtcSocket(index);
            this.sip = sip = new Sip(webrtcWebsocket);
            return webrtcWebsocket;
        };

        this.failToConnectSIPWebSocket = function () {
            getWebRtcSocket(0).disconnect();
        };

        this.connectSIPWebSocket = function (index) {
            this.changeSipWebSocket(index).connect();
        };

        this.expectSIPWebSocketNotToBeCreated = function () {
            webSockets.expectNoWebSocketToBeCreatedWithURL(webRtcUrlForGettingSocket);
        };

        this.expectNoWebsocketConnecting = function () {
            var exceptions = [];
            webSockets.expectWasConnected(exceptions);
            exceptions.forEach(function (exception) {
                throw exception;
            });
        };

        this.connectWebSockets = function () {
            this.connectEventsWebSocket();
            this.tabStateChangeMessage().receive();
            this.connectSIPWebSocket();
        };

        function JanusIdGetter () {
            var ids = {
                default: {
                    master_id: 282753063,
                    session_id: 235259514066078,
                    master: {
                        master_id: undefined,
                        handle_id: 468199568725824
                    },
                    helper:{
                        master_id: 282753063,
                        handle_id: 568199568725824
                    },
                    anotherHelper:{
                        master_id: 282753063,
                        handle_id: 925868298348924
                    }
                },
                another: {
                    master_id: 862850243,
                    session_id: 502856892825924,
                    master: {
                        master_id: undefined,
                        handle_id: 692958289235835
                    },
                    helper:{
                        master_id: 862850243,
                        handle_id: 932856829587925
                    },
                    anotherHelper:{
                        master_id: 862850243,
                        handle_id: 383920838392834
                    }
                },
                third: {
                    master_id: 672045833,
                    session_id: 295828596382924,
                    master: {
                        master_id: undefined,
                        handle_id: 154065838501832
                    },
                    helper:{
                        master_id: 672045833,
                        handle_id: 927862722068215
                    },
                    anotherHelper:{
                        master_id: 672045833,
                        handle_id: 568285031085534
                    }
                }
            };

            var session = 'default',
                type = 'master';

            return {
                getMasterIdForRequest: function () {
                    return ids[session][type].master_id;
                },
                getMasterId: function () {
                    return ids[session].master_id;
                },
                getHandleId: function () {
                    return ids[session][type].handle_id;
                },
                getSessionId: function () {
                    return ids[session].session_id;
                },
                addSessionId: function (message) {
                    message.session_id = this.getSessionId();
                    return message;
                },
                addSessionIdAndHandleId: function (message) {
                    message.session_id = this.getSessionId();
                    message.handle_id = this.getHandleId();
                    return message;
                },
                addSessionIdAndSender: function (message) {
                    message.session_id = this.getSessionId();
                    message.sender = this.getHandleId();
                    return message;
                },
                setHelper: function () {
                    type = 'helper';
                },
                setAnotherHelper: function () {
                    type = 'anotherHelper';
                },
                setAnotherSession: function () {
                    session = 'another';
                },
                setThirdSession: function () {
                    session = 'third';
                }
            };
        };

        function JanusRequest () {
            var index = 0;

            return {
                setAnotherSession: function () {
                    index = 1;
                    return this;
                },
                setThirdSession: function () {
                    index = 2;
                    return this;
                },
                expectToBeSent: function (expectedMessage) {
                    var message = rawMessage = getWebRtcSocket(index).popRecentlySentMessage();

                    try {
                        message = JSON.parse(message);
                    } catch (e) {
                        throw new Error('Не удалось разобрать сообщение "' + message + '"');
                    }

                    utils.expectObjectToContain(message, expectedMessage);

                    var transaction = message.transaction;

                    if (!/^[a-zA-Z0-9]+$/.test(transaction)) {
                        throw new Error(
                            'Сообщение должно содержать идентификатор транзакции, тогда как было отправлено ' +
                            'сообщение ' + "\n\n" + rawMessage
                        );
                    }

                    return {
                        getActualMessage: function () {
                            return message;
                        },
                        receiveError: function () {
                            this.receiveResponse({
                                janus: 'error',
                                error: {
                                    code: 123,
                                    reason: 'Some error occured'
                                }
                            });
                        },
                        receiveResponse: function (message) {
                            message.transaction = transaction;
                            me.webrtcWebsocket.receiveMessage(message);
                        }
                    };
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                }
            };
        }
        
        this.janusTransactionCreationRequest = function () {
            var idGetter = new JanusIdGetter(),
                janusRequest = new JanusRequest();

            return {
                setAnotherSession: function () {
                    janusRequest.setAnotherSession();
                    idGetter.setAnotherSession();
                    return this;
                },
                setThirdSession: function () {
                    janusRequest.setThirdSession();
                    idGetter.setThirdSession();
                    return this;
                },
                expectToBeSent: function () {
                    var request = janusRequest.expectToBeSent({
                        janus: 'create'
                    });

                    return {
                        receiveError: function () {
                            request.receiveError();
                        },
                        receiveResponse: function () {
                            request.receiveResponse({
                                janus: 'success',
                                data: {
                                    id: idGetter.getSessionId() 
                                }
                            });
                        }
                    };
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                }
            };
        };
        
        this.janusDestroyRequest = function () {
            return {
                expectToBeSent: function () {
                    var request = JanusRequest().expectToBeSent({
                        janus: 'destroy',
                        session_id: 235259514066078
                    });

                    return {
                        receiveResponse: function () {
                            request.receiveResponse({
                                janus: 'success',
                                session_id: 235259514066078
                            });
                        }
                    };
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                }
            };
        };

        this.janusDtmfInfoRequest = function () {
            var digit = '#';

            return {
                setDigit: function (value) {
                    digit = value;
                    return this;
                },
                expectToBeSent: function () {
                    var request = JanusRequest().expectToBeSent({
                        janus: 'message',
                        body: {
                            request: 'dtmf_info',
                            digit
                        },
                        session_id: 235259514066078,
                        handle_id: 468199568725824
                    });

                    return {
                        receiveResponse: function () {
                            request.receiveResponse({
                                janus: 'ack',
                                session_id: 235259514066078
                            });
                        }
                    };
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                }
            };
        };

        this.janusKeepAliveRequest = function () {
            var idGetter = new JanusIdGetter(),
                janusRequest = new JanusRequest();

            return {
                setAnotherSession: function () {
                    idGetter.setAnotherSession();
                    janusRequest.setAnotherSession();
                    return this;
                },
                setThirdSession: function () {
                    janusRequest.setThirdSession();
                    idGetter.setThirdSession();
                    return this;
                },
                expectToBeSent: function () {
                    var request = janusRequest.expectToBeSent(idGetter.addSessionId({
                        janus: 'keepalive'
                    }));

                    return {
                        receiveResponse: function () {
                            request.receiveResponse(idGetter.addSessionId({
                                janus: 'ack'
                            }));
                        }
                    };
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                }
            };
        };

        this.janusCallRequest = function () {
            var idGetter = new JanusIdGetter(),
                janusRequest = new JanusRequest();

            var message = {
                janus: 'message',
                body: {
                    request: 'call',
                    uri: 'sip:79161234567@voip.uiscom.ru'
                },
                jsep: {
                    type: 'offer',
                    sdp: me.getPCMA8000sdp()
                }
            };

            return {
                setAnotherSession: function () {
                    janusRequest.setAnotherSession();
                    idGetter.setAnotherSession();
                    return this;
                },
                setThirdSession: function () {
                    janusRequest.setThirdSession();
                    idGetter.setThirdSession();
                    return this;
                },
                setHelper: function () {
                    idGetter.setHelper();
                    return this;
                },
                setAnotherNumber: function () {
                    message.body.uri = 'sip:79161234569@voip.uiscom.ru';
                    return this;
                },
                setSecondNumber: function () {
                    message.body.uri = 'sip:79161234570@voip.uiscom.ru';
                    return this;
                },
                setThirdNumber: function () {
                    message.body.uri = 'sip:74950230626@voip.uiscom.ru';
                    return this;
                },
                setNumberFromCallsGrid: function () {
                    message.body.uri = 'sip:74950230625@voip.uiscom.ru';
                    return this;
                },
                expectToBeSent: function () {
                    var request = janusRequest.expectToBeSent(idGetter.addSessionIdAndHandleId(message)),
                        call_id = request.getActualMessage().body.call_id;

                    if (!/^[0-9a-zA-Z]{23}$/.test(call_id)) {
                        throw new Error('Call-ID "' + call_id+ '" не соответствут ожиданиям.');
                    }

                    return {
                        receiveError: function () {
                            request.receiveError();
                        },
                        receiveResponse: function () {
                            request.receiveResponse(idGetter.addSessionId({
                                janus: 'ack'
                            }));

                            request.receiveResponse(idGetter.addSessionIdAndSender({
                                janus: 'event',
                                plugindata: {
                                    plugin: 'janus.plugin.sip',
                                    data: {
                                        sip: 'event',
                                        result: {
                                            event: 'calling'
                                        },
                                        call_id: call_id
                                    }
                               }
                            }));

                            request.receiveResponse(idGetter.addSessionIdAndSender({
                                janus: 'event',
                                plugindata: {
                                   plugin: 'janus.plugin.sip',
                                   data: {
                                       sip: 'event',
                                       result: {
                                           event: 'progress',
                                           username: 'sip:79161234567@voip.uiscom.ru'
                                       },
                                       call_id: call_id
                                   }
                                },
                                jsep: {
                                   type: 'answer',
                                   sdp: me.getPCMA8000sdp()
                                }
                            }));

                            return {
                                receiveRinging: function () {
                                    request.receiveResponse(idGetter.addSessionIdAndSender({
                                        janus: 'event',
                                        plugindata: {
                                            plugin: 'janus.plugin.sip',
                                            data: {
                                                sip: 'event',
                                                result: {
                                                    event: 'ringing'
                                                },
                                                call_id: call_id
                                            }
                                        }
                                    }));
                                },
                                receive183: function () {
                                    request.receiveResponse(idGetter.addSessionIdAndSender({
                                        janus: 'event',
                                        plugindata: {
                                            plugin: 'janus.plugin.sip',
                                            data: {
                                                sip: 'event',
                                                result: {
                                                    event: 'proceeding',
                                                    code: 183
                                                },
                                                call_id: call_id
                                            }
                                        }
                                    }));
                                },
                                receive180: function () {
                                    request.receiveResponse(idGetter.addSessionIdAndSender({
                                        janus: 'event',
                                        plugindata: {
                                            plugin: 'janus.plugin.sip',
                                            data: {
                                                sip: 'event',
                                                result: {
                                                    event: 'proceeding',
                                                    code: 180
                                                },
                                                call_id: call_id
                                            }
                                        }
                                    }));
                                },
                                receiveBusy: function () {
                                    request.receiveResponse(idGetter.addSessionIdAndSender({
                                        janus: 'event',
                                        plugindata: {
                                            plugin: 'janus.plugin.sip',
                                            data: {
                                                sip: 'event',
                                                result: {
                                                    event: 'hangup',
                                                    code: 486,
                                                    reason: 'Busy Here'
                                                },
                                                call_id: call_id
                                            }
                                        }
                                    }));
                                },
                                receiveAccepted: function () {
                                    request.receiveResponse(idGetter.addSessionIdAndSender({
                                        janus: 'event',
                                        plugindata: {
                                            plugin: 'janus.plugin.sip',
                                            data: {
                                                sip: 'event',
                                                result: {
                                                    event: 'accepted',
                                                    username: 'sip:79161234567@voip.uiscom.ru'
                                                },
                                                call_id: call_id
                                            }
                                        }
                                    }));
                                }
                            };
                        }
                    };
                },
                receiveResponse: function () {
                    return this.expectToBeSent().receiveResponse();
                }
            };
        };

        this.janusDeclineRequest = function () {
            var message = {
                janus: 'message',
                body: {
                    request: 'decline',
                    code: 480
                },
                session_id: 235259514066078,
                handle_id: 468199568725824
            };

            return {
                setBusy: function () {
                    message.body.code = 486;
                    return this;
                },
                setHelper: function () {
                    message.handle_id = 568199568725824;
                    return this;
                },
                expectToBeSent: function () {
                    var request = JanusRequest().expectToBeSent(message);

                    return {
                        receiveResponse: function () {
                            request.receiveResponse({
                                janus: 'success',
                                data: {
                                    janus: 'ack',
                                    session_id: 235259514066078
                                }
                            });
                        }
                    };
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                }
            };
        };

        this.janusHangupRequest = function () {
            var janusRequest = new JanusRequest(),
                idGetter = new JanusIdGetter();

            var message = {
                janus: 'message',
                body: {
                    request: 'hangup'
                }
            };
        
            return {
                setAnotherSession: function () {
                    idGetter.setAnotherSession();
                    janusRequest.setAnotherSession();
                    return this;
                },
                setThirdSession: function () {
                    janusRequest.setThirdSession();
                    idGetter.setThirdSession();
                    return this;
                },
                setHelper: function () {
                    idGetter.setHelper();
                    return this;
                },
                expectToBeSent: function () {
                    var request = janusRequest.expectToBeSent(idGetter.addSessionIdAndHandleId(message));

                    return {
                        receiveResponse: function () {
                            request.receiveResponse(idGetter.addSessionId({
                                janus: 'success',
                                data: {
                                    janus: 'ack'
                                }
                            }));

                            return {
                                receiveBye: function () {
                                    request.receiveResponse(idGetter.addSessionIdAndSender({
                                        janus: 'event',
                                        plugindata: {
                                            plugin: 'janus.plugin.sip',
                                            data: {
                                                sip: 'event',
                                                result: {
                                                    event: 'hangup',
                                                    code: 200,
                                                    reason: 'to BYE'
                                                },
                                                call_id: '020EF693933699728BA6AA9043C45775'
                                            }
                                        }
                                    }));
                                },
                                receiveRequestTerminated: function () {
                                    request.receiveResponse(idGetter.addSessionIdAndSender({
                                        janus: 'event',
                                        plugindata: {
                                            plugin: 'janus.plugin.sip',
                                            data: {
                                                sip: 'event',
                                                result: {
                                                    event: 'hangup',
                                                    code: 487,
                                                    reason: 'Request Terminated'
                                                },
                                                call_id: '020EF693933699728BA6AA9043C45775'
                                            }
                                        }
                                    }));
                                }
                            };
                        }
                    };
                },
                receiveResponse: function () {
                    return this.expectToBeSent().receiveResponse();
                }
            };
        };

        this.janusTerminatedRequestMessage = function () {
            return {
                receive: function () {
                    me.webrtcWebsocket.receiveMessage({
                        janus: 'event',
                        sender: 468199568725824,
                        session_id: 235259514066078,
                        plugindata: {
                            plugin: 'janus.plugin.sip',
                            data: {
                                sip: 'event',
                                result: {
                                    event: 'hangup',
                                    code: 487,
                                    reason: 'Request Terminated'
                                },
                                call_id: '020EF693933699728BA6AA9043C45775'
                            }
                        }
                    });
                }
            };
        };
        
        this.janusByeMessage = function () {
            var index = 0,
                idGetter = new JanusIdGetter();

            return {
                setAnotherSession: function () {
                    index = 1;
                    idGetter.setAnotherSession();
                    return this;
                },
                setThirdSession: function () {
                    index = 2;
                    idGetter.setThirdSession();
                    return this;
                },
                receive: function () {
                    getWebRtcSocket(index).receiveMessage(idGetter.addSessionIdAndSender({
                        janus: 'event',
                        plugindata: {
                            plugin: 'janus.plugin.sip',
                            data: {
                                sip: 'event',
                                result: {
                                    event: 'hangup',
                                    code: 200,
                                    reason: 'Session Terminated',
                                    reason_header: 'BYE received'
                                },
                                call_id: '020EF693933699728BA6AA9043C45775'
                            }
                        }
                    }));
                }
            };
        };

        this.janusHangupMessage = function () {
            var index = 0,
                idGetter = new JanusIdGetter();

            return {
                setAnotherSession: function () {
                    idGetter.setAnotherSession();
                    index = 1;
                    return this;
                },
                setThirdSession: function () {
                    index = 2;
                    idGetter.setThirdSession();
                    return this;
                },
                setHelper: function () {
                    idGetter.setHelper();
                    return this;
                },
                receive: function () {
                    getWebRtcSocket(index).receiveMessage(idGetter.addSessionIdAndSender({
                        janus: 'hangup',
                        reason: 'Close PC'
                    }));
                }
            };
        };

        this.janusAcceptRequest = function () {
            var idGetter = new JanusIdGetter();

            return {
                setHelper: function () {
                    idGetter.setHelper();
                    return this;
                },
                expectToBeSent: function () {
                    var request = JanusRequest().expectToBeSent(idGetter.addSessionIdAndHandleId({
                        janus: 'message',
                        body: {
                            request: 'accept'
                        },
                        jsep: {
                            type: 'answer',
                            sdp: me.getPCMA8000sdp()
                        }
                    }));

                    data = {
                        sip: 'event',
                        result: {
                           event: 'accepted'
                        },
                        call_id: '020EF693933699728BA6AA9043C45775'
                    };

                    return {
                        setWrongCallId: function () {
                            data.call_id = '59BF4FD044323D7D3298A3B2E4FB35A6';
                            return this;
                        },
                        receiveResponse: function () {
                            request.receiveResponse(idGetter.addSessionId({
                                janus: 'ack'
                            }));

                            request.receiveResponse(idGetter.addSessionIdAndSender({
                               janus: 'event',
                               plugindata: {
                                   plugin: 'janus.plugin.sip',
                                   data: data 
                               }
                            }));
                        }
                    };
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                }
            };
        };

        this.janusIncomingCallMessage = function () {
            var phone = '';

            var message = {
                janus: 'event',
                sender: 468199568725824,
                session_id: 235259514066078,
                plugindata: {
                    plugin: 'janus.plugin.sip',
                    data: {
                       sip: 'event',
                       result: {
                          event: 'incomingcall',
                          username: 'sip:79161234567@132.121.82.37:5060;user=phone',
                          displayname: '',
                          callee: 'sip:077368@132.121.82.37:5060;user=phone'
                       },
                       call_id: '020EF693933699728BA6AA9043C45775'
                    }
                },
                jsep: {
                   type: 'offer',
                   sdp: me.getPCMA8000sdp()
                }
            };

            return {
                setAnotherCallId: function () {
                    message.plugindata.data.call_id = '2824JO2S42GJ4GO8GJSLL2G8SLE92486';
                    return this;
                },
                setAnotherNumber: function () {
                    message.plugindata.data.result.username = 'sip:79161234569@132.121.82.37:5060;user=phone';
                    message.plugindata.data.call_id = '59BF4FD044323D7D3298A3B2E4FB35A6';
                    message.sender = 568199568725824;
                    return this;
                },
                receive: function () {
                    me.webrtcWebsocket.receiveMessage(message);
                }
            };
        };

        this.janusRegisteredMessage = function () {
            var idGetter = new JanusIdGetter(),
                index = 0;

            var message = {
                janus: 'event',
                plugindata: {
                   plugin: 'janus.plugin.sip',
                   data: {
                      sip: 'event',
                      result: {
                         event: 'registered',
                         username: '077368',
                         register_sent: true
                      }
                   }
                }
            };

            return {
                setFailed: function () {
                    message.plugindata.data.result = {
                        event: 'registration_failed',
                        code: 403,
                        reason: 'Forbidden'
                     };

                    return this;
                },
                setAnotherUser: function () {
                    message.plugindata.data.result.username = '077369';
                    return this;
                },
                setAnotherSession: function () {
                    idGetter.setAnotherSession();
                    index = 1;
                    return this;
                },
                setThirdSession: function () {
                    index = 2;
                    idGetter.setThirdSession();
                    return this;
                },
                setHelper: function () {
                    idGetter.setHelper();
                    return this;
                },
                setAnotherHelper: function () {
                    idGetter.setAnotherHelper();
                    return this;
                },
                receive: function () {
                    message.plugindata.data.result.master_id = idGetter.getMasterId();
                    getWebRtcSocket(index).receiveMessage(idGetter.addSessionIdAndSender(message));
                }
            };
        };

        this.janusRegisterRequest = function () {
            var idGetter = new JanusIdGetter(),
                janusRequest = new JanusRequest();

            var message ={
                janus: 'message',
                body: {
                    request: 'register',
                    username: 'sip:077368@voip.uiscom.ru',
                    secret: 'e2tcXhxbfr',
                    proxy: 'sip:voip.uiscom.ru',
                    type: undefined
                }
            };

            return {
                setAnotherUser: function () {
                    message.body.username = 'sip:077369@voip.uiscom.ru';
                    message.body.secret = 'e2g98jgbfr';
                    return this;
                },
                setAnotherSession: function () {
                    idGetter.setAnotherSession();
                    janusRequest.setAnotherSession();
                    return this;
                },
                setThirdSession: function () {
                    janusRequest.setThirdSession();
                    idGetter.setThirdSession();
                    return this;
                },
                setHelper: function () {
                    message.body.type = 'helper';
                    idGetter.setHelper();
                    return this;
                },
                setAnotherHelper: function () {
                    message.body.type = 'helper';
                    idGetter.setAnotherHelper();
                    return this;
                },
                expectToBeSent: function () {
                    message.body.master_id = idGetter.getMasterIdForRequest();
                    var request = janusRequest.expectToBeSent(idGetter.addSessionIdAndHandleId(message));

                    return {
                        receiveError: function () {
                            request.receiveError();
                        },
                        receiveResponse: function () {
                            request.receiveResponse(idGetter.addSessionIdAndHandleId({
                                janus: 'ack'
                            }));

                            request.receiveResponse(idGetter.addSessionIdAndSender({
                                plugindata: {
                                    plugin: 'janus.plugin.sip',
                                    data: {
                                        result: {
                                            event: 'registering'
                                        },
                                        sip: 'event'
                                    }
                                },
                                janus: 'event'
                            }));
                        }
                    };
                },
                receiveError: function () {
                    this.expectToBeSent().receiveError();
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                }
            };
        };

        this.janusPluginAttachRequest = function () {
            var message = {
                janus:'attach',
                plugin:'janus.plugin.sip'
            };

            var idGetter = new JanusIdGetter(),
                janusRequest = new JanusRequest();

            return {
                setCallCenter: function () {
                    message.opaque_id = utils.expectToHavePrefix('janus-softphone-');
                    return this;
                },
                setAmoCRM: function () {
                    message.opaque_id = utils.expectToHavePrefix('janus-amocrm-widget-');
                    return this;
                },
                setAnotherSession: function () {
                    idGetter.setAnotherSession();
                    janusRequest.setAnotherSession();
                    return this;
                },
                setThirdSession: function () {
                    janusRequest.setThirdSession();
                    idGetter.setThirdSession();
                    return this;
                },
                expectToBeSent: function () {
                    var request = janusRequest.expectToBeSent(idGetter.addSessionId(message));

                    return {
                        setHelper: function () {
                            idGetter.setHelper();
                            return this;
                        },
                        setAnotherHelper: function () {
                            idGetter.setAnotherHelper();
                            return this;
                        },
                        receiveError: function () {
                            request.receiveError();
                        },
                        receiveResponse: function () {
                            request.receiveResponse({
                                janus: 'success',
                                data: {
                                    id: idGetter.getHandleId()
                                }
                            });
                        }
                    };
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                }
            };
        };

        this.allowMediaInput = function () {
            var localMediaStream = userMedia.allowMediaInput();

            Promise.runAll();
            return localMediaStream;
        };

        this.disallowMediaInput = function () {
            userMedia.disallowMediaInput();
            Promise.runAll();
        };

        this.requestRegistration = function () {
            var expires = '60',
                sip_login = '077368',
                sip_host = 'voip.uiscom.ru',
                doSomething = function () {};
                
            var checkAuthorization = function (request) {
                return request.expectToHaveHeader('Authorization');
            };

            var checkRegistration = function (request) {
                return request;
            };

            return {
                expired: function () {
                    return this.setUnregister();
                },
                setUnregister: function () {
                    expires = '0';
                    return this;
                },
                cancelTwoIncomingCalls: function () {
                    this.setUnregister();

                    doSomething = function () {
                        sip.recentResponse().expectTemporarilyUnavailable();
                        sip.recentResponse().expectTemporarilyUnavailable();
                    };

                    return this;
                },
                finishCall: function () {
                    this.setUnregister();

                    doSomething = function () {
                        sip.recentRequest().expectToHaveMethod('BYE').response().send();
                    };

                    return this;
                },
                cancelIncomingCall: function () {
                    this.setUnregister();

                    doSomething = function () {
                        sip.recentResponse().expectTemporarilyUnavailable();
                    };

                    return this;
                },
                setAnotherSipLogin: function () {
                    sip_login = '093820';
                    return this;
                },
                setRTU: function () {
                    sip_host = 'pp-rtu.uis.st:443';
                    sip_login = '076909%24ROOT';

                    checkAuthorization = function (request) {
                        return request.expectHeaderToContain(
                            'Authorization',
                            'Digest algorithm=MD5, username="Kf98Bzv3", realm="pp-rtu.uis.st"' 
                        );
                    };

                    checkRegistration = function (request) {
                        return request.expectHeaderToContain(
                            'Contact',
                            '<sip:076909%24ROOT@pp-rtu.uis.st:443;transport=ws>;'
                        );
                    };

                    return this;
                },
                receiveForbidden: function () {
                    this.expectToBeSent().receiveForbidden();
                },
                send: function () {
                    this.receiveResponse();
                },
                expectToBeSent: function () {
                    checkRegistration(
                        sip.recentRequest().
                            expectToHaveMethod('REGISTER').
                            expectToHaveServerName('sip:' + sip_host).
                            expectHeaderToContain('From', '<sip:' + sip_login + '@' + sip_host + '>').
                            expectHeaderToContain('To', '<sip:' + sip_login + '@' + sip_host + '>').
                            expectHeaderToHaveValue('Expires', 'Expires: ' + expires)
                    ).
                        response().
                        setUnauthorized().
                        addHeader('WWW-Authenticate: Digest realm="{server_name}", nonce="{to_tag}"').
                        send();

                    var recentRequest = checkAuthorization(sip.recentRequest().expectToHaveMethod('REGISTER'));

                    return {
                        receiveForbidden: function () {
                            recentRequest.
                                response().
                                setForbidden().
                                send();
                        },
                        receiveResponse: function () {
                            doSomething();

                            recentRequest.
                                response().
                                copyHeader('Contact').
                                send();
                        }
                    };
                },
                receiveResponse: function () {
                    return this.expectToBeSent().receiveResponse();
                },
                receiveForbidden: function () {
                    return this.expectToBeSent().receiveForbidden();
                }
            };
        };

        this.phoneField = testersFactory.createTextFieldTester('.cmg-input');

        this.registrationRequest = this.requestRegistration;

        this.expectToneSevenToPlay = function () {
            playingOscillatorsTester.expectFrequenciesToPlay(852, 1209);
        };

        this.expectNoToneToPlay = function () {
            playingOscillatorsTester.expectNoFrequenciesToPlay();
        };

        this.dtmf = function (signal) {
            var phone = '79161234567';

            var recentRequest = function () {
                return sip.recentRequest().
                    expectToHaveServerName('sip:' + phone + '@132.121.82.37:5060;user=phone').
                    expectHeaderToContain('To', '<sip:' + phone + '@132.121.82.37:5060;user=phone>');
            };

            return {
                setAnotherNumber: function () {
                    phone = '79161234569';
                    return this;
                },
                setOutgoing: function () {
                    recentRequest = function () {
                        return sip.recentRequest().
                            expectHeaderToContain('To', '<sip:' + phone + '@voip.uiscom.ru>');
                    };

                    return this;
                },
                expectToBeSent: function () {
                    this.send();
                },
                send: function () {
                    recentRequest().
                        expectToHaveMethod('INFO').
                        expectHeaderToContain('From', '<sip:077368@voip.uiscom.ru>').
                        expectToHaveBody(
                            'Signal=' + signal,
                            'Duration=100'
                        ).
                        response().
                        setOk();
                }
            };
        };

        this.outCallNumber = function () {
            return {};
        };

        this.outboundCall = function () {
            var phoneNumber = '79161234567',
                sip_login = '077368',
                me = this,
                checkBody = function () {};

            var checkStarting = function (request) {
                return request.
                    expectBodyToHaveSubstringsConsideringOrder('8 9 111', 'PCMA', 'opus').
                    expectBodyNotToHaveSubstring('103');
            };

            var result = {
                dontSortCodecs: function () {
                    checkStarting = function (request) {
                        return request.expectBodyToHaveSubstringsConsideringOrder('103', 'opus', 'PCMA');
                    };

                    return this;
                },
                intercept: function () {
                    phoneNumber = '88';
                    return this;
                },
                setNumberWith8AtBegining: function () {
                    phoneNumber = '89161234567';
                    return this;
                },
                setAnotherSipLogin: function () {
                    sip_login = '093820';
                    return this;
                },
                setNumberFromEmployeesGrid: function () {
                    phoneNumber = '295';
                    return this;
                },
                setNumberFromCallsGrid: function () {
                    phoneNumber = '74950230625';
                    return this;
                },
                setAnotherNumber: function () {
                    phoneNumber = '79161234569';
                    return this;
                },
                expectInviteMessageBodyToEqual: function (expectedBody) {
                    checkBody = function (request) {
                        request.expectToHaveBody(expectedBody);
                    };
                    
                    return this;
                },
                start: function () {
                    function checkFromAndToHeaders (request) {
                        request.
                            expectHeaderToContain('From', '<sip:' + sip_login + '@voip.uiscom.ru>').
                            expectHeaderToContain('To', '<sip:' + phoneNumber + '@voip.uiscom.ru>');
                    }

                    var request = checkStarting(sip.recentRequest().
                        expectToHaveMethod('INVITE').
                        expectToHaveServerName('sip:' + phoneNumber + '@voip.uiscom.ru'));

                    checkBody(request);
                    checkFromAndToHeaders(request);

                    var response = request.response().
                        setTrying().
                        copyHeader('Contact');

                    response.send();
                    
                    return {
                        setSessionProgress: function () {
                            request.response().
                                setToTag(response.getToTag()).
                                setSessionProgress().
                                copyHeader('Contact').
                                setBody('v=0').
                                send();

                            return this;
                        },
                        setRinging: function () {
                            request.response().
                                setToTag(response.getToTag()).
                                setRinging().
                                copyHeader('Contact').
                                send();

                            return this;
                        },
                        receiveBusy: function () {
                            request.response().
                                setToTag(response.getToTag()).
                                setBusy().
                                copyHeader('Contact').
                                send();

                            checkFromAndToHeaders(sip.recentRequest().expectToHaveMethod('ACK'));
                        },
                        setAccepted: function () {
                            request.response().
                                setToTag(response.getToTag()).
                                copyHeader('Contact').
                                setBody('v=0').
                                send();

                            Promise.runAll();

                            checkFromAndToHeaders(sip.recentRequest().expectToHaveMethod('ACK'));

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

                            return {
                                receiveBye: function () {
                                    response.request().
                                        setServerName('voip.uiscom.ru').
                                        setMethod('BYE').
                                        receive();

                                    sip.recentResponse().expectOk();
                                }
                            };
                        }
                    };
                }
            };

            (function () {
                var methodName,
                    outCallNumber = me.outCallNumber();

                for (methodName in outCallNumber) {
                    result[methodName] = function () {
                        phoneNumber = outCallNumber[methodName]();
                        return result;
                    };
                }
            })();

            return result;
        };

        this.incomingCall = function () {
            var phone = '79161234567';

            var expectSomeStatus = function (response) {
                response.expectRinging();
            };

            return {
                setBusy: function () {
                    expectSomeStatus = function (response) {
                        response.expectBusy();
                    };

                    return this;
                },
                setThirdNumber: function () {
                    phone = '79161234510';
                    return this;
                },
                setAnotherNumber: function () {
                    phone = '79161234569';
                    return this;
                },
                anotherNumber: function () {
                    return this.setAnotherNumber();
                },
                thirdNumber: function () {
                    return this.setThirdNumber();
                },
                setShortNumber: function () {
                    phone = '79161';
                    return this;
                },
                receive: function () {
                    sip.request().
                        setServerName('voip.uiscom.ru').
                        setMethod('INVITE').
                        setCallReceiverLogin('077368').
                        setSdpType().
                        addHeader('From: <sip:' + phone + '@132.121.82.37:5060;user=phone>').
                        addHeader('Contact: <sip:' + phone + '@132.121.82.37:5060;user=phone>').
                        setBody([
                            'v=0',
                            'o=- 1638965704 1638965704 IN IP4 195.211.122.90',
                            's=-',
                            'c=IN IP4 195.211.122.90',
                            't=0 0',
                            'm=audio 14766 UDP/TLS/RTP/SAVP 8 0 3 100',
                            'a=rtpmap:8 PCMA/8000',
                            'a=rtpmap:0 PCMU/8000',
                            'a=rtpmap:3 gsm/8000',
                            'a=rtpmap:100 telephone-event/8000',
                            'a=fmtp:100 0-15',
                            'a=fingerprint:SHA-256 EE:58:77:15:B2:19:86:C9:77:FC:DB:BB:9F:10:CA:84:7C:C9:E2:AE:12:2C:B7:70:2D:F0:14:7C:3A:DB:5E:93',
                            'a=setup:actpass',
                            'a=ice-ufrag:dlbqce4u',
                            'a=ice-pwd:ivtw78mzrtw9kce6rojog0',
                            'a=candidate:1 1 UDP 2130706431 195.211.122.90 14766 typ host',
                            'a=rtcp-mux',
                            'a=sendrecv',
                            'a=silenceSupp:off - - - -'
                        ].join("\r\n")).
                        receive();
                    
                    sip.recentResponse().expectTrying();
                    var response = sip.recentResponse();

                    expectSomeStatus(response);
                    Promise.runAll(false, true);

                    return {
                        expectTemporarilyUnavailableToBeSent: function () {
                            me.requestDeclineIncomingCall();
                        },
                        receiveCancel: function () {
                            this.cancel();
                        },
                        receiveBye: function () {
                            this.finish();
                        },
                        cancel: function () {
                            response.request().
                                setServerName('voip.uiscom.ru').
                                setMethod('CANCEL').
                                receive();

                            sip.recentResponse().expectOk();
                            sip.recentResponse().expectRequestTerminated();
                        },
                        finish: function () {
                            response.request().
                                setServerName('voip.uiscom.ru').
                                setMethod('BYE').
                                receive();

                            sip.recentResponse().expectOk();
                        }
                    };
                }
            };
        };
        
        this.extendIncomingCallProceeding = function (params, message) {
            return message;
        };

        this.extendOutCallSession = function (params, message) {
            return message;
        };
        

        this.callSessionFinish = function () {
            var call_session_id = 980925456;

            return {
                setAnotherId: function () {
                    call_session_id = 182957828;
                    return this;
                },
                receive: function () {
                    eventsWebSocket.receiveMessage({
                        id: 314723705,
                        name: 'call_session_finished',
                        type: 'event',
                        params: {
                            call_session_id: call_session_id
                        }
                    });
                }
            };
        };

        function outgoingCallOnOtherTab () {
            return {
                type: 'notify_master',
                data: {
                    action: 'outbound_call',
                    phone: '79161234567'
                }
            };
        }

        function acceptCallOnOtherTab () {
            return {
                type: 'notify_master',
                data: {
                    action: 'accept_call',
                    sip_line: '1'
                }
            };
        }

        function sessionTerminationOnOtherTab () {
            return {
                type: 'notify_master',
                data: {
                    action: 'terminate_session',
                    sip_line: '1'
                }
            };
        }

        this.requestSlavesNotifiaction = function () {
            eventsWebSocket.expectSentMessageToContain({
                type: 'notify_slaves',
                data: {
                    type: 'state_updating'
                }
            });
        };

        function getSession (state) {
            return Object.values(state.data.state.sessions.idToSession)[0];
        }

        this.requestFirstSipLineSlavesNotification = function () {
            eventsWebSocket.expectSentMessageToContain({
                type: 'notify_slaves',
                data: {
                    type: 'state_updating',
                    state: {
                        sessions: {
                            currentSipLine: '1'
                        },
                        softphone: {
                            currentSipLine: '1'
                        }
                    }
                }
            });
        };

        this.requestSecondSipLineSlavesNotification = function () {
            eventsWebSocket.expectSentMessageToContain({
                type: 'notify_slaves',
                data: {
                    type: 'state_updating',
                    state: {
                        sessions: {
                            currentSipLine: '2'
                        },
                        softphone: {
                            currentSipLine: '2'
                        }
                    }
                }
            });
        };

        this.requestIncomingProgressSlavesNotification = function () {
            var state = JSON.parse(eventsWebSocket.popRecentlySentMessage());

            utils.expectObjectToContain(state, {
                type: 'notify_slaves',
                data: {
                    type: 'state_updating',
                    state: {
                        softphone: {
                            currentSipLine: '1',
                            numberValue: {
                                1: '79161234567',
                                2: ''
                            }
                        }
                    }
                }
            });

            utils.expectObjectToContain(getSession(state), {
                state: '1',
                isIncoming: true,
                phone: '79161234567'
            });
        };

        this.dtmfSlavesNotification = function () {
            var dtmf = '';

            return {
                setValue: function (value) {
                    dtmf = value;
                    return this;
                },
                send: function () {
                    var state = JSON.parse(eventsWebSocket.popRecentlySentMessage());

                    utils.expectObjectToContain(state, {
                        type: 'notify_slaves',
                        data: {
                            type: 'state_updating'
                        }
                    });

                    utils.expectObjectToContain(getSession(state), {
                        dtmf: dtmf
                    });
                }
            };
        };

        this.outgoingProgressSlavesNotification = function () {
            var number = '79161234567';

            return {
                setYetAnotherNumber: function () {
                    number = '74999951240';
                    return this;
                },
                setAnotherNumber: function () {
                    number = '79161234569';
                    return this;
                },
                send: function () {
                    var state = JSON.parse(eventsWebSocket.popRecentlySentMessage());

                    utils.expectObjectToContain(state, {
                        type: 'notify_slaves',
                        data: {
                            type: 'state_updating',
                            state: {
                                softphone: {
                                    currentSipLine: '1',
                                    numberValue: {
                                        1: number,
                                        2: ''
                                    }
                                }
                            }
                        }
                    });

                    utils.expectObjectToContain(getSession(state), {
                        state: '1',
                        isIncoming: false,
                        phone: number
                    });
                }
            };
        };

        this.requestOutgoingProgressSlavesNotification = function () {
            this.outgoingProgressSlavesNotification().send();
        };

        this.requestMuteSlavesNotification = function () {
            var state = JSON.parse(eventsWebSocket.popRecentlySentMessage());

            utils.expectObjectToContain(state, {
                type: 'notify_slaves',
                data: {
                    type: 'state_updating'
                }
            });

            utils.expectObjectToContain(getSession(state), {
                isMuted: true
            });
        };

        this.requestHoldSlavesNotification = function () {
            this.holdSlavesNotification().expectToBeSent();
        };

        this.holdSlavesNotification = function () {
            var index = 0;

            return {
                setAnotherSession: function () {
                    index = 1;
                    return this;
                },
                expectToBeSent: function () {
                    var state = JSON.parse(eventsWebSocket.popRecentlySentMessage());

                    utils.expectObjectToContain(state, {
                        type: 'notify_slaves',
                        data: {
                            type: 'state_updating'
                        }
                    });

                    utils.expectObjectToContain(Object.values(state.data.state.sessions.idToSession)[index], {
                        isHolded: true
                    });
                }
            };
        };

        this.requestNotHoldSlavesNotification = function () {
            var state = JSON.parse(eventsWebSocket.popRecentlySentMessage());

            utils.expectObjectToContain(state, {
                type: 'notify_slaves',
                data: {
                    type: 'state_updating'
                }
            });

            utils.expectObjectToContain(getSession(state), {
                isHolded: false
            });
        };

        this.nameSlavesNotification = function () {
            var names = {
                79161234567: 'Шалева Дора'
            };

            return {
                setAnotherNumber: function () {
                    names = {
                        79161234569: 'Гигова Петранка'
                    };

                    return this;
                },
                setYetAnotherNumber: function () {
                    names = {
                        74999951240: 'Стаматова Костадинка'
                    };

                    return this;
                },
                send: function () {

                    eventsWebSocket.expectSentMessageToContain({
                        type: 'notify_slaves',
                        data: {
                            type: 'state_updating',
                            state: {
                                softphone: {
                                    names: names 
                                }
                            }
                        }
                    });
                }
            };
        };

        this.requestNameSlavesNotification = function () {
            return this.nameSlavesNotification().send();
        };

        this.requestTransferSlavesNotification = function () {
            eventsWebSocket.expectSentMessageToContain({
                type: 'notify_slaves',
                data: {
                    type: 'state_updating',
                    state: {
                        sessions: {
                            transfered: {
                                '1': true
                            }
                        }
                    }
                }
            });
        };

        this.requestNotTransferSlavesNotification = function () {
            eventsWebSocket.expectSentMessageToContain({
                type: 'notify_slaves',
                data: {
                    type: 'state_updating',
                    state: {
                        sessions: {
                            transfered: {
                                '1': false
                            }
                        }
                    }
                }
            });
        };

        function getNoSessionsSlavesNotification () {
            return {
                type: 'notify_slaves',
                data: {
                    type: 'state_updating',
                    state: {
                        sessions: {
                            currentSipLine: '1',
                            idToSession: utils.expectEmptyObject(),
                            sipLineToId: utils.expectEmptyObject()
                        },
                        softphone: {
                            webrtcConnected: true,
                            accessToMicrophoneIsGranted: true,
                            names: utils.expectEmptyObject()
                        }
                    }
                }
            };
        }

        this.receiveNoSipConnectionState = function () {
            eventsWebSocket.receiveMessage({
                type: 'notify_slaves',
                data: {
                    type: 'state_updating',
                    state: {
                        sessions: {
                            currentSipLine: '1',
                            idToSession: {},
                            sipLineToId: {}
                        },
                        softphone: {
                            webrtcConnected: false,
                            names: {}
                        }
                    }
                }
            });
        };

        this.requestNoSessionsSlavesNotification = function () {
            eventsWebSocket.expectSentMessageToContain(getNoSessionsSlavesNotification());
        };

        this.receiveNoSessionsSlavesNotification = function () {
            eventsWebSocket.receiveMessage(getNoSessionsSlavesNotification());
        };

        this.requestConfirmSlavesNotification = function () {
            utils.expectObjectToContain(getSession(JSON.parse(eventsWebSocket.popRecentlySentMessage())), {
                state: '2'
            });
        };

        function newCallSlavesNotification () {
            return {
                type: 'notify_slaves',
                data: {
                    type: 'new_call'
                }
            };
        }

        this.requestNewCallSlavesNotification = function () {
            eventsWebSocket.expectSentMessageToContain(newCallSlavesNotification());
        };

        this.receiveNewCallSlavesNotification = function () {
            eventsWebSocket.receiveMessage(newCallSlavesNotification());
        };

        function slavesNotification () {
            function getState () {
                return {
                    sessions: {
                        transfered: {},
                        currentSipLine: '1',
                        sipLineToId: {
                            '1': '2tq6eiavgbtcqt9vhl48jabod2q371'
                        },
                        idToSession: {
                            '2tq6eiavgbtcqt9vhl48jabod2q371': {
                                state: '1',
                                callStartTime: 0,
                                callTime: 0,
                                isHolded: false,
                                isIncoming: false,
                                isMuted: false,
                                phone: '79161234567',
                                sipLine: '1',
                                isExisting: true,
                                dtmf: ''
                            }
                        }
                    },
                    softphone: {
                        webrtcConnected: true,
                        accessToMicrophoneIsGranted: true,
                        currentSipLine: '1',
                        names: {},
                        numberValue: {
                            1: '79161234567',
                            2: ''
                        }
                    }
                };
            }

            var state = getState(),
                stateExpectation = getState();

            return {
                setNoSessions: function () {
                    state.sessions.idToSession = {};
                    state.sessions.sipLineToId = {};

                    stateExpectation.sessions.idToSession = utils.expectEmptyObject();
                    stateExpectation.sessions.sipLineToId = utils.expectEmptyObject();

                    state.softphone.numberValue = stateExpectation.softphone.numberValue = {
                        1: '',
                        2: ''
                    };

                    return this;
                },
                setAccessToMicrophoneIsDenied: function () {
                    state.softphone.accessToMicrophoneIsGranted = false;
                    stateExpectation.softphone.accessToMicrophoneIsGranted = false;
                    return this;
                },
                setDtmf: function (value) {
                    state.sessions.idToSession['2tq6eiavgbtcqt9vhl48jabod2q371'].dtmf = value;
                    return this;
                },
                setMuted: function () {
                    state.sessions.idToSession['2tq6eiavgbtcqt9vhl48jabod2q371'].isMuted = true;
                    return this;
                },
                setTransfered: function () {
                    state.sessions.transfered = {
                        '1': true
                    };

                    return this;
                },
                setHolded: function () {
                    state.sessions.idToSession['2tq6eiavgbtcqt9vhl48jabod2q371'].isHolded = true;
                    return this;
                },
                setIncoming: function () {
                    state.sessions.idToSession['2tq6eiavgbtcqt9vhl48jabod2q371'].isIncoming = true;
                    return this;
                },
                setConfirmed: function () {
                    state.sessions.idToSession['2tq6eiavgbtcqt9vhl48jabod2q371'].state = '2';
                    state.sessions.idToSession['2tq6eiavgbtcqt9vhl48jabod2q371'].callStartTime = 1577869804000;
                    return this;
                },
                setIncomingCallOnSecondLine: function () {
                    state.sessions.sipLineToId['2'] = '82gldglij4gw0jl24gjosgj824glij';

                    state.sessions.idToSession['82gldglij4gw0jl24gjosgj824glij'] = {
                        state: '1',
                        callStartTime: 0,
                        callTime: 0,
                        isHolded: false,
                        isIncoming: true,
                        isMuted: false,
                        phone: '79161234569',
                        sipLine: '2',
                        isExisting: true
                    };

                    state.softphone.numberValue['2'] = '79161234569';

                    return this;
                },
                setNames: function () {
                    state.softphone.names = {
                        79161234567: 'Шалева Дора'
                    };

                    return this;
                },
                expectToBeSent: function () {
                    eventsWebSocket.expectSentMessageToContain({
                        type: 'notify_slaves',
                        data: {
                            type: 'state_updating',
                            state: stateExpectation 
                        }
                    });
                },
                receive: function () {
                    eventsWebSocket.receiveMessage({
                        type: 'notify_slaves',
                        data: {
                            type: 'state_updating',
                            state: state 
                        }
                    });
                }
            };
        }

        this.receiveNoSessionsSlavesNotification = function () {
            slavesNotification().setNoSessions().receive();
        };

        this.receiveMuteSlavesNotification = function () {
            slavesNotification().setNames().setConfirmed().setIncoming().setMuted().receive();
        };

        this.receiveHoldSlavesNotification = function () {
            slavesNotification().setNames().setConfirmed().setIncoming().setHolded().receive();
        };

        this.receiveTransferSlavesNotification = function () {
            slavesNotification().setNames().setConfirmed().setIncoming().setTransfered().receive();
        };
        
        this.receiveOutgoingProgressSlavesNotification = function () {
            slavesNotification().receive();
        };

        this.receiveNameSlavesNotification = function () {
            slavesNotification().setNames().receive();
        };

        this.receiveOutgoingConrfirmSlavesNotification = function () {
            slavesNotification().setNames().setConfirmed().receive();
        };

        this.receiveIncomingCallOnSecondLineSlavesNotification = function () {
            slavesNotification().setNames().setConfirmed().setIncomingCallOnSecondLine().receive();
        };

        this.receiveIncomingProgressSlavesNotification = function () {
            slavesNotification().setIncoming().receive();
        };

        this.receiveIncomingNameSlavesNotification = function () {
            slavesNotification().setIncoming().setNames().receive();
        };

        this.receiveIncomingConrfirmSlavesNotification = function () {
            slavesNotification().setIncoming().setNames().setConfirmed().receive();
        };

        this.slavesNotification = slavesNotification;

        this.requestOutgoingCallOnOtherTab = function () {
            eventsWebSocket.expectSentMessageToContain(outgoingCallOnOtherTab());
        };

        this.requestCallToHistoryItemOnOtherTab = function () {
            eventsWebSocket.expectSentMessageToContain({
                type: 'notify_master',
                data: {
                    action: 'outbound_call',
                    phone: '74950230625'
                }
            });
        };

        this.requestCallToAddressBookItemOnOtherTab = function () {
            eventsWebSocket.expectSentMessageToContain({
                type: 'notify_master',
                data: {
                    action: 'outbound_call',
                    phone: '295'
                }
            });
        };
            
        this.requestSessionTerminationOnOtherTab = function () {
            eventsWebSocket.expectSentMessageToContain(sessionTerminationOnOtherTab());
        };

        this.requestSecondSessionTerminationOnOtherTab = function () {
            eventsWebSocket.expectSentMessageToContain({
                type: 'notify_master',
                data: {
                    action: 'terminate_session',
                    sip_line: 2
                }
            });
        };

        this.receiveSessionTerminationOnOtherTab = function () {
            eventsWebSocket.receiveMessage(sessionTerminationOnOtherTab());
        };

        this.requestAcceptCallOnOtherTab = function () {
            eventsWebSocket.expectSentMessageToContain(acceptCallOnOtherTab());
        };

        this.requestAcceptSecondLineCallOnOtherTab = function () {
            eventsWebSocket.expectSentMessageToContain({
                type: 'notify_master',
                data: {
                    action: 'accept_call',
                    sip_line: 2
                }
            });
        };

        this.receiveAcceptCallOnOtherTab = function () {
            eventsWebSocket.receiveMessage(acceptCallOnOtherTab());
        };

        this.receiveOutgoingCallOnOtherTab = function () {
            eventsWebSocket.receiveMessage(outgoingCallOnOtherTab());
        };

        this.outgoingCallOnOtherTab = function () {
            var message = {
                type: 'notify_master',
                data: {
                    action: 'outbound_call',
                    phone: '79161234567'
                }
            };

            return {
                setAnotherNumber: function () {
                    message.data.phone = '79161234569';
                    return this;
                },
                receive: function () {
                    eventsWebSocket.receiveMessage(message);
                },
                send: function () {
                    eventsWebSocket.expectSentMessageToContain(message);
                }
            };
        };

        this.dtmfRequest = function () {
            var signal;

            return {
                setSignal: function (value) {
                    signal = value;
                    return this;
                },
                expectToBeSent: function () {
                    eventsWebSocket.expectSentMessageToContain({
                        type: 'notify_master',
                        data: {
                            action: 'send_dtmf',
                            session_id: '2tq6eiavgbtcqt9vhl48jabod2q371',
                            signal: signal
                        }
                    });
                }
            };
        };

        this.requestSendDtmfOnOtherTab = function () {
            eventsWebSocket.expectSentMessageToContain({
                type: 'notify_master',
                data: {
                    action: 'send_dtmf',
                    session_id: '2tq6eiavgbtcqt9vhl48jabod2q371',
                    signal: '#295'
                }
            });
        };

        this.receiveSendDtmfOnOtherTab = function () {
            eventsWebSocket.receiveMessage({
                type: 'notify_master',
                data: {
                    action: 'send_dtmf',
                    session_id: sip.lastSessionId(),
                    signal: '#295'
                }
            });
        };

        this.requestToggleHoldOnOtherTab = function () {
            eventsWebSocket.expectSentMessageToContain({
                type: 'notify_master',
                data: {
                    action: 'toggle_hold',
                    session_id: '2tq6eiavgbtcqt9vhl48jabod2q371'
                }
            });
        };

        this.receiveToggleHoldOnOtherTab = function () {
            eventsWebSocket.receiveMessage({
                type: 'notify_master',
                data: {
                    action: 'toggle_hold',
                    session_id: sip.lastSessionId(),
                }
            });
        };

        this.requestToggleMuteOnOtherTab = function () {
            eventsWebSocket.expectSentMessageToContain({
                type: 'notify_master',
                data: {
                    action: 'toggle_mute',
                    session_id: '2tq6eiavgbtcqt9vhl48jabod2q371'
                }
            });
        };

        this.receiveToggleMuteOnOtherTab = function () {
            eventsWebSocket.receiveMessage({
                type: 'notify_master',
                data: {
                    action: 'toggle_mute',
                    session_id: sip.lastSessionId(),
                }
            });
        };

        this.requestSetSipLineOnOtherTab = function () {
            eventsWebSocket.expectSentMessageToContain({
                type: 'notify_master',
                data: {
                    action: 'set_sip_line',
                    session_id: '82gldglij4gw0jl24gjosgj824glij',
                    sip_line: null
                }
            });
        };

        this.receiveSetSipLineOnOtherTab = function () {
            eventsWebSocket.receiveMessage({
                type: 'notify_master',
                data: {
                    action: 'set_sip_line',
                    session_id: sip.lastSessionId(),
                    sip_line: null
                }
            });
        };

        this.requestSetEmptySipLineOnOtherTab = function () {
            eventsWebSocket.expectSentMessageToContain({
                type: 'notify_master',
                data: {
                    action: 'set_sip_line',
                    session_id: null,
                    sip_line: 2
                }
            });
        };

        this.receiveSetEmptySipLineOnOtherTab = function () {
            eventsWebSocket.receiveMessage({
                type: 'notify_master',
                data: {
                    action: 'set_sip_line',
                    session_id: null,
                    sip_line: 2
                }
            });
        };

        this.requestAcceptIncomingCall = function () {
            sip.recentResponse().
                expectOk().
                request().
                setServerName('voip.uiscom.ru').
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
            this.connect = function () {
                getConnection().connect();
            };
            this.connectWebRTC = function () {
                this.connect();
                Promise.runAll(false, true);
            };
            this.addCandidate = function () {
                getConnection().addCandidate();
                Promise.runAll(false, true);
            };
            this.expectSinkIdToEqual = function (expectedValue) {
                return getConnection().expectRemoteSinkIdToEqual(expectedValue);
            };
            this.expectRemoteStreamToHaveVolume = function (expectedValue) {
                return getConnection().expectRemoteStreamToHaveVolume(expectedValue);
            };
            this.expectRemoteStreamToPlay = function () {
                mediaStreamsTester.expectTrackToPlay(getConnection().getRemoteAudioTrack());
            };
            this.expectToBeMute = function () {
                getConnection().expectToBeMute();
            };
            this.expectNotToBeMute = function () {
                getConnection().expectNotToBeMute();
            };
            this.callTrackHandler = function () {
                getConnection().callTrackHandler();
            };
            this.assumeTrackHandlerMayBeUnexecuted = function () {
                getConnection().assumeTrackHandlerMayBeUnexecuted();
            };
            this.expectNoUnexecutedTrackHandler = function () {
                getConnection().expectNoUnexecutedTrackHandler();
            };
            this.expectInputDeviceNotToBeSpecified = function () {
                getConnection().expectInputDeviceNotToBeSpecified();
            };
            this.expectInputDeviceIdToEqual = function (expectedValue) {
                getConnection().expectInputDeviceIdToEqual(expectedValue);
            };
            this.expectToHaveIceServer = function (expectedIceServer) {
                getConnection().expectToHaveIceServer(expectedIceServer);
            };
            this.expectToPlayTrack = function (expectedTrack) {
                getConnection().expectLocalTrackToBe(expectedTrack);
            };
            this.getLocalAudioTrack = function () {
                return getConnection().getLocalAudioTrack();
            };
            this.expectHoldMusicToPlay = function (customHoldMusic) {
                var track = getConnection().getLocalAudioTrack();
                decodedTracksTester.expectTrackContentToBe(track, customHoldMusic || soundSources.holdMp3);

                if (!track.enabled) {
                    throw new Error('Музыка удержания выключена.');
                }
            };
        }

        this.firstConnection = new Connection(0);
        this.secondConnection = new Connection(1);
        this.thirdConnection = new Connection(2);
        this.fourthConnection = new Connection(3);
        this.fifthConnection = new Connection(4);

        this.expectOutgoingCallSoundAndRemoteStreamToPlay = function () {
            mediaStreamsTester.createStreamsPlayingExpectation().
                addStream(soundSources.outgoingCall).
                addTrack(rtcConnectionsMock.getConnectionAtIndex(1).getRemoteAudioTrack()).
                expectStreamsToPlay();
        };

        this.expectRemoteStreamsToPlay = function () {
            mediaStreamsTester.createStreamsPlayingExpectation().
                addTrack(rtcConnectionsMock.getConnectionAtIndex(0).getRemoteAudioTrack()).
                addTrack(rtcConnectionsMock.getConnectionAtIndex(1).getRemoteAudioTrack()).
                expectStreamsToPlay();
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

        this.stopBusySignal = function () {
            mediaStreamsTester.finish(soundSources.busyCall);
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

        this.notificationOfUserStateChanging = function () {
            var id = 20816;

            var data = {
                id: id,
                status_id: 2
            };

            return {
                setOtherUser: function () {
                    id = 583783;
                    return this;
                },
                anotherStatus: function () {
                    data.status_id = 4;
                    return this;
                },
                receive: function () {
                    eventsWebSocket.receiveMessage({
                        name: 'employee_changed',
                        type: 'event',
                        params: {
                            action: 'update',
                            data: data
                        }
                    });
                }
            };
        };

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

        this.tabStateChangeMessage = function () {
            var is_master = true,
                has_master = true;

            return {
                isNotMaster: function () {
                    return this.setNotMaster();
                },
                hasNotMaster: function () {
                    return this.setHasNoMaster();
                },
                setHasNoMaster: function () {
                    has_master = false;
                    return this;
                },
                setNotMaster: function () {
                    is_master = false;
                    return this;
                },
                receive: function () {
                    eventsWebSocket.receiveMessage({
                        type: 'master_info',
                        data: {
                            is_master: is_master,
                            has_master: has_master
                        }
                    });
                }
            };
        };

        this.requestMasterState = function () {
            eventsWebSocket.expectSentMessageToContain({
                type: 'notify_master',
                data: {
                    action: 'tab_opened'
                }
            });
        };

        this.receiveMasterStateRequest = function () {
            eventsWebSocket.receiveMessage({
                type: 'notify_master',
                data: {
                    action: 'tab_opened'
                }
            });
        };

        this.microphoneAccessNotification = function () {
            var data = {
                type: 'notify_slaves',
                data: {
                    type: 'state_updating',
                    state: {
                        softphone: {
                            accessToMicrophoneIsGranted: true
                        }
                    }
                }
            };

            return {
                setAccessDenied: function () {
                    data.data.state.softphone.accessToMicrophoneIsGranted = false;
                    return this;
                },
                receive: function () {
                    eventsWebSocket.receiveMessage(data);
                },
                expectToBeSent: function () {
                    eventsWebSocket.expectSentMessageToContain(data);
                }
            };
        };

        this.sipSocketSlavesNotification = function () {
            var data = {
                type: 'notify_slaves',
                data: {
                    type: 'state_updating',
                    state: {
                        softphone: {
                            webrtcConnected: true
                        }
                    }
                }
            };

            return {
                setDisconnected: function () {
                    data.data.state.softphone.webrtcConnected = false;
                    return this;
                },
                send: function () {
                    eventsWebSocket.expectSentMessageToContain(data);
                },
                receive: function () {
                    eventsWebSocket.receiveMessage(data);
                }
            };
        };

        this.expectPingToBeSent = function () {
            eventsWebSocket.expectSentMessageToContain({
                type: 'ping',
                data: 'ping'
            });
        };

        this.receivePong = function () {
            eventsWebSocket.receiveMessage({
                type: 'ping',
                data: 'pong'
            });
        };

        this.startTryingToPingUnavailableSocket = function () {
            // 1-ая попытка
            spendTime(1000);
            Promise.runAll(false, true);
            this.expectPingToBeSent();

            // 2-ая попытка
            spendTime(1001);
            Promise.runAll(false, true);
            this.expectPingToBeSent();

            // 3-ая попытка
            spendTime(1003);
            Promise.runAll(false, true);
            this.expectPingToBeSent();

            // 4-ая попытка
            spendTime(1009);
            Promise.runAll(false, true);
            this.expectPingToBeSent();

            // 5-ая попытка
            spendTime(1026);
            Promise.runAll(false, true);
            this.expectPingToBeSent();
        };

        this.continueTryingToPingUnavailableSocket = function () {
            // 6-ая попытка
            spendTime(1073);
            Promise.runAll(false, true);
            this.expectPingToBeSent();

            // 7-ая попытка
            spendTime(1199);
            Promise.runAll(false, true);
            this.expectPingToBeSent();

            // 8-ая попытка
            spendTime(1541);
            Promise.runAll(false, true);
            this.expectPingToBeSent();

            // 9-ая попытка
            spendTime(2000);
            spendTime(471);
            Promise.runAll(false, true);
            this.expectPingToBeSent();
        };
        
        this.finishTryingToPingUnavailableSocket = function () {
            spendTime(2000);
            spendTime(1000);
            Promise.runAll(false, true);

            // 10-ая попытка
            spendTime(2000);
            this.expectPingToBeSent();
        };
        
        this.tryToPingUnavailableSocket = function () {
            this.startTryingToPingUnavailableSocket();
            this.continueTryingToPingUnavailableSocket();
            this.finishTryingToPingUnavailableSocket();
        };

        this.statusesRequest = function () {
            return {
                createExpectation: function (requests) {
                    var request = (requests ? requests.someRequest() : ajax.recentRequest()).
                        expectPathToContain('/sup/api/v1/statuses');

                    var token = 'XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0';

                    return {
                        anotherAuthorizationToken() {
                            token = '935jhw5klatxx2582jh5zrlq38hglq43o9jlrg8j3lqj8jf';
                            return this;
                        },
                        setAnotherAuthorizationToken: function () {
                            token = 'Fl298gw0e2Foiweoa4Ua-0923gLwe84we3LErwiI230';
                            return this;
                        },
                        checkCompliance: function () {
                            request.expectToHaveHeaders({
                                Authorization: 'Bearer ' + token
                            });

                            var data = [{
                                id: 1,
                                is_worktime: true,
                                mnemonic: 'available',
                                name: 'Доступен',
                                is_select_allowed: true,
                                description: 'все вызовы',
                                color: '#48b882',
                                icon: 'tick',
                                priority: 1,
                                in_external_allowed_call_directions: [
                                    'in',
                                    'out'
                                ],
                                in_internal_allowed_call_directions: [
                                    'in',
                                    'out'
                                ],
                                out_external_allowed_call_directions: [
                                    'in',
                                    'out'
                                ],
                                out_internal_allowed_call_directions: [
                                    'in',
                                    'out'
                                ],
                                allowed_phone_protocols: [
                                    'SIP'
                                ],
                            }, {
                                id: 2,
                                is_worktime: true,
                                mnemonic: 'break',
                                name: 'Перерыв',
                                is_select_allowed: true,
                                description: 'временное отключение',
                                color: '#1179ad',
                                icon: 'pause',
                                priority: 3,
                                in_external_allowed_call_directions: [],
                                in_internal_allowed_call_directions: [],
                                out_external_allowed_call_directions: [],
                                out_internal_allowed_call_directions: [],
                                allowed_phone_protocols: [
                                    'SIP'
                                ],
                            }, {
                                id: 3,
                                is_worktime: true,
                                mnemonic: 'do_not_disturb',
                                name: 'Не беспокоить',
                                is_select_allowed: true,
                                icon: 'minus',
                                description: 'только исходящие',
                                color: '#cc5d35',
                                priority: 2,
                                in_external_allowed_call_directions: [],
                                in_internal_allowed_call_directions: [],
                                out_external_allowed_call_directions: [],
                                out_internal_allowed_call_directions: []
                            }, {
                                id: 4,
                                is_worktime: true,
                                mnemonic: 'not_at_workplace',
                                name: 'Нет на месте',
                                is_select_allowed: true,
                                description: 'все вызовы на мобильном',
                                color: '#ebb03b',
                                icon: 'time',
                                priority: 4,
                                in_external_allowed_call_directions: [
                                    'in',
                                    'out'
                                ],
                                in_internal_allowed_call_directions: [
                                    'in',
                                    'out'
                                ],
                                out_external_allowed_call_directions: [
                                    'in',
                                    'out'
                                ],
                                out_internal_allowed_call_directions: [
                                    'in',
                                    'out'
                                ],
                                allowed_phone_protocols: [
                                    'SIP'
                                ]
                            }, {
                                id: 5,
                                is_worktime: false,
                                mnemonic: 'not_at_work',
                                name: 'Нет на работе',
                                is_select_allowed: true,
                                description: 'полное отключение',
                                color: '#99acb7',
                                icon: 'cross',
                                priority: 5,
                                in_external_allowed_call_directions: [],
                                in_internal_allowed_call_directions: [],
                                out_external_allowed_call_directions: [],
                                out_internal_allowed_call_directions: []
                            }, {
                                id: 6,
                                is_worktime: false,
                                mnemonic: 'unknown',
                                name: 'Неизвестно',
                                is_select_allowed: false,
                                icon: 'unknown',
                                color: null,
                                priority: 7,
                                in_external_allowed_call_directions: [
                                    'in',
                                    'out'
                                ],
                                in_internal_allowed_call_directions: [
                                    'in',
                                    'out'
                                ],
                                out_external_allowed_call_directions: [
                                    'in',
                                    'out'
                                ],
                                out_internal_allowed_call_directions: [
                                    'in',
                                    'out'
                                ],
                                allowed_phone_protocols: [
                                    'SIP'
                                ]
                            }];

                            return {
                                createResponse: function () {
                                    return {
                                        addAutoCall: function () {
                                            data.push({
                                                color: '#e03c00',
                                                icon: 'top_right_arrow',
                                                description: 'только исходящий обзвон',
                                                is_worktime: true,
                                                id: 7,
                                                mnemonic: 'auto_out_call',
                                                in_external_allowed_call_directions: [],
                                                in_internal_allowed_call_directions: [],
                                                out_external_allowed_call_directions: [
                                                    'in',
                                                    'out'
                                                ],
                                                out_internal_allowed_call_directions: [
                                                    'in',
                                                    'out'
                                                ],
                                                name: 'Исходящий обзвон',
                                                is_select_allowed: true,
                                                priority: 6
                                            });

                                            return this;
                                        },
                                        receive: function () {
                                            request.respondSuccessfullyWith({
                                                data: data 
                                            });

                                            Promise.runAll(false, true);
                                        }
                                    };
                                },
                                receiveResponse: function () {
                                    this.createResponse().receive();
                                }
                            };
                        }
                    };
                },
                expectToBeSent: function (requests) {
                    return this.createExpectation(requests).checkCompliance();
                },
                createResponse: function () {
                    return this.expectToBeSent().createResponse();
                },
                receiveResponse: function () {
                    this.createResponse().receive();
                }
            };
        };

        function widgetStateUpdate (socketMethod, testerMethod) {
            var params = testerMethod == 'receive' ? {
                application_version: '1.3.2',
                ice_servers: [{
                    urls: 'stun:stun.uiscom.ru:19302'
                }, {
                    urls: ['stun:stun.uiscom.ru:19303', 'stun:stun.uiscom.ru:19304']
                }],
                sip_channels_count: 2,
                sip_host: 'voip.uiscom.ru',
                sip_login: '077368',
                sip_password: 'e2tcXhxbfr',
                webrtc_url: webRtcUrlForGettingSocket,
                ws_url: '/ws/L1G1MyQy6uz624BkJWuy1BW1L9INRWNt5_DW8Ik836A',
                is_extended_integration_available: true,
                is_use_widget_for_calls: false,
                call_task: {
                    pause_between_calls_duration: 60,
                    call_card_show_duration: 10
                }
            } : {
                is_use_widget_for_calls: false
            };

            var result = {
                setOnlyOneSipChannelAvailable: function () {
                    params.sip_channels_count = 1;
                    return this;
                },
                setAnotherSipCredentials: function () {
                    params.sip_login = '093820';
                    params.sip_password = 'Fx223sxBfr';
                    return this;
                },
                setOnline: function () {
                    params.is_use_widget_for_calls = true;
                    return this;
                }
            };

            result[testerMethod] = function () {
                eventsWebSocket[socketMethod]({
                    type: 'notify_others',
                    data: {
                        type: 'update_widget_state',
                        params: params
                    }
                });
            };

            return result;
        };

        me.requestUpdateWidgetState = function () {
            return widgetStateUpdate('expectSentMessageToContain', 'send');
        };

        me.receiveUpdateWidgetState = function () {
            return widgetStateUpdate('receiveMessage', 'receive');
        };

        this.requestUpdateUserState = function () {
            var response = {
                data: true
            };

            var respond = function (request) {
                request.respondSuccessfullyWith(response);
            };

            function addResponseModifiers (me) {
                me.accessTokenExpired = function () {
                    response = {
                        error: {
                            code: 401,
                            message: 'Token has been expired',
                            mnemonic: 'expired_token',
                            is_smart: false
                        }
                    };

                    respond = function (request) {
                        request.respondUnsuccessfullyWith(response);
                    };

                    return me;
                };

                return me;
            }

            return addResponseModifiers({
                expectToBeSent: function () {
                    const request = ajax.recentRequest().
                        expectPathToContain('sup/api/v1/users/me').
                        expectToHaveMethod('PATCH').
                        expectBodyToContain({
                            status: 4
                        });

                    return addResponseModifiers({
                        send: function () {
                            this.receiveResponse();
                        },
                        receiveResponse: function () {
                            respond(request);
                            Promise.runAll();
                        }
                    });
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                }
            });
        };

        this.userStateUpdateRequest = this.requestUpdateUserState;

        this.secondRingtone = 'Eq8ZAtHhtF';
        this.thirdRingtone = 'I2g0wh2htF';
        this.customHoldMusic = 'UklGRjIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA==';

        this.ringtoneRequest = function () {
            var response = me.secondRingtone,
                number = '2';

            function addMethods (me) {
                me.setModified = function () {
                    response = response + 'q';
                    return me;
                };

                return me;
            }

            return addMethods({
                third: function () {
                    response = me.thirdRingtone;
                    number = '3';
                    return this;
                },
                expectToBeSent: function () {
                    var request = ajax.recentRequest().
                        expectToHavePath('https://somehost.com/softphone_ringtone' + number + '.mp3').
                        expectToHaveMethod('GET');

                    return addMethods({
                        receiveResponse: function () {
                            request.respondSuccessfullyWith(response);
                            Promise.runAll();
                        }
                    });
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                }
            });
        };

        this.customHoldMusicRequest = function () {
            return {
                expectToBeSent: function () {
                    var request = ajax.recentRequest().
                        expectToHavePath('https://somehost.com/hold_music.mp3').
                        expectToHaveMethod('GET');

                    return {
                        receiveResponse: function () {
                            request.respondSuccessfullyWith(me.customHoldMusic);
                            Promise.runAll();
                        }
                    };
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                }
            };
        };

        this.createActiveLeadsSetter = function (params, callback) {
            return function () {
                params.is_final = true;

                params.active_leads = [{
                    url: 'https://comagicwidgets.amocrm.ru/leads/detail/3003649',
                    name: 'По звонку на 79154394339',
                    status: 'Открыт',
                    pipeline: 'Переговоры'
                }, {
                    url: 'https://comagicwidgets.amocrm.ru/leads/detail/3003651',
                    name: 'По звонку с 79154394340',
                    status: 'Закрыт',
                    pipeline: 'Согласование договора'
                }, {
                    url: 'https://comagicwidgets.amocrm.ru/leads/detail/3003650',
                    name: 'По звонку с 79154394339',
                    status: 'Открыт',
                    pipeline: 'Согласование договора'
                }, {
                    url: 'https://comagicwidgets.amocrm.ru/leads/detail/3003652',
                    name: 'По звонку с 79154394339',
                    status: 'Открыт',
                    pipeline: 'Согласование договора'
                }];

                (function () {
                    var i;

                    for (i = 0; i < 20; i ++) {
                        params.active_leads.push({
                            url: 'https://comagicwidgets.amocrm.ru/leads/detail/' + 3003653 + i,
                            name: 'По звонку с 79154394339',
                            status: 'Открыт',
                            pipeline: 'Согласование договора'
                        });
                    }
                })();

                callback && callback();
                return this;
            };
        };

        var extendSlavesNotification = function (notification) {
            return notification;
        };

        this.extendSlavesNotification = function (extentor) {
            extendSlavesNotification = extentor;
        };

        var extendAdditionalSlavesNotification = function (notification) {
            return notification;
        };

        this.extendAdditionalSlavesNotification = function (extentor) {
            extendAdditionalSlavesNotification = extentor;
        };

        this.slavesNotification = function () {
            var channel = '1';

            var sessionIds = {
                1: '2P47TE0zlcmeOyswJ9yIBGQ468199568725824',
                2: 'XAjXcNpBemN3ppGZiBUJGq8468199568725824'
            };

            var state = {
                holded: undefined,
                muted: false,
                direction: 'outgoing',
                state: 'idle',
                phoneNumber: '',
                disabled: false,
                channelsCount: 1,
                currentChannel: 1,
                destroyed: false,
                microphoneAccessGranted: false,
                lastChannelChange:  {
                    previousChannelNumber: null,
                    newChannel: {
                        sessionId: null,
                        state: null,
                        direction: null
                    }
                },
                webRTCServerConnected: false,
                registered: false,
                channels: {
                    1: {
                        endedNormally: null,
                        holded: undefined,
                        holdButtonPressed: false,
                        muted: false,
                        direction: 'outgoing',
                        state: 'idle',
                        phoneNumber: ''
                    },
                    2: {
                        endedNormally: null,
                        holded: undefined,
                        holdButtonPressed: false,
                        muted: false,
                        direction: 'outgoing',
                        state: 'idle',
                        phoneNumber: ''
                    }
                }
            };

            var maybeRemoveSecondChannel = function () {
                state.channels['2'] = undefined;
            };

            var processing = [],
                postprocessing = [],
                newChannelProcessing = [];

            var phoneNumbers = {
                1: '79161234567',
                2: '79161234567'
            };
            
            function phoneNumber () {
                processing.push((function (channel) {
                    return function () {
                        state.channels[channel].phoneNumber = phoneNumbers[channel];
                        me.available();
                    };
                })(channel));
            };

            function changedChannel (newChannelNumber, previousChannelNumber) {
                processing.push(function () {
                    var newChannel = {
                        state: state.channels[newChannelNumber].state,
                        direction: state.channels[newChannelNumber].direction
                    };

                    state.lastChannelChange = {
                        previousChannelNumber: previousChannelNumber,
                        newChannel: newChannel 
                    };

                    newChannelProcessing.forEach(function (process) {
                        process(newChannel)
                    });
                });
            }

            function createNotification (process) {
                maybeRemoveSecondChannel();

                processing.forEach(function (process) {
                    process();
                });

                process();

                postprocessing.forEach(function (process) {
                    process();
                });

                Object.entries(state.channels[state.currentChannel]).forEach(function (args) {
                    var key = args[0],
                        value = args[1];

                    key != 'holdButtonPressed' && (state[key] = value);
                });

                return {
                    type: 'notify_slaves',
                    data: {
                        type: 'state_updating',
                        state: state
                    }
                };
            }

            var me = extendSlavesNotification({
                additional: function () {
                    var processing = [];

                    var state = {
                        channels: {
                            1: {
                                dtmf: ''
                            },
                            2: {
                                dtmf: ''
                            }
                        },
                        sessions: {
                            transfered: {
                                1: undefined,
                                2: undefined
                            }
                        },
                        softphone: {
                            names: {
                                '79161234567': undefined,
                                '79161234569': undefined
                            }
                        }
                    };

                    var notification = {
                        type: 'notify_slaves',
                        data: {
                            type: 'state_updating',
                            state: state 
                        } 
                    };

                    function getNotification () {
                        processing.forEach(function (process) {
                            process();
                        });

                        return notification;
                    }

                    return extendAdditionalSlavesNotification({
                        dtmf: function (value) {
                            state.channels['1'].dtmf = value;
                            return this;
                        },
                        transfered: function () {
                            state.sessions.transfered['1'] = true;
                            return this;
                        },
                        name: function () {
                            state.softphone.names['79161234567'] = 'Шалева Дора';
                            return this;
                        },
                        anotherName: function () {
                            state.softphone.names['79161234569'] =
                                'ООО "КОБЫЛА И ТРУПОГЛАЗЫЕ ЖАБЫ ИСКАЛИ ЦЕЗИЮ НАШЛИ ПОЗДНО УТРОМ СВИСТЯЩЕГО ХНА"';
                            return this;
                        },
                        expectToBeSent: function () {
                            eventsWebSocket.expectSentMessageToContain(getNotification());
                        },
                        receive: function () {
                            eventsWebSocket.receiveMessage(getNotification());
                        }
                    }, state, processing);
                },
                wasIncomingAtTheMomentOfChannelChanging: function () {
                    newChannelProcessing.push(newChannel => {
                        newChannel.direction = 'incoming';
                    });
                    
                    return this;
                },
                wasIdleAtTheMomentOfChannelChanging: function () {
                    newChannelProcessing.push(newChannel => {
                        newChannel.state = 'idle';
                    });
                    
                    return this;
                },
                wasInProgressAtTheMomentOfChannelChanging: function () {
                    newChannelProcessing.push(newChannel => {
                        newChannel.state = 'progress';
                    });
                    
                    return this;
                },
                currentChannelIsSecond: function () {
                    this.twoChannels();
                    state.currentChannel = 2;
                    return this;
                },
                changedChannelToSecond: function () {
                    this.currentChannelIsSecond();
                    changedChannel(2, 1);
                    return this;
                },
                changedChannelToFirst: function () {
                    this.twoChannels();
                    changedChannel(1, 2);
                    state.currentChannel = 1;
                    return this;
                },
                secondChannel: function () {
                    this.twoChannels();
                    channel = '2';
                    return this;
                },
                twoChannels: function () {
                    state.channelsCount = 2;
                    maybeRemoveSecondChannel = function () {};

                    if (!state.channels['2']) {
                        return this;
                    }

                    return this;
                },
                webRTCServerConnected: function () {
                    state.webRTCServerConnected = true;
                    return this;
                },
                microphoneAccessGranted: function () {
                    state.microphoneAccessGranted = true;
                    return this;
                },
                registered: function () {
                    state.registered = true;
                    return this;
                },
                available: function () {
                    state.webRTCServerConnected = true;
                    state.microphoneAccessGranted = true;
                    state.registered = true;

                    return this;
                },
                ended: function() {
                    this.available();
                    state.channels[channel].endedNormally = true; 
                    return this;
                },
                failed: function() {
                    this.available();
                    state.channels[channel].endedNormally = false; 
                    return this;
                },
                muted: function () {
                    state.channels[channel].muted = true; 
                    return this;
                },
                holded: function () {
                    state.channels[channel].holdButtonPressed = true; 
                    return this;
                },
                incoming: function () {
                    state.channels[channel].direction = 'incoming';
                    return this;
                },
                startsWithEight: function () {
                    processing.push(function () {
                        state.channels[channel].phoneNumber = '8' + state.channels[channel].phoneNumber.substr(1);
                    });

                    return this;
                },
                shortPhoneNumber: function () {
                    phoneNumbers[channel] = '79161';
                    return this;
                },
                anotherShortPhoneNumber: function () {
                    phoneNumbers[channel] = '295';
                    return this;
                },
                anotherPhoneNumber: function () {
                    phoneNumbers[channel] = '79161234569';
                    return this;
                },
                fourthPhoneNumber: function () {
                    phoneNumbers[channel] = '74999951240';
                    return this;
                },
                thirdPhoneNumber: function () {
                    phoneNumbers[channel] = '74950230625';
                    return this;
                },
                sending: function () {
                    state.channels[channel].state = 'sending';
                    phoneNumber();
                    return this;
                },
                progress: function () {
                    state.channels[channel].state = 'progress';
                    phoneNumber();
                    return this;
                },
                confirmed: function () {
                    state.channels[channel].state = 'confirmed';
                    phoneNumber();
                    return this;
                },
                microphoneAccessDenied: function () {
                    state.error = 'microphoneAccessDenied';

                    postprocessing.push(function () {
                        state.microphoneAccessGranted = false;
                    });

                    return this;
                },
                registrationFailed: function () {
                    state.error = 'registrationFailed';
                    state.destroyed = true;
                    return this;
                },
                appAlreadyOpened: function () {
                    state.error = 'appAlreadyOpened';
                    state.destroyed = true;
                    return this;
                },
                disabled: function () {
                    state.disabled = true;
                    return this;
                },
                destroyed: function () {
                    state.destroyed = true;
                    return this;
                },
                expectToBeSent: function () {
                    eventsWebSocket.expectSentMessageToContain(createNotification(function () {}));
                },
                receive: function () {
                    eventsWebSocket.receiveMessage(createNotification(function () {
                        Object.entries(state.channels).forEach(function (args) {
                            var key = args[0],
                                value = args[1];

                            if (!value) {
                                return;
                            }

                            value.state != 'idle' &&
                                (state.channels[key].sessionId = sessionIds[key]);
                        });
                    }));
                }
            });

            return me;
        };

        var extendMasterNotification = function (notification) {
            return notification;
        };

        this.extendMasterNotification = function (extentor) {
            extendMasterNotification = extentor;
        };

        this.masterNotification = function () {
            var data = {},
                processing = [];

            function createNotification () {
                processing.forEach(function (process) {
                    process();
                });

                return {
                    type: 'notify_master',
                    data: data
                };
            }

            var me = extendMasterNotification({
                setSecondChannel: function () {
                    data = {
                        action: 'setChannel',
                        channel: 2
                    };

                    return this;
                },
                answer: function () {
                    data = {
                        action: 'answer'
                    };

                    return this;
                },
                sendDTMF: function () {
                    data = {
                        action: 'sendDTMF',
                        dtmf: '#295'
                    };

                    return this;
                },
                unmute: function () {
                    data = {
                        action: 'unmute'
                    };

                    return this;
                },
                mute: function () {
                    data = {
                        action: 'mute'
                    };

                    return this;
                },
                unhold: function () {
                    data = {
                        action: 'unhold'
                    };

                    return this;
                },
                hold: function () {
                    data = {
                        action: 'hold'
                    };

                    return this;
                },
                secondChannel: function () {
                    processing.push(function () {
                        data.channel = 2;
                    });

                    return this;
                },
                terminate: function () {
                    data = {
                        action: 'terminate'
                    };

                    return this;
                },
                anotherShortPhoneNumber: function () {
                    processing.push(function () {
                        data.phoneNumber = '295';
                    });

                    return this;
                },
                fourthPhoneNumber: function () {
                    processing.push(function () {
                        data.phoneNumber = '74999951240';
                    });

                    return this;
                },
                thirdPhoneNumber: function () {
                    processing.push(function () {
                        data.phoneNumber = '74950230625';
                    });

                    return this;
                },
                anotherPhoneNumber: function () {
                    processing.push(function () {
                        data.phoneNumber = '79161234569';
                    });

                    return this;
                },
                call: function () {
                    data = {
                        action: 'call',
                        phoneNumber: '79161234567'
                    };

                    return this;
                },
                tabOpened: function () {
                    data = {
                        action: 'tab_opened'
                    };

                    return this;
                },
                expectToBeSent: function () {
                    eventsWebSocket.expectSentMessageToContain(createNotification());
                },
                receive: function () {
                    eventsWebSocket.receiveMessage(createNotification());
                }
            }, data);

            return me;
        };

        var extendOthersNotification = function (notification) {
            return notification;
        };

        this.extendOthersNotification = function (extentor) {
            extendOthersNotification = extentor;
        };

        this.othersNotification = function () {
            var data = {},
                maybeProcessData = function () {},
                settingsUpdatingProcessing = [];

            function createNotification () {
                maybeProcessData();

                return {
                    type: 'notify_others',
                    data: data
                };
            }

            function addMethods (me) {
                me.expectToBeSent = function () {
                    eventsWebSocket.expectSentMessageToContain(createNotification());
                };

                me.receive = function () {
                    eventsWebSocket.receiveMessage(createNotification());
                };

                return me;
            }

            var me = addMethods(extendOthersNotification({
                updateSettings: function () {
                    var settings = {
                        ringtone: undefined,
                        microphone: undefined,
                        remoteStreamVolume: undefined,
                        holdMusic: undefined,
                        outputDeviceId: undefined
                    };
                    
                    function setRingtone () {
                        settings.ringtone = {
                            volume: undefined,
                            deviceId: undefined,
                            url: undefined
                        };
                    };

                    function setMicrophone () {
                        settings.microphone = {
                            volume: undefined,
                            deviceId: undefined
                        };
                    }

                    function setHoldMusic () {
                        settings.holdMusic = {
                            volume: undefined,
                            url: undefined
                        };
                    }

                    data.action = 'updateSettings';
                    data.settings = settings;

                    maybeProcessData = function () {
                        settingsUpdatingProcessing.forEach(function (process) {
                            process(settings);
                        });
                    };

                    return addMethods({
                        incomingRingtone: function () {
                            setRingtone();
                            settings.ringtone.url = 'https://somehost.com/softphone_ringtone2.mp3';
                            return this;
                        },
                        noIncomingRingtone: function () {
                            setRingtone();
                            settings.ringtone.url = '';
                            return this;
                        },
                        anotherRingtoneDevice: function () {
                            setRingtone();
                            settings.ringtone.deviceId =
                                '6943f509802439f2c170bea3f42991df56faee134b25b3a2f2a13f0fad6943ab';

                            return this;
                        },
                        ringtoneDevice: function () {
                            setRingtone();
                            settings.ringtone.deviceId =
                                'g8294gjg29guslg82pgj2og8ogjwog8u29gj0pagulo48g92gj28ogtjog82jgab';

                            return this;
                        },
                        holdMusic: function () {
                            setHoldMusic();
                            settings.holdMusic.url = 'https://somehost.com/hold_music.mp3';
                            return this;
                        },
                        noHoldMusic: function () {
                            setHoldMusic();
                            settings.holdMusic.url = '';
                            return this;
                        },
                        defaultHoldMusicVolume: function () {
                            setHoldMusic();
                            settings.holdMusic.volume = 100;
                            return this;
                        },
                        defaultMicrophoneVolume: function () {
                            setMicrophone();
                            settings.microphone.volume = 100;
                            return this;
                        },
                        defaultRingtoneVolume: function () {
                            setRingtone();
                            settings.ringtone.volume = 100;
                            return this;
                        },
                        holdMusicVolumeChanged: function () {
                            setHoldMusic();
                            settings.holdMusic.volume = 25;
                            return this;
                        },
                        microphoneVolumeChanged: function () {
                            setMicrophone();
                            settings.microphone.volume = 25;
                            return this;
                        },
                        ringtoneVolumeChanged: function () {
                            setRingtone();
                            settings.ringtone.volume = 25;
                            return this;
                        },
                        ringtoneMuted: function () {
                            setRingtone();
                            settings.ringtone.volume = 0;
                            return this;
                        },
                        microphoneDevice: function () {
                            setMicrophone();
                            settings.microphone.deviceId =
                                '98g2j2pg9842gi2gh89hl48ogh2og82h9g724hg427gla8g2hg289hg9a48ghal4';

                            return this;
                        },
                        outputDevice: function () {
                            settings.outputDeviceId =
                                '6943f509802439f2c170bea3f42991df56faee134b25b3a2f2a13f0fad6943ab';

                            return this;
                        }
                    });
                }
            }, data));

            return me;
        };

        this.masterInfoMessage = () => {
            const message = me.tabStateChangeMessage();

            return {
                hasNotMaster: () => message.setHasNoMaster(),
                isNotMaster: () => message.setNotMaster(),
                receive: () => message.receive()
            };
        };

        this.settingsChangedMessage = function () {
            var data = {};

            return {
                sofphoneIsTurnedOff: function () {
                    data.is_use_widget_for_calls = false;
                    return this;
                },
                receive: function () {
                    eventsWebSocket.receiveMessage({
                        name: 'settings_changed',
                        params: {
                            data: data 
                        }
                    });
                }
            };
        };
    };
});
