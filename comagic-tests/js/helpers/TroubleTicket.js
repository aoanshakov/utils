tests.requireClass('Comagic.main.controller.West');
tests.requireClass('Comagic.troubletickets.controller.Page');

tests.runBeforeTestsExecution(function () {
    Ext.define('Comagic.tests.main.controller.West', {
        override: 'Comagic.main.controller.West',
        collapseMenuTrees: Ext.emptyFn
    });
});

function TroubleTicket(requestsManager, testersFactory, utils) {
    var controller = Comagic.getApplication().getController('Comagic.troubletickets.controller.Page');

    controller.init();
    controller.actionIndex({
        siteId: 1234
    });

    this.destroy = function() {
        controller.destroy();
    };
    this.requestTroubletickets = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/troubletickets/tickets/').
                    expectToHaveMethod('GET').
                    respondSuccessfullyWith({
                        success: true,
                        data: []
                    });
            }
        };
    };
    this.requestUserContacts = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/troubletickets/tickets/user/get/contacts/').
                    expectToHaveMethod('GET').
                    respondSuccessfullyWith({
                        success: true,
                        data: {
                            contacts: [{
                                id: 2,
                                full_name: 'Иванов Иван Иванович'
                            }],
                            phones: [{
                                id: 3,
                                phone: '74951234567'
                            }],
                            emails: [{
                                id: 4,
                                email: 'ivanov@gmail.com'
                            }]
                        }
                    });
            }
        };
    };
    this.requestCreateTicket = function () {
        var bodyParams = {
            description: ['Прошу, помогите!'],
            is_new_full_name: ['false'],
            full_name: ['2'],
            is_new_phone: ['false'],
            phone: ['3'],
            is_new_email: ['false'],
            email: ['4']
        };

        return {
            setManuallyInputedData: function () {
                bodyParams.is_new_full_name = ['true'];
                bodyParams.full_name = ['Петров Петр Петрович'];

                bodyParams.is_new_phone = ['true'];
                bodyParams.phone = ['74952345678'];

                bodyParams.is_new_email = ['true'];
                bodyParams.email = ['petrov@gmail.com'];
                return this;
            },
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/troubletickets/tickets/ticket/create/').
                    expectToHaveMethod('POST').
                    expectBodyToContain(bodyParams).
                    respondSuccessfullyWith({
                        success: true,
                        data: true
                    });
            }
        };
    };
    this.createNewRequestButton = testersFactory.createComponentTester(
        Comagic.getApplication().findComponent('button[text="Создать новую заявку"]')
    );
    this.requestCreationWindow = testersFactory.createFormTester(function () {
        return Ext.ComponentQuery.query('window[title="Создание заявки"]')[0];
    });
    this.requestCreationButton = testersFactory.createButtonTester(function () {
        return Ext.ComponentQuery.query('window[title="Создание заявки"]')[0].down('button[text="Создать"]');
    });
}
