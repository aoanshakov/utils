define(() => function ({
    testersFactory,
    utils,
    ajax,
    fetch,
    spendTime
}) {
    let history;

    window.application.run({
        setHistory: value => (history = value)
    });

    Promise.runAll(false, true);
    spendTime(0);

    return {
        body: testersFactory.createDomElementTester('body'),

        operatorAccountRequest: () => ({
            receiveResponse() {
                ajax.recentRequest().
                    expectPathToContain('/logic/operator').
                    expectToHaveMethod('POST').
                    expectBodyToContain({
                        method: 'get_account',
                        params: {}
                    }).
                    respondSuccessfullyWith({
                        result: {
                            data: {
                                app_id: 1103,
                                app_state: 'active',
                                app_name: 'Карадимова Веска Анастасовна',
                                is_agent_app: false,
                                customer_id: 183510,
                                user_id: 151557,
                                employee_id: 728405,
                                user_type: 'user',
                                user_login: 'karadimova',
                                user_name: 'karadimova',
                                tp_id: 406,
                                tp_name: 'Comagic Enterprise',
                                crm_type: 'e2e_analytics',
                                lang: 'ru',
                                project: 'comagic',
                                timezone: 'Europe/Moscow',
                                permissions: [{
                                    'unit_id': 'call_recordings',
                                    'is_delete': true,
                                    'is_insert': false,
                                    'is_select': true,
                                    'is_update': true,
                                }, {
                                    'unit_id': 'tag_management',
                                    'is_delete': true,
                                    'is_insert': true,
                                    'is_select': true,
                                    'is_update': true,
                                }]
                            }
                        }
                    });

                Promise.runAll(false, true);
                spendTime(0)
                Promise.runAll(false, true);
            }
        }),

        operatorListRequest: () => ({
            receiveResponse() {
                ajax.recentRequest().
                    expectPathToContain('/logic/operator/list').
                    expectToHaveMethod('GET').
                    respondSuccessfullyWith({
                        result: {
                            data: [{
                                id: 48274,
                                full_name: 'Терзиева Сийка Петковна',
                                status_id: 1,
                                photo_link: null
                            }]
                        }
                    });

                Promise.runAll(false, true);
                spendTime(0)
                Promise.runAll(false, true);
            }
        }),

        operatorStatusListRequest: () => ({
            receiveResponse() {
                ajax.recentRequest().
                    expectPathToContain('/logic/operator/status/list').
                    expectToHaveMethod('GET').
                    respondSuccessfullyWith({
                        result: {
                            data: [{
                                id: 1,
                                is_worktime: true,
                                mnemonic: 'available',
                                name: 'Доступен',
                                is_select_allowed: true,
                                description: 'все вызовы',
                                color: '#48b882',
                                icon_mnemonic: 'tick',
                                is_auto_out_calls_ready: true,
                                is_deleted: false,
                                in_external_allowed_call_directions: [
                                    'in',
                                    'out'
                                ],
                                in_internal_allowed_call_directions: [
                                    'in',
                                    'out'
                                ],
                                out_external_allowed_call_directions: [
                                    'in',
                                    'out'
                                ],
                                out_internal_allowed_call_directions: [
                                    'in',
                                    'out'
                                ],
                                allowed_phone_protocols: [
                                    'SIP'
                                ],
                            }, {
                                id: 2,
                                is_worktime: true,
                                mnemonic: 'break',
                                name: 'Перерыв',
                                is_select_allowed: true,
                                description: 'временное отключение',
                                color: '#1179ad',
                                icon_mnemonic: 'pause',
                                is_auto_out_calls_ready: true,
                                is_deleted: false,
                                in_external_allowed_call_directions: [],
                                in_internal_allowed_call_directions: [],
                                out_external_allowed_call_directions: [],
                                out_internal_allowed_call_directions: [],
                                allowed_phone_protocols: [
                                    'SIP'
                                ],
                            }, {
                                id: 3,
                                is_worktime: true,
                                mnemonic: 'do_not_disturb',
                                name: 'Не беспокоить',
                                is_select_allowed: true,
                                icon_mnemonic: 'minus',
                                description: 'только исходящие',
                                color: '#cc5d35',
                                is_auto_out_calls_ready: true,
                                is_deleted: false,
                                in_external_allowed_call_directions: [],
                                in_internal_allowed_call_directions: [],
                                out_external_allowed_call_directions: [],
                                out_internal_allowed_call_directions: []
                            }, {
                                id: 4,
                                is_worktime: true,
                                mnemonic: 'not_at_workplace',
                                name: 'Нет на месте',
                                is_select_allowed: true,
                                description: 'все вызовы на мобильном',
                                color: '#ebb03b',
                                icon_mnemonic: 'time',
                                is_auto_out_calls_ready: true,
                                is_deleted: false,
                                in_external_allowed_call_directions: [
                                    'in',
                                    'out'
                                ],
                                in_internal_allowed_call_directions: [
                                    'in',
                                    'out'
                                ],
                                out_external_allowed_call_directions: [
                                    'in',
                                    'out'
                                ],
                                out_internal_allowed_call_directions: [
                                    'in',
                                    'out'
                                ],
                                allowed_phone_protocols: [
                                    'SIP'
                                ]
                            }, {
                                id: 5,
                                is_worktime: false,
                                mnemonic: 'not_at_work',
                                name: 'Нет на работе',
                                is_select_allowed: true,
                                description: 'полное отключение',
                                color: '#99acb7',
                                icon_mnemonic: 'cross',
                                is_auto_out_calls_ready: true,
                                is_deleted: false,
                                in_external_allowed_call_directions: [],
                                in_internal_allowed_call_directions: [],
                                out_external_allowed_call_directions: [],
                                out_internal_allowed_call_directions: []
                            }, {
                                id: 6,
                                is_worktime: false,
                                mnemonic: 'unknown',
                                name: 'Неизвестно',
                                is_select_allowed: false,
                                icon_mnemonic: 'unknown',
                                color: null,
                                is_auto_out_calls_ready: true,
                                is_deleted: false,
                                in_external_allowed_call_directions: [
                                    'in',
                                    'out'
                                ],
                                in_internal_allowed_call_directions: [
                                    'in',
                                    'out'
                                ],
                                out_external_allowed_call_directions: [
                                    'in',
                                    'out'
                                ],
                                out_internal_allowed_call_directions: [
                                    'in',
                                    'out'
                                ],
                                allowed_phone_protocols: [
                                    'SIP'
                                ]
                            }]
                        }
                    });

                Promise.runAll(false, true);
                spendTime(0)
                Promise.runAll(false, true);
            }
        }),

        configRequest: () => ({
            receiveResponse: () => {
                fetch.recentRequest().expectPathToContain('/config.json').respondSuccessfullyWith(JSON.stringify({
                    REACT_APP_BASE_URL: 'https://lobarev.dev.uis.st/logic/operator',
                    REACT_APP_AUTH_URL: 'https://dev-dataapi.uis.st/va0/auth/json_rpc',
                    REACT_APP_WS_URL: 'wss://lobarev.dev.uis.st/ws',
                    REACT_APP_LOCALE: 'ru'
                }));

                Promise.runAll(false, true);
                spendTime(0)
                Promise.runAll(false, true);
            }
        }),

        reportTableRequest: () => {
            const params = {
                report_type: 'ad_analytics',
                dimensions: ['campaign_name', undefined],
                limit: 10,
                offset: 0,
                columns: ['cc_5', undefined],
                sort: [{
                    field: 'cc_5',
                    order: 'desc'
                }, undefined],
                filter: {
                    filters: [{
                        field: 'name',
                        operator: '==',
                        value: 'Некое имя'
                    }, {
                        field: 'description',
                        operator: '==',
                        value: 'Некое описание'
                    }, {
                        field: 'campaign_name',
                        operator: 'is_not_null',
                        value: null
                    }, undefined],
                    condition: 'and'
                },
                columns_filter: {
                    field: 'cc_5',
                    operator: '>',
                    value: 0
                },
                date_from: '2020-10-01 15:23:05',
                date_till: '2020-11-02 14:26:02',
                perspective_window: 180
            };

            const setColumn = column => {
                params.columns[0] = column;
                params.sort[0].field = column;
                params.columns_filter.field = column;
            };

            const setDimension = column => {
                params.dimensions[0] = column;
                params.filter.filters[2].field = column;
            };

            let response = {
                result: {
                    data: {
                        date_from: '2020-10-01 15:23:05',
                        date_till: '2020-11-02 14:26:02',
                        rows: [{
                            key: 'some_key',
                            dimension: {
                                value: 'Некое значение',
                                value_id: 'some_dimension_id',
                            },
                            columns: ['name'],
                            compared_columns: ['description'],
                            loaded: true,
                            expandable: false,
                            expanded: false,
                            isLoadMoreRecordsBtn: [false],
                            children: []
                        }],
                    }
                }
            };

            const addResponseModifiers = me => {
                me.accessTokenExpired = () => {
                    response = {
                        error: {
                            code: 401,
                            message: 'Время действия токена истекло',
                            request: null,
                            data: {
                                mnemonic: 'access_token_expired',
                                field: '',
                                value: '',
                                params: null
                            }
                        }
                    };

                    return me;
                };

                return me;
            };

            const headers = {
                Authorization: 'Bearer 2j4gds8911fdpu20310v1ldfaqwr0QPOeW1313nvpqew',
                'X-Auth-Type': 'jwt'
            };

            const request = addResponseModifiers({
                anotherColumn: () => (setColumn('cc_10'), request),
                thirdColumn: () => (setColumn('cc_15'), request),
                visitorRegion: () => (setDimension('visitor_region'), request),

                anotherAuthoriationToken: () =>
                    ((headers.Authorization = 'Bearer 935jhw5klatxx2582jh5zrlq38hglq43o9jlrg8j3lqj8jf'), request),

                expectToBeSent: () => {
                    const request = ajax.recentRequest().
                        expectBodyToContain({
                            method: 'getobj.report_table',
                            params
                        }).expectToHaveHeaders(headers);

                    return addResponseModifiers({
                        receiveResponse() {
                            request.respondSuccessfullyWith(response);

                            Promise.runAll(false, true);
                            spendTime(0)
                            Promise.runAll(false, true);
                        }
                    });
                },

                receiveResponse: () => request.expectToBeSent().receiveResponse()
            });

            return request;
        },

        communicationsRequest: () => {
            const params = {
                date_from: '2020-10-01 15:23:05',
                date_till: '2020-11-02 14:26:02',
                report_id: 0,
                limit: 1,
                offset: 0,
                filter: {
                    filters: [{
                        field: 'name',
                        operator: '==',
                        value: 'Некое имя'
                    }, {
                        field: 'description',
                        operator: '==',
                        value: 'Некое описание'
                    }, {
                        filters: [{
                            field: 'communication_type',
                            operator: '=',
                            value: 'Звонки',
                        }, {
                            field: 'communication_type',
                            operator: '=',
                            value: 'Заявки',
                        }, {
                            field: 'communication_type',
                            operator: '=',
                            value: 'Чаты',
                        }],
                        condition: 'or'
                    }],
                    condition: 'and'
                }
            };

            const request = {
                anotherDate: () => {
                    params.date_from = '2020-08-30 15:23:05';
                    params.date_till = '2020-10-01 14:26:02';
                    return request;
                },

                receiveResponse() {
                    ajax.recentRequest().
                        expectBodyToContain({
                            method: 'get.communications',
                            params
                        }).
                        respondSuccessfullyWith({
                            result: {
                                data: {
                                    data: [{
                                        site_domain_name: null,
                                        communication_id: null,
                                        communication_date_time: null,
                                        communication_kinds: null,
                                        communication_page_url: null,
                                        communication_number: null,
                                        contact_full_name: null,
                                        total_duration: null,
                                        employees: null,
                                        campaign_name: null,
                                        channel: null,
                                        source: null,
                                        referrer: null,
                                        referrer_domain: null,
                                        search_query: null,
                                        eq_utm_source: null,
                                        eq_utm_medium: null,
                                        eq_utm_term: null,
                                        eq_utm_content: null,
                                        eq_utm_campaign: null,
                                        eq_utm_referrer: null,
                                        eq_utm_expid: null,
                                        utm_source: null,
                                        utm_medium: null,
                                        utm_term: null,
                                        utm_content: null,
                                        utm_campaign: null,
                                        utm_referrer: null,
                                        utm_expid: null,
                                        openstat_ad: null,
                                        openstat_campaign: null,
                                        openstat_service: null,
                                        openstat_source: null,
                                        ef_id: null,
                                        yclid: null,
                                        gclid: null,
                                        cm_id: null,
                                        ymclid: null,
                                        tag_from: null,
                                        visitor_country: null,
                                        visitor_region: null,
                                        visitor_city: null,
                                        visitor_provider: null,
                                        visitor_ip_address: null,
                                        visitor_browser_name: null,
                                        visitor_browser_version: null,
                                        visitor_os_name: null,
                                        visitor_os_version: null,
                                        visitor_language: null,
                                        visitor_screen: null,
                                        visitor_session_id: null,
                                        entrance_page: null,
                                        visitor_id: null,
                                        ua_client_id: null,
                                        ym_client_id: null,
                                        segments: null,
                                        visit_date: null,
                                        visit_year: null,
                                        call_region_name: null,
                                        call_records: null,
                                        offline_message_email: null,
                                        offline_message_text: null,
                                        chat_messages_count: null,
                                        goal_name: null,
                                        deals: null,
                                        visitor_phone_numbers: null,
                                        visitor_emails: null,
                                        virtual_phone_number: null,
                                        chat_status: null,
                                        site_name: null,
                                        number_pool_name: null,
                                        offline_message_form_name: null
                                    }],
                                    metadata: {
                                        total_items: 1
                                    }
                                }
                            }
                        });

                    Promise.runAll(false, true);
                    spendTime(0)
                    Promise.runAll(false, true);
                }
            };

            return request;
        },

        reportTotalRequest: () => {
            const params = {
                date_from: '2020-10-01 15:23:05',
                date_till: '2020-11-02 14:26:02',
                perspective_window: 180,
                report_type: 'deals_analytics',
                columns: ['cf_26', undefined],
                filter: {
                    filters: [{
                        field: 'name',
                        operator: '==',
                        value: 'Некое имя'
                    }, {
                        field: 'description',
                        operator: '==',
                        value: 'Некое описание'
                    }],
                    condition: 'and'
                }
            };

            const request = {
                adAnalytics: () => ((params.report_type = 'ad_analytics'), request),

                anotherDate: () => {
                    params.date_from = '2020-08-30 15:23:05';
                    params.date_till = '2020-10-01 14:26:02';
                    return request;
                },

                anotherColumn: () => ((params.columns[0] = 'cc_25'), request),
                thirdColumn: () => ((params.columns[0] = 'cc_26'), request),
                fourthColumn: () => ((params.columns[0] = 'cc_27'), request),
                fifthColumn: () => ((params.columns[0] = 'cc_6'), request),
                sixthColumn: () => ((params.columns[0] = 'cf_29'), request),
                seventhColumn: () => ((params.columns[0] = 'cc_15'), request),
                eighthColumn: () => ((params.columns[0] = 'cc_20'), request),
                ninthColumn: () => ((params.columns[0] = 'cc_10'), request),
                tenthColumn: () => ((params.columns[0] = 'cf_19'), request),
                eleventhColumn: () => ((params.columns[0] = 'cc_5'), request),
                twelvethColumn: () => ((params.columns[0] = 'cf_13'), request),
                thirtinthColumn: () => ((params.columns[0] = 'cc_17'), request),

                receiveResponse() {
                    ajax.recentRequest().
                        expectBodyToContain({
                            method: 'getobj.report_total',
                            params
                        }).
                        respondSuccessfullyWith({
                            result: {
                                data: {
                                    date_from: '2020-09-02 16:23:05',
                                    date_till: '2020-08-06 14:28:02',
                                    totals: [285024],
                                    compared_totals: [285027],
                                }
                            }
                        });

                    Promise.runAll(false, true);
                    spendTime(0)
                    Promise.runAll(false, true);
                }
            };

            return request;
        },

        reportRapidFiltersRequest: () => ({
            receiveResponse() {
                ajax.recentRequest().
                    expectBodyToContain({
                        method: 'get.report_rapid_filters',
                        params: {
                            report_type: 'marketer_dashboard'
                        }
                    }).
                    respondSuccessfullyWith({
                        result: {
                            data: [{
                                id: 'some_filter',
                                name: 'Некий фильтр',
                                description: 'Описание некого фильтра',
                                format: 'some_format',
                                operators: [{
                                    id: 'some_operator',
                                    name: 'Некий оператор',
                                    is_default: false
                                }],
                                values: []
                            }]
                        }
                    });

                Promise.runAll(false, true);
                spendTime(0)
                Promise.runAll(false, true);
            }
        }),

        reportStateRequest: () => ({
            receiveResponse() {
                ajax.recentRequest().
                    expectBodyToContain({
                        method: 'getobj.report_state',
                        params: {
                            report_id: 582729
                        }
                    }).
                    respondSuccessfullyWith({
                        result: {
                            data: {
                                limit: 50,
                                offset: 0,
                                date_from: '2020-10-01 15:23:05',
                                date_till: '2020-11-02 14:26:02',
                                compared_date_from: '2020-12-03 13:24:53',
                                compared_date_till: '2020-13-04 12:22:52',
                                perspective_window: 180,
                                dimensions: [],
                                columns: [],
                                filter: {
                                    field: 'name',
                                    operator: '==',
                                    value: 'Некое имя',
                                    filters: [],
                                    condition: 'and',
                                },
                                rapid_filter: {
                                    field: 'description',
                                    operator: '==',
                                    value: 'Некое описание',
                                    filters: [],
                                    condition: 'and',
                                },
                                sort: [{
                                    field: 'name',
                                    order: 'asc'
                                }],
                                column_params: {
                                    name: {
                                        width: 200,
                                        filter: {
                                            field: 'name',
                                            operator: '==',
                                            value: 'Некое имя',
                                            filters: [],
                                            condition: 'and',
                                        }
                                    }
                                },
                                main_column: 'name',
                                additional_column: 'description',
                                checked_dimensions: [{
                                    key: 'some_key',
                                    dimension_id: 'some_dimension',
                                    dimension_value: 'some_dimension_value',
                                    dimension_value_id: 'some_dimension_id',
                                    pos: 0,
                                }],
                                is_chart_visible: true,
                                isGrouping: false,
                                goal_ids: [282572],
                                chart_id: 'line',
                                datetime_dimension: 'day'
                            }
                        }
                    });

                Promise.runAll(false, true);
                spendTime(0)
                Promise.runAll(false, true);
            }
        }),

        reportTypesRequest: () => ({
            receiveResponse() {
                ajax.recentRequest().
                    expectBodyToContain({
                        method: 'get.report_types',
                        params: {}
                    }).
                    respondSuccessfullyWith({
                        result: {
                            data: [{
                                id: 'marketer_dashboard',
                                name: 'Некий тип отчета',
                                configuration: 'dashboard'
                            }]
                        }
                    });

                Promise.runAll(false, true);
                spendTime(0)
                Promise.runAll(false, true);
            }
        }),

        reportsListRequest: () => ({
            receiveResponse() {
                ajax.recentRequest().
                    expectBodyToContain({
                        method: 'get.reports_list',
                        params: {}
                    }).
                    respondSuccessfullyWith({
                        result: {
                            data: [{
                                id: 582729,
                                group_id: 3893727,
                                type: 'marketer_dashboard',
                                name: 'Некий отчет',
                                description: 'Описание некого отчета',
                                folder: null,
                                sort: 0
                            }]
                        }
                    });

                Promise.runAll(false, true);
                spendTime(0)
                Promise.runAll(false, true);
            }
        }),

        reportGroupsRequest: () => ({
            receiveResponse() {
                ajax.recentRequest().
                    expectBodyToContain({
                        method: 'get.report_groups',
                        params: {}
                    }).
                    respondSuccessfullyWith({
                        result: {
                            data: [{
                                id: 3893727,
                                name: 'Некие отчеты',
                                parent_id: null,
                                sort: 0
                            }]
                        }
                    });

                Promise.runAll(false, true);
                spendTime(0)
                Promise.runAll(false, true);
            }
        }),

        accountRequest: () => ({
            receiveResponse() {
                ajax.recentRequest().
                    expectPathToContain('/front/v2.0').
                    expectToHaveMethod('POST').
                    expectToHaveHeaders({
                        Authorization: `Bearer 2j4gds8911fdpu20310v1ldfaqwr0QPOeW1313nvpqew`,
                        'X-Auth-Type': 'jwt'
                    }).
                    expectBodyToContain({
                        method: 'getobj.account',
                        params: {}
                    }).
                    respondSuccessfullyWith({
                        result: {
                            data: {
                                lang: 'ru',
                                tp_id: 406,
                                app_id: 1103,
                                project: 'comagic',
                                tp_name: 'Comagic Enterprise',
                                user_id: 151557,
                                app_name: 'Карадимова Веска Анастасовна',
                                crm_type: 'e2e_analytics',
                                timezone: 'Europe/Moscow',
                                app_state: 'active',
                                user_name: 'karadimova',
                                user_type: 'user',
                                components: [
                                    'operation',
                                    'dialing',
                                    'ext_dialing',
                                    'extended_report',
                                    'fax_receiving',
                                    'voice_mail',
                                    'menu',
                                    'information_message',
                                    'auth',
                                    'integration',
                                    'fax_receiving_button',
                                    'transfer',
                                    'tag_call',
                                    'run_scenario',
                                    'trainer',
                                    'trainer_in',
                                    'trainer_button',
                                    'trainer_desktop',
                                    'call_distribution_report',
                                    'call_session_distribution_report',
                                    'recording_in',
                                    'recording_out',
                                    'recording_button',
                                    'notification',
                                    'notification_by_sms',
                                    'notification_by_email',
                                    'notification_by_http',
                                    'api',
                                    'callapi',
                                    'callapi_management_call',
                                    'callapi_informer_call',
                                    'callapi_scenario_call',
                                    'send_sms',
                                    'va',
                                    'call_tracking',
                                    'dynamic_call_tracking',
                                    'ppc_integration',
                                    'wa_integration',
                                    'callout',
                                    'callback',
                                    'sip',
                                    'consultant',
                                    'recording',
                                    'talk_option',
                                    'sitephone',
                                    'lead',
                                    'partner_integration',
                                    'amocrm',
                                    'reserve_dynamic_numbers',
                                    'retailcrm',
                                    'dashboard',
                                    'dataapi',
                                    'dataapi_reports',
                                    'dataapi_provisioning',
                                    'speech_analytics',
                                    'processed_lost_call',
                                    'bitrix',
                                    'distribution_by_communication_number',
                                    'distribution_by_region',
                                    'distribution_by_segment',
                                    'private_number',
                                    'megaplan',
                                    'internal_lines',
                                    'fmc',
                                    'auto_back_call_by_lost_call',
                                    'split_channel_recording',
                                    'infoclinica',
                                    'facebook_ads',
                                    'google_adwords',
                                    'yandex_direct',
                                    'sales_funnel',
                                    'number_capacity_auto_usage',
                                    'call_monitoring_and_analytics',
                                    'keyword_spotting',
                                    'attribution_tools',
                                    'assisted_conversions',
                                    'attribution_models',
                                    'antispam',
                                    'auto_back_call_by_offline_message',
                                    'amocrm_extended_integration',
                                    'spam_calls_blocking',
                                    'upload_calls',
                                    'preserved_calls',
                                    '1c_rarus',
                                    'fitness_1c',
                                    'yandex_metrika',
                                    'e2e_analytics',
                                    'vk_ads',
                                    'upload_offline_messages',
                                    'upload_chats',
                                    'mytarget_ads',
                                    'stt_crt',
                                    'upload_sessions',
                                ],
                                user_login: 'karadimova',
                                customer_id: 183510,
                                permissions: [
                                    {
                                        'unit_id': 'call_recordings',
                                        'is_delete': true,
                                        'is_insert': false,
                                        'is_select': true,
                                        'is_update': true,
                                    },
                                    {
                                        'unit_id': 'tag_management',
                                        'is_delete': true,
                                        'is_insert': true,
                                        'is_select': true,
                                        'is_update': true,
                                    },
                                ],
                                is_agent_app: false
                            }
                        }
                    });

                Promise.runAll(false, true);
                spendTime(0)
                Promise.runAll(false, true);
            }
        }),

        refreshRequest: () => ({
            receiveResponse() {
                ajax.recentRequest().
                    expectPathToContain('/auth/json_rpc').
                    expectToHaveMethod('POST').
                    expectToHaveHeaders({
                        Authorization: `Bearer 2j4gds8911fdpu20310v1ldfaqwr0QPOeW1313nvpqew`,
                        'X-Auth-Type': 'jwt'
                    }).
                    expectBodyToContain({
                        method: 'refresh',
                        params: {
                            jwt: '2j4gds8911fdpu20310v1ldfaqwr0QPOeW1313nvpqew',
                            refresh: '2982h24972hls8872t2hr7w8h24lg72ihs7385sdihg2'
                        }
                    }).
                    respondSuccessfullyWith({
                        result: {
                            jwt: '935jhw5klatxx2582jh5zrlq38hglq43o9jlrg8j3lqj8jf',
                            refresh: '4g8lg282lr8jl2f2l3wwhlqg34oghgh2lo8gl48al4goj48'
                        }
                    });

                Promise.runAll(false, true);
                spendTime(0)
                Promise.runAll(false, true);
            }
        }),

        loginRequest: () => ({
            receiveResponse() {
                ajax.recentRequest().
                    expectPathToContain('/auth/json_rpc').
                    expectToHaveMethod('POST').
                    expectBodyToContain({
                        method: 'login',
                        params: {
                            login: 'botusharova',
                            password: '8Gls8h31agwLf5k',
                            project: 'comagic'
                        }
                    }).
                    respondSuccessfullyWith({
                        result: {
                            jwt: '2j4gds8911fdpu20310v1ldfaqwr0QPOeW1313nvpqew',
                            refresh: '2982h24972hls8872t2hr7w8h24lg72ihs7385sdihg2'
                        }
                    });

                Promise.runAll(false, true);
                spendTime(0)
                Promise.runAll(false, true);
            }
        }),

        forceUpdate: () => utils.pressKey('k'),

        button: text => testersFactory.createDomElementTester(
            utils.descendantOfBody().
                textEquals(text).
                matchesSelector('button').
                find()
        ),

        textField: {
            withFieldLabel: label => testersFactory.createTextFieldTester(
                utils.descendantOfBody().
                    textEquals(label).
                    matchesSelector('.ant-col span, .ui-label-content-field-label').
                    find().
                    closest('.ant-row, .ui-label').
                    querySelector('input')
            ) 
        } 
    };
});
