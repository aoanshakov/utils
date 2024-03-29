define(() => {
    let stores 

    const resetStores = () => {
        if (!stores) {
            return false;
        }

        stores.appStore.isAuthenticated = false;
        stores.appStore.directory = {};
        stores.appStore.user = null;
        stores.featureFlagsStore.initParams();
        stores.eventsStore.initParams();

        return true;
    };

    return function (options) {
        const testersFactory = options.testersFactory,
            utils = options.utils,
            ajax = options.ajax,
            userMedia = options.userMedia,
            spendTime = options.spendTime,
            resetIsDone = resetStores();

        result = options.runApplication(options);

        const {app, path} = result;
        stores = result.stores;

        !resetIsDone && resetStores();

        function Checkbox (element) {
            var checkbox = testersFactory.createDomElementTester(element);

            checkbox.expectToBeChecked = () => checkbox.closest('.ant-checkbox').
                expectToHaveClass('ant-checkbox-checked');

            checkbox.expectNotToBeChecked = () => checkbox.closest('.ant-checkbox').
                expectNotToHaveClass('ant-checkbox-checked');

            return checkbox;
        }

        const createTesters = (getRoot, me) => {
            const getFieldByLabel = label => utils.descendantOf(getRoot()).
                matchesSelector('label').
                textEquals(label).
                find().
                closest('div');

            me.select = () => {
                const createTester = (getSelect, description = '') => {
                    const tester = testersFactory.createDomElementTester(getSelect);

                    tester.expectToHaveValue = expectedValue => {
                        const actualValue = utils.getTextContent(getSelect().querySelector(
                            '.ant-select-selection-selected-value, ' +
                            '.ant-select-selection__rendered ul'
                        ));

                        if (actualValue != expectedValue) {
                            throw new Error(
                                `Выпадающий список${description} должен иметь значение ` +
                                `"${expectedValue}", а не "${actualValue}".`
                            );
                        }
                    };

                    tester.arrowIcon = () => testersFactory.createDomElementTester(
                        getSelect().querySelector('.ant-select-arrow-icon')
                    );
                    
                    addErrorIcon(tester, getSelect);

                    return tester;
                };

                const tester = createTester(() => getRoot().querySelector('.ant-select') || new JsTester_NoElement());

                tester.option = text => testersFactory.createDomElementTester(
                    utils.descendantOfBody().
                        matchesSelector('.ant-select-dropdown-menu-item').
                        textEquals(text).
                        find()
                );

                tester.withPlaceholder = placeholder => createTester(
                    () => utils.descendantOf(getRoot()).
                        matchesSelector('.ant-select-selection__placeholder').
                        textEquals(placeholder).
                        maybeInvisible().
                        find().
                        closest('.ant-select') || new JsTester_NoElement(),

                    ` с плейсхолдером "${placeholder}"`
                );

                return tester;
            };

            me.textfield = () => {
                const tester = testersFactory.createTextFieldTester(() =>
                    (getRoot() || new JsTester_NoElement()).querySelector('input'));

                tester.withPlaceholder = placeholder => {
                    const getDomElement = () => getRoot().querySelector('input[placeholder="' + placeholder + '"]'),
                        tester = testersFactory.createTextFieldTester(getDomElement());

                    addErrorIcon(tester, getDomElement);
                    return tester;
                };

                return tester;
            };

            me.tab = text => testersFactory.createDomElementTester(
                utils.descendantOf(getRoot()).
                    matchesSelector('.ant-tabs-tab').
                    textEquals(text).
                    find()
            );

            me.anchor = text => testersFactory.createAnchorTester(
                utils.descendantOf(getRoot()).
                    matchesSelector('a').
                    textEquals(text).
                    find()
            );

            me.button = text => {
                const tester = testersFactory.createDomElementTester(
                    utils.getVisibleSilently(
                        utils.descendantOf(getRoot()).
                            matchesSelector('.ant-btn, .pagination-item-link').
                            textEquals(text).
                            findAll()
                    )
                );
                
                const click = tester.click.bind(tester);
                tester.click = () => (click(), Promise.runAll(false, true));

                return tester;
            };

            me.checkbox = () => {
                const tester = new Checkbox(getRoot().querySelector('.ant-checkbox-input'));

                tester.withLabel = label => new Checkbox(
                    utils.descendantOf(getRoot()).
                        matchesSelector('.comagic-checkbox').
                        textEquals(label).
                        find().
                        querySelector('.ant-checkbox-input')
                );

                return tester;
            };

            {
                const getTester = getRoot => {
                    const tester = testersFactory.createDomElementTester(() => getRoot().querySelector('.ant-switch'));

                    tester.expectToBeChecked = () => tester.expectToHaveClass('ant-switch-checked');
                    tester.expectNotToBeChecked = () => tester.expectNotToHaveClass('ant-switch-checked');

                    return tester;
                };

                const tester = getTester(getRoot);
                tester.withLabel = label => getTester(() => getFieldByLabel(label));

                me.switchField = () => tester;
            }

            return me;
        };

        const addErrorIcon = (tester, getDomElement) =>
            (tester.errorIcon = () => testersFactory.createDomElementTester(((
                getDomElement().parentNode || new JsTester_NoElement()
            ).parentNode || new JsTester_NoElement()).querySelector('.comagic-icon-exclamation')));

        return createTesters(() => document.body, {
            modal() {
                const getRoot = () => utils.getVisibleSilently(document.querySelectorAll('.ant-modal')),
                    tester = createTesters(getRoot, testersFactory.createDomElementTester(getRoot));

                tester.closeIcon = () =>
                    testersFactory.createDomElementTester(() => getRoot().querySelector('.anticon-close'));

                return tester;
            },
            
            radioButton(text) {
                const getRadioButton = () => utils.descendantOfBody().
                    matchesSelector('.ant-radio-button-wrapper span:not(.ant-radio-button)').
                    textEquals(text).
                    find();

                const tester = testersFactory.createDomElementTester(getRadioButton);

                const getRadioButtonTester = () => testersFactory.createDomElementTester(() =>
                    getRadioButton().closest('label').querySelector('.ant-radio-button'));

                tester.expectToBeChecked = () => getRadioButtonTester().expectToHaveClass('ant-radio-button-checked');

                tester.expectNotToBeChecked = () =>
                    getRadioButtonTester().expectNotToHaveClass('ant-radio-button-checked');

                return tester;
            },
            
            calendar() {
                const applyDatePicker = (me, getElement) => {
                    me.cell = content => {
                        const getCells = (index) => utils.descendantOf(getElement()).
                            matchesSelector('.ant-calendar-date').
                            textEquals(content).
                            findAllVisible()[index];

                        const tester = testersFactory.createDomElementTester(() => getCells(0))
                        tester.second = () => testersFactory.createDomElementTester(() => getCells(1));

                        return tester;
                    };

                    me.prevMonth = () => testersFactory.createDomElementTester(
                        getElement().querySelector('.ant-calendar-prev-month-btn')
                    );
                        
                    me.nextMonth = () => testersFactory.createDomElementTester(
                        getElement().querySelector('.ant-calendar-next-month-btn')
                    );

                    return me;
                };

                const getCalendar = side => {
                    const getElement = () =>
                        document.querySelector(`.ant-calendar-range-${side}`) || (new JsTester_NoElement());

                    return applyDatePicker({}, getElement);
                };

                return applyDatePicker({
                    timePicker() {
                        const getPart = part => {
                            const getPicker = index => value => testersFactory.createDomElementTester(
                                utils.descendantOf(document.querySelectorAll(
                                    `.ant-calendar-range-${part} .ant-calendar-time-picker-select`
                                )[index]).
                                    matchesSelector('li').
                                    textEquals(value).
                                    find()
                            );

                            return {
                                hour: getPicker(0),
                                minute: getPicker(1),
                                second: getPicker(2)
                            };
                        };

                        return {
                            left: () => getPart('left'),
                            right: () => getPart('right')
                        };
                    },

                    timePickerButton() {
                        return testersFactory.createDomElementTester(
                            document.querySelector('.ant-calendar-time-picker-btn')
                        );
                    },

                    okButton() {
                        return testersFactory.createDomElementTester(document.querySelector('.ant-calendar-ok-btn'));
                    },

                    clearIcon() {
                        return testersFactory.createDomElementTester(() => {
                            return document.querySelector('.ant-calendar-picker-clear');
                        });
                    },

                    left() {
                        return getCalendar('left');
                    },

                    right() {
                        return getCalendar('right');
                    }
                }, () => document.body);
            },

            spinner: testersFactory.createDomElementTester(() => document.querySelector('.ant-spin-dot')),
            dropdown: testersFactory.createDomElementTester(() => document.querySelector('.ant-dropdown')),
            tooltip: testersFactory.createDomElementTester(() =>
                utils.getVisibleSilently(document.querySelectorAll('.ant-tooltip-inner'))),
            notification: testersFactory.createDomElementTester(() => document.querySelector('.ant-notification')),

            table() {
                const tester = testersFactory.createDomElementTester('.softphone-settings-form');
                
                tester.header = () => {
                    return {
                        checkbox: () =>
                            new Checkbox(document.querySelector('.ant-table-header-column .ant-checkbox-input')),

                        withContent(content) {
                            const header = utils.descendantOfBody().matchesSelector('.ant-table-header-column').
                                textEquals(content).find();

                            const headerTester = testersFactory.createDomElementTester(header),
                                sortIconTester = testersFactory.
                                    createDomElementTester(header.querySelector('.table-header-column-sort img'));

                            sortIconTester.expectToBeArrowUp = () => sortIconTester.expectAttributeToHaveValue(
                                'src',

                                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAKCAMAAABR24SMAAAAAXNSR0IArs' +
                                '4c6QAAAARnQU1BAACxjwv8YQUAAAMAUExURQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
                                'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
                                'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
                                'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
                                'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
                                'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
                                'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
                                'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
                                'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
                                'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
                                'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
                                'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
                                'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
                                'AAAAAAAAAAAAAAAAAAALMw9IgAAAEAdFJOU/////////////////////////////////////////////' +
                                '////////////////////////////////////////////////////////////////////////////////' +
                                '////////////////////////////////////////////////////////////////////////////////' +
                                '////////////////////////////////////////////////////////////////////////////////' +
                                '///////////////////////////////////////////////////////wBT9wclAAAACXBIWXMAAA7DAA' +
                                'AOwwHHb6hkAAAAGXRFWHRTb2Z0d2FyZQBwYWludC5uZXQgNC4wLjEzNANbegAAACJJREFUGFdj+A8EcI' +
                                'KBAUyCGSAmA4QBZEJpEEBWRwTr/38AiVkxz9dAKNcAAAAASUVORK5CYII='
                            );

                            sortIconTester.expectToBeArrowDown = () => sortIconTester.expectAttributeToHaveValue(
                                'src',

                                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAKCAYAAABmBXS+AAAACX' +
                                'BIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAA4SURBVH' +
                                'gBvZAxCgAgDANz/v/PEQehasVO3pSWI5SiFYfMDE0FPkvjOFckPUQIg28lbMv0TxlHYwddtQ' +
                                'YM1RfzWgAAAABJRU5ErkJggg=='
                            );

                            headerTester.sortIcon = () => sortIconTester;
                            return headerTester;
                        }
                    };
                };

                tester.cell = () => {
                    return {
                        withContent(content) {
                            return {
                                row() {
                                    const cellSelector = '.ant-table-row > td, .softphone-settings-form td';

                                    const getRow = () => utils.descendantOfBody().
                                        matchesSelector(cellSelector).
                                        textEquals(content).
                                        find().
                                        closest('.ant-table-row, tr');

                                    return createTesters(getRow, {
                                        actionsMenu: () => {
                                            const tester = testersFactory.createDomElementTester(
                                                getRow().querySelector('.ant-dropdown-trigger')
                                            );

                                            const click = tester.click.bind(tester);

                                            tester.click = () => (click(), Promise.runAll(false, true));
                                            return tester;
                                        },

                                        querySelector: selector => testersFactory.createDomElementTester(
                                            getRow().querySelector(selector)
                                        ),

                                        checkbox: () => new Checkbox(
                                            getRow().querySelector('.ant-checkbox-input')
                                        ),

                                        column: () => ({
                                            withHeader: text => {
                                                const headers = document.querySelectorAll(
                                                    '.softphone-settings-form th'
                                                );

                                                const index = Array.prototype.findIndex.call(
                                                    headers,
                                                    header => utils.getTextContent(header) == text
                                                );

                                                if (index == -1) {
                                                    return createTesters(
                                                        () => new JsTester_NoElement(),

                                                        testersFactory.createDomElementTester(
                                                            () => new JsTester_NoElement()
                                                        ),
                                                    );
                                                }

                                                const getCell = () =>
                                                    getRow().querySelectorAll(cellSelector)[index];

                                                return createTesters(
                                                    getCell,
                                                    testersFactory.createDomElementTester(getCell)
                                                );
                                            }
                                        })
                                    });
                                }
                            };
                        }
                    };
                };

                tester.paging = () => ({
                    page: page => {
                        const liTester = testersFactory.createDomElementTester(
                            utils.descendantOfBody().matchesSelector('.pagination-item').textEquals(page).find()
                        );

                        const aTester = testersFactory.createDomElementTester(
                            utils.descendantOfBody().matchesSelector('.pagination-item a').textEquals(page).find()
                        );

                        liTester.click = () => aTester.click();

                        liTester.expectToBeChecked = () => liTester.expectToHaveClass('pagination-item-active');

                        liTester.expectNotToBeChecked = () =>
                            liTester.expectNotToHaveClass('pagination-item-active');

                        return liTester;
                    }
                });

                return createTesters(() => document.querySelector('.softphone-settings-form'), tester);
            },

            menuitem(text) {
                const menuitem = utils.descendantOfBody().
                    matchesSelector('.ant-menu-item, .ant-dropdown-menu-item').
                    textEquals(text).
                    find();

                const tester = testersFactory.createAnchorTester(menuitem.querySelector('a') || menuitem),
                    click = tester.click.bind(tester);

                tester.click = () => (click(), Promise.runAll(false, true));
                return tester;
            },

            root: testersFactory.createDomElementTester(() => document.querySelector('#root')),
            page: (() => {
                const getPage = () => document.querySelector('.page');
                return createTesters(getPage, testersFactory.createDomElementTester(getPage));
            })(),

            forceUpdate() {
                app.forceUpdate();
            },

            path,

            userLoginRequest() {
                return {
                    receiveResponse() {
                        ajax.recentRequest().
                            expectPathToContain('/dataapi/').
                            expectToHaveMethod('POST').
                            expectBodyToContain({
                                method: 'login.user',
                                params: {
                                    login: 's.karamanova',
                                    password: '2i3g8h89sdG32r'    
                                }
                            }).
                            respondSuccessfullyWith({
                                result: {
                                    data: {
                                        jwt: '2j4gds8911fdpu20310v1ldfaqwr0QPOeW1313nvpqew',
                                        refresh: 'd33fe9b5808d4ca592bb70a2f33271cc'
                                    }
                                }
                            });

                        Promise.runAll();
                    }
                };
            },

            userRequest() {
                const permissions = {};

                const addPermission = (name, value) =>
                    permissions[name] ? permissions[name].push(value) : permissions[name] = [value];

                const addResponseModifiers = me => {
                    me.allowReadSoftphoneSettings = () => {
                        addPermission('softphone_settings', 'r');
                        return me;
                    };

                    me.allowReadManagementAppsLoginToApp = () => {
                        addPermission('apps_management_apps_login_to_app', 'r');
                        return me;
                    };

                    me.allowReadStatisticsRevisionHistory = () => {
                        addPermission('statistics_revision_history', 'r');
                        return me;
                    };

                    me.allowWriteApps = () => {
                        addPermission('apps_management_apps', 'w');
                        return me;
                    };

                    me.allowReadApps = () => {
                        addPermission('apps_management_apps', 'r');
                        return me;
                    };

                    me.allowReadCrmIntegration = () => {
                        addPermission('apps_management_crm_integration', 'r');
                        return me;
                    };

                    me.allowReadUsers = () => {
                        addPermission('app_users', 'r');
                        return me;
                    };

                    me.allowReadEventResending = () => {
                        addPermission('apps_management_resend_crm_events', 'r');
                        return me;
                    };

                    me.allowWriteEventResending = () => {
                        addPermission('apps_management_resend_crm_events', 'w');
                        return me;
                    };

                    me.allowReadFeatureFlags = () => {
                        addPermission('feature_flags', 'r');
                        return me;
                    };

                    me.allowWriteFeatureFlags = () => {
                        addPermission('feature_flags', 'w');
                        return me;
                    };

                    return me;
                };

                return addResponseModifiers({
                    expectToBeSent() {
                        const request = ajax.recentRequest().
                            expectPathToContain('/dataapi/').
                            expectToHaveMethod('POST').
                            expectBodyToContain({
                                method: 'get.user'
                            });

                        return addResponseModifiers({
                            receiveResponse() {
                                request.respondSuccessfullyWith({
                                    result: {
                                        data: {permissions}
                                    }
                                });

                                Promise.runAll();
                            }
                        });
                    },

                    receiveResponse() {
                        this.expectToBeSent().receiveResponse();
                    }
                });
            },

            usersRequest() {
                return {
                    receiveResponse() {
                        ajax.recentRequest().
                            expectPathToContain('/dataapi/').
                            expectToHaveMethod('POST').
                            expectBodyToContain({
                                method: 'get.apps_users',
                                params: {
                                    app_id: '4735',
                                    limit: '50',
                                    offset: '0',
                                    sort: [{
                                        field: 'app_id',
                                        order: 'desc'
                                    }]
                                }
                            }).
                            respondSuccessfullyWith({
                                result: {
                                    data: [{
                                        is_softphone_login_enabled: false,
                                        app_name: 'ООО "Трупоглазые жабы"',
                                        total_items_from_nodes: 2984,
                                        app_user_login: 'admin@corpseeydtoads.com',
                                        employee_full_name: 'Барова Елена',
                                        app_user_name: 'Администратор',
                                        phone: '79162938296',
                                        app_id: 4735,
                                        customer_id: 94285
                                    }],
                                    metadata: {
                                        total_items: 1
                                    }
                                }
                            });

                        Promise.runAll();
                    }
                };
            },

            amocrmEventsRequest() {
                const params = {
                    id: '28394',
                    app_id: '4735',
                    partner: 'amocrm',
                    numa: '79162937183',
                    date_from: '2020-07-26 00:00:00',
                    date_till: '2020-08-17 13:21:55',
                    is_show_not_sent: 'false',
                    is_show_in_process: 'true',
                    is_show_undelivered: 'true',
                    is_show_delivered: 'true',
                    limit: '25',
                    offset: '0',
                    sort_order: 'desc',
                    sort: undefined
                };

                return {
                    setBitrix() {
                        params.partner = 'bitrix';
                        return this;
                    },

                    setNoSort() {
                        params.sort_order = undefined;
                        return this;
                    },

                    setAscDirection() {
                        params.sort_order = 'asc';
                        return this;
                    },
                    
                    setAnotherDateRange() {
                        params.date_from = '2020-08-10 00:00:00';
                        params.date_till = '2020-08-24 13:21:55';
                        return this;
                    },

                    setDefaultDateRange() {
                        params.date_from = '2020-08-24 00:00:00';
                        params.date_till = '2020-08-24 13:21:55';
                        return this;
                    },

                    changeRangeTime() {
                        params.date_from = '2020-07-26 06:07:08';
                        params.date_till = '2020-08-17 07:09:10';
                        return this;
                    },

                    setDefaultParams() {
                        delete(params.app_id);
                        delete(params.numa);
                        delete(params.id);
                        this.setDefaultDateRange();

                        return this;
                    },

                    setCustomCRM() {
                        params.partner = 'customCRM';
                        return this;
                    },

                    setAllExceptUndelivered() {
                        params.is_show_not_sent = 'true';
                        params.is_show_in_process = 'true';
                        params.is_show_delivered = 'true';
                        params.is_show_undelivered = 'false';
                        return this;
                    },

                    setAllExceptDelivered() {
                        params.is_show_not_sent = 'true';
                        params.is_show_in_process = 'true';
                        params.is_show_delivered = 'false';
                        params.is_show_undelivered = 'true';
                        return this;
                    },

                    setDeliveredOnly() {
                        params.is_show_not_sent = 'false';
                        params.is_show_in_process = 'false';
                        params.is_show_delivered = 'true';
                        params.is_show_undelivered = 'false';
                        return this;
                    },

                    setUndeliveredOnly() {
                        params.is_show_not_sent = 'false';
                        params.is_show_in_process = 'false';
                        params.is_show_delivered = 'false';
                        params.is_show_undelivered = 'true';
                        return this;
                    },

                    setInProcessOnly() {
                        params.is_show_not_sent = 'false';
                        params.is_show_in_process = 'true';
                        params.is_show_delivered = 'false';
                        params.is_show_undelivered = 'false';
                        return this;
                    },

                    setNotSentOnly() {
                        params.is_show_not_sent = 'true';
                        params.is_show_in_process = 'false';
                        params.is_show_delivered = 'false';
                        params.is_show_undelivered = 'false';
                        return this;
                    },

                    setOffset(value) {
                        params.offset = value + '';
                        return this;
                    },

                    expectToBeSent() {
                        const request = ajax.recentRequest().
                            expectPathToContain('/dataapi/').
                            expectToHaveMethod('POST').
                            expectBodyToContain({
                                method: 'get.amocrm_events',
                                params
                            });

                        let data = [{
                            id: 39285,
                            numa: '79157389283',
                            event_time: '2021-02-03 09:58:13',
                            send_time: '2021-04-10 16:59:15',
                            error_message:
                                'Exception in thread "main" java.lang.NullPointerException: Oops! ' + "\n" +
                                'at com.ericgoebelbecker.stacktraces.StackTrace.d StackTrace.java:29  ' + "\n" +
                                'at com.ericgoebelbecker.stacktraces.StackTrace.c StackTrace.java:24  ' + "\n" +
                                'at com.ericgoebelbecker.stacktraces.StackTrace.b StackTrace.java:20  ' + "\n" +
                                'at com.ericgoebelbecker.stacktraces.StackTrace.a StackTrace.java:16  ' + "\n" +
                                'at com.ericgoebelbecker.stacktraces.StackTrace.main StackTrace.java:9 ',
                            state: 'failed',
                            is_common_conditions_passed: false,
                            is_setting_conditions_passed: true,
                            is_filter_conditions_passed: true
                        }, {
                            id: 39286,
                            numa: '79157389284',
                            event_time: '2021-02-04 09:59:13',
                            send_time: '2021-04-10 17:59:15',
                            error_message: null,
                            state: 'success',
                            is_common_conditions_passed: true,
                            is_setting_conditions_passed: false,
                            is_filter_conditions_passed: true
                        }, {
                            id: 39287,
                            numa: '79157389285',
                            event_time: '2021-02-05 09:56:13',
                            send_time: '2021-06-10 18:59:15',
                            error_message: null,
                            state: 'success',
                            is_common_conditions_passed: true,
                            is_setting_conditions_passed: true,
                            is_filter_conditions_passed: false
                        }, {
                            id: 39288,
                            numa: '79157389286',
                            event_time: '2021-02-05 09:56:13',
                            send_time: '2021-06-10 18:59:15',
                            error_message: null,
                            state: 'success',
                            is_common_conditions_passed: true,
                            is_setting_conditions_passed: true,
                            is_filter_conditions_passed: true
                        }, {
                            id: 39289,
                            numa: '79157389287',
                            event_time: '2021-02-05 09:56:13',
                            send_time: '2021-06-10 18:59:15',
                            error_message: null,
                            state: 'success',
                            is_common_conditions_passed: true,
                            is_setting_conditions_passed: true,
                            is_filter_conditions_passed: true
                        }];

                        return {
                            setNoErrorMessage() {
                                data[0].error_message = '';
                                return this;
                            },

                            setShortErrorMessage() {
                                data[0].error_message = 'Сервер не отвечает';
                                return this;
                            },

                            setNoSendTime() {
                                data[1].send_time = null;
                                return this;
                            },

                            setSending() {
                                data[1].state = 'in_process';
                                return this;
                            },

                            addEvents(start, end) {
                                var i;

                                data = [];

                                for (i = start; i <= end; i ++) {
                                    data.push({
                                        id: 39290 + i,
                                        numa: ((79157389288 + i) + '').substr(0, 11),
                                        event_time: '2021-02-05 09:56:13',
                                        send_time: '2021-06-10 18:59:15',
                                        error_message: null,
                                        state: 'success',
                                        is_common_conditions_passed: true,
                                        is_setting_conditions_passed: true,
                                        is_filter_conditions_passed: true
                                    });
                                }

                                return this;
                            },

                            setNoEvents() {
                                data = [];
                                return this;
                            },

                            receiveResponse() {
                                request.respondSuccessfullyWith({
                                    result: {data}
                                });

                                Promise.runAll();
                            }
                        };
                    },
                    
                    receiveResponse() {
                        this.expectToBeSent().receiveResponse();
                    }
                };
            },

            amocrmEventsResendingRequest() {
                const params = {
                    app_id: '4735',
                    partner: 'amocrm'
                };

                return {
                    setBitrix() {
                        params.partner = 'bitrix';
                        return this;
                    },

                    setTwoEvents() {
                        params.ids = [39285, 39287, undefined];
                        return this;
                    },

                    expectToBeSent() {
                        const request = ajax.recentRequest().
                            expectPathToContain('/dataapi/').
                            expectToHaveMethod('POST').
                            expectBodyToContain({
                                method: 'send.amocrm_events',
                                params
                            });

                        return {
                            receiveResponse() {
                                request.respondSuccessfullyWith({
                                    result: true
                                });

                                Promise.runAll();
                            }
                        };
                    },

                    receiveResponse() {
                        this.expectToBeSent().receiveResponse();
                    }
                };
            },

            directionRequest() {
                var keys = [],
                    result = {};

                return {
                    addTpTpvAll() {
                        keys.push('billing:_tree:tp_tpv_all');
                        result['billing:_tree:tp_tpv_all'] = [];

                        return this;
                    },

                    addAppStates() {
                        keys.push('billing:public:app_state');

                        result['billing:public:app_state'] = [{
                            id: 'active',
                            name: 'Активен'
                        }, {
                            id: 'waiting',
                            name: 'Ждет'
                        }, {
                            id: 'manual_lock',
                            name: 'Заблокирован вручную'
                        }, {
                            id: 'limit_lock',
                            name: 'Заблокирован по лимиту'
                        }, {
                            id: 'debt_lock',
                            name: 'Заблокирован по долгу'
                        }];

                        return this;
                    },

                    receiveResponse() {
                        ajax.recentRequest().
                            expectPathToContain('/dataapi/').
                            expectToHaveMethod('POST').
                            expectBodyToContain({
                                method: 'get.directories',
                                params: {
                                    keys: keys 
                                }
                            }).respondSuccessfullyWith({
                                result: result
                            });

                        Promise.runAll();
                    }
                };
            },

            integrationsRequest() {
                return {
                    receiveResponse() {
                        ajax.recentRequest().
                            expectPathToContain('/dataapi/').
                            expectToHaveMethod('POST').
                            expectBodyToContain({
                                method: 'get.integrations',
                                params: {
                                    limit: 50,
                                    offset: 0,
                                    sort: null,
                                    filter: [undefined]
                                }
                            }).respondSuccessfullyWith({
                                result: {
                                    data: [{
                                        app_id: 295684,
                                        app_name: 'Жана Митева',
                                        app_state: 'active',
                                        app_state_name: 'Активен',
                                        crm_type_name: 'amoCRM',
                                        login: 'miteva@gmail.com',
                                        url: 'miteva.amocrm.ru',
                                        ext_account_id: 420267,
                                        agent_id: 6812934,
                                        agent_name: 'Некий агент'
                                    }, {
                                        app_id: 295685,
                                        app_name: 'Богдана Аначкова',
                                        app_state: 'active',
                                        app_state_name: 'Активен',
                                        crm_type_name: 'customCRM',
                                        login: 'anachkova@gmail.com',
                                        url: 'anachkova.amocrm.ru',
                                        ext_account_id: 420268,
                                        agent_id: 6812935,
                                        agent_name: 'Другой агент'
                                    }],
                                    metadata: {
                                        total_items: 2
                                    }
                                }
                            });

                        Promise.runAll();
                    }
                };
            },

            appsRequest() {
                let startIndex = 0,
                    itemsCount = 50;

                let setSecondPage = () => {
                    startIndex = 50;
                    itemsCount = 25;
                    params.offset = 50;
                };

                let processing = [];

                const params = {
                    limit: 50,
                    offset: 0,
                    sort: [{
                        field: 'app_id',
                        order: 'desc'
                    }],
                    states: 'waiting,active,manual_lock,limit_lock,debt_lock',
                    search: undefined
                };

                return {
                    changeLimit() {
                        params.limit = 5;
                        itemsCount = 5;

                        setSecondPage = () => {
                            startIndex = 5;
                            itemsCount = 5;
                            params.offset = 5;
                        };

                        return this;
                    },

                    setSearch() {
                        params.search = 'Шунин';
                        return this;
                    },

                    setAscDirection() {
                        params.sort[0].order = 'asc';
                        return this;
                    },

                    setNoSort() {
                        params.sort = [];
                        return this;
                    },

                    setSecondPage() {
                        processing.push(() => setSecondPage())
                        return this;
                    },

                    singleApp() {
                        itemsCount = 1;
                        return this;
                    },

                    receiveResponse() {
                        const data = [];
                        processing.forEach(process => process());

                        for (i = startIndex; i < (itemsCount + startIndex); i ++) {
                            data.push({
                                app_id: 386524 + i,
                                customer_id: 8592892 + i,
                                app_name: 'ООО "Трупоглазые жабы" # ' + (i + 1),
                                state_name: 'Активен',
                                tariff_plan: 'Премиум',
                                numbers: '84951234567,84951234568',
                                account_number: 795821 + i,
                                balance: 52948,
                                domain: 'somedomain.com',
                                login: 'toads',
                                is_agent: false,
                                node_id: 829672 + i,
                                agent_id: null,
                                watching_app_ids: null 
                            });
                        }

                        ajax.recentRequest().
                            expectPathToContain('/dataapi/').
                            expectToHaveMethod('POST').
                            expectBodyToContain({
                                method: 'get.apps',
                                params
                            }).respondSuccessfullyWith({
                                result: {
                                    data,
                                    metadata: {
                                        total_items: 75
                                    }
                                }
                            });

                        Promise.runAll();
                    }
                };
            },

            callCenterSystemSettingsDeleteRequest() {
                const params = {
                    app_id: 386524,
                    widget_type: 'call_center',
                };

                return {
                    receiveResponse() {
                        ajax.recentRequest().
                            expectPathToContain('/dataapi/').
                            expectToHaveMethod('POST').
                            expectBodyToContain({
                                method: 'delete.call_center_system_settings',
                                params
                            }).respondSuccessfullyWith({
                                result: {
                                    data: true,
                                } 
                            });

                        Promise.runAll(false, true);
                    }
                };
            },

            appUpdatingRequest() {
                const params = {
                    app_id: 386524,
                    customer_id: 94286,
                    softphone_settings: [{
                        widget_type: 'call_center',
                        ice_servers: 'stun:stun.uiscom.ru:19304',
                        sip_host: 'voip.uiscom.ru',
                        webrtc_urls: 'wss://rtu-1-webrtc.uiscom.ru,wss://rtu-2-webrtc.uiscom.ru',
                        rtu_sip_host: undefined,
                        registrar_sip_host: undefined,
                        rtu_webrtc_urls: undefined,
                        registrar_webrtc_urls: undefined,
                        is_use_tls: false,
                        engine: 'rtu_webrtc',
                    }]
                };

                return {
                    tls() {
                        params.softphone_settings[0].is_use_tls = true;
                        return this;
                    },

                    engineUndefined() {
                        delete(params.softphone_settings[0].engine);
                        return this;
                    },

                    isUseTlsUndefined() {
                        delete(params.softphone_settings[0].is_use_tls);
                        return this;
                    },

                    rtuSipHostSpecified() {
                        params.softphone_settings[0].rtu_sip_host = 'rtu.uiscom.ru';
                        return this;
                    },

                    registrarSipHostSpecified() {
                        params.softphone_settings[0].registrar_sip_host = 'registrar.uiscom.ru';
                        return this;
                    },

                    janus() {
                        params.softphone_settings[0].engine = 'janus_webrtc';
                        return this;
                    },

                    webrtcUrlsAreArray() {
                        params.softphone_settings[0].webrtc_urls = [
                            'wss://rtu-1-webrtc.uiscom.ru',
                            'wss://rtu-2-webrtc.uiscom.ru',
                        ];

                        return this;
                    },

                    rtuWebrtcUrlsSpecified() {
                        params.softphone_settings[0].rtu_webrtc_urls = 
                            'wss://rtu-3-webrtc.uiscom.ru,' +
                            'wss://rtu-4-webrtc.uiscom.ru';

                        return this;
                    },

                    registrarWebrtcUrlsSpecified() {
                        params.softphone_settings[0].registrar_webrtc_urls = 
                            'wss://registrar-1-webrtc.uiscom.ru,' +
                            'wss://registrar-2-webrtc.uiscom.ru';

                        return this;
                    },

                    nullWebrtcUrls() {
                        params.softphone_settings[0].webrtc_urls = null;
                        return this;
                    },

                    noWebrtcUrls() {
                        params.softphone_settings[0].webrtc_urls = '';
                        return this;
                    },

                    noRtuWebrtcUrls() {
                        params.softphone_settings[0].rtu_webrtc_urls = '';
                        return this;
                    },

                    noRegistrarWebrtcUrls() {
                        params.softphone_settings[0].registrar_webrtc_urls = '';
                        return this;
                    },

                    receiveResponse() {
                        ajax.recentRequest().
                            expectPathToContain('/dataapi/').
                            expectToHaveMethod('POST').
                            expectBodyToContain({
                                method: 'update.app',
                                params
                            }).respondSuccessfullyWith({
                                result: {
                                    data: true
                                } 
                            });

                        Promise.runAll();
                    }
                };
            },

            appRequest() {
                const result = {
                    data: {
                        app: {
                            tp_id: 27104,
                            tariff_plan: 'Некий тариф',
                            is_softphone_login_enabled: false,
                            app_name: 'ООО "Трупоглазые жабы"',
                            total_items_from_nodes: 2984,
                            app_user_login: 'admin@corpseeydtoads.com',
                            employee_full_name: 'Барова Елена',
                            app_user_name: 'Администратор',
                            phone: '79162938296',
                            app_id: 386524,
                            customer_id: 94286,
                            transit_dst_app_id: 660927,
                            is_use_numb_as_numa: false,
                            hide_return_commission: false,
                            agent_id: 6812934,
                            is_agent: false,
                            is_share_tp: false,
                            is_short_phone_shared_in_holding: false,
                            rtu: 'wss://rtu-webrtc.uiscom.ru',
                            is_uae_restriction_enabled: false
                        },
                        site: [{
                            domain: 'https://somesite.com',
                            banner_branding_text: 'Некий бренд',
                            banner_branding_url: 'https://somesite.com/brand'
                        }],
                        dt_black_ip: [{
                            id: 9174882,
                            ip: '125.62.57.176'
                        }],
                        tp: [{
                            id: 16369,
                            name: 'Другой' 
                        }],
                        softphone_settings: [{
                            widget_type: 'call_center',
                            ice_servers: 'stun:stun.uiscom.ru:19303',
                            sip_host: 'voip.uiscom.ru',
                            is_use_tls: false,
                            webrtc_urls:
                                'wss://rtu-1-webrtc.uiscom.ru,' +
                                'wss://rtu-2-webrtc.uiscom.ru',
                            engine: 'rtu_webrtc',
                        }]
                    }
                };

                const addResponseModifiers = me => {
                    me.engineUndefined = () => (delete(result.data.softphone_settings[0].engine), me);
                    me.isUseTlsUndefined = () => (delete(result.data.softphone_settings[0].is_use_tls), me);

                    me.rtuSipHostSpecified = () =>
                        (result.data.softphone_settings[0].rtu_sip_host = 'rtu.uiscom.ru', me);

                    me.registrarSipHostSpecified = () =>
                        (result.data.softphone_settings[0].registrar_sip_host = 'registrar.uiscom.ru', me);

                    me.rtuWebrtcUrlsAreString = () => (result.data.softphone_settings[0].rtu_webrtc_urls =
                        'wss://rtu-3-webrtc.uiscom.ru,' +
                        'wss://rtu-4-webrtc.uiscom.ru',
                    me);

                    me.registrarWebrtcUrlsAreString = () => (result.data.softphone_settings[0].registrar_webrtc_urls =
                        'wss://registrar-1-webrtc.uiscom.ru,' +
                        'wss://registrar-2-webrtc.uiscom.ru',
                    me);

                    me.webrtcUrlsAreArray = () => (result.data.softphone_settings[0].webrtc_urls = [
                        'wss://rtu-1-webrtc.uiscom.ru',
                        'wss://rtu-2-webrtc.uiscom.ru'
                    ], me);

                    me.rtuWebrtcUrlsAreArray = () => (result.data.softphone_settings[0].rtu_webrtc_urls = [
                        'wss://rtu-3-webrtc.uiscom.ru',
                        'wss://rtu-4-webrtc.uiscom.ru'
                    ], me);

                    me.registrarWebrtcUrlsAreArray = () => (result.data.softphone_settings[0].registrar_webrtc_urls = [
                        'wss://registrar-1-webrtc.uiscom.ru',
                        'wss://registrar-2-webrtc.uiscom.ru'
                    ], me);

                    me.noWebrtcUrls = () => (result.data.softphone_settings[0].webrtc_urls = null, me);
                    me.noRtuWebrtcUrls = () => (result.data.softphone_settings[0].rtu_webrtc_urls = null, me);

                    me.noRegistrarWebrtcUrls = () =>
                        (result.data.softphone_settings[0].registrar_webrtc_urls = null, me);

                    return me;
                };

                return addResponseModifiers({
                    expectToBeSent() {
                        const request = ajax.recentRequest().
                            expectPathToContain('/dataapi/').
                            expectToHaveMethod('POST').
                            expectBodyToContain({
                                method: 'get.app',
                                params: {
                                    app_id: '386524'
                                }
                            });

                        return addResponseModifiers({
                            receiveResponse() {
                                request.respondSuccessfullyWith({result});
                                Promise.runAll(false, true);
                            }
                        });
                    },

                    receiveResponse() {
                        this.expectToBeSent().receiveResponse();
                    }
                });
            },

            appUsersRequest() {
                return {
                    receiveResponse() {
                        ajax.recentRequest().
                            expectPathToContain('/dataapi/').
                            expectToHaveMethod('POST').
                            expectBodyToContain({
                                method: 'get.app_users',
                                params: {
                                    app_id: 386524
                                }
                            }).respondSuccessfullyWith({
                                result: {
                                    data: [{
                                        is_softphone_login_enabled: false,
                                        app_name: 'ООО "Трупоглазые жабы"',
                                        total_items_from_nodes: 2984,
                                        app_user_login: 'admin@corpseeydtoads.com',
                                        employee_full_name: 'Барова Елена',
                                        app_user_name: 'Администратор',
                                        phone: ((79162938296 + i) + '').substr(0, 11),
                                        app_id: 4735,
                                        customer_id: 94286 + i
                                    }],
                                    metadata: {
                                        total_items: 1
                                    }
                                }
                            });

                        Promise.runAll();
                    }
                };
            },

            featureFlagsRequest() {
                let startIndex = 0,
                    itemsCount = 1,
                    total_items = 1;

                const params = {
                    limit: 10,
                    offset: 0,
                    search_string: '',
                    sort_by: 'expire_date',
                    sort_asc: false,
                    is_global: undefined,
                    namespaces: undefined
                };

                const data = [{
                    id: 829592,
                    name: 'Чаты в WhatsApp',
                    mnemonic: 'whatsapp_chats',
                    namespaces: '{comagic_web,db,amocrm}',
                    app_ids: [4735, 29572],
                    is_global: false,
                    expire_date: '2020-07-26',
                    is_enabled: true
                }];

                const addResponseModifiers = me => {
                    me.addMore = () => {
                        total_items = 25;
                        itemsCount = 10;

                        return me;
                    };

                    me.onlyOneAppId = () => {
                        data[0].app_ids = [4735];
                        return me;
                    };

                    me.noExpireDate = () => {
                        data[0].expire_date = null;
                        return me;
                    };

                    me.disabled = () => {
                        data[0].is_enabled = false;
                        return me;
                    };

                    me.noAppIds = () => {
                        data[0].app_ids = null;
                        return me;
                    };

                    return me;
                };

                return addResponseModifiers({
                    secondPage() {
                        params.offset = 10;
                        startIndex = 10;
                        return this;
                    },

                    ascending() {
                        params.sort_asc = true;
                        return this;
                    },

                    sortedByName() {
                        params.sort_by = 'name';
                        return this;
                    },

                    searchString() {
                        params.search_string = 'whatsapp';
                        return this;
                    },

                    namespaces() {
                        params.namespaces = ['comagic_web', 'amocrm'];
                        return this;
                    },

                    global() {
                        params.is_global = true;
                        return this;
                    },

                    notGlobal() {
                        params.is_global = false;
                        return this;
                    },

                    expectToBeSent() {
                        const request = ajax.recentRequest().
                            expectPathToContain('/dataapi/').
                            expectToHaveMethod('POST').
                            expectBodyToContain({
                                method: 'get.feature_flags',
                                params
                            });

                        return addResponseModifiers({
                            global() {
                                data[0].app_ids = null;
                                data[0].is_global = true;
                                return this;
                            },

                            receiveResponse() {
                                const items = [];

                                for (i = startIndex; i < (startIndex + itemsCount); i ++) {
                                    items.push(data[i] ? data[i] : {
                                        id: 829593 + i,
                                        name: `Фичефлаг # ${i + 1}`,
                                        mnemonic: `ff_${i + 1}`,
                                        namespaces: '{comagic_web,db,amocrm}',
                                        app_ids: [4735, 29572],
                                        is_global: false,
                                        expire_date: '2020-07-26',
                                        is_enabled: true
                                    });
                                }

                                request.respondSuccessfullyWith({
                                    result: {
                                        data: items,
                                        metadata: {
                                            total_items
                                        }
                                    }
                                });

                                Promise.runAll();
                            }
                        });
                    },
                    
                    receiveResponse() {
                        this.expectToBeSent().receiveResponse();
                    }
                });
            },

            featureFlagRequest() {
                const params = {
                    id: 829592
                };

                const result = {
                    name: 'Чаты в WhatsApp',
                    mnemonic: 'whatsapp_chats',
                    namespaces: '{comagic_web,db,amocrm}',
                    is_global: false,
                    expire_date: '2020-07-26',
                    is_enabled: true,
                    app_ids: [386525, 386527, 386530, 386531]
                };

                const addResponseModifiers = me => {
                    me.noExpireDate = () => {
                        result.expire_date = null;
                        return me;
                    };

                    me.disabled = () => {
                        result.is_enabled = false;
                        return me;
                    };

                    me.noAppIds = () => {
                        result.app_ids = null;
                        return me;
                    };

                    me.global = () => {
                        result.app_ids = null;
                        result.is_global = true;
                        return me;
                    };

                    return me;
                };

                return addResponseModifiers({
                    expectToBeSent() {
                        const request = ajax.recentRequest().
                            expectPathToContain('/dataapi/').
                            expectToHaveMethod('POST').
                            expectBodyToContain({
                                method: 'get.feature_flag',
                                params
                            });

                        return addResponseModifiers({
                            receiveResponse() {
                                request.respondSuccessfullyWith({result});
                                Promise.runAll();
                            }
                        });
                    },
                    
                    receiveResponse() {
                        this.expectToBeSent().receiveResponse();
                    }
                });
            },

            featureFlagCreatingRequest() {
                const params = {
                    id: undefined,
                    name: 'Чаты в WhatsApp',
                    mnemonic: 'whatsapp_chats',
                    namespaces: ['amocrm', 'comagic_web', undefined],
                    is_enabled: false,
                    is_global: false,
                    expire_date: '2020-08-29',
                    app_ids: [386525, 386527, 386530, 386531, undefined]
                };

                let response = {
                    result: true
                };

                const addResponseModifiers = me => {
                    me.failed = () => ((response = {
                        error: {
                            message: "Флаг с данной мнемоникой уже существует в одном из выбранных пространств " +
                                "имён\n",
                            code: -32002
                        }
                    }), me);

                    return me;
                };

                return addResponseModifiers({
                    enabled() {
                        params.is_enabled = true;
                        return this;
                    },

                    global() {
                        params.is_global = true;
                        params.app_ids = null;
                        return this;
                    },

                    expectToBeSent() {
                        const request = ajax.recentRequest().
                            expectPathToContain('/dataapi/').
                            expectToHaveMethod('POST').
                            expectBodyToContain({
                                method: 'create.feature_flag',
                                params
                            });

                        return addResponseModifiers({
                            receiveResponse() {
                                request.respondSuccessfullyWith(response);

                                Promise.runAll();
                            }
                        });
                    },
                    
                    receiveResponse() {
                        this.expectToBeSent().receiveResponse();
                    }
                });
            },

            featureFlagNamespacesRequest() {
                return {
                    receiveResponse() {
                        ajax.recentRequest().
                            expectPathToContain('/dataapi/').
                            expectToHaveMethod('POST').
                            expectBodyToContain({
                                method: 'get.feature_flag_namespaces'
                            }).respondSuccessfullyWith({
                                result: '{comagic_web,db,amocrm}'
                            });

                        Promise.runAll();
                    }
                };
            },

            featureFlagUpdatingRequest() {
                const params = {
                    id: 829592,
                    name: 'Чаты в WhatsApp',
                    mnemonic: 'whatsapp_chats',
                    namespaces: ['amocrm', 'comagic_web', 'db', undefined],
                    expire_date: '2020-07-26',
                    is_enabled: false,
                    is_global: false,
                    app_ids: [386526, 386527, 386530, 386531, undefined]
                };

                let response = {
                    result: true
                };

                const addResponseModifiers = me => {
                    me.failed = () => ((response = {
                        error: {
                            message: "Флаг с данной мнемоникой уже существует в одном из выбранных пространств " +
                                "имён\n",
                            code: -32002
                        }
                    }), me);

                    return me;
                };

                return addResponseModifiers({
                    changeName() {
                        params.name = 'Чат в WhatsApp';
                        return this;
                    },

                    changeMnemonic() {
                        params.mnemonic = 'whatsapp_chat';
                        return this;
                    },

                    changeNamespaces() {
                        params.namespaces = ['comagic_web', 'db', undefined];
                        return this;
                    },

                    noExpireDate() {
                        params.expire_date = null;
                        return this;
                    },

                    changeExpireDate() {
                        params.expire_date = '2020-08-29';
                        return this
                    },

                    switching() {
                        params.app_ids = [4735, 29572];
                        return this;
                    },

                    enabled() {
                        params.is_enabled = true;
                        return this;
                    },

                    global() {
                        params.is_global = true;
                        params.app_ids = null;
                        return this;
                    },

                    expectToBeSent() {
                        const request = ajax.recentRequest().
                            expectPathToContain('/dataapi/').
                            expectToHaveMethod('POST').
                            expectBodyToContain({
                                method: 'update.feature_flag',
                                params
                            });

                        return addResponseModifiers({
                            receiveResponse() {
                                request.respondSuccessfullyWith(response);

                                Promise.runAll();
                            }
                        });
                    },
                    
                    receiveResponse() {
                        return this.expectToBeSent().receiveResponse();
                    }
                });
            },

            featureFlagDeletingRequest() {
                return {
                    receiveResponse() {
                        ajax.recentRequest().
                            expectPathToContain('/dataapi/').
                            expectToHaveMethod('POST').
                            expectBodyToContain({
                                method: 'delete.feature_flag',
                                params: {
                                    id: 829592
                                }
                            }).respondSuccessfullyWith({
                                result: true
                            });

                        Promise.runAll();
                    }
                };
            }
        });
    };
});
