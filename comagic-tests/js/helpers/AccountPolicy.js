tests.requireClass('Comagic.account.policy.controller.Page');
tests.requireClass('Comagic.account.policy.store.IPs');
tests.requireClass('Comagic.account.policy.store.PersonalAccountIPs');
tests.requireClass('Comagic.account.policy.store.BlackList');

function AccountPolicy({
    requestsManager,
    testersFactory,
    utils,
    wait,
}) {
    let controller = Comagic.getApplication().getController('Comagic.account.policy.controller.Page');
    document.body.style.overflowY = 'auto';

    this.actionIndex = function (activeTab) {
        controller.init();
        controller.actionIndex(activeTab !== undefined ? { activeTab: activeTab + '' } : {});
    };

    this.window = testersFactory.createDomElementTester('.x-window');
    this.tabBar = testersFactory.createDomElementTester('.x-tab-bar');
    this.pageHeader = testersFactory.createDomElementTester('.cm-pageheader-text');

    this.body = testersFactory.createDomElementTester(function () {
        return document.body;
    });

    this.blackListRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/account/policy/black_list/read/').
                    respondSuccessfullyWith({
                        success: true,
                        data: [],
                    });
            },
        };
    };

    this.personalAccountIpsRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/account/policy/personal_account_ips/read/').
                    respondSuccessfullyWith({
                        success: true,
                        data: [],
                    });
            },
        };
    };

    this.ipsRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/account/policy/ips/read/').
                    respondSuccessfullyWith({
                        success: true,
                        data: [],
                    });
            },
        };
    };

    this.sipLinesRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/account/policy/expections/sip_line/list/').
                    respondSuccessfullyWith({
                        success: true,
                        data: [],
                    });
            },
        };
    };

    this.sipTrunkRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/account/policy/expections/sip_trunk/list/').
                    respondSuccessfullyWith({
                        success: true,
                        data: [],
                    });
                
                wait();
            },
        };
    };

    this.policyRequest = function () {
        let respond = request => request.respondSuccessfullyWith({
            success: true,
            data: [],
        });

        const addResponseModifier = me => {
            me.failed = function () {
                respond = request => {
                    request.respondUnsuccessfullyWith(
                        '500 Internal Server Error ' +
                        'Server got itself in trouble'
                    );

                    wait();
                };

                return me;
            };

            return me;
        };

        return addResponseModifier({
            expectToBeSent: function () {
                const request = requestsManager.
                    recentRequest().
                    expectToHavePath('/account/policy/read/');

                return addResponseModifier({
                    receiveResponse: function () {
                        respond(request);
                    },
                });
            },
        });
    };

    this.destroy = function() {
        controller.destroy();
    };
}
