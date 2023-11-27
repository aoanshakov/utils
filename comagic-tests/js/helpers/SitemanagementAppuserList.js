tests.requireClass('Comagic.sitemanagement.appuser.store.Permissions');
tests.requireClass('Comagic.main.controller.West');
tests.requireClass('Comagic.sitemanagement.appuser.store.Record');
tests.requireClass('Comagic.sitemanagement.appuser.controller.UserList');
tests.requireClass('Comagic.sitemanagement.appuser.view.UsersTab');

function SitemanagementAppuserList({
    requestsManager,
    testersFactory,
    utils,
}) {
    var controller = Comagic.getApplication().getController('Comagic.sitemanagement.appuser.controller.UserList');
    
    this.actionIndex = function () {
        controller.init();
        controller.actionIndex.apply(controller, arguments);
    };

    this.destroy = function() {
        controller.destroy();
    };
}
