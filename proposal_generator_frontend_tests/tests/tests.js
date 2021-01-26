window.runTests = function () {
    tests.addTest(function (options) {
        var ProposalGeneratorFrontendTester = options.ProposalGeneratorFrontendTester;

        describe('Авторизуюсь.', function() {
            let tester;

            beforeEach(function() {
                tester = new ProposalGeneratorFrontendTester(options);
                tester.path.open('/');

                tester.textfield().withLabel('Логин').fill('t.daskalova');
                tester.textfield().withLabel('Пароль').fill('2G892H4gsGjk12ef');

                tester.button('Войти').click();
                Promise.runAll();
                tester.loginUserRequest().receiveResponse();
                tester.accountRequest().receiveResponse();
            });

            xit('Нажимаю на кнопку "Продолжить". Отображен второй шаг.', function() {
                tester.button('Продолжить').click();

                tester.body.expectToHaveTextContent(
                    'Создание коммерческого предложения ' +

                    'Название компании ' +
                    '2 Задачи и требования ' +

                    'Hello world! ' +

                    'Продолжить ' +
                    'Начать с начала ' +

                    '3 Конфигурация тарифного плана ' +
                    '4 Настройка номеров ' +
                    '5 Лимиты ' +
                    '6 Отображение сервисов в КП ' +
                    '7 Стоимостное предложение'
                );
            });
            it('Отображен первый шаг.', function() {
                tester.body.expectToHaveTextContent(
                    'Создание коммерческого предложения ' +

                    '1 Название компании ' +

                    'Название компании ' +

                    'Продолжить ' +
                    'Начать с начала ' +

                    '2 Задачи и требования ' +
                    '3 Конфигурация тарифного плана ' +
                    '4 Настройка номеров ' +
                    '5 Лимиты ' +
                    '6 Отображение сервисов в КП ' +
                    '7 Стоимостное предложение'
                );
            });
        });
    })
};
