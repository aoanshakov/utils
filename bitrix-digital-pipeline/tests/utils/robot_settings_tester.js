define(() => {
    return function ({
        testersFactory,
        utils,
        ajax
    }) {
        const currentValues = {};
        let callback = () => null;

        let call = () => {
            throw new Error('SDK Битрикс24 еще не инициализирован.');
        };

        window.BX24 = {
            init: value => {
                callback = value;
                call = (methodName, ...args) => {
                    if (methodName != 'setPropertyValue') {
                        return;
                    }

                    Object.entries(args[0]).forEach(([key, value]) => {
                        currentValues[key] = value;
                    });
                };
            },
            placement: {
                call: (...args) => call(...args) 
            }
        };

        return {
            initializeB24: () => callback(),
            expectPropertiesToHaveValues: expectedValues => utils.expectObjectToContain(currentValues, expectedValues),

            form: testersFactory.createDomElementTester('form'),
            textarea: testersFactory.createTextAreaTester('textarea'),

            select: label => {
                const getSelectsWithoutLabel = () => Array.prototype.filter.call(
                    document.querySelectorAll('select'),
                    select => !select.closest('div').querySelector('label')
                );

                const getSelect = () => label ?

                    utils.descendantOfBody().
                        matchesSelector('label').
                        textEquals(label + ':').
                        find().
                        closest('div').
                        querySelector('select') :

                    utils.getVisibleSilently(getSelectsWithoutLabel());

                const tester = testersFactory.createDomElementTester(getSelect);

                !label && (tester.expectToBeHidden = () => {
                    if (getSelectsWithoutLabel().some(select => utils.isVisible(select))) {
                        throw new Error('Выпадающие списки без лейбла должны быть скрыты.');
                    }
                });

                const selectDescription = label ? ' "' + label + '"' : '';

                tester.option = text => {
                    const getElements = () => {
                        const select = getSelect();
                        testersFactory.createDomElementTester(select).expectToBeVisible();

                        const option = Array.prototype.find.call(select.querySelectorAll('option'), option => {
                            return option.innerHTML == text;
                        });

                        if (!option) {
                            throw new Error(
                                'Опция с текстом "' + text + '" должна существовать в выпдающем списке' +
                                selectDescription + '.'
                            );
                        }

                        return {select, option};
                    };

                    return {
                        expectToBeSelected: () => {
                            const {select, option} = getElements();

                            if (select.value != option.value) {
                                throw new Error(
                                    'В выпадающем списке' + selectDescription + ' должна быть выбрана опция "' + text +
                                    '".'
                                );
                            }
                        },

                        click: () => {
                            const {select, option} = getElements();
                            select.value = option.value;

                            select.dispatchEvent(new Event('change', {
                                bubbles: true
                            }));
                        }
                    };
                };

                return tester;
            },

            scenariosRequest: () => ({
                expectToBeSent() {
                    const request = ajax.recentRequest().expectPathToContain('/api/v1/scenario');

                    return {
                        receiveResponse: function () {
                            request.respondSuccessfullyWith({
                                data: [{
                                    id: 95172,
                                    name: 'Первый сценарий'
                                }, {
                                    id: 95173,
                                    name: 'Второй сценарий'
                                }, {
                                    id: 95174,
                                    name: 'Третий сценарий'
                                }]
                            });
                        }
                    };
                },

                receiveResponse() {
                    this.expectToBeSent().receiveResponse();
                }
            }),

            virtualNumbersRequest: () => ({
                expectToBeSent() {
                    const request = ajax.recentRequest().
                        expectToHaveMethod('GET').
                        expectPathToContain('/api/v1/number_capacity').
                        expectQueryToContain({
                            with_scenario: '1'
                        });

                    let start = 0,
                        deleteCount = 0;

                    return {
                        removeSecondNumber() {
                            start = 1;
                            deleteCount = 1;
                            return this;
                        },

                        receiveError() {
                            request.respondUnsuccessfullyWith('500 Internal Server Error Server got itself in trouble');
                        },

                        receiveResponse: function () {
                            const data = [{
                                id: 29385,
                                numb: '79151234567'
                            }, {
                                id: 29386,
                                numb: '79151234568'
                            }, {
                                id: 29387,
                                numb: '79151234569'
                            }, {
                                id: 29388,
                                numb: '79151234570'
                            }];

                            data.splice(start, deleteCount);
                            
                            request.respondSuccessfullyWith({
                                data: data
                            });
                        }
                    };
                },

                receiveResponse() {
                    this.expectToBeSent().receiveResponse();
                }
            }),

            usersRequest: () => ({
                receiveResponse: () => ajax.recentRequest().
                    expectPathToContain('/api/v1/users').
                    expectToHaveHeaders({
                        Authorization: 'Bearer Fl298gw0e2Foiweoa4Ua-0923gLwe84we3LErwiI230'
                    }).
                    respondSuccessfullyWith({
                        data: [{
                            first_name: 'Стефка',
                            id: 20816,
                            is_in_call: false,
                            last_name: 'Ганева',
                            position_id: null,
                            short_phone: '9119',
                            status_id: 3,
                            is_sip_online: true
                        }, {
                            first_name: 'Дора',
                            id: 82756,
                            is_in_call: true,
                            last_name: 'Шалева',
                            position_id: null,
                            short_phone: '8258',
                            status_id: 6,
                            is_sip_online: true
                        }, {
                            first_name: 'Николина',
                            id: 583783,
                            is_in_call: false,
                            last_name: 'Господинова',
                            position_id: null,
                            short_phone: '295',
                            status_id: 1,
                            is_sip_online: true
                        }, {
                            first_name: 'Йовка',
                            id: 79582,
                            is_in_call: false,
                            last_name: 'Божилова',
                            position_id: null,
                            short_phone: '296',
                            status_id: 2,
                            is_sip_online: true
                        }]
                    })
            }),

            authorizationRequest: () => ({
                receiveResponse: () => ajax.recentRequest().
                    expectPathToContain('/auth/login').
                    expectToHaveMethod('POST').
                    expectBodyToContain({
                        auth_id: '6cd38e5f004e48ba004b7cc000000001000003acee2b073187698d3ea46c4082dc9991',
                        refresh_id: '5c52b65f004e48ba004b7cc00000000100000336bb35bf8b0c68a249c9e312210cdd77',
                        member_id: '91a9ef2628b90ae0c5e8e2a951c5fa11',
                        domain: 'sber.vlads.dev',
                        status: 'L',
                        auth_expires: 3600
                    }).
                    testBodyParam('browser_id', function (browser_id) {
                        me.expectBrowserIdNotToBeEmpty(browser_id);
                    }).
                    respondSuccessfullyWith({
                        data: {
                            employee_id: 20816,
                            token: 'XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0'
                        }
                    })
            }),

            authCheckRequest: () => ({
                receiveResponse: function () {
                    ajax.recentRequest().
                        expectPathToContain('/auth/check').
                        expectToHaveMethod('GET').
                        expectToHaveHeaders({
                            Authorization: 'Bearer XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0'
                        }).
                        respondSuccessfullyWith({
                            data: ''
                        });
                }
            }),

            application: () => {
                let currentValues = {};

                const me = {
                    employeeChosen: () => ((currentValues = {
                        auto_call_on: 'employee',
                        employee_id: '583783',
                        virtual_number_numb: '79151234569',
                        virtual_number: '',
                        scenario_id: '',
                        employee_message: 'Привет!'
                    }), me),

                    scenarioChosen: () => ((currentValues = {
                        auto_call_on: 'scenario',
                        employee_id: '',
                        virtual_number_numb: '79151234569',
                        virtual_number: '',
                        scenario_id: '95173',
                        employee_message: 'Привет!'
                    }), me),

                    callToPersonalManager: () => ((currentValues = {
                        auto_call_on: 'personal_manager',
                        employee_id: '',
                        virtual_number_numb: '79151234569',
                        virtual_number: '',
                        scenario_id: '',
                        employee_message: 'Привет!'
                    }), me),

                    callToVirtualNumber: () => ((currentValues = {
                        auto_call_on: 'virtual_number',
                        employee_id: '',
                        virtual_number_numb: '',
                        virtual_number: '79151234568',
                        scenario_id: '',
                        employee_message: 'Привет!'
                    }), me),

                    run: () => runApplication(currentValues)
                };

                return me;
            }
        };
    };
});
