define(() => {
    return function (options) {
        const {
            testersFactory,
            utils,
            utils: {pressKey},
            ajax,
            runApplication
        } = options;
        const {path} = runApplication(options);

        const getTesters = (ascendant = document.body) => {
            ascendant = ascendant || new JsTester_NoElement();

            const getFormRowByLabel = label => utils.descendantOf(ascendant).
                matchesSelector('.clct-input__label, .cm-label').
                textEquals(label).
                find().
                closest('.cm-input-row, .ant-row');

            return {
                formRow: () => ({
                    withLabel: label => {
                        const formRow = getFormRowByLabel(label),
                            tester = testersFactory.createDomElementTester(formRow);

                        Object.entries(getTesters(formRow)).forEach(([key, value]) => (tester[key] = value));
                        return tester;
                    }
                }),

                stepTitle: title => testersFactory.createDomElementTester(
                    utils.descendantOf(ascendant).matchesSelector('.comagic-step-title').textEquals(title).find()
                ),

                removeButton: () => testersFactory.createDomElementTester(ascendant.querySelector('.cm-remove-icon')),

                button: text => testersFactory.createDomElementTester(
                    utils.descendantOf(ascendant).matchesSelector('.ant-btn').textEquals(text).find()
                ),

                switchField: () => ({
                    withLabel: label => {
                        const element = getFormRowByLabel(label).querySelector('.ant-switch'),
                            tester = testersFactory.createDomElementTester(element);

                        tester.expectToBeTurnedOn = () => tester.expectToHaveClass('ant-switch-checked');
                        tester.expectToBeTurnedOff = () => tester.expectNotToHaveClass('ant-switch-checked');

                        return tester;
                    }
                }),

                select: () => {
                    const tester = testersFactory.createDomElementTester(
                        () => utils.getVisibleSilently(ascendant.querySelectorAll('.ant-select-selector'))
                    );

                    tester.withLabel = label => testersFactory.createDomElementTester(getFormRowByLabel(label).
                        querySelector('.ant-select-selector')),

                    tester.withValue = value => testersFactory.createDomElementTester(utils.descendantOf(ascendant).
                        matchesSelector('.ant-select-selector').
                        textEquals(value).
                        find());

                    tester.option = text => testersFactory.createDomElementTester(
                        utils.descendantOfBody().
                            matchesSelector('.ant-select-item-option-content').
                            textEquals(text).
                            find()
                    );

                    return tester;
                },

                textarea: () => testersFactory.createTextAreaTester(
                    () => utils.getVisibleSilently(ascendant.querySelectorAll('textarea'))
                ),

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

                    tester.withValue = value => testersFactory.createTextFieldTester(
                        Array.prototype.find.call(
                            ascendant.querySelectorAll('input'),
                            input => input.value == value
                        )
                    );

                    tester.withLabel = text => testersFactory.createTextFieldTester(
                        getFormRowByLabel(text).querySelector('input')
                    );

                    return tester;
                },

                table() {
                    const getRowTester = row => {
                        row = row || new JsTester_NoElement();
                        const tester = testersFactory.createDomElementTester(row);
                        Object.entries(getTesters(row)).forEach(([key, value]) => (tester[key] = value));

                        tester.column = () => ({
                            withHeader: header => {
                                const elements = ascendant.querySelectorAll('.ant-table-thead th');

                                let i,
                                    index = -1,
                                    cell;
                                const {length} = elements;

                                for (i = 0; i < length; i ++) {
                                    if (utils.getTextContent(elements[i]) == header) {
                                        index = i;
                                        break;
                                    }
                                }

                                if (index != -1) {
                                    cell = row.querySelectorAll('.ant-table-row > td')[index];
                                }

                                const tester = testersFactory.createDomElementTester(cell);
                                Object.entries(getTesters(cell)).forEach(([key, value]) => (tester[key] = value));
                                return tester;
                            }
                        });

                        return tester;
                    };

                    return {
                        row() {
                            return {
                                atIndex(index) {
                                    return getRowTester(ascendant.querySelectorAll('.ant-table-row')[index]);
                                }
                            };
                        },
                        cell() {
                            return {
                                withContent(content) {
                                    return {
                                        row() {
                                            return getRowTester(
                                                utils.descendantOf(ascendant).
                                                    matchesSelector('.ant-table-row > td').
                                                    textEquals(content).
                                                    find().
                                                    closest('.ant-table-row')
                                            );
                                        }
                                    };
                                }
                            };
                        }
                    };
                }
            };
        };

        return {
            ...(getTesters()),

            flushUpdates: () => pressKey('j'),
            
            body: testersFactory.createDomElementTester(document.body),

            path,

            loginUserRequest() {
                return {
                    receiveResponse() {
                        ajax.recentRequest().
                            expectToHavePath('/v1.0').
                            expectQueryToContain({
                                method: 'login.user'
                            }).
                            expectToHaveMethod('POST').
                            expectBodyToContain({
                                jsonrpc: '2.0',
                                id: 'number',
                                method: 'login.user',
                                params: {
                                    login: 't.daskalova',
                                    password: '2G892H4gsGjk12ef',
                                }
                            }).respondSuccessfullyWith({
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

            logoutUserRequest() {
                return {
                    receiveResponse() {
                        ajax.recentRequest().
                            expectToHavePath('/v1.0').
                            expectQueryToContain({
                                method: 'logout.user'
                            }).
                            expectToHaveMethod('POST').
                            expectBodyToContain({
                                jsonrpc: '2.0',
                                id: 'number',
                                method: 'logout.user',
                                params: {
                                    access_token: '2j4gds8911fdpu20310v1ldfaqwr0QPOeW1313nvpqew'    
                                }
                            }).respondSuccessfullyWith({
                                result: {
                                    data: true
                                }
                            });

                        Promise.runAll();
                    }
                };
            },

            accountRequest() {
                return {
                    receiveResponse() {
                        ajax.recentRequest().
                            expectToHavePath('/v1.0').
                            expectQueryToContain({
                                method: 'get.account'
                            }).
                            expectToHaveMethod('POST').
                            expectBodyToContain({
                                jsonrpc: '2.0',
                                id: 'number',
                                method: 'get.account',
                                params: {
                                    access_token: '2j4gds8911fdpu20310v1ldfaqwr0QPOeW1313nvpqew'    
                                }
                            }).respondSuccessfullyWith({
                                result: {
                                    data: {
                                        user_id: 842927,
                                        user_name: 'Даскалова Тотка'
                                    }
                                }
                            });

                        Promise.runAll();
                    }
                };
            },

            cpTemplatesRequest() {
                return {
                    receiveResponse() {
                        ajax.recentRequest().
                            expectToHavePath('/v1.0').
                            expectQueryToContain({
                                method: 'get.cp_templates'
                            }).
                            expectToHaveMethod('POST').
                            expectBodyToContain({
                                jsonrpc: '2.0',
                                id: 'number',
                                method: 'get.cp_templates',
                                params: {
                                    project: 'comagic',
                                    access_token: '2j4gds8911fdpu20310v1ldfaqwr0QPOeW1313nvpqew'    
                                }
                            }).respondSuccessfullyWith({
                                result: {
                                    data: [{
                                        id: 28534,
                                        name: 'Шаблон CoMagic'
                                    }]
                                }
                            });

                        Promise.runAll();
                    }
                };
            },

            cpTasksRequest() {
                return {
                    receiveResponse() {
                        ajax.recentRequest().
                            expectToHavePath('/v1.0').
                            expectQueryToContain({
                                method: 'get.cp_tasks'
                            }).
                            expectToHaveMethod('POST').
                            expectBodyToContain({
                                jsonrpc: '2.0',
                                id: 'number',
                                method: 'get.cp_tasks',
                                params: {
                                    project: 'comagic',
                                    access_token: '2j4gds8911fdpu20310v1ldfaqwr0QPOeW1313nvpqew'    
                                }
                            }).respondSuccessfullyWith({
                                result: {
                                    data: [{
                                        id: 192486,
                                        project: 'comagic',
                                        task: 'Номер для организации связи с клиентами',
                                        solution_text: 'Единый канал коммуникаций с компанией'
                                    }]
                                }
                            });

                        Promise.runAll();
                    }
                };
            },

            cpRequirementsRequest() {
                return {
                    receiveResponse() {
                        ajax.recentRequest().
                            expectToHavePath('/v1.0').
                            expectQueryToContain({
                                method: 'get.cp_requirements'
                            }).
                            expectToHaveMethod('POST').
                            expectBodyToContain({
                                jsonrpc: '2.0',
                                id: 'number',
                                method: 'get.cp_requirements',
                                params: {
                                    project: 'comagic',
                                    access_token: '2j4gds8911fdpu20310v1ldfaqwr0QPOeW1313nvpqew'    
                                }
                            }).respondSuccessfullyWith({
                                result: {
                                    data: [{
                                        id: 192486,
                                        project: 'comagic',
                                        requirement: 'Некое требование',
                                        solution_text: 'Некое решение'
                                    }]
                                }
                            });

                        Promise.runAll();
                    }
                };
            },

            tpsRequest() {
                return {
                    receiveResponse() {
                        ajax.recentRequest().
                            expectToHavePath('/v1.0').
                            expectQueryToContain({
                                method: 'get.tps'
                            }).
                            expectToHaveMethod('POST').
                            expectBodyToContain({
                                jsonrpc: '2.0',
                                id: 'number',
                                method: 'get.tps',
                                params: {
                                    project: 'comagic',
                                    is_trial: false,
                                    access_token: '2j4gds8911fdpu20310v1ldfaqwr0QPOeW1313nvpqew'    
                                }
                            }).respondSuccessfullyWith({
                                result: {
                                    data: [{
                                        id: 38492,
                                        name: 'Простой коллтрекинг',
                                        user_charge: 92484
                                    }]
                                }
                            });

                        Promise.runAll();
                    }
                };
            },

            opsRequest() {
                return {
                    receiveResponse() {
                        ajax.recentRequest().
                            expectToHavePath('/v1.0').
                            expectQueryToContain({
                                method: 'get.ops'
                            }).
                            expectToHaveMethod('POST').
                            expectBodyToContain({
                                jsonrpc: '2.0',
                                id: 'number',
                                method: 'get.ops',
                                params: {
                                    project: 'comagic',
                                    tp_id: 38492,
                                    access_token: '2j4gds8911fdpu20310v1ldfaqwr0QPOeW1313nvpqew'    
                                }
                            }).respondSuccessfullyWith({
                                result: {
                                    data: [{
                                        id: 289068,
                                        name: 'Сквозная аналитика Simple',
                                        user_charge: 92858,
                                        activation_cost: 9493,
                                        incompatible_op_ids: []
                                    }]
                                }
                            });

                        Promise.runAll();
                    }
                };
            },

            componentsRequest() {
                const params = {
                    project: 'comagic',
                    tp_id: 38492,
                    op_ids: [undefined],
                    access_token: '2j4gds8911fdpu20310v1ldfaqwr0QPOeW1313nvpqew'    
                };

                return {
                    addOption() {
                        params.op_ids = [289068, undefined];
                        return this;
                    },

                    receiveResponse() {
                        ajax.recentRequest().
                            expectToHavePath('/v1.0').
                            expectQueryToContain({
                                method: 'get.components'
                            }).
                            expectToHaveMethod('POST').
                            expectBodyToContain({
                                jsonrpc: '2.0',
                                id: 'number',
                                method: 'get.components',
                                params
                            }).respondSuccessfullyWith({
                                result: {
                                    data: [{
                                        name: 'Интеграция с amoCRM',
                                        component: 'amocrm',
                                        user_charge: 8492,
                                        activation_cost: 2985,
                                        is_required: false,
                                        is_visible: true,
                                        parent_component: null,
                                    }]
                                }
                            });

                        Promise.runAll();
                    }
                };
            }
        };
    };
});
