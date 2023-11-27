tests.requireClass('Comagic.services.ats.staff.store.StatusRecords');
tests.requireClass('Comagic.services.ats.staff.controller.StatusList');
tests.requireClass('Comagic.services.ats.staff.controller.Page');

function ServicesAtsStaff({ requestsManager, testersFactory, utils, wait }) {
    var controller = Comagic.getApplication().getController('Comagic.services.ats.staff.controller.Page');

    this.actionIndex = function (data) {
        controller.init();

        Comagic.getApplication().enableActionRunning();

        controller.actionIndex({
            siteId: 1234
        }, data);

        Comagic.getApplication().disableActionRunning();
    };

    this.destroy = function() {
        controller.destroy();
    };

    this.floatingForm = (function () {
        const form = testersFactory.createFormTester(function () {
            return utils.getFloatingComponent();
        });

        addTesters(form, utils.makeDomElementGetter('.x-window'));

        const getFieldGetter = (text, isLogEnabled = false) => () => utils.descendantOf('.x-window').
            matchesSelector('.x-form-item-label-inner').
            textEquals(text).
            find(isLogEnabled).
            closest('.x-form-item');

        form.directionsField = function () {
            return {
                withFieldLabel: function (text) {
                    const getFieldElement = getFieldGetter(text),
                        tester = testersFactory.createDomElementTester(getFieldElement);

                    const getDirections = function (columnIndex) {
                        const getCellTester = function (iconIndex) {
                            const tester = testersFactory.createCheckboxTester(
                                () => (
                                    (
                                        utils.element(getFieldElement).
                                            querySelectorAll('tr')[1] ||

                                        new JsTester_NoElement()
                                    ).querySelectorAll('td')[columnIndex] ||
                                        new JsTester_NoElement()
                                ).querySelectorAll('.x-form-checkbox')[iconIndex] ||
                                    new JsTester_NoElement()
                            );

                            return tester;
                        };

                        return {
                            incoming: function () {
                                return getCellTester(0);
                            },
                            outgoing: function () {
                                return getCellTester(1);
                            },
                        };
                    };

                    tester.internal = function () {
                        return getDirections(0);
                    };

                    tester.external = function () {
                        return getDirections(1);
                    };

                    return tester;
                }
            };
        };

        form.iconField = function () {
            const addPopupTester = tester => {
                tester.popup = () => {
                    const getPopupElement = () => utils.querySelector(
                        '.services-ats-staff-status-icon-selector-field-bound-list'
                    );

                    const tester = testersFactory.createDomElementTester(getPopupElement);

                    tester.item = icon => {
                        const tester = testersFactory.createDomElementTester(
                            () => utils.element(getPopupElement).querySelector(`.combo-icon.${icon}`)
                        );

                        const click = tester.click.bind(tester);

                        tester.click = () => {
                            click();
                            wait();

                            return tester;
                        };

                        return tester;
                    };

                    return addTesters(tester, getPopupElement);
                };

                return tester;
            };

            const tester = {
                withFieldLabel: function (text) {
                    const getFieldElement = getFieldGetter(text);

                    const tester = testersFactory.createDomElementTester(() => {
                        return getFieldElement().querySelector('.services-ats-staff-status-icon-selector-field-sub');
                    });

                    tester.expectToHaveValue = icon =>
                        testersFactory.createDomElementTester(getFieldElement).expectToHaveClass(icon);

                    return addPopupTester(tester);
                }
            };

            return addPopupTester(tester);
        };

        form.colorField = function () {
            const addPopupTester = tester => {
                tester.popup = () => {
                    const getPopupElement = () => utils.querySelector('.x-color-picker').closest('.x-box-inner'),
                        tester = testersFactory.createDomElementTester(getPopupElement)

                    tester.item = color => testersFactory.createDomElementTester(
                        () => utils.element(getPopupElement).
                            querySelector(`.color-${(color || '').toUpperCase()}`)
                    );

                    return addTesters(tester, getPopupElement);
                };

                return tester;
            };

            const tester = {
                withFieldLabel: function (text) {
                    const getFieldElement = getFieldGetter(text); 

                    const arrowTester = testersFactory.createDomElementTester(
                        () => getFieldElement().querySelector('.x-form-trigger')
                    );

                    const tester = testersFactory.createDomElementTester(getFieldElement);
                    tester.clickArrow = () => (arrowTester.click(), tester);

                    tester.expectToHaveValue = function (expectedValue) {
                        testersFactory.createDomElementTester(
                            () => getFieldElement().querySelector('input')
                        ).expectToHaveStyle('background-color', `#${expectedValue}`);
                    };

                    addPopupTester(tester);
                    return tester;
                }
            };

            return addPopupTester(tester);
        };

        return form;
    })();

    this.statusCreatingRequest = function () {
        return  {
            expectToBeSent: function () {
                const request = requestsManager.recentRequest().
                    expectToHavePath('/services/ats__staff/statuses/create/').
                    expectToHaveMethod('POST').
                    expectBodyToContain({
                        allowed_phone_protocols: [
                            'SIP',
                            'SIP_TRUNK',
                            'FMC',
                            'SIP_URI',
                            undefined,
                        ],
                        color: '#FF8F00',
                        icon: 'bell',
                        in_external_allowed_call_directions: [
                            'in',
                            'out',
                            undefined,
                        ],
                        in_internal_allowed_call_directions: [
                            'in',
                            'out',
                            undefined,
                        ],
                        is_auto_out_calls_ready: false,
                        is_select_allowed: true,
                        is_worktime: false,
                        out_external_allowed_call_directions: [
                            'in',
                            'out',
                            undefined,
                        ],
                        out_internal_allowed_call_directions: [
                            'in',
                            'out',
                            undefined,
                        ],
                        is_use_availability_in_group: false,
                        is_able_to_accept_chat_transfer: false,
                        is_able_to_transfer_chat: true,
                        is_able_to_accept_chat: false,
                        is_able_to_close_chat_offline_message: true,
                        is_able_in_forwarding_scenario: false,
                        is_able_to_send_chat_messages: true,
                        priority: 2,
                        name: 'Колокольчик',
                        description: 'Сотрудник звонит в колокольчик',
                    });

                return {
                    receiveResponse: function () {
                        request.respondSuccessfullyWith({
                            success: true,
                            data: true,
                        });
                    }
                };
            },
            receiveResponse: function () {
                this.expectToBeSent().receiveResponse();
            }
        };
    };

    this.statusesRequest = function () {
        return {
            expectToBeSent: function () {
                return {
                    receiveResponse: function () {
                        requestsManager.recentRequest().
                            expectToHavePath('/services/ats__staff/statuses/read/').
                            expectToHaveMethod('GET').
                            expectQueryToContain({
                                site_id: '-1',
                                page: '1',
                                start: '0',
                                limit: '25',
                                sort: JSON.stringify([{
                                    property:'name',
                                    direction:'ASC',
                                }]),
                            }).
                            respondSuccessfullyWith({
                                success: true,
                                total: 1,
                                data: [{
                                    id: 5829,
                                    is_worktime: true,
                                    name: 'Доступен',
                                    mnemonic: 'available',
                                    is_select_allowed: true,
                                    is_removed: false,
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
                                    is_auto_out_calls_ready: true,
                                    is_use_availability_in_group: true,
                                    is_able_to_accept_chat_transfer: false,
                                    is_able_to_transfer_chat: true,
                                    is_able_to_accept_chat: false,
                                    is_able_to_close_chat_offline_message: true,
                                    is_able_in_forwarding_scenario: false,
                                    is_able_to_send_chat_messages: true,
                                }]
                            });
                    }
                };
            },
            receiveResponse: function () {
                this.expectToBeSent().receiveResponse();
            }
        };
    };

    this.staffStatusRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/directory/comagic:staff:status/').
                    respondSuccessfullyWith({
                        success: true,
                        data: [{
                            color: '#48b882',
                            icon: 'tick',
                            id: 5829,
                            is_removed: false,
                            is_select_allowed: true,
                            mnemonic: 'available',
                            name: 'Доступен',
                        }]
                    });
            }
        };
    };

    this.batchReloadRequest = function () {
        function addMethods (me) {
            return me;
        }

        return addMethods({
            expectToBeSent: function () {
                return addMethods({
                    receiveResponse: function () {
                        requestsManager.recentRequest().
                            expectToHavePath('/directory/batch_reload/').
                            expectToHaveMethod('POST').
                            respondSuccessfullyWith({
                                success: true,
                                data: {
                                    'comagic:public:true_false': [{
                                        id: false,
                                        name: 'Нет',
                                    }, {
                                        id: true,
                                        name: 'Да',
                                    }],
                                    'comagic:staff:status_preset': [{
                                        is_worktime: true,
                                        name: 'Доступен',
                                        mnemonic: 'available',
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
                                        is_auto_out_calls_ready: true,
                                        is_use_availability_in_group: true,
                                    }],
                                    'comagic:staff:status': [{
                                        color: '#48b882',
                                        icon: 'tick',
                                        id: 5829,
                                        is_removed: false,
                                        is_select_allowed: true,
                                        mnemonic: 'available',
                                        name: 'Доступен',
                                    }],
                                } 
                            });
                    }
                });
            },
            receiveResponse: function () {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    this.grid = testersFactory.createGridTester(function () {
        const grid = Comagic.getApplication().findComponent(
            'gridcolumn[text="Учитывать доступность в группах сотрудников"]'
        ).up('grid');

        return grid;
    });

    function addTesters (me, getAscendant) {
        me.menu = (function () {
            const getMenuElement = () =>
                utils.getVisibleSilently((getAscendant() || new JsTester_NoElement()).querySelectorAll('.x-menu')) || 
                new JsTester_NoElement();

            const tester = testersFactory.createDomElementTester(getMenuElement);

            tester.item = function (text) {
                const tester = testersFactory.createDomElementTester(function () {
                    return utils.descendantOfBody().
                        matchesSelector('.x-menu-item-text').
                        textEquals(text).find();
                });

                const click = tester.click.bind(tester),
                    putMouseOver = tester.putMouseOver.bind(tester);

                tester.click = () => {
                    click();
                    wait();
                };

                tester.putMouseOver = () => {
                    putMouseOver();
                    wait(200);
                };

                return tester;
            };

            return tester;
        })();

        me.button = function (text) {
            return testersFactory.createDomElementTester(function () {
                return utils.descendantOf(getAscendant()).matchesSelector('.x-btn-inner').textEquals(text).find();
            });
        };

        return me;
    }

    addTesters(this, function () {
        return document.body;
    });
}
