define(() => function ({
    testersFactory,
    utils,
    triggerResize,
    ajax,
    debug,
    fetch,
    spendTime,
    softphoneTester: me,
    isAlreadyAuthenticated = false,
    appName = '',
    platform = 'windows',
    webSockets,
    path = '/',
    intersectionObservable,
    image,
    softphoneHost,
    hasSSOAuth,
    shouldShowNewSoftphone,
    windowId = '',
}) {
    let history,
        eventBus,
        chatsRootStore,
        notification,
        Modal;

    window.getUUID = () => uuid;
    me.setUuid = value => (uuid = value);

    me.setAnotherUuid = () => me.setUuid('8s824gl2-82nb-xo3x-28bx-8h2jkxacx8e5');
    me.setUuid('5314f800-0f23-425d-bf20-683f0d149675');

    const mainTester = me;
    me.oauthToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6InBqeWNOMndxTkotbU1mcVpRSllIdHAtMGw0Uk1XNVNkUUF3N2JITmhjc00iLCJ0eXAiOiJKV1QifQ.eyJqdGkiOiI4NjZhZTFkZC02M2E2LTRhMTItOGVkZC1hODcyMmUwNjhlODAiLCJzaWQiOiJmYjZhYWJkMC05YjIzLTQzNDAtYjFkNC1hYTk4ZTIxYjAxYzciLCJpc3MiOiJodHRwczovL3Byb2QtbXNrLXVjLXNzby1hcGkubm92b2Zvbi5ydSIsImF1ZCI6WyJodHRwczovL3Byb2QtbXNrLWRhdGFhcGktanNvbnJwYy5ub3ZvZm9uLnJ1IiwiaHR0cHM6Ly9ucG9pZGtjZmZkZ2xrZm1qYm1waGhrb2JjY2FpY2JlaC5jaHJvbWl1bWFwcC5vcmciLCJodHRwczovL3Byb2QtbXNrLXNvZnRwaG9uZS1yZXN0LWFwaS5ub3ZvZm9uLnJ1Il0sInN1YiI6IkNvbWFnaWNEQnxub3ZvZm9ufDEwNnw0NTEiLCJzdWJkIjp7ImFwcF9pZCI6MTA2LCJjdXN0b21lcl9pZCI6Mjg5MTU2NCwidXNlcl9pZCI6NDUxLCJsb2dpbiI6ImJpdHJpeHRlc3QiLCJpc19zeXN0ZW0iOmZhbHNlfSwiY2xpZW50X2lkIjoiaHR0cHM6Ly9ucG9pZGtjZmZkZ2xrZm1qYm1waGhrb2JjY2FpY2JlaC5jaHJvbWl1bWFwcC5vcmciLCJpYXQiOjE3MDk2Mzg2MzR9.G3Irx8UHLLv1mGSnx_fpE-wZoaQud1Jh7hJQrg_17v1eKFQrrzBYD4s_PMUe_bso90c9ooWLudXMHuRrAfQzrJasaEFIkEtalKbnNAxwRac_sWdAUfr5-sxiUcJPPEkUWWxqD3fAAvuo-8lANps89W0f3DN_8WJ7lXUqEwZT8bftOOGcAthbkXKnVyzRUNJfkFnK3jV7qa6uwIbYOd0sJAXpc-rDyG_kWfnwZv-NYZinIHgk92kRT-tOiSnX6HAOKDQ3QbtKOCT-uJqAd78RKMjFcMAbbFRrQBr1q3s9OUJCArYi6wQcHkhiMuT0mXAPK-eAnaiKFfuuT9r1S0tPCKnnnyK6mUQo_K11Ne3kW1xShVYEhK7wtTn-BnJORF-Y0KHLI3Ndp6Jjs7Ak7nbQRztJ64buBpksI0PAKRc9euWdc04HmHxftCCgZ9uc2YjL77sqr_ExzJsMNJDNwEDrFsmMIHhpNvA19P1zuDaiCr2zja1HQEE3vyLr-JAjlYdCTOZkJ5dqRFAmCWBQ-12JJbRihB1kPyhrpbKcWg7Ry1RV47ghbgQ6igv-1BCelu9LT5IvSXLnhNxPLTdi17ukKFdS5V5XugryqFgDujSJiBCWLGAZ1mzT08BVK4yIeSo5GQhs8oNReNDmnDo33tfTzzpFDbQxHwHQAUG1oXYvuEI';

    const jwtToken = {
        jwt: 'XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0',
        refresh: '2982h24972hls8872t2hr7w8h24lg72ihs7385sdihg2'
    };

    const anotherJwtToken = {
        jwt: '935jhw5klatxx2582jh5zrlq38hglq43o9jlrg8j3lqj8jf',
        refresh: '4g8lg282lr8jl2f2l3wwhlqg34oghgh2lo8gl48al4goj48'
    };

    const thirdJwtToken = {
        jwt: '2924lg8hg95gl8h3g2lg8o2hgg8shg8olg8qg48ogih7h29',
        refresh: '29onc84u2n9u2nlt39g823hglohglhg2o4l8gh2lf2hoj48'
    };

    !window.process && (window.process = {});
    !window.process.versions && (window.process.versions = {});
    !window.process.versions.electron && (window.process.versions.electron = appName ? '1.0.0' : null);
    window.process.argv = windowId ? [`--window-id=${windowId}`] : [];

    isAlreadyAuthenticated && (appName ? localStorage.setItem('electronCookies', JSON.stringify({
        '$REACT_APP_AUTH_COOKIE': JSON.stringify(jwtToken)
    })) : (
        document.cookie =
        '%5C%24REACT_APP_AUTH_COOKIE=%7B%22' +
        'jwt%22%3A%22XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0%22%2C%22' +
        'refresh%22%3A%222982h24972hls8872t2hr7w8h24lg72ihs7385sdihg2%22%7D; ' +
        'path=/; secure; domain=0.1; expires=Sat, 20 Nov 2021 12:15:07 GMT'
    ));

    me.changeAuthTokenCookie = () => (
        document.cookie =
        '%5C%24REACT_APP_AUTH_COOKIE=%7B%22' +
        `jwt%22%3A%22${thirdJwtToken.jwt}%22%2C%22` +
        `refresh%22%3A%22${thirdJwtToken.refresh}%22%7D; ` +
        'path=/; secure; domain=0.1; expires=Sat, 20 Nov 2021 12:15:07 GMT'
    );

    me.setAnotherAuthTokenCookie = () => (
        document.cookie =
        '%5C%24REACT_APP_AUTH_COOKIE=%7B%22' +
        `jwt%22%3A%22${anotherJwtToken.jwt}%22%2C%22` +
        `refresh%22%3A%22${anotherJwtToken.refresh}%22%7D; ` +
        'path=/; secure; domain=0.1; expires=Sat, 20 Nov 2021 12:15:07 GMT'
    );

    window.resetElectronCookiesManager?.();

    window.rootConfig = { appName, platform };
    window.broadcastChannelCache = {};
    window.employeesStore = null;
    window.softphoneStore = null;
    window.chatsStore = null;
    window.contactStore = null;
    window.softphoneBroadcastChannelCache = {};
    window.hasSSOAuth = hasSSOAuth || false;

    me.getUserAgent = softphoneType => 'comagic Softphone ' + softphoneType;

    me.ReactDOM = {
        flushSync: () => null
    };

    window.application.run({
        setReactDOM: value => (me.ReactDOM = value),
        setEventBus: eventBus => {
            const events = {};

            const notIgnoredEvents = {
                end_prompter_call: true,
                settings_fetched: true,
                await_prompter_call: true,
                call_start: true,
                call_end: true,
            };

            eventBus.subscribe = (eventName, callback) => {
                const callbacks = events[eventName] || (events[eventName] = new Set());
                callbacks.add(callback);

                return () => callbacks.delete(callback);
            };

            const broadcast = (eventName, ...args) =>
                (events[eventName] || new Set()).forEach(callback => callback(...args));

            const stack = new JsTester_Stack({
                expectNotToExist: () => null,
                expectToHaveArguments: (...expectedArguments) => {
                    throw new Error(
                        `Событие должно быть вызывано с такими аргументами ${JSON.stringify(expectedArguments)}, ` +
                        'тогда как никакое событие не было вызвано.'
                    );
                },
                expectEventNameToEqual: expectedEventName => {
                    throw new Error(
                        `Должно быть вызывано событие "${expectedEventName}", тогда как никакое событие не было ` +
                        `вызвано.`
                    );
                }
            });

            eventBus.broadcast = (actualEventName, ...args) => {
                const callStack = debug.getCallStack();

                const event = {
                    expectToHaveArguments: (...expectedArguments) =>
                        (utils.expectObjectToContain(args, expectedArguments), event),
                    expectNotToExist: () => {
                        throw new Error(
                            `Никакое событие не должно быть вызвано, тогда как было вызвано событие ` +
                            `"${actualEventName}" с аргументами ${JSON.stringify(args)}\n\n${callStack}`
                        );
                    },
                    expectEventNameToEqual: expectedEventName => {
                        if (expectedEventName != actualEventName) {
                            throw new Error(
                                `Должно быть вызывано событие "${expectedEventName}", тогда как было вызвано событие ` +
                                `"${actualEventName}".\n\n${callStack}`
                            );
                        }

                        return event;
                    }
                };

                notIgnoredEvents[actualEventName] && stack.add(event);
                broadcast(actualEventName, ...args);
            };

            me.eventBus = {
                broadcast,
                nextEvent: () => stack.pop(),
                ignoreEvent: eventName => (ignoredEvents[eventName] = true),
                assumeSomeMessageMayBeSent: () => stack.removeAll()
            };
        },
        setHistory: value => (history = value),
        setChatsRootStore: value => (chatsRootStore = value),
        setNotification: value => (notification = value),
        setModal: value => (Modal = value),
        appName,
        shouldShowNewSoftphone,
    });

    notification?.destroyAll();
    Modal?.destroyAll();

    Array.prototype.forEach.call(
        document.querySelectorAll('.ui-modal, .cmgui-modal'),
        modal => modal.parentNode.getAttribute('data-key') && modal.parentNode.remove()
    );

    Array.prototype.forEach.call(
        document.querySelectorAll('a'),
        domElement => domElement.getAttribute('data-role') == 'file-saver' && domElement.remove()
    );

    me.history = (() => {
        return {
            push: path => {
                history?.push(path);
                spendTime(0);
                spendTime(0);
            },
            expectToHavePathName(expectedPathName) {
                const actualPathName = history.location.pathname;

                if (expectedPathName != actualPathName) {
                    throw new Error(
                        `В адресной строке должен быть путь "${expectedPathName}", а не "${actualPathName}".`
                    );
                }
            }
        };
    })();

    history?.replace(path);

    Promise.runAll(false, true);
    spendTime(0);
    Promise.runAll(false, true);
    spendTime(0);
    Promise.runAll(false, true);

    me.ReactDOM.flushSync();
    spendTime(0);
    spendTime(0);

    me.notificationsList = (() => {
        const getDrawerAncestor = domElement => domElement && domElement.closest('.ui-drawer-inner');

        const getDrawer = () => getDrawerAncestor(Array.prototype.find.call(
            document.querySelectorAll('.cm-chats--chat-notification'),
            getDrawerAncestor
        ));

        const tester = testersFactory.createDomElementTester(getDrawer);

        tester.notification = {
            withVisitorName: expectedName => {
                const getNotification = () => utils.descendantOf(getDrawer()).
                    matchesSelector('.cm-chats--visitor-name').
                    textEquals(expectedName).
                    find().
                    closest('.cm-chats--chat-notification');

                const notificationTester = testersFactory.createDomElementTester(getNotification);

                notificationTester.closeButton = testersFactory.createDomElementTester(
                    () => getNotification().querySelector('.cm-chats--close-button')
                );

                return notificationTester;
            },
        };

        return tester;
    })();

    me.callData = {
        section: title => ({
            title: me.callDataSectionTitle(title),
        }),
    };

    me.redirectEmployeeSelectCover = testersFactory.
        createDomElementTester('.cm-chats--redirect-employee-select-cover');

    me.chatsMenu = testersFactory.createDomElementTester('.cm-chats--chats-menu');
    me.callStatsButton = me.createBottomButtonTester('.cmg-call-stats-button');
    me.chatsButton = me.createBottomButtonTester('.cmg-chats-button');
    me.callsHistoryButton = me.createBottomButtonTester('.cmg-calls-history-button');

    me.chatMessageSendingButton = (() => {
        const tester = testersFactory.createDomElementTester(
            () => utils.
                querySelector('.cmgui-icon[data-component=SendFilled20]').
                closest('.cmgui-button')
        );

        const click = tester.click.bind(tester);

        tester.click = () => (click(), spendTime(0));
        tester.expectToBeDisabled = () => tester.expectToHaveAttribute('disabled');
        tester.expectToBeEnabled = () => tester.expectNotToHaveAttribute('disabled');

        return tester;
    })();
    
    me.chatsVoiceRecorderButton = (() => {
        const tester = testersFactory.createDomElementTester('.cm-chats--voice-recorder--record-button');

        const putMouseOver = tester.putMouseOver.bind(tester);
        tester.putMouseOver = () => (putMouseOver(), spendTime(100), spendTime(0));

        tester.expectToBeDisabled = () => tester.expectToHaveAttribute('disabled');
        tester.expectToBeEnabled = () => tester.expectNotToHaveAttribute('disabled');

        return tester;
    })();

    const intersection = new Map();

    const runSpinWrapperIntersectionCallback = (domElement, shouldRunCallback = () => true) => {
        const list = domElement.closest(
            '.ui-tabs-content, ' +
            '.cm-chats--chats-list-container, ' +
            '.cm-chats--chat-panel-history'
        );

        if (!list) {
            return;
        }

        const isIntersecting = utils.isIntersecting(list, domElement),
            value = shouldRunCallback(isIntersecting);

        intersection.set(domElement, isIntersecting);
        value && intersectionObservable(domElement).runCallback([{ isIntersecting }]);
    };

    const maybeRunSpinWrapperIntersectionCallback = domElement => runSpinWrapperIntersectionCallback(
        domElement,
        isIntersecting => intersection.get(domElement) !== isIntersecting,
    );

    const getSpinWrappers = (getRootElement = () => document.body) => utils.element(getRootElement()).
        querySelectorAll(
            '.ui-infinite-scroll-spin-wrapper, ' +
            '.cmgui-infinite-scroll-spin-wrapper, ' +
            '.chats-list-spin-wrapper'
        );

    const getSpinWrapper = (getRootElement = () => document.body) => utils.element(getRootElement()).
        querySelector(
            '.ui-infinite-scroll-spin-wrapper, ' +
            '.cmgui-infinite-scroll-spin-wrapper, ' +
            '.cm-chats--chats-list-spin-wrapper'
        );

    const getContactListSpinWrapper = () => getSpinWrapper(() => utils.querySelector('.cm-contacts-list-wrapper')),
        getChatListSpinWrapper = () => getSpinWrapper(() => utils.querySelector('.cm-chats--chats-list'));

    const getContactCommunicationsSpinWrapper = () =>
        getSpinWrapper(() => utils.querySelector('.cm-chats--chat-panel-history'));

    const addTesters = (me, getRootElement) => {
        softphoneTester.addTesters(me, getRootElement);

        me.searchIcon = (() => {
            const tester = testersFactory.createDomElementTester(
                () => {
                    const button = utils.element(getRootElement()).
                        querySelector('.cmgui-icon[data-component=Search20]');

                    return button;
                } 
            );

            const click = tester.click.bind(tester);
            tester.click = () => (click(), spendTime(0));

            return tester;
        })();

        me.moreIcon = () => testersFactory.createDomElementTester(
            () => utils.element(getRootElement()).querySelector('.cmgui-icon[data-component=MoreVertical20]')
        );

        me.sourceIcon = (() => {
            const getIcons = () => utils.element(getRootElement()).querySelectorAll('.ui-icon-source-24');

            const tester = testersFactory.createDomElementTester(() => {
                const icons = getIcons();

                if (icons.length > 1) {
                    throw new Error('Найдено более одной иконки.');
                }

                return icons[0];
            });

            tester.atIndex = index => testersFactory.createDomElementTester(() => getIcons()[index]);
            tester.first = tester.atIndex(0);

            return tester;
        })();

        me.copyIcon = (() => {
            const tester = testersFactory.createDomElementTester(
                () => utils.element(getRootElement()).querySelector(
                    '.cmg-copy-icon, .cmgui-icon[data-component=Copy16]'
                )
            );

            const putMouseOver = tester.putMouseOver.bind(tester);
            tester.putMouseOver = () => (putMouseOver(), spendTime(100), spendTime(0));

            return tester;
        })();

        me.phone = (() => {
            const tester = testersFactory.createDomElementTester(
                () => utils.element(getRootElement()).querySelector(
                    '.misc-softphone-misc-sip_lib-src-new-softphone-call-data-styles-module__phone-number'
                )
            );

            return tester;
        })();

        me.chips = text => {
            const tester = testersFactory.createDomElementTester(
                () =>
                    utils.descendantOf(getRootElement()).
                        matchesSelector('.ui-chips').
                        textEquals(text).
                        find()
            );

            const click = tester.click.bind(tester);
            tester.click = () => (click(), spendTime(0), spendTime(0));

            const putMouseOver = tester.putMouseOver.bind(tester);
            tester.putMouseOver = () => (putMouseOver(), spendTime(100), spendTime(0));

            const selectedClass = 'ui-chips-selected';

            tester.expectToBeSelected = () => tester.expectToHaveClass(selectedClass);
            tester.expectNotToBeSelected = () => tester.expectNotToHaveClass(selectedClass);

            return tester;
        };

        me.labelHelp = (() => {
            const tester = testersFactory.createDomElementTester(
                () => getRootElement().querySelector('.ui-label-help, .cmgui-label-help')
            );

            const putMouseOver = tester.putMouseOver.bind(tester);
            tester.putMouseOver = () => (putMouseOver(), spendTime(100), spendTime(0));

            return tester;
        })();

        me.plusButton = (() => {
            const tester = testersFactory.createDomElementTester(
                () => getRootElement().querySelector('.cm-contacts-add-button')
            );

            const click = tester.click.bind(tester),
                putMouseOver = tester.putMouseOver.bind(tester);

            tester.click = () => (click(), spendTime(0), spendTime(0), spendTime(0));
            tester.putMouseOver = () => (putMouseOver(), spendTime(100), spendTime(0));

            tester.expectToBeEnabled = () => tester.expectNotToHaveClass('cm-contacts-add-button--disabled');
            tester.expectToBeDisabled = () => tester.expectToHaveClass('cm-contacts-add-button--disabled');

            return tester;
        })();

        me.messengerIcon = testersFactory.createDomElementTester(() =>
            utils.element(getRootElement()).querySelector('.cm-contacts-messenger-icon'));

        !me.tagField && Object.defineProperty(me, 'tagField', {
            set: () => null,
            get: () => {
                const getDomElement = () => {
                    const tagEditor = utils.element(getRootElement()).querySelector(
                        '.ui-tag-editor, ' +
                        '.cmgui-tag-editor'
                    );

                    return utils.isNonExisting(tagEditor) ?
                        utils.element(getRootElement()).querySelector('.cm-chats--additional-info-panel-tags-edit') :
                        tagEditor;
                };

                const tester = testersFactory.createDomElementTester(getDomElement);

                const containerTester = testersFactory.createDomElementTester(
                    () => utils.element(getDomElement()).
                        querySelector('.cm-chats--additional-info-panel-tags-container')
                );

                addTesters(tester, getDomElement);

                {
                    const getDomElement = () => utils.querySelector('.cm-chats--tags-editor'),
                        popup = testersFactory.createDomElementTester(getDomElement);

                    addTesters(popup, getDomElement);
                    tester.popup = popup;
                }

                tester.display = testersFactory.createDomElementTester(
                    () => utils.element(getDomElement()).querySelector(
                        '.ui-tag-editor-display, ' +
                        '.cmgui-tag-editor-display, ' +
                        '.cm-chats--additional-info-panel-tags-container'
                    )
                );

                {
                    const putMouseOver = tester.display.putMouseOver.bind(tester.display);
                    tester.display.putMouseOver = () => (putMouseOver(), spendTime(100), spendTime(0));
                }

                tester.button = (() => {
                    const tester = testersFactory.createDomElementTester(
                        () => utils.element(getDomElement()).
                            querySelector('.ui-icon, .cmgui-icon')
                    );

                    const click = tester.click.bind(tester);

                    tester.click = () => {
                        click();
                        spendTime(0);
                    };

                    return tester;
                })();

                tester.putMouseOver = () => (containerTester.putMouseOver(), spendTime(100), spendTime(0));
                return tester;
            }
        });

        me.collapsablePanel = title => {
            const getTitle = () => utils.descendantOf(getRootElement()).
                matchesSelector(
                    '.misc-chats-src-components-lib-form-collapsible2-styles-module__titleLarge'
                ).
                textEquals(title).
                find();

            const getPanel = () => getTitle().closest(
                '.misc-chats-src-components-lib-form-collapsible2-styles-module__container'
            ) || new JsTester_NoElement();
            
            const getContent = () => getPanel().querySelector(
                '.misc-chats-src-components-lib-form-collapsible2-styles-module__content'
            );

            const tester = testersFactory.createDomElementTester(getPanel);

            tester.title = (() => {
                const tester = testersFactory.createDomElementTester(getTitle),
                    click = tester.click.bind(tester);

                tester.click = () => (click(), spendTime(0));
                return tester;
            })();

            tester.content = addTesters(testersFactory.createDomElementTester(getContent), getContent);

            tester.content.row = title => {
                const getDomElement = () => utils.descendantOf(getContent()).
                    matchesSelector('.cm-chats--additional-info-panel-row-title').
                    textEquals(title).
                    find().
                    closest('.cm-chats--additional-info-panel-row') ;

                return addTesters(testersFactory.createDomElementTester(getDomElement), getDomElement);
            };

            return tester;
        };

        me.dropdownTrigger = (() => {
            const tester = testersFactory.createDomElementTester(() => utils.element(getRootElement()).
                querySelector('.ui-dropdown-trigger, .cmgui-dropdown-trigger'));

            const click = tester.click.bind(tester);
            tester.click = () => (click(), spendTime(0), spendTime(0));

            return tester;
        })();

        me.spinWrapper = (() => {
            const getDomElement = () => getSpinWrapper(getRootElement);

            function createTester (getDomElement) {
                const tester = testersFactory.createDomElementTester(getDomElement),
                    scrollIntoView = tester.scrollIntoView.bind(tester);

                intersectionObservable(getDomElement).onObserve(runSpinWrapperIntersectionCallback);

                tester.scrollIntoView = () => {
                    scrollIntoView();

                    maybeRunSpinWrapperIntersectionCallback(getDomElement());
                    spendTime(0);
                };

                return tester;
            }

            const tester = createTester(getDomElement);
            tester.atIndex = index => createTester(() => getSpinWrappers()[index]);

            return tester;
        })();

        me.userName = me.accountButton = (selector => {
            const getDomElement = () => utils.element(getRootElement()).querySelector(selector),
                tester = testersFactory.createDomElementTester(getDomElement);

            const putMouseOver = tester.putMouseOver.bind(tester);
            tester.putMouseOver = () => (putMouseOver(), spendTime(100), spendTime(100), spendTime(0), spendTime(0));

            tester.icon = testersFactory.createDomElementTester(
                () => getDomElement().querySelector('.ui-account-status-icon svg')
            );

            return softphoneTester.createBottomButtonTester(tester);
        })('.cm-user-only-account--username, .ui-account, .cmgui-account, .cm-chats--account');

        (() => {
            const selector =
                '.ui-spin-icon-default, ' +
                '.cmgui-spin-icon-default, ' +
                '.clct-spinner, ' +
                '.cm-chats--loading-icon';

            const getSpin = () => utils.element(getRootElement()).
                querySelector(selector);

            const getSpins = () => utils.element(getRootElement()).
                querySelectorAll(selector);

            me.spin = testersFactory.createDomElementTester(getSpin);
            me.spin.atIndex = index => testersFactory.createDomElementTester(() => getSpins()[index]);
        })();

        me.anchor = text => (() => {
            const tester = testersFactory.createAnchorTester(
                () => utils.descendantOf(getRootElement()).matchesSelector('a').textEquals(text).find()
            );

            const click = tester.click.bind(tester);
            tester.click = () => (click(), spendTime(0), spendTime(0));

            return tester;
        })();

        me.anchor.withFileName = fileName => testersFactory.createAnchorTester(
            () => getRootElement().querySelector('a[download="' + fileName + '"]')
        );

        (() => {
            const tester = testersFactory.createAnchorTester(() => utils.element(getRootElement()).querySelector('a'));
            Object.entries(tester).forEach(([methodName, method]) => {
                const bindedMethod = method.bind(tester);

                me.anchor[methodName] = methodName == 'click' ? () => {
                    bindedMethod();
                    spendTime(0);
                    spendTime(0);
                    spendTime(0);
                    spendTime(0);
                    spendTime(0);
                }: (methodName == 'putMouseOver' ? () => {
                    bindedMethod();
                    spendTime(100);
                    spendTime(0);
                } : bindedMethod);
            });
        })();

        me.link = (() => {
            const tester = testersFactory.createDomElementTester(() =>
                utils.element(getRootElement()).querySelector('.cmg-softphone-call-history-phone-link'));

            const click = tester.click.bind(tester);
            tester.click = () => (click(), spendTime(0), spendTime(0), spendTime(0));

            return tester;
        })();

        const getSvg = selector => {
            const tester = testersFactory.createAnchorTester(() =>
                utils.element(getRootElement()).querySelector(selector));

            const click = tester.click.bind(tester);

            tester.click = () => {
                click();
                spendTime(0);
                spendTime(10);
            };

            return tester;
        };

        me.audio = (() => {
            const getAudioElement = () => {
                const audioElement = getRootElement().querySelector('audio');

                if (!audioElement) {
                    throw new Error('Аудио-элемент должен существовать.');
                }

                return audioElement;
            };

            const me = {
                play: () => {
                    getAudioElement().dispatchEvent(new Event('play'));
                    spendTime(0);

                    return me;
                },
                time: value => {
                    const audioElement = getAudioElement(),
                        dispatchEvent = () => audioElement.dispatchEvent(new Event('timeupdate'));

                    Object.defineProperty(audioElement, 'currentTime', {
                        set: newValue => {
                            value = newValue;

                            dispatchEvent();
                            spendTime(0);
                        },
                        get: () => value
                    });

                    dispatchEvent();
                    spendTime(0);

                    return me;
                },
                duration: value => {
                    const audioElement = getAudioElement();

                    Object.defineProperty(audioElement, 'duration', {
                        set: () => null,
                        get: () => value
                    });

                    audioElement.dispatchEvent(new Event('durationchange'));
                    spendTime(0);

                    return me;
                }
            };

            return me;
        })();

        me.playIcon = getSvg('.play_svg__cmg-icon, .cm-chats--audio-player--main-button svg');
        me.downloadIcon = getSvg('.download_svg__cmg-icon, .cm-contacts-communications-download-button');
        me.svg = getSvg('svg');

        me.table = (() => {
            const getTable = () => utils.element(getRootElement()).querySelector('.ant-table, .ui-table, .cmgui-table'),
                tester = testersFactory.createDomElementTester(getTable);

            const getHeaderColumnIndex = text => {
                let i;
                const columns = document.querySelectorAll(
                    '.ant-table-thead th, ' +
                    '.ui-table-header-cell-th, ' +
                    '.cmgui-table-header-cell-th'
                );
                const {length} = columns;

                for (i = 0; i < length; i ++) {
                    const column = columns[i];

                    if (text == utils.getTextContent(column)) {
                        return i;
                    }
                }

                return -1;
            };

            tester.row = {
                atIndex: index => {
                    const getRow = () => (
                        getRootElement().querySelectorAll(
                            '.ant-table-row, ' +
                            '.ui-table-body-row, ' +
                            '.cmgui-table-body-row'
                        ) || []
                    )[index] || new JsTester_NoElement();

                    const tester = testersFactory.createDomElementTester(getRow);

                    tester.column = {
                        atIndex: index => {
                            const getColumn = () => (
                                getRow().querySelectorAll('td') || []
                            )[index] || new JsTester_NoElement();

                            const tester = testersFactory.createDomElementTester(getColumn);
                            addTesters(tester, getColumn);

                            return tester;
                        },

                    };

                    tester.column.withHeader = text => tester.column.atIndex(getHeaderColumnIndex(text))

                    tester.expander = testersFactory.createDomElementTester(() =>
                        getRow().querySelector('.ui-table-expand-button'));

                    const click = tester.expander.click.bind(tester.expander);
                    tester.expander.click = () => (click(), spendTime(0), spendTime(0));

                    const expandedClass = 'ui-table-expand-button-expanded';

                    tester.expander.expectToBeCollapsed = () => tester.expander.expectNotToHaveClass(expandedClass);
                    tester.expander.expectToBeExpanded = () => tester.expander.expectToHaveClass(expandedClass);

                    Object.defineProperty(tester.column, 'first', {
                        get: () => tester.column.atIndex(0)
                    });

                    return tester;
                } 
            };

            tester.row.first = tester.row.atIndex(0);

            Object.defineProperty(tester, 'pagingPanel', {
                get: () => {
                    const getPagingPanel = () => utils.element(getTable().closest(
                        '.ui-table-container, ' +
                        '.cmgui-table-container'
                    )).querySelector(
                        '.ui-pagination, ' +
                        '.cmgui-pagination'
                    );

                    const tester = testersFactory.createDomElementTester(getPagingPanel);

                    tester.pageButton = text => (() => {
                        const getLi = () => utils.
                            descendantOf(getPagingPanel()).
                            matchesSelector(
                                '.ui-pagination-btns-pages__item, ' +
                                '.cmgui-pagination-btns-pages__item'
                            ).
                            textEquals(text).
                            find();

                        const tester = testersFactory.createDomElementTester(getLi);

                        const anchorTester = testersFactory.createDomElementTester(() =>
                            utils.element(getLi()).querySelector('a'));

                        const click = anchorTester.click.bind(anchorTester);
                        tester.click = () => (click(), Promise.runAll(false, true));

                        tester.expectToBePressed = () => tester.
                            expectToHaveAnyOfClasses([
                                'ui-pagination-btns-pages__item--active',
                                'cmgui-pagination-btns-pages__item--active',
                            ]);

                        tester.expectNotToBePressed = () => tester.
                            expectToHaveNoneOfClasses([
                                'ui-pagination-btns-pages__item--active',
                                'cmgui-pagination-btns-pages__item--active',
                            ]);

                        return tester;
                    })();

                    return addTesters(tester, getPagingPanel);
                }
            });

            return tester;
        })();

        const rootTester = utils.element(getRootElement);
        
        me.calendarField = (() => {
            const getPopup = () => utils.querySelector(
                '.cm-calendar, ' +
                '.ui-date-range-picker-popover, ' +
                '.cmgui-date-range-picker-popover'
            );

            const popupTester = testersFactory.createDomElementTester(getPopup);

            const getPicker = () => rootTester.querySelector(
                '.ui-date-range-picker, ' +
                '.cmgui-date-range-picker, ' +
                '.cm-calendar__field'
            );

            const tester = testersFactory.createDomElementTester(getPicker),
                click = tester.click.bind(tester),
                inputTester = testersFactory.createTextFieldTester(() => getPicker().querySelector('input'));

            const getMonthPanel = index => {
                const getMonthPanel = () => 
                    getPopup().querySelectorAll(
                        '.cm-calendar__months__item, ' +
                        '.ui-date-range-picker-month, ' +
                        '.cmgui-date-range-picker-month'
                    )[index] || new JsTester_NoElement();

                const monthPanelTester = testersFactory.createDomElementTester(getMonthPanel);

                monthPanelTester.title = testersFactory.createDomElementTester(() =>
                    getMonthPanel().querySelector(
                        '.cm-calendar__months__item__title, ' +
                        '.ui-date-range-picker-header, ' +
                        '.cmgui-date-range-picker-header'
                    ));

                monthPanelTester.day = day => {
                    const tester = testersFactory.createDomElementTester(() => utils.
                        descendantOf(getMonthPanel()).
                        matchesSelector(
                            '.cm-calendar__days__item__text, ' +
                            '.ui-date-range-picker-cell-container, ' +
                            '.cmgui-date-range-picker-cell-container'
                        ).
                        textEquals(day + '').
                        find());

                    const click = tester.click.bind(tester);
                    tester.click = () => (click(), spendTime(0), spendTime(0));
                    
                    return tester;
                };

                return monthPanelTester;
            };

            popupTester.firstMonthPanel = getMonthPanel(0);
            popupTester.secondMonthPanel = getMonthPanel(1);
            popupTester.thirdMonthPanel = getMonthPanel(2);

            popupTester.leftButton = (() => {
                const tester = testersFactory.createDomElementTester(
                    () => getPopup().querySelector(
                        '.ui-date-range-picker-header-nav-icon-left, ' +
                        '.cmgui-date-range-picker-header-nav-icon-left'
                    )
                );

                const click = tester.click.bind(tester);
                tester.click = () => (click(), spendTime(0), spendTime(0));

                return tester;
            })();
            popupTester.rightButton = testersFactory.createDomElementTester(() =>
                getPopup().querySelector(
                    '.ui-date-range-picker-header-nav-icon-right, ' +
                    '.cmgui-date-range-picker-header-nav-icon-right'
                ));

            tester.expectToHaveValue = inputTester.expectToHaveValue.bind(inputTester);
            tester.click = () => (click(), spendTime(0), spendTime(0));

            Object.defineProperty(tester, 'popup', {
                get: function () {
                    return addTesters(popupTester, getPopup);
                }
            })

            return tester;
        })();

        !me.audioPlayer && Object.defineProperty(me, 'audioPlayer', {
            get: () => {
                const getPlayer = () => utils.element(getRootElement()).querySelector(
                    '.ui-audio-player, ' +
                    '.cmgui-audio-player'
                );

                const tester = testersFactory.createDomElementTester(getPlayer);

                addTesters(tester, getPlayer);

                const atIndex = tester.button.atIndex.bind(tester.button);

                tester.button.atIndex = index => {
                    const tester = atIndex(index),
                        putMouseOver = tester.putMouseOver.bind(tester);

                    tester.putMouseOver = () => {
                        putMouseOver();
                        spendTime(100);
                        spendTime(0);
                        return tester;
                    };

                    return tester;
                };

                return tester;
            }
        });

        me.stopCallButton = (() => {
            const tester = testersFactory.createDomElementTester(
                () => rootTester.querySelector('.cmg-call-button-stop')
            );

            const click = tester.click.bind(tester);
            tester.click = () => (click(), spendTime(0), spendTime(0));

            return tester;
        })();

        me.callStartingButton = (() => {
            const tester = testersFactory.createDomElementTester(
                () => rootTester.querySelector('.cmg-call-button-start, .cmgui-icon[data-component=Call20]')
            );

            const click = tester.click.bind(tester);
            tester.click = () => (click(), spendTime(0), spendTime(0), spendTime(0));

            return tester;
        })();

        me.select = (getSelectField => {
            const createTester = (filter = () => true) => {
                const tester = testersFactory.createDomElementTester(() => getSelectField(filter)),
                    click = tester.click.bind(tester);

                const selectTester = testersFactory.createDomElementTester(() =>
                    getSelectField(filter).closest('.ui-select, .cmgui-select'));

                tester.click = () => (click(), spendTime(0), spendTime(0), spendTime(0), spendTime(0));

                tester.arrow = (tester => {
                    const click = tester.click.bind(tester);

                    tester.click = () => (click(), spendTime(0), spendTime(0));
                    return tester;
                })(testersFactory.createDomElementTester(
                    () => getSelectField(filter).closest(
                        '.ui-select-container, ' +
                        '.cmgui-select-container'
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
                        return addTesters(tester, getDomElement);
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
                        matchesSelector(
                            '.ui-list-option, ' +
                            '.cmgui-list-option, ' +
                            '.cm-chats--tags-option'
                        ).
                        textEquals(text).
                        find();

                    const tester = testersFactory.createDomElementTester(option),
                        click = tester.click.bind(tester),
                        checkbox = option.querySelector('.ui-checkbox, .cmgui-checkbox');

                    tester.click = () => (click(), Promise.runAll(false, true), spendTime(0), spendTime(0), tester);

                    const disabledClassNames = [
                        'ui-list-option-disabled',
                        'cmgui-list-option-disabled',
                    ];

                    tester.expectToBeDisabled = () => tester.expectToHaveAnyOfClasses(disabledClassNames);
                    tester.expectToBeEnabled = () => tester.expectToHaveNoneOfClasses(disabledClassNames);

                    tester.expectToBeSelected = logEnabled => {
                        if (!checkbox.classList.contains('ui-checkbox-checked')) {
                            throw new Error(`Опиция "${text}" должна быть отмечена.`);
                        }
                    };

                    tester.expectNotToBeSelected = () => {
                        if (checkbox.classList.contains('ui-checkbox-checked')) {
                            throw new Error(`Опиция "${text}" не должна быть отмечена.`);
                        }
                    };

                    return addTesters(tester, () => option);
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
            tester.withValue = expectedValue => createTester(select => utils.getTextContent(select) == expectedValue);

            tester.withPlaceholder = expectedPlaceholder => createTester(select => utils.getTextContent(
                select.querySelector(
                    '.ui-select-placeholder, ' +
                    '.cmgui-select-placeholder'
                ) ||
                new JsTester_NoElement()
            ) == expectedPlaceholder);

            return tester;
        })((filter = () => true) => [
            '.ui-select-field',
            '.cmgui-select-field',
            '.ui-select',
            '.cmgui-select',
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

    me.header = (() => {
        const getHeader = () => utils.querySelector('.src-components-main-menu-styles-module__header'),
            tester = testersFactory.createDomElementTester(getHeader);

        return addTesters(tester, getHeader);
    })();

    me.channelList = (() => {
        const getChannelList = () => utils.querySelector('.cm-chats--start-channel-select'),
            tester = testersFactory.createDomElementTester(() => getChannelList());

        tester.item = text => {
            const tester = testersFactory.createDomElementTester(
                () => utils.descendantOf(getChannelList()).
                    matchesSelector(
                        '.misc-contacts-src-components-contact-bar-start-channel-select-styles-module__list-item'
                    ).
                    textEquals(text).
                    find()
            );

            const putMouseOver = tester.putMouseOver.bind(tester),
                click = tester.click.bind(tester);

            tester.putMouseOver = () => (putMouseOver(), spendTime(100), spendTime(0));
            tester.click = () => (click(), spendTime(0));

            return tester;
        };

        return addTesters(tester, getChannelList);
    })();

    me.spendFiveSeconds = function (times = 1) {
        let i = 0;

        for (i = 0; i < times; i ++) {
            spendTime(5000);
            me.expectPingToBeSent();
            me.receivePong();
            me.employeesPing().expectToBeSent();
            me.employeesPing().receive();
        }
    };

    me.chatPanelFooterToolbar = (() => {
        const getDomElement = () => utils.querySelector('.cm-chats--chat-panel-footer-toolbar'),
            tester = testersFactory.createDomElementTester(getDomElement);

        return addTesters(tester, getDomElement);
    })();

    me.chatTemplateMenu = (() => {
        let getDomElement = () => utils.querySelector('.cm-chats--chat-template-menu-popup'),
            tester = testersFactory.createDomElementTester(getDomElement);

        tester = addTesters(tester, getDomElement)
        const first = tester.button.first,
            click = first.click.bind(first);

        first.click = () => {
            click();
            spendTime(0);
            me.modalWindow.endTransition('transform');
        };

        return tester;
    })();

    me.whatsAppChannelSelect = (() => {
        const getDomElement = () => utils.querySelector('.cm-chats--whatsapp-channel-select'),
            tester = testersFactory.createDomElementTester(getDomElement);

        return addTesters(tester, getDomElement);
    })();

    me.chatTransferButton = (() => {
        const button = testersFactory.createDomElementTester('.cm-chats--transfer-button'),
            click = button.click.bind(button),
            putMouseOver = button.putMouseOver.bind(button);

        button.putMouseOver = () => (putMouseOver(), spendTime(100), spendTime(0));

        button.click = () => {
            click();
            spendTime(0)
        };

        return button;
    })();

    me.tooltip = (() => {
        const getDomElement = () => utils.querySelector('.ui-tooltip-inner, .cmgui-tooltip-inner'),
            tester = testersFactory.createDomElementTester(getDomElement);

        return addTesters(tester, getDomElement);
    })();

    me.statusesDurationItem = text => testersFactory.createDomElementTester(() => utils.descendantOfBody().
        textEquals(text).
        matchesSelector('.cmg-softphone--call-stats-status-duration .name').
        find().closest('.cmg-softphone--call-stats-status-duration'));

    me.modalWindow = (() => {
        const getModalWindow = () => utils.querySelector('.clct-modal, .ui-modal, .cmgui-modal'),
            windowTester = addTesters(testersFactory.createDomElementTester(getModalWindow), getModalWindow);

        const windowContentTester = testersFactory.createDomElementTester(
            () => getModalWindow().querySelector('.ui-modal-content, .cmgui-modal-content') 
        );

        windowTester.expectToHaveWidth = windowContentTester.expectToHaveWidth.bind(windowContentTester);

        windowTester.finishHiding = () => {
            spendTime(0);
            windowTester.endTransition('transform');
            spendTime(0);
        };

        windowTester.closeButton = (() => {
            const tester = testersFactory.createDomElementTester(() =>
                utils.element(getModalWindow()).querySelector('.ui-modal-close-x, .cmgui-modal-close-x'));

            const click = tester.click.bind(tester);

            tester.click = () => {
                click();
                spendTime(0);
                windowTester.finishHiding();
            };

            return tester;
        })();

        const button = windowTester.button.bind(windowTester);

        windowTester.button = text => {
            const tester = button(text),
                click = tester.click.bind(tester);

            tester.click = () => {
                click();
                windowTester.finishHiding();
            };

            return tester;
        };

        return windowTester;
    })();

    const createRootTester = selector => {
        const getRootElement = () => document.querySelector(selector) || new JsTester_NoElement();

        return addTesters(
            testersFactory.createDomElementTester(getRootElement),
            getRootElement
        );
    };

    const addAuthErrorResponseModifiers = (me, response) => {
        me.accessTokenExpired = () => {
            Object.keys(response).forEach(key => delete(response[key]));

            response.error = {
                code: 401,
                message: 'Время действия токена истекло',
                request: null,
                data: {
                    mnemonic: 'access_token_expired',
                    field: '',
                    value: '',
                    params: null
                }
            };

            return me;
        };

        return me;
    };

    me.expectChatsStoreToContain = expectedContent => {
        utils.expectObjectToContain(chatsRootStore.toJSON(), expectedContent);
    };

    me.employeesWebsocketConnectedMessage = () => {
        const message = {
            type: 'message',
            data: { type: 'employees_websocket_connected' },
        };

        return {
            expectToBeSent: () => me.employeesBroadcastChannel().
                nextMessage().
                expectToContain(message),
            
            receive: () => {
                me.employeesBroadcastChannel().receiveMessage(message);
                spendTime(0);
            },
        }
    };

    me.employeesWebsocketConnectedRequest = () => {
        const message = {
            type: 'message',
            data: { type: 'get_employees_websocket_connectedness' },
        };

        return {
            expectToBeSent: () => me.employeesBroadcastChannel().
                nextMessage().
                expectToContain(message),
            
            receive: () => {
                me.employeesBroadcastChannel().receiveMessage(message);
                spendTime(0);
            },
        }
    };

    me.logDownloadingRequest = () => {
        const response = true;

        const message = {
            method: 'download_log',
            data: undefined,
        };

        return {
            broadcastMessage: () => ({
                forLeader: () => {
                    const message = {
                        type: 'message',
                        data: {
                            type: 'notify_master',
                            data: {
                                action: 'download_log',
                                id: '5314f800-0f23-425d-bf20-683f0d149675',
                            },
                        },

                    };

                    return {
                        expectToBeSent: () => me.nextCrosstabMessage().expectToContain(message),
                        receive: () => (me.receiveCrosstabMessage(message), spendTime(0))
                    };
                },

                forFollower: () => {
                    const message = {
                        type: 'message',
                        data: {
                            type: 'notify_slaves',
                            data: {
                                action: 'download_log',
                                id: '5314f800-0f23-425d-bf20-683f0d149675',
                                data: utils.expectToHaveSubstring([
                                    'Thu Dec 19 2019 12:10:06 GMT+0300 (Moscow Standard Time) ' +
                                    'Response status: 200 OK; ' +
                                    'Time consumed 0 ms; ' +
                                    'Without credentials',

                                    'POST $REACT_APP_AUTH_URL'
                                ].join("\n\n")),
                            },
                        },

                    };

                    return {
                        anotherId() {
                            message.data.data.id = '28296h82-28g3-682b-an34-8602838710n0';
                            return this;
                        },

                        noData() {
                            message.data.data.data = '';
                            return this;
                        },

                        expectToBeSent: () => me.nextCrosstabMessage().expectToContain(message),
                        receive: () => (me.receiveCrosstabMessage(message), spendTime(0))
                    };
                },
            }),
            windowMessage: () => ({
                withMessageFromLeader() {
                    message.data = 'Message from leader';
                    return this;
                },

                receive: () => postMessages.receive(message),
                expectToBeSent: () => postMessages.nextMessage().expectMessageToContain(message),
            }),
            receive: () => {
                const request = me.chrome.
                    runtime.
                    receiveMessage(message);

                return {
                    expectNoResponseToBeSent: () => request.expectNoResponseToBeSent(),
                    expectResponseToBeSent: () => request.expectResponseToContain(response),
                };
            },
            expectResponseToBeSent() {
                this.receive().expectResponseToBeSent();
            },
            expectNoResponseToBeSent() {
                this.receive().expectNoResponseToBeSent();
            },
            expectToBeSent() {
                const request = me.chrome.
                    tabs.
                    current.
                    nextMessage().
                    expectToContain(message);

                return {
                    receiveResponse: () => {
                        request.receiveResponse(response);

                        spendTime(0);
                        spendTime(0);
                    },
                    fail: () => {
                        request.fail();

                        spendTime(0);
                        spendTime(0);
                    },
                };
            },
        };
    };

    me.ssoCheckRequest = () => {
        let respond = request => request.respondUnauthorizedWith('401 Unauthorized');

        const addResponseModifiers = me => {
            return me;
        };

        return addResponseModifiers({
            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectToHavePath('$REACT_APP_SSO_AUTH_URL/sso/check').
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

    me.apiLogoutRequest = () => {
        let respond = request => request.respondSuccessfullyWith({
            data: {},
        });

        const addResponseModifiers = me => {
            return me;
        };

        return addResponseModifiers({
            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectToHavePath('$REACT_APP_SSO_AUTH_URL/api-logout').
                    expectToHaveMethod('POST');

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

    me.apiLoginRequest = () => {
        let respond = request => request.respondSuccessfullyWith({
            data: {},
        });

        const addResponseModifiers = me => {
            return me;
        };

        return addResponseModifiers({
            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectToHavePath('$REACT_APP_SSO_AUTH_URL/api-login').
                    expectToHaveMethod('POST').
                    expectBodyToContain({
                        username: 'botusharova',
                        password: '8Gls8h31agwLf5k',
                        project: 'comagic',
                        identity_provider: 'comagic_db',
                        sliding_expiration: true,
                    });

                return addResponseModifiers({
                    receiveResponse() {
                        respond(request);
                        Promise.runAll(false, true);
                        spendTime(0)
                        spendTime(0);
                        spendTime(0);
                        spendTime(0);
                    }
                });
            },
            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    me.ticketsContactsRequest = () => {
        let respond = request => request.respondSuccessfullyWith({
            data: {
                contacts: [],
                phones: [],
                emails: [],
            },
        });

        const addResponseModifiers = me => {
            me.accessTokenExpired = () => {
                respond = request => request.respond({
                    status: 401,
                    statusText: 'access_token_expired',
                    responseText: ''
                });

                return me;
            };

            me.accessTokenInvalid = () => {
                respond = request => request.respond({
                    status: 401,
                    statusText: 'access_token_invalid',
                    responseText: ''
                });

                return me;
            };

            return me;
        };

        return addResponseModifiers({
            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectToHaveMethod('GET').
                    expectToHavePath('https://$REACT_APP_INFOPIN_BACKEND_HOST/tickets/contacts');

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

    me.ticketCreatingRequest = () => {
        const bodyParams = {
            context: 'Что-то нехорошее произошло',
            is_new_email: 'true',
            is_new_phone: 'true',
            is_new_contact: 'true',
            phone: '79161234567',
            email: 'valcheva@gmail.com',
            contact: 'Валчева Албена Станимир',
        };

        const addResponseModifiers = me => {
            me.logAttached = () => {
                bodyParams.files = {
                    name: '20191219.121007.000.log.txt'
                };

                return me;
            };

            me.anotherLogAttached = () => {
                bodyParams.files = {
                    name: '20191219.121006.000.log.txt'
                };

                return me;
            };

            return me;
        };

        return addResponseModifiers({
            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectToHaveMethod('POST').
                    expectBodyToContain(bodyParams).
                    expectToHavePath('https://$REACT_APP_INFOPIN_BACKEND_HOST/tickets');

                return addResponseModifiers({
                    receiveResponse() {
                        request.respondSuccessfullyWith({
                            data: true,
                        });

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

    me.authTokenRequest = () => {
        const addResponseModifiers = me => me;

        return addResponseModifiers({
            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectToHaveMethod('GET').
                    expectToHavePath('https://$REACT_APP_SOFTPHONE_BACKEND_HOST/sup/auth/token');

                return addResponseModifiers({
                    receiveResponse() {
                        request.respondSuccessfullyWith({
                            data: {
                                token: 'XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0',
                            },
                        });

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

    me.feedbackCreatingRequest = () => {
        const bodyParams = {
            comment: 'Что-то нехорошее произошло',
            rating: '0',
            files: {
                name: '20191219.121007.000.log.zip',
            },
        };

        const addResponseModifiers = me => me;

        return addResponseModifiers({
            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectToHaveMethod('POST').
                    expectBodyToContain(bodyParams).
                    expectToHavePath('https://$REACT_APP_SOFTPHONE_BACKEND_HOST/sup/api/v1/feedback');

                return addResponseModifiers({
                    receiveResponse() {
                        request.respondSuccessfullyWith({
                            data: true,
                        });

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

    me.centrifugoAuthTokenRequest = () => {
        const addResponseModifiers = me => me;

        return addResponseModifiers({
            expectToBeSent() {
                const request = ajax.recentRequest().
                    expectToHaveMethod('GET').
                    expectToHavePath('$REACT_APP_CENTRIFUGO_AUTH_URL/token').
                    expectQueryToContain({
                        employee_id: '20816',
                        prefix: '$REACT_APP_CENTRIFUGO_PREFIX'
                    });

                return addResponseModifiers({
                    receiveResponse() {
                        request.respondSuccessfullyWith({
                            token: '224of2j2o4fjwfo8j4lo8qjf'
                        });

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

    me.chatPhoneUpdatingRequest = () => {
        const addResponseModifiers = me => me;

        return addResponseModifiers({
            expectToBeSent() {
                const request = ajax.recentRequest().
                    expectToHaveMethod('POST').
                    expectToHavePath('https://$REACT_APP_BASE_URL/operator/chat/phone').
                    expectBodyToContain({
                        phone: '79162729534',
                        chat_id: 7189362
                    });

                return addResponseModifiers({
                    receiveResponse() {
                        request.respondSuccessfullyWith({
                            result: true
                        });

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

    me.channelsRequest = () => {
        const addResponseModifiers = me => me;

        return addResponseModifiers({
            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectToHaveMethod('GET').
                    expectToHavePath('https://$REACT_APP_BASE_URL/operator/channels');

                return addResponseModifiers({
                    receiveResponse() {
                        request.respondSuccessfullyWith([]);

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

    me.offlineMessageMarkRequest = () => {
        const addResponseModifiers = me => me;

        return addResponseModifiers({
            expectToBeSent() {
                const request = ajax.recentRequest().
                    expectToHaveMethod('POST').
                    expectToHavePath('$https://REACT_APP_BASE_URL/operator/offline_message/mark').
                    expectBodyToContain({
                        id: 18222538,
                        mark_ids: [587, undefined]
                    });

                spendTime(0);

                return addResponseModifiers({
                    receiveResponse() {
                        request.respondSuccessfullyWith({
                            result: true
                        });

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

    me.chatMarkingRequest = () => {
        const addResponseModifiers = me => me;

        return addResponseModifiers({
            expectToBeSent() {
                const request = ajax.recentRequest().
                    expectToHaveMethod('POST').
                    expectToHavePath('https://$REACT_APP_BASE_URL/operator/chat/mark').
                    expectBodyToContain({
                        id: 7189362,
                        mark_ids: [587, undefined]
                    });

                spendTime(0);

                return addResponseModifiers({
                    receiveResponse() {
                        request.respondSuccessfullyWith({
                            result: true
                        });

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

    me.resourceRequest = () => {
        const addResponseModifiers = me => me;

        return addResponseModifiers({
            expectToBeSent() {
                const request = ajax.recentRequest().
                    expectToHaveMethod('POST').
                    expectPathToContain('https://$REACT_APP_BASE_URL/operator/resource').
                    expectBodyToContain({
                        file: {
                            name: 'some-file.zip',
                        },
                        mime: 'application/zip',
                        type: 'document',
                    });

                return addResponseModifiers({
                    receiveResponse() {
                        request.respondSuccessfullyWith({
                            id: 5829574,
                            mime: 'application/zip',
                            type: 'document',
                            filename: 'some-file.zip',
                            size: 925,
                            width: null,
                            height: null,
                            duration: 42820,
                        });

                        Promise.runAll(false, true);
                        spendTime(0)
                        spendTime(0)
                    }
                });
            },
            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    me.resourcePayloadRequest = () => {
        const addResponseModifiers = me => me;

        let id = '5829572',
            response = 'glg5lg5j8mcrj3o8f';

        return addResponseModifiers({
            anotherFile() {
                id = '5829573';
                response = '8gj23o2u4g2j829sk';
                return this;
            },

            expectToBeSent() {
                const request = ajax.recentRequest().
                    expectToHaveMethod('GET').
                    expectPathToContain('https://$REACT_APP_BASE_URL/operator/resource/payload').
                    expectQueryToContain({ id });

                return addResponseModifiers({
                    receiveResponse() {
                        request.respondSuccessfullyWith(response);

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

    me.messageAddingRequest = () => {
        const headers = {
            'X-Auth-Token': 'XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0',
        };

        const params = {
            chat_id: 7189362,
            chat_channel_id: null,
            visitor_id: 16479303,
            message: {
                text: 'Мне тревожно, успокой меня',
                type: 'operator',
                reply_to_id: null,
                context: null,
                resource: null,
            },
        };

        let response = {
            result: {
                id: 234252,
            },
        };

        let respond = request => request.respondSuccessfullyWith(response);

        const addResponseModifiers = me => {
            me.anotherAuthorizationToken = () =>
                ((headers['X-Auth-Token'] = '935jhw5klatxx2582jh5zrlq38hglq43o9jlrg8j3lqj8jf'), me);

            me.anotherMessage = () => {
                response.result.id = 234253;
                return me;
            };

            me.failed = () => {
                respond = request =>
                    request.respondUnsuccessfullyWith('500 Internal Server Error Server got itself in trouble');

                return me;
            };

            me.accessTokenExpired = () => {
                response = {
                    error: {
                        message: 'access_token_expired',
                    },
                };

                return me;
            };

            me.accessTokenInvalid = () => {
                response = {
                    error: {
                        message: 'access_token_invalid',
                    },
                };

                return me;
            };

            return me;
        };

        return addResponseModifiers({
            thirdMessage() {
                response.result.id = 234254;
                params.message.text = 'Я хочу спать';

                return this;
            },

            resource() {
                params.message.text = '';

                params.message.resource = {
                    id: 5829574,
                    type: 'document',
                    mime: 'application/zip',
                    filename: 'some-file.zip',
                    size: 925,
                    width: null,
                    height: null,
                    duration: 42820,
                    payload: null,
                    thumbs: null,
                    percentLoaded: null,
                    status: 'CREATED',
                    file: null,
                };

                return this;
            },

            anotherChat() {
                params.chat_id = 2718936;
                return  this;
            },

            expectToBeSent() {
                const request = ajax.recentRequest().
                    expectToHaveMethod('POST').
                    expectPathToContain('$REACT_APP_BASE_URL').
                    expectToHaveHeaders(headers).
                    expectBodyToContain({
                        method: 'add_message',
                        params
                    });

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

    me.chatStartingRequest = () => {
        const params = {
            channel_id: 216395,
            contact: {
                phone: '79283810988'
            }
        };

        const data = {
            chat_id: 7189362
        };

        const addResponseModifiers = me => me;

        return addResponseModifiers({
            anotherChannel() {
                params.channel_id = 216396;
                return this;
            },

            noPhone() {
                params.contact.phone = null;
                return this;
            },

            expectToBeSent() {
                return addResponseModifiers({
                    receiveResponse() {
                        ajax.recentRequest().
                            expectToHaveMethod('POST').
                            expectPathToContain('$REACT_APP_BASE_URL').
                            expectBodyToContain({
                                method: 'start_chat',
                                params
                            }).respondSuccessfullyWith({
                                result: {data}
                            });

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

    me.chatClosingRequest = () => {
        const params = {
            chat_id: 7189362,
            visitor_id: 16479303,
        };

        const addResponseModifiers = me => me;

        return addResponseModifiers({
            expectToBeSent() {
                return addResponseModifiers({
                    receiveResponse() {
                        ajax.recentRequest().
                            expectToHaveMethod('POST').
                            expectPathToContain('$REACT_APP_BASE_URL').
                            expectBodyToContain({
                                method: 'close_chat',
                                params
                            }).respondSuccessfullyWith({
                                result: {
                                    data: true,
                                }
                            });

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

    me.messageListRequest = () => {
        let total_messages_count = 200;

        let params = {
            visitor_id: 16479303
        };

        let data = [{
            id: 482057,
            source: 'visitor',
            text: 'Здравствуйте',
            date: '2020-02-10 12:12:14',
            status: 'delivered',
            chat_id: 2718935,
            reply_to: null,
            resource: null,
            reourceName: null,
            employee_id: 20816,
            employee_name: 'Карадимова Веска Анастасовна',
            visitor_name: 'Помакова Бисерка Драгановна',
            front_message_uuid: '228gj24og824jgo9d',
            error_mnemonic: null
        }, {
            id: 482058,
            source: 'operator',
            text: 'Привет',
            date: '2020-02-10 12:13:14',
            status: 'delivered',
            chat_id: 2718935,
            reply_to: null,
            resource: null,
            resourceName: null,
            employee_id: 20816,
            employee_name: 'Карадимова Веска Анастасовна',
            visitor_name: 'Помакова Бисерка Драгановна',
            front_message_uuid: '228gj24og824jgo8d',
            error_mnemonic: null
        }];

        const getPage = ({
            end,
            total,
            count
        }) => {
            const interval = (1000 * 60 * 60 * 6) + (5 * 1000 * 60) + (12 * 1000) + 231,
                data = [],
                start = end - count;

            let i = start;

            let date = new Date('2019-12-19T12:00:00');
            date = new Date(date.getTime() - (interval * (total - start) * 2));

            for (; i < end; i ++) {
                const index = i * 2,
                    number = i + 1;

                date = new Date(date.getTime() + interval);

                data.push({
                    id: 492057 + index,
                    source: 'visitor',
                    text: `Пинг # ${number}`,
                    date: utils.formatDate(date),
                    status: 'delivered',
                    chat_id: 2718935,
                    reply_to: null,
                    resource: null,
                    reourceName: null,
                    employee_id: 20816,
                    employee_name: 'Карадимова Веска Анастасовна',
                    visitor_name: 'Помакова Бисерка Драгановна',
                    front_message_uuid: '228gj24og824jgo9d',
                    error_mnemonic: null
                });

                date = new Date(date.getTime() + interval);

                data.push({
                    id: 492058 + index,
                    source: 'operator',
                    text: `Понг # ${number}`,
                    date: utils.formatDate(date),
                    status: 'delivered',
                    chat_id: 2718935,
                    reply_to: null,
                    resource: null,
                    resourceName: null,
                    employee_id: 20816,
                    employee_name: 'Карадимова Веска Анастасовна',
                    visitor_name: 'Помакова Бисерка Драгановна',
                    front_message_uuid: '228gj24og824jgo8d',
                    error_mnemonic: null
                });
            }

            data.reverse();
            return data;
        };

        const addResponseModifiers = me => {
            me.addVisitorMessage = () => {
                data.splice(1, 0, {
                    id: 582060,
                    source: 'visitor',
                    text: 'Как ваши дела?',
                    date: '2020-02-10 12:12:14',
                    status: 'delivered',
                    chat_id: 2718935,
                    reply_to: null,
                    resource: null,
                    reourceName: null,
                    employee_id: 20816,
                    employee_name: 'Карадимова Веска Анастасовна',
                    visitor_name: 'Помакова Бисерка Драгановна',
                    front_message_uuid: '228gj24og824jgo9d',
                    error_mnemonic: null
                });

                return me;
            };
            
            me.link = () => {
                data[0].text = "Привет. Это ссылка на медузу - https://meduza.io, но здесь она уже кончилась. Это " +
                    "ссылка на гугл - https://google.com\nsdfsfsdflisdjfldjf, она должна была кончиться чуть раньше.";

                return me;
            };

            me.firstPage = () => {
                data = getPage({
                    end: 100,
                    total: 100,
                    count: 50
                });

                return me;
            };

            me.audioAttachment = () => {
                data[0].text = '';

                data[0].resource = {
                    id: 5829573,
                    type: 'audio',
                    mime: 'audio/mpeg',
                    filename: 'call.mp3',
                    size: 925,
                    width: null,
                    height: null,
                    duration: 42820
                };

                return me;
            };

            me.reply = () => {
                data[1].reply_to = {
                    id: 482061,
                    source: 'visitor',
                    text: 'Как дела?',
                    date: '2020-01-10 12:10:16',
                    status: 'delivered',
                    chat_id: 2718935,
                    reply_to: null,
                    resource: null,
                    reourceName: null,
                    employee_id: 20816,
                    employee_name: 'Карадимова Веска Анастасовна',
                    front_message_uuid: '8g28929d8j44jgo9d',
                    error_mnemonic: null
                };

                return me;
            };

            return me;
        };

        return addResponseModifiers({
            secondPage() {
                data = getPage({
                    end: 50,
                    total: 100,
                    count: 50
                });

                params.scroll_from_date = '2019-11-24T09:24:49'
                return this;
            },

            anotherChat() {
                params = {
                    chat_id: 2718936
                };

                data[0].id = 482059;
                data[0].text = 'Здравствуй';
                data[0].chat_id = 2718936;

                return this;
            },

            chat() {
                params = {
                    chat_id: 2718935
                };

                return this;
            },

            expectToBeSent() {
                const request = ajax.recentRequest().
                    expectToHaveMethod('POST').
                    expectPathToContain('$REACT_APP_BASE_URL').
                    expectBodyToContain({
                        method: 'get_message_list',
                        params
                    });

                return addResponseModifiers({
                    receiveResponse() {
                        data.forEach(item => (item.total_messages_count = total_messages_count));

                        request.respondSuccessfullyWith({
                            result: {data}
                        });

                        Promise.runAll(false, true);
                        spendTime(0)
                        spendTime(0)
                    }
                });
            },
            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    const createBroadcastChannelTester = name => {
        const tester = me.createBroadcastChannelTester(name);

        const channel = {
            nextMessage: tester.nextMessage.bind(tester),
            receiveMessage: tester.receiveMessage.bind(tester),

            leaderDeath: () => ({
                receive: () => {
                    tester.receiveMessage({
                        type: 'internal',
                        data: {
                            context: 'leader',
                            action: 'death',
                            token: 'g28g2hor28',
                        },
                    });

                    spendTime(0);
                },

                expectToBeSent: () => tester.nextMessage().expectToContain({
                    type: 'internal',
                    data: {
                        context: 'leader',
                        action: 'death',
                    },
                }),
            }),

            applyLeader: () => ({
                expectToBeSent: () => {
                    tester.applyLeader();
                    spendTime(0);

                    return {
                        ...channel,
                        waitForSecond: () => {
                            spendTime(1000);
                            spendTime(0);

                            return channel;
                        },
                    };
                },
            }),

            tellIsLeader: () => ({
                expectToBeSent: () => {
                    tester.tellIsLeader();
                    spendTime(0);
                },

                receive: () => {
                    tester.receiveMessage(tester.tellIsLeaderMessage());
                    spendTime(0);
                },
            }),
        };

        return channel;
    };

    me.employeesBroadcastChannel = () => createBroadcastChannelTester('employees');
    me.hostBroadcastChannel = () => createBroadcastChannelTester('host');

    me.leaderTokenRefreshingRequest = () => {
        const request = {
            type: 'message',
            data: {
                method: 'request',
                id: '5314f800-0f23-425d-bf20-683f0d149675',
                data: {
                    method: 'refresh_token',
                    data: jwtToken,
                },
            },
        };

        const response = {
            type: 'message',
            data: {
                method: 'response',
                id: '5314f800-0f23-425d-bf20-683f0d149675',
                data: {
                    success: true,
                    data: null,
                },
            },
        };

        return {
            anotherId() {
                request.data.id = '8s824gl2-82nb-xo3x-28bx-8h2jkxacx8e5';
                response.data.id = '8s824gl2-82nb-xo3x-28bx-8h2jkxacx8e5';

                return this;
            },

            anotherAuthorizationToken() {
                request.data.data.data = anotherJwtToken;
                return this;
            },

            expectToBeSent() {
                me.hostBroadcastChannel().
                    nextMessage().
                    expectToContain(request);

                return {
                    receiveResponse() {
                        me.hostBroadcastChannel().receiveMessage(response);
                        spendTime(0);
                        spendTime(0);
                    },
                };
            },

            receiveResponse() {
                return this.expectToBeSent().receiveResponse();
            },
            
            receive() {
                me.hostBroadcastChannel().receiveMessage(request);
                spendTime(0);
                spendTime(0);

                return {
                    expectResponseToBeSent() {
                        me.hostBroadcastChannel().
                            nextMessage().
                            expectToContain(response);
                    },
                };
            },

            expectResponseToBeSent() {
                return this.receive().expectResponseToBeSent();
            },
        };
    };

    me.employeeSettingsRequest = () => {
        let respond = request => request.respondSuccessfullyWith({
            is_chat_acceptance_confirmation: true,
            is_need_hide_numbers: false,
        });

        const addResponseModifiers = me => {
            me.accessTokenExpired = () => {
                respond = request => request.respondUnauthorizedWith({
                    error: 'The token is expired',
                });

                return me;
            };

            return me;
        };

        return addResponseModifiers({
            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectToHaveMethod('GET').
                    expectToHavePath('https://$REACT_APP_BASE_URL/api/v1/employees/20816/settings');

                return addResponseModifiers({
                    receiveResponse() {
                        respond(request);

                        Promise.runAll(false, true);
                        spendTime(0)
                        spendTime(0)
                    }
                });
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    me.employeeRequest = () => {
        const headers = {
            Authorization: 'Bearer XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0',
        };

        const addResponseModifiers = me => {
            return me;
        };

        return addResponseModifiers({
            noAuthorizationHeader() {
                headers.Authorization = undefined;
                return this;
            },

            anotherAuthorizationToken() {
                headers.Authorization = 'Bearer 935jhw5klatxx2582jh5zrlq38hglq43o9jlrg8j3lqj8jf';
                return this;
            },

            thirdAuthorizationToken() {
                headers.Authorization = 'Bearer 2924lg8hg95gl8h3g2lg8o2hgg8shg8olg8qg48ogih7h29';
                return this;
            },

            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectToHaveMethod('GET').
                    expectToHavePath('https://$REACT_APP_BASE_URL/api/v1/employees/20816').
                    expectToHaveHeaders(headers);

                return addResponseModifiers({
                    receiveResponse() {
                        request.respondSuccessfullyWith({
                            id: 20816,
                            first_name: 'Стефка',
                            last_name: 'Ганева',
                            position_id: 0,
                            status_id: 1
                        });

                        Promise.runAll(false, true);
                        spendTime(0)
                        spendTime(0)
                        spendTime(0)
                    }
                });
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    me.employeeUpdatingRequest = () => {
        let response = { data: true },
            respond = request => request.respondSuccessfullyWith(response),
            checkRequest = request => request,
            status_id = 4;

        const headers = {
            Authorization: 'Bearer XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0',
        };

        const addResponseModifiers = me => {
            me.accessTokenExpired = () => {
                respond = request => request.respondUnauthorizedWith({
                    error: 'The token is expired',
                });

                return me;
            };
            
            me.accessTokenInvalid = () => {
                respond = request => request.respondUnauthorizedWith({
                    error: 'The token is invalid',
                });

                return me;
            };

            me.networkError = () => {
                respond = request => request.networkError();
                return me;
            };

            me.internalError = () => {
                respond = request => request.respondUnsuccessfullyWith(
                    '500 Internal Server Error Server got itself in trouble'
                );

                return me;
            };

            return me;
        };

        return addResponseModifiers({
            anotherStatus() {
                status_id = 5;
                return this;
            },

            anotherAuthorizationToken() {
                this.checkAuthorizationHeader();
                headers.Authorization = 'Bearer 935jhw5klatxx2582jh5zrlq38hglq43o9jlrg8j3lqj8jf';

                return this;
            },

            thirdAuthorizationToken() {
                this.checkAuthorizationHeader();
                headers.Authorization = 'Bearer 2924lg8hg95gl8h3g2lg8o2hgg8shg8olg8qg48ogih7h29';
                return this;
            },

            checkAuthorizationHeader() {
                checkRequest = request => request.expectToHaveHeaders(headers);
                return this;
            },

            expectToBeSent(requests) {
                const request = checkRequest(
                    (requests ? requests.someRequest() : ajax.recentRequest()).
                        expectToHaveMethod('PATCH').
                        expectPathToContain('$REACT_APP_BASE_URL/api/v1/employees/20816').
                        expectBodyToContain({ status_id })
                );

                return addResponseModifiers({
                    receiveResponse() {
                        respond(request);

                        Promise.runAll(false, true);
                        spendTime(0)
                        spendTime(0);
                        spendTime(0);
                    }
                });
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    me.employeeStatusesRequest = () => {
        const data = [{
            id: 7,
            is_worktime: false,
            mnemonic: 'removed',
            name: 'Удаленный',
            is_select_allowed: false,
            icon: 'heart',
            color: '#000',
            priority: 8,
            is_removed: true,

            is_able_to_accept_chat_transfer: true,
            is_able_to_transfer_chat: true,
            is_able_to_accept_chat: true,
            is_able_to_close_chat_offline_message: true,
            is_able_in_forwarding_scenario: true,
            is_able_to_send_chat_messages: true,

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
            is_auto_out_calls_ready: true,
            is_removed: false,

            is_able_to_accept_chat_transfer: true,
            is_able_to_transfer_chat: true,
            is_able_to_accept_chat: true,
            is_able_to_close_chat_offline_message: true,
            is_able_in_forwarding_scenario: true,
            is_able_to_send_chat_messages: true,

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
            is_auto_out_calls_ready: true,
            is_removed: false,

            is_able_to_accept_chat_transfer: true,
            is_able_to_transfer_chat: true,
            is_able_to_accept_chat: false,
            is_able_to_close_chat_offline_message: true,
            is_able_in_forwarding_scenario: true,
            is_able_to_send_chat_messages: true,

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
            is_auto_out_calls_ready: true,
            is_removed: false,

            is_able_to_accept_chat_transfer: true,
            is_able_to_transfer_chat: true,
            is_able_to_accept_chat: true,
            is_able_to_close_chat_offline_message: true,
            is_able_in_forwarding_scenario: true,
            is_able_to_send_chat_messages: true,

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
            is_auto_out_calls_ready: true,
            is_removed: false,

            is_able_to_accept_chat_transfer: true,
            is_able_to_transfer_chat: true,
            is_able_to_accept_chat: true,
            is_able_to_close_chat_offline_message: true,
            is_able_in_forwarding_scenario: true,
            is_able_to_send_chat_messages: true,

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
            is_auto_out_calls_ready: true,
            is_removed: false,

            is_able_to_accept_chat_transfer: true,
            is_able_to_transfer_chat: true,
            is_able_to_accept_chat: true,
            is_able_to_close_chat_offline_message: true,
            is_able_in_forwarding_scenario: true,
            is_able_to_send_chat_messages: true,

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
            is_auto_out_calls_ready: true,
            is_removed: false,

            is_able_to_accept_chat_transfer: true,
            is_able_to_transfer_chat: true,
            is_able_to_accept_chat: true,
            is_able_to_close_chat_offline_message: true,
            is_able_in_forwarding_scenario: true,
            is_able_to_send_chat_messages: true,

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

        const headers = {
            Authorization: 'Bearer XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0',
        };

        const addResponseModifiers = me => {
            me.many = () => {
                data.push({
                    id: 8,
                    is_worktime: false,
                    mnemonic: 'asterisk',
                    name: 'Звёздочка',
                    is_select_allowed: true,
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
                    is_select_allowed: true,
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
                    is_select_allowed: true,
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
                    is_select_allowed: true,
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
                    is_select_allowed: true,
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
                    is_select_allowed: true,
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
                    is_select_allowed: true,
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
                    is_select_allowed: true,
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
                    is_select_allowed: true,
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
                    is_select_allowed: true,
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
                    is_select_allowed: true,
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
                    is_select_allowed: true,
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
                    is_select_allowed: true,
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
                    is_select_allowed: true,
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
                    is_select_allowed: true,
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
                    is_select_allowed: true,
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
                    is_select_allowed: true,
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
                    is_select_allowed: true,
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
                    is_select_allowed: true,
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
                    is_select_allowed: true,
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
                    is_select_allowed: true,
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
                    is_select_allowed: true,
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

            me.includesAutoCall = () => {
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

            me.anotherAuthorizationToken = () =>
                ((headers.Authorization = 'Bearer 935jhw5klatxx2582jh5zrlq38hglq43o9jlrg8j3lqj8jf'), me);

            me.unableToTransferChat = () => {
                data[1].is_able_to_transfer_chat = false;
                return me;
            };

            me.unableToAcceptChatTransfer = () => {
                data[1].is_able_to_accept_chat_transfer = false;
                return me;
            };

            me.unableToAcceptChat = () => {
                data[1].is_able_to_accept_chat = false;
                return me;
            };

            me.unableToCloseChatOfflineMessage = () => {
                data[1].is_able_to_close_chat_offline_message = false;
                return me;
            };

            me.unableToSendChatMessages = () => {
                data[1].is_able_to_send_chat_messages = false;
                return me;
            };

            return me;
        };

        return addResponseModifiers({
            noAuthorizationHeader() {
                headers.Authorization = undefined;
                return this;
            },

            thirdAuthorizationToken() {
                headers.Authorization = 'Bearer 2924lg8hg95gl8h3g2lg8o2hgg8shg8olg8qg48ogih7h29';
                return this;
            },

            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectPathToContain('$REACT_APP_BASE_URL/api/v1/statuses').
                    expectToHaveMethod('GET').
                    expectToHaveHeaders(headers);

                return addResponseModifiers({
                    receiveResponse() {
                        request.respondSuccessfullyWith(data);

                        Promise.runAll(false, true);
                        spendTime(0)
                        spendTime(0)
                    }
                });
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    me.operatorStatusUpdateRequest = () => ({
        receiveResponse() {
            ajax.recentRequest().
                expectToHaveMethod('PATCH').
                expectPathToContain('$REACT_APP_BASE_URL/status').
                expectBodyToContain({
                    status: 2
                }).respondSuccessfullyWith({
                    data: true
                });

            Promise.runAll(false, true);
            spendTime(0)
        }
    });

    me.changeMessageStatusRequest = () => {
        const params = {
            chat_id: 2718935,
            message_id: 256085,
            status: 'delivered'
        };

        let respond = request => request.respondSuccessfullyWith({
            data: true
        });

        const addResponseModifiers = me => {
            me.failed = () => {
                respond = request =>
                    request.respondUnsuccessfullyWith('500 Internal Server Error Server got itself in trouble');

                return me;
            };

            return me;
        };

        return addResponseModifiers({
            anotherChat() {
                params.chat_id = 7189362;
                return this;
            },

            thirdChat() {
                params.chat_id = 2718940;
                return this;
            },

            fourthChat() {
                params.chat_id = 2718936;
                return this;
            },

            fifthChat() {
                params.chat_id = 2718942;
                return this;
            },

            anotherMessage() {
                params.message_id = 482057;
                return this;
            },

            thirdMessage() {
                params.message_id = 492255;
                return this;
            },

            read() {
                params.status = 'read';
                return this;
            },

            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectPathToContain('$REACT_APP_BASE_URL').
                    expectBodyToContain({
                        method: 'change_message_status',
                        params,
                    });

                return addResponseModifiers({
                    receiveResponse() {
                        respond(request);
                        Promise.runAll(false, true);
                        spendTime(0)
                    },
                });
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            },
        });
    };

    me.offlineMessageDeletingRequest = () => {
        const addResponseModifiers = me => me;

        const bodyParams = {
            offline_message_id: 178076
        };

        return addResponseModifiers({
            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectPathToContain('$REACT_APP_BASE_URL/operator/offline_message').
                    expectToHaveMethod('DELETE').
                    expectBodyToContain(bodyParams);

                return addResponseModifiers({
                    receiveResponse() {
                        request.respondSuccessfullyWith({
                            result: true 
                        });

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

    me.offlineMessageAcceptingRequest = () => {
        const addResponseModifiers = me => me;

        const bodyParams = {
            offline_message_id: 178076
        };

        return addResponseModifiers({
            anotherMessage() {
                bodyParams.offline_message_id = 18222538;
                return this;
            },

            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectPathToContain('$REACT_APP_BASE_URL/operator/offline_message').
                    expectToHaveMethod('POST').
                    expectBodyToContain(bodyParams);

                return addResponseModifiers({
                    receiveResponse() {
                        request.respondSuccessfullyWith({
                            result: true 
                        });

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

    me.ssoWsCheckingRequest = () => {
        const data = {},
            addResponseModifiers = me => me;

        return addResponseModifiers({
            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : fetch.recentRequest()).
                    expectPathToContain('$REACT_APP_SSO_CHECK_WS_URL');

                return addResponseModifiers({
                    receiveResponse() {
                        request.respondSuccessfullyWith(data);

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

    me.offlineMessageCountersRequest = () => {
        const data = {
            new_message_count: 0,
            active_message_count: 0,
            closed_message_count: 0
        };

        const addResponseModifiers = me => ((me.newMessage = () => ((data.new_message_count ++), me)), me);

        return addResponseModifiers({
            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectPathToContain('$REACT_APP_BASE_URL/operator/offline_message/counters');

                return addResponseModifiers({
                    receiveResponse() {
                        request.respondSuccessfullyWith(data);

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

    me.offlineMessageListRequest = () => {
        const processors = [];

        const data = {
            date_time: '2020-02-10 12:10:16',
            email: 'msjdasj@mail.com',
            employee_id: 1875485,
            id: 178073,
            is_phone_auto_filled: true,
            mark_ids: ['587', '213'],
            message: 'Я хочу о чем-то заявить.',
            phone: '79161212122',
            name: 'прива',
            site_id: 2157,
            status: 'not_processed',
            visitor_id: 16479303,
            visitor_name: 'Помакова Бисерка Драгановна',
            visitor_type: 'comagic',
        };

        const bodyParams = {
            limit: 30,
            offset: 0,
            scroll_from_date: null,
        };

        const addResponseModifiers = me => {
            me.anotherInquiry = () => {
                processors.push(() => (data.id = 178077));
                data.name = 'Добрый день';
                return me;
            };

            me.noName = () => {
                data.name = null;
                return me;
            };

            me.noEmployee = () => {
                data.employee_id = null; 
                return me;
            };

            me.noVisitorName = () => {
                data.visitor_name = null;
                return me;
            };

            me.contactExists = () => {
                data.contact = {
                    first_name: 'Грета',
                    last_name: 'Бележкова',
                    id: 1689283,
                    email_list: ['endlesssprinп.of@comagic.dev'],
                    chat_channel_list: [
                        { type: 'whatsapp', ext_id: '79283810988' },
                        { type: 'whatsapp', ext_id: '79283810928' },
                    ],
                    organization_name: 'UIS',
                    phone_list: ['79162729533'],
                    group_list: [],
                    personal_manager_id: 583783,
                    patronymic: 'Ервиновна',
                    full_name: 'Бележкова Грета Ервиновна',
                    is_chat_channel_active: false
                }

                return me;
            };

            return me;
        };

        return addResponseModifiers({
            singleMessage() {
                bodyParams.scroll_from_date = undefined;
                bodyParams.statuses = ['not_processed', 'processed', 'processing'];
                bodyParams.offline_message_id = 18222538;
                bodyParams.limit = 1;

                return this;
            },

            notProcessed() {
                bodyParams.statuses = ['not_processed'];

                data.id = 178076;
                data.status = 'not_processed';

                return this;
            },
            
            processing() {
                bodyParams.statuses = ['processing'];

                data.id = 178074;
                data.status = 'processing';

                return this;
            },

            processed() {
                bodyParams.statuses = ['processed'];

                data.id = 178075;
                data.status = 'processed';

                return this;
            },

            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectPathToContain('$REACT_APP_BASE_URL/operator/offline_message/list').
                    expectBodyToContain(bodyParams);

                return addResponseModifiers({
                    receiveResponse() {
                        processors.forEach(process => process());

                        request.respondSuccessfullyWith({
                            data: [data],
                        });

                        Promise.runAll(false, true);
                        spendTime(0)
                    },
                });
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    me.offlineMessageDisplayTypesRequest = () => {
        const addResponseModifiers = me => me;

        return addResponseModifiers({
            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectToHavePath('https://$REACT_APP_BASE_URL/settings/offline_message/display_types');

                return addResponseModifiers({
                    receiveResponse() {
                        request.respondSuccessfullyWith([{
                            type: 'form_on_site',
                            name: 'Встроенные формы на сайте',
                            is_selected: false,
                        }, {
                            type: 'jsapi',
                            name: 'JS API',
                            is_selected: false,
                        }, {
                            type: 'standard',
                            name: 'Стандартная',
                            is_selected: false,
                        }, {
                            type: 'taxi',
                            name: 'Такси',
                            is_selected: false,
                        }, {
                            type: 'smartis',
                            name: 'Smartis',
                            is_selected: false,
                        }, {
                            type: 'dataapi',
                            name: 'DataAPI',
                            is_selected: false,
                        }, {
                            type: 'facebook',
                            name: 'Facebook Ads',
                            is_selected: true,
                        }, {
                            type: 'custom',
                            name: 'Пользовательская',
                            is_selected: false,
                        }, {
                            type: 'mytarget',
                            name: 'myTarget Ads',
                            is_selected: false,
                        }, {
                            type: 'vk_new',
                            name: 'VK Реклама',
                            is_selected: false,
                        }, {
                            type: 'propertyfinder',
                            name: 'Property Finder',
                            is_selected: true,
                        }, {
                            type: 'vk',
                            name: 'VK Ads',
                            is_selected: false,
                        }, {
                            type: 'inquiry_type_13',
                            name: 'Inquiry 13',
                            is_selected: false,
                        }, {
                            type: 'inquiry_type_14',
                            name: 'Inquiry 14',
                            is_selected: false,
                        }]);

                        Promise.runAll(false, true);
                        spendTime(0)
                    },
                });
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    me.offlineMessageDisplayTypesSavingRequest = () => {
        const addResponseModifiers = me => me,
            processors = [];

        const data = [{
            type: 'form_on_site',
            name: 'Встроенные формы на сайте',
            is_selected: false,
        }, {
            type: 'jsapi',
            name: 'JS API',
            is_selected: false,
        }, {
            type: 'standard',
            name: 'Стандартная',
            is_selected: false,
        }, {
            type: 'taxi',
            name: 'Такси',
            is_selected: false,
        }, {
            type: 'smartis',
            name: 'Smartis',
            is_selected: false,
        }, {
            type: 'dataapi',
            name: 'DataAPI',
            is_selected: false,
        }, {
            type: 'facebook',
            name: 'Facebook Ads',
            is_selected: true,
        }, {
            type: 'custom',
            name: 'Пользовательская',
            is_selected: false,
        }, {
            type: 'mytarget',
            name: 'myTarget Ads',
            is_selected: false,
        }, {
            type: 'vk_new',
            name: 'VK Реклама',
            is_selected: false,
        }, {
            type: 'propertyfinder',
            name: 'Property Finder',
            is_selected: false,
        }, {
            type: 'vk',
            name: 'VK Ads',
            is_selected: true,
        }, {
            type: 'inquiry_type_13',
            name: 'Inquiry 13',
            is_selected: false,
        }, {
            type: 'inquiry_type_14',
            name: 'Inquiry 14',
            is_selected: false,
        }, undefined];

        return addResponseModifiers({
            allSelected() {
                data.forEach(item => item && (item.is_selected = true));
                return this;
            },

            expectToBeSent(requests) {
                processors.forEach(process => process());

                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectToHavePath('https://$REACT_APP_BASE_URL/settings/offline_message/display_types').
                    expectBodyToContain(data);

                return addResponseModifiers({
                    receiveResponse() {
                        request.respondSuccessfullyWith({
                            data: true,
                        });

                        Promise.runAll(false, true);
                        spendTime(0)
                    },
                });
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    me.centrifugoWebSocket = (() => {
        const getWebSocket = index => webSockets.getSocket('$REACT_APP_CENTRIFUGO_BASE_URL', index);

        return {
            connect: () => getWebSocket(0).connect(),
            expectSentMessageToContain: message => getWebSocket(0).expectSentMessageToContain(message),
            receive: message => getWebSocket(0).receiveMessage(message)
        };
    })();

    me.centrifugoConnectionMessage = () => ({
        expectToBeSent: () => me.centrifugoWebSocket.expectSentMessageToContain({
            connect: {
                token: "224of2j2o4fjwfo8j4lo8qjf",
                name: "js"
            }
        })
    });

    const createWebSocketTester = (() => {
        let lastIndex = -1;

        return url => {
            let index;

            const getWebSocket = () => {
                if (index === undefined) {
                    throw new Error('Индекс не указан.');
                }

                return webSockets.getSocket(url, index);
            };

            return {
                finishDisconnecting: () => {
                    getWebSocket().finishDisconnecting();
                },
                disconnect: code => {
                    getWebSocket().disconnect(code);
                },
                disconnectAbnormally: code => {
                    getWebSocket().disconnectAbnormally(code);
                },
                connect: () => {
                    lastIndex ++;
                    index = lastIndex;
                    getWebSocket().connect();
                },
                expectSentMessageToContain: message => getWebSocket().expectSentMessageToContain(message),
                receive: message => getWebSocket().receiveMessage(message)
            };
        };
    })();

    const createWebSocketTesterCreator = () => {
        const throwError = () => {
            throw new Error('Вебсокет должен быть подключен.');
        };

        const tester = {};
        let url = '$REACT_APP_WS_URL';

        const applyMethods = () => {
            tester.finishDisconnecting = throwError;
            tester.expectSentMessageToContain = throwError;
            tester.receive = throwError;
            tester.disconnect = throwError;
            tester.disconnectAbnormally = throwError;
            tester.ssoAuth = () => (url = '$REACT_APP_SSO_WS_URL', tester),

            tester.connect = () => {
                const value = createWebSocketTester(url);

                tester.disconnect = code => {
                    value.disconnect(code);
                    applyMethods();
                };

                tester.disconnectAbnormally = code => {
                    value.disconnectAbnormally(code);
                    applyMethods();
                };

                tester.finishDisconnecting = () => {
                    value.finishDisconnecting();
                    applyMethods();
                };

                tester.expectSentMessageToContain = value.expectSentMessageToContain;
                tester.receive = value.receive;

                value.connect();

                tester.connect = () => {
                    throw new Error('Вебсокет не должен быть подключен.');
                };
            };
        };

        applyMethods();
        return tester;
    };

    me.chatsWebSocket = createWebSocketTesterCreator();
    me.employeesWebSocket = createWebSocketTesterCreator();

    me.offlineMessagesSettingsChangedMessage = () => ({
        receive: () => {
            me.chatsWebSocket.receive(JSON.stringify({
                method: 'offline_messages_settings_changed',
            }));

            spendTime(0);
        },
    });

    me.chatsEmployeeChangeMessage = () => ({
        receive: () => me.chatsWebSocket.receive(JSON.stringify({
            method: 'employee_update',
            params: {
                id: 20816,
                status_id: 2
            }
        }))
    });

    me.employeesInitMessage = () => {
        let jwt = 'XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0';

        return {
            ssoAuth() {
                jwt = '';
                return this;
            },

            anotherAuthorizationToken() {
                jwt = '935jhw5klatxx2582jh5zrlq38hglq43o9jlrg8j3lqj8jf';
                return this;
            },

            thirdAuthorizationToken() {
                jwt = '2924lg8hg95gl8h3g2lg8o2hgg8shg8olg8qg48ogih7h29';
                return this;
            },

            expectToBeSent: () => me.employeesWebSocket.expectSentMessageToContain({
                name: 'init',
                params: { jwt }
            })
        };
    };

    me.employeesPing = () => {
        const createMessage = () => ({});

        return {
            receive: () => {
                me.employeesWebSocket.receive(createMessage());
                spendTime(0);
            },

            expectToBeSent: () => me.employeesWebSocket.expectSentMessageToContain(createMessage())
        };
    };

    me.entityChangeEvent = () => {
        let entityName = 'employee';
        
        let params = {
            name: 'employee',
            action: 'update',
            app_id: 4735,
            data: {
                id: 20816,
                first_name: 'Стевка',
                last_name: 'Гонева',
                status_id: 2,
            },
        };

        const processors = [];

        let createMessage = () => {
            processors.forEach(process => process());
            
            return {
                type: 'event',
                name: 'entity_changed',
                params,
            };
        };

        const setStatus = () => (params = {
            name: 'status',
            action: 'insert',
            app_id: 4735,
            data: {
                app_id: 4735,
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
                    ],
                }],
            },
        });

        const createNotification = () => ({
            type: 'message',
            data: {
                type: 'employees_websocket_message',
                data: createMessage(),
            }
        });

        return {
            nameUnchanged() {
                ['first_name', 'last_name'].forEach(name => delete(params.data[name]));
                return this;
            },

            insertStatus() {
                setStatus();
                return this;
            },

            updateRemovedStatus() {
                setStatus();
                params.action = 'update';

                params.data.data[0] = {
                    id: 7,
                    name: 'Ненужный'
                };

                return this;
            },

            updateStatus() {
                setStatus();
                params.action = 'update';

                params.data.data[0] = {
                    id: 2,
                    name: 'Пауза'
                };

                return this;
            },

            removeStatus() {
                setStatus();
                params.action = 'delete';

                params.data.data[0] = {
                    id: 2,
                    is_removed: true
                };

                return this;
            },

            anotherEmployee() {
                params.data = {
                    id: 20818,
                    status_id: 1,
                };

                return this;
            },

            thirdEmployee() {
                params.data = {
                    id: 583783,
                    status_id: 2,
                };

                return this;
            },

            fourthEmployee() {
                params.data = {
                    id: 79582,
                    status_id: 1,
                };

                return this;
            },

            thirdStatus() {
                processors.push(() => (params.data.status_id = 2));
                return this;
            },

            fourthStatus() {
                params.data.status_id = 1;
                return this;
            },

            fifthStatus() {
                params.data.status_id = 3;
                return this;
            },

            anotherStatus() {
                params.data.status_id = 4;
                return this;
            },

            slavesNotification: function () {
                return {
                    expectToBeSent: () => {
                        const notification = createNotification();
                        me.employeesBroadcastChannel().nextMessage().expectToContain(notification);
                    },
                    receive: () => (me.employeesBroadcastChannel().receiveMessage(createNotification()), spendTime(0)),
                };
            },

            receive: () => {
                me.employeesWebSocket.receive(createMessage());
                spendTime(0);
                spendTime(0);
            }
        }
    };

    me.chatsInitMessage = () => {
        let access_token = 'XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0';

        return {
            anotherAuthorizationToken() {
                access_token = '935jhw5klatxx2582jh5zrlq38hglq43o9jlrg8j3lqj8jf';
                return this;
            },

            expectToBeSent: () => me.chatsWebSocket.expectSentMessageToContain({
                method: 'init',
                params: {
                    access_token,
                    access_type: 'jwt',
                    employee_id: 20816
                }
            })
        };
    };

    me.forcedTransferMessage = () => {
        const params = {
            chat: {
                chat_channel_id: 101,
                chat_channel_type: 'telegram',
                date_time: '2022-01-23T16:24:21.098210',
                id: 2718936,
                last_message: {
                    message: 'Больше не могу разговаривать с тобой, дай мне Веску!',
                    date: '2022-03-24T14:08:23.000Z',
                    is_operator: false,
                    resource_type: null
                },
                mark_ids: ['587', '213'],
                phone: null,
                site_id: 4663,
                status: 'active',
                visitor_id: 16479304,
                visitor_name: 'Върбанова Илиана Милановна',
                visitor_type: 'omni'
            },
            comment: 'Поговори с ней сама, я уже устала',
            from_employee_id: 20817
        };

        return {
            noLastMessage() {
                params.chat.last_message = null;
                return this;
            },

            receive: () => {
                me.chatsWebSocket.receive(JSON.stringify({
                    method: 'forced_transfer',
                    params 
                }));

                spendTime(0);
            } 
        };
    };

    me.transferCreatingMessage = () => {
        const params = {
            chat: {
                chat_channel_id: 101,
                chat_channel_type: 'telegram',
                date_time: '2022-01-23T16:24:21.098210',
                id: 2718936,
                last_message: {
                    message: 'Больше не могу разговаривать с тобой, дай мне Веску!',
                    date: '2022-03-24T14:08:23.000Z',
                    is_operator: false,
                    resource_type: null
                },
                mark_ids: ['587', '213'],
                phone: null,
                site_id: 4663,
                status: 'active',
                visitor_id: 16479304,
                visitor_name: 'Върбанова Илиана Милановна',
                visitor_type: 'omni'
            },
            comment: 'Поговори с ней сама, я уже устала',
            from_employee_id: 20817
        };

        return {
            noLastMessage() {
                params.chat.last_message = null;
                return this;
            },

            receive: () => {
                me.chatsWebSocket.receive(JSON.stringify({
                    method: 'create_transfer',
                    params 
                }));

                spendTime(0);
            } 
        };
    };

    me.transferAcceptedMessage = () => {
        const params = {
            chat_id: 7189362,
            to_employee_id: 20817,
        };

        return {
            receive: () => {
                me.chatsWebSocket.receive(JSON.stringify({
                    method: 'transfer_accepted',
                    params 
                }));

                spendTime(0);
            } 
        };
    };

    me.requestTransfer = () => {
        const bodyParams = {
            chat_id: 7189362,
            comment: '',
            employees: [20817, undefined],
            is_force: true,
        };

        const addResponseModifiers = me => {
            me.notForced = () => {
                bodyParams.is_force = false;
                return me;
            };

            return me;
        };

        return addResponseModifiers({
            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectToHaveMethod('POST').
                    expectPathToContain('$REACT_APP_BASE_URL/transfer').
                    expectBodyToContain(bodyParams);

                return addResponseModifiers({
                    receiveResponse() {
                        request.respondSuccessfullyWith({
                            data: true,
                        });

                        Promise.runAll(false, true);
                        spendTime(0)
                        spendTime(0)
                    }
                });
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    me.forceTransferRequest = () => {
        const params = {
            transfers: [{
                chat_id: 2718935,
                from_operator_id: null,
                to_operator_id: 20818,
            }, undefined],
        };

        let respond = request => request.respondSuccessfullyWith({
            result: {
                data: {
                    results: [{
                        chat_id: 2718935,
                        error: null,
                        success: true,
                    }],
                    succeeded_count: 1,
                },
            },
        });

        const addResponseModifiers = me => {
            me.failed = () => {
                respond = request =>
                    request.respondUnsuccessfullyWith('500 Internal Server Error Server got itself in trouble');

                return me;
            };

            return me;
        };

        return addResponseModifiers({
            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectPathToContain('$REACT_APP_BASE_URL').
                    expectBodyToContain({
                        method: 'force_transfer',
                        params,
                    });

                return addResponseModifiers({
                    receiveResponse() {
                        respond(request);
                        Promise.runAll(false, true);
                        spendTime(0)
                    },
                });
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            },
        });
    };

    me.newMessage = () => {
        const params = {
            chat_id: 2718935,
            message: {
                id: 256085,
                source: 'visitor',
                text: 'Я люблю тебя',
                date: '2021-02-21T12:24:53.000Z',
                status: null,
                chat_id: 2718935,
                reply_to: null,
                resource: null,
                resourceName: null,
                employee_id: 23422,
                employee_name: 'Карадимова Веска Анастасовна',
                visitor_name: 'Помакова Бисерка Драгановна',
                front_message_uuid: '2go824jglsjgl842d',
                error_mnemonic: null
            },
            visitor_id: 16479303,
            employee_id: 20816,
            front_message_uuid: '2go824jglsjgl842d',
        };

        return {
            transferAcceptedMessage() {
                params.chat_id = 7189362;
                params.message.source = 'system';
                params.message.text = 'Трансфер принят';

                return this;
            },

            anotherMessage() {
                params.message.id = 256086;
                params.message.text = 'Ты моё солнышко';

                return this;
            },

            tenthChat() {
                params.chat_id = 7189362;
                params.message.chat_id = 7189362;
                return this;
            },

            ninthChat() {
                params.chat_id = 2718936;
                params.message.chat_id = 2718936;
                return this;
            },

            eighthChat() {
                params.chat_id = 2718943;
                params.message.chat_id = 2718943;
                params.visitor_id = 16479310;
                params.message.visitor_name = 'Луканова Мавруда Деяновна';

                return this;
            },

            seventhChat() {
                params.chat_id = 2718942;
                params.message.chat_id = 2718942;
                params.visitor_id = 16479309;
                params.message.visitor_name = 'Главчева Зора Христовна';

                return this;
            },

            sixthChat() {
                params.chat_id = 2718941;
                params.message.chat_id = 2718941;
                params.visitor_id = 16479308;
                params.message.visitor_name = 'Спасова Жарка Йордановна';

                return this;
            },

            fifthChat() {
                params.chat_id = 2718939;
                params.message.chat_id = 2718939;
                params.visitor_id = 16479307;
                params.message.visitor_name = 'Петрова Бойка Крастьовна';

                return this;
            },
            
            fourthChat() {
                params.chat_id = 2718938;
                params.message.chat_id = 2718938;
                params.visitor_id = 16479306;
                params.message.visitor_name = 'Радулова Дара Обретеновна';

                return this;
            },

            thirdChat() {
                params.chat_id = 2718937;
                params.message.chat_id = 2718937;
                params.visitor_id = 16479305;
                params.message.visitor_name = 'Томова Денка Райчовна';

                return this;
            },

            anotherChat() {
                params.chat_id = 582103;
                params.message.chat_id = 582103;
                return this;
            },

            withoutText() {
                params.message.text = '';
                return this;
            },

            fromOperator() {
                params.message.source = 'operator';
                return this;
            },

            withAttachment() {
                params.message.resource = {
                    id: 5829572,
                    type: 'photo',
                    mime: 'image/png',
                    filename: 'heart.png',
                    size: 925,
                    width: 48,
                    height: 48,
                    duration: null,
                    payload: `data:image/png;base64,${image}`,
                    thumbs: {
                        '100x100': {
                            payload: image
                        }
                    }
                };

                return this;
            },

            receive: () => {
                me.chatsWebSocket.receive(JSON.stringify({
                    method: 'new_message',
                    params 
                }));

                spendTime(0);
            } 
        };
    };

    me.newOfflineMessage = () => {
        const params = {
            offline_message: {
                id: 18222538,
                status: 'not_processed',
                site_id: 4663,
                visitor_id: 16479303,
                visitor_type: 'comagic',
                mark_ids: ['587', '213'],
                name: 'Томова Денка Райчовна',
                visitor_name: 'Рангелова Невена Цветковна',
                is_phone_auto_filled: true,
                date_time: '2020-02-10 11:17:49+03:00',
                phone: '74951523643',
                email: 'tomova@gmail.com',
                message: '',
                employee_id: null,
                contact: null
            }
        };

        return {
            noVisitorName() {
                params.offline_message.visitor_name = null;
                return this;
            },
            noName() {
                params.offline_message.name = '';
                return this;
            },
            receive: () => {
                me.chatsWebSocket.receive(JSON.stringify({
                    method: 'new_offline_message',
                    params 
                }));

                spendTime(0);
            } 
        };
    };

    me.statusChangedMessage = () => {
        const params = {
            chat_id: 2718935,
            status: 'read',
            message_id: 256085,
        };

        return {
            receive: () => {
                me.chatsWebSocket.receive(JSON.stringify({
                    method: 'message_status_changed',
                    params 
                }));

                spendTime(0);
            } 
        };
    };

    me.transfersFinishedMessage = () => {
        const interval = (1000 * 60 * 60 * 6) + (5 * 1000 * 60) + (12 * 1000) + 231;

        const params = {
            transferred_chats: [{
                chat: {
                    chat_channel_id: 101,
                    chat_channel_type: 'telegram',
                    date_time: utils.formatDate(new Date(
                        (new Date('2022-01-19T17:25:22.098210')).getTime() - interval * 7
                    )),
                    id: 2718942,
                    context: null,
                    last_message: {
                        message: `Сообщение #7`,
                        date: '2022-06-24T16:04:26.0003',
                        is_operator: false,
                        resource_type: null,
                        resource_name: null,
                    },
                    mark_ids: ['587', '213'],
                    phone: null,
                    site_id: 4663,
                    status: 'active',
                    visitor_id: 16479303,
                    visitor_name: 'Помакова Бисерка Драгановна',
                    visitor_type: 'omni',
                    unread_message_count: 0,
                },
                from: 2002676,
                to: 20816,
            }],
        };

        return {
            receive: () => me.chatsWebSocket.receive(JSON.stringify({
                method: 'transfers_finished',
                params 
            }))
        };
    };

    me.newChatCreatingMessage = () => {
        const params = {
            chat_id: 2718937,
            chat_channel_id: 101,
            chat_channel_type: 'whatsapp',
            visitor_id: 16479305,
            visitor_name: 'Томова Денка Райчовна',
            site_id: 4664,
            context: {
                phone: '79168283481'
            }
        };

        return {
            sixthChat() {
                params.visitor_id = 16479310;
                params.visitor_name = 'Луканова Мавруда Деяновна';
                params.chat_id = 2718943;

                return this;
            },
            
            fifthChat() {
                params.visitor_id = 16479309;
                params.visitor_name = 'Главчева Зора Христовна';
                params.chat_id = 2718942;

                return this;
            },
            
            fourthChat() {
                params.visitor_id = 16479308;
                params.visitor_name = 'Спасова Жарка Йордановна';
                params.chat_id = 2718941;

                return this;
            },

            thirdChat() {
                params.visitor_id = 16479307;
                params.visitor_name = 'Петрова Бойка Крастьовна';
                params.chat_id = 2718939;

                return this;
            },

            anotherChat() {
                params.visitor_id = 16479306;
                params.visitor_name = 'Радулова Дара Обретеновна';
                params.chat_id = 2718938;

                return this;
            },

            receive: () => me.chatsWebSocket.receive(JSON.stringify({
                method: 'new_chat',
                params 
            }))
        };
    };

    me.chatAcceptedMessage = () => {
        const params = {
            chat_id: 2718936,
            employee_id: 20816
        };

        return {
            anotherEmployee() {
                params.employee_id = 20817;
                return this;
            },

            newChat() {
                params.chat_id = 2718935;
                return this;
            },

            receive: () => me.chatsWebSocket.receive(JSON.stringify({
                method: 'chat_accepted',
                params 
            }))
        };
    };

    me.chatClosedMessage = () => {
        const params = {
            chat_id: 2718936
        };

        return {
            anotherChat() {
                params.chat_id = 7189362;
                return this;
            },

            newChat() {
                params.chat_id = 2718935;
                return this;
            },

            receive: () => me.chatsWebSocket.receive(JSON.stringify({
                method: 'chat_closed',
                params 
            }))
        };
    };

    me.channelEmployeeChangedMessage = () => ({
        receive: () => {
            me.chatsWebSocket.receive(JSON.stringify({
                method: 'channel_employee_changed',
            }));

            spendTime(0);
        } 
    });
    
    this.connectEventsWebSocket = function (index) {
        this.getEventsWebSocket(index).connect();
    };

    me.userLogoutRequest = () => {
        let respond = request => request.respondSuccessfullyWith({
            result: {
                data: {
                    success: true,
                },
            },
        });

        let params = {
            jwt: 'XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0',
        };

        const addResponseModifiers = me => {
            me.invalidJwt = () => {
                respond = request => request.respondUnsuccessfullyWith({
                    result: null,
                    error: {
                        code: '-33000',
                        message: 'Invalid JWT',
                    },
                });

                return me;
            };

            return me;
        };

        return addResponseModifiers({
            anotherAuthorizationToken() {
                params = {
                    jwt: '935jhw5klatxx2582jh5zrlq38hglq43o9jlrg8j3lqj8jf',
                };

                return this;
            },

            badRequest() {
                params.jwt = undefined;

                respond = request => request.respondUnsuccessfullyWith({
                    result: null,
                    error: {
                        code: '400',
                        message: {
                            error: {
                                code: 'bad_request',
                                message: [{
                                    loc: ['jwt'],
                                    msg: 'field required',
                                    type: 'value_error.missing',
                                }],
                            },
                        },
                    },
                });

                return this;
            },
            
            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectPathToContain('$REACT_APP_AUTH_URL').
                    expectToHaveMethod('POST').
                    expectBodyToContain({
                        method: 'logout',
                        params,
                    });

                return addResponseModifiers({
                    receiveResponse() {
                        respond(request);
                        Promise.runAll(false, true);
                        spendTime(0);
                    },
                });
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            },
        });
    };

    me.notProcessedCallsRequest = () => {
        const queryParams = {
            offset: '0',
            limit:  '10',
            date_from: '2019-12-16T00:00:00.000+03:00',
            date_till: '2019-12-19T23:59:59.999+03:00',
            from: undefined,
            to: undefined,
            call_directions: 'in,out',
            call_types: 'external,internal',
            is_not_processed: 'null',
            is_processed_by_any: undefined,
            group_ids: []
        };

        const addGroup = groupId => (queryParams.group_ids || (queryParams.group_ids = [])).push(groupId);

        const data = [{
            call_session_id: 980925444,
            call_type: 'external',
            comment: null,
            phone_book_contact_id: null,
            direction: 'in',
            duration: 20,
            file_links: null,
            contact_id: 839275,
            contact_name: 'Тодорова Гера',
            crm_contact_link: 'https://comagicwidgets.amocrm.ru/contacts/detail/218402',
            mark_ids: [],
            subscriber_number: '74950230625',
            virtual_number: '74950230630',
            start_time: '2019-12-19T08:03:02.522+03:00',
            is_lost: true
        }, {
            call_session_id: 980925445,
            call_type: 'external',
            comment: null,
            phone_book_contact_id: null,
            direction: 'in',
            duration: 24,
            file_links: null,
            contact_id: 839276,
            contact_name: 'Михайлова Врабка',
            crm_contact_link: null,
            mark_ids: [],
            subscriber_number: '74950230626',
            virtual_number: '74950230631',
            start_time: '2019-12-19T10:13:02.529+03:00',
            is_lost: false
        }];

        let receiveResponse = request => request.respondSuccessfullyWith({
            success: true,
            data
        });

        const addResponseModifiers = me => {
            me.noContactName = () => (data[1].contact_name = null, me);

            me.serverError = () => {
                receiveResponse = request =>
                    request.respondUnsuccessfullyWith('500 Internal Server Error Server got itself in trouble');

                return me;
            };
            
            return me;
        };

        return addResponseModifiers({
            isNotProcessedByAny() {
                this.notProcessed();
                queryParams.is_processed_by_any = '0';
                return this;
            },

            isProcessedByAny() {
                this.notProcessed();
                queryParams.is_processed_by_any = '1';
                return this;
            },

            notProcessed() {
                queryParams.is_not_processed = undefined;
                return this;
            },

            incoming() {
                this.notProcessed();
                queryParams.call_directions = 'in';
                return this;
            },

            outgoing() {
                this.notProcessed();
                queryParams.call_directions = 'out';
                return this;
            },

            external() {
                this.notProcessed();
                queryParams.call_types = 'external';
                return this;
            },

            internal() {
                this.notProcessed();
                queryParams.call_types = 'internal';
                return this;
            },

            group() {
                this.notProcessed();
                addGroup(89203);
                return this;
            },

            secondGroup() {
                this.notProcessed();
                addGroup(82958);
                return this;
            },

            thirdGroup() {
                this.notProcessed();
                addGroup(17589);
                return this;
            },

            expectToBeSent() {
                queryParams.group_ids && (queryParams.group_ids = queryParams.group_ids.join(','));

                const request = ajax.recentRequest().
                    expectPathToContain('/sup/api/v1/not_processed_calls').
                    expectToHaveMethod('GET').
                    expectQueryToContain(queryParams);

                return addResponseModifiers({
                    receiveResponse() {
                        receiveResponse(request);

                        Promise.runAll(false, true);
                        spendTime(0);
                    }
                });
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    me.commentUpdatingRequest = () => {
        let call_session_id = '980925444';

        const bodyParams = {
            comment: 'Другой комментарий'
        };

        return {
            anotherCall() {
                call_session_id = '980925445';
                return this;
            },

            empty() {
                bodyParams.comment = '';
                return this;
            },

            receiveResponse() {
                ajax.recentRequest().expectPathToContain(`/sup/api/v1/users/me/calls/${call_session_id}`).
                    expectToHaveMethod('PATCH').
                    expectBodyToContain(bodyParams).
                    respondSuccessfullyWith(true);

                spendTime(0);

                utils.isVisible(utils.querySelector('.clct-modal, .ui-modal, .cmgui-modal')) &&
                    mainTester.modalWindow.endTransition('transform');

                spendTime(0);
            }
        };
    };

    me.marksRequest = () => ({
        receiveResponse: () => {
            ajax.recentRequest().
                expectToHaveMethod('GET').
                expectPathToContain('/api/v1/marks').
                respondSuccessfullyWith({
                    data: [{
                        id: 23482439,
                        name: 'Некий тег',
                        is_system: false,
                        is_available_on_active_call: true,
                    }],
                });

            spendTime(0);
            spendTime(0);
            spendTime(0);
        }
    });

    me.markAddingRequest = () => ({
        receiveResponse: () => {
            ajax.recentRequest().
                expectToHaveMethod('PUT').
                expectPathToContain('/sup/api/v1/users/me/calls/980925444/marks/148').
                respondSuccessfullyWith(true);

            spendTime(0);
            spendTime(0);
            spendTime(0);
        }
    });

    me.markDeletingRequest = () => {
        let id = '88';

        return {
            anotherMark() {
                id = '495';
                return this;
            },

            expectToBeSent() {
                const request = ajax.recentRequest().
                    expectToHaveMethod('DELETE').
                    expectPathToContain(`/sup/api/v1/users/me/calls/980925444/marks/${id}`);

                return {
                    receiveResponse: () => {
                        request.respondSuccessfullyWith(true);

                        spendTime(0);
                        spendTime(0);
                        spendTime(0);
                    }
                };
            },

            receiveResponse() {
                return this.expectToBeSent().receiveResponse();
            }
        };
    };

    me.talkRecordRequest = () => {
        let path = 'https://app.comagic.ru/system/media/talk/1306955705/3667abf2738dfa0a95a7f421b8493d3c/',
            response = '29f2f28ofjowf829f';

        return {
            setFullRecord() {
                path = 'https://proxy.dev.uis.st:9099/files/session/1378329557/a463d88a0e55599eba24c3f4638fc17c';
                response = 'jh38470284j25802f';
                return this;
            },

            setSecond() {
                path = 'https://app.comagic.ru/system/media/talk/1306955705/baf9be6ace6b0cb2f9b0e1ed0738db1a/';
                response = 'j7927g028hhs084kf';
                return this;
            },

            setThird() {
                path = 'https://app.comagic.ru/system/media/talk/2938571928/2fj923fholfr32hlf498f8h18f1hfl1c/';
                response = 'h398j0184hhls0283';
                return this;
            },

            setFourth() {
                path = 'https://app.comagic.ru/system/media/talk/2938571928/298jfr28h923jf89h92g2lo3829woghc/';
                response = 'g818h9j3938403j33';
                return this;
            },

            second() {
                return this.setSecond();
            },

            third() {
                return this.setThird();
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            },

            expectToBeSent() {
                const request = ajax.recentRequest().
                    expectToHavePath(path).
                    expectToHaveMethod('GET');

                return {
                    receiveResponse() {
                        request.respondSuccessfullyWith(response);
                        Promise.runAll(false, true);
                        spendTime(0);
                        spendTime(0);
                    }
                };
            }
        };
    };

    me.lostCallsCountRequest = () => {
        let data = 0;

        const addResponseModifiers = me => {
            me.newCall = () => ((data = 1), me);
            return me
        };

        return addResponseModifiers({
            expectToBeSent: (requests) => {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectPathToContain('/sup/api/v1/lost_call_count').
                    expectToHaveMethod('GET');

                spendTime(0);

                return addResponseModifiers({
                    receiveResponse: () => {
                        request.respondSuccessfullyWith({data});
                        Promise.runAll(false, true);
                        spendTime(0);
                    }
                });
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    me.statsRequest = () => {
        const queryParams = {
            date_from: '2019-12-19T00:00:00.000+03:00',
            date_to: '2019-12-19T12:10:07.000+03:00'
        };

        const data = {
            status_1_duration: 61410,
            status_2_duration: 84490,
            status_3_duration: 104360,
            status_4_duration: 34272,
            status_5_duration: 13973,
            not_at_work_duration: 7826,
            auto_out_call_duration: 6822,
            not_at_workplace_duration: 3422,
            do_not_disturb_duration: 68372,
            break_duration: 2482,
            available_duration: 2083,
            in_call_count: 5729,
            out_call_count: 927,
            in_failed_count: 52749,
            in_success_count: 85297,
            out_failed_count: 7283,
            out_success_count: 6716,
            employee_full_name: 'Карадимова Веска Анастасовна',
            in_avg_talk_duration: 5617,
            in_sum_talk_duration: 17860,
            out_avg_talk_duration: 2663,
            out_sum_talk_duration: 9226,
            status_40489_duration: 57895,
            in_avg_answer_duration: 9373,
            out_avg_answer_duration: 27763,
            in_failed_transfer_count: 7627,
            in_success_transfer_count: 273,
            out_failed_transfer_count: 6723,
            out_success_transfer_count: 57823,
            in_call_count_details: {
                cdr_ids: null
            },
            out_call_count_details: {
                cdr_ids: null
            },
            in_failed_count_details: {
                cdr_ids: null
            },
            in_success_count_details: {
                cdr_ids: null
            },
            out_failed_count_details: {
                cdr_ids: null
            },
            out_success_count_details: {
                cdr_ids: null
            },
            in_avg_talk_duration_details: {
                cdr_ids: null
            },
            in_sum_talk_duration_details: {
                cdr_ids: null
            },
            out_avg_talk_duration_details: {
                cdr_ids: null
            },
            out_sum_talk_duration_details: {
                cdr_ids: null
            },
            in_avg_answer_duration_details: {
                cdr_ids: null
            },
            out_avg_answer_duration_details: {
                cdr_ids: null
            },
            in_failed_transfer_count_details: {
                cdr_ids: null
            },
            in_success_transfer_count_details: {
                cdr_ids: null
            },
            out_failed_transfer_count_details: {
                cdr_ids: null
            },
            out_success_transfer_count_details: {
                cdr_ids: null
            }
        };

        const headers = {
            Authorization: 'Bearer XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0',
            'X-Auth-Type': 'jwt'
        };

        const addResponseModifiers = me => {
            me.noInCallCount = () => (delete(data.in_call_count), me);

            me.anotherAvailableStatusDuration = () => {
                data.status_1_duration = 61410 + 24 * 60 * 60;
                return me;
            };

            return me
        };

        return addResponseModifiers({
            anotherAuthorizationToken() {
                headers.Authorization = 'Bearer 935jhw5klatxx2582jh5zrlq38hglq43o9jlrg8j3lqj8jf'
                return this;
            },

            secondEarlier() {
                queryParams.date_to = '2019-12-19T12:10:06.000+03:00';
                return this;
            },

            expectToBeSent: (requests) => {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectPathToContain('/sup/api/v1/employee_stats').
                    expectToHaveHeaders(headers).
                    expectToHaveMethod('GET').
                    expectQueryToContain(queryParams);

                spendTime(0);

                return addResponseModifiers({
                    receiveResponse: () => {
                        request.respondSuccessfullyWith({data});
                        Promise.runAll(false, true);
                        spendTime(0);
                    }
                });
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    me.outCallSessionEvent = () => {
        const phone = '79161234567';

        const params = {
            call_session_id: 182957828,
            call_source: 'va',
            is_internal: false,
            direction: 'out',
            virtual_phone_number: '+79161234567',
            contact_phone_number: '+79161234567',
            calling_phone_number: '+79161234567',
            contact_full_name: 'Шалева Дора',
            crm_contact_link: 'https://comagicwidgets.amocrm.ru/contacts/detail/382030',
            active_leads: [],
            is_final: true
        };

        const createMessage = () => ({
            phone,
            message: {
                name: 'out_call_session',
                type: 'event',
                params,
            }
        });

        return {
            notFinal() {
                params.crm_contact_link = null;
                params.is_final = false;

                return this;
            },

            unableToSearchForCrmContact() {
                delete(params.crm_contact_link);
                delete(params.is_final);

                return this;
            },

            activeLeads() {
                addActiveLeads(params);
                return this;
            },

            noName() {
                params.crm_contact_link = null;
                params.contact_full_name = null;
                return this;
            },

            createMessage,

            slavesNotification: () => ({
                expectToBeSent: () => {
                    const { message } = createMessage();

                    [
                        'virtual_phone_number',
                        'contact_phone_number',
                        'calling_phone_number'
                    ].forEach(param => (message.params[param] = params[param].slice(1)));

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
            }),

            receive() {
                me.eventsWebSocket.receiveMessage(createMessage().message);
                spendTime(0);
                spendTime(0);
                spendTime(0);
            }
        };
    };
    
    const addActiveLeads = params => (params.active_leads = [{
        url: 'https://comagicwidgets.amocrm.ru/leads/detail/3003649',
        name: 'По звонку на 79154394339',
        status: 'Открыт',
        pipeline: 'Переговоры'
    }, {
        url: 'https://comagicwidgets.amocrm.ru/leads/detail/3003651',
        name: 'По звонку с 79154394340',
        status: 'Закрыт',
        pipeline: 'Согласование договора'
    }]);

    me.outCallEvent = () => {
        const params = {
            calling_phone_number: '79161234567',
            contact_phone_number: '79161234567',
            virtual_phone_number: '79161234568',
            virtual_number_comment: null,
            call_source: 'va',
            call_session_id: 980925456,
            is_transfer: false,
            is_internal: false,
            direction: 'in',
            site_domain_name: 'somesite.com',
            search_query: 'Какой-то поисковый запрос, который не помещается в одну строчку',
            campaign_name: 'Некая рекламная кампания',
            auto_call_campaign_name: null,
            organization_name: 'ООО "Некая Организация"',
            contact_full_name: 'Шалева Дора',
            crm_contact_link: 'https://comagicwidgets.amocrm.ru/contacts/detail/382030',
            is_transfer: false,
            transferred_by_employee_full_name: '',
            active_leads: [],
            is_need_auto_answer: false,
            is_final: true
        };

        let phone = '79161234567';

        const createMessage = () => ({
            phone,
            message: {
                name: 'out_call',
                type: 'event',
                params
            }
        });

        return {
            subscriberCommentSpecified: function () {
                params.subscriber_comment = 'Некий комментарий ';
                return this;
            },

            contactNameWithWithDigits: function () {
                params.contact_full_name = 'Мой номер +7 (916) 234-56-78';
                return this;
            },

            knownContact: function () {
                params.contact_id = 1689283;
                params.crm_contact_link = null;
                return this;
            },
            
            anotherCallingPhoneNumber: function () {
                phone = '79161234570';
                params.calling_phone_number = '79161234570';
                return this;
            },
            
            anotherContactNumber: function () {
                params.contact_phone_number = '79161234570';
                return this;
            },

            clickToCall: function () {
                params.direction = 'out';
                return this;
            },

            notFinal: function () {
                params.crm_contact_link = null;
                params.contact_full_name = null;
                params.is_final = false;
                return this;
            },

            needAutoAnswer: function () {
                params.is_need_auto_answer = true;
                return this;
            },

            anotherPhone: function () {
                params.calling_phone_number = params.contact_phone_number = '79161234510';
                return this;
            },

            anotherPerson: function () {
                this.anotherPhone();
                params.contact_full_name = 'Гигова Петранка';
                return this;
            },

            outgoing: function () {
                params.direction = 'out';
                return this;
            },

            activeLeads() {
                addActiveLeads(params);
                return this;
            },

            noCrmContactLink: function () {
                params.crm_contact_link = null;
                return this;
            },

            autoCallCampaignName: function () {
                params.auto_call_campaign_name = 'Обзвон лидов ЖК Солнцево Парк';
                return this;
            },

            isTransfer() {
                params.transferred_by_employee_full_name = 'Бисерка Макавеева';
                params.is_transfer = true;
                return this;
            },

            longName() {
                params.contact_full_name = 'Кобыла и трупоглазые жабы искали цезию, нашли поздно утром свистящего хна';
                return this;
            },
            
            noName() {
                params.contact_full_name = null;
                crm_contact_link = null;
                return this;
            },

            getMessage: () => createMessage().message,
            createMessage,

            slavesNotification: () => {
                const notification = {
                    type: 'message',
                    data: {
                        type: 'notify_slaves',
                        data: {
                            type: 'websocket_message',
                            message: createMessage().message,
                        }
                    }
                };

                return {
                    expectToBeSent: () => me.nextCrosstabMessage().expectToContain(notification),
                    receive: () => (me.receiveCrosstabMessage(notification), spendTime(0))
                };
            },

            receive: () => {
                me.eventsWebSocket.receiveMessage(createMessage().message);
                spendTime(0);
                spendTime(0);
                spendTime(0);
            } 
        };
    };

    me.lostCallSessionEvent = () => {
        const params = {
            call_session_id: 980925456,
            direction: 'in'
        };

        const createMessage = () => ({
            name: 'lost_call_session',
            type: 'event',
            params
        });

        return {
            outgoing() {
                params.direction = 'out';
                return this;
            },

            anotherCallSessionId() {
                params.call_session_id = 980925450;
                return this;
            },

            slavesNotification: () => {
                const notification = {
                    type: 'message',
                    data: {
                        type: 'notify_slaves',
                        data: {
                            type: 'websocket_message',
                            message: createMessage()
                        }
                    }
                };

                return {
                    expectToBeSent: () => me.nextCrosstabMessage().expectToContain(notification),
                    receive: () => (me.receiveCrosstabMessage(notification), spendTime(0))
                };
            },

            receive: () => {
                me.eventsWebSocket.receiveMessage(createMessage());
                spendTime(0);
            } 
        };
    };

    /*
    me.extendAdditionalSlavesNotification((notification, state) => {
        notification.outCallEvent = () => {
            const { params } = me.outCallEvent().getMessage();

            [
                'virtual_number_comment',
                'mark_ids',
                'auto_call_campaign_name',
                'organization_name',
                'first_call',
            ].forEach(param => delete(params[param]));

            state.callsData = {
                '79161234567': params
            };

            return notification;
        };

        return notification;
    });
    */

    me.settingsUpdatingRequest = () => {
        const params = {};

        return {
            incomingCallSoundDisabled() {
                params.is_enable_incoming_call_sound = false;
                return this
            },

            isNeedDisconnectSignal() {
                params.is_need_disconnect_signal = true;
                return this
            },

            defaultRingtone() {
                params.ringtone = null;
                return this;
            },

            secondRingtone() {
                params.ringtone = 'softphone_ringtone2';
                return this;
            },

            thirdRingtone() {
                params.ringtone = 'softphone_ringtone3';
                return this;
            },

            callsAreManagedByAnotherDevice() {
                params.is_use_widget_for_calls = false;
                return this;
            },

            autoSetStatus() {
                params.is_need_auto_set_status = true;
                return this;
            },

            pauseOnLogin() {
                params.on_login_status_id = 2;
                return this;
            },

            dontDisturbOnLogout() {
                params.on_logout_status_id = 3;
                return this;
            },

            expectToBeSent() {
                const request = ajax.recentRequest().
                    expectPathToContain('/sup/api/v1/settings').
                    expectToHaveMethod('PATCH').
                    expectBodyToContain(params);

                return {
                    receiveResponse() {
                        request.respondSuccessfullyWith({
                            result: true
                        });

                        Promise.runAll(false, true);
                        spendTime(0)
                    }
                }
            },

            receiveResponse() {
                return this.expectToBeSent().receiveResponse();
            }
        };
    };

    me.getApplicationSpecificSettings = function () {
        return {
            application_version: '1.3.2',
            ice_servers: [{
                urls: ['stun:stun.uiscom.ru:19302']
            }],
            numb: '74950216806',
            number_capacity_id: 124824,
            sip_channels_count: 2,
            sip_host: 'voip.uiscom.ru',
            sip_login: '077368',
            sip_phone: '077368',
            sip_password: 'e2tcXhxbfr',
            ws_url: '/ws/XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0',
            is_need_hide_numbers: false,
            is_extended_integration_available: true,
            is_use_widget_for_calls: true,
            is_need_open_widget_on_call: true,
            is_need_close_widget_on_call_finished: false,
            number_capacity_usage_rule: 'auto',
        };
    };

    me.settingsRequest = () => {
        let shouldTriggerScrollRecalculation = true;

        const response = {
            data: me.getApplicationSpecificSettings() 
        };

        let respond = request => {
            response.data = me.addDefaultSettings(response.data);
            request.respondSuccessfullyWith(response);
        };

        const headers = {
            Authorization: 'Bearer XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0',
            'X-Auth-Type': 'jwt'
        };

        const addResponseModifiers = (me, response) => {
            me.undefinedParams = () => {
                delete(response.data.is_need_auto_change_sip_number_capacity_before_call);
                delete(response.data.is_need_disconnect_signal);
                delete(response.data.on_login_status_id);
                delete(response.data.on_logout_status_id);
                delete(response.data.is_need_auto_set_status);
                delete(response.data.is_need_open_widget_on_call);
                delete(response.data.is_need_close_widget_on_call_finished);

                return me;
            };

            me.anotherWsUrl = () => ((
                response.data.ws_url = 'wss://softphone-events-server.com/sup/ws/XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0'
            ), me);

            me.dontTriggerScrollRecalculation = () => ((shouldTriggerScrollRecalculation = false), me);
            me.shouldHideNumbers = () => ((response.data.is_need_hide_numbers = true), me);
            me.incomingCallSoundDisabled = () => ((response.data.is_enable_incoming_call_sound = false), me);;

            me.shouldCloseWidgetOnCallFinished = () => {
                response.data.is_need_close_widget_on_call_finished = true;
                return me;
            };

            me.noTelephony = () => {
                Object.keys(response.data).forEach(key => ![
                    'ws_url',
                    'sip_channels_count',
                    'ice_servers',
                    'application_version'
                ].includes(key) && delete(response.data[key]));

                ['sip_host', 'sip_login', 'sip_phone', 'sip_password'].forEach(key => (response.data[key] = null));

                return me;
            };

            me.isNeedDisconnectSignal = () => {
                response.data.is_need_disconnect_signal = true;
                return me
            };

            const ringtone = number => {
                response.data.ringtone = `softphone_ringtone${number}`;

                response.data.ringtone_file = {
                    mtime: 1556529288674,
                    link: `https://somehost.com/softphone_ringtone${number}.mp3`
                };

                return me;
            };

            me.secondRingtone = () => ringtone('2');
            me.thirdRingtone = () => ringtone('3');

            me.autoSetStatus = () => {
                response.data.is_need_auto_set_status = true;
                return me;
            };

            me.pauseOnLogin = () => {
                response.data.on_login_status_id = 2;
                return me;
            };

            me.dontDisturbOnLogout = () => {
                response.data.on_logout_status_id = 3;
                return me;
            };

            me.setInvalidRTUConfig = () => {
                response.data.rtu_webrtc_urls = ['wss://rtu-webrtc.uiscom.ru'],
                response.data.sip_phone = '076909';
                return me;
            };

            me.sipPropertySpecified = () => {
                response.data.sip_channels_count = 1;
                response.data.ice_servers = [];

                response.data.sip = {
                    engine: 'janus_webrtc',
                    sip_channels_count: 2,
                    webrtc_urls: ['wss://rtu-webrtc.uiscom.ru'],
                    sip_phone: '076909',
                    sip_host: 'pp-rtu.uis.st:443',
                    sip_login: 'Kf98Bzv3',
                    sip_password: 'e2tcXhxbfr',
                    ice_servers: [{
                        urls: ['stun:stun.uiscom.ru:19302']
                    }],
                };

                return me;
            };

            me.setRTU = () => {
                response.data.webrtc_urls = ['wss://webrtc.uiscom.ru'];
                response.data.sip_phone = '076909';
                response.data.rtu_sip_host = 'pp-rtu.uis.st:443';
                response.data.sip_login = 'Kf98Bzv3';
                response.data.sip_password = 'e2tcXhxbfr';

                return me;
            };

            me.callsAreManagedByAnotherDevice = () => {
                response.data.is_use_widget_for_calls = false;
                return me;
            };

            me.accessTokenExpired = () => {
                Object.keys(response).forEach(key => delete(response[key]));
                respond = request => request.respondUnauthorizedWith(response);

                response.error = {
                    code: 401,
                    message: 'Token has been expired',
                    mnemonic: 'expired_token',
                    is_smart: false
                };

                return me;
            };

            me.accessTokenInvalid = () => {
                Object.keys(response).forEach(key => delete(response[key]));
                respond = request => request.respondUnauthorizedWith(response);

                response.error = {
                    code: 401,
                    message: 'Token is not active or invalid',
                    mnemonic: 'invalid_token',
                    is_smart: false
                };

                return me;
            };

            me.allowNumberCapacitySelect = () => {
                response.data.number_capacity_usage_rule = 'fixed';
                return me;
            };

            me.numberCapacityComment = () => {
                response.data.number_capacity_comment = 'Отдел консалтинга';
                return me;
            };

            me.longNumberCapacityComment = () => {
                response.data.number_capacity_comment = new Array(8).fill(null).map(() =>
                    'Кобыла и трупоглазые жабы искали цезию, нашли поздно утром свистящего хна.').join(' ');
                return me;
            };

            return me;
        };

        const request = addResponseModifiers({
            ssoAuth: () => (headers['X-Auth-Type'] = undefined, request),

            anotherAuthorizationToken: () =>
                ((headers.Authorization = 'Bearer 935jhw5klatxx2582jh5zrlq38hglq43o9jlrg8j3lqj8jf'), request),

            thirdAuthorizationToken: () =>
                ((headers.Authorization = 'Bearer 2924lg8hg95gl8h3g2lg8o2hgg8shg8olg8qg48ogih7h29'), request),

            expectToBeSent: (requests) => {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectPathToContain('/sup/api/v1/settings').
                    expectToHaveMethod('GET').
                    expectToHaveHeaders(headers);

                return addResponseModifiers({
                    receiveResponse: () => {
                        respond(request);

                        Promise.runAll(false, true);
                        spendTime(0)

                        shouldTriggerScrollRecalculation && me.triggerScrollRecalculation();
                    }
                }, response);
            },
            receiveResponse: () => request.expectToBeSent().receiveResponse()
        }, response);

        return request;
    };
    
    me.authLogoutRequest = () => {
        let response = {
            result: true
        };

        let respond = request => request.respondSuccessfullyWith(response);

        const headers = {
            Authorization: 'Bearer XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0',
            'X-Auth-Type': 'jwt'
        };

        const addResponseModifiers = me => {
            me.invalidToken = () => {
                response = {
                    error: {
                        code: 401,
                        message: 'Token is not active or invalid',
                        mnemonic: 'invalid_token',
                        is_smart: false,
                    },
                };

                respond = request => request.respondUnauthorizedWith(response);
                return me;
            };

            me.expiredToken = () => {
                response = {
                    error: {
                        code: 401,
                        message: 'Token has been expired',
                        mnemonic: 'expired_token',
                        is_smart: false,
                    },
                };

                respond = request => request.respondUnauthorizedWith(response);
                return me;
            };

            return me;
        };

        return addResponseModifiers({
            dontCheckAuthorizationHeader() {
                delete(headers.Authorization);
                return this;
            },

            anotherAuthorizationToken() {
                headers.Authorization = 'Bearer 935jhw5klatxx2582jh5zrlq38hglq43o9jlrg8j3lqj8jf';
                return this;
            },

            ssoAuth() {
                headers['X-Auth-Type'] = undefined;
                return this;
            },
            
            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectPathToContain('\/sup\/auth\/logout').
                    expectToHaveHeaders(headers);

                return addResponseModifiers({
                    receiveResponse: () => {
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

    me.authCheckRequest = () => {
        let token = 'XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0',
            response = '',
            respond = request => request.respondSuccessfullyWith(response),
            xWidgetId = utils.expectToBeString();

        const processors = [];

        const getHeaders = () => ({
            Authorization: `Bearer ${token}`,
            'X-Auth-Type': 'jwt',
            'X-Widget-Id': xWidgetId,
        });

        const addResponseModifiers = me => {
            me.invalidToken = () => {
                response = {
                    error: {
                        code: 401,
                        message: 'Token is not active or invalid',
                        mnemonic: 'invalid_token',
                        is_smart: false
                    }
                };

                respond = request => request.respondUnauthorizedWith(response);
                return me;
            };

            me.expiredToken = () => {
                response = {
                    error: {
                        code: 401,
                        mnemonic: 'expired_token',
                        message: 'Token has been expired'
                    }
                };

                respond = request => request.respondUnauthorizedWith(response);
                return me;
            };

            return me;
        };

        return addResponseModifiers({
            ssoAuth() {
                processors.push(headers => (headers['X-Auth-Type'] = undefined));
                return this;
            },
            
            anotherAuthorizationToken() {
                token = '935jhw5klatxx2582jh5zrlq38hglq43o9jlrg8j3lqj8jf';
                return this;
            },
            
            thirdAuthorizationToken() {
                token = '2924lg8hg95gl8h3g2lg8o2hgg8shg8olg8qg48ogih7h29';
                return this;
            },

            knownWidgetId() {
                xWidgetId = '2b5af1d8-108c-4527-aceb-c93614b8a0da';
                return this;
            },

            xWidgetType() {
                processors.push(headers => (headers['X-Widget-Type'] = 'call_center_web'));
                return this;
            },

            expectToBeSent(requests) {
                const headers = getHeaders();
                processors.forEach(process => process(headers));

                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectToHavePath(`https://${softphoneHost}/sup/auth/check`).
                    expectToHaveHeaders(headers);

                return addResponseModifiers({
                    receiveResponse: () => {
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

    me.chatChannelTypeListRequest = () => ({
        expectToBeSent(requests) {
            const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                expectPathToContain('$REACT_APP_BASE_URL/operator/chat/channel_type/list').
                expectToHaveMethod('GET');

            return {
                receiveResponse() {
                    request.respondSuccessfullyWith({
                        data: []
                    });

                    Promise.runAll(false, true);
                    spendTime(0)
                }
            };
        },

        receiveResponse() {
            this.expectToBeSent().receiveResponse();
        }
    });

    me.markListRequest = () => ({
        expectToBeSent(requests) {
            const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                expectPathToContain('$REACT_APP_BASE_URL/operator/mark/list').
                expectToHaveMethod('GET');

            return {
                receiveResponse() {
                    request.respondSuccessfullyWith({
                        data: me.getMarks()
                    });

                    Promise.runAll(false, true);
                    spendTime(0)
                }
            };
        },

        receiveResponse() {
            this.expectToBeSent().receiveResponse();
        }
    });

    me.chatSettingsRequest = () => ({
        expectToBeSent(requests) {
            const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                expectPathToContain('$REACT_APP_BASE_URL/operator/settings').
                expectToHaveMethod('GET');

            const response = {
                is_contact_form_available: false,
                is_chat_acceptance_confirmation: true,
            };

            return {
                disabledChatAcceptanceConfirmation() {
                    response.is_chat_acceptance_confirmation = false;
                    return this;
                },

                receiveResponse() {
                    request.respondSuccessfullyWith(response);

                    Promise.runAll(false, true);
                    spendTime(0)
                }
            };
        },

        receiveResponse() {
            this.expectToBeSent().receiveResponse();
        }
    });

    me.chatChannelListRequest = () => ({
        expectToBeSent(requests) {
            const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                expectPathToContain('$REACT_APP_BASE_URL/operator/chat/channel/list').
                expectToHaveMethod('GET');

            return {
                receiveResponse() {
                    request.respondSuccessfullyWith({
                        data: [{
                            id: 101,
                            is_removed: false,
                            name: 'mrDDosT',
                            status: 'active',
                            status_reason: 'omni_request',
                            type: 'telegram'
                        }, {
                            id: 216395,
                            is_removed: true,
                            name: 'whatsapp',
                            status: 'active',
                            status_reason: '',
                            type: 'whatsapp'
                        }]
                    });

                    Promise.runAll(false, true);
                    spendTime(0)
                }
            };
        },

        receiveResponse() {
            this.expectToBeSent().receiveResponse();
        }
    });

    me.searchResultsRequest = () => {
        const processors = [];

        const params = {
            search_string: 'Сообщение #75'
        };

        const headers = {
            Authorization: undefined,
            'X-Auth-Token': 'XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0',
            'X-Auth-Type': 'jwt'
        };

        const response = {
            result: {
                data: {
                    found_list: [{
                        chat_channel_id: 101,
                        chat_channel_state: null,
                        chat_channel_type: 'telegram',
                        date_time: '2020-01-20T17:25:22.098210',
                        id: 7189362,
                        employee_id: null,
                        last_message: {
                            message: 'Сообщение #75',
                            date: '2022-06-24T16:04:26.0003',
                            is_operator: false,
                            resource_type: null,
                            resource_name: null
                        },
                        mark_ids: ['587', '213'],
                        phone: '79283810988',
                        site_id: 4663,
                        status: 'new',
                        visitor_id: 16479303,
                        name: 'Памакова Бисерка',
                        visitor_name: 'Помакова Бисерка Драгановна',
                        visitor_type: 'omni',
                        account_id: '425802',
                        is_phone_auto_filled: false,
                        unread_message_count: 0
                    }]
                }
            } 
        };

        const addResponseModifiers = me => {
            me.telegramPrivate = () => {
                response.result.data.found_list[0].chat_channel_type = 'telegram_private';
                return me;
            };

            me.active = () => {
                response.result.data.found_list[0].status = 'active';
                return me;
            };

            me.noVisitorType = () => {
                response.result.data.found_list[0].visitor_type = null;
                return me;
            };

            me.addNew = () => {
                response.result.data.found_list.push({
                    chat_channel_id: 101,
                    chat_channel_state: null,
                    chat_channel_type: 'telegram',
                    date_time: '2020-01-20T17:25:22.098210',
                    id: 7189365,
                    employee_id: null,
                    last_message: {
                        message: 'Сообщение в новом чате',
                        date: '2022-06-24T16:04:26.0003',
                        is_operator: false,
                        resource_type: null,
                        resource_name: null
                    },
                    mark_ids: ['587', '213'],
                    phone: '79283810988',
                    site_id: 4663,
                    status: 'new',
                    visitor_id: 16479303,
                    name: 'Памакова Бисерка',
                    visitor_name: 'Помакова Бисерка Драгановна',
                    visitor_type: 'omni',
                    account_id: '425802',
                    is_phone_auto_filled: false,
                    unread_message_count: 0
                });

                return me;
            };

            me.addNew = () => {
                response.result.data.found_list.push({
                    chat_channel_id: 101,
                    chat_channel_state: null,
                    chat_channel_type: 'telegram',
                    date_time: '2020-01-20T17:25:22.098210',
                    id: 7189365,
                    employee_id: null,
                    last_message: {
                        message: 'Сообщение в новом чате',
                        date: '2022-06-24T16:04:26.0003',
                        is_operator: false,
                        resource_type: null,
                        resource_name: null
                    },
                    mark_ids: ['587', '213'],
                    phone: '79283810988',
                    site_id: 4663,
                    status: 'new',
                    visitor_id: 16479303,
                    name: 'Памакова Бисерка',
                    visitor_name: 'Помакова Бисерка Драгановна',
                    visitor_type: 'omni',
                    account_id: '425802',
                    is_phone_auto_filled: false,
                    unread_message_count: 0
                });

                return me;
            };

            me.addNewChatOfCurrentEmployee = () => {
                response.result.data.found_list.push({
                    chat_channel_id: 101,
                    chat_channel_state: null,
                    chat_channel_type: 'telegram',
                    date_time: '2020-01-20T17:25:22.098210',
                    id: 7189367,
                    employee_id: 20816,
                    last_message: {
                        message: 'Сообщение в новом чате авторизованного сотрудника',
                        date: '2022-06-24T16:04:26.0003',
                        is_operator: false,
                        resource_type: null,
                        resource_name: null
                    },
                    mark_ids: ['587', '213'],
                    phone: '79283810988',
                    site_id: 4663,
                    status: 'new',
                    visitor_id: 16479303,
                    name: 'Памакова Бисерка',
                    visitor_name: 'Помакова Бисерка Драгановна',
                    visitor_type: 'omni',
                    account_id: '425802',
                    is_phone_auto_filled: false,
                    unread_message_count: 0
                });

                return me;
            };

            me.addActive = () => {
                response.result.data.found_list.push({
                    chat_channel_id: 101,
                    chat_channel_state: null,
                    chat_channel_type: 'telegram',
                    date_time: '2020-01-20T17:25:22.098210',
                    id: 7189366,
                    employee_id: 20816,
                    last_message: {
                        message: 'Сообщение в активном чате',
                        date: '2022-06-24T16:04:26.0003',
                        is_operator: false,
                        resource_type: null,
                        resource_name: null
                    },
                    mark_ids: ['587', '213'],
                    phone: '79283810988',
                    site_id: 4663,
                    status: 'active',
                    visitor_id: 16479303,
                    name: 'Памакова Бисерка',
                    visitor_name: 'Помакова Бисерка Драгановна',
                    visitor_type: 'omni',
                    account_id: '425802',
                    is_phone_auto_filled: false,
                    unread_message_count: 0
                });

                return me;
            };

            me.addActiveChatOfOtherEmployee = () => {
                response.result.data.found_list.push({
                    chat_channel_id: 101,
                    chat_channel_state: null,
                    chat_channel_type: 'telegram',
                    date_time: '2020-01-20T17:25:22.098210',
                    id: 7189368,
                    employee_id: 20817,
                    last_message: {
                        message: 'Сообщение в активном чате другого сотрудника',
                        date: '2022-06-24T16:04:26.0003',
                        is_operator: false,
                        resource_type: null,
                        resource_name: null
                    },
                    mark_ids: ['587', '213'],
                    phone: '79283810988',
                    site_id: 4663,
                    status: 'active',
                    visitor_id: 16479303,
                    name: 'Памакова Бисерка',
                    visitor_name: 'Помакова Бисерка Драгановна',
                    visitor_type: 'omni',
                    account_id: '425802',
                    is_phone_auto_filled: false,
                    unread_message_count: 0
                });

                return me;
            };

            me.addClosed = () => {
                response.result.data.found_list.push({
                    chat_channel_id: 101,
                    chat_channel_state: null,
                    chat_channel_type: 'telegram',
                    date_time: '2020-01-20T17:25:22.098210',
                    id: 7189370,
                    employee_id: 20816,
                    last_message: {
                        message: 'Сообщение в закрытом чате',
                        date: '2022-06-24T16:04:26.0003',
                        is_operator: false,
                        resource_type: null,
                        resource_name: null
                    },
                    mark_ids: ['587', '213'],
                    phone: '79283810988',
                    site_id: 4663,
                    status: 'closed',
                    visitor_id: 16479303,
                    name: 'Памакова Бисерка',
                    visitor_name: 'Помакова Бисерка Драгановна',
                    visitor_type: 'omni',
                    account_id: '425802',
                    is_phone_auto_filled: false,
                    unread_message_count: 0
                });

                return me;
            };

            me.addClosedChatOfOtherEmployee = () => {
                response.result.data.found_list.push({
                    chat_channel_id: 101,
                    chat_channel_state: null,
                    chat_channel_type: 'telegram',
                    date_time: '2020-01-20T17:25:22.098210',
                    id: 7189369,
                    employee_id: 20817,
                    last_message: {
                        message: 'Сообщение в закрытом чате дргугого сотрудника',
                        date: '2022-06-24T16:04:26.0003',
                        is_operator: false,
                        resource_type: null,
                        resource_name: null
                    },
                    mark_ids: ['587', '213'],
                    phone: '79283810988',
                    site_id: 4663,
                    status: 'closed',
                    visitor_id: 16479303,
                    name: 'Памакова Бисерка',
                    visitor_name: 'Помакова Бисерка Драгановна',
                    visitor_type: 'omni',
                    account_id: '425802',
                    is_phone_auto_filled: false,
                    unread_message_count: 0
                });

                return me;
            };
            
            me.addNewWaba = () => {
                response.result.data.found_list.push({
                    chat_channel_id: 101,
                    chat_channel_state: null,
                    chat_channel_type: 'waba',
                    date_time: '2020-02-20T17:26:23.98211',
                    id: 7189364,
                    employee_id: null,
                    mark_ids: ['587', '213'],
                    phone: '79283810988',
                    site_id: 4663,
                    status: null,
                    visitor_id: 16479311,
                    name: null,
                    visitor_name: null,
                    visitor_type: null,
                    account_id: '425802',
                    is_phone_auto_filled: false,
                    unread_message_count: 0
                });

                return me;
            };

            me.addNewWhatsApp = () => {
                response.result.data.found_list.push({
                    chat_channel_id: 101,
                    chat_channel_state: null,
                    chat_channel_type: 'whatsapp',
                    date_time: '2020-02-20T17:26:23.98211',
                    id: 7189364,
                    employee_id: null,
                    mark_ids: ['587', '213'],
                    phone: '79283810988',
                    site_id: 4663,
                    status: null,
                    visitor_id: 16479311,
                    name: null,
                    visitor_name: null,
                    visitor_type: null,
                    account_id: '425802',
                    is_phone_auto_filled: false,
                    unread_message_count: 0
                });

                return me;
            };

            me.addNewTelegram = () => {
                response.result.data.found_list.push({
                    chat_channel_id: 101,
                    chat_channel_state: null,
                    chat_channel_type: 'telegram',
                    date_time: '2020-02-20T17:26:23.98211',
                    id: 7189364,
                    employee_id: null,
                    mark_ids: ['587', '213'],
                    phone: '79283810988',
                    site_id: 4663,
                    status: null,
                    visitor_id: 16479311,
                    name: null,
                    visitor_name: null,
                    visitor_type: null,
                    account_id: '425802',
                    is_phone_auto_filled: false,
                    unread_message_count: 0
                });

                return me;
            };

            me.waba = () => {
                response.result.data.found_list[0].chat_channel_type = 'waba';
                return me;
            };

            me.whatsApp = () => {
                response.result.data.found_list[0].chat_channel_type = 'whatsapp';
                return me;
            };

            me.extIdSpecified = () => {
                processors.push(() => {
                    const {phone} = response.result.data.found_list[0];

                    response.result.data.found_list[0].ext_id = phone;
                    response.result.data.found_list[0].phone = null
                });

                return me;
            };

            me.noVisitorName = () => {
                response.result.data.found_list[0].visitor_name = null;
                return me;
            };

            me.noName = () => {
                response.result.data.found_list[0].name = null;
                return me;
            };

            me.newVisitor = () => {
                response.result.data.found_list[0].visitor_id = 679729;
                response.result.data.found_list[0].status = null;
                response.result.data.found_list[0].name = null;
                response.result.data.found_list[0].visitor_name = null;
                response.result.data.found_list[0].visitor_type = null;

                return me;
            };

            me.contactExists = () => {
                response.result.data.found_list[0].contact = {
                    first_name: 'Грета',
                    last_name: 'Бележкова',
                    id: 1689283,
                    email_list: ['endlesssprinп.of@comagic.dev'],
                    chat_channel_list: [{
                        type: 'whatsapp',
                        ext_id: '79283810988',
                        chat_channel_id: 216395
                    }, {
                        type: 'whatsapp',
                        ext_id: '79283810928' ,
                        chat_channel_id: 216395
                    }],
                    organization_name: 'UIS',
                    phone_list: ['79162729533'],
                    group_list: [],
                    personal_manager_id: 583783,
                    patronymic: 'Ервиновна',
                    full_name: 'Бележкова Грета Ервиновна',
                    is_chat_channel_active: false
                };

                return me;
            };

            me.noData = () => {
                response.result.data.found_list = [];
                return me;
            };

            return me;
        };

        return addResponseModifiers({
            onlyWhatsAppOut() {
                params.is_only_whatsapp_out = true;
                return this;
            },

            anotherSearchString() {
                params.search_string = '79283810988';
                return this;
            },

            noSearchString() {
                params.search_string = null;
                return this;
            },

            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectPathToContain('BASE_URL').
                    expectToHaveMethod('POST').
                    expectToHaveHeaders(headers).
                    expectBodyToContain({
                        method: 'get_search_results',
                        params,
                    });

                return addResponseModifiers({
                    receiveResponse() {
                        processors.forEach(process => process());
                        request.respondSuccessfullyWith(response);

                        Promise.runAll(false, true);
                        spendTime(0)
                        spendTime(0)
                    }
                });
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    me.visitorCardUpdatingRequest = () => {
        const card = {
            name: 'Помакова Бисерка Драгановна  ',
            phones: ['79164725823', undefined],
            emails: ['pomakova@gmail.com', undefined]
        };

        const addResponseModifiers = me => {
            me.noPhone = () => (card.phones = [undefined], me);
            me.anotherPhone = () => (card.phones = ['79162729534', undefined], me);
            return me;
        };

        return addResponseModifiers({
            anotherName() {
                card.name = 'Неделчева Роза Ангеловна';
                return this;
            },

            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectPathToContain('$REACT_APP_BASE_URL').
                    expectToHaveMethod('POST').
                    expectBodyToContain({
                        method: 'update_visitor_card',
                        params: {
                            visitor_id: 16479303,
                            card
                        }
                    });

                return addResponseModifiers({
                    receiveResponse() {
                        request.respondSuccessfullyWith({
                            result: true
                        });

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

    me.employeesRequest = () => {
        const addResponseModifiers = me => me;

        return addResponseModifiers({
            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectPathToContain('$REACT_APP_BASE_URL/employees').
                    expectToHaveMethod('GET');

                return addResponseModifiers({
                    receiveResponse() {
                        request.respondSuccessfullyWith({
                        });

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

    me.visitorCardRequest = () => {
        const params = {
            visitor_id: 16479303
        };

        const result = {
            visitor_id: 16479303,
            name: 'Помакова Бисерка Драгановна',
            phones: ['79164725823'],
            emails: ['pomakova@gmail.com'],
            company: 'UIS',
            comment: 'Некий посетитель'
        };

        const addResponseModifiers = me => {
            me.addSecondPhoneNumber = () => (result.phones.push('79164725824'), me);
            me.noPhone = () => (result.phones = [], me);
            me.noEmail = () => (result.emails = [], me);
            me.anotherVisitor = () => (params.visitor_id = 16479305, me);

            return me;
        };

        return addResponseModifiers({
            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectPathToContain('$REACT_APP_BASE_URL').
                    expectToHaveMethod('POST').
                    expectBodyToContain({
                        method: 'get_visitor_card',
                        params
                    });

                return addResponseModifiers({
                    receiveResponse() {
                        request.respondSuccessfullyWith({result});

                        Promise.runAll(false, true);
                        spendTime(0)
                        spendTime(0)
                    }
                });
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    me.acceptChatRequest = () => {
        const params = {
            chat_id: 7189362,
            visitor_id: 16479303
        };

        const addResponseModifiers = me => {
            me.anotherChat = () => {
                params.chat_id = 2718935;
                return me;
            };

            me.thirdChat = () => {
                params.chat_id = 2718937;
                return me;
            };

            me.anotherVisitor = () => {
                params.visitor_id = 16479305;
                return me;
            };

            return me;
        };

        return addResponseModifiers({
            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectPathToContain('$REACT_APP_BASE_URL').
                    expectToHaveMethod('POST').
                    expectBodyToContain({
                        method: 'accept_chat',
                        params
                    });

                return addResponseModifiers({
                    receiveResponse() {
                        request.respondSuccessfullyWith({
                            result: true 
                        });

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

    me.chatInfoRequest = () => {
        let chat_id = '7189362';
        const addResponseModifiers = me => me;

        return addResponseModifiers({
            anotherChat() {
                chat_id = '2718935';
                return this;
            },

            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectPathToContain('$REACT_APP_BASE_URL/operator/chat/info').
                    expectToHaveMethod('GET').
                    expectQueryToContain({ chat_id });

                return addResponseModifiers({
                    receiveResponse() {
                        request.respondSuccessfullyWith({
                            chat_channel_name: 'Некое имя канала',
                            traffic_source: 'Некиий источник трафика',
                            enter_page_url: 'https://somedomain.com/path/to/page',
                            enter_page_domain: 'somedomain.com',
                            utm_medium: 'smm',
                            utm_source: 'yandex_direct',
                            utm_campaign: 'deyskie_igrushki',
                            utm_term: 'gde_kupit_igrushki',
                            utm_referrer: 'example-source.com',
                            utm_expid: '67183125-2',
                            utm_concept: 'some_concept',
                            ac_name: 'Некая рекламная кампания'
                        });

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

    me.groupChatsRequest = () => {
        let chat_id = '7189362';
        const addResponseModifiers = me => me;

        return addResponseModifiers({
            anotherChat() {
                chat_id = '2718935';
                return this;
            },

            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectPathToContain('$REACT_APP_BASE_URL/operator/group-chats').
                    expectToHaveMethod('GET');

                return addResponseModifiers({
                    receiveResponse() {
                        request.respondSuccessfullyWith([]);

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

    me.chatPinningRequest = () => {
        const headers = {
            Authorization: undefined,
            'X-Auth-Token': 'XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0',
            'X-Auth-Type': 'jwt'
        };

        const params = {
            chat_id: 2718942
        };

        let respond = request => request.respondSuccessfullyWith({
            result: {
                data: true,
            },
        });

        const addResponseModifiers = me => {
            me.fatal = () => {
                respond = request =>
                    request.respondUnsuccessfullyWith('403: Максимальное количество закрепленных чатов - 5');

                return me;
            };

            me.limitExceeded = () => {
                respond = request => request.respondUnsuccessfullyWith({
                    mnemonic: 'max_number_pinned_chats',
                    message: 'Максимальное количество закрепленных чатов - 5'
                });

                return me;
            };

            me.failed = () => {
                respond = request => request.respondUnsuccessfullyWith({
                    mnemonic: 'some_error',
                    message: 'Максимальное количество закрепленных чатов - 5'
                });

                return me;
            };

            return me;
        };

        return addResponseModifiers({
            anotherChat() {
                params.chat_id = 2718935;
                return this;
            },
            
            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectToHavePath('https://$REACT_APP_BASE_URL/operator/chat/pin').
                    expectToHaveHeaders(headers).
                    expectBodyToContain(params);

                spendTime(0)

                return addResponseModifiers({
                    receiveResponse() {
                        respond(request);
                        Promise.runAll(false, true);
                        spendTime(0)
                        spendTime(0)
                        mainTester.modalWindow.endTransition('transform');
                    },
                });
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            },
        });
    };

    me.chatUnpinningRequest = () => {
        const params = {
            chat_id: 2718942
        };

        let respond = request => request.respondSuccessfullyWith({
            result: {
                data: true,
            },
        });

        const addResponseModifiers = me => me;

        return addResponseModifiers({
            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectToHavePath('https://$REACT_APP_BASE_URL/operator/chat/unpin').
                    expectBodyToContain(params);

                return addResponseModifiers({
                    receiveResponse() {
                        respond(request);
                        Promise.runAll(false, true);
                        spendTime(0)
                        spendTime(0)
                    },
                });
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            },
        });
    };

    me.chatListRequest = () => {
        let total = 75;

        const totals = {
            active_chat_count: total,
            new_chat_count: total,
        };

        let respond = (request, data) => {
            request.respondSuccessfullyWith({
                result: {data} 
            });
        };

        const processors = [],
            paramsProcessors = [];

        const params = {
            app_id: null,
            employee_id: null,
            statuses: ['new', undefined],
            limit: 30,
            offset: 0,
            scroll_from_date: null,
            scroll_direction: 'down',
            is_other_employees_appeals: undefined,
            is_show_pinned_chats: undefined,
        };

        const initialData = [{
            chat_channel_id: 101,
            chat_channel_type: 'telegram',
            date_time: '2022-01-21T16:24:21.098210',
            id: 2718935,
            context: null,
            last_message: {
                message: 'Привет',
                date: '2022-02-22T13:07:22.000Z',
                is_operator: false,
                resource_type: null,
                resource_name: null
            },
            mark_ids: ['587', '213'],
            phone: null,
            site_id: 4663,
            status: 'new',
            visitor_id: 16479303,
            visitor_name: 'Помакова Бисерка Драгановна',
            visitor_type: 'omni',
            unread_message_count: 3,
            is_pinned: false,
        }, {
            chat_channel_id: 101,
            chat_channel_type: 'telegram',
            date_time: '2022-01-20T17:25:22.098210',
            id: 2718936,
            context: null,
            last_message: {
                message: 'Здравствуй',
                date: '2022-06-24T16:04:26.0003',
                is_operator: false,
                resource_type: null,
                resource_name: null
            },
            mark_ids: ['587', '213'],
            phone: null,
            site_id: 4663,
            status: 'active',
            visitor_id: 16479303,
            visitor_name: 'Помакова Бисерка Драгановна',
            visitor_type: 'omni',
            unread_message_count: 0,
            is_pinned: false,
        }];

        const getAdditionalData = ({skipCount = 0, count}) => {
            const firstId = skipCount + 2718936,
                lastId = count + firstId,
                data = [],
                interval = (1000 * 60 * 60 * 6) + (5 * 1000 * 60) + (12 * 1000) + 231;

            let number = 1 + skipCount;

            for (id = firstId; id < lastId; id ++) {
                data.push({
                    chat_channel_id: 101,
                    chat_channel_type: 'telegram',
                    date_time: utils.formatDate(new Date(
                        (new Date('2022-01-19T17:25:22.098210')).getTime() - interval * number
                    )),
                    id,
                    context: null,
                    last_message: {
                        message: `Сообщение #${number}`,
                        date: '2022-06-24T16:04:26.0003',
                        is_operator: false,
                        resource_type: null,
                        resource_name: null
                    },
                    mark_ids: ['587', '213'],
                    phone: null,
                    site_id: 4663,
                    status: 'active',
                    visitor_id: 16479303,
                    visitor_name: 'Помакова Бисерка Драгановна',
                    visitor_type: 'omni',
                    unread_message_count: 0,
                    is_pinned: false,
                });

                number ++;
            }

            return data;
        };

        let getData = () => initialData.concat(getAdditionalData({
            count: 28,
            skipCount: 2
        }));
        
        const pinnedChatsExist = ids => processors.push(
            data => {
                const isPinnedChat = chat => ids.includes(chat.id);

                data.chats = data.chats.
                    filter(isPinnedChat).
                    map(chat => ({
                        ...chat,
                        is_pinned: true,
                    })).
                    concat(data.chats.filter(chat => !isPinnedChat(chat)));
            }
        );

        function addResponseModifiers (me) {
            me.pinned = () => (processors.push(
                data => (data.chats = data.chats.map(chat => ({
                    ...chat,
                    is_pinned: true,
                })))
            ), me);

            me.pinnedChatExist = () => (pinnedChatsExist([2718942]), me);
            me.twoPinnedChatExist = () => (pinnedChatsExist([2718941, 2718942]), me);

            me.shortMarks = () => (processors.push(data => {
                data.chats[0].mark_ids = ['89', '86'];
            }), me);

            me.onlyActiveChats = count => {
                totals.new_chat_count = 0;
                totals.active_with_unread_count = 0;
                totals.active_chat_count = 3;
                totals.closed_chat_count = 0;

                return me;
            };

            me.fewUnreadMessages = () => {
                totals.new_chat_count = 5;
                totals.active_with_unread_count = 3;
                totals.active_chat_count = 4;
                totals.closed_chat_count = 2;

                return me;
            };

            me.noUnreadMessages = () => {
                totals.new_chat_count = 0;
                totals.active_with_unread_count = 0;
                totals.active_chat_count = 4;
                totals.closed_chat_count = 2;

                return me;
            };

            me.failed = () => {
                respond = request => request.respondSuccessfullyWith({
                    result: null,
                    error: {
                        code: 500,
                        message: [{
                            loc: ['__root__'],
                            msg: 'Server got itself in trouble',
                            type: 'value_error.exception'
                        }]
                    }
                });

                return me;
            };

            me.noData = () => (processors.push(data => {
                data.active_chat_count = 0;
                data.new_chat_count = 0;
                data.chats = [];
            }), me);

            me.count = count => (getData = () => getAdditionalData({
                count,
                skipCount: 0
            }), me);

            me.whatsapp = () => (processors.push(data => (data.chats[0].chat_channel_type = 'whatsapp')), me);

            me.legacyChannel = () => (processors.push(data => data.chats.forEach(item => delete(item.ext_id))), me);

            me.nothingFound = () => ((data = []), me);

            me.noVisitorName = () => {
                processors.push(data => data.chats.forEach(item => (item.visitor_name = null)));
                return me;
            };

            me.phoneAutoFilled = () => {
                processors.push(data => (data.chats[0].is_phone_auto_filled = true));
                return me;
            };

            me.extIdSpecified = () => {
                processors.push(data => {
                    data.chats[0].ext_id = '79283810928';
                    data.chats[0].context = null; 
                });

                return me;
            };

            me.phoneSpecified = () => {
                processors.push(data => {
                    data.chats[0].phone = '79283810928';
                    data.chats[0].context = null; 
                });

                return me;
            };

            me.contactExists = () => {
                processors.push(data => (data.chats[0].contact = {
                    first_name: 'Грета',
                    last_name: 'Бележкова',
                    id: 1689283,
                    email_list: ['endlesssprinп.of@comagic.dev'],
                    chat_channel_list: [
                        { type: 'whatsapp', ext_id: '79283810988' },
                        { type: 'whatsapp', ext_id: '79283810928' },
                    ],
                    organization_name: 'UIS',
                    phone_list: ['79162729533'],
                    group_list: [],
                    personal_manager_id: 583783,
                    patronymic: 'Ервиновна',
                    full_name: 'Бележкова Грета Ервиновна',
                    is_chat_channel_active: false
                }));

                return me;
            };

            me.anotherContactExists = (index = 0) => {
                processors.push(data => (data.chats[index].contact = {
                    first_name: 'Елеонора',
                    last_name: 'Радкова',
                    id: 1689587,
                    email_list: ['endlesssprinп.of@comagic.dev'],
                    chat_channel_list: [
                        { type: 'whatsapp', ext_id: '79283810988' },
                        { type: 'whatsapp', ext_id: '79283810928' },
                    ],
                    organization_name: 'UIS',
                    phone_list: ['79162729533'],
                    group_list: [],
                    personal_manager_id: 583783,
                    patronymic: 'Стефановна',
                    full_name: 'Радкова Елеонора Стефановна',
                    is_chat_channel_active: false
                }));

                return me;
            };

            me.lastMessageFromOperator = () => {
                initialData[0].last_message.is_operator = true;
                return me;
            };

            me.lastMessageWithAttachment = () => {
                initialData[0].last_message.resource_type = 'photo';
                initialData[0].last_message.resource_name = 'heart.png';
                initialData[0].last_message.message = '';

                return me;
            };

            return me;
        }

        const chat = chat_id => {
            paramsProcessors.push(() => {
                params.is_show_pinned_chats = undefined;
                params.statuses = undefined;
            });

            params.scroll_direction = undefined;
            params.scroll_from_date = undefined;
            params.app_id = undefined;
            params.employee_id = undefined;
            params.chat_id = chat_id;
            params.limit = 1;
        };

        const setStatus = status => {
            params.statuses = [status, undefined];
            processors.push(data => data.chats.forEach(chat => (chat.status = status)));
        };

        return addResponseModifiers({
            anyScrollFromDate() {
                delete(params.scroll_from_date);
                return this;
            },

            isOtherEmployeesAppeals() {
                params.is_other_employees_appeals = true;
                paramsProcessors.push(() => (params.is_show_pinned_chats = undefined));
                return this;
            },

            forCurrentEmployee() {
                params.app_id = 1103;
                params.employee_id = 20816;

                return this;
            },

            afterSingleChat() {
                params.scroll_from_date = '2022-01-19T11:20:09.867+03:00';

                getData = () => getAdditionalData({
                    count: 0,
                    skipCount: 0
                });

                return this;
            },

            secondPage() {
                params.scroll_from_date = '2022-01-12T02:49:15.168+03:00';
                
                getData = () => getAdditionalData({
                    count: 30,
                    skipCount: 30
                });

                return this;
            },

            thirdPage() {
                params.scroll_from_date = '2022-01-04T12:13:08.238+03:00';
                
                getData = () => getAdditionalData({
                    count: 15,
                    skipCount: 60
                });

                return this;
            },

            active() {
                params.is_show_pinned_chats = true;
                setStatus('active');
                return this;
            },

            closed() {
                setStatus('closed');
                return this;
            },

            thirdChat() {
                chat(7189362);

                getData = () => [{
                    context: {
                        phone: '79283810928'
                    },
                    chat_channel_id: 101,
                    chat_channel_state: null,
                    chat_channel_type: 'telegram',
                    date_time: '2020-01-20T17:25:22.098210',
                    id: 7189362,
                    employee_id: null,
                    is_chat_channel_active: false,
                    last_message: {
                        message: 'Сообщение #75',
                        date: '2022-06-24T16:04:26.0003',
                        is_operator: false,
                        resource_type: null,
                        resource_name: null
                    },
                    mark_ids: ['587', '213'],
                    phone: null,
                    name: 'Помакова Бисерка Драгановна',
                    site_id: 4663,
                    status: 'new',
                    visitor_id: 16479303,
                    visitor_name: 'Помакова Бисерка Драгановна',
                    visitor_type: 'omni',
                    account_id: null,
                    is_phone_auto_filled: false,
                    unread_message_count: 0,
                    is_pinned: false,
                }];

                return this;
            },

            anotherChat() {
                chat(2718936);
                return this;
            },

            fourthChat() {
                chat(582103);
                return this;
            },
            
            tenthChat() {
                chat(2718943);

                getData = () => [{
                    context: {
                        phone: '79283810928'
                    },
                    chat_channel_id: 101,
                    chat_channel_state: null,
                    chat_channel_type: 'telegram',
                    date_time: '2020-01-20T17:25:22.098210',
                    id: 2718943,
                    employee_id: null,
                    is_chat_channel_active: false,
                    last_message: {
                        message: 'Я люблю тебя',
                        date: '2021-02-21T12:24:53.000Z',
                        is_operator: false,
                        resource_type: null,
                        resource_name: null
                    },
                    mark_ids: ['587', '213'],
                    phone: null,
                    name: 'Помакова Бисерка Драгановна',
                    site_id: 4663,
                    status: 'new',
                    visitor_id: 16479310,
                    visitor_name: 'Луканова Мавруда Деяновна',
                    visitor_type: 'omni',
                    account_id: null,
                    is_phone_auto_filled: false,
                    unread_message_count: 1,
                    is_pinned: false,
                }];

                return this;
            },
            
            ninethChat() {
                chat(2718942);

                getData = () => [{
                    context: {
                        phone: '79283810928'
                    },
                    chat_channel_id: 101,
                    chat_channel_state: null,
                    chat_channel_type: 'telegram',
                    date_time: '2020-01-20T17:25:22.098210',
                    id: 2718942,
                    employee_id: null,
                    is_chat_channel_active: false,
                    last_message: {
                        message: 'Я люблю тебя',
                        date: '2021-02-21T12:24:53.000Z',
                        is_operator: false,
                        resource_type: null,
                        resource_name: null
                    },
                    mark_ids: ['587', '213'],
                    phone: null,
                    name: 'Помакова Бисерка Драгановна',
                    site_id: 4663,
                    status: 'new',
                    visitor_id: 16479309,
                    visitor_name: 'Главчева Зора Христовна',
                    visitor_type: 'omni',
                    account_id: null,
                    is_phone_auto_filled: false,
                    unread_message_count: 1,
                    is_pinned: false,
                }];

                return this;
            },
            
            eighthChat() {
                chat(2718941);

                getData = () => [{
                    context: {
                        phone: '79283810928'
                    },
                    chat_channel_id: 101,
                    chat_channel_state: null,
                    chat_channel_type: 'telegram',
                    date_time: '2020-01-20T17:25:22.098210',
                    id: 2718941,
                    employee_id: null,
                    is_chat_channel_active: false,
                    last_message: {
                        message: 'Я люблю тебя',
                        date: '2021-02-21T12:24:53.000Z',
                        is_operator: false,
                        resource_type: null,
                        resource_name: null
                    },
                    mark_ids: ['587', '213'],
                    phone: null,
                    name: 'Помакова Бисерка Драгановна',
                    site_id: 4663,
                    status: 'new',
                    visitor_id: 16479308,
                    visitor_name: 'Спасова Жарка Йордановна',
                    visitor_type: 'omni',
                    account_id: null,
                    is_phone_auto_filled: false,
                    unread_message_count: 1,
                    is_pinned: false,
                }];

                return this;
            },
            
            seventhChat() {
                chat(2718939);

                getData = () => [{
                    context: {
                        phone: '79283810928'
                    },
                    chat_channel_id: 101,
                    chat_channel_state: null,
                    chat_channel_type: 'telegram',
                    date_time: '2020-01-20T17:25:22.098210',
                    id: 2718939,
                    employee_id: null,
                    is_chat_channel_active: false,
                    last_message: {
                        message: 'Я люблю тебя',
                        date: '2021-02-21T12:24:53.000Z',
                        is_operator: false,
                        resource_type: null,
                        resource_name: null
                    },
                    mark_ids: ['587', '213'],
                    phone: null,
                    name: 'Помакова Бисерка Драгановна',
                    site_id: 4663,
                    status: 'new',
                    visitor_id: 16479307,
                    visitor_name: 'Петрова Бойка Крастьовна',
                    visitor_type: 'omni',
                    account_id: null,
                    is_phone_auto_filled: false,
                    unread_message_count: 1,
                    is_pinned: false,
                }];

                return this;
            },

            sixthChat() {
                chat(2718938);

                getData = () => [{
                    context: {
                        phone: '79283810928'
                    },
                    chat_channel_id: 101,
                    chat_channel_state: null,
                    chat_channel_type: 'telegram',
                    date_time: '2020-01-20T17:25:22.098210',
                    id: 2718938,
                    employee_id: null,
                    is_chat_channel_active: false,
                    last_message: {
                        message: 'Я люблю тебя',
                        date: '2021-02-21T12:24:53.000Z',
                        is_operator: false,
                        resource_type: null,
                        resource_name: null
                    },
                    mark_ids: ['587', '213'],
                    phone: null,
                    name: 'Помакова Бисерка Драгановна',
                    site_id: 4663,
                    status: 'new',
                    visitor_id: 16479306,
                    visitor_name: 'Радулова Дара Обретеновна',
                    visitor_type: 'omni',
                    account_id: null,
                    is_phone_auto_filled: false,
                    unread_message_count: 1,
                    is_pinned: false,
                }];

                return this;
            },

            fifthChat() {
                chat(2718937);

                getData = () => [{
                    context: {
                        phone: '79283810928'
                    },
                    chat_channel_id: 101,
                    chat_channel_state: null,
                    chat_channel_type: 'telegram',
                    date_time: '2020-01-20T17:25:22.098210',
                    id: 2718937,
                    employee_id: null,
                    is_chat_channel_active: false,
                    last_message: {
                        message: 'Я люблю тебя',
                        date: '2021-02-21T12:24:53.000Z',
                        is_operator: false,
                        resource_type: null,
                        resource_name: null
                    },
                    mark_ids: ['587', '213'],
                    phone: null,
                    name: 'Помакова Бисерка Драгановна',
                    site_id: 4663,
                    status: 'new',
                    visitor_id: 16479305,
                    visitor_name: 'Томова Денка Райчовна',
                    visitor_type: 'omni',
                    account_id: null,
                    is_phone_auto_filled: false,
                    unread_message_count: 1,
                    is_pinned: false,
                }];

                return this;
            },
            
            chat() {
                chat(2718935);
                return this;
            },

            chatForReport() {
                chat(2718935);
                params.statuses = ['new', 'active', 'closed', undefined];
                return this;
            },

            expectToBeSent(requests) {
                paramsProcessors.forEach(process => process());

                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectPathToContain('$REACT_APP_BASE_URL').
                    expectToHaveMethod('POST').
                    expectBodyToContain({
                        method: 'get_chat_list',
                        params
                    });

                spendTime(0);

                return addResponseModifiers({
                    receiveResponse() {
                        const data = {
                            ...totals,
                            chats: getData()
                        };

                        processors.forEach(process => process(data));

                        data.chats.forEach(
                            chat => params.statuses?.[0] &&
                                params.statuses[1] === undefined &&
                                (chat.status = params.statuses[0])
                        );

                        respond(request, data);

                        Promise.runAll(false, true);
                        spendTime(0)
                        spendTime(0)
                        spendTime(0)

                        maybeRunSpinWrapperIntersectionCallback(getChatListSpinWrapper());
                    }
                });
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    me.operatorAccountRequest = () => ({
        expectToBeSent(requests) {
            const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                expectPathToContain('$REACT_APP_BASE_URL').
                expectToHaveMethod('POST').
                expectBodyToContain({
                    method: 'get_account',
                    params: {}
                });

            return {
                receiveResponse() {
                    request.respondSuccessfullyWith({
                        result: {
                            data: {
                                app_id: 1103,
                                app_state: 'active',
                                app_name: 'Карадимова Веска Анастасовна',
                                is_agent_app: false,
                                customer_id: 183510,
                                user_id: 151557,
                                employee_id: 20816,
                                user_type: 'user',
                                user_login: 'karadimova',
                                user_name: 'karadimova',
                                tp_id: 406,
                                tp_name: 'Comagic Enterprise',
                                crm_type: 'e2e_analytics',
                                lang: 'ru',
                                project: 'comagic',
                                timezone: 'Europe/Moscow',
                                permissions: [{
                                    'unit_id': 'call_recordings',
                                    'is_delete': true,
                                    'is_insert': false,
                                    'is_select': true,
                                    'is_update': true,
                                }, {
                                    'unit_id': 'tag_management',
                                    'is_delete': true,
                                    'is_insert': true,
                                    'is_select': true,
                                    'is_update': true,
                                }]
                            }
                        }
                    });

                    Promise.runAll(false, true);
                    spendTime(0)
                }
            };
        },

        receiveResponse() {
            this.expectToBeSent().receiveResponse();
        }
    });

    me.messageTemplateCreationRequest = () => ({
        expectToBeSent(requests) {
            const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                expectPathToContain('$REACT_APP_BASE_URL/operator/message_template/list').
                expectBodyToContain({
                    title: 'Шаблон 1',
                    text: '',
                    resources: [5829574],
                }).
                expectToHaveMethod('POST');

            return {
                receiveResponse() {
                    request.respondSuccessfullyWith({
                            result: {
                                data: true,
                            },
                        });

                    Promise.runAll(false, true);
                    spendTime(0)
                }
            };
        },

        receiveResponse() {
            this.expectToBeSent().receiveResponse();
        }
    });

    me.commonMessageTemplatesRequest = () => ({
        expectToBeSent(requests) {
            const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                expectPathToContain('$REACT_APP_BASE_URL/operator/common_message_templates').
                expectToHaveMethod('GET');

            return {
                receiveResponse() {
                    request.respondSuccessfullyWith([]);

                    Promise.runAll(false, true);
                    spendTime(0)
                }
            };
        },

        receiveResponse() {
            this.expectToBeSent().receiveResponse();
        }
    });

    me.messageTemplatesSettingsRequest = () => ({
        expectToBeSent(requests) {
            const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                expectPathToContain('$REACT_APP_BASE_URL/settings/message_templates').
                expectToHaveMethod('GET');

            return {
                receiveResponse() {
                    request.respondSuccessfullyWith({});

                    Promise.runAll(false, true);
                    spendTime(0)
                }
            };
        },

        receiveResponse() {
            this.expectToBeSent().receiveResponse();
        }
    });

    me.messageTemplateListRequest = () => ({
        expectToBeSent(requests) {
            const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                expectPathToContain('$REACT_APP_BASE_URL/operator/message_template/list').
                expectToHaveMethod('GET');

            return {
                receiveResponse() {
                    request.respondSuccessfullyWith([]);

                    Promise.runAll(false, true);
                    spendTime(0)
                }
            };
        },

        receiveResponse() {
            this.expectToBeSent().receiveResponse();
        }
    });

    me.countersRequest = () => {
        const params = {
            is_other_employee_chats: undefined,
        };

        const data = {
            new_chat_count: 75,
            active_chat_count: 75,
            active_with_unread_count: 75,
            closed_chat_count: 75
        };

        const processors = [];

        const addResponseModifiers = me => {
            me.singlePage = () => (Object.keys(data).forEach(name => (data[name] = 30)), me);
            me.newMessage = () => (processors.push(() => (data.active_with_unread_count ++)), me);
            me.readMessage = () => (processors.push(() => (data.active_with_unread_count --)), me);

            me.noNewChats = () => {
                data.new_chat_count = 0;
                return me;
            };

            me.noData = () => {
                data.new_chat_count = 0;
                data.active_chat_count = 0;
                data.active_with_unread_count = 0;
                data.closed_chat_count = 0;
                return me;
            };

            me.noActiveChats = () => {
                data.active_chat_count = 0;
                data.active_with_unread_count = 0;
                return me;
            };

            me.oneActiveChat = () => {
                data.active_chat_count = 1;
                data.active_with_unread_count = 1;
                return me;
            };

            me.noActiveChatsWithUnreadMessages = () => {
                data.active_with_unread_count = 0;
                return me;
            };

            me.noNewChatsWithUnreadMessages = () => {
                data.new_chat_count = 0;
                return me;
            };

            me.noClosedChats = () => {
                data.closed_chat_count = 0;
                return me;
            };

            me.fewUnreadMessages = () => {
                data.new_chat_count = 5;
                data.active_with_unread_count = 3;
                data.active_chat_count = 4;
                data.closed_chat_count = 2;

                return me;
            };

            me.noMessages = () => {
                data.new_chat_count = 1;
                data.active_chat_count = 0;
                data.active_with_unread_count = 0;
                data.closed_chat_count = 0;

                return me;
            };

            me.noUnreadMessages = () => {
                data.new_chat_count = 0;
                data.active_with_unread_count = 0;
                data.active_chat_count = 4;
                data.closed_chat_count = 2;

                return me;
            };

            me.anotherOtherChatsCount = () => {
                data.other_chat_count = 74;
                return me;
            };

            me.otherChatsExist = () => {
                data.other_chat_count = 75;
                return me;
            };

            return me;
        };

        return addResponseModifiers({
            otherEmployeeChats() {
                params.is_other_employee_chats = true;
                return this;
            },

            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectPathToContain('$REACT_APP_BASE_URL').
                    expectToHaveMethod('POST').
                    expectBodyToContain({
                        method: 'get_counters',
                        params,
                    });

                return addResponseModifiers({
                    receiveResponse() {
                        processors.forEach(process => process());

                        request.respondSuccessfullyWith({
                            result: {data}
                        });

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

    me.siteListRequest = () => ({
        expectToBeSent(requests) {
            const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                expectPathToContain('$REACT_APP_BASE_URL/operator/site/list').
                expectToHaveMethod('GET');

            return {
                receiveResponse() {
                    request.respondSuccessfullyWith({
                        data: [{
                            id: 2157,
                            domain_name: 'somedomain.com'
                        }]
                    });

                    Promise.runAll(false, true);
                    spendTime(0)
                }
            };
        },

        receiveResponse() {
            this.expectToBeSent().receiveResponse();
        }
    });

    me.chatTransferGroupsRequest = () => ({
        expectToBeSent(requests) {
            const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                expectPathToContain('$REACT_APP_BASE_URL/operator/chat_transfer_group/list').
                expectToHaveMethod('GET');

            return {
                receiveResponse() {
                    request.respondSuccessfullyWith([]);

                    Promise.runAll(false, true);
                    spendTime(0)
                    spendTime(0)
                }
            };
        },

        receiveResponse() {
            this.expectToBeSent().receiveResponse();
        }
    });

    me.listRequest = () => ({
        expectToBeSent(requests) {
            const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                expectPathToContain('$REACT_APP_BASE_URL/operator/list').
                expectToHaveMethod('GET');

            return {
                receiveResponse() {
                    request.respondSuccessfullyWith({
                        data: [{
                            id: 20816,
                            full_name: 'Карадимова Веска Анастасовна',
                            status_id: 1,
                            photo_link: null
                        }, {
                            id: 20817,
                            full_name: 'Чакърова Райна Илковна',
                            status_id: 1,
                            photo_link: null
                        }, {
                            id: 20818,
                            full_name: 'Костова Марвуда Любенова',
                            status_id: 5,
                            photo_link: null
                        }]
                    });

                    Promise.runAll(false, true);
                    spendTime(0)
                    spendTime(0)
                }
            };
        },

        receiveResponse() {
            this.expectToBeSent().receiveResponse();
        }
    });

    me.statusListRequest = () => {
        const data = [{
            id: 1,
            is_worktime: true,
            mnemonic: 'available',
            name: 'Доступен',
            is_select_allowed: true,
            description: 'все вызовы',
            color: '#48b882',
            icon_mnemonic: 'tick',
            is_auto_out_calls_ready: true,
            is_deleted: false,

            is_able_to_accept_chat_transfer: true,
            is_able_to_transfer_chat: true,
            is_able_to_accept_chat: true,
            is_able_to_close_chat_offline_message: true,
            is_able_in_forwarding_scenario: true,
            is_able_to_send_chat_messages: true,

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
            icon_mnemonic: 'pause',
            is_auto_out_calls_ready: true,
            is_deleted: false,

            is_able_to_accept_chat_transfer: true,
            is_able_to_transfer_chat: true,
            is_able_to_accept_chat: true,
            is_able_to_close_chat_offline_message: true,
            is_able_in_forwarding_scenario: true,
            is_able_to_send_chat_messages: true,

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
            icon_mnemonic: 'minus',
            description: 'только исходящие',
            color: '#cc5d35',
            is_auto_out_calls_ready: true,
            is_deleted: false,

            is_able_to_accept_chat_transfer: true,
            is_able_to_transfer_chat: true,
            is_able_to_accept_chat: true,
            is_able_to_close_chat_offline_message: true,
            is_able_in_forwarding_scenario: true,
            is_able_to_send_chat_messages: true,

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
            icon_mnemonic: 'time',
            is_auto_out_calls_ready: true,
            is_deleted: false,

            is_able_to_accept_chat_transfer: true,
            is_able_to_transfer_chat: true,
            is_able_to_accept_chat: true,
            is_able_to_close_chat_offline_message: true,
            is_able_in_forwarding_scenario: true,
            is_able_to_send_chat_messages: true,

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
            icon_mnemonic: 'cross',
            is_auto_out_calls_ready: true,
            is_deleted: false,

            is_able_to_accept_chat_transfer: true,
            is_able_to_transfer_chat: true,
            is_able_to_accept_chat: true,
            is_able_to_close_chat_offline_message: true,
            is_able_in_forwarding_scenario: true,
            is_able_to_send_chat_messages: true,

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
            icon_mnemonic: 'unknown',
            color: null,
            is_auto_out_calls_ready: true,
            is_deleted: false,

            is_able_to_accept_chat_transfer: true,
            is_able_to_transfer_chat: true,
            is_able_to_accept_chat: true,
            is_able_to_close_chat_offline_message: true,
            is_able_in_forwarding_scenario: true,
            is_able_to_send_chat_messages: true,

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

        const addResponseModifiers = me => {
            me.unableToTransferChat = () => {
                data[0].is_able_to_transfer_chat = false;
                return me;
            };

            me.unableToAcceptChat = () => {
                data[0].is_able_to_accept_chat = false;
                return me;
            };

            me.unableToCloseChatOfflineMessage = () => {
                data[0].is_able_to_close_chat_offline_message = false;
                return me;
            };

            me.unableToSendChatMessages = () => {
                data[0].is_able_to_send_chat_messages = false;
                return me;
            };

            return me;
        };

        return addResponseModifiers({
            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectPathToContain('$REACT_APP_BASE_URL/status/list').
                    expectToHaveMethod('GET');

                return addResponseModifiers({
                    receiveResponse() {
                        request.respondSuccessfullyWith({ data });

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

    me.configRequest = () => {
        let host = '.';

        let response = {
            ENV: 'dev',
            LOCATION: 'msk',
            STAND: '',
            APPVERSION: 'dev',
            REACT_APP_BASE_URL: 'https://lobarev.dev.uis.st/logic/operator',
            REACT_APP_AUTH_URL: 'https://dev-dataapi.uis.st/int0/auth/json_rpc',
            REACT_APP_WS_URL: 'wss://lobarev.dev.uis.st/ws',
            REACT_APP_LOCALE: 'ru',
            REACT_APP_BUILD_MODE: '',
            REACT_APP_AUTH_COOKIE: '$REACT_APP_AUTH_COOKIE'
        };

        const processors = [];

        const addResponseModifiers = me => {
            me.en = () => {
                processors.push(() => (response.REACT_APP_LOCALE = 'en'));
                return me;
            };

            return me;
        };

        const me = addResponseModifiers({
            chats: () => {
                host = '$REACT_APP_MODULE_CHATS';
                return me;
            },

            softphone: () => {
                host = '$REACT_APP_MODULE_SOFTPHONE';

                response = {
                    REACT_APP_LOCALE: 'ru',
                    REACT_APP_SOFTPHONE_BACKEND_HOST: '$REACT_APP_SOFTPHONE_BACKEND_HOST',
                    REACT_APP_AUTH_COOKIE: '$REACT_APP_AUTH_COOKIE'
                };

                return me;
            },

            expectToBeSent: requests => {
                const request = (requests ? requests.someRequest() : fetch.recentRequest()).
                    expectPathToContain(`${host}/config.json`);

                return addResponseModifiers({
                    receiveResponse: () => {
                        processors.forEach(process => process());

                        request.respondSuccessfullyWith(
                            JSON.stringify(response)
                        );

                        Promise.runAll(false, true);
                        spendTime(0)
                        spendTime(0);
                    }
                });
            },

            receiveResponse() {
                return this.expectToBeSent().receiveResponse();
            }
        });

        return me;
    };

    me.reportTableRequest = () => {
        const params = {
            report_type: 'ad_analytics',
            dimensions: ['campaign_name', undefined],
            limit: 10,
            offset: 0,
            columns: ['cc_5', undefined],
            sort: [{
                field: 'cc_5',
                order: 'desc'
            }, undefined],
            filter: {
                filters: [{
                    field: 'name',
                    operator: '==',
                    value: 'Некое имя'
                }, {
                    field: 'description',
                    operator: '==',
                    value: 'Некое описание'
                }, {
                    field: 'campaign_name',
                    operator: 'is_not_null',
                    value: null
                }, undefined],
                condition: 'and'
            },
            columns_filter: {
                field: 'cc_5',
                operator: '>',
                value: 0
            },
            date_from: '2020-10-01 15:23:05',
            date_till: '2020-11-02 14:26:02',
            perspective_window: 180
        };

        const setColumn = column => {
            params.columns[0] = column;
            params.sort[0].field = column;
            params.columns_filter.field = column;
        };

        const setDimension = column => {
            params.dimensions[0] = column;
            params.filter.filters[2].field = column;
        };

        const response = {
            result: {
                data: {
                    date_from: '2020-10-01 15:23:05',
                    date_till: '2020-11-02 14:26:02',
                    rows: [{
                        key: 'some_key',
                        dimension: {
                            value: 'Некое значение',
                            value_id: 'some_dimension_id',
                        },
                        columns: ['name'],
                        compared_columns: ['description'],
                        loaded: true,
                        expandable: false,
                        expanded: false,
                        isLoadMoreRecordsBtn: [false],
                        children: []
                    }],
                }
            }
        };

        const headers = {
            Authorization: 'Bearer XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0',
            'X-Auth-Type': 'jwt'
        };

        const request = addAuthErrorResponseModifiers({
            anotherColumn: () => (setColumn('cc_10'), request),
            thirdColumn: () => (setColumn('cc_15'), request),
            visitorRegion: () => (setDimension('visitor_region'), request),

            anotherAuthorizationToken: () =>
                ((headers.Authorization = 'Bearer 935jhw5klatxx2582jh5zrlq38hglq43o9jlrg8j3lqj8jf'), request),

            expectToBeSent: () => {
                const request = ajax.recentRequest().
                    expectBodyToContain({
                        method: 'getobj.report_table',
                        params
                    }).expectToHaveHeaders(headers);

                return addAuthErrorResponseModifiers({
                    receiveResponse() {
                        request.respondSuccessfullyWith(response);

                        Promise.runAll(false, true);
                        spendTime(0)
                    }
                }, response);
            },

            receiveResponse: () => request.expectToBeSent().receiveResponse()
        }, response);

        return request;
    };

    me.communicationsRequest = () => {
        const params = {
            date_from: '2022-01-01 00:00:00',
            date_till: '2022-02-14 23:59:59',
            report_id: 48427,
            limit: 50,
            offset: 0,
            fields: [
                'communication_type',
                'communication_date_time',
                'communication_number',
                'visitor_id',
                'virtual_phone_number',
                'tags',
                'call_records',
                'total_duration',
                'call_type',
                'call_status',
                'call_direction',
                'employees',
                'chat_initiator',
                'chat_messages_count',
                'offline_message_type'
            ],
            sort: [{
                field: 'communication_date_time',
                order: 'desc'
            }]
        };

        const request = {
            anotherDate: () => {
                params.date_from = '2020-08-30 15:23:05';
                params.date_till = '2020-10-01 14:26:02';
                return request;
            },

            receiveResponse() {
                ajax.recentRequest().
                    expectBodyToContain({
                        method: 'get.communications',
                        params
                    }).
                    respondSuccessfullyWith({
                        result: {
                            data: [{
                                tags: {
                                    items: [{
                                        id: 45151,
                                        name: ':)'
                                    }],
                                    communication_id: 2718935,
                                    communication_type: 'chat'
                                },
                                call_type: {
                                    value: null,
                                    value_id: null
                                },
                                employees: [{
                                    employee_full_name: 'SP_TEST Олег Оловянный'
                                }],
                                visitor_id: 5059668393,
                                call_status: {
                                    value: null,
                                    value_id: null
                                },
                                call_records: null,
                                call_direction: {
                                    value: null,
                                    value_id: null
                                },
                                chat_initiator: {
                                    value: 'Посетитель',
                                    value_id: 'visitor'
                                },
                                total_duration: null,
                                communication_id: 2718935,
                                communication_type: {
                                    value: 'Чаты',
                                    value_id: 'chat'
                                },
                                chat_messages_count: 4,
                                communication_number: 1,
                                offline_message_type: {
                                    value: null,
                                    value_id: null
                                },
                                virtual_phone_number: null,
                                communication_date_time: '2022-02-18 13:20:28'
                            }, {
                                tags: {
                                    items: [{
                                        id: 45151,
                                        name: ':)'
                                    }],
                                    communication_id: 2718935,
                                    communication_type: 'chat'
                                },
                                call_type: {
                                    value: null,
                                    value_id: null
                                },
                                employees: [{
                                    employee_full_name: 'SP_TEST Олег Оловянный'
                                }],
                                visitor_id: 5059668393,
                                call_status: {
                                    value: null,
                                    value_id: null
                                },
                                call_records: null,
                                call_direction: {
                                    value: null,
                                    value_id: null
                                },
                                chat_initiator: {
                                    value: 'Посетитель',
                                    value_id: 'visitor'
                                },
                                total_duration: null,
                                communication_id: 2718936,
                                communication_type: {
                                    value: 'Чаты',
                                    value_id: 'chat'
                                },
                                chat_messages_count: 5,
                                communication_number: 1,
                                offline_message_type: {
                                    value: null,
                                    value_id: null
                                },
                                virtual_phone_number: null,
                                communication_date_time: '2022-02-18 13:20:28'
                            }],
                            metadata: {
                                total_items: 2
                            }
                        }
                    });

                Promise.runAll(false, true);
                spendTime(0)
            }
        };

        return request;
    };

    me.reportTotalRequest = () => {
        const params = {
            date_from: '2020-10-01 15:23:05',
            date_till: '2020-11-02 14:26:02',
            perspective_window: 180,
            report_type: 'deals_analytics',
            columns: ['cf_26', undefined],
            filter: {
                filters: [{
                    field: 'name',
                    operator: '==',
                    value: 'Некое имя'
                }, {
                    field: 'description',
                    operator: '==',
                    value: 'Некое описание'
                }],
                condition: 'and'
            }
        };

        const request = {
            adAnalytics: () => ((params.report_type = 'ad_analytics'), request),

            anotherDate: () => {
                params.date_from = '2020-08-30 15:23:05';
                params.date_till = '2020-10-01 14:26:02';
                return request;
            },

            anotherColumn: () => ((params.columns[0] = 'cc_25'), request),
            thirdColumn: () => ((params.columns[0] = 'cc_26'), request),
            fourthColumn: () => ((params.columns[0] = 'cc_27'), request),
            fifthColumn: () => ((params.columns[0] = 'cc_6'), request),
            sixthColumn: () => ((params.columns[0] = 'cf_29'), request),
            seventhColumn: () => ((params.columns[0] = 'cc_15'), request),
            eighthColumn: () => ((params.columns[0] = 'cc_20'), request),
            ninthColumn: () => ((params.columns[0] = 'cc_10'), request),
            tenthColumn: () => ((params.columns[0] = 'cf_19'), request),
            eleventhColumn: () => ((params.columns[0] = 'cc_5'), request),
            twelvethColumn: () => ((params.columns[0] = 'cf_13'), request),
            thirtinthColumn: () => ((params.columns[0] = 'cc_17'), request),

            receiveResponse() {
                ajax.recentRequest().
                    expectBodyToContain({
                        method: 'getobj.report_total',
                        params
                    }).
                    respondSuccessfullyWith({
                        result: {
                            data: {
                                date_from: '2020-09-02 16:23:05',
                                date_till: '2020-08-06 14:28:02',
                                totals: [285024],
                                compared_totals: [285027],
                            }
                        }
                    });

                Promise.runAll(false, true);
                spendTime(0)
            }
        };

        return request;
    };

    me.customFiltersRequest = () => {
        return {
            receiveResponse() {
                ajax.recentRequest().
                    expectBodyToContain({
                        method: 'get.custom_filters',
                        params: {
                            report_type: 'communications'
                        }
                    }).
                    respondSuccessfullyWith({
                        result: {
                            data: []
                        }
                    });

                Promise.runAll(false, true);
                spendTime(0)
            }
        };
    };

    me.tagsRequest = () => {
        return {
            receiveResponse() {
                ajax.recentRequest().
                    expectBodyToContain({
                        method: 'get.tags',
                        params: {
                            is_include_rating: true
                        }
                    }).
                    respondSuccessfullyWith({
                        result: {
                            data: [{
                                id: 288,
                                name: 'Продажа',
                                rating: 0,
                                is_system: false
                            }]
                        }
                    });

                Promise.runAll(false, true);
                spendTime(0)
            }
        };
    };

    me.columnsTreeRequest = () => {
        return {
            receiveResponse() {
                ajax.recentRequest().
                    expectBodyToContain({
                        method: 'getobj.columns_tree',
                        params: {
                            report_type: 'communications'
                        }
                    }).
                    respondSuccessfullyWith({
                        result: {
                            data: {
                                columns: [{
                                    id: 'site_domain_name',
                                    name: 'Сайт',
                                    sort: 100,
                                    type: 'base',
                                    filter: {
                                        format: 'list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: null,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'site_name',
                                    name: 'Название сайта',
                                    sort: 110,
                                    type: 'base',
                                    filter: {
                                        format: 'list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: null,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Название сайта, указанное в настройках сервиса.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'campaign_name',
                                    name: 'Рекламная кампания обращения',
                                    sort: 150,
                                    type: 'base',
                                    filter: {
                                        format: 'list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 4,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Рекламная кампания, с которой поступило обращения, определена алгоритмом нашего сервиса.',
                                    default_width: 180,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'communication_type',
                                    name: 'Тип обращения',
                                    sort: 200,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 4,
                                    data_type: 'json_object',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Типы обращений: Звонки, заявки, чаты, цели.',
                                    default_width: 116,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'communication_id',
                                    name: 'Идентификатор обращения',
                                    sort: 300,
                                    type: 'base',
                                    filter: {
                                        format: 'numeric',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: '<',
                                            name: 'меньше',
                                            is_default: false
                                        }, {
                                            id: '>',
                                            name: 'больше',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 4,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'communication_date_time',
                                    name: 'Дата / время обращения',
                                    sort: 400,
                                    type: 'base',
                                    filter: {
                                        format: 'timestamptz',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: '<',
                                            name: 'меньше',
                                            is_default: false
                                        }, {
                                            id: '>',
                                            name: 'больше',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 4,
                                    data_type: 'datetime',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: 126,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'communication_kinds',
                                    name: 'Вид обращения',
                                    sort: 500,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 4,
                                    data_type: 'list',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'communication_page_url',
                                    name: 'URL страницы обращения',
                                    sort: 600,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 4,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'URL страницы, на которой находился посетитель в момент обращения или страница последнего взаимодействия посетителя перед обращением.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'is_communication_with_visit',
                                    name: 'Есть прямая связь обращения с сессией',
                                    sort: 700,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 4,
                                    data_type: 'json_object',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'communication_number',
                                    name: 'Номер обращения',
                                    sort: 800,
                                    type: 'base',
                                    filter: {
                                        format: 'numeric',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: '<',
                                            name: 'меньше',
                                            is_default: false
                                        }, {
                                            id: '>',
                                            name: 'больше',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 4,
                                    data_type: 'integer',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: 116,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'total_duration',
                                    name: 'Длительность обращения',
                                    sort: 1100,
                                    type: 'base',
                                    filter: {
                                        format: 'duration',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: '<',
                                            name: 'меньше',
                                            is_default: false
                                        }, {
                                            id: '>',
                                            name: 'больше',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 4,
                                    data_type: 'time',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: 133,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'tags',
                                    name: 'Теги',
                                    sort: 1200,
                                    type: 'base',
                                    filter: {
                                        format: 'list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 4,
                                    data_type: 'tag_json_object',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: 188,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'employees',
                                    name: 'Сотрудник',
                                    sort: 1300,
                                    type: 'base',
                                    filter: {
                                        format: 'list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 4,
                                    data_type: 'employee_list',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: 116,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'source',
                                    name: 'Источник',
                                    sort: 1400,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 8,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Тип трафика, который приводит посетителей на ваш сайт, более детализированная информация по каждому каналу.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'communication_hour',
                                    name: 'Час обращения',
                                    sort: 1400,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 4,
                                    data_type: 'json_object',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'channel',
                                    name: 'Канал',
                                    sort: 1500,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 8,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'communication_weekday',
                                    name: 'День недели обращения',
                                    sort: 1500,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 4,
                                    data_type: 'json_object',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'communication_month',
                                    name: 'Месяц обращения',
                                    sort: 1600,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 4,
                                    data_type: 'json_object',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'eq_utm_source',
                                    name: 'Расширенная UTM-метка Source',
                                    sort: 1700,
                                    type: 'base',
                                    filter: {
                                        format: 'text_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 9,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'communication_year',
                                    name: 'Год обращения',
                                    sort: 1700,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 4,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'eq_utm_medium',
                                    name: 'Расширенная UTM-метка Medium',
                                    sort: 1800,
                                    type: 'base',
                                    filter: {
                                        format: 'text_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 9,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'person_id',
                                    name: 'Карточка клиента',
                                    sort: 1800,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 4,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: 116,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'eq_utm_campaign',
                                    name: 'Расширенная UTM-метка Campaign',
                                    sort: 1900,
                                    type: 'base',
                                    filter: {
                                        format: 'text_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 9,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'eq_utm_term',
                                    name: 'Расширенная UTM-метка Term',
                                    sort: 2000,
                                    type: 'base',
                                    filter: {
                                        format: 'text_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 9,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'eq_utm_content',
                                    name: 'Расширенная UTM-метка Content',
                                    sort: 2100,
                                    type: 'base',
                                    filter: {
                                        format: 'text_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 9,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'eq_utm_referrer',
                                    name: 'Расширенная UTM-метка Referrer',
                                    sort: 2200,
                                    type: 'base',
                                    filter: {
                                        format: 'text_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 9,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'eq_utm_expid',
                                    name: 'Расширенная UTM-метка Expid',
                                    sort: 2300,
                                    type: 'base',
                                    filter: {
                                        format: 'text_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 9,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'referrer',
                                    name: 'Реферер',
                                    sort: 2400,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 8,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'referrer_domain',
                                    name: 'Домен реферера',
                                    sort: 2500,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 8,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Домен, с которого был сделан переход',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'search_query',
                                    name: 'Поисковый запрос',
                                    sort: 2600,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 8,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Поисковый запрос, по которому посетитель перешел на ваш сайт из поисковых систем Yandex, Google и др. Показатель будет заполнен только в случае, когда поисковая система передала в наш сервис информацию о поисковом запросе.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'utm_source',
                                    name: 'UTM-метка Source',
                                    sort: 2700,
                                    type: 'base',
                                    filter: {
                                        format: 'text_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 11,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Для идентификации поисковой системы, источника перехода (прописать обязательно).\nПример: utm_source=YandexDirect.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'utm_medium',
                                    name: 'UTM-метка Medium',
                                    sort: 2800,
                                    type: 'base',
                                    filter: {
                                        format: 'text_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 11,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Определяет тип рекламной кампании (для контекстной рекламы в Яндекс можно указать cpc или идентификатор электронной рассылки), прописать обязательно.\nПример: utm_medium=cpc',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'utm_campaign',
                                    name: 'UTM-метка Campaign',
                                    sort: 2900,
                                    type: 'base',
                                    filter: {
                                        format: 'text_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 11,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Для идентификации и анализа ключевых слов, обозначения рекламы определенного товара или стратегической кампании.\nПример: utm_campaign=путевка_турция',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'utm_term',
                                    name: 'UTM-метка Term',
                                    sort: 3000,
                                    type: 'base',
                                    filter: {
                                        format: 'text_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 11,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Для идентификации ключевых слов объявления.\nПример: utm_term=теннисная+ракетка',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'utm_content',
                                    name: 'UTM-метка Content',
                                    sort: 3100,
                                    type: 'base',
                                    filter: {
                                        format: 'text_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 11,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Помогает различать объявления, ссылающиеся на один и тот же URL (можно также использовать и при A/B тестировании страниц. Примеры: utm_content=logolink или utm_content=textlink',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'utm_referrer',
                                    name: 'UTM-метка Referrer',
                                    sort: 3200,
                                    type: 'base',
                                    filter: {
                                        format: 'text_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 11,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Источник перехода на сайт при JavaScript-редиректе или при переходе на ваш сайт с протоколом HTTP с сайта, доступного по протоколу HTTPS',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'utm_expid',
                                    name: 'UTM-метка Expid',
                                    sort: 3300,
                                    type: 'base',
                                    filter: {
                                        format: 'text_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 11,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Идентификатор эксперимента',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'openstat_service',
                                    name: 'Os-метка service-name',
                                    sort: 3400,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 12,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Идентификатор сервиса, предоставляющего услуги (прописать обязательно).\nПример: source-name=direct.yandex.ru',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'openstat_campaign',
                                    name: 'Os-метка campaign-id',
                                    sort: 3500,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 12,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Идентификатор рекламной кампании. Пример: showCamp&cid=123456 <--идентификатор.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'openstat_ad',
                                    name: 'Os-метка ad-id',
                                    sort: 3600,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 12,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Идентификатор рекламного объявления (прописать обязательно).\nПример: в Яндекс Директ № объявления: № M-12345678<--идентификатор.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'openstat_source',
                                    name: 'Os-метка source-id',
                                    sort: 3700,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 12,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Идентификатор площадки, раздела, страницы, места на странице, на котором было показано соответствующее рекламное объявление.\nПример: URL страницы: www.example.com/features',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'ef_id',
                                    name: 'Метка ef_id',
                                    sort: 3800,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 13,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Параметр используется для разметки ссылок в системе управления контекстной рекламой AdLense.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'yclid',
                                    name: 'Метка yclid',
                                    sort: 3900,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 13,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Параметр передается автоматически для всех рекламных объявлений Яндекс.Директ (если в аккаунте Яндекс.Директ в настройках рекламной кампании активирована опция \'Разметка ссылок для Метрики\').',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'gclid',
                                    name: 'Метка gclid',
                                    sort: 4000,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 13,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Параметр передается автоматически для всех рекламных объявлений Google Ads (если в аккаунте Google Ads активирована соответствующая опция).',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'cm_id',
                                    name: 'Метка cm_id',
                                    sort: 4100,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 13,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Метка, проставленная нашим сервисом в url объявлений рекламной системы Яндекс Директ, Google Ads, Facebook Ads, VK Ads, myTarget при интеграции.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'ymclid',
                                    name: 'Метка ymclid',
                                    sort: 4200,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 13,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Параметр передается автоматически для всех товарных предложений Яндекс.Маркет.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'tag_from',
                                    name: 'Метка from',
                                    sort: 4300,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 13,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'visitor_country',
                                    name: 'Страна',
                                    sort: 4400,
                                    type: 'base',
                                    filter: {
                                        format: 'text_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 15,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Страна посещения.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'visitor_region',
                                    name: 'Область',
                                    sort: 4500,
                                    type: 'base',
                                    filter: {
                                        format: 'text_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 15,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Область, регион посещения.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'visitor_city',
                                    name: 'Город',
                                    sort: 4600,
                                    type: 'base',
                                    filter: {
                                        format: 'text_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 15,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Город посещения.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'visitor_provider',
                                    name: 'Провайдер',
                                    sort: 4700,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 15,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Поставщик интернет-услуг, которому принадлежит IP-адрес посещения.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'visitor_ip_address',
                                    name: 'IP',
                                    sort: 4800,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 15,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'IP адрес посещения.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'visitor_browser_name',
                                    name: 'Браузер',
                                    sort: 4900,
                                    type: 'base',
                                    filter: {
                                        format: 'text_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 16,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'visitor_browser_version',
                                    name: 'Версия браузера',
                                    sort: 5000,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 16,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'visitor_os_name',
                                    name: 'ОС',
                                    sort: 5100,
                                    type: 'base',
                                    filter: {
                                        format: 'text_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 16,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Операционная система устройства.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'visitor_os_version',
                                    name: 'Версия ОС',
                                    sort: 5200,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 16,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Версия операционной системы устройства.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'visitor_language',
                                    name: 'Язык локализации',
                                    sort: 5300,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 16,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Языковая версия браузера.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'visitor_screen',
                                    name: 'Разрешение экрана',
                                    sort: 5400,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 16,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'visitor_device',
                                    name: 'Тип устройства',
                                    sort: 5500,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 16,
                                    data_type: 'json_object',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Тип устройства посещения.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'visitor_session_id',
                                    name: 'ID посещения',
                                    sort: 5600,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 17,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'entrance_page',
                                    name: 'Страница входа',
                                    sort: 5700,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 17,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'URL (адрес) страницы вашего сайта, через которую посетители заходят на ваш сайт (“посадочная страница”).',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'visitor_type',
                                    name: 'Тип посетителя',
                                    sort: 5800,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 17,
                                    data_type: 'json_object',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Новый - для первой сессии посетителя / Вернувшийся - для любой повторной сессии посетителя.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'visitor_id',
                                    name: 'ID посетителя',
                                    sort: 5900,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 17,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Уникальный идентификатор посетителя, присвоен нашим сервисом на сайте.',
                                    default_width: 116,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'ua_client_id',
                                    name: 'Client ID Google Analytics',
                                    sort: 6000,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 17,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Информация получена от аналитической системы Universal Analytics.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'ym_client_id',
                                    name: 'Client ID Яндекс.Метрика',
                                    sort: 6100,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 17,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Информация получена от аналитической системы Яндекс.Метрика.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'segments',
                                    name: 'Сегменты',
                                    sort: 6200,
                                    type: 'base',
                                    filter: {
                                        format: 'list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 17,
                                    data_type: 'segment_list',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'visit_date',
                                    name: 'Дата посещения',
                                    sort: 6300,
                                    type: 'base',
                                    filter: {
                                        format: 'date',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: '<',
                                            name: 'меньше',
                                            is_default: false
                                        }, {
                                            id: '>',
                                            name: 'больше',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 18,
                                    data_type: 'date',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'visit_hour',
                                    name: 'Час посещения',
                                    sort: 6400,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 18,
                                    data_type: 'json_object',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'visit_weekday',
                                    name: 'День недели посещения',
                                    sort: 6500,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 18,
                                    data_type: 'json_object',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'visit_month',
                                    name: 'Месяц посещения',
                                    sort: 6600,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 18,
                                    data_type: 'json_object',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'visit_year',
                                    name: 'Год посещения',
                                    sort: 6700,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 18,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'call_type',
                                    name: 'Тип звонка',
                                    sort: 6800,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 19,
                                    data_type: 'json_object',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: 116,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'call_status',
                                    name: 'Статус звонка',
                                    sort: 6900,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 19,
                                    data_type: 'json_object',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: 116,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'call_direction',
                                    name: 'Направление звонка',
                                    sort: 7000,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 19,
                                    data_type: 'json_object',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: 116,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'phone_tracking_type',
                                    name: 'Тип номера коллтрекинга',
                                    sort: 7100,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 19,
                                    data_type: 'json_object',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Тип номера коллтрекинга: Динамический номер, Статический номер, Номер по умолчанию.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'call_region_name',
                                    name: 'Регион номера абонента',
                                    sort: 7200,
                                    type: 'base',
                                    filter: {
                                        format: 'text_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 19,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'call_records',
                                    name: 'Запись разговоров',
                                    sort: 7300,
                                    type: 'base',
                                    filter: {
                                        format: null,
                                        operators: null
                                    },
                                    group_id: 19,
                                    data_type: 'list',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: 116,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'offline_message_type',
                                    name: 'Тип заявки',
                                    sort: 7400,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 20,
                                    data_type: 'json_object',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: 116,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'offline_message_form_name',
                                    name: 'Форма заявки',
                                    sort: 7650,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 20,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Название формы заявки, если заполнен параметр form_name при передачи заявки в наш сервис: https://www.comagic.ru/support/api/javascript-api/.',
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'chat_initiator',
                                    name: 'Инициатор',
                                    sort: 7700,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 21,
                                    data_type: 'json_object',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: 116,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'chat_messages_count',
                                    name: 'Сообщений',
                                    sort: 7800,
                                    type: 'base',
                                    filter: {
                                        format: 'numeric',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: '<',
                                            name: 'меньше',
                                            is_default: false
                                        }, {
                                            id: '>',
                                            name: 'больше',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 21,
                                    data_type: 'integer',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: 116,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'goal_type',
                                    name: 'Тип цели',
                                    sort: 7900,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 22,
                                    data_type: 'json_object',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'goal_name',
                                    name: 'Название цели',
                                    sort: 8000,
                                    type: 'base',
                                    filter: {
                                        format: 'list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: false
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 22,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'deals',
                                    name: 'Связанные сделки',
                                    sort: 8100,
                                    type: 'base',
                                    filter: {
                                        format: null,
                                        operators: null
                                    },
                                    group_id: 24,
                                    data_type: 'deal_list',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: null,
                                    is_transferable: true,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'virtual_phone_number',
                                    name: 'Виртуальный номер',
                                    sort: 8200,
                                    type: 'base',
                                    filter: {
                                        format: 'text',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: false
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'ilike',
                                            name: 'включает',
                                            is_default: true
                                        }, {
                                            id: 'not_ilike',
                                            name: 'исключает',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 19,
                                    data_type: 'string',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: 129,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'chat_status',
                                    name: 'Статус чата',
                                    sort: 8300,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 21,
                                    data_type: 'json_object',
                                    is_custom: false,
                                    expression: null,
                                    description: 'Статусы чата: Отклоненные, Потерянные, Системные, Состоявшиеся.',
                                    default_width: 116,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }, {
                                    id: 'chat_type',
                                    name: 'Тип чата',
                                    sort: 8400,
                                    type: 'base',
                                    filter: {
                                        format: 'system_list',
                                        operators: [{
                                            id: '=',
                                            name: 'равно',
                                            is_default: true
                                        }, {
                                            id: '!=',
                                            name: 'не равно',
                                            is_default: false
                                        }, {
                                            id: 'is_null',
                                            name: 'не содержит данные',
                                            is_default: false
                                        }, {
                                            id: 'is_not_null',
                                            name: 'содержит данные',
                                            is_default: false
                                        }]
                                    },
                                    group_id: 21,
                                    data_type: 'json_object',
                                    is_custom: false,
                                    expression: null,
                                    description: null,
                                    default_width: 116,
                                    is_transferable: false,
                                    multichannel_model: null,
                                    is_pie_chart_available: null
                                }],
                                columns_groups: [{
                                    id: 4,
                                    name: 'Обращения',
                                    sort: 400,
                                    description: null,
                                    parent_group_id: null
                                }, {
                                    id: 8,
                                    name: 'Источник трафика',
                                    sort: 800,
                                    description: null,
                                    parent_group_id: null
                                }, {
                                    id: 9,
                                    name: 'Параметры рекламной кампании',
                                    sort: 900,
                                    description: null,
                                    parent_group_id: 8
                                }, {
                                    id: 10,
                                    name: 'Метки URL перехода',
                                    sort: 1000,
                                    description: null,
                                    parent_group_id: null
                                }, {
                                    id: 11,
                                    name: 'Метки UTM',
                                    sort: 1100,
                                    description: null,
                                    parent_group_id: 10
                                }, {
                                    id: 12,
                                    name: 'Метки Openstat',
                                    sort: 1200,
                                    description: null,
                                    parent_group_id: 10
                                }, {
                                    id: 13,
                                    name: 'Другие URL-метки',
                                    sort: 1300,
                                    description: null,
                                    parent_group_id: 10
                                }, {
                                    id: 14,
                                    name: 'Посетитель',
                                    sort: 1400,
                                    description: null,
                                    parent_group_id: null
                                }, {
                                    id: 15,
                                    name: 'География',
                                    sort: 1500,
                                    description: null,
                                    parent_group_id: 14
                                }, {
                                    id: 16,
                                    name: 'Компьютер',
                                    sort: 1600,
                                    description: null,
                                    parent_group_id: 14
                                }, {
                                    id: 17,
                                    name: 'История посетителя',
                                    sort: 1700,
                                    description: null,
                                    parent_group_id: null
                                }, {
                                    id: 18,
                                    name: 'Время посещения',
                                    sort: 1800,
                                    description: null,
                                    parent_group_id: null
                                }, {
                                    id: 19,
                                    name: 'Звонки',
                                    sort: 1900,
                                    description: null,
                                    parent_group_id: null
                                }, {
                                    id: 20,
                                    name: 'Заявки',
                                    sort: 2000,
                                    description: null,
                                    parent_group_id: null
                                }, {
                                    id: 21,
                                    name: 'Чаты',
                                    sort: 2100,
                                    description: null,
                                    parent_group_id: null
                                }, {
                                    id: 22,
                                    name: 'Цели',
                                    sort: 2200,
                                    description: null,
                                    parent_group_id: null
                                }, {
                                    id: 24,
                                    name: 'Сделки',
                                    sort: 2300,
                                    description: null,
                                    parent_group_id: null
                                }]
                            }
                        }
                    });

                Promise.runAll(false, true);
                spendTime(0)
            }
        };
    };

    me.reportFiltersRequest = () => {
        const params = {
            method: 'get.report_filters',
            params: {
                report_type: 'communications'
            }
        };

        data = [{
            id: 'ua_client_id',
            name: 'Client ID Google Analytics',
            format: 'text',
            values: [],
            operators: [{
                id: '=',
                name: 'равно',
                is_default: false
            }, {
                id: '!=',
                name: 'не равно',
                is_default: false
            }, {
                id: 'ilike',
                name: 'включает',
                is_default: true
            }, {
                id: 'not_ilike',
                name: 'исключает',
                is_default: false
            }, {
                id: 'is_null',
                name: 'не содержит данные',
                is_default: false
            }, {
                id: 'is_not_null',
                name: 'содержит данные',
                is_default: false
            }],
            description: 'Информация получена от аналитической системы Universal Analytics.',
            is_custom_dimension: false
        }];

        return {
            receiveResponse() {
                ajax.recentRequest().
                    expectBodyToContain(params).
                    respondSuccessfullyWith({
                        result: {data}
                    });

                Promise.runAll(false, true);
                spendTime(0)
            }
        };
    };

    me.reportRapidFiltersRequest = () => {
        const params = {
            method: 'get.report_rapid_filters',
            params: {
                report_type: 'marketer_dashboard'
            }
        };

        const data = [{
            id: 'some_filter',
            name: 'Некий фильтр',
            description: 'Описание некого фильтра',
            format: 'some_format',
            operators: [{
                id: 'some_operator',
                name: 'Некий оператор',
                is_default: false
            }],
            values: []
        }];

        return {
            communications() {
                params.params.report_type = 'communications';

                data.splice(0, data.length);

                data.push({
                    id: 'communication_type',
                    name: 'Тип обращения',
                    format: 'system_list',
                    values: [
                        'Заявки',
                        'Звонки',
                        'Цели',
                        'Чаты'
                    ],
                    operators: [{
                        id: '=',
                        name: 'равно',
                        is_default: true
                    }],
                    description: 'Типы обращений: Звонки, заявки, чаты, цели.'
                });

                return this;
            },

            receiveResponse() {
                ajax.recentRequest().
                    expectBodyToContain(params).
                    respondSuccessfullyWith({
                        result: {data}
                    });

                Promise.runAll(false, true);
                spendTime(0)
            }
        };
    };

    me.reportStateRequest = () => {
        let report_id = 582729;

        let data = {
            limit: 50,
            offset: 0,
            date_from: '2020-10-01 15:23:05',
            date_till: '2020-11-02 14:26:02',
            compared_date_from: '2020-12-03 13:24:53',
            compared_date_till: '2020-13-04 12:22:52',
            perspective_window: 180,
            dimensions: [],
            columns: [],
            filter: {
                field: 'name',
                operator: '==',
                value: 'Некое имя',
                filters: [],
                condition: 'and',
            },
            rapid_filter: {
                field: 'description',
                operator: '==',
                value: 'Некое описание',
                filters: [],
                condition: 'and',
            },
            sort: [{
                field: 'name',
                order: 'asc'
            }],
            column_params: {
                name: {
                    width: 200,
                    filter: {
                        field: 'name',
                        operator: '==',
                        value: 'Некое имя',
                        filters: [],
                        condition: 'and',
                    }
                }
            },
            main_column: 'name',
            additional_column: 'description',
            checked_dimensions: [{
                key: 'some_key',
                dimension_id: 'some_dimension',
                dimension_value: 'some_dimension_value',
                dimension_value_id: 'some_dimension_id',
                pos: 0,
            }],
            is_chart_visible: true,
            isGrouping: false,
            goal_ids: [282572],
            chart_id: 'line',
            datetime_dimension: 'day'
        };

        return {
            allRequests() {
                report_id = 48427;

                data = {
                    sort: [{
                        field: 'communication_date_time',
                        order: 'desc'
                    }],
                    limit: 50,
                    offset: 0,
                    columns: [
                        'communication_type',
                        'communication_date_time',
                        'communication_number',
                        'visitor_id',
                        'virtual_phone_number',
                        'tags',
                        'call_records',
                        'total_duration',
                        'call_type',
                        'call_status',
                        'call_direction',
                        'employees',
                        'chat_initiator',
                        'chat_messages_count',
                        'offline_message_type'
                    ],
                    date_from: '2022-01-01 00:00:00',
                    date_till: '2022-02-14 23:59:59',
                    dimensions: [],
                    isGrouping: false,
                    rapid_filter: {
                        filters: [{
                            field: 'communication_type',
                            value: 'Заявки',
                            operator: '='
                        }, {
                            field: 'communication_type',
                            value: 'Чаты',
                            operator: '='
                        }],
                        condition: 'or'
                    },
                    is_chart_visible: true,
                    datetime_dimension: 'day',
                    global_calendar_on: true,
                    perspective_window: 30
                };

                return this;
            },

            receiveResponse() {
                ajax.recentRequest().
                    expectBodyToContain({
                        method: 'getobj.report_state',
                        params: {report_id}
                    }).
                    respondSuccessfullyWith({
                        result: {data}
                    });

                Promise.runAll(false, true);
                spendTime(0)
            }
        };
    };

    me.reportTypesRequest = () => {
        const data = [{
            id: 'marketer_dashboard',
            name: 'Некий тип отчета',
            configuration: 'dashboard'
        }, {
            id: 'communications',
            name: 'Обращения',
            configuration: 'flat'
        }];

        return {
            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            },

            expectToBeSent: requests => {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectBodyToContain({
                        method: 'get.report_types',
                        params: {}
                    });

                return {
                    receiveResponse() {
                        request.respondSuccessfullyWith({
                            result: {data}
                        });

                        Promise.runAll(false, true);
                        spendTime(0)
                    }
                };
            }
        };
    };

    me.reportsListRequest = () => {
        let data = [{
            id: 582729,
            group_id: 1,
            type: 'summary_analytics',
            name: 'Некий отчет',
            description: 'Описание некого отчета',
            folder: null,
            sort: 0
        }];

        const addResponseModifiers = me => {
            me.noData = () => (data = [], me);

            me.allRequests = () => (data.push({
                id: 48427,
                name: 'Все обращения',
                sort: 1000,
                type: 'communications',
                group_id: 9,
                is_system: false,
                description: 'Показывает информацию по всем видам обращений (звонкам, заявкам, чатам) в едином окне. ' +
                    'Отчет строится по дате обращения.'
            }), me);

            return me;
        };

        return addResponseModifiers({
            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            },

            expectToBeSent: requests => {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectBodyToContain({
                        method: 'get.reports_list',
                        params: {}
                    });

                return addResponseModifiers({
                    receiveResponse() {
                        request.respondSuccessfullyWith({
                            result: {data}
                        });

                        Promise.runAll(false, true);
                        spendTime(0);
                        spendTime(0);
                    }
                });
            }
        });
    };

    me.reportGroupsRequest = () => {
        const response = {
            result: {
                data: [{
                    id: 1,
                    name: 'Дашборды',
                    parent_id: null,
                    sort: 0
                }, {
                    id: 9,
                    name: 'Сырые данные',
                    sort: 80,
                    parent_id: null
                }]
            }
        };

        const headers = {
            Authorization: 'Bearer XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0',
            'X-Auth-Type': 'jwt'
        };

        const request = addAuthErrorResponseModifiers({
            noAuthorizationHeader: () => {
                headers.Authorization = undefined;
                headers['X-Auth-Type'] = undefined;

                return request;
            },

            anotherAuthorizationToken: () =>
                ((headers.Authorization = 'Bearer 935jhw5klatxx2582jh5zrlq38hglq43o9jlrg8j3lqj8jf'), request),

            thirdAuthorizationToken: () =>
                ((headers.Authorization = 'Bearer 2924lg8hg95gl8h3g2lg8o2hgg8shg8olg8qg48ogih7h29'), request),

            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).expectBodyToContain({
                    method: 'get.report_groups',
                    params: {}
                }).expectToHaveHeaders(headers);

                return addAuthErrorResponseModifiers({
                    receiveResponse() {
                        request.respondSuccessfullyWith(response);

                        Promise.runAll(false, true);
                        spendTime(0)
                    }
                }, response);
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            }
        }, response);

        return request;
    };

    me.contactDeletingRequest = () => {
        let id = 1689283,
            respond = request => request.respondSuccessfullyWith({});

        const addResponseModifiers = me => {
            me.failed = () => {
                respond = request =>
                    request.respondUnsuccessfullyWith('500 Internal Server Error Server got itself in trouble');

                return me;
            };

            return me;
        };

        return addResponseModifiers({
            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectToHavePath(`https://$REACT_APP_BASE_URL/contacts/${id}`).
                    expectToHaveMethod('DELETE');

                utils.isVisible(utils.querySelector('.clct-modal, .ui-modal, .cmgui-modal')) &&
                    mainTester.modalWindow.endTransition('transform');

                return addResponseModifiers({
                    receiveResponse: () => {
                        respond(request);

                        Promise.runAll(false, true);
                        spendTime(0)
                        spendTime(0)
                    }
                });
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    me.contactRequest = () => {
        const processors = [],
            secondProcessors = [];

        const addResponseModifiers = me => {
            me.comagicChannel = () => {
                processors.push(() => (response.chat_channel_list[0].type = 'comagic'));
                return me;
            },

            me.notFound = () => {
                respond = request => request.respondSuccessfullyWith({
                    data: [],
                    total_count: 0,
                });

                return me;
            };

            me.longName = () => {
                processors.push(() => {
                    response.patronymic = response.patronymic + 'aycffbymxgipxtvnrjmhmnmrzymmaxxt';
                });

                return me;
            };

            me.anotherName = () => {
                processors.push(() => {
                    response.first_name = 'Роза';
                    response.last_name = 'Неделчева';
                    response.patronymic = 'Ангеловна';
                });

                return me;
            };

            me.addPhoneNumber = () => {
                processors.push(() => response.phone_list.push('79162729534'));
                return me;
            };

            me.anotherPhoneNumber = () => {
                processors.push(() => (response.phone_list[0] = '79162729534'));
                return me;
            };

            me.anotherPersonalManager = () => {
                processors.push(() => (response.personal_manager_id = 82756));
                return me;
            };

            me.addTelegram = () => {
                processors.push(() => response.chat_channel_list.push({
                    type: 'telegram',
                    ext_id: '79218307632',
                    chat_channel_id: 101
                }));

                return me;
            };

            me.addSecondTelegram = () => {
                processors.push(() => response.chat_channel_list.push({
                    type: 'telegram',
                    ext_id: '2895298572424359475',
                    name: '@kotik70600',
                    chat_channel_id: 101
                }));

                return me;
            };

            me.addWhatsApp = () => {
                processors.push(() => response.chat_channel_list.push({
                    type: 'whatsapp',
                    ext_id: '79283810987',
                    chat_channel_id: 84278
                }));

                return me;
            };

            me.addThirdTelegram = () => {
                processors.push(() => response.chat_channel_list.push({
                    type: 'telegram',
                    ext_id: '@kotik70601',
                    chat_channel_id: 101
                }));

                return me;
            };

            me.addFourthTelegram = () => {
                processors.push(() => response.chat_channel_list.push({
                    type: 'telegram',
                    ext_id: '79283810928',
                    chat_channel_id: 101
                }));

                return me;
            };

            me.addSecondPhoneNumber = () => {
                processors.push(() => response.phone_list.push('79162729535'));
                return me;
            };

            me.addThirdPhoneNumber = () => {
                processors.push(() => response.phone_list.push('79162729536'));
                return me;
            };

            me.addFourthPhoneNumber = () => {
                processors.push(() => response.phone_list.push('79162729537'));
                return me;
            };

            me.noPhoneNumbers = () => {
                processors.push(() => (response.phone_list = []));
                return me;
            };

            me.noEmails = () => {
                processors.push(() => (response.email_list = []));
                return me;
            };

            me.emptyEmailList = () => {
                processors.push(() => (response.email_list[0] = ''));
                return me;
            };
            
            me.invalidEmail = () => {
                processors.push(() => (response.email_list[0] = 'belezhkova gmail.com'));
                return me;
            };

            me.addInvalidEmail = () => {
                processors.push(() => (response.email_list.push('belezhkova gmail.com')));
                return me;
            };

            me.addEmail = () => {
                processors.push(() => response.email_list.push('belezhkova@gmail.com'));
                return me;
            };

            me.noChannels = () => {
                processors.push(() => (response.chat_channel_list = []));
                return me;
            };
            
            me.noPersonalManager = () => {
                processors.push(() => (response.personal_manager_id = null));
                return me;
            };

            me.noFirstName = () => {
                processors.push(() => (response.first_name = null));
                return me;
            };

            me.noPatronymic = () => {
                processors.push(() => (response.patronymic = null));
                return me;
            };

            me.legacyChannelList = () => {
                secondProcessors.push(() => (response.chat_channel_list = response.chat_channel_list.map(channel => {
                    const {ext_id, name} = channel;
                    delete(channel.name);

                    if (channel.type == 'whatsapp') {
                        delete(channel.ext_id);
                        channel.phone = ext_id;
                    } else {
                        name && (channel.ext_id = name);
                    }

                    return channel;
                })));

                return me;
            };

            return me;
        };

        let id = 1689283;

        const response = {
            first_name: 'Грета',
            last_name: 'Бележкова',
            id: 1689283,
            email_list: ['endlesssprinп.of@comagic.dev'],
            chat_channel_list: [{
                type: 'whatsapp',
                ext_id: '79283810988',
                chat_channel_id: 216395
            }, {
                type: 'whatsapp',
                ext_id: '79283810928',
                chat_channel_id: 216395
            }],
            organization_name: 'UIS',
            phone_list: ['79162729533'],
            group_list: [],
            personal_manager_id: 583783,
            patronymic: 'Ервиновна',
            full_name: 'Бележкова Грета Ервиновна'
        };

        let respond = request => request.respondSuccessfullyWith({
            data: [response],
            total_count: 1,
        });

        return addResponseModifiers({
            thirdContact() {
                id = response.id = 25206823;

                response.first_name = 'Бисера';
                response.last_name = 'Паскалева';
                response.patronymic = 'Илковна';

                return this;
            },

            fourthContact() {
                id = response.id = 1789283;

                response.first_name = 'Роза';
                response.last_name = 'Неделчева';
                response.patronymic = 'Ангеловна';

                return this;
            },

            fifthContact() {
                id = response.id = 2968308,
                response.personal_manager_id = null,
                response.first_name = '',
                response.last_name = 'Помакова Бисерка Драгановна',
                response.full_name = '',
                response.organization_name = '',
                response.patronymic = '',
                response.group_list = [],
                response.phone_list = ['79164725823'],
                response.email_list = ['pomakova@gmail.com'],

                response.chat_channel_list = [{
                    type: 'telegram',
                    ext_id: '79283810928',
                    name: 'Помакова Бисерка Драгановна',
                    chat_channel_id: 101
                }];

                return this;
            },

            sixthContact() {
                id = response.id = 1689587;

                response.personal_manager_id = null;
                response.first_name = 'Елеонора';
                response.last_name = 'Радкова';
                response.full_name = 'Радкова Елеонора Стефановна';
                response.patronymic = 'Стефановна';

                return this;
            },

            anotherContact() {
                id = response.id = 1689290;

                response.first_name = 'Калиса';
                response.last_name = 'Белоконска-Вражалска';
                response.patronymic = 'Еньовна';
                response.email_list = ['belokonska-vrazhelska@gmail.com'];
                response.organization_name = 'UIS';
                response.phone_list = ['79162729534'];
                response.personal_manager_id = 79582;

                response.chat_channel_list = [{
                    type: 'whatsapp',
                    ext_id: '+7 (928) 381 09-89',
                    chat_channel_id: 216395
                }, {
                    type: 'whatsapp',
                    ext_id: '+7 (928) 381 09-29',
                    chat_channel_id: 216395
                }];

                return this;
            },

            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectToHavePath(`https://$REACT_APP_BASE_URL/contacts/${id}`).
                    expectToHaveMethod('GET');

                return addResponseModifiers({
                    receiveResponse: () => {
                        processors.forEach(process => process());
                        secondProcessors.forEach(process => process());

                        response.full_name = ['last_name', 'first_name', 'patronymic'].map(
                            name => response[name]
                        ).filter(name => !!name).join(' ');

                        respond(request);

                        Promise.runAll(false, true);
                        spendTime(0)
                        spendTime(0)
                        spendTime(0)
                    }
                });
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    me.scheduledMessagesRequest = () => {
        let id = '7189362';
        const addResponseModifiers = me => me;

        return addResponseModifiers({
            anotherChat() {
                id = '2718935';
                return this;
            },

            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectPathToContain(`$REACT_APP_BASE_URL/operator/chats/${id}/scheduled-messages`).
                    expectToHaveMethod('GET');

                return addResponseModifiers({
                    receiveResponse() {
                        request.respondSuccessfullyWith([]);

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

    me.chatChannelSearchRequest = () => {
        const processors = [];
        let path = '$REACT_APP_BASE_URL/operator';

        const params = {
            contact: {
                phone: '79283810988',
                email: undefined,
            },
        };

        let data = [{
            channel_id: 216395,
            channel_name: 'Москва',
            channel_type: 'whatsapp',
            channel_ext_identity: '79283810988',
            chats: [{
                id: 7189362,
                status: 'active',
                employee_id: 20816,
                is_available_for_current_employee: true,
            }] 
        }];

        const addResponseModifiers = me => {
            me.noData = () => (data = [], me);
            me.anotherPhone = () => (data[0].channel_ext_identity = '79357818431', me);
            me.anotherEmployee = () => (data[0].chats[0].employee_id = 57292, me);
            me.chatUnavailable = () => (data[0].chats[0].is_available_for_current_employee = false, me);

            me.addClosedChat = () => {
                data[0].chats.push({
                    id: 7189371,
                    status: 'closed',
                    employee_id: 20816,
                    is_available_for_current_employee: true,
                });

                return me;
            };

            me.addAnotherEmployeeUnavailableClosedChat = () => {
                data[0].chats.push({
                    id: 7189371,
                    status: 'closed',
                    employee_id: 57292,
                    is_available_for_current_employee: false,
                });

                return me;
            };

            me.addAnotherEmployeeUnavailableActiveChat = () => {
                data[0].chats.push({
                    id: 7189371,
                    status: 'active',
                    employee_id: 57292,
                    is_available_for_current_employee: false,
                });

                return me;
            };

            me.telegram = () => {
                data[0].channel_type = 'telegram'; 
                data[0].channel_name = 'Санкт-Петербург';
                return me;
            };

            me.telegramPrivate = () => {
                data[0].channel_type = 'telegram_private';
                data[0].channel_name = 'Нижний Новгород';
                return me;
            };

            me.anotherChannel = () => {
                data[0].channel_id = 216397;
                data[0].channel_name = 'Ереван';
                return me;
            };

            me.thirdChannel = () => {
                data[0].channel_id = 216398;
                data[0].channel_name = 'Тбилиси';
                return me;
            };

            me.noChat = () => (processors.push(() => data.forEach(item => item.chats = [])), me);
            me.closed = () => (data[0].chats[0].status = 'closed', me);

            me.new = () => {
                data[0].chats[0].status = 'new';
                data[0].chats[0].employee_id = null;

                return me;
            };

            me.addTelegramPrivate = () => (data.push({
                channel_id: 216405,
                channel_name: 'Белгород',
                channel_type: 'telegram_private',
                channel_ext_identity: '79283810988',
                chats: [{
                    id: 7189363,
                    status: 'active',
                    employee_id: 20816,
                    is_available_for_current_employee: true,
                }] 
            }), me);

            me.addTelegram = () => (data.push({
                channel_id: 216396,
                channel_name: 'Брянск',
                channel_type: 'telegram',
                channel_ext_identity: '79283810988',
                chats: [{
                    id: 7189363,
                    status: 'active',
                    employee_id: 20816,
                    is_available_for_current_employee: true,
                }] 
            }), me);

            me.addWhatsApp = () => (data.push({
                channel_id: 216396,
                channel_name: 'Якутск',
                channel_type: 'whatsapp',
                channel_ext_identity: '79283810988',
                chats: [{
                    id: 7189363,
                    status: 'active',
                    employee_id: 20816,
                    is_available_for_current_employee: true,
                }] 
            }), me);

            me.addWaba = () => (data.push({
                channel_id: 216396,
                channel_name: 'Южно-Сахалинск',
                channel_type: 'waba',
                channel_ext_identity: '79283810988',
                chats: [{
                    id: 7189363,
                    status: 'active',
                    employee_id: 20816,
                    is_available_for_current_employee: true,
                }] 
            }), me);

            me.addAnotherWhatsApp = () => (data.push({
                channel_id: 216399,
                channel_name: 'Белград',
                channel_type: 'whatsapp',
                channel_ext_identity: '79283810988',
                chats: [{
                    id: 7189363,
                    status: 'active',
                    employee_id: 20816,
                    is_available_for_current_employee: true,
                }] 
            }), me);

            me.addAnotherTelegram = () => (data.push({
                channel_id: 216399,
                channel_name: 'Тула',
                channel_type: 'telegram',
                channel_ext_identity: '79283810988',
                chats: [{
                    id: 7189363,
                    status: 'active',
                    employee_id: 20816,
                    is_available_for_current_employee: true,
                }] 
            }), me);

            me.addThirdTelegramPrivate = () => (data.push({
                channel_id: 216403,
                channel_name: 'Мурманск',
                channel_type: 'telegram_private',
                channel_ext_identity: '79283810988',
                chats: [{
                    id: 7189363,
                    status: 'active',
                    employee_id: 20816,
                    is_available_for_current_employee: true,
                }] 
            }), me);

            me.addEmail = () => (data.push({
                channel_id: 216406,
                channel_name: 'Баку',
                channel_type: 'email',
                channel_ext_identity: '79283810988',
                chats: [],
            }), me);

            return me;
        };

        let response = {
            result: { data },
        };

        return addResponseModifiers({
            invalidFormat() {
                response = {
                    result: null,
                    error: {
                        code: 400,
                        message: [
                            {
                                loc: [
                                    'contact',
                                    'phone',
                                ],
                                msg: 'Invalid phone format',
                                type: 'value_error',
                            },
                            {
                                loc: [
                                    'contact',
                                    '__root__',
                                ],
                                msg: 'Exactly one of email, phone, username must be passed',
                                type: 'value_error',
                            },
                        ],
                    },
                };

                return this;
            },
            
            forContacts() {
                path = '$REACT_APP_CHAT_BASE_URL';
                return this;
            },

            anotherSearchString() {
                params.contact.phone = '79283810989';
                return this;
            },

            thirdSearchString() {
                params.contact.phone = '74951234575';
                return this;
            },

            fourthSearchString() {
                params.contact.phone = '74951234576';
                return this;
            },

            fifthSearchString() {
                params.contact.phone = '79164725823';
                return this;
            },

            email() {
                params.contact.phone = undefined;
                params.contact.email = 'tomova@gmail.com';

                data[0].channel_type = 'email';
                data[0].channel_name = 'Дели';

                return this;
            },
            
            emptySearchString() {
                params.contact = null;
                return this;
            },
            
            noPhone() {
                params.contact.phone = null;
                return this;
            },

            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectToHavePath(path).
                    expectToHaveMethod('POST').
                    expectBodyToContain({
                        method: 'get_chat_start_chat_channel_search',
                        params,
                    });

                return addResponseModifiers({
                    receiveResponse: () => {
                        processors.forEach(process => process());
                        request.respondSuccessfullyWith(response);

                        Promise.runAll(false, true);
                        spendTime(0)
                        spendTime(0)
                        spendTime(0)
                    }
                });
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    me.contactChatRequest = () => {
        const data = {
            chat_channel_name: 'WhatsApp',
            is_chat_channel_active: true,
            omni_account_state: 'active',
            omni_account_id: 425802,
            chat: {
                id: 7189362,
                phone: '79283810988',
                employee_id: 20816,
                chat_channel_type: 'whatsapp',
                chat_status: 'active'
            }
        };

        const params = {
            chat_channel_id: '216395',
            chat_statuses: ['new', 'active', 'closed', undefined]
        };

        const addResponseModifiers = me => {
            me.anotherPhone = () => (data.chat.phone = '79357818431', me);
            me.thirdPhone = () => (data.chat.phone = '79218307632', me);
            me.anotherEmployee = () => (data.chat.employee_id = 57292, me);
            me.anotherChannelType = () => (data.chat.chat_channel_type = 'telegram', me);
            me.channelInactive = () => (data.is_chat_channel_active = false, me);
            me.accountInactive = () => (data.omni_account_state = 'inactive', me);
            me.noChat = () => (data.chat = null, me);
            me.closed = () => (data.chat.chat_status = 'closed', me);

            return me;
        };

        const response = {data};

        return addResponseModifiers({
            anotherChannelId() {
                params.chat_channel_id = '101';
                return this;
            },

            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectToHavePath(`https://$REACT_APP_BASE_URL/contacts/1689283/chat/20816`).
                    expectToHaveMethod('GET').
                    expectQueryToContain(params);

                return addResponseModifiers({
                    receiveResponse: () => {
                        request.respondSuccessfullyWith(response);

                        Promise.runAll(false, true);
                        spendTime(0)
                        spendTime(0)
                    }
                });
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    me.contactCommunicationsRequest = () => {
        let id = 1689283;
        const processors = [];

        const queryParams = {
            limit: '100',
            from_start_time: '2019-12-19T12:10:07.000+03:00',
            scroll_direction: 'backward'
        };

        const response = {
            data: [{
                id: 482062,
                start_time: '2020-02-10 12:10:16',
                communication_type: 'offline_message',
                data: {
                    date_time: '2020-02-10 12:10:16',
                    email: 'msjdasj@mail.com',
                    employee_id: 1875485,
                    id: 178073,
                    is_phone_auto_filled: true,
                    mark_ids: [],
                    message: 'Я хочу о чем-то заявить.',
                    name: null,
                    phone: '79161212122',
                    site_id: 2157,
                    status: 'processing',
                    visitor_id: 16479303,
                    visitor_name: 'Помакова Бисерка Драгановна',
                    visitor_type: 'comagic'
                }
            }, {
                id: 482065,
                start_time: '2020-02-10 12:11:15',
                communication_type: 'chat_message',
                data: {
                    chat_id: 2718935,
                    phone: '79218307632',
                    site_domain_name: 'www.site.ru',
                    message_source: 'system',
                    message: 'Чат принят оператором Карадимова Веска Анастасовна (79283810928)',
                    chat_channel_type: 'telegram',
                    employee_name: 'Карадимова Веска Анастасовна',
                    status: 'sent'
                }
            }, {
                id: 482057,
                start_time: '2020-02-10 12:12:14',
                communication_type: 'chat_message',
                data: {
                    chat_id: 2718935,
                    chat_channel_type: 'telegram',
                    phone: '79283810928',
                    message_source: 'visitor',
                    message: 'Здравствуйте',
                    employee_name: 'Карадимова Веска Анастасовна',
                    status: 'sent'
                }
            }, {
                id: 482058,
                start_time: '2020-02-10 12:13:14',
                communication_type: 'chat_message',
                data: {
                    chat_id: 2718935,
                    phone: '79283810928',
                    message_source: 'operator',
                    chat_channel_type: 'telegram',
                    message: 'Привет',
                    employee_name: 'Карадимова Веска Анастасовна',
                    status: 'sent',
                    reply_to_id: 482057,
                    reply_to: {
                        employee_name: 'Карадимова Веска Анастасовна',
                        is_operator: false,
                        message: 'Здравствуйте'
                    }
                }
            }, {
                id: 482060,
                start_time: '2020-02-10 12:14:14',
                communication_type: 'call',
                data: {
                    direction: 'in',
                    talk_duration: 42820,
                    numa: '79161234567',
                    virtual_phone_number: '74952727438',
                    employee_name: 'Карадимова Веска Анастасовна',
                    is_lost: false,
                    finish_reason: null,
                    wait_duration: null,
                    talk_record_file_link:
                        'https://app.comagic.ru/system/media/talk/1306955705/3667abf2738dfa0a95a7f421b8493d3c/'
                }
            }, {
                id: 482060,
                start_time: '2020-02-10 12:15:14',
                communication_type: 'chat_message',
                data: {
                    chat_id: 2718935,
                    phone: '79283810928',
                    message_source: 'operator',
                    message: '',
                    chat_channel_type: 'telegram',
                    employee_name: 'Карадимова Веска Анастасовна',
                    status: 'sent',
                    resource: {
                        id: 5829572,
                        type: 'photo',
                        mime_type: 'image/png',
                        file_name: 'heart.png',
                        size: 925,
                        width: 48,
                        height: 48,
                        duration: null
                    }
                }
            }, {
                id: 482061,
                start_time: '2020-02-10 12:16:19',
                communication_type: 'chat_message',
                data: {
                    chat_id: 2718935,
                    phone: '79283810928',
                    message_source: 'visitor',
                    message: 'Прикольная картинка',
                    chat_channel_type: 'telegram',
                    employee_name: 'Карадимова Веска Анастасовна',
                    status: 'sent',
                    reply_to_id: 482060,
                    reply_to: {
                        employee_name: 'Карадимова Веска Анастасовна',
                        is_operator: true,
                        message: '',
                        resource: {
                            id: 5829572,
                            type: 'photo',
                            mime_type: 'image/png',
                            file_name: 'heart.png',
                            size: 925,
                            width: 48,
                            height: 48,
                            duration: null
                        }
                    }
                }
            }]
        };

        const getPage = ({
            end,
            total,
            count
        }) => {
            const interval = (1000 * 60 * 60 * 6) + (5 * 1000 * 60) + (12 * 1000) + 231,
                data = [],
                start = end - count;
            
            let i = start;

            let date = new Date('2019-12-19T12:00:00');
            date = new Date(date.getTime() - (interval * (total - start) * 2));

            for (; i < end; i ++) {
                const index = i * 2,
                    number = i + 1;

                date = new Date(date.getTime() + interval);

                data.push({
                    id: 492057 + index,
                    start_time: utils.formatDate(date),
                    communication_type: 'chat_message',
                    data: {
                        chat_channel_type: 'telegram',
                        chat_id: 2718935,
                        message_source: 'visitor',
                        message_text: `Пинг # ${number}`,
                        employee_id: 20816,
                        employee_name: 'Карадимова Веска Анастасовна',
                    }
                });

                date = new Date(date.getTime() + interval);

                data.push({
                    id: 492058 + index,
                    start_time: utils.formatDate(date),
                    communication_type: 'chat_message',
                    data: {
                        chat_id: 2718935,
                        chat_channel_type: 'telegram',
                        message_source: 'operator',
                        message_text: `Понг # ${number}`,
                        employee_id: 20816,
                        employee_name: 'Карадимова Веска Анастасовна',
                    }
                });
            }

            return data;
        };

        const addResponseModifiers = me => {
            me.offlineMessageFromContact = () => {
                response.data[0].data.visitor_name = null;
                response.data[0].data.name = 'Помакова Бисерка Драгановна';
                    
                return me;
            };

            me.comagicSystemMessage = () => {
                response.data[1].data.chat_channel_type = 'comagic';
                return me;
            };

            me.audioAttachment = () => {
                response.data[4].communication_type = 'chat_message';

                response.data[4].data = {
                    chat_id: 2718935,
                    chat_channel_type: 'telegram',
                    message_source: 'operator',
                    message_text: '',
                    employee_name: 'Карадимова Веска Анастасовна',
                    resource: {
                        id: 5829573,
                        type: 'audio',
                        mime_type: 'audio/mpeg',
                        file_name: 'call.mp3',
                        size: 925,
                        width: null,
                        height: null,
                        duration: 42820
                    }
                };

                return me;
            };

            me.noTalkRecordFileLink = () => {
                response.data[4].data.is_lost = true;
                response.data[4].data.finish_reason = 'Клиент не взял трубку';
                response.data[4].data.wait_duration = 42819;
                response.data[4].data.talk_record_file_link = null;
                
                return me;
            };

            me.noTalkDuration = () => {
                processors.push(() => (response.data[4].data.talk_duration = 0));
                return me;
            };

            me.noData = () => {
                response.data = [];
                return me;
            };

            me.firstPage = () => {
                response.data = getPage({
                    end: 100,
                    total: 100,
                    count: 50
                });

                return me;
            };

            return me;
        };

        return addResponseModifiers({
            secondEarlier() {
                queryParams.from_start_time = '2019-12-19T12:10:06.000+03:00'
                return this;
            },

            anotherRangeStartingTime() {
                queryParams.from_start_time = '2019-12-19T12:10:08.000+03:00'
                return this;
            },

            secondPage() {
                response.data = getPage({
                    end: 50,
                    total: 100,
                    count: 50
                });

                queryParams.from_start_time = '2019-11-24T09:24:49.131+03:00'
                return this;
            },

            anotherContact() {
                id = 1689290;
                return this;
            },

            thirdContact() {
                id = 25206823;
                return this;
            },

            fourthContact() {
                id = 1789283;
                return this;
            },

            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectToHavePath(`https://$REACT_APP_BASE_URL/contacts/${id}/communications`).
                    expectQueryToContain(queryParams).
                    expectToHaveMethod('GET');

                return addResponseModifiers({
                    receiveResponse: () => {
                        processors.forEach(process => process());

                        Array.isArray(response.data) && response.data.reverse();
                        request.respondSuccessfullyWith(response);

                        Promise.runAll(false, true);
                        spendTime(0);
                        spendTime(0);
                        spendTime(0);
                        spendTime(0);
                        spendTime(0);
                        spendTime(0);

                        maybeRunSpinWrapperIntersectionCallback(getContactCommunicationsSpinWrapper());
                    }
                });
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    me.groupsContainingContactRequest = () => {
        let id = 1689283;

        const headers = {
            Authorization: undefined,
            'X-Auth-Token': 'XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0',
            'X-Auth-Type': 'jwt'
        };

        const response = {
            data: []
        };

        const addResponseModifiers = me => {
            me.anotherContact = () => (id = 2968308, me);
            me.thirdContact = () => (id = 1689587, me);
            me.fourthContact = () => (id = 25206823, me);
            me.fifthContact = () => (id = 1689290, me);
            me.sixthContact = () => (id = 1789283, me);

            return me;
        };

        return addResponseModifiers({
            forIframe() {
                requestProcessors.push(() => (headers = {
                    Authorization: `Bearer ${me.oauthToken}`,
                    'X-Auth-Token': undefined,
                    'X-Auth-Type': undefined,
                }));

                return this;
            },

            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectToHavePath(`https://$REACT_APP_BASE_URL/contacts/${id}/contact-groups`).
                    expectToHaveHeaders(headers).
                    expectToHaveMethod('GET');

                return addResponseModifiers({
                    receiveResponse: () => {
                        request.respondSuccessfullyWith(response);

                        Promise.runAll(false, true);
                        spendTime(0);
                    }
                });
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            },
        });
    };

    me.contactGroupsRequest = () => {
        const headers = {
            Authorization: undefined,
            'X-Auth-Token': 'XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0',
            'X-Auth-Type': 'jwt'
        };

        const queryParams = {
            search: undefined,
        };

        const response = {
            data: []
        };

        const addResponseModifiers = me => me;

        return addResponseModifiers({
            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectToHavePath('https://$REACT_APP_BASE_URL/contact-groups').
                    expectToHaveHeaders(headers).
                    expectQueryToContain(queryParams).
                    expectToHaveMethod('GET');

                return addResponseModifiers({
                    receiveResponse: () => {
                        request.respondSuccessfullyWith(response);

                        Promise.runAll(false, true);
                        spendTime(0);
                    }
                });
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            },
        });
    };

    me.contactsMergingRequest = () => {
        const bodyParams = {
            form_data: {
                id: 1689283,
                personal_manager_id: 583783,
                first_name: 'Грета',
                last_name: 'Бележкова',
                full_name: '',
                organization_name: 'UIS',
                patronymic: 'Ервиновна',
                phone_list: ['79162729533'],
                email_list: ['endlesssprinп.of@comagic.dev'],
                chat_channel_list: [{
                    ext_id: '79283810988',
                    type: 'whatsapp',
                    chat_channel_id: 216395
                }, {
                    ext_id: '79283810928',
                    type: 'whatsapp',
                    chat_channel_id: 216395
                }],
                group_list: [],
                group_ids: [],
                name: ''
            },
            from_contact_id: 25206823,
            to_contact_id: 1689283
        };

        const addResponseModifiers = me => me,
            processors = [],
            bodyParamsProcessors = [];

        return addResponseModifiers({
            newContact() {
                bodyParams.form_data = {
                    id: null,
                    first_name: null,
                    full_name: '',
                    last_name: 'Неделчева',
                    organization_name: null,
                    patronymic: null,
                    phone_list: ['74950230625'],
                    email_list: [],
                    chat_channel_list: [],
                    group_list: [],
                    group_ids: [],
                    name: ''
                };

                processors.push(data => {
                    data.phone_list.push('79162729533');
                    data.phone_list.push('79162722748');
                    data.full_name = 'Неделчева';
                });

                bodyParams.to_contact_id = null;
                return this;
            },

            deleteCurrent() {
                bodyParamsProcessors.push(() => {
                    const {from_contact_id, to_contact_id} = bodyParams;

                    bodyParams.from_contact_id = to_contact_id;
                    bodyParams.to_contact_id = from_contact_id;

                    processors.push(data => {
                        data.full_name = 'Паскалева Бисера Илковна';
                        data.id = 25206823;
                    });
                });

                return this;
            },

            changeFirstPhone() {
                bodyParamsProcessors.push(() => bodyParams.form_data.phone_list[0] = '79162729534');
                return this;
            },

            addPhone() {
                bodyParamsProcessors.push(() => bodyParams.form_data.phone_list.push('79162729535'));
                return this;
            },

            addSecondPhone() {
                bodyParamsProcessors.push(() => bodyParams.form_data.phone_list.push('79162729536'));
                return this;
            },

            addThirdPhone() {
                bodyParamsProcessors.push(() => bodyParams.form_data.phone_list.push('79162729537'));
                return this;
            },

            addTelegram() {
                bodyParamsProcessors.push(() => bodyParams.form_data.chat_channel_list.push({
                    type: 'telegram',
                    ext_id: '79218307632',
                    chat_channel_id: 101,
                }));

                return this;
            },

            addAnotherTelegram() {
                bodyParamsProcessors.push(() => bodyParams.form_data.chat_channel_list.push({
                    type: 'telegram',
                    ext_id: '79283810928',
                    chat_channel_id: 101,
                }));

                return this;
            },

            expectToBeSent() {
                bodyParamsProcessors.forEach(process => process());
                const bodyParamsCopy = JSON.parse(JSON.stringify(bodyParams));

                ['phone_list', 'email_list', 'chat_channel_list'].forEach(name =>
                    bodyParams.form_data[name].push(undefined));

                const request = ajax.recentRequest().
                    expectToHavePath('https://$REACT_APP_BASE_URL/contacts/merge').
                    expectToHaveMethod('PATCH').
                    expectBodyToContain(bodyParams);

                return addResponseModifiers({
                    receiveResponse: () => {
                        const data = {
                            ...bodyParamsCopy.form_data,
                            last_name: 'Бележкова-Паскалева',
                            full_name: 'Бележкова-Паскалева Грета Ервиновна'
                        };

                        processors.forEach(process => process(data));

                        request.respondSuccessfullyWith({
                            data: [data] 
                        });

                        Promise.runAll(false, true);
                        spendTime(0)
                        spendTime(0)
                        spendTime(0)
                    }
                });
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    me.contactUpdatingRequest = () => {
        const addResponseModifiers = me => me,
            processors = [],
            secondProcessors = [];
        let bodyParams = {},
            id = 1689283;

        return addResponseModifiers({
            anotherContactId() {
                id = 1789283;
                return this;
            },

            completeData() {
                bodyParams = {
                    first_name: 'Грета',
                    last_name: 'Бележкова',
                    email_list: ['endlesssprinп.of@comagic.dev', undefined],
                    chat_channel_list: [{
                        type: 'whatsapp',
                        ext_id: '79283810988',
                        name: '79283810988',
                        chat_channel_id: 216395
                    }, {
                        type: 'whatsapp',
                        ext_id: '79283810928' ,
                        name: '79283810928' ,
                        chat_channel_id: 216395
                    }],
                    organization_name: 'UIS',
                    phone_list: ['79162729533', undefined],
                    personal_manager_id: 583783,
                    patronymic: 'Ервиновна',
                };

                return this;
            },

            noPersonalManager() {
                processors.push(bodyParams => (bodyParams.personal_manager_id = null));
                return this;
            },

            anotherPersonalManager() {
                processors.push(bodyParams => (bodyParams.personal_manager_id = 82756));
                return this;
            },

            anotherName() {
                processors.push(bodyParams => {
                    bodyParams.first_name = 'Роза';
                    bodyParams.last_name = 'Неделчева';
                    bodyParams.patronymic = 'Ангеловна';
                });

                return this;
            },

            anotherPhoneNumber() {
                secondProcessors.push(bodyParams => {
                    bodyParams.phone_list ?
                        (bodyParams.phone_list[0] = '79162729534') :
                        (bodyParams.phone_list = ['79162729534', undefined]);
                });

                return this;
            },

            twoPhoneNumbers() {
                processors.push(bodyParams =>
                    (bodyParams.phone_list = ['79162729533', '79162729534', undefined]));
                return this;
            },
            
            threePhoneNumbers() {
                processors.push(bodyParams => {
                    bodyParams.phone_list = ['79162729533', '79162729535', '79162729536', undefined];

                    bodyParams.chat_channel_list = [{
                        type: 'whatsapp',
                        ext_id: '79283810988',
                        name: '79283810988',
                        chat_channel_id: 216395
                    }, {
                        type: 'whatsapp',
                        ext_id: '79283810928' ,
                        name: '79283810928' ,
                        chat_channel_id: 216395
                    } ];
                });

                return this;
            },

            fourPhoneNumbers() {
                processors.push(bodyParams =>
                    (bodyParams.phone_list = ['79162729533', '79162729535', '79162729536', '79162729537', undefined]));
                return this;
            },

            noPhoneNumbers() {
                processors.push(bodyParams => (bodyParams.phone_list = [undefined]));
                return this;
            },

            twoEmails() {
                processors.push(bodyParams =>
                    (bodyParams.email_list = ['endlesssprinп.of@comagic.dev', 'belezhkova@gmail.com', undefined]));
                return this;
            },

            newChannel() {
                processors.push(bodyParams => {
                    bodyParams.chat_channel_list.push({
                        chat_channel_id: null,
                        ext_id: '79283810987',
                        name: '79283810987',
                        type: 'whatsapp'
                    });
                });

                return this;
            },

            anotherNewChannel() {
                processors.push(bodyParams => {
                    bodyParams.chat_channel_list.push({
                        type: 'whatsapp',
                        chat_channel_id: null,
                        phone: null,
                        name: '79162729536',
                        ext_id: '79162729536'
                    });
                });

                return this;
            },

            thirdNewChannel() {
                processors.push(bodyParams => {
                    bodyParams.chat_channel_list.push({
                        type: 'whatsapp',
                        chat_channel_id: null,
                        phone: null,
                        name: '79162729534',
                        ext_id: '79162729534'
                    });
                });

                return this;
            },

            fourthNewChannel() {
                processors.push(bodyParams => {
                    bodyParams.chat_channel_list.push({
                        type: 'whatsapp',
                        chat_channel_id: null,
                        phone: null,
                        name: '79162729537',
                        ext_id: '79162729537'
                    });
                });

                return this;
            },

            existingChannel() {
                processors.push(bodyParams => {
                    bodyParams.chat_channel_list.push({
                        chat_channel_id: 84278,
                        ext_id: '79283810987',
                        name: '79283810987',
                        type: 'whatsapp'
                    });
                });

                return this;
            },

            existingTelegramChannel() {
                processors.push(bodyParams => bodyParams.chat_channel_list.push({
                    chat_channel_id: 101,
                    ext_id: '79218307632',
                    name: '79218307632',
                    type: 'telegram'
                }));

                return this;
            },

            anotherExistingTelegramChannel() {
                processors.push(bodyParams => bodyParams.chat_channel_list.push({
                    type: 'telegram',
                    ext_id: '2895298572424359475',
                    name: '@kotik706001',
                    chat_channel_id: 101
                }));

                return this;
            },

            thirdExistingTelegramChannel() {
                processors.push(bodyParams => bodyParams.chat_channel_list.push({
                    type: 'telegram',
                    ext_id: '2895298572424359475',
                    name: '@kotik70600',
                    chat_channel_id: 101
                }));

                return this;
            },

            fourthExistingTelegramChannel() {
                processors.push(bodyParams => bodyParams.chat_channel_list.push({
                    chat_channel_id: 101,
                    ext_id: '79218307632',
                    name: '792183076321',
                    type: 'telegram'
                }));

                return this;
            },
            
            legacyChannelList() {
                secondProcessors.push(bodyParams => (
                    bodyParams.chat_channel_list = bodyParams.chat_channel_list.map(channel => {
                        if (!channel) {
                            return channel;
                        }

                        const {ext_id, name, type} = channel;

                        channel.ext_id = type == 'whatsapp' ? null : name || ext_id;
                        channel.name = undefined;
                        channel.phone = type == 'telegram' ? null : ext_id;

                        return channel;
                    })
                ));

                return this;
            },
            
            expectToBeSent() {
                processors.forEach(process => process(bodyParams));
                secondProcessors.forEach(process => process(bodyParams));

                bodyParams.chat_channel_list?.push(undefined);

                const request = ajax.recentRequest().
                    expectToHavePath(`https://$REACT_APP_BASE_URL/contacts/${id}`).
                    expectToHaveMethod('PUT').
                    expectBodyToContain(bodyParams);

                return addResponseModifiers({
                    receiveResponse: () => {
                        request.respondSuccessfullyWith({
                            data: true 
                        });

                        Promise.runAll(false, true);
                        spendTime(0)
                        spendTime(0)
                    }
                });
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    me.contactCreatingRequest = () => {
        const processors = [];
            secondProcessors = [];

        const response = {
            contact_id: 1689283
        };

        const bodyParams = {
            last_name: 'Неделчева',
            phone_list: ['74950230625', undefined]
        };

        let respond = request => request.respondSuccessfullyWith(response);

        const addResponseModifiers = me => {
            me.anotherContactId = () => ((response.contact_id = 1789283), me);

            me.failed = () => (respond = request => request.respondUnsuccessfullyWith({
                error: {
                    code: 400,
                    message:
                        'Необходимо заполнить хотя бы один тип контактных данных (телефон, email, мессенджер, соц ' +
                        'сети)',
                    mnemonic: 'bad_request',
                    is_smart: true
                }
            }), me);

            return me;
        };

        return addResponseModifiers({
            noPhone() {
                bodyParams.phone_list = [undefined];
                return this;
            },

            legacyChannelList() {
                secondProcessors.push(() => (
                    bodyParams.chat_channel_list = bodyParams.chat_channel_list?.map(channel => ({
                        ...channel,
                        ext_id: channel.type == 'whatsapp' ? null : channel.name,
                        phone: channel.type == 'whatsapp' ? channel.name : null,
                        name: undefined
                    }))
                ));

                return this;
            },

            whatsapp() {
                processors.push(() => (bodyParams.chat_channel_list = bodyParams.chat_channel_list?.map(channel => ({
                    ...channel,
                    type: 'whatsapp',
                    name: channel.ext_id
                }))));

                return this;
            },

            fromVisitor() {
                response.contact_id = 2968308;
                bodyParams.id = null,
                bodyParams.personal_manager_id = null,
                bodyParams.first_name = '',
                bodyParams.last_name = 'Помакова Бисерка Драгановна',
                bodyParams.full_name = '',
                bodyParams.organization_name = '',
                bodyParams.patronymic = '',
                bodyParams.group_list = [],
                bodyParams.phone_list = ['79164725823'],
                bodyParams.email_list = ['pomakova@gmail.com'],

                bodyParams.chat_channel_list = [{
                    type: 'telegram',
                    ext_id: '79283810928',
                    name: 'Помакова Бисерка Драгановна',
                    chat_channel_id: null
                }];

                return this;
            },

            anotherPhoneNumber() {
                bodyParams.phone_list[0] = '79161234567';
                return this;
            },

            anotherChannelExtId() {
                bodyParams.chat_channel_list[0].ext_id = '79164725823';
                return this;
            },

            expectToBeSent() {
                processors.forEach(process => process());
                secondProcessors.forEach(process => process());

                const request = ajax.recentRequest().
                    expectToHavePath(`https://$REACT_APP_BASE_URL/contacts`).
                    expectToHaveMethod('POST').
                    expectBodyToContain(bodyParams);

                return addResponseModifiers({
                    receiveResponse: () => {
                        respond(request);

                        Promise.runAll(false, true);
                        spendTime(0)
                        spendTime(0)
                        spendTime(0)
                    }
                });
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    me.contactsRequest = () => {
        let total_count = 250,
            token = 'XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0';

        const params = {
            limit: '100',
            from_id: undefined,
            from_full_name: undefined,
            scroll_direction: 'forward',
            search: utils.expectToBeEmpty(),
        };

        const initialData = [{
            emails: 'balkanska@gmail.com',
            first_name: 'Ралица',
            full_name: 'Балканска Ралица Кубратовна',
            id: 315378,
            last_name: 'Балканска',
            patronymic: 'Кубратовна',
            phones: '2342342342300, 38758393745'
        }, {
            emails: 'ancheva@gmail.com',
            first_name: 'Десислава',
            full_name: 'Анчева Десислава Пламеновна',
            id: 2512832,
            last_name: 'Анчева',
            patronymic: 'Пламеновна',
            phones: '79055023552'
        }];

        const getAdditionalData = ({skipCount = 0, count}) => {
            const firstId = skipCount + 315377,
                lastId = count + firstId,
                data = [];

            let number = 1 + skipCount;

            for (id = firstId; id < lastId; id ++) {
                data.push({
                    emails: 'paskaleva@gmail.com',
                    first_name: 'Бисера',
                    full_name:
                        `Паскалева Бисера Илковна #${new Array(3 - (number + '').length).fill(0).join('')}${number}`,
                    id: id,
                    last_name: 'Паскалева',
                    patronymic: 'Илковна',
                    phones: '79162729533'
                });

                number ++;
            }

            return data;
        };

        let getData = () => initialData.concat(getAdditionalData({
            count: 98,
            skipCount: 2
        }));

        let respond = request => request.respondSuccessfullyWith({
            data: getData(),
            total_count
        });

        let processAccessTokenExpiredMessage = response => response;

        const addResponseModifiers = me => {
            me.oneItem = () => {
                total_count = 1;

                getData = () => [{
                    first_name: 'Бисера',
                    last_name: 'Паскалева',
                    id: 25206823,
                    email_list: ['paskaleva@gmail.com', 'belezhkova@gmail.com'],
                    chat_channel_list: [{
                        ext_id: '79283810986',
                        type: 'whatsapp',
                        chat_channel_id: 84277
                    }, {
                        ext_id: '79283810987',
                        type: 'whatsapp',
                        chat_channel_id: 84278
                    }],
                    organization_name: 'UIS',
                    phone_list: ['79162729533', '79162722748'],
                    group_list: [],
                    personal_manager_id: null,
                    patronymic: 'Илковна',
                    full_name: 'Паскалева Бисера Илковна',
                }];

                return me;
            };

            me.onlySecondItem = () => {
                total_count = 1;

                getData = () => [{
                    first_name: 'Грета',
                    last_name: 'Бележкова',
                    id: 1689283,
                    email_list: [],
                    chat_channel_list: [],
                    organization_name: 'UIS',
                    phone_list: ['79162729533'],
                    group_list: [],
                    personal_manager_id: 8539841,
                    patronymic: 'Ервиновна',
                    full_name: 'Бележкова Грета Ервиновна'
                }];

                return me;
            };

            me.noData = () => {
                total_count = 0;
                getData = () => [];
                return me;
            };

            me.failed = () => {
                respond = request =>
                    request.respondUnsuccessfullyWith('500 Internal Server Error Server got itself in trouble');

                return me;
            };

            me.noStatusTest = () => {
                processAccessTokenExpiredMessage = response => {
                    response.statusText = '';
                    response.responseText = '401: access_token_expired';

                    return response;
                };

                return me;
            };
            
            me.accessTokenExpired = () => {
                respond = request => request.respond(processAccessTokenExpiredMessage({
                    status: 401,
                    statusText: 'access_token_expired',
                    responseText: ''
                }));

                return me;
            };

            me.accessTokenInvalid = () => {
                respond = request => request.respond({
                    status: 401,
                    statusText: 'access_token_invalid',
                    responseText: ''
                });

                return me;
            };

            me.differentNames = () => ((getData = () => [{
                first_name: 'Берислава',
                last_name: 'Балканска',
                id: 1689299,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Силаговна',
                full_name: 'Балканска Берислава Силаговна'
            }, {
                first_name: 'Грета',
                last_name: 'Бележкова',
                id: 1689283,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Ервиновна',
                full_name: 'Бележкова Грета Ервиновна'
            }, {
                first_name: 'Калиса',
                last_name: 'Белоконска-Вражалска',
                id: 1689290,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Еньовна',
                full_name: 'Белоконска-Вражалска Калиса Еньовна'
            }, {
                first_name: 'Джиневра',
                last_name: 'Вампирска',
                id: 1689277,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Ериновна',
                full_name: 'Вампирска Джиневра Ериновна'
            }, {
                first_name: 'Дилмана',
                last_name: 'Васовa',
                id: 1689276,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Златовна',
                full_name: 'Васовa Дилмана Златовна'
            }, {
                first_name: 'Пелина',
                last_name: 'Габровлиева',
                id: 1689308,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Левовна',
                full_name: 'Габровлиева Пелина Левовна'
            }, {
                first_name: 'Дея',
                last_name: 'Градинарова',
                id: 1689298,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Колониновна',
                full_name: 'Градинарова Дея Колониновна'
            }, {
                first_name: 'Станиела',
                last_name: 'Дачева',
                id: 1689317,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Йоан-Александъровна',
                full_name: 'Дачева Станиела Йоан-Александъровна'
            }, {
                first_name: 'Щедра',
                last_name: 'Ждракова',
                id: 1689319,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Геньовна',
                full_name: 'Ждракова Щедра Геньовна'
            }, {
                first_name: 'Малена',
                last_name: 'Илиева',
                id: 1689306,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Боиловна',
                full_name: 'Илиева Малена Боиловна'
            }, {
                first_name: 'Доча',
                last_name: 'Йоткова',
                id: 1689309,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Галиеновна',
                full_name: 'Йоткова Доча Галиеновна'
            }, {
                first_name: 'Станиела',
                last_name: 'Катърова',
                id: 1689293,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Севелиновна',
                full_name: 'Катърова Станиела Севелиновна'
            }, {
                first_name: 'Алексиа',
                last_name: 'Кокошкова',
                id: 1689287,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Петраковна',
                full_name: 'Кокошкова Алексиа Петраковна'
            }, {
                first_name: 'Максимилияна',
                last_name: 'Контопишева',
                id: 1689304,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Божовна',
                full_name: 'Контопишева Максимилияна Божовна'
            }, {
                first_name: 'Стоянка',
                last_name: 'Коритарова',
                id: 1689274,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Лиляновна',
                full_name: 'Коритарова Стоянка Лиляновна'
            }, {
                first_name: 'Заека',
                last_name: 'Кривошапкова',
                id: 1689292,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Яниславовна',
                full_name: 'Кривошапкова Заека Яниславовна'
            }, {
                first_name: 'Никоела',
                last_name: 'Крушовска',
                id: 1689302,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Флориановна',
                full_name: 'Крушовска Никоела Флориановна'
            }, {
                first_name: 'Гримяна',
                last_name: 'Куртажова',
                id: 1689301,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Елвисовна',
                full_name: 'Куртажова Гримяна Елвисовна'
            }, {
                first_name: 'Адрианиа',
                last_name: 'Куртакова',
                id: 1689300,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Владиленовна',
                full_name: 'Куртакова Адрианиа Владиленовна'
            }, {
                first_name: 'Любина',
                last_name: 'Курухубева',
                id: 1689289,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Левчовна',
                full_name: 'Курухубева Любина Левчовна'
            }, {
                first_name: 'Аксентия',
                last_name: 'Кучкуделова',
                id: 1689282,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Золтановна',
                full_name: 'Кучкуделова Аксентия Золтановна'
            }, {
                first_name: 'Върбунка',
                last_name: 'Луланкова',
                id: 1689321,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Ованесовна',
                full_name: 'Луланкова Върбунка Ованесовна'
            }, {
                first_name: 'Гълъбица',
                last_name: 'Мангъфова',
                id: 1689280,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Ветковна',
                full_name: 'Мангъфова Гълъбица Ветковна'
            }, {
                first_name: 'Миранза',
                last_name: 'Многознаева',
                id: 1689275,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Денизовна',
                full_name: 'Многознаева Миранза Денизовна'
            }, {
                first_name: 'Цветилена',
                last_name: 'Муева',
                id: 1689318,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Елиасовна',
                full_name: 'Муева Цветилена Елиасовна'
            }, {
                first_name: 'Лариса',
                last_name: 'Мустакова',
                id: 1689314,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Христофоровна',
                full_name: 'Мустакова Лариса Христофоровна'
            }, {
                first_name: 'Луна',
                last_name: 'Пачаръзка',
                id: 1689286,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Пантюовна',
                full_name: 'Пачаръзка Луна Пантюовна'
            }, {
                first_name: 'Симона',
                last_name: 'Певецова',
                id: 1689296,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Златьовна',
                full_name: 'Певецова Симона Златьовна'
            }, {
                first_name: 'Щедра',
                last_name: 'Пенджакова',
                id: 1689295,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Хавтелиновна',
                full_name: 'Пенджакова Щедра Хавтелиновна'
            }, {
                first_name: 'Гюргя',
                last_name: 'Пищовколева',
                id: 1689310,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Ърчовна',
                full_name: 'Пищовколева Гюргя Ърчовна'
            }, {
                first_name: 'Богдалина',
                last_name: 'Плюнкова',
                id: 1689303,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Ламбовна',
                full_name: 'Плюнкова Богдалина Ламбовна'
            }, {
                first_name: 'Цветилена',
                last_name: 'Плюцова',
                id: 1689294,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Хорозовна',
                full_name: 'Плюцова Цветилена Хорозовна'
            }, {
                first_name: 'Люляна',
                last_name: 'Пръндачка',
                id: 1689278,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Марушовна',
                full_name: 'Пръндачка Люляна Марушовна'
            }, {
                first_name: 'Дорина',
                last_name: 'Първанова',
                id: 1689312,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Теодосийовна',
                full_name: 'Първанова Дорина Теодосийовна'
            }, {
                first_name: 'Жичка',
                last_name: 'Пътечкова',
                id: 1689311,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Рогеновна',
                full_name: 'Пътечкова Жичка Рогеновна'
            }, {
                first_name: 'Касиди',
                last_name: 'Сапунджиева',
                id: 1689313,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Ромеовна',
                full_name: 'Сапунджиева Касиди Ромеовна'
            }, {
                first_name: 'Любослава',
                last_name: 'Скринска',
                id: 1689316,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Албертовна',
                full_name: 'Скринска Любослава Албертовна'
            }, {
                first_name: 'Наташа',
                last_name: 'Сланинкова',
                id: 1689291,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Петринеловна',
                full_name: 'Сланинкова Наташа Петринеловна'
            }, {
                first_name: 'Миглена',
                last_name: 'Сопаджиева',
                id: 1689285,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Генчовна',
                full_name: 'Сопаджиева Миглена Генчовна'
            }, {
                first_name: 'Заека',
                last_name: 'Стойкова',
                id: 1689322,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Ирмовна',
                full_name: 'Стойкова Заека Ирмовна'
            }, {
                first_name: 'Нани',
                last_name: 'Таралингова',
                id: 1689305,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Геровна',
                full_name: 'Таралингова Нани Геровна'
            }, {
                first_name: 'Върбунка',
                last_name: 'Тодорова',
                id: 1689297,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Кирковна',
                full_name: 'Тодорова Върбунка Кирковна'
            }, {
                first_name: 'Флорика',
                last_name: 'Точева-Клопова',
                id: 1689273,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Филковна',
                full_name: 'Точева-Клопова Флорика Филковна'
            }, {
                first_name: 'Оливера',
                last_name: 'Чанлиева',
                id: 1689281,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Якововна',
                full_name: 'Чанлиева Оливера Якововна'
            }, {
                first_name: 'Адра',
                last_name: 'Червенкова',
                id: 1689315,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Форовна',
                full_name: 'Червенкова Адра Форовна'
            }, {
                first_name: 'Симона',
                last_name: 'Чукова',
                id: 1689320,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Гелемировна',
                full_name: 'Чукова Симона Гелемировна'
            }, {
                first_name: 'Комара',
                last_name: 'Чупетловска',
                id: 1689307,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Заховна',
                full_name: 'Чупетловска Комара Заховна'
            }, {
                first_name: 'Патриотка',
                last_name: 'Шестакова',
                id: 1689288,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Златковна',
                full_name: 'Шестакова Патриотка Златковна'
            }, {
                first_name: 'Делиана',
                last_name: 'Шкембова',
                id: 1689284,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Хараламповна',
                full_name: 'Шкембова Делиана Хараламповна'
            }, {
                first_name: 'Мелъди',
                last_name: 'Яркова',
                id: 1689279,
                email_list: [],
                chat_channel_list: [],
                organization_name: 'UIS',
                phone_list: ['79162729533'],
                group_list: [],
                personal_manager_id: 8539841,
                patronymic: 'Хрисовна',
                full_name: 'Яркова Мелъди Хрисовна'
            }]), me);

            return me;
        };

        return addResponseModifiers({
            phoneSearching() {
                params.search = '79162729534';
                params.merge_entity = 'phone';
                return this;
            },

            anotherPhoneSearching() {
                params.search = '79162729537';
                params.merge_entity = 'phone';
                return this;
            },

            thirdPhoneSearching() {
                params.search = '79162729536';
                params.merge_entity = 'phone';
                return this;
            },

            fourthPhoneSearching() {
                params.search = '74950230625';
                params.merge_entity = 'phone';
                return this;
            },

            emailSearching() {
                params.search = 'belezhkova@gmail.com';
                params.merge_entity = 'email';
                return this;
            },

            channelSearching() {
                params.search = '79283810987';
                params.merge_entity = 'chat_channel';
                return this;
            },

            anotherChannelSearching() {
                params.search = '2895298572424359475';
                params.merge_entity = 'chat_channel';
                return this;
            },

            thirdChannelSearching() {
                params.search = '79218307632';
                params.merge_entity = 'chat_channel';
                return this;
            },

            anotherAuthorizationToken() {
                token = '935jhw5klatxx2582jh5zrlq38hglq43o9jlrg8j3lqj8jf';
                return this;
            },

            search() {
                params.search = 'паска';
                return this;
            },

            secondPage() {
                params.from_id = '315476';
                params.from_full_name = 'Паскалева Бисера Илковна #100';

                getData = () => getAdditionalData({
                    count: 100,
                    skipCount: 100
                });

                return this;
            },

            thirdPage() {
                params.from_id = '315576';
                params.from_full_name = 'Паскалева Бисера Илковна #200';

                getData = () => getAdditionalData({
                    count: 50,
                    skipCount: 200
                });

                return this;
            },

            fourthPage() {
                params.from_id = '315626';
                params.from_full_name = 'Паскалева Бисера Илковна #250';

                getData = () => [];

                return this;
            },

            expectToBeSent(requests) {
                const request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectToHavePath('https://$REACT_APP_BASE_URL/contacts').
                    expectToHaveMethod('GET').
                    expectToHaveHeaders({
                        'X-Auth-Token': token,
                        'X-Auth-Type': 'jwt'
                    }).
                    expectQueryToContain(params);

                const me = addResponseModifiers({
                    receiveResponse: () => {
                        respond(request);

                        Promise.runAll(false, true);
                        spendTime(0)
                        spendTime(0)

                        maybeRunSpinWrapperIntersectionCallback(getSpinWrapper());
                    }
                });

                return me;
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    me.accountRequest = () => {
        let token = 'XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0',
            method = 'getobj.account',
            respond = request => request.respondSuccessfullyWith(response);

        const response = {
            result: {
                data: {
                    lang: 'ru',
                    tp_id: 406,
                    app_id: 1103,
                    project: 'comagic',
                    tp_name: 'Comagic Enterprise',
                    user_id: 151557,
                    employee_id: 20816,
                    app_name: 'Карадимова Веска Анастасовна',
                    crm_type: 'e2e_analytics',
                    timezone: 'Europe/Moscow',
                    app_state: 'active',
                    user_name: 'karadimova',
                    user_type: 'user',
                    feature_flags: [
                        'softphone',
                        'large_softphone',
                        'call_stats',
                        'call_history',
                        'contacts',
                        'contact_creating',
                        'contact_deleting',
                        'outgoing_chat',
                        'contact_channel_creating',
                        'telegram_contact_channel',
                        'chat_pinning',
                        'x_widget_type_header',
                    ],
                    call_center_role: 'employee',
                    components: [
                        'operation',
                        'dialing',
                        'ext_dialing',
                        'extended_report',
                        'fax_receiving',
                        'voice_mail',
                        'menu',
                        'information_message',
                        'auth',
                        'integration',
                        'fax_receiving_button',
                        'transfer',
                        'tag_call',
                        'run_scenario',
                        'trainer',
                        'trainer_in',
                        'trainer_button',
                        'trainer_desktop',
                        'call_distribution_report',
                        'call_session_distribution_report',
                        'recording_in',
                        'recording_out',
                        'recording_button',
                        'notification',
                        'notification_by_sms',
                        'notification_by_email',
                        'notification_by_http',
                        'api',
                        'callapi',
                        'callapi_management_call',
                        'callapi_informer_call',
                        'callapi_scenario_call',
                        'send_sms',
                        'va',
                        'call_tracking',
                        'dynamic_call_tracking',
                        'ppc_integration',
                        'wa_integration',
                        'callout',
                        'callback',
                        'sip',
                        'consultant',
                        'recording',
                        'talk_option',
                        'sitephone',
                        'lead',
                        'partner_integration',
                        'amocrm',
                        'reserve_dynamic_numbers',
                        'retailcrm',
                        'dashboard',
                        'dataapi',
                        'dataapi_reports',
                        'dataapi_provisioning',
                        'speech_analytics',
                        'processed_lost_call',
                        'bitrix',
                        'distribution_by_communication_number',
                        'distribution_by_region',
                        'distribution_by_segment',
                        'private_number',
                        'megaplan',
                        'internal_lines',
                        'fmc',
                        'auto_back_call_by_lost_call',
                        'split_channel_recording',
                        'infoclinica',
                        'facebook_ads',
                        'google_adwords',
                        'yandex_direct',
                        'sales_funnel',
                        'number_capacity_auto_usage',
                        'call_monitoring_and_analytics',
                        'keyword_spotting',
                        'attribution_tools',
                        'assisted_conversions',
                        'attribution_models',
                        'antispam',
                        'auto_back_call_by_offline_message',
                        'amocrm_extended_integration',
                        'spam_calls_blocking',
                        'upload_calls',
                        'preserved_calls',
                        '1c_rarus',
                        'fitness_1c',
                        'yandex_metrika',
                        'e2e_analytics',
                        'vk_ads',
                        'upload_offline_messages',
                        'upload_chats',
                        'mytarget_ads',
                        'stt_crt',
                        'upload_sessions',
                    ],
                    user_login: 'karadimova',
                    customer_id: 183510,
                    limits: [],
                    permissions: [
                        {
                            'unit_id': 'call_recordings',
                            'is_delete': true,
                            'is_insert': false,
                            'is_select': true,
                            'is_update': true,
                        },
                        {
                            'unit_id': 'tag_management',
                            'is_delete': true,
                            'is_insert': true,
                            'is_select': true,
                            'is_update': true,
                        },
                        {
                            'unit_id': 'softphone_login',
                            'is_delete': true,
                            'is_insert': true,
                            'is_select': true,
                            'is_update': true,
                        },
                        {
                            'unit_id': 'address_book',
                            'is_delete': true,
                            'is_insert': true,
                            'is_select': true,
                            'is_update': true,
                        },
                        {
                            'unit_id': 'web_account_login',
                            'is_delete': true,
                            'is_insert': true,
                            'is_select': true,
                            'is_update': true,
                        },
                        {
                            'unit_id': 'offline_messages_management',
                            'is_delete': true,
                            'is_insert': true,
                            'is_select': true,
                            'is_update': true,
                        }
                    ],
                    is_agent_app: false
                }
            }
        };

        addResponseModifiers = me => {
            me.accessTokenExpired = () => {
                respond = request => request.respondSuccessfullyWith({
                    error: {
                        data: { mnemonic: 'access_token_expired' },
                    },
                });

                return me;
            };

            me.callGear = () => {
                response.result.data.project = 'usa';
                return me;
            };

            me.rolands = () => {
                response.result.data.project = 'rolands';
                return me;
            };

            me.en = () => {
                response.result.data.lang = 'en';
                return me;
            };

            me.offlineMessagesManagementUpdatingUnavailable = () => {
                (response.result.data.permissions.find(
                    ({ unit_id }) => unit_id == 'offline_messages_management'
                ) || {}).is_update = false;

                return me;
            };

            me.offlineMessagesManagementUnavailable = () => {
                (response.result.data.permissions.find(
                    ({ unit_id }) => unit_id == 'offline_messages_management'
                ) || {}).is_select = false;

                return me;
            };

            me.tagsUpdatingUnavailable = () => {
                (response.result.data.permissions.find(
                    ({ unit_id }) => unit_id == 'tag_management'
                ) || {}).is_update = false;

                return me;
            };

            me.webAccountLoginUnavailable = () => {
                (response.result.data.permissions.find(
                    ({ unit_id }) => unit_id == 'web_account_login'
                ) || {}).is_select = false;

                return me;
            };

            me.otherEmployeeChatsAccessAvailable = () => {
                response.result.data.permissions.push({
                    'unit_id': 'other_employee_chats_access',
                    'is_delete': true,
                    'is_insert': true,
                    'is_select': true,
                    'is_update': true,
                });

                return me;
            };

            me.webAccountLoginAvailable = () => {
                response.result.data.permissions.push({
                    'unit_id': 'web_account_login',
                    'is_delete': true,
                    'is_insert': true,
                    'is_select': true,
                    'is_update': true,
                });

                return me;
            };

            me.operatorWorkplaceAvailable = () => {
                response.result.data.components.push('operator_workplace');

                response.result.data.permissions.push({
                    'unit_id': 'operator_workplace_access',
                    'is_delete': true,
                    'is_insert': true,
                    'is_select': true,
                    'is_update': true,
                });

                return me;
            };
            
            me.manager = () => ((response.result.data.call_center_role = 'manager'), me);
            me.noCallCenterRole = () => ((response.result.data.call_center_role = null), me);

            me.shouldHideNumbersInContactName = () =>
                ((response.result.data.feature_flags.push('should_hide_numbers_in_contact_name')), me);

            me.interceptionDisabled = () =>
                ((response.result.data.feature_flags.push('interception_disabled')), me);

            me.xWidgetTypeHeaderDisabled = () =>
                ((response.result.data.feature_flags = response.result.data.feature_flags.filter(featureFlag =>
                    featureFlag != 'x_widget_type_header')), me);

            me.chatPinningDisabled = () =>
                ((response.result.data.feature_flags = response.result.data.feature_flags.filter(featureFlag =>
                    featureFlag != 'chat_pinning')), me);

            me.telegramContactChannelFeatureFlagDisabled = () =>
                ((response.result.data.feature_flags = response.result.data.feature_flags.filter(featureFlag =>
                    featureFlag != 'telegram_contact_channel')), me);

            me.contactChannelCreatingFeatureFlagDisabled = () =>
                ((response.result.data.feature_flags = response.result.data.feature_flags.filter(featureFlag =>
                    featureFlag != 'contact_channel_creating')), me);

            me.outgoingChatFeatureFlagDisabled = () =>
                ((response.result.data.feature_flags = response.result.data.feature_flags.filter(featureFlag =>
                    featureFlag != 'outgoing_chat')), me);

            me.contactDeletingFeatureFlagDisabled = () =>
                ((response.result.data.feature_flags = response.result.data.feature_flags.filter(featureFlag =>
                    featureFlag != 'contact_deleting')), me);

            me.contactCreatingFeatureFlagDisabled = () =>
                ((response.result.data.feature_flags = response.result.data.feature_flags.filter(featureFlag =>
                    featureFlag != 'contact_creating')), me);

            me.newSoftphoneBackendFeatureFlagEnabled = () =>
                ((response.result.data.feature_flags.push('new_softphone_backend')), me);
            
            me.softphoneFeatureFlagDisabled = () =>
                ((response.result.data.feature_flags = response.result.data.feature_flags.filter(featureFlag =>
                    featureFlag != 'softphone')), me);

            me.contactsFeatureFlagDisabled = () =>
                ((response.result.data.feature_flags = response.result.data.feature_flags.filter(featureFlag =>
                    featureFlag != 'contacts')), me);

            me.largeSoftphoneFeatureFlagDisabled = () =>
                ((response.result.data.feature_flags = response.result.data.feature_flags.filter(featureFlag =>
                    featureFlag != 'large_softphone')), me);

            me.callStatsFeatureFlagDisabled = () =>
                ((response.result.data.feature_flags = response.result.data.feature_flags.filter(featureFlag =>
                    featureFlag != 'call_stats')), me);

            me.callHistoryFeatureFlagDisabled = () =>
                ((response.result.data.feature_flags = response.result.data.feature_flags.filter(featureFlag =>
                    featureFlag != 'call_history')), me);

            me.managerSoftphoneFeatureFlagEnabled = () =>
                ((response.result.data.feature_flags = ['manager_softphone']), me);

            me.softphoneUnavailable = () => ((response.result.data.permissions =
                response.result.data.permissions.filter(({unit_id}) => unit_id != 'softphone_login')), me);

            me.addressBookReadingUnavailable = () => {
                (response.result.data.permissions.find(
                    ({ unit_id }) => unit_id == 'address_book'
                ) || {}).is_select = false;

                return me;
            };

            me.addressBookUpdatingUnavailable = () => {
                (response.result.data.permissions.find(
                    ({ unit_id }) => unit_id == 'address_book'
                ) || {}).is_update = false;

                return me;
            };

            me.addressBookCreatingUnavailable = () => {
                (response.result.data.permissions.find(
                    ({ unit_id }) => unit_id == 'address_book'
                ) || {}).is_insert = false;

                return me;
            };

            me.addressBookDeletingUnavailable = () => {
                (response.result.data.permissions.find(
                    ({ unit_id }) => unit_id == 'address_book'
                ) || {}).is_delete = false;

                return me;
            };

            return me;
        };

        let getAuthorizationHeader = () => ({
            Authorization: `Bearer ${token}`,
            'X-Auth-Token': token,
            'X-Auth-Type': 'jwt'
        });

        return addResponseModifiers({
            noAuthorizationHeader() {
                getAuthorizationHeader = () => ({
                    Authorization: undefined,
                    'X-Auth-Token': undefined,
                    'X-Auth-Type': undefined,
                });

                return this;
            },
            
            forChats() {
                getAuthorizationHeader = () => ({
                    Authorization: undefined,
                    'X-Auth-Token': token,
                    'X-Auth-Type': 'jwt'
                });

                method = 'get_account';
                return this;
            },

            anotherAuthorizationToken() {
                token = '935jhw5klatxx2582jh5zrlq38hglq43o9jlrg8j3lqj8jf';
                return this;
            },

            thirdAuthorizationToken() {
                token = '2924lg8hg95gl8h3g2lg8o2hgg8shg8olg8qg48ogih7h29';
                return this;
            },

            expectToBeSent(requests) {
                let request = (requests ? requests.someRequest() : ajax.recentRequest()).
                    expectPathToContain('$REACT_APP_BASE_URL').
                    expectToHaveMethod('POST').
                    expectToHaveHeaders(getAuthorizationHeader()).
                    expectBodyToContain({
                        method,
                        params: {}
                    });

                spendTime(0);

                const me = addResponseModifiers({
                    receiveResponse: () => {
                        respond(request);

                        Promise.runAll(false, true);
                        spendTime(0)
                        spendTime(0)
                        spendTime(0);
                        spendTime(0);
                        spendTime(0);
                        spendTime(0);
                        spendTime(0);
                    }
                });

                return me;
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    me.refreshRequest = () => {
        const response = {
            result: {
                jwt: '935jhw5klatxx2582jh5zrlq38hglq43o9jlrg8j3lqj8jf',
                refresh: '4g8lg282lr8jl2f2l3wwhlqg34oghgh2lo8gl48al4goj48'
            }
        };

        let token = 'XaRnb2KVS0V7v08oa4Ua-sTvpxMKSg9XuKrYaGSinB0',
            refresh = '2982h24972hls8872t2hr7w8h24lg72ihs7385sdihg2';

        let getHeaders = () => ({
            Authorization: `Bearer ${token}`,
            'X-Auth-Type': 'jwt',
        });

        let getParams = () => ({
            jwt: token,
            refresh,
        });

        const addResponseModifiers = me => {
            me.invalidJwt = () => {
                response.result = null;

                response.error = {
                    code: '-33000',
                    message: 'Invalid JWT',
                };

                return me;
            };

            me.refreshTokenExpired = () => {
                response.result = null;

                response.error = {
                    code: '-33020',
                    message: 'Expired refresh token'
                };

                return me;
            };

            me.anotherAuthorizationToken = () => {
                token = '935jhw5klatxx2582jh5zrlq38hglq43o9jlrg8j3lqj8jf';
                refresh = '4g8lg282lr8jl2f2l3wwhlqg34oghgh2lo8gl48al4goj48';

                response.result.jwt = thirdJwtToken.jwt;
                response.result.refresh = thirdJwtToken.refresh;

                return me;
            };

            return me;
        };

        return addResponseModifiers({
            badRequest() {
                getParams = () => ({
                    jwt: undefined,
                    refresh: undefined,
                });

                getHeaders = () => ({
                    Authorization: undefined,
                    'X-Auth-Type': undefined,
                });

                response.result = null;

                response.error = {
                    code: '400',
                    message: {
                        error: {
                            code: 'bad_request',
                            message: [{
                                loc: ['jwt'],
                                msg: 'field required',
                                type: 'value_error.missing',
                            }, {
                                loc: ['refresh'],
                                msg: 'field required',
                                type: 'value_error.missing',
                            }],
                        },
                    },
                };

                return this;
            },

            expectToBeSent() {
                request = ajax.recentRequest().
                    expectPathToContain('$REACT_APP_AUTH_URL').
                    expectToHaveMethod('POST').
                    expectToHaveHeaders(getHeaders()).
                    expectBodyToContain({
                        method: 'refresh',
                        params: getParams(),
                    });

                spendTime(0);

                return addResponseModifiers({
                    receiveResponse() {
                        request.respondSuccessfullyWith(response);

                        Promise.runAll(false, true);
                        spendTime(0)
                        spendTime(0);
                    }
                });
            },

            receiveResponse() {
                this.expectToBeSent().receiveResponse();
            }
        });
    };

    me.loginRequest = () => {
        const response = {
            result: jwtToken 
        };

        const addResponseModifiers = me => {
            me.anotherAuthorizationToken = () => {
                response.result = anotherJwtToken;
                return me;
            };

            me.failure = () => {
                response.result = null;

                response.error = {
                    code: '-32001',
                    message: 'Login or password is wrong',
                };

                return me;
            };

            return me;
        };

        return addResponseModifiers({
            expectToBeSent() {
                const request = ajax.recentRequest().
                    expectPathToContain('$REACT_APP_AUTH_URL').
                    expectToHaveMethod('POST').
                    expectBodyToContain({
                        method: 'login',
                        params: {
                            login: 'botusharova',
                            password: '8Gls8h31agwLf5k',
                            project: 'comagic'
                        }
                    });

                return addResponseModifiers({
                    receiveResponse() {
                        request.respondSuccessfullyWith(response);

                        Promise.runAll(false, true);
                        spendTime(0);
                        spendTime(0);
                        spendTime(0);
                        spendTime(0);
                    }
                });
            },

            receiveResponse() {
                return this.expectToBeSent().receiveResponse();
            }
        });
    };

    me.extendMasterNotification((notification, data) => ((notification.revive = () =>
        ((data.action = 'revive'), notification)), notification));

    me.extendOthersNotification((notification, data) => {
        notification.prompterCallPreparation = () => {
            data.action = 'prepare_to_prompter_call';

            data.data = {
                call_session_id: 79161234567,
                subscriber_number: '79161234569',
                employee_full_name: 'Шалева Дора Добриновна',
                show_notification: true
            };

            notification.noSubscriberNumber = () => ((data.data.subscriber_number = null), notification);
            notification.dontShowNotification = () => ((data.data.show_notification = false), notification);
            notification.anotherPhoneNumber = () => ((data.data.call_session_id = 79161234570), notification);

            return notification;
        };
        
        return notification;
    });

    me.ipcPrompterCallPreparationMessage = () => {
        const data = {
            call_session_id: 79161234567,
            subscriber_number: '79161234569',
            employee_full_name: 'Шалева Дора Добриновна',
            show_notification: true
        };
        
        return {
            noSubscriberNumber() {
                data.subscriber_number = null;
                return this;
            },

            dontShowNotification() {
                data.show_notification = false;
                return this;
            },

            anotherPhoneNumber() {
                data.call_session_id = 79161234570;
                return this;
            },

            receive: () => {
                me.eventBus.broadcast('prepare_to_prompter_call', data);
                Promise.runAll(false, true);
                spendTime(0);
                spendTime(0);
            }
        };
    };

    me.outgoingCallEvent = () => ({
        dispatch: () => {
            me.eventBus.broadcast('outgoing_call', '79161234567');
        }
    });

    me.callStartMessage = () => ({
        expectToBeSent: () => me.eventBus.
            nextEvent().
            expectEventNameToEqual('call_start')
    });

    me.callEndMessage = () => ({
        expectToBeSent: () => me.eventBus.
            nextEvent().
            expectEventNameToEqual('call_end')
    });

    me.appReadyMessage = () => ({
        expectToBeSent: () => me.eventBus.
            nextEvent().
            expectEventNameToEqual('app_ready')
    });

    me.unmaximizeMessage = () => ({
        expectToBeSent: () => me.eventBus.
            nextEvent().
            expectEventNameToEqual('unmaximize')
    });

    me.resizeMessage = () => ({
        expectToBeSent: () => me.eventBus.
            nextEvent().
            expectEventNameToEqual('resize')
    });

    me.authorizednessSettingRequest = () => ({
        expectToBeSent: () => me.eventBus.
            nextEvent().
            expectEventNameToEqual('set_authorized')
    });

    me.authorizednessGettingRequest = () => ({
        expectToBeSent: () => me.eventBus.
            nextEvent().
            expectEventNameToEqual('get_authorized')
    });

    me.submoduleInitilizationRequest = () => ({
        expectToBeSent: () => me.eventBus.
            nextEvent().
            expectEventNameToEqual('submodule_initilized')
    });

    me.authenticationTypeRequest = () => ({
        expectToBeSent: () => me.eventBus.
            nextEvent().
            expectEventNameToEqual('workplace-utils/src/requester/request(has_sso_auth)')
    });

    me.unreadMessagesCountSettingRequest = () => ({
        expectToBeSent: () => me.eventBus.
            nextEvent().
            expectEventNameToEqual('set_unread_messages_count')
    });

    me.ipcPrompterCallAwaitMessage = () => {
        let data = null;
        
        return {
            alreadyPreparing() {
                data = 'Подготовка к звонку уже прозводится';
                return this;
            },

            expectToBeSent: () => me.eventBus.
                nextEvent().
                expectEventNameToEqual('await_prompter_call').
                expectToHaveArguments(data)
        };
    };

    me.settingsFetchedMessage = () => ({
        expectToBeSent: () => me.eventBus.
            nextEvent().
            expectEventNameToEqual('settings_fetched')
    });

    me.ipcPrompterCallEndMessage = () => ({
        receive: () => me.eventBus.broadcast('end_prompter_call')
    });

    me.applicationVersionChanged = function () {
        var params = {
            application_version: '6.6.666'
        };

        return {
            critical: function () {
                params.application_version = '6.7.666';
                return this;
            },
            uncritical: function () {
                params.application_version = '6.6.667';
                return this;
            },
            receive: function () {
                me.eventsWebSocket.receiveMessage({
                    name: 'application_version_changed',
                    type: 'event',
                    params: params 
                });
            }
        };
    };

    me.disableTimeout = callback => {
        const setTimeout = window.setTimeout;
        window.setTimeout = () => null;

        callback();

        window.setTimeout = setTimeout;
    };

    me.dispatchResizeEvent = () => {
        window.dispatchEvent(new Event('resize'));
        spendTime(0);
    };

    me.forceUpdate = () => utils.pressKey('k');
    me.body = testersFactory.createDomElementTester('body');
    me.phoneIcon = testersFactory.createDomElementTester('.cm-top-menu-phone-icon');

    me.incomingIcon = testersFactory.createDomElementTester(
        '.ui-direction-icon-incoming, ' +
        '.cmgui-direction-icon-incoming'
    );

    me.outgoingIcon = testersFactory.createDomElementTester(
        '.ui-direction-icon-outgoing, ' +
        '.cmgui-direction-icon-outgoing'
    );

    me.directionIcon = testersFactory.createDomElementTester(
        '.ui-direction-icon, ' +
        '.cmgui-direction-icon'
    );

    me.transferIncomingIcon = testersFactory.createDomElementTester(
        '.ui-direction-icon-transfer, ' +
        '.cmgui-direction-icon-transfer'
    );

    me.productsButton = testersFactory.
        createDomElementTester('.src-components-main-menu-products-styles-module__icon-container');

    addTesters(me, () => document.body);

    me.searchButton = testersFactory.createDomElementTester('.cmg-search-button');

    me.contactsButton = (() => {
        const tester = testersFactory.createDomElementTester('#cmg-contacts-button'),
            click = tester.click.bind(tester);

        tester.click = () => (click(), spendTime(0), spendTime(0), spendTime(0), spendTime(0));
        tester.expectToBePressed = () => tester.expectToHaveClass('cmg-button-pressed');
        tester.expectNotToBePressed = () => tester.expectNotToHaveClass('cmg-button-pressed');
        tester.expectToBeDisabled = () => tester.expectToHaveClass('cmg-button-disabled');
        tester.expectToBeEnabled = () => tester.expectNotToHaveClass('cmg-button-disabled');

        return tester;
    })();

    const addCommunicationPanelTestingMethods = selector => {
        const getDomElement = () => utils.querySelector(selector, true),
            tester = addTesters(testersFactory.createDomElementTester(getDomElement), getDomElement),
            downloadAnchors = new Set(),
            noElement = new JsTester_NoElement(),
            messageClassNames = '.cm-chats--chat-history-message, .cm-contacts-system-message';

        const createMessageTester = getMessageElement => {
            const createTester = (filter = () => true) => {
                const tester = testersFactory.createDomElementTester(() => getMessageElement(filter)),
                    putMouseOver = tester.putMouseOver.bind(tester);

                tester.putMouseOver = () => (putMouseOver(), spendTime(100), spendTime(0));

                tester.inner = (() => {
                    const tester = testersFactory.createDomElementTester(
                        () => getMessageElement(filter).querySelector('.cm-contacts-system-message-inner')
                    );

                    const putMouseOver = tester.putMouseOver.bind(tester);
                    tester.putMouseOver = () => (putMouseOver(), spendTime(100), spendTime(0));

                    return tester;
                })();

                tester.directionIcon = testersFactory.createDomElementTester(() => {
                    const domElements = Array.prototype.filter.call(
                        getMessageElement(filter).querySelectorAll('svg'),

                        domElement => {
                            return ((domElement.getAttribute('class') || '') + '').includes('ui-direction-icon');
                        }
                    );

                    if (domElements.length == 1) {
                        return domElements[0];
                    }

                    return new JsTester_NoElement();
                });

                const messageBody  = testersFactory.createDomElementTester(() => {
                    const messageElement = getMessageElement(filter);

                    if (messageElement.classList.contains('cm-contacts-call-wrapper')) {
                        return messageElement.querySelector('.cm-chats--chat-history-message');
                    }

                    return messageElement;
                });

                tester.expectSourceToBeOperator = () => messageBody.expectToHaveClass(
                    'cm-chats--chat-history-message-source-operator'
                );

                tester.expectSourceToBeVisitor = () => messageBody.expectToHaveClass(
                    'cm-chats--chat-history-message-source-visitor'
                );

                tester.expectToBeDelivered = () => testersFactory.createDomElementTester(
                    () => getMessageElement(filter).querySelector('.cm-chats--chat-history-message-text')
                ).expectToHaveClass('cm-chats--is-delivered-message');
                    
                tester.expectToHaveNoStatus = () => testersFactory.createDomElementTester(
                    () => getMessageElement(filter).querySelector('.cm-chats--chat-history-message-text')
                ).expectToHaveClass('cm-chats--is-unknown-message');

                tester.preview = testersFactory.createDomElementTester(() =>
                    getMessageElement(filter).querySelector('.cm-chats--preview'));

                tester.ellipsisButton = (() => {
                    const tester = testersFactory.createDomElementTester(
                        () => getMessageElement(filter).querySelector('.cm-chats--download-popup-button')
                    );

                    const click = tester.click.bind(tester);
                    tester.click = () => (click(), spendTime(0));

                    return tester;
                })();

                const downloadAnchor = Array.prototype.find.call(
                    getMessageElement(filter).querySelectorAll('a'),
                    domElement => domElement.style.display == 'none'
                ) || noElement;

                if (!downloadAnchors.has(downloadAnchor)) {
                    downloadAnchors.add(downloadAnchor);
                    downloadAnchor.addEventListener('click', event => event.preventDefault());
                }

                downloadAnchorTester = testersFactory.createAnchorTester(downloadAnchor);
                downloadAnchorTester.expectToBeVisible = () => null;

                tester.downloadedFile = {
                    expectToHaveName: expectedName => {
                        (downloadAnchor == noElement ? tester.downloadIcon : downloadAnchorTester).
                            expectAttributeToHaveValue('download', expectedName);

                        return tester.downloadedFile;
                    },

                    expectToHaveContent: expectedContent => {
                        if (downloadAnchor == noElement) {
                            tester.downloadIcon.expectHrefToBeBlobWithContent(expectedContent);
                        } else {
                            downloadAnchorTester.expectHrefToHaveHash(expectedContent);
                        }

                        return tester.downloadedFile;
                    }
                };

                return addTesters(tester, () => getMessageElement(filter));
            };

            const tester = createTester(),
                expectToBeVisible = tester.expectToBeVisible.bind(tester);

            tester.expectToBeVisible = () => {
                expectToBeVisible();

                if (!utils.isIntersecting(getDomElement(), getMessageElement())) {
                    throw new Error('Сообщение должно быть видимым.');
                }
            };

            tester.expectToBeHidden = () => {
                const messageElement = getMessageElement();

                if (utils.isNonExisting(messageElement)) {
                    throw new Error('Сообщение должно существовать.');
                }
                
                if (!utils.isVisible(messageElement)) {
                    return;
                }

                if (utils.isIntersecting(getDomElement(), messageElement)) {
                    throw new Error('Сообщение должно быть скрытым.');
                }
            };

            tester.notSystem = createTester(domElement => {
                const messageElement = domElement.closest('.cm-contacts-system-message');
                return !messageElement || messageElement instanceof JsTester_NoElement;
            });

            return tester;
        };

        tester.message = {
            containsSubstring: expectedSubstring => createMessageTester(() => utils.descendantOf(getDomElement()).
                matchesSelector(messageClassNames).
                textContains(expectedSubstring).
                find()),

            atTime: desiredTime => createMessageTester((filter = () => true) => {
                const domElements = utils.descendantOf(getDomElement()).
                    matchesSelector('.cm-chats--chat-history-message-time').
                    textEquals(desiredTime).
                    findAll().
                    filter(domElement => {
                        const callRecordElement = domElement.closest('.cm-contacts-communications-call-record');

                        if (callRecordElement && !(callRecordElement instanceof JsTester_NoElement)) {
                            return false;
                        }

                        if (!filter(domElement)) {
                            return false;
                        }

                        return true;
                    });

                const domElement = (() => {
                    if (domElements.length != 1) {
                        return new JsTester_NoElement();
                    }

                    return domElements[0];
                })();

                const messageElement = domElement.closest(messageClassNames) || new JsTester_NoElement(),
                    callWrapperElement = domElement.closest('.cm-contacts-call-wrapper');

                if (callWrapperElement && !(callWrapperElement instanceof JsTester_NoElement)) {
                    return callWrapperElement;
                }

                return messageElement;
            })
        };

        return tester;
    };

    {
        const bottomClassName = '.cm-chats--chat-panel-history-bottom';

        me.chatHistory = addCommunicationPanelTestingMethods('.cm-chats--chat-panel-history');
        me.chatHistory.bottom = testersFactory.createDomElementTester(bottomClassName);

        const scrollTo = me.chatHistory.scrollTo.bind(me.chatHistory);

        me.chatHistory.scrollTo = scrollTop => {
            scrollTo(scrollTop);
            spendTime(0);
        };

        me.chatHistory.bottom.expectToBeVisible = () => {
            const chatHistoryElement = utils.querySelector('.cm-chats--chat-panel-history'),
                bottomElement = utils.querySelector(bottomClassName);

            return utils.isIntersecting(chatHistoryElement, bottomElement);
        };
    }

    me.visitorPanel = (() => {
        const getDomElement = () => utils.querySelector('.cm-chats--visitor-info-panel'),
            tester = testersFactory.createDomElementTester(getDomElement);

        return addTesters(tester, getDomElement);
    })();

    me.contactBar = (() => {
        const getContactBar = () => {
            let contactBar = utils.querySelector('.cmg-softphone-contact-bar');
            contactBar instanceof JsTester_NoElement && (contactBar = utils.querySelector('.cm-contacts-contact-bar'));

            return contactBar;
        };

        const tester = testersFactory.createDomElementTester(getContactBar),
            click = tester.click.bind(tester);
        tester.click = () => (click(), spendTime(0));

        tester.title = (() => {
            const getTitleElement = () => getContactBar().querySelector('.cm-contacts-contact-bar-title'),
                tester = addTesters(testersFactory.createDomElementTester(getTitleElement), getTitleElement);

            tester.deleteButton = (() => {
                const tester = testersFactory.createDomElementTester(
                    () => getTitleElement().querySelector('.cm-contacts-contact-bar-delete-icon')
                );

                const click = tester.click.bind(tester),
                    putMouseOver = tester.putMouseOver.bind(tester);

                tester.click = () => {
                    click();
                    spendTime(0);
                    spendTime(0);
                    mainTester.modalWindow.endTransition('transform');
                };

                tester.putMouseOver = () => (putMouseOver(), spendTime(100), spendTime(0));

                return tester;
            })();

            tester.closeButton = (() => {
                const tester = testersFactory.createDomElementTester(
                    () => getTitleElement().querySelector('.cm-contacts-contact-bar-close-icon')
                );

                const click = tester.click.bind(tester);
                tester.click = () => (click(), spendTime(0));

                return tester;
            })();

            return tester;
        })();

        tester.section = label => {
            const getSectionElement = () => utils.descendantOf(getContactBar()).
                matchesSelector('.cm-contacts-contact-bar-section-header').
                textContains(label).
                find().
                closest('.cm-contacts-contact-bar-section');

            const tester = testersFactory.createDomElementTester(getSectionElement);

            tester.chatChannelGroup = text => {
                const getDomElement = () => utils.descendantOf(getSectionElement()).
                    matchesSelector('.cm-contacts-list-items-group-header').
                    textContains(text).
                    find().
                    closest('.cm-contacts-list-items-group');

                const tester = testersFactory.createDomElementTester();

                tester.collapsednessToggleButton = (() => {
                    const tester = testersFactory.createDomElementTester(() =>
                        getDomElement().querySelector('.cm-contacts-collapsedness-toggle-button'));

                    const click = tester.click.bind(tester);
                    tester.click = () => (click(), spendTime(0));

                    return tester;
                })();

                return addTesters(tester, getDomElement);
            };

            const addOptionTesters = (tester, getOptionElement) => {
                const clickTester = testersFactory.createDomElementTester(() => {
                    const option = getOptionElement() || new JsTester_NoElement(),
                        clickableOption = option.querySelector('.cm-contacts-contact-bar-clickable-option')

                    return (!(clickableOption instanceof JsTester_NoElement) && clickableOption) || option
                });

                const click = clickTester.click.bind(clickTester),
                    putMouseOver = tester.putMouseOver.bind(tester);

                tester.click = () => (click(), spendTime(0));
                tester.putMouseOver = () => (putMouseOver(), spendTime(0));

                tester.toolsIcon = (() => {
                    const tester = testersFactory.createDomElementTester(
                        () => utils.element(getOptionElement()).
                            querySelector('.cm-contacts-contact-bar-option-tools svg')
                    );

                    const click = tester.click.bind(tester);
                    tester.click = () => (click(), spendTime(0), spendTime(0));

                    return tester;
                })();

                tester.expectToBeSelected = () => tester.expectToHaveClass(
                    'cm-contacts-contact-bar-section-option-selected'
                );

                tester.expectNotToBeSelected = () => tester.expectNotToHaveClass(
                    'cm-contacts-contact-bar-section-option-selected'
                );

                return addTesters(tester, getOptionElement);
            };

            tester.option = text => {
                const getOptionElements = () => utils.descendantOf(getSectionElement()).
                    textEquals(text).
                    matchesSelector('.cm-contacts-contact-bar-section-option').
                    findAll();
                
                const getOptionElement = () => utils.getVisibleSilently(getOptionElements()),
                    tester = testersFactory.createDomElementTester(getOptionElement);

                const createChannelTypeTester = type => {
                    const getDomElement = () => utils.getVisibleSilently(Array.prototype.filter.call(
                        getOptionElements(),
                        domElement => {
                            const icon = domElement.querySelector(`.cm-contacts-messenger-icon-${type}`)
                            return icon && !(icon instanceof JsTester_NoElement)
                        }
                    ))

                    const tester = testersFactory.createDomElementTester(getDomElement);
                    return addOptionTesters(tester, getDomElement);
                };

                tester.whatsApp = createChannelTypeTester('whatsapp');
                tester.telegram = createChannelTypeTester('telegram');

                addOptionTesters(tester, getOptionElement);
                return tester;
            };
            
            tester.option.atIndex = index => {
                const getOptionAtIndex = () => getSectionElement().querySelectorAll(
                    '.cm-contacts-contact-bar-section-option, ' +
                    '.cm-contacts-channel-editor-input-group'
                )[index];

                const tester = testersFactory.createDomElementTester(getOptionAtIndex);
                return addOptionTesters(tester, getOptionAtIndex);
            };

            tester.option.first = tester.option.atIndex(0);

            const getContentElement = () => utils.element(getSectionElement()).
                querySelector('.cm-contacts-contact-bar-section-content');

            const getHeaderElement = () => utils.element(getSectionElement()).
                querySelector('.cm-contacts-contact-bar-section-header');

            tester.content = addTesters(testersFactory.createDomElementTester(getContentElement), getContentElement);
            tester.header = addTesters(testersFactory.createDomElementTester(getHeaderElement), getHeaderElement);

            tester.collapsednessToggleButton = (() => {
                const tester = testersFactory.createDomElementTester(() =>
                    getHeaderElement().querySelector('.cm-contacts-collapsedness-toggle-button'));

                const click = tester.click.bind(tester);
                tester.click = () => (click(), spendTime(0));

                return tester;
            })();
            
            addTesters(tester, getSectionElement);
            return tester;
        };

        return tester;
    })();

    me.notificationWindow = (() => {
        const getDomElement = () => utils.querySelector('.ui-notification, .cmgui-notification'),
            tester = testersFactory.createDomElementTester(getDomElement);

        return addTesters(tester, getDomElement);
    })();

    me.softphone = (getRootElement => {
        const tester = addTesters(
            testersFactory.createDomElementTester(getRootElement),
            getRootElement
        );

        const mainPanel = testersFactory.createDomElementTester(() => getRootElement().querySelector(
            '.cmg-calls, ' +

            '.misc-softphone-' +
                'misc-sip_lib-src-' +
                'new-softphone-' +
                'main-panel-wrapper-' +
                'styles-module__' +
                'main-panel-wrapper',

            true,
        ));

        tester.pressKey = key => mainPanel.pressKey(key);
        tester.pressEnter = () => mainPanel.pressEnter();

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
    })(() => document.querySelector(
        '#cmg-amocrm-widget, ' +

        '.misc-softphone-' +
            'misc-sip_lib-src-' +
            'new-softphone-' +
            'styles-module__' +
            'softphone-container'
    ) || new JsTester_NoElement());

    me.triggerPageResize = () => (triggerResize(document.querySelector('.cmg-softphone-page')), spendTime(0));
    me.antDrawerCloseButton = testersFactory.createDomElementTester('.ant-drawer-close');

    me.digitRemovingButton = (() => {
        const tester = testersFactory.createDomElementTester('.clct-adress-book__dialpad-header-clear'),
            click = tester.click.bind(tester);

        tester.click = () => (click(), spendTime(0), spendTime(0), spendTime(0));
        return tester;
    })();

    me.maximizednessButton = (() => {
        const tester = testersFactory.createDomElementTester('.cmg-maximization-button svg'),
            buttonTester = testersFactory.createDomElementTester('.cmg-maximization-button');

        const click = tester.click.bind(tester);
        tester.click = () => (click(), spendTime(0), spendTime(0), spendTime(0), spendTime(0));

        tester.expectToBeMaximized = () => buttonTester.expectToHaveClass('cmg-maximized');
        tester.expectToBeUnmaximized = () => buttonTester.expectNotToHaveClass('cmg-maximized');

        return tester;
    })();

    const createCollapsedessButton = className => {
        const tester = testersFactory.createDomElementTester(`.${className}`),
            click = tester.click.bind(tester);

        tester.expectToBePressed = () => tester.expectToHaveClass('cmg-button-pressed');
        tester.expectNotToBePressed = () => tester.expectNotToHaveClass('cmg-button-pressed');
        tester.click = () => (click(), spendTime(0), spendTime(0));

        return tester;
    };

    const hoverClass = (() => {
        let domElement;
        const remove = () => domElement?.classList?.remove('hover');

        return {
            remove: () => {
                remove();
                domElement = null;
            },
            add: value => {
                remove();
                domElement = value;
                domElement.classList.add('hover');
            }
        };
    })();

    me.chatListItem = (text, getRootElement = () => document.body) => {
        const domElement = utils.descendantOf(getRootElement()).
            matchesSelector(
                '.misc-chats-src-components-chats-chats-list-panel-components-chat-list-item-styles-module__root, ' +
                '.misc-chats-src-components-offline-messages-components-list-panel-components-offline-message-item-' +
                    'styles-module__root'
            ).
            textContains(text).
            find();

        const tester = testersFactory.createDomElementTester(domElement);

        /*
        const clickAreaTester = testersFactory.createDomElementTester(() => {
            const clickArea = domElement.querySelector('.cm-chats--chat-click-area');

            if (!clickArea || clickArea instanceof JsTester_NoElement) {
                return domElement;
            }

            return clickArea;
        });
        */

        const click = tester.click.bind(tester),
            scrollIntoView = tester.scrollIntoView.bind(tester),
            putMouseOver = tester.putMouseOver.bind(tester);

        tester.putMouseOver = () => {
            putMouseOver();
            spendTime(100);
            spendTime(0);
            
            hoverClass.add(domElement);
        };

        const selectedClass = 'misc-chats-src-components-chats-chats-list-panel-components-chat-list-item-styles-' +
            'module__selected';

        tester.expectToBeSelected = () => tester.expectToHaveClass(selectedClass);
        tester.expectNotToBeSelected = () => tester.expectNotToHaveClass(selectedClass);

        tester.click = () => (click(), spendTime(0));

        tester.scrollIntoView = () => {
            scrollIntoView();
            maybeRunSpinWrapperIntersectionCallback(getChatListSpinWrapper());
            spendTime(0);
        };

        {
            tester.pin = testersFactory.createDomElementTester(() => utils.element(domElement).querySelector(
                '.cm-chats--chat-pinned, ' +
                '.cm-chats--chat-not-pinned'
            ));

            const click = tester.pin.click.bind(tester.pin);

            tester.pin.click = () => {
                click();
                hoverClass.remove();
            };
        }

        return tester;
    };

    me.chatList = (() => {
        const createTester = index => {
            const getDomElement = () => {
                const selector =
                    '.misc-chats-src-components-offline-messages-components-list-panel-components-' +
                        'offline-message-list-styles-module__root, ' +
                    '.misc-chats-src-components-chats-chats-list-panel-components-chat-list-styles-module__root';

                return (
                    index === undefined ?
                    utils.querySelector(selector) :
                    document.querySelectorAll(selector)?.[index]
                );
            };

            const tester = testersFactory.createDomElementTester(getDomElement);

            tester.item = text => me.chatListItem(text, getDomElement);
            return addTesters(tester, getDomElement);
        };

        const tester = createTester();

        tester.atIndex = index => createTester(index);
        tester.first = createTester(0);

        tester.header = (() => {
            const getDomElement = () => utils.querySelector(
                '.misc-chats-src-components-chats-chats-list-panel-styles-module__header'
            );

            const tester = testersFactory.createDomElementTester(getDomElement);
            return addTesters(tester, getDomElement);
        })();

        return tester;
    })();

    me.contactList = (() => {
        const getDomElement = () => document.querySelector('.cm-contacts-list-wrapper'),
            tester = testersFactory.createDomElementTester(getDomElement);

        tester.item = name => {
            const tester =  testersFactory.createDomElementTester(() => utils.
                descendantOfBody().
                matchesSelector('.cm-contacts-list-item').
                textEquals(name).
                find());

            const click = tester.click.bind(tester),
                scrollIntoView = tester.scrollIntoView.bind(tester);

            tester.click = () => (click(), spendTime(0), spendTime(0));
            tester.expectToBeSelected = () => tester.expectToHaveClass('cm-contacts-list-item-selected');
            tester.expectNotToBeSelected = () => tester.expectNotToHaveClass('cm-contacts-list-item-selected');

            tester.scrollIntoView = () => {
                scrollIntoView();
                maybeRunSpinWrapperIntersectionCallback(getContactListSpinWrapper());
            };

            return tester;
        };

        return addTesters(tester, getDomElement);
    })();

    me.nameOrPhone = testersFactory.createDomElementTester('.cmg-name-or-phone-wrapper');
    me.largeSizeButton = createCollapsedessButton('cmg-large-size-button');
    me.middleSizeButton = createCollapsedessButton('cmg-middle-size-button');
    me.smallSizeButton = createCollapsedessButton('cmg-small-size-button');
    me.statusDurations = testersFactory.createDomElementTester('.cmg-softphone--call-stats-statuses-duration');

    me.notificationSection = (tester => {
        tester.message = (tester => {
            const putMouseOver = tester.putMouseOver.bind(tester);
            tester.putMouseOver = () => (putMouseOver(), spendTime(100), spendTime(0));

            const click = tester.click.bind(tester);
            tester.click = () => (click(), spendTime(0), spendTime(0));

            return tester;
        })(testersFactory.createDomElementTester('.cm-chats--chat-notifications .cm-chats--message-row'));

        return tester;
    })(testersFactory.createDomElementTester('.cm-chats--chat-notifications'));

    me.playerButton = (() => {
        const tester = testersFactory.createDomElementTester('.clct-audio-button');

        const click = tester.click.bind(tester);
        tester.click = () => (click(), spendTime(0));

        return tester;
    })();

    me.bugButton = (() => {
        const tester = testersFactory.createDomElementTester('.cmg-bug-icon');

        const click = tester.click.bind(tester);
        tester.click = () => (click(), spendTime(0), spendTime(0), spendTime(0));

        return tester;
    })();

    {
        const tester = testersFactory.createDomElementTester(
            '.ui-select-popup-header .ui-icon, ' +
            '.cmgui-select-popup-header .cmgui-icon'
        );

        const click = tester.click.bind(tester);

        tester.click = () => (click(), spendTime(0));
        me.arrowNextToSearchField = tester;
    }

    me.leftMenu = (() => {
        const getDomElement = () => utils.querySelector(
            '.src-components-main-menu-styles-module__nav, ' +
            '.misc-core-src-components-menu-styles-module__nav, ' +
            '.misc-host-src-components-menu-styles-module__nav'
        );

        const tester = testersFactory.createDomElementTester(getDomElement);

        tester.item = text => {
            const getItemElement = () => utils.descendantOf(getDomElement()).
                matchesSelector('.cm-chats--chat-menu-item .cm-chats--title, .cm-chats--chats-menu-item > .label').
                textEquals(text).
                find().
                closest('.cm-chats--chat-menu-item, .cm-chats--chats-menu-item > .label');

            const tester = testersFactory.createDomElementTester(getItemElement);

            tester.counter = testersFactory.createDomElementTester(
                () => getItemElement().querySelector('.cm-chats--new-messages-count')
            );

            return tester;
        };

        return addTesters(tester, getDomElement);
    })();

    me.popover = (() => {
        const getDomElement = () => utils.getVisibleSilently(document.querySelectorAll('.ui-popover, .cmgui-popover')),
            tester = testersFactory.createDomElementTester(getDomElement);

        return addTesters(tester, getDomElement);
    })();

    me.transferPanel = (() => {
        const getDomElement = () => utils.getVisibleSilently(document.querySelectorAll('.cm-chats--transfer-panel')),
            tester = testersFactory.createDomElementTester(getDomElement);

        return addTesters(tester, getDomElement);
    })();

    me.statusesList = (() => {
        const selector = '.ui-account-popup, .cmgui-account-popup, .cm-chats--account-popup',
            tester = testersFactory.createDomElementTester(selector);

        tester.item = text => {
            const domElement = utils.descendantOf(document.querySelector(selector)).
                matchesSelector(
                    '.ui-account-popup--item, ' +
                    '.cmgui-account-popup--item, ' +
                    '.cm-chats--account-popup--item'
                ).
                textEquals(text).
                find();

            const tester = testersFactory.createDomElementTester(domElement),
                click = tester.click.bind(tester),
                isSelected = () => !!domElement.querySelectorAll('.ui-icon, .cmgui-icon')[1];

            tester.click = () => (click(), spendTime(0), spendTime(0));

            const expectToBeVisible = tester.expectToBeVisible.bind(tester);

            tester.expectToBeVisible = () => {
                expectToBeVisible();

                if ((
                    domElement.closest(selector) || new JsTester_NoElement()
                ).parentNode.style.visibility == 'hidden') {
                    throw new Error('Выпадающий список статусов должен быть видимым.');
                }
            };
            
            tester.expectToBeSelected = () => {
                tester.expectToBeVisible();

                if (!isSelected()) {
                    throw new Error(`Статус "${text}" должен быть выбран.`);
                }
            };

            tester.expectNotToBeSelected = () => {
                tester.expectToBeVisible();

                if (isSelected()) {
                    throw new Error(`Статус "${text}" не должен быть выбран.`);
                }
            };

            return tester;
        };

        return tester;
    })();

    me.logoutButton = (() => {
        const tester = testersFactory.createDomElementTester(() => {
            let domElement = utils.descendantOfBody().
                matchesSelector('.ui-popup-content span, .cmgui-popup-content span').
                textEquals('Выход').
                find();

            domElement instanceof JsTester_NoElement && (domElement = utils.descendantOfBody().
                matchesSelector('.ui-account-popup--item, .cmgui-account-popup--item').
                textEquals('Выход').
                find());

            return domElement;
        });

        const click = tester.click.bind(tester);
        tester.click = () => (click(), Promise.runAll(false, true));

        return tester;
    })();

    me.interceptButton = testersFactory.createDomElementTester('.cmg-intercept-button');

    return me;
});
