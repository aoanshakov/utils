tests.addTest(options => {
    const {
        Tester,
        setFocus,
        notificationTester,
        spendTime,
        postMessages,
        unfilteredPostMessages,
        setNow,
        setDocumentVisible,
        windowOpener,
        ajax,
        utils,
        webSockets,
        audioDecodingTester,
        fileReader,
        unload,
    } = options;

    describe('Включено расширение Chrome или виджет интеграции с CRM.', function() {
        let tester,
            messageTemplatesAvailable,
            fileUploadingAvailable;

        beforeEach(function() {
            setNow('2019-12-19T12:10:06');
        });

        afterEach(function() {
            postMessages.nextMessage().expectNotToExist();

            if (!tester) {
                return;
            }

            tester.restoreSalesbotIFrameContentWindow();
            tester.restoreSoftphoneIFrameContentWindow();
            tester.restoreNotificationIFrameContentWindow();

            tester.chrome.
                tabs.
                current.
                nextMessage().
                expectNotToExist();

            tester.chrome.
                runtime.
                background.
                nextMessage().
                expectNotToExist();

            tester.chrome.
                runtime.
                popup.
                nextMessage().
                expectNotToExist();

            tester.chrome.
                identity.
                authFlow.
                nextLaunching().
                expectNotToExist();

            tester.chrome.
                permissions.
                nextRequest().
                expectNotToExist();
        });

        describe('Открываю настройки Salesbot amoCRM.', function() {
            beforeEach(function() {
                tester = new Tester({
                    application: 'amocrmSalesbotIframe',
                    isIframe: true,
                    ...options,
                });

                tester.salesbotParamsSettingRequest().expectToBeSent();

                messageTemplatesAvailable = tester.
                    featureFlagRequest('salesbot_message_templates').
                    expectToBeSent();
            });

            describe('В профиле указан русский язык.', function() {
                beforeEach(function() {
                    tester.amocrmStateSettingRequest().receive();

                    fileUploadingAvailable = tester.
                        featureFlagRequest('salesbot_file_uploading').
                        expectToBeSent();

                    tester.tokenInitializationRequest().
                        salesbot().
                        emptyToken().
                        expectToBeSent();

                    postMessages.receive({
                        method: 'set_token',
                        data: '',
                    });

                    postMessages.nextMessage().expectMessageToContain({
                        method: 'set_token',
                        data: '',
                    });
                });

                describe('Сотрудник авторизован.', function() {
                    beforeEach(function() {
                        postMessages.receive({
                            method: 'set_token',
                            data: tester.oauthToken,
                        });

                        postMessages.nextMessage().expectMessageToContain({
                            method: 'set_token',
                            data: tester.oauthToken,
                        });
                    });

                    describe('Выпадающий список шаблонов WABA доступен. Прикладывание файлов доступно.', function() {
                        beforeEach(function() {
                            messageTemplatesAvailable.receiveResponse();
                            fileUploadingAvailable.receiveResponse();
                        });

                        describe('Получены данные незаполненной формы.', function() {
                            beforeEach(function() {
                                tester.savedValuesSettingRequest().receive();
                            });

                            it('', function() {
                            });
                            return;
                            describe('Отмечаю чекбокс "Писать в последний диалог".', function() {
                                beforeEach(function() {
                                    tester.checkbox.click();

                                    tester.salesbotParamsSettingRequest().
                                        shouldMessageToLastChat().
                                        expectToBeSent();
                                });

                                describe('Выбираю канал WABA.', function() {
                                    let messageTemplatesRequest;

                                    beforeEach(function() {
                                        tester.select.
                                            withPlaceholder('Откуда писать, если не нашли диалог').
                                            click();

                                        tester.select.
                                            option('Whats App Waba').
                                            click();

                                        messageTemplatesRequest = tester.messageTemplatesRequest().expectToBeSent();

                                        tester.salesbotParamsSettingRequest().
                                            shouldMessageToLastChat().
                                            anotherChannel().
                                            expectToBeSent();
                                    });

                                    describe('Получаю список шаблонов.', function() {
                                        beforeEach(function() {
                                            messageTemplatesRequest.receiveResponse();
                                        });

                                        describe('Заполняю остальные поля формы.', function() {
                                            beforeEach(function() {
                                                tester.select.
                                                    withPlaceholder('Шаблон WABA').
                                                    click();

                                                tester.select.
                                                    option('Другой шаблон Waba').
                                                    click();

                                                tester.salesbotParamsSettingRequest().
                                                    shouldMessageToLastChat().
                                                    anotherChannel().
                                                    messageTemplateChosen().
                                                    expectToBeSent();

                                                tester.textarea.fill(
                                                    'Некое сообщение, отправляемое при каких-то изменениях свойств ' +
                                                    'сделки'
                                                );

                                                tester.salesbotParamsSettingRequest().
                                                    shouldMessageToLastChat().
                                                    anotherChannel().
                                                    messageTemplateChosen().
                                                    messageFilled().
                                                    expectToBeSent();
                                            });
                                            
                                            describe(
                                                'Прикладываю файл. В родительское окно отправлен запрос ' +
                                                'прикладывания файла.',
                                            function() {
                                                let fileUploadngRequest;

                                                beforeEach(function() {
                                                    tester.fileField.upload('some-file.zip');

                                                    fileReader.
                                                        accomplishFileLoading('some-file.zip');

                                                    fileUploadngRequest = tester.fileUploadngRequest().expectToBeSent();
                                                });

                                                describe(
                                                    'Получены данные ресурса. Приложенный файл сохранился. ' +
                                                    'Прикладываю ещё один файл. Оба приложенных файла сохранились.',
                                                function() {
                                                    beforeEach(function() {
                                                        fileUploadngRequest.receiveResponse();

                                                        tester.button('Прикрепить файл').
                                                            expectNotToHaveAttribute('disabled');

                                                        tester.salesbotParamsSettingRequest().
                                                            shouldMessageToLastChat().
                                                            anotherChannel().
                                                            messageTemplateChosen().
                                                            messageFilled().
                                                            fileAdded().
                                                            expectToBeSent();

                                                        tester.fileField.upload('other-file.zip');

                                                        fileReader.
                                                            accomplishFileLoading('other-file.zip');

                                                        fileUploadngRequest = tester.fileUploadngRequest().
                                                            anotherFile().
                                                            receiveResponse();

                                                        tester.salesbotParamsSettingRequest().
                                                            filled().
                                                            expectToBeSent();
                                                    });

                                                    describe(
                                                        'Нажимаю на кнопку скачивания приложенного файла.',
                                                    function() {
                                                        let fileDownloadingRequest;

                                                        beforeEach(function() {
                                                            tester.attachment('some-file.zip').click();

                                                            fileDownloadingRequest = tester.fileDownloadingRequest().
                                                                expectToBeSent();
                                                        });

                                                        describe('Не удалось скачать файл.', function() {
                                                            beforeEach(function() {
                                                                fileDownloadingRequest.
                                                                    failed().
                                                                    receiveResponse();
                                                            });
                                                            
                                                            it(
                                                                'Помещаю курсор над иконкой ошибки. Отображено ' +
                                                                'сообщение об ошибке.',
                                                            function() {
                                                                tester.attachment('some-file.zip').
                                                                    failIcon.
                                                                    putMouseOver();

                                                                tester.tooltip.
                                                                    expectToHaveTextContent('Не удалось скачать файл');
                                                            });
                                                            it('Отображена иконка ошибки.', function() {
                                                                tester.attachment('some-file.zip').
                                                                    failIcon.
                                                                    expectToBeVisible();

                                                                tester.attachment('other-file.zip').
                                                                    failIcon.
                                                                    expectNotToExist();

                                                                tester.attachment('some-file.zip').expectToBeEnabled();
                                                            });
                                                        });
                                                        it('Скачивание файла завершено.', function() {
                                                            fileDownloadingRequest.receiveResponse();

                                                            tester.attachment('some-file.zip').expectToBeEnabled();
                                                            tester.attachment('other-file.zip').expectToBeEnabled();
                                                        });
                                                        it('Кнопка скачивания заблокирована.', function() {
                                                            tester.attachment('some-file.zip').click();

                                                            tester.attachment('some-file.zip').expectToBeDisabled();
                                                            tester.attachment('other-file.zip').expectToBeEnabled();
                                                        });
                                                    });
                                                    it('Нажимаю на кнопку удаления файла.', function() {
                                                        tester.attachment('other-file.zip').removeIcon.click();

                                                        tester.salesbotParamsSettingRequest().
                                                            shouldMessageToLastChat().
                                                            anotherChannel().
                                                            messageTemplateChosen().
                                                            messageFilled().
                                                            fileAdded().
                                                            expectToBeSent();

                                                        tester.attachment('some-file.zip').expectToBeVisible();
                                                        tester.attachment('other-file.zip').expectNotToExist();
                                                    });
                                                    it('Отображены кнопки приложенных файлов.', function() {
                                                        tester.attachment('some-file.zip').expectToBeEnabled();
                                                        tester.attachment('other-file.zip').expectToBeEnabled();

                                                        tester.attachment('some-file.zip').
                                                            failIcon.
                                                            expectNotToExist();

                                                        tester.attachment('other-file.zip').
                                                            failIcon.
                                                            expectNotToExist();

                                                        tester.failIcon.expectNotToExist();
                                                    });
                                                });
                                                it('Не удалось приложить файл.', function() {
                                                    fileUploadngRequest.
                                                        failed().
                                                        receiveResponse();

                                                    tester.button('Прикрепить файл').
                                                        expectNotToHaveAttribute('disabled');

                                                    tester.failIcon.putMouseOver();

                                                    tester.tooltip.
                                                        expectToHaveTextContent('Не удалось приложить файл');
                                                });
                                                it('Поле файла заблокировано.', function() {
                                                    tester.button('Прикрепить файл').expectToHaveAttribute('disabled');
                                                });
                                            });
                                            it('Выбираю другой канал. Выпадающий список шаблонов скрыт.', function() {
                                                tester.select.
                                                    withPlaceholder('Откуда писать, если не нашли диалог').
                                                    click();

                                                tester.select.
                                                    option('mrDDosT').
                                                    click();

                                                tester.salesbotParamsSettingRequest().
                                                    shouldMessageToLastChat().
                                                    messageFilled().
                                                    expectToBeSent();

                                                tester.select.
                                                    withPlaceholder('Шаблон WABA').
                                                    expectNotToExist();
                                            });
                                            it('Поля формы заполнены.', function() {
                                                tester.select.
                                                    withPlaceholder('Переменная').
                                                    click();

                                                tester.select.
                                                    option('ID сделки').
                                                    click();

                                                tester.salesbotParamsSettingRequest().
                                                    shouldMessageToLastChat().
                                                    anotherChannel().
                                                    messageTemplateChosen().
                                                    messageFilled().
                                                    variableAdded().
                                                    expectToBeSent();

                                                tester.checkbox.expectToBeChecked();

                                                tester.select.
                                                    withPlaceholder('Откуда писать, если не нашли диалог').
                                                    expectToHaveTextContent(
                                                        'Whats App Waba ' +
                                                        'Откуда писать, если не нашли диалог'
                                                    );

                                                tester.textarea.expectToHaveValue(
                                                    'Некое сообщение, отправляемое при каких-то изменениях свойств ' +
                                                    'сделки{{lead.id}}'
                                                );

                                                tester.button('Прикрепить файл').expectNotToHaveAttribute('disabled');
                                            });
                                        });
                                        it('Выпадающий список шаблонов доступен.', function() {
                                            tester.select.
                                                withPlaceholder('Шаблон WABA').
                                                expectToBeEnabled();

                                            tester.body.expectTextContentToHaveSubstring(
                                                'Если приоритетным каналом окажется WABA'
                                            );
                                        });
                                    });
                                    it(
                                        'Получен ответ на другой запрос шаблонов. Выпадающий список шаблонов ' +
                                        'заблокирован.',
                                    function() {
                                        messageTemplatesRequest.
                                            anotherId().
                                            receiveResponse();

                                        tester.select.
                                            withPlaceholder('Шаблон WABA').
                                            expectToBeDisabled();
                                    });
                                    it('Выпадающий список шаблонов заблокирован.', function() {
                                        tester.select.
                                            withPlaceholder('Шаблон WABA').
                                            expectToBeDisabled();
                                    });
                                });
                                it('Изменен лейбл списка каналов.', function() {
                                    tester.select.
                                        withPlaceholder('Откуда писать, если не нашли диалог').
                                        expectToBeVisible();

                                    tester.select.
                                        withPlaceholder('Откуда писать').
                                        expectNotToExist();
                                });
                            });
                            describe('Открываю выпдающий список каналов.', function() {
                                beforeEach(function() {
                                    tester.select.
                                        withPlaceholder('Откуда писать').
                                        click();
                                });

                                it('Ввожу строку поиска. Список каналов отфильтрован.', function() {
                                    tester.select.popup.input.fill('wha');

                                    tester.select.popup.expectToHaveTextContent(
                                        'Whats App ' +
                                        'Whats App Waba'
                                    );
                                });
                                it('Отображены все каналы.', function() {
                                    tester.select.popup.expectToHaveTextContent(
                                        'mrDDosT ' +
                                        'Whats App ' +
                                        'Whats App Waba ' +
                                        'Telegram Private'
                                    );
                                });
                            });
                            it('Форма заполнена данными по умолчанию.', function() {
                                tester.spin.expectNotToExist();
                                tester.checkbox.expectNotToBeChecked();

                                tester.select.
                                    withPlaceholder('Откуда писать, если не нашли диалог').
                                    expectNotToExist();

                                tester.select.
                                    withPlaceholder('Откуда писать').
                                    expectToBeVisible();

                                tester.select.
                                    option('Whats App Waba').
                                    expectNotToExist();
                            });
                        });
                        return;
                        describe('Получены данные заполненной формы.', function() {
                            beforeEach(function() {
                                tester.savedValuesSettingRequest().
                                    settingsSaved().
                                    receive();

                                tester.messageTemplatesRequest().receiveResponse();
                            });

                            it('Снимаю отметку с чекбокса "Писать в последний диалог".', function() {
                                tester.checkbox.click();

                                tester.salesbotParamsSettingRequest().
                                    anotherChannel().
                                    messageTemplateChosen().
                                    messageFilled().
                                    filesAdded().
                                    expectToBeSent();
                            });
                            it('Форма заполнена.', function() {
                                tester.spin.expectNotToExist();
                                tester.checkbox.expectToBeChecked();

                                tester.select.
                                    withPlaceholder('Откуда писать, если не нашли диалог').
                                    expectToHaveTextContent(
                                        'Whats App Waba ' +
                                        'Откуда писать, если не нашли диалог'
                                    );

                                tester.textarea.expectToHaveValue(
                                    'Некое сообщение, отправляемое при каких-то изменениях свойств сделки'
                                );
                            });
                        });
                        it('Не удалось получить данные формы.', function() {
                            tester.savedValuesSettingRequest().
                                serverError().
                                receive();

                            tester.body.expectToHaveTextContent('Произошла ошибка сервера');
                        });
                        it('Отображён спиннер.', function() {
                            tester.spin.expectToBeVisible();
                        });
                    });
                    return;
                    it('Выпадающий список шаблонов WABA недоступен. Прикладывание файлов недоступно.', function() {
                        tester.savedValuesSettingRequest().receive();

                        messageTemplatesAvailable.
                            unavailable().
                            receiveResponse();

                        fileUploadingAvailable.
                            unavailable().
                            receiveResponse();

                        tester.select.
                            withPlaceholder('Откуда писать').
                            click();

                        tester.select.
                            option('Whats App Waba').
                            click();

                        tester.salesbotParamsSettingRequest().
                            anotherChannel().
                            expectToBeSent();

                        tester.select.
                            withPlaceholder('Шаблон WABA').
                            expectNotToExist();

                        tester.body.expectTextContentNotToHaveSubstring(
                            'Если приоритетным каналом окажется WABA'
                        );

                        tester.button('Прикрепить файл').expectNotToExist();
                    });
                });
                return;
                it('Нажимаю на иконку с жучком. В родительское окно отправлен запрос скачивания логов.', function() {
                    tester.bugButton.click();

                    tester.logDownloadingRequest().
                        windowMessage().
                        expectToBeSent();
                });
                it('Нажимаю на ссылку на страницу авторизации. Открыта страница авторизации.', function() {
                    tester.span('Для использования приложения необходимо авторизоваться').click();
                    windowOpener.expectToHavePath('https://uc-sso-amocrm-prod-api.uiscom.ru');
                });
                it('Отображена ссылка на страницу авторизции на русском языке', function() {
                    tester.body.expectToHaveTextContent(
                        'Не авторизован ' +
                        'Для использования приложения необходимо авторизоваться'
                    );
                });
            });
            return;
            it(
                'В профиле указан английский язык. Отображена ссылка на страницу авторизции на английском языке.',
            function() {
                tester.amocrmStateSettingRequest().en().receive();

                messageTemplatesAvailable = tester.
                    featureFlagRequest('salesbot_message_templates').
                    expectToBeSent();

                tester.tokenInitializationRequest().
                    salesbot().
                    emptyToken().
                    expectToBeSent();

                postMessages.receive({
                    method: 'set_token',
                    data: '',
                });

                postMessages.nextMessage().expectMessageToContain({
                    method: 'set_token',
                    data: '',
                });

                tester.body.expectToHaveTextContent(
                    'Not authorized ' +
                    'Please authorize to use application'
                );
            });
        });
        return;
        it('Открываю настройки Salesbot amoCRM в старом виджете.', function() {
            tester = new Tester({
                application: 'depricatedAmocrmSalesbotIframe',
                isIframe: true,
                ...options,
            });

            tester.salesbotParamsSettingRequest().
                depricated().
                expectToBeSent();

            fileUploadingAvailable = tester.
                featureFlagRequest('salesbot_file_uploading').
                expectToBeSent();

            messageTemplatesAvailable = tester.
                featureFlagRequest('salesbot_message_templates').
                expectToBeSent();
        });
    });
});
