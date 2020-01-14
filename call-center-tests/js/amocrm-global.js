define(function () {
    var phoneIconClickHandler;

    window.AMOCRM = {
        widgets: {
            notificationsPhone: function (args) {
                phoneIconClickHandler = args.click;
            }
        }
    };

    return function () {
        phoneIconClickHandler = function () {
            throw new Error('Обработчик нажатия на иконку с трубкой не был назначен.');
        };

        this.clickPhoneIcon = function () {
            phoneIconClickHandler();
        };
    };
});
