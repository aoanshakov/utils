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
            tester.batchReloadRequest().receiveResponse();
        });

        describe('Открываю форму редактирования уведомления.', function() {
            beforeEach(function() {
                tester.actionIndex({
                    recordId: 104561
                });

                tester.hookRequest().receiveResponse();
                tester.conditionsRequest().receiveResponse();

                tester.conditionsRequest().
                    eventVersionSpecified().
                    receiveResponse();

                wait();
                wait();
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

            it(
                'Добавляю группу условий. Условие по совпадению контакта. Выпадающий список контактов заполнен ' +
                'данными.',
            function() {
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

                tester.conditionGroup().
                    first().
                    comboboxAt(3).
                    clickArrow();

                tester.conditionGroup().
                    first().
                    comboboxAt(3).
                    option('Тодорова Сташа').
                    expectToBeVisible();
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
