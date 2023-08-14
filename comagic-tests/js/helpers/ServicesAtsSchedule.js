tests.requireClass('Comagic.services.ats.schedule.store.Records');
tests.requireClass('Comagic.services.ats.schedule.controller.Page');

function ServicesAtsSchedule(args) {
    var requestsManager = args.requestsManager,
        testersFactory = args.testersFactory,
        utils = args.utils,
        wait = args.wait,
        controller = Comagic.getApplication().getController('Comagic.services.ats.schedule.controller.Page');

    this.grid = testersFactory.createGridTester(function () {
        return Comagic.getApplication().findComponent('grid');
    });

    function addTesters (me, getAscendant) {
        me.button = function (text) {
            return testersFactory.createDomElementTester(function () {
                return utils.descendantOf(getAscendant()).matchesSelector('.x-btn-inner').textEquals(text).find();
            });
        };

        return me;
    }

    addTesters(this, function () {
        return document.body;
    });

    {
        const getWindow = utils.makeDomElementGetter('.x-window');
        this.win = addTesters(testersFactory.createDomElementTester(getWindow), getWindow);
    }

    this.scheduleRemovingRequest = function () {
        var response = {
            success: true,
            data: true,
        };

        function addMethods (me) {
            return me;
        }

        return addMethods({
            expectToBeSent: function () {
                var request = requestsManager.recentRequest().
                    expectToHavePath('/services/ats__schedule/records/delete/').
                    expectBodyToContain({
                        id: 4586729,
                    });

                return addMethods({
                    receiveResponse: function () {
                        request.respondSuccessfullyWith(response);
                    }
                });
            },
            receiveResponse: function () {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    this.scheduleRemovingAvailabilityRequest = function () {
        var response = {
            success: true,
            data: {
                is_removal_available: true,
                schedule_usage: [{
                    id: 2183,
                    name: 'Некий график',
                }, {
                    id: 2319,
                    name: 'Другой график',
                }]
            },
        };

        function addMethods (me) {
            me.unavailable = function () {
                response.data.is_removal_available = false;
                return me;
            };

            return me;
        }

        return addMethods({
            expectToBeSent: function () {
                var request = requestsManager.recentRequest().
                    expectToHavePath('/services/ats__schedule/try_to_remove_schedule/4586729/');

                return addMethods({
                    receiveResponse: function () {
                        request.respondSuccessfullyWith(response);
                        wait();
                    }
                });
            },
            receiveResponse: function () {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    this.schedulesRequest = function () {
        var response = {
            success: true,
            data: [{
                id: 4586729,
                name: 'Некий график активности',
                status: 'график не активен',
                entities_using_schedule: '',
            }],
        };

        function addMethods (me) {
            return me;
        }

        return addMethods({
            expectToBeSent: function () {
                var request = requestsManager.recentRequest().
                    expectToHavePath('/services/ats__schedule/records/read/');

                return addMethods({
                    receiveResponse: function () {
                        request.respondSuccessfullyWith(response);
                    }
                });
            },
            receiveResponse: function () {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    this.actionIndex = function (data) {
        controller.init();

        controller.actionIndex({
            siteId: 1234
        }, data || {});
    };

    this.batchReloadRequest = function () {
        var response = {
            success: true,
            data: {
            } 
        };

        function addResponseModifiers (me) {
            return me;
        }

        return addResponseModifiers({
            expectToBeSent: function () {
                return addResponseModifiers({
                    receiveResponse: function () {
                        requestsManager.recentRequest().
                            expectToHavePath('/directory/batch_reload/').
                            expectToHaveMethod('POST').
                            respondSuccessfullyWith(response);
                    }
                });
            },
            receiveResponse: function () {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    this.destroy = function() {
        controller.destroy();
    };
}
