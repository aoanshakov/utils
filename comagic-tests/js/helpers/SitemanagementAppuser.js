tests.requireClass('Comagic.sitemanagement.appuser.store.Permissions');
tests.requireClass('Comagic.main.controller.West');
tests.requireClass('Comagic.sitemanagement.appuser.store.Record');
tests.requireClass('Comagic.sitemanagement.appuser.controller.EditPage');

function SitemanagementAppuser({
    requestsManager,
    testersFactory,
    utils,
}) {
    var controller = Comagic.getApplication().getController('Comagic.sitemanagement.appuser.controller.EditPage');
    
    SitemanagementAppuser.makeOverrides = function () {
        Ext.define('Comagic.test.sitemanagement.appuser.view.EditPage', {
            override: 'Comagic.sitemanagement.appuser.view.EditPage',
            autoScroll: true
        });

        SitemanagementAppuser.makeOverrides = Ext.emptyFn;
    };

    SitemanagementAppuser.makeOverrides();

    this.actionIndex = function () {
        controller.init();
        controller.actionIndex.apply(controller, arguments);
    };

    this.button = function (text) {
        function getButtonElement () {
            return utils.descendantOf(document.body).textEquals(text).matchesSelector('.x-btn-inner').find();
        }

        var tester = testersFactory.createDomElementTester(getButtonElement);

        var wrapperTester = testersFactory.createDomElementTester(function () {
            return getButtonElement().closest('.x-btn');
        });

        tester.expectToBeDisabled = function () {
            wrapperTester.expectToHaveClass('x-item-disabled');
        };

        tester.expectToBeEnabled = function () {
            wrapperTester.expectNotToHaveClass('x-item-disabled');
        };

        return tester;
    };

    this.requestSetSipLineChannelsCount = function () {
        var respond = function (request) {
            return request.respondSuccessfullyWith({
                success: true
            });
        };

        return {
            setFatalError: function () {
                respond = function (request) {
                    request.respondForbidden();
                };

                return this;
            },
            send: function () {
                respond(requestsManager.recentRequest().
                    expectToHavePath('/services/ats__staff/set_sip_line_channels_count/').
                    expectBodyToContain({
                        phone_id: 48284,
                        channels_count: 2
                    }));
            }
        };
    };

    this.requestChannelsCount = function () {
        var response = {
                success: true,
                data: {
                    id: 48284,
                    phone: '+7 (495) 123-45-67',
                    channels_count: 2
                }
            };

        var respond = function (request) {
            return request.respondSuccessfullyWith(response);
        };

        return {
            setMoreThanTwo: function () {
                response.data.channels_count = 12;
                return this;
            },
            setNoSipLineFound: function () {
                response.data = null;
                return this;
            },
            setError: function () {
                response = {
                    success: false,
                    error: 'Error occured'
                };

                return this;
            },
            setNotJSON: function () {
                respond = function (request) {
                    request.respondSuccessfullyButNotJSON();
                };

                return this;
            },
            setFatalError: function () {
                respond = function (request) {
                    request.respondForbidden();
                };

                return this;
            },
            send: function () {
                respond(requestsManager.recentRequest().expectToHaveMethod('GET').
                    expectToHavePath('/services/ats__staff/first_sip_line_channels_count/637279/'));
            }
        };
    };

    this.requestValidateLogin = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/sitemanagement/appuser/validate_login/').
                    expectBodyToContain({
                        login: ['v.chenkova@gmail.com'],
                        user_id: ['104561']
                    }).
                    respondSuccessfullyWith({
                        callapi: false,
                        children: [],
                        leaf: true,
                        dataapi: false,
                        description: "Условие доступа",
                        expanded: false,
                        number_management: null,
                        partlyChecked: {
                            is_insert: true,
                            is_update: true,
                            is_select: true,
                            is_delete: true
                        },
                        permission_unit_id: null,
                        separate_units: null,
                        success: true,
                        user_management: false
                    });
            }
        };
    };

    this.requestPermissions = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/sitemanagement/appuser/permissions/').
                    respondSuccessfullyWith({
                        callapi: false,
                        children: [{
                            is_allowed: null,
                            description: 'Управление сайтами и рекламными кампаниями',
                            client_app_id: null,
                            site_id: null,
                            client_app_user_id: null,
                            partlyChecked: {
                                is_insert: false,
                                is_update: false,
                                is_select: false,
                                is_delete: false,
                            },
                            help_text: null,
                            number_capacity_ids: null,
                            is_select: false,
                            children: [{
                                permission_unit_id: 'site_new',
                                parent_id: 'site_ac_management',
                                description: 'Новые сайты',
                                site_id: null,
                                ac_id: null,
                                group_id: null,
                                employee_id: null,
                                client_app_id: null,
                                client_app_user_id: null,
                                is_allowed: null,
                                number_capacity_ids: null,
                                parent_region_ids: null,
                                region_prefixes: null,
                                is_select: false,
                                is_update: false,
                                is_insert: false,
                                is_delete: false,
                                ordering: 1,
                                help_text: 'Настройки доступа будут распространяться на все вновь добавляемые сайты.',
                                leaf: true,
                            }],
                            is_update: false,
                            permission_unit_id: 'site_ac_management',
                            employee_id: null,
                            is_insert: false,
                            is_delete: false,
                            ordering: 1,
                            expanded: false,
                            parent_region_ids: null,
                            parent_id: null,
                            group_id: null,
                            region_prefixes: null,
                            ac_id: null,
                        }],
                        leaf: true,
                        dataapi: false,
                        description: "Условие доступа",
                        expanded: false,
                        number_management: null,
                        partlyChecked: {
                            is_insert: true,
                            is_update: true,
                            is_select: true,
                            is_delete: true
                        },
                        permission_unit_id: null,
                        separate_units: null,
                        success: true,
                        user_management: false
                    });
            }
        };
    };
    this.requestEmployeesUnattachedToUser = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/sitemanagement/appuser/employees_unattached_to_users/').
                    respondSuccessfullyWith({
                        success: true,
                        data: [{
                            id: 637279,
                            name: 'Ченкова Веселина Добриновна'
                        }, {
                            id: 928548,
                            name: 'Костадинова Галина Добромировна'
                        }]
                    });
            }
        };
    };

    this.requestAppUser = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/sitemanagement/appuser/appuser/read/app_user/104561/').
                    respondSuccessfullyWith({
                        success: true,
                        data: {
                            app_user: [{
                                api_permissions: null,
                                app_id: 4735,
                                description: null,
                                employee_id: 928548,
                                id: 104561,
                                is_active: true,
                                is_linked_to_employee: true,
                                is_system: false,
                                login: 'v.chenkova@gmail.com',
                                name: 'Веселина Ченкова',
                                password: '',
                                token: null,
                                token_expiration_date: null,
                                user_type: 'user',
                                watcher_login: null
                            }]
                        },
                        metadata: [{
                            fields: [
                                'password',
                                'employee_id',
                                'name',
                                'api_permissions',
                                'token_expiration_date',
                                'is_active',
                                'app_id',
                                'user_type',
                                'is_linked_to_employee',
                                'is_system',
                                'token',
                                'login',
                                'watcher_login',
                                {
                                    name: 'id',
                                    primary_key: true
                                },
                                'description'
                            ],
                            belongs_to: [],
                            name: 'app_user',
                            has_many: []
                        }]
                    });
            }
        };
    };

    this.requestAppUserSites = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/sitemanagement/appuser/sites/').
                    respondSuccessfullyWith({
                        success: true,
                        data: [{
                            id: 16074,
                            name: 'c182386.mwisdfkium.ru'
                        }]
                    });
            }
        };
    };

    this.batchReloadRequest = function () {
        function addMethods (me) {
            return me;
        }

        return addMethods({
            expectToBeSent: function () {
                return addMethods({
                    receiveResponse: function () {
                        requestsManager.recentRequest().
                            expectToHavePath('/directory/batch_reload/').
                            expectToHaveMethod('POST').
                            respondSuccessfullyWith({
                                success: true,
                                data: {
                                    'comagic:staff:employee': [{
                                        aux_id: [208694, 214038, 274799, 368612],
                                        aux_id2: true,
                                        aux_id3: '32',
                                        call_center_role: 'employee',
                                        has_va: true,
                                        id: 568711,
                                        is_active: true,
                                        is_consultant_call: true,
                                        is_consultant_chat: true,
                                        is_consultant_offline_message: false,
                                        is_manage_allowed: true,
                                        name: '000011 Привет',
                                    }],
                                } 
                            });
                    }
                });
            },
            receiveResponse: function () {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    this.form = testersFactory.createFormTester(function () {
        return Comagic.getApplication().getViewport();
    });

    this.employeesCombo = function () {
        return testersFactory.createComboBoxTester((
            new ExtJsTester_FieldsGetter(Comagic.getApplication().getViewport(), utils, function (checkbox) {
                return checkbox.ownerCt.down('combobox');
            })
        ).withBoxLabel('Связать с сотрудником'), 'Связать с сотрудником');
    };

    this.warningWindow = testersFactory.createComponentTester(function () {
        return utils.getFloatingComponent();
    });

    this.yesButton = testersFactory.createButtonTester(function () {
        var win = utils.getFloatingComponent();
        return win ? win.down('button[text="Да"]') : null;
    });

    this.cancelButton = testersFactory.createButtonTester(function () {
        var win = utils.getFloatingComponent();
        return win ? win.down('button[text="Нет"]') : null;
    });

    this.closeButton = testersFactory.createDomElementTester(function () {
        var win = utils.getFloatingComponent();
        return win && win.el ? win.el.down('.x-tool img', true) : null;
    });

    this.saveButton = testersFactory.createDomElementTester(function () {
        body.querySelector
    });

    this.destroy = function() {
        controller.destroy();
    };
}
