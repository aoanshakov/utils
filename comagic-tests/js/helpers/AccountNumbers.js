tests.requireClass('Comagic.account.numbers.controller.Page');
tests.requireClass('Comagic.account.numbers.view.ComagicNumbersGrid');
tests.requireClass('Comagic.account.numbers.view.UserNumbersGrid');

function AccountNumbers(requestsManager, testersFactory, utils) {
    var controller = Comagic.getApplication().
        getController('Comagic.account.numbers.controller.Page');

    controller.init();
    controller.actionIndex();

    this.destroy = function() {
        controller.destroy();
    };

    this.requestNumberParams = function () {
        var get_number_params = {
            login: 'ivanov.ivan-ivanovich_123',
            server_address: 'somedomain.com',
            port: 5028
        };

        return {
            setInvalidLogin: function () {
                get_number_params.login = 'ivanov.ivan-ivanovich_123$';
                return this;
            },
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('account/numbers/get_number_params/').
                    expectQueryToContain({
                        number_id: '21910'
                    }).
                    respondSuccessfullyWith({
                        success: true,
                        data: {
                            get_number_params: get_number_params 
                        }
                    });
            },
        };
    };

    this.requestCreateTicket = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/troubletickets/tickets/ticket/create/').
                    expectToHaveMethod('POST').
                    expectBodyToContain({
                        description: [(
                            'Попытка добавить номер стороннего провайдера, которого нет в нашей базе.<br><br>' +

                            'Номер: 74951234567<br>' +
                            'Логин: somelogin<br>' +
                            'Имя сервера: 111.111.111.111<br>' +
                            'Порт: 12345'
                        )],
                        is_new_full_name: ['false'],
                        full_name: ['2'],
                        is_new_phone: ['false'],
                        phone: ['3'],
                        is_new_email: ['false'],
                        email: ['4']
                    }).
                    respondSuccessfullyWith({
                        success: true,
                        data: true
                    });
            }
        };
    };

    this.requestUserContacts = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/troubletickets/tickets/user/get/contacts/').
                    expectToHaveMethod('GET').
                    respondSuccessfullyWith({
                        success: true,
                        data: {
                            contacts: [{
                                id: 2,
                                full_name: 'Иванов Иван Иванович'
                            }],
                            phones: [{
                                id: 3,
                                phone: '74951234567'
                            }],
                            emails: [{
                                id: 4,
                                email: 'ivanov@gmail.com'
                            }]
                        }
                    });
            }
        };
    };

    this.getPrivateNumberCostRequest = function() {
        var responseData = {
            get_user_charge_for_new_private_number: 255
        };

        return {
            setResponseEmpty: function() {
                responseData = null;
                return this;
            },
            send: function() {
                requestsManager.recentRequest().
                    expectToHaveMethod('GET').
                    expectToHavePath(
                        '/account/numbers/get_user_charge_for_new_private_number/'
                    ).
                    respondSuccessfullyWith({
                        success: true,
                        data: responseData 
                    });
            }
        };
    };

    this.numberValidationRequest = function() {
        var bodyParams = {
            session_id: undefined,
            step: 'start',
            data: {
                numb: 74951234567,
                type: 'private',
                is_used_for_va: true
            }
        };

        var responseData = {
            session_id: 543432,
            error: '',
            next_step: 'verification_code_request',
            next_step_params: {
                timer: 0,
                is_validation_code_field_available: false
            }
        };

        return {
            setSomeError: function() {
                responseData.error = 'some_error';
                return this;
            },
            setNotUsedForVa: function() {
                bodyParams.data.is_used_for_va = false;
                return this;
            },
            setAnotherNumber: function() {
                bodyParams.data.numb = 74951234568;
                return this;
            },
            setCodeAlreadyVerified: function() {
                responseData.next_step = 'connection_configuration';
                responseData.next_step_params = {
                    login: 'somelogin',
                    server_address: '111.111.111.111',
                    port: '12345',
                    password: 'somepass',
                };

                return this;
            },
            setPrivateTrunk: function() {
                bodyParams.data.type = 'private_trunk';
                return this;
            },
            setNumberAlreadyExists: function() {
                responseData.error = 'numb_already_exists';
                return this;
            },
            setNoResponse: function() {
                responseData = null;
                return this;
            },
            send: function() {
                requestsManager.recentRequest().
                    expectToHaveMethod('POST').
                    expectToHavePath('/account/numbers/update_private_number/').
                    expectBodyToContain(bodyParams).
                    respondSuccessfullyWith({
                        data: responseData,
                        success: true
                    });
            }
        };
    };

    this.connectionConfigurationRequest = function() {
        var bodyParams = {
            session_id: 543432,
            step: 'connection_configuration',
            data: {
                numb: 74951234567,
                login: 'somelogin',
                server_address: '111.111.111.111',
                port: 12345,
                password: 'somepass'
            }
        };

        var responseData = {
            session_id: 543432,
            error: '',
            next_step: null,
            next_step_params: null
        };

        return {
            setSipCredentialsAlreadyExist: function () {
                responseData.error = 'sip_credentials_already_exist';
                return this;
            },
            setNoOperatorTemplateMatch: function () {
                responseData.error = 'no_operator_template_match';
                return this;
            },
            send: function() {
                requestsManager.recentRequest().
                    expectToHaveMethod('POST').
                    expectToHavePath('/account/numbers/update_private_number/').
                    expectBodyToContain(bodyParams).
                    respondSuccessfullyWith({
                        data: responseData,
                        success: true
                    });
            }
        };
    };

    this.verificationCodeCheckRequest = function() {
        var bodyParams = {
            session_id: 543432,
            step: 'verification_code_check',
            data: {
                numb: 74951234567,
                verification_code: 1234
            }
        };

        var responseData = {
            session_id: 543432,
            error: '',
            next_step: 'connection_configuration',
            next_step_params: null
        };

        return {
            setInvalidVerificationCode: function() {
                responseData.error = 'invalid_verification_code';
                return this;
            },
            setSomeError: function() {
                responseData.error = 'some_error';
                return this;
            },
            send: function() {
                requestsManager.recentRequest().
                    expectToHaveMethod('POST').
                    expectToHavePath('/account/numbers/update_private_number/').
                    expectBodyToContain(bodyParams).
                    respondSuccessfullyWith({
                        data: responseData,
                        success: true
                    });
            }
        };
    };

    this.verificationCodeRequest = function() {
        var bodyParams = {
            session_id: 543432,
            step: 'verification_code_request',
            data: {
                numb: 74951234567,
                is_agreement_accepted: true,
                extension_number: '001',
                extension_number_pause: 15
            }
        };

        var responseData = {
            session_id: 543432,
            error: '',
            next_step: 'verification_code_check',
            next_step_params: {
                timer: 300,
                is_validation_code_field_available: true
            }
        };

        return {
            setAttemptLimitExceeded: function() {
                responseData.error = 'verification_attempt_count_exceeded';
                return this;
            },
            setSomeError: function() {
                responseData.error = 'some_error';
                return this;
            },
            send: function() {
                requestsManager.recentRequest().
                    expectToHaveMethod('POST').
                    expectToHavePath('/account/numbers/update_private_number/').
                    expectBodyToContain(bodyParams).
                    respondSuccessfullyWith({
                        data: responseData,
                        success: true
                    });
            }
        };
    };

    this.limitPriceRequest = function() {
        var queryParams = {
            tp_id: '406',
            limit: '{"max_number_va":5000}'
        };

        return {
            setPrivateNumber: function() {
                queryParams.limit = '{"max_private_number":5000}';
                return this;
            },
            send: function() {
                requestsManager.recentRequest().
                    expectToHaveMethod('GET').
                    expectQueryToContain(queryParams).
                    expectToHavePath('system/comagic_number/limit_price/').
                    respondSuccessfullyWith({
                        success: true,
                        data: 524
                    });
            }
        };
    };
    this.numberLimitValuesRequest = function() {
        var data = {
            max_number: {
                is_share: false,
                optimal_value: 10000,
                app_component_id: null,
                optimal_user_charge: null,
                name: 'Виртуальных номеров',
                real_value: 9998,
                max_value: 10000,
                free_value: 10000,
                date_start: '2016-04-08',
                is_compatible: true,
                value: 10000,
                is_aggregatable: true,
                share_max_value: null,
                component: null,
                is_strict: true,
                share_min_value: null,
                source_id: 406,
                user_charge: null,
                id: 449932
            },
            max_number_va: {
                is_share: false,
                optimal_value: 3000,
                app_component_id: 3595,
                optimal_user_charge: null,
                name: 'Виртуальных номеров ВАТС',
                real_value: 4999,
                max_value: 5000,
                free_value: 3000,
                date_start: '2017-07-12',
                is_compatible: true,
                value: 4999,
                is_aggregatable: true,
                share_max_value: null,
                component: 'va',
                is_strict: true,
                share_min_value: null,
                source_id: 406,
                user_charge: null,
                id: 16443
            },
            max_private_number: {
                is_share: false,
                optimal_value: 3000,
                app_component_id: 3595,
                optimal_user_charge: null,
                name: 'Клиентских номеров',
                real_value: 4999,
                max_value: 5000,
                free_value: 3000,
                date_start: '2017-07-12',
                is_compatible: true,
                value: 4999,
                is_aggregatable: true,
                share_max_value: null,
                component: 'va',
                is_strict: true,
                share_min_value: null,
                source_id: 406,
                user_charge: null,
                id: 16443
            }
        };

        return {
            setNoPrivateNumbersLimit: function() {
                delete(data.max_private_number);
                return this;
            },
            setVaNumbersCountIsMuchBelowLimit: function() {
                data.max_number_va.value = 10000;
                data.max_number_va.max_value = 10000;
                return this;
            },
            setPrivateNumbersLimitAlmostExceeded: function() {
                data.max_private_number.value = 10000;
                data.max_private_number.real_value = 5000;
                return this;
            },
            send: function() {
                requestsManager.recentRequest().
                    expectToHaveMethod('GET').
                    expectToHavePath(
                        'system/comagic_number/number_limit_values/'
                    ).
                    respondSuccessfullyWith({
                        tp_id: 406,
                        data: data,
                        success: true
                    });
            }
        };
    };

    this.buyNumberRequest = function() {
        var bodyParams = {
            buy_number_capacity: [143596, 143598],
            component: 'call_tracking',
            is_add_limit: null,
            limit_current_value: null
        };

        return {
            setVaNumbersCountIsMuchBelowLimit: function() {
                bodyParams.buy_number_capacity = [143596];
                bodyParams.component = 'va';
                return this;
            },
            setVaLimitExtending: function() {
                bodyParams.buy_number_capacity = [143596];
                bodyParams.component = 'va';
                bodyParams.is_add_limit = true;
                bodyParams.limit_current_value = 5000;
                return this;
            },
            send: function() {
                requestsManager.recentRequest().
                    expectToHaveMethod('POST').
                    expectToHavePath('system/comagic_number/').
                    expectBodyToContain(bodyParams).
                    respondSuccessfullyWith({
                        data: [],
                        success: true
                    });
            }
        };
    };

    this.freeNumbersRequest = function() {
        return {
            send: function() {
                requestsManager.recentRequest().
                    expectToHaveMethod('GET').
                    expectToHavePath('/system/comagic_number/free_numbers/').
                    expectQueryToContain({
                        prefix_id: '19393',
                        category_id: 'usual'
                    }).
                    respondSuccessfullyWith({
                        data: [{
                            activation_cost: 250,
                            id: 143596,
                            min_charge: 0,
                            numb: '74951060682',
                            prefix: '7495',
                            prefix_id: 19393,
                            redirect_numb: null,
                            user_charge: 250
                        }, {
                            activation_cost: 320,
                            id: 143597,
                            min_charge: 5,
                            numb: '74951060683',
                            prefix: '7495',
                            prefix_id: 19393,
                            redirect_numb: null,
                            user_charge: 430
                        }, {
                            activation_cost: 340,
                            id: 143598,
                            min_charge: 0,
                            numb: '74951060684',
                            prefix: '7495',
                            prefix_id: 19393,
                            redirect_numb: null,
                            user_charge: 510
                        }],
                        success: true
                    });
            }
        };
    };

    this.batchReloadRequest = function() {
        return {
            send: function() {
                requestsManager.recentRequest().
                    expectToHavePath('/directory/batch_reload/').
                    expectToHaveMethod('POST').
                    respondSuccessfullyWith({
                        data: {
                            'billing:public:prefix_list': [{
                                aux_id: '7495 - Москва',
                                aux_id2: false,
                                aux_id3: '7495',
                                id: 19393,
                                name: '495'
                            }]
                        },
                        success: true
                    });
            }
        };
    };

    this.accountNumbersRequest = function() {
        var data = {
            id: 116412,
            prefix: '495',
            comagic_prefix: '7495',
            category: 'Обычный',
            ac_names: 'Посетители без рекламной кампании',
            domains: 'altair.uiscom.ru',
            location: 'msk',
            has_amocrm: false,
            ac_ids: [-1],
            component: 'va',
            is_transit: false,
            has_bitrix: false,
            has_callback: false,
            has_callout: false,
            has_megaplan: false,
            has_retailcrm: false,
            is_dt_enabled: false,
            is_using: true,
            numb: '74952551354',
            number_capacity_id: 21910,
            phone_type: 'virtual',
            redirect_phone: '2551357',
            reserve_end: '2019-10-02',
            sc_count: 1,
            setup_date: '2016-07-20',
            short_numb: '2551354',
            site_block_names: 'Блок2',
            site_ids: [23711],
            status: 'active',
            total_records: 1,
            private_state: 'active'
        };

        return {
            setWaitingToBeConnected: function() {
                data.private_state = 'waiting';
                return this;
            },
            setTestCallFailed: function () {
                data.private_state = 'test_call_failed';
                return this;
            },
            setGatewayNotRegistered: function() {
                data.private_state = 'gateway_not_registered';
                return this;
            },
            setExternalProvider: function() {
                data.location = 'private';
                return this;
            },
            send: function() {
                requestsManager.recentRequest().
                    expectToHavePath('/account/numbers/read/').
                    expectToHaveMethod('GET').
                    expectQueryToContain({
                        phone_type: 'virtual'
                    }).
                    respondSuccessfullyWith({
                        data: [data],
                        total: 1,
                        success: true
                    });
            }
        };
    };

    this.discoverNumberBuyingWindow = function() {
        var win = utils.getFloatingComponent();

        this.numberBuyingWindow = testersFactory.createComponentTester(win);

        this.numbersToBuyGrid = testersFactory.createGridTester(
            win.down('grid'));

        this.numberBuyingTabPanel = testersFactory.
            createTabPanelTester(win.down('tabpanel'));

        var numberBuyingForm = win.down('panel[title="Купить номер"]');

        this.buyingNumberInformationContainer = testersFactory.
            createComponentTester(numberBuyingForm.down(
                'cm-buyphoneinfocontainer'
            ));

        this.numberBuyingForm = testersFactory.createFormTester(
            numberBuyingForm);

        var choosenNumbersList = numberBuyingForm.down('ul-tagselector');

        this.choosenNumbersListItemWithText = function(desiredText) {
            return testersFactory.createDomElementTester(
                Ext.fly(utils.findElementsByTextContent(choosenNumbersList, desiredText)[0]).
                    up('.ul-inline-tag-wrapper').down('.ul-property-remove').dom
            );
        };

        var numberExternalProviderNumberPanel = win.down(
            'panel[title="Добавить номер стороннего провайдера"]'
        );

        this.plugInButton = testersFactory.createComponentTester(
            numberBuyingForm.down('button[text="Подключить"]'));

        var basicSettingsForm = numberExternalProviderNumberPanel.
            query('form')[0];

        this.basicSettingsForm = testersFactory.createFormTester(
            basicSettingsForm);

        this.mobilePhoneAddingRestrictionMessage = function () {
            return testersFactory.createDomElementTester(utils.findElementByTextContent(basicSettingsForm, desiredText));
        };
        
        this.basicSettingsErrorMessageBlock = testersFactory.createComponentTester(basicSettingsForm.
            dockedItems.get(0));

        this.privateNumberInformationContainer = testersFactory.
            createComponentTester(basicSettingsForm.up('container').down(
                'cm-buyphoneinfocontainer'
            ));

        this.basicSettingsNextButton = testersFactory.createComponentTester(function () {
            return basicSettingsForm.up('container').down('button[text="Далее"]');
        });
        
        var numberVerificationForm = numberExternalProviderNumberPanel.
            query('form')[1];

        this.numberVerificationStepTitle = testersFactory.createDomElementTester(
            function() {
                return numberVerificationForm.up('container').up('container').el.
                    down('.x-component-cm-stepwise-step-title').dom;
            }
        );

        this.numberVerificationErrorMessageBlock = testersFactory.
            createComponentTester(numberVerificationForm.dockedItems.get(0));
        
        this.numberVerificationForm = testersFactory.createFormTester(
            numberVerificationForm);
        
        var codeGettingButton = numberVerificationForm.
            down('button[text="Получить код"]');

        this.codeGettingButton = testersFactory.
            createComponentTester(codeGettingButton);
        
        this.codeGettingTimer = testersFactory.createDomElementTester(
            function() {
                return codeGettingButton.el.down(
                    '.cm-stepwise-code-getting-button-timer'
                ).dom;
            }
        );

        this.numberVerificationNextButton = testersFactory.createComponentTester(function () {
            return numberVerificationForm.up('container').down('button[text="Далее"]');
        });

        this.numberVerificationBackButton = testersFactory.createComponentTester(function () {
            return numberVerificationForm.up('container').down('button[text="Назад"]');
        });

        var connectionSetttingsForm = numberExternalProviderNumberPanel.
            query('form')[2];

        this.connectionSetttingsForm = testersFactory.
            createFormTester(connectionSetttingsForm);

        this.connectionSettingsErrorMessageBlock = testersFactory.
            createComponentTester(connectionSetttingsForm.dockedItems.get(0));

        this.applyButton = testersFactory.createComponentTester(function () {
            return connectionSetttingsForm.up('container').down('button[text="Подключить"]');
        });

        this.connectionSettingsBackButton = testersFactory.createComponentTester(
            connectionSetttingsForm.up('container').down('button[text="Назад"]')
        );

        this.supportRequestWindow = testersFactory.createFormTester(function () {
            return Ext.ComponentQuery.query('window[title="Потребуется некоторое время"]')[0];
        });

        this.supportRequestWindowSubmitButton = testersFactory.createComponentTester(function () {
            return Ext.ComponentQuery.query('window[title="Потребуется некоторое время"]')[0].down(
                'button[text="Получить уведомление"]'
            );
        });

        this.supportRequestWindowCancelButton = testersFactory.createComponentTester(function () {
            return Ext.ComponentQuery.query('window[title="Потребуется некоторое время"]')[0].down(
                'button[text="Отмена"]'
            );
        });
    };

    var numbersManagementGrid = Comagic.getApplication().findComponent(
        'gridcolumn[text="Дата окончания резерва"]').up('grid');

    this.numbersManagementGrid = testersFactory.createGridTester(numbersManagementGrid);

    this.exportButton = testersFactory.createComponentTester(Comagic.getApplication().findComponent(
        'cm-report-exportbutton'));
    
    this.exportPdfMenuItem = testersFactory.createComponentTester(
        Comagic.getApplication().findComponent('cm-report-exportbutton').getMenu().down('menuitem[text="Документ PDF"]')
    );

    this.buyNumberButton = testersFactory.createComponentTester(
        Comagic.getApplication().findComponent(
            'button[text="Подключить номер"]')
    );

    this.windowForm = testersFactory.createFormTester(function () {
        return utils.getFloatingComponent();
    });

    this.repeatConnectionButton = testersFactory.createComponentTester(function () {
        return utils.getFloatingComponent().down('button[text="Повторить подключение"]');
    });
}
