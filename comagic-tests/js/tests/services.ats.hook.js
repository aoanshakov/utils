tests.addTest(function(requestsManager, testersFactory, wait, utils) {
    describe('Открываю раздел "Сервисы/Виртуальная АТС/Уведомления". Открываю форму создания уведомления.', function() {
        var helper;

        beforeEach(function() {
            if (helper) {
                helper.destroy();
            }

            helper = new ServicesAtsHook(requestsManager, testersFactory, utils);

            Comagic.Directory.load();
            helper.batchReloadRequest().receiveResponse();

            helper.actionIndex({
                recordId: 104561
            });

            helper.hookRequest().receiveResponse();
            helper.conditionsRequest().receiveResponse();
            helper.conditionsRequest().setEventVersion().receiveResponse();

            wait();
            wait();
        });

        it('', function() {
        });
    });
});
