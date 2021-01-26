define(() => {
    return function (options) {
        const testersFactory = options.testersFactory,
            utils = options.utils,
            ajax = options.ajax,
            spendTime = options.spendTime,
            {path} = options.runApplication(options);

        return {
            body: testersFactory.createDomElementTester(document.body),

            path,

            button: text => testersFactory.createDomElementTester(
                utils.descendantOfBody().matchesSelector('.ant-btn').textEquals(text).find()
            ),

            textfield: () => ({
                withLabel: text => testersFactory.createTextFieldTester(
                        utils.descendantOfBody().
                            matchesSelector('.cm-label').
                            textEquals(text).
                            find().
                            closest('.ant-row').
                            querySelector('input')
                )
            }),

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

            accountRequest() {
                return {
                    receiveResponse() {
                        ajax.recentRequest().
                            expectToHavePath('/v1.0').
                            expectQueryToContain({
                                method: 'getobj.account'
                            }).
                            expectToHaveMethod('POST').
                            expectBodyToContain({
                                jsonrpc: '2.0',
                                id: 'number',
                                method: 'getobj.account',
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
            }
        };
    };
});
