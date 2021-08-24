tests.addTest(options => {
    const {Tester} = options,
        body = document.body.innerHTML;

    describe('Открываю Digital-Pipeline.', function() {
        let tester,
            application;

        beforeEach(function() {
            document.body.innerHTML = body;
            tester = new Tester(options);
            application = tester.application();
        });

        describe('Открываю в первый раз.', function() {
            beforeEach(function() {
                application.run();
                tester.usersRequest().receiveResponse();
                tester.virtualNumbersRequest().receiveResponse();
                tester.scenariosRequest().receiveResponse();
            });

            it('Выбираю другого сотрудника. Сотрудник выбран.', function() {
                tester.select('Сотрудник').option('Господинова Николина').click();
                tester.select('Звонить абоненту с номера').option('79151234569').click();
                tester.select('Сценарий').option('Второй сценарий').click();
                tester.textarea.fill('Привет!');

                tester.button.click();

                tester.expectPropertiesToHaveValues({
                    employee_id: '583783',
                    virtual_number_numb: '29387',
                    scenario_id: '95173',
                    employee_message: 'Привет!'
                });
            });
            it('Выбран звонок на персонального менеджера.', function() {
                tester.select('Звонить').option('...').expectToBeSelected();
                tester.select('Звонить абоненту с номера').option('...').expectToBeSelected();
            });
        });
        return;
        it('Сотрудник должнен быть выбран. Сотрудник выбран.', function() {
            application.employeeChosen().run();
            tester.usersRequest().receiveResponse();
            tester.virtualNumbersRequest().receiveResponse();
            tester.scenariosRequest().receiveResponse();

            tester.select('Сотрудник').option('Шалева Дора').expectToBeSelected();
        });
        it('Сообщение должно быть введено. Сообщение введено.', function() {
            application.messageDefined().run();
            tester.usersRequest().receiveResponse();
            tester.virtualNumbersRequest().receiveResponse();
            tester.scenariosRequest().receiveResponse();

            tester.textarea.expectToHaveTextContent('Добрый вечер!');
        });
    });
});
