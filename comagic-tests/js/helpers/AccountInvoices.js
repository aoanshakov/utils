tests.requireClass('Comagic.account.invoices.controller.Page');

function AccountInvoices(requestsManager, testersFactory, utils) {
    this.requestGridData = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/account/invoices/get_grid_data/').
                    respondSuccessfullyWith({
                        data: [{
                            invoiceid: 1234,
                            invoicedate: '2018-03-12',
                            invoicenumber: 2345,
                            contract_number: 3456,
                            summarub: 45.67,
                            is_closed_fin_month: true,
                            is_closed_fin_month_text: 'Закрытый отчетный перод'
                        }],
                        metaData: {
                            total: 1,
                            grid: [{
                                hidden: true,
                                name: 'invoiceid'
                            }, {
                                columnName: 'Дата, дд.мм.гггг',
                                columnType: 'date',
                                display: 'Дата',
                                name: 'invoicedate'
                            }, {
                                columnName: 'Номер документа',
                                name: 'invoicenumber'
                            }, {
                                columnName: 'Контракт',
                                name: 'contract_number'
                            }, {
                                align: 'right',
                                columnName: 'Сумма, руб.',
                                columnType: 'float',
                                name: 'summarub'
                            }, {
                                hidden: true,
                                name: 'is_closed_fin_month'
                            }, {
                                columnName: 'Отчетный период',
                                name: 'is_closed_fin_month_text'
                            }]
                        },
                        success: true
                    });
            }
        };
    };
    this.requestSecondDimensions = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/directory_tree/comagic:second_dimensions/').
                    respondSuccessfullyWith({
                        children: [],
                        success: true
                    });
            }
        };
    };
    this.requestReferenceData = function () {
        return {
            send: function () {
                requestsManager.recentRequest().
                    expectToHavePath('/account/invoices/get_reference_data/').
                    expectToHaveMethod('GET').
                    respondSuccessfullyWith({
                        data: {
                            mode: [{
                                id: 'invoices',
                                name: 'Реестр счетов и закрывающих документов'
                            }, {
                                id: 'payments',
                                name: 'Реестр платежей'
                            }]
                        },
                        success: true
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
                        data: {
                            'billing:public:app_parameters': [{
                                id: 'creation_date',
                                name: '2007-03-12'
                            }]
                        },
                        success: true
                    });
            }
        };
    };

    this.downloadDocumentsButton = testersFactory.createButtonTester(function () {
        return Comagic.getApplication().findComponent('button[text="Скачать документы"]');
    });

    this.reportsGrid = testersFactory.createGridTester(function () {
        return Comagic.getApplication().findComponent(
            'gridcolumn[text="Номер документа"]'
        ).up('grid');
    });

    Comagic.Directory.load();
    this.batchReloadRequest().send();

    var controller = Comagic.getApplication().getController('Comagic.account.invoices.controller.Page');
    controller.application = Comagic.getApplication();

    controller.init();
    controller.actionIndex({
        dateRange: {
            startDate: new Date(),
            endDate: new Date()
        }
    });

    this.destroy = function() {
        controller.destroy();
    };
}
