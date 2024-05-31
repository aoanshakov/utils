define(function () {
    return function (options) {
        var initialize = options.initialize || (() => null),
            testersFactory = options.testersFactory,
            utils = options.utils,
            ajax = options.ajax,
            Sip = options.Sip,
            webSockets = options.webSockets,
            rtcConnectionsMock = options.rtcConnectionsMock,
            userMedia = options.userMedia,
            soundSources = options.soundSources,
            mediaStreamsTester = options.mediaStreamsTester,
            playingOscillatorsTester = options.playingOscillatorsTester,
            decodedTracksTester = options.decodedTracksTester,
            spendTime = options.spendTime,
            addSecond = options.addSecond,
            triggerMutation = options.triggerMutation,
            broadcastChannels = options.broadcastChannels,
            softphoneHost = options.softphoneHost,
            sip,
            eventsWebSocket,
            me = softphoneTester = this,
            webRtcUrlParam = 'webrtc_url',
            webRtcUrl = 'wss://webrtc.uiscom.ru',
            webRtcUrlForGettingSocket = webRtcUrl,
            registrationTesterExtentor = function () {};

        window.broadcastChannelCache = {};
        window.softphoneBroadcastChannelCache = {};

        var updateWebRtcUrlForGettingSocket = function (index) {
            return {
                webRtcUrlForGettingSocket: webRtcUrlForGettingSocket,
                index: index
            };
        };

        initialize();

        function getSipLineButton (index) {
            return document.querySelectorAll('.cmg-sip-line-button')[index];
        }

        this.spendTime = value => {
            spendTime(value);
            spendTime(0);
            spendTime(0);
        };

        this.employeeRow = text => (domElement => {
            const tester = testersFactory.createDomElementTester(domElement),
                click = tester.click.bind(tester);

            tester.click = () => (click(), spendTime(0), spendTime(0))
            tester.expectToBeDisabled = () => tester.expectToHaveClass('cmg-disabled');
            tester.expectToBeEnabled = () => tester.expectNotToHaveClass('cmg-disabled');

            tester.statusIcon = (() => {
                const tester = testersFactory.createDomElementTester(domElement.querySelector(
                    '.cmg-employee-status svg'
                ));

                tester.expectToBe = status => tester.expectToHaveClass(
                    `${status}_svg__uis-webrtc-${status}-status-icon`
                );

                tester.expectToBeInCall = () => tester.expectToHaveClass('in_call_svg__cmg-in-call-icon');

                return tester;
            })();

            tester.transferIcon = testersFactory.createDomElementTester(domElement.querySelector(
                '.transfer_employee_svg__cmg-employee-transfer-icon'
            ));

            tester.callIcon = testersFactory.createDomElementTester(domElement.querySelector(
                '.employees_grid_call_icon_svg__cmg-employee-call-icon'
            ));

            return tester;
        })(utils.descendantOfBody().matchesSelector('.cmg-employee').textContains(text).find());

        this.employeesGrid = (() => {
            const getDomElement = () => document.querySelector('.cmg-transfer-grid'),
                tester = testersFactory.createDomElementTester(getDomElement);

            tester.row = text => me.employeeRow(text);
            return tester;
        })();

        this.softphone = (getRootElement => {
            const tester = testersFactory.createDomElementTester(getRootElement);

            tester.expectToBeCollapsed = () => tester.expectToHaveHeight(212);
            tester.expectToBeExpanded = () => tester.expectToHaveHeight(568);

            tester.visibilityButton = testersFactory.createDomElementTester('.cmg-softphone-visibility-button');

            const click = tester.visibilityButton.click.bind(tester.visibilityButton);

            tester.visibilityButton.click = () => {
                click();
                spendTime(0);
                spendTime(0);

                me.triggerPageResize();
            };

            return tester;
        })(() => document.querySelector('#cmg-amocrm-widget') || new JsTester_NoElement());

        this.collapsednessToggleButton = (() => {
            const tester = testersFactory.createDomElementTester('.cmg-collapsedness-toggle-button svg'),
                buttonTester = testersFactory.createDomElementTester('.cmg-collapsedness-toggle-button');

            const click = tester.click.bind(tester);
            tester.click = () => (click(), spendTime(0), spendTime(0));

            tester.expectToBeExpanded = () => buttonTester.expectToHaveClass('cmg-expanded');
            tester.expectToBeCollapsed = () => buttonTester.expectNotToHaveClass('cmg-expanded');

            return tester;
        })();

        this.hideButton = (() => {
            const tester = testersFactory.createDomElementTester('.cmg-hide-button');

            const click = tester.click.bind(tester);
            tester.click = () => (click(), spendTime(0), spendTime(0));

            return tester;
        })();

        this.collapsednessButton = this.collapsednessToggleButton;

        this.contactOpeningButton = (() => {
            const tester = testersFactory.createDomElementTester('#cmg-open-contact-button'),
                click = tester.click.bind(tester);

            tester.click = () => {
                click();
                spendTime(0);
                spendTime(0);
                spendTime(0);
            };

            return tester;
        })();

        this.addTesters = (me, getRootElement) => {
            const rootTester = utils.element(getRootElement);

            {
                const augmentTester = tester => {
                    const fill = tester.fill.bind(tester);

                    tester.fill = value => {
                        fill(value);

                        spendTime(0);
                        spendTime(0);
                    };

                    return tester;
                };

                me.textarea = augmentTester(testersFactory.createTextFieldTester(
                    () => utils.element(getRootElement()).querySelector('textarea')
                ));

                me.textarea.withPlaceholder = placeholder => augmentTester(testersFactory.createTextFieldTester(
                    () => Array.prototype.slice.call(
                        utils.element(getRootElement()).querySelectorAll('textarea'), 0
                    ).find(
                        textarea => textarea.placeholder == placeholder
                    ) || new JsTester_NoElement()
                ));
            }

            {
                const getInputs = () => Array.prototype.slice.call(
                    (getRootElement() || new JsTester_NoElement()).querySelectorAll('input[type=text]'), 0
                );

                const getInput = () => utils.getVisibleSilently(getInputs());

                const addMethods = getInput => {
                    const tester = testersFactory.createTextFieldTester(getInput),
                        clear = tester.clear.bind(tester),
                        fill = tester.fill.bind(tester),
                        input = tester.input.bind(tester),
                        click = tester.click.bind(tester),
                        pressEnter = tester.pressEnter.bind(tester),
                        getUiInput = () => (getInput() || new JsTester_NoElement()).closest('.ui-input, .cmgui-input'),
                        uiInputTester = testersFactory.createDomElementTester(getUiInput);

                    tester.clear = () => (clear(), spendTime(0), spendTime(0));
                    tester.click = () => (click(), spendTime(0), spendTime(0), tester);
                    tester.fill = value => (clear(), spendTime(0), fill(value), spendTime(0), spendTime(0), tester);
                    tester.input = value => (input(value), spendTime(0), spendTime(0), tester); 
                    tester.pressEnter = () => (pressEnter(), spendTime(0), tester);

                    tester.expectNotToHaveError = () => uiInputTester.expectToHaveNoneOfClasses([
                        'ui-input-error',
                        'cmgui-input-error'
                    ]);

                    tester.expectToHaveError = () => uiInputTester.expectToHaveAnyOfClasses([
                        'ui-input-error',
                        'cmgui-input-error'
                    ]);

                    tester.clearIcon = (() => {
                        const tester = testersFactory.createDomElementTester(
                            () => getUiInput().querySelector('.ui-input-suffix-close, .cmgui-input-suffix-close')
                        );

                        const click = tester.click.bind(tester);
                        tester.click = () => (click(), spendTime(0), spendTime(0));

                        return tester;
                    })();

                    return tester;
                };

                me.input = addMethods(getInput);
                me.input.atIndex = index => addMethods(() => getInputs()[index]);
                me.input.first = me.input.atIndex(0);

                me.input.withPlaceholder = placeholder => addMethods(() =>
                    utils.getVisibleSilently(getInputs().filter(input => input.placeholder == placeholder)));

                me.input.withFieldLabel = label => {
                    const labelEl = utils.descendantOf(getRootElement()).
                        textEquals(label).
                        matchesSelector(
                            '.ui-label-content-field-label, ' +
                            '.cmgui-label-content-field-label, ' +
                            '.cmgui-text-field-label'
                        ).
                        find();

                    const row = labelEl.closest('.ant-row'),
                        input = (row || labelEl.closest(
                            '.ui-label, ' +
                            '.cmgui-label, ' +
                            '.cmgui-text-field-wrapper'
                        )).querySelector('input');

                    return addMethods(() => input);
                };
            }

            me.slider = (() => {
                const tester = testersFactory.createDomElementTester(() =>
                    (getRootElement() || new JsTester_NoElement()).querySelector(
                        '.ant-slider-track, ' +
                        '.ui-slider-rail, ' +
                        '.cmgui-slider-rail'
                    ))

                const click = tester.click.bind(tester);
                tester.click = (...args) => (click(...args), spendTime(100), spendTime(0));

                return tester;
            })();

            const buttonSelector = 
                'button, ' +
                '.cm-contacts-contact-bar-section-header-subtitle, ' +
                '.ui-pagination-btns-pages__item, ' +
                '.cmgui-pagination-btns-pages__item, ' +
                '.clct-button, ' +
                '.clct-c-button, ' +
                '.ui-radio-content, ' +
                '.cmgui-radio-content, ' +
                '.cmg-switch-label, ' +
                '.misc-core-src-component-styles-module__label, ' +
                '.misc-core-src-components-menu-styles-module__label, ' +
                '.cmgui-tab-title, ' +
                '.cm-chats--tab-title, ' +
                '.cm-chats--title, ' +
                '.src-components-main-menu-nav-item-styles-module__label, ' +
                '.src-components-main-menu-settings-styles-module__label, ' +
                '.src-components-main-menu-menu-link-styles-module__item a, ' + 
                //'.cm-chats--chats-menu-link-text, ' +
                '.cm-chats--chats-menu-item > .label';

            me.button = (text, logEnabled) => {
                let domElement = utils.descendantOf(getRootElement()).
                    textEquals(text).
                    matchesSelector(buttonSelector).
                    find(logEnabled);

                domElement = domElement.querySelector('a') || domElement;

                const fieldTester = testersFactory.createDomElementTester(() => {
                    const radioWrapper = domElement.closest('.ui-radio-wrapper, .cmgui-radio-wrapper') ||
                        new JsTester_NoElement();

                    if (!utils.isNonExisting(radioWrapper)) {
                        return radioWrapper;
                    }

                    return (domElement.closest('.cmg-switch-wrapper') || new JsTester_NoElement()).
                        querySelector('.ui-switch, .cmgui-switch');
                });

                const tester = testersFactory.createDomElementTester(domElement),
                    click = tester.click.bind(tester),
                    putMouseOver = tester.putMouseOver.bind(tester);

                const isSwitch = (() => {
                    try {
                        return domElement.classList.contains('cmg-switch-label')
                    } catch (e) {
                        return false;
                    }
                })();

                tester.putMouseOver = () => (putMouseOver(), spendTime(100), spendTime(0));

                tester.click = () => {
                    isSwitch ? fieldTester.click() : click();

                    Promise.runAll(false, true);
                    spendTime(0);
                    spendTime(0);
                    spendTime(0);
                };

                const checkedClasses = isSwitch ? [
                    'ui-switch-checked',
                    'cmgui-switch-checked',
                ] : [
                    'ui-radio-wrapper-checked',
                    'cmgui-radio-wrapper-checked',
                ];
                const disabledClasses = isSwitch ? [
                    'ui-switch-disabled',
                    'cmgui-switch-disabled',
                ] : [
                    'ui-button-disabled',
                    'cmgui-button-disabled',
                ];

                const menuItemSelectedClass = [
                    'src-components-main-menu-nav-item-styles-module__item-selected',
                    'misc-core-src-component-styles-module__item-selected', 
                    'active',
                    'ui-tab-active',
                    'cmgui-tab-active',
                    'item-hovered',
                ];


                const getPressableElement = () => domElement.closest(
                    '.src-components-main-menu-nav-item-styles-module__item, ' +
                    '.misc-core-src-component-styles-module__item, ' +
                    '.cm-chats--left-menu--item, ' +
                    '.ui-tab, ' +
                    '.cmgui-tab, ' +
                    '.cm-chats--chats-menu-item'
                );

                const pressednessTester = testersFactory.createDomElementTester(getPressableElement);

                tester.counter = testersFactory.createDomElementTester(() => getPressableElement().querySelector(
                    '.cm-chats--new-messages-count, ' +
                    '.misc-core-src-component-styles-module__new-items-count'
                ));

                tester.expectToBePressed = () => pressednessTester.expectToHaveAnyOfClasses(menuItemSelectedClass);
                tester.expectNotToBePressed = () => pressednessTester.expectToHaveNoneOfClasses(menuItemSelectedClass);
                tester.expectToBeChecked = () => fieldTester.expectToHaveAnyOfClasses(checkedClasses);
                tester.expectNotToBeChecked = () => fieldTester.expectToHaveNoneOfClasses(checkedClasses);

                tester.expectToBeEnabled = () => isSwitch ?
                    fieldTester.expectToHaveNoneOfClasses(disabledClasses) :
                    tester.expectNotToHaveAttribute('disabled');

                tester.expectToBeDisabled = () => isSwitch ?
                    fieldTester.expectToHaveAnyOfClasses(disabledClasses) :
                    tester.expectToHaveAttribute('disabled');
                
                return tester;
            };

            me.fileButton = testersFactory.createDomElementTester(
                () => utils.element(getRootElement()).querySelector('.cmgui-file-drop-wrapper')
            );

            me.fileField = (() => {
                const getFileFields = () => getRootElement().querySelectorAll('input[type=file]');

                const tester = testersFactory.createFileFieldTester(() => {
                    const fileFields = getFileFields();

                    if (fileFields.length > 1) {
                        throw new Error('Найдено более одного поля для загрузки файлов.');
                    }

                    return fileFields[0];
                });

                tester.atIndex = index => testersFactory.createFileFieldTester(() => getFileFields()[index]);
                tester.first = tester.atIndex(0);

                tester.last = testersFactory.createFileFieldTester(() => {
                    const fileFields = getFileFields();
                    return fileFields[fileFields.length - 1];
                });

                return tester;
            })();

            me.button.atIndex = index => (() => {
                const tester = testersFactory.createDomElementTester(() => {
                    return utils.element(getRootElement()).querySelectorAll(buttonSelector)[index] ||
                        new JsTester_NoElement();
                });

                const click = tester.click.bind(tester);
                tester.click = () => (click(), spendTime(0));

                return tester;
            })();

            me.button.first = me.button.atIndex(0);

            me.switchButton = (() => {
                const switchButtonSelector = '.ui-switch, .cmgui-switch';

                const createTester = (getButton) => {
                    const checkedClasses = ['ui-switch-checked', 'cmgui-switch-checked'],
                        disabledClasses = ['ui-switch-disabled', 'cmgui-switch-disabled'],
                        tester = testersFactory.createDomElementTester(getButton);

                    tester.expectToBeDisabled = () => tester.expectToHaveAnyOfClasses(disabledClasses)
                    tester.expectToBeEnabled = () => tester.expectToHaveNoneOfClasses(disabledClasses)

                    tester.expectToBeChecked = () => tester.expectToHaveAnyOfClasses(checkedClasses);
                    tester.expectNotToBeChecked = () => tester.expectToHaveNoneOfClasses(checkedClasses);

                    tester.expectToBeSelected = tester.expectToBeChecked;
                    tester.expectNotToBeSelected = tester.expectNotToBeChecked;

                    return tester;
                };

                const getter = text => createTester(
                    () => utils.descendantOf(getRootElement()).
                        textEquals(text).
                        matchesSelector('.cmg-switch-label').
                        find().
                        closest('.cmg-switch-wrapper').
                        querySelector(switchButtonSelector)
                );

                getter.atIndex = index => createTester(() =>
                    utils.element(getRootElement()).querySelectorAll(switchButtonSelector)[index]);

                getter.first = getter.atIndex(0);
                return getter;
            })();

            me.alert = (() => {
                const getDomElement = () => utils.element(getRootElement()).querySelector('.ui-alert, .cmgui-alert'),
                    tester = testersFactory.createDomElementTester(getDomElement);

                tester.closeButton = testersFactory.createDomElementTester(() =>
                    utils.element(getDomElement()).querySelector(
                        '.ui-alert-close-icon svg, ' +
                        '.cmgui-alert-close-icon svg'
                    ));

                const click = tester.closeButton.click.bind(tester.closeButton);
                tester.closeButton.click = () => {
                    click();
                    spendTime(0);
                    spendTime(500);
                };

                return tester;
            })();

            me.closeButton = (() => {
                const tester = testersFactory.createDomElementTester(
                    () => utils.element(getRootElement()).querySelector(
                        '.cmg-miscrophone-unavailability-message-close, ' +
                        '.cmg-connecting-message-close, ' +
                        '.ui-alert-close-icon svg, ' +
                        '.cmgui-alert-close-icon svg, ' +
                        '.ui-audio-player__close, ' +
                        '.cmgui-audio-player__close, ' +
                        '.ui-notification-close-x, ' +
                        '.cmgui-notification-close-x'
                    ) 
                );

                const click = tester.click.bind(tester);
                tester.click = () => (click(), spendTime(0), spendTime(0));

                return tester;
            })();

            me.radioButton = text => {
                const tester = testersFactory.createDomElementTester(utils.descendantOf(getRootElement()).
                    textEquals(text).
                    matchesSelector('.ui-radio-wrapper, .cmgui-radio-wrapper, .cm-radio-button, .clct-radio-button').
                    find());

                const click = tester.click.bind(tester);
                tester.click = () => (click(), spendTime(0), spendTime(0));

                const selectedClasses = [
                    'ui-radio-wrapper-checked',
                    'cmgui-radio-wrapper-checked',
                    'clct-radio-button--selected',
                ];

                tester.expectToBeSelected = () => tester.expectToHaveAnyOfClasses(selectedClasses);
                tester.expectNotToBeSelected = () => tester.expectToHaveNoneOfClasses(selectedClasses);

                tester.expectToBeDisabled = () => tester.expectToHaveAnyOfClasses([
                    'ui-radio-wrapper-disabled',
                    'cmgui-radio-wrapper-disabled',
                ]);

                tester.expectToBeEnabled = () => tester.expectToHaveNoneOfClasses([
                    'ui-radio-wrapper-disabled',
                    'cmgui-radio-wrapper-disabled',
                ]);

                return tester;
            };

            me.stopCallButton = (() => {
                const tester = testersFactory.createDomElementTester(
                    () => rootTester.querySelector('.cmg-call-button-stop')
                );

                const click = tester.click.bind(tester);
                tester.click = () => (click(), spendTime(0));

                return tester;
            })();

            me.callStartingButton = (() => {
                const tester = testersFactory.createDomElementTester(
                    () => rootTester.querySelector('.cmg-call-button-start')
                );

                const click = tester.click.bind(tester);
                tester.click = () => (click(), spendTime(0));

                return tester;
            })();

            me.checkbox = (() => {
                const tester = testersFactory.createDomElementTester(
                    () => rootTester.querySelector('.ui-checkbox, .cmgui-checkbox')
                );

                const click = tester.click.bind(tester);
                tester.click = () => (click(), spendTime(0));

                const putMouseOver = tester.putMouseOver.bind(tester);
                tester.putMouseOver = () => (putMouseOver(), spendTime(100), spendTime(0));
                
                tester.expectToBeChecked = () => tester.expectToHaveClass('ui-checkbox-checked');
                tester.expectNotToBeChecked = () => tester.expectNotToHaveClass('ui-checkbox-checked');

                return tester;

            })() ;

            me.select = (getSelectField => {
                const createTester = (filter = () => true) => {
                    const tester = testersFactory.createDomElementTester(() => getSelectField(filter)),
                        click = tester.click.bind(tester);

                    const selectTester = testersFactory.createDomElementTester(() =>
                        getSelectField(filter).closest('.ui-select, .cmgui-select'));

                    tester.click = () => (click(), spendTime(0), spendTime(0));

                    tester.arrow = (tester => {
                        const click = tester.click.bind(tester);

                        tester.click = () => (click(), spendTime(0), spendTime(0));
                        return tester;
                    })(testersFactory.createDomElementTester(
                        () => getSelectField(filter).closest(
                            '.ui-select-container, .cmgui-select-container'
                        ).querySelector('.ui-icon svg, .cmgui-icon svg')
                    ));

                    !tester.popup && (tester.popup = Object.defineProperty(tester, 'popup', {
                        set: () => null,
                        get: () => {
                            const getDomElement = () => (
                                utils.getVisibleSilently(document.querySelectorAll(
                                    '.ui-select-popup, ' +
                                    '.cmgui-select-popup, ' +
                                    '.cm-chats--tags-editor'
                                )) || new JsTester_NoElement()
                            ).closest('div');

                            const tester = testersFactory.createDomElementTester(getDomElement)
                            return this.addTesters(tester, getDomElement);
                        } 
                    }));

                    tester.tag = text => {
                        const getTag = () =>  utils.descendantOf(getRootElement()).
                            textEquals(text).
                            matchesSelector('.cmg-softphone-call-history-marks-popup-value').
                            find();

                        const tester = testersFactory.createDomElementTester(getTag);

                        tester.closeButton = (() => {
                            const tester = testersFactory.createDomElementTester(() =>
                                utils.element(getTag()).querySelector('svg'));

                            const click = tester.click.bind(tester);
                            tester.click = () => (click(), spendTime(0));

                            return tester;
                        })();

                        return tester;
                    };
                    
                    tester.option = text => {
                        const option = utils.descendantOfBody().
                            matchesSelector('.ui-list-option, .cmgui-list-option, .cm-chats--tags-option').
                            textEquals(text).
                            find();

                        const tester = testersFactory.createDomElementTester(option),
                            click = tester.click.bind(tester),
                            checkbox = option.querySelector('.ui-checkbox, .cmgui-checkbox');

                        tester.click = () => (click(), Promise.runAll(false, true), spendTime(0), spendTime(0), tester);

                        const disabledClassNames = ['ui-list-option-disabled', 'cmgui-list-option-disabled'];

                        tester.expectToBeDisabled = () => tester.expectToHaveAnyOfClasses(disabledClassNames);
                        tester.expectToBeEnabled = () => tester.expectToHaveNoneOfClasses(disabledClassNames);

                        tester.expectToBeSelected = logEnabled => {
                            if (utils.isNonExisting(checkbox)) {
                                tester.expectToHaveAnyOfClasses([
                                    'ui-list-option-selected',
                                    'cmgui-list-option-selected'
                                ]);
                            } else {
                                if (!checkbox.classList.contains('ui-checkbox-checked')) {
                                    throw new Error(`Опиция "${text}" должна быть отмечена.`);
                                }
                            }
                        };

                        tester.expectNotToBeSelected = () => {
                            if (utils.isNonExisting(checkbox)) {
                                tester.expectToHaveNoneOfClasses([
                                    'ui-list-option-selected',
                                    'cmgui-list-option-selected'
                                ]);
                            } else {
                                if (checkbox.classList.contains('ui-checkbox-checked')) {
                                    throw new Error(`Опиция "${text}" не должна быть отмечена.`);
                                }
                            }
                        };

                        return tester;
                    };

                    tester.expectToBeDisabled = () => selectTester.expectToHaveAnyOfClasses([
                        'ui-select-disabled',
                        'cmgui-select-disabled',
                    ]);

                    tester.expectToBeEnabled = () => selectTester.expectToHaveNoneOfClasses([
                        'ui-select-disabled',
                        'cmgui-select-disabled',
                    ]);

                    return tester;
                };

                const tester = createTester();

                tester.atIndex = expectedIndex => createTester((select, index) => index === expectedIndex);
                tester.first = tester.atIndex(0)

                tester.withValue = expectedValue =>
                    createTester(select => utils.getTextContent(select) == expectedValue);

                tester.withPlaceholder = expectedPlaceholder => createTester(select => utils.getTextContent(
                    select.querySelector('.ui-select-placeholder, .cmgui-select-placeholder') ||
                    new JsTester_NoElement()
                ) == expectedPlaceholder);

                return tester;
            })((filter = () => true) => [
            '.ui-select-field',
            '.cmgui-select-field',
            '.ui-select',
            '.cmgui-select'
        ].reduce((domElement, selector) => domElement || utils.getVisibleSilently(
            Array.prototype.slice.call(
                (
                    getRootElement() ||
                    new JsTester_NoElement()
                ).querySelectorAll(selector),

                0
            ).filter(filter)
        ), null) || new JsTester_NoElement())

            return me;
        };

        this.addTesters(this, () => document.body);

        this.createRootTester = selector => {
            const getRootElement = () => document.querySelector(selector) || new JsTester_NoElement();

            return this.addTesters(
                testersFactory.createDomElementTester(getRootElement),
                getRootElement,
            );
        };

        this.fieldRow = text => (() => {
            const labelEl = utils.descendantOfBody().
                textEquals(text).
                matchesSelector(
                    '.ui-label-content-field-label, ' +
                    '.cmgui-label-content-field-label, ' +
                    '.clct-settings-field-label'
                ).
                find();

            const row = labelEl.closest('.ant-row, .clct-settings-field-row'),
                me = testersFactory.createDomElementTester(row);

            return this.addTesters(me, () => row);
        })();

        this.innerContainer = this.createRootTester('#cmg-inner-container');

        this.callDataSectionTitle = function (text) {
            const tester = testersFactory.createDomElementTester(
                utils.descendantOfBody().matchesSelector('.clct-notification-tab-title').textEquals(text).find()
            );

            const click = tester.click.bind(tester);
            tester.click = () => (click(), spendTime(0));

            return tester;
        };

        this.otherChannelCallNotification = (() => {
            const getRootElement = () => utils.querySelector('#cmg-another-sip-line-incoming-call-notification');

            const tester = this.addTesters(
                testersFactory.createDomElementTester(getRootElement),
                getRootElement,
            );

            const click = tester.click.bind(tester);
            tester.click = () => (click(), spendTime(0), spendTime(0));

            return tester;
        })();

        const createBottomButtonTester = selectorOrTester => {
            const tester = typeof selectorOrTester == 'string' ?
                testersFactory.createDomElementTester(selectorOrTester) :
                selectorOrTester;

            const click = tester.click.bind(tester),
                selectedClassName = 'cmg-bottom-button-selected';

            tester.click = () => (click(), spendTime(0), spendTime(0), spendTime(0), spendTime(0), spendTime(0));

            tester.expectToBePressed = () => tester.expectToHaveClass(selectedClassName);
            tester.expectNotToBePressed = () => tester.expectNotToHaveClass(selectedClassName);
            tester.expectToBeDisabled = () => tester.expectToHaveClass('cmg-button-disabled');
            tester.expectToBeEnabled = () => tester.expectNotToHaveClass('cmg-button-disabled');

            tester.indicator = tester.findElement('.cmg-indicator');

            return tester;
        };

        this.createBottomButtonTester = createBottomButtonTester; 
        this.settingsButton = createBottomButtonTester('.cmg-settings-button');
        this.callsHistoryButton = createBottomButtonTester('.cmg-calls-history-button');

        this.addressBookButton = (() => {
            const tester = testersFactory.createDomElementTester('#cmg-address-book-button');

            const click = tester.click.bind(tester);
            tester.click = () => (click(), spendTime(0), spendTime(0));

            return tester;
        })();

        this.microphoneButton = (() => {
            const tester = testersFactory.createDomElementTester('.cmg-microphone-button');

            const click = tester.click.bind(tester);
            tester.click = () => (click(), spendTime(0), spendTime(0));

            return tester;
        })();

        this.transferButton = (tester => {
            const click = tester.click.bind(tester);

            tester.click = () => (click(), spendTime(0), spendTime(0));
            return tester;
        })(testersFactory.createDomElementTester('#cmg-transfer-button'));

        this.firstLineButton = (() => {
            const tester = testersFactory.createDomElementTester(function () {
                return getSipLineButton(0);
            });

            const click = tester.click.bind(tester);
            tester.click = () => (click(), spendTime(0), spendTime(0));

            return tester;
        })();

        this.secondLineButton = (() => {
            const tester = testersFactory.createDomElementTester(function () {
                return getSipLineButton(1);
            });

            const click = tester.click.bind(tester);
            tester.click = () => (click(), spendTime(0), spendTime(0), spendTime(0));

            return tester;
        })();

        this.expectMicrophoneDeviceIdToEqual = function (mediaStream, expectedDeviceId) {
            var actualDeviceId = mediaStream.getAudioTracks()[0].getSettings().deviceId;

            if (!actualDeviceId && expectedDeviceId) {
                throw new Error('Устройство не указано, тогда как его идентификатор должено быть таким - "' +
                    expectedDeviceId + '".');
            }

            if (actualDeviceId != expectedDeviceId) {
                throw new Error('Идентификатор устройства должен быть таким - "' + expectedDeviceId + '", а не ' +
                    'таким - "' + actualDeviceId + '".');
            }
        }

        this.getPCMA8000sdp = function () {
            return [
                'v=0',
                'o=- 6845874344053138478 2 IN IP4 127.0.0.1',
                's=-',
                't=0 0',
                'a=msid-semantic: WMS 2c90093a-9b17-4821-aaf3-7b858065ff07',
                'a=group:BUNDLE 0',
                'm=audio 9 UDP/TLS/RTP/SAVPF 8',
                'c=IN IP4 0.0.0.0',
                'a=rtpmap:8 PCMA/8000',
                'a=rtcp:9 IN IP4 0.0.0.0',
                'a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level',
                'a=extmap:2 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01',
                'a=extmap:3 urn:ietf:params:rtp-hdrext:sdes:mid',
                'a=extmap:4 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id',
                'a=extmap:5 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id',
                'a=setup:actpass',
                'a=mid:0',
                'a=msid:2c90093a-9b17-4821-aaf3-7b858065ff07 f807f562-5698-4b34-a298-bc3f780934c3',
                'a=sendrecv',
                'a=ice-ufrag:7MXY',
                'a=ice-pwd:KAoEygUaHA9Mla0gjHYN9/tK',
                'a=fingerprint:sha-256 59:53:4D:AF:66:F5:F1:CE:3A:F7:93:13:5A:E6:07:19:1E:03:E9:22:A1:19:B2:49:6B:C7:37:86:90:21:2B:42',
                'a=ice-options:trickle',
                'a=ssrc:3906726496 cname:bn9leCsdnF9+R5yv',
                'a=ssrc:3906726496 msid:2c90093a-9b17-4821-aaf3-7b858065ff07 f807f562-5698-4b34-a298-bc3f780934c3',
                'a=ssrc:3906726496 mslabel:2c90093a-9b17-4821-aaf3-7b858065ff07',
                'a=ssrc:3906726496 label:f807f562-5698-4b34-a298-bc3f780934c3',
                'a=rtcp-mux',
                ''
            ].join("\r\n");
        };

        this.anchor = function (text) {
            const tester = testersFactory.createAnchorTester(
                utils.descendantOfBody().matchesSelector('a').textEquals(text).find()
            );

            const click = tester.click.bind(tester);
            tester.click = () => (click(), spendTime(0), spendTime(0));

            return tester;
        }

        this.clctPopover = testersFactory.createDomElementTester('.clct-popover');

        this.flushUpdates = function () {
            utils.pressKey('j');
        };

        var isJanus = false;

        this.isJanus = function () {
            return isJanus;
        };

        this.setJanusWebrtcUrl = function () {
            isJanus = true;
            webRtcUrl = 'wss://webrtc-test.callgear.com:8989/ws';
            webRtcUrlForGettingSocket = webRtcUrl;
        };

        var processSettings = function () {};

        this.setJanusWebrtcUrlForSpecialRegistration = function () {
            this.setJanusWebrtcUrl();

            processSettings = function (settings) {
                settings.sip_login = '077368webrtc';
                settings.sip_phone = '077368';
            };
        };

        this.setJanusAndJsSIPUrls = function () {
            isJanus = true;
            webRtcUrl = ['wss://webrtc.uiscom.ru', 'wss://webrtc-test.callgear.com:8989/ws'],
            webRtcUrlForGettingSocket = /^wss:\/\/webrtc/;
        };

        this.setTwoJanusUrls = function () {
            isJanus = true;
            webRtcUrl = ['wss://pp-janus-1.uiscom.ru:8989', 'wss://pp-janus-2.uiscom.ru:8989'],
            webRtcUrlForGettingSocket = /^wss:\/\/pp-janus-\d{1}.uiscom.ru:8989$/;
        };

        function setCallGearWebRtcUrlUpdater () {
            updateWebRtcUrlForGettingSocket = function (index) {
                return {
                    webRtcUrlForGettingSocket: webRtcUrl[index],
                    index: 0
                };
            };
        }

        this.setTwoCallGearJanusUrls = function () {
            isJanus = true;
            setCallGearWebRtcUrlUpdater();
            this.setTwoJanusUrls();
        };

        this.setTwoJsSIPUrls = function () {
            isJanus = false;
            webRtcUrl = ['wss://webrtc-1.uiscom.ru', 'wss://webrtc-2.uiscom.ru'],
            webRtcUrlForGettingSocket = /^wss:\/\/webrtc-\d{1}.uiscom.ru$/;
        };

        this.setTwoJsSIPCallGearUrls = function () {
            isJanus = false;
            setCallGearWebRtcUrlUpdater();
            this.setTwoJsSIPUrls();
        };

        this.setTwoJsSIPUrlsInWebrtcUrls = function () {
            isJanus = false;
            this.setTwoJsSIPUrls();
            webRtcUrlParam = 'webrtc_urls';
        };

        this.anotherWebRTCURL = () => (webRtcUrlForGettingSocket = 'wss://rtu-webrtc.uiscom.ru');

        this.setJsSIPRTUUrl = function () {
            isJanus = false;
            webRtcUrl = ['wss://rtu-webrtc.uiscom.ru'],
            webRtcUrlParam = 'rtu_webrtc_urls';
            this.anotherWebRTCURL();
        };

        this.setJanusRTUUrl = function () {
            isJanus = true;
            webRtcUrl = 'wss://webrtc-test.callgear.com:8989/ws';
            webRtcUrlParam = 'rtu_webrtc_urls';
            webRtcUrlForGettingSocket = webRtcUrl;
        };

        this.body = testersFactory.createDomElementTester(function () {
            return document.body;
        });

        this.callButton = testersFactory.createDomElementTester(function () {
            return document.querySelector('#cmg-top-buttons .cmg-call-button-start');
        });

        this.stopButton = (() => {
            const tester = testersFactory.createDomElementTester(function () {
                return document.querySelector('#cmg-top-buttons .cmg-call-button-stop');
            });

            const click = tester.click.bind(tester);
            tester.click = () => (click(), spendTime(0));

            return tester;
        })();

        this.clctCButton = function (text) {
            var tester = testersFactory.createDomElementTester(utils.descendantOfBody().
                matchesSelector('.clct-c-button').textEquals(text).find());

            var click = tester.click.bind(tester);

            tester.click = function () {
                click();
                Promise.runAll(false, true);
                spendTime(0);
                spendTime(0);
            };

            return tester;
        };

        this.holdButton = (() => {
            const tester = testersFactory.createDomElementTester('.cmg-hold-button');

            const click = tester.click.bind(tester);
            tester.click = () => (click(), spendTime(0), spendTime(0));

            return tester;
        })();

        this.dialpadVisibilityButton = (() => {
            const tester = testersFactory.createDomElementTester('#cmg-dialpad-visibility-toggler'),
                click = tester.click.bind(tester),
                moveMouseOut = tester.click.bind(tester);

            tester.click = () => (click(), spendTime(0), spendTime(0));
            tester.moveMouseOut = () => (moveMouseOut(), spendTime(0), spendTime(0));

            return tester;
        })();

        function getDialpad () {
            return document.querySelector('.clct-adress-book__dialpad-buttons');
        }

        this.dialpadButton = function (text) {
            const tester = testersFactory.createDomElementTester(function () {
                return utils.descendantOf(getDialpad()).matchesSelector('.clct-adress-book__dialpad-button-digit').
                    textEquals(text).find().closest('.clct-adress-book__dialpad-button');
            });

            const click = tester.click.bind(tester);
            tester.click = () => (click(), spendTime(0));

            return tester;
        };

        this.dialpad = (() => {
            const tester = testersFactory.createDomElementTester(getDialpad);
            tester.button = me.dialpadButton;

            return tester;
        })();

        this.removeDigitButton = (() => {
            const tester = testersFactory.createDomElementTester(function () {
                return document.querySelector('.clct-adress-book__dialpad-header-clear');
            });

            const click = tester.click.bind(tester);
            tester.click = () => (click(), spendTime(0));

            return tester;
        })();

        this.settingsSelect = function (text) {
            function getSelector () {
                return utils.descendantOfBody().
                    matchesSelector('.ant-select-selector .clct-settings__config__content__selector__label').
                    textEquals(text).
                    find().
                    closest('.ant-select-selector');
            };

            var selectorTester = testersFactory.createDomElementTester(getSelector);

            var valueTester = testersFactory.createDomElementTester(function () {
                return getSelector().querySelector('.clct-settings__config__content__selector__value');
            });

            selectorTester.expectToHaveValue = function (expectedValue) {
                return valueTester.expectToHaveTextContent(expectedValue);
            };

            selectorTester.option = function (text) {
                return testersFactory.createDomElementTester(
                    utils.descendantOfBody().
                        matchesSelector('.ant-select-item-option .clct-settings__config__content__selector__value').
                        textEquals(text).
                        find().
                        closest('.ant-select-item-option')
                );
            };

            return selectorTester;
        };

        this.selectOption = function (numb) {
            return testersFactory.createDomElementTester(
                utils.descendantOfBody().matchesSelector('.clct-select__option').textEquals(numb).find()
            );
        };

        this.selectOptions = testersFactory.createDomElementTester(function () {
            return utils.descendantOfBody().matchesSelector('.clct-select__options');
        });

        this.modalWindow = testersFactory.createDomElementTester(function () {
            return document.querySelector('.clct-modal');
        });

        function getCallsGrid () {
            return document.querySelector('.clct-calls-history__items');
        }

        function getCallsGridItemNameContainer (name, index) {
            const conditions = utils.descendantOf(getCallsGrid()).
                matchesSelector('.clct-calls-history__item-inner-row').
                textEquals(name);

            if (!index && index !== 0) {
                return conditions.find();
            }

            return conditions.findAll()[index];
        }

        function getCallsGridItem (name) {
            var callsGridItemNameContainer = getCallsGridItemNameContainer(name);

            if (!callsGridItemNameContainer) {
                throw new Error('Не найдена строка с именем "' + name + '" в таблице истории звонков.');
            }
            
            return callsGridItemNameContainer.closest('.clct-calls-history__item');
        }

        this.getCallsGridItem = getCallsGridItem;

        this.spinner = testersFactory.createDomElementTester(
            '.clct-spinner, ' +
            '.ant-spin, ' +
            '.ui-spin-icon, ' +
            '.cmgui-spin-icon'
        );

        this.callsGridItemNameContainer = function (name) {
            function createTester (index) {
                return testersFactory.createDomElementTester(function () {
                    return getCallsGridItemNameContainer(name, index);
                });
            };

            var tester = createTester();

            tester.first = function () {
                return createTester(0);
            };

            return tester;
        };

        this.callsGridScrolling = function () {
            var callsGrid = getCallsGrid().querySelector('.simplebar-content-wrapper');

            if (!callsGrid) {
                throw new Error('Таблица звонков не найдена.');
            }

            var end = callsGrid.scrollHeight - callsGrid.clientHeight,
                top = Math.round(end / 2) || 1;

            return {
                toTheEnd: function () {
                    top = end;
                    return this;
                },
                scroll: function () {
                    var element = callsGrid,
                        event = new Event('scroll');

                    event.target = element;
                    element.scrollTop = top;
                    element.dispatchEvent(event);

                    spendTime(0);
                }
            };
        };

        this.callButtonInCallsGridItem = function (name) {
            return testersFactory.createDomElementTester(
                getCallsGridItem(name).querySelector('.clct-calls-history__start-call')
            );
        };

        this.callDirectionIcon = function (name) {
            return testersFactory.createDomElementTester(
                getCallsGridItem(name).querySelectorAll('.clct-calls-history__item-direction path')[0]
            );
        };

        this.callsHistoryRow = (() => {
            const createTester = row => {
                row = row || new JsTester_NoElement();
                const tester = testersFactory.createDomElementTester(row);

                tester.name =
                    testersFactory.createDomElementTester(row.querySelector('.clct-calls-history__item-inner-row'));

                const click = tester.name.click.bind(tester.name);
                tester.name.click = () => {
                    click();

                    spendTime(0);
                    spendTime(0);
                    spendTime(0);
                };

                tester.callIcon =
                    testersFactory.createDomElementTester(row.querySelector('.clct-calls-history__start-call'));
                tester.direction =
                    testersFactory.createDomElementTester(row.querySelector('.clct-calls-history__item-direction svg'));

                return tester;
            };

            return {
                atIndex: index => createTester(document.querySelectorAll('.clct-calls-history__item')[index]),

                withText: text => createTester(utils.descendantOfBody().matchesSelector(
                    '.clct-calls-history__item-inner-row'
                ).textEquals(text).find().closest('.clct-calls-history__item'))
            };
        })();

        this.callsGrid = (() => {
            const tester = testersFactory.createDomElementTester(getCallsGrid);
            tester.row = me.callsHistoryRow;

            Object.defineProperty(tester, 'scrolling', {
                set: () => null,
                get: () => me.callsGridScrolling(),
            });

            tester.scroll = () => tester.scrolling.scroll();
            return tester;
        })();

        function getStatusesGrid () {
            return document.querySelector('.clct-status-popover');
        };

        this.statusesGrid = testersFactory.createDomElementTester(getStatusesGrid);

        this.userStatusOption = function (text) {
            return testersFactory.createDomElementTester(function () {
                return utils.descendantOf(getStatusesGrid()).matchesSelector('.clct-status-popover-item').
                    textEquals(text).find();
            });
        };

        this.currentStatusIcon = testersFactory.createDomElementTester(function () {
            return document.querySelector('.clct-current-status');
        });

        this.userStatusesButton =  testersFactory.createDomElementTester(function () {
            return document.querySelector('.clct-status-menu');
        });

        this.heartIcon = function () {
            return {
                atIndex: function (index) {
                    return testersFactory.createDomElementTester(
                        document.querySelectorAll('.clct-feedback__content-body-item-icon')[index] ||
                        new JsTester_NoElement()
                    )
                }
            };
        };

        this.authenticatedUser = function () {
            return {
                first_name: 'Стефка',
                id: 20816,
                is_in_call: false,
                last_name: 'Ганева',
                full_name: 'Ганева Стефка',
                position_id: null,
                short_phone: '9119',
                status_id: 3,
                is_sip_online: true,
                image: 'https://thispersondoesnotexist.com/image',
                lost_call_count: 0
            };
        };

        this.requestSaveNumberCapacity = function () {
            let response = {
                data: true
            };

            const bodyParams = {
                number_capacity_id: 124825
            };

            let respond = request => request.respondSuccessfullyWith(response);

            return {
                dontChange: function () {
                    bodyParams.number_capacity_id = 124824;
                    return this;
                },
                noResponse: function () {
                    respond = request => request.respondWithoutContent();
                    return this;
                },
                receiveResponse: function () {
                    return this.send();
                },
                send: function () {
                    respond(
                        ajax.recentRequest().
                            expectPathToContain('number_capacity/077368').
                            expectToHaveMethod('PATCH').
                            expectBodyToContain(bodyParams)
                    );

                    Promise.runAll(false, true);
                    spendTime(0);
                    spendTime(0);
                }
            };
        };

        this.numberCapacitySavingRequest = this.requestSaveNumberCapacity;

        this.requestContactCalls = function () {
            var queryParams = {
                numa: '79161234567'
            };

            return {
                setThirdNumber: function () {
                    queryParams.numa = '74950230626';
                    return this;
                },
                setSecondNumber: function () {
                    queryParams.numa = '74950230625';
                    return this;
                },
                setAnotherNumber: function () {
                    queryParams.numa = '79161234569';
                    return this;
                },
                receiveResponse: function () {
                    ajax.recentRequest().
                        expectPathToContain('/sup/api/v1/calls').
                        expectQueryToContain(queryParams).
                        respondSuccessfullyWith({
                            data: [{
                                cdr_type: 'default',
                                call_session_id: 980925444,
                                comment: null,
                                phone_book_contact_id: null,
                                direction: 'in',
                                duration: 20,
                                contact_name: 'Гяурова Марийка',
                                is_failed: false,
                                mark_ids: [],
                                number: '74950230625',
                                start_time: '2019-12-17 18:07:25.522'
                            }]
                        });

                    Promise.runAll();
                },
                send: function () {
                    this.receiveResponse();
                }
            };
        };

        this.callsRequest = () => {
            const params = {
                offset: undefined,
                limit: '100',
                search: '',
                is_strict_date_till: '0',
                with_names: undefined,
                from: '2019-10-19T00:00:00.000+03:00',
                to: '2019-12-19T23:59:59.999+03:00',
                call_directions: undefined,
                call_types: undefined,
                is_processed_by_any: undefined,
                group_id: undefined
            };

            let count = 100,
                total;

            let getResponse = count => [{
                cdr_type: 'forward_call',
                call_session_id: 980925444,
                comment: [
                    'Некий https://ya.ru комментарий ' +
                    'http://ya.ru http тоже можно ' +
                    'hhttp://ya.ru уже нельзя',
                    'ищет на всех https://go.comagic.ru/', 'строках'
                ].join("\n"),
                phone_book_contact_id: 2204382409,
                direction: 'in',
                duration: 20,
                contact_name: 'Гяурова Марийка',
                crm_contact_link: 'https://comagicwidgets.amocrm.ru/contacts/detail/218401',
                is_failed: false,
                mark_ids: [88, 495],
                number: '74950230625',
                start_time: '2019-12-19T08:03:02.522+03:00',
                file_links: ['https://app.comagic.ru/system/media/talk/1306955705/3667abf2738dfa0a95a7f421b8493d3c/']
            }, {
                cdr_type: 'default',
                call_session_id: 980925445,
                comment: null,
                phone_book_contact_id: null,
                direction: 'out',
                duration: 21,
                contact_id: 1689283,
                contact_name: 'Манова Тома',
                crm_contact_link: null,
                is_failed: false,
                mark_ids: [],
                number: '74950230626',
                start_time: '2019-12-18T18:08:25.522+03:00',
                file_links: [
                    'https://app.comagic.ru/system/media/talk/1306955705/baf9be6ace6b0cb2f9b0e1ed0738db1a/',
                    'https://app.comagic.ru/system/media/talk/2938571928/2fj923fholfr32hlf498f8h18f1hfl1c/'
                ]
            }].concat(me.getCalls({
                date: '2019-12-17T18:07:25',
                count: count - 2
            }));

            const processors = [];

            const addResponseModifiers = me => {
                me.longMonths = () => ((processors.push(data => {
                    data[0].start_time = '2019-03-17T19:07:28.522+03:00';
                    data[1].start_time = '2019-06-16T21:09:26.522+03:00';
                    data[2].start_time = '2019-07-14T23:10:27.522+03:00';
                })), me),

                me.shortPhoneNumber = () => ((processors.push(data => (data[0].number = '56123'))), me)
                me.chilePhoneNumber = () => ((processors.push(data => (data[0].number = '56123456789'))), me)
                me.duplicatedCallSessionId = () => (processors.push(data => (data[1].call_session_id = 980925444)), me);
                me.isFailed = () => (processors.push(data => data.forEach(item => (item.is_failed = true))), me);
                me.noContactName = () => (processors.push(data => (data[0].contact_name = null)), me);
                me.noCrmContactLink = () => (processors.push(data => (data[0].crm_contact_link = null)), me);

                me.contactNameWithWithDigits = () => (processors.push(
                    data => (data[0].contact_name = 'Мой номер +7 (916) 234-56-78')
                ), me);

                me.noContact = () => (processors.push(data => {
                    data[1].contact_id = null;
                    data[1].contact_name = null;
                }), me);

                me.includesCallWithoutContact = () => me.noContact();

                me.serverError = () => {
                    receiveResponse = request =>
                        request.respondUnsuccessfullyWith('500 Internal Server Error Server got itself in trouble');

                    return me;
                };

                me.employeeName = () => {
                    processors.push(data => {
                        data[0].contact_name = null;
                        data[0].employee_id = 218402;
                        data[0].employee_name = 'Гяурова Марийка';
                    });

                    return me;
                };

                me.includesEmployeeCall = () => me.employeeName();

                me.noCalls = () => {
                    getResponse = () => [];
                    total = 0;
                    return me;
                };

                me.transferCall = () =>
                    (processors.push(data => (data.forEach(item => (item.cdr_type = 'transfer_call')))), me);

                me.noTotal = () => {
                    total = undefined;
                    count = 15;
                    return me;
                };

                return me;
            };

            let receiveResponse = request => {
                const data = getResponse(count);
                processors.forEach(process => process(data));
                total !== undefined && data.forEach(item => (item.total_count = total))

                request.respondSuccessfullyWith({data});
                Promise.runAll();
                //me.triggerScrollRecalculation();

                spendTime(0);
            };

            return addResponseModifiers({
                fromHalfOfTheYearAgo() {
                    params.from = '2019-06-19T00:00:00.000+03:00';
                    return this;
                },

                fromFirstWeekDay() {
                    params.from = '2019-12-16T00:00:00.000+03:00';
                    return this;
                },

                search(value) {
                    params.search = value;
                    return this;
                },

                changeDate() {
                    params.from = '2019-11-15T00:00:00.000+03:00';
                    params.to = '2019-12-18T23:59:59.999+03:00';
                    return this;
                },

                numa() {
                    params.numa = '38294829382;';
                    data = [];
                    return this;
                },

                anotherLimit() {
                    count = 15;
                    total = 15;
                    params.offset = '0';
                    params.limit = '25';
                    return this;
                },

                firstPage() {
                    count = 10;
                    total = 15;
                    params.offset = '0';
                    params.limit = '10';
                    return this;
                },

                secondPage() {
                    total = 15;
                    params.offset = params.limit = '10';

                    getResponse = () => me.getCalls({
                        date: '2021-05-17T18:07:25',
                        count: 5
                    });

                    return this;
                },

                infiniteScrollSecondPage() {
                    params.to = '2019-11-22T21:37:26.362+03:00';
                    params.is_strict_date_till = '1';

                    getResponse = () => me.getCalls({
                        date: '2019-11-21T15:03:32',
                        count: 100,
                    });

                    return this;
                },

                expectToBeSent() {
                    const request = ajax.recentRequest().
                        expectPathToContain('/sup/api/v1/users/me/calls').
                        expectQueryToContain(params);

                    return addResponseModifiers({
                        receiveResponse: () => (receiveResponse(request), spendTime(0), spendTime(0), spendTime(0))
                    });
                },

                receiveResponse() {
                    return this.expectToBeSent().receiveResponse();
                }
            });
        };

        this.numaRequest = () => {
            let numa = 79161234567;
            const processors = [];

            let respond = request => request.
                respondUnsuccessfullyWith('500 Internal Server Error Server got itself in trouble');

            function addResponseModifiers (me) {
                me.longName = function () {
                    respond = request => request.respondSuccessfullyWith({
                        data: 'ООО "КОБЫЛА И ТРУПОГЛАЗЫЕ ЖАБЫ ИСКАЛИ ЦЕЗИЮ НАШЛИ ПОЗДНО УТРОМ СВИСТЯЩЕГО ХНА"'
                    });

                    return me;
                };

                me.empty = function () {
                    respond = request => request.respondSuccessfullyWith({
                        data: ''
                    });

                    return me;
                };

                me.normalizedNumber = function () {
                    respond = request => request.respondSuccessfullyWith({
                        data: numa + ''
                    });

                    return me;
                };

                me.employeeNameIsFound = () => {
                    respond = request => request.respondSuccessfullyWith({
                        data: 'Шалева Дора'
                    });

                    return me;
                };

                me.employeeNameFound = me.employeeNameIsFound;
                return me;
            }

            return addResponseModifiers({
                anotherShortPhone: function () {
                    numa = 295;
                    return this;
                },

                shortPhone: function () {
                    numa = 79161;
                    return this;
                },

                intercept: function () {
                    numa = 88;
                    return this;
                },

                fifthPhoneNumber: function() {
                    numa = 79161234569; 
                    return this;
                },

                fifthPhone: function() {
                    return this.fifthPhoneNumber();
                },

                fourthPhoneNumber: function() {
                    numa = 79162729533; 
                    return this;
                },

                thirdNumber: function () {
                    numa = 79161234510;
                    return this;
                },

                anotherNumber() {
                    numa = 74950230625;
                    return this;
                },

                sixthPhone: function () {
                    numa = 74999951240;
                    return this;
                },

                seventhPhone: function () {
                    numa = '79161234567g';
                    return this;
                },

                anotherPhone: function () {
                    return this.anotherNumber();
                },

                anotherPhoneNumber: function () {
                    return this.anotherNumber();
                },

                expectToBeSent() {
                    processors.forEach(process => process());

                    const request = ajax.recentRequest().
                        expectPathToContain(`/sup/api/v1/numa/${numa}`).
                        expectToHaveMethod('GET');

                    return addResponseModifiers({
                        receiveResponse() {
                            respond(request);

                            Promise.runAll(false, true);
                            spendTime(0)
                        }
                    });
                },

                receiveResponse() {
                    this.expectToBeSent().receiveResponse();
                } 
            });
        };

        this.contactCallsRequest = function () {
            return this.requestContactCalls();
        };

        this.getCalls = function (args) {
            var date = args.date,
                process = args.process || function () {},
                name = args.name,
                i = args.start || 0,
                count = (args.count || 100) + i,
                interval = (1000 * 60 * 60 * 6) + (5 * 1000 * 60) + (12 * 1000) + 231,
                data = [];

            date = new Date(date);
            date = new Date(date.getTime() - (interval * i));

            for (;i < count; i ++) {
                date = new Date(date.getTime() - interval);

                var item = {
                    cdr_type: 'default',
                    call_session_id: 928502921 + i,
                    cdr_id: 931875921 + i,
                    comment: null,
                    direction: 'in',
                    duration: 22,
                    is_failed: false,
                    mark_ids: [],
                    number: '74950230627',
                    start_time: utils.formatDate(date),
                    contact_id: 425803 + i,
                    contact_name: 'Сотирова Атанаска',
                    file_links: null
                };

                process(item);
                data.push(item);
            }

            return data;
        };

        this.getMarks = () => [{
            id: 587,
            name: 'Нереализованная сделка',
            is_system: true,
            rating: 2
        }, {
            id: 87,
            name: 'Спам',
            is_system: true,
            rating: 6
        }, {
            id: 213,
            name: 'Продажа',
            is_system: true,
            rating: 1
        }, {
            id: 88,
            name: 'Нецелевой контакт',
            is_system: true,
            rating: 3
        }, {
            id: 148,
            name: 'Генератор лидов',
            is_system: true,
            rating: 7
        }, {
            id: 86,
            name: 'Фрод',
            is_system: true,
            rating: 4
        }, {
            id: 89,
            name: 'Лид',
            is_system: true,
            rating: 5
        }, {
            id: 2,
            name: 'В обработке',
            is_system: true,
            rating: 5
        }, {
            id: 495,
            name: 'Отложенный звонок',
            is_system: true,
            rating: 5
        }, {
            id: 1,
            name: 'Не обработано',
            is_system: true,
            rating: 5
        }, {
            id: 511,
            name: 'Обработано',
            is_system: true,
            rating: 5
        }, {
            id: 91,
            name: 'Кобыла и трупоглазые жабы искали цезию, нашли поздно кобылаитрупоглазыежаб' +
                'ыискалицезиюнашлипоздноутромсвистящегохна',
            is_system: true,
            rating: 5
        }];

        this.requestMarks = function () {
            return {
                expectToBeSent: function (requests) {
                    var request = requests ? requests.someRequest() : ajax.recentRequest();

                    return {
                        receiveResponse: function () {
                            request.expectPathToContain('/sup/api/v1/marks').respondSuccessfullyWith({
                                data: me.getMarks()
                            });

                            Promise.runAll(false, true);
                            spendTime(0);
                        },
                    };
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                },
                send: function () {
                    this.receiveResponse();
                }
            };
        };

        this.marksRequest = function () {
            return this.requestMarks();
        };

        this.addDefaultSettings = function (settings) {
            settings[webRtcUrlParam] = webRtcUrl;
            processSettings(settings);
            return settings;
        };

        this.settingsRequest = function () {
            return this.requestSettings();
        };

        this.requestMe = function () {
            var user = this.authenticatedUser();

            function addMethods (me) {
                me.newCall = () => ((user.lost_call_count = 1), me);

                me.sipIsOffline = function () {
                    user.is_sip_online = false;
                    return me;
                };

                me.setUnknownState = function () {
                    user.status_id = 6;
                    return me;
                };

                me.anotherStatus = function () {
                    user.status_id = 4;
                    return me;
                };

                return me;
            }

            var testRequest = function (request) {
                return request;
            };

            return addMethods({
                anotherAuthorizationToken: function () {
                    testRequest = function (request) {
                        return request.expectToHaveHeaders({
                            Authorization: 'Bearer 935jhw5klatxx2582jh5zrlq38hglq43o9jlrg8j3lqj8jf'
                        });
                    };

                    return this;
                },
                expectToBeSent: function () {
                    var request = testRequest(ajax.recentRequest().expectPathToContain('/sup/api/v1/users/me'));

                    return addMethods({
                        receiveResponse: function () {
                            request.respondSuccessfullyWith({
                                data: user 
                            });

                            spendTime(0);
                            spendTime(0);
                            spendTime(0);
                        }
                    });
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                },
                send: function () {
                    this.receiveResponse();
                }
            });
        };

        this.authenticatedUserRequest = this.requestMe;

        this.getUsers = function (is_in_call) {
            if (is_in_call === undefined) {
                is_in_call = true;
            }

            return [this.authenticatedUser(), {
                full_name: 'Шалева Дора',
                first_name: 'Дора',
                id: 82756,
                is_in_call: is_in_call,
                last_name: 'Шалева',
                position_id: null,
                short_phone: '8258',
                status_id: 6,
                is_sip_online: true,
                image: 'https://thispersondoesnotexist.com/image'
            }, {
                first_name: 'Николина',
                id: 583783,
                is_in_call: false,
                last_name: 'Господинова',
                full_name: 'Господинова Николина',
                position_id: null,
                short_phone: '295',
                status_id: 1,
                is_sip_online: true
            }, {
                full_name: 'Божилова Йовка',
                first_name: 'Йовка',
                id: 79582,
                is_in_call: false,
                last_name: 'Божилова',
                position_id: null,
                short_phone: '296',
                status_id: 2,
                is_sip_online: true,
                color: '#00aaea'
            }];
        };

        const triggerScrollRecalculation = () => {
            Array.prototype.slice.call(document.querySelectorAll('.simplebar-content'), 0).
                forEach(domElement => {
                    triggerMutation(domElement, {
                        childList: true,
                        subtree: true
                    }, []);
                });

            addSecond();
        };
        
        this.triggerScrollRecalculation = this.recalculateScroll = triggerScrollRecalculation;

        this.requestUsers = function () {
            let headers = {};

            var params = {
                with_active_phones: undefined
            };

            const additionalUsers = [],
                processors = [];
            let data,
                is_in_call = true,
                path = '/sup/api/v1/users',
                respond = request => request.respondSuccessfullyWith({data}),
                maybeTriggerScrollRecalculation = triggerScrollRecalculation;

            function addResponseModifiers (me) {
                me.withoutEmployee = () => {
                    processors.push(function (data) {
                        data.splice(3, 1);
                    });

                    return me;
                };

                me.anotherEmployee = () => {
                    processors.push(function (data) {
                        data[3] = {
                            id: 234234,
                            first_name: 'Теодора',
                            last_name: 'Велева',
                            is_in_call: false,
                            position_id: null,
                            short_phone: '297',
                            status_id: 1,
                            is_sip_online: true,
                        };
                    });

                    return me;
                };

                me.anotherStatus = () => {
                    processors.push(function (data) {
                        data[3].status_id = 1;
                    });

                    return me;
                };

                me.empty = function () {
                    processors.push(function (data) {
                        data.splice(0, data.length);
                    });

                    return me;
                };

                me.withoutSecondUser = function () {
                    processors.push(function (data) {
                        data.splice(2, 1);
                    });

                    return me;
                };

                me.noLastName = function () {
                    processors.push(function (data) {
                        data[2] && (data[2].last_name = null);
                    });

                    return me;
                };

                me.notInCall = function () {
                    is_in_call = false;
                    return me;
                };

                me.hasUserWithoutPhoneNumber = function () {
                    processors.push(function (data) {
                        data[3].short_phone = null;
                    });

                    return me;
                };

                me.accessTokenExpired = () => {
                    respond = request => request.respondUnauthorizedWith({
                        error: {
                            code: 401,
                            message: 'Token has been expired',
                            mnemonic: 'expired_token',
                            is_smart: false
                        }
                    });

                    return me;
                };

                me.anotherShortPhone = () => (processors.push(data => (data[2].short_phone = '2963')), me);

                me.addMoreUsers = me.addMore = me.many = function () {
                    var i;

                    for (i = 0; i < 3300; i ++) {
                        additionalUsers.push({
                            first_name: 'Иван',
                            id: 583784 + i,
                            is_in_call: false,
                            last_name: 'Иванов',
                            position_id: null,
                            short_phone: '123',
                            status_id: 6
                        });
                    }

                    return me;
                };

                return me;
            }

            return addResponseModifiers({
                forContacts: function () {
                    path = '$REACT_APP_BASE_URL/employees';
                    maybeTriggerScrollRecalculation = () => null;

                    headers = {
                        Authorization: undefined,
                        'X-Auth-Token': 'XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0',
                        'X-Auth-Type': 'jwt'
                    };

                    processors.push(data => {
                        data.forEach(({
                            id,
                            first_name,
                            last_name
                        }, index) => (data[index] = {
                            id,
                            first_name,
                            last_name
                        }))
                    });

                    return this;
                },
                forBitrix: function () {
                    path = 'https://$REACT_APP_BITRIX_WEB_URL/sup/api/v1/users';
                    return this;
                },
                setHavingActivePhones: function () {
                    params.with_active_phones = '1';
                    return this;
                },
                expectToBeSent: function (requests) {
                    var request = (requests ? requests.someRequest() : ajax.recentRequest()).
                        expectPathToContain(path).
                        expectQueryToContain(params);

                    return addResponseModifiers({
                        receiveError: function () {
                            request.respondUnsuccessfullyWith('500 Internal Server Error Server got itself in trouble');
                            Promise.runAll();
                        },
                        receiveResponse: function () {
                            data = me.getUsers(is_in_call).concat(additionalUsers);
                            processors.forEach(process => process(data));

                            respond(request);
                            Promise.runAll(false, true);
                            spendTime(0);
                            spendTime(0);
                            //maybeTriggerScrollRecalculation();
                        }
                    });
                },
                receiveResponse: function () {
                    this.send();
                },
                send: function () {
                    this.expectToBeSent().receiveResponse();
                }
            });
        };

        this.usersRequest = this.requestUsers;

        this.requestUsersInGroups = function () {
            var additionalUsersInGroups = [];

            var respond = request => request.respondSuccessfullyWith({
                data: [{
                    employee_id: 20816,
                    group_id: 89203,
                    id: 293032
                }, {
                    employee_id: 82756,
                    group_id: 89203,
                    id: 293033
                }, {
                    employee_id: 82756,
                    group_id: 82958,
                    id: 293034
                }, {
                    employee_id: 583783,
                    group_id: 82958,
                    id: 293035
                }, {
                    employee_id: 79582,
                    group_id: 17589,
                    id: 293036
                }].concat(additionalUsersInGroups)
            });

            function addResponseModifiers (me) {
                me.accessTokenExpired = () => {
                    respond = request => request.respondUnauthorizedWith({
                        error: {
                            code: 401,
                            message: 'Token has been expired',
                            mnemonic: 'expired_token',
                            is_smart: false
                        }
                    });

                    return me;
                };

                me.addMore = function () {
                    var i;

                    for (i = 0; i < 3300; i ++) {
                        additionalUsersInGroups.push({
                            id: 293037 + i,
                            employee_id: 20816,
                            group_id: 89204 + i
                        });
                    }

                    return me;
                };

                return me;
            }

            return addResponseModifiers({
                expectToBeSent: function () {
                    const request = ajax.recentRequest().expectPathToContain('/sup/api/v1/users_in_groups');

                    return addResponseModifiers({
                        receiveResponse: function () {
                            respond(request);
                            spendTime(0);
                            spendTime(0);
                        }
                    });
                },
                receiveResponse: function () {
                    this.send();
                },
                send: function () {
                    this.expectToBeSent().receiveResponse();
                }
            });
        };

        this.usersInGroupsRequest = this.requestUsersInGroups;

        this.requestGroups = function () {
            var additionalGroups = [];

            var respond = request => request.respondSuccessfullyWith({
                data: [{
                    id: 89203,
                    name: 'Отдел дистрибуции',
                    short_phone: '298'
                }, {
                    id: 82958,
                    name: 'Отдел региональных продаж',
                    short_phone: '828'
                }, {
                    id: 17589,
                    name: 'Отдел по работе с ключевыми клиентами',
                    short_phone: '726'
                }].concat(additionalGroups)
            });

            function addResponseModifiers (me) {
                me.addMore = function () {
                    var i;

                    for (i = 0; i < 3300; i ++) {
                        additionalGroups.push({
                            id: 89204 + i,
                            name: 'Отдел № ' + (i + 1),
                            short_phone: 100 + i + '',
                        });
                    }

                    return me;
                };
                
                me.accessTokenExpired = function () {
                    respond = request => request.respondUnauthorizedWith({
                        error: {
                            code: 401,
                            message: 'Token has been expired',
                            mnemonic: 'expired_token',
                            is_smart: false
                        }
                    });

                    return me;
                };

                return me;
            }

            return addResponseModifiers({
                receiveResponse: function () {
                    this.send();
                },
                expectToBeSent: function () {
                    var request = ajax.recentRequest().expectPathToContain('/sup/api/v1/groups');

                    return addResponseModifiers({
                        receiveResponse: function () {
                            respond(request);
                            Promise.runAll();
                            spendTime(0);
                        }
                    });
                },
                send: function () {
                    this.expectToBeSent().receiveResponse();
                }
            });
        };

        this.groupsRequest = function () {
            var request = this.requestGroups();

            return {
                accessTokenExpired: function () {
                    request.accessTokenExpired();
                    return this;
                },
                addMore: function () {
                    request.addMore();
                    return this;
                },
                expectToBeSent: function () {
                    return request.expectToBeSent();
                },
                receiveResponse: function () {
                    return request.send();
                }
            };
        };

        this.getTalkOptions = function (transferOption) {
            return [{
                button: transferOption,
                mnemonic: 'transfer_call'
            }, {
                button: '8',
                mnemonic: 'run_scenario'
            }, {
                button: '9',
                mnemonic: 'assign_personal_manager'
            }, {
                button: '3',
                mnemonic: 'record_talk'
            }, {
                button: '4',
                mnemonic: 'finish_conversation'
            }, {
                button: '7',
                mnemonic: 'call_coach'
            }, {
                button: '1',
                mnemonic: 'receive_fax'
            }, {
                button: '6',
                mnemonic: 'run_scenario'
            }, {
                button: '2',
                mnemonic: 'tag_call'
            }, {
                button: '5',
                mnemonic: 'save_numa'
            }, {
                button: '0',
                mnemonic: 'save_numa'
            }];
        };

        this.requestTalkOptions = function () {
            var button = '#',
                me = this;

            function addMethods (me) {
                me.setTransferButtonIsNotHash = function () {
                    button = '*';
                    return me;
                };

                return me;
            }

            return addMethods({
                expectToBeSent: function () {
                    var request = ajax.recentRequest();

                    return addMethods({
                        receiveResponse: function () {
                            request.expectPathToContain('/sup/api/v1/talk_options').
                                respondSuccessfullyWith({
                                    data: me.getTalkOptions(button) 
                                });

                            Promise.runAll();
                        }
                    });
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                },
                send: function () {
                    this.receiveResponse();
                }
            });
        };

        this.talkOptionsRequest = this.requestTalkOptions;

        this.requestNumberCapacity = function () {
            var data = [{
                id: 124823,
                numb: '79161238927'
            }, {
                id: 124824,
                numb: '74950216806'
            }, {
                id: 124825,
                numb: '79161238929',
                comment: 'Некий номер'
            }, {
                id: 124826,
                numb: '79161238930'
            }, {
                id: 124827,
                numb: '79161238931'
            }, {
                id: 124828,
                numb: '79161238932'
            }, {
                id: 124829,
                numb: '79161238933'
            }, {
                id: 124830,
                numb: '79162594727',
                comment: 'Другой номер'
            }, {
                id: 124831,
                numb: '79161238935',
                comment: 'Еще один номер'
            }, {
                id: 124832,
                numb: '79161238936'
            }, {
                id: 124833,
                numb: '79161238937'
            }, {
                id: 124834,
                numb: '79161238938'
            }];

            var sipLogin = '077368';

            function addMethods (me) {
                me.addMore = function () {
                    for (i = 0; i < 2070; i ++) {
                        data.push({
                            id: 124835 + i,
                            numb: 79161238939 + i + '',
                        });
                    }

                    return me;
                };

                me.withComment = function () {
                    data.find(item => item.id == 124824).comment = 'Отдел консалтинга';
                    return me;
                };

                me.withLongComment = function () {
                    data.find(item => item.id == 124824).comment = 'Кобыла и трупоглазые жабы искали цезию, нашли ' +
                        'поздно утром свистящего хнаааааааааааааааааааааааааааааааааааааааааааааааааааааааааааааааааа' +
                        'ааааааааааа';
                    return me;
                };

                me.setOnlyOneNumber = function () {
                    data = [{
                        id: 124824,
                        numb: '74950216806'
                    }];

                    return me;
                };

                me.onlyOneNumber = me.setOnlyOneNumber;

                me.anotherSIPLogin = function () {
                    sipLogin = '076909';
                    return me;
                };

                me.withoutFourthNumber = function () {
                    data.splice(3, 1);
                    return me;
                };

                me.withoutThirdNumber = function () {
                    data.splice(2, 1);
                    return me;
                };

                return me;
            }

            return addMethods({
                expectToBeSent: function (requests) {
                    var request = (requests ? requests.someRequest() : ajax.recentRequest()).
                        expectPathToContain('/sup/api/v1/number_capacity/' + sipLogin);

                    return addMethods({
                        receiveResponse: function () {
                            request.respondSuccessfullyWith({ data });

                            spendTime(0);
                            spendTime(0);
                            spendTime(0);
                        }
                    });
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                    spendTime(0);
                },
                send: function () {
                    this.receiveResponse();
                }
            });
        };

        this.numberCapacityRequest = this.requestNumberCapacity;

        this.requestPermissions = function () {
            var data = {
                softphone_all_calls_stat: {
                    is_delete: true,
                    is_insert: true,
                    is_select: true,
                    is_update: true
                },
                address_book: {
                    is_delete: true,
                    is_insert: true,
                    is_select: true,
                    is_update: true
                },
                tag_management: {
                    is_delete: true,
                    is_insert: true,
                    is_select: true,
                    is_update: true
                },
                call_session_commenting: {
                    is_delete: true,
                    is_insert: true,
                    is_select: true,
                    is_update: true
                },
                sip_line_number_capacity: {
                    is_delete: false,
                    is_insert: false,
                    is_select: false,
                    is_update: false
                },
                softphone_login: {
                    is_delete: false,
                    is_insert: false,
                    is_select: true,
                    is_update: false
                }
            };

            var me = {
                disallowSelectTags: function () {
                    return this.disallowTagManagementSelect();
                },
                disallowSelectCallSessionCommenting: function () {
                    return this.disallowCallSessionCommentingSelect();
                },
                disallowSelectSoftphoneAllCallsStat: function () {
                    return this.disallowSoftphoneAllCallsStatSelect();
                },
                disallowTagManagementInsert: function () {
                    data.tag_management.is_insert = false;
                    return this;
                },
                disallowTagManagementDelete: function () {
                    data.tag_management.is_delete = false;
                    return this;
                },
                disallowTagManagementSelect: function () {
                    data.tag_management.is_select = null;
                    return this;
                },
                disallowTagManagementUpdate: function () {
                    data.tag_management.is_update = null;
                    return this;
                },
                disallowCallSessionCommentingDelete: function () {
                    data.call_session_commenting.is_delete = false;
                    return this;
                },
                disallowCallSessionCommentingInsert: function () {
                    data.call_session_commenting.is_insert = false;
                    return this;
                },
                disallowCallSessionCommentingSelect: function () {
                    data.call_session_commenting.is_select = false;
                    return this;
                },
                disallowCallSessionCommentingUpdate: function () {
                    data.call_session_commenting.is_update = false;
                    return this;
                },
                disallowSoftphoneAllCallsStatSelect: function () {
                    data.softphone_all_calls_stat.is_select = false;
                    return this;
                },
                disallowSoftphoneLogin: function () {
                    data.softphone_login.is_select = false;
                    return this;
                },
                allowNumberCapacitySelect: function () {
                    data.sip_line_number_capacity.is_select = true;
                    return this;
                },
                allowNumberCapacityUpdate: function () {
                    data.sip_line_number_capacity.is_update = true;
                    return this;
                },
                numberCapacityUndefined: function () {
                    delete(data.sip_line_number_capacity);
                    return  this;
                },
                receiveChangeEvent: function () {
                    softphoneTester.eventsWebSocket.receiveMessage({
                        name: 'permissions_changed',
                        type: 'event',
                        params: {
                            data: data
                        } 
                    });

                    spendTime(0);
                },
                expectToBeSent: function (requests) {
                    var request = (requests ? requests.someRequest() : ajax.recentRequest()).
                        expectPathToContain('/sup/api/v1/permissions/me');

                    var requestSender = {
                        receiveResponse: function () {
                            request.respondSuccessfullyWith({
                                data: data 
                            });

                            Promise.runAll();
                            spendTime(0);
                        }
                    };

                    Object.entries(me).forEach(function (entry) {
                        var key = entry[0],
                            value = entry[1];

                        if (!['expectToBeSent', 'receiveResponse', 'send'].includes(key)) {
                            requestSender[key] = function () {
                                me[key].apply(me, arguments);
                                return requestSender;
                            };
                        }
                    });

                    return requestSender;
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                },
                send: function () {
                    this.receiveResponse();
                }
            };

            return me;
        };

        this.permissionsRequest = this.requestPermissions;

        this.requestFinishReasons = function () {
            return {
                expectToBeSent: function (requests) {
                    var request = (requests ? requests.someRequest() : ajax.recentRequest()).
                        expectPathToContain('/sup/api/v1/finish_reasons');

                    return {
                        receiveResponse: function () {
                            request.respondSuccessfullyWith({
                                data: [{
                                    id: 'numb_not_exists',
                                    name: 'Виртуальный номер не найден'
                                }]
                            });

                            Promise.runAll(false, true);
                        }
                    };
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                },
                send: function () {
                    this.receiveResponse();
                }
            };
        };

        this.finishReasonsRequest = this.requestFinishReasons;

        this.requestPhoneBookGroups = function () {
            return {
                expectToBeSent: function (requests) {
                    var request = (requests ? requests.someRequest() : ajax.recentRequest()).
                        expectPathToContain('/sup/api/v1/phone_book/groups');

                    return {
                        receiveResponse: function () {
                            request.respondSuccessfullyWith({
                                data: [{
                                    id: 48706,
                                    name: 'Отдел маркетинга'
                                }]
                            });

                            Promise.runAll(false, true);
                        }
                    };
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                },
                send: function () {
                    this.receiveResponse();
                }
            };
        };

        this.phoneBookGroupsRequest = this.requestPhoneBookGroups;

        var webSocketRegExp = /sup\/ws\/XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0$/,
            getWebSocketURL = () => `wss://${softphoneHost}/sup/ws/XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0`;

        this.anotherEventWebSocketPath = () => {
            webSocketRegExp = /sup\/ws\/935jhw5klatxx2582jh5zrlq38hglq43o9jlrg8j3lqj8jf$/;
            getWebSocketURL = () => `wss://${softphoneHost}/sup/ws/935jhw5klatxx2582jh5zrlq38hglq43o9jlrg8j3lqj8jf`;
        };

        this.thirdEventWebSocketPath = () => {
            getWebSocketURL = () =>
                'wss://softphone-events-server.com/sup/ws/XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0';
        };

        this.getEventsWebSocket = function (index) {
            this.eventsWebSocket = eventsWebSocket =
                webSockets.getSocket(softphoneHost ? getWebSocketURL() : webSocketRegExp, index || 0);

            var disconnect = eventsWebSocket.disconnect.bind(eventsWebSocket);
            eventsWebSocket.disconnect = (...args) => (disconnect(...args), Promise.runAll(false, true));

            var disconnectAbnormally = eventsWebSocket.disconnectAbnormally;

            eventsWebSocket.disconnectAbnormally = function () {
                disconnectAbnormally.apply(eventsWebSocket, arguments);
                Promise.runAll(false, true);
            };

            return eventsWebSocket;
        };

        this.connectEventsWebSocket = function (index) {
            this.getEventsWebSocket(index).connect();
            Promise.runAll(false, true);
            Promise.runAll(false, true);
            spendTime(0);
        };

        this.expectBrowserIdToHaveKnownValue = function (browser_id) {
            browser_id = browser_id ? (browser_id + '') : '';

            if (browser_id != 'a51f1a00-4e1b-4cc9-bf42-defbcd66d772') {
                throw new Error('Идентификатор браузера должен иметь значение ' +
                    '"a51f1a00-4e1b-4cc9-bf42-defbcd66d772", а не "' + browser_id + '"');
            }
        };

        this.expectBrowserIdNotToBeEmpty = function (browser_id) {
            browser_id = browser_id ? (browser_id + '') : '';

            if (!/^[a-zA-Z0-9\-]+$/.test(browser_id)) {
                throw new Error('Некорректный идентификатор браузера "' + browser_id + '".');
            }
        };

        this.disconnectEventsWebSocket = function (index) {
            webSockets.getSocket(/sup\/ws\/XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0$/, index || 0).disconnect();
            spendTime(0);
        };

        this.discconnectEventsWebSocket = this.disconnectEventsWebSocket;

        function getWebRtcSocket (index) {
            index = index || 0;
            ret = updateWebRtcUrlForGettingSocket(index);
            return webSockets.getSocket(ret.webRtcUrlForGettingSocket, ret.index);
        }

        this.getWebRtcSocket = getWebRtcSocket;

        this.changeSipWebSocket = function (index) {
            var webrtcWebsocket = this.webrtcWebsocket = getWebRtcSocket(index);
            this.sip = sip = new Sip(webrtcWebsocket);
            return webrtcWebsocket;
        };

        this.failToConnectSIPWebSocket = function () {
            getWebRtcSocket(0).disconnect();
        };

        this.connectSIPWebSocket = function (index) {
            this.changeSipWebSocket(index).connect();
        };

        this.expectSIPWebSocketNotToBeCreated = function () {
            webSockets.expectNoWebSocketToBeCreatedWithURL(webRtcUrlForGettingSocket);
        };

        this.expectNoWebsocketConnecting = function () {
            var exceptions = [];
            webSockets.expectWasConnected(exceptions);
            exceptions.forEach(function (exception) {
                throw exception;
            });
        };

        this.connectWebSockets = function () {
            this.connectEventsWebSocket();
            this.tabStateChangeMessage().receive();
            this.connectSIPWebSocket();
        };

        function JanusIdGetter () {
            var ids = {
                default: {
                    master_id: 282753063,
                    session_id: 235259514066078,
                    master: {
                        master_id: undefined,
                        handle_id: 468199568725824
                    },
                    helper:{
                        master_id: 282753063,
                        handle_id: 568199568725824
                    },
                    anotherHelper:{
                        master_id: 282753063,
                        handle_id: 925868298348924
                    }
                },
                another: {
                    master_id: 862850243,
                    session_id: 502856892825924,
                    master: {
                        master_id: undefined,
                        handle_id: 692958289235835
                    },
                    helper:{
                        master_id: 862850243,
                        handle_id: 932856829587925
                    },
                    anotherHelper:{
                        master_id: 862850243,
                        handle_id: 383920838392834
                    }
                },
                third: {
                    master_id: 672045833,
                    session_id: 295828596382924,
                    master: {
                        master_id: undefined,
                        handle_id: 154065838501832
                    },
                    helper:{
                        master_id: 672045833,
                        handle_id: 927862722068215
                    },
                    anotherHelper:{
                        master_id: 672045833,
                        handle_id: 568285031085534
                    }
                }
            };

            var session = 'default',
                type = 'master';

            return {
                getMasterIdForRequest: function () {
                    return ids[session][type].master_id;
                },
                getMasterId: function () {
                    return ids[session].master_id;
                },
                getHandleId: function () {
                    return ids[session][type].handle_id;
                },
                getSessionId: function () {
                    return ids[session].session_id;
                },
                addSessionId: function (message) {
                    message.session_id = this.getSessionId();
                    return message;
                },
                addSessionIdAndHandleId: function (message) {
                    message.session_id = this.getSessionId();
                    message.handle_id = this.getHandleId();
                    return message;
                },
                addSessionIdAndSender: function (message) {
                    message.session_id = this.getSessionId();
                    message.sender = this.getHandleId();
                    return message;
                },
                setHelper: function () {
                    type = 'helper';
                },
                setAnotherHelper: function () {
                    type = 'anotherHelper';
                },
                setAnotherSession: function () {
                    session = 'another';
                },
                setThirdSession: function () {
                    session = 'third';
                }
            };
        };

        function JanusRequest () {
            var index = 0;

            return {
                setAnotherSession: function () {
                    index = 1;
                    return this;
                },
                setThirdSession: function () {
                    index = 2;
                    return this;
                },
                expectToBeSent: function (expectedMessage) {
                    var message = rawMessage = getWebRtcSocket(index).popRecentlySentMessage();

                    try {
                        message = JSON.parse(message);
                    } catch (e) {
                        throw new Error('Не удалось разобрать сообщение "' + message + '"');
                    }

                    utils.expectObjectToContain(message, expectedMessage);

                    var transaction = message.transaction;

                    if (!/^[a-zA-Z0-9]+$/.test(transaction)) {
                        throw new Error(
                            'Сообщение должно содержать идентификатор транзакции, тогда как было отправлено ' +
                            'сообщение ' + "\n\n" + rawMessage
                        );
                    }

                    return {
                        getActualMessage: function () {
                            return message;
                        },
                        receiveError: function () {
                            this.receiveResponse({
                                janus: 'error',
                                error: {
                                    code: 123,
                                    reason: 'Some error occured'
                                }
                            });
                        },
                        receiveResponse: function (message) {
                            message.transaction = transaction;
                            me.webrtcWebsocket.receiveMessage(message);
                        }
                    };
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                }
            };
        }
        
        this.janusTransactionCreationRequest = function () {
            var idGetter = new JanusIdGetter(),
                janusRequest = new JanusRequest();

            return {
                setAnotherSession: function () {
                    janusRequest.setAnotherSession();
                    idGetter.setAnotherSession();
                    return this;
                },
                setThirdSession: function () {
                    janusRequest.setThirdSession();
                    idGetter.setThirdSession();
                    return this;
                },
                expectToBeSent: function () {
                    var request = janusRequest.expectToBeSent({
                        janus: 'create'
                    });

                    return {
                        receiveError: function () {
                            request.receiveError();
                        },
                        receiveResponse: function () {
                            request.receiveResponse({
                                janus: 'success',
                                data: {
                                    id: idGetter.getSessionId() 
                                }
                            });

                            spendTime(0);
                        }
                    };
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                }
            };
        };
        
        this.janusDestroyRequest = function () {
            return {
                expectToBeSent: function () {
                    var request = JanusRequest().expectToBeSent({
                        janus: 'destroy',
                        session_id: 235259514066078
                    });

                    return {
                        receiveResponse: function () {
                            request.receiveResponse({
                                janus: 'success',
                                session_id: 235259514066078
                            });
                        }
                    };
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                }
            };
        };

        this.janusDtmfInfoRequest = function () {
            var digit = '#';

            return {
                setDigit: function (value) {
                    digit = value;
                    return this;
                },
                expectToBeSent: function () {
                    var request = JanusRequest().expectToBeSent({
                        janus: 'message',
                        body: {
                            request: 'dtmf_info',
                            digit
                        },
                        session_id: 235259514066078,
                        handle_id: 468199568725824
                    });

                    return {
                        receiveResponse: function () {
                            request.receiveResponse({
                                janus: 'ack',
                                session_id: 235259514066078
                            });
                        }
                    };
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                }
            };
        };

        this.janusKeepAliveRequest = function () {
            var idGetter = new JanusIdGetter(),
                janusRequest = new JanusRequest();

            return {
                setAnotherSession: function () {
                    idGetter.setAnotherSession();
                    janusRequest.setAnotherSession();
                    return this;
                },
                setThirdSession: function () {
                    janusRequest.setThirdSession();
                    idGetter.setThirdSession();
                    return this;
                },
                expectToBeSent: function () {
                    var request = janusRequest.expectToBeSent(idGetter.addSessionId({
                        janus: 'keepalive'
                    }));

                    return {
                        receiveResponse: function () {
                            request.receiveResponse(idGetter.addSessionId({
                                janus: 'ack'
                            }));
                        }
                    };
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                }
            };
        };

        this.janusCallRequest = function () {
            var idGetter = new JanusIdGetter(),
                janusRequest = new JanusRequest();

            var message = {
                janus: 'message',
                body: {
                    request: 'call',
                    uri: 'sip:79161234567@voip.uiscom.ru'
                },
                jsep: {
                    type: 'offer',
                    sdp: me.getPCMA8000sdp()
                }
            };

            return {
                setAnotherSession: function () {
                    janusRequest.setAnotherSession();
                    idGetter.setAnotherSession();
                    return this;
                },
                setThirdSession: function () {
                    janusRequest.setThirdSession();
                    idGetter.setThirdSession();
                    return this;
                },
                setHelper: function () {
                    idGetter.setHelper();
                    return this;
                },
                setAnotherNumber: function () {
                    message.body.uri = 'sip:79161234569@voip.uiscom.ru';
                    return this;
                },
                setSecondNumber: function () {
                    message.body.uri = 'sip:79161234570@voip.uiscom.ru';
                    return this;
                },
                setThirdNumber: function () {
                    message.body.uri = 'sip:74950230626@voip.uiscom.ru';
                    return this;
                },
                setNumberFromCallsGrid: function () {
                    message.body.uri = 'sip:74950230625@voip.uiscom.ru';
                    return this;
                },
                expectToBeSent: function () {
                    var request = janusRequest.expectToBeSent(idGetter.addSessionIdAndHandleId(message)),
                        call_id = request.getActualMessage().body.call_id;

                    if (!/^[0-9a-zA-Z]{23}$/.test(call_id)) {
                        throw new Error('Call-ID "' + call_id+ '" не соответствут ожиданиям.');
                    }

                    return {
                        receiveError: function () {
                            request.receiveError();
                        },
                        receiveResponse: function () {
                            request.receiveResponse(idGetter.addSessionId({
                                janus: 'ack'
                            }));

                            request.receiveResponse(idGetter.addSessionIdAndSender({
                                janus: 'event',
                                plugindata: {
                                    plugin: 'janus.plugin.sip',
                                    data: {
                                        sip: 'event',
                                        result: {
                                            event: 'calling'
                                        },
                                        call_id: call_id
                                    }
                               }
                            }));

                            request.receiveResponse(idGetter.addSessionIdAndSender({
                                janus: 'event',
                                plugindata: {
                                   plugin: 'janus.plugin.sip',
                                   data: {
                                       sip: 'event',
                                       result: {
                                           event: 'progress',
                                           username: 'sip:79161234567@voip.uiscom.ru'
                                       },
                                       call_id: call_id
                                   }
                                },
                                jsep: {
                                   type: 'answer',
                                   sdp: me.getPCMA8000sdp()
                                }
                            }));

                            return {
                                receiveRinging: function () {
                                    request.receiveResponse(idGetter.addSessionIdAndSender({
                                        janus: 'event',
                                        plugindata: {
                                            plugin: 'janus.plugin.sip',
                                            data: {
                                                sip: 'event',
                                                result: {
                                                    event: 'ringing'
                                                },
                                                call_id: call_id
                                            }
                                        }
                                    }));

                                    spendTime(0);
                                },
                                receive183: function () {
                                    request.receiveResponse(idGetter.addSessionIdAndSender({
                                        janus: 'event',
                                        plugindata: {
                                            plugin: 'janus.plugin.sip',
                                            data: {
                                                sip: 'event',
                                                result: {
                                                    event: 'proceeding',
                                                    code: 183
                                                },
                                                call_id: call_id
                                            }
                                        }
                                    }));
                                },
                                receive180: function () {
                                    request.receiveResponse(idGetter.addSessionIdAndSender({
                                        janus: 'event',
                                        plugindata: {
                                            plugin: 'janus.plugin.sip',
                                            data: {
                                                sip: 'event',
                                                result: {
                                                    event: 'proceeding',
                                                    code: 180
                                                },
                                                call_id: call_id
                                            }
                                        }
                                    }));
                                },
                                receiveBusy: function () {
                                    request.receiveResponse(idGetter.addSessionIdAndSender({
                                        janus: 'event',
                                        plugindata: {
                                            plugin: 'janus.plugin.sip',
                                            data: {
                                                sip: 'event',
                                                result: {
                                                    event: 'hangup',
                                                    code: 486,
                                                    reason: 'Busy Here'
                                                },
                                                call_id: call_id
                                            }
                                        }
                                    }));
                                },
                                receiveAccepted: function () {
                                    request.receiveResponse(idGetter.addSessionIdAndSender({
                                        janus: 'event',
                                        plugindata: {
                                            plugin: 'janus.plugin.sip',
                                            data: {
                                                sip: 'event',
                                                result: {
                                                    event: 'accepted',
                                                    username: 'sip:79161234567@voip.uiscom.ru'
                                                },
                                                call_id: call_id
                                            }
                                        }
                                    }));
                                }
                            };
                        }
                    };
                },
                receiveResponse: function () {
                    return this.expectToBeSent().receiveResponse();
                }
            };
        };

        this.janusDeclineRequest = function () {
            var message = {
                janus: 'message',
                body: {
                    request: 'decline',
                    code: 480
                },
                session_id: 235259514066078,
                handle_id: 468199568725824
            };

            return {
                setBusy: function () {
                    message.body.code = 486;
                    return this;
                },
                setHelper: function () {
                    message.handle_id = 568199568725824;
                    return this;
                },
                expectToBeSent: function () {
                    var request = JanusRequest().expectToBeSent(message);

                    return {
                        receiveResponse: function () {
                            request.receiveResponse({
                                janus: 'success',
                                data: {
                                    janus: 'ack',
                                    session_id: 235259514066078
                                }
                            });
                        }
                    };
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                }
            };
        };

        this.janusHangupRequest = function () {
            var janusRequest = new JanusRequest(),
                idGetter = new JanusIdGetter();

            var message = {
                janus: 'message',
                body: {
                    request: 'hangup'
                }
            };
        
            return {
                setAnotherSession: function () {
                    idGetter.setAnotherSession();
                    janusRequest.setAnotherSession();
                    return this;
                },
                setThirdSession: function () {
                    janusRequest.setThirdSession();
                    idGetter.setThirdSession();
                    return this;
                },
                setHelper: function () {
                    idGetter.setHelper();
                    return this;
                },
                expectToBeSent: function () {
                    var request = janusRequest.expectToBeSent(idGetter.addSessionIdAndHandleId(message));

                    return {
                        receiveResponse: function () {
                            request.receiveResponse(idGetter.addSessionId({
                                janus: 'success',
                                data: {
                                    janus: 'ack'
                                }
                            }));

                            return {
                                receiveBye: function () {
                                    request.receiveResponse(idGetter.addSessionIdAndSender({
                                        janus: 'event',
                                        plugindata: {
                                            plugin: 'janus.plugin.sip',
                                            data: {
                                                sip: 'event',
                                                result: {
                                                    event: 'hangup',
                                                    code: 200,
                                                    reason: 'to BYE'
                                                },
                                                call_id: '020EF693933699728BA6AA9043C45775'
                                            }
                                        }
                                    }));
                                },
                                receiveRequestTerminated: function () {
                                    request.receiveResponse(idGetter.addSessionIdAndSender({
                                        janus: 'event',
                                        plugindata: {
                                            plugin: 'janus.plugin.sip',
                                            data: {
                                                sip: 'event',
                                                result: {
                                                    event: 'hangup',
                                                    code: 487,
                                                    reason: 'Request Terminated'
                                                },
                                                call_id: '020EF693933699728BA6AA9043C45775'
                                            }
                                        }
                                    }));
                                }
                            };
                        }
                    };
                },
                receiveResponse: function () {
                    return this.expectToBeSent().receiveResponse();
                }
            };
        };

        this.janusTerminatedRequestMessage = function () {
            return {
                receive: function () {
                    me.webrtcWebsocket.receiveMessage({
                        janus: 'event',
                        sender: 468199568725824,
                        session_id: 235259514066078,
                        plugindata: {
                            plugin: 'janus.plugin.sip',
                            data: {
                                sip: 'event',
                                result: {
                                    event: 'hangup',
                                    code: 487,
                                    reason: 'Request Terminated'
                                },
                                call_id: '020EF693933699728BA6AA9043C45775'
                            }
                        }
                    });
                }
            };
        };
        
        this.janusByeMessage = function () {
            var index = 0,
                idGetter = new JanusIdGetter();

            return {
                setAnotherSession: function () {
                    index = 1;
                    idGetter.setAnotherSession();
                    return this;
                },
                setThirdSession: function () {
                    index = 2;
                    idGetter.setThirdSession();
                    return this;
                },
                receive: function () {
                    getWebRtcSocket(index).receiveMessage(idGetter.addSessionIdAndSender({
                        janus: 'event',
                        plugindata: {
                            plugin: 'janus.plugin.sip',
                            data: {
                                sip: 'event',
                                result: {
                                    event: 'hangup',
                                    code: 200,
                                    reason: 'Session Terminated',
                                    reason_header: 'BYE received'
                                },
                                call_id: '020EF693933699728BA6AA9043C45775'
                            }
                        }
                    }));
                }
            };
        };

        this.janusHangupMessage = function () {
            var index = 0,
                idGetter = new JanusIdGetter();

            return {
                setAnotherSession: function () {
                    idGetter.setAnotherSession();
                    index = 1;
                    return this;
                },
                setThirdSession: function () {
                    index = 2;
                    idGetter.setThirdSession();
                    return this;
                },
                setHelper: function () {
                    idGetter.setHelper();
                    return this;
                },
                receive: function () {
                    getWebRtcSocket(index).receiveMessage(idGetter.addSessionIdAndSender({
                        janus: 'hangup',
                        reason: 'Close PC'
                    }));
                }
            };
        };

        this.janusAcceptRequest = function () {
            var idGetter = new JanusIdGetter();

            return {
                setHelper: function () {
                    idGetter.setHelper();
                    return this;
                },
                expectToBeSent: function () {
                    var request = JanusRequest().expectToBeSent(idGetter.addSessionIdAndHandleId({
                        janus: 'message',
                        body: {
                            request: 'accept'
                        },
                        jsep: {
                            type: 'answer',
                            sdp: me.getPCMA8000sdp()
                        }
                    }));

                    data = {
                        sip: 'event',
                        result: {
                           event: 'accepted'
                        },
                        call_id: '020EF693933699728BA6AA9043C45775'
                    };

                    return {
                        setWrongCallId: function () {
                            data.call_id = '59BF4FD044323D7D3298A3B2E4FB35A6';
                            return this;
                        },
                        receiveResponse: function () {
                            request.receiveResponse(idGetter.addSessionId({
                                janus: 'ack'
                            }));

                            request.receiveResponse(idGetter.addSessionIdAndSender({
                               janus: 'event',
                               plugindata: {
                                   plugin: 'janus.plugin.sip',
                                   data: data 
                               }
                            }));
                        }
                    };
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                }
            };
        };

        this.janusIncomingCallMessage = function () {
            var phone = '';

            var message = {
                janus: 'event',
                sender: 468199568725824,
                session_id: 235259514066078,
                plugindata: {
                    plugin: 'janus.plugin.sip',
                    data: {
                       sip: 'event',
                       result: {
                          event: 'incomingcall',
                          username: 'sip:79161234567@132.121.82.37:5060;user=phone',
                          displayname: '',
                          callee: 'sip:077368@132.121.82.37:5060;user=phone'
                       },
                       call_id: '020EF693933699728BA6AA9043C45775'
                    }
                },
                jsep: {
                   type: 'offer',
                   sdp: me.getPCMA8000sdp()
                }
            };

            return {
                setAnotherCallId: function () {
                    message.plugindata.data.call_id = '2824JO2S42GJ4GO8GJSLL2G8SLE92486';
                    return this;
                },
                setAnotherNumber: function () {
                    message.plugindata.data.result.username = 'sip:79161234569@132.121.82.37:5060;user=phone';
                    message.plugindata.data.call_id = '59BF4FD044323D7D3298A3B2E4FB35A6';
                    message.sender = 568199568725824;
                    return this;
                },
                receive: function () {
                    me.webrtcWebsocket.receiveMessage(message);
                    Promise.runAll(false, true);
                }
            };
        };

        this.janusRegisteredMessage = function () {
            var idGetter = new JanusIdGetter(),
                index = 0;

            var message = {
                janus: 'event',
                plugindata: {
                   plugin: 'janus.plugin.sip',
                   data: {
                      sip: 'event',
                      result: {
                         event: 'registered',
                         username: '077368',
                         register_sent: true
                      }
                   }
                }
            };

            return {
                setFailed: function () {
                    message.plugindata.data.result = {
                        event: 'registration_failed',
                        code: 403,
                        reason: 'Forbidden'
                     };

                    return this;
                },
                setAnotherUser: function () {
                    message.plugindata.data.result.username = '077369';
                    return this;
                },
                setAnotherSession: function () {
                    idGetter.setAnotherSession();
                    index = 1;
                    return this;
                },
                setThirdSession: function () {
                    index = 2;
                    idGetter.setThirdSession();
                    return this;
                },
                setHelper: function () {
                    idGetter.setHelper();
                    return this;
                },
                setAnotherHelper: function () {
                    idGetter.setAnotherHelper();
                    return this;
                },
                receive: function () {
                    message.plugindata.data.result.master_id = idGetter.getMasterId();

                    getWebRtcSocket(index).receiveMessage(idGetter.addSessionIdAndSender(message));
                    spendTime(0);
                }
            };
        };

        this.janusRegisterRequest = function () {
            var idGetter = new JanusIdGetter(),
                janusRequest = new JanusRequest();

            var message ={
                janus: 'message',
                body: {
                    request: 'register',
                    authuser: '077368',
                    username: 'sip:077368@voip.uiscom.ru',
                    secret: 'e2tcXhxbfr',
                    display_name: '077368',
                    proxy: 'sip:voip.uiscom.ru',
                    type: undefined
                }
            };

            return {
                thirdUser: function () {
                    message.body.proxy = 'sip:pp-rtu.uis.st:443';
                    message.body.username = 'sip:076909@pp-rtu.uis.st:443';
                    message.body.authuser = 'Kf98Bzv3';
                    message.body.display_name = '076909';
                    return this;
                },
                setAnotherUser: function () {
                    message.body.username = 'sip:077369@voip.uiscom.ru';
                    message.body.secret = 'e2g98jgbfr';
                    return this;
                },
                setAnotherSession: function () {
                    idGetter.setAnotherSession();
                    janusRequest.setAnotherSession();
                    return this;
                },
                setThirdSession: function () {
                    janusRequest.setThirdSession();
                    idGetter.setThirdSession();
                    return this;
                },
                setHelper: function () {
                    message.body.type = 'helper';
                    idGetter.setHelper();
                    return this;
                },
                setAnotherHelper: function () {
                    message.body.type = 'helper';
                    idGetter.setAnotherHelper();
                    return this;
                },
                expectToBeSent: function () {
                    message.body.master_id = idGetter.getMasterIdForRequest();
                    var request = janusRequest.expectToBeSent(idGetter.addSessionIdAndHandleId(message));

                    return {
                        receiveError: function () {
                            request.receiveError();
                        },
                        receiveResponse: function () {
                            request.receiveResponse(idGetter.addSessionIdAndHandleId({
                                janus: 'ack'
                            }));

                            request.receiveResponse(idGetter.addSessionIdAndSender({
                                plugindata: {
                                    plugin: 'janus.plugin.sip',
                                    data: {
                                        result: {
                                            event: 'registering'
                                        },
                                        sip: 'event'
                                    }
                                },
                                janus: 'event'
                            }));
                        }
                    };
                },
                receiveError: function () {
                    this.expectToBeSent().receiveError();
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                }
            };
        };

        this.janusPluginAttachRequest = function () {
            var message = {
                janus:'attach',
                plugin:'janus.plugin.sip'
            };

            var idGetter = new JanusIdGetter(),
                janusRequest = new JanusRequest();

            return {
                setCallCenter: function () {
                    message.opaque_id = utils.expectToHavePrefix('janus-softphone-');
                    return this;
                },
                setAmoCRM: function () {
                    message.opaque_id = utils.expectToHavePrefix('janus-amocrm-widget-');
                    return this;
                },
                setAnotherSession: function () {
                    idGetter.setAnotherSession();
                    janusRequest.setAnotherSession();
                    return this;
                },
                setThirdSession: function () {
                    janusRequest.setThirdSession();
                    idGetter.setThirdSession();
                    return this;
                },
                expectToBeSent: function () {
                    var request = janusRequest.expectToBeSent(idGetter.addSessionId(message));

                    return {
                        setHelper: function () {
                            idGetter.setHelper();
                            return this;
                        },
                        setAnotherHelper: function () {
                            idGetter.setAnotherHelper();
                            return this;
                        },
                        receiveError: function () {
                            request.receiveError();
                        },
                        receiveResponse: function () {
                            request.receiveResponse({
                                janus: 'success',
                                data: {
                                    id: idGetter.getHandleId()
                                }
                            });
                        }
                    };
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                }
            };
        };

        this.allowMediaInput = function () {
            var localMediaStream = userMedia.allowMediaInput();

            spendTime(0);
            spendTime(0);

            return localMediaStream;
        };

        this.disallowMediaInput = function () {
            userMedia.disallowMediaInput();
            Promise.runAll();
        };

        this.extendRegistrationRequestTester = function (value) {
            registrationTesterExtentor = value;
        };

        this.requestRegistration = function () {
            var expires = '60',
                sip_login = '077368',
                sip_host = 'voip.uiscom.ru',
                softphoneType = 'Web',
                doSomething = function () {};
                
            var checkAuthorization = function (request) {
                return request.expectToHaveHeader('Authorization');
            };

            var checkRegistration = function (request) {
                return request;
            };

            var request = {
                expired: function () {
                    return this.setUnregister();
                },
                setUnregister: function () {
                    expires = '0';
                    return this;
                },
                cancelTwoIncomingCalls: function () {
                    this.setUnregister();

                    doSomething = function () {
                        sip.recentResponse().expectTemporarilyUnavailable();
                        sip.recentResponse().expectTemporarilyUnavailable();
                    };

                    return this;
                },
                finishCall: function () {
                    this.setUnregister();

                    doSomething = function () {
                        sip.recentRequest().expectToHaveMethod('BYE').response().send();
                    };

                    return this;
                },
                cancelIncomingCall: function () {
                    this.setUnregister();

                    doSomething = function () {
                        sip.recentResponse().expectTemporarilyUnavailable();
                    };

                    return this;
                },
                setAnotherSipLogin: function () {
                    sip_login = '093820';
                    return this;
                },
                anotherSipLogin: function () {
                    return this.setAnotherSipLogin();
                },
                setRTU: function () {
                    sip_host = 'pp-rtu.uis.st:443';
                    sip_login = '076909%24ROOT';

                    checkAuthorization = function (request) {
                        return request.expectHeaderToContain(
                            'Authorization',
                            'Digest algorithm=MD5, username="Kf98Bzv3", realm="pp-rtu.uis.st"' 
                        );
                    };

                    checkRegistration = function (request) {
                        return request.expectHeaderToContain(
                            'Contact',
                            '<sip:076909%24ROOT@pp-rtu.uis.st:443;transport=ws>;'
                        );
                    };

                    return this;
                },
                send: function () {
                    this.receiveResponse();
                },
                desktopSoftphone: function () {
                    softphoneType = 'Desktop';
                    return this;
                },
                authorization: function () {
                    this.expectToBeSent = () => {
                        var recentRequest = checkAuthorization(sip.recentRequest().expectToHaveMethod('REGISTER'));

                        return {
                            receiveForbidden: function () {
                                recentRequest.
                                    response().
                                    setForbidden().
                                    send();

                                spendTime(0);
                            },
                            receiveUnauthorized: function () {
                                recentRequest.
                                    response().
                                    setUnauthorized().
                                    addHeader('WWW-Authenticate: Digest realm="{server_name}", nonce="{to_tag}"').
                                    send();

                                spendTime(0);
                            },
                            receiveResponse: function () {
                                doSomething();

                                recentRequest.
                                    response().
                                    copyHeader('Contact').
                                    send();

                                spendTime(0);
                            }
                        };
                    };

                    return this;
                },
                expectToBeSent: function () {
                    const recentRequest = sip.recentRequest();

                    checkRegistration(
                        recentRequest.
                            expectToHaveMethod('REGISTER').
                            expectToHaveServerName('sip:' + sip_host).
                            expectHeaderToContain('From', '<sip:' + sip_login + '@' + sip_host + '>').
                            expectHeaderToContain('To', '<sip:' + sip_login + '@' + sip_host + '>').
                            expectHeaderToHaveValue('Expires', 'Expires: ' + expires).
                            expectHeaderToHaveValue(
                                'User-Agent', 'User-Agent: ' + me.getUserAgent(softphoneType)
                            )
                    );

                    return {
                        receiveForbidden: function () {
                            recentRequest.
                                response().
                                setForbidden().
                                send();

                            spendTime(0);
                        },
                        receiveUnauthorized: function () {
                            recentRequest.
                                response().
                                setUnauthorized().
                                addHeader('WWW-Authenticate: Digest realm="{server_name}", nonce="{to_tag}"').
                                send();

                            spendTime(0);
                        },
                        receiveResponse: function () {
                            doSomething();

                            recentRequest.
                                response().
                                copyHeader('Contact').
                                send();

                            spendTime(0);
                        }
                    };
                },
                receiveResponse: function () {
                    return this.expectToBeSent().receiveResponse();
                },
                receiveForbidden: function () {
                    return this.expectToBeSent().receiveForbidden();
                },
                receiveUnauthorized: function () {
                    return this.expectToBeSent().receiveUnauthorized();
                }
            };

            registrationTesterExtentor(request);
            return request;
        };

        this.phoneField = (() => {
            const tester = testersFactory.createTextFieldTester('.cmg-input'),
                click = tester.click.bind(tester),
                pressEnter = tester.pressEnter.bind(tester);
                fill = tester.fill.bind(tester);

            tester.click = () => (click(), spendTime(0));
            tester.pressEnter = () => (pressEnter(), spendTime(0));
            tester.fill = (...values) => (fill(...values), spendTime(0));

            return tester;
        })();

        this.registrationRequest = this.requestRegistration;

        this.expectToneSevenToPlay = function () {
            playingOscillatorsTester.expectFrequenciesToPlay(852, 1209);
        };

        this.expectNoToneToPlay = function () {
            playingOscillatorsTester.expectNoFrequenciesToPlay();
        };

        this.dtmf = function (signal) {
            var phone = '79161234567';

            var recentRequest = function () {
                return sip.recentRequest().
                    expectToHaveServerName('sip:' + phone + '@132.121.82.37:5060;user=phone').
                    expectHeaderToContain('To', '<sip:' + phone + '@132.121.82.37:5060;user=phone>');
            };

            return {
                setAnotherNumber: function () {
                    phone = '79161234569';
                    return this;
                },
                anotherPhone: function () {
                    return this.setAnotherNumber();
                },
                setOutgoing: function () {
                    recentRequest = function () {
                        return sip.recentRequest().
                            expectHeaderToContain('To', '<sip:' + phone + '@voip.uiscom.ru>');
                    };

                    return this;
                },
                outgoing: function () {
                    return this.setOutgoing();
                },
                expectToBeSent: function () {
                    this.send();
                },
                send: function () {
                    recentRequest().
                        expectToHaveMethod('INFO').
                        expectHeaderToContain('From', '<sip:077368@voip.uiscom.ru>').
                        expectToHaveBody(
                            'Signal=' + signal,
                            'Duration=100'
                        ).
                        response().
                        setOk();

                    spendTime(0);
                }
            };
        };

        this.outCallNumber = function () {
            return {};
        };

        this.outboundCall = function () {
            var phoneNumber = '79161234567',
                sip_login = '077368',
                me = this,
                checkBody = function () {};

            var checkStarting = function (request) {
                return request.
                    expectBodyToHaveSubstringsConsideringOrder('8 0 9 111', 'PCMA', 'opus').
                    expectBodyNotToHaveSubstring('103');
            };

            var result = {
                dontSortCodecs: function () {
                    checkStarting = function (request) {
                        return request.expectBodyToHaveSubstringsConsideringOrder('103', 'opus', 'PCMA');
                    };

                    return this;
                },
                intercept: function () {
                    phoneNumber = '88';
                    return this;
                },
                setNumberWith8AtBegining: function () {
                    phoneNumber = '89161234567';
                    return this;
                },
                setAnotherSipLogin: function () {
                    sip_login = '093820';
                    return this;
                },
                anotherSipLogin: function () {
                    sip_login = '093820';
                    return this;
                },
                setNumberFromEmployeesGrid: function () {
                    phoneNumber = '295';
                    return this;
                },
                shortPhone: function () {
                    return this.setNumberFromEmployeesGrid();
                },
                setNumberFromCallsGrid: function () {
                    phoneNumber = '74950230625';
                    return this;
                },
                setAnotherNumber: function () {
                    phoneNumber = '79161234569';
                    return this;
                },
                anotherPhoneNumber: function () {
                    return  this.setAnotherNumber();
                },
                anotherPhone: function () {
                    return  this.setAnotherNumber();
                },
                fourthPhone: function () {
                    phoneNumber = '74999951240';
                    return this;
                },
                fifthPhoneNumber: function () {
                    phoneNumber = '79162729533';
                    return this;
                },
                sixthPhone: function () {
                    return this.setNumberFromCallsGrid();
                },
                seventhPhone: function () {
                    phoneNumber = '79161234567g';
                    return this;
                },
                expectInviteMessageBodyToEqual: function (expectedBody) {
                    checkBody = function (request) {
                        request.expectToHaveBody(expectedBody);
                    };
                    
                    return this;
                },
                expectToBeSent: function () {
                    return this.start();
                },
                start: function () {
                    function checkFromAndToHeaders (request) {
                        request.
                            expectHeaderToContain('From', '<sip:' + sip_login + '@voip.uiscom.ru>').
                            expectHeaderToContain('To', '<sip:' + phoneNumber + '@voip.uiscom.ru>');
                    }

                    var request = checkStarting(sip.recentRequest().
                        expectToHaveMethod('INVITE').
                        expectToHaveServerName('sip:' + phoneNumber + '@voip.uiscom.ru'));

                    checkBody(request);
                    checkFromAndToHeaders(request);

                    var response = request.response().
                        setTrying().
                        copyHeader('Contact');

                    response.send();
                    
                    return {
                        expectByeToBeSent: function () {
                            me.requestCallFinish();
                        },
                        receiveSessionProgress: function () {
                            return this.setSessionProgress();
                        },
                        receiveRinging: function () {
                            return this.setRinging();
                        },
                        receiveAccepted: function () {
                            return this.setAccepted();
                        },
                        expectCancelToBeSent: function () {
                            return softphoneTester.requestCancelOutgoingCall();
                        },
                        setSessionProgress: function () {
                            request.response().
                                setToTag(response.getToTag()).
                                setSessionProgress().
                                copyHeader('Contact').
                                setBody('v=0').
                                send();

                            Promise.runAll(false, true);
                            return this;
                        },
                        setRinging: function () {
                            request.response().
                                setToTag(response.getToTag()).
                                setRinging().
                                copyHeader('Contact').
                                send();

                            Promise.runAll(false, true);
                            spendTime(0);

                            return this;
                        },
                        receiveBusy: function () {
                            request.response().
                                setToTag(response.getToTag()).
                                setBusy().
                                copyHeader('Contact').
                                send();

                            checkFromAndToHeaders(sip.recentRequest().expectToHaveMethod('ACK'));
                            Promise.runAll(false, true);
                            spendTime(0);
                        },
                        setAccepted: function () {
                            request.response().
                                setToTag(response.getToTag()).
                                copyHeader('Contact').
                                setBody('v=0').
                                send();

                            Promise.runAll();
                            spendTime(0);

                            checkFromAndToHeaders(sip.recentRequest().expectToHaveMethod('ACK'));

                            /*
                            me.eventsWebSocket.receiveMessage({
                                name: 'employee_changed',
                                type: 'event',
                                params: {
                                    action: 'update',
                                    data: [{
                                        id: 20816,
                                        is_in_call: true
                                    }] 
                                }
                            });
                            */

                            Promise.runAll(false, true);

                            return {
                                expectByeToBeSent: function () {
                                    me.requestCallFinish();
                                },
                                receiveBye: function () {
                                    response.request().
                                        setServerName('voip.uiscom.ru').
                                        setMethod('BYE').
                                        receive();

                                    sip.recentResponse().expectOk();
                                    Promise.runAll(false, true);
                                }
                            };
                        }
                    };
                }
            };

            (function () {
                var methodName,
                    outCallNumber = me.outCallNumber();

                for (methodName in outCallNumber) {
                    result[methodName] = function () {
                        phoneNumber = outCallNumber[methodName]();
                        return result;
                    };
                }
            })();

            return result;
        };

        this.outgoingCall = this.outboundCall;

        this.incomingCall = function () {
            var phone = '79161234567';

            var expectSomeStatus = function (response) {
                response.expectRinging();
            };

            return {
                busy: function () {
                    return this.setBusy();
                },
                setBusy: function () {
                    expectSomeStatus = function (response) {
                        response.expectBusy();
                    };

                    return this;
                },
                setThirdNumber: function () {
                    phone = '79161234510';
                    return this;
                },
                setAnotherNumber: function () {
                    phone = '79161234569';
                    return this;
                },
                anotherNumber: function () {
                    return this.setAnotherNumber();
                },
                anotherPhone: function () {
                    return this.setAnotherNumber();
                },
                thirdNumber: function () {
                    return this.setThirdNumber();
                },
                anotherPhoneNumber: function () {
                    return this.setAnotherNumber();
                },
                setShortNumber: function () {
                    phone = '79161';
                    return this;
                },
                shortPhone: function () {
                    return this.setShortNumber();
                },
                receive: function () {
                    sip.request().
                        setServerName('voip.uiscom.ru').
                        setMethod('INVITE').
                        setCallReceiverLogin('077368').
                        setSdpType().
                        addHeader('From: <sip:' + phone + '@132.121.82.37:5060;user=phone>').
                        addHeader('Contact: <sip:' + phone + '@132.121.82.37:5060;user=phone>').
                        setBody([
                            'v=0',
                            'o=- 1638965704 1638965704 IN IP4 195.211.122.90',
                            's=-',
                            'c=IN IP4 195.211.122.90',
                            't=0 0',
                            'm=audio 14766 UDP/TLS/RTP/SAVP 8 0 3 100',
                            'a=rtpmap:8 PCMA/8000',
                            'a=rtpmap:0 PCMU/8000',
                            'a=rtpmap:3 gsm/8000',
                            'a=rtpmap:100 telephone-event/8000',
                            'a=fmtp:100 0-15',
                            'a=fingerprint:SHA-256 EE:58:77:15:B2:19:86:C9:77:FC:DB:BB:9F:10:CA:84:7C:C9:E2:AE:12:2C:' +
                                'B7:70:2D:F0:14:7C:3A:DB:5E:93',
                            'a=setup:actpass',
                            'a=ice-ufrag:dlbqce4u',
                            'a=ice-pwd:ivtw78mzrtw9kce6rojog0',
                            'a=candidate:1 1 UDP 2130706431 195.211.122.90 14766 typ host',
                            'a=rtcp-mux',
                            'a=sendrecv',
                            'a=silenceSupp:off - - - -'
                        ].join("\r\n")).
                        receive();
                    
                    sip.recentResponse().expectTrying();
                    var response = sip.recentResponse();

                    expectSomeStatus(response);
                    Promise.runAll(false, true);
                    spendTime(0);
                    spendTime(0);

                    return {
                        expectOkToBeSent: function () {
                            return me.requestAcceptIncomingCall(this);
                        },
                        expectBusyHereToBeSent: function () {
                            me.requestDeclineIncomingCall();
                        },
                        receiveCancel: function () {
                            return this.cancel();
                        },
                        receiveBye: function () {
                            return this.finish();
                        },
                        expectByeToBeSent: function () {
                            me.requestCallFinish();
                        },
                        answer: function () {
                            me.requestAcceptIncomingCall();
                        },
                        cancel: function () {
                            response.request().
                                setServerName('voip.uiscom.ru').
                                setMethod('CANCEL').
                                receive();

                            sip.recentResponse().expectOk();
                            sip.recentResponse().expectRequestTerminated();
                            Promise.runAll(false, true);
                            spendTime(0);
                        },
                        finish: function () {
                            response.request().
                                setServerName('voip.uiscom.ru').
                                setMethod('BYE').
                                receive();

                            sip.recentResponse().expectOk();
                            Promise.runAll(false, true);
                            spendTime(0);
                        }
                    };
                }
            };
        };
        
        this.extendIncomingCallProceeding = function (params, message) {
            return message;
        };

        this.extendOutCallSession = function (params, message) {
            return message;
        };
        

        this.callSessionFinish = function () {
            var call_session_id = 980925456;

            const createMessage = () => ({
                id: 314723705,
                name: 'call_session_finished',
                type: 'event',
                params: {
                    call_session_id: call_session_id
                }
            });

            return {
                setAnotherId: function () {
                    call_session_id = 182957828;
                    return this;
                },
                anotherId: function () {
                    return this.setAnotherId();
                },
                thirdId: function () {
                    call_session_id = 980925450;
                    return this;
                },
                slavesNotification: () => ({
                    expectToBeSent: () => me.nextCrosstabMessage().expectToContain({
                        type: 'message',
                        data: {
                            type: 'notify_slaves',
                            data: {
                                type: 'websocket_message',
                                message: createMessage()
                            }
                        }
                    })
                }),
                receive: () => {
                    me.eventsWebSocket.receiveMessage(createMessage());
                    Promise.runAll(false, true);
                    spendTime(0);
                }
            };
        };

        this.callSessionFinishedEvent = this.callSessionFinish;

        this.lostCallSession = function () {
            var call_session_id = 980925456;

            return {
                setAnotherId: function () {
                    call_session_id = 182957828;
                    return this;
                },
                receive: function () {
                    eventsWebSocket.receiveMessage({
                        id: 314723705,
                        name: 'lost_call_session',
                        type: 'event',
                        params: {
                            call_session_id: call_session_id
                        }
                    });
                }
            };
        };

        this.dtmfRequest = function () {
            var signal;

            return {
                setSignal: function (value) {
                    signal = value;
                    return this;
                },
                expectToBeSent: function () {
                    me.eventsWebSocket.expectSentMessageToContain({
                        type: 'notify_master',
                        data: {
                            action: 'send_dtmf',
                            session_id: '2tq6eiavgbtcqt9vhl48jabod2q371',
                            signal: signal
                        }
                    });
                }
            };
        };

        this.requestAcceptIncomingCall = function (incomingCall) {
            const request = sip.recentResponse().
                expectOk().
                request();

            return {
                receiveCancel: function () {
                    request.
                        setServerName('voip.uiscom.ru').
                        setMethod('CANCEL').
                        setCallReceiverLogin('077368').
                        receive();

                    spendTime(0);
                    spendTime(0);

                    return {
                        expectOkToBeSent: function () {
                            const request = sip.recentResponse().
                                expectOk().
                                request();

                            return {
                                expectByeToBeSent: function () {
                                    me.requestCallFinish();
                                },
                            };
                        },
                    };
                },
                receiveResponse: function () {
                    request.
                        setServerName('voip.uiscom.ru').
                        setMethod('ACK').
                        setCallReceiverLogin('077368').
                        receive();

                    spendTime(0);
                    spendTime(0);

                    return {
                        receiveBye: function() {
                            incomingCall.receiveBye();
                        },
                        expectByeRequestToBeSent: function () {
                            me.requestCallFinish();
                        },
                        expectByeToBeSent: function () {
                            this.expectByeRequestToBeSent();
                        },
                    };
                },
                receiveAck: function () {
                    return this.receiveResponse() ;
                },
            };
        };

        function Connection(index) {
            function getConnection () {
                return rtcConnectionsMock.getConnectionAtIndex(index);
            }
            this.connect = function () {
                getConnection().connect();
            };
            this.connectWebRTC = function () {
                this.connect();
                Promise.runAll(false, true);
            };
            this.addCandidate = function () {
                getConnection().addCandidate();
                Promise.runAll(false, true);
            };
            this.expectSinkIdToEqual = function (expectedValue) {
                return getConnection().expectRemoteSinkIdToEqual(expectedValue);
            };
            this.expectRemoteStreamToHaveVolume = function (expectedValue) {
                return getConnection().expectRemoteStreamToHaveVolume(expectedValue);
            };
            this.expectRemoteStreamToPlay = function () {
                mediaStreamsTester.expectTrackToPlay(getConnection().getRemoteAudioTrack());
            };
            this.expectToBeMute = function () {
                getConnection().expectToBeMute();
            };
            this.expectNotToBeMute = function () {
                getConnection().expectNotToBeMute();
            };
            this.callTrackHandler = function () {
                getConnection().callTrackHandler();
            };
            this.assumeTrackHandlerMayBeUnexecuted = function () {
                getConnection().assumeTrackHandlerMayBeUnexecuted();
            };
            this.expectNoUnexecutedTrackHandler = function () {
                getConnection().expectNoUnexecutedTrackHandler();
            };
            this.expectInputDeviceNotToBeSpecified = function () {
                getConnection().expectInputDeviceNotToBeSpecified();
            };
            this.expectInputDeviceIdToEqual = function (expectedValue) {
                getConnection().expectInputDeviceIdToEqual(expectedValue);
            };
            this.expectToHaveIceServer = function (expectedIceServer) {
                getConnection().expectToHaveIceServer(expectedIceServer);
            };
            this.expectToPlayTrack = function (expectedTrack) {
                getConnection().expectLocalTrackToBe(expectedTrack);
            };
            this.getLocalAudioTrack = function () {
                return getConnection().getLocalAudioTrack();
            };
            this.expectHoldMusicToPlay = function (customHoldMusic) {
                var track = getConnection().getLocalAudioTrack();
                decodedTracksTester.expectTrackContentToBe(track, customHoldMusic || soundSources.holdMp3);

                if (!track.enabled) {
                    throw new Error('Музыка удержания выключена.');
                }
            };
        }

        this.firstConnection = new Connection(0);
        this.secondConnection = new Connection(1);
        this.thirdConnection = new Connection(2);
        this.fourthConnection = new Connection(3);
        this.fifthConnection = new Connection(4);

        this.expectOutgoingCallSoundAndRemoteStreamToPlay = function () {
            mediaStreamsTester.createStreamsPlayingExpectation().
                addStream(soundSources.outgoingCall).
                addTrack(rtcConnectionsMock.getConnectionAtIndex(1).getRemoteAudioTrack()).
                expectStreamsToPlay();
        };

        this.expectRemoteStreamsToPlay = function () {
            mediaStreamsTester.createStreamsPlayingExpectation().
                addTrack(rtcConnectionsMock.getConnectionAtIndex(0).getRemoteAudioTrack()).
                addTrack(rtcConnectionsMock.getConnectionAtIndex(1).getRemoteAudioTrack()).
                expectStreamsToPlay();
        };

        this.expectOutgoingAndIncomingCallSoundsToPlay = function () {
            mediaStreamsTester.expectStreamsToPlay(soundSources.outgoingCall, soundSources.incomingCall);
        };

        this.expectOutgoingCallSoundToPlay = function () {
            mediaStreamsTester.expectStreamsToPlay(soundSources.outgoingCall);
        };

        this.expectIncomingCallSoundToPlay = function () {
            mediaStreamsTester.expectStreamsToPlay(soundSources.incomingCall);
        };

        this.expectBusyCallSoundToPlay = function () {
            mediaStreamsTester.expectStreamsToPlay(soundSources.busyCall);
        };

        this.stopBusySignal = function () {
            mediaStreamsTester.finish(soundSources.busyCall);
        };

        this.expectNoSoundToPlay = function () {
            mediaStreamsTester.expectNoStreamToPlay();
        };

        function finishCall () {
            me.eventsWebSocket.receiveMessage({
                name: 'employee_changed',
                type: 'event',
                params: {
                    action: 'update',
                    data: [{
                        id: 20816,
                        is_in_call: false
                    }]
                }
            });

            me.eventsWebSocket.receiveMessage({
                id: 314723705,
                name: 'call_session_finished',
                type: 'event',
                params: {
                    call_session_id: 980925450
                }
            });

            Promise.runAll(false, true);
            spendTime(0);
        }

        this.notificationOfUserStateChanging = function () {
            let id = 20816;

            const data = {
                id,
                status_id: 2
            };

            const message = {
                name: 'employee_changed',
                type: 'event',
                params: {
                    action: 'update',
                    data: [data]
                }
            };

            return {
                wrongStructure: function () {
                    message.params.data = data;
                    return this;
                },
                setOtherUser: function () {
                    data.id = 583783;
                    return this;
                },
                anotherStatus: function () {
                    data.status_id = 4;
                    return this;
                },
                receive: function () {
                    me.eventsWebSocket.receiveMessage(message);
                    spendTime(0);
                }
            };
        };

        this.statusChangedEvent = () => {
            const params = {
                action: 'insert',
                data: [{
                    id: 848593,
                    data: [{
                        id: 848593,
                        icon: 'funnel',
                        name: 'Воронка',
                        color: '#ff8f00',
                        comment: null,
                        mnemonic: null,
                        priority: 18,
                        is_removed: false,
                        description: '',
                        is_worktime: true,
                        is_different: true,
                        is_select_allowed: true,
                        allowed_phone_protocols: [
                            'PSTN',
                            'SIP',
                            'SIP_TRUNK',
                            'FMC'
                        ],
                        is_auto_out_calls_ready: true,
                        is_use_availability_in_group: true,
                        in_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        in_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ]
                    }],
                    app_id: 4735
                }]
            };

            const createMessage = () => ({
                type: 'event',
                id: 'e24bcc05529d4ae19674bd4163f0b6a7',
                name: 'status_changed',
                params
            });

            return {
                updateRemoved() {
                    params.action = 'update';

                    params.data = [{
                        id: 7,
                        data: [{
                            id: 7,
                            name: 'Ненужный'
                        }]
                    }];

                    return this;
                },

                update() {
                    params.action = 'update';

                    params.data = [{
                        id: 2,
                        data: [{
                            id: 2,
                            name: 'Пауза'
                        }]
                    }];

                    return this;
                },

                remove() {
                    params.action = 'delete';

                    params.data = [{
                        id: 2,
                        data: [{
                            id: 2,
                            is_removed: true
                        }]
                    }];

                    return this;
                },

                slavesNotification: function () {
                    return {
                        expectToBeSent: function () {
                            me.nextCrosstabMessage().expectToContain({
                                type: 'message',
                                data: {
                                    type: 'notify_slaves',
                                    data: {
                                        type: 'websocket_message',
                                        message: createMessage(),
                                    }
                                }
                            });
                        }
                    };
                },

                receive: () => {
                    eventsWebSocket.receiveMessage(createMessage());
                    spendTime(0);
                }
            }
        };

        this.requestCallFinish = function () {
            sip.recentRequest().expectToHaveMethod('BYE').response().send();
            spendTime(0);
            //finishCall();
        };

        this.requestCancelOutgoingCall = function () {
            sip.recentRequest().expectToHaveMethod('CANCEL').response().send();
            //finishCall();
        };

        this.requestDeclineIncomingCall = function () {
            sip.recentResponse().expectBusy();
            spendTime(0);
            //finishCall();
        };

        this.tabStateChangeMessage = function () {
            var is_master = true,
                has_master = true;

            return {
                isNotMaster: function () {
                    return this.setNotMaster();
                },
                hasNotMaster: function () {
                    return this.setHasNoMaster();
                },
                setHasNoMaster: function () {
                    has_master = false;
                    return this;
                },
                setNotMaster: function () {
                    is_master = false;
                    return this;
                },
                receive: function () {
                    me.eventsWebSocket.receiveMessage({
                        type: 'master_info',
                        data: {
                            is_master: is_master,
                            has_master: has_master
                        }
                    });
                }
            };
        };

        this.requestMasterState = function () {
            me.eventsWebSocket.expectSentMessageToContain({
                type: 'notify_master',
                data: {
                    action: 'tab_opened'
                }
            });
        };

        this.receiveMasterStateRequest = function () {
            me.eventsWebSocket.receiveMessage({
                type: 'notify_master',
                data: {
                    action: 'tab_opened'
                }
            });
        };

        this.microphoneAccessNotification = function () {
            var data = {
                type: 'notify_slaves',
                data: {
                    type: 'state_updating',
                    state: {
                        softphone: {
                            accessToMicrophoneIsGranted: true
                        }
                    }
                }
            };

            return {
                setAccessDenied: function () {
                    data.data.state.softphone.accessToMicrophoneIsGranted = false;
                    return this;
                },
                receive: function () {
                    me.eventsWebSocket.receiveMessage(data);
                },
                expectToBeSent: function () {
                    me.eventsWebSocket.expectSentMessageToContain(data);
                }
            };
        };

        this.sipSocketSlavesNotification = function () {
            var data = {
                type: 'notify_slaves',
                data: {
                    type: 'state_updating',
                    state: {
                        softphone: {
                            webrtcConnected: true
                        }
                    }
                }
            };

            return {
                setDisconnected: function () {
                    data.data.state.softphone.webrtcConnected = false;
                    return this;
                },
                send: function () {
                    me.eventsWebSocket.expectSentMessageToContain(data);
                },
                receive: function () {
                    me.eventsWebSocket.receiveMessage(data);
                }
            };
        };

        this.expectPingToBeSent = function () {
            me.eventsWebSocket.expectSentMessageToContain({
                type: 'ping',
                data: 'ping'
            });
        };

        this.receivePong = function () {
            me.eventsWebSocket.receiveMessage({
                type: 'ping',
                data: 'pong'
            });

            spendTime(0);
        };

        this.spendFiveSeconds = function (times = 1) {
            let i = 0;

            for (i = 0; i < times; i ++) {
                spendTime(5000);
                this.expectPingToBeSent();
                this.receivePong();
            }
        };

        this.startTryingToPingUnavailableSocket = function () {
            // 1-ая попытка
            spendTime(1000);
            Promise.runAll(false, true);
            this.expectPingToBeSent();

            // 2-ая попытка
            spendTime(1001);
            Promise.runAll(false, true);
            this.expectPingToBeSent();

            // 3-ая попытка
            spendTime(1003);
            Promise.runAll(false, true);
            this.expectPingToBeSent();

            // 4-ая попытка
            spendTime(1009);
            Promise.runAll(false, true);
            this.expectPingToBeSent();

            // 5-ая попытка
            spendTime(1026);
            Promise.runAll(false, true);
            this.expectPingToBeSent();
        };

        this.continueTryingToPingUnavailableSocket = function () {
            // 6-ая попытка
            spendTime(1073);
            Promise.runAll(false, true);
            this.expectPingToBeSent();

            // 7-ая попытка
            spendTime(1199);
            Promise.runAll(false, true);
            this.expectPingToBeSent();

            // 8-ая попытка
            spendTime(1541);
            Promise.runAll(false, true);
            this.expectPingToBeSent();

            // 9-ая попытка
            spendTime(2000);
            spendTime(471);
            Promise.runAll(false, true);
            this.expectPingToBeSent();
        };
        
        this.finishTryingToPingUnavailableSocket = function () {
            spendTime(2000);
            spendTime(1000);
            Promise.runAll(false, true);

            // 10-ая попытка
            spendTime(2000);
            this.expectPingToBeSent();
        };
        
        this.tryToPingUnavailableSocket = function () {
            this.startTryingToPingUnavailableSocket();
            this.continueTryingToPingUnavailableSocket();
            this.finishTryingToPingUnavailableSocket();
        };

        this.statusesRequest = function () {
            var data = [{
                id: 7,
                is_worktime: false,
                mnemonic: 'removed',
                name: 'Удаленный',
                is_select_allowed: false,
                icon: 'heart',
                color: '#000',
                priority: 8,
                is_removed: true,
                in_external_allowed_call_directions: [
                    'in',
                    'out'
                ],
                in_internal_allowed_call_directions: [
                    'in',
                    'out'
                ],
                out_external_allowed_call_directions: [
                    'in',
                    'out'
                ],
                out_internal_allowed_call_directions: [
                    'in',
                    'out'
                ],
                allowed_phone_protocols: [
                    'SIP'
                ]
            }, {
                id: 1,
                is_worktime: true,
                mnemonic: 'available',
                name: 'Доступен',
                is_select_allowed: true,
                description: 'все вызовы',
                color: '#48b882',
                icon: 'tick',
                priority: 1,
                in_external_allowed_call_directions: [
                    'in',
                    'out'
                ],
                in_internal_allowed_call_directions: [
                    'in',
                    'out'
                ],
                out_external_allowed_call_directions: [
                    'in',
                    'out'
                ],
                out_internal_allowed_call_directions: [
                    'in',
                    'out'
                ],
                allowed_phone_protocols: [
                    'SIP'
                ],
            }, {
                id: 2,
                is_worktime: true,
                mnemonic: 'break',
                name: 'Перерыв',
                is_select_allowed: true,
                description: 'временное отключение',
                color: '#1179ad',
                icon: 'pause',
                priority: 3,
                in_external_allowed_call_directions: [],
                in_internal_allowed_call_directions: [],
                out_external_allowed_call_directions: [],
                out_internal_allowed_call_directions: [],
                allowed_phone_protocols: [
                    'SIP'
                ],
            }, {
                id: 3,
                is_worktime: true,
                mnemonic: 'do_not_disturb',
                name: 'Не беспокоить',
                is_select_allowed: true,
                icon: 'minus',
                description: 'только исходящие',
                color: '#cc5d35',
                priority: 2,
                in_external_allowed_call_directions: [],
                in_internal_allowed_call_directions: [],
                out_external_allowed_call_directions: [],
                out_internal_allowed_call_directions: []
            }, {
                id: 4,
                is_worktime: true,
                mnemonic: 'not_at_workplace',
                name: 'Нет на месте',
                is_select_allowed: true,
                description: 'все вызовы на мобильном',
                color: '#ebb03b',
                icon: 'time',
                priority: 4,
                in_external_allowed_call_directions: [
                    'in',
                    'out'
                ],
                in_internal_allowed_call_directions: [
                    'in',
                    'out'
                ],
                out_external_allowed_call_directions: [
                    'in',
                    'out'
                ],
                out_internal_allowed_call_directions: [
                    'in',
                    'out'
                ],
                allowed_phone_protocols: [
                    'SIP'
                ]
            }, {
                id: 5,
                is_worktime: false,
                mnemonic: 'not_at_work',
                name: 'Нет на работе',
                is_select_allowed: true,
                description: 'полное отключение',
                color: '#99acb7',
                icon: 'cross',
                priority: 5,
                in_external_allowed_call_directions: [],
                in_internal_allowed_call_directions: [],
                out_external_allowed_call_directions: [],
                out_internal_allowed_call_directions: []
            }, {
                id: 6,
                is_worktime: false,
                mnemonic: 'unknown',
                name: 'Неизвестно',
                is_select_allowed: false,
                icon: 'unknown',
                color: null,
                priority: 7,
                in_external_allowed_call_directions: [
                    'in',
                    'out'
                ],
                in_internal_allowed_call_directions: [
                    'in',
                    'out'
                ],
                out_external_allowed_call_directions: [
                    'in',
                    'out'
                ],
                out_internal_allowed_call_directions: [
                    'in',
                    'out'
                ],
                allowed_phone_protocols: [
                    'SIP'
                ]
            }];

            function addResponseModifiers (me) {
                me.many = function () {
                    data.push({
                        id: 8,
                        is_worktime: false,
                        mnemonic: 'asterisk',
                        name: 'Звёздочка',
                        is_select_allowed: false,
                        icon: 'asterisk',
                        color: '#317f43',
                        priority: 7,
                        in_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        in_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        allowed_phone_protocols: [
                            'SIP'
                        ]
                    }, {
                        id: 11,
                        is_worktime: false,
                        mnemonic: 'bell',
                        name: 'Колокольчик',
                        is_select_allowed: false,
                        icon: 'bell',
                        color: '#8fcd75',
                        priority: 7,
                        in_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        in_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        allowed_phone_protocols: [
                            'SIP'
                        ]
                    }, {
                        id: 12,
                        is_worktime: false,
                        mnemonic: 'bottom_left_arrow',
                        name: 'Стрелочка',
                        is_select_allowed: false,
                        icon: 'bottom_left_arrow',
                        color: '#9d24d2',
                        priority: 7,
                        in_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        in_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        allowed_phone_protocols: [
                            'SIP'
                        ]
                    }, {
                        id: 14,
                        is_worktime: false,
                        mnemonic: 'dice',
                        name: 'Кости',
                        is_select_allowed: false,
                        icon: 'dice',
                        color: '#9a3979',
                        priority: 7,
                        in_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        in_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        allowed_phone_protocols: [
                            'SIP'
                        ]
                    }, {
                        id: 16,
                        is_worktime: false,
                        mnemonic: 'ellipsis',
                        name: 'Многоточие',
                        is_select_allowed: false,
                        icon: 'ellipsis',
                        color: '#29f8a9',
                        priority: 7,
                        in_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        in_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        allowed_phone_protocols: [
                            'SIP'
                        ]
                    }, {
                        id: 17,
                        is_worktime: false,
                        mnemonic: 'exclamation',
                        name: 'Восклицание',
                        is_select_allowed: false,
                        icon: 'exclamation',
                        color: '#d6aa82',
                        priority: 7,
                        in_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        in_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        allowed_phone_protocols: [
                            'SIP'
                        ]
                    }, {
                        id: 18,
                        is_worktime: false,
                        mnemonic: 'fast_forward',
                        name: 'Перемотка',
                        is_select_allowed: false,
                        icon: 'fast_forward',
                        color: '#4a75ff',
                        priority: 7,
                        in_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        in_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        allowed_phone_protocols: [
                            'SIP'
                        ]
                    }, {
                        id: 19,
                        is_worktime: false,
                        mnemonic: 'find',
                        name: 'Найти',
                        is_select_allowed: false,
                        icon: 'find',
                        color: '#ff9ec5',
                        priority: 7,
                        in_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        in_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        allowed_phone_protocols: [
                            'SIP'
                        ]
                    }, {
                        id: 20,
                        is_worktime: false,
                        mnemonic: 'funnel',
                        name: 'Воронка',
                        is_select_allowed: false,
                        icon: 'funnel',
                        color: '#dac778',
                        priority: 7,
                        in_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        in_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        allowed_phone_protocols: [
                            'SIP'
                        ]
                    }, {
                        id: 21,
                        is_worktime: false,
                        mnemonic: 'half_moon',
                        name: 'Луна',
                        is_select_allowed: false,
                        icon: 'half_moon',
                        color: '#285b47',
                        priority: 7,
                        in_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        in_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        allowed_phone_protocols: [
                            'SIP'
                        ]
                    }, {
                        id: 22,
                        is_worktime: false,
                        mnemonic: 'handset',
                        name: 'Поднял',
                        is_select_allowed: false,
                        icon: 'handset',
                        color: '#6c9297',
                        priority: 7,
                        in_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        in_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        allowed_phone_protocols: [
                            'SIP'
                        ]
                    }, {
                        id: 23,
                        is_worktime: false,
                        mnemonic: 'hangup',
                        name: 'Повесил',
                        is_select_allowed: false,
                        icon: 'hangup',
                        color: '#fd1c30',
                        priority: 7,
                        in_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        in_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        allowed_phone_protocols: [
                            'SIP'
                        ]
                    }, {
                        id: 24,
                        is_worktime: false,
                        mnemonic: 'info',
                        name: 'Информация',
                        is_select_allowed: false,
                        icon: 'info',
                        color: '#65674d',
                        priority: 7,
                        in_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        in_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        allowed_phone_protocols: [
                            'SIP'
                        ]
                    }, {
                        id: 25,
                        is_worktime: false,
                        mnemonic: 'lightning',
                        name: 'Молния',
                        is_select_allowed: false,
                        icon: 'lightning',
                        color: '#a39034',
                        priority: 7,
                        in_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        in_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        allowed_phone_protocols: [
                            'SIP'
                        ]
                    }, {
                        id: 26,
                        is_worktime: false,
                        mnemonic: 'list',
                        name: 'Список',
                        is_select_allowed: false,
                        icon: 'list',
                        color: '#02b852',
                        priority: 7,
                        in_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        in_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        allowed_phone_protocols: [
                            'SIP'
                        ]
                    }, {
                        id: 27,
                        is_worktime: false,
                        mnemonic: 'pen',
                        name: 'Ручка',
                        is_select_allowed: false,
                        icon: 'pen',
                        color: '#a547a7',
                        priority: 7,
                        in_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        in_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        allowed_phone_protocols: [
                            'SIP'
                        ]
                    }, {
                        id: 28,
                        is_worktime: false,
                        mnemonic: 'play',
                        name: 'Проигрывание',
                        is_select_allowed: false,
                        icon: 'play',
                        color: '#29fb98',
                        priority: 7,
                        in_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        in_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        allowed_phone_protocols: [
                            'SIP'
                        ]
                    }, {
                        id: 29,
                        is_worktime: false,
                        mnemonic: 'question',
                        name: 'Вопрос',
                        is_select_allowed: false,
                        icon: 'question',
                        color: '#11aaf1',
                        priority: 7,
                        in_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        in_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        allowed_phone_protocols: [
                            'SIP'
                        ]
                    }, {
                        id: 30,
                        is_worktime: false,
                        mnemonic: 'rays',
                        name: 'Лучи',
                        is_select_allowed: false,
                        icon: 'rays',
                        color: '#8734bf',
                        priority: 7,
                        in_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        in_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        allowed_phone_protocols: [
                            'SIP'
                        ]
                    }, {
                        id: 31,
                        is_worktime: false,
                        mnemonic: 'star',
                        name: 'Звезда',
                        is_select_allowed: false,
                        icon: 'star',
                        color: '#06c9aa',
                        priority: 7,
                        in_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        in_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        allowed_phone_protocols: [
                            'SIP'
                        ]
                    }, {
                        id: 32,
                        is_worktime: false,
                        mnemonic: 'target',
                        name: 'Цель',
                        is_select_allowed: false,
                        icon: 'target',
                        color: '#80130c',
                        priority: 7,
                        in_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        in_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        allowed_phone_protocols: [
                            'SIP'
                        ]
                    }, {
                        id: 10,
                        is_worktime: false,
                        mnemonic: 'auto_out_call',
                        name: 'Исходящий обзвон',
                        is_select_allowed: false,
                        icon: 'auto_out_call',
                        color: '#1e2460',
                        priority: 7,
                        in_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        in_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        allowed_phone_protocols: [
                            'SIP'
                        ]
                    });

                    return me;
                };

                me.noNotAtWorkplace = () => {
                    const index = data.findIndex(({mnemonic}) => mnemonic == 'not_at_workplace');
                    index != -1 && data.splice(index, 1);

                    return me;
                };

                me.includesAutoCall = function () {
                    data.push({
                        color: '#e03c00',
                        icon: 'top_right_arrow',
                        description: 'только исходящий обзвон',
                        is_worktime: true,
                        id: 20482,
                        mnemonic: 'auto_out_call',
                        in_external_allowed_call_directions: [],
                        in_internal_allowed_call_directions: [],
                        out_external_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        out_internal_allowed_call_directions: [
                            'in',
                            'out'
                        ],
                        name: 'Исходящий обзвон',
                        is_select_allowed: true,
                        priority: 6
                    });

                    return me;
                };

                me.addAutoCall = me.includesAutoCall;
                return me;
            }

            return {
                createExpectation: function (requests) {
                    var request = (requests ? requests.someRequest() : ajax.recentRequest()).
                        expectPathToContain('/sup/api/v1/statuses');

                    var token = 'XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0';

                    return {
                        anotherAuthorizationToken() {
                            token = '935jhw5klatxx2582jh5zrlq38hglq43o9jlrg8j3lqj8jf';
                            return this;
                        },
                        setAnotherAuthorizationToken: function () {
                            token = 'Fl298gw0e2Foiweoa4Ua-0923gLwe84we3LErwiI230';
                            return this;
                        },
                        checkCompliance: function () {
                            request.expectToHaveHeaders({
                                Authorization: 'Bearer ' + token
                            });

                            return {
                                createResponse: function () {
                                    return addResponseModifiers({
                                        receive: function () {
                                            request.respondSuccessfullyWith({data});
                                            Promise.runAll(false, true);
                                            spendTime(0);
                                        }
                                    });
                                },
                                receiveResponse: function () {
                                    this.createResponse().receive();
                                }
                            };
                        }
                    };
                },
                anotherAuthorizationToken: function() {
                    return addResponseModifiers(
                        this.createExpectation().anotherAuthorizationToken().checkCompliance()
                    );
                },
                expectToBeSent: function (requests) {
                    return addResponseModifiers(this.createExpectation(requests).checkCompliance());
                },
                createResponse: function () {
                    return this.expectToBeSent().createResponse();
                },
                receiveResponse: function () {
                    this.createResponse().receive();
                }
            };
        };

        this.sipNumberCapacityChangingRequest = function () {
            return {
                expectToBeSent: function () {
                    var request = ajax.recentRequest().expectPathToContain(
                        '/sup/api/v1/change_sip_number_capacity_before_call'
                    );

                    return {
                        receiveResponse: function () {
                            request.respondSuccessfullyWith({
                                data: true
                            });

                            Promise.runAll(false, true);
                        }
                    };
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                }
            };
        };

        this.requestUpdateUserState = function () {
            var response = {
                data: true
            };

            var respond = function (request) {
                request.respondSuccessfullyWith(response);
            };

            function addResponseModifiers (me) {
                me.accessTokenExpired = function () {
                    response = {
                        error: {
                            code: 401,
                            message: 'Token has been expired',
                            mnemonic: 'expired_token',
                            is_smart: false
                        }
                    };

                    respond = function (request) {
                        request.respondUnsuccessfullyWith(response);
                    };

                    return me;
                };

                return me;
            }

            return addResponseModifiers({
                expectToBeSent: function () {
                    const request = ajax.recentRequest().
                        expectPathToContain('sup/api/v1/users/me').
                        expectToHaveMethod('PATCH').
                        expectBodyToContain({
                            status: 4
                        });

                    return addResponseModifiers({
                        send: function () {
                            this.receiveResponse();
                        },
                        receiveResponse: function () {
                            respond(request);
                            Promise.runAll();
                        }
                    });
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                }
            });
        };

        this.userStateUpdateRequest = this.requestUpdateUserState;

        this.secondRingtone = 'Eq8ZAtHhtF';
        this.thirdRingtone = 'I2g0wh2htF';
        this.customHoldMusic = 'UklGRjIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA==';

        this.ringtoneRequest = function () {
            var response = me.secondRingtone,
                number = '2';

            function addMethods (me) {
                me.setModified = function () {
                    response = response + 'q';
                    return me;
                };

                return me;
            }

            return addMethods({
                third: function () {
                    response = me.thirdRingtone;
                    number = '3';
                    return this;
                },
                expectToBeSent: function () {
                    var request = ajax.recentRequest().
                        expectToHavePath('https://somehost.com/softphone_ringtone' + number + '.mp3').
                        expectToHaveMethod('GET');

                    return addMethods({
                        receiveResponse: function () {
                            request.respondSuccessfullyWith(response);
                            Promise.runAll();
                        }
                    });
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                }
            });
        };

        this.secondRingtoneRequest = this.ringtoneRequest;

        this.customHoldMusicRequest = function () {
            return {
                expectToBeSent: function () {
                    var request = ajax.recentRequest().
                        expectToHavePath('https://somehost.com/hold_music.mp3').
                        expectToHaveMethod('GET');

                    return {
                        receiveResponse: function () {
                            request.respondSuccessfullyWith(me.customHoldMusic);
                            Promise.runAll();
                        }
                    };
                },
                receiveResponse: function () {
                    this.expectToBeSent().receiveResponse();
                }
            };
        };

        this.createActiveLeadsSetter = function (params, callback) {
            return function () {
                params.is_final = true;

                params.active_leads = [{
                    url: 'https://comagicwidgets.amocrm.ru/leads/detail/3003649',
                    name: 'По звонку на 79154394339',
                    status: 'Открыт',
                    pipeline: 'Переговоры'
                }, {
                    url: 'https://comagicwidgets.amocrm.ru/leads/detail/3003651',
                    name: 'По звонку с 79154394340',
                    status: 'Закрыт',
                    pipeline: 'Согласование договора'
                }, {
                    url: 'https://comagicwidgets.amocrm.ru/leads/detail/3003650',
                    name: 'По звонку с 79154394339',
                    status: 'Открыт',
                    pipeline: 'Согласование договора'
                }, {
                    url: 'https://comagicwidgets.amocrm.ru/leads/detail/3003652',
                    name: 'По звонку с 79154394339',
                    status: 'Открыт',
                    pipeline: 'Согласование договора'
                }];

                (function () {
                    var i;

                    for (i = 0; i < 20; i ++) {
                        params.active_leads.push({
                            url: 'https://comagicwidgets.amocrm.ru/leads/detail/' + 3003653 + i,
                            name: 'По звонку с 79154394339',
                            status: 'Открыт',
                            pipeline: 'Согласование договора'
                        });
                    }
                })();

                callback && callback();
                return this;
            };
        };

        var extendSlavesNotification = function (notification) {
            return notification;
        };

        this.extendSlavesNotification = function (extentor) {
            extendSlavesNotification = extentor;
        };

        var extendAdditionalSlavesNotification = function (notification) {
            return notification;
        };

        this.extendAdditionalSlavesNotification = function (extentor) {
            extendAdditionalSlavesNotification = extentor;
        };

        var extendMasterNotification = function (notification) {
            return notification;
        };

        this.extendMasterNotification = function (extentor) {
            extendMasterNotification = extentor;
        };

        var othersNotificationExtentors = [];

        function extendOthersNotification (notification, data) {
            othersNotificationExtentors.forEach(extend => extend(notification, data));
            return notification;
        };

        this.extendOthersNotification = function (extentor) {
            othersNotificationExtentors.push(extentor);
        };

        const createBroadcastChannelTester = channelName => {
            let time = 0;

            const nextMessage = () => {
                const message = broadcastChannels.nextMessage();
                time = message.time;
                return message;
            };

            const applyMessage = () => ({
                type: 'internal',
                data: {
                    context: 'leader',
                    action: 'apply'
                }
            });

            return {
                applyMessage,
                nextMessage,
                applyLeader: () => nextMessage().expectToContain(applyMessage()),

                receiveMessage: message => {
                    message.time = new Date().getTime() * 1000;

                    if (message.time <= time) {
                        time ++;
                        message.time = time;
                    }

                    broadcastChannels.channel(channelName).receiveMessage(message);
                },

                tellIsLeader: () => nextMessage().expectToBeSentToChannel(channelName).expectToContain({
                    type: 'internal',
                    data: {
                        context: 'leader',
                        action: 'tell'
                    }
                })
            };
        };

        this.createBroadcastChannelTester = createBroadcastChannelTester;

        {
            const {
                tellIsLeader,
                applyLeader
            } = createBroadcastChannelTester('notificationChannel');

            this.notificationChannel = () => ({
                applyLeader: () => ({
                    expectToBeSent: () => {
                        applyLeader();
                        Promise.runAll(false, true);

                        return {
                            waitForSecond: () => {
                                spendTime(1000);
                                spendTime(0);
                            },
                        };
                    }
                }),

                tellIsLeader: () => ({
                    expectToBeSent: () => {
                        tellIsLeader();
                        Promise.runAll(false, true);
                    }
                })
            });
        }

        {
            let wasMaster;

            const {
                nextMessage,
                receiveMessage,
                tellIsLeader,
                applyMessage,
                applyLeader
            } = createBroadcastChannelTester('crosstab');

            this.nextCrosstabMessage = nextMessage;
            this.receiveCrosstabMessage = receiveMessage;

            const createCustomMessage = data => ({
                type: 'message',
                data
            });

            const receiveCustomMessage = data => receiveMessage(createCustomMessage(data));

            const receiveLeaderDeath = () => receiveMessage({
                type: 'internal',
                data: {
                    context: 'leader',
                    action: 'death',
                    token: 'g28g2hor28'
                }
            });
                
            this.masterNotification = function () {
                var data = {},
                    processing = [];

                function createNotification () {
                    processing.forEach(function (process) {
                        process();
                    });

                    return {
                        type: 'message',
                        data: {
                            type: 'notify_master',
                            data
                        }
                    };
                }

                var me = extendMasterNotification({
                    setSecondChannel: function () {
                        data = {
                            action: 'setChannel',
                            channel: 2
                        };

                        return this;
                    },
                    destroy: function () {
                        data = {
                            action: 'destroy'
                        };

                        return this;
                    },
                    answer: function () {
                        data = {
                            action: 'answer'
                        };

                        return this;
                    },
                    sendDTMF: function (dtmf) {
                        data = {
                            action: 'sendDTMF',
                            dtmf: dtmf
                        };

                        return this;
                    },
                    unmute: function () {
                        data = {
                            action: 'unmute'
                        };

                        return this;
                    },
                    mute: function () {
                        data = {
                            action: 'mute'
                        };

                        return this;
                    },
                    unhold: function () {
                        data = {
                            action: 'unhold'
                        };

                        return this;
                    },
                    hold: function () {
                        data = {
                            action: 'hold'
                        };

                        return this;
                    },
                    secondChannel: function () {
                        processing.push(function () {
                            data.channel = 2;
                        });

                        return this;
                    },
                    toggleWidgetVisiblity: function () {
                        data = {
                            action: 'toggle_widget_visiblity'
                        };

                        return this;
                    },
                    terminate: function () {
                        data = {
                            action: 'terminate'
                        };

                        return this;
                    },
                    anotherShortPhoneNumber: function () {
                        processing.push(function () {
                            data.phoneNumber = '295';
                        });

                        return this;
                    },
                    anotherShortPhone: function () {
                        return this.anotherShortPhoneNumber();
                    },
                    fourthPhoneNumber: function () {
                        processing.push(function () {
                            data.phoneNumber = '74999951240';
                        });

                        return this;
                    },
                    thirdPhoneNumber: function () {
                        processing.push(function () {
                            data.phoneNumber = '74950230625';
                        });

                        return this;
                    },
                    anotherPhoneNumber: function () {
                        processing.push(function () {
                            data.phoneNumber = '79161234569';
                        });

                        return this;
                    },
                    call: function () {
                        data = {
                            action: 'call',
                            phoneNumber: '79161234567'
                        };

                        return this;
                    },
                    tabOpened: function () {
                        data = {
                            action: 'tab_opened',
                            visible: true
                        };

                        return this;
                    },
                    tabOpenedInBackground: function () {
                        data = {
                            action: 'tab_opened',
                            visible: false
                        };

                        return this;
                    },
                    tabBecameVisible: function () {
                        data = {
                            action: 'tab_visibility_change',
                            visible: true
                        };

                        return this;
                    },
                    tabBecameHidden: function () {
                        data = {
                            action: 'tab_visibility_change',
                            visible: false
                        };

                        return this;
                    },
                    expectToBeSent: function () {
                        nextMessage().expectToContain(createNotification());
                    },
                    receive: function () {
                        receiveMessage(createNotification());
                        spendTime(0);
                        spendTime(0);
                    }
                }, data);

                return me;
            };

            this.slavesNotification = function () {
                var channel = '1';

                var sessionIds = {
                    1: '2P47TE0zlcmeOyswJ9yIBGQ468199568725824',
                    2: 'XAjXcNpBemN3ppGZiBUJGq8468199568725824'
                };

                var state = {
                    visible: true,
                    holded: undefined,
                    muted: false,
                    direction: 'outgoing',
                    state: 'idle',
                    phoneNumber: '',
                    disabled: null,
                    channelsCount: 0,
                    currentChannel: 1,
                    statusId: null,
                    destroyed: false,
                    isSipOnline: false,
                    microphoneAccessGranted: false,
                    lastChannelChange:  {
                        previousChannelNumber: null,
                        newChannel: {
                            sessionId: null,
                            state: null,
                            direction: null
                        }
                    },
                    softphoneServerConnected: false,
                    webRTCServerConnected: false,
                    registered: false,
                    channels: undefined
                };

                function getDefaultChannelState () {
                    return {
                        endedNormally: null,
                        holded: undefined,
                        holdButtonPressed: false,
                        muted: false,
                        direction: 'outgoing',
                        state: 'idle',
                        phoneNumber: ''
                    };
                }

                function updateChannel (number, newState = {}) {
                    !state.channels && (state.channels = {});

                    !state.channels[number] && (state.channels[number] = {
                        ...getDefaultChannelState(),
                        ...newState
                    });
                }

                var maybeRemoveSecondChannel = function () {
                    state.channels && (state.channels['2'] = undefined);
                };

                var processing = [],
                    postprocessing = [],
                    newChannelProcessing = [];

                var phoneNumbers = {
                    1: '79161234567',
                    2: '79161234567'
                };
                
                function phoneNumber () {
                    processing.push((function (channel) {
                        return function () {
                            state.channels[channel].phoneNumber = phoneNumbers[channel];
                            me.enabled();
                        };
                    })(channel));
                };

                function changedChannel (newChannelNumber, previousChannelNumber) {
                    processing.push(function () {
                        updateChannel(previousChannelNumber);
                        updateChannel(newChannelNumber);

                        var newChannel = {
                            state: state.channels[newChannelNumber].state,
                            direction: state.channels[newChannelNumber].direction
                        };

                        state.lastChannelChange = {
                            previousChannelNumber: previousChannelNumber,
                            newChannel: newChannel 
                        };

                        newChannelProcessing.forEach(function (process) {
                            process(newChannel)
                        });
                    });
                }

                function createNotification (process) {
                    maybeRemoveSecondChannel();

                    processing.forEach(function (process) {
                        process();
                    });

                    process();

                    postprocessing.forEach(function (process) {
                        process();
                    });

                    state.channels && state.channels[state.currentChannel] &&
                        Object.entries(state.channels[state.currentChannel]).forEach(function (args) {
                            var key = args[0],
                                value = args[1];

                            key != 'holdButtonPressed' && (state[key] = value);
                        });

                    return {
                        type: 'message',
                        data: {
                            type: 'notify_slaves',
                            data: {
                                type: 'webrtc_state_updating',
                                state: state
                            }
                        }
                    };
                }

                var me = extendSlavesNotification({
                    tabsVisibilityRequest: function () {
                        const data = {
                            type: 'message',
                            data: {
                                type: 'notify_slaves',
                                method: 'get_tabs_visibility'
                            }
                        };

                        return {
                            expectToBeSent: function () {
                                nextMessage().expectToContain(data);
                            },
                            receive: function () {
                                receiveMessage(data);
                                Promise.runAll(false, true);
                            }
                        };
                    },
                    additional: function () {
                        var processing = [];

                        var state = {
                            channels: {
                                1: {
                                    id: '1',
                                    dtmf: '',
                                    isTransfered: false,
                                },
                                2: {
                                    id: '2',
                                    dtmf: '',
                                    isTransfered: false,
                                },
                            },
                            employeeNames: {},
                            callsData: {},
                            hidden: true,
                            openedPanel: 'calls',
                        };

                        var notification = {
                            type: 'notify_slaves',
                            data: {
                                type: 'state_updating',
                                state: state 
                            } 
                        };

                        function getNotification () {
                            processing.forEach(function (process) {
                                process();
                            });

                            return {
                                type: 'message',
                                data: notification
                            };
                        }

                        var methods = {
                            visible: function ()  {
                                state.hidden = false;
                                return this;
                            },
                            dtmf: function (value) {
                                state.channels['1'].dtmf = value;
                                return this;
                            },
                            notTransfered: function () {
                                state.channels['1'].isTransfered = false;
                                return this;
                            },
                            transfered: function () {
                                state.channels['1'].isTransfered = true;
                                return this;
                            },
                            name: function () {
                                state.employeeNames['79161234567'] = {
                                    id: '79161234567',
                                    value: 'Шалева Дора'
                                };

                                return this;
                            },
                            longName: function () {
                                state.employeeNames['79161234567'] = {
                                    id: '79161234567',
                                    value: 'ООО "КОБЫЛА И ТРУПОГЛАЗЫЕ ЖАБЫ ИСКАЛИ ЦЕЗИЮ НАШЛИ ПОЗДНО УТРОМ ' +
                                        'СВИСТЯЩЕГО ХНА"'
                                };

                                return this;
                            },
                            anotherName: function () {
                                state.employeeNames['79161234569'] = {
                                    id: '',
                                    value: 'ООО "КОБЫЛА И ТРУПОГЛАЗЫЕ ЖАБЫ ИСКАЛИ ЦЕЗИЮ НАШЛИ ПОЗДНО УТРОМ ' +
                                        'СВИСТЯЩЕГО ХНА"'
                                };

                                return this;
                            },
                            contact: function () {
                                state.employeeNames['79161234569'] = {
                                    id: '79161234569',
                                    value: null,
                                };

                                return this;
                            },
                            anotherContact: function () {
                                state.employeeNames['74999951240'] = {
                                    id: '74999951240',
                                    value: null,
                                };

                                return this;
                            },
                            thirdContact: function () {
                                state.employeeNames['79161234567'] = {
                                    id: '79161234567',
                                    value: null,
                                };

                                return this;
                            },
                            fourthContact: function () {
                                state.employeeNames['79161234570'] = {
                                    id: '79161234570',
                                    value: null,
                                };

                                return this;
                            },
                            expectToBeSent: function () {
                                const notification = getNotification();

                                ['employeeNames', 'callsData'].forEach(
                                    name => !Object.keys(notification.data.data.state[name]).length &&
                                        (notification.data.data.state[name] = utils.expectEmptyObject())
                                );

                                nextMessage().expectToContain(notification);
                            },
                            receive: function () {
                                receiveMessage(getNotification());

                                Promise.runAll(false, true);
                                spendTime(0);
                                spendTime(0);
                            }
                        };

                        const addCallEvent = (key) => {
                            methods[key] = function () {
                                const builder = softphoneTester[key]();

                                const me = {
                                    include: () => {
                                        const {
                                            phone,
                                            message: { params }
                                        } = builder.createMessage();

                                        [
                                            'virtual_phone_number',
                                            'contact_phone_number',
                                            'calling_phone_number'
                                        ].forEach(param => params[param][0] == '+' && (params[param] = params[param].slice(1)));

                                        state.callsData = {
                                            [phone]: params,
                                        };

                                        return methods;
                                    },
                                };

                                Object.entries(builder).forEach(([key, method]) => {
                                    if (['createMessage', 'slavesNotification', 'receive'].includes(key)) {
                                        return;
                                    }

                                    me[key] = function () {
                                        method.apply(builder, arguments);
                                        return me;
                                    };
                                });

                                return me;
                            };
                        };

                        addCallEvent('outCallEvent');
                        addCallEvent('outCallSessionEvent');

                        return extendAdditionalSlavesNotification(methods, state, processing);
                    },
                    userDataFetched: function () {
                        state.isSipOnline = true;
                        state.statusId = 3;
                        return this;
                    },
                    sipIsOffline: function () {
                        processing.push(() => (state.isSipOnline = false));
                        return this;
                    },
                    anotherStatus: function () {
                        processing.push(() => (state.statusId = 4));
                        return this;
                    },
                    wasIncomingAtTheMomentOfChannelChanging: function () {
                        newChannelProcessing.push(newChannel => {
                            newChannel.direction = 'incoming';
                        });
                        
                        return this;
                    },
                    wasIdleAtTheMomentOfChannelChanging: function () {
                        newChannelProcessing.push(newChannel => {
                            newChannel.state = 'idle';
                        });
                        
                        return this;
                    },
                    wasInProgressAtTheMomentOfChannelChanging: function () {
                        newChannelProcessing.push(newChannel => {
                            newChannel.state = 'progress';
                        });
                        
                        return this;
                    },
                    currentChannelIsSecond: function () {
                        this.twoChannels();
                        state.currentChannel = 2;
                        return this;
                    },
                    changedChannelToSecond: function () {
                        this.currentChannelIsSecond();
                        changedChannel(2, 1);
                        return this;
                    },
                    changedChannelToFirst: function () {
                        this.twoChannels();
                        changedChannel(1, 2);
                        state.currentChannel = 1;
                        return this;
                    },
                    secondChannel: function () {
                        this.twoChannels();
                        channel = '2';
                        return this;
                    },
                    twoChannels: function () {
                        updateChannel(1);
                        updateChannel(2);

                        state.channelsCount = 2;
                        maybeRemoveSecondChannel = function () {};

                        if (!state.channels['2']) {
                            return this;
                        }

                        return this;
                    },
                    oneChannel: function () {
                        updateChannel(1);

                        state.channelsCount = 1;
                        maybeRemoveSecondChannel = function () {};

                        return this;
                    },
                    softphoneServerConnected: function () {
                        state.softphoneServerConnected = true;
                        return this;
                    },
                    webRTCServerConnected: function () {
                        state.disabled = false;
                        state.webRTCServerConnected = true;
                        return this;
                    },
                    microphoneAccessGranted: function () {
                        state.microphoneAccessGranted = true;
                        return this;
                    },
                    registered: function () {
                        state.registered = true;
                        return this;
                    },
                    enabled: function () {
                        state.disabled = false;
                        return this;
                    },
                    available: function () {
                        state.softphoneServerConnected = true;
                        this.userDataFetched();
                        this.webRTCServerConnected();
                        state.microphoneAccessGranted = true;
                        state.registered = true;
                        return this;
                    },
                    ended: function() {
                        me.enabled();
                        updateChannel(channel);
                        state.channels[channel].endedNormally = true; 
                        return this;
                    },
                    failed: function() {
                        me.enabled();
                        updateChannel(channel);
                        state.channels[channel].endedNormally = false; 
                        return this;
                    },
                    muted: function () {
                        updateChannel(channel);
                        state.channels[channel].muted = true; 
                        return this;
                    },
                    holded: function () {
                        updateChannel(channel);
                        state.channels[channel].holdButtonPressed = true; 
                        return this;
                    },
                    incoming: function () {
                        updateChannel(channel);
                        state.channels[channel].direction = 'incoming';
                        return this;
                    },
                    startsWithEight: function () {
                        processing.push(function () {
                            updateChannel(channel);
                            state.channels[channel].phoneNumber = '8' + state.channels[channel].phoneNumber.substr(1);
                        });

                        return this;
                    },
                    shortPhoneNumber: function () {
                        updateChannel(channel);
                        phoneNumbers[channel] = '79161';
                        return this;
                    },
                    shortPhone: function () {
                        return this.shortPhoneNumber();
                    },
                    anotherShortPhoneNumber: function () {
                        updateChannel(channel);
                        phoneNumbers[channel] = '295';
                        return this;
                    },
                    anotherShortPhone: function () {
                        return this.anotherShortPhoneNumber();
                    },
                    anotherPhoneNumber: function () {
                        updateChannel(channel);
                        phoneNumbers[channel] = '79161234569';
                        return this;
                    },
                    anotherPhone: function () {
                        return this.anotherPhoneNumber();
                    },
                    sixthPhoneNumber: function () {
                        updateChannel(channel);
                        phoneNumbers[channel] = '79162729533';
                        return this;
                    },
                    seventhPhone: function () {
                        updateChannel(channel);
                        phoneNumbers[channel] = '79161234567g';
                        return this;
                    },
                    fifthPhoneNumber: function () {
                        updateChannel(channel);
                        phoneNumbers[channel] = '79161234510';
                        return this;
                    },
                    fourthPhoneNumber: function () {
                        updateChannel(channel);
                        phoneNumbers[channel] = '74999951240';
                        return this;
                    },
                    fourthPhone: function () {
                        return this.fourthPhoneNumber();
                    },
                    thirdPhoneNumber: function () {
                        updateChannel(channel);
                        phoneNumbers[channel] = '74950230625';
                        return this;
                    },
                    thirdPhone: function () {
                        return this.thirdPhoneNumber();
                    },
                    intercept: function () {
                        updateChannel(channel);
                        phoneNumbers[channel] = '88';
                        return this;
                    },
                    sending: function () {
                        updateChannel(channel);
                        state.channels[channel].state = 'sending';
                        phoneNumber();
                        return this;
                    },
                    progress: function () {
                        updateChannel(channel);
                        state.channels[channel].state = 'progress';
                        phoneNumber();
                        return this;
                    },
                    confirmed: function () {
                        updateChannel(channel);
                        state.channels[channel].state = 'confirmed';
                        phoneNumber();
                        return this;
                    },
                    microphoneAccessDenied: function () {
                        state.error = 'microphoneAccessDenied';

                        postprocessing.push(function () {
                            state.microphoneAccessGranted = false;
                        });

                        return this;
                    },
                    registrationFailed: function () {
                        state.error = 'registrationFailed';
                        state.destroyed = true;
                        return this;
                    },
                    appAlreadyOpened: function () {
                        state.error = 'appAlreadyOpened';
                        state.destroyed = true;
                        return this;
                    },
                    disabled: function () {
                        state.disabled = true;
                        return this;
                    },
                    destroyed: function () {
                        state.destroyed = true;
                        return this;
                    },
                    hidden: function () {
                        state.visible = false;
                        return this;
                    },
                    expectToBeSent: function () {
                        nextMessage().expectToContain(createNotification(function () {}));
                    },
                    receive: function () {
                        receiveMessage(createNotification(function () {
                            Object.entries(state.channels || {}).forEach(function (args) {
                                var key = args[0],
                                    value = args[1];

                                if (!value) {
                                    return;
                                }

                                value.state != 'idle' &&
                                    (state.channels[key].sessionId = sessionIds[key]);
                            });
                        }));

                        Promise.runAll(false, true);
                        spendTime(0);
                        spendTime(0);
                    }
                });

                return me;
            };

            this.masterInfoMessage = () => {
                let receive = () => {
                    wasMaster === false && receiveLeaderDeath();

                    Promise.runAll(false, true);

                    applyLeader();

                    spendTime(1000);
                    Promise.runAll(false, true);

                    applyLeader();   

                    spendTime(1000);
                    Promise.runAll(false, true);

                    wasMaster = true;
                };

                const receiveTellIsLeader = () => {
                    receiveMessage({
                        type: 'internal',
                        data: {
                            context: 'leader',
                            action: 'tell',
                            token: 'g28g2hor28'
                        }
                    });

                    Promise.runAll(false, true);
                    wasMaster = false;
                };

                return {
                    leaderDeath: () => ({
                        receive: receiveLeaderDeath,
                        expectToBeSent: () => {
                            wasMaster = false;

                            nextMessage().expectToBeSentToChannel('crosstab').expectToContain({
                                type: 'internal',
                                data: {
                                    context: 'leader',
                                    action: 'death'
                                }
                            });
                        } 
                    }),
                    applyLeader: () => ({
                        expectToBeSent: () => {
                            applyLeader();

                            return {
                                waitForSecond: () => {
                                    spendTime(1000);
                                    spendTime(0);
                                },
                            };
                        },
                        receive: () => {
                            const message = applyMessage();
                            message.data.token = 'i9js2l68w8';

                            receiveMessage(message);
                            Promise.runAll(false, true);
                        }
                    }),
                    tellIsLeader: () => ({
                        expectToBeSent: tellIsLeader,
                        receive: receiveTellIsLeader
                    }),
                    hasNotMaster: () => null,
                    isNotMaster() {
                        receive = () => {
                            if (!wasMaster) {
                                applyLeader();
                            }

                            receiveTellIsLeader();
                        };

                        return this;
                    },
                    receive: () => receive()
                };
            };

            this.othersNotification = function () {
                var data = {},
                    maybeProcessData = function () {},
                    settingsUpdatingProcessing = [],
                    processors = [];

                function createNotification () {
                    maybeProcessData();
                    processors.forEach(process => process(data));

                    return {
                        type: 'notify_others',
                        data
                    };
                }

                function addMethods (me) {
                    me.expectToBeSent = function () {
                        const notification = createNotification();

                        Object.entries(notification).forEach(([key, value]) =>
                            !Object.keys(value).length && (notification[key] = utils.expectEmptyObject()));

                        nextMessage().expectToContain(createCustomMessage(notification));
                    };

                    me.receive = function () {
                        receiveCustomMessage(createNotification());
                        spendTime(0);
                        spendTime(0);
                        spendTime(0);
                    };

                    return me;
                }

                var me = addMethods(extendOthersNotification({
                    anotherNumberCapacity: function () {
                        processors.push(() => {
                            data.params.numb = '79161238929';
                            data.params.number_capacity_id = 124825;
                            data.params.number_capacity_comment = 'Некий номер';
                        });

                        return this;
                    },
                    undefinedOpeningWidgetOnCallSetting: function () {
                        processors.push(() => delete(data.params.is_need_open_widget_on_call));
                        return this;
                    },
                    undefinedClosingWidgetOnCallFinishedSetting: function () {
                        processors.push(() => delete(data.params.is_need_close_widget_on_call_finished));
                        return this;
                    },
                    autoChangeSipNumberCapacityBeforeCall: function () {
                        processors.push(() => (data.params.is_need_auto_change_sip_number_capacity_before_call = true));
                        return this;
                    },
                    noAutoChangeSipNumberCapacityBeforeCall: function () {
                        processors.push(() => (
                            data.params.is_need_auto_change_sip_number_capacity_before_call = false
                        ));

                        return this;
                    },
                    anotherCallCardShowDuration: function () {
                        processors.push(() => (data.params.call_task.call_card_show_duration = 104));
                        return this;
                    }, 
                    onlyOneSipLine: function () {
                        processors.push(() => (data.params.sip.sip_channels_count = 1));
                        return this;
                    },
                    numberCapacityUpdate: function () {
                        data.type = 'update_number_capacity';
                        data.value = 124825;
                        return this;
                    },
                    shouldCloseWidgetOnCallFinished: function () {
                        processors.push(() => (data.params.is_need_close_widget_on_call_finished = true));
                        return this;
                    },
                    closeWidgetOnCallFinished: function () {
                        processors.push(() => (data.params.is_need_close_widget_on_call_finished = true));
                        return this;
                    },
                    noSipHost: function () {
                        processors.push(() => (data.params.sip.sip_host = ''));
                        return this;
                    },
                    noTelephony: function () {
                        processors.push(() => {
                            Object.keys(data.params).forEach(key => ![
                                'ws_url',
                                'sip',
                                'application_version'
                            ].includes(key) && delete(data.params[key]));

                            ['sip_host', 'sip_login', 'sip_phone', 'sip_password'].forEach(key => (data.params.sip[key] = ''));
                        });

                        return this;
                    },
                    modalWindowHiding: function () {
                        data.type = 'action_invocation';
                        data.action = 'hide_modal_window';
                        return this;
                    },
                    sipPhoneSpecified: function () {
                        processors.push(() => (data.params.sip.sip_phone = '076909'));
                        return this;
                    },
                    sixthSetOfSipCredentials: function () {
                        processors.push(() => (data.params.sip = {
                            engine: 'janus_webrtc',
                            sip_channels_count: 2,
                            webrtc_urls: ['wss://rtu-webrtc.uiscom.ru'],
                            sip_phone: '076909',
                            sip_host: 'pp-rtu.uis.st:443',
                            sip_login: 'Kf98Bzv3',
                            sip_password: 'e2tcXhxbfr',
                            ice_servers: [{
                                urls: ['stun:stun.uiscom.ru:19302'],
                            }],
                        }));

                        return this;
                    },
                    fifthSetOfSipCredentials: function () {
                        processors.push(() => (data.params.sip.engine = 'janus_webrtc'));

                        processors.push(() => (data.params.sip.webrtc_urls = [{
                            url: 'wss://pp-janus-1.uiscom.ru:8989',
                            weight: 1,
                        }, {
                            url: 'wss://pp-janus-2.uiscom.ru:8989',
                            weight: 0,
                        }]));
                        
                        return this;
                    },
                    fourthSetOfSipCredentials: function () {
                        processors.push(() => (data.params.sip.engine = 'janus_webrtc'));

                        processors.push(() => (data.params.sip.webrtc_urls = [
                            'wss://pp-janus-1.uiscom.ru:8989',
                            'wss://pp-janus-2.uiscom.ru:8989'
                        ]));

                        return this;
                    },
                    thirdSetOfSipCredentials: function () {
                        processors.push(() => (data.params.sip.engine = 'rtu_webrtc'));
                        processors.push(() => (data.params.sip.webrtc_urls = ['wss://rtu-webrtc.uiscom.ru']));
                        processors.push(() => (data.params.sip.sip_phone = '076909'));
                        processors.push(() => (data.params.sip.sip_host = 'pp-rtu.uis.st:443'));
                        processors.push(() => (data.params.sip.sip_login = 'Kf98Bzv3'));
                        processors.push(() => (data.params.sip.sip_password = 'e2tcXhxbfr'));
                        return this;
                    },
                    anotherSipCredentials: function () {
                        processors.push(() => (data.params.sip.sip_login = '093820'));
                        processors.push(() => (data.params.sip.sip_password = 'Fx223sxBfr'));
                        return this;
                    },
                    onLogoutStatusSpecified: function () {
                        processors.push(() => (data.params.on_logout_status_id = 3));
                        return this;
                    },
                    dontDisturbOnLogout: function () {
                        return this.onLogoutStatusSpecified();
                    },
                    onLoginStatusSpecified: function () {
                        processors.push(() => (data.params.on_login_status_id = 2));
                        return this;
                    },
                    pauseOnLogin: function () {
                        return this.onLoginStatusSpecified();
                    },
                    isNeedAutoSetStatus: function () {
                        processors.push(() => (data.params.is_need_auto_set_status = true));
                        return this;
                    },
                    autoSetStatus: function () {
                        return this.isNeedAutoSetStatus();
                    },
                    isNotUsingWidgetForCalls: function () {
                        processors.push(() => (data.params.is_use_widget_for_calls = false));
                        return this;
                    },
                    isNotUseWidgetForCalls: function () {
                        return this.isNotUsingWidgetForCalls();
                    },
                    notUsingWidgetForCalls: function () {
                        return this.isNotUsingWidgetForCalls();
                    },
                    fixedNumberCapacityRule: function () {
                        processors.push(() => (data.params.number_capacity_usage_rule = 'fixed'));
                        return this;
                    },
                    isNeedHideNumbers: function () {
                        processors.push(() => (data.params.is_need_hide_numbers = true));
                        return this;
                    },
                    hideNumbers: function () {
                        return this.isNeedHideNumbers();
                    },
                    shouldNotOpenWidgetOnCall: function () {
                        processors.push(() => (data.params.is_need_open_widget_on_call = false));
                        return this;
                    },
                    janus: function () {
                        processors.push(() => (data.params.sip.engine = 'janus_webrtc'));
                        return this;
                    },
                    anotherWsUrl: function () {
                        processors.push(() => (
                            data.params.ws_url = 'wss://softphone-events-server.com/sup/ws/' +
                            'XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0'
                        ));
                        
                        return this;
                    },
                    widgetStateUpdate: function () {
                        data.type = 'update_widget_state';

                        var settings = softphoneTester.getApplicationSpecificSettings();

                        settings.sip = {
                            webrtc_urls: Array.isArray(webRtcUrl) ? webRtcUrl : [webRtcUrl],
                            sip_login: settings.sip_login,
                            sip_host: settings.sip_host,
                            ice_servers: settings.ice_servers,
                            sip_password: settings.sip_password,
                            sip_phone: settings.sip_phone || '',
                            sip_channels_count: settings.sip_channels_count,
                        };

                        delete(settings.rtu_sip_host);
                        delete(settings.rtu_webrtc_urls);
                        delete(settings.webrtc_url);
                        delete(settings.webrtc_urls);
                        delete(settings.sip_host);
                        delete(settings.ice_servers);
                        delete(settings.sip_password);
                        delete(settings.sip_phone);
                        delete(settings.sip_channels_count);
                        delete(settings.sip_login);
                        delete(settings.application_version);
                        delete(settings.numb);

                        data.params = settings;
                        return this;
                    },
                    updateSettings: function () {
                        var settings = {
                            ringtone: {},
                            microphone: undefined,
                            remoteStreamVolume: undefined,
                            holdMusic: undefined,
                            outputDeviceId: undefined,
                            shouldPlayCallEndingSignal: undefined
                        };
                        
                        function setRingtone () {
                            !settings.ringtone && (settings.ringtone = {
                                volume: undefined,
                                deviceId: undefined,
                                url: undefined
                            });
                        };

                        function setMicrophone () {
                            settings.microphone = {
                                volume: undefined,
                                deviceId: undefined
                            };
                        }

                        function setHoldMusic () {
                            settings.holdMusic = {
                                volume: undefined,
                                url: undefined
                            };
                        }

                        data.action = 'updateSettings';
                        data.settings = settings;

                        maybeProcessData = function () {
                            settingsUpdatingProcessing.forEach(function (process) {
                                process(settings);
                            });
                        };
                        return addMethods({
                            defaultRingtone: function () {
                                settings.ringtone = {};
                                return this;
                            },
                            customRingtone: function () {
                                setRingtone();
                                settings.ringtone.url = 'https://somehost.com/softphone_ringtone3.mp3';
                                return this;
                            },
                            anotherCustomRingtone: function () {
                                setRingtone();
                                settings.ringtone.url = 'https://somehost.com/softphone_ringtone2.mp3';
                                return this;
                            },
                            shouldPlayCallEndingSignal: function () {
                                settings.shouldPlayCallEndingSignal = true;
                                return this;
                            },
                            shouldNotPlayCallEndingSignal: function () {
                                settings.shouldPlayCallEndingSignal = false;
                                return this;
                            },
                            noOutputDevice: function () {
                                setRingtone();
                                settings.outputDeviceId = null;
                                return this;
                            },
                            noMicrophoneDevice: function () {
                                setMicrophone();
                                settings.microphone.deviceId = null;
                                return this;
                            },
                            noRingtoneDevice: function () {
                                setRingtone();
                                settings.ringtone.deviceId = null;
                                return this;
                            },
                            incomingRingtone: function () {
                                setRingtone();
                                settings.ringtone.url = 'https://somehost.com/softphone_ringtone2.mp3';
                                return this;
                            },
                            noIncomingRingtone: function () {
                                setRingtone();
                                settings.ringtone.url = '';
                                return this;
                            },
                            anotherRingtoneDevice: function () {
                                setRingtone();
                                settings.ringtone.deviceId =
                                    '6943f509802439f2c170bea3f42991df56faee134b25b3a2f2a13f0fad6943ab';

                                return this;
                            },
                            ringtoneDevice: function () {
                                setRingtone();
                                settings.ringtone.deviceId =
                                    'g8294gjg29guslg82pgj2og8ogjwog8u29gj0pagulo48g92gj28ogtjog82jgab';

                                return this;
                            },
                            holdMusic: function () {
                                setHoldMusic();
                                settings.holdMusic.url = 'https://somehost.com/hold_music.mp3';
                                return this;
                            },
                            noHoldMusic: function () {
                                setHoldMusic();
                                settings.holdMusic.url = '';
                                return this;
                            },
                            defaultHoldMusicVolume: function () {
                                setHoldMusic();
                                settings.holdMusic.volume = 100;
                                return this;
                            },
                            defaultMicrophoneVolume: function () {
                                setMicrophone();
                                settings.microphone.volume = 100;
                                return this;
                            },
                            defaultRingtoneVolume: function () {
                                setRingtone();
                                settings.ringtone.volume = 100;
                                return this;
                            },
                            holdMusicVolumeChanged: function () {
                                setHoldMusic();
                                settings.holdMusic.volume = 25;
                                return this;
                            },
                            microphoneVolumeChanged: function () {
                                setMicrophone();
                                settings.microphone.volume = 25;
                                return this;
                            },
                            ringtoneVolumeChanged: function () {
                                setRingtone();
                                settings.ringtone.volume = 25;
                                return this;
                            },
                            ringtoneMuted: function () {
                                setRingtone();
                                settings.ringtone.volume = 0;
                                return this;
                            },
                            microphoneDevice: function () {
                                setMicrophone();
                                settings.microphone.deviceId =
                                    '98g2j2pg9842gi2gh89hl48ogh2og82h9g724hg427gla8g2hg289hg9a48ghal4';

                                return this;
                            },
                            anotherOutputDevice: function () {
                                settings.outputDeviceId =
                                    'g8294gjg29guslg82pgj2og8ogjwog8u29gj0pagulo48g92gj28ogtjog82jgab';

                                return this;
                            },
                            outputDevice: function () {
                                settings.outputDeviceId =
                                    '6943f509802439f2c170bea3f42991df56faee134b25b3a2f2a13f0fad6943ab';

                                return this;
                            }
                        });
                    }
                }, data, processors));

                return me;
            };
        }

        this.feedbackMessage = function () {
            var response = {
                type: 'feedback',
                data: {
                    error: null
                }
            };

            return {
                failed: function () {
                    response.data.error = 'Error occured';
                    return this;
                },
                receive: function () {
                    me.eventsWebSocket.receiveMessage(response);
                },
                expectToBeSent: function () {
                    me.eventsWebSocket.expectSentMessageToContain({
                        type: 'feedback',
                        data: {
                            rating: 3,
                            comment: 'Что-то пошло не так.',
                            user: 'Стефка_Ганева',
                            file: {
                                options: {
                                    filename: 'logs_20200101.120423.000.zip',
                                    contentType: 'application/zip'
                                }
                            }
                        }
                    });
                }
            };
        };

        this.logAddingMessage = function () {
            var request = {
                type: 'add_log',
                data: {
                    chunk: utils.expectToHaveLength(524288),
                    count: 0 
                }
            };

            var response = {
                type: 'add_log',
                data: {
                    error: null
                }
            };

            return {
                secondChunk: function () {
                    request.data.count = 1;
                    request.data.chunk = 'uv';
                    return this;
                },
                failed: function () {
                    response.data.error = 'Error occured';
                    return this;
                },
                receive: function () {
                    me.eventsWebSocket.receiveMessage(response);
                },
                expectToBeSent: function () {
                    me.eventsWebSocket.expectSentMessageToContain(request);
                }
            };
        };

        this.numberCapacityChangedEvent = function () {
            const message = {
                type: 'event',
                name: 'number_capacity_changed',
                params: {
                    action: 'update',
                    data: [{
                        data: {
                            number_capacity_comment: 'Другой комментарий'
                        },
                        employee_id: 20816
                    }, {
                        data: {
                            number_capacity_comment: 'Совсем другой комментарий'
                        },
                        app_id: 1868,
                        employee_id: 21514
                    }]
                }
            };

            return {
                slavesNotification: function () {
                    return {
                        expectToBeSent: function () {
                            me.nextCrosstabMessage().expectToContain({
                                type: 'message',
                                data: {
                                    type: 'notify_slaves',
                                    data: {
                                        type: 'websocket_message',
                                        message
                                    }
                                }
                            });
                        }
                    };
                },
                receive: function () {
                    eventsWebSocket.receiveMessage(message);
                    spendTime(0);
                }
            };
        };

        this.employeeChangedEvent = function () {
            const data = {
                id: 20816
            };

            const message = {
                type: 'event',
                name: 'employee_changed',
                params: {
                    action: 'update',
                    data: [data]
                }
            };

            return {
                wrongStructure: function () {
                    message.params.data = data;
                    return this;
                },
                isSipOnline: function () {
                    data.is_sip_online = true;
                    return this;
                },
                thirdEmployee: function () {
                    data.id = 583783;
                    return this;
                },
                isAnotherEmployee: function () {
                    data.id = 1762;
                    return this;
                },
                secondStatus: function() {
                    data.status_id = 4;
                    return this;
                },
                anotherStatus: function() {
                    data.status_id = 2;
                    return this;
                },
                isNeedHideNumbers: function () {
                    data.is_need_hide_numbers = true;
                    return this;
                },
                isNotNeedHideNumbers: function () {
                    data.is_need_hide_numbers = false;
                    return this;
                },
                slavesNotification: function () {
                    return {
                        expectToBeSent: function () {
                            me.nextCrosstabMessage().expectToContain({
                                type: 'message',
                                data: {
                                    type: 'notify_slaves',
                                    data: {
                                        type: 'websocket_message',
                                        message
                                    }
                                }
                            });
                        }
                    };
                },
                receive: function () {
                    eventsWebSocket.receiveMessage(message);
                    spendTime(0);
                }
            };
        };

        this.settingsChangedMessage = function () {
            const data = {};

            const message = {
                name: 'settings_changed',
                params: {data}
            };

            return {
                anotherComment: function () {
                    data.number_capacity_comment = 'Другой комментарий';
                    return this;
                },
                sofphoneIsTurnedOff: function () {
                    data.is_use_widget_for_calls = false;
                    return this;
                },
                slavesNotification: function () {
                    return {
                        expectToBeSent: function () {
                            me.nextCrosstabMessage().expectToContain({
                                type: 'message',
                                data: {
                                    type: 'notify_slaves',
                                    data: {
                                        type: 'websocket_message',
                                        message
                                    }
                                }
                            });
                        }
                    };
                },
                receive: function () {
                    me.eventsWebSocket.receiveMessage(message);
                    spendTime(0);
                }
            };
        };
    };
});
