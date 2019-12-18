tests.requireClass('ULib.ux.data.TreeComboStore');
tests.requireClass('Comagic.account.integration.amocrm.store.Record');
tests.requireClass('Comagic.account.integration.amocrm.store.EventsFilterRecords');
tests.requireClass('Comagic.account.integration.amocrm.store.AdditionalFields');
tests.requireClass('Comagic.account.integration.amocrm.store.ResponsibleUsers');
tests.requireClass('Comagic.account.integration.amocrm.store.Multifunnels');
tests.requireClass('Comagic.account.integration.amocrm.controller.Page');

function AccountIntegrationAmocrm(requestsManager, testersFactory, utils) {
    AccountIntegrationAmocrm.makeOverrides = function () {
        Ext.define('Comagic.test.account.integration.amocrm.view.Page', {
            override: 'Comagic.account.integration.amocrm.view.Page',
            autoScroll: true
        });

        AccountIntegrationAmocrm.makeOverrides = Ext.emptyFn;
    };

    AccountIntegrationAmocrm.makeOverrides();

    var controller = Comagic.getApplication().getController('Comagic.account.integration.amocrm.controller.Page');

    this.actionIndex = function () {
        controller.init();
        controller.actionIndex();
    };

    this.destroy = function() {
        controller.destroy();
    };

    this.requestAmocrmDataSave = function () {
        var bodyParams = {};

        return {
            setFirstActManual: function () {
                bodyParams.first_call_act = 'manual';
                return this;
            },
            setConfiguredOutCallResponsible: function () {
                bodyParams.out_call_responsible = 'configured_responsible';
                return this;
            },
            setNotUpdateContact: function () {
                bodyParams.has_update_contact_on_call_finished_timeout = false;
                return this;
            },
            setUpdateContact: function () {
                bodyParams.has_update_contact_on_call_finished_timeout = true;
                return this;
            },
            setNoContactUpdateTimout: function () {
                bodyParams.update_contact_on_call_finished_timeout = 0;
                return this;
            },
            set5MinutesContactUpdateTimout: function () {
                bodyParams.update_contact_on_call_finished_timeout = 5;
                return this;
            },
            set15MinutesContactUpdateTimout: function () {
                bodyParams.update_contact_on_call_finished_timeout = 15;
                return this;
            },
            setForwardingToResponsibleForContact: function () {
                bodyParams.responsible_manager_source = 'contact';
                return this;
            },
            setForwardingToResponsibleForDeal: function () {
                bodyParams.responsible_manager_source = 'lead';
                return this;
            },
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/account/integration/amocrm/save/').
                    expectBodyToContain(bodyParams).
                    respondSuccessfullyWith({
                        success: true,
                        data: true
                    });
            }
        };
    };

    this.requestResponsibleUsersSaving = function () {
        var bodyParams = {
            in_call_filters: [{
                profile: {
                    in_call_responsible_user_ext_id: 9214
                }
            }] 
        };

        return {
            setOfflineMessageResponsible: function () {
                bodyParams = {
                    offline_message_filters: [{
                        profile: {
                            offline_message_responsible_user_ext_id: 8492
                        }
                    }] 
                };

                return this;
            },
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/account/integration/responsible_users/amocrm/save/').
                    expectBodyToContain(bodyParams).
                    respondSuccessfullyWith({
                        success: true,
                        data: true
                    });
            }
        };
    };

    this.requestSalesFunnels = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/account/integration/sales_funnels_quick/amocrm/read/').
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
                    expectToHavePath('/account/integration/additional_fields/amocrm/read/').
                    expectToHaveMethod('GET').
                    respondSuccessfullyWith({
                        success: true,
                        data: [{
                            id: 2973,
                            user_field_id: 2845,
                            name: 'Некое поле',
                            event_param: 'this_field',
                            is_active: true,
                            is_update_not_null: false
                        }]
                    });
            }
        };
    };

    this.requestSalesFunnelStatus = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/directory/comagic:amocrm:sales_funnel_status/').
                    expectToHaveMethod('GET').
                    respondSuccessfullyWith({
                        success: true,
                        data: getSalesFunnelStatuses()
                    });
            },
        };
    };

    this.requestUserFields = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/directory/comagic:_tree:amocrm_user_fields/').
                    expectToHaveMethod('GET').
                    respondSuccessfullyWith({
                        success: true,
                        data: {
                            id: 2845,
                            name: 'Какое-то поле',
                            leaf: false,
                            data: [{
                                id: 2149,
                                name: 'Другое поле',
                                leaf: true,
                                data: []
                            }]
                        }
                    });
            },
        };
    };

    function getSalesFunnels () {
        return [{
            id: 4719,
            name: 'Некая воронка'
        }, {
            id: 7271,
            name: 'Другая воронка'
        }, {
            id: 8175,
            name: 'Еще одна воронка'
        }, {
            id: 7186,
            name: 'И еще одна воронка'
        }, {
            id: 9285,
            name: 'Придется добавить еще одну воронку'
        }, {
            id: 1854,
            name: 'И даже еще одну последнюю воронку'
        }, {
            id: 1748,
            name: 'Нет, все же не последнюю'
        }, {
            id: 9028,
            name: 'Ну эта уже точно последняя'
        }, {
            id: 9286,
            name: 'Воронка для чатов'
        }];
    }

    function getSalesFunnelStatuses () {
        return [{
            id: 7185,
            funnel_id: 4719,
            name: 'Некий статус'
        }, {
            id: 1947,
            funnel_id: 4719,
            name: 'Иной статус'
        }, {
            id: 1958,
            funnel_id: 7271,
            name: 'Другой статус'
        }, {
            id: 9174,
            funnel_id: 8175,
            name: 'Еще один статус'
        }, {
            id: 8195,
            funnel_id: 7186,
            name: 'И еще один статус'
        }, {
            id: 9278,
            funnel_id: 9285,
            name: 'Похоже, что нам нужен еще один статус'
        }, {
            id: 3818,
            funnel_id: 1854,
            name: 'И даже еще один статус'
        }, {
            id: 7523,
            funnel_id: 1748,
            name: 'Нужно больше статусов'
        }, {
            id: 8205,
            funnel_id: 9028,
            name: 'Пришлось добавить этот статус'
        }, {
            id: 92857,
            funnel_id: 9286,
            name: 'Статус для чатов'
        }];
    }

    this.requestSalesFunnel = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/directory/comagic:amocrm:sales_funnel/').
                    expectToHaveMethod('GET').
                    respondSuccessfullyWith({
                        success: true,
                        data: getSalesFunnels()
                    });
            },
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
                            'comagic:amocrm:user_field_event_params': [{
                                id: 8193,
                                name: 'Это поле',
                                description: 'Это замечательное поле',
                                mnemonic: 'this_field'
                            }],
                            'comagic:_tree:amocrm_user_fields': {
                                data: {
                                    id: 2845,
                                    name: 'Какое-то поле',
                                    leaf: false,
                                    data: [{
                                        id: 2149,
                                        name: 'Другое поле',
                                        leaf: true,
                                        data: []
                                    }]
                                }
                            },
                            'comagic:_tree:goals_by_site': {
                                root: {
                                    id: 281,
                                    name: 'Некая цель',
                                    leaf: false,
                                    children: [{
                                        id: 1842,
                                        name: 'Другая цель внутри некой цели',
                                        leaf: true,
                                        children: []
                                    }]
                                }
                            },
                            'comagic:_tree:regions': {
                                root: {
                                    id: 1784,
                                    name: 'Некий регион',
                                    help_text: 'Это некий регион',
                                    leaf: false,
                                    children: [{
                                        id: 273,
                                        name: 'Другой регион',
                                        help_text: 'Это другой регион',
                                        leaf: true,
                                        children: []
                                    }]
                                }
                            },
                            'comagic:amocrm:tag_tokens': [{
                                mnemonic: 'tag11',
                                description_short: 'Тэг номер одиннадцать'
                            }],
                            'comagic:amocrm:organization_schedule': [{
                                id: 9238,
                                name: 'Некое расписание'
                            }],
                            'comagic:amocrm:telephony_provider': [{
                                description_short: 'Некий провайдер',
                                mnemonic: 'some_provider'
                            }, {
                                description_short: 'UIS/Comagic',
                                mnemonic: 'uis_comagic'
                            }],
                            'comagic:amocrm:in_call_lost_task_target': [{
                                description_short: 'Некая цель пропущенного входящего звонка',
                                mnemonic: 'some_target'
                            }],
                            'comagic:amocrm:out_call_lost_task_target': [{
                                description_short: 'Некая цель пропущенного исходящего звонка',
                                mnemonic: 'other_target'
                            }],
                            'comagic:amocrm:sale_amount_field': [{
                                name: 'Стоимость чего-то',
                                value: 'some_source:some_code'
                            }],
                            'comagic:amocrm:offline_message_task_target': [{
                                description_short: 'Некая цель сообщения',
                                mnemonic: 'some_message_target'
                            }],
                            'comagic:amocrm:chat_lost_task_target': [{
                                description_short: 'Некая цель чата',
                                mnemonic: 'some_chat_target'
                            }],
                            'comagic:amocrm:sales_funnel': getSalesFunnels(),
                            'comagic:amocrm:sales_funnel_status': getSalesFunnelStatuses(),
                            'comagic:amocrm:in_call_profile_condition_event_param': [{
                                mnemonic: 'some_param',
                                name: 'Некий параметр'
                            }],
                            'comagic:amocrm:out_call_profile_condition_event_param': [{
                                description: 'Виртуальный номер. Для входящих вызовов - номер, на который позвонил ' +
                                    'абонент. Для исходящих вызовов - номер, который будет определяться у контакта.',
                                mnemonic: 'virtual_phone_number',
                                name: 'Виртуальный номер',
                                operator: 'sub',
                                value_list_directory: 'comagic:public:number_capacity_with_common'
                            }],
                            'comagic:amocrm:offline_message_profile_condition_event_param': [{
                                mnemonic: 'new_param',
                                name: 'Новый параметр'
                            }],
                            'comagic:amocrm:chat_profile_condition_event_param': [{
                                mnemonic: 'different_param',
                                name: 'Иной параметр'
                            }],
                            'comagic:amocrm:task_duration': [{
                                id: 9384,
                                name: 'Некий срок'
                            }],
                            'comagic:amocrm:responsible_user': [{
                                id: 8382,
                                ext_id: 3928,
                                name: 'Ганева Дора'
                            }, {
                                id: 9185,
                                ext_id: 8492,
                                name: 'Танчева Наталия'
                            }, {
                                id: 8295,
                                ext_id: 8257,
                                name: 'Дишева Албена'
                            }, {
                                id: 8217,
                                ext_id: 9214,
                                name: 'Нацева Гина'
                            }],
                            'comagic:public:click_to_call_vnumber': [{
                                num_capacity_id: 8319,
                                vnumber: 79162837542
                            }],
                            'comagic:public:number_capacity_with_common': [{
                                id: '74959759581',
                                is_service: false,
                                name: '74959759581'
                            }]
                        }
                    });
            }
        };
    };

    this.requestEventFilters = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/account/integration/events_filter_records/amocrm/read/').
                    respondSuccessfullyWith({
                        success: true,
                        data: [{
                            id: 3208,
                            in_call_filters: [{
                                condition_group: [{
                                    id: 34719,
                                    condition: [{
                                        id: 2918,
                                        param_mnemonic: 'some_param',
                                        condition_operator: 'sub',
                                        value: 'some_value',
                                        is_negative: false
                                    }]
                                }]
                            }],
                            out_call_filters: [{
                                condition_group: [{
                                    id: 1048,
                                    condition: [{
                                        id: 1845,
                                        param_mnemonic: 'other_param',
                                        condition_operator: 'sub',
                                        value: 'other_value',
                                        is_negative: false
                                    }]
                                }]
                            }],
                            chat_filters: [{
                                condition_group: [{
                                    id: 9175,
                                    condition: [{
                                        id: 8735,
                                        param_mnemonic: 'different_param',
                                        condition_operator: 'sub',
                                        value: 'different_value',
                                        is_negative: false
                                    }]
                                }]
                            }],
                            offline_message_filters: [{
                                condition_group: [{
                                    id: 8784,
                                    condition: [{
                                        id: 1755,
                                        param_mnemonic: 'new_param',
                                        condition_operator: 'sub',
                                        value: 'new_value',
                                        is_negative: false
                                    }]
                                }]
                            }]
                        }]
                    });
            }
        };
    };

    this.requestResponsibles = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/account/integration/responsible_users/amocrm/read/').
                    respondSuccessfullyWith({
                        success: true,
                        data: [{
                            id: 3208,
                            crm_record: getAmocrmData(),
                            in_call_filters: [{
                                user_id: 8274,
                                user_name: 'Ivanov Ivan Ivanovich',
                                priority: 2,
                                profile: {
                                    in_call_responsible_user_ext_id: 8492
                                },
                                condition_group: [{
                                    id: 34719,
                                    condition: [{
                                        id: 2918,
                                        param_mnemonic: 'some_param',
                                        condition_operator: 'sub',
                                        value: 'some_value',
                                        is_negative: false
                                    }]
                                }]
                            }],
                            out_call_filters: [{
                                user_id: 2948,
                                user_name: 'Petrov Petr Petrovich',
                                priority: 3,
                                profile: {
                                    out_call_responsible_user_ext_id: 3928
                                },
                                condition_group: [{
                                    id: 1048,
                                    condition: [{
                                        id: 1845,
                                        param_mnemonic: 'other_param',
                                        condition_operator: 'sub',
                                        value: 'other_value',
                                        is_negative: false
                                    }]
                                }]
                            }],
                            chat_filters: [{
                                user_id: 8174,
                                user_name: 'Petrov Petr Petrovich',
                                priority: 4,
                                profile: {
                                    chat_responsible_user_ext_id: 9214
                                },
                                condition_group: [{
                                    id: 9175,
                                    condition: [{
                                        id: 8735,
                                        param_mnemonic: 'different_param',
                                        condition_operator: 'sub',
                                        value: 'different_value',
                                        is_negative: false
                                    }]
                                }]
                            }],
                            offline_message_filters: [{
                                user_id: 1742,
                                user_name: 'Petrov Petr Petrovich',
                                priority: 5,
                                profile: {
                                    offline_message_responsible_user_ext_id: 8257
                                },
                                condition_group: [{
                                    id: 8784,
                                    condition: [{
                                        id: 1755,
                                        param_mnemonic: 'new_param',
                                        condition_operator: 'sub',
                                        value: 'new_value',
                                        is_negative: false
                                    }]
                                }]
                            }]
                        }]
                    });
            }
        };
    };

    this.requestMultiFunnelsSaving = function () {
        var bodyParams = {
            out_call_filters: [{
                profile: {}
            }]
        };

        return {
            changeOutgoingSalesFunnel: function () {
                bodyParams.out_call_filters[0].profile.sales_funnel_id = 1748;
                return this;
            },
            changeOutgoingSalesFunnelStatus: function () {
                bodyParams.out_call_filters[0].profile.sales_funnel_status_id = 7523;
                return this;
            },
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/account/integration/multifunnels/amocrm/save/').
                    expectToHaveMethod('POST').
                    expectBodyToContain(bodyParams).
                    respondSuccessfullyWith({
                        success: true,
                        data: true
                    });
            }
        };
    };

    this.requestMultiFunnels = function () {
        var data = {
            id: 3208,
            crm_record: getAmocrmData(),
            in_call_filters: [{
                user_id: 8274,
                user_name: 'Ivanov Ivan Ivanovich',
                priority: 2,
                profile: {
                    sales_funnel_id: 4719,
                    sales_funnel_status_id: 7185
                },
                condition_group: [{
                    id: 34719,
                    condition: [{
                        id: 2918,
                        param_mnemonic: 'some_param',
                        condition_operator: 'sub',
                        value: 'some_value',
                        is_negative: false
                    }]
                }]
            }],
            out_call_filters: [{
                user_id: 2948,
                user_name: 'Petrov Petr Petrovich',
                priority: 3,
                profile: {
                    sales_funnel_id: 7271,
                    sales_funnel_status_id: 1958
                },
                condition_group: [{
                    id: 1048,
                    condition: [{
                        id: 1845,
                        param_mnemonic: 'other_param',
                        condition_operator: 'sub',
                        value: 'other_value',
                        is_negative: false
                    }]
                }]
            }],
            chat_filters: [{
                user_id: 8174,
                user_name: 'Petrov Petr Petrovich',
                priority: 4,
                profile: {
                    sales_funnel_id: 8175,
                    sales_funnel_status_id: 9174
                },
                condition_group: [{
                    id: 9175,
                    condition: [{
                        id: 8735,
                        param_mnemonic: 'different_param',
                        condition_operator: 'sub',
                        value: 'different_value',
                        is_negative: false
                    }]
                }]
            }],
            offline_message_filters: [{
                user_id: 1742,
                user_name: 'Petrov Petr Petrovich',
                priority: 5,
                profile: {
                    sales_funnel_id: 7186,
                    sales_funnel_status_id: 8195
                },
                condition_group: [{
                    id: 8784,
                    condition: [{
                        id: 1755,
                        param_mnemonic: 'new_param',
                        condition_operator: 'sub',
                        value: 'new_value',
                        is_negative: false
                    }]
                }]
            }]
        };

        return {
            setOfflineActContact: function () {
                data.offline_message_act = 'contact';
                return this;
            },
            setOfflineActUnsorted: function () {
                data.offline_message_act = 'unsorted';
                return this;
            },
            setChatActContact: function () {
                data.chat_act = 'contact';
                return this;
            },
            setChatActUnsorted: function () {
                data.chat_act = 'unsorted';
                return this;
            },
            setFirstActManual: function () {
                data.crm_record.first_call_act = 'manual';
                return this;
            },
            setFirstActUnsorted: function () {
                data.crm_record.first_call_act = 'unsorted';
                return this;
            },
            setSecondaryActNoAction: function () {
                data.crm_record.secondary_call_act = 'no_action';
                return this;
            },
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/account/integration/multifunnels/amocrm/read/').
                    respondSuccessfullyWith({
                        success: true,
                        data: [data]
                    });
            }
        };
    };

    this.requestSyncSalesFunnel = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/account/integration/amocrm/sync_sales_funnels/').
                    respondSuccessfullyWith({
                        success: true,
                        data: {
                            success: true
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

    function getAmocrmData () {
        return {
            sale_amount_field_source: 'some_source',
            sale_amount_field_code: 'some_code',
            is_retrieve_success_lead: true,
            in_call_sales_funnel_id: 9285,
            in_call_sales_funnel_status_id: 9278,
            out_call_sales_funnel_id: 1854,
            out_call_sales_funnel_status_id: 3818,
            in_call_responsible_user_id: 8382,
            out_call_responsible_user_id: 9185,
            chat_sales_funnel_id: 9286,
            chat_sales_funnel_status_id: 92857,
            offline_message_responsible_user_id: 8217,
            chat_responsible_user_id: 8295,
            is_out_call_lost_auto_task: true,
            is_call_lost_use_employee_schedule: true,
            call_lost_task_duration_id: 9384,
            out_call_responsible: 'caller',
            click_to_call_num_capacity_id: 8319,
            is_redefine_click_to_call: true,
            out_call_lost_task_target: 'other_target',
            success_call_tags: ['Тэг1', 'Тэг2'],
            in_call_lost_task_target: 'some_target',
            is_in_call_lost_auto_task: true,
            lost_call_tags: ['Тэг3', 'Тэг4'],
            offline_message_tags: ['Тэг5', 'Тэг6'],
            success_chat_tags: ['Тэг7', 'Тэг8'],
            lost_chat_tags: ['Тэг9', 'Тэг10'],
            sync_time: '2018-12-02T12:43:54.124824',
            sync_state: 'ok',
            sync_error: null,

            first_call_act: 'lead',
            secondary_call_act: 'lead',
            chat_act: 'lead_and_contact',
            offline_message_act: 'lead_and_contact',

            is_process_call: true,
            is_process_out_call: true,
            is_process_secondary_out_call: true,
            is_process_chat: true,
            is_process_offline_message: true,

            secondary_call_interval: 72,
            url: 'https://ivanov.amocrm.ru/',
            is_active: true,
            login: 'ivanov',
            integration_status: true,
            hash: '2gf98FWf92ffwffOIJSp8108OLdfs89332FdfsflSDHP81',
            organization_schedule_id: 9238,
            telephony_provider: 'uis_comagic',
            has_update_contact_on_call_finished_timeout: null,
            update_contact_on_call_finished_timeout: null,
            which_talked_user_responsible: 'last',
            check_manager_online: true,
            responsible_manager_source: null
        };
    }

    this.requestAmocrmData = function () {
        var data = getAmocrmData();

        return {
            setOfflineActContact: function () {
                data.offline_message_act = 'contact';
                return this;
            },
            setOfflineActUnsorted: function () {
                data.offline_message_act = 'unsorted';
                return this;
            },
            setChatActContact: function () {
                data.chat_act = 'contact';
                return this;
            },
            setChatActUnsorted: function () {
                data.chat_act = 'unsorted';
                return this;
            },
            setFirstActManual: function () {
                data.first_call_act = 'manual';
                return this;
            },
            setUpdateContact: function () {
                data.has_update_contact_on_call_finished_timeout = true;
                return this;
            },
            set15MinutesContactUpdateTimout: function () {
                data.update_contact_on_call_finished_timeout = 15;
                return this;
            },
            setForwardingToResponsibleForContact: function () {
                data.responsible_manager_source = 'contact';
                return this;
            },
            setForwardingToResponsibleForDeal: function () {
                data.responsible_manager_source = 'lead';
                return this;
            },
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/account/integration/amocrm/read/').
                    respondSuccessfullyWith({
                        success: true,
                        data: data
                    });
            }
        };
    };
    this.requestAmocrmStatus = function () {
        var data = {
            success: true,
            data: {
                unsorted_on: 'N'
            }
        };

        return {
            setUnsortedEnabled: function () {
                data.data.unsorted_on = 'Y';
                return this;
            },
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/account/integration/amocrm_status/').
                    respondSuccessfullyWith({
                        success: true,
                        data: data 
                    });
            }
        };
    };

    this.tabPanel = testersFactory.createTabPanelTester(function () {
        return Comagic.application.findComponent('tabpanel');
    });

    function getVisibleTab () {
        return Comagic.application.findComponent('tabpanel').items.findBy(function (tab) {
            return utils.isVisible(tab);
        });
    }

    this.innerTab = function (title) {
        return testersFactory.createButtonTester(function () {
            return getVisibleTab().down('button[text="' + title + '"]');
        });
    };

    this.form = testersFactory.createFormTester(function () {
        return getVisibleTab();
    });

    this.chatsProcessingForm = testersFactory.createFormTester(function () {
        return utils.getComponentFromDomElement(Ext.fly(utils.findElementByTextContent(
            Comagic.application.findComponent('tabpanel').child(
                'panel[title="Чаты и заявки"]'
            ).el.dom, 'Работа с чатами', 'label'
        )).up('.x-container'));
    });

    this.goalsLabel = testersFactory.createDomElementTester(function () {
        return utils.findElementByTextContent(Comagic.application.findComponent('tabpanel').child(
            'panel[title="Воронки продаж"]'
        ), 'Цели для связи рекламной кампании со сделкой', 'label');
    });

    this.banner = testersFactory.createDomElementTester(function () {
        return Ext.fly(utils.findElementByTextContent(
            Comagic.application.findComponent('tabpanel').child(
                'panel[title="Воронки продаж"]'
            ), 'Вы успешно подключили передачу воронок из AmoCRM.', 'label'
        )).up('.x-container').dom;
    });

    this.saveButton = testersFactory.createButtonTester(function () {
        return Comagic.application.findComponents('button[text="Сохранить"]').find(function (button) {
            return button.el && button.el.dom && utils.isVisible(button.el.dom);
        });
    });

    this.addFunnelButton = testersFactory.createButtonTester(function () {
        return Comagic.application.findComponents('button[text="Добавить воронку"]').find(function (button) {
            return button.el && button.el.dom && utils.isVisible(button.el.dom);
        });
    });

    this.updateContactOnCallFinishedTimeoutCombobox = function () {
        return testersFactory.createComboBoxTester(utils.getComponentFromDomElement(
            utils.findElementByTextContent(
                getVisibleTab(),
                'После завершения звонка обновлять ответственного сотрудника через', '.x-component'
            ).closest('.x-box-target').querySelector('.x-field')
        ));
    };

    this.listItem = function (text) {
        return testersFactory.createDomElementTester(utils.getVisible(
            utils.findElementsByTextContent(document.body, text, '.x-boundlist-item')
        ));
    };

    this.unsortedRadioField = function () {
        return testersFactory.createRadioFieldTester(getVisibleTab().down(
            'radiofield[boxLabel="Использовать функциональность \\"Неразобранное\\""]'
        ));
    };

    this.incomingCallsMessage = testersFactory.createDomElementTester(function () {
        return utils.findElementByTextContent(getVisibleTab(), function (textContent) {
            return textContent.includes('Активировать эти опции нужно в вкладке "Телефония"');
        }, '.x-component');
    });

    this.outboundCallsMessage = testersFactory.createDomElementTester(function () {
        return utils.findElementByTextContent(getVisibleTab(), function (textContent) {
            return textContent.includes('Активировать эти опции для исходящих звонков нужно в вкладке "Телефония"');
        }, '.x-component');
    });

    this.chatsMessage = testersFactory.createDomElementTester(function () {
        return utils.findElementByTextContent(getVisibleTab(), function (textContent) {
            return textContent.includes(
                'Активировать эти опции для чатов нужно в вкладке "Чаты и заявки" - "Работа с чатами"'
            );
        }, '.x-component');
    });

    this.offlineMessage = testersFactory.createDomElementTester(function () {
        return utils.findElementByTextContent(getVisibleTab(), function (textContent) {
            return textContent.includes(
                'Активировать эти опции для офлайн заявок нужно в вкладке "Чаты и заявки" - "Работа с офлайн заявками"'
            );
        }, '.x-component');
    });

    this.noMultiFunnelsForUnsortedMessage = testersFactory.createDomElementTester(function () {
        return utils.findElementByTextContent(getVisibleTab(), function (textContent) {
            return textContent.includes(
                'Для способа обработки "Использовать функциональность Неразобранное" мультиворонки не работают'
            );
        }, '.x-component');
    });
}
