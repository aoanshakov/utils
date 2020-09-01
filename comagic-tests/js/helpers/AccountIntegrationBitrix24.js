tests.requireClass('Comagic.account.integration.bitrix24.store.ResponsibleUsers');
tests.requireClass('Comagic.account.integration.bitrix24.store.EventsFilterRecords');
tests.requireClass('Comagic.account.integration.bitrix24.store.AdditionalFields');
tests.requireClass('Comagic.account.integration.bitrix24.store.Record');
tests.requireClass('Comagic.account.integration.bitrix24.controller.Page');

function AccountIntegrationBitrix24(requestsManager, testersFactory, utils) {
    AccountIntegrationBitrix24.makeOverrides = function () {
        Ext.define('Comagic.test.account.integration.bitrix24.view.Page', {
            override: 'Comagic.account.integration.bitrix24.view.Page',
            autoScroll: true
        });

        AccountIntegrationBitrix24.makeOverrides = Ext.emptyFn;
    };

    AccountIntegrationBitrix24.makeOverrides();

    var controller = Comagic.getApplication().getController('Comagic.account.integration.bitrix24.controller.Page');

    this.actionIndex = function () {
        controller.init();
        controller.actionIndex();
    };

    this.destroy = function() {
        controller.destroy();
    };

    function getBitrixData () {
        return {
            id: 83782,
            app_id: 917847,
            is_active: true,
            url: 'http://somedomain.com',
            client_endpoint: 'otherdomain.com',
            server_endpoint: 'completelydifferentdomain.com',
            access_token_ts: 1565940569,
            access_token: '24937851083',
            refresh_token: 3600,
            bitrix_app_state: 'active',
            user_sync_time: 1565940570,
            user_sync_state: 'inactive',
            user_sync_error: 'null',
            components: 'bitrix24',
            call_responsible_user_id: 37293,
            is_in_call_auto_lead: true,
            is_out_call_auto_lead: false,
            is_process_click_to_call: true,
            is_redefine_click_to_call: false,
            click_to_call_num_capacity_id: 82817,
            which_talked_user_responsible: 928174,
            is_openline_used_for_lost_call: true,
            is_transfer_talks: false,
            is_source_numb_transmission: true,
            is_process_call: false,
            telephony_provider: true,
            has_update_contact_on_call_finished_timeout: false,
            update_contact_on_call_finished_timeout: 3630,
            is_enable_callback: true,
            callback_num_capacity_id: 23847,
            is_process_chat_without_contacts: false,
            is_chat_act_notify: true,
            is_process_first_chat: true,
            first_chat_act: 'dosomething',
            is_process_not_first_chat: true,
            not_first_chat_act: 'donothing',
            is_offline_message_act_notify: true,
            not_first_offline_message_assign_to_manager: false,
            is_process_first_offline_message: true,
            first_offline_message_act: 'dootherthing',
            is_process_not_first_offline_message: true,
            not_first_offline_message_act: 'donothing',
            is_process_chat: true,
            is_process_offline_message: true,
            is_import_deal: true,
            link_deal_to_communication: 'something',
            sale_category_user_field_value_id: [],
            loss_reason_user_field_value_id: [],
            last_import_deal_date: '2018-02-12',
            last_import_deal_result: 'ok',
            admin_user_name: 'Ivanov Ivan Ivanovich',
            is_deals_import_legacy_mode: true,
            is_hide_sales_funnels_banner: false,
            deal_conversion_model: 'somemodel',
            deal_conversion_goals: [8722],
            deal_funnel_active: true,
            in_call_responsible_user_id: 29185,
            out_call_responsible_user_id: 68293,
            offline_message_responsible_user_id: 73062,
            chat_responsible_user_id: 18544
        };
    }

    this.requestTariffs = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('account/tariffs/').
                    respondSuccessfullyWith({
                        success: true,
                        data: {
                            available: [{
                                op_id: 3234234
                            }],
                            activated: []
                        }
                    });
            }
        };
    };

    this.requestSalesFunnels = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/account/integration/sales_funnels_quick/bitrix/read/').
                    expectToHaveMethod('GET').
                    respondSuccessfullyWith({
                        success: true,
                        data: [{
                            id: 1049,
                            name: 'Какая-то воронка'
                        }]
                    });
            }
        };
    };

    this.requestAdditionalFields = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/account/integration/additional_fields/bitrix/read/').
                    expectToHaveMethod('GET').
                    respondSuccessfullyWith({
                        success: true,
                        data: [{
                            id: 2973,
                            user_field_id: 9284,
                            name: 'Некое поле',
                            value_template: 'this_field',
                            is_active: true,
                            is_update_not_null: false
                        }]
                    });
            }
        };
    };

    this.requestResponsibleUsers = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/account/integration/responsible_users/bitrix24/read/').
                    respondSuccessfullyWith({
                        success: true,
                        data: {
                            id: 354,
                            is_filtering: true,
                            crm_record: getBitrixData(),
                            in_call_filters: [{
                                user_id: 9382,
                                user_name: 'ivanov',
                                priority: 3,
                                condition_group: [{
                                    id: 322828
                                }, {
                                    id: 897298
                                }],
                                profile: {
                                    in_call_responsible_user_ext_id: 57820
                                }
                            }],
                            out_call_filters: {
                                user_id: 82835,
                                user_name: 'petrov',
                                priority: 2,
                                condition_group: [{
                                    id: 284566
                                }, {
                                    id: 897298
                                }],
                                profile: {
                                    out_call_responsible_user_ext_id: 275065
                                }
                            },
                            offline_message_filters: {
                                user_id: 28545,
                                user_name: 'andreev',
                                priority: 4,
                                condition_group: [{
                                    id: 756023
                                }, {
                                    id: 628406
                                }],
                                profile: {
                                    offline_message_responsible_user_ext_id: 38962
                                }
                            },
                            chat_filters: {
                                user_id: 59842,
                                user_name: 'servgeev',
                                priority: 4,
                                condition_group: [{
                                    id: 428392
                                }, {
                                    id: 184521
                                }],
                                profile: {
                                    chat_responsible_user_ext_id: 19856
                                }
                            }
                        }
                    });
            }
        };
    };

    this.requestBitrix24Status = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/account/integration/bitrix24/status/').
                    expectQueryToContain({
                        access_token: '24937851083',
                        domain: 'otherdomain.com'
                    }).
                    respondSuccessfullyWith({
                        success: true,
                        data: {
                            success: true,
                            data: {
                                result: true
                            }
                        }
                    });
            }
        };
    };

    this.requestSalesFunnelComponentTariffInfo = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/account/integration/get_sales_funnel_component_tariff_info/').
                    respondSuccessfullyWith({
                        success: true,
                        data: {
                            user_charge: 152.32
                        }
                    });
            }
        };
    };

    this.requestSalesFunnelComponentAvailability = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/account/integration/is_available_sales_funnel_component_in_tariff/').
                    respondSuccessfullyWith({
                        success: true,
                        data: {
                            is_available_sales_funnel_component_in_tariff: true
                        }
                    });
            }
        };
    };

    function getDirectories () {
        return {
            'comagic:bitrix:user': [{
                id: 68293,
                ext_id: 57820,
                name: 'Иванов Иван Иванович'
            }, {
                id: 29185,
                ext_id: 275065,
                name: 'Пертов Петр Петрович'
            }, {
                id: 18544,
                ext_id: 38962,
                name: 'Андреев Андрей Андреевич'
            }, {
                id: 73062,
                ext_id: 19856,
                name: 'Сергеев Сергей Сергеевич'
            }],
            'comagic:bitrix:link_deal_to_communication': [{
                description: 'Some link',
                mnemonic: 'somelink'
            }],
            'comagic:bitrix:telephony_provider': [{
                description_short: 'Мобильные ТелеСистемы',
                valueField: 'mts',
            }],
            'comagic:public:click_to_call_vnumber': [{
                vnumber: 79161234567,
                num_capacity_id: 23483
            }],
            'comagic:bitrix:first_chat_and_offline_message_act': [{
                description_short: 'Do anything',
                mnemonic: 'doanything'
            }, {
                description_short: 'Do other thing',
                mnemonic: 'dootherthing'
            }, {
                description_short: 'Do something',
                mnemonic: 'dosomething'
            }],
            'comagic:bitrix:not_first_chat_and_offline_message_act': [{
                description_short: 'Do nothing',
                mnemonic: 'donothing'
            }],
            'comagic:_tree:goals_by_site': [{
                id: 2938,
                name: 'somesite.com',
                leaf: false,
                data: [{
                    id: 8722,
                    name: 'Некая цель',
                    site_id: 2938,
                    leaf: true,
                    data: []
                }, {
                    id: 8723,
                    name: 'Другая цель',
                    site_id: 2938,
                    leaf: true,
                    data: []
                }]
            }],
            'comagic:bitrix:user_field': [{
                user_field_id: 9284,
                name: 'Некое поле'
            }, {
                user_field_id: 9285,
                name: 'Другое поле'
            }, {
                user_field_id: 9286,
                name: 'Больше полей'
            }],
            'comagic:bitrix:user_field_event_params': [{
                id: 8193,
                name: 'Это поле',
                description: 'Это замечательное поле',
                mnemonic: 'this_field'
            }],
            'comagic:bitrix:select_multiselect_user_fields': [{
                id: 495299,
                name: 'Первое поле для категорий и причин'
            }, {
                id: 495300,
                name: 'Второе поле для категорий и причин'
            }, {
                id: 495301,
                name: 'Третье поле для категорий и причин'
            }, {
                id: 495302,
                name: 'Четвертое поле для категорий и причин'
            }, {
                id: 495303,
                name: 'Пятое поле для категорий и причин'
            }, {
                id: 495304,
                name: 'Шестое поле для категорий и причин'
            }, {
                id: 495305,
                name: 'Седьмое поле для категорий и причин'
            }]
        };
    }

    this.requestUserFieldDirectory = function () {
        return {
            send: function () {
                return requestsManager.recentRequest().
                    expectToHavePath('/directory/comagic:bitrix:user_field/').
                    respondSuccessfullyWith({
                        success: true,
                        data: getDirectories()['comagic:bitrix:user_field']
                    });
            }
        };
    };

    this.batchReloadRequest = function () {
        var response = {
            success: true,
            data: getDirectories() 
        };

        return {
            addManyUsers: function () {
                var users = [];

                [
                    'Ларичев Рюрик Евстафиевич',
                    'Цызырева Зинаида Антониновна',
                    'Карявин Афанасий Сидорович',
                    'Рудин Никифор Афанасиевич',
                    'Эсаулова Валерия Иосифовна',
                    'Суслов Арсений Тихонович',
                    'Ныркова Нина Якововна',
                    'Мигунов Данила Аполлинариевич',
                    'Данильцин Мир Ильевич',
                    'Мальчиков Прокофий Кириллович',
                    'Деменока Юлия Захаровна',
                    'Менде Раиса Кузьмевна',
                    'Мишина Полина Всеволодовна',
                    'Александрова Владлена Давидовна',
                    'Азаренкова Таисия Георгиевна',
                    'Иванова Инна Михеевна',
                    'Игнатьев Соломон Валериевич',
                    'Шашлова Юнона Афанасиевна',
                    'Якимовский Андрон Самуилович',
                    'Чемоданов Михей Александрович',
                    'Бершова Кира Ильевна',
                    'Ануфриева Майя Глебовна',
                    'Ямалтдинова Мирослава Антониновна',
                    'Кривонос Федор Еремеевич',
                    'Можаев Игнатий Семенович',
                    'Кидин Данила Фролович',
                    'Ясевича Роза Анатолиевна',
                    'Коржаев Юлий Онисимович',
                    'Быстров Соломон Онуфриевич',
                    'Тимашев Сократ Аполлинариевич',
                    'Русинов Мир Прохорович',
                    'Щередина Марина Михеевна',
                    'Мажулин Захар Сидорович',
                    'Грачёв Тарас Давыдович',
                    'Васин Елизар Иосифович',
                    'Ямбаев Зиновий Казимирович'
                ].forEach(function (name) {
                    users.push({
                        id: Math.round(Math.random() * 8291843),
                        ext_id: Math.round(Math.random() * 8291843),
                        name: name
                    });
                });

                response.data['comagic:bitrix:user'] = response.data['comagic:bitrix:user'].concat(users);
                return this;
            },
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/directory/batch_reload/').
                    expectToHaveMethod('POST').
                    respondSuccessfullyWith(response);
            }
        };
    };

    this.requestBitrix24DataSave = function () {
        var bodyParams = {
            id: 83782
        };

        return {
            setSaleCategoryUserFieldValueIds: function () {
                bodyParams.sale_category_user_field_value_id = [495300, 495302];
                return this;
            },
            setLossReasonUserFieldValueId: function () {
                bodyParams.loss_reason_user_field_value_id = [495299, 495303];
                return this;
            },
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/account/integration/bitrix24/save/').
                    expectBodyToContain(bodyParams).
                    respondSuccessfullyWith({
                        success: true,
                        data: true
                    });
            }
        };
    };

    this.requestBitrix24Data = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/account/integration/bitrix24/read/').
                    respondSuccessfullyWith({
                        success: true,
                        data: [getBitrixData()]
                    });
            }
        };
    };

    this.requestResponsibleUsersSaving = function () {
        var bodyParams = {
            in_call_filters: [{
                profile: {
                    in_call_responsible_user_ext_id: 38962
                }
            }]
        };

        return {
            setOfflineMessageResponsible: function () {
                bodyParams = {
                    offline_message_filters: [{
                        profile: {
                            offline_message_responsible_user_ext_id: 19856
                        }
                    }]
                };

                return this;
            },
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/account/integration/responsible_users/bitrix24/save/').
                    expectBodyToContain(bodyParams).
                    respondSuccessfullyWith({
                        root: {
                            id: 1784,
                            name: 'Some region',
                            help_text: 'Some help text',
                            leaf: false,
                            children: [{
                                id: 273,
                                name: 'Other region',
                                help_text: 'Other help text',
                                leaf: true,
                                children: []
                            }]
                        }
                    });
            }
        };
    };

    this.requestRegionsTreeDirectory = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/directory/comagic:_tree:regions/').
                    respondSuccessfullyWith({
                        success: true,
                        root: {
                            id: 1784,
                            name: 'Some region',
                            help_text: 'Some help text',
                            leaf: false,
                            children: [{
                                id: 273,
                                name: 'Other region',
                                help_text: 'Other help text',
                                leaf: true,
                                children: []
                            }]
                        }
                    });
            }
        };
    };

    function getTabPanel () {
        return Comagic.getApplication().findComponent('tabpanel panel[title="Доступ к данным"]').up('tabpanel');
    }

    this.tabPanel = testersFactory.createTabPanelTester(getTabPanel);

    this.addEmployeeButton = testersFactory.createComponentTester(function () {
        return Comagic.getApplication().findComponent('button[text="Добавить сотрудника"]');
    });

    function getVisibleTab () {
        return getTabPanel().items.findBy(function (tab) {
            return utils.isVisible(tab);
        });
    }

    this.form = testersFactory.createFormTester(getVisibleTab);

    this.saveButton = testersFactory.createButtonTester(function () {
        return utils.getComponentFromDomElement(utils.getVisible(utils.findElementsByTextContent(document.body,
            'Сохранить', '.x-btn')));
    });

    this.innerTab = function (title) {
        return testersFactory.createButtonTester(function () {
            return getVisibleTab().down('button[text="' + title + '"]');
        });
    };
}
