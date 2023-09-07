tests.addTest(function(args) {
    const {
        requestsManager,
        testersFactory,
        wait,
        utils,
    } = args;

    xdescribe('Открываю страницу сотрудников.', function() {
        var tester;

        beforeEach(function() {
            tester && tester.destroy();
            tester = new ServicesAtsStaff(args);

            Comagic.Directory.load();
            tester.batchReloadRequest().receiveResponse();

            tester.actionIndex({
                mode: 'statuses'
            });

            tester.statusesRequest().receiveResponse();
        });

        describe('Нажимаю кнопку "Создать статус".', function() {
            beforeEach(function() {
                tester.button('Создать статус').click();
            });

            describe('Нажимаю на пункт меню "Новый статус".', function() {
                beforeEach(function() {
                    tester.menu.item('Новый статус').click();
                });

                it(
                    'Заполняю поля формы. Нажимаю на кнпоку "Создать". Отправлен запрос сохранения статуса.',
                function() {
                    tester.floatingForm.
                        iconField().
                        withFieldLabel('Иконка').
                        click().
                        popup().
                        item('bell').
                        click();

                    tester.floatingForm.
                        colorField().
                        withFieldLabel('Цвет').
                        clickArrow().
                        popup().
                        item('ff8f00').
                        click();

                    tester.floatingForm.
                        colorField().
                        popup().
                        button('OK').
                        click();

                    tester.floatingForm.
                        textfield().
                        withFieldLabel('Название статуса').
                        fill('Колокольчик');

                    tester.floatingForm.
                        textfield().
                        withFieldLabel('Описание статуса').
                        fill('Сотрудник звонит в колокольчик');

                    tester.floatingForm.
                        combobox().
                        withFieldLabel('Рабочее время').
                        clickArrow().
                        option('Нет').
                        click();

                    tester.floatingForm.
                        directionsField().
                        withFieldLabel('Разрешения для входящих звонков').
                        internal().
                        incoming().
                        click();

                    tester.floatingForm.
                        directionsField().
                        withFieldLabel('Разрешения для входящих звонков').
                        external().
                        outgoing().
                        click();

                    tester.floatingForm.
                        directionsField().
                        withFieldLabel('Разрешения для исходящих звонков').
                        internal().
                        outgoing().
                        click();

                    tester.floatingForm.
                        directionsField().
                        withFieldLabel('Разрешения для исходящих звонков').
                        external().
                        incoming().
                        click();

                    tester.floatingForm.
                        combobox().
                        withFieldLabel('Типы номеров').
                        clickArrow().
                        option('PSTN').
                        click();

                    tester.floatingForm.
                        combobox().
                        withFieldLabel('Типы номеров').
                        clickArrow();
         
                    tester.floatingForm.
                        combobox().
                        withFieldLabel('Готов к исходящему обзвону').
                        clickArrow().
                        option('Нет').
                        click();

                    tester.floatingForm.
                        combobox().
                        withFieldLabel('Возможность принимать трансфер чатов').
                        clickArrow().
                        option('Нет').
                        click();

                    tester.floatingForm.
                        combobox().
                        withFieldLabel('Возможность делать трансфер чатов').
                        clickArrow().
                        option('Да').
                        click();

                    tester.floatingForm.
                        combobox().
                        withFieldLabel('Возможность принимать чат в работу').
                        clickArrow().
                        option('Нет').
                        click();

                    tester.floatingForm.
                        combobox().
                        withFieldLabel('Возможность закрывать чат/заявку').
                        clickArrow().
                        option('Да').
                        click();

                    tester.floatingForm.
                        combobox().
                        withFieldLabel('Возможность участвовать в переадресации в сценарии').
                        clickArrow().
                        option('Нет').
                        click();

                    tester.floatingForm.
                        combobox().
                        withFieldLabel('Возможность переписываться с клиентом').
                        clickArrow().
                        option('Да').
                        click();

                    tester.floatingForm.
                        combobox().
                        withFieldLabel('Учитывать доступность в группах сотрудников').
                        clickArrow().
                        option('Нет').
                        click();

                    tester.floatingForm.
                        button('Создать').
                        click();

                    tester.statusCreatingRequest().receiveResponse();
                    tester.statusesRequest().receiveResponse();
                    tester.staffStatusRequest().receiveResponse();
                });
                it('Поля формы заполнены значениями по умолчанию.', function() {
                    tester.floatingForm.
                        iconField().
                        withFieldLabel('Иконка').
                        expectToHaveValue('tick');

                    tester.floatingForm.
                        colorField().
                        withFieldLabel('Цвет').
                        expectToHaveValue('48b882');

                    tester.floatingForm.
                        textfield().
                        withFieldLabel('Название статуса').
                        expectToHaveTextContent('');

                    tester.floatingForm.
                        textfield().
                        withFieldLabel('Описание статуса').
                        expectToHaveTextContent('');

                    tester.floatingForm.
                        combobox().
                        withFieldLabel('Рабочее время').
                        expectToHaveValue('Да');
        
                    tester.floatingForm.
                        directionsField().
                        withFieldLabel('Разрешения для входящих звонков').
                        internal().
                        incoming().
                        expectToBeChecked();

                    tester.floatingForm.
                        directionsField().
                        withFieldLabel('Разрешения для входящих звонков').
                        external().
                        outgoing().
                        expectToBeChecked();

                    tester.floatingForm.
                        directionsField().
                        withFieldLabel('Разрешения для исходящих звонков').
                        internal().
                        outgoing().
                        expectToBeChecked();

                    tester.floatingForm.
                        directionsField().
                        withFieldLabel('Разрешения для исходящих звонков').
                        external().
                        incoming().
                        expectToBeChecked();

                    tester.floatingForm.
                        combobox().
                        withFieldLabel('Типы номеров').
                        expectToHaveValue('PSTN, SIP, SIP_TRUNK, FMC, SIP_URI');
         
                    tester.floatingForm.
                        combobox().
                        withFieldLabel('Готов к исходящему обзвону').
                        expectToHaveValue('Да');

                    tester.floatingForm.
                        combobox().
                        withFieldLabel('Возможность принимать трансфер чатов').
                        expectToHaveValue('Да');

                    tester.floatingForm.
                        combobox().
                        withFieldLabel('Возможность делать трансфер чатов').
                        expectToHaveValue('Да');

                    tester.floatingForm.
                        combobox().
                        withFieldLabel('Возможность принимать чат в работу').
                        expectToHaveValue('Да');

                    tester.floatingForm.
                        combobox().
                        withFieldLabel('Возможность закрывать чат/заявку').
                        expectToHaveValue('Да');

                    tester.floatingForm.
                        combobox().
                        withFieldLabel('Возможность участвовать в переадресации в сценарии').
                        expectToHaveValue('Да');

                    tester.floatingForm.
                        combobox().
                        withFieldLabel('Возможность переписываться с клиентом').
                        expectToHaveValue('Да');

                    tester.floatingForm.
                        combobox().
                        withFieldLabel('Учитывать доступность в группах сотрудников').
                        expectToHaveValue('Да');
                });
            });
            it(
                'Нажимаю пункт "На основе стандартных" меню создания статуса. Выбираю статус. Поля формы заполнены ' +
                'значениями по умолчанию.',
            function() {
                tester.menu.item('На основе стандартных').putMouseOver();
                tester.menu.item('Доступен').click();

                tester.floatingForm.
                    iconField().
                    withFieldLabel('Иконка').
                    expectToHaveValue('tick');

                tester.floatingForm.
                    colorField().
                    withFieldLabel('Цвет').
                    expectToHaveValue('48b882');

                tester.floatingForm.
                    textfield().
                    withFieldLabel('Название статуса').
                    expectToHaveTextContent('');

                tester.floatingForm.
                    textfield().
                    withFieldLabel('Описание статуса').
                    expectToHaveTextContent('');

                tester.floatingForm.
                    combobox().
                    withFieldLabel('Рабочее время').
                    expectToHaveValue('Да');
    
                tester.floatingForm.
                    directionsField().
                    withFieldLabel('Разрешения для входящих звонков').
                    internal().
                    incoming().
                    expectToBeChecked();

                tester.floatingForm.
                    directionsField().
                    withFieldLabel('Разрешения для входящих звонков').
                    external().
                    outgoing().
                    expectToBeChecked();

                tester.floatingForm.
                    directionsField().
                    withFieldLabel('Разрешения для исходящих звонков').
                    internal().
                    outgoing().
                    expectToBeChecked();

                tester.floatingForm.
                    directionsField().
                    withFieldLabel('Разрешения для исходящих звонков').
                    external().
                    incoming().
                    expectToBeChecked();

                tester.floatingForm.
                    combobox().
                    withFieldLabel('Типы номеров').
                    expectToHaveValue('SIP');
     
                tester.floatingForm.
                    combobox().
                    withFieldLabel('Готов к исходящему обзвону').
                    expectToHaveValue('Да');

                tester.floatingForm.
                    combobox().
                    withFieldLabel('Возможность принимать трансфер чатов').
                    expectToHaveValue('Да');

                tester.floatingForm.
                    combobox().
                    withFieldLabel('Возможность делать трансфер чатов').
                    expectToHaveValue('Да');

                tester.floatingForm.
                    combobox().
                    withFieldLabel('Возможность принимать чат в работу').
                    expectToHaveValue('Да');

                tester.floatingForm.
                    combobox().
                    withFieldLabel('Возможность закрывать чат/заявку').
                    expectToHaveValue('Да');

                tester.floatingForm.
                    combobox().
                    withFieldLabel('Возможность участвовать в переадресации в сценарии').
                    expectToHaveValue('Да');

                tester.floatingForm.
                    combobox().
                    withFieldLabel('Возможность переписываться с клиентом').
                    expectToHaveValue('Да');

                tester.floatingForm.
                    combobox().
                    withFieldLabel('Учитывать доступность в группах сотрудников').
                    expectToHaveValue('Да');
            });
        });
        it('Свойства статусов отображены в таблице.', function() {
            tester.grid.
                row().first().
                column().atIndex(0).
                expectToHaveTextContent(
                    'Доступен ' +
                    'все вызовы'
                );

            tester.grid.
                row().first().
                column().atIndex(1).
                expectToHaveTextContent('Да');

            tester.grid.
                row().first().
                column().atIndex(2).
                expectToHaveTextContent('Вход., Исход.');

            tester.grid.
                row().first().
                column().atIndex(3).
                expectToHaveTextContent('Вход., Исход.');

            tester.grid.
                row().first().
                column().atIndex(4).
                expectToHaveTextContent('Вход., Исход.');

            tester.grid.
                row().first().
                column().atIndex(5).
                expectToHaveTextContent('Вход., Исход.');

            tester.grid.
                row().first().
                column().atIndex(6).
                expectToHaveTextContent('SIP');

            tester.grid.
                row().first().
                column().atIndex(7).
                expectToHaveTextContent('Да');

            tester.grid.
                row().first().
                column().atIndex(8).
                expectToHaveTextContent('Да');

            tester.grid.
                row().first().
                column().atIndex(9).
                expectToHaveTextContent('Нет');

            tester.grid.
                row().first().
                column().atIndex(10).
                expectToHaveTextContent('Да');

            tester.grid.
                row().first().
                column().atIndex(11).
                expectToHaveTextContent('Нет');

            tester.grid.
                row().first().
                column().atIndex(12).
                expectToHaveTextContent('Да');

            tester.grid.
                row().first().
                column().atIndex(13).
                expectToHaveTextContent('Нет');

            tester.grid.
                row().first().
                column().atIndex(14).
                expectToHaveTextContent('Да');
        });
    });
    describe('Компонент текстовых коммуникаций отключен.', function() {
        var tester;

        beforeEach(function() {
            Comagic.getApplication().setHasNotComponent('text_communications');
            tester = new ServicesAtsStaff(args);

            Comagic.Directory.load();
            tester.batchReloadRequest().receiveResponse();

            tester.actionIndex({
                mode: 'statuses'
            });

            tester.statusesRequest().receiveResponse();
        });

        it('Свойства статусов отображены в таблице.', function() {
            tester.grid.
                row().first().
                column().atIndex(0).
                expectToHaveTextContent(
                    'Доступен ' +
                    'все вызовы'
                );

            tester.grid.
                row().first().
                column().atIndex(1).
                expectToHaveTextContent('Да');

            tester.grid.
                row().first().
                column().atIndex(2).
                expectToHaveTextContent('Вход., Исход.');

            tester.grid.
                row().first().
                column().atIndex(3).
                expectToHaveTextContent('Вход., Исход.');

            tester.grid.
                row().first().
                column().atIndex(4).
                expectToHaveTextContent('Вход., Исход.');

            tester.grid.
                row().first().
                column().atIndex(5).
                expectToHaveTextContent('Вход., Исход.');

            tester.grid.
                row().first().
                column().atIndex(6).
                expectToHaveTextContent('SIP');

            tester.grid.
                row().first().
                column().atIndex(7).
                expectToHaveTextContent('Да');

            tester.grid.
                row().first().
                column().atIndex(8).
                expectToHaveTextContent('Да');

            tester.grid.
                row().first().
                column().atIndex(9).
                expectToBeHiddenOrNotExist();

            tester.grid.
                row().first().
                column().atIndex(10).
                expectToBeHiddenOrNotExist();

            tester.grid.
                row().first().
                column().atIndex(11).
                expectToBeHiddenOrNotExist();

            tester.grid.
                row().first().
                column().atIndex(12).
                expectToBeHiddenOrNotExist();

            tester.grid.
                row().first().
                column().atIndex(13).
                expectToBeHiddenOrNotExist();

            tester.grid.
                row().first().
                column().atIndex(14).
                expectToBeHiddenOrNotExist();
        });
        return;
        it('Открываю форму создания статуса. Поля параметров чатов скрыты.', function() {
            tester.button('Создать статус').click();
            tester.menu.item('Новый статус').click();

            tester.floatingForm.
                combobox().
                withFieldLabel('Возможность принимать трансфер чатов').
                expectToBeHiddenOrNotExist();

            tester.floatingForm.
                combobox().
                withFieldLabel('Возможность делать трансфер чатов').
                expectToBeHiddenOrNotExist();

            tester.floatingForm.
                combobox().
                withFieldLabel('Возможность принимать чат в работу').
                expectToBeHiddenOrNotExist();

            tester.floatingForm.
                combobox().
                withFieldLabel('Возможность закрывать чат/заявку').
                expectToBeHiddenOrNotExist();

            tester.floatingForm.
                combobox().
                withFieldLabel('Возможность участвовать в переадресации в сценарии').
                expectToBeHiddenOrNotExist();

            tester.floatingForm.
                combobox().
                withFieldLabel('Возможность переписываться с клиентом').
                expectToBeHiddenOrNotExist();
        });
    });
});
