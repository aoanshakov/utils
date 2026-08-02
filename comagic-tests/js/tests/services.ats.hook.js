tests.addTest(function(args) {
    var wait = args.wait;

    describe('Открываю раздел "Сервисы/Виртуальная АТС/Уведомления".', function() {
        var tester;

        beforeEach(function() {
            if (tester) {
                tester.destroy();
            }

            tester = new ServicesAtsHook(args);

            Comagic.Directory.load();
        });

        describe('Использую данные 59171.', function() {
            beforeEach(function() {
                tester.batchReloadRequest().
                    app59171().
                    receiveResponse();

                tester.actionIndex({
                    recordId: 104561
                });
            });

            describe('Добавляю второе условие', function() {
                beforeEach(function() {
                    tester.hookRequest().
                        app59171().
                        singleConditionGroup().
                        receiveResponse();

                    const firstConditionsRequest = tester.conditionsRequest().
                        app59171().
                        expectToBeSent();
                        //receiveResponse();

                    const secondConditionsRequest = tester.conditionsRequest().
                        app59171().
                        fourthEventVersionSpecified().
                        expectToBeSent();
                        //receiveResponse();

                    //secondConditionsRequest.receiveResponse();
                    //firstConditionsRequest.receiveResponse();

                    wait();
                    wait();
                    wait();
                    wait();

                    secondConditionsRequest.receiveResponse();

                    wait();
                    wait();
                    wait();
                    wait();

                    tester.button('Добавить группу условий').click();

                    wait();
                    wait();
                    wait();
                    wait();

                    tester.conditionGroup().
                        atIndex(1).
                        combobox().
                        withPlaceholder('Выберите показатель').
                        click();

                    tester.treeNode('Причина потери').click();

                    tester.conditionGroup().
                        atIndex(1).
                        combobox().
                        withPlaceholder('Выберите условие').
                        click();

                    tester.conditionGroup().
                        atIndex(1).
                        combobox().
                        withPlaceholder('Выберите условие').
                        option('Точно соответствует').
                        click();

                    wait();
                });

                it('выбирая значение из списка.', function() {
                    tester.conditionGroup().
                        atIndex(1).
                        combobox().
                        withValue('').
                        clickArrow();

                    tester.conditionGroup().
                        atIndex(1).
                        combobox().
                        withValue('').
                        option('Не дозвонились до сотрудника').
                        click();

                    tester.button('Сохранить').click();
                    //tester.hookSavingRequest().receiveResponse();

                });
                return;
                it('вводя значение в поле.', function() {
                    tester.conditionGroup().
                        atIndex(1).
                        combobox().
                        withValue('').
                        fill('Не дозвонились до сотрудника');

                    tester.button('Сохранить').click();
                    //tester.hookSavingRequest().receiveResponse();
                });
            });
            return;
            describe('Добавляю два условия.', function() {
                beforeEach(function() {
                    tester.hookRequest().
                        app59171().
                        noConditionGroup().
                        receiveResponse();

                    tester.conditionsRequest().
                        app59171().
                        receiveResponse();

                    tester.conditionsRequest().
                        app59171().
                        fourthEventVersionSpecified().
                        receiveResponse();

                    wait();
                    wait();
                    wait();
                    wait();

                    tester.button('Добавить группу условий').click();

                    wait();
                    wait();
                    wait();
                    wait();

                    tester.conditionGroup().
                        first().
                        combobox().
                        withPlaceholder('Выберите показатель').
                        click();

                    tester.treeNode('Список вызванных групп сотрудников').click();
                    
                    wait();
                    wait();
                    wait();
                    wait();
                    wait();
                    wait();

                    tester.conditionGroup().
                        first().
                        combobox().
                        withPlaceholder('Выберите условие').
                        click();

                    wait();
                    wait();
                    wait();
                    wait();
                    wait();
                    wait();

                    tester.conditionGroup().
                        first().
                        combobox().
                        withPlaceholder('Выберите условие').
                        option('Точно соответствует').
                        click();

                    wait();
                    wait();
                    wait();
                    wait();
                    wait();
                    wait();

                    tester.conditionGroup().
                        first().
                        combobox().
                        withValue('').
                        clickArrow();

                    tester.conditionGroup().
                        first().
                        combobox().
                        withValue('').
                        option('09. НАГ').
                        click();

                    tester.button('Добавить группу условий').click();

                    wait();
                    wait();
                    wait();
                    wait();

                    tester.conditionGroup().
                        atIndex(1).
                        combobox().
                        withPlaceholder('Выберите показатель').
                        click();

                    tester.treeNode('Причина потери').click();

                    tester.conditionGroup().
                        atIndex(1).
                        combobox().
                        withPlaceholder('Выберите условие').
                        click();

                    tester.conditionGroup().
                        atIndex(1).
                        combobox().
                        withPlaceholder('Выберите условие').
                        option('Точно соответствует').
                        click();

                    wait();

                    tester.conditionGroup().
                        atIndex(1).
                        combobox().
                        withValue('').
                        fill('Не дозвонились до сотрудника');

                    wait();
                    tester.button('Сохранить').click();
                    //tester.hookSavingRequest().receiveResponse();
                });
            });
            it('Условия добавлены.', function() {
                tester.hookRequest().
                    app59171().
                    receiveResponse();

                tester.conditionsRequest().
                    app59171().
                    receiveResponse();

                tester.conditionsRequest().
                    app59171().
                    fourthEventVersionSpecified().
                    receiveResponse();

                wait();
                wait();
                wait();
                wait();
            });
        });
        return;
        describe('Использую тестовые данные.', function() {
            beforeEach(function() {
                tester.batchReloadRequest().receiveResponse();
            });

            describe('Открываю форму редактирования уведомления.', function() {
                beforeEach(function() {
                    wait();
                    wait();
                    wait();
                    wait();

                    tester.actionIndex({
                        recordId: 104561
                    });

                    wait();
                    wait();
                    wait();
                    wait();

                    tester.hookRequest().receiveResponse();

                    wait();
                    wait();
                    wait();
                    wait();

                    tester.conditionsRequest().receiveResponse();

                    wait();
                    wait();
                    wait();
                    wait();

                    tester.conditionsRequest().
                        eventVersionSpecified().
                        receiveResponse();

                    wait();
                    wait();
                    wait();
                    wait();

                    wait();
                    wait();
                    wait();
                    wait();

                    wait();
                    wait();
                    wait();
                    wait();

                    //tester.telegramChatIdValidationRequest().receiveResponse();
                });

                describe('Открываю список событий.', function() {
                    beforeEach(function() {
                        tester.form.
                            combobox().
                            withFieldLabel('Тип события').
                            clickArrow();
                    });

                    describe('Выбираю тип события "Неотвеченное сообщение".', function() {
                        beforeEach(function() {
                            tester.form.
                                combobox().
                                withFieldLabel('Тип события').
                                option('Неотвеченное сообщение').
                                click();

                            tester.conditionsRequest().
                                thirdEventVersionSpecified().
                                receiveResponse();

                            wait();
                            wait();
                        });

                        it(
                            'Нажимаю на кнопку "Да". Отображено уведомление о необходимости перейти в новый ЛК.',
                        function() {
                            tester.button('Да').click();

                            tester.floatingComponent.expectTextContentToHaveSubstring(
                                'Чтобы событие отработало корректно, не забудьте включить и настроить параметры для ' +
                                'неотвеченного сообщения в новом личном кабинете',
                            );
                        });
                        it('Отображено предложение изменить шаблон по умолчанию.', function() {
                            tester.floatingComponent.expectTextContentToHaveSubstring(
                                'Подтверждение Выбран новый тип уведомления "Неотвеченное сообщение". Привести ' +
                                'шаблон к шаблону по умолчанию для "HTTP", в выбранном уведомлении?',
                            );
                        });
                    });
                    describe('Выбираю тип события "Первое событие".', function() {
                        beforeEach(function() {
                            tester.form.
                                combobox().
                                withFieldLabel('Тип события').
                                option('Первое событие').
                                click();

                            tester.conditionsRequest().
                                anotherEventVersionSpecified().
                                receiveResponse();

                            wait();
                            wait();
                        });

                        it('Нажимаю на кнопку "Да". Ни одно сообщение не отображено.', function() {
                            tester.button('Да').click();
                            tester.floatingComponent.expectToBeHiddenOrNotExist();
                        });
                        it('Отображено предложение изменить шаблон по умолчанию.', function() {
                            tester.floatingComponent.expectTextContentToHaveSubstring(
                                'Подтверждение Выбран новый тип уведомления "Первое событие". Привести шаблон к ' +
                                'шаблону по умолчанию для "HTTP", в выбранном уведомлении?',
                            );
                        });
                    });
                });
                it('Нажимаю на кнопку "Добавить группу условий". Выбираю показатель и условие.', function() {
                    tester.button('Добавить группу условий').click();

                    wait();
                    wait();
                    wait();
                    wait();

                    tester.conditionGroup().
                        first().
                        combobox().
                        withPlaceholder('Выберите показатель').
                        click();

                    tester.treeNode('Название сценария ВАТС').click();

                    tester.conditionGroup().
                        first().
                        combobox().
                        withPlaceholder('Выберите условие').
                        click();

                    tester.conditionGroup().
                        first().
                        combobox().
                        withPlaceholder('Выберите условие').
                        option('Точно соответствует').
                        click();
                });
                it('Меняю значениe поля в форме.', function() {
                    tester.button('Сохранить').expectToBeDisabled();

                    tester.switchbox('Активно').click();

                    wait();
                    wait();
                    wait();
                    wait();

                    wait();
                    wait();
                    wait();
                    wait();

                    tester.button('Сохранить').expectToBeEnabled();
                });
                it('Нажимаю на кнопку "Добавить параметр". Отображён список параметров.', function() {
                    tester.button('Добавить параметр').click();

                    tester.floatingComponent.expectToHaveTextContent(
                        'employee_email Email сотрудника string ' +
                        'first_answered_employee_email Email сотрудника, который принял вызов первым string ' +
                        'first_talked_employee_email Email первого разговаривавшего сотрудника string ' +
                        'last_talked_employee_email Email последнего разговаривавшего сотрудника string'
                    );
                });
                it('Отображен тип события редактруемого уведомления.', function() {
                    tester.form.
                        combobox().
                        withFieldLabel('Тип события').
                        expectToHaveValue('Некое событие');
                });
            });
            describe('Открываю форму создания уведомления.', function() {
                beforeEach(function() {
                    tester.actionIndex();

                    tester.conditionsRequest().receiveResponse();

                    tester.conditionsRequest().
                        anotherEventVersionSpecified().
                        receiveResponse();

                    wait();
                    wait();
                });

                describe(
                    'Добавляю группу условий. Условие по совпадению контакта. Выпадающий список контактов заполнен ' +
                    'данными.',
                function() {
                    beforeEach(function() {
                        tester.form.
                            textfield().
                            withFieldLabel('Название уведомления').
                            fill('Некое уведомление');

                        tester.button('Добавить группу условий').click();

                        wait();
                        wait();
                        wait();
                        wait();

                        tester.conditionGroup().
                            first().
                            combobox().
                            withPlaceholder('Выберите показатель').
                            click();

                        tester.treeNode('Контакт').click();

                        tester.conditionGroup().
                            first().
                            combobox().
                            withPlaceholder('Выберите условие').
                            click();

                        tester.conditionGroup().
                            first().
                            combobox().
                            withPlaceholder('Выберите условие').
                            option('Точно соответствует').
                            click();

                        wait();
                    });

                    it('Ввожу текстовое значение в выпадающий список.', function() {
                        tester.conditionGroup().
                            first().
                            comboboxAt(3).
                            fill('Тодорова Сташа');

                        wait();
                        wait();
                        wait();
                        wait();

                        tester.button('Создать').click();
                        tester.hookSavingRequest().receiveResponse();
                    });
                    it(
                        'Выбираю значение из списка. Нажимаю на кнопку создания уведомления. Уведомление создано.',
                    function() {
                        tester.conditionGroup().
                            first().
                            comboboxAt(3).
                            clickArrow();

                        wait();

                        tester.conditionGroup().
                            first().
                            comboboxAt(3).
                            option('Тодорова Сташа').
                            click();

                        tester.button('Создать').click();
                        tester.hookSavingRequest().receiveResponse();
                    });
                });
                it(
                    'Выбираю тип события "Неотвеченное сообщение". Отображено уведомление о необходимости перейти в ' +
                    'новый ЛК.',
                function() {
                    tester.form.
                        combobox().
                        withFieldLabel('Тип события').
                        clickArrow();

                    tester.form.
                        combobox().
                        withFieldLabel('Тип события').
                        option('Неотвеченное сообщение').
                        click();

                    tester.conditionsRequest().
                        thirdEventVersionSpecified().
                        receiveResponse();

                    wait();
                    wait();

                    tester.floatingComponent.expectTextContentToHaveSubstring(
                        'Чтобы событие отработало корректно, не забудьте включить и настроить параметры для ' +
                        'неотвеченного сообщения в новом личном кабинете',
                    );

                    tester.anchor('новом личном кабинете').
                        expectHrefToHavePath('https://go.comagic.ru/chats/chat-settings/');
                });
                it('Отображен первый тип события.', function() {
                    tester.form.
                        combobox().
                        withFieldLabel('Тип события').
                        expectToHaveValue('Первое событие');
                });
            });
        });
    });
});
