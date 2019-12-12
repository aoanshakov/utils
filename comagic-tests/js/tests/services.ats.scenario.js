tests.addTest(function(requestsManager, testersFactory, wait, utils) {
    describe((
        'Открываю раздел "Сервисы/Виртуальная АТС/Виртуальные номера и правила". Выбираю сценарий для ' +
        'редактирования. Выбираю действие для редактирования.'
    ), function() {
        var helper;

        beforeEach(function() {
            if (helper) {
                helper.destroy();
            }

            helper = new ServicesAtsScenario(requestsManager, testersFactory, utils);

            Comagic.Directory.load();
            helper.batchReloadRequest().send();

            helper.actionIndex({
                recordId: 104561
            });

            wait();

            helper.requestActionTypes().send();
            helper.requestReturnCodes().send();
            helper.requestMarkersTypes().send();
            helper.requestScenario().send();

            wait();
            wait();

            helper.actionIcon().withName('Меню 1').find().click();
            wait();
            wait();
        });

        it('Превью видеоинструкции развернуто.', function() {
            helper.collapseVideoButton.expectToBeVisible();
            helper.expandVideoButton.expectToBeHidden();
            helper.videoWindow.expectToBeHiddenOrNotExist();
        });
        describe('Нажимаю на кнопку открытия видеоинструкции.', function() {
            beforeEach(function() {
                helper.openVideoButton.click();
            });

            it('Окно с видеоинструкцией открыто.', function() {
                helper.videoWindow.expectToBeVisible();
            });
            it('Нажимаю на модальную маску. Окно с видеоинструкцией закрыто.', function() {
                helper.modalMask.click();
                helper.videoWindow.expectToBeHiddenOrNotExist();
            });
            it('Нажимаю на клавишу "Escape". Окно с видеоинструкцией закрыто.', function() {
                utils.pressEscape();
                helper.videoWindow.expectToBeHiddenOrNotExist();
            });
            it('Нажимаю на кнопку открытия видеоинструкции. Окно с видеоинструкцией открыто.', function() {
                helper.openVideoButton.click();
                helper.videoWindow.expectToBeVisible();
            });
        });
        it('Нажимаю на кнопку свертывания превью видеоинструкции. Превью видеоинструкции свернуто.', function() {
            helper.collapseVideoButton.click();
            helper.collapseVideoButton.expectToBeHidden();
            helper.expandVideoButton.expectToBeVisible();
        });
    });
});
