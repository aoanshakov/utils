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
        const {path} = runApplication(options);


        const getTesters = (ascendant) => {
            ascendant = ascendant || new JsTester_NoElement();

            return {
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

        let webSocketTester = {
            receiveMessage: () => {
                throw new Error('Вебсокет должен быть открыт');
            },

            expectToBeSent: () => {
                throw new Error('Вебсокет должен быть открыт');
            }
        };

        let consultantWebSocketTester = {
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
                        'Должно быть отправлено только одно сообщение, тогда как были отправлены сообщения ' + "\n" +
                        parsedMessage.join("\n")
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

                return {
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
                            const m = {
                                success: true,
                                result: message[i],
                                id: ids[i]
                            };

                            webSocketTester.receiveMessage('a' + JSON.stringify([JSON.stringify(m)]));
                        }
                    }
                };
            }
        };

        return {
            ...getTesters(document.body),

            connectWebSocket: index => {
                webSocketTester = webSockets.getSocket(/^wss:\/\/server-rt.dev.uis.st\/oc/, index || 0).connect();
                webSocketTester.receiveMessage('o');
            },

            flushUpdates: () => pressKey('j'),
            
            body: testersFactory.createDomElementTester(document.body),

            path,

            objectMarksRequest: () => ({
                expectToBeSent() {
                    const request = consultantWebSocketTester.expectSentMessageToContain({
                        name: 'core.get_object_marks'
                    });

                    return {
                        receiveResponse: () => {
                            request.receiveResponse({
                                object_marks: [
                                ]
                            });
                        }
                    };
                },

                receiveResponse() {
                    this.expectToBeSent().receiveResponse();
                }
            }),

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
                                        'http://sitert.dev.uis.st/',
                                        null
                                    ],
                                    provider: null,
                                    search_engine: null,
                                    search_query: null,
                                    site_id: 10628,
                                    source_referrer: null,
                                    start_page: 'http://sitert.dev.uis.st/',
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
                                        domain: 'sitecw1.dev.uis.st',
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
                                        name: '00000000000 123123',
                                        phones: ['11231231123123123123']
                                    },
                                    operator_id: 210289,
                                    status: 'offline'
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
                    const request = consultantWebSocketTester.expectSentMessageToContain({
                        name: 'core.login',
                        params: {
                            login: 't.daskalova',
                            password: '1f6fe3147e74aa7c9d042e8f024361d7'
                        }
                    });

                    return {
                        receiveResponse: () => {
                            request.receiveResponse({
                                operator_id: 210289,
                                operator_sid: 69572
                            });
                        }
                    };
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
                        expectToHavePath('https://server-rt.dev.uis.st/oc/info').
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
