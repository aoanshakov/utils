tests.addTest(function(requestsManager, testersFactory, wait, utils, windowOpener) {
    describe('Открываю раздел "Аккаунт/Ведомости и закрывающие документы".', function() {
        var helper;

        beforeEach(function() {
            helper = new AccountInvoices(requestsManager, testersFactory, utils);
            helper.requestReferenceData().send();
            helper.requestSecondDimensions().send();
            helper.requestGridData().send();
        });
        afterEach(function() {
            helper.destroy();
        });

        describe('Отмечаю чекбокс в строке таблицы документов.', function() {
            beforeEach(function() {
                helper.reportsGrid.row().first().column().first().checkbox().click();
            });

            it((
                'Нажимаю на пункт "HTML" меню кнопки "Скачать документы". Отправлен запрос выгрузки документов в ' +
                'формате "HTML".'
            ), function() {
                helper.downloadDocumentsButton.menu().item('HTML').click();

                windowOpener.expectToHavePath('/account/invoices/print/').expectQueryToContain({
                    type: 'invoices',
                    invoice_ids: '1234',
                    format: 'html'
                });
            });
            it((
                'Нажимаю на пункт "PDF" меню кнопки "Скачать документы". Отправлен запрос выгрузки документов в ' +
                'формате "PDF".'
            ), function() {
                helper.downloadDocumentsButton.menu().item('PDF').click();

                windowOpener.expectToHavePath('/account/invoices/print/').expectQueryToContain({
                    type: 'invoices',
                    invoice_ids: '1234',
                    format: 'pdf'
                });
            });
        });
        it((
            'Нажимаю на кнопку "HTML" в колонке "Бухгалтерские документы" таблицы документов. Отправлен запрос ' +
            'выгрузки документа в формате "HTML".'
        ), function() {
            helper.reportsGrid.row().first().column().withHeader('Бухгалтерские документы').findAnchor('HTML').
                expectHrefToHavePath('/account/invoices/print/').
                expectHrefQueryToContain({
                    type: 'invoices',
                    invoice_ids: '1234',
                    format: 'html'
                });
        });
        it((
            'Нажимаю на кнопку "PDF" в колонке "Бухгалтерские документы" таблицы документов. Отправлен запрос ' +
            'выгрузки документа в формате "HTML".'
        ), function() {
            helper.reportsGrid.row().first().column().withHeader('Бухгалтерские документы').findAnchor('PDF').
                expectHrefToHavePath('/account/invoices/print/').
                expectHrefQueryToContain({
                    type: 'invoices',
                    invoice_ids: '1234',
                    format: 'pdf'
                });
        });
    });
});
