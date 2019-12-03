tests.requireClass('Comagic.base.stepwise.Panel');

tests.addTest(function(requestsManager, testersFactory, wait, utils) {
    describe('Есть три шага.', function() {
        var step1Content,
            step2Content,
            step3Content,
            step1Tester,
            step2Tester,
            step3Tester,
            panel,
            step1Title,
            step2Title,
            step3Title,
            step1Container,
            step2Container,
            step3Container,
            step1Number,
            step2Number,
            step3Number;

        beforeEach(function() {
            step1Content = Ext.create('Ext.Component', {
                html: 'Content # 1'
            });

            step2Content = Ext.create('Ext.Component', {
                html: 'Content # 2'
            });

            step3Content = Ext.create('Ext.Component', {
                html: 'Content # 3'
            });

            panel = Ext.create('Comagic.base.stepwise.Panel', {
                applyButtonText: 'Подключить',
                nextButtonText: 'Далее',
                backButtonText: 'Назад',
                steps: [{
                    title: 'Step # 1',
                    stepId: 'step1',
                    content: step1Content
                }, {
                    title: 'Step # 2',
                    stepId: 'step2',
                    content: step2Content
                }, {
                    title: 'Step # 3',
                    stepId: 'step3',
                    content: step3Content
                }]
            });

            Comagic.getApplication().addToViewport(panel);

            step1Container = testersFactory.createComponentTester(
                step1Content.up('container').up('container'));

            step2Container = testersFactory.createComponentTester(
                step2Content.up('container').up('container'));

            step3Container = testersFactory.createComponentTester(
                step3Content.up('container').up('container'));

            step1NextButton = testersFactory.createComponentTester(
                step1Content.up('container').up('container').
                    down('button[text="Далее"]')
            );
            step1BackButton = testersFactory.createComponentTester(
                step1Content.up('container').up('container').
                    down('button[text="Назад"]')
            );

            step2NextButton = testersFactory.createComponentTester(
                step2Content.up('container').up('container').
                    down('button[text="Далее"]')
            );
            step2BackButton = testersFactory.createComponentTester(
                step2Content.up('container').up('container').
                    down('button[text="Назад"]')
            );

            step3NextButton = testersFactory.createComponentTester(
                step3Content.up('container').up('container').
                    down('button[text="Подключить"]')
            );
            step3BackButton = testersFactory.createComponentTester(
                step3Content.up('container').up('container').
                    down('button[text="Назад"]')
            );

            step1Title = testersFactory.createDomElementTester(function () {
                return Ext.fly(utils.findElementByTextContent(
                    step1Content.up('container').up('container').el.dom,
                    'Step # 1',
                    '.cm-stepwise-step-title-text'
                )).up('.x-component-cm-stepwise-step-title').dom;
            });

            step2Title = testersFactory.createDomElementTester(function () {
                return Ext.fly(utils.findElementByTextContent(
                    step2Content.up('container').up('container').el.dom,
                    'Step # 2',
                    '.cm-stepwise-step-title-text'
                )).up('.x-component-cm-stepwise-step-title').dom;
            });

            step3Title = testersFactory.createDomElementTester(function () {
                return Ext.fly(utils.findElementByTextContent(
                    step3Content.up('container').up('container').el.dom,
                    'Step # 3',
                    '.cm-stepwise-step-title-text'
                )).up('.x-component-cm-stepwise-step-title').dom;
            });
            
            step1Number = testersFactory.createComponentTester(function() {
                return step1Content.up('container').up('container').el.
                    down('.cm-stepwise-step-number');
            });

            step2Number = testersFactory.createComponentTester(function() {
                return step2Content.up('container').up('container').el.
                    down('.cm-stepwise-step-number');
            });

            step3Number = testersFactory.createComponentTester(function() {
                return step3Content.up('container').up('container').el.
                    down('.cm-stepwise-step-number');
            });

            step1Tester = testersFactory.createComponentTester(step1Content);
            step2Tester = testersFactory.createComponentTester(step2Content);
            step3Tester = testersFactory.createComponentTester(step3Content);
        });

        it('Активен первый шаг.', function() {
            step1Tester.expectToBeVisible();
            step2Tester.expectToBeHidden();
            step3Tester.expectToBeHidden();
        });
        it('Заголовок перового шага отмечен, как активный.', function() {
            step1Title.expectToHaveClass('cm-stepwise-step-title-active');
            step2Title.expectToHaveClass('cm-stepwise-step-title-unavailable');
            step3Title.expectToHaveClass('cm-stepwise-step-title-unavailable');
        });
        it('Шаги корректно пронумерованы.', function() {
            step1Number.expectToHaveContent('1');
            step2Number.expectToHaveContent('2');
            step3Number.expectToHaveContent('3');
        });
        it('Кнопка "Назад" заблокирована.', function() {
            step1BackButton.expectToBeDisabled();
        });
        it(
            'Кнопка перехода на следующий шаг содержит текст "Далее".',
        function() {
            step1NextButton.expectToHaveTextContent('Далее');
        });
        describe('Блокирую первый шаг.', function() {
            beforeEach(function() {
                panel.lockStep('step1');
            });

            it(
                'Кнопка перехода на следующий шаг заблокирована.',
            function() {
                step1NextButton.expectToBeDisabled();
            });
            it([
                'Снимаю блокировку с первого шага. Кнопка перехода на ',
                'следующий шаг доступна.'
            ].join(''), function() {
                panel.unlockStep('step1');
                step1NextButton.expectToBeEnabled();
            });
        });
        it(
            'Кнопка перехода на следующий шаг имеет стрелочку справа.',
        function() {
            step1Container.
                expectNotToHaveClass('cm-stepwise-step-container-last');
        });
        describe('Нажимаю на кнопку перехода на следующий шаг.', function() {
            beforeEach(function() {
                step1NextButton.click();
            });

            it(
                'Кнопка перехода на следующий шаг содержит текст "Далее".',
            function() {
                step2NextButton.expectToHaveTextContent('Далее');
            });
            it(
                'Кнопка перехода на следующий шаг имеет стрелочку справа.',
            function() {
                step2Container.
                    expectNotToHaveClass('cm-stepwise-step-container-last');
            });
            it([
                'Заголовок перового шага отмечен, как завершенный. Заголовок ',
                'второго шага отмечен, как активный.'
            ].join(''), function() {
                step1Title.
                    expectNotToHaveClass('cm-stepwise-step-title-active');
                step1Title.
                    expectToHaveClass('cm-stepwise-step-title-done');
                step2Title.
                    expectNotToHaveClass('cm-stepwise-step-title-unavailable');
                step2Title.
                    expectToHaveClass('cm-stepwise-step-title-active');
                step3Title.
                    expectToHaveClass('cm-stepwise-step-title-unavailable');
            });
            it('Кнопка "Назад" доступна.', function() {
                step2BackButton.expectToBeEnabled();
            });
            it('Активен второй шаг.', function() {
                step1Tester.expectToBeHidden();
                step2Tester.expectToBeVisible();
                step3Tester.expectToBeHidden();
            });
            it('Нажимаю на кнопку "Назад". Активен первый шаг.', function() {
                step2BackButton.click();

                step1Tester.expectToBeVisible();
                step2Tester.expectToBeHidden();
                step3Tester.expectToBeHidden();
            });
            describe(
                'Нажимаю на кнопку перехода на следующий шаг.',
            function() {
                beforeEach(function() {
                    step2NextButton.click();
                });

                it([
                    'Заголовки перового и второго шагов отмечены, как ',
                    'завершенные. Заголовок третьего шага отмечен, как ',
                    'активный.'
                ].join(''), function() {
                    step1Title.expectNotToHaveClass(
                        'cm-stepwise-step-title-active'
                    );
                    step1Title.expectToHaveClass(
                        'cm-stepwise-step-title-done'
                    );
                    step2Title. expectNotToHaveClass(
                        'cm-stepwise-step-title-unavailable'
                    );
                    step2Title.expectNotToHaveClass(
                        'cm-stepwise-step-title-active'
                    );
                    step2Title.expectToHaveClass(
                        'cm-stepwise-step-title-done'
                    );
                    step3Title.expectNotToHaveClass(
                        'cm-stepwise-step-title-unavailable'
                    );
                    step3Title.expectToHaveClass(
                        'cm-stepwise-step-title-active'
                    );
                });
                it([
                    'Кнопка перехода на следующий шаг содержит текст ',
                    '"Подключить".'
                ].join(''), function() {
                    step3NextButton.expectToHaveTextContent('Подключить');
                });
                it([
                    'Кнопка перехода на следующий шаг не имеет стрелочки ',
                    'справа.'
                ].join(''), function() {
                    step3Container.
                        expectToHaveClass('cm-stepwise-step-container-last');
                });
                it('Кнопка "Назад" доступна.', function() {
                    step3BackButton.expectToBeEnabled();
                });
                it('Активен третий шаг.', function() {
                    step1Tester.expectToBeHidden();
                    step2Tester.expectToBeHidden();
                    step3Tester.expectToBeVisible();
                });
                it(
                    'Нажимаю на кнопку "Назад". Активен второй шаг.',
                function() {
                    step3BackButton.click();

                    step1Tester.expectToBeHidden();
                    step2Tester.expectToBeVisible();
                    step3Tester.expectToBeHidden();
                });
            });
        });
        describe('Вызываю метод choose() второго шага.', function() {
            beforeEach(function() {
                panel.chooseStep('step2');
            });

            it(
                'Кнопка перехода на следующий шаг содержит текст "Далее".',
            function() {
                step2NextButton.expectToHaveTextContent('Далее');
            });
            it('Заголовок второго шага отмечен, как активный.', function() {
                step1Title.
                    expectToHaveClass('cm-stepwise-step-title-done');
                step2Title.
                    expectToHaveClass('cm-stepwise-step-title-active');
                step3Title.
                    expectToHaveClass('cm-stepwise-step-title-unavailable');
            });
            it('Кнопка "Назад" доступна.', function() {
                step2BackButton.expectToBeEnabled();
            });
            it('Активен второй шаг.', function() {
                step1Tester.expectToBeHidden();
                step2Tester.expectToBeVisible();
                step3Tester.expectToBeHidden();
            });
        });
        it('Видимы заголовки всех трех шагов.', function() {
            step1Title.expectToBeVisible();
            step2Title.expectToBeVisible();
            step3Title.expectToBeVisible();
        });
        describe('Вызваю метод disable() второго шага.', function() {
            beforeEach(function() {
                panel.skipStep('step2');
            });

            it('Заголовки всех трех шагов видимы и пронумерованы по порядку.', function() {
                step1Number.expectToHaveContent('1');
                step2Number.expectToHaveContent('2');
                step3Number.expectToHaveContent('3');
            });
            it('Нажимаю на кнопку "Далее". Активен третий шаг.', function() {
                step1NextButton.click();

                step1Tester.expectToBeHidden();
                step2Tester.expectToBeHidden();
                step3Tester.expectToBeVisible();
            });
            it('Вызваю метод enable() второго шага. Нажимаю на кнопку "Далее". Активен второй шаг.', function() {
                panel.unskipStep('step2');

                step1NextButton.click();

                step1Tester.expectToBeHidden();
                step2Tester.expectToBeVisible();
                step3Tester.expectToBeHidden();
            });
            it('Вызваю метод show() второго шага. Нажимаю на кнопку "Далее". Активен третий шаг.', function() {
                panel.includeStep('step2');

                step1NextButton.click();

                step1Tester.expectToBeHidden();
                step2Tester.expectToBeHidden();
                step3Tester.expectToBeVisible();
            });
        });
        describe([
            'Вызвыаю метод disable() второго шага. Вызываю метод hide() второго шага. Вызываю метод show() второго ',
            'шага.'
        ].join(''), function() {
            beforeEach(function() {
                panel.skipStep('step2');
                panel.excludeStep('step2');
                panel.includeStep('step2');
            });

            it('Шаги корректно пронумерованы.', function() {
                step1Number.expectToHaveContent('1');
                step2Number.expectToHaveContent('2');
                step3Number.expectToHaveContent('3');
            });
            it('Нажимаю на кнопку "Далее". Активен третий шаг.', function() {
                step1NextButton.click();

                step1Tester.expectToBeHidden();
                step2Tester.expectToBeHidden();
                step3Tester.expectToBeVisible();
            });
        });
        it([
            'Вызываю метод disable() второго шага. Вызываю метод hide() второго шага. Вызываю метод enable() второго ',
            'шага. Вызываю метод show() второго шага.'
        ].join(''), function() {
            panel.skipStep('step2');
            panel.excludeStep('step2');
            panel.unskipStep('step2');
            panel.includeStep('step2');

            step1NextButton.click();

            step1Tester.expectToBeHidden();
            step2Tester.expectToBeVisible();
            step3Tester.expectToBeHidden();
        });
        describe('Вызываю метод hide() второго шага. Вызываю метод disable() второго шага.', function() {
            beforeEach(function() {
                panel.excludeStep('step2');
                panel.skipStep('step2');
            });

            it('Шаги корректно пронумерованы.', function() {
                step1Number.expectToHaveContent('1');
                step3Number.expectToHaveContent('2');
            });
            it('Нажимаю на кнопку "Далее". Активен третий шаг.', function() {
                step1NextButton.click();

                step1Tester.expectToBeHidden();
                step2Tester.expectToBeHidden();
                step3Tester.expectToBeVisible();
            });
            describe('Вызываю метод show() второг шага.', function() {
                beforeEach(function() {
                    panel.includeStep('step2');
                });

                it('Шаги корректно пронумерованы.', function() {
                    step1Number.expectToHaveContent('1');
                    step2Number.expectToHaveContent('2');
                    step3Number.expectToHaveContent('3');
                });
                it('Нажимаю на кнопку "Далее". Активен третий шаг.', function() {
                    step1NextButton.click();

                    step1Tester.expectToBeHidden();
                    step2Tester.expectToBeHidden();
                    step3Tester.expectToBeVisible();
                });
            });
        });
        describe('Вызываю метод hide() второго шага. Вызываю метод enable() второго шага.', function() {
            beforeEach(function() {
                panel.excludeStep('step2');
                panel.unskipStep('step2');
            });

            it('Шаги корректно пронумерованы.', function() {
                step1Number.expectToHaveContent('1');
                step3Number.expectToHaveContent('2');
            });
            it('Нажимаю на кнопку "Далее". Активен третий шаг.', function() {
                step1NextButton.click();

                step1Tester.expectToBeHidden();
                step2Tester.expectToBeHidden();
                step3Tester.expectToBeVisible();
            });
        });
        describe('Скрываю второй шаг.', function() {
            beforeEach(function() {
                panel.excludeStep('step2');
            });

            it('Шаги корректно пронумерованы.', function() {
                step1Number.expectToHaveContent('1');
                step3Number.expectToHaveContent('2');
            });
            it(
                'Вызываю метод choose() второго шага. Активен первый шаг.',
            function() {
                panel.chooseStep('step2');

                step1Tester.expectToBeVisible();
                step2Tester.expectToBeHidden();
                step3Tester.expectToBeHidden();
            });
            it(
                'Кнопка перехода на следующий шаг содержит текст "Далее".',
            function() {
                step1NextButton.expectToHaveTextContent('Далее');
            });
            it('Активен первый шаг.', function() {
                step1Tester.expectToBeVisible();
                step2Tester.expectToBeHidden();
                step3Tester.expectToBeHidden();
            });
            it('Заголовок второго шага скрыт.', function() {
                step1Title.expectToBeVisible();
                step2Title.expectToBeHidden();
                step3Title.expectToBeVisible();
            });
            describe('Скрываю первый шаг.', function() {
                beforeEach(function() {
                    panel.excludeStep('step1');
                });

                it('Шаги корректно пронумерованы.', function() {
                    step3Number.expectToHaveContent('1');
                });
                it('Активен третий шаг.', function() {
                    step1Tester.expectToBeHidden();
                    step2Tester.expectToBeHidden();
                    step3Tester.expectToBeVisible();
                });
                it([
                    'Кнопка перехода на следующий шаг содержит текст ',
                    '"Подключить".'
                ].join(''), function() {
                    step3NextButton.expectToHaveTextContent('Подключить');
                });
                it('Кнопка "Назад" заблокирована.', function() {
                    step3BackButton.expectToBeDisabled();
                });
            });
            it([
                'Нажимаю на кнопку перехода на следующий шаг. Нажимаю на ',
                'кнопку перехода на следующий шаг. Кнопка "Назад" доступна.'
            ].join(''), function() {
                step1NextButton.click();
                step3BackButton.expectToBeEnabled();
            });
            describe('Показываю второй шаг.', function() {
                beforeEach(function() {
                    panel.includeStep('step2');
                });

                it('Шаги корректно пронумерованы.', function() {
                    step1Number.expectToHaveContent('1');
                    step2Number.expectToHaveContent('2');
                    step3Number.expectToHaveContent('3');
                });
                it('Активен первый шаг.', function() {
                    step1Tester.expectToBeVisible();
                    step2Tester.expectToBeHidden();
                    step3Tester.expectToBeHidden();
                });
                it('Видимы заголовки всех трех шагов.', function() {
                    step1Title.expectToBeVisible();
                    step2Title.expectToBeVisible();
                    step3Title.expectToBeVisible();
                });
                it([
                    'Нажимаю на кнопку перехода на следующий шаг. Активен ',
                    'второй шаг.'
                ].join(''), function() {
                    step1NextButton.click();

                    step1Tester.expectToBeHidden();
                    step2Tester.expectToBeVisible();
                    step3Tester.expectToBeHidden();
                });
            });
            describe(
                'Нажимаю на кнопку перехода на следующий шаг.',
            function() {
                beforeEach(function() {
                    step1NextButton.click();
                });

                it('Активен третий шаг.', function() {
                    step1Tester.expectToBeHidden();
                    step2Tester.expectToBeHidden();
                    step3Tester.expectToBeVisible();
                });
                it(
                    'Нажимаю на кнопку "Назад". Активен первый шаг.',
                function() {
                    step3BackButton.click();

                    step1Tester.expectToBeVisible();
                    step2Tester.expectToBeHidden();
                    step3Tester.expectToBeHidden();
                });
                describe('Показываю второй шаг.', function() {
                    beforeEach(function() {
                        panel.includeStep('step2');
                    });

                    it('Активен третий шаг.', function() {
                        step1Tester.expectToBeHidden();
                        step2Tester.expectToBeHidden();
                        step3Tester.expectToBeVisible();
                    });
                    it(
                        'Нажимаю на кнопку "Назад". Активен втрой шаг.',
                    function() {
                        step3BackButton.click();

                        step1Tester.expectToBeHidden();
                        step2Tester.expectToBeVisible();
                        step3Tester.expectToBeHidden();
                    });
                });
            });
        });
        describe('Скрываю первый шаг.', function() {
            beforeEach(function() {
                panel.excludeStep('step1');
            });

            it('Шаги корректно пронумерованы.', function() {
                step2Number.expectToHaveContent('1');
                step3Number.expectToHaveContent('2');
            });
            it('Активен второй шаг.', function() {
                step1Tester.expectToBeHidden();
                step2Tester.expectToBeVisible();
                step3Tester.expectToBeHidden();
            });
            it('Кнопка "Назад" заблокирована.', function() {
                step2BackButton.expectToBeDisabled();
            });
        });
        describe('Скрываю третий шаг.', function() {
            beforeEach(function() {
                panel.excludeStep('step3');
            });

            it('Шаги корректно пронумерованы.', function() {
                step1Number.expectToHaveContent('1');
                step2Number.expectToHaveContent('2');
            });
            describe(
                'Нажимаю на кнопку перехода на следующий шаг.',
            function() {
                beforeEach(function() {
                    step1NextButton.click();
                });

                it([
                    'Кнопка перехода на следующий шаг содержит текст ',
                    '"Подключить".'
                ].join(''), function() {
                    step2NextButton.expectToHaveTextContent('Подключить');
                });
                it([
                    'Кнопка перехода на следующий шаг не имеет стрелочки ',
                    'справа.'
                ].join(''), function() {
                    step2Container.
                        expectToHaveClass('cm-stepwise-step-container-last');
                });
                describe('Показываю третий шаг.', function() {
                    beforeEach(function() {
                        panel.includeStep('step3');
                    });

                    it('Активен второй шаг.', function() {
                        step1Tester.expectToBeHidden();
                        step2Tester.expectToBeVisible();
                        step3Tester.expectToBeHidden();
                    });
                    it([
                        'Кнопка перехода на следующий шаг содержит текст ',
                        '"Далее".'
                    ].join(''), function() {
                        step2NextButton.expectToHaveTextContent('Далее');
                    });
                    it([
                        'Кнопка перехода на следующий шаг имеет стрелочку ',
                        'справа.'
                    ].join(''), function() {
                        step2Container.expectNotToHaveClass(
                            'cm-stepwise-step-container-last');
                    });
                    it([
                        'Нажимаю на кнопку перехода на следующий шаг. Кнопка ',
                        'перехода на следующий шаг содержит текст "Подключить".'
                    ].join(''), function() {
                        step2NextButton.click();
                        step3NextButton.expectToHaveTextContent('Подключить');
                    });
                });
            });
        });
    });
    describe([
        'Есть четыре шага. Вызываю метод choose() второго шага до создания ',
        'панели.'
    ].join(''), function() {
        var panel,
            step1Title,
            step2Title,
            step3Title,
            step4Title,
            step1Content,
            step2Content,
            step3Content,
            step4Content,
            step1NextButton,
            step2NextButton,
            step3NextButton,
            step4NextButton,
            step1Tester,
            step2Tester,
            step3Tester,
            step4Tester,
            step1BackButton,
            step2BackButton,
            step3BackButton,
            step4BackButton;

        beforeEach(function() {
            step1Content = Ext.create('Ext.Component', {
                html: 'Content # 1'
            });
            
            step2Content = Ext.create('Ext.Component', {
                html: 'Content # 2'
            });

            step3Content = Ext.create('Ext.Component', {
                html: 'Content # 3'
            });

            step4Content = Ext.create('Ext.Component', {
                html: 'Content # 4'
            });

            panel = Ext.create('Comagic.base.stepwise.Panel', {
                applyButtonText: 'Подключить',
                nextButtonText: 'Далее',
                backButtonText: 'Назад',
                steps: [{
                    title: 'Step # 1',
                    stepId: 'step1',
                    content: step1Content
                }, {
                    title: 'Step # 2',
                    stepId: 'step2',
                    content: step2Content,
                    chosen: true
                }, {
                    title: 'Step # 3',
                    stepId: 'step3',
                    content: step3Content
                }, {
                    title: 'Step # 4',
                    stepId: 'step4',
                    content: step4Content
                }]
            });

            step1Tester = testersFactory.
                createComponentTester(step1Content);

            step2Tester = testersFactory.
                createComponentTester(step2Content);

            step3Tester = testersFactory.
                createComponentTester(step3Content);

            step4Tester = testersFactory.
                createComponentTester(step4Content);

            Comagic.getApplication().addToViewport(panel);

            step1NextButton = testersFactory.createComponentTester(
                function() {
                    return step1Content.up('container').up('container').
                        down('button[text="Далее"]');
                }
            );

            step2NextButton = testersFactory.createComponentTester(
                function() {
                    return step2Content.up('container').up('container').
                        down('button[text="Далее"]');
                }
            );

            step3NextButton = testersFactory.createComponentTester(
                function() {
                    return step3Content.up('container').up('container').
                        down('button[text="Далее"]');
                }
            );

            step4NextButton = testersFactory.createComponentTester(
                function() {
                    return step4Content.up('container').up('container').
                        down('button[text="Подключить"]');
                }
            );

            step1BackButton = testersFactory.createComponentTester(
                function() {
                    return step1Content.up('container').up('container').
                        down('button[text="Назад"]');
                }
            );

            step2BackButton = testersFactory.createComponentTester(
                function() {
                    return step2Content.up('container').up('container').
                        down('button[text="Назад"]');
                }
            );

            step3BackButton = testersFactory.createComponentTester(
                function() {
                    return step3Content.up('container').up('container').
                        down('button[text="Назад"]');
                }
            );

            step4BackButton = testersFactory.createComponentTester(
                function() {
                    return step4Content.up('container').up('container').
                        down('button[text="Назад"]');
                }
            );

            step1Title = testersFactory.createDomElementTester(function() {
                return Ext.fly(utils.findElementByTextContent(
                    step1Content.up('container').up('container').el.dom,
                    'Step # 1',
                    '.cm-stepwise-step-title-text'
                )).up('.x-component-cm-stepwise-step-title').dom;
            });

            step2Title = testersFactory.createDomElementTester(function() {
                return Ext.fly(utils.findElementByTextContent(
                    step2Content.up('container').up('container').el.dom,
                    'Step # 2',
                    '.cm-stepwise-step-title-text'
                )).up('.x-component-cm-stepwise-step-title').dom;
            });

            step3Title = testersFactory.createDomElementTester(function() {
                return Ext.fly(utils.findElementByTextContent(
                    step3Content.up('container').up('container').el.dom,
                    'Step # 3',
                    '.cm-stepwise-step-title-text'
                )).up('.x-component-cm-stepwise-step-title').dom;
            });

            step4Title = testersFactory.createDomElementTester(function() {
                return Ext.fly(utils.findElementByTextContent(
                    step4Content.up('container').up('container').el.dom,
                    'Step # 4',
                    '.cm-stepwise-step-title-text'
                )).up('.x-component-cm-stepwise-step-title').dom;
            });
        });

        it('Активен второй шаг.', function() {
            step1Tester.expectToBeHidden();
            step2Tester.expectToBeVisible();
            step3Tester.expectToBeHidden();
            step4Tester.expectToBeHidden();
        });
        it('Заголовок второго шага отмечен, как активный.', function() {
            step1Title.expectToHaveClass('cm-stepwise-step-title-done');
            step2Title.expectToHaveClass('cm-stepwise-step-title-active');
            step3Title.expectToHaveClass('cm-stepwise-step-title-unavailable');
            step4Title.expectToHaveClass('cm-stepwise-step-title-unavailable');
        });
        it('Кнопка "Назад" доступна.', function() {
            step2BackButton.expectToBeEnabled();
        });
        it(
            'Кнопка перехода на следующий шаг содержит текст "Далее".',
        function() {
            step2NextButton.expectToHaveTextContent('Далее');
        });
    });
    describe('Есть четыре шага.', function() {
        var panel,
            step1Title,
            step2Title,
            step3Title,
            step4Title,
            step1Content,
            step2Content,
            step3Content,
            step4Content,
            step1NextButton,
            step2NextButton,
            step3NextButton,
            step4NextButton,
            step1Tester,
            step2Tester,
            step3Tester,
            step4Tester,
            step1BackButton,
            step2BackButton,
            step3BackButton,
            step4BackButton,
            step1Number,
            step2Number,
            step3Number,
            step4Number;

        beforeEach(function() {
            step1Content = Ext.create('Ext.Component', {
                html: 'Content # 1'
            });
            
            step2Content = Ext.create('Ext.Component', {
                html: 'Content # 2'
            });

            step3Content = Ext.create('Ext.Component', {
                html: 'Content # 3'
            });

            step4Content = Ext.create('Ext.Component', {
                html: 'Content # 4'
            });

            panel = Ext.create('Comagic.base.stepwise.Panel', {
                applyButtonText: 'Подключить',
                nextButtonText: 'Далее',
                backButtonText: 'Назад',
                steps: [{
                    title: 'Step # 1',
                    stepId: 'step1',
                    content: step1Content
                }, {
                    title: 'Step # 2',
                    stepId: 'step2',
                    content: step2Content
                }, {
                    title: 'Step # 3',
                    stepId: 'step3',
                    content: step3Content
                }, {
                    title: 'Step # 4',
                    stepId: 'step4',
                    content: step4Content
                }]
            });

            step1Tester = testersFactory.
                createComponentTester(step1Content);

            step2Tester = testersFactory.
                createComponentTester(step2Content);

            step3Tester = testersFactory.
                createComponentTester(step3Content);

            step4Tester = testersFactory.
                createComponentTester(step4Content);

            Comagic.getApplication().addToViewport(panel);

            step1NextButton = testersFactory.createComponentTester(
                function() {
                    return step1Content.up('container').up('container').
                        down('button[text="Далее"]');
                }
            );

            step2NextButton = testersFactory.createComponentTester(
                function() {
                    return step2Content.up('container').up('container').
                        down('button[text="Далее"]');
                }
            );

            step3NextButton = testersFactory.createComponentTester(
                function() {
                    return step3Content.up('container').up('container').
                        down('button[text="Далее"]');
                }
            );

            step4NextButton = testersFactory.createComponentTester(
                function() {
                    return step4Content.up('container').up('container').
                        down('button[text="Подключить"]');
                }
            );

            step1BackButton = testersFactory.createComponentTester(
                function() {
                    return step1Content.up('container').up('container').
                        down('button[text="Назад"]');
                }
            );

            step2BackButton = testersFactory.createComponentTester(
                function() {
                    return step2Content.up('container').up('container').
                        down('button[text="Назад"]');
                }
            );

            step3BackButton = testersFactory.createComponentTester(
                function() {
                    return step3Content.up('container').up('container').
                        down('button[text="Назад"]');
                }
            );

            step4BackButton = testersFactory.createComponentTester(
                function() {
                    return step4Content.up('container').up('container').
                        down('button[text="Назад"]');
                }
            );

            step1Title = testersFactory.createDomElementTester(function() {
                return Ext.fly(utils.findElementByTextContent(
                    step1Content.up('container').up('container').el.dom,
                    'Step # 1',
                    '.cm-stepwise-step-title-text'
                )).up('.x-component-cm-stepwise-step-title').dom;
            });

            step2Title = testersFactory.createDomElementTester(function() {
                return Ext.fly(utils.findElementByTextContent(
                    step2Content.up('container').up('container').el.dom,
                    'Step # 2',
                    '.cm-stepwise-step-title-text'
                )).up('.x-component-cm-stepwise-step-title').dom;
            });

            step3Title = testersFactory.createDomElementTester(function() {
                return Ext.fly(utils.findElementByTextContent(
                    step3Content.up('container').up('container').el.dom,
                    'Step # 3',
                    '.cm-stepwise-step-title-text'
                )).up('.x-component-cm-stepwise-step-title').dom;
            });

            step4Title = testersFactory.createDomElementTester(function() {
                return Ext.fly(utils.findElementByTextContent(
                    step4Content.up('container').up('container').el.dom,
                    'Step # 4',
                    '.cm-stepwise-step-title-text'
                )).up('.x-component-cm-stepwise-step-title').dom;
            });

            step1Number = testersFactory.createComponentTester(
                function() {
                    return step1Content.up('container').up('container').el.
                        down('.cm-stepwise-step-number');
                }
            );

            step2Number = testersFactory.createComponentTester(
                function() {
                    return step2Content.up('container').up('container').el.
                        down('.cm-stepwise-step-number');
                }
            );

            step3Number = testersFactory.createComponentTester(
                function() {
                    return step3Content.up('container').up('container').el.
                        down('.cm-stepwise-step-number');
                }
            );

            step4Number = testersFactory.createComponentTester(
                function() {
                    return step4Content.up('container').up('container').el.
                        down('.cm-stepwise-step-number');
                }
            );
        });

        it('Шаги корректно пронумерованы.', function() {
            step1Number.expectToHaveContent('1');
            step2Number.expectToHaveContent('2');
            step3Number.expectToHaveContent('3');
            step4Number.expectToHaveContent('4');
        });
        it('Видимы заголовки всех четырех шагов.', function() {
            step1Title.expectToBeVisible();
            step2Title.expectToBeVisible();
            step3Title.expectToBeVisible();
            step4Title.expectToBeVisible();
        });
        it('Активен первый шаг.', function() {
            step1Tester.expectToBeVisible();
            step2Tester.expectToBeHidden();
            step3Tester.expectToBeHidden();
            step4Tester.expectToBeHidden();
        });
        it('Заголовок перового шага отмечен, как активный.', function() {
            step1Title.expectToHaveClass('cm-stepwise-step-title-active');
            step2Title.expectToHaveClass('cm-stepwise-step-title-unavailable');
            step3Title.expectToHaveClass('cm-stepwise-step-title-unavailable');
            step4Title.expectToHaveClass('cm-stepwise-step-title-unavailable');
        });
        it('Кнопка "Назад" заблокирована.', function() {
            step1BackButton.expectToBeDisabled();
        });
        it(
            'Кнопка перехода на следующий шаг содержит текст "Далее".',
        function() {
            step1NextButton.expectToHaveTextContent('Далее');
        });
        describe('Нажимаю на кнопку перехода на следующий шаг.', function() {
            beforeEach(function() {
                step1NextButton.click();
            });

            it('Активен второй шаг.', function() {
                step1Tester.expectToBeHidden();
                step2Tester.expectToBeVisible();
                step3Tester.expectToBeHidden();
                step4Tester.expectToBeHidden();
            });
            it('Заголовок второго шага отмечен, как активный.', function() {
                step1Title.
                    expectToHaveClass('cm-stepwise-step-title-done');
                step2Title.
                    expectToHaveClass('cm-stepwise-step-title-active');
                step3Title.
                    expectToHaveClass('cm-stepwise-step-title-unavailable');
                step4Title.
                    expectToHaveClass('cm-stepwise-step-title-unavailable');
            });
            it('Кнопка "Назад" доступна.', function() {
                step2BackButton.expectToBeEnabled();
            });
            it(
                'Кнопка перехода на следующий шаг содержит текст "Далее".',
            function() {
                step2NextButton.expectToHaveTextContent('Далее');
            });
            describe(
                'Нажимаю на кнопку перехода на следующий шаг.',
            function() {
                beforeEach(function() {
                    step2NextButton.click();
                });

                it('Активен третий шаг.', function() {
                    step1Tester.expectToBeHidden();
                    step2Tester.expectToBeHidden();
                    step3Tester.expectToBeVisible();
                    step4Tester.expectToBeHidden();
                });
                it(
                    'Заголовок третьего шага отмечен, как активный.',
                function() {
                    step1Title.expectToHaveClass(
                        'cm-stepwise-step-title-done'
                    );
                    step2Title.expectToHaveClass(
                        'cm-stepwise-step-title-done'
                    );
                    step3Title.expectToHaveClass(
                        'cm-stepwise-step-title-active'
                    );
                    step4Title.expectToHaveClass(
                        'cm-stepwise-step-title-unavailable'
                    );
                });
                it(
                    'Кнопка перехода на следующий шаг содержит текст "Далее".',
                function() {
                    step3NextButton.expectToHaveTextContent('Далее');
                });
                it('Кнопка "Назад" доступна.', function() {
                    step3BackButton.expectToBeEnabled();
                });
                describe(
                    'Нажимаю на кнопку перехода на следующий шаг.',
                function() {
                    beforeEach(function() {
                        step3NextButton.click();
                    });

                    it(
                        'Заголовок четвертого шага отмечен, как активный.',
                    function() {
                        step1Title.expectToHaveClass(
                            'cm-stepwise-step-title-done'
                        );
                        step2Title.expectToHaveClass(
                            'cm-stepwise-step-title-done'
                        );
                        step3Title.expectToHaveClass(
                            'cm-stepwise-step-title-done'
                        );
                        step4Title.expectToHaveClass(
                            'cm-stepwise-step-title-active'
                        );
                    });
                    it('Активен четвертый шаг.', function() {
                        step1Tester.expectToBeHidden();
                        step2Tester.expectToBeHidden();
                        step3Tester.expectToBeHidden();
                        step4Tester.expectToBeVisible();
                    });
                    it([
                        'Кнопка перехода на следующий шаг содержит текст ',
                        '"Подключить".'
                    ].join(''), function() {
                        step4NextButton.expectToHaveTextContent('Подключить');
                    });
                    it('Кнопка "Назад" доступна.', function() {
                        step4BackButton.expectToBeEnabled();
                    });
                });
            });
        });
    });
    describe([
        'Есть четыре шага. Вызываю метод hide() второго шага до создания ',
        'панели.'
    ].join(''), function() {
        var step1,
            step2,
            step3,
            step4,
            panel,
            step1Title,
            step2Title,
            step3Title,
            step4Title,
            step1Content,
            step2Content,
            step3Content,
            step4Content,
            step1NextButton,
            step2NextButton,
            step3NextButton,
            step4NextButton,
            step1Tester,
            step2Tester,
            step3Tester,
            step4Tester,
            step1BackButton,
            step2BackButton,
            step3BackButton,
            step4BackButton,
            step1Number,
            step2Number,
            step3Number,
            step4Number;

        beforeEach(function() {
            step1Content = Ext.create('Ext.Component', {
                html: 'Content # 1'
            });
            
            step2Content = Ext.create('Ext.Component', {
                html: 'Content # 2'
            });

            step3Content = Ext.create('Ext.Component', {
                html: 'Content # 3'
            });

            step4Content = Ext.create('Ext.Component', {
                html: 'Content # 4'
            });

            panel = Ext.create('Comagic.base.stepwise.Panel', {
                applyButtonText: 'Подключить',
                nextButtonText: 'Далее',
                backButtonText: 'Назад',
                steps: [{
                    title: 'Step # 1',
                    stepId: 'step1',
                    content: step1Content
                }, {
                    title: 'Step # 2',
                    stepId: 'step2',
                    content: step2Content,
                    excluded: true
                }, {
                    title: 'Step # 3',
                    stepId: 'step3',
                    content: step3Content
                }, {
                    title: 'Step # 4',
                    stepId: 'step4',
                    content: step4Content
                }]
            });

            step1Tester = testersFactory.
                createComponentTester(step1Content);

            step2Tester = testersFactory.
                createComponentTester(step2Content);

            step3Tester = testersFactory.
                createComponentTester(step3Content);

            step4Tester = testersFactory.
                createComponentTester(step4Content);

            Comagic.getApplication().addToViewport(panel);

            step1NextButton = testersFactory.createComponentTester(
                function() {
                    return step1Content.up('container').up('container').
                        down('button[text="Далее"]');
                }
            );

            step2NextButton = testersFactory.createComponentTester(
                function() {
                    return step2Content.up('container').up('container').
                        down('button[text="Далее"]');
                }
            );

            step3NextButton = testersFactory.createComponentTester(
                function() {
                    return step3Content.up('container').up('container').
                        down('button[text="Далее"]');
                }
            );

            step4NextButton = testersFactory.createComponentTester(
                function() {
                    return step4Content.up('container').up('container').
                        down('button[text="Подключить"]');
                }
            );

            step1BackButton = testersFactory.createComponentTester(
                function() {
                    return step1Content.up('container').up('container').
                        down('button[text="Назад"]');
                }
            );

            step2BackButton = testersFactory.createComponentTester(
                function() {
                    return step2Content.up('container').up('container').
                        down('button[text="Назад"]');
                }
            );

            step3BackButton = testersFactory.createComponentTester(
                function() {
                    return step3Content.up('container').up('container').
                        down('button[text="Назад"]');
                }
            );

            step4BackButton = testersFactory.createComponentTester(
                function() {
                    return step4Content.up('container').up('container').
                        down('button[text="Назад"]');
                }
            );

            step1Title = testersFactory.createDomElementTester(function() {
                return Ext.fly(utils.findElementByTextContent(
                    step1Content.up('container').up('container').el.dom,
                    'Step # 1',
                    '.cm-stepwise-step-title-text'
                )).up('.x-component-cm-stepwise-step-title').dom;
            });

            step2Title = testersFactory.createDomElementTester(function() {
                return Ext.fly(utils.findElementByTextContent(
                    step2Content.up('container').up('container').el.dom,
                    'Step # 2',
                    '.cm-stepwise-step-title-text'
                )).up('.x-component-cm-stepwise-step-title').dom;
            });

            step3Title = testersFactory.createDomElementTester(function() {
                return Ext.fly(utils.findElementByTextContent(
                    step3Content.up('container').up('container').el.dom,
                    'Step # 3',
                    '.cm-stepwise-step-title-text'
                )).up('.x-component-cm-stepwise-step-title').dom;
            });

            step4Title = testersFactory.createDomElementTester(function() {
                return Ext.fly(utils.findElementByTextContent(
                    step4Content.up('container').up('container').el.dom,
                    'Step # 4',
                    '.cm-stepwise-step-title-text'
                )).up('.x-component-cm-stepwise-step-title').dom;
            });

            step1Number = testersFactory.createComponentTester(
                function() {
                    return step1Content.up('container').up('container').el.
                        down('.cm-stepwise-step-number');
                }
            );

            step2Number = testersFactory.createComponentTester(
                function() {
                    return step2Content.up('container').up('container').el.
                        down('.cm-stepwise-step-number');
                }
            );

            step3Number = testersFactory.createComponentTester(
                function() {
                    return step3Content.up('container').up('container').el.
                        down('.cm-stepwise-step-number');
                }
            );

            step4Number = testersFactory.createComponentTester(
                function() {
                    return step4Content.up('container').up('container').el.
                        down('.cm-stepwise-step-number');
                }
            );
        });

        it('Шаги корректно пронумерованы.', function() {
            step1Number.expectToHaveContent('1');
            step3Number.expectToHaveContent('2');
            step4Number.expectToHaveContent('3');
        });
        it('Заголовок второго шага скрыт.', function() {
            step1Title.expectToBeVisible();
            step2Title.expectToBeHiddenOrNotExist();
            step3Title.expectToBeVisible();
            step4Title.expectToBeVisible();
        });
        it('Активен первый шаг.', function() {
            step1Tester.expectToBeVisible();
            step2Tester.expectToBeHidden();
            step3Tester.expectToBeHidden();
            step4Tester.expectToBeHidden();
        });
        it('Заголовок перового шага отмечен, как активный.', function() {
            step1Title.expectToHaveClass('cm-stepwise-step-title-active');
            step3Title.expectToHaveClass('cm-stepwise-step-title-unavailable');
            step4Title.expectToHaveClass('cm-stepwise-step-title-unavailable');
        });
        it('Кнопка "Назад" заблокирована.', function() {
            step1BackButton.expectToBeDisabled();
        });
        it(
            'Кнопка перехода на следующий шаг содержит текст "Далее".',
        function() {
            step1NextButton.expectToHaveTextContent('Далее');
        });
        describe('Нажимаю на кнопку перехода на следующий шаг.', function() {
            beforeEach(function() {
                step1NextButton.click();
            });

            it('Активен третий шаг.', function() {
                step1Tester.expectToBeHidden();
                step2Tester.expectToBeHidden();
                step3Tester.expectToBeVisible();
                step4Tester.expectToBeHidden();
            });
            it(
                'Заголовок третьего шага отмечен, как активный.',
            function() {
                step1Title.expectToHaveClass(
                    'cm-stepwise-step-title-done'
                );
                step3Title.expectToHaveClass(
                    'cm-stepwise-step-title-active'
                );
                step4Title.expectToHaveClass(
                    'cm-stepwise-step-title-unavailable'
                );
            });
            it(
                'Кнопка перехода на следующий шаг содержит текст "Далее".',
            function() {
                step3NextButton.expectToHaveTextContent('Далее');
            });
            it('Кнопка "Назад" доступна.', function() {
                step3BackButton.expectToBeEnabled();
            });
            describe(
                'Нажимаю на кнопку перехода на следующий шаг.',
            function() {
                beforeEach(function() {
                    step3NextButton.click();
                });

                it(
                    'Заголовок четвертого шага отмечен, как активный.',
                function() {
                    step1Title.expectToHaveClass(
                        'cm-stepwise-step-title-done'
                    );
                    step3Title.expectToHaveClass(
                        'cm-stepwise-step-title-done'
                    );
                    step4Title.expectToHaveClass(
                        'cm-stepwise-step-title-active'
                    );
                });
                it('Активен четвертый шаг.', function() {
                    step1Tester.expectToBeHidden();
                    step2Tester.expectToBeHidden();
                    step3Tester.expectToBeHidden();
                    step4Tester.expectToBeVisible();
                });
                it([
                    'Кнопка перехода на следующий шаг содержит текст ',
                    '"Подключить".'
                ].join(''), function() {
                    step4NextButton.expectToHaveTextContent('Подключить');
                });
                it('Кнопка "Назад" доступна.', function() {
                    step4BackButton.expectToBeEnabled();
                });
            });
        });
    });
    describe([
        'Есть четыре шага. Вызываю метод hide() первого шага до создания ',
        'панели.'
    ].join(''), function() {
        var panel,
            step1Title,
            step2Title,
            step3Title,
            step4Title,
            step1Content,
            step2Content,
            step3Content,
            step4Content,
            step1NextButton,
            step2NextButton,
            step3NextButton,
            step4NextButton,
            step1Tester,
            step2Tester,
            step3Tester,
            step4Tester,
            step1BackButton,
            step2BackButton,
            step3BackButton,
            step4BackButton,
            step1Number,
            step2Number,
            step3Number,
            step4Number;

        beforeEach(function() {
            step1Content = Ext.create('Ext.Component', {
                html: 'Content # 1'
            });
            
            step2Content = Ext.create('Ext.Component', {
                html: 'Content # 2'
            });

            step3Content = Ext.create('Ext.Component', {
                html: 'Content # 3'
            });

            step4Content = Ext.create('Ext.Component', {
                html: 'Content # 4'
            });

            panel = Ext.create('Comagic.base.stepwise.Panel', {
                applyButtonText: 'Подключить',
                nextButtonText: 'Далее',
                backButtonText: 'Назад',
                steps: [{
                    title: 'Step # 1',
                    stepId: 'step1',
                    content: step1Content,
                    excluded: true
                }, {
                    title: 'Step # 2',
                    stepId: 'step2',
                    content: step2Content
                }, {
                    title: 'Step # 3',
                    stepId: 'step3',
                    content: step3Content
                }, {
                    title: 'Step # 4',
                    stepId: 'step4',
                    content: step4Content
                }]
            });

            step1Tester = testersFactory.
                createComponentTester(step1Content);

            step2Tester = testersFactory.
                createComponentTester(step2Content);

            step3Tester = testersFactory.
                createComponentTester(step3Content);

            step4Tester = testersFactory.
                createComponentTester(step4Content);

            Comagic.getApplication().addToViewport(panel);

            step1NextButton = testersFactory.createComponentTester(
                function() {
                    return step1Content.up('container').up('container').
                        down('button[text="Далее"]');
                }
            );

            step2NextButton = testersFactory.createComponentTester(
                function() {
                    return step2Content.up('container').up('container').
                        down('button[text="Далее"]');
                }
            );

            step3NextButton = testersFactory.createComponentTester(
                function() {
                    return step3Content.up('container').up('container').
                        down('button[text="Далее"]');
                }
            );

            step4NextButton = testersFactory.createComponentTester(
                function() {
                    return step4Content.up('container').up('container').
                        down('button[text="Подключить"]');
                }
            );

            step1BackButton = testersFactory.createComponentTester(
                function() {
                    return step1Content.up('container').up('container').
                        down('button[text="Назад"]');
                }
            );

            step2BackButton = testersFactory.createComponentTester(
                function() {
                    return step2Content.up('container').up('container').
                        down('button[text="Назад"]');
                }
            );

            step3BackButton = testersFactory.createComponentTester(
                function() {
                    return step3Content.up('container').up('container').
                        down('button[text="Назад"]');
                }
            );

            step4BackButton = testersFactory.createComponentTester(
                function() {
                    return step4Content.up('container').up('container').
                        down('button[text="Назад"]');
                }
            );

            step1Title = testersFactory.createDomElementTester(function() {
                return Ext.fly(utils.findElementByTextContent(
                    step1Content.up('container').up('container').el.dom,
                    'Step # 1',
                    '.cm-stepwise-step-title-text'
                )).up('.x-component-cm-stepwise-step-title').dom;
            });

            step2Title = testersFactory.createDomElementTester(function() {
                return Ext.fly(utils.findElementByTextContent(
                    step2Content.up('container').up('container').el.dom,
                    'Step # 2',
                    '.cm-stepwise-step-title-text'
                )).up('.x-component-cm-stepwise-step-title').dom;
            });

            step3Title = testersFactory.createDomElementTester(function() {
                return Ext.fly(utils.findElementByTextContent(
                    step3Content.up('container').up('container').el.dom,
                    'Step # 3',
                    '.cm-stepwise-step-title-text'
                )).up('.x-component-cm-stepwise-step-title').dom;
            });

            step4Title = testersFactory.createDomElementTester(function() {
                return Ext.fly(utils.findElementByTextContent(
                    step4Content.up('container').up('container').el.dom,
                    'Step # 4',
                    '.cm-stepwise-step-title-text'
                )).up('.x-component-cm-stepwise-step-title').dom;
            });

            step1Number = testersFactory.createComponentTester(
                function() {
                    return step1Content.up('container').up('container').el.
                        down('.cm-stepwise-step-number');
                }
            );

            step2Number = testersFactory.createComponentTester(
                function() {
                    return step2Content.up('container').up('container').el.
                        down('.cm-stepwise-step-number');
                }
            );

            step3Number = testersFactory.createComponentTester(
                function() {
                    return step3Content.up('container').up('container').el.
                        down('.cm-stepwise-step-number');
                }
            );

            step4Number = testersFactory.createComponentTester(
                function() {
                    return step4Content.up('container').up('container').el.
                        down('.cm-stepwise-step-number');
                }
            );
        });

        it('Шаги корректно пронумерованы.', function() {
            step2Number.expectToHaveContent('1');
            step3Number.expectToHaveContent('2');
            step4Number.expectToHaveContent('3');
        });
        it('Заголовок первого шага скрыт.', function() {
            step1Title.expectToBeHiddenOrNotExist();
            step2Title.expectToBeVisible();
            step3Title.expectToBeVisible();
            step4Title.expectToBeVisible();
        });
        it('Активен второй шаг.', function() {
            step1Tester.expectToBeHidden();
            step2Tester.expectToBeVisible();
            step3Tester.expectToBeHidden();
            step4Tester.expectToBeHidden();
        });
        it('Заголовок второго шага отмечен, как активный.', function() {
            step2Title.expectToHaveClass('cm-stepwise-step-title-active');
            step3Title.expectToHaveClass('cm-stepwise-step-title-unavailable');
            step4Title.expectToHaveClass('cm-stepwise-step-title-unavailable');
        });
        it('Кнопка "Назад" заблокирована.', function() {
            step2BackButton.expectToBeDisabled();
        });
        it(
            'Кнопка перехода на следующий шаг содержит текст "Далее".',
        function() {
            step2NextButton.expectToHaveTextContent('Далее');
        });
        describe('Нажимаю на кнопку перехода на следующий шаг.', function() {
            beforeEach(function() {
                step2NextButton.click();
            });

            it('Активен третий шаг.', function() {
                step1Tester.expectToBeHidden();
                step2Tester.expectToBeHidden();
                step3Tester.expectToBeVisible();
                step4Tester.expectToBeHidden();
            });
            it(
                'Заголовок третьего шага отмечен, как активный.',
            function() {
                step2Title.expectToHaveClass(
                    'cm-stepwise-step-title-done'
                );
                step3Title.expectToHaveClass(
                    'cm-stepwise-step-title-active'
                );
                step4Title.expectToHaveClass(
                    'cm-stepwise-step-title-unavailable'
                );
            });
            it(
                'Кнопка перехода на следующий шаг содержит текст "Далее".',
            function() {
                step3NextButton.expectToHaveTextContent('Далее');
            });
            it('Кнопка "Назад" доступна.', function() {
                step3BackButton.expectToBeEnabled();
            });
            describe(
                'Нажимаю на кнопку перехода на следующий шаг.',
            function() {
                beforeEach(function() {
                    step3NextButton.click();
                });

                it(
                    'Заголовок четвертого шага отмечен, как активный.',
                function() {
                    step2Title.expectToHaveClass(
                        'cm-stepwise-step-title-done'
                    );
                    step3Title.expectToHaveClass(
                        'cm-stepwise-step-title-done'
                    );
                    step4Title.expectToHaveClass(
                        'cm-stepwise-step-title-active'
                    );
                });
                it('Активен четвертый шаг.', function() {
                    step1Tester.expectToBeHidden();
                    step2Tester.expectToBeHidden();
                    step3Tester.expectToBeHidden();
                    step4Tester.expectToBeVisible();
                });
                it([
                    'Кнопка перехода на следующий шаг содержит текст ',
                    '"Подключить".'
                ].join(''), function() {
                    step4NextButton.expectToHaveTextContent('Подключить');
                });
                it('Кнопка "Назад" доступна.', function() {
                    step4BackButton.expectToBeEnabled();
                });
            });
        });
    });
    describe([
        'Есть четыре шага. Вызываю метод hide() четвертого шага до создания ',
        'панели.'
    ].join(''), function() {
        var step1,
            step2,
            step3,
            step4,
            panel,
            step1Title,
            step2Title,
            step3Title,
            step4Title,
            step1Content,
            step2Content,
            step3Content,
            step4Content,
            step1NextButton,
            step2NextButton,
            step3NextButton,
            step4NextButton,
            step1Tester,
            step2Tester,
            step3Tester,
            step4Tester,
            step1BackButton,
            step2BackButton,
            step3BackButton,
            step4BackButton,
            step1Number,
            step2Number,
            step3Number,
            step4Number;

        beforeEach(function() {
            step1Content = Ext.create('Ext.Component', {
                html: 'Content # 1'
            });
            
            step2Content = Ext.create('Ext.Component', {
                html: 'Content # 2'
            });

            step3Content = Ext.create('Ext.Component', {
                html: 'Content # 3'
            });

            step4Content = Ext.create('Ext.Component', {
                html: 'Content # 4'
            });

            panel = Ext.create('Comagic.base.stepwise.Panel', {
                applyButtonText: 'Подключить',
                nextButtonText: 'Далее',
                backButtonText: 'Назад',
                steps: [{
                    title: 'Step # 1',
                    stepId: 'step1',
                    content: step1Content
                }, {
                    title: 'Step # 2',
                    stepId: 'step2',
                    content: step2Content
                }, {
                    title: 'Step # 3',
                    stepId: 'step3',
                    content: step3Content
                }, {
                    title: 'Step # 4',
                    stepId: 'step4',
                    content: step4Content,
                    excluded: true
                }]
            });

            step1Tester = testersFactory.
                createComponentTester(step1Content);

            step2Tester = testersFactory.
                createComponentTester(step2Content);

            step3Tester = testersFactory.
                createComponentTester(step3Content);

            step4Tester = testersFactory.
                createComponentTester(step4Content);

            Comagic.getApplication().addToViewport(panel);

            step1NextButton = testersFactory.createComponentTester(
                function() {
                    return step1Content.up('container').up('container').
                        down('button[text="Далее"]');
                }
            );

            step2NextButton = testersFactory.createComponentTester(
                function() {
                    return step2Content.up('container').up('container').
                        down('button[text="Далее"]');
                }
            );

            step3NextButton = testersFactory.createComponentTester(
                function() {
                    return step3Content.up('container').up('container').
                        down('button[text="Подключить"]');
                }
            );

            step4NextButton = testersFactory.createComponentTester(
                function() {
                    return step4Content.up('container').up('container').
                        down('button[text="Далее"]');
                }
            );

            step1BackButton = testersFactory.createComponentTester(
                function() {
                    return step1Content.up('container').up('container').
                        down('button[text="Назад"]');
                }
            );

            step2BackButton = testersFactory.createComponentTester(
                function() {
                    return step2Content.up('container').up('container').
                        down('button[text="Назад"]');
                }
            );

            step3BackButton = testersFactory.createComponentTester(
                function() {
                    return step3Content.up('container').up('container').
                        down('button[text="Назад"]');
                }
            );

            step4BackButton = testersFactory.createComponentTester(
                function() {
                    return step4Content.up('container').up('container').
                        down('button[text="Назад"]');
                }
            );

            step1Title = testersFactory.createDomElementTester(function() {
                return Ext.fly(utils.findElementByTextContent(
                    step1Content.up('container').up('container').el.dom,
                    'Step # 1',
                    '.cm-stepwise-step-title-text'
                )).up('.x-component-cm-stepwise-step-title').dom;
            });

            step2Title = testersFactory.createDomElementTester(function() {
                return Ext.fly(utils.findElementByTextContent(
                    step2Content.up('container').up('container').el.dom,
                    'Step # 2',
                    '.cm-stepwise-step-title-text'
                )).up('.x-component-cm-stepwise-step-title').dom;
            });

            step3Title = testersFactory.createDomElementTester(function() {
                return Ext.fly(utils.findElementByTextContent(
                    step3Content.up('container').up('container').el.dom,
                    'Step # 3',
                    '.cm-stepwise-step-title-text'
                )).up('.x-component-cm-stepwise-step-title').dom;
            });

            step4Title = testersFactory.createDomElementTester(function() {
                return Ext.fly(utils.findElementByTextContent(
                    step4Content.up('container').up('container').el.dom,
                    'Step # 4',
                    '.cm-stepwise-step-title-text'
                )).up('.x-component-cm-stepwise-step-title').dom;
            });

            step1Number = testersFactory.createComponentTester(
                function() {
                    return step1Content.up('container').up('container').el.
                        down('.cm-stepwise-step-number');
                }
            );

            step2Number = testersFactory.createComponentTester(
                function() {
                    return step2Content.up('container').up('container').el.
                        down('.cm-stepwise-step-number');
                }
            );

            step3Number = testersFactory.createComponentTester(
                function() {
                    return step3Content.up('container').up('container').el.
                        down('.cm-stepwise-step-number');
                }
            );

            step4Number = testersFactory.createComponentTester(
                function() {
                    return step4Content.up('container').up('container').el.
                        down('.cm-stepwise-step-number');
                }
            );
        });

        it('Шаги корректно пронумерованы.', function() {
            step1Number.expectToHaveContent('1');
            step2Number.expectToHaveContent('2');
            step3Number.expectToHaveContent('3');
        });
        it('Заголовок четвертого шага скрыт.', function() {
            step1Title.expectToBeVisible();
            step2Title.expectToBeVisible();
            step3Title.expectToBeVisible();
            step4Title.expectToBeHiddenOrNotExist();
        });
        it('Активен первый шаг.', function() {
            step1Tester.expectToBeVisible();
            step2Tester.expectToBeHidden();
            step3Tester.expectToBeHidden();
            step4Tester.expectToBeHidden();
        });
        it('Заголовок перового шага отмечен, как активный.', function() {
            step1Title.expectToHaveClass('cm-stepwise-step-title-active');
            step2Title.expectToHaveClass('cm-stepwise-step-title-unavailable');
            step3Title.expectToHaveClass('cm-stepwise-step-title-unavailable');
        });
        it('Кнопка "Назад" заблокирована.', function() {
            step1BackButton.expectToBeDisabled();
        });
        it(
            'Кнопка перехода на следующий шаг содержит текст "Далее".',
        function() {
            step1NextButton.expectToHaveTextContent('Далее');
        });
        describe('Нажимаю на кнопку перехода на следующий шаг.', function() {
            beforeEach(function() {
                step1NextButton.click();
            });

            it('Активен второй шаг.', function() {
                step1Tester.expectToBeHidden();
                step2Tester.expectToBeVisible();
                step3Tester.expectToBeHidden();
                step4Tester.expectToBeHidden();
            });
            it(
                'Заголовок второго шага отмечен, как активный.',
            function() {
                step1Title.expectToHaveClass(
                    'cm-stepwise-step-title-done'
                );
                step2Title.expectToHaveClass(
                    'cm-stepwise-step-title-active'
                );
                step3Title.expectToHaveClass(
                    'cm-stepwise-step-title-unavailable'
                );
            });
            it(
                'Кнопка перехода на следующий шаг содержит текст "Далее".',
            function() {
                step2NextButton.expectToHaveTextContent('Далее');
            });
            it('Кнопка "Назад" доступна.', function() {
                step2BackButton.expectToBeEnabled();
            });
            describe(
                'Нажимаю на кнопку перехода на следующий шаг.',
            function() {
                beforeEach(function() {
                    step2NextButton.click();
                });

                it(
                    'Заголовок третьего шага отмечен, как активный.',
                function() {
                    step1Title.expectToHaveClass(
                        'cm-stepwise-step-title-done'
                    );
                    step2Title.expectToHaveClass(
                        'cm-stepwise-step-title-done'
                    );
                    step3Title.expectToHaveClass(
                        'cm-stepwise-step-title-active'
                    );
                });
                it('Активен третий шаг.', function() {
                    step1Tester.expectToBeHidden();
                    step2Tester.expectToBeHidden();
                    step3Tester.expectToBeVisible();
                    step4Tester.expectToBeHidden();
                });
                it([
                    'Кнопка перехода на следующий шаг содержит текст ',
                    '"Подключить".'
                ].join(''), function() {
                    step3NextButton.expectToHaveTextContent('Подключить');
                });
                it('Кнопка "Назад" доступна.', function() {
                    step3BackButton.expectToBeEnabled();
                });
            });
        });
    });
});
