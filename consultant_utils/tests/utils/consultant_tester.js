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

        const elements = document.querySelectorAll('.ant-notification > span > div');

        Array.prototype.forEach.call(elements, element => {
            element.style.display = 'none';
            element.innerHTML = '';
        });

        removeElementContent('.ant-message span');

        const {path} = runApplication(options);

        const setOnlineIndicator = ({tester, element}) => tester.onlineIndicator = () => testersFactory.
            createDomElementTester(utils.getVisibleSilently(element.
                querySelectorAll('.chat-card__online-indicator, .rmo-avatar__status')));

        const admixTesters = (target, element) =>
            (Object.entries(getTesters(element)).forEach(([key, value]) => (target[key] = value)), target);

        const getTesters = (ascendant) => {
            ascendant = ascendant || new JsTester_NoElement();

            const getIcon = type => testersFactory.createDomElementTester(() => {
                const elements = ascendant.querySelectorAll('svg');

                return utils.getVisibleSilently(Array.prototype.filter.call(
                    elements,
                    element => element.getAttribute('data-type') == type
                ));
            });

            me = {
                chatInfoIcon: getIcon('chat-info-icon'),
                chatTagIcon: getIcon('chat-tag-icon'),
                chatHistoryIcon: getIcon('chat-history-icon'),

                chatHistoryItem: text => {
                    const getIcon = type => {
                        const icons = utils.descendantOf(ascendant).
                            matchesSelector('.chat-history-item__operator-name').
                            textEquals(text).
                            find().
                            closest('.chat-history-item').
                            querySelectorAll('svg');

                        return testersFactory.createDomElementTester(
                            Array.prototype.find.call(icons, icon => icon.getAttribute('data-icon') == type)
                        );
                    };

                    return {
                        leftIcon: () => getIcon('left'),
                        rightIcon: () => getIcon('right') 
                    };
                },

                a: text => testersFactory.createAnchorTester(utils.descendantOf(ascendant).matchesSelector('a').
                    textEquals(text).find()),

                logoOperator: testersFactory.createDomElementTester(() =>
                    ascendant.querySelector('.logo__operator-title')),

                message: () => testersFactory.createDomElementTester(ascendant.querySelector('.ant-message')),

                chatListWrapper: () => testersFactory.createDomElementTester(utils.getVisibleSilently(ascendant.
                    querySelectorAll('.chat-list-wrapper'))),

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

                    return admixTesters(tester, element);
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
                    const getTester = element => {
                        const tester = testersFactory.createDomElementTester(element);

                        tester.typeIcon = () => testersFactory.createDomElementTester(element.
                            querySelector('.chat-card__visitor-type-icon svg'));

                        setOnlineIndicator({tester, element});
                        return tester;
                    };

                    const getTesterByText = ({text, selector}) => getTester(utils.descendantOf(ascendant).
                        matchesSelector(selector).
                        textEquals(text).
                        find().
                        closest('.chat-card'));

                    return {
                        atIndex: index => getTester(ascendant.querySelectorAll('.chat-card')[index]),
                        withLastMessage: text => getTesterByText({
                            selector: '.chat-card__last-msg',
                            text
                        }),
                        withHeader: text => getTesterByText({
                            selector: '.chat-card__header',
                            text
                        }),
                        withSite: text => getTesterByText({
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

            return me;
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
                webSocketTester = webSockets.getSocket(/^ws:\/\/[0-9.:]+\/oc/, index || 0).connect();
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

            visitorChatHistoryDataRequest: () => {
                const params = {
                    visitor_id: 2419872837,
                    chat_id: 92741813
                };

                const messages = [{
                    date: 1573737011,
                    from: '',
                    message: 'Подождите первого освободившегося оператора',
                    source: 'Система'
                }, {
                    date: 1573737087,
                    from: '',
                    message: 'Оператор Костадинка Гьошева на связи',
                    source: 'Система'
                }, {
                    date: 1573737227,
                    from: 'Посетитель',
                    message: 'Доброе утро. Спасите меня.',
                    source: 'Посетитель'
                }];

                const me = {
                    setSecondChat: () => {
                        params.chat_id = 92741814;
                        messages[2].message = 'Добрый вечер. Я в отчаянии.';

                        return me;
                    },
                    expectToBeSent: () => {
                        const request = consultantWebSocketTester.expectSentMessageToContain({
                            name: 'consultant.get_visitor_chat_history_data',
                            params
                        });

                        return {
                            receiveResponse: () => {
                                request.receiveResponse({messages});
                            }
                        };
                    },

                    receiveResponse: () => me.expectToBeSent().receiveResponse()
                };

                return me;
            },

            visitorChatInfoRequest: () => {
                return {
                    expectToBeSent() {
                        const request = consultantWebSocketTester.expectSentMessageToContain({
                            name: 'consultant.get_visitor_chat_info',
                            params: {
                                visitor_id: 162918540
                            }
                        });

                        return {
                            receiveResponse: () => {
                                request.receiveResponse({
                                    chat_info: {
                                        duration: 35,
                                        last_message_time: 1573737039,
                                        start_time: 1573737004
                                    }
                                });
                            }
                        };
                    },

                    receiveResponse() {
                        this.expectToBeSent().receiveResponse();
                    }
                };
            },

            visitorActivityRequest: () => {
                return {
                    expectToBeSent() {
                        const request = consultantWebSocketTester.expectSentMessageToContain({
                            name: 'consultant.get_visitor_activity',
                            params: {
                                visitor_id: 162918540
                            }
                        });

                        return {
                            receiveResponse: () => {
                                request.receiveResponse({
                                    hits: [{
                                        actions: [{
                                            event: 'segment',
                                            params: {
                                                name: 'Посетитель провел на сайте 5 и более минут'
                                            },
                                            time: 1573736354,
                                            type: 'custom'
                                        }],
                                        hit_id: 10687874920,
                                        out_time: 1573736932,
                                        start_time: 1573736053,
                                        title: null,
                                        url: 'http://thirtinth-site.com'
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

            visitorHistoryRequest: () => {
                return {
                    expectToBeSent() {
                        const request = consultantWebSocketTester.expectSentMessageToContain({
                            name: 'consultant.get_visitor_history',
                            params: {
                                visitor_id: 162918540
                            }
                        });

                        return {
                            receiveResponse: () => {
                                request.receiveResponse({
                                    visitor_history: [{
                                        ac_name: 'Посетители без рекламной кампании',
                                        ad_engine: null,
                                        browser: 'Chrome 78.0',
                                        city: null,
                                        country: null,
                                        country_code: null,
                                        duration: 4044,
                                        os: 'Windows 10',
                                        search_engine: null,
                                        search_query: null,
                                        session_id: 3771918862,
                                        source_referrer: null,
                                        start_page: 'http://thirtinth-site.com',
                                        start_time: 1573638389,
                                        traffic_source: 'direct',
                                        visitor_id: 162918540
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

            visitorChatHistoryRequest: () => {
                let visitor_id = 2419872837;

                const me = {
                    setSecondVisitor: () => ((visitor_id = 2419872836), me),
                    
                    expectToBeSent: () => {
                        const request = consultantWebSocketTester.expectSentMessageToContain({
                            name: 'consultant.get_visitor_chat_history',
                            params: {visitor_id}
                        });

                        return {
                            receiveResponse: () => request.receiveResponse({
                                chat_history: [{
                                    chat_id: 92741813,
                                    message_count: 8,
                                    operator_name: 'Снежанка Колчева',
                                    site_id: 10631,
                                    start_time: 1573205420
                                }, {
                                    chat_id: 92741814,
                                    message_count: 9,
                                    operator_name: 'Илиана Цветанова',
                                    site_id: 10631,
                                    start_time: 1573205421
                                }]
                            })
                        };
                    },

                    receiveResponse: () => me.expectToBeSent().receiveResponse()
                };

                return me;
            },

            chatStartingRequest: () => {
                const params = {
                    visitor_id: 2419872837,
                    chat_channel_id: 627662034
                };

                const response = {
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
                };

                me = {
                    setFifthVisitor: () => {
                        params.visitor_id = 720067218;
                        params.chat_channel_id = 296829352;
                        response.visitor_id = 720067218;
                        response.chat_id = 92950271;

                        return me;
                    },
                    setSeventhVisitor: () => {
                        params.visitor_id = 2419872841;
                        response.visitor_id = 2419872841;
                        response.chat_id = 42952895;

                        return me;
                    },
                    setNoChatChannelId: () => ((params.chat_channel_id = undefined), me),
                    expectToBeSent: () => {
                        const request = consultantWebSocketTester.expectSentMessageToContain({
                            name: 'consultant.chat_start',
                            params
                        });

                        const me = {
                            setNewChatId: () => ((response.chat_id = 52927204), me),
                            receiveResponse: () => request.receiveResponse(response)
                        };

                        return me;
                    },

                    receiveResponse: () => me.expectToBeSent().receiveResponse()
                };

                return me;
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

            chatClosingMessage: () => {
                let visitor_id = 2419872837;

                const me = {
                    setFifthVisitor: () => ((visitor_id = 720067218), me),
                    receive: () => consultantWebSocketTester.receiveMessage({
                        name: 'consultant.chat_close',
                        params: {visitor_id}
                    })
                };

                return me;
            },

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
                    setFifthVisitor: () => ((params.visitor_id = 720067218), message),
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
                    start_time: 1573553954,
                    id: 2419872835
                };

                const changeVisitor =
                    newVisitor => Object.entries(newVisitor).forEach(([key, value]) => (visitor[key] = value));

                const message = {
                    setSecondVisitor: () => ((visitor.id = 2419872836), message),
                    setThirdVisitor: () => ((visitor.id = 2419872837), message),
                    setFifthVisitor: () => ((visitor.id = 720067218), message),
                    setSeventhVisitor: () => ((visitor.id = 2419872841), message),
                    setThirdSite: () => (changeVisitor({
                        site_id: 10634,
                        page: [
                            'http://third-site.com/',
                            null
                        ],
                    }), message),
                    setWaiting: () => ((visitor.state = 'Ожидание'), message),
                    setNoStartTime: () => (delete(visitor.start_time), message),
                    setChatStarting: () => (changeVisitor({
                        operator_id: 210289,
                        state: 'Беседа',
                        status: 'Принято'
                    }), message),
                    setOnline: () => (changeVisitor({
                        is_online: true
                    }), message),
                    receive: () => consultantWebSocketTester.receiveMessage({
                        name: 'consultant.update_visitor',
                        params: {visitor}
                    })
                };

                return message;
            },

            visitorRequest: () => {
                let visitor_id = 2419872841;

                const visitor = {
                    ac_name: 'Посетители без рекламной кампании',
                    ad_engine: null,
                    browser: 'Chrome 77.0',
                    city: null,
                    country: null,
                    country_code: null,
                    group_id: null,
                    hit_count: 20,
                    id: 2419872841,
                    ip: '10.81.21.90',
                    operator_id: null,
                    os: 'Windows 10',
                    page: [
                        'http://eighth-site.com/',
                        null
                    ],
                    provider: null,
                    search_engine: null,
                    search_query: null,
                    site_id: 10635,
                    source_referrer: null,
                    start_page: 'http://eighth-site.com/',
                    start_time: 1573553717,
                    state: 'На сайте',
                    status: 'Отправлено',
                    traffic_source: 'direct',
                    type: 'comagic',
                    visit_count: 37,
                    visitor_card: {
                        comment: null,
                        company: null,
                        emails: [],
                        name: 'Божанка Гяурова',
                        phones: []
                    }
                };

                return {
                    setEightVisitor() {
                        visitor_id = 162918540;
                        visitor.id = 162918540;
                        visitor.type = 'whatsapp';
                        visitor.page[0] = 'http://ninth-site.com';
                        visitor.start_page = 'http://ninth-site.com';
                        visitor.visitor_card.name = 'Добринка Цончева';

                        return this;
                    },

                    expectToBeSent() {
                        const request = consultantWebSocketTester.expectSentMessageToContain({
                            name: 'consultant.get_visitor',
                            params: {visitor_id}
                        });

                        return {
                            receiveResponse: () => {
                                request.receiveResponse({visitor});
                            }
                        };
                    },

                    receiveResponse() {
                        this.expectToBeSent().receiveResponse();
                    }
                };
            },

            chatWatchRequest: () => {
                let visitor_id = 2419872837;

                const me = {
                    setFifthVisitor: () => ((visitor_id = 720067218), me),
                    setSeventhVisitor: () => ((visitor_id = 2419872841), me),
                    expectToBeSent() {
                        const request = consultantWebSocketTester.expectSentMessageToContain({
                            name: 'consultant.chat_watch',
                            params: {
                                subscribe: [visitor_id],
                                unsubscribe: []
                            }
                        });

                        return {
                            receiveResponse: () => request.receiveResponse(null)
                        };
                    },

                    receiveResponse: () => me.expectToBeSent().receiveResponse()
                };

                return me;
            },

            objectMarksRequest: () => {
                let startChatId = 92741839,
                    endChatId = 92741839;

                const responses = {
                    '0': [1555, 21618],
                    '92741841': [148, 22738]
                };

                return {
                    setSecondChat() {
                        startChatId = endChatId = 92741840;
                        return this;
                    },

                    setThirdChat() {
                        startChatId = endChatId = 92741841;
                        return this;
                    },

                    setFourthChat() {
                        startChatId = endChatId = 92950271;
                        return this;
                    },

                    setNewVisitorChat() {
                        startChatId = endChatId = 42952895;
                        return this;
                    },

                    setAnotherChats(startIndex, endIndex) {
                        startChatId = 92741842 + startIndex;
                        endChatId = 92741842 + endIndex;
                        return this;
                    },

                    expectToBeSent() {
                        let obj_id,
                            requests = {};

                        for (obj_id = startChatId; obj_id <= endChatId; obj_id ++) {
                            requests[obj_id] = consultantWebSocketTester.expectSentMessageToContain({
                                name: 'core.get_object_marks',
                                params: {
                                    obj: 'chat',
                                    obj_id
                                }
                            });
                        }

                        return {
                            receiveResponse: () => {
                                let obj_id;

                                for (obj_id in requests) {
                                    requests[obj_id].receiveResponse({
                                        object_marks: responses[obj_id] || responses['0']
                                    });
                                }
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

                    const visitors = [{
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
                        type: 'yandex.dialogs',
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
                    }, {
                        ac_name: 'Посетители без рекламной кампании',
                        ad_engine: null,
                        browser: 'Chrome 77.0',
                        city: null,
                        country: null,
                        country_code: null,
                        group_id: null,
                        hit_count: 3,
                        id: 2419872838,
                        ip: '10.81.21.87',
                        operator_id: null,
                        os: 'Windows 10',
                        page: [
                            'http://fifth-site-that-has-quite-long-url.com/',
                            null
                        ],
                        provider: null,
                        search_engine: null,
                        search_query: null,
                        site_id: 10631,
                        source_referrer: null,
                        start_page: 'http://fifth-site-that-has-quite-long-url.com/',
                        start_time: 1573553834,
                        state: 'На сайте',
                        status: 'Отправлено',
                        traffic_source: 'direct',
                        type: 'whatsapp',
                        visit_count: 35,
                        visitor_card: {
                            comment: null,
                            company: null,
                            emails: [],
                            name: 'Денка Налбантова',
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
                        chat_channel_id: 296829352,
                        id: 720067218,
                        ip: '10.81.21.91',
                        operator_id: null,
                        os: 'Windows 10',
                        page: [
                            'http://fourteenth-site.com/',
                            null
                        ],
                        provider: null,
                        search_engine: null,
                        search_query: null,
                        site_id: 10636,
                        source_referrer: null,
                        start_page: 'http://fourteenth-site.com/',
                        start_time: 1573553957,
                        state: 'На сайте',
                        status: 'Отправлено',
                        traffic_source: 'direct',
                        type: 'whatsapp',
                        visit_count: 45,
                        visitor_card: {
                            comment: null,
                            company: null,
                            emails: [],
                            name: 'Зоя Жечева',
                            phones: []
                        }
                    }];

                    const me = {
                        ommitVisitor: () => (visitors.splice(2, 1), me),
                        receiveResponse: () => request.receiveResponse({ visitors })
                    };

                    return me;
                },

                receiveResponse() {
                    this.expectToBeSent().receiveResponse();
                }
            }),

            chatsRequest: () => {
                const params = {
                    recent_offset: 0,
                    recent_limit: 100
                };

                me = {
                    setOffset: value => ((params.recent_offset = 100), me),

                    expectToBeSent: () => {
                        const request = consultantWebSocketTester.expectSentMessageToContain({
                            name: 'consultant.get_chats',
                            params
                        });

                        let startIndex = 0,
                            endIndex = 99;

                        const firstClosedChats = [{
                            chat_id: 829672,
                            chat_channel_id: 68013892,
                            is_in_transfer: false,
                            visitor_id: 93820863,
                            messages: [],
                            mark_ids: [],
                            visitor_name: 'Йовка Трифонова',
                            visitor_ext_id: 79161234570,
                            visitor_type: 'comagic',
                            page_url: 'http://fifteenth-site.com',
                        }, {
                            chat_id: 829674,
                            chat_channel_id: 68013894,
                            is_in_transfer: false,
                            visitor_id: 93820864,
                            messages: [],
                            mark_ids: [],
                            visitor_name: 'Виолета Бояджиева',
                            visitor_ext_id: 79161234571,
                            visitor_type: 'whatsapp',
                            page_url: 'http://seventeenth-site.com',
                        }, {
                            chat_id: 829673,
                            chat_channel_id: 68013893,
                            is_in_transfer: false,
                            visitor_id: 2419872836,
                            messages: [],
                            mark_ids: []
                        }];

                        const me = {
                            setRange: (index1, index2) => ((startIndex = index1), (endIndex = index2), me),

                            receiveResponse: () => {
                                request.receiveResponse({
                                    chats: [{
                                        chat_id: 92741839,
                                        chat_channel_id: 627662032,
                                        is_in_transfer: false,
                                        messages: [],
                                        visitor_id: 2419872835,
                                        mark_ids: [1555, 21618]
                                    }, {
                                        chat_id: 92741840,
                                        chat_channel_id: 627662033,
                                        is_in_transfer: false,
                                        messages: [],
                                        visitor_id: 2419872836,
                                        mark_ids: [1555, 21618]
                                    }, {
                                        chat_id: 92741841,
                                        chat_channel_id: 627662034,
                                        is_in_transfer: false,
                                        messages: [],
                                        visitor_id: 2419872837,
                                        mark_ids: [148, 22738]
                                    }, {
                                        chat_id: 7284052,
                                        chat_channel_id: null,
                                        is_in_transfer: false,
                                        messages: [],
                                        visitor_id: 720067218,
                                        mark_ids: []
                                    }, {
                                        chat_id: 29681092,
                                        chat_channel_id: 15869283,
                                        is_in_transfer: false,
                                        messages: [],
                                        visitor_id: 162918540,
                                        chat_channel_type: 'whatsapp',
                                        visitor_name: 'Добринка Цончева',
                                        visitor_ext_id: 79161234567,
                                        visitor_type: 'yandex.dialogs',
                                        page_url: 'http://ninth-site.com',
                                        mark_ids: []
                                    }, {
                                        chat_id: 29681093,
                                        chat_channel_id: null,
                                        is_in_transfer: false,
                                        messages: [],
                                        visitor_id: 162918541,
                                        chat_channel_type: null,
                                        visitor_name: 'Росица Нинкова',
                                        visitor_ext_id: 79161234568,
                                        visitor_type: 'yandex.dialogs',
                                        page_url: 'http://tenth-site.com',
                                        mark_ids: []
                                    }, {
                                        chat_id: 29681094,
                                        chat_channel_id: null,
                                        is_in_transfer: false,
                                        messages: [],
                                        visitor_id: 162918542,
                                        chat_channel_type: null,
                                        visitor_name: '',
                                        visitor_ext_id: 79161234569,
                                        visitor_type: 'whatsapp',
                                        page_url: 'http://eleventh-site.com',
                                        mark_ids: []
                                    }, {
                                        chat_id: 29681095,
                                        chat_channel_id: null,
                                        is_in_transfer: false,
                                        messages: [],
                                        visitor_id: 162918543,
                                        chat_channel_type: null,
                                        visitor_name: '',
                                        visitor_ext_id: null,
                                        visitor_type: 'whatsapp',
                                        page_url: 'http://twelfth-site.com',
                                        mark_ids: []
                                    }, {
                                        chat_id: 29681096,
                                        chat_channel_id: null,
                                        is_in_transfer: false,
                                        messages: [],
                                        visitor_id: 162918544,
                                        mark_ids: []
                                    }],
                                    recent_chats: (() => {
                                        let i;
                                        const result = [];

                                        for (i = startIndex; i <= endIndex; i ++) {
                                            result.push(i < firstClosedChats.length ? firstClosedChats[i] : {
                                                chat_id: 92741842 + (i - firstClosedChats.length),
                                                chat_channel_id: 627662035 + (i - firstClosedChats.length),
                                                is_in_transfer: false,
                                                visitor_id: 2419872838,
                                                messages: [{
                                                    date: 1573737106 + (i - firstClosedChats.length) * 13 * 60 * 60 +
                                                        14 * 60 * (i - firstClosedChats.length),
                                                    from: 'Посетитель',
                                                    message:
                                                        `Приветствую вас в ${i - firstClosedChats.length + 1}-й раз!`,
                                                    source: 'Посетитель'
                                                }],
                                                mark_ids: []
                                            });
                                        }

                                        return result;
                                    })()
                                });
                            }
                        };

                        return me;
                    },

                    receiveResponse: () => me.expectToBeSent().receiveResponse()
                };

                return me;
            },

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
                                    },
                                    '1555': {
                                        is_system: true,
                                        mnemonic: 'sale',
                                        name: 'Продажа'
                                    },
                                    '1556': {
                                        is_system: true,
                                        mnemonic: 'goal_contact',
                                        name: 'Лид'
                                    },
                                    '21618': {
                                        is_system: true,
                                        mnemonic: 'delayed_call',
                                        name: 'Отложенный звонок'
                                    },
                                    '22738': {
                                        is_system: false,
                                        mnemonic: null,
                                        name: 'Подозрительный звонок'
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
                                    },
                                    '10631': {
                                        domain: 'fifth-site-that-has-quite-long-url.com',
                                        is_file_transfer_available: true,
                                        min_duration_for_invite: 0
                                    },
                                    '10632': {
                                        domain: 'sixth-site.com',
                                        is_file_transfer_available: true,
                                        min_duration_for_invite: 0
                                    },
                                    '10633': {
                                        domain: 'seventh-site.com',
                                        is_file_transfer_available: true,
                                        min_duration_for_invite: 0
                                    },
                                    '10634': {
                                        domain: 'third-site.com',
                                        is_file_transfer_available: true,
                                        min_duration_for_invite: 0
                                    },
                                    '10635': {
                                        domain: 'eighth-site.com',
                                        is_file_transfer_available: true,
                                        min_duration_for_invite: 0
                                    },
                                    '10636': {
                                        domain: 'http://fourteenth-site.com/',
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
