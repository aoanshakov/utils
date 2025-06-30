// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//

const buttonSelector = '.ui-button, .cmgui-button';

Cypress.Commands.add('textField', () => cy.get('input'));
Cypress.Commands.add('button', text => cy.get(buttonSelector).contains(text));
Cypress.Commands.add('notification', () => cy.get('.cmgui-notification'));
Cypress.Commands.add('appRoot', () => cy.get('#root'));
Cypress.Commands.add('rootMain', () => cy.get('#rootMain'));

const processText = value => {
    if (!value) {
        return '';
    }

    if (typeof value != 'string') {
        value = value.innerHTML;
    }

    return (value || '').replace(/<[^<>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/[\s]+/g, ' ').trim();
};

chai.Assertion.overwriteMethod('text', function (_super) {
    return function (expected) {
        const subject = this._obj,
            el = subject?.[0] || subject,
            actual = processText(el),
            { contains } = (this.__flags || {});

        if (contains) {
            if (expected instanceof RegExp) {
                this.assert(
                    expected.test(actual),
                    `expected element text to match #{exp}, but got #{act}`,
                    `expected element text not to match #{exp}`,
                    expected,
                    actual
                );
            } else {
                this.assert(
                    actual.includes(expected),
                    `expected element text to include #{exp}, but got #{act}`,
                    `expected element text not to include #{exp}`,
                    expected,
                    actual
                );
            }
        } else {
            if (expected instanceof RegExp) {
                this.assert(
                    expected.test(actual),
                    `expected element text to match #{exp}, but got #{act}`,
                    `expected element text not to match #{exp}`,
                    expected,
                    actual
                );
            } else {
                this.assert(
                    actual === expected,
                    `expected element text to be #{exp}, but got #{act}`,
                    `expected element text not to be #{exp}`,
                    expected,
                    actual
                );
            }
        }
    };
});

chai.Assertion.overwriteProperty('disabled', function (original) {
    return function () {
        const button = this._obj?.[0]?.closest(buttonSelector);

        if (!button) {
            return original.apply(this);
        }

        this.assert(
            button.hasAttribute('disabled'),
            'expected button to be disabled',
            'expected button not to be disabled',
        );
    };
});

const holdedRequests = {};

const defineRequestInterception = ({
    alias,
    method,
    url,
    stub,
    spy = () => {},
}) => Object.defineProperty(cy, alias, {
    get() {
        const intercept = response => cy.intercept(method, url, response).as(alias),
            getHoldedRequests = () => (holdedRequests[alias] || (holdedRequests[alias] = new Set()));

        return {
            stub() {
                intercept(stub);
            },

            hold() {
                intercept(request => new Promise(resolve => getHoldedRequests().add(() => {
                    request.reply(stub);
                    resolve();
                })));

                return {
                    expectToBeSent() {
                        cy.wrap(getHoldedRequests()).its('size').should(
                            'be.above',
                            0,
                            `Request @${alias} should be sent`
                        );

                        spy(cy.get(`@${alias}`));

                        return {
                            receiveResponse() {
                                cy.then(() => {
                                    getHoldedRequests().forEach(resolve => {
                                        getHoldedRequests().delete(resolve);
                                        resolve();
                                    });
                                });
                            },
                        };
                    },

                    receiveResponse() {
                        this.expectToBeSent().receiveResponse();
                    },
                };
            },
        };
    },

    set() {},
});

const defineWebSocket = ({
    alias,
    url,
    messages,
}) => Object.defineProperty(cy, alias, {
    get() {
        const websocket = cy.websockets.withUrl(url);

        Object.entries(messages).forEach(([name, { spy = () => {}, data }]) => {
            websocket[name] = {
                expectToBeSent() {
                    websocket.expectSentMessageToInclude(data).then(message => spy(message));
                },

                receive() {
                    websocket.receiveMessage(message.data);
                },
            };
        });

        return websocket;
    },

    set() {},
});

defineWebSocket({
    alias: 'employeesWebsocket',
    url: 'wss://dev-int0-comagic-employee-realtime.uis.st/cookie_based_websocket',
    messages: {
        initMessage: {
            spy: message => expect(message.params.jwt).to.be.undefined,

            data: {
                name: 'init',
                params: {},
            },
        },
    },
});

const jsonBody = body => ({
    statusCode: 200,
    body: JSON.stringify(body),
});

const rpcBody = data => jsonBody({
    result: { data },
});

defineRequestInterception({
    alias: 'employeesSsoCheckRequest',
    method: 'GET',
    url: 'https://dev-int0-comagic-employee-realtime.uis.st/sso/check',
    stub: jsonBody({ exp: null }),
});

defineRequestInterception({
    alias: 'employeeSettingsRequest',
    method: 'GET',
    url: 'https://dev-int0-comagic-employee-rest.uis.st/api/v1/employees/20816/settings',
    stub: jsonBody({
        is_chat_acceptance_confirmation: true,
        is_need_hide_numbers: false,
    }),
});

defineRequestInterception({
    alias: 'employeeRequest',
    method: 'GET',
    url: 'https://dev-int0-comagic-employee-rest.uis.st/api/v1/employees/20816',
    stub: jsonBody({
        id: 20816,
        first_name: 'Стефка',
        last_name: 'Ганева',
        position_id: 0,
        status_id: 1,
    }),
});

defineRequestInterception({
    alias: 'tokenRequest',
    method: 'GET',
    url: 'https://dev-int0-softphone-rest-api.uis.st/sup/auth/token*',
    spy: request => request.its('request.query')
        .should(query => {
            expect(query?.widget_type).to.be.undefined;
            expect(query?.browser_id).to.be.a('string');
            expect(query?.browser_id).to.be.not.empty;
        }),
    stub: jsonBody({
        data: {
            token: 'XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0',
        },
    }),
});

defineRequestInterception({
    alias: 'loginRequest',
    method: 'POST',
    url: 'https://dev-int0-uc-sso-api.uis.st/api-login',
    spy: request => request.its('request.body')
        .should(body => {
            expect(body).to.have.property('username', 'botusharova');
            expect(body).to.have.property('password', '8Gls8h31agwLf5k');
        }),
    stub: {
        statusCode: 200,
        body: '{}',
    },
});

const rpcUrl = method => 'https://dev-int0-dataapi-jsonrpc.uis.st/v2.0?method=' + method;

defineRequestInterception({
    alias: 'accountRequest',
    method: 'POST',
    url: rpcUrl('getobj.account'),
    stub: rpcBody({
        lang: 'ru',
        tp_id: 406,
        app_id: 1103,
        project: 'comagic',
        tp_name: 'Comagic Enterprise',
        user_id: 151557,
        employee_id: 20816,
        app_name: 'ООО "НОВОСИСТЕМ"',
        crm_type: 'e2e_analytics',
        timezone: 'Europe/Moscow',
        app_state: 'active',
        user_name: 'Карадимова Веска Анастасовна',
        user_type: 'user',
        feature_flags: [
            'softphone',
            'large_softphone',
            'call_stats',
            'call_history',
            'contacts',
            'contact_creating',
            'contact_deleting',
            'outgoing_chat',
            'contact_channel_creating',
            'telegram_contact_channel',
            'chat_pinning',
            'x_widget_type_header',
        ],
        call_center_role: 'employee',
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
        limits: [],
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
            {
                'unit_id': 'softphone_login',
                'is_delete': true,
                'is_insert': true,
                'is_select': true,
                'is_update': true,
            },
            {
                'unit_id': 'address_book',
                'is_delete': true,
                'is_insert': true,
                'is_select': true,
                'is_update': true,
            },
            {
                'unit_id': 'web_account_login',
                'is_delete': true,
                'is_insert': true,
                'is_select': true,
                'is_update': true,
            },
            {
                'unit_id': 'offline_messages_management',
                'is_delete': true,
                'is_insert': true,
                'is_select': true,
                'is_update': true,
            },
            {
                'unit_id': 'contact_communication_history',
                'is_delete': true,
                'is_insert': true,
                'is_select': true,
                'is_update': true,
            }
        ],
        is_agent_app: false
    }),
});

