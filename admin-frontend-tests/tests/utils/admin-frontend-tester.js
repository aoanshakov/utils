define(() => {
    return function (options) {
        const testersFactory = options.testersFactory,
            utils = options.utils,
            ajax = options.ajax,
            userMedia = options.userMedia,
            spendTime = options.spendTime,
            runApplication = options.runApplication;

        runApplication();

        return {
            menuitem(text) {
                return testersFactory.createAnchorTester(utils.descendantOfBody().matchesSelector('.ant-menu-item a').
                    textEquals(text).find());
            },

            root: testersFactory.createDomElementTester(document.querySelector('#root')),

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
                        permissions.event_resending = ['r'];
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
            }
        };
    };
});
