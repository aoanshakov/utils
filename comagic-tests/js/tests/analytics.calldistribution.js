tests.addTest(function(requestsManager, testersFactory, wait, utils) {
    describe('Открываю раздел "Отчеты/Общие отчеты/Распределение вызовов".', function() {
        var helper;

        beforeEach(function() {
            if (helper) {
                helper.destroy();
            }

            helper = new AnalyticsCallDistribution(requestsManager, testersFactory, utils);
        });

        describe(
            'Сервер ответил, что не кнопка "Внутренние звонки", ни кнопка "Внешние звонки" не должна быть нажатой.',
        function() {
            beforeEach(function() {
                helper.requestCallDistributionSettings().send();
                helper.requestCallDistributionReferenceData().send();
                helper.requestSecondDimensions().send();
                helper.requestSecondDimensions().setCallDistributionReportType().send();
                helper.requestCallDistributionGridData().send();
                helper.requestCallDistributionFilters().send();
                wait();
            });

            it('Кнопки "Внутренние звонки" и "Внешние звонки" не нажаты.', function() {
                helper.internalCallsButton.expectNotToHaveClass('x-btn-pressed');
                helper.externalCallsButton.expectNotToHaveClass('x-btn-pressed');
            });
            it((
                'Нажимаю на кнопку "Внутренние звонки". Отправлен запрос обновления состояния кнопок. Нажата кнопка ' +
                '"Внутренние звонки".'
            ), function() {
                helper.internalCallsButton.click();
                helper.requestCallDistributionSettingsUpdate().setIncludeInternalTrue().setIncludeExternalFalse().
                    send();
                helper.requestCallDistributionGridData().send();
                wait();

                helper.internalCallsButton.expectToHaveClass('x-btn-pressed');
                helper.externalCallsButton.expectNotToHaveClass('x-btn-pressed');
            });
            describe('Нажимаю на кнопку "Внешние звонки". Отправлен запрос обновления состояния кнопок.', function() {
                beforeEach(function() {
                    helper.externalCallsButton.click();
                    helper.requestCallDistributionSettingsUpdate().setIncludeInternalFalse().setIncludeExternalTrue().
                        send();
                    helper.requestCallDistributionGridData().send();
                    wait();
                });

                it('Нажата кнопка "Внешние звонки".', function() {
                    helper.internalCallsButton.expectNotToHaveClass('x-btn-pressed');
                    helper.externalCallsButton.expectToHaveClass('x-btn-pressed');
                });
                describe(
                    'Нажимаю на кнопку "Внутренние звонки". Отправлен запрос обновления состояния кнопок.',
                function() {
                    beforeEach(function() {
                        helper.internalCallsButton.click();
                        helper.requestCallDistributionSettingsUpdate().setIncludeInternalTrue().
                            setIncludeExternalTrue().send();
                        helper.requestCallDistributionGridData().send();
                        wait();
                    });

                    it('Нажаты кнопки "Внутренние звонки" и "Внешние звонки".', function() {
                        helper.internalCallsButton.expectToHaveClass('x-btn-pressed');
                        helper.externalCallsButton.expectToHaveClass('x-btn-pressed');
                    });
                    it((
                        'Нажимаю на кнопку "Внешние звонки". Отправлен запрос обновления состояния кнопок. Нажата ' +
                        'кнопка "Внутренние звонки".'
                    ), function() {
                        helper.externalCallsButton.click();
                        helper.requestCallDistributionSettingsUpdate().setIncludeInternalTrue().
                            setIncludeExternalFalse().send();
                        helper.requestCallDistributionGridData().send();
                        wait();

                        helper.internalCallsButton.expectToHaveClass('x-btn-pressed');
                        helper.externalCallsButton.expectNotToHaveClass('x-btn-pressed');
                    });
                });
            });
        });
        describe('Сервер ответил, что кнопка "Внутренние звонки" должна быть нажатой.', function() {
            beforeEach(function() {
                helper.requestCallDistributionSettings().includeInternal().send();
                helper.requestCallDistributionReferenceData().send();
                helper.requestSecondDimensions().send();
                helper.requestSecondDimensions().setCallDistributionReportType().send();
                helper.requestCallDistributionGridData().send();
                helper.requestCallDistributionFilters().send();
                wait();
            });

            it('Нажата кнопка "Внутренние звонки".', function() {
                helper.internalCallsButton.expectToHaveClass('x-btn-pressed');
                helper.externalCallsButton.expectNotToHaveClass('x-btn-pressed');
            });
            describe((
                'Нажимаю на кнопку "Внутренние звонки". Отправлен запрос обновления состояния кнопок, ' +
                'устанавливающий нажатое состояние обеих кнопок.'
            ), function() {
                beforeEach(function() {
                    helper.internalCallsButton.click();
                    helper.requestCallDistributionSettingsUpdate().setIncludeInternalTrue().setIncludeExternalTrue().
                        send();
                    helper.requestCallDistributionGridData().send();
                    wait();
                });

                it('Кнопки "Внутренние звонки" и "Внешние звонки" не нажаты.', function() {
                    helper.internalCallsButton.expectNotToHaveClass('x-btn-pressed');
                    helper.externalCallsButton.expectNotToHaveClass('x-btn-pressed');
                });
                it((
                    'Нажимаю на кнопку "Внутренние звонки". Отправлен запрос обновления состояния кнопок. Нажата ' +
                    'кнопка "Внутренние звонки".'
                ), function() {
                    helper.internalCallsButton.click();
                    helper.requestCallDistributionSettingsUpdate().setIncludeInternalTrue().setIncludeExternalFalse().
                        send();
                    helper.requestCallDistributionGridData().send();
                    wait();

                    helper.internalCallsButton.expectToHaveClass('x-btn-pressed');
                    helper.externalCallsButton.expectNotToHaveClass('x-btn-pressed');
                });
            });
            it((
                'Нажимаю на кнопку "Внешние звонки". Отправлен запрос обновления состояния кнопок. Нажаты кнопки ' +
                '"Внутренние звонки" и "Внешние звонки".'
            ), function() {
                helper.externalCallsButton.click();
                helper.requestCallDistributionSettingsUpdate().setIncludeInternalTrue().setIncludeExternalTrue().send();
                helper.requestCallDistributionGridData().send();
                wait();

                helper.internalCallsButton.expectToHaveClass('x-btn-pressed');
                helper.externalCallsButton.expectToHaveClass('x-btn-pressed');
            });
        });
        it(
            'Сервер ответил, что кнопка "Внешние звонки" должна быть нажатой. Нажата кнопка "Внешние звонки".',
        function() {
            helper.requestCallDistributionSettings().includeExternal().send();
            helper.requestCallDistributionReferenceData().send();
            helper.requestSecondDimensions().send();
            helper.requestSecondDimensions().setCallDistributionReportType().send();
            helper.requestCallDistributionGridData().send();
            helper.requestCallDistributionFilters().send();
            wait();

            helper.internalCallsButton.expectNotToHaveClass('x-btn-pressed');
            helper.externalCallsButton.expectToHaveClass('x-btn-pressed');
        });
        describe('Сервер ответил, что кнопки "Внутренние звонки" и "Внешние звонки" должны быть нажатыми.', function() {
            beforeEach(function() {
                helper.requestCallDistributionSettings().includeInternal().includeExternal().send();
                helper.requestCallDistributionReferenceData().send();
                helper.requestSecondDimensions().send();
                helper.requestSecondDimensions().setCallDistributionReportType().send();
                helper.requestCallDistributionGridData().send();
                helper.requestCallDistributionFilters().send();
                wait();
            });

            it('Нажаты кнопки "Внутренние звонки" и "Внешние звонки".', function() {
                helper.internalCallsButton.expectToHaveClass('x-btn-pressed');
                helper.externalCallsButton.expectToHaveClass('x-btn-pressed');
            });
            it((
                'Нажимаю на кнопку "Внутренние звонки". Отправлен запрос обновления состояния кнопок. Нажата кнопка ' +
                '"Внешние звонки".'
            ), function() {
                helper.internalCallsButton.click();
                helper.requestCallDistributionSettingsUpdate().setIncludeInternalFalse().setIncludeExternalTrue().
                    send();
                helper.requestCallDistributionGridData().send();
                wait();

                helper.internalCallsButton.expectNotToHaveClass('x-btn-pressed');
                helper.externalCallsButton.expectToHaveClass('x-btn-pressed');
            });
        });
    });
});
