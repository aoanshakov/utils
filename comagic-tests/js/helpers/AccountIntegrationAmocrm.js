tests.requireClass('Comagic.account.integration.amocrm.store.Record');
tests.requireClass('Comagic.account.integration.amocrm.store.EventsFilterRecords');
tests.requireClass('Comagic.account.integration.amocrm.store.AdditionalFields');
tests.requireClass('Comagic.account.integration.amocrm.store.ResponsibleUsers');
tests.requireClass('Comagic.account.integration.amocrm.store.Multifunnels');
tests.requireClass('Comagic.account.integration.amocrm.controller.Page');
tests.requireClass('Comagic.account.integration.common.UserSyncInfoBlock');

function AccountIntegrationAmocrm(args) {
    var requestsManager = args.requestsManager,
        testersFactory = args.testersFactory,
        utils = args.utils;

    AccountIntegrationAmocrm.makeOverrides = function () {
        Ext.define('Comagic.test.account.integration.amocrm.view.Page', {
            override: 'Comagic.account.integration.amocrm.view.Page',
            autoScroll: true
        });

        AccountIntegrationAmocrm.makeOverrides = Ext.emptyFn;
    };

    AccountIntegrationAmocrm.makeOverrides();

    var controller = Comagic.getApplication().getController('Comagic.account.integration.amocrm.controller.Page');

    this.actionIndex = function (args) {
        controller.init();
        controller.actionIndex(args);
    };

    this.destroy = function() {
        controller.destroy();
    };

    this.syncEmployeesRequest = function () {
        let queryParams = {
            ext_id: '30690958',
        };

        let response = {
            success: true,
            data: {
                user_sync_time: '2023-06-09.1234',
                user_sync_state: 'ok',
                user_sync_error: null,
            },
        };

        function addResponseModifiers (me) {
            me.noTime = function () {
                response.data.user_sync_time = null;
                return me;
            };
            
            me.sync = () => {
                response.data.user_sync_state = 'sync';
                return me;
            };

            me.failure = () => {
                response.success = false;
                response.data.user_sync_state = 'error';
                return me;
            };

            me.errorMessage = () => {
                me.failure();
                response.data.user_sync_error = '{"mnemonic":"some_error","message":"Некая ошибка произошла"}';
                return me;
            };

            return me;
        }

        return addResponseModifiers({
            expectToBeSent() {
                let request = requestsManager.recentRequest().
                    expectToHavePath('/account/integration/amocrm/sync_employees/').
                    expectQueryToContain(queryParams);

                return addResponseModifiers({
                    receiveResponse() {
                        request.respondSuccessfullyWith(response);
                    },
                });
            },

            receiveResponse() {
                return this.expectToBeSent().receiveResponse();
            },
        });
    };

    this.requestAmocrmDataSave = function () {
        var bodyParams = {
            id: 2987943
        };

        var data = getAmocrmData();

        return {
            notActive: function() {
                bodyParams.is_active = false;

                data.is_active = false;
                data.is_process_chat = false;
                data.is_only_first_chat = false;
                data.is_chat_integration_enabled = false;
                data.is_chat_integration_scenario_created = false;

                return this;
            },
            offlineMessageTemplatesChanged: function () {
                bodyParams.offline_message_contact_name_template =
                    'Новый контакт {{visitor_contact_info}} по заявке с сайта CoMagic';
                bodyParams.offline_message_lead_name_template =
                    'Новая заявка с сайта под номером {{communication_id}} из CoMagic';
                bodyParams.offline_message_task_name_template =
                    'Дать ответ на заявку с сайта под номером {{communication_id}} из CoMagic';

                return this;
            },
            chatTemplatesChanged: function () {
                bodyParams.chat_contact_name_template =
                    'Новый контакт {{visitor_contact_info}} по чату с сайта CoMagic';
                bodyParams.chat_lead_name_template =
                    'Новая заявка из чата под номером {{communication_id}} из CoMagic';
                bodyParams.chat_task_name_template =
                    'Дать ответ на сообщение в чате с сайта под номером {{communication_id}} из CoMagic';

                return this;
            },
            changeUrl: function () {
                bodyParams.url = 'https://petrov.amocrm.ru/';
                return this;
            },
            setIsAnywaySendTalkRecords: function () {
                bodyParams.is_anyway_send_talk_records = true;
                return this;
            },
            setSaleCategoryUserFieldValueIds: function () {
                bodyParams.sale_category_user_field_value_ids = ['495300', '495302', '495299', '495301', '495304'];
                return this;
            },
            setLossReasonUserFieldValueId: function () {
                bodyParams.loss_reason_user_field_value_ids = ['495299', '495303'];
                return this;
            },
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
            receiveResponse() {
                this.send();
            },
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/account/integration/amocrm/save/').
                    expectBodyToContain(bodyParams).
                    respondSuccessfullyWith({
                        success: true,
                        data,
                    });
            }
        };
    };

    this.amocrmSavingRequest = this.requestAmocrmDataSave;

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

    function getEntityNameTemplateNsParams () {
        return [{
            communication_type: 'offline_message',
            direction: null,
            entity: 'contact',
            params: [{
                name: 'Третий параметр',
                mnemonic: 'third_param',
                data_type: 'string',
                description: 'Описание третьего параметра',
                required_components: []
            }]
        }, {
            communication_type: 'offline_message',
            direction: null,
            entity: 'lead',
            params: [{
                name: 'Четвертый параметр',
                mnemonic: 'fourth_param',
                data_type: 'string',
                description: 'Описание четвертого параметра',
                required_components: []
            }]
        }, {
            communication_type: 'offline_message',
            direction: null,
            entity: 'task',
            params: [{
                name: 'Пятый параметр',
                mnemonic: 'five_param',
                data_type: 'string',
                description: 'Описание пятого параметра',
                required_components: []
            }]
        }, {
            communication_type: 'chat_finished',
            direction: null,
            entity: 'contact',
            params: [{
                name: 'Шестой параметр',
                mnemonic: 'sixth_param',
                data_type: 'string',
                description: 'Описание шестого параметра',
                required_components: []
            }]
        }];
    }

    this.entityNameTemplateNsParamsRequest = function () {
        return {
            receiveResponse: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/directory/comagic:amocrm:entity_name_template_ns_params/').
                    respondSuccessfullyWith({
                        success: true,
                        data: getEntityNameTemplateNsParams()
                    });
            }
        };
    };

    this.requestSelectMultiselectUserFields = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/directory/comagic:amocrm:select_multiselect_user_fields/').
                    respondSuccessfullyWith({
                        success: true,
                        data: [{
                            loss_reason: {
                                '495299': 'Первое поле для категорий и причин',
                                '495300': 'Второе поле для категорий и причин',
                                '495301': 'Третье поле для категорий и причин',
                                '495302': 'Четвертое поле для категорий и причин',
                                '495303': 'Пятое поле для категорий и причин',
                                '495304': 'Шестое поле для категорий и причин',
                                '495305': 'Седьмое поле для категорий и причин',
                                'unsuccessful_funnel_stages': 'Неуспешные стадии воронки'
                            },
                            sale_category: {
                                '495299': 'Первое поле для категорий и причин',
                                '495300': 'Второе поле для категорий и причин',
                                '495301': 'Третье поле для категорий и причин',
                                '495302': 'Четвертое поле для категорий и причин',
                                '495303': 'Пятое поле для категорий и причин',
                                '495304': 'Шестое поле для категорий и причин',
                                '495305': 'Седьмое поле для категорий и причин'
                            }
                        }] 
                    });
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
                            'comagic:amocrm:entity_name_template': [{
                                id: 'in_call_contact_name_template',
                                name: 'Некий шаблон'
                            }, {
                                id: 'in_call_lead_name_template',
                                name: 'Еще один шаблон'
                            }, {
                                id: 'in_call_task_name_template',
                                name: 'Удивительный шаблон'
                            }, {
                                id: 'out_call_contact_name_template',
                                name: 'Другой шаблон'
                            }, {
                                id: 'out_call_lead_name_template',
                                name: 'Совсем иной шаблон'
                            }, {
                                id: 'out_call_task_name_template',
                                name: 'Пугающий шаблон'
                            }, {
                                id: 'offline_message_contact_name_template',
                                name: 'Некий шаблон заявки для конткта'
                            }, {
                                id: 'offline_message_lead_name_template',
                                name: 'Некий шаблон заявки для лида'
                            }, {
                                id: 'offline_message_task_name_template',
                                name: 'Некий шаблон заявки для задачи'
                            }, {
                                id: 'chat_contact_name_template',
                                name: 'Некий шаблон чата для конткта'
                            }, {
                                id: 'chat_lead_name_template',
                                name: 'Некий шаблон чата для лида'
                            }, {
                                id: 'chat_task_name_template',
                                name: 'Некий шаблон чата для задачи'
                            }],
                            'comagic:amocrm:entity_name_template_ns_params': getEntityNameTemplateNsParams(),
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
                            }, {
                                mnemonic: 'chat_channel_name',
                                name: 'Название канала чата',
                                value_list_directory: 'comagic:consultant:chat_channel',
                                operator: 'sub',
                                description: 'Название канала чата'
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
                            }],
                            'comagic:consultant:chat_channel': [{
                                id: 250283,
                                name: 'Некий чат'
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
            first_in_call_act: 'contact',
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
                data.crm_record.offline_message_act = 'contact';
                return this;
            },
            setOfflineActUnsorted: function () {
                data.crm_record.offline_message_act = 'unsorted';
                return this;
            },
            setChatActContact: function () {
                data.crm_record.chat_act = 'contact';
                return this;
            },
            setChatActUnsorted: function () {
                data.crm_record.chat_act = 'unsorted';
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
            id: 2987943,
            ext_id: 30690958,
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

            user_sync_time: '2018-12-02T12:43:54.124824',
            user_sync_state: 'ok',
            user_sync_error: null,

            first_in_call_act: 'lead',
            first_out_call_act: 'lead',

            first_call_act: 'lead',
            secondary_call_act: 'lead',
            chat_act: 'lead_and_contact',
            offline_message_act: 'lead_and_contact',

            is_process_call: true,
            is_process_out_call: true,
            is_process_secondary_out_call: true,
            is_process_chat: true,
            is_only_first_chat: false,
            is_chat_integration_enabled: false,
            is_chat_integration_scenario_created: false,
            is_process_offline_message: true,

            secondary_call_interval: 72,
            url: 'https://ivanov.amocrm.ru/',
            is_active: true,
            login: 'ivanov',
            integration_status: true,
            organization_schedule_id: 9238,
            telephony_provider: 'uis_comagic',
            has_update_contact_on_call_finished_timeout: null,
            update_contact_on_call_finished_timeout: null,
            which_talked_user_responsible: 'last',
            is_anyway_send_talk_records: false,
            check_manager_online: true,
            responsible_manager_source: 'contact',
            deal_source_user_field_ext_id: null,
            sale_category_user_field_value_ids: [],
            loss_reason_user_field_value_ids: [],

            offline_message_contact_name_template: 'Новый контакт {{visitor_contact_info}} по заявке с сайта UIS',
            offline_message_lead_name_template: 'Новая заявка с сайта под номером {{communication_id}} из UIS',
            offline_message_task_name_template: 'Дать ответ на заявку с сайта под номером {{communication_id}}',

            chat_contact_name_template: 'Новый контакт {{visitor_contact_info}} по чату с сайта UIS',
            chat_lead_name_template: 'Новая заявка из чата под номером {{communication_id}} из UIS',
            chat_task_name_template: 'Дать ответ на сообщение в чате с сайта под номером {{communication_id}}'
        };
    }

    this.requestAmocrmData = function () {
        var data = getAmocrmData();

        function addResponseModifiers (me) {
            me.notActive = function() {
                data.is_active = false;

                data.is_active = false;
                data.is_process_chat = false;
                data.is_only_first_chat = false;
                data.is_chat_integration_enabled = false;
                data.is_chat_integration_scenario_created = false;

                return me;
            };

            me.allChatSettingsEnabled = function () {
                data.is_process_chat = true;
                data.is_only_first_chat = true;
                data.is_chat_integration_enabled = true;
                data.is_chat_integration_scenario_created = true;

                return me;
            };

            me.noChatTemplate = function () {
                data.chat_contact_name_template = null;
                data.chat_lead_name_template = null;
                data.chat_task_name_template = null;

                return me;
            };

            me.noOfflineMessageTemplate = function () {
                data.offline_message_contact_name_template = null;
                data.offline_message_lead_name_template = null;
                data.offline_message_task_name_template = null;

                return me;
            };

            me.setIsAnywaySendTalkRecords = function () {
                data.is_anyway_send_talk_records = true;
                return me;
            };

            me.setSaleCategories = function () {
                data.sale_category_user_field_value_ids = ['666', '495300', '495301'];
                return me;
            };

            me.setLossReasons = function () {
                data.loss_reason_user_field_value_ids = ['495299', '495302'];
                return me;
            };

            me.setOfflineActContact = function () {
                data.offline_message_act = 'contact';
                return me;
            };

            me.setOfflineActUnsorted = function () {
                data.offline_message_act = 'unsorted';
                return me;
            };

            me.setChatActContact = function () {
                data.chat_act = 'contact';
                return me;
            };

            me.setChatActUnsorted = function () {
                data.chat_act = 'unsorted';
                return me;
            };

            me.setFirstActManual = function () {
                data.first_call_act = 'manual';
                return me;
            };

            me.setUpdateContact = function () {
                data.has_update_contact_on_call_finished_timeout = true;
                return me;
            };

            me.set15MinutesContactUpdateTimout = function () {
                data.update_contact_on_call_finished_timeout = 15;
                return me;
            };

            me.setForwardingToResponsibleForContact = function () {
                data.responsible_manager_source = 'contact';
                return me;
            };

            me.setForwardingToResponsibleForDeal = function () {
                data.responsible_manager_source = 'lead';
                return me;
            };
            
            return me;
        }

        return addResponseModifiers({
            expectToBeSent: function () {
                var request = requestsManager.recentRequest().
                    expectToHavePath('/account/integration/amocrm/read/');

                return addResponseModifiers({
                    receiveResponse: function () {
                        request.respondSuccessfullyWith({
                            success: true,
                            data: data,
                        });
                    }
                });
            },
            receiveResponse: function () {
                this.expectToBeSent().receiveResponse();
            },
            send: function () {
                this.receiveResponse();
            }
        });
    };

    this.amocrmDataRequest = this.requestAmocrmData;

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
        return utils.getComponentByDomElement(Ext.fly(utils.findElementByTextContent(
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
        return testersFactory.createComboBoxTester(utils.getComponentByDomElement(
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

    this.activateMultifunnelsButton = testersFactory.createDomElementTester(function () {
        try {
            return utils.getVisible(utils.findElementsByTextContent(
                getVisibleTab(), 'Подключить Мультиворонки', '.x-btn-inner'));
        } catch (e) {
            return null;
        }
    });

    this.boundList = testersFactory.createDomElementTester(function () {
        return utils.getVisible(document.querySelectorAll('.x-boundlist'));
    });

    this.switchButton = function (text) {
        return testersFactory.createDomElementTester(
            utils.descendantOfBody().
                textContains(text).
                matchesSelector('.x-form-type-switchbox').
                find().
                querySelector('.x-form-field')
        );
    };

    this.button = function (text) {
        return testersFactory.
            createDomElementTester(utils.descendantOfBody().textEquals(text).matchesSelector('.x-btn').find());
    };

    this.grid = (function () {
        var tester = testersFactory.createDomElementTester(function () {;
            return utils.getVisibleSilently(document.querySelectorAll('.x-grid'));
        });

        return tester;
    })();

    this.row = function (label) {
        var tr = utils.descendantOfBody().textEquals(label).matchesSelector('.x-component').find().closest('tr');

        return {
            column: function (index) {
                var td = tr.querySelectorAll('td')[index] || new JsTester_NoElement();

                return {
                    combobox: function () {
                        return testersFactory.createComboBoxTester(utils.getComponentByDomElement(
                            td.querySelector('.x-field')
                        ));
                    }
                };
            }
        };
    };

    function addTesters (tester, getDomElement) {
        tester.textarea = {
            withLabel: function (expectedLabel) {
                return testersFactory.createTextFieldTester(function () {
                    return utils.descendantOf(getDomElement()).
                        matchesSelector('.x-component').
                        textEquals(expectedLabel).
                        find().
                        closest('.x-container').
                        querySelector('textarea')
                });
            }
        };

        tester.checkbox = {
            withBoxLabel: function (expectedLabel) {
                return testersFactory.createCheckboxTester(utils.getComponentByDomElement(
                    utils.descendantOf(getDomElement()).
                        matchesSelector('.x-form-cb-label').
                        textEquals(expectedLabel).
                        find().
                        closest('.x-container').
                        querySelector('.x-form-type-checkbox')
                ), expectedLabel)
            }
        };

        var disabledClassName = 'x-item-disabled';

        tester.expectToBeEnabled = function () {
            tester.expectNotToHaveClass(disabledClassName);
        };

        tester.expectToBeDisabled = function () {
            tester.expectToHaveClass(disabledClassName);
        };

        tester.plusIcon = testersFactory.createDomElementTester(function () {
            return getDomElement().querySelector('.ul-btn-usual-icon-cls-plus');
        });

        Object.defineProperty(tester, 'container', {
            get: function () {
                return {
                    withLabel: function (expectedLabel) {
                        function getContainerElement () {
                            return utils.descendantOf(getDomElement()).
                                textEquals(expectedLabel).
                                matchesSelector('.ul-label, .x-component').
                                find().
                                closest('.x-container');
                        }

                        return addTesters(
                            testersFactory.createDomElementTester(getContainerElement),
                            getContainerElement
                        );
                    }
                };
            }
        });     

        return tester;
    }

    addTesters(this, function () {
        return document.body;
    });

    this.body = testersFactory.createDomElementTester(function () {
        return document.body;
    });

    this.userSyncStatusTextOk = testersFactory.createDomElementTester(function () {
        return document.querySelector('.user-sync-status-text-ok');
    });

    this.userSyncStatusTextError = testersFactory.createDomElementTester(function () {
        return document.querySelector('.user-sync-status-text-error');
    });

    this.userSyncErrorIcon = testersFactory.createDomElementTester(function () {
        return document.querySelector('.cm-grid-cell-warning-icon');
    });

    this.userSyncWarningIcon = testersFactory.createDomElementTester(function () {
        return document.querySelector('.user-no-telephony-warning-icon img');
    });

    this.messageBox = testersFactory.createDomElementTester(function () {
        return document.querySelector('.x-window');
    });

    this.label = function (expectedLabel) {
        return testersFactory.createDomElementTester(function () {
            return utils.descendantOfBody().
                textEquals(expectedLabel).
                matchesSelector('label').
                find()
        });
    };
}
