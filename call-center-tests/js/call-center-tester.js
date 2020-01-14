define(function () {
    return function (options) {
        var testersFactory = options.testersFactory,
            utils = options.utils,
            me = options.softphoneTester;

        me.loginField = testersFactory.createTextFieldTester(function () {
            return document.querySelector('input[placeholder="Логин"]');
        });

        me.passwordField = testersFactory.createTextFieldTester(function () {
            return document.querySelector('input[placeholder="Пароль"]');
        });

        me.phoneField = testersFactory.createTextFieldTester(function () {
            return document.querySelector('input[placeholder="Введите номер..."]');
        });

        me.enterButton = testersFactory.createDomElementTester(function () {
            return utils.descendantOfBody().matchesSelector('button').textEquals('Войти').find();
        });

        me.rememberMeCheckbox = testersFactory.createDomElementTester(function () {
            return utils.descendantOfBody().matchesSelector('span').textEquals('Запомнить меня').find().
                closest('label').querySelector('input');
        });

        me.dialpadButton = function (text) {
            return testersFactory.createDomElementTester(function () {
                return utils.descendantOfBody().matchesSelector('.clct-adress-book__dialpad-button').textEquals(text).
                    find();
            });
        };

        me.callButton = testersFactory.createDomElementTester(function () {
            return document.querySelector('.clct-adress-book__dialpad-callbutton');
        });

        me.dialpadHeader = testersFactory.createDomElementTester(function () {
            return document.querySelector('.clct-adress-book__dialpad-header');
        });

        me.callNotification = testersFactory.createDomElementTester(function () {
            return document.querySelector('.clct-notification');
        });

        me.acceptIncomingCallButton = testersFactory.createDomElementTester(function () {
            return document.querySelector('.clct-notification__button--startcall');
        });

        me.declineIncomingCallButton = testersFactory.createDomElementTester(function () {
            return document.querySelector('.clct-notification__button--stopcall');
        });

        me.firstLineButton = testersFactory.createDomElementTester(function () {
            return utils.descendantOfBody().matchesSelector('.clct-radio-button-default-inner').textEquals('1 линия').
                find().closest('.clct-c-button');
        });

        me.secondLineButton = testersFactory.createDomElementTester(function () {
            return utils.descendantOfBody().matchesSelector('.clct-radio-button-default-inner').textEquals('2 линия').
                find().closest('.clct-c-button');
        });

        return me;
    };
});
