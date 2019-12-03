tests.addTest(function(requestsManager, testersFactory, wait, utils) {
    describe(
        'Открываю раздел "Заявки". Нажимаю на кнопку "Создать новую заявку". Ввожу значение в поле "Описание".',
    function() {
        var helper;

        beforeEach(function() {
            helper = new TroubleTicket(requestsManager, testersFactory, utils);
            helper.requestTroubletickets().send();

            helper.createNewRequestButton.click();
            helper.requestUserContacts().send();

            helper.requestCreationWindow.textfield().withFieldLabel('Описание').fill('Прошу, помогите!');
        });
        afterEach(function() {
            helper.destroy();
        });

        it((
            'Ввожу значения в поля "Ф.И.О.", "Телефон" и "E-mail". Нажимаю на кнопку "Создать". Отправляется запрос ' +
            'создания заявки, в которой контактные данные не были выбраны из списков.'
        ), function() {
            helper.requestCreationWindow.combobox().withFieldLabel('Ф.И.О.').fill('Петров Петр Петрович');
            helper.requestCreationWindow.combobox().withFieldLabel('Телефон').fill('74952345678');
            helper.requestCreationWindow.combobox().withFieldLabel('E-mail').fill('petrov@gmail.com');

            helper.requestCreationButton.click();
            helper.requestCreateTicket().setManuallyInputedData().send();
            helper.requestTroubletickets().send();
        });
        describe('Выбираю из списков значения полей "Ф.И.О.", "Телефон" и "E-mail".', function() {
            beforeEach(function() {
                helper.requestCreationWindow.combobox().withFieldLabel('Ф.И.О.').clickArrow().
                    option('Иванов Иван Иванович').click();
                helper.requestCreationWindow.combobox().withFieldLabel('Телефон').clickArrow().
                    option('74951234567').click();
                helper.requestCreationWindow.combobox().withFieldLabel('E-mail').clickArrow().
                    option('ivanov@gmail.com').click();
            });

            it('Стираю значение поля "Описание". Нажимаю на кнопку "Создать". Ничего не происходит.', function() {
                helper.requestCreationWindow.textfield().withFieldLabel('Описание').clear();
                helper.requestCreationButton.click();
            });
            it('Стираю значение поля "Телефон". Нажимаю на кнопку "Создать". Ничего не происходит.', function() {
                helper.requestCreationWindow.textfield().withFieldLabel('Телефон').clear();
                helper.requestCreationButton.click();
            });
            it('Стираю значение поля "Ф.И.О.". Нажимаю на кнопку "Создать". Ничего не происходит.', function() {
                helper.requestCreationWindow.textfield().withFieldLabel('Ф.И.О.').clear();
                helper.requestCreationButton.click();
            });
            it('Стираю значение поля "E-mail". Нажимаю на кнопку "Создать". Ничего не происходит.', function() {
                helper.requestCreationWindow.textfield().withFieldLabel('E-mail').clear();
                helper.requestCreationButton.click();
            });
            it('Окно не маскировано.', function() {
                helper.requestCreationWindow.expectNotToBeMasked();
            });
            describe('Нажимаю на кнопку "Создать".', function() {
                beforeEach(function() {
                    helper.requestCreationButton.click();
                });

                it('Окно маскировано. Кнопка "Создать" заблокирована.', function() {
                    helper.requestCreationWindow.expectToBeMasked();
                    helper.requestCreationButton.expectToBeDisabled();
                    helper.requestCreateTicket().send();
                    helper.requestTroubletickets().send();
                });
                it('Сервер ответил на запрос создания заявки. Окно скрыто.', function() {
                    helper.requestCreateTicket().send();
                    helper.requestTroubletickets().send();

                    helper.requestCreationWindow.expectToBeHiddenOrNotExist();
                });
            });
        });
    });
});
