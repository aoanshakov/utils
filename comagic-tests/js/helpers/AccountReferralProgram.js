tests.requireClass('Comagic.account.referralprogram.controller.Page');

function AccountReferralProgram(requestsManager, testersFactory, utils) {
    var controller = Comagic.getApplication().getController('Comagic.account.referralprogram.controller.Page');

    controller.init();
    controller.actionIndex();

    this.requestReferralLink = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/account/referralprogram/app_referral_code/').
                    respondSuccessfullyWith({
                        success: true,
                        data: 'z7jH4w'
                    });
            }
        };
    };

    this.requestInvitedClients = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/account/referralprogram/customer_registration/').
                    respondSuccessfullyWith({
                        success: true,
                        data: [{
                            name: 'ИП Иванов М. Д.',
                            is_paid: false
                        }, {
                            name: 'ИП Иванов М. Д.',
                            is_paid: false
                        }, {
                            name: 'ИП Иванов М. Д.',
                            is_paid: true
                        }]
                    });
            }
        };
    };
    this.destroy = function() {
        controller.destroy();
    };

    this.invitedClientsGrid = testersFactory.createGridTester(Comagic.getApplication().findComponent('grid'));

    this.linkField = testersFactory.createTextFieldTester(Comagic.getApplication().findComponent('textfield'),
        'Поделитесь ссылкой, чтобы пригласить друзей');

    this.copyButton = testersFactory.createButtonTester(Comagic.getApplication().findComponent('button'));
}
