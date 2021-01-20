define(() => {
    return function (options) {
        const testersFactory = options.testersFactory,
            utils = options.utils,
            ajax = options.ajax,
            userMedia = options.userMedia,
            spendTime = options.spendTime,
            {app, path, stores} = options.runApplication(options);

        stores.eventsStore.initParams();
        stores.appStore.directory = {};

        function Checkbox (element) {
            var checkbox = testersFactory.createDomElementTester(element);

            checkbox.expectToBeChecked = () => checkbox.closest('.ant-checkbox').
                expectToHaveClass('ant-checkbox-checked');

            checkbox.expectNotToBeChecked = () => checkbox.closest('.ant-checkbox').
                expectNotToHaveClass('ant-checkbox-checked');

            return checkbox;
        }

        return {
            checkbox() {
                return {
                    withLabel(label) {
                        return new Checkbox(
                            utils.descendantOfBody().
                                matchesSelector('.comagic-checkbox').
                                textEquals(label).
                                find().
                                querySelector('.ant-checkbox-input')
                        );
                    }
                };
            },

            calendar() {
                const getCalendar = side => {
                    const getElement = () =>
                        document.querySelector(`.ant-calendar-range-${side}`) || (new JsTester_NoElement());

                    return {
                        cell(content) {
                            return testersFactory.createDomElementTester(
                                utils.descendantOf(getElement()).
                                    matchesSelector('.ant-calendar-date').
                                    textEquals(content).
                                    find()
                            );
                        },

                        prevMonth() {
                            return testersFactory.createDomElementTester(
                                getElement().querySelector('.ant-calendar-prev-month-btn')
                            );
                        }
                    };
                };

                return {
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
                };
            },

            spinner: testersFactory.createDomElementTester(() => document.querySelector('.ant-spin-dot')),
            dropdown: testersFactory.createDomElementTester(() => document.querySelector('.ant-dropdown')),
            tooltip: testersFactory.createDomElementTester(() =>
                utils.getVisibleSilently(document.querySelectorAll('.ant-tooltip-inner'))),
            notification: testersFactory.createDomElementTester(() => document.querySelector('.ant-notification')),

            table() {
                return {
                    cell() {
                        return {
                            withContent(content) {
                                return {
                                    row() {
                                        const getRow = () => utils.descendantOfBody().
                                            matchesSelector('.ant-table-row > td').
                                            textEquals(content).
                                            find().
                                            closest('.ant-table-row');

                                        return {
                                            actionsMenu: () => testersFactory.createDomElementTester(
                                                getRow().querySelector('.ant-dropdown-trigger')
                                            ),

                                            querySelector: selector => testersFactory.createDomElementTester(
                                                getRow().querySelector(selector)
                                            ),

                                            anchor: text => testersFactory.createAnchorTester(
                                                utils.descendantOf(getRow()).
                                                    matchesSelector('a').
                                                    textEquals(text).
                                                    find()
                                            ),

                                            checkbox: () => new Checkbox(
                                                getRow().querySelector('.ant-checkbox-input')
                                            )
                                        };
                                    }
                                };
                            }
                        };
                    },
                    paging: () => ({
                        page: page => {
                            const liTester = testersFactory.createDomElementTester(
                                utils.descendantOfBody().matchesSelector('.pagination-item').textEquals(page).find()
                            );

                            const aTester = testersFactory.createDomElementTester(
                                utils.descendantOfBody().matchesSelector('.pagination-item a').textEquals(page).find()
                            );

                            liTester.click = () => aTester.click();

                            return liTester;
                        }
                    })
                };
            },

            menuitem(text) {
                var menuitem = utils.descendantOfBody().
                    matchesSelector('.ant-menu-item, .ant-dropdown-menu-item').
                    textEquals(text).
                    find();

                return testersFactory.createAnchorTester(menuitem.querySelector('a') || menuitem);
            },

            root: testersFactory.createDomElementTester(() => document.querySelector('#root')),

            button(text) {
                return testersFactory.createDomElementTester(utils.descendantOfBody().matchesSelector('.ant-btn').
                    textEquals(text).find());
            },

            textfield() {
                return {
                    withPlaceholder: placeholder => {
                        return testersFactory.createTextFieldTester(document.querySelector(
                            'input[placeholder="' + placeholder + '"]'
                        ));
                    }
                };
            },

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
                                jsonrpc: '2.0',
                                id: 'number',
                                method: 'login.user',
                                params: {
                                    login: 's.karamanova',
                                    password: '2i3g8h89sdG32r'    
                                }
                            }).
                            respondSuccessfullyWith({
                                result: {
                                    data: {
                                        access_token: '2j4gds8911fdpu20310v1ldfaqwr0QPOeW1313nvpqew'
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

                return {
                    allowWriteApps() {
                        addPermission('apps_management_apps', 'w');
                        return this;
                    },

                    allowReadApps() {
                        addPermission('apps_management_apps', 'r');
                        return this;
                    },

                    allowReadCrmIntegration() {
                        addPermission('apps_management_crm_integration', 'r');
                        return this;
                    },

                    allowReadUsers() {
                        addPermission('app_users', 'r');
                        return this;
                    },

                    allowReadEventResending() {
                        addPermission('apps_management_resend_crm_events', 'r');
                        return this;
                    },

                    allowWriteEventResending() {
                        addPermission('apps_management_resend_crm_events', 'w');
                        return this;
                    },

                    receiveResponse() {
                        ajax.recentRequest().
                            expectPathToContain('/dataapi/').
                            expectToHaveMethod('POST').
                            expectBodyToContain({
                                jsonrpc: '2.0',
                                id: 'number',
                                method: 'get.user',
                                params: {
                                    access_token: '2j4gds8911fdpu20310v1ldfaqwr0QPOeW1313nvpqew'
                                }
                            }).
                            respondSuccessfullyWith({
                                result: {
                                    data: {permissions}
                                }
                            });

                        Promise.runAll();
                    }
                };
            },

            usersRequest() {
                return {
                    receiveResponse() {
                        ajax.recentRequest().
                            expectPathToContain('/dataapi/').
                            expectToHaveMethod('POST').
                            expectBodyToContain({
                                jsonrpc: '2.0',
                                id: 'number',
                                method: 'get.apps_users',
                                params: {
                                    access_token: '2j4gds8911fdpu20310v1ldfaqwr0QPOeW1313nvpqew',
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
                    date_till: '2020-08-17 23:59:59',
                    access_token: '2j4gds8911fdpu20310v1ldfaqwr0QPOeW1313nvpqew',
                    is_show_not_sent: 'true',
                    is_show_in_process: 'true',
                    is_show_undelivered: 'true',
                    is_show_delivered: 'true',
                    limit: '25',
                    offset: '0',
                    sort: [{
                        field: 'event_time',
                        order: 'desc'
                    }]
                };

                return {
                    setAnotherDateRange() {
                        params.date_from = '2020-08-10 00:00:00';
                        params.date_till = '2020-08-24 23:59:59';
                        return this;
                    },

                    setDefaultDateRange() {
                        params.date_from = '2020-08-24 00:00:00';
                        params.date_till = '2020-08-24 23:59:59';
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
                                jsonrpc: '2.0',
                                id: 'number',
                                method: 'get.amocrm_events',
                                params
                            });

                        let data = [{
                            id: 39285,
                            numa: '79157389283',
                            event_time: '2021-02-03 09:58:13',
                            send_time: '2021-04-10 16:59:15',
                            error_message: 'Сервер не отвечает',
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
                    access_token: '2j4gds8911fdpu20310v1ldfaqwr0QPOeW1313nvpqew'
                };

                return {
                    setTwoEvents() {
                        params.ids = [39285, 39287, undefined];
                        return this;
                    },
                    expectToBeSent() {
                        const request = ajax.recentRequest().
                            expectPathToContain('/dataapi/').
                            expectToHaveMethod('POST').
                            expectBodyToContain({
                                jsonrpc: '2.0',
                                id: 'number',
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
                                jsonrpc: '2.0',
                                id: 'number',
                                method: 'get.directories',
                                params: {
                                    access_token: '2j4gds8911fdpu20310v1ldfaqwr0QPOeW1313nvpqew',
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
                                jsonrpc: '2.0',
                                id: 'number',
                                method: 'get.integrations',
                                params: {
                                    access_token: '2j4gds8911fdpu20310v1ldfaqwr0QPOeW1313nvpqew',
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

                const params = {
                    access_token: '2j4gds8911fdpu20310v1ldfaqwr0QPOeW1313nvpqew',
                    limit: '50',
                    offset: '0',
                    sort: [{
                        field: 'app_id',
                        order: 'desc'
                    }],
                    states: 'waiting,active,manual_lock,limit_lock,debt_lock'
                };

                return {
                    setSecondPage() {
                        startIndex = 50;
                        itemsCount = 25;
                        params.offset = '50';

                        return this;
                    },

                    receiveResponse() {
                        const data = [];

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
                                jsonrpc: '2.0',
                                id: 'number',
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

            appUsersRequest() {
                return {
                    receiveResponse() {
                        ajax.recentRequest().
                            expectPathToContain('/dataapi/').
                            expectToHaveMethod('POST').
                            expectBodyToContain({
                                jsonrpc: '2.0',
                                id: 'number',
                                method: 'get.app_users',
                                params: {
                                    access_token: '2j4gds8911fdpu20310v1ldfaqwr0QPOeW1313nvpqew',
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
            }
        };
    };
});
