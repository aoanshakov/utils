tests.addTest(function(params) {
    const {
        windowOpener,
        requestsManager,
        testersFactory,
        wait,
        utils,
    } = params;

    describe('Открываю раздел событий', function() {
        let tester;

        afterEach(function() {
            tester.destroy();
            window.isIFrame = false;
        });

        describe('в IFrame.', function() {
            beforeEach(function() {
                window.isIFrame = true;
                tester = new SitemanagementEvent(params);

                tester.eventRequest().receiveResponse();
                tester.segmentRequest().receiveResponse();
                tester.siteEventTypesRequest().receiveResponse();
            });

            it(
                'Отмечаю чекбокс "Считать событие целью". Чекбоксы "Расширенная настройка передачи события в UA" и ' +
                '"Расширенная настройка передачи события в Яндекс.Метрику" скрыты.',
            function() {
                tester.checkbox.
                    withLabel('Считать событие целью').
                    click();

                tester.checkbox.
                    withLabel('Расширенная настройка передачи события в UA').
                    expectToBeHiddenOrNotExist();

                tester.checkbox.
                    withLabel('Расширенная настройка передачи события в Яндекс.Метрику').
                    expectToBeHiddenOrNotExist();
            });
            it(
                'Чекбоксы "Расширенная настройка передачи события в UA" и "Расширенная настройка передачи события в ' +
                'Яндекс.Метрику" скрыты.',
            function() {
                tester.checkbox.
                    withLabel('Расширенная настройка передачи события в UA').
                    expectToBeHiddenOrNotExist();

                tester.checkbox.
                    withLabel('Расширенная настройка передачи события в Яндекс.Метрику').
                    expectToBeHiddenOrNotExist();
            });
        });
        describe('не в IFrame.', function() {
            beforeEach(function() {
                tester = new SitemanagementEvent(params);

                tester.eventRequest().receiveResponse();
                tester.segmentRequest().receiveResponse();
                tester.siteEventTypesRequest().receiveResponse();
            });

            it(
                'Отмечаю чекбокс "Считать событие целью". Чекбокс "Расширенная настройка передачи события в UA" скрыт.',
            function() {
                tester.checkbox.
                    withLabel('Считать событие целью').
                    click();

                tester.checkbox.
                    withLabel('Расширенная настройка передачи события в UA').
                    expectToBeVisible();

                tester.checkbox.
                    withLabel('Расширенная настройка передачи события в Яндекс.Метрику').
                    expectToBeVisible();
            });
            it(
                'Чекбоксы "Расширенная настройка передачи события в UA" и "Расширенная настройка передачи события в ' +
                'Яндекс.Метрику" скрыты.',
            function() {
                tester.checkbox.
                    withLabel('Расширенная настройка передачи события в UA').
                    expectToBeHiddenOrNotExist();

                tester.checkbox.
                    withLabel('Расширенная настройка передачи события в Яндекс.Метрику').
                    expectToBeHiddenOrNotExist();
            });
        });
        describe('Без компонента Яндекс.Метрики.', function() {
            beforeEach(function() {
                Comagic.getApplication().setHasNotComponent('yandex_metrika');
                tester = new SitemanagementEvent(params);

                tester.eventRequest().receiveResponse();
                tester.segmentRequest().receiveResponse();
                tester.siteEventTypesRequest().receiveResponse();
            });

            it(
                'Отмечаю чекбокс "Считать событие целью". Чекбокс "Расширенная настройка передачи события в UA" скрыт.',
            function() {
                tester.checkbox.
                    withLabel('Считать событие целью').
                    click();

                tester.checkbox.
                    withLabel('Расширенная настройка передачи события в UA').
                    expectToBeVisible();

                tester.checkbox.
                    withLabel('Расширенная настройка передачи события в Яндекс.Метрику').
                    expectToBeHiddenOrNotExist();
            });
            it(
                'Чекбоксы "Расширенная настройка передачи события в UA" и "Расширенная настройка передачи события в ' +
                'Яндекс.Метрику" скрыты.',
            function() {
                tester.checkbox.
                    withLabel('Расширенная настройка передачи события в UA').
                    expectToBeHiddenOrNotExist();

                tester.checkbox.
                    withLabel('Расширенная настройка передачи события в Яндекс.Метрику').
                    expectToBeHiddenOrNotExist();
            });
        });
    });
});
