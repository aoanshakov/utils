tests.addTest(function(args) {
    var wait = args.wait;

    describe('Открываю раздел "Сервисы/Виртуальная АТС/Уведомления".', function() {
        var tester;

        beforeEach(function() {
            if (tester) {
                tester.destroy();
            }

            tester = new ServicesAtsHookList(args);

            Comagic.Directory.load();
            tester.batchReloadRequest().receiveResponse();
        });

        it('', function() {
            tester.openPage();
            tester.hooksRequest().receiveResponse();

            tester.grid.
                row().
                first().
                column().
                withHeader('Название').
                findAnchor('HTTP').
                click();

            tester.openEditingPage({
                recordId: 104561
            });

            tester.employeeShortPhonesRequest().receiveResponse();
            tester.handlerScheduleRequest().receiveResponse();
            tester.hookRequest().receiveResponse();
            tester.conditionsRequest().receiveResponse();

            tester.conditionsRequest().
                eventVersionSpecified().
                receiveResponse();

            wait();
            tester.button('Добавить параметр').click();

            tester.floatingComponent.expectToHaveTextContent(
                'employee_email Email сотрудника string ' +
                'first_answered_employee_email Email сотрудника, который принял вызов первым string ' +
                'first_talked_employee_email Email первого разговаривавшего сотрудника string ' +
                'last_talked_employee_email Email последнего разговаривавшего сотрудника string'
            );

            wait();
            tester.eventParamsRequest().receiveResponse();

            tester.floatingComponent.expectToHaveTextContent(
                'employee_email Email сотрудника string ' +
                'first_answered_employee_email Email сотрудника, который принял вызов первым string ' +
                'first_talked_employee_email Email первого разговаривавшего сотрудника string ' +
                'last_talked_employee_email Email последнего разговаривавшего сотрудника string'
            );
        });
    });
});