defineRequestInterception({
    alias: 'reportsListRequest',
    method: 'POST',
    url: rpcUrl('get.reports_list'),
    stub: rpcBody({
        id: 582729,
        group_id: 1,
        type: 'summary_analytics',
        name: 'Некий отчет',
        description: 'Описание некого отчета',
        folder: null,
        sort: 0
    }),
});

defineRequestInterception({
    alias: 'statusesRequest',
    method: 'GET',
    url: 'https://dev-int0-comagic-employee-rest.uis.st/api/v1/statuses',
    stub: jsonBody([{
        id: 7,
        is_worktime: false,
        mnemonic: 'removed',
        name: 'Удаленный',
        is_select_allowed: false,
        icon: 'heart',
        color: '#000',
        priority: 8,
        is_removed: true,

        is_able_to_accept_chat_transfer: true,
        is_able_to_transfer_chat: true,
        is_able_to_accept_chat: true,
        is_able_to_close_chat_offline_message: true,
        is_able_in_forwarding_scenario: true,
        is_able_to_send_chat_messages: true,

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
        id: 1,
        is_worktime: true,
        mnemonic: 'available',
        name: 'Доступен',
        is_select_allowed: true,
        description: 'все вызовы',
        color: '#48b882',
        icon: 'tick',
        is_auto_out_calls_ready: true,
        is_removed: false,

        is_able_to_accept_chat_transfer: true,
        is_able_to_transfer_chat: true,
        is_able_to_accept_chat: true,
        is_able_to_close_chat_offline_message: true,
        is_able_in_forwarding_scenario: true,
        is_able_to_send_chat_messages: true,

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
        icon: 'pause',
        is_auto_out_calls_ready: true,
        is_removed: false,

        is_able_to_accept_chat_transfer: true,
        is_able_to_transfer_chat: true,
        is_able_to_accept_chat: false,
        is_able_to_close_chat_offline_message: true,
        is_able_in_forwarding_scenario: true,
        is_able_to_send_chat_messages: true,

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
        icon: 'minus',
        description: 'только исходящие',
        color: '#cc5d35',
        is_auto_out_calls_ready: true,
        is_removed: false,

        is_able_to_accept_chat_transfer: true,
        is_able_to_transfer_chat: true,
        is_able_to_accept_chat: true,
        is_able_to_close_chat_offline_message: true,
        is_able_in_forwarding_scenario: true,
        is_able_to_send_chat_messages: true,

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
        icon: 'time',
        is_auto_out_calls_ready: true,
        is_removed: false,

        is_able_to_accept_chat_transfer: true,
        is_able_to_transfer_chat: true,
        is_able_to_accept_chat: true,
        is_able_to_close_chat_offline_message: true,
        is_able_in_forwarding_scenario: true,
        is_able_to_send_chat_messages: true,

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
        icon: 'cross',
        is_auto_out_calls_ready: true,
        is_removed: false,

        is_able_to_accept_chat_transfer: true,
        is_able_to_transfer_chat: true,
        is_able_to_accept_chat: true,
        is_able_to_close_chat_offline_message: true,
        is_able_in_forwarding_scenario: true,
        is_able_to_send_chat_messages: true,

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
        icon: 'unknown',
        color: null,
        is_auto_out_calls_ready: true,
        is_removed: false,

        is_able_to_accept_chat_transfer: true,
        is_able_to_transfer_chat: true,
        is_able_to_accept_chat: true,
        is_able_to_close_chat_offline_message: true,
        is_able_in_forwarding_scenario: true,
        is_able_to_send_chat_messages: true,

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
    }]),
});

