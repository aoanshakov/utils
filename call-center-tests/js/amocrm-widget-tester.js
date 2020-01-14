define(function () {
    return function (options) {
        var testersFactory = options.testersFactory,
            utils = options.utils,
            me = options.softphoneTester,
            ajax = options.ajax,
            AmocrmGlobal = options.AmocrmGlobal,
            amocrm = new AmocrmGlobal();

        me.clickPhoneIcon = function () {
            amocrm.clickPhoneIcon();
        };

        me.phoneField = testersFactory.createTextFieldTester(function () {
            return document.querySelector('input[placeholder="Введите номер"]');
        });

        me.callButton = testersFactory.createDomElementTester(function () {
            return document.querySelector('#cmg-call-button');
        });

        me.stopButton = testersFactory.createDomElementTester(function () {
            return document.querySelector('#cmg-stop-button');
        });

        me.nameContainer = testersFactory.createDomElementTester(function () {
            return document.querySelector('#cmg-name');
        });

        function getSipLineButton (index) {
            return document.querySelectorAll('.cmg-sip-line-button')[index];
        }

        me.firstLineButton = testersFactory.createDomElementTester(function () {
            return getSipLineButton(0);
        });

        me.secondLineButton = testersFactory.createDomElementTester(function () {
            return getSipLineButton(1);
        });

        me.requestAuthorization = function () {
            return {
                send: function () {
                    ajax.recentRequest().
                        expectToHavePath('/private/widget/proxy.php').
                        expectToHaveMethod('POST').
                        testBodyParam('target', function (target) {
                            return target && target[0] && target[0].includes('/sup/auth/login');
                        }).
                        testBodyParam('data', function (data) {
                            utils.expectObjectToContain((data && data[0] && JSON.parse(data[0])), {
                                method: 'post',
                                params: {
                                    login: 'tutu',
                                    password: 'QWErty123'
                                }
                            });
                        }).
                        respondSuccessfullyWith({
                            data: {
                                employee_id: 20816,
                                token: 'XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0'
                            }
                        });

                    Promise.runAll();
                }
            };
        };

        me.requestAuthCheck = function () {
            return {
                send: function () {
                    ajax.recentRequest().
                        expectToHavePath('/private/widget/proxy.php').
                        expectToHaveMethod('POST').
                        testBodyParam('data', function (data) {
                            utils.expectObjectToContain((data && data[0] && JSON.parse(data[0])), {
                                method: 'get',
                                token: 'XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0'
                            });
                        }).
                        testBodyParam('target', function (target) {
                            return target && target[0] && target[0].includes('/sup/auth/check');
                        }).
                        respondSuccessfullyWith('');

                    Promise.runAll();
                }
            };
        };

        me.requestSettings = function () {
            return {
                send: function () {
                    ajax.recentRequest().
                        expectToHavePath('/private/widget/proxy.php').
                        expectToHaveMethod('POST').
                        testBodyParam('data', function (data) {
                            utils.expectObjectToContain((data && data[0] && JSON.parse(data[0])), {
                                method: 'get',
                                token: 'XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0'
                            });
                        }).
                        testBodyParam('target', function (target) {
                            return target && target[0] && target[0].includes('/sup/api/v1/settings');
                        }).
                        respondSuccessfullyWith({
                            data: {
                                application_version: '1.3.2',
                                ice_servers: [{
                                    urls: ['stun:stun.uiscom.ru:19302']
                                }],
                                sip_channels_count: 2,
                                sip_host: 'vo19.uiscom.ru',
                                sip_login: '077368',
                                sip_password: 'e2tcXhxbfr',
                                webrtc_url: 'wss://webrtc.uiscom.ru',
                                ws_url: '/ws/L1G1MyQy6uz624BkJWuy1BW1L9INRWNt5_DW8Ik836A'
                            }
                        });

                    Promise.runAll();
                }
            };
        };

        me.requestNameByNumber = function () {
            var phone = '79161234567',
                name = 'Шалева Дора';

            return {
                setAnotherNumber: function () {
                    phone = '79161234569';
                    name = 'Гигова Петранка';
                    return this;
                },
                send: function () {
                    ajax.recentRequest().
                        expectToHavePath('/private/widget/proxy.php').
                        expectToHaveMethod('POST').
                        testBodyParam('data', function (data) {
                            utils.expectObjectToContain((data && data[0] && JSON.parse(data[0])), {
                                method: 'get',
                                token: 'XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0'
                            });
                        }).
                        testBodyParam('target', function (target) {
                            return target && target[0] && target[0].includes('/sup/api/v1/numa/' + phone);
                        }).
                        respondSuccessfullyWith({
                            data: name
                        });

                    Promise.runAll();
                }
            };
        };

        return me;
    };
});
