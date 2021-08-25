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
            var virtualNumbersRequest;

            beforeEach(function() {
                application.run();

                tester.usersRequest().receiveResponse();
                virtualNumbersRequest = tester.virtualNumbersRequest().expectToBeSent();
                tester.scenariosRequest().receiveResponse();
            });

            describe('Виртуальные номера получены.', function() {
                beforeEach(function() {
                    virtualNumbersRequest.receiveResponse();
                });

                describe('SDK Битрикс инициализирован.', function() {
                    beforeEach(function() {
                        tester.initializeB24();
                    });

                    describe('Выбираю виртуальный номер. Ввожу голосовое сообщение.', function() {
                        beforeEach(function() {
                            tester.select('Звонить абоненту с номера').option('79151234569').click();
                            tester.textarea.fill('Привет!');
                        });

                        describe('Выбираю звонок сотруднику.', function() {
                            beforeEach(function() {
                                tester.select('Звонить').option('Сотруднику').click();
                            });

                            it(
                                'Выбираю сотрудника. Нажимаю на кнопку сохранения. Введенные значения сохранены.' ,
                            function() {
                                tester.select().option('Господинова Николина').click();

                                tester.button.click();

                                tester.expectPropertiesToHaveValues({
                                    autocall_on: 'employee_id',
                                    employee_id: '583783',
                                    virtual_number_numb: '29387',
                                    virtual_number: '',
                                    scenario_id: '',
                                    employee_message: 'Привет!'
                                });
                            });
                            it(
                                'Поля "Звонить абоненту с номера" и "Голосовое сообщение для сотрудника" видимы.',
                            function() {
                                tester.select('Звонить абоненту с номера').expectToBeVisible();
                                tester.textarea.expectToBeVisible();
                            });
                        });
                        describe('Выбираю звонок по сценарию.', function() {
                            beforeEach(function() {
                                tester.select('Звонить').option('По сценарию ВАТС').click();
                            });

                            it(
                                'Выбираю сценарий. Нажимаю на кнопку сохранения. Введенные значения сохранены.' ,
                            function() {
                                tester.select().option('Второй сценарий').click();

                                tester.button.click();

                                tester.expectPropertiesToHaveValues({
                                    autocall_on: 'scenario_id',
                                    employee_id: '',
                                    virtual_number_numb: '29387',
                                    virtual_number: '',
                                    scenario_id: '95173',
                                    employee_message: ''
                                });
                            });
                            it('Поле "Голосовое сообщение для сотрудника" скрыто.', function() {
                                tester.select('Звонить абоненту с номера').expectToBeVisible();
                                tester.textarea.expectToBeHidden();
                            });
                        });
                        describe('Выбираю звонок на виртуальный номер.', function() {
                            beforeEach(function() {
                                tester.select('Звонить').option('На виртуальный номер').click();
                            });

                            it('Выбираю номер. Нажимаю на кнопку сохранения. Введенные значения сохранены.' , function() {
                                tester.select().option('79151234568').click();

                                tester.button.click();

                                tester.expectPropertiesToHaveValues({
                                    autocall_on: 'virtual_number',
                                    employee_id: '',
                                    virtual_number_numb: '',
                                    virtual_number: '29386',
                                    scenario_id: '',
                                    employee_message: 'Привет!'
                                });
                            });
                            it('Поле "Звонить абоненту с номера" скрыто.', function() {
                                tester.select().option('79151234567').expectToBeSelected();
                                tester.select('Звонить абоненту с номера').expectToBeHidden();
                                tester.textarea.expectToBeVisible();
                            });
                        });
                        it('Нажимаю на кнопку сохранения. Введенные значения сохранены.', function() {
                            tester.button.click();

                            tester.expectPropertiesToHaveValues({
                                autocall_on: 'personal_manager',
                                employee_id: '',
                                virtual_number_numb: '29387',
                                virtual_number: '',
                                scenario_id: '',
                                employee_message: 'Привет!'
                            });
                        });
                    });
                    it('Выбран звонок на персонального менеджера.', function() {
                        tester.select('Звонить').option('Персональному менеджеру').expectToBeSelected();
                        tester.select('Звонить абоненту с номера').option('79151234567').expectToBeSelected();
                        tester.select('Звонить абоненту с номера').expectNotToHaveAttribute('disabled');
                        tester.select().expectToBeHidden();
                        tester.textarea.expectToBeVisible();
                    });
                });
                it('Кнопка заблокирована.', function() {
                    tester.button.click();

                    tester.expectPropertiesToHaveValues({
                        autocall_on: undefined,
                    });
                });
            });
            it('Выпадающий список "Звонить абоненту с номера" заблокирован.', function() {
                tester.select('Звонить абоненту с номера').option('...').expectToBeSelected();
                tester.select('Звонить абоненту с номера').expectToHaveAttribute('disabled');
            });
        });
        it('Сотрудник должнен быть выбран. Сотрудник выбран.', function() {
            application.employeeChosen().run();

            tester.usersRequest().receiveResponse();
            tester.virtualNumbersRequest().receiveResponse();
            tester.scenariosRequest().receiveResponse();

            tester.initializeB24();

            tester.select('Звонить').option('Сотруднику').expectToBeSelected();
            tester.select().option('Господинова Николина').expectToBeSelected();
            tester.select('Звонить абоненту с номера').option('79151234569').expectToBeSelected();
            tester.textarea.expectToHaveTextContent('Привет!');
        });
        it('Сценарий должнен быть выбран. Сценарий выбран.', function() {
            application.scenarioChosen().run();

            tester.usersRequest().receiveResponse();
            tester.virtualNumbersRequest().receiveResponse();
            tester.scenariosRequest().receiveResponse();

            tester.initializeB24();

            tester.select('Звонить').option('По сценарию ВАТС').expectToBeSelected();
            tester.select().option('Второй сценарий').expectToBeSelected();
            tester.select('Звонить абоненту с номера').option('79151234569').expectToBeSelected();
            tester.textarea.expectToBeHidden();
        });
        it('Выбран звонок на персонального менеджера. Выпадающие списки сценариев и сотрудников скрыты.', function() {
            application.callToPersonalManager().run();
            
            tester.usersRequest().receiveResponse();
            tester.virtualNumbersRequest().receiveResponse();
            tester.scenariosRequest().receiveResponse();

            tester.initializeB24();

            tester.select('Звонить').option('Персональному менеджеру').expectToBeSelected();
            tester.select().expectToBeHidden();
            tester.select('Звонить абоненту с номера').option('79151234569').expectToBeSelected();
            tester.textarea.expectToHaveTextContent('Привет!');
        });
        it('Выбран звонок на виртуальный номер. Выпадающий список "Звонить абоненту с номера" скрыт.', function() {
            application.callToVirtualNumber().run();

            tester.usersRequest().receiveResponse();
            tester.virtualNumbersRequest().receiveResponse();
            tester.scenariosRequest().receiveResponse();

            tester.initializeB24();

            tester.select('Звонить').option('На виртуальный номер').expectToBeSelected();
            tester.select().option('79151234568').expectToBeSelected();
            tester.select('Звонить абоненту с номера').expectToBeHidden();
            tester.textarea.expectToHaveTextContent('Привет!');
        });
    });
});
