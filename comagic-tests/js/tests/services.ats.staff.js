tests.addTest(function(requestsManager, testersFactory, wait, utils) {
    describe('', function() {
        var helper;

        beforeEach(function() {
            if (helper) {
                helper.destroy();
            }

            helper = new ServicesAtsStaff(requestsManager, testersFactory, utils);

            Comagic.Directory.load();
            helper.batchReloadRequest().send();

            helper.actionIndex({
                recordId: 104561
            });

            helper.requestEmployees().send();

            wait();
        });

        it('', function() {
        });
    });
});
