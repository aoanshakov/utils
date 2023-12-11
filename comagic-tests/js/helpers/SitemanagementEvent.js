tests.requireClass('Comagic.sitemanagement.event.store.Segment');
tests.requireClass('Comagic.sitemanagement.event.store.SiteEventScrolls');
tests.requireClass('Comagic.sitemanagement.event.store.LinkToClickType');
tests.requireClass('Comagic.sitemanagement.event.store.SiteEventTypes');
tests.requireClass('Comagic.sitemanagement.event.store.Record');
tests.requireClass('Comagic.sitemanagement.event.controller.EditPage');

function SitemanagementEvent({
    requestsManager,
    testersFactory,
    utils,
    wait,
}) {
    let controller = Comagic.getApplication().getController('Comagic.sitemanagement.event.controller.EditPage');
    document.body.style.overflowY = 'auto';

    controller.init();

    controller.actionIndex({}, {
        recordId: undefined,
        eventType: 'action_on_site',
    });

    this.checkbox = {
        withLabel: function (text) {
            return testersFactory.createDomElementTester(function () {
                return utils.descendantOfBody().
                    textEquals(text).
                    matchesSelector('.x-form-cb-label').
                    find().
                    closest('.x-form-type-checkbox').
                    querySelector('input');
            });
        }
    };

    this.button = function (text) {
        return testersFactory.createDomElementTester(function () {
            return utils.descendantOfBody().
                textEquals(text).
                matchesSelector('.x-btn-inner').
                find();
        });
    };

    this.siteEventTypesRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/sitemanagement/event/site_event_types/read/').
                    respondSuccessfullyWith({
                        success: true,
                        data: [],
                    });
            },
        };
    };

    this.segmentRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/sitemanagement/event/segment/read/').
                    respondSuccessfullyWith({
                        success: true,
                        data: [],
                    });

                wait();
            },
        };
    };

    this.eventRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/sitemanagement/event/read/event/-1/').
                    respondSuccessfullyWith({
                        data: {
                            event: []
                        },
                        metadata: [
                            {
                                belongs_to: [],
                                fields: [
                                    'get_to_segment_id',
                                    'event_type',
                                    'component_event',
                                    'site_id',
                                    'app_id',
                                    'is_implicit',
                                    'ga_value',
                                    {
                                        'name': 'id',
                                        'primary_key': true
                                    },
                                    'category',
                                    'label',
                                    'ga_action',
                                    'ga_label',
                                    'event_action',
                                    'ga_category',
                                    'set_visitor_property_id',
                                    'set_visitor_property_value',
                                    'goal_name',
                                    'restrict_segment_id',
                                    'name',
                                    'url',
                                    'value',
                                    'is_goal',
                                    'action',
                                    'ym_goal_id'
                                ],
                                has_many: [],
                                name: 'event'
                            }
                        ],
                        msg: null,
                        success: true
                    });
            },
        };
    };

    this.destroy = function() {
        controller.destroy();
    };
}
