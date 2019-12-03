tests.requireClass('Comagic.services.ats.scenario.store.CallMarkerTypes');
tests.requireClass('Comagic.services.ats.scenario.store.ReturnCodes');
tests.requireClass('Comagic.services.ats.scenario.store.ActionTypes');
tests.requireClass('Comagic.services.ats.scenario.store.Record');
tests.requireClass('Comagic.services.ats.scenario.controller.EditPage');

function ServicesAtsScenario(requestsManager, testersFactory, utils) {
    var controller = Comagic.getApplication().getController('Comagic.services.ats.scenario.controller.EditPage');

    this.actionIndex = function (data) {
        controller.init();
        controller.actionIndex({
            siteId: 1234
        }, data);
    };

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
                var elements = document.querySelectorAll('.scenario-tree-container .action-name'),
                    length = elements.length,
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
                
                return testersFactory.createDomElementTester(validElements[expectedIndex]);
            }
        };
    };

    this.batchReloadRequest = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/directory/batch_reload/').
                    expectToHaveMethod('POST').
                    respondSuccessfullyWith({
                        success: true,
                        data: {
                            'comagic:staff:phones_in_employee': [{
                                id: 3829,
                                name: '79451234567',
                                aux_id: 2384
                            }],
                            'comagic:staff:employee': [{
                                id: 23483,
                                name: 'Ivanov Ivan Ivanovich'
                            }]
                        }
                    });
            }
        };
    };

    this.requestScenario = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/services/ats__scenario/scenario/read/scenario/104561/').
                    respondSuccessfullyWith({
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
                                'is_tag_call', 'url', 'is_auto_connect', 'queue_playlist_id', 'is_use_numb_as_numa',
                                'timeout', 'forward_call_base', 'access_code', 'calls_stat_interval',
                                'is_within_scenario', 'calls_stat_levels'
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
                                'is_failed_calls_include', 'action_id', 'forward_call_rule', 'lines_start', 'percent',
                                'group_phones', 'priority', 'staff_group_id', {
                                    name: 'id',
                                    primary_key: true
                                }, 'increment', 'forward_call_base', 'is_incremental_dialing', 'calls_stat_interval',
                                'increment_timeout', 'lines_limit', 'calls_stat_levels'
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
                            action_jump_region: [],
                            scenario: [{
                                first_action_id: 218318,
                                app_id: 4735,
                                id: 104561,
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
                                scenario_id: 104561,
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
                                scenario_id: 104561,
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
                    });
            }
        };
    };

    this.requestMarkersTypes = function () {
        return {
            send: function () {
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

    this.requestReturnCodes = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/services/ats__scenario/return_codes/read/').
                    respondSuccessfullyWith({
                        success: true,
                        data: [{
                            action_type_id: 4,
                            code: '4',
                            description: null,
                            id: 7,
                            is_postprocess: false,
                            name: 'Клавиша 4',
                            priority: 4
                        }]
                    });
            }
        };
    };

    this.requestActionTypes = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/services/ats__scenario/action_types/read/').
                    respondSuccessfullyWith({
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
                        }]
                    });
            }
        };
    };

    this.destroy = function() {
        controller.destroy();
    };
}
