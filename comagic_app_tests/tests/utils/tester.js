define(() => function ({
    testersFactory,
    utils,
    ajax,
    debug,
    fetch,
    spendTime,
    softphoneTester: me,
    isAlreadyAuthenticated = false,
    appName = '',
    webSockets,
    path = '/',
    image
}) {
    let history,
        eventBus,
        chatsRootStore;
    const mainTester = me;

    const jwtToken = {
        jwt: 'XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0',
        refresh: '2982h24972hls8872t2hr7w8h24lg72ihs7385sdihg2'
    };

    const anotherJwtToken = {
        jwt: '935jhw5klatxx2582jh5zrlq38hglq43o9jlrg8j3lqj8jf',
        refresh: '4g8lg282lr8jl2f2l3wwhlqg34oghgh2lo8gl48al4goj48'
    };

    isAlreadyAuthenticated && (appName ? localStorage.setItem('electronCookies', JSON.stringify({
        '$REACT_APP_AUTH_COOKIE': JSON.stringify(jwtToken)
    })) : (
        document.cookie =
        '%5C%24REACT_APP_AUTH_COOKIE=%7B%22' +
        'jwt%22%3A%22XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0%22%2C%22' +
        'refresh%22%3A%222982h24972hls8872t2hr7w8h24lg72ihs7385sdihg2%22%7D; ' +
        'path=/; secure; domain=0.1; expires=Sat, 20 Nov 2021 12:15:07 GMT'
    ));

    window.rootConfig = {appName};
    window.crossTabCommunicatorCache = {};
    window.softphoneCrossTabCommunicatorCache = {};

    me.ReactDOM = {
        flushSync: () => null
    };

    window.application.run({
        setReactDOM: value => (me.ReactDOM = value),
        setEventBus: eventBus => {
            const events = {};

            eventBus.subscribe = (eventName, callback) => {
                const callbacks = events[eventName] || (events[eventName] = new Set());
                callbacks.add(callback);

                return () => callbacks.delete(callback);
            };

            const broadcast = (eventName, ...args) =>
                (events[eventName] || new Set()).forEach(callback => callback(...args));

            const stack = new JsTester_Stack({
                expectNotToExist: () => null,
                expectToHaveArguments: (...expectedArguments) => {
                    throw new Error(
                        `Событие должно быть вызывано с такими аргументами ${JSON.stringify(expectedArguments)}, ` +
                        'тогда как никакое событие не было вызвано.'
                    );
                },
                expectEventNameToEqual: expectedEventName => {
                    throw new Error(
                        `Должно быть вызывано событие "${expectedEventName}", тогда как никакое событие не было ` +
                        `вызвано.`
                    );
                }
            });

            eventBus.broadcast = (actualEventName, ...args) => {
                const callStack = debug.getCallStack();

                const event = {
                    expectToHaveArguments: (...expectedArguments) =>
                        (utils.expectObjectToContain(args, expectedArguments), event),
                    expectNotToExist: () => {
                        throw new Error(
                            `Никакое событие не должно быть вызвано, тогда как было вызвано событие ` +
                            `"${actualEventName}" с аргументами ${JSON.stringify(args)}`
                        );
                    },
                    expectEventNameToEqual: expectedEventName => {
                        if (expectedEventName != actualEventName) {
                            throw new Error(
                                `Должно быть вызывано событие "${expectedEventName}", тогда как было вызвано событие ` +
                                `"${actualEventName}".`
                            );
                        }

                        return event;
                    }
                };

                stack.add(event);
                broadcast(actualEventName, ...args);
            };

            me.eventBus = {
                broadcast,
                nextEvent: () => stack.pop()
            };
        },
        setHistory: value => (history = value),
        setChatsRootStore: value => (chatsRootStore = value),
        appName
    });

    me.history = history;
    history.replace(path);

    Promise.runAll(false, true);
    spendTime(0);
    Promise.runAll(false, true);
    spendTime(0);
    Promise.runAll(false, true);

    me.ReactDOM.flushSync();

    me.history = history;

    const createBottomButtonTester = tester => {
        tester.expectToBeDisabled = () => tester.expectToHaveClass('cmg-button-disabled');
        tester.expectToBeEnabled = () => tester.expectNotToHaveClass('cmg-button-disabled');

        return tester;
    };

    me.callsHistoryButton = (tester => {
        const click = tester.click.bind(tester);
        tester.click = () => (click(), Promise.runAll(false, true));

        return createBottomButtonTester(tester);
    })(testersFactory.createDomElementTester('.cmg-calls-history-button'));

    me.settingsButton = createBottomButtonTester(testersFactory.createDomElementTester('.cmg-settings-button'));

    const addTesters = (me, getRootElement) => {
        me.userName = (tester => {
            const putMouseOver = tester.putMouseOver.bind(tester),
                click = tester.click.bind(tester);

            tester.putMouseOver = () => (putMouseOver(), spendTime(100), spendTime(100));
            tester.click = () => (click(), spendTime(0));

            return createBottomButtonTester(tester);
        })(testersFactory.createDomElementTester(() => utils.element(getRootElement()).querySelector(
            '.cm-user-only-account--username, .cm-chats--account'
        )));

        me.spin = testersFactory.createDomElementTester(() => utils.element(getRootElement()).
            querySelector('.ui-spin-icon-default, .clct-spinner'));

        me.anchor = text => testersFactory.createAnchorTester(() =>
            utils.descendantOf(getRootElement()).matchesSelector('a').textEquals(text).find());

        me.link = testersFactory.createDomElementTester(() =>
            utils.element(getRootElement()).querySelector('.cmg-softphone-call-history-phone-link'));

        me.textarea = testersFactory.createTextFieldTester(() =>
            utils.element(getRootElement()).querySelector('textarea'));

        const getSvg = selector => {
            const tester = testersFactory.createDomElementTester(() =>
                utils.element(getRootElement()).querySelector(selector));

            const click = tester.click.bind(tester);

            tester.click = () => {
                click();
                spendTime(0);
                spendTime(10);
            };

            return tester;
        };

        me.playIcon = getSvg('.play_svg__cmg-icon');
        me.downloadIcon = getSvg('.download_svg__cmg-icon');
        me.svg = getSvg('svg');

        me.table = (() => {
            const getTable = () => utils.element(getRootElement()).querySelector('.ant-table, .ui-table'),
                tester = testersFactory.createDomElementTester(getTable);

            const getHeaderColumnIndex = text => {
                let i;
                const columns = document.querySelectorAll('.ant-table-thead th, .ui-table-header-cell-th'),
                    {length} = columns;

                for (i = 0; i < length; i ++) {
                    const column = columns[i];

                    if (text == utils.getTextContent(column)) {
                        return i;
                    }
                }

                return -1;
            };

            tester.row = {
                atIndex: index => {
                    const getRow = () => (
                        getRootElement().querySelectorAll('.ant-table-row, .ui-table-body-row') || []
                    )[index] || new JsTester_NoElement();

                    const tester = testersFactory.createDomElementTester(getRow);

                    tester.column = {
                        atIndex: index => {
                            const getColumn = () => (
                                getRow().querySelectorAll('td') || []
                            )[index] || new JsTester_NoElement();

                            const tester = testersFactory.createDomElementTester(getColumn);
                            addTesters(tester, getColumn);

                            return tester;
                        },

                    };

                    tester.column.withHeader = text => tester.column.atIndex(getHeaderColumnIndex(text))

                    Object.defineProperty(tester.column, 'first', {
                        get: () => tester.column.atIndex(0)
                    });

                    return tester;
                } 
            };

            tester.row.first = tester.row.atIndex(0);

            Object.defineProperty(tester, 'pagingPanel', {
                get: () => {
                    const getPagingPanel = () => utils.element(getTable()).querySelector('.ui-pagination'),
                        tester = testersFactory.createDomElementTester(getPagingPanel);

                    tester.pageButton = text => (() => {
                        const getLi = () => utils.
                            descendantOf(getPagingPanel()).
                            matchesSelector('.ui-pagination-btns-pages__item').
                            textEquals(text).
                            find();

                        const tester = testersFactory.createDomElementTester(getLi);

                        const anchorTester = testersFactory.createDomElementTester(() =>
                            utils.element(getLi()).querySelector('a'));

                        const click = anchorTester.click.bind(anchorTester);
                        tester.click = () => (click(), Promise.runAll(false, true));

                        tester.expectToBePressed = () => tester.
                            expectToHaveClass('ui-pagination-btns-pages__item--active');
                        tester.expectNotToBePressed = () => tester.
                            expectNotToHaveClass('ui-pagination-btns-pages__item--active');

                        return tester;
                    })();

                    return addTesters(tester, getPagingPanel);
                }
            });

            return tester;
        })();

        const rootTester = utils.element(getRootElement);
        
        me.calendarField = (() => {
            const getPopup = () => utils.querySelector('.cm-calendar, .ui-date-range-picker-popover'),
                popupTester = testersFactory.createDomElementTester(getPopup),
                getPicker = () => rootTester.querySelector('.ui-date-range-picker, .cm-calendar__field'),
                tester = testersFactory.createDomElementTester(getPicker),
                click = tester.click.bind(tester),
                inputTester = testersFactory.createTextFieldTester(() => getPicker().querySelector('input'));

            const getMonthPanel = index => {
                const getMonthPanel = () => 
                    getPopup().querySelectorAll('.cm-calendar__months__item, .ui-date-range-picker-month')[index] ||
                    new JsTester_NoElement();

                const monthPanelTester = testersFactory.createDomElementTester(getMonthPanel);

                monthPanelTester.title = testersFactory.createDomElementTester(() =>
                    getMonthPanel().querySelector('.cm-calendar__months__item__title, .ui-date-range-picker-header'));

                monthPanelTester.day = day => {
                    const tester = testersFactory.createDomElementTester(() => utils.
                        descendantOf(getMonthPanel()).
                        matchesSelector('.cm-calendar__days__item__text, .ui-date-range-picker-cell-container').
                        textEquals(day + '').
                        find());

                    const click = tester.click.bind(tester);
                    tester.click = () => (click(), spendTime(0));
                    
                    return tester;
                };

                return monthPanelTester;
            };

            popupTester.firstMonthPanel = getMonthPanel(0);
            popupTester.secondMonthPanel = getMonthPanel(1);
            popupTester.thirdMonthPanel = getMonthPanel(2);

            popupTester.leftButton = testersFactory.createDomElementTester(() =>
                getPopup().querySelector('.ui-date-range-picker-header-nav-icon-left'));
            popupTester.rightButton = testersFactory.createDomElementTester(() =>
                getPopup().querySelector('.ui-date-range-picker-header-nav-icon-right'));

            tester.expectToHaveValue = inputTester.expectToHaveValue.bind(inputTester);
            tester.click = () => (click(), spendTime(0));

            Object.defineProperty(tester, 'popup', {
                get: function () {
                    return addTesters(popupTester, getPopup);
                }
            })

            return tester;
        })();

        !me.audioPlayer && Object.defineProperty(me, 'audioPlayer', {
            get: () => {
                const getPlayer = () => utils.element(getRootElement()).querySelector('.ui-audio-player'),
                    tester = testersFactory.createDomElementTester(getPlayer);

                addTesters(tester, getPlayer);

                const atIndex = tester.button.atIndex.bind(tester.button);

                tester.button.atIndex = index => {
                    const tester = atIndex(index),
                        putMouseOver = tester.putMouseOver.bind(tester);

                    tester.putMouseOver = () => {
                        putMouseOver();
                        spendTime(100);
                        spendTime(0);
                        return tester;
                    };

                    return tester;
                };

                return tester;
            }
        });

        me.stopCallButton = testersFactory.createDomElementTester(() =>
            rootTester.querySelector('.cmg-call-button-stop'));

        me.callStartingButton = testersFactory.createDomElementTester(() =>
            rootTester.querySelector('.cmg-call-button-start'));

        me.slider = (() => {
            const tester = testersFactory.createDomElementTester(() =>
                (getRootElement() || new JsTester_NoElement()).querySelector('.ant-slider-track, .ui-slider-rail'))

            const click = tester.click.bind(tester);
            tester.click = (...args) => (click(...args), spendTime(100));

            return tester;
        })();

        me.radioButton = text => {
            const tester = testersFactory.createDomElementTester(utils.descendantOf(getRootElement()).
                textEquals(text).
                matchesSelector('.ui-radio-wrapper, .cm-radio-button').
                find());

            tester.expectToBeSelected = () => tester.expectToHaveClass('ui-radio-wrapper-checked');
            tester.expectNotToBeSelected = () => tester.expectNotToHaveClass('ui-radio-wrapper-checked');

            return tester;
        };

        const buttonSelector = 
            'button, ' +
            '.ui-pagination-btns-pages__item, ' +
            '.clct-c-button, ' +
            '.ui-radio-content, ' +
            '.cmg-switch-label, ' +
            '.src-components-main-menu-nav-item-styles-module__label, ' +
            '.src-components-main-menu-settings-styles-module__label, ' +
            '.src-components-main-menu-menu-link-styles-module__item a';

        me.button = text => {
            let domElement = utils.descendantOf(getRootElement()).
                textEquals(text).
                matchesSelector(buttonSelector).
                find();

            domElement = domElement.querySelector('a') || domElement;

            const fieldTester = testersFactory.createDomElementTester(() => (
                domElement.closest('.ui-radio-wrapper, .cmg-switch-wrapper') || new JsTester_NoElement()
            ).querySelector('.ui-radio, .ui-switch'));

            const tester = testersFactory.createDomElementTester(domElement),
                click = tester.click.bind(tester);

            const isSwitch = (() => {
                try {
                    return domElement.classList.contains('cmg-switch-label')
                } catch (e) {
                    return false;
                }
            })();
            
            tester.click = () => {
                isSwitch ? fieldTester.click() : click();

                Promise.runAll(false, true);
                spendTime(0);
                Promise.runAll(false, true);
            };

            const checkedClass = isSwitch ? 'ui-switch-checked' : 'ui-radio-checked',
                menuItemSelectedClass = 'src-components-main-menu-nav-item-styles-module__item-selected';

            const menuItem = testersFactory.createDomElementTester(() =>
                domElement.closest('.src-components-main-menu-nav-item-styles-module__item'));

            tester.expectToBePressed = () => menuItem.expectToHaveClass(menuItemSelectedClass);
            tester.expectNotToBePressed = () => menuItem.expectNotToHaveClass(menuItemSelectedClass);
            tester.expectToBeChecked = () => fieldTester.expectToHaveClass(checkedClass);
            tester.expectNotToBeChecked = () => fieldTester.expectNotToHaveClass(checkedClass);
            tester.expectToBeEnabled = () => fieldTester.expectNotToHaveClass('ui-switch-disabled');
            tester.expectToBeDisabled = () => fieldTester.expectToHaveClass('ui-switch-disabled');
            
            return tester;
        };

        me.button.atIndex = index => testersFactory.createDomElementTester(() =>
            utils.element(getRootElement()).querySelectorAll(buttonSelector)[index] || new JsTester_NoElement());

        me.button.first = me.button.atIndex(0);

        me.switchButton = (() => {
            const tester = testersFactory.createDomElementTester('.ui-switch'),
                checkedClass = 'ui-switch-checked',
                disabledClass = 'ui-switch-disabled';

            tester.expectToBeChecked = () => tester.expectToHaveClass(checkedClass);
            tester.expectNotToBeChecked = () => tester.expectNotToHaveClass(checkedClass);
            tester.expectToBeDisaled = () => tester.expectToHaveClass(disabledClass)
            tester.expectToBeEnabled = () => tester.expectNotToHaveClass(disabledClass)

            return tester;
        })();

        me.select = (getSelectField => {
            const createTester = (filter = () => true) => {
                const tester = testersFactory.createDomElementTester(() => getSelectField(filter)),
                    click = tester.click.bind(tester);

                const selectTester = testersFactory.createDomElementTester(() =>
                    getSelectField(filter).closest('.ui-select'));

                tester.click = () => (click(), spendTime(0));

                tester.arrow = (tester => {
                    const click = tester.click.bind(tester);

                    tester.click = () => (click(), spendTime(0));
                    return tester;
                })(testersFactory.createDomElementTester(
                    () => getSelectField(filter).closest('.ui-select-container').querySelector('.ui-icon svg')
                ));

                tester.popup = testersFactory.createDomElementTester(() => (
                    utils.getVisibleSilently(document.querySelectorAll('.ui-select-popup')) || new JsTester_NoElement()
                ).closest('div'));

                tester.tag = text => {
                    const getTag = () =>  utils.descendantOf(getRootElement()).
                        textEquals(text).
                        matchesSelector('.cmg-softphone-call-history-marks-popup-value').
                        find();

                    const tester = testersFactory.createDomElementTester(getTag);

                    tester.closeButton = (() => {
                        const tester = testersFactory.createDomElementTester(() =>
                            utils.element(getTag()).querySelector('svg'));

                        const click = tester.click.bind(tester);
                        tester.click = () => (click(), spendTime(0));

                        return tester;
                    })();

                    return tester;
                };
                
                tester.option = text => {
                    const option = utils.descendantOfBody().matchesSelector('.ui-list-option').textEquals(text).find(),
                        tester = testersFactory.createDomElementTester(option),
                        click = tester.click.bind(tester),
                        checkbox = option.querySelector('.ui-checkbox');

                    tester.click = () => (click(), Promise.runAll(false, true), spendTime(0), spendTime(0), tester);

                    tester.expectToBeSelected = logEnabled => {
                        if (!checkbox.classList.contains('ui-checkbox-checked')) {
                            throw new Error(`Опиция "${text}" должна быть отмечена.`);
                        }
                    };

                    tester.expectNotToBeSelected = () => {
                        if (checkbox.classList.contains('ui-checkbox-checked')) {
                            throw new Error(`Опиция "${text}" не должна быть отмечена.`);
                        }
                    };

                    return tester;
                };

                tester.expectToBeDisaled = () => selectTester.expectToHaveClass('ui-select-disabled');
                tester.expectToBeEnabled = () => selectTester.expectNotToHaveClass('ui-select-disabled');

                return tester;
            };

            const tester = createTester();
            tester.withValue = expectedValue => createTester(select => utils.getTextContent(select) == expectedValue);

            tester.withPlaceholder = expectedPlaceholder => createTester(select => utils.getTextContent(
                select.querySelector('.ui-select-placeholder') ||
                new JsTester_NoElement()
            ) == expectedPlaceholder);

            return tester;
        })((filter = () => true) => [
            '.ui-select-field',
            '.ui-select'
        ].reduce((domElement, selector) => domElement || utils.getVisibleSilently(
            Array.prototype.slice.call(
                (
                    getRootElement() ||
                    new JsTester_NoElement()
                ).querySelectorAll(selector),

                0
            ).filter(filter)
        ), null) || new JsTester_NoElement())

        {
            const getInputs = () =>
                Array.prototype.slice.call((getRootElement() || new JsTester_NoElement()).querySelectorAll('input'), 0);
            const getInput = () => utils.getVisibleSilently(getInputs());

            const addMethods = getInput => {
                const tester = testersFactory.createTextFieldTester(getInput),
                    fill = tester.fill.bind(tester),
                    input = tester.input.bind(tester),
                    click = tester.click.bind(tester);

                tester.click = () => (click(), spendTime(0), spendTime(0), tester);
                tester.fill = value => (fill(value), Promise.runAll(false, true), tester); 
                tester.input = value => (input(value), Promise.runAll(false, true)), tester; 

                tester.clearIcon = testersFactory.createDomElementTester(
                    () => getInput().closest('.ui-input').querySelector('.ui-input-suffix-close')
                );

                return tester;
            };

            me.input = addMethods(getInput);
            me.input.atIndex = index => addMethods(() => getInputs()[index]);
            me.input.first = me.input.atIndex(0);

            me.input.withPlaceholder = placeholder => addMethods(() =>
                utils.getVisibleSilently(getInputs().filter(input => input.placeholder == placeholder)));

            me.input.withFieldLabel = label => {
                const labelEl = utils.descendantOf(getRootElement()).
                    textEquals(label).
                    matchesSelector('.ui-label-content-field-label').
                    find();

                const row = labelEl.closest('.ant-row'),
                    input = (row || labelEl.closest('.ui-label')).querySelector('input');

                return addMethods(() => input);
            };
        }

        return me;
    };

    me.modalWindow = (() => {
        const getModalWindow = () => utils.querySelector('.clct-modal, .ui-modal'),
            windowTester = addTesters(testersFactory.createDomElementTester(getModalWindow), getModalWindow);

        windowTester.closeButton = (() => {
            const tester = testersFactory.createDomElementTester(() =>
                utils.element(getModalWindow()).querySelector('.ui-modal-close-x'));

            const click = tester.click.bind(tester);

            tester.click = () => {
                click();
                windowTester.endTransition();
            };

            return tester;
        })();

        return windowTester;
    })();

    const createRootTester = selector => {
        const getRootElement = () => document.querySelector(selector) || new JsTester_NoElement();

        return addTesters(
            testersFactory.createDomElementTester(getRootElement),
            getRootElement
        );
    };

    const addAuthErrorResponseModifiers = (me, response) => {
        me.accessTokenExpired = () => {
            Object.keys(response).forEach(key => delete(response[key]));

            response.error = {
                code: 401,
                message: 'Время действия токена истекло',
                request: null,
                data: {
                    mnemonic: 'access_token_expired',
                    field: '',
                    value: '',
                    params: null
                }
            };

            return me;
        };

        return me;
    };

    me.expectChatsStoreToContain = expectedContent => {
        utils.expectObjectToContain(chatsRootStore.toJSON(), expectedContent);
    };

    me.messageListRequest = () => {
        let params = {
            visitor_id: 16479303
        };

        let data = [{
            id: 482058,
            source: 'operator',
            text: 'Привет',
            date: '2020-02-10 12:13:14',
            status: 'delivered',
            chat_id: 2718935,
            reply_to: null,
            resource: null,
            resourceName: null,
            employee_id: 20816,
            employee_name: 'Карадимова Веска Анастасовна',
            visitor_name: 'Помакова Бисерка Драгановна',
            front_message_uuid: '228gj24og824jgo8d',
            error_mnemonic: null
        }];

        return {
            anotherChat() {
                params = {
                    chat_id: 2718936
                };

                data[0].id = 482059;
                data[0].text = 'Здравствуй';
                data[0].chat_id = 2718936;

                return this;
            },

            chat() {
                params = {
                    chat_id: 2718935
                };

                return this;
            },

            receiveResponse() {
                ajax.recentRequest().
                    expectToHaveMethod('POST').
                    expectPathToContain('logic/operator').
                    expectBodyToContain({
                        method: 'get_message_list',
                        params
                    }).respondSuccessfullyWith({
                        result: {data}
                    });

                Promise.runAll(false, true);
                spendTime(0)
            }
        };
    };

    me.operatorStatusUpdateRequest = () => ({
        receiveResponse() {
            ajax.recentRequest().
                expectToHaveMethod('PATCH').
                expectPathToContain('logic/operator/status').
                expectBodyToContain({
                    status: 2
                }).respondSuccessfullyWith({
                    data: true
                });

            Promise.runAll(false, true);
            spendTime(0)
        }
    });

    me.changeMessageStatusRequest = () => ({
        expectToBeSent() {
            const request = ajax.recentRequest().
                expectPathToContain('logic/operator').
                expectBodyToContain({
                    method: 'change_message_status',
                    params: {
                        chat_id: 2718935,
                        message_id: 256085,
                        status: 'delivered'
                    }
                });

            return {
                receiveResponse() {
                    request.respondSuccessfullyWith({
                        data: true
                    });

                    Promise.runAll(false, true);
                    spendTime(0)
                }
            };
        },

        receiveResponse() {
            this.expectToBeSent().receiveResponse();
        }
    });

    me.operatorOfflineMessageListRequest = () => ({
        expectToBeSent(requests) {
            const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                expectPathToContain('logic/operator/offline_message/list').
                expectBodyToContain({
                    statuses: ['not_processed', 'processing'],
                    limit: 1000,
                    offset: 0
                });

            return {
                receiveResponse() {
                    request.respondSuccessfullyWith({
                        data: [{
                            date_time: '2022-01-20T21:37:14',
                            email: '',
                            id: 178073,
                            mark_ids: [],
                            message: 'Привет.',
                            phone: '71231212122',
                            site_id: 2157,
                            status: 'not_processed',
                            visitor_id: 16479303,
                            visitor_name: 'Помакова Бисерка Драгановна',
                            visitor_type: 'omni'
                        }]
                    });

                    Promise.runAll(false, true);
                    spendTime(0)
                }
            };
        },

        receiveResponse() {
            this.expectToBeSent().receiveResponse();
        }
    });

    me.chatsWebSocket = (() => {
        const getWebSocket = index => webSockets.getSocket('wss://lobarev.dev.uis.st/ws', index);

        return {
            connect: () => getWebSocket(0).connect(),
            expectSentMessageToContain: message => getWebSocket(0).expectSentMessageToContain(message),
            receive: message => getWebSocket(0).receiveMessage(message)
        };
    })();

    me.chatsEmployeeChangeMessage = () => ({
        receive: () => me.chatsWebSocket.receive(JSON.stringify({
            method: 'employee_update',
            params: {
                id: 20816,
                status_id: 2
            }
        }))
    });

    me.chatsInitMessage = () => ({
        expectToBeSent: () => me.chatsWebSocket.expectSentMessageToContain({
            method: 'init',
            params: {
                access_token: 'XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0',
                access_type: 'jwt',
                employee_id: 20816
            }
        })
    });

    me.transferCreatingMessage = () => {
        const params = {
            chat: {
                chat_channel_id: 101,
                chat_channel_type: 'telegram',
                date_time: '2022-01-23T16:24:21.098210',
                id: 2718936,
                last_message: {
                    message: 'Больше не могу разговаривать с тобой, дай мне Веску!',
                    date: '2022-03-24T14:08:23.000Z',
                    is_operator: false,
                    resource_type: null
                },
                mark_ids: ['316', '579'],
                phone: null,
                site_id: 4663,
                status: 'active',
                visitor_id: 16479304,
                visitor_name: 'Върбанова Илиана Милановна',
                visitor_type: 'omni'
            },
            comment: 'Поговори с ней сама, я уже устала',
            from_employee_id: 20817
        };

        return {
            receive: () => me.chatsWebSocket.receive(JSON.stringify({
                method: 'create_transfer',
                params 
            }))
        };
    };

    me.newMessage = () => {
        const params = {
            chat_id: 2718935,
            message: {
                id: 256085,
                source: 'visitor',
                text: 'Я люблю тебя',
                date: '2021-02-21T12:24:53.000Z',
                status: null,
                chat_id: 2718935,
                reply_to: null,
                resource: null,
                resourceName: null,
                employee_id: 20816,
                employee_name: 'Карадимова Веска Анастасовна',
                visitor_name: 'Помакова Бисерка Драгановна',
                front_message_uuid: '2go824jglsjgl842d',
                error_mnemonic: null
            },
            visitor_id: 16479303,
            employee_id: 20816,
            front_message_uuid: '2go824jglsjgl842d',
        };

        return {
            withoutText() {
                params.message.text = '';
                return this;
            },

            fromOperator() {
                params.message.source = 'operator';
                return this;
            },

            withAttachment() {
                params.message.resource = {
                    id: 5829572,
                    type: 'photo',
                    mime: 'image/png',
                    filename: 'heart.png',
                    size: 925,
                    width: 48,
                    height: 48,
                    duration: null,
                    payload: `data:image/png;base64,${image}`,
                    thumbs: {
                        '100x100': {
                            payload: image
                        }
                    }
                };

                return this;
            },

            receive: () => me.chatsWebSocket.receive(JSON.stringify({
                method: 'new_message',
                params 
            }))
        };
    };

    me.newChatCreatingMessage = () => {
        const params = {
            chat_id: 2718937,
            chat_channel_id: 101,
            visitor_id: 16479305,
            visitor_name: 'Томова Денка Райчовна',
            site_id: 4664,
            context: {
                phone: '79168283481'
            }
        };

        return {
            receive: () => me.chatsWebSocket.receive(JSON.stringify({
                method: 'new_chat',
                params 
            }))
        };
    };

    me.chatAcceptedMessage = () => {
        const params = {
            chat_id: 2718936,
            employee_id: 20816
        };

        return {
            anotherEmployee() {
                params.employee_id = 20817;
                return this;
            },

            newChat() {
                params.chat_id = 2718935;
                return this;
            },

            receive: () => me.chatsWebSocket.receive(JSON.stringify({
                method: 'chat_accepted',
                params 
            }))
        };
    };

    me.chatClosedMessage = () => {
        const params = {
            chat_id: 2718936
        };

        return {
            newChat() {
                params.chat_id = 2718935;
                return this;
            },

            receive: () => me.chatsWebSocket.receive(JSON.stringify({
                method: 'chat_closed',
                params 
            }))
        };
    };
    
    this.connectEventsWebSocket = function (index) {
        this.getEventsWebSocket(index).connect();
    };

    me.userLogoutRequest = () => ({
        expectToBeSent() {
            const request = ajax.recentRequest().
                expectPathToContain('$REACT_APP_AUTH_URL').
                expectToHaveMethod('POST').
                expectBodyToContain({
                    method: 'logout',
                    params: {
                        jwt: 'XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0'
                    }
                });

            return {
                receiveResponse() {
                    request.respondSuccessfullyWith({
                        result: {
                            data: {
                                success: true
                            }
                        }
                    });

                    Promise.runAll(false, true);
                    spendTime(0)
                }
            };
        },

        receiveResponse() {
            this.expectToBeSent().receiveResponse();
        }
    });

    me.notProcessedCallsRequest = () => {
        const queryParams = {
            offset: '0',
            limit:  '10',
            date_from: '2019-12-16T00:00:00.000+03:00',
            date_till: '2019-12-19T23:59:59.999+03:00',
            from: undefined,
            to: undefined,
            call_directions: 'in,out',
            call_types: 'external,internal',
            is_not_processed: 'null',
            is_processed_by_any: undefined,
            group_ids: []
        };

        const addGroup = groupId => (queryParams.group_ids || (queryParams.group_ids = [])).push(groupId);

        return {
            isNotProcessedByAny() {
                this.notProcessed();
                queryParams.is_processed_by_any = '0';
                return this;
            },

            isProcessedByAny() {
                this.notProcessed();
                queryParams.is_processed_by_any = '1';
                return this;
            },

            notProcessed() {
                queryParams.is_not_processed = undefined;
                return this;
            },

            incoming() {
                this.notProcessed();
                queryParams.call_directions = 'in';
                return this;
            },

            outgoing() {
                this.notProcessed();
                queryParams.call_directions = 'out';
                return this;
            },

            external() {
                this.notProcessed();
                queryParams.call_types = 'external';
                return this;
            },

            internal() {
                this.notProcessed();
                queryParams.call_types = 'internal';
                return this;
            },

            group() {
                this.notProcessed();
                addGroup(89203);
                return this;
            },

            secondGroup() {
                this.notProcessed();
                addGroup(82958);
                return this;
            },

            thirdGroup() {
                this.notProcessed();
                addGroup(17589);
                return this;
            },

            receiveResponse() {
                queryParams.group_ids && (queryParams.group_ids = queryParams.group_ids.join(','));

                ajax.recentRequest().
                    expectPathToContain('/sup/api/v1/not_processed_calls').
                    expectToHaveMethod('GET').
                    expectQueryToContain(queryParams).
                    respondSuccessfullyWith({
                        success: true,
                        data: [{
                            call_session_id: 980925444,
                            comment: null,
                            phone_book_contact_id: null,
                            direction: 'in',
                            duration: 20,
                            contact_name: null,
                            mark_ids: [],
                            subscriber_number: '74950230625',
                            virtual_number: '74950230630',
                            start_time: '2019-12-19T08:03:02.522+03:00',
                            is_lost: true
                        }, {
                            call_session_id: 980925445,
                            comment: null,
                            phone_book_contact_id: null,
                            direction: 'in',
                            duration: 24,
                            contact_name: null,
                            mark_ids: [],
                            subscriber_number: '74950230626',
                            virtual_number: '74950230631',
                            start_time: '2019-12-19T10:13:02.529+03:00',
                            is_lost: false
                        }]
                    });

                Promise.runAll(false, true);
            }
        };
    };

    me.commentUpdatingRequest = () => {
        let call_session_id = '980925444';

        const bodyParams = {
            comment: 'Другой комментарий'
        };

        return {
            anotherCall() {
                call_session_id = '980925445';
                return this;
            },

            empty() {
                bodyParams.comment = '';
                return this;
            },

            receiveResponse() {
                ajax.recentRequest().expectPathToContain(`/sup/api/v1/users/me/calls/${call_session_id}`).
                    expectToHaveMethod('PATCH').
                    expectBodyToContain(bodyParams).
                    respondSuccessfullyWith(true);

                Promise.runAll(false, true);

                utils.isVisible(utils.querySelector('.clct-modal, .ui-modal')) &&
                    mainTester.modalWindow.endTransition();
            }
        };
    };

    me.markAddingRequest = () => ({
        receiveResponse: () => {
            ajax.recentRequest().
                expectToHaveMethod('PUT').
                expectPathToContain('/sup/api/v1/users/me/calls/980925444/marks/148').
                respondSuccessfullyWith(true);

            Promise.runAll(false, true);
        }
    });

    me.markDeletingRequest = () => {
        let id = '88';

        return {
            anotherMark() {
                id = '495';
                return this;
            },

            receiveResponse: () => {
                ajax.recentRequest().
                    expectToHaveMethod('DELETE').
                    expectPathToContain(`/sup/api/v1/users/me/calls/980925444/marks/${id}`).
                    respondSuccessfullyWith(true);

                Promise.runAll(false, true);
            }
        };
    };

    me.talkRecordRequest = () => {
        let path = 'https://app.comagic.ru/system/media/talk/1306955705/3667abf2738dfa0a95a7f421b8493d3c/';

        return {
            setFullRecord() {
                path = 'https://proxy.dev.uis.st:9099/files/session/1378329557/a463d88a0e55599eba24c3f4638fc17c';
                return this;
            },

            setSecond() {
                path = 'https://app.comagic.ru/system/media/talk/1306955705/baf9be6ace6b0cb2f9b0e1ed0738db1a/';
                return this;
            },

            setThird() {
                path = 'https://app.comagic.ru/system/media/talk/2938571928/2fj923fholfr32hlf498f8h18f1hfl1c/';
                return this;
            },

            setFourth() {
                path = 'https://app.comagic.ru/system/media/talk/2938571928/298jfr28h923jf89h92g2lo3829woghc/';
                return this;
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            },

            expectToBeSent() {
                const request = ajax.recentRequest().
                    expectToHavePath(path).
                    expectToHaveMethod('GET');

                return {
                    receiveResponse() {
                        request.respondSuccessfullyWith('29f2f28ofjowf829f');
                        Promise.runAll(false, true);
                    }
                };
            }
        };
    };

    me.statsRequest = () => {
        const queryParams = {
            date_from: '2019-12-19T00:00:00.000+03:00',
            date_to: '2019-12-19T12:10:07.000+03:00'
        };

        const data = {
            status_1_duration: 61410,
            status_2_duration: 84490,
            status_3_duration: 104360,
            status_4_duration: 34272,
            status_5_duration: 13973,
            not_at_work_duration: 7826,
            auto_out_call_duration: 6822,
            not_at_workplace_duration: 3422,
            do_not_disturb_duration: 68372,
            break_duration: 2482,
            available_duration: 2083,
            in_call_count: 5729,
            out_call_count: 927,
            in_failed_count: 52749,
            in_success_count: 85297,
            out_failed_count: 7283,
            out_success_count: 6716,
            employee_full_name: 'Карадимова Веска Анастасовна',
            in_avg_talk_duration: 5617,
            in_sum_talk_duration: 17860,
            out_avg_talk_duration: 2663,
            out_sum_talk_duration: 9226,
            status_40489_duration: 57895,
            in_avg_answer_duration: 9373,
            out_avg_answer_duration: 27763,
            in_failed_transfer_count: 7627,
            in_success_transfer_count: 273,
            out_failed_transfer_count: 6723,
            out_success_transfer_count: 57823,
            in_call_count_details: {
                cdr_ids: null
            },
            out_call_count_details: {
                cdr_ids: null
            },
            in_failed_count_details: {
                cdr_ids: null
            },
            in_success_count_details: {
                cdr_ids: null
            },
            out_failed_count_details: {
                cdr_ids: null
            },
            out_success_count_details: {
                cdr_ids: null
            },
            in_avg_talk_duration_details: {
                cdr_ids: null
            },
            in_sum_talk_duration_details: {
                cdr_ids: null
            },
            out_avg_talk_duration_details: {
                cdr_ids: null
            },
            out_sum_talk_duration_details: {
                cdr_ids: null
            },
            in_avg_answer_duration_details: {
                cdr_ids: null
            },
            out_avg_answer_duration_details: {
                cdr_ids: null
            },
            in_failed_transfer_count_details: {
                cdr_ids: null
            },
            in_success_transfer_count_details: {
                cdr_ids: null
            },
            out_failed_transfer_count_details: {
                cdr_ids: null
            },
            out_success_transfer_count_details: {
                cdr_ids: null
            }
        };

        const addResponseModifiers = me => (me.noInCallCount = () => (delete(data.in_call_count), me), me)

        return addResponseModifiers({
            secondEarlier() {
                queryParams.date_to = '2019-12-19T12:10:06.000+03:00';
                return this;
            },

            expectToBeSent: (requests) => {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectPathToContain('/sup/api/v1/employee_stats').
                    expectToHaveMethod('GET').
                    expectQueryToContain(queryParams);

                return addResponseModifiers({
                    receiveResponse: () => {
                        request.respondSuccessfullyWith({data});
                        Promise.runAll(false, true);
                        spendTime(0);
                    }
                });
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    me.callsRequest = () => {
        const params = {
            offset: undefined,
            limit: '100',
            search: '',
            is_strict_date_till: '0',
            with_names: undefined,
            from: undefined,
            to: '2019-12-19T23:59:59.999+03:00',
            call_directions: undefined,
            call_types: undefined,
            is_processed_by_any: undefined,
            group_id: undefined
        };

        let count = 100,
            total;

        let getResponse = count => [{
            cdr_type: 'default',
            call_session_id: 980925444,
            comment: [
                'Некий https://ya.ru комментарий ' +
                'http://ya.ru http тоже можно ' +
                'hhttp://ya.ru уже нельзя',
                'ищет на всех https://go.comagic.ru/', 'строках'
            ].join("\n"),
            phone_book_contact_id: 2204382409,
            direction: 'in',
            duration: 20,
            contact_name: 'Гяурова Марийка',
            crm_contact_link: 'https://comagicwidgets.amocrm.ru/contacts/detail/218401',
            is_failed: false,
            mark_ids: [88, 495],
            number: '74950230625',
            start_time: '2019-12-19T08:03:02.522+03:00',
            file_links: ['https://app.comagic.ru/system/media/talk/1306955705/3667abf2738dfa0a95a7f421b8493d3c/']
        }, {
            cdr_type: 'default',
            call_session_id: 980925445,
            comment: null,
            phone_book_contact_id: null,
            direction: 'out',
            duration: 21,
            contact_name: 'Манова Тома',
            crm_contact_link: null,
            is_failed: false,
            mark_ids: [],
            number: '74950230626',
            start_time: '2019-12-18T18:08:25.522+03:00',
            file_links: [
                'https://app.comagic.ru/system/media/talk/1306955705/baf9be6ace6b0cb2f9b0e1ed0738db1a/',
                'https://app.comagic.ru/system/media/talk/2938571928/2fj923fholfr32hlf498f8h18f1hfl1c/'
            ]
        }].concat(me.getCalls({
            date: '2019-12-17T18:07:25',
            count: count - 2
        }));

        const processors = [];

        const addResponseModifiers = me => {
            me.isFailed = () => (processors.push(data => data.forEach(item => (item.is_failed = true))), me);
            me.noContactName = () => (processors.push(data => (data[0].contact_name = null)), me);
            me.noCrmContactLink = () => (processors.push(data => (data[0].crm_contact_link = null)), me);

            me.serverError = () => {
                receiveResponse = request =>
                    request.respondUnsuccessfullyWith('500 Internal Server Error Server got itself in trouble');

                return me;
            };

            me.employeeName = () => {
                processors.push(data => {
                    data[0].contact_name = null;
                    data[0].employee_name = 'Гяурова Марийка';
                });

                return me;
            };

            me.noCalls = () => {
                getResponse = () => [];
                total = 0;
                return me;
            };

            me.transferCall = () =>
                (processors.push(data => (data.forEach(item => (item.cdr_type = 'transfer_call')))), me);

            me.noTotal = () => {
                total = undefined;
                count = 15;
                return me;
            };

            return me;
        };

        let receiveResponse = request => {
            const data = getResponse(count);
            processors.forEach(process => process(data));
            total !== undefined && data.forEach(item => (item.total_count = total))

            request.respondSuccessfullyWith({data});
            Promise.runAll();
            me.triggerScrollRecalculation();

            spendTime(0);
        };

        return addResponseModifiers({
            fromFirstWeekDay() {
                params.from = '2019-12-16T00:00:00.000+03:00';
                return this;
            },

            search(value) {
                params.search = value;
                return this;
            },

            changeDate() {
                params.from = '2019-11-15T00:00:00.000+03:00';
                params.to = '2019-12-18T23:59:59.999+03:00';
                return this;
            },

            numa() {
                params.numa = '38294829382;';
                data = [];
                return this;
            },

            anotherLimit() {
                count = 15;
                total = 15;
                params.offset = '0';
                params.limit = '25';
                return this;
            },

            firstPage() {
                count = 10;
                total = 15;
                params.offset = '0';
                params.limit = '10';
                return this;
            },

            secondPage() {
                total = 15;
                params.offset = params.limit = '10';

                getResponse = () => me.getCalls({
                    date: '2021-05-17T18:07:25',
                    count: 5
                });

                return this;
            },

            infiniteScrollSecondPage() {
                params.to = '2019-11-22T21:37:26.362+03:00';
                params.is_strict_date_till = '1';

                return this;
            },

            expectToBeSent() {
                const request = ajax.recentRequest().
                    expectPathToContain('/sup/api/v1/users/me/calls').
                    expectQueryToContain(params);

                return addResponseModifiers({
                    receiveResponse: () => (receiveResponse(request), spendTime(0))
                });
            },

            receiveResponse() {
                return this.expectToBeSent().receiveResponse();
            }
        });
    };

    me.outCallSessionEvent = () => {
        const params = {
            call_session_id: 182957828,
            call_source: 'va',
            is_internal: false,
            direction: 'in',
            virtual_phone_number: '+79161234567',
            contact_phone_number: '+79161234567',
            calling_phone_number: '+79161234567',
            contact_full_name: 'Шалева Дора',
            crm_contact_link: 'https://comagicwidgets.amocrm.ru/contacts/detail/382030',
            active_leads: [],
            is_final: true
        };

        const createMessage = () => ({
            name: 'out_call_session',
            type: 'event',
            params: params 
        });

        return {
            activeLeads() {
                addActiveLeads(params);
                return this;
            },

            noName() {
                params.crm_contact_link = null;
                params.contact_full_name = null;
                return this;
            },

            slavesNotification: () => ({
                expectToBeSent: () => {
                    const message = createMessage();

                    [
                        'virtual_phone_number',
                        'contact_phone_number',
                        'calling_phone_number'
                    ].forEach(param => (message.params[param] = params[param].slice(1)));

                    me.recentCrosstabMessage().expectToContain({
                        type: 'message',
                        data: {
                            type: 'notify_slaves',
                            data: {
                                type: 'websocket_message',
                                message
                            }
                        }
                    });
                }
            }),

            receive() {
                me.eventsWebSocket.receiveMessage(createMessage());
                Promise.runAll(false, true);
            }
        };
    };
    
    const addActiveLeads = params => (params.active_leads = [{
        url: 'https://comagicwidgets.amocrm.ru/leads/detail/3003649',
        name: 'По звонку на 79154394339',
        status: 'Открыт',
        pipeline: 'Переговоры'
    }, {
        url: 'https://comagicwidgets.amocrm.ru/leads/detail/3003651',
        name: 'По звонку с 79154394340',
        status: 'Закрыт',
        pipeline: 'Согласование договора'
    }]);

    me.outCallEvent = () => {
        const params = {
            calling_phone_number: '79161234567',
            contact_phone_number: '79161234567',
            virtual_phone_number: '79161234568',
            virtual_number_comment: null,
            call_source: 'va',
            call_session_id: 980925456,
            mark_ids: null,
            is_transfer: false,
            is_internal: false,
            direction: 'in',
            site_domain_name: 'somesite.com',
            search_query: 'Какой-то поисковый запрос, который не помещается в одну строчку',
            campaign_name: 'Некая рекламная кампания',
            auto_call_campaign_name: null,
            organization_name: 'ООО "Некая Организация"',
            contact_full_name: 'Шалева Дора',
            crm_contact_link: 'https://comagicwidgets.amocrm.ru/contacts/detail/382030',
            first_call: true,
            is_transfer: false,
            transferred_by_employee_full_name: '',
            active_leads: [],
            is_need_auto_answer: false,
            is_final: true
        };

        const createMessage = () => ({
            name: 'out_call',
            type: 'event',
            params
        });

        return {
            anotherContactNumber: function () {
                params.contact_phone_number = '79161234570';
                return this;
            },

            clickToCall: function () {
                params.direction = 'out';
                return this;
            },

            notFinal: function () {
                params.crm_contact_link = null;
                params.contact_full_name = null;
                params.is_final = false;
                return this;
            },

            needAutoAnswer: function () {
                params.is_need_auto_answer = true;
                return this;
            },

            anotherPerson: function () {
                params.calling_phone_number = params.contact_phone_number = '79161234510';
                params.contact_full_name = 'Гигова Петранка';
                return this;
            },

            activeLeads() {
                addActiveLeads(params);
                return this;
            },

            noCrmContactLink: function () {
                params.crm_contact_link = null;
                return this;
            },

            autoCallCampaignName: function () {
                params.auto_call_campaign_name = 'Обзвон лидов ЖК Солнцево Парк';
                return this;
            },

            isTransfer() {
                params.transferred_by_employee_full_name = 'Бисерка Макавеева';
                params.is_transfer = true;
                return this;
            },

            longName() {
                params.contact_full_name = 'Кобыла и трупоглазые жабы искали цезию, нашли поздно утром свистящего хна';
                return this;
            },
            
            noName() {
                params.contact_full_name = null;
                crm_contact_link = null;
                return this;
            },

            getMessage: () => createMessage(),

            slavesNotification: () => {
                const notification = {
                    type: 'message',
                    data: {
                        type: 'notify_slaves',
                        data: {
                            type: 'websocket_message',
                            message: createMessage()
                        }
                    }
                };

                return {
                    expectToBeSent: () => me.recentCrosstabMessage().expectToContain(notification),
                    receive: () => me.receiveCrosstabMessage(notification)
                };
            },

            receive: () => {
                me.eventsWebSocket.receiveMessage(createMessage());
                Promise.runAll(false, true);
            } 
        };
    };

    me.extendAdditionalSlavesNotification((notification, state) => {
        notification.outCallEvent = () => {
            const {params} = me.outCallEvent().getMessage();

            [
                'virtual_number_comment',
                'mark_ids',
                'auto_call_campaign_name'
            ].forEach(param => delete(params[param]));

            state.softphone.notifications = {
                '79161234567': {
                    notification: params
                }
            };

            return notification;
        };

        return notification;
    });

    me.numaRequest = () => {
        let numa = 79161234567;

        let respond = request => request.
            respondUnsuccessfullyWith('500 Internal Server Error Server got itself in trouble');

        return {
            intercept: function () {
                numa = 88;
                return this;
            },

            thirdNumber: function () {
                numa = 79161234510;
                return this;
            },

            anotherNumber() {
                numa = 74950230625;
                return this;
            },

            expectToBeSent() {
                const request = ajax.recentRequest().
                    expectPathToContain(`/sup/api/v1/numa/${numa}`).
                    expectToHaveMethod('GET');

                return {
                    employeeNameIsFound() {
                        respond = request => request.respondSuccessfullyWith({
                            data: 'Шалева Дора'
                        });

                        return this;
                    },

                    receiveResponse() {
                        respond(request);

                        Promise.runAll(false, true);
                        spendTime(0)
                    }
                };
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            } 
        };
    };

    me.settingsUpdatingRequest = () => {
        const params = {};

        return {
            incomingCallSoundDisabled() {
                params.is_enable_incoming_call_sound = false;
                return this
            },

            isNeedDisconnectSignal() {
                params.is_need_disconnect_signal = true;
                return this
            },

            defaultRingtone() {
                params.ringtone = null;
                return this;
            },

            secondRingtone() {
                params.ringtone = 'softphone_ringtone2';
                return this;
            },

            thirdRingtone() {
                params.ringtone = 'softphone_ringtone3';
                return this;
            },

            callsAreManagedByAnotherDevice() {
                params.is_use_widget_for_calls = false;
                return this;
            },

            autoSetStatus() {
                params.is_need_auto_set_status = true;
                return this;
            },

            pauseOnLogin() {
                params.on_login_status_id = 2;
                return this;
            },

            dontDisturbOnLogout() {
                params.on_logout_status_id = 3;
                return this;
            },

            expectToBeSent() {
                const request = ajax.recentRequest().
                    expectPathToContain('/sup/api/v1/settings').
                    expectToHaveMethod('PATCH').
                    expectBodyToContain(params);

                return {
                    receiveResponse() {
                        request.respondSuccessfullyWith({
                            result: true
                        });

                        Promise.runAll(false, true);
                        spendTime(0)
                    }
                }
            },

            receiveResponse() {
                return this.expectToBeSent().receiveResponse();
            }
        };
    };

    me.getApplicationSpecificSettings = function () {
        return {
            application_version: '1.3.2',
            ice_servers: [{
                urls: ['stun:stun.uiscom.ru:19302']
            }],
            numb: '74950216806',
            number_capacity_id: 124824,
            sip_channels_count: 2,
            sip_host: 'voip.uiscom.ru',
            sip_login: '077368',
            sip_password: 'e2tcXhxbfr',
            ws_url: '/ws/XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0',
            is_need_hide_numbers: false,
            is_extended_integration_available: true,
            is_use_widget_for_calls: true,
            is_need_open_widget_on_call: true,
            is_need_close_widget_on_call_finished: false,
            number_capacity_usage_rule: 'auto',
            call_task: {
                pause_between_calls_duration: 60,
                call_card_show_duration: 10
            }
        };
    };

    me.settingsRequest = () => {
        let shouldTriggerScrollRecalculation = true;

        const response = {
            data: me.getApplicationSpecificSettings() 
        };

        let respond = request => {
            response.data = me.addDefaultSettings(response.data);
            request.respondSuccessfullyWith(response);
        };

        const headers = {
            Authorization: 'Bearer XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0',
            'X-Auth-Type': 'jwt'
        };

        const addResponseModifiers = (me, response) => {
            me.dontTriggerScrollRecalculation = () => ((shouldTriggerScrollRecalculation = false), me);
            me.shouldHideNumbers = () => ((response.data.is_need_hide_numbers = true), me);
            me.incomingCallSoundDisabled = () => ((response.data.is_enable_incoming_call_sound = false), me);;

            me.noTelephony = () => {
                Object.keys(response.data).forEach(key => ![
                    'ws_url',
                    'sip_channels_count',
                    'ice_servers',
                    'application_version'
                ].includes(key) && delete(response.data[key]));

                ['sip_host', 'sip_login', 'sip_password'].forEach(key => (response.data[key] = null));
                return me;
            };

            me.isNeedDisconnectSignal = () => {
                response.data.is_need_disconnect_signal = true;
                return me
            };

            const ringtone = number => {
                response.data.ringtone = `softphone_ringtone${number}`;

                response.data.ringtone_file = {
                    mtime: 1556529288674,
                    link: `https://somehost.com/softphone_ringtone${number}.mp3`
                };

                return me;
            };

            me.secondRingtone = () => ringtone('2');
            me.thirdRingtone = () => ringtone('3');

            me.autoSetStatus = () => {
                response.data.is_need_auto_set_status = true;
                return me;
            };

            me.pauseOnLogin = () => {
                response.data.on_login_status_id = 2;
                return me;
            };

            me.dontDisturbOnLogout = () => {
                response.data.on_logout_status_id = 3;
                return me;
            };

            me.setInvalidRTUConfig = () => {
                response.data.rtu_webrtc_urls = ['wss://rtu-webrtc.uiscom.ru'],
                response.data.sip_phone = '076909';
                return me;
            };

            me.setRTU = () => {
                response.data.webrtc_urls = ['wss://webrtc.uiscom.ru'];
                response.data.sip_phone = '076909';
                response.data.rtu_sip_host = 'pp-rtu.uis.st:443';
                response.data.sip_login = 'Kf98Bzv3';
                response.data.sip_password = 'e2tcXhxbfr';

                return me;
            };

            me.callsAreManagedByAnotherDevice = () => {
                response.data.is_use_widget_for_calls = false;
                return me;
            };

            me.accessTokenExpired = () => {
                Object.keys(response).forEach(key => delete(response[key]));
                respond = request => request.respondUnauthorizedWith(response);

                response.error = {
                    code: 401,
                    message: 'Token has been expired',
                    mnemonic: 'expired_token',
                    is_smart: false
                };

                return me;
            };

            me.accessTokenInvalid = () => {
                Object.keys(response).forEach(key => delete(response[key]));
                respond = request => request.respondUnauthorizedWith(response);

                response.error = {
                    code: 401,
                    message: 'Token is not active or invalid',
                    mnemonic: 'invalid_token',
                    is_smart: false
                };

                return me;
            };

            me.allowNumberCapacitySelect = () => {
                response.data.number_capacity_usage_rule = 'fixed';
                return me;
            };

            me.numberCapacityComment = () => {
                response.data.number_capacity_comment = 'Отдел консалтинга';
                return me;
            };

            me.longNumberCapacityComment = () => {
                response.data.number_capacity_comment = new Array(8).fill(null).map(() =>
                    'Кобыла и трупоглазые жабы искали цезию, нашли поздно утром свистящего хна.').join(' ');
                return me;
            };

            return me;
        };

        const request = addResponseModifiers({
            anotherAuthorizationToken: () =>
                ((headers.Authorization = 'Bearer 935jhw5klatxx2582jh5zrlq38hglq43o9jlrg8j3lqj8jf'), request),

            thirdAuthorizationToken: () =>
                ((headers.Authorization = 'Bearer 2924lg8hg95gl8h3g2lg8o2hgg8shg8olg8qg48ogih7h29'), request),

            expectToBeSent: () => {
                const request = ajax.recentRequest().
                    expectPathToContain('/sup/api/v1/settings').
                    expectToHaveMethod('GET').
                    expectToHaveHeaders(headers);

                return addResponseModifiers({
                    receiveResponse: () => {
                        respond(request);

                        Promise.runAll(false, true);
                        spendTime(0)

                        shouldTriggerScrollRecalculation && me.triggerScrollRecalculation();
                    }
                }, response);
            },
            receiveResponse: () => request.expectToBeSent().receiveResponse()
        }, response);

        return request;
    };
    
    me.authLogoutRequest = () => {
        let response = {
            result: true
        };

        let respond = request => request.respondSuccessfullyWith(response);

        const addResponseModifiers = me => {
            me.invalidToken = () => {
                response = {
                    error: {
                        code: 401,
                        message: 'Token is not active or invalid',
                        mnemonic: 'invalid_token',
                        is_smart: false
                    }
                };

                respond = request => request.respondUnauthorizedWith(response);
                return me;
            };

            return me;
        };

        return addResponseModifiers({
            expectToBeSent() {
                let request = ajax.recentRequest().
                    expectPathToContain('/sup/auth/logout').
                    expectToHaveHeaders({
                        Authorization: 'Bearer XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0',
                        'X-Auth-Type': 'jwt'
                    });

                return addResponseModifiers({
                    receiveResponse: () => {
                        respond(request);

                        Promise.runAll(false, true);
                        spendTime(0)
                    }
                });
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    me.authCheckRequest = () => {
        let token = 'XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0',
            response = '',
            respond = request => request.respondSuccessfullyWith(response),
            xWidgetId = utils.expectToBeString();

        const addResponseModifiers = me => {
            me.invalidToken = () => {
                response = {
                    error: {
                        code: 401,
                        message: 'Token is not active or invalid',
                        mnemonic: 'invalid_token',
                        is_smart: false
                    }
                };

                respond = request => request.respondUnauthorizedWith(response);

                return me;
            };

            return me;
        };

        return addResponseModifiers({
            anotherAuthorizationToken() {
                token = '935jhw5klatxx2582jh5zrlq38hglq43o9jlrg8j3lqj8jf';
                return this;
            },

            knownWidgetId() {
                xWidgetId = '2b5af1d8-108c-4527-aceb-c93614b8a0da';
                return this;
            },

            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectToHavePath('https://myint0.dev.uis.st/sup/auth/check').
                    expectToHaveHeaders({
                        Authorization: `Bearer ${token}`,
                        'X-Auth-Type': 'jwt',
                        'X-Widget-Id': xWidgetId,
                    });

                return addResponseModifiers({
                    receiveResponse: () => {
                        respond(request);

                        Promise.runAll(false, true);
                        spendTime(0)
                    }
                });
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    me.chatChannelListRequest = () => ({
        expectToBeSent(requests) {
            const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                expectPathToContain('/logic/operator/chat/channel/list').
                expectToHaveMethod('GET');

            return {
                receiveResponse() {
                    request.respondSuccessfullyWith({
                        data: [{
                            id: 101,
                            is_removed: false,
                            name: 'mrDDosT',
                            status: 'active',
                            status_reason: 'omni_request',
                            type: 'telegram'
                        }]
                    });

                    Promise.runAll(false, true);
                    spendTime(0)
                }
            };
        },

        receiveResponse() {
            this.expectToBeSent().receiveResponse();
        }
    });

    me.chatListRequest = () => {
        let params = {
            statuses: ['new', 'active'],
            limit: 1000,
            offset: 0
        };

        let data = [{
            chat_channel_id: 101,
            chat_channel_type: 'telegram',
            date_time: '2022-01-21T16:24:21.098210',
            id: 2718935,
            context: null,
            last_message: {
                message: 'Привет',
                date: '2022-02-22T13:07:22.000Z',
                is_operator: false,
                resource_type: null,
                resource_name: null
            },
            mark_ids: ['316', '579'],
            phone: null,
            site_id: 4663,
            status: 'new',
            visitor_id: 16479303,
            visitor_name: 'Помакова Бисерка Драгановна',
            visitor_type: 'omni',
            unread_message_count: 3
        }, {
            chat_channel_id: 101,
            chat_channel_type: 'telegram',
            date_time: '2022-01-22T17:25:22.098210',
            id: 2718936,
            context: null,
            last_message: {
                message: 'Здравствуй',
                date: '2022-06-24T16:04:26.000Z',
                is_operator: false,
                resource_type: null,
                resource_name: null
            },
            mark_ids: ['316', '579'],
            phone: null,
            site_id: 4663,
            status: 'active',
            visitor_id: 16479303,
            visitor_name: 'Помакова Бисерка Драгановна',
            visitor_type: 'omni',
            unread_message_count: 0
        }];

        function addResponseModifiers (me) {
            me.nothingFound = () => ((data = []), me);

            me.lastMessageFromOperator = () => {
                data[0].last_message.is_operator = true;
                return me;
            };

            me.lastMessageWithAttachment = () => {
                data[0].last_message.resource_type = 'photo';
                data[0].last_message.resource_name = 'heart.png';
                data[0].last_message.message = '';

                return me;
            };

            return me;
        }

        const chat = chat_id => {
            params.chat_id = chat_id;
            params.limit = 1;
            params.statuses.push('closed');
        };

        return addResponseModifiers({
            anotherChat() {
                chat(2718936);
                return this;
            },
            
            chat() {
                chat(2718935);
                return this;
            },

            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectPathToContain('/logic/operator').
                    expectToHaveMethod('POST').
                    expectBodyToContain({
                        method: 'get_chat_list',
                        params
                    });

                return addResponseModifiers({
                    receiveResponse() {
                        request.respondSuccessfullyWith({
                            result: {
                                data: {
                                    active_chat_count: 5,
                                    new_chat_count: 2,
                                    chats: data
                                }
                            } 
                        });

                        Promise.runAll(false, true);
                        spendTime(0)
                    }
                });
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    me.operatorAccountRequest = () => ({
        expectToBeSent(requests) {
            const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                expectPathToContain('/logic/operator').
                expectToHaveMethod('POST').
                expectBodyToContain({
                    method: 'get_account',
                    params: {}
                });

            return {
                receiveResponse() {
                    request.respondSuccessfullyWith({
                        result: {
                            data: {
                                app_id: 1103,
                                app_state: 'active',
                                app_name: 'Карадимова Веска Анастасовна',
                                is_agent_app: false,
                                customer_id: 183510,
                                user_id: 151557,
                                employee_id: 20816,
                                user_type: 'user',
                                user_login: 'karadimova',
                                user_name: 'karadimova',
                                tp_id: 406,
                                tp_name: 'Comagic Enterprise',
                                crm_type: 'e2e_analytics',
                                lang: 'ru',
                                project: 'comagic',
                                timezone: 'Europe/Moscow',
                                permissions: [{
                                    'unit_id': 'call_recordings',
                                    'is_delete': true,
                                    'is_insert': false,
                                    'is_select': true,
                                    'is_update': true,
                                }, {
                                    'unit_id': 'tag_management',
                                    'is_delete': true,
                                    'is_insert': true,
                                    'is_select': true,
                                    'is_update': true,
                                }]
                            }
                        }
                    });

                    Promise.runAll(false, true);
                    spendTime(0)
                }
            };
        },

        receiveResponse() {
            this.expectToBeSent().receiveResponse();
        }
    });

    me.operatorSiteListRequest = () => ({
        expectToBeSent(requests) {
            const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                expectPathToContain('/logic/operator/site/list').
                expectToHaveMethod('GET');

            return {
                receiveResponse() {
                    request.respondSuccessfullyWith({
                        result: {
                            data: []
                        }
                    });

                    Promise.runAll(false, true);
                    spendTime(0)
                }
            };
        },

        receiveResponse() {
            this.expectToBeSent().receiveResponse();
        }
    });

    me.operatorListRequest = () => ({
        expectToBeSent(requests) {
            const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                expectPathToContain('/logic/operator/list').
                expectToHaveMethod('GET');

            return {
                receiveResponse() {
                    request.respondSuccessfullyWith({
                        data: [{
                            id: 20816,
                            full_name: 'Карадимова Веска Анастасовна',
                            status_id: 1,
                            photo_link: null
                        }, {
                            id: 20817,
                            full_name: 'Чакърова Райна Илковна',
                            status_id: 1,
                            photo_link: null
                        }]
                    });

                    Promise.runAll(false, true);
                    spendTime(0)
                }
            };
        },

        receiveResponse() {
            this.expectToBeSent().receiveResponse();
        }
    });

    me.operatorStatusListRequest = () => ({
        expectToBeSent(requests) {
            const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                expectPathToContain('/logic/operator/status/list').
                expectToHaveMethod('GET');

            return {
                receiveResponse() {
                    request.respondSuccessfullyWith({
                        data: [{
                            id: 1,
                            is_worktime: true,
                            mnemonic: 'available',
                            name: 'Доступен',
                            is_select_allowed: true,
                            description: 'все вызовы',
                            color: '#48b882',
                            icon_mnemonic: 'tick',
                            is_auto_out_calls_ready: true,
                            is_deleted: false,
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
                            icon_mnemonic: 'pause',
                            is_auto_out_calls_ready: true,
                            is_deleted: false,
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
                            icon_mnemonic: 'minus',
                            description: 'только исходящие',
                            color: '#cc5d35',
                            is_auto_out_calls_ready: true,
                            is_deleted: false,
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
                            icon_mnemonic: 'time',
                            is_auto_out_calls_ready: true,
                            is_deleted: false,
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
                            icon_mnemonic: 'cross',
                            is_auto_out_calls_ready: true,
                            is_deleted: false,
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
                            icon_mnemonic: 'unknown',
                            color: null,
                            is_auto_out_calls_ready: true,
                            is_deleted: false,
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
                        }]
                    });

                    Promise.runAll(false, true);
                    spendTime(0)
                }
            };
        },

        receiveResponse() {
            this.expectToBeSent().receiveResponse();
        }
    });

    me.configRequest = () => {
        let host = '.';

        let response = {
            ENV: 'dev',
            LOCATION: 'msk',
            STAND: '',
            APPVERSION: 'dev',
            REACT_APP_BASE_URL: 'https://lobarev.dev.uis.st/logic/operator',
            REACT_APP_AUTH_URL: 'https://dev-dataapi.uis.st/int0/auth/json_rpc',
            REACT_APP_WS_URL: 'wss://lobarev.dev.uis.st/ws',
            REACT_APP_LOCALE: 'ru',
            REACT_APP_BUILD_MODE: '',
            REACT_APP_AUTH_COOKIE: '$REACT_APP_AUTH_COOKIE'
        };

        const me = {
            chats: () => {
                host = '$REACT_APP_MODULE_CHATS';
                return me;
            },

            softphone: () => {
                host = '$REACT_APP_MODULE_SOFTPHONE';
                response = {
                    REACT_APP_LOCALE: 'ru',
                    REACT_APP_SOFTPHONE_BACKEND_HOST: 'myint0.dev.uis.st',
                    REACT_APP_AUTH_COOKIE: '$REACT_APP_AUTH_COOKIE'
                };

                return me;
            },

            expectToBeSent: requests => {
                const request = (requests ? requests.someRequest() : fetch.recentRequest()).
                    expectPathToContain(`${host}/config.json`);

                return {
                    receiveResponse: () => {
                        request.respondSuccessfullyWith(
                            JSON.stringify(response)
                        );

                        Promise.runAll(false, true);
                        spendTime(0)
                    }
                };
            },

            receiveResponse() {
                return this.expectToBeSent().receiveResponse();
            }
        };

        return me;
    };

    me.reportTableRequest = () => {
        const params = {
            report_type: 'ad_analytics',
            dimensions: ['campaign_name', undefined],
            limit: 10,
            offset: 0,
            columns: ['cc_5', undefined],
            sort: [{
                field: 'cc_5',
                order: 'desc'
            }, undefined],
            filter: {
                filters: [{
                    field: 'name',
                    operator: '==',
                    value: 'Некое имя'
                }, {
                    field: 'description',
                    operator: '==',
                    value: 'Некое описание'
                }, {
                    field: 'campaign_name',
                    operator: 'is_not_null',
                    value: null
                }, undefined],
                condition: 'and'
            },
            columns_filter: {
                field: 'cc_5',
                operator: '>',
                value: 0
            },
            date_from: '2020-10-01 15:23:05',
            date_till: '2020-11-02 14:26:02',
            perspective_window: 180
        };

        const setColumn = column => {
            params.columns[0] = column;
            params.sort[0].field = column;
            params.columns_filter.field = column;
        };

        const setDimension = column => {
            params.dimensions[0] = column;
            params.filter.filters[2].field = column;
        };

        const response = {
            result: {
                data: {
                    date_from: '2020-10-01 15:23:05',
                    date_till: '2020-11-02 14:26:02',
                    rows: [{
                        key: 'some_key',
                        dimension: {
                            value: 'Некое значение',
                            value_id: 'some_dimension_id',
                        },
                        columns: ['name'],
                        compared_columns: ['description'],
                        loaded: true,
                        expandable: false,
                        expanded: false,
                        isLoadMoreRecordsBtn: [false],
                        children: []
                    }],
                }
            }
        };

        const headers = {
            Authorization: 'Bearer XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0',
            'X-Auth-Type': 'jwt'
        };

        const request = addAuthErrorResponseModifiers({
            anotherColumn: () => (setColumn('cc_10'), request),
            thirdColumn: () => (setColumn('cc_15'), request),
            visitorRegion: () => (setDimension('visitor_region'), request),

            anotherAuthorizationToken: () =>
                ((headers.Authorization = 'Bearer 935jhw5klatxx2582jh5zrlq38hglq43o9jlrg8j3lqj8jf'), request),

            expectToBeSent: () => {
                const request = ajax.recentRequest().
                    expectBodyToContain({
                        method: 'getobj.report_table',
                        params
                    }).expectToHaveHeaders(headers);

                return addAuthErrorResponseModifiers({
                    receiveResponse() {
                        request.respondSuccessfullyWith(response);

                        Promise.runAll(false, true);
                        spendTime(0)
                    }
                }, response);
            },

            receiveResponse: () => request.expectToBeSent().receiveResponse()
        }, response);

        return request;
    };

    me.communicationsRequest = () => {
        const params = {
            date_from: '2022-01-01 00:00:00',
            date_till: '2022-02-14 23:59:59',
            report_id: 48427,
            limit: 50,
            offset: 0,
            fields: [
                'communication_type',
                'communication_date_time',
                'communication_number',
                'visitor_id',
                'virtual_phone_number',
                'tags',
                'call_records',
                'total_duration',
                'call_type',
                'call_status',
                'call_direction',
                'employees',
                'chat_initiator',
                'chat_messages_count',
                'offline_message_type'
            ],
            sort: [{
                field: 'communication_date_time',
                order: 'desc'
            }]
        };

        const request = {
            anotherDate: () => {
                params.date_from = '2020-08-30 15:23:05';
                params.date_till = '2020-10-01 14:26:02';
                return request;
            },

            receiveResponse() {
                ajax.recentRequest().
                    expectBodyToContain({
                        method: 'get.communications',
                        params
                    }).
                    respondSuccessfullyWith({
                        result: {
                            data: [{
                                tags: {
                                    items: [{
                                        id: 45151,
                                        name: ':)'
                                    }],
                                    communication_id: 2718935,
                                    communication_type: 'chat'
                                },
                                call_type: {
                                    value: null,
                                    value_id: null
                                },
                                employees: [{
                                    employee_full_name: 'SP_TEST Олег Оловянный'
                                }],
                                visitor_id: 5059668393,
                                call_status: {
                                    value: null,
                                    value_id: null
                                },
                                call_records: null,
                                call_direction: {
                                    value: null,
                                    value_id: null
                                },
                                chat_initiator: {
                                    value: 'Посетитель',
                                    value_id: 'visitor'
                                },
                                total_duration: null,
                                communication_id: 2718935,
                                communication_type: {
                                    value: 'Чаты',
                                    value_id: 'chat'
                                },
                                chat_messages_count: 4,
                                communication_number: 1,
                                offline_message_type: {
                                    value: null,
                                    value_id: null
                                },
                                virtual_phone_number: null,
                                communication_date_time: '2022-02-18 13:20:28'
                            }, {
                                tags: {
                                    items: [{
                                        id: 45151,
                                        name: ':)'
                                    }],
                                    communication_id: 2718935,
                                    communication_type: 'chat'
                                },
                                call_type: {
                                    value: null,
                                    value_id: null
                                },
                                employees: [{
                                    employee_full_name: 'SP_TEST Олег Оловянный'
                                }],
                                visitor_id: 5059668393,
                                call_status: {
                                    value: null,
                                    value_id: null
                                },
                                call_records: null,
                                call_direction: {
                                    value: null,
                                    value_id: null
                                },
                                chat_initiator: {
                                    value: 'Посетитель',
                                    value_id: 'visitor'
                                },
                                total_duration: null,
                                communication_id: 2718936,
                                communication_type: {
                                    value: 'Чаты',
                                    value_id: 'chat'
                                },
                                chat_messages_count: 5,
                                communication_number: 1,
                                offline_message_type: {
                                    value: null,
                                    value_id: null
                                },
                                virtual_phone_number: null,
                                communication_date_time: '2022-02-18 13:20:28'
                            }],
                            metadata: {
                                total_items: 2
                            }
                        }
                    });

                Promise.runAll(false, true);
                spendTime(0)
            }
        };

        return request;
    };

    me.reportTotalRequest = () => {
        const params = {
            date_from: '2020-10-01 15:23:05',
            date_till: '2020-11-02 14:26:02',
            perspective_window: 180,
            report_type: 'deals_analytics',
            columns: ['cf_26', undefined],
            filter: {
                filters: [{
                    field: 'name',
                    operator: '==',
                    value: 'Некое имя'
                }, {
                    field: 'description',
                    operator: '==',
                    value: 'Некое описание'
                }],
                condition: 'and'
            }
        };

        const request = {
            adAnalytics: () => ((params.report_type = 'ad_analytics'), request),

            anotherDate: () => {
                params.date_from = '2020-08-30 15:23:05';
                params.date_till = '2020-10-01 14:26:02';
                return request;
            },

            anotherColumn: () => ((params.columns[0] = 'cc_25'), request),
            thirdColumn: () => ((params.columns[0] = 'cc_26'), request),
            fourthColumn: () => ((params.columns[0] = 'cc_27'), request),
            fifthColumn: () => ((params.columns[0] = 'cc_6'), request),
            sixthColumn: () => ((params.columns[0] = 'cf_29'), request),
            seventhColumn: () => ((params.columns[0] = 'cc_15'), request),
            eighthColumn: () => ((params.columns[0] = 'cc_20'), request),
            ninthColumn: () => ((params.columns[0] = 'cc_10'), request),
            tenthColumn: () => ((params.columns[0] = 'cf_19'), request),
            eleventhColumn: () => ((params.columns[0] = 'cc_5'), request),
            twelvethColumn: () => ((params.columns[0] = 'cf_13'), request),
            thirtinthColumn: () => ((params.columns[0] = 'cc_17'), request),

            receiveResponse() {
                ajax.recentRequest().
                    expectBodyToContain({
                        method: 'getobj.report_total',
                        params
                    }).
                    respondSuccessfullyWith({
                        result: {
                            data: {
                                date_from: '2020-09-02 16:23:05',
                                date_till: '2020-08-06 14:28:02',
                                totals: [285024],
                                compared_totals: [285027],
                            }
                        }
                    });

                Promise.runAll(false, true);
                spendTime(0)
            }
        };

        return request;
    };

    me.customFiltersRequest = () => {
        return {
            receiveResponse() {
                ajax.recentRequest().
                    expectBodyToContain({
                        method: 'get.custom_filters',
                        params: {
                            report_type: 'communications'
                        }
                    }).
                    respondSuccessfullyWith({
                        result: {
                            data: []
                        }
                    });

                Promise.runAll(false, true);
                spendTime(0)
            }
        };
    };

    me.tagsRequest = () => {
        return {
            receiveResponse() {
                ajax.recentRequest().
                    expectBodyToContain({
                        method: 'get.tags',
                        params: {
                            is_include_rating: true
                        }
                    }).
                    respondSuccessfullyWith({
                        result: {
                            data: [{
                                id: 288,
                                name: 'Продажа',
                                rating: 0,
                                is_system: false
                            }]
                        }
                    });

                Promise.runAll(false, true);
                spendTime(0)
            }
        };
    };

    me.columnsTreeRequest = () => {
        return {
            receiveResponse() {
                ajax.recentRequest().
                    expectBodyToContain({
                        method: 'getobj.columns_tree',
                        params: {
                            report_type: 'communications'
                        }
                    }).
                    respondSuccessfullyWith({
                        result: {
                            data: {
                                columns: [{
                                    id: 'site_domain_name',
                                    name: 'Сайт',
                                    sort: 100,
                                    type: 'base',
                                    filter: {
                                        format: 'list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: null,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'site_name',
                                    name: 'Название сайта',
                                    sort: 110,
                                    type: 'base',
                                    filter: {
                                        format: 'list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: null,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Название сайта, указанное в настройках сервиса.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'campaign_name',
                                    name: 'Рекламная кампания обращения',
                                    sort: 150,
                                    type: 'base',
                                    filter: {
                                        format: 'list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 4,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Рекламная кампания, с которой поступило обращения, определена алгоритмом нашего сервиса.',
                                    default_width: 180,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'communication_type',
                                    name: 'Тип обращения',
                                    sort: 200,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 4,
                                    data_type: 'json_object',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Типы обращений: Звонки, заявки, чаты, цели.',
                                    default_width: 116,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'communication_id',
                                    name: 'Идентификатор обращения',
                                    sort: 300,
                                    type: 'base',
                                    filter: {
                                        format: 'numeric',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: '<',
                                            name: 'меньше',
                                            is_default: false
                                        }, {
                                            id: '>',
                                            name: 'больше',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 4,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'communication_date_time',
                                    name: 'Дата / время обращения',
                                    sort: 400,
                                    type: 'base',
                                    filter: {
                                        format: 'timestamptz',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: '<',
                                            name: 'меньше',
                                            is_default: false
                                        }, {
                                            id: '>',
                                            name: 'больше',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 4,
                                    data_type: 'datetime',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: 126,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'communication_kinds',
                                    name: 'Вид обращения',
                                    sort: 500,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 4,
                                    data_type: 'list',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'communication_page_url',
                                    name: 'URL страницы обращения',
                                    sort: 600,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 4,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'URL страницы, на которой находился посетитель в момент обращения или страница последнего взаимодействия посетителя перед обращением.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'is_communication_with_visit',
                                    name: 'Есть прямая связь обращения с сессией',
                                    sort: 700,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 4,
                                    data_type: 'json_object',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'communication_number',
                                    name: 'Номер обращения',
                                    sort: 800,
                                    type: 'base',
                                    filter: {
                                        format: 'numeric',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: '<',
                                            name: 'меньше',
                                            is_default: false
                                        }, {
                                            id: '>',
                                            name: 'больше',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 4,
                                    data_type: 'integer',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: 116,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'total_duration',
                                    name: 'Длительность обращения',
                                    sort: 1100,
                                    type: 'base',
                                    filter: {
                                        format: 'duration',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: '<',
                                            name: 'меньше',
                                            is_default: false
                                        }, {
                                            id: '>',
                                            name: 'больше',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 4,
                                    data_type: 'time',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: 133,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'tags',
                                    name: 'Теги',
                                    sort: 1200,
                                    type: 'base',
                                    filter: {
                                        format: 'list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 4,
                                    data_type: 'tag_json_object',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: 188,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'employees',
                                    name: 'Сотрудник',
                                    sort: 1300,
                                    type: 'base',
                                    filter: {
                                        format: 'list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 4,
                                    data_type: 'employee_list',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: 116,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'source',
                                    name: 'Источник',
                                    sort: 1400,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 8,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Тип трафика, который приводит посетителей на ваш сайт, более детализированная информация по каждому каналу.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'communication_hour',
                                    name: 'Час обращения',
                                    sort: 1400,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 4,
                                    data_type: 'json_object',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'channel',
                                    name: 'Канал',
                                    sort: 1500,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 8,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'communication_weekday',
                                    name: 'День недели обращения',
                                    sort: 1500,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 4,
                                    data_type: 'json_object',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'communication_month',
                                    name: 'Месяц обращения',
                                    sort: 1600,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 4,
                                    data_type: 'json_object',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'eq_utm_source',
                                    name: 'Расширенная UTM-метка Source',
                                    sort: 1700,
                                    type: 'base',
                                    filter: {
                                        format: 'text_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 9,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'communication_year',
                                    name: 'Год обращения',
                                    sort: 1700,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 4,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'eq_utm_medium',
                                    name: 'Расширенная UTM-метка Medium',
                                    sort: 1800,
                                    type: 'base',
                                    filter: {
                                        format: 'text_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 9,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'person_id',
                                    name: 'Карточка клиента',
                                    sort: 1800,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 4,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: 116,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'eq_utm_campaign',
                                    name: 'Расширенная UTM-метка Campaign',
                                    sort: 1900,
                                    type: 'base',
                                    filter: {
                                        format: 'text_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 9,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'eq_utm_term',
                                    name: 'Расширенная UTM-метка Term',
                                    sort: 2000,
                                    type: 'base',
                                    filter: {
                                        format: 'text_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 9,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'eq_utm_content',
                                    name: 'Расширенная UTM-метка Content',
                                    sort: 2100,
                                    type: 'base',
                                    filter: {
                                        format: 'text_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 9,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'eq_utm_referrer',
                                    name: 'Расширенная UTM-метка Referrer',
                                    sort: 2200,
                                    type: 'base',
                                    filter: {
                                        format: 'text_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 9,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'eq_utm_expid',
                                    name: 'Расширенная UTM-метка Expid',
                                    sort: 2300,
                                    type: 'base',
                                    filter: {
                                        format: 'text_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 9,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'referrer',
                                    name: 'Реферер',
                                    sort: 2400,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 8,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'referrer_domain',
                                    name: 'Домен реферера',
                                    sort: 2500,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 8,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Домен, с которого был сделан переход',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'search_query',
                                    name: 'Поисковый запрос',
                                    sort: 2600,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 8,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Поисковый запрос, по которому посетитель перешел на ваш сайт из поисковых систем Yandex, Google и др. Показатель будет заполнен только в случае, когда поисковая система передала в наш сервис информацию о поисковом запросе.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'utm_source',
                                    name: 'UTM-метка Source',
                                    sort: 2700,
                                    type: 'base',
                                    filter: {
                                        format: 'text_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 11,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Для идентификации поисковой системы, источника перехода (прописать обязательно).\nПример: utm_source=YandexDirect.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'utm_medium',
                                    name: 'UTM-метка Medium',
                                    sort: 2800,
                                    type: 'base',
                                    filter: {
                                        format: 'text_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 11,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Определяет тип рекламной кампании (для контекстной рекламы в Яндекс можно указать cpc или идентификатор электронной рассылки), прописать обязательно.\nПример: utm_medium=cpc',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'utm_campaign',
                                    name: 'UTM-метка Campaign',
                                    sort: 2900,
                                    type: 'base',
                                    filter: {
                                        format: 'text_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 11,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Для идентификации и анализа ключевых слов, обозначения рекламы определенного товара или стратегической кампании.\nПример: utm_campaign=путевка_турция',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'utm_term',
                                    name: 'UTM-метка Term',
                                    sort: 3000,
                                    type: 'base',
                                    filter: {
                                        format: 'text_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 11,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Для идентификации ключевых слов объявления.\nПример: utm_term=теннисная+ракетка',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'utm_content',
                                    name: 'UTM-метка Content',
                                    sort: 3100,
                                    type: 'base',
                                    filter: {
                                        format: 'text_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 11,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Помогает различать объявления, ссылающиеся на один и тот же URL (можно также использовать и при A/B тестировании страниц. Примеры: utm_content=logolink или utm_content=textlink',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'utm_referrer',
                                    name: 'UTM-метка Referrer',
                                    sort: 3200,
                                    type: 'base',
                                    filter: {
                                        format: 'text_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 11,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Источник перехода на сайт при JavaScript-редиректе или при переходе на ваш сайт с протоколом HTTP с сайта, доступного по протоколу HTTPS',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'utm_expid',
                                    name: 'UTM-метка Expid',
                                    sort: 3300,
                                    type: 'base',
                                    filter: {
                                        format: 'text_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 11,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Идентификатор эксперимента',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'openstat_service',
                                    name: 'Os-метка service-name',
                                    sort: 3400,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 12,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Идентификатор сервиса, предоставляющего услуги (прописать обязательно).\nПример: source-name=direct.yandex.ru',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'openstat_campaign',
                                    name: 'Os-метка campaign-id',
                                    sort: 3500,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 12,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Идентификатор рекламной кампании. Пример: showCamp&cid=123456 <--идентификатор.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'openstat_ad',
                                    name: 'Os-метка ad-id',
                                    sort: 3600,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 12,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Идентификатор рекламного объявления (прописать обязательно).\nПример: в Яндекс Директ № объявления: № M-12345678<--идентификатор.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'openstat_source',
                                    name: 'Os-метка source-id',
                                    sort: 3700,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 12,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Идентификатор площадки, раздела, страницы, места на странице, на котором было показано соответствующее рекламное объявление.\nПример: URL страницы: www.example.com/features',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'ef_id',
                                    name: 'Метка ef_id',
                                    sort: 3800,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 13,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Параметр используется для разметки ссылок в системе управления контекстной рекламой AdLense.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'yclid',
                                    name: 'Метка yclid',
                                    sort: 3900,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 13,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Параметр передается автоматически для всех рекламных объявлений Яндекс.Директ (если в аккаунте Яндекс.Директ в настройках рекламной кампании активирована опция \'Разметка ссылок для Метрики\').',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'gclid',
                                    name: 'Метка gclid',
                                    sort: 4000,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 13,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Параметр передается автоматически для всех рекламных объявлений Google Ads (если в аккаунте Google Ads активирована соответствующая опция).',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'cm_id',
                                    name: 'Метка cm_id',
                                    sort: 4100,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 13,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Метка, проставленная нашим сервисом в url объявлений рекламной системы Яндекс Директ, Google Ads, Facebook Ads, VK Ads, myTarget при интеграции.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'ymclid',
                                    name: 'Метка ymclid',
                                    sort: 4200,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 13,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Параметр передается автоматически для всех товарных предложений Яндекс.Маркет.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'tag_from',
                                    name: 'Метка from',
                                    sort: 4300,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 13,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'visitor_country',
                                    name: 'Страна',
                                    sort: 4400,
                                    type: 'base',
                                    filter: {
                                        format: 'text_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 15,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Страна посещения.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'visitor_region',
                                    name: 'Область',
                                    sort: 4500,
                                    type: 'base',
                                    filter: {
                                        format: 'text_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 15,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Область, регион посещения.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'visitor_city',
                                    name: 'Город',
                                    sort: 4600,
                                    type: 'base',
                                    filter: {
                                        format: 'text_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 15,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Город посещения.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'visitor_provider',
                                    name: 'Провайдер',
                                    sort: 4700,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 15,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Поставщик интернет-услуг, которому принадлежит IP-адрес посещения.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'visitor_ip_address',
                                    name: 'IP',
                                    sort: 4800,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 15,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'IP адрес посещения.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'visitor_browser_name',
                                    name: 'Браузер',
                                    sort: 4900,
                                    type: 'base',
                                    filter: {
                                        format: 'text_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 16,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'visitor_browser_version',
                                    name: 'Версия браузера',
                                    sort: 5000,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 16,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'visitor_os_name',
                                    name: 'ОС',
                                    sort: 5100,
                                    type: 'base',
                                    filter: {
                                        format: 'text_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 16,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Операционная система устройства.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'visitor_os_version',
                                    name: 'Версия ОС',
                                    sort: 5200,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 16,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Версия операционной системы устройства.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'visitor_language',
                                    name: 'Язык локализации',
                                    sort: 5300,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 16,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Языковая версия браузера.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'visitor_screen',
                                    name: 'Разрешение экрана',
                                    sort: 5400,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 16,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'visitor_device',
                                    name: 'Тип устройства',
                                    sort: 5500,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 16,
                                    data_type: 'json_object',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Тип устройства посещения.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'visitor_session_id',
                                    name: 'ID посещения',
                                    sort: 5600,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 17,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'entrance_page',
                                    name: 'Страница входа',
                                    sort: 5700,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 17,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'URL (адрес) страницы вашего сайта, через которую посетители заходят на ваш сайт (“посадочная страница”).',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'visitor_type',
                                    name: 'Тип посетителя',
                                    sort: 5800,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 17,
                                    data_type: 'json_object',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Новый - для первой сессии посетителя / Вернувшийся - для любой повторной сессии посетителя.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'visitor_id',
                                    name: 'ID посетителя',
                                    sort: 5900,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 17,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Уникальный идентификатор посетителя, присвоен нашим сервисом на сайте.',
                                    default_width: 116,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'ua_client_id',
                                    name: 'Client ID Google Analytics',
                                    sort: 6000,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 17,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Информация получена от аналитической системы Universal Analytics.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'ym_client_id',
                                    name: 'Client ID Яндекс.Метрика',
                                    sort: 6100,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 17,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Информация получена от аналитической системы Яндекс.Метрика.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'segments',
                                    name: 'Сегменты',
                                    sort: 6200,
                                    type: 'base',
                                    filter: {
                                        format: 'list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 17,
                                    data_type: 'segment_list',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'visit_date',
                                    name: 'Дата посещения',
                                    sort: 6300,
                                    type: 'base',
                                    filter: {
                                        format: 'date',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: '<',
                                            name: 'меньше',
                                            is_default: false
                                        }, {
                                            id: '>',
                                            name: 'больше',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 18,
                                    data_type: 'date',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'visit_hour',
                                    name: 'Час посещения',
                                    sort: 6400,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 18,
                                    data_type: 'json_object',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'visit_weekday',
                                    name: 'День недели посещения',
                                    sort: 6500,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 18,
                                    data_type: 'json_object',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'visit_month',
                                    name: 'Месяц посещения',
                                    sort: 6600,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 18,
                                    data_type: 'json_object',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'visit_year',
                                    name: 'Год посещения',
                                    sort: 6700,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 18,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'call_type',
                                    name: 'Тип звонка',
                                    sort: 6800,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 19,
                                    data_type: 'json_object',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: 116,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'call_status',
                                    name: 'Статус звонка',
                                    sort: 6900,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 19,
                                    data_type: 'json_object',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: 116,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'call_direction',
                                    name: 'Направление звонка',
                                    sort: 7000,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 19,
                                    data_type: 'json_object',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: 116,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'phone_tracking_type',
                                    name: 'Тип номера коллтрекинга',
                                    sort: 7100,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 19,
                                    data_type: 'json_object',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Тип номера коллтрекинга: Динамический номер, Статический номер, Номер по умолчанию.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'call_region_name',
                                    name: 'Регион номера абонента',
                                    sort: 7200,
                                    type: 'base',
                                    filter: {
                                        format: 'text_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 19,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'call_records',
                                    name: 'Запись разговоров',
                                    sort: 7300,
                                    type: 'base',
                                    filter: {
                                        format: null,
                                        operators: null
                                    },
                                    group_id: 19,
                                    data_type: 'list',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: 116,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'offline_message_type',
                                    name: 'Тип заявки',
                                    sort: 7400,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 20,
                                    data_type: 'json_object',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: 116,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'offline_message_form_name',
                                    name: 'Форма заявки',
                                    sort: 7650,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 20,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Название формы заявки, если заполнен параметр form_name при передачи заявки в наш сервис: https://www.comagic.ru/support/api/javascript-api/.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'chat_initiator',
                                    name: 'Инициатор',
                                    sort: 7700,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 21,
                                    data_type: 'json_object',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: 116,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'chat_messages_count',
                                    name: 'Сообщений',
                                    sort: 7800,
                                    type: 'base',
                                    filter: {
                                        format: 'numeric',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: '<',
                                            name: 'меньше',
                                            is_default: false
                                        }, {
                                            id: '>',
                                            name: 'больше',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 21,
                                    data_type: 'integer',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: 116,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'goal_type',
                                    name: 'Тип цели',
                                    sort: 7900,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 22,
                                    data_type: 'json_object',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'goal_name',
                                    name: 'Название цели',
                                    sort: 8000,
                                    type: 'base',
                                    filter: {
                                        format: 'list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 22,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'deals',
                                    name: 'Связанные сделки',
                                    sort: 8100,
                                    type: 'base',
                                    filter: {
                                        format: null,
                                        operators: null
                                    },
                                    group_id: 24,
                                    data_type: 'deal_list',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: true,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'virtual_phone_number',
                                    name: 'Виртуальный номер',
                                    sort: 8200,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 19,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: 129,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'chat_status',
                                    name: 'Статус чата',
                                    sort: 8300,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 21,
                                    data_type: 'json_object',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Статусы чата: Отклоненные, Потерянные, Системные, Состоявшиеся.',
                                    default_width: 116,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'chat_type',
                                    name: 'Тип чата',
                                    sort: 8400,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 21,
                                    data_type: 'json_object',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: 116,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }],
                                columns_groups: [{
                                    id: 4,
                                    name: 'Обращения',
                                    sort: 400,
                                    description: null,
                                    parent_group_id: null
                                }, {
                                    id: 8,
                                    name: 'Источник трафика',
                                    sort: 800,
                                    description: null,
                                    parent_group_id: null
                                }, {
                                    id: 9,
                                    name: 'Параметры рекламной кампании',
                                    sort: 900,
                                    description: null,
                                    parent_group_id: 8
                                }, {
                                    id: 10,
                                    name: 'Метки URL перехода',
                                    sort: 1000,
                                    description: null,
                                    parent_group_id: null
                                }, {
                                    id: 11,
                                    name: 'Метки UTM',
                                    sort: 1100,
                                    description: null,
                                    parent_group_id: 10
                                }, {
                                    id: 12,
                                    name: 'Метки Openstat',
                                    sort: 1200,
                                    description: null,
                                    parent_group_id: 10
                                }, {
                                    id: 13,
                                    name: 'Другие URL-метки',
                                    sort: 1300,
                                    description: null,
                                    parent_group_id: 10
                                }, {
                                    id: 14,
                                    name: 'Посетитель',
                                    sort: 1400,
                                    description: null,
                                    parent_group_id: null
                                }, {
                                    id: 15,
                                    name: 'География',
                                    sort: 1500,
                                    description: null,
                                    parent_group_id: 14
                                }, {
                                    id: 16,
                                    name: 'Компьютер',
                                    sort: 1600,
                                    description: null,
                                    parent_group_id: 14
                                }, {
                                    id: 17,
                                    name: 'История посетителя',
                                    sort: 1700,
                                    description: null,
                                    parent_group_id: null
                                }, {
                                    id: 18,
                                    name: 'Время посещения',
                                    sort: 1800,
                                    description: null,
                                    parent_group_id: null
                                }, {
                                    id: 19,
                                    name: 'Звонки',
                                    sort: 1900,
                                    description: null,
                                    parent_group_id: null
                                }, {
                                    id: 20,
                                    name: 'Заявки',
                                    sort: 2000,
                                    description: null,
                                    parent_group_id: null
                                }, {
                                    id: 21,
                                    name: 'Чаты',
                                    sort: 2100,
                                    description: null,
                                    parent_group_id: null
                                }, {
                                    id: 22,
                                    name: 'Цели',
                                    sort: 2200,
                                    description: null,
                                    parent_group_id: null
                                }, {
                                    id: 24,
                                    name: 'Сделки',
                                    sort: 2300,
                                    description: null,
                                    parent_group_id: null
                                }]
                            }
                        }
                    });

                Promise.runAll(false, true);
                spendTime(0)
            }
        };
    };

    me.reportFiltersRequest = () => {
        const params = {
            method: 'get.report_filters',
            params: {
                report_type: 'communications'
            }
        };

        data = [{
            id: 'ua_client_id',
            name: 'Client ID Google Analytics',
            format: 'text',
            values: [],
            operators: [{
                id: '=',
                name: 'равно',
                is_default: false
            }, {
                id: '!=',
                name: 'не равно',
                is_default: false
            }, {
                id: 'ilike',
                name: 'включает',
                is_default: true
            }, {
                id: 'not_ilike',
                name: 'исключает',
                is_default: false
            }, {
                id: 'is_null',
                name: 'не содержит данные',
                is_default: false
            }, {
                id: 'is_not_null',
                name: 'содержит данные',
                is_default: false
            }],
            description: 'Информация получена от аналитической системы Universal Analytics.',
            is_custom_dimension: false
        }];

        return {
            receiveResponse() {
                ajax.recentRequest().
                    expectBodyToContain(params).
                    respondSuccessfullyWith({
                        result: {data}
                    });

                Promise.runAll(false, true);
                spendTime(0)
            }
        };
    };

    me.reportRapidFiltersRequest = () => {
        const params = {
            method: 'get.report_rapid_filters',
            params: {
                report_type: 'marketer_dashboard'
            }
        };

        const data = [{
            id: 'some_filter',
            name: 'Некий фильтр',
            description: 'Описание некого фильтра',
            format: 'some_format',
            operators: [{
                id: 'some_operator',
                name: 'Некий оператор',
                is_default: false
            }],
            values: []
        }];

        return {
            communications() {
                params.params.report_type = 'communications';

                data.splice(0, data.length);

                data.push({
                    id: 'communication_type',
                    name: 'Тип обращения',
                    format: 'system_list',
                    values: [
                        'Заявки',
                        'Звонки',
                        'Цели',
                        'Чаты'
                    ],
                    operators: [{
                        id: '=',
                        name: 'равно',
                        is_default: true
                    }],
                    description: 'Типы обращений: Звонки, заявки, чаты, цели.'
                });

                return this;
            },

            receiveResponse() {
                ajax.recentRequest().
                    expectBodyToContain(params).
                    respondSuccessfullyWith({
                        result: {data}
                    });

                Promise.runAll(false, true);
                spendTime(0)
            }
        };
    };

    me.reportStateRequest = () => {
        let report_id = 582729;

        let data = {
            limit: 50,
            offset: 0,
            date_from: '2020-10-01 15:23:05',
            date_till: '2020-11-02 14:26:02',
            compared_date_from: '2020-12-03 13:24:53',
            compared_date_till: '2020-13-04 12:22:52',
            perspective_window: 180,
            dimensions: [],
            columns: [],
            filter: {
                field: 'name',
                operator: '==',
                value: 'Некое имя',
                filters: [],
                condition: 'and',
            },
            rapid_filter: {
                field: 'description',
                operator: '==',
                value: 'Некое описание',
                filters: [],
                condition: 'and',
            },
            sort: [{
                field: 'name',
                order: 'asc'
            }],
            column_params: {
                name: {
                    width: 200,
                    filter: {
                        field: 'name',
                        operator: '==',
                        value: 'Некое имя',
                        filters: [],
                        condition: 'and',
                    }
                }
            },
            main_column: 'name',
            additional_column: 'description',
            checked_dimensions: [{
                key: 'some_key',
                dimension_id: 'some_dimension',
                dimension_value: 'some_dimension_value',
                dimension_value_id: 'some_dimension_id',
                pos: 0,
            }],
            is_chart_visible: true,
            isGrouping: false,
            goal_ids: [282572],
            chart_id: 'line',
            datetime_dimension: 'day'
        };

        return {
            allRequests() {
                report_id = 48427;

                data = {
                    sort: [{
                        field: 'communication_date_time',
                        order: 'desc'
                    }],
                    limit: 50,
                    offset: 0,
                    columns: [
                        'communication_type',
                        'communication_date_time',
                        'communication_number',
                        'visitor_id',
                        'virtual_phone_number',
                        'tags',
                        'call_records',
                        'total_duration',
                        'call_type',
                        'call_status',
                        'call_direction',
                        'employees',
                        'chat_initiator',
                        'chat_messages_count',
                        'offline_message_type'
                    ],
                    date_from: '2022-01-01 00:00:00',
                    date_till: '2022-02-14 23:59:59',
                    dimensions: [],
                    isGrouping: false,
                    rapid_filter: {
                        filters: [{
                            field: 'communication_type',
                            value: 'Заявки',
                            operator: '='
                        }, {
                            field: 'communication_type',
                            value: 'Чаты',
                            operator: '='
                        }],
                        condition: 'or'
                    },
                    is_chart_visible: true,
                    datetime_dimension: 'day',
                    global_calendar_on: true,
                    perspective_window: 30
                };

                return this;
            },

            receiveResponse() {
                ajax.recentRequest().
                    expectBodyToContain({
                        method: 'getobj.report_state',
                        params: {report_id}
                    }).
                    respondSuccessfullyWith({
                        result: {data}
                    });

                Promise.runAll(false, true);
                spendTime(0)
            }
        };
    };

    me.reportTypesRequest = () => {
        const data = [{
            id: 'marketer_dashboard',
            name: 'Некий тип отчета',
            configuration: 'dashboard'
        }, {
            id: 'communications',
            name: 'Обращения',
            configuration: 'flat'
        }];

        return {
            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            },

            expectToBeSent: requests => {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectBodyToContain({
                        method: 'get.report_types',
                        params: {}
                    });

                return {
                    receiveResponse() {
                        request.respondSuccessfullyWith({
                            result: {data}
                        });

                        Promise.runAll(false, true);
                        spendTime(0)
                    }
                };
            }
        };
    };

    me.reportsListRequest = () => {
        const data = [{
            id: 582729,
            group_id: 1,
            type: 'marketer_dashboard',
            name: 'Некий отчет',
            description: 'Описание некого отчета',
            folder: null,
            sort: 0
        }];

        const addResponseModifiers = me => {
            me.allRequests = () => (data.push({
                id: 48427,
                name: 'Все обращения',
                sort: 1000,
                type: 'communications',
                group_id: 9,
                is_system: false,
                description: 'Показывает информацию по всем видам обращений (звонкам, заявкам, чатам) в едином окне. ' +
                    'Отчет строится по дате обращения.'
            }), me);

            return me;
        };

        return addResponseModifiers({
            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            },

            expectToBeSent: requests => {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectBodyToContain({
                        method: 'get.reports_list',
                        params: {}
                    });

                return addResponseModifiers({
                    receiveResponse() {
                        request.respondSuccessfullyWith({
                            result: {data}
                        });

                        Promise.runAll(false, true);
                        spendTime(0)
                    }
                });
            }
        });
    };

    me.reportGroupsRequest = () => {
        const response = {
            result: {
                data: [{
                    id: 1,
                    name: 'Дашборды',
                    parent_id: null,
                    sort: 0
                }, {
                    id: 9,
                    name: 'Сырые данные',
                    sort: 80,
                    parent_id: null
                }]
            }
        };

        const headers = {
            Authorization: 'Bearer XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0',
            'X-Auth-Type': 'jwt'
        };

        const request = addAuthErrorResponseModifiers({
            anotherAuthorizationToken: () =>
                ((headers.Authorization = 'Bearer 935jhw5klatxx2582jh5zrlq38hglq43o9jlrg8j3lqj8jf'), request),

            thirdAuthorizationToken: () =>
                ((headers.Authorization = 'Bearer 2924lg8hg95gl8h3g2lg8o2hgg8shg8olg8qg48ogih7h29'), request),

            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).expectBodyToContain({
                    method: 'get.report_groups',
                    params: {}
                }).expectToHaveHeaders(headers);

                return addAuthErrorResponseModifiers({
                    receiveResponse() {
                        request.respondSuccessfullyWith(response);

                        Promise.runAll(false, true);
                        spendTime(0)
                    }
                }, response);
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            }
        }, response);

        return request;
    };

    me.accountRequest = () => {
        let token = 'XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0';

        const response = {
            result: {
                data: {
                    lang: 'ru',
                    tp_id: 406,
                    app_id: 1103,
                    project: 'comagic',
                    tp_name: 'Comagic Enterprise',
                    user_id: 151557,
                    employee_id: 20816,
                    app_name: 'Карадимова Веска Анастасовна',
                    crm_type: 'e2e_analytics',
                    timezone: 'Europe/Moscow',
                    app_state: 'active',
                    user_name: 'karadimova',
                    user_type: 'user',
                    feature_flags: ['softphone', 'large_softphone', 'call_stats', 'call_history'],
                    call_center_role: 'employee',
                    components: [
                        'operation',
                        'dialing',
                        'ext_dialing',
                        'extended_report',
                        'fax_receiving',
                        'voice_mail',
                        'menu',
                        'information_message',
                        'auth',
                        'integration',
                        'fax_receiving_button',
                        'transfer',
                        'tag_call',
                        'run_scenario',
                        'trainer',
                        'trainer_in',
                        'trainer_button',
                        'trainer_desktop',
                        'call_distribution_report',
                        'call_session_distribution_report',
                        'recording_in',
                        'recording_out',
                        'recording_button',
                        'notification',
                        'notification_by_sms',
                        'notification_by_email',
                        'notification_by_http',
                        'api',
                        'callapi',
                        'callapi_management_call',
                        'callapi_informer_call',
                        'callapi_scenario_call',
                        'send_sms',
                        'va',
                        'call_tracking',
                        'dynamic_call_tracking',
                        'ppc_integration',
                        'wa_integration',
                        'callout',
                        'callback',
                        'sip',
                        'consultant',
                        'recording',
                        'talk_option',
                        'sitephone',
                        'lead',
                        'partner_integration',
                        'amocrm',
                        'reserve_dynamic_numbers',
                        'retailcrm',
                        'dashboard',
                        'dataapi',
                        'dataapi_reports',
                        'dataapi_provisioning',
                        'speech_analytics',
                        'processed_lost_call',
                        'bitrix',
                        'distribution_by_communication_number',
                        'distribution_by_region',
                        'distribution_by_segment',
                        'private_number',
                        'megaplan',
                        'internal_lines',
                        'fmc',
                        'auto_back_call_by_lost_call',
                        'split_channel_recording',
                        'infoclinica',
                        'facebook_ads',
                        'google_adwords',
                        'yandex_direct',
                        'sales_funnel',
                        'number_capacity_auto_usage',
                        'call_monitoring_and_analytics',
                        'keyword_spotting',
                        'attribution_tools',
                        'assisted_conversions',
                        'attribution_models',
                        'antispam',
                        'auto_back_call_by_offline_message',
                        'amocrm_extended_integration',
                        'spam_calls_blocking',
                        'upload_calls',
                        'preserved_calls',
                        '1c_rarus',
                        'fitness_1c',
                        'yandex_metrika',
                        'e2e_analytics',
                        'vk_ads',
                        'upload_offline_messages',
                        'upload_chats',
                        'mytarget_ads',
                        'stt_crt',
                        'upload_sessions',
                    ],
                    user_login: 'karadimova',
                    customer_id: 183510,
                    permissions: [
                        {
                            'unit_id': 'call_recordings',
                            'is_delete': true,
                            'is_insert': false,
                            'is_select': true,
                            'is_update': true,
                        },
                        {
                            'unit_id': 'tag_management',
                            'is_delete': true,
                            'is_insert': true,
                            'is_select': true,
                            'is_update': true,
                        },
                        {
                            'unit_id': 'softphone_login',
                            'is_delete': true,
                            'is_insert': true,
                            'is_select': true,
                            'is_update': true,
                        }
                    ],
                    is_agent_app: false
                }
            }
        };

        const addResponseModifiers = me => {
            me.webAccountLoginAvailable = () => {
                response.result.data.permissions.push({
                    'unit_id': 'web_account_login',
                    'is_delete': true,
                    'is_insert': true,
                    'is_select': true,
                    'is_update': true,
                });

                return me;
            };

            me.operatorWorkplaceAvailable = () => {
                response.result.data.components.push('operator_workplace');

                response.result.data.permissions.push({
                    'unit_id': 'operator_workplace_access',
                    'is_delete': true,
                    'is_insert': true,
                    'is_select': true,
                    'is_update': true,
                });

                return me;
            };
            
            me.manager = () => (response.result.data.call_center_role = 'manager', me);
            me.softphoneFeatureFlagDisabled = () => ((response.result.data.feature_flags = []), me);

            me.largeSoftphoneFeatureFlagDisabled = () =>
                ((response.result.data.feature_flags = response.result.data.feature_flags.filter(featureFlag =>
                    featureFlag != 'large_softphone')), me);

            me.callStatsFeatureFlagDisabled = () =>
                ((response.result.data.feature_flags = response.result.data.feature_flags.filter(featureFlag =>
                    featureFlag != 'call_stats')), me);

            me.callHistoryFeatureFlagDisabled = () =>
                ((response.result.data.feature_flags = response.result.data.feature_flags.filter(featureFlag =>
                    featureFlag != 'call_history')), me);

            me.managerSoftphoneFeatureFlagEnabled = () =>
                ((response.result.data.feature_flags = ['manager_softphone']), me);

            me.softphoneUnavailable = () => ((response.result.data.permissions =
                response.result.data.permissions.filter(({unit_id}) => unit_id != 'softphone_login')), me);

            return me;
        };

        return addResponseModifiers({
            anotherAuthorizationToken() {
                token = '935jhw5klatxx2582jh5zrlq38hglq43o9jlrg8j3lqj8jf';
                return this;
            },

            expectToBeSent(requests) {
                let request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectPathToContain('$REACT_APP_BASE_URL').
                    expectToHaveMethod('POST').
                    expectToHaveHeaders({
                        Authorization: `Bearer ${token}`,
                        'X-Auth-Type': 'jwt'
                    }).
                    expectBodyToContain({
                        method: 'getobj.account',
                        params: {}
                    });

                const me = addResponseModifiers({
                    receiveResponse: () => {
                        request.respondSuccessfullyWith(response);

                        Promise.runAll(false, true);
                        spendTime(0)
                        spendTime(0)
                    }
                });

                return me;
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    me.refreshRequest = () => {
        const response = {
            result: {
                jwt: '935jhw5klatxx2582jh5zrlq38hglq43o9jlrg8j3lqj8jf',
                refresh: '4g8lg282lr8jl2f2l3wwhlqg34oghgh2lo8gl48al4goj48'
            }
        };

        let token = 'XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0',
            refresh = '2982h24972hls8872t2hr7w8h24lg72ihs7385sdihg2';

        const addResponseModifiers = me => {
            me.refreshTokenExpired = () => {
                response.result = null;

                response.error = {
                    code: '-33020',
                    message: 'Expired refresh token'
                };

                return me;
            };

            me.anotherAuthorizationToken = () => {
                token = '935jhw5klatxx2582jh5zrlq38hglq43o9jlrg8j3lqj8jf';
                refresh = '4g8lg282lr8jl2f2l3wwhlqg34oghgh2lo8gl48al4goj48';

                response.result.jwt = '2924lg8hg95gl8h3g2lg8o2hgg8shg8olg8qg48ogih7h29';
                response.result.refresh = '29onc84u2n9u2nlt39g823hglohglhg2o4l8gh2lf2hoj48';

                return me;
            };

            return me;
        };

        return addResponseModifiers({
            expectToBeSent() {
                request = ajax.recentRequest().
                    expectPathToContain('$REACT_APP_AUTH_URL').
                    expectToHaveMethod('POST').
                    expectToHaveHeaders({
                        Authorization: `Bearer ${token}`,
                        'X-Auth-Type': 'jwt'
                    }).
                    expectBodyToContain({
                        method: 'refresh',
                        params: {
                            jwt: token,
                            refresh
                        }
                    });

                return addResponseModifiers({
                    receiveResponse() {
                        request.respondSuccessfullyWith(response);

                        Promise.runAll(false, true);
                        spendTime(0)
                    }
                });
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    me.loginRequest = () => {
        const response = {
            result: jwtToken 
        };

        return {
            anotherAuthorizationToken() {
                response.result = anotherJwtToken;
                return this;
            },

            receiveResponse() {
                ajax.recentRequest().
                    expectPathToContain('$REACT_APP_AUTH_URL').
                    expectToHaveMethod('POST').
                    expectBodyToContain({
                        method: 'login',
                        params: {
                            login: 'botusharova',
                            password: '8Gls8h31agwLf5k',
                            project: 'comagic'
                        }
                    }).
                    respondSuccessfullyWith(response);

                Promise.runAll(false, true);
                spendTime(0)
                spendTime(0);
                spendTime(0);
                spendTime(0);
            }
        };
    };

    me.extendMasterNotification((notification, data) => ((notification.revive = () =>
        ((data.action = 'revive'), notification)), notification));

    me.extendOthersNotification((notification, data) => {
        notification.prompterCallPreparation = () => {
            data.action = 'prepare_to_prompter_call';

            data.data = {
                call_session_id: 79161234567,
                subscriber_number: '79161234569',
                employee_full_name: 'Шалева Дора Добриновна',
                show_notification: true
            };

            notification.noSubscriberNumber = () => ((data.data.subscriber_number = null), notification);
            notification.dontShowNotification = () => ((data.data.show_notification = false), notification);
            notification.anotherPhoneNumber = () => ((data.data.call_session_id = 79161234570), notification);

            return notification;
        };
        
        return notification;
    });

    me.ipcPrompterCallPreparationMessage = () => {
        const data = {
            call_session_id: 79161234567,
            subscriber_number: '79161234569',
            employee_full_name: 'Шалева Дора Добриновна',
            show_notification: true
        };
        
        return {
            noSubscriberNumber() {
                data.subscriber_number = null;
                return this;
            },

            dontShowNotification() {
                data.show_notification = false;
                return this;
            },

            anotherPhoneNumber() {
                data.call_session_id = 79161234570;
                return this;
            },

            receive: () => {
                me.eventBus.broadcast('prepare_to_prompter_call', data);
                Promise.runAll(false, true);
            }
        };
    };

    me.ipcPrompterCallAwaitMessage = () => {
        let data = null;
        
        return {
            alreadyPreparing() {
                data = 'Подготовка к звонку уже прозводится';
                return this;
            },

            expectToBeSent: () => me.eventBus.
                nextEvent().
                expectEventNameToEqual('await_prompter_call').
                expectToHaveArguments(data)
        };
    };

    me.ipcPrompterCallEndMessage = () => ({
        receive: () => me.eventBus.broadcast('end_prompter_call')
    });

    me.applicationVersionChanged = function () {
        var params = {
            application_version: '6.6.666'
        };

        return {
            critical: function () {
                params.application_version = '6.7.666';
                return this;
            },
            uncritical: function () {
                params.application_version = '6.6.667';
                return this;
            },
            receive: function () {
                me.eventsWebSocket.receiveMessage({
                    name: 'application_version_changed',
                    type: 'event',
                    params: params 
                });
            }
        };
    };

    me.disableTimeout = callback => {
        const setTimeout = window.setTimeout;
        window.setTimeout = () => null;

        callback();

        window.setTimeout = setTimeout;
    };

    me.dispatchResizeEvent = () => {
        window.dispatchEvent(new Event('resize'));
        spendTime(0);
    };

    me.forceUpdate = () => utils.pressKey('k');
    me.body = testersFactory.createDomElementTester('body');
    me.phoneIcon = testersFactory.createDomElementTester('.cm-top-menu-phone-icon');
    me.incomingIcon = testersFactory.createDomElementTester('.incoming_svg__cmg-direction-icon');
    me.outgoingIcon = testersFactory.createDomElementTester('.outgoing_svg__cmg-direction-icon');
    me.transferIncomingIcon = testersFactory.createDomElementTester('.transfer_incoming_svg__cmg-direction-icon');
    me.holdButton = testersFactory.createDomElementTester('.cmg-hold-button');

    me.productsButton = testersFactory.
        createDomElementTester('.src-components-main-menu-products-styles-module__icon-container');

    me.transferButton = (tester => {
        const click = tester.click.bind(tester);

        tester.click = () => (click(), Promise.runAll(false, true));
        return tester;
    })(testersFactory.createDomElementTester('#cmg-transfer-button'));

    me.callsHistoryRow = (() => {
        const createTester = row => {
            row = row || new JsTester_NoElement();
            const tester = testersFactory.createDomElementTester(row);

            tester.name =
                testersFactory.createDomElementTester(row.querySelector('.clct-calls-history__item-inner-row'));
            tester.callIcon =
                testersFactory.createDomElementTester(row.querySelector('.clct-calls-history__start-call'));
            tester.directory =
                testersFactory.createDomElementTester(row.querySelector('.clct-calls-history__item-direction svg'));

            return tester;
        };

        return {
            atIndex: index => createTester(document.querySelectorAll('.clct-calls-history__item')[index]),

            withText: text => createTester(utils.descendantOfBody().matchesSelector(
                '.clct-calls-history__item-inner-row'
            ).textEquals(text).find().closest('.clct-calls-history__item'))
        };
    })();

    addTesters(me, () => document.body);

    me.dialpadVisibilityButton = (() => {
        const tester = testersFactory.createDomElementTester('#cmg-dialpad-visibility-toggler'),
            click = tester.click.bind(tester);

        tester.click = () => (click(), spendTime(0));
        return tester;
    })();

    me.searchButton = testersFactory.createDomElementTester('.cmg-search-button');
    me.addressBookButton = testersFactory.createDomElementTester('#cmg-address-book-button');
    me.contactOpeningButton = testersFactory.createDomElementTester('#cmg-open-contact-button');

    me.employeeRow = text => (domElement => {
        const tester = testersFactory.createDomElementTester(domElement);

        tester.expectToBeDisaled = () => tester.expectToHaveClass('cmg-disabled');
        tester.expectToBeEnabled = () => tester.expectNotToHaveClass('cmg-disabled');

        tester.transferIcon = testersFactory.createDomElementTester(domElement.querySelector(
            '.transfer_employee_svg__cmg-employee-transfer-icon'
        ));

        tester.callIcon = testersFactory.createDomElementTester(domElement.querySelector(
            '.employees_grid_call_icon_svg__cmg-employee-call-icon'
        ));

        return tester;
    })(utils.descendantOfBody().matchesSelector('.cmg-employee').textContains(text).find());

    me.softphone = (getRootElement => {
        const tester = addTesters(
            testersFactory.createDomElementTester(getRootElement),
            getRootElement
        );

        tester.expectToBeCollapsed = () => tester.expectToHaveHeight(212);
        tester.expectToBeExpanded = () => tester.expectToHaveHeight(568);

        return tester;
    })(() => document.querySelector('#cmg-amocrm-widget') || new JsTester_NoElement());

    me.closeButton = (() => {
        const tester = testersFactory.createDomElementTester(
            '.cmg-miscrophone-unavailability-message-close, .cmg-connecting-message-close, .ui-audio-player__close'
        );

        const click = tester.click.bind(tester);
        tester.click = () => (click(), spendTime(0));

        return tester;
    })();

    me.antDrawerCloseButton = testersFactory.createDomElementTester('.ant-drawer-close');
    me.digitRemovingButton = testersFactory.createDomElementTester('.clct-adress-book__dialpad-header-clear');
    me.collapsednessToggleButton = testersFactory.createDomElementTester('.cmg-collapsedness-toggle-button svg');

    const createCollapsedessButton = className => {
        const tester = testersFactory.createDomElementTester(`.${className}`),
            click = tester.click.bind(tester);

        tester.expectToBePressed = () => tester.expectToHaveClass('cmg-button-pressed');
        tester.expectNotToBePressed = () => tester.expectNotToHaveClass('cmg-button-pressed');
        tester.click = () => (click(), spendTime(0));

        return tester;
    };

    me.largeSizeButton = createCollapsedessButton('cmg-large-size-button');
    me.middleSizeButton = createCollapsedessButton('cmg-middle-size-button');
    me.smallSizeButton = createCollapsedessButton('cmg-small-size-button');
    me.hideButton = testersFactory.createDomElementTester('.cmg-hide-button');
    me.playerButton = testersFactory.createDomElementTester('.clct-audio-button');
    me.otherChannelCallNotification = createRootTester('#cmg-another-sip-line-incoming-call-notification');
    me.bugButton = testersFactory.createDomElementTester('.cmg-bug-icon');
    me.notificationSection = testersFactory.createDomElementTester('.cm-chats--chat-notifications');
    me.statusDurations = testersFactory.createDomElementTester('.cmg-softphone--call-stats-statuses-duration');

    {
        const tester = testersFactory.createDomElementTester('.ui-select-popup-header .ui-icon'),
            click = tester.click.bind(tester);

        tester.click = () => (click(), spendTime(0));
        me.arrowNextToSearchField = tester;
    }

    me.leftMenu = (() => {
        const getDomElement = () => utils.querySelector('.src-components-main-menu-styles-module__nav'),
            tester = testersFactory.createDomElementTester(getDomElement);

        return addTesters(tester, getDomElement);
    })();

    me.popover = (() => {
        const getDomElement = () => utils.getVisibleSilently(document.querySelectorAll('.ui-popover')),
            tester = testersFactory.createDomElementTester(getDomElement);

        return addTesters(tester, getDomElement);
    })();

    me.fieldRow = text => (() => {
        const labelEl = utils.descendantOfBody().
            textEquals(text).
            matchesSelector('.ui-label-content-field-label, .clct-settings-field-label').
            find();

        const row = labelEl.closest('.ant-row, .clct-settings-field-row'),
            me = testersFactory.createDomElementTester(row);

        return addTesters(me, () => row);
    })();

    me.statusesList = (() => {
        const selector = '.cm-chats--account-popup',
            tester = testersFactory.createDomElementTester(selector);

        tester.item = text => {
            const domElement = utils.descendantOf(document.querySelector(selector)).
                matchesSelector('.cm-chats--account-popup--item').
                textEquals(text).
                find();

            const tester = testersFactory.createDomElementTester(domElement),
                click = tester.click.bind(tester),
                isSelected = () => !!domElement.querySelectorAll('.ui-icon')[1];

            tester.click = () => (click(), Promise.runAll(false, true));

            const expectToBeVisible = tester.expectToBeVisible.bind(tester);

            tester.expectToBeVisible = () => {
                expectToBeVisible();

                if ((
                    domElement.closest('.cm-chats--account-popup') || new JsTester_NoElement()
                ).parentNode.style.visibility == 'hidden') {
                    throw new Error('Выпадающий список статусов должен быть видимым.');
                }
            };
            
            tester.expectToBeSelected = () => {
                tester.expectToBeVisible();

                if (!isSelected()) {
                    throw new Error(`Статус "${text}" должен быть выбран.`);
                }
            };

            tester.expectNotToBeSelected = () => {
                tester.expectToBeVisible();

                if (isSelected()) {
                    throw new Error(`Статус "${text}" не должен быть выбран.`);
                }
            };

            return tester;
        };

        return tester;
    })();

    me.logoutButton = (() => {
        const tester = testersFactory.createDomElementTester(() => {
            let domElement = utils.descendantOfBody().
                matchesSelector('.cm-user-only-account--popup-content span').
                textEquals('Выход').
                find();

            domElement instanceof JsTester_NoElement && (domElement = utils.descendantOfBody().
                matchesSelector('.cm-chats--account-popup--item').
                textEquals('Выход').
                find());

            return domElement;
        });

        const click = tester.click.bind(tester);
        tester.click = () => (click(), Promise.runAll(false, true));

        return tester;
    })();

    me.interceptButton = testersFactory.createDomElementTester('.cmg-intercept-button');

    return me;
});