Cypress.Commands.add('unauthorized', text => {
    cy.intercept('https://mc.yandex.ru/**', {
        statusCode: 404,
        body: '404 Not Found',
    });

    cy.intercept('https://app2.comagic.ru/ss/settings/**', {
        statusCode: 404,
        body: '404 Not Found',
    });

    cy.intercept('https://**.mindbox.ru/**', {
        statusCode: 404,
        body: '404 Not Found',
    });

    cy.intercept('https://dev-int0-uc-sso-api.uis.st/sso/check', {
        statusCode: 401,
        body: '401 Unauthorized',
    });
});

Cypress.Commands.add('withLabel', { prevSubject: 'element' }, (subject, label) => {
    const filter = input => {
        return input.
            closest('.ui-label')?.
            querySelector('.ui-label-content')?.
            textContent?.
            includes(label);
    };

    return cy.wrap(subject)
        .should(inputs => [...inputs].find(filter))
        .then(inputs => inputs.filter((index, input) => filter(input)));
});

Cypress.Commands.add('withPlaceholder', { prevSubject: 'element' }, (subject, placeholder) => {
    const filter = input => input.getAttribute('placeholder') === placeholder;

    return cy.wrap(subject)
        .should(inputs => [...inputs].find(filter))
        .then(inputs => inputs.filter((index, input) => filter(input)));
});

Object.defineProperty(cy, 'init', {
    get() {
        return ({
            win,
            version = '6.2.64',
            windowId = 'main',
        }) => {
            Object.keys(holdedRequests).forEach(alias => delete(holdedRequests[alias]));

            cy.websockets.reset();
            win.WebSocket = cy.websocketsFactory.createConstructor();
            win.fakeIpcRenderer = cy.ipcRendererFactory.createFakeIpcRenderer();

            !win.process && (win.process = {});
            !win.process.versions && (win.process.versions = {});
            !win.process.versions.electron && (win.process.versions.electron = '1.0.0');
            win.process.argv = [`--app-version=${version}`, `--window-id=${windowId}`];
            win.fakeEnv = { REACT_APP_EARLIEST_SUPPORTED_DESKTOP_APP_VERSION: '6.1.70' };

            cy.ipcRenderer.appVersion = () => cy.ipcRenderer.receiveMessage('[ipc.main]:app-version', version);
            cy.ipcRenderer.updateDownloaded = () => cy.ipcRenderer.receiveMessage('[ipc.main]:update-downloaded');

            cy.ipcRenderer.quitAndInstall = () =>
                cy.ipcRenderer.expectMessageToBeSent('[ipc.renderer]:quit-and-install');

            cy.ipcRenderer.downloadUpdate = () =>
                cy.ipcRenderer.expectMessageToBeSent('[ipcRenderer.window]:download-update');


            cy.ipcRenderer.updateAvailable = () => {
                cy.ipcRenderer.receiveMessage(
                    '[ipc.main]:softphone-update-data',
                    {
                        updateServerUrl: 'https://dev-int0-electron-release-server.uis.st',
                        path: 'uis/stable',
                        version: '6.2.65',
                    },
                );

                cy.ipcRenderer.receiveMessage('[ipc.main]:update-available');
            };
        };
    },

    set() {},
});

//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })