tests.requireClass('Comagic.services.ats.scenario.store.CallMarkerTypes');
tests.requireClass('Comagic.services.ats.scenario.store.ReturnCodes');
tests.requireClass('Comagic.services.ats.scenario.store.ActionTypes');
tests.requireClass('Comagic.services.ats.scenario.store.Record');
tests.requireClass('Comagic.services.ats.scenario.controller.EditPage');
tests.requireClass('ULib.ux.data.TreeComboStore');

tests.requireResponse('action_types_59274');
tests.requireResponse('batch_reload_59274');
tests.requireResponse('read_scenario_59274');
tests.requireResponse('return_codes_59274');
tests.requireResponse('batch_reload_24913');

function ServicesAtsScenario(args) {
    var requestsManager = args.requestsManager,
        testersFactory = args.testersFactory,
        utils = args.utils,
        responses = args.responses;
        controller = Comagic.getApplication().getController('Comagic.services.ats.scenario.controller.EditPage');

    this.actionIndex = function (data) {
        controller.init();
        controller.actionIndex({
            siteId: 1234
        }, data);
    };

    this.menuItem = function (text) {
        return testersFactory.createDomElementTester(
            utils.descendantOfBody().
                matchesSelector('.x-menu-item-text').
                textEquals(text).
                find()
        );
    };

    this.scenarioTreeTypeButton = testersFactory.createDomElementTester(function () {
        return document.querySelector(
            '.select-scenario-tree-type-checkbox.x-form-cb-checked .x-form-field.x-form-checkbox'
        );
    });

    this.windowText = testersFactory.createDomElementTester(function () {
        return utils.getVisibleSilently(document.querySelectorAll('.x-window-text')) || new JsTester_NoElement();
    });

    this.actionReturnCodesList = (function () {
        function getList () {
            return utils.getVisibleSilently(document.querySelectorAll('.scenario-actionreturncodeslist')) ||
                new JsTester_NoElement();
        }

        var tester = testersFactory.createDomElementTester(getList);

        tester.row = {
            atIndex: function (index) {
                function getElement () {
                    return getList().querySelectorAll('.return-code-item-container')[index] || new JsTester_NoElement();
                }

                var tester = addTesters(testersFactory.createFormTester(function () {
                    return utils.getComponentByDomElement(getElement());
                }), getElement);

                tester.distributionItemNames = testersFactory.createDomElementTester(function () {
                    return getElement().querySelector('.distribution-item-names');
                });

                return tester;
            },
            first: function () {
                return this.atIndex(0);
            }
        };

        return tester;
    })();

    this.treeNode = function (text) {
        var domElement = utils.descendantOfBody().matchesSelector('.x-tree-node-text').textEquals(text).find(),
            tester = testersFactory.createDomElementTester(domElement);

        tester.expander = testersFactory.createDomElementTester(function () {
            return domElement.closest('.x-grid-cell-inner').querySelector('.x-tree-expander');
        });

        tester.expectToBeExpanded = function () {
            testersFactory.createDomElementTester(domElement.closest('.x-grid-row')).
                expectToHaveClass('x-grid-tree-node-expanded');
        };

        tester.expectToBeCollapsed = function () {
            testersFactory.createDomElementTester(domElement.closest('.x-grid-row')).
                expectNotToHaveClass('x-grid-tree-node-expanded');
        };

        tester.expectToBeSelected = function () {
            testersFactory.createDomElementTester(domElement.closest('.x-grid-item')).
                expectToHaveClass('x-grid-item-selected');
        };

        tester.expectNotToBeSelected = function () {
            testersFactory.createDomElementTester(domElement.closest('.x-grid-item')).
                expectNotToHaveClass('x-grid-item-selected');
        };

        tester.checkbox = testersFactory.createDomElementTester(function () {
            return domElement.closest('.x-grid-item').querySelector('.x-tree-checkbox');
        });

        return tester;
    };

    this.headerCollapseArrow = testersFactory.createDomElementTester(function () {
        return document.querySelector('.header-collapse-arrow');
    });

    this.tabTitle = function (text) {
        return testersFactory.createDomElementTester(function () {
            return utils.descendantOfBody().matchesSelector('.x-tab-inner-ul').textEquals(text).find();
        });
    };

    function addTesters (me, getAscendant) {
        me.component = function (text) {
            return testersFactory.createDomElementTester(function () {
                return utils.descendantOf(getAscendant()).matchesSelector('.x-component-ul').textEquals(text).find();
            });
        };

        return me;
    }

    addTesters(this, function () {
        return document.body;
    });

    this.button = function (text) {
        return testersFactory.createDomElementTester(function () {
            return utils.descendantOfBody().
                matchesSelector('.x-btn-inner').
                textEquals(text).
                find();
        });
    };

    this.actionButton = function (text) {
        return testersFactory.createDomElementTester(function () {
            return utils.descendantOfBody().
                matchesSelector('.x-dataview-item').
                textEquals(text).
                find();
        });
    };

    this.addActionButton = testersFactory.createDomElementTester(function () {
        return utils.getVisibleSilently(document.querySelectorAll('.add-action-icon'));
    });

    this.collapseVideoButton = testersFactory.createDomElementTester(function () {
        return document.querySelector('.cmg-video-tutorial-thumbnail-collapse-tool');
    });

    this.expandVideoButton = testersFactory.createDomElementTester(function () {
        return document.querySelector('.cmg-video-tutorial-thumbnail-right-expand-tool');
    });

    this.videoWindow = testersFactory.createDomElementTester(function () {
        return document.querySelector('.ul-floating iframe');
    });

    this.openVideoButton = testersFactory.createDomElementTester(function () {
        return document.querySelector('.cmg-video-tutorial-thumbnail-open-button');
    });

    this.modalMask = testersFactory.createDomElementTester(function () {
        return document.querySelector('.ul-windowmanager-mask');
    });

    this.actionIcon = function () {
        var expectedName,
            expectedIndex = null;

        return {
            withName: function (value) {
                expectedName = value;
                return this;
            },
            atIndex: function (value) {
                expectedIndex = value;
                return this;
            },
            first: function () {
                expectedIndex = 0;
                return this;
            },
            find: function () {
                var elements = document.querySelectorAll(
                    '.scenario-tree-container .action-name, .cm-componenttreepanel-node-action-name'
                );

                var length = elements.length,
                    expectedActionsDescription,
                    validElements,
                    i;
                
                if (!length) {
                    throw new Error('Ни одно действие не найдено.');
                }

                if (expectedName) {
                    var actualNames = [],
                        actualName,
                        element;

                    validElements = [];

                    for (i = 0; i < length; i ++) {
                        element = elements[i];
                        actualName = utils.getTextContent(element);
                        
                        if (actualName == expectedName) {
                            validElements.push(element);
                        }

                        actualNames.push(actualName);
                    }

                    length = validElements.length;
                    expectedActionsDescription = 'с именем "' + expectedName + '"';

                    if (!length) {
                        throw new Error('Не найдены действия ' + expectedActionsDescription + '. Найдены были ' +
                            'следующие действия: "' + actualNames.join('", "') + '"');
                    }
                } else {
                    validElements = elements;
                    expectedActionsDescription = '';
                }

                if (expectedIndex !== null) {
                    if (expectedIndex >= length) {
                        throw new Error('Не найдено ' + (expectedIndex + 1) + '-ое действие' +
                            expectedActionsDescription + '.');
                    }
                } else {
                    expectedIndex = 0;
                }

                var tester = testersFactory.createDomElementTester(validElements[expectedIndex]);

                tester.putMouseOver = function () {
                    var nodeContainer = tester.getElement().closest('.node-container');

                    testersFactory.createDomElementTester(nodeContainer).expectToBeVisible();
                    nodeContainer.classList.add('hover');
                };

                tester.linkAddingButton = testersFactory.createDomElementTester(function () {
                    return tester.getElement().closest('.cm-componenttreepanel-node-action-name-and-controls-wrapper').
                        querySelector('.cm-componenttreepanel-node-control-addlink');
                });
                
                return tester;
            }
        };
    };

    this.batchReloadRequest = function () {
        var response = {
            success: true,
            data: {
                'comagic:ns:condition_operator': [{
                    description: null,
                    id: '>',
                    is_value_required: true,
                    name: 'Больше'
                }, {
                    description: null,
                    id: '<',
                    is_value_required: true,
                    name: 'Меньше'
                }, {
                    description: null,
                    id: 'starts_with',
                    is_value_required: true,
                    name: 'Начинается с'
                }, {
                    description: null,
                    id: 'ends_with',
                    is_value_required: true,
                    name: 'Заканчивается на'
                }, {
                    description: null,
                    id: 'is_null',
                    is_value_required: false,
                    name: 'Пустое'
                }, {
                    description: null,
                    id: 'is_not_null',
                    is_value_required: false,
                    name: 'Не пустое'
                }, {
                    description: 'Множество значений в событии точно соответствует множеству выбранных ' +
                        'значений / Значение в событии точно соответствует заданному значению',
                    id: '=',
                    is_value_required: true,
                    name: 'Точно соответствует'
                }, {
                    description: 'Множество значений в событии содержит все выбранные значения / ' +
                        'Значение в событии содержит заданную строку',
                    id: 'in',
                    is_value_required: true,
                    name: 'Содержит'
                }, {
                    description: 'Множество значений в событии включает хотя бы одно выбранное значение',
                    id: 'intersect',
                    is_value_required: true,
                    name: 'Включает'
                }, {
                    description: 'Множество значений в событии целиком содержится во множестве выбранных ' +
                        'значений',
                    id: 'sub',
                    is_value_required: true,
                    name: 'Содержится в'
                }],
                'comagic:_tree:va_crm_fields': [{
                    data: [{
                        available_operators: [
                            '=',
                            'is_null',
                            'is_not_null'
                        ],
                        available_values: {
                            4530994: 'Воронка'
                        },
                        category: 'sales_funnel',
                        leaf: true,
                        name: 'Воронка продаж',
                        type: 'select'
                    }, {
                        available_operators: [
                            '=',
                            'is_null',
                            'is_not_null'
                        ],
                        available_values: {
                            1162710: '2 линия (Основная)',
                            1162712: '2 линия (Вебинары)',
                            1162714: '2 линия (Профи.ру)',
                            1162716: 'Retention/Awake',
                            1162718: 'Допродажи',
                            1162720: 'Оплачено полностью'
                        },
                        category: 'user_field',
                        leaf: true,
                        name: '1/2 оплаты',
                        type: 'select',
                        user_field_id: 295656
                    }, {
                        available_operators: [
                            '=',
                            'in',
                            'starts_with',
                            'ends_with',
                            'is_null',
                            'is_not_null'
                        ],
                        available_values: null,
                        category: 'user_field',
                        leaf: true,
                        name: 'UTM_CONTENT',
                        type: 'text',
                        user_field_id: 2632367
                    }, {
                        available_operators: [
                            '=',
                            'in',
                            'starts_with',
                            'ends_with',
                            'is_null',
                            'is_not_null'
                        ],
                        available_values: null,
                        category: 'user_field',
                        leaf: true,
                        name: 'UTM_CAMPAIGN',
                        type: 'text',
                        user_field_id: 2632364
                    }],
                    id: 2,
                    mnemonic: 'leads',
                    name: 'Сделка'
                }, {
                    data: [{
                        available_operators: [
                            '=',
                            'in',
                            'starts_with',
                            'ends_with',
                            'is_null',
                            'is_not_null'
                        ],
                        available_values: null,
                        category: 'user_field',
                        leaf: true,
                        name: 'UTM_CONTENT',
                        type: 'text',
                        user_field_id: 2632367
                    }, {
                        available_operators: [
                            '=',
                            'in',
                            'starts_with',
                            'ends_with',
                            'is_null',
                            'is_not_null'
                        ],
                        available_values: null,
                        category: 'user_field',
                        leaf: true,
                        name: 'UTM_CAMPAIGN',
                        type: 'text',
                        user_field_id: 2632364
                    }],
                    id: 4272,
                    mnemonic: 'contacts',
                    name: 'Контакт'
                }],
                'comagic:_tree:regions': [{
                    id: 'group5422',
                    leaf: false,
                    name: 'Австралия',
                    data: [{
                        id: 5422,
                        leaf: true,
                        name: 'Австралия (все регионы)'
                    }, {
                        data: [],
                        id: 5423,
                        leaf: true,
                        name: 'toll free'
                    }]
                }, {
                    id: 'group109',
                    leaf: false,
                    name: 'Азербайджан',
                    data: [{
                        data: [],
                        id: 367,
                        leaf: true,
                        name: 'Агдам'
                    }, {
                        data: [],
                        id: 368,
                        leaf: true,
                        name: 'Агдаш'
                    }]
                }],
                'comagic:_tree:segments_by_sites': [{
                    id: 51425,
                    leaf: false,
                    name: 'somesite.com',
                    data: [{
                        data: [],
                        id: 86928,
                        leaf: true,
                        name: 'Первый сегмент'
                    }, {
                        data: [],
                        id: 96817,
                        leaf: true,
                        name: 'Второй сегмент'
                    }]
                }, {
                    id: 2757,
                    leaf: false,
                    name: 'othersite.com',
                    data: [{
                        data: [],
                        id: 72857,
                        leaf: true,
                        name: 'Третий сегмент'
                    }, {
                        data: [],
                        id: 6738,
                        leaf: true,
                        name: 'Четвертый сегмент'
                    }]
                }],
                'comagic:public:tts_voice': [{
                    id: 2859285,
                    name: 'Римма',
                    aux_id: true
                }],
                'comagic:staff:phones_in_employee': [{
                    id: 3829,
                    name: '79451234567',
                    aux_id: 2384
                }],
                'comagic:staff:employee': [{
                    id: 23483,
                    name: 'Ivanov Ivan Ivanovich'
                }],
                'comagic:file:media': [{
                    aux_id: 'leave_message',
                    aux_id2: 4,
                    id: 2035,
                    name: 'Оставьте голосовое сообщение после звукового сигнала'
                }]
            } 
        };

        function addMethods (me) {
            me.noCrmFields = function () {
                response.data['comagic:_tree:va_crm_fields'] = [];
                return me;
            };

            me.salesFunnelWithEntity = function () {
                response.data['comagic:_tree:va_crm_fields'][0].data[0] = {
                    available_operators: [
                        '=',
                        'is_null',
                        'is_not_null'
                    ],
                    available_values: {
                        4530994: 'Воронка'
                    },
                    category: 'sales_funnel',
                    leaf: true,
                    name: 'Воронка продаж',
                    type: 'select',
                    user_field_id: null
                };

                return me;
            };

            me.noAvailableValue = function () {
                response.data['comagic:_tree:va_crm_fields'][1].data[1].available_values = {};
                return me;
            };

            me.onlyOneContactField = function () {
                response.data['comagic:_tree:va_crm_fields'][1].data = [{
                    available_operators: [
                        '=',
                        'in',
                        'starts_with',
                        'ends_with',
                        'is_null',
                        'is_not_null'
                    ],
                    available_values: null,
                    category: 'user_field',
                    leaf: true,
                    name: 'UTM_CAMPAIGN',
                    type: 'text',
                    user_field_id: 2632364
                }];

                return me;
            };
            
            me.app24913Request = function () {
                response.data['comagic:_tree:va_crm_fields'] =
                    responses['batch_reload_24913'].data['comagic:_tree:va_crm_fields'];

                return me;
            };

            me.app59274Request = function () {
                response = responses['batch_reload_59274'];
                return me;
            };

            return me;
        }

        return addMethods({
            expectToBeSent: function () {
                return addMethods({
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

    this.requestScenario = function () {
        var response = {
            success: true,
            metadata: [{
                fields: [{
                    name: 'id',
                    primary_key: true
                }, 'first_action_id', 'name', 'app_id'],
                belongs_to: [],
                name: 'scenario',
                has_many: [{
                    table: 'action',
                    foreign_key: 'scenario_id'
                }]
            }, {
                fields: [
                    'is_failed_calls_include', 'communication_number_interval', 'forward_call_rule',
                    'http_method', 'is_check_employee_busy', 'use_all_communication_types', {
                        'name': 'id',
                        'primary_key': true
                    }, 'scenario_id', 'after_call_employee_busy_duration', 'playlist_id',
                    'allowed_last_call_interval', 'attempts_count', 'email', 'operator_playlist_id',
                    'max_access_code_len', 'is_queue', 'action_type_id', 'is_ask_rating', 'name',
                    'is_tag_call', 'url', 'is_auto_connect', 'queue_playlist_id',
                    'is_use_numb_as_numa', 'timeout', 'forward_call_base', 'access_code',
                    'calls_stat_interval', 'is_within_scenario', 'calls_stat_levels'
                ],
                belongs_to: [{
                    'table': 'scenario',
                    'foreign_key': 'scenario_id'
                }],
                name: 'action',
                has_many: [{
                    table: 'action_staff_group',
                    foreign_key: 'action_id'
                }, {
                    table: 'action_http_param',
                    foreign_key: 'action_id'
                }, {
                    table: 'action_mark',
                    foreign_key: 'action_id'
                }, {
                    table: 'action_jump',
                    foreign_key: 'from_action_id'
                }, {
                    table: 'action_jump',
                    foreign_key: 'to_action_id'
                }]
            }, {
                fields: [
                    'is_failed_calls_include', 'action_id', 'forward_call_rule', 'lines_start',
                    'percent', 'group_phones', 'priority', 'staff_group_id', {
                        name: 'id',
                        primary_key: true
                    }, 'increment', 'forward_call_base', 'is_incremental_dialing',
                    'calls_stat_interval', 'increment_timeout', 'lines_limit', 'calls_stat_levels'
                ],
                belongs_to: [{
                    table: 'action',
                    foreign_key: 'action_id'
                }],
                name: 'action_staff_group',
                has_many: []
            }, {
                fields: [
                    'mnemonic', 'action_id', 'http_param_type_id', {
                        name: 'id',
                        primary_key: true
                    }
                ],
                belongs_to: [{
                    table: 'action',
                    foreign_key: 'action_id'
                }],
                name: 'action_http_param',
                has_many: []
            }, {
                fields: [
                    'return_code_id', 'mark_id', {
                        name: 'id',
                        primary_key: true
                    }, 'action_id'
                ],
                belongs_to: [{
                    table: 'action',
                    foreign_key: 'action_id'
                }],
                name: 'action_mark',
                has_many: []
            }, {
                fields: [
                    'return_code_id', 'from_action_id', 'is_link', 'to_action_id', {
                        name: 'id',
                        primary_key: true
                    }
                ],
                belongs_to: [{
                    table: 'action',
                    foreign_key: 'from_action_id'
                }, {
                    table: 'action',
                    foreign_key: 'to_action_id'
                }],
                name: 'action_jump',
                'has_many': [{
                    table: 'action_jump_segment',
                    foreign_key: 'action_jump_id'
                }, {
                    table: 'action_jump_region',
                    foreign_key: 'action_jump_id'
                }]
            }, {
                fields: [
                    'priority', {
                        name: 'id',
                        primary_key: true
                    }, 'action_jump_id', 'segment_id'
                ],
                belongs_to: [{
                    table: 'action_jump',
                    foreign_key: 'action_jump_id'
                }],
                name: 'action_jump_segment',
                has_many: []
            }, {
                fields: [
                    'priority', {
                        name: 'id',
                        primary_key: true
                    },
                    'region_id', 'action_jump_id'
                ],
                belongs_to: [{
                    table: 'action_jump',
                    foreign_key: 'action_jump_id'
                }],
                name: 'action_jump_region',
                has_many: []
            }, {
                belongs_to: [{
                    table: 'action_jump',
                    foreign_key: 'action_jump_id'
                }],
                fields: [
                    'category',
                    'user_field_id',
                    'value',
                    'priority',
                    'action_jump_id',
                    'operator',
                    'partner',
                    'entity',
                    {
                        name: 'id',
                        primary_key: true
                    }
                ],
                has_many: [],
                name: 'action_jump_crm_field'
            }, {
                fields: [{
                    name: 'id',
                    primary_key: true
                }, 'app_id'],
                belongs_to: [],
                name: 'playlist',
                has_many: [{
                    table: 'playlist_item',
                    foreign_key: 'playlist_id'
                }]
            }, {
                fields: ['tts_tag_id', 'priority', 'playlist_id', 'media_file_id', 'tts_string', {
                    name: 'id',
                    primary_key: true
                }],
                belongs_to: [{
                    table: 'playlist',
                    foreign_key: 'playlist_id'
                }],
                name: 'playlist_item',
                has_many: []
            }],
            data: {
                action_jump_crm_field: [],
                action_jump_region: [],
                scenario: [{
                    first_action_id: 218318,
                    app_id: 4735,
                    id: 210948,
                    name: '0_0'
                }],
                action_staff_group: [{
                    is_failed_calls_include: false,
                    calls_stat_levels: ['scenario', 'action', 'group', 'employee', 'phone'],
                    forward_call_rule: 'priority',
                    lines_start: 1,
                    percent: 0,
                    increment_timeout: 5,
                    group_phones: [{
                        release_desc: 'employee_phone_inactive',
                        channels_count: 1,
                        employee_id: 15555,
                        protocol: 'PSTN',
                        timeout: 30,
                        phone_id: 11039,
                        not_tracked_release_desc: 'employee_phone_inactive',
                        percent: 0,
                        id: 257905,
                        priority: 1,
                        is_available: true,
                        numb: '79100032583',
                        timestamp: 1566213890.635766,
                        phone_in_employee_id: 9507,
                        group_id: 94351
                    }],
                    priority: 1,
                    is_incremental_dialing: false,
                    increment: 1,
                    forward_call_base: 'count',
                    staff_group_id: 94351,
                    calls_stat_interval: null,
                    id: 92539,
                    lines_limit: 1,
                    action_id: 218319
                }],
                playlist: [{
                    id: 201831,
                    app_id: 4735
                }],
                playlist_item: [{
                    tts_tag_id: null,
                    priority: 1,
                    playlist_id: 201831,
                    media_file_id: 2035,
                    tts_string: null,
                    id: 240027
                }],
                action_jump: [{
                    return_code_id: 4,
                    from_action_id: 218318,
                    to_action_id: 218319,
                    is_link: false,
                    id: 125790
                }],
                action_jump_segment: [{
                    priority: 0,
                    segment_id: 33767,
                    id: 163,
                    action_jump_id: 125790
                }],
                action: [{
                    is_failed_calls_include: false,
                    communication_number_interval: null,
                    forward_call_rule: null,
                    http_method: 'GET',
                    is_check_employee_busy: false,
                    use_all_communication_types: false,
                    id: 218318,
                    scenario_id: 210948,
                    after_call_employee_busy_duration: 0,
                    playlist_id: null,
                    allowed_last_call_interval: null,
                    attempts_count: null,
                    email: null,
                    forward_call_base: 'count',
                    max_access_code_len: null,
                    is_queue: false,
                    action_type_id: 4,
                    is_ask_rating: false,
                    name: 'Меню 1',
                    is_tag_call: false,
                    url: null,
                    is_auto_connect: false,
                    queue_playlist_id: null,
                    is_use_numb_as_numa: true,
                    timeout: 5,
                    operator_playlist_id: null,
                    access_code: null,
                    calls_stat_interval: null,
                    is_within_scenario: false,
                    calls_stat_levels: null
                }, {
                    is_failed_calls_include: false,
                    communication_number_interval: null,
                    forward_call_rule: null,
                    http_method: null,
                    is_check_employee_busy: false,
                    use_all_communication_types: false,
                    id: 218319,
                    scenario_id: 210948,
                    after_call_employee_busy_duration: 0,
                    playlist_id: 201831,
                    allowed_last_call_interval: null,
                    attempts_count: null,
                    email: null,
                    forward_call_base: 'count',
                    max_access_code_len: null,
                    is_queue: false,
                    action_type_id: 7,
                    is_ask_rating: false,
                    name: 'Голосовая почта 1',
                    is_tag_call: false,
                    url: null,
                    is_auto_connect: false,
                    queue_playlist_id: null,
                    is_use_numb_as_numa: true,
                    timeout: null,
                    operator_playlist_id: null,
                    access_code: null,
                    calls_stat_interval: null,
                    is_within_scenario: false,
                    calls_stat_levels: null
                }],
                action_http_param: [],
                action_mark: []
            } 
        };

        function addMethods (me) {
            me.app59274 = function () {
                response = responses['read_scenario_59274'];
                return me;
            };

            me.includesOnlyDistributionByCrmDataAction = function () {
                response.data = {
                    action_jump_crm_field: [],
                    action_jump_region: [],
                    action_staff_group: [],
                    action_jump_segment: [],
                    action_http_param: [],
                    action_mark: [],

                    scenario: [{
                        first_action_id: 218318,
                        app_id: 4735,
                        id: 210948,
                        name: 'Некий сценарий'
                    }],

                    playlist: [{
                        id: 647295
                    }],

                    playlist_item: [{
                        media_file_id: 2035,
                        priority: 0,
                        playlist_id: 647295,
                        id: 537938
                    }],

                    action_jump: [{
                        return_code_id: 4,
                        from_action_id: 218318,
                        to_action_id: 218319,
                        is_link: false,
                        id: 125790
                    }],

                    action: [{
                        action_type_id: 74,
                        name: 'По данным из CRM 1',
                        scenario_id: 210948,
                        is_within_scenario: false,
                        id: 218318
                    }, {
                        action_type_id: 7,
                        name: 'Голосовая почта 2',
                        scenario_id: 210948,
                        is_within_scenario: false,
                        id: 218319,
                        playlist_id: 647295
                    }]
                };

                return me;
            };

            me.includesDistributionByCrmDataAction = function () {
                response.data.action_jump_crm_field.push({
                    action_jump_id: 572858,
                    priority: 0,
                    operator: '=',
                    value: ['4530994'],
                    id: 271508,
                    category: 'sales_funnel',
                    partner: 'amocrm',
                    entity: 'leads'
                });

                response.data.action.push({
                    action_type_id: 74,
                    name: 'По данным из CRM 1',
                    scenario_id: 210948,
                    is_within_scenario: false,
                    id: 86392            
                }, {
                    action_type_id: 4,
                    name: 'Меню 2',
                    scenario_id: 210948,
                    timeout: 5,
                    http_method: 'GET',
                    id: 53729
                });

                response.data.action_jump.push({
                    from_action_id: 218318,
                    to_action_id: 86392,
                    return_code_id: 7,
                    id: 427002            
                }, {
                    from_action_id: 86392,
                    to_action_id: 53729,
                    return_code_id: 124,
                    id: 572858
                });

                me.includesTextCrmField = function () {
                    response.data.action_jump_crm_field[0].user_field_id = 2632367;
                    response.data.action_jump_crm_field[0].category = 'user_field';
                    response.data.action_jump_crm_field[0].value = 'qwe123';

                    return me;
                };

                me.includesEntityCrmField = function () {
                    response.data.action_jump_crm_field[0].operator = 'is_null';
                    response.data.action_jump_crm_field[0].user_field_id = null;
                    response.data.action_jump_crm_field[0].category = 'entity';
                    response.data.action_jump_crm_field[0].value = null;

                    return me;
                };
                
                me.salesFunnelWithEntity = function () {
                    return me;
                };

                me.includesTwoCrmFields = function () {
                    response.data.action.push({
                        action_type_id: 7,
                        name: 'Голосовая почта 2',
                        scenario_id: 210948,
                        is_within_scenario: false,
                        id: 29594,
                        playlist_id: 73874
                    });

                    response.data.action_jump.push({
                        from_action_id: 86392,
                        to_action_id: 29594,
                        return_code_id: 125,
                        id: 647295
                    });

                    response.data.action_jump_crm_field.push({
                        action_jump_id: 647295,
                        priority: 0,
                        user_field_id: 295656,
                        operator: '=',
                        value: ['1162718'],
                        partner: 'amocrm',
                        id: 37838,
                        category: 'user_field',
                        entity: 'leads'
                    });

                    response.data.playlist.push({
                        id: 647295
                    });

                    response.data.playlist_item.push({
                        media_file_id: 2035,
                        priority: 0,
                        playlist_id: 647295,
                        id: 537938
                    });

                    return me;
                };

                return me;
            };

            me.includesCrmFieldWithEntity = function () {
                response.data.action_jump_crm_field.push({
                    action_jump_id: 572858,
                    priority: 0,
                    user_field_id: 2632364,
                    operator: '=',
                    value: 'UIS',
                    partner: 'amocrm',
                    id: 271508,
                    category: 'user_field',
                    entity: 'contacts'
                });

                response.data.action.push({
                    action_type_id: 74,
                    name: 'По данным из CRM 1',
                    scenario_id: 210948,
                    is_within_scenario: false,
                    id: 86392            
                }, {
                    action_type_id: 4,
                    name: 'Меню 2',
                    scenario_id: 210948,
                    timeout: 5,
                    http_method: 'GET',
                    id: 53729
                });

                response.data.action_jump.push({
                    from_action_id: 218318,
                    to_action_id: 86392,
                    return_code_id: 7,
                    id: 427002            
                }, {
                    from_action_id: 86392,
                    to_action_id: 53729,
                    return_code_id: 124,
                    id: 572858
                });

                return me;
            };

            return me;
        }

        return addMethods({
            expectToBeSent: function () {
                var request = requestsManager.recentRequest().
                    expectToHavePath('/services/ats__scenario/scenario/read/scenario/210948/');

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

    this.scenarioRequest = this.requestScenario;

    this.markersTypesRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/services/ats__scenario/markers_types/read/').
                    respondSuccessfullyWith({
                        success: true,
                        data: [{
                            id: 8927,
                            name: 'Some marker type'
                        }]
                    });
            }
        };
    };

    this.returnCodesRequest = function () {
        var response = {
            success: true,
            data: [{
                action_type_id: 4,
                code: '4',
                description: null,
                id: 7,
                is_postprocess: false,
                name: 'Клавиша 4',
                priority: 4
            }, {
                action_type_id: 4,
                code: '5',
                description: null,
                id: 7393,
                is_postprocess: false,
                name: 'Клавиша 5',
                priority: 4
            }, {
                action_type_id: 74,
                code: '0',
                description: null,
                id: 124,
                is_postprocess: false,
                name: '0',
                priority: 4
            }, {
                action_type_id: 74,
                code: '1',
                description: null,
                id: 125,
                is_postprocess: false,
                name: '1',
                priority: 4
            }, {
                action_type_id: 74,
                code: '2',
                description: null,
                id: 126,
                is_postprocess: false,
                name: '2',
                priority: 4
            }, {
                action_type_id: 74,
                code: 'failed',
                description: null,
                id: 132,
                is_postprocess: false,
                name: 'Ошибка при запросе к CRM',
                priority: 12
            }, {
                action_type_id: 16,
                code: '0',
                description: null,
                id: 104,
                is_postprocess: false,
                name: '0',
                priority: 1
            }, {
                action_type_id: 16,
                code: '1',
                description: null,
                id: 105,
                is_postprocess: false,
                name: '1',
                priority: 2
            }, {
                action_type_id: 12,
                code: '0',
                description: null,
                id: 106,
                is_postprocess: false,
                name: '0',
                priority: 1
            }, {
                action_type_id: 12,
                code: '1',
                description: null,
                id: 107,
                is_postprocess: false,
                name: '1',
                priority: 2
            }] 
        };

        return {
            app59274: function () {
                response = responses['return_codes_59274'];
                return this;
            },
            receiveResponse: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/services/ats__scenario/return_codes/read/').
                    respondSuccessfullyWith(response);
            }
        };
    };

    this.actionTypesRequest = function () {
        var response = {
            success: true,
            data: [{
                available_by_components: true,
                components: ['voice_mail'],
                description: 'Звонящему предлагается оставить голосовое сообщение, которое можно ' +
                    'отправить на указанный Вами e-mail. Даже если звонящий не оставит сообщение, на ' +
                    'e-mail придет письмо, в теме которого будет содержаться номер звонящего и время ' +
                    'поступления звонка. Опцию удобно использовать в качестве завершающей в случае, если ' +
                    'никто из сотрудников не ответил на звонок, или как сценарий нерабочего времени. ' +
                    'Таким образом можно быть уверенным, что все обращения будут обработаны.',
                id: 7,
                is_postprocess: false,
                mnemonic: 'voice_mail',
                name: 'Голосовая почта'
            }, {
                available_by_components: true,
                components: ['menu'],
                description: 'Звонящему предлагается нажать одну из клавиш на телефоне, чтобы ' +
                    'соединиться с нужным отделом или прослушать какую-либо информацию. Чтобы не ' +
                    'потерять звонок в случаях, когда звонящий не нажал ни на одну из предложенных ' +
                    'клавиш, или нажал на одну из ненастроенных, настройте операции “время ожидания ' +
                    'истекло” и “некорректный ввод”. Если вы хотите разрешить одновременно с выбором ' +
                    'пункта меню вводить и внутренний номер, то обратитесь в службу консалтинга: они ' +
                    'помогут настроить работу в таком режиме.',
                id: 4,
                is_postprocess: false,
                mnemonic: 'menu',
                name: 'Меню'
            }, {
                available_by_components: true,
                components: ['distribution_by_crm_data'],
                description: 'Обработка звонка в зависимости от полей и их значений в CRM, в которые ' +
                    'попал звонящий. Поля и значения должны быть заранее заданы в CRM. Настройте ' +
                    '"Остальные", чтобы не потерять звонок в случаях, когда звонящий не попадет в ' +
                    'заданные поля.',
                id: 74,
                is_postprocess: false,
                mnemonic: 'distribution_by_crm_data',
                name: 'По данным из CRM',
                partner: 'amocrm'
            }, {
                available_by_components: true,
                components: ['distribution_by_segment'],
                description: 'Обработка звонка в зависимости от сегмента, в который попал звонящий. Сегменты должны ' +
                    'быть заранее заданы в разделе Аналитика - Сегменты. Настройте операции “Сегмент не задан” и ' +
                    '“Другой сегмент”, чтобы не потерять звонок в случаях, когда звонящий не попадает в заданные ' +
                    'сегменты.',
                id: 12,
                is_postprocess: false,
                mnemonic: 'distribution_by_segment',
                name: 'Распределение по сегментам'
            }, {
                available_by_components: true,
                components: ['distribution_by_region'],
                description: 'Вы можете настроить распределение входящих вызовов по интересующим вас регионам. ' +
                    'Вызовы, не попавшие в выбранные регионы, будут перенаправляться на выход \'Остальные\'.',
                id: 16,
                is_postprocess: false,
                mnemonic: 'distribution_by_region',
                name: 'Распределение по регионам'
            }] 
        };

        function addMethods (me) {
            me.distributionByCrmDataUnavailable = function () {
                var record = response.data.find(function (record) {
                    return record.mnemonic == 'distribution_by_crm_data';
                });

                record.available_by_components = null;
                record.partner = null;
                
                return me;
            };

            me.app59274 = function () {
                response = responses['action_types_59274'];
                return me;
            };

            return me;
        }

        return addMethods({
            expectToBeSent: function () {
                return addMethods({
                    receiveResponse: function () {
                        requestsManager.recentRequest().
                            expectToHavePath('/services/ats__scenario/action_types/read/').
                            respondSuccessfullyWith(response);
                    }
                });
            },
            receiveResponse: function () {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    this.scenarioChangingRequest = function () {
        var createUniqueValueExpectation = new JsTests_UniqueValueExpectationFactory(),
            comagicVaAction1 = createUniqueValueExpectation(),
            comagicVaAction2 = createUniqueValueExpectation(),
            comagicVaActionJump1 = createUniqueValueExpectation(),
            comagicVaActionJump2 = createUniqueValueExpectation(),
            comagicVaActionJump3 = createUniqueValueExpectation(),
            comagicVaActionJumpCrmField1 = createUniqueValueExpectation(),
            comagicVaActionJumpCrmField2 = createUniqueValueExpectation(),
            comagicVaPlaylist1 = createUniqueValueExpectation(),
            comagicVaPlaylistItem1 = createUniqueValueExpectation(),
            comagicVaActionJumpRegion1 = createUniqueValueExpectation(),
            comagicVaActionJumpRegion2 = createUniqueValueExpectation(),
            comagicVaActionJumpRegion3 = createUniqueValueExpectation(),
            comagicVaActionJumpSegment1 = createUniqueValueExpectation(),
            comagicVaActionJumpSegment2 = createUniqueValueExpectation(),
            comagicVaActionJumpSegment3 = createUniqueValueExpectation();

        var bodyParams = {
            action_types: {
                create: [undefined],
                update: [undefined],
                destroy: [undefined]    
            },
            return_codes: {
                create: [undefined],
                update: [undefined],
                destroy: [undefined]
            },
            call_marker_types: {
                create: [undefined],
                update: [undefined],
                destroy: [undefined]
            },
            scenario: {
                create: [undefined],
                update: [undefined],
                destroy: [undefined]
            },
            action: {
                create: [undefined],    
                update: [undefined],
                destroy: [undefined]
            },
            action_staff_group: {
                create: [undefined],
                update: [undefined],
                destroy: [undefined]
            },
            action_http_param: {
                create: [undefined],
                update: [undefined],
                destroy: [undefined]
            },
            action_mark: {
                create: [undefined],
                update: [undefined],
                destroy: [undefined]
            },
            action_jump: {
                create: [undefined],
                update: [undefined],
                destroy: [undefined]    
            },
            action_jump_segment: {
                create: [undefined],
                update: [undefined],
                destroy: [undefined]
            },
            action_jump_region: {
                create: [undefined],
                update: [undefined],
                destroy: [undefined]
            },
            action_jump_crm_field: {
                create: [undefined],
                update: [undefined],
                destroy: [undefined]    
            },
            playlist: {
                create: [undefined],
                update: [undefined],
                destroy: [undefined]
            },
            playlist_item: {
                create: [undefined],
                update: [undefined],
                destroy: [undefined]
            }
        };

        return {
            addingEntityField: function () {
                bodyParams.action.create = [{
                    action_type_id: 74,
                    name: 'По данным из CRM 1',
                    scenario_id: 210948,
                    is_within_scenario: false,
                    id: comagicVaAction1
                }, {
                    action_type_id: 7,
                    name: 'Голосовая почта 2',
                    scenario_id: 210948,
                    is_within_scenario: false,
                    id: comagicVaAction2,
                    playlist_id: comagicVaPlaylist1
                }, undefined];

                bodyParams.action_jump.create = [{
                    from_action_id: 218318,
                    to_action_id: comagicVaAction1,
                    return_code_id: 7,
                    id: comagicVaActionJump1
                }, {
                    from_action_id: comagicVaAction1,
                    to_action_id: comagicVaAction2,
                    return_code_id: 124,
                    id: comagicVaActionJump2
                }, undefined];

                bodyParams.action_jump_crm_field.create = [{
                    action_jump_id: comagicVaActionJump2,
                    priority: 0,
                    operator: 'is_null',
                    partner: 'amocrm',
                    id: comagicVaActionJumpCrmField1,
                    category: 'entity',
                    entity: 'leads'
                }, undefined];

                bodyParams.playlist.create = [{
                    id: comagicVaPlaylist1
                }, undefined];

                bodyParams.playlist_item.create = [{
                    media_file_id: 2035,
                    priority: 0,
                    playlist_id: comagicVaPlaylist1,
                    id: comagicVaPlaylistItem1
                }, undefined];

                return this;
            },
            addingCRMFieldWithoutValue: function () {
                bodyParams.action.create = [{
                    action_type_id: 74,
                    name: 'По данным из CRM 1',
                    scenario_id: 210948,
                    is_within_scenario: false,
                    id: comagicVaAction1
                }, {
                    action_type_id: 7,
                    name: 'Голосовая почта 2',
                    scenario_id: 210948,
                    is_within_scenario: false,
                    id: comagicVaAction2,
                    playlist_id: comagicVaPlaylist1
                }, undefined];

                bodyParams.action_jump.create = [{
                    from_action_id: 218318,
                    to_action_id: comagicVaAction1,
                    return_code_id: 7,
                    id: comagicVaActionJump1
                }, {
                    from_action_id: comagicVaAction1,
                    to_action_id: comagicVaAction2,
                    return_code_id: 124,
                    id: comagicVaActionJump2
                }, undefined];

                bodyParams.action_jump_crm_field.create = [{
                    action_jump_id: comagicVaActionJump2,
                    priority: 0,
                    operator: 'is_not_null',
                    partner: 'amocrm',
                    id: comagicVaActionJumpCrmField1,
                    category: 'sales_funnel',
                    entity: 'leads'
                }, undefined];

                bodyParams.playlist.create = [{
                    id: comagicVaPlaylist1
                }, undefined];

                bodyParams.playlist_item.create = [{
                    media_file_id: 2035,
                    priority: 0,
                    playlist_id: comagicVaPlaylist1,
                    id: comagicVaPlaylistItem1
                }, undefined];

                return this;
            },
            addingFailProcessing: function () {
                bodyParams.action.create = [{
                    action_type_id: 74,
                    name: 'По данным из CRM 1',
                    scenario_id: 210948,
                    is_within_scenario: false,
                    id: comagicVaAction1
                }, {
                    action_type_id: 7,
                    name: 'Голосовая почта 2',
                    scenario_id: 210948,
                    is_within_scenario: false,
                    id: comagicVaAction2,
                    playlist_id: comagicVaPlaylist1
                }, undefined];

                bodyParams.action_jump.create = [{
                    from_action_id: 218318,
                    to_action_id: comagicVaAction1,
                    return_code_id: 7,
                    id: comagicVaActionJump1
                }, {
                    from_action_id: comagicVaAction1,
                    to_action_id: comagicVaAction2,
                    return_code_id: 132,
                    id: comagicVaActionJump2
                }, undefined];

                bodyParams.playlist.create = [{
                    id: comagicVaPlaylist1
                }, undefined];

                bodyParams.playlist_item.create = [{
                    media_file_id: 2035,
                    priority: 0,
                    playlist_id: comagicVaPlaylist1,
                    id: comagicVaPlaylistItem1
                }, undefined];

                return this;
            },
            addingLinkToSegment: function () {
                bodyParams.action.create = [{
                    action_type_id: 12,
                    name: 'Распределение по сегментам 1',
                    scenario_id: 210948,
                    is_within_scenario: false,
                    id: comagicVaAction1
                }, {
                    action_type_id: 7,
                    name: 'Голосовая почта 2',
                    scenario_id: 210948,
                    is_within_scenario: false,
                    id: comagicVaAction2,
                    playlist_id: comagicVaPlaylist1
                }, undefined];

                bodyParams.action_jump.create = [{
                    from_action_id: 218318,
                    to_action_id: comagicVaAction1,
                    return_code_id: 7,
                    id: comagicVaActionJump1
                }, {
                    from_action_id: comagicVaAction1,
                    to_action_id: comagicVaAction2,
                    return_code_id: 106,
                    id: comagicVaActionJump2
                }, {
                    from_action_id: comagicVaAction1,
                    to_action_id: '218318',
                    return_code_id: 107,
                    is_link: true,
                    id: comagicVaActionJump3
                }, undefined];

                bodyParams.action_jump_segment.create = [{
                    action_jump_id: comagicVaActionJump2,
                    priority: 0,
                    segment_id: 96817,
                    id: comagicVaActionJumpSegment1
                }, {
                    action_jump_id: comagicVaActionJump3,
                    priority: 0,
                    segment_id: 86928,
                    id: comagicVaActionJumpSegment2
                }, {
                    action_jump_id: comagicVaActionJump3,
                    priority: 0,
                    segment_id: 72857,
                    id: comagicVaActionJumpSegment3
                }, undefined];

                bodyParams.playlist.create = [{
                    id: comagicVaPlaylist1
                }, undefined];

                bodyParams.playlist_item.create = [{
                    media_file_id: 2035,
                    priority: 0,
                    playlist_id: comagicVaPlaylist1,
                    id: comagicVaPlaylistItem1
                }, undefined];

                return this;
            },
            addingLinkToRegion: function () {
                bodyParams.action.create = [{
                    action_type_id: 16,
                    name: 'Распределение по регионам 1',
                    scenario_id: 210948,
                    is_within_scenario: false,
                    id: comagicVaAction1 
                }, {
                    action_type_id: 7,
                    name: 'Голосовая почта 2',
                    scenario_id: 210948,
                    is_within_scenario: false,
                    id: comagicVaAction2,
                    playlist_id: comagicVaPlaylist1
                }, undefined];

                bodyParams.action_jump.create = [{
                    from_action_id: 218318,
                    to_action_id: comagicVaAction1,
                    return_code_id: 7,
                    id: comagicVaActionJump1
                }, {
                    from_action_id: comagicVaAction1,
                    to_action_id: comagicVaAction2,
                    return_code_id: 104,
                    id: comagicVaActionJump2
                }, {
                    from_action_id: comagicVaAction1,
                    to_action_id: '218318',
                    return_code_id: 105,
                    is_link: true,
                    id: comagicVaActionJump3
                }, undefined];

                bodyParams.action_jump_region.create = [{
                    action_jump_id: comagicVaActionJump2,
                    priority: 0,
                    region_id: 5423,
                    id: comagicVaActionJumpRegion1 
                }, {
                    action_jump_id: comagicVaActionJump3,
                    priority: 0,
                    region_id: 5422,
                    id: comagicVaActionJumpRegion2 
                }, {
                    action_jump_id: comagicVaActionJump3,
                    priority: 0,
                    region_id: 368,
                    id: comagicVaActionJumpRegion3 
                }, undefined];

                bodyParams.playlist.create = [{
                    id: comagicVaPlaylist1
                }, undefined];

                bodyParams.playlist_item.create = [{
                    media_file_id: 2035,
                    priority: 0,
                    playlist_id: comagicVaPlaylist1,
                    id: comagicVaPlaylistItem1
                }, undefined];

                return this;
            },
            addingLinkToCRMField: function () {
                bodyParams.action.create = [{
                    action_type_id: 7,
                    name: 'Голосовая почта 2',
                    scenario_id: 210948,
                    is_within_scenario: false,
                    id: comagicVaAction1,
                    playlist_id: comagicVaPlaylist1
                }, undefined];

                bodyParams.action_jump.create = [{
                    from_action_id: 86392,
                    to_action_id: comagicVaAction1,
                    return_code_id: 126,
                    id: comagicVaActionJump1
                }, {
                    from_action_id: 86392,
                    to_action_id: '218318',
                    return_code_id: 125,
                    is_link: true,
                    id: comagicVaActionJump2
                }, undefined];

                bodyParams.action_jump_crm_field.create = [{
                    action_jump_id: comagicVaActionJump1,
                    priority: 0,
                    user_field_id: 2632367,
                    operator: '=',
                    value: 'wer123',
                    partner: 'amocrm',
                    id: comagicVaActionJumpCrmField1,
                    category: 'user_field',
                    entity: 'contacts'
                }, {
                    action_jump_id: comagicVaActionJump2,
                    priority: 0,
                    user_field_id: 2632367,
                    operator: '=',
                    value: 'qwe123',
                    partner: 'amocrm',
                    id: comagicVaActionJumpCrmField2,
                    category: 'user_field',
                    entity: 'leads'
                }, undefined];

                bodyParams.playlist.create = [{
                    id: comagicVaPlaylist1
                }, undefined];

                bodyParams.playlist_item.create = [{
                    media_file_id: 2035,
                    priority: 0,
                    playlist_id: comagicVaPlaylist1,
                    id: comagicVaPlaylistItem1
                }, undefined];

                return this;
            },
            updateCRMField: function () {
                bodyParams.action_jump_crm_field.update = [{
                    action_jump_id: 572858,
                    priority: 0,
                    operator: '=',
                    value: '1162712',
                    id: 271508,
                    partner: 'amocrm',
                    category: 'user_field',
                    user_field_id: 295656,
                    entity: 'leads'
                }, undefined];

                return this;
            },
            addingDistributionByCRMData: function () {
                bodyParams.action.create = [{
                    action_type_id: 74,
                    name: 'По данным из CRM 1',
                    scenario_id: 210948,
                    is_within_scenario: false,
                    id: comagicVaAction1            
                }, {
                    action_type_id: 4,
                    name: 'Меню 2',
                    scenario_id: 210948,
                    timeout: 5,
                    http_method: 'GET',
                    id: comagicVaAction2
                }, undefined];

                bodyParams.action_jump.create = [{
                    from_action_id: 218318,
                    to_action_id: comagicVaAction1,
                    return_code_id: 7,
                    id: comagicVaActionJump1            
                }, {
                    from_action_id: comagicVaAction1,
                    to_action_id: comagicVaAction2,
                    return_code_id: 124,
                    id: comagicVaActionJump2
                }, undefined];

                bodyParams.action_jump_crm_field.create = [{
                    action_jump_id: comagicVaActionJump2,
                    priority: 0,
                    operator: '=',
                    value: ['4530994'],
                    id: comagicVaActionJumpCrmField1,
                    partner: 'amocrm',
                    category: 'sales_funnel',
                    user_field_id: undefined,
                    entity: 'leads'
                }, undefined];

                this.voiceMail = function () {
                    bodyParams.action.create[1] = {
                        action_type_id: 7,
                        name: 'Голосовая почта 2',
                        scenario_id: 210948,
                        is_within_scenario: false,
                        id: comagicVaAction2,
                        playlist_id: comagicVaPlaylist1
                    };

                    bodyParams.action_jump_crm_field.create = [{
                        action_jump_id: comagicVaActionJump2,
                        priority: 0,
                        operator: '=',
                        value: 'wer234',
                        id: comagicVaActionJumpCrmField1,
                        partner: 'amocrm',
                        category: 'user_field',
                        user_field_id: 2632367,
                        entity: 'leads'
                    }, undefined];

                    bodyParams.playlist.create = [{
                        id: comagicVaPlaylist1
                    }, undefined];

                    bodyParams.playlist_item.create = [{
                        media_file_id: 2035,
                        priority: 0,
                        playlist_id: comagicVaPlaylist1,
                        id: comagicVaPlaylistItem1
                    }, undefined];

                    return this;
                };

                this.salesFunnelWithEntity = function () {
                    bodyParams.action_jump_crm_field.create[0].entity = 'leads';
                    return this;
                };

                return this;
            },
            addingSecondCrmField: function () {
                bodyParams.action.create = [{
                    action_type_id: 7,
                    name: 'Голосовая почта 2',
                    scenario_id: 210948,
                    is_within_scenario: false,
                    id: comagicVaAction1,
                    playlist_id: comagicVaPlaylist1
                }, undefined];

                bodyParams.action_jump.create = [{
                    from_action_id: 86392,
                    to_action_id: comagicVaAction1,
                    return_code_id: 125,
                    id: comagicVaActionJump1
                }, undefined];

                bodyParams.action_jump_crm_field.create = [{
                    action_jump_id: comagicVaActionJump1,
                    priority: 0,
                    operator: '=',
                    value: ['1162718'],
                    id: comagicVaActionJumpCrmField1,
                    partner: 'amocrm',
                    category: 'user_field',
                    user_field_id: 295656,
                    entity: 'leads'
                }, undefined];

                bodyParams.action_jump_crm_field.update = [{
                    action_jump_id: 572858,
                    priority: 0,
                    operator: '=',
                    value: ['4530994'],
                    id: 271508,
                    category: 'sales_funnel',
                    partner: 'amocrm',
                    user_field_id: null,
                    entity: 'leads'
                }, undefined];

                bodyParams.playlist.create = [{
                    id: comagicVaPlaylist1
                }, undefined];

                bodyParams.playlist_item.create = [{
                    media_file_id: 2035,
                    priority: 0,
                    playlist_id: comagicVaPlaylist1,
                    id: comagicVaPlaylistItem1
                }, undefined];

                return this;
            },
            addingSecondCrmFieldWhileOtherFieldHasEntity: function () {
                bodyParams.action.create = [{
                    action_type_id: 7,
                    name: 'Голосовая почта 2',
                    scenario_id: 210948,
                    is_within_scenario: false,
                    id: comagicVaAction1,
                    playlist_id: comagicVaPlaylist1
                }, undefined];

                bodyParams.action_jump.create = [{
                    from_action_id: 86392,
                    to_action_id: comagicVaAction1,
                    return_code_id: 125,
                    id: comagicVaActionJump1
                }, undefined];

                bodyParams.action_jump_crm_field.create = [{
                    action_jump_id: comagicVaActionJump1,
                    priority: 0,
                    operator: '=',
                    value: ['1162718'],
                    partner: 'amocrm',
                    id: comagicVaActionJumpCrmField1,
                    category: 'user_field',
                    user_field_id: 295656,
                    entity: undefined
                }, undefined];

                bodyParams.playlist.create = [{
                    id: comagicVaPlaylist1
                }, undefined];

                bodyParams.playlist_item.create = [{
                    media_file_id: 2035,
                    priority: 0,
                    playlist_id: comagicVaPlaylist1,
                    id: comagicVaPlaylistItem1
                }, undefined];

                return this;
            },
            addingSecondCrmFieldWithEntity: function () {
                bodyParams.action.create = [{
                    action_type_id: 7,
                    name: 'Голосовая почта 2',
                    scenario_id: 210948,
                    is_within_scenario: false,
                    id: comagicVaAction1,
                    playlist_id: comagicVaPlaylist1
                }, undefined];

                bodyParams.action_jump.create = [{
                    from_action_id: 86392,
                    to_action_id: comagicVaAction1,
                    return_code_id: 125,
                    id: comagicVaActionJump1
                }, undefined];

                bodyParams.action_jump_crm_field.create = [{
                    action_jump_id: comagicVaActionJump1,
                    priority: 0,
                    operator: '=',
                    value: 'UIS',
                    id: comagicVaActionJumpCrmField1,
                    partner: 'amocrm',
                    category: 'user_field',
                    user_field_id: 2632364,
                    entity: 'contacts'
                }, undefined];

                bodyParams.action_jump_crm_field.update = [{
                    action_jump_id: 572858,
                    priority: 0,
                    operator: '=',
                    value: ['4530994'],
                    id: 271508,
                    category: 'sales_funnel',
                    partner: 'amocrm',
                    user_field_id: null,
                    entity: 'leads'
                }, undefined];

                bodyParams.playlist.create = [{
                    id: comagicVaPlaylist1
                }, undefined];

                bodyParams.playlist_item.create = [{
                    media_file_id: 2035,
                    priority: 0,
                    playlist_id: comagicVaPlaylist1,
                    id: comagicVaPlaylistItem1
                }, undefined];

                return this;
            },
            addingSecondVoiceMail: function () {
                bodyParams.action.create = [{
                    action_type_id: 7,
                    name: 'Голосовая почта 3',
                    scenario_id: 210948,
                    is_within_scenario: false,
                    id: comagicVaAction1,
                    playlist_id: comagicVaPlaylist1
                }, undefined];
                
                bodyParams.action_jump.create = [{
                    from_action_id: 53729,
                    to_action_id: comagicVaAction1,
                    return_code_id: 7393,
                    id: comagicVaActionJump1
                }, undefined];

                bodyParams.playlist.create = [{
                    id: comagicVaPlaylist1
                }, undefined];

                bodyParams.playlist_item.create = [{
                    media_file_id: 2035,
                    priority: 0,
                    playlist_id: comagicVaPlaylist1,
                    id: comagicVaPlaylistItem1
                }, undefined];

                return this;
            },
            addProstprocessForApp59274: function () {
                bodyParams.action.create = [{
                    action_type_id: 13,
                    name: 'Метка звонка (постобработка) 1',
                    scenario_id: 210948,
                    is_within_scenario: false,
                    id: comagicVaAction1
                }, undefined];

                bodyParams.action_jump.create = [{
                    from_action_id: 569447,
                    to_action_id: comagicVaAction1,
                    return_code_id: 62,
                    id: comagicVaActionJump1
                }, undefined];

                return this;
            },
            expectToBeSent: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/services/ats__scenario/scenario/change/').
                    expectToHaveMethod('POST').
                    expectBodyToContain(bodyParams);
            }
        };
    };

    this.destroy = function() {
        controller.destroy();
    };
}
