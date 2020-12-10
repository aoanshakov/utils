define(() => {
    return function (options) {
        const testersFactory = options.testersFactory,
            utils = options.utils,
            ajax = options.ajax,
            userMedia = options.userMedia,
            spendTime = options.spendTime,
            {app, path, stores} = options.runApplication(options);

        stores.eventsStore.initParams();

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
                const getCalendar = index => {
                    return {
                        cell(content) {
                            return testersFactory.createDomElementTester(
                                utils.
                                    descendantOf(document.querySelectorAll('.ant-calendar-body')[index]).
                                    matchesSelector('.ant-calendar-date').
                                    textEquals(content).
                                    find()
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
                        return getCalendar(0);
                    },

                    right() {
                        return getCalendar(1);
                    }
                };
            },

            spinner: testersFactory.createDomElementTester(() => document.querySelector('.ant-spin-dot')),

            table() {
                return {
                    cell() {
                        return {
                            withContent(content) {
                                return {
                                    row() {
                                        return {
                                            checkbox: () => new Checkbox(
                                                utils.descendantOfBody().
                                                    matchesSelector('.cell-value').
                                                    textEquals(content).
                                                    find().
                                                    closest('.ant-table-row').
                                                    querySelector('.ant-checkbox-input')
                                            )
                                        };
                                    }
                                };
                            }
                        };
                    }
                };
            },

            menuitem(text) {
                return testersFactory.createAnchorTester(utils.descendantOfBody().matchesSelector('.ant-menu-item a').
                    textEquals(text).find());
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

                return {
                    allowReadUsers() {
                        permissions.app_users = ['r'];
                        return this;
                    },

                    allowReadEventResending() {
                        permissions.apps_management_resend_crm_events = ['r'];
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
                    numa: '79162937183',
                    date_from: '2020-08-26 00:00:00',
                    date_till: '2020-09-17 23:59:59',
                    access_token: '2j4gds8911fdpu20310v1ldfaqwr0QPOeW1313nvpqew',
                    is_show_undelivered: 'true',
                    is_show_delivered: 'true',
                    limit: '50',
                    offset: '0',
                    sort: [{
                        field: 'send_time',
                        order: 'desc'
                    }]
                };

                return {
                    setDefaultParams() {
                        delete(params.app_id);
                        delete(params.numa);
                        delete(params.id);
                        params.date_from = '2020-08-23 00:00:00';
                        params.date_till = '2020-08-24 23:59:59';

                        return this;
                    },

                    setDeliveredOnly() {
                        params.is_show_delivered = 'true';
                        params.is_show_undelivered = 'false';
                        return this;
                    },

                    setUndeliveredOnly() {
                        params.is_show_delivered = 'false';
                        params.is_show_undelivered = 'true';
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

                        const data = [{
                            id: 39285,
                            numa: '79157389283',
                            event_time: '2021-02-03 09:58:13',
                            send_time: '2021-04-10 16:59:15',
                            error_message: 'Сервер не отвечает',
                            state: 'failed',
                        }, {
                            id: 39286,
                            numa: '79157389284',
                            event_time: '2021-02-04 09:59:13',
                            send_time: '2021-04-10 17:59:15',
                            error_message: null,
                            state: 'success'
                        }, {
                            id: 39287,
                            numa: '79157389285',
                            event_time: '2021-02-05 09:56:13',
                            send_time: '2021-06-10 18:59:15',
                            error_message: null,
                            state: 'success'
                        }];

                        return {
                            setSending() {
                                data[1].state = 'in_process';
                                return this;
                            },

                            receiveResponse() {
                                request.respondSuccessfullyWith({
                                    result: {
                                        data,
                                        metadata: {
                                            total_items: 2
                                        }
                                    }
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
                return {
                    expectToBeSent() {
                        const request = ajax.recentRequest().
                            expectPathToContain('/dataapi/').
                            expectToHaveMethod('POST').
                            expectBodyToContain({
                                jsonrpc: '2.0',
                                id: 'number',
                                method: 'send.amocrm_events',
                                params: {
                                    access_token: '2j4gds8911fdpu20310v1ldfaqwr0QPOeW1313nvpqew',
                                    ids: [39285, 39287, undefined]
                                }
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
            }
        };
    };
});
