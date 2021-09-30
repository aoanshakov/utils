tests.addTest(function(args) {
    var requestsManager = args.requestsManager,
        testersFactory = args.testersFactory,
        wait = args.wait,
        utils = args.utils,
        postMessagesTester = args.postMessagesTester,
        windowOpener = args.windowOpener,
        tester;

    beforeEach(function() {
        tester = new EasystartBitrix(args);
    });

    afterEach(function () {
        tester.afterEach();
    });

    describe(
        'Открываю страницу легкого входа Битрикс24. Нажимаю на кнопку "Тестировать бесплатно". Нажимаю на кнопку ' +
        '"Продолжить". В соответствии с данными, полученными от сервера ни один сотрудник не был выбран ранее.',
    function() {
        beforeEach(function() {
            EasyStart.getApplication().checkIfPartnerReady();
            wait();
            tester.tryForFreeButton.click();
            tester.requestCreateAccount().send();
            wait(10);

            tester.settingsStep('Номер телефона').nextButton().click();
            tester.requestEmployees().setNoEmployeesSelected().send();
            wait(10);
        });

        describe('Выбираю одного сотрудника.', function() {
            beforeEach(function() {
                tester.employeesGrid.row().atIndex(1).column().first().checkbox().click();
                wait(10);
            });

            describe('Нажимаю на кнопку "Продолжить".', function() {
                beforeEach(function() {
                    tester.settingsStep('Сотрудники').nextButton().click();
                    tester.requestChooseEmployees().setOnlyOneEmployeeSelected().setQueue().send();
                    tester.requestSyncEmployees().setDone().send();
                    wait(10);
                });

                it('Кнопки выбора типа переадресации скрыты.', function() {
                    tester.forwardingTypeButtons.expectToBeHidden();
                });
                describe(
                    'Ввожу номер телефона. Нажимаю на кнопку "Получить SMS". Ввожу код. Нажимаю на кнопку ' +
                    '"Подтвердить".',
                function() {
                    beforeEach(function() {
                        tester.employeePhoneField().input('9161234567');
                        wait(10);

                        tester.receiveSmsButton.click();
                        tester.requestSms().setOnlyOneEmployeeSelected().send();
                        wait(10);

                        tester.smsCodeField().input('1234');
                        wait(10);
                        
                        tester.confirmNumberButton.click();
                        tester.requestCodeInput().setOnlyOneEmployeeSelected().send();
                        wait(10);
                    });

                    it(
                        'Нажимаю на кнопку "Назад". Нажимаю на кнопку "Продолжить". Кнопка "Продолжить" доступна.',
                    function() {
                        tester.settingsStep('Правила обработки вызовов').backButton().click();
                        wait(10);

                        tester.settingsStep('Сотрудники').nextButton().click();
                        wait(10);
                        tester.requestChooseEmployees().setOnlyOneEmployeeSelected().setVerified().send();
                        wait(10);
                        tester.requestSyncEmployees().setDone().send();
                        wait(10);

                        tester.settingsStep('Правила обработки вызовов').nextButton().expectToBeEnabled();
                    });
                    it(
                        'Нажимаю на кнпоку "Продолжить". Отправлен запрос сохранения правил обработки вызовов, в ' +
                        'котором передан тип переадресации "Одновременно всем".',
                    function() {
                        tester.settingsStep('Правила обработки вызовов').nextButton().click();
                        tester.requestCallProcessingConfig().setOtherEmployee().setAll().send();
                    });
                });
            });
            it('Кнопка "Продолжить" доступна.', function() {
                tester.settingsStep('Сотрудники').nextButton().expectToBeEnabled();
            });
            it('Снимаю отметку с единственного отмеченного сотрудника. Кнопка "Продолжить" заблокирована.', function() {
                tester.employeesGrid.row().atIndex(1).column().first().checkbox().click();
                wait(10);

                tester.settingsStep('Сотрудники').nextButton().expectToBeDisabled();
            });
        });
        it('Кнопка "Продолжить" заблокирована.', function() {
            tester.settingsStep('Сотрудники').nextButton().expectToBeDisabled();
        });
    });
    describe('Нажимаю на кнопку "Тестировать бесплатно".', function() {
        beforeEach(function() {
            EasyStart.getApplication().checkIfPartnerReady();
            wait();
            tester.tryForFreeButton.click();
        });

        describe('От сервера получен выделенный номер телефона.', function() {
            beforeEach(function() {
                tester.requestCreateAccount().send();
                wait();
            });

            it(
                'Помещаю курсор мыши над текстом "Как выбрать другой номер". Отображается всплывающая подсказка.',
            function() {
                tester.tooltipTrigger.putMouseOver();
                tester.titleOfPhoneNumberTooltip.expectToBeVisible();
            });
            it('Отображен номер телефона.', function() {
                tester.phoneNumber.expectToHaveTextContent('+7 (903) 123-45-67');
            });
        });
        it('Сервер отвечает, что пользователь заблокирован. Отображено сообщение об ошибке.', function() {
            tester.requestCreateAccount().setArchive().send();
            wait();

            tester.errorMessage(function (textContent) {
                return textContent.indexOf(
                    'Пользователь с e-mail chigrakov@example.com уже существует и находится в статусе "Заблокирован".'
                ) != -1;
            }).expectToBeVisible();
        });
        it('Сервер отвечает, что пользователь уже существует. Отображено сообщение об ошибке.', function() {
            tester.requestCreateAccount().setActive().send();
            wait();

            tester.errorMessage(function (textContent) {
                return textContent.indexOf('Пользователь с e-mail chigrakov@example.com уже существует.') != -1;
            }).expectToBeVisible();
        });
        it('Сервер отвечает, что E-Mail уже привязан к другой интеграции. Отображено сообщение об ошибке.', function() {
            tester.requestCreateAccount().setIdMismatch().send();
            wait();

            tester.errorMessage('E-mail chigrakov@example.com уже привязан к другой интеграции').expectToBeVisible();
        });
        it('Сервер отвечает, что номер телефона не был указан в профиле. Отображено сообщение об ошибке.', function() {
            tester.requestCreateAccount().setNoPhone().send();
            wait();

            tester.errorMessage('Пожалуйста, укажите номер телефона в своем профиле в Битрикс24').expectToBeVisible();
        });
        it(
            'Сервер отвечает, что аккаунт Битрикс24 уже привязан к аккануту UIS. Отображено сообщение об ошибке.',
        function() {
            tester.requestCreateAccount().setExtIdWasAlreadyUsed().send();
            wait();

            tester.errorMessage(function (textContent) {
                return textContent.indexOf('Ваша учетная запись Битрикс уже использовалась в аккаунте UIS.') != -1;
            }).expectToBeVisible();
        });
    });
    describe('Открываю страницу легкого входа Битрикс24. Приложение уже установлено.', function() {
        beforeEach(function() {
            tester.isInstalled();
            EasyStart.getApplication().checkIfPartnerReady();
            wait();
        });

        describe('Нажимаю на вход в колл-центр.', function() {
            var iframe;

            beforeEach(function() {
                tester.callCenterOpeningButton.click();
                tester.callCenterAuthRequest().receiveResponse();

                iframe = document.querySelector('iframe');
            });

            afterEach(function() {
                iframe && document.body.removeChild(iframe);
            });

            describe('Ответ на запрос аутентификации отправлен в Iframe с РМР. ', function() {
                beforeEach(function() {
                    Object.defineProperty((iframe || {}), 'contentWindow', {
                        get: function () {
                            return window.parent;
                        }
                    });
                });

                it('Получно сообщение не от Iframe c РМР. Ничего не происходит.', function() {
                    utils.receiveWindowMessage({
                        data: 'ready',
                        origin: 'https://otherdomain.ru'
                    });
                });
                it('Получно сообщение от Iframe c РМР. Открыт РМР.', function() {
                    utils.receiveWindowMessage({
                        data: 'ready',
                        origin: 'https://mynonexistent.ru'
                    });

                    postMessagesTester.expectMessageToBeSent('{"token":"XhaIfhS93shg"}');

                    utils.receiveWindowMessage({
                        data: 'received',
                        origin: 'https://mynonexistent.ru'
                    });

                    windowOpener.expectToHavePath('https://mynonexistent.ru/workplace/');
                });
            });
            it('Открыт Iframe с РМР.', function() {
                var expectedSrc = 'https://mynonexistent.ru/?auth';

                if (!iframe) {
                    throw new Error(
                        'Должен быть открыт Iframe со страницей "' + expectedSrc + '", однако Iframe не был открыт.'
                    );
                }

                if (iframe.src != expectedSrc) {
                    throw new Error(
                        'Должен быть открыт Iframe со страницей "' + expectedSrc + '", однако была открыта страница "' +
                        iframe.src + '".'
                    );
                }
            });
        });
        it('Кнопка "Тестировать бесплатно" скрыта.', function() {
            tester.tryForFreeButton.expectToBeHidden();
            tester.mainPageHeader.expectTextContentToHaveSubstring('Приложение установлено');

            tester.anchor('справочном центре CoMagic').expectHrefToHavePath(
                'https://help.comagic.ru/knowledge-bases/12-spravochnyij-tsentr/categories/' +
                '134-integratsiya-s-bitriks24/articles'
            );
        });
    });
    describe('Открываю страницу легкого входа Битрикс24. Приложение еще не установлено.', function() {
        beforeEach(function() {
            EasyStart.getApplication().checkIfPartnerReady();
            wait();
        });
        
        it('Нажимаю на кнопку "Завершить установку". Установка завершена.', function() {
            tester.button('Завершить установку').click();
            tester.expectInstallFinishToBeCalled();
        });
        it('Отображена страница с ссылкой на легкий вход.', function() {
            tester.tryForFreeButton.expectToBeVisible();
            tester.mainPageHeader.expectTextContentToHaveSubstring('Попробуйте UIS');
        });
    });
    it(
        'Открываю страницу легкого входа amoCRM. Нажимаю на кнопку "Тестировать бесплатно". Нажимаю на кнпоку ' +
        '"Продолжить". В соответствии с данными, полученными от сервера ранее были выбраны три сотрудника. Чебоксы ' +
        'отмечены в трех строках таблицы сотрудников.',
    function() {
        EasyStart.getApplication().checkIfPartnerReady();
        wait();
        tester.tryForFreeButton.click();
        tester.requestCreateAccount().send();
        wait(100);

        tester.settingsStep('Номер телефона').nextButton().click();
        tester.requestEmployees().send();
        wait(100);

        tester.employeesGrid.row().first().expectNotToBeSelected();
        tester.employeesGrid.row().atIndex(1).expectToBeSelected();
        tester.employeesGrid.row().atIndex(2).expectNotToBeSelected();
        tester.employeesGrid.row().atIndex(3).expectToBeSelected();
        tester.employeesGrid.row().atIndex(4).expectNotToBeSelected();
        tester.employeesGrid.row().atIndex(5).expectNotToBeSelected();
        tester.employeesGrid.row().atIndex(6).expectNotToBeSelected();
        tester.employeesGrid.row().atIndex(7).expectNotToBeSelected();
        tester.employeesGrid.row().atIndex(8).expectToBeSelected();
        tester.employeesGrid.row().atIndex(9).expectNotToBeSelected();
    });
    it(
        'Открываю страницу легкого входа Битрикс24. Произошла фатальная ошибка. Отображено сообщение об ошибке.',
    function() {
        tester.setFatalError();
        EasyStart.getApplication().checkIfPartnerReady();
        wait(10);
        tester.fatalErrorMessage.expectToBeVisible();
    });
});
