tests.addTest(function(args) {
    var wait = args.wait;

    describe('Открываю раздел "Сервисы/Виртуальная АТС/Уведомления". Открываю форму создания уведомления.', function() {
        var helper;

        beforeEach(function() {
            if (helper) {
                helper.destroy();
            }

            helper = new ServicesAtsHook(args);

            Comagic.Directory.load();
            helper.batchReloadRequest().receiveResponse();

            helper.actionIndex({
                recordId: 104561
            });

            helper.hookRequest().receiveResponse();
            helper.conditionsRequest().receiveResponse();
            helper.conditionsRequest().setEventVersion().receiveResponse();

            wait();
            wait();
        });

        it('Нажимаю на кнопку "Добавить группу условий". Выбираю показатель и условие.', function() {
            helper.button('Добавить группу условий').click();

            wait();
            wait();
            wait();
            wait();

            helper.conditionGroup().first().combobox().withPlaceholder('Выберите показатель').click();
            helper.treeNode('Название сценария ВАТС').click();

            helper.conditionGroup().first().combobox().withPlaceholder('Выберите условие').click();
            helper.conditionGroup().first().combobox().
                withPlaceholder('Выберите условие').
                option('Точно соответствует').
                click();
        });
    });
});
