define(() => {
    return function (options) {
        const {
            testersFactory,
            utils,
            utils: {pressKey},
            ajax,
            runApplication,
            webSockets
        } = options;

        const removeElementContent = selector => {
            const element = document.querySelector(selector);
            element && (element.innerHTML = '');
        };

        removeElementContent('.ant-notification span');
        removeElementContent('.ant-message span');

        const {path} = runApplication(options);

        const setOnlineIndicator = ({tester, element}) => tester.onlineIndicator = () => testersFactory.
            createDomElementTester(utils.getVisibleSilently(element.
                querySelectorAll('.chat-card__online-indicator, .rmo-avatar__status')));

        const admixTesters = (target, element) =>
            (Object.entries(getTesters(element)).forEach(([key, value]) => (target[key] = value)), target);

        const getTesters = (ascendant) => {
            ascendant = ascendant || new JsTester_NoElement();

            return {
                a: text => testersFactory.createAnchorTester(utils.descendantOf(ascendant).matchesSelector('a').
                    textEquals(text).find()),

                logoOperator: testersFactory.createDomElementTester(() =>
                    ascendant.querySelector('.logo__operator-title')),

                message: () => testersFactory.createDomElementTester(ascendant.querySelector('.ant-message')),

                tabpanel: () => {
                    const getTabPanelElement = () => utils.getVisibleSilently(ascendant.querySelectorAll('.ant-tabs')),
                        tester = testersFactory.createDomElementTester(getTabPanelElement);

                    tester.tab = title => {
                        const getTabElement = () => utils.descendantOf(getTabPanelElement()).
                            matchesSelector('.ant-tabs-tab').textEquals(title).find();
                        const tester = testersFactory.createDomElementTester(getTabElement);

                        tester.active = () => {
                            const element = utils.getVisibleSilently(getTabPanelElement().
                                querySelectorAll('.ant-tabs-tabpane-active'));

                            return admixTesters(testersFactory.createDomElementTester(element), element);
                        };

                        return tester;
                    };

                    return tester;
                },

                notification: () => {
                    const element = ascendant.querySelector('.ant-notification') || new JsTester_NoElement();
                    const iconWrapperElement =
                        element.querySelector('.rmo-notification__icon') || new JsTester_NoElement();
                    const tester = testersFactory.createDomElementTester(element);

                    iconWrapperTester = testersFactory.createDomElementTester(iconWrapperElement);

                    tester.typeIcon = () => {
                        const tester = testersFactory.createDomElementTester(iconWrapperElement.querySelector('svg'));

                        tester.expectToHaveClass = iconWrapperTester.expectToHaveClass.bind(iconWrapperTester);
                        tester.expectNotToHaveClass = iconWrapperTester.expectNotToHaveClass.bind(iconWrapperTester);

                        return tester;
                    };

                    return tester;
                },
                
                chatHeader: () => {
                    const element = ascendant.querySelector('.chat-header__visitor') || new JsTester_NoElement(),
                        tester = testersFactory.createDomElementTester(element);

                    tester.typeIcon = () => testersFactory.createDomElementTester(element.
                        querySelector('.chat-header__visitor-type-icon svg'));

                    setOnlineIndicator({tester, element});
                    return tester;
                },

                visitorCard: header => {
                    const element = utils.descendantOf(ascendant).
                        matchesSelector('.visitors-card__visitor').
                        textEquals(header).
                        find().
                        closest('.visitors-card');

                    const tester = testersFactory.createDomElementTester(element);

                    tester.typeIcon = () => testersFactory.createDomElementTester(element.
                        querySelector('.visitors-card__visitor-type-icon svg'));

                    admixTesters(tester, element);
                    return tester;
                },

                chatCard: () => {
                    const getTester = ({text, selector}) => {
                        const element = utils.descendantOf(ascendant).
                                matchesSelector(selector).
                                textEquals(text).
                                find().
                                closest('.chat-card');

                        const tester = testersFactory.createDomElementTester(element);

                        tester.typeIcon = () => testersFactory.createDomElementTester(element.
                            querySelector('.chat-card__visitor-type-icon svg'));

                        setOnlineIndicator({tester, element});
                        return tester;
                    };

                    return {
                        withHeader: text => getTester({
                            selector: '.chat-card__header',
                            text
                        }),
                        withSite: text => getTester({
                            selector: '.chat-card__extra-domain',
                            text
                        })
                    };
                },

                menuitem(text) {
                    const menuitem = utils.descendantOf(ascendant).
                        matchesSelector('.ant-menu-item, .ant-dropdown-menu-item').
                        textEquals(text).
                        find();

                    return testersFactory.createAnchorTester(menuitem.querySelector('a') || menuitem);
                },

                textfield: () => {
                    const tester = testersFactory.createTextFieldTester(
                        () => utils.getVisibleSilently(ascendant.querySelectorAll('input'))
                    );

                    tester.withPlaceholder = placeholder => testersFactory.createTextFieldTester(
                        Array.prototype.find.call(
                            ascendant.querySelectorAll('input'),
                            input => input.getAttribute('placeholder') == placeholder
                        )
                    );

                    return tester;
                },

                button: text => testersFactory.createDomElementTester(
                    utils.descendantOf(ascendant).matchesSelector('.ant-btn').textEquals(text).find()
                )
            };
        };

        const throwError = () => {
            throw new Error('Вебсокет должен быть открыт');
        };

        let webSocketTester = {
            receiveMessage: throwError,
            expectToBeSent: throwError,
            expectSomeMessagesToBeSent: throwError,
            finishDisconnecting: throwError
        };

        let consultantWebSocketTester = (() => {
            let success = true;

            const receiveMessage = message => webSocketTester.receiveMessage('a' + JSON.stringify([JSON.stringify({
                success,
                ...message
            })]));

            return {
                expectSentMessageToContain: expectedContent => {
                    !Array.isArray(expectedContent) && (expectedContent = [expectedContent]);
                    let message = webSocketTester.popRecentlySentMessage(),
                        parsedMessage = JSON.parse(message); 

                    if (!Array.isArray(parsedMessage)) {
                        throw new Error(
                            'Сообщение должно быть массивом, тем не менее было отправлено такое сообщение ' + message
                        );
                    }

                    if (parsedMessage.length != expectedContent.length) {
                        throw new Error(
                            'Должно быть отправлено только одно сообщение, тогда как были отправлены сообщения ' +
                            "\n" + parsedMessage.join("\n")
                        );
                    }

                    let i, ids = [];

                    for (i = 0; i < parsedMessage.length; i ++) {
                        const message = JSON.parse(parsedMessage[i]);

                        ids.push(message.id);

                        (new JsTester_ParamsContainingExpectation(
                            message,
                            (i + 1) + '-го сообщения, переданного через веб-сокет'
                        ))(expectedContent[i]);
                    }

                    const request = {
                        setUnsuccessfull: () => {
                            success = false;
                            return request;
                        },
                        receiveResponse: message => {
                            if (!Array.isArray(message)) {
                                message = [message];
                            }

                            if (message.length != ids.length) {
                                throw new Error(
                                    'Количество сообщений, на которое нужно ответить равно ' + ids.length + ', а не ' +
                                    message.length
                                );
                            }

                            let i;

                            for (i = 0; i < message.length; i ++) {
                                receiveMessage({
                                    result: message[i],
                                    id: ids[i]
                                });
                            }
                        }
                    };

                    return request;
                },
                receiveMessage: message => receiveMessage({id: '', ...message})
            };
        })();

        return {
            ...getTesters(document.body),

            expectLoginToEqual: expectedLogin => {
                let actualLogin = `${window.localStorage.getItem('login')}`;
                actualLogin == 'null' && (actualLogin = '');

                if (expectedLogin != actualLogin) {
                    throw new Error(
                        `В локальном хранилище должен быть сохранен логин "${
                            expectedLogin
                        }", а не "${
                            actualLogin
                        }".`
                    );
                }
            },

            expectPassordToEqual: expectedPassword => {
                let actualPassword = `${window.localStorage.getItem('password')}`;
                actualPassword == 'null' && (actualPassword = '');

                if (expectedPassword != actualPassword) {
                    throw new Error(
                        `В локальном хранилище должен быть сохранен пароль "${
                            expectedPassword
                        }", а не "${
                            actualPassword
                        }".`
                    );
                }
            },

            expectSomeMessagesToBeSent() {
                webSocketTester.expectSomeMessagesToBeSent();
            },

            connectWebSocket: index => {
                webSocketTester = webSockets.getSocket(/^ws:\/\/10.81.21.122:8001\/oc/, index || 0).connect();
                webSocketTester.receiveMessage('o');
            },

            finishWebSocketDisconnecting: () => webSocketTester.finishDisconnecting(),

            flushUpdates: () => pressKey('j'),
            
            body: testersFactory.createDomElementTester(document.body),

            path,

            logoutMessage: () => ({
                expectToBeSent: () => consultantWebSocketTester.expectSentMessageToContain({
                    name: 'core.logout',
                    params: {
                        operator_sid: 69572
                    }
                })
            }),

            chatStartingRequest: () => {
                return {
                    expectToBeSent() {
                        const request = consultantWebSocketTester.expectSentMessageToContain({
                            name: 'consultant.chat_start',
                            params: {
                                visitor_id: 2419872837
                            }
                        });

                        return {
                            receiveResponse: () => {
                                request.receiveResponse({
                                    visitor_id: 2419872837,
                                    chat_id: 92741841,
                                    messages: [{
                                        date: 1573737004,
                                        from: '',
                                        message: 'Подождите первого освободившегося оператора',
                                        source: 'Система'
                                    }, {
                                        date: 1573737049,
                                        from: '',
                                        message: 'Оператор Костадинка Гьошева на связи',
                                        source: 'Система'
                                    }, {
                                        date: 1573737104,
                                        from: 'Посетитель',
                                        message: 'Здравствуйте. Мне снова нужна помощь.',
                                        source: 'Посетитель'
                                    }]
                                });
                            }
                        };
                    },

                    receiveResponse() {
                        this.expectToBeSent().receiveResponse();
                    }
                };
            },

            chatClosingRequest: () => {
                return {
                    expectToBeSent() {
                        const request = consultantWebSocketTester.expectSentMessageToContain({
                            name: 'consultant.chat_close',
                            params: {
                                visitor_id: 2419872837
                            }
                        });

                        return {
                            receiveResponse: () => {
                                request.receiveResponse(null);
                            }
                        };
                    },

                    receiveResponse() {
                        this.expectToBeSent().receiveResponse();
                    }
                };
            },

            chatClosingMessage: () => ({
                receive: () => consultantWebSocketTester.receiveMessage({
                    name: 'consultant.chat_close',
                    params: {
                        visitor_id: 2419872837
                    }
                })
            }),

            visitorRemovingMessage: () => ({
                receive: () => consultantWebSocketTester.receiveMessage({
                    name: 'consultant.remove_visitor',
                    params: {
                        visitor_id: 2419872836
                    }
                })
            }),

            ocMessageMessage: () => ({
                receive: () => consultantWebSocketTester.receiveMessage({
                    name: 'core.oc_message',
                    params: {
                        message: {
                            date: 1575983624,
                            from: 210290,
                            message: 'Привет!',
                            source: 'Оператор',
                            to: 210289,
                            uid: '{c193241d-4336-4a6c-aead-4e756498cd45}'
                        }
                    }
                })
            }),

            chatMessageMessage: () => {
                const params = {
                    message: {
                        date: 1573737049,
                        from: 'Посетитель',
                        message: 'Здравствуйте. Мне нужна помощь.',
                        source: 'Посетитель',
                        uid: '23fff3bc-4a24-7d61-3ae7-20def6d1703e'
                    },
                    visitor_id: 2419872835
                };

                const setSystemMessage = message => (params.message = {
                    ...params.message,
                    from: '',
                    source: 'Система',
                    message
                });

                const message = {
                    setSecondVisitor: () => ((params.visitor_id = 2419872836), message),
                    setThirdVisitor: () => ((params.visitor_id = 2419872837), message),
                    setChatClosingMessage: () => (setSystemMessage('Посетитель вышел из чата'), message),
                    setChatStarting: () => (setSystemMessage('Оператор Костадинка Гьошева на связи'), message),
                    receive: () => consultantWebSocketTester.receiveMessage({
                        name: 'consultant.chat_message',
                        params
                    })
                };

                return message;
            },

            visitorUpdateMessage: () => {
                const visitor = {
                    group_id: null,
                    hit_count: 4,
                    id: 2419872835,
                    page: [
                        'http://third-site.com/',
                        null
                    ],
                    state: 'Ожидание',
                    status: 'Отправлено'
                };

                const message = {
                    setSecondVisitor: () => ((visitor.id = 2419872836), message),
                    setThirdVisitor: () => ((visitor.id = 2419872837), message),
                    setChatStarting: () => {
                        delete(visitor.hit_count);
                        delete(visitor.page);

                        visitor.operator_id = 210289;
                        visitor.state = 'Беседа';
                        visitor.status = 'Принято';

                        return message;
                    },
                    receive: () => consultantWebSocketTester.receiveMessage({
                        name: 'consultant.update_visitor',
                        params: {visitor}
                    })
                };

                return message;
            },

            chatWatchRequest: () => {
                return {
                    expectToBeSent() {
                        const request = consultantWebSocketTester.expectSentMessageToContain({
                            name: 'consultant.chat_watch',
                            params: {
                                subscribe: [2419872837],
                                unsubscribe: []
                            }
                        });

                        return {
                            receiveResponse: () => {
                                request.receiveResponse(null);
                            }
                        };
                    },

                    receiveResponse() {
                        this.expectToBeSent().receiveResponse();
                    }
                };
            },

            objectMarksRequest: () => {
                const params = {
                    obj: 'chat',
                    obj_id: 92741839
                };

                return {
                    setSecondChat() {
                        params.obj_id = 92741840;
                        return this;
                    },

                    setThirdChat() {
                        params.obj_id = 92741841;
                        return this;
                    },

                    expectToBeSent() {
                        const request = consultantWebSocketTester.expectSentMessageToContain({
                            name: 'core.get_object_marks',
                            params
                        });

                        return {
                            receiveResponse: () => {
                                request.receiveResponse({
                                    object_marks: []
                                });
                            }
                        };
                    },

                    receiveResponse() {
                        this.expectToBeSent().receiveResponse();
                    }
                };
            },

            pingRequest: () => ({
                expectToBeSent: () => consultantWebSocketTester.expectSentMessageToContain({
                    name: 'core.ping'
                })
            }),

            visitorsRequest: () => ({
                expectToBeSent() {
                    const request = consultantWebSocketTester.expectSentMessageToContain({
                        name: 'consultant.get_visitors'
                    });

                    return {
                        receiveResponse: () => {
                            request.receiveResponse({
                                visitors: [{
                                    ac_name: 'Посетители без рекламной кампании',
                                    ad_engine: null,
                                    browser: 'Chrome 77.0',
                                    city: null,
                                    country: null,
                                    country_code: null,
                                    group_id: null,
                                    hit_count: 2,
                                    id: 2419872835,
                                    ip: '10.81.21.84',
                                    operator_id: null,
                                    os: 'Windows 10',
                                    page: [
                                        'http://first-site.com/',
                                        null
                                    ],
                                    provider: null,
                                    search_engine: null,
                                    search_query: null,
                                    site_id: 10628,
                                    source_referrer: null,
                                    start_page: 'http://first-site.com/',
                                    start_time: 1573553545,
                                    state: 'На сайте',
                                    status: 'Отправлено',
                                    traffic_source: 'direct',
                                    type: 'comagic',
                                    visit_count: 15,
                                    visitor_card: {
                                        comment: null,
                                        company: null,
                                        emails: [],
                                        name: 'Ана Аначкова',
                                        phones: []
                                    }
                                }, {
                                    ac_name: 'Посетители без рекламной кампании',
                                    ad_engine: null,
                                    browser: 'Chrome 77.0',
                                    city: null,
                                    country: null,
                                    country_code: null,
                                    group_id: null,
                                    hit_count: 3,
                                    id: 2419872836,
                                    ip: '10.81.21.85',
                                    operator_id: null,
                                    os: 'Windows 10',
                                    page: [
                                        'http://second-site.com/',
                                        null
                                    ],
                                    provider: null,
                                    search_engine: null,
                                    search_query: null,
                                    site_id: 10629,
                                    source_referrer: null,
                                    start_page: 'http://second-site.com/',
                                    start_time: 1573553605,
                                    state: 'На сайте',
                                    status: 'Отправлено',
                                    traffic_source: 'direct',
                                    type: 'yandex',
                                    visit_count: 16,
                                    visitor_card: {
                                        comment: null,
                                        company: null,
                                        emails: [],
                                        name: 'Галя Балабанова',
                                        phones: []
                                    }
                                }, {
                                    ac_name: 'Посетители без рекламной кампании',
                                    ad_engine: null,
                                    browser: 'Chrome 77.0',
                                    city: null,
                                    country: null,
                                    country_code: null,
                                    group_id: null,
                                    hit_count: 3,
                                    id: 2419872837,
                                    ip: '10.81.21.86',
                                    operator_id: null,
                                    os: 'Windows 10',
                                    page: [
                                        'http://fourth-site.com/',
                                        null
                                    ],
                                    provider: null,
                                    search_engine: null,
                                    search_query: null,
                                    site_id: 10630,
                                    source_referrer: null,
                                    start_page: 'http://fourth-site.com/',
                                    start_time: 1573553671,
                                    state: 'На сайте',
                                    status: 'Отправлено',
                                    traffic_source: 'direct',
                                    type: 'whatsapp',
                                    visit_count: 23,
                                    visitor_card: {
                                        comment: null,
                                        company: null,
                                        emails: [],
                                        name: 'Милка Стоенчева',
                                        phones: []
                                    }
                                }]
                            });
                        }
                    };
                },

                receiveResponse() {
                    this.expectToBeSent().receiveResponse();
                }
            }),

            chatsRequest: () => ({
                expectToBeSent() {
                    const request = consultantWebSocketTester.expectSentMessageToContain({
                        name: 'consultant.get_chats'
                    });

                    return {
                        receiveResponse: () => {
                            request.receiveResponse({
                                chats: [{
                                    chat_id: 92741839,
                                    is_in_transfer: false,
                                    messages: [],
                                    visitor_id: 2419872835
                                }, {
                                    chat_id: 92741840,
                                    is_in_transfer: false,
                                    messages: [],
                                    visitor_id: 2419872836
                                }, {
                                    chat_id: 92741841,
                                    is_in_transfer: false,
                                    messages: [],
                                    visitor_id: 2419872837
                                }]
                            });
                        }
                    };
                },

                receiveResponse() {
                    this.expectToBeSent().receiveResponse();
                }
            }),

            operatorReadyRequest: () => ({
                expectToBeSent() {
                    const request = consultantWebSocketTester.expectSentMessageToContain({
                        name: 'consultant.operator_ready'
                    });

                    return {
                        receiveResponse: () => {
                            request.receiveResponse(null);
                        }
                    };
                },

                receiveResponse() {
                    this.expectToBeSent().receiveResponse();
                }
            }),

            answerTemplatesRequest: () => ({
                expectToBeSent() {
                    const request = consultantWebSocketTester.expectSentMessageToContain({
                        name: 'consultant.get_answer_templates'
                    });

                    return {
                        receiveResponse: () => {
                            request.receiveResponse({
                                answer_templates: [
                                    'Хватит уже себя грузить. Не думай о проблемах. Забудь всё плохое. Почаще ' +
                                    'улыбайся. Меньше нервничай. Цени каждый момент. Наслаждайся своей жизнью. Верь ' +
                                    'только в лучшее.'
                                ]
                            });
                        }
                    };
                },

                receiveResponse() {
                    this.expectToBeSent().receiveResponse();
                }
            }),

            inviteStatusesRequest: () => ({
                expectToBeSent() {
                    const request = consultantWebSocketTester.expectSentMessageToContain({
                        name: 'consultant.get_invite_statuses'
                    });

                    return {
                        receiveResponse: () => {
                            request.receiveResponse({
                                invite_statuses: [
                                    'Отправлено',
                                    'Отклонено',
                                    'Принято',
                                    'Не отправлено'
                                ]
                            });
                        }
                    };
                },

                receiveResponse() {
                    this.expectToBeSent().receiveResponse();
                }
            }),

            visitorStatesRequest: () => ({
                expectToBeSent() {
                    const request = consultantWebSocketTester.expectSentMessageToContain({
                        name: 'consultant.get_visitor_states'
                    });

                    return {
                        receiveResponse: () => {
                            request.receiveResponse({
                                visitor_states: [
                                    'Ожидание',
                                    'На сайте',
                                    'Лидогенерация',
                                    'Беседа',
                                    'Автоприглашение',
                                    'Приглашение'
                                ]
                            });
                        }
                    };
                },

                receiveResponse() {
                    this.expectToBeSent().receiveResponse();
                }
            }),

            marksRequest: () => ({
                expectToBeSent() {
                    const request = consultantWebSocketTester.expectSentMessageToContain({
                        name: 'core.get_marks'
                    });

                    return {
                        receiveResponse: () => {
                            request.receiveResponse({
                                marks: {
                                    '148': {
                                        is_system: true,
                                        mnemonic: 'lead',
                                        name: 'Генератор лидов'
                                    },
                                    '1': {
                                        is_system: true,
                                        mnemonic: 'not_processed',
                                        name: 'Не обработано'
                                    }
                                }
                            });
                        }
                    };
                },

                receiveResponse() {
                    this.expectToBeSent().receiveResponse();
                }
            }),

            systemMessagesRequest: () => ({
                expectToBeSent() {
                    const request = consultantWebSocketTester.expectSentMessageToContain({
                        name: 'core.get_system_messages'
                    });

                    return {
                        receiveResponse: () => {
                            request.receiveResponse({
                                system_messages: {
                                    ai_exit: 'У Вас есть отправленные автоприглашения',
                                    last_operator_and_ai_exit: 'Вы последний оператор в системе и у Вас есть ' +
                                        'отправленные автоприглашения',
                                    last_operator_exit: 'Вы последний оператор в системе.'
                                }
                            });
                        }
                    };
                },

                receiveResponse() {
                    this.expectToBeSent().receiveResponse();
                }
            }),

            sitesRequest: () => ({
                expectToBeSent() {
                    const request = consultantWebSocketTester.expectSentMessageToContain({
                        name: 'core.get_sites'
                    });

                    return {
                        receiveResponse: () => {
                            request.receiveResponse({
                                sites: {
                                    '10628': {
                                        domain: 'first-site.com',
                                        is_file_transfer_available: true,
                                        min_duration_for_invite: 0
                                    },
                                    '10629': {
                                        domain: 'second-site.com',
                                        is_file_transfer_available: true,
                                        min_duration_for_invite: 0
                                    },
                                    '10630': {
                                        domain: 'fourth-site.com',
                                        is_file_transfer_available: true,
                                        min_duration_for_invite: 0
                                    }
                                }
                            });
                        }
                    };
                },

                receiveResponse() {
                    this.expectToBeSent().receiveResponse();
                }
            }),

            operatorsGroupsRequest: () => ({
                expectToBeSent() {
                    const request = consultantWebSocketTester.expectSentMessageToContain({
                        name: 'core.get_operators_groups'
                    });

                    return {
                        receiveResponse: () => {
                            request.receiveResponse({
                                operators_groups: {
                                    '158756': 'Хелпдеск',
                                }
                            });
                        }
                    };
                },

                receiveResponse() {
                    this.expectToBeSent().receiveResponse();
                }
            }),

            operatorsRequest: () => ({
                expectToBeSent() {
                    const request = consultantWebSocketTester.expectSentMessageToContain({
                        name: 'core.get_operators'
                    });

                    return {
                        receiveResponse: () => {
                            request.receiveResponse({
                                operators: [{
                                    groups: [15874],
                                    login_time: null,
                                    operator_card: {
                                        avatar_url: null,
                                        emails: [],
                                        name: 'Костадинка Гьошева',
                                        phones: ['74951234567']
                                    },
                                    operator_id: 210289,
                                    status: 'online'
                                }, {
                                    groups: [15874],
                                    login_time: null,
                                    operator_card: {
                                        avatar_url: null,
                                        emails: [],
                                        name: 'Зорка Антонова',
                                        phones: ['74951234568']
                                    },
                                    operator_id: 210290,
                                    status: 'offline'
                                }, {
                                    groups: [15874],
                                    login_time: null,
                                    operator_card: {
                                        avatar_url: null,
                                        emails: [],
                                        name: 'Катерина Помакова',
                                        phones: ['74951234569']
                                    },
                                    operator_id: 210291,
                                    status: 'online'
                                }]
                            });
                        }
                    };
                },

                receiveResponse() {
                    this.expectToBeSent().receiveResponse();
                }
            }),

            loginUserRequest: () => ({
                expectToBeSent() {
                    const consultantRequest = consultantWebSocketTester.expectSentMessageToContain({
                        name: 'core.login',
                        params: {
                            login: 't.daskalova',
                            password: '1f6fe3147e74aa7c9d042e8f024361d7'
                        }
                    });

                    let response = {
                        operator_id: 210289,
                        operator_sid: 69572
                    };

                    const request = {
                        setUnsuccessfull: () => (consultantRequest.setUnsuccessfull(), (response = {
                            message: 'Неправильный логин или пароль'
                        }), request),
                        receiveResponse: () => consultantRequest.receiveResponse(response)
                    };

                    return request;
                },

                receiveResponse() {
                    this.expectToBeSent().receiveResponse();
                }
            }),

            componentsRequest: () => ({
                expectToBeSent() {
                    const request = consultantWebSocketTester.expectSentMessageToContain({
                        name: 'core.get_components'
                    });

                    return {
                        receiveResponse: () => {
                            request.receiveResponse({});
                        }
                    };
                },

                receiveResponse() {
                    this.expectToBeSent().receiveResponse();
                }
            }),

            operatorStatusUpdatingRequest: () => ({
                expectToBeSent: () => consultantWebSocketTester.expectSentMessageToContain({
                    name: 'core.set_operator_status',
                    params: {
                        status: 'online'
                    }
                })
            }),

            infoRequest: () => ({
                receiveResponse() {
                    ajax.recentRequest().
                        expectToHavePath('/oc/info').
                        expectToHaveMethod('GET').
                        respondSuccessfullyWith({
                            result: {
                                data: {}
                            }
                        });
                }
            })
        };
    };
});
