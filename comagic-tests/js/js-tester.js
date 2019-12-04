function JsTester_Factory () {
    this.createDebugger = function () {
        return new JsTester_Debugger();
    };
    this.createUtils = function (debug) {
        return new JsTester_Utils(debug);
    };
    this.createDomElementTester = function (
        domElement, wait, utils, testersFactory, gender, nominativeDescription, accusativeDescription,
        genetiveDescription
    ) {
        return new JsTester_DomElement(domElement, wait, utils, testersFactory, gender, nominativeDescription,
            accusativeDescription, genetiveDescription);
    };
    this.admixDomElementTester = function (me, args) {
        JsTester_DomElement.apply(me, args);
    };
    this.createTestersFactory = function (wait, utils) {
        return new JsTester_TestersFactory(wait, utils, this);
    };
    this.createTestArguments = function () {
        return [];
    };
    this.beforeEach = function () {};
    this.afterEach = function () {};
    this.createGender = function () {
        return {
            female: {
                should: 'должна',
                hidden: 'скрытой',
                visible: 'видимой',
                disabled: 'заблокированной',
                enabled: 'доступной',
                masked: 'маскированной',
                pronoun: 'она',
                checked: 'отмечена',
                readonly: 'недоступна',
                collapsed: 'схлопнутой'
            },
            male: {
                should: 'должен',
                hidden: 'скрытым',
                visible: 'видимым',
                disabled: 'заблокированным',
                enabled: 'доступным',
                masked: 'маскированным',
                pronoun: 'он',
                checked: 'отмечен',
                readonly: 'недоступен',
                collapsed: 'схлопнутым'
            },
            neuter: {
                should: 'должно',
                hidden: 'скрытым',
                visible: 'видимым',
                disabled: 'заблокированным',
                enabled: 'доступным',
                masked: 'маскированным',
                pronoun: 'оно',
                checked: 'отмечено',
                readonly: 'недоступно',
                collapsed: 'схлопнутым'
            }
        };
    };
}

function JsTester_Tests (factory) {
    var testRunners = [],
        requiredClasses = [],
        timeout = new JsTester_Timeout('setTimeout', 'clearTimeout', JsTester_OneTimeDelayedTask),
        interval = new JsTester_Timeout('setInterval', 'clearInterval', JsTester_DelayedTask),
        debug = factory.createDebugger(),
        utils = factory.createUtils(debug),
        requestsManager = new JsTester_RequestsManager(utils),
        windowOpener = new JsTester_WindowOpener(utils),
        testsExecutionBeginingHandlers = [];

    var wait = function () {
        if (arguments[0]) {
            var repetitionsCount = arguments[0], i;

            for (i = 0; i < repetitionsCount; i ++) {
                wait();
            }

            return;
        }

        timeout.runCallbacks();
        interval.runCallbacks();
    };

    this.exposeDebugUtils = function (variableName) {
        window[variableName] = debug;
    };
    this.addTest = function (testRunner) {
        testRunners.push(testRunner);
    };
    this.runTests = function () {
        var error,
            testersFactory;

        try {
            testersFactory = factory.createTestersFactory(wait, utils);
        } catch(e) {
            error = e;
        }

        if (error) {
            it('Подготавливаюсь к тестированию.', function() {
                throw error;
            });
        }

        testRunners.forEach(function (runTest) {
            runTest.apply(null, [requestsManager, testersFactory, wait, utils, windowOpener, debug].concat(
                factory.createTestArguments()
            ));
        });
    };
    this.requireClass = function (className) {
        requiredClasses.push(className);
    };
    this.runBeforeTestsExecution = function (handleBeginingOfTestsExecution) {
        testsExecutionBeginingHandlers.push(handleBeginingOfTestsExecution);
    };
    this.handleBeginingOfTestsExecution = function () {
        testsExecutionBeginingHandlers.forEach(function (handleBeginingOfTestsExecution) {
            handleBeginingOfTestsExecution();
        });
    };
    this.getRequiredClasses = function () {
        return requiredClasses;
    };
    this.beforeEach = function () {
        requestsManager.createAjaxMock();
        timeout.replaceByFake();
        interval.replaceByFake();
        windowOpener.replaceByFake();
        factory.beforeEach();
    };
    this.afterEach = function () {
        requestsManager.destroyAjaxMock();
        timeout.restoreReal();
        interval.restoreReal();
        windowOpener.restoreReal();
        factory.afterEach();
    };
}

function JsTester_TestersFactory (wait, utils, factory) {
    var gender = factory.createGender(),
        female = gender.female,
        neuter = gender.neuter,
        male = gender.male;

    this.createAnchorTester = function (domElement, text) {
        return new JsTester_Anchor(domElement, wait, utils, this, female, 'ссылка с текстом "' + text + '"',
            'ссылку с текстом "' + text + '"', 'ссылки с текстом "' + text + '"', factory);
    };
    this.createTextFieldTester = function (field, label) {
        return new JsTester_InputElement((
            field && field.inputEl ? field.inputEl.dom : null
        ), field && field.el ? field.el.dom : null, wait, utils, this, neuter,
            utils.fieldDescription('текстовое поле', label),
            utils.fieldDescription('текстовое поле', label), utils.fieldDescription('текстового поля', label), factory);
    };
    this.createDomElementTester = function () {
        var getDomElement = utils.makeFunction(arguments[0]);

        return factory.createDomElementTester(getDomElement, wait, utils, this, male, function () {
            return 'элемент ' + utils.getTypeDescription(getDomElement());
        }, function () {
            return 'элемент ' + utils.getTypeDescription(getDomElement());
        }, function () {
            return 'элемента ' + utils.getTypeDescription(getDomElement());
        }, factory);
    };
    this.createDescendantsTesterFactory = function (getDomElement) {
        return new JsTester_DescendantsTesterFactory(getDomElement, utils, this);
    };
}

function JsTester_Utils (debug) {
    var me = this;

    this.expectToContain = function (object, expectedContent) {
        new JsTester_ParamsContainingExpectation(object)(expectedContent);
    };
    this.addPreventDefaultHandler = function (event, preventDefaultHandler) {
        var preventDefault = event.preventDefault;

        event.preventDefault = function () {
            preventDefault.apply(event, arguments);
            preventDefaultHandler();
        };
    };
    this.createKeyboardEvent = function (eventName, keyCode, preventDefaultHandler) {
        var keyboardEvent = document.createEvent('KeyboardEvent');

        this.addPreventDefaultHandler(keyboardEvent, preventDefaultHandler);

        keyboardEvent.initKeyboardEvent(
            eventName, true, false, null, 0, false, 0, false, keyCode, 0);
        keyboardEvent.which = keyboardEvent.keyCode = keyCode;

        ['keyCode', 'which'].forEach(function (propertyName) {
            Object.defineProperty(keyboardEvent, propertyName, {
                get : function () {
                    return keyCode;
                }
            });     
        });

        return keyboardEvent;
    };
    this.pressKey = function (target, keyCode, callback) {
        target = target || document;

        var eventNames = ['keydown', 'keypress'],
            i = 0;

        var dispatchNext = function () {
            if (i == eventNames.length) {
                return;
            }

            var keyboardEvent = me.createKeyboardEvent(
                eventNames[i], keyCode, function () {
                    dispatchNext = function () {};
                    callback = function () {};
                }
            );

            i ++;

            target.dispatchEvent(keyboardEvent);
            dispatchNext();
        };

        dispatchNext();
        callback();

        target.dispatchEvent(me.createKeyboardEvent(
            'keyup', keyCode, function () {}));
    };
    this.pressSpecialKey = function (target, keyCode, handleKeyDown, handleKeyUp) {
        target = target || document;

        handleKeyDown = handleKeyDown || function() {};
        handleKeyUp = handleKeyUp || function() {};

        target.dispatchEvent(this.createKeyboardEvent('keydown', keyCode,
            function () {
                handleKeyDown = function () {};
                handleKeyUp = function () {};
            }));

        handleKeyDown();

        target.dispatchEvent(this.createKeyboardEvent('keyup', keyCode, function () {}));

        handleKeyUp();
    };
    this.pressEscape = function (target) {
        this.pressSpecialKey(target, 27);
    };
    this.makeFunction = function (value) {
        if (typeof value == 'function') {
            return value;
        } else {
            var domElement = value;
            return function () {
                return domElement;
            };
        }
    };
    this.fieldDescription = function (description, label) {
        return description + (label ? (' "' + label + '"') : '');
    };
    this.isVisible = function(domElement) {
        var rects = domElement.getClientRects(),
            rectsCount = rects.length,
            isOffsetSizePositive = domElement.offsetWidth > 0 || domElement.offsetHeight > 0;

        if (!rectsCount) {
            return isOffsetSizePositive;
        }

        if (rectsCount > 1) {
            return true;
        }

        var rect = rects[0],
            top = rect.top + document.documentElement.scrollTop,
            left = rect.left + document.documentElement.scrollLeft;

        if (
            (top < 0 && rect.height <= (top * -1)) ||
            (left < 0 && rect.width <= (left * -1))
        ) {
            return false;
        }

        return true;
    };
    this.isNotCollapsed = function(domElement) {
        var rects = domElement.getClientRects(),
            rectsCount = rects.length,
            isOffsetSizePositive = domElement.offsetHeight && domElement.offsetWidth;

        if (isOffsetSizePositive) {
            return true;
        }

        if (!rectsCount) {
            return false;
        }

        if (rectsCount > 1) {
            return true;
        }

        var rect = rects[0];

        if (!rect.height || !rect.width) {
            return false;
        }

        return true;
    };
    this.getVariablePresentation = function (object, maxDepth) {
        if (maxDepth) {
            debug.setMaxDepth(maxDepth);
        }

        return "\n \n" + debug.getVariablePresentation(object) + "\n \n";
    };
    this.dispatchMouseEvent = function (domElement, eventName) {
        var el = Ext.fly(domElement),
            xy = el.getXY();

        var mouseEvent = new MouseEvent(eventName, {
            view: window,
            bubbles: true,
            cancelable: true
        });

        [
            ['pageX', xy[0] + Math.round(el.getWidth() / 2)],
            ['pageY', xy[1] + Math.round(el.getHeight() / 2)]
        ].forEach(function (options) {
            Object.defineProperty(mouseEvent, options[0], {
                get: function () {
                    return options[1];
                }
            });
        });

        domElement.dispatchEvent(mouseEvent);
    };
    this.getTextContent = function (value) {
        if (!value) {
            return '';
        }

        if (typeof value != 'string') {
            value = value.innerHTML;
        }

        return value.replace(/<[^<>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/[\s]+/g, ' ').trim();
    };
    this.parseQueryString = function (queryString) {
        var parts = queryString.replace(/^\?/, '').split('&'),
            object = {},
            components,
            name,
            value,
            i,
            ln,
            part,
            plusRe = /\+/g;

        for (i = 0 , ln = parts.length; i < ln; i++) {
            part = parts[i];

            if (part.length > 0) {
                components = part.split('=');
                name = components[0];
                name = name.replace(plusRe, '%20');
                name = decodeURIComponent(name);
                value = components[1];

                if (value !== undefined) {
                    value = value.replace(plusRe, '%20');
                    value = decodeURIComponent(value);
                } else {
                    value = '';
                }

                if (object.hasOwnProperty(name)) {
                    if (!Array.isArray(object[name])) {
                        object[name] = [
                            object[name]
                        ];
                    }
                    object[name].push(value);
                } else {
                    object[name] = value;
                }
            }
        }
        return object;
    };
    this.parseUrl = function (url) {
        var origin = window.location.origin;

        if (url.indexOf(origin) === 0) {
            url = url.substr(origin.length);
        }

        url = url.split('?');

        var query;

        if (url[1]) {
            query = new JsTester_Query(this.parseQueryString(url[1]), this);
        } else {
            query = new JsTester_NoQuery(this);
        }

        return {
            path: url[0],
            query: query
        };
    };
    this.isDate = function(value) {
        return toString.call(value) === '[object Date]';
    };
    this.getTypeDescription = function (value) {
        var type = typeof value;

        if (type == 'object') {
            if (Array.isArray(value)) {
                return 'array';
            } else if (this.isDate(value)) {
                return 'date';
            } else if (value === null) {
                return 'null';
            } else if (value.nodeName) {
                return value.nodeName;
            } else {
                return 'object';
            }
        } else {
            return type;
        }
    };
    this.capitalize = function(string) {
        if (!string) {
            return '';
        }

        string = string + '';

        return string.charAt(0).toUpperCase() + string.substr(1);
    };
    this.findElementByTextContent = function (ascendantElement, desiredTextContent, selector) {
        var results = this.findElementsByTextContent(ascendantElement, desiredTextContent, selector);

        if (results.length != 1) {
            return null;
        }

        return results[0];
    };
    this.findElementsByTextContent = function (ascendantElement, desiredTextContent, selector) {
        selector = selector || '*';

        if (!ascendantElement) {
            return [];
        }

        var i,
            descendants = ascendantElement.querySelectorAll(selector),
            length = descendants.length,
            descendant,
            textContent,
            results = [];
        
        for (i = 0; i < length; i ++) {
            descendant = descendants[i];
            textContent = this.getTextContent(descendant);

            if (desiredTextContent instanceof RegExp) {
                if (desiredTextContent.test(textContent)) {
                    results.push(descendant);
                }
            } else if (typeof desiredTextContent == 'function') {
                if (desiredTextContent(textContent)) {
                    results.push(descendant);
                }
            } else if (desiredTextContent == textContent) {
                results.push(descendant);
            }
        }

        return results;
    };
    this.getVisible = function (domElements) {
        var results = domElements.filter((function (domElement) {
            return this.isVisible(domElement);
        }).bind(this));

        if (results.length != 1) {
            throw new Error('Найдено ' + results.length + ' видимых элементов, тогда как видимым должен быть только ' +
                'один.');
        }

        return results[0];
    };
}

function JsTester_OpenedWindow (path, query) {
    this.expectToHavePath = function (expectedValue) {
        if (path != expectedValue) {
            throw new Error('Должно быть открыто окно, URL которого имеет путь "' + expectedValue + '", тогда как ' +
                'URL имеет путь "' + path + '".');
        }
    };
    this.expectQueryToContain = function (params) {
        query.expectToContain(params);
    };
}

function JsTester_NoWindowOpened (utils) {
    this.expectToHavePath = function (expectedValue) {
        throw new Error('Дожен быть открыт URL с путем "' + expectedValue + '".');
    };
    this.expectQueryToContain = function (params) {
        throw new Error('Должен быть открыт URL с параметрами' + utils.getVariablePresentation(params));
    };
}

function JsTester_WindowOpener (utils) {
    var open = window.open,
        actualWindow = new JsTester_NoWindowOpened(utils);

    this.expectToHavePath = function (expectedValue) {
        actualWindow.expectToHavePath(expectedValue);
        return this;
    };
    this.expectQueryToContain = function (params) {
        actualWindow.expectQueryToContain(params);
        return this;
    };
    this.replaceByFake = function () {
        actualWindow = new JsTester_NoWindowOpened();

        window.open = function (url) {
            var results = utils.parseUrl(url);
            actualWindow = new JsTester_OpenedWindow(results.path, results.query);
        };
    };
    this.restoreReal = function () {
        actualWindow = new JsTester_NoWindowOpened();
        window.open = open;
    };
}

function JsTester_RequestsManager (utils) {
    var requests;

    this.recentRequest = function () {
        return requests.recentRequest();
    };
    this.expectNoRequestsToBeSent = function () {
        return requests.expectNoRequestsToBeSent();
    };
    this.createAjaxMock = function () {
        jasmine.Ajax.install();
        requests = new JsTester_Requests(jasmine.Ajax.requests, utils);
    };
    this.destroyAjaxMock = function () {
        var throwError = function() {};
        
        try {
            this.expectNoRequestsToBeSent();
        } catch (e) {
            throwError = function () {
                throw e;
            };
        }

        jasmine.Ajax.uninstall();
        throwError();
    };
}

function JsTester_Requests (requests, utils) {
    var indexOfRecentRequest = 0,
        recentRequest;

    getRecentRequest = function () {
        var request = requests.at(indexOfRecentRequest);
        indexOfRecentRequest ++;
        return request;
    };

    this.recentRequest = function () {
        var recentRequest = getRecentRequest();

        if (!recentRequest) {
            throw new Error(
                'Было отправлено только ' + requests.count() + ' запросов, тогда как их должно быть больше.'
            );
        }

        return new JsTester_Request(recentRequest, utils);
    };
    this.expectNoRequestsToBeSent = function () {
        var recentRequest = getRecentRequest();

        if (recentRequest) {
            throw new Error(
                'Был отправлен запрос, тогда как ни один запрос не должен был быть отправлен. ' + (
                    new JsTester_Request(recentRequest, utils)
                ).getDescription()
            );
        }
    };
}

function JsTester_Request (request, utils) {
    var result = utils.parseUrl(request.url),
        path = result.path,
        query = result.query,
        method = request.method;

    var body = (function (bodyParams) {
        var name;

        for (name in bodyParams) {
            return new JsTester_Body(bodyParams, utils);
        }

        return new JsTester_NoBody(utils);
    })(request.data());

    this.respondSuccessfullyWith = function (responseObject) {
        request.respondWith({
            status: 200,
            responseText: JSON.stringify(responseObject)
        });

        return this;
    };
    this.respondSuccessfullyButNotJSON = function (responseObject) {
        request.respondWith({
            status: 200,
            responseText: '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2 Final//EN">' +
                '<title>200 OK</title>' +
                '<h1>OK</h1>' +
                '<p>Everithing is allright!</p>'
        });

        return this;
    };
    this.respondForbidden = function (responseObject) {
        request.respondWith({
            status: 403,
            responseText: '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2 Final//EN">' +
                '<title>403 Forbidden</title>' +
                '<h1>Forbidden</h1>' +
                '<p>You don\'t have the permission to access the requested resource. It is either read-protected or ' +
                'not readable by the server.</p>'
        });

        return this;
    };
    this.expectToHavePath = function (expectedValue) {
        if (path != expectedValue) {
            throw new Error(
                'В данный момент должен быть отправлен запрос по пути "' + expectedValue + '", тем не менее запрос ' +
                'был отправлен по пути "' + path + '".'
            );
        }

        return this;
    };
    this.expectToHaveMethod = function (expectedValue) {
        if (method != expectedValue) {
            throw new Error(
                'Запрос должен быть отправлен методом "' + expectedValue + '", тогда как он был отправлен методом "' +
                method + '".'
            );
        }

        return this;
    };
    this.expectBodyToContain = function (params) {
        body.expectToContain(params);
        return this;
    };
    this.testBodyParam = function (paramName, tester) {
        body.testParam(paramName, tester);
        return this;
    };
    this.testQueryParam = function (paramName, tester) {
        query.testParam(paramName, tester);
        return this;
    };
    this.expectQueryToContain = function (params) {
        query.expectToContain(params);
        return this;
    };
    this.getDescription = function () {
        return 'Запрос отправлен методом "' + method + '" по пути "' + path + '" ' + query.getDescription() + 'Тело ' +
            'запроса ' + body.getDescription();
    };
}

function JsTester_Body (bodyParams, utils) {
    var expectToContain = new JsTester_ParamsContainingExpectation(
        bodyParams, 'тела запроса');

    this.testParam = function (paramName, tester) {
        if (!(paramName in bodyParams)) {
            throw new Error('Не найден параметр "' + paramName + '".');
        }

        tester(bodyParams[paramName]);
    };
    this.expectToContain = function (params) {
        expectToContain(params);
    };
    this.getDescription = function () {
        return 'содержит параметеры ' + utils.getVariablePresentation(bodyParams, 10);
    };
}

function JsTester_NoBody (utils) {
    this.expectToContain = function (params) {
        var name;

        for (name in params) {
            throw new Error(
                'Запрос был отправлен с пустым телом, тогда, как его тело должно было содержать параметры ' +
                utils.getVariablePresentation(params)
            );
        }
    };
    this.getDescription = function () {
        return 'является пустым.';
    };
    this.testParam = function (paramName) {
        throw new Error('Параметр "' + paramName + '" не был найден, так как запрос был отправлен с пустым телом.');
    };
}

function JsTester_Anchor (
    domElement, wait, utils, testersFactory, gender, nominativeDescription, accusativeDescription,
    genetiveDescription, factory
) {
    if (typeof domElement == 'function') {
        getDomElement = domElement;
    } else {
        getDomElement = function () {
            return domElement;
        };
    }

    factory.admixDomElementTester(this, arguments);

    this.expectHrefToHavePath = function (expectedValue) {
        this.expectToBeVisible();

        var actualPath = utils.parseUrl(getDomElement().href).path;
        
        if (actualPath != expectedValue) {
            throw new Error('Путь ' + genetiveDescription + 'должен быть "' + expectedValue + '", а не "' +
                actualPath + '".');
        }

        return this;
    };

    this.expectHrefQueryToContain = function (params) {
        this.expectToBeVisible();

        utils.parseUrl(getDomElement().href).query.expectToContain(params);
        return this;
    };
}

function JsTester_InputElement (
    inputElement, componentElement, wait, utils, testersFactory, gender, nominativeDescription,
    accusativeDescription, genetiveDescription, factory
) {
    var me = this;

    factory.admixDomElementTester(this, [
        inputElement, wait, utils, testersFactory, gender, nominativeDescription, accusativeDescription,
        genetiveDescription, factory
    ]);

    var componentElementTester = factory.createDomElementTester(
        componentElement, wait, utils, testersFactory, gender, nominativeDescription, accusativeDescription,
        genetiveDescription
    );

    function input (value) {
        var length = value.length,
            i = 0,
            oldValue = inputElement.value,
            beforeCursor = oldValue.substr(0, inputElement.selectionStart),
            afterCursor = oldValue.substr(inputElement.selectionEnd),
            cursorPosition = beforeCursor.length,
            inputedValue = '';

        var update = function () {
            inputElement.value = beforeCursor + inputedValue + afterCursor;
            inputElement.setSelectionRange(cursorPosition, cursorPosition);
        };

        var CharacterAppender = function (character) {
            return function () {
                inputedValue += character;
                cursorPosition ++;
                inputElement.value = beforeCursor + inputedValue + afterCursor;
                inputElement.setSelectionRange(cursorPosition, cursorPosition);
            };
        };
        
        if (inputElement.readOnly) {
            throw new Error('Невозможно ввести значение, так как ' + nominativeDescription + ' ' + gender.readonly +
                ' для редактирования.');
        }

        for (i = 0; i < length; i ++) {
            utils.pressKey(inputElement, value.charCodeAt(i), new CharacterAppender(value[i]));
        }
    }

    function erase (updateBeforeCursor, updateAfterCursor, keyCode) {
        var oldValue = inputElement.value,
            selectionStart = inputElement.selectionStart,
            selectionEnd = inputElement.selectionEnd,
            beforeCursor = oldValue.substr(0, selectionStart),
            afterCursor = oldValue.substr(selectionEnd);
        
        if (inputElement.readOnly) {
            throw new Error('Невозможно ввести значение, так как ' + nominativeDescription + ' ' + gender.readonly +
                ' для редактирования.');
        }

        if (selectionStart == selectionEnd) {
            beforeCursor = updateBeforeCursor(beforeCursor);
            afterCursor = updateAfterCursor(afterCursor);
        }

        utils.pressSpecialKey(inputElement, keyCode, function () {
            inputElement.value = beforeCursor + afterCursor;
        }, function () {
            var cursorPosition = beforeCursor.length;
            inputElement.setSelectionRange(cursorPosition, cursorPosition);
        });
    }

    function pressDelete () {
        erase(function (beforeCursor) {
            return beforeCursor;
        }, function (afterCursor) {
            return afterCursor.substr(1);
        }, 46);
    }

    function clear () {
        me.focus();
        inputElement.setSelectionRange(0, inputElement.value.length);
        pressDelete();
    }

    function getErrorIcon () {
        return testersFactory.createErrorIconTester(function () {
            return componentElement.querySelector('.x-form-error-msg');
        });
    }

    this.expectToHaveError = function (errorMessage) {
        getErrorIcon().expectTooltipWithText(errorMessage).toBeShownOnMouseOver();
    };
    this.expectToHaveNoError = function () {
        getErrorIcon().expectToBeHiddenOrNotExist();
    };
    this.pressBackspace = function () {
        this.focus();
        this.expectToBeEnabled();

        erase(function (beforeCursor) {
            return beforeCursor.substr(0, beforeCursor.length - 1);
        }, function (afterCursor) {
            return afterCursor;
        }, 8);

        return this;
    };
    this.pressDelete = function () {
        this.focus();
        this.expectToBeEnabled();

        pressDelete();

        return this;
    };
    this.expectAllContentToBeSelected = function () {
        this.expectSelectionStartToBeAt(0);
        this.expectSelectionEndToBeAt(inputElement.value.length);
    };
    this.expectCursorToBeAtEnd = function () {
        this.expectCursorToBeAt(inputElement.value.length);
    };
    this.expectCursorToBeAt = function (expectedPostition) {
        this.expectSelectionStartToBeAt(expectedPostition);
        this.expectSelectionEndToBeAt(expectedPostition);
    };
    this.expectSelectionStartToBeAt = function (expectedPostition) {
        var actualPosition = inputElement.selectionStart;

        if (expectedPostition != actualPosition) {
            throw new Error(
                'Выделение ' + genetiveDescription + ' ' + gender.should + ' начинаться на ' + expectedPostition +
                '-ом символе, а не на ' + actualPosition + '-ом.'
            );
        }
    };
    this.expectSelectionEndToBeAt = function (expectedPostition) {
        var actualPosition = inputElement.selectionEnd;

        if (expectedPostition != actualPosition) {
            throw new Error(
                'Выделение ' + genetiveDescription + ' ' + gender.should + ' заканчиваться на ' + expectedPostition +
                '-ом символе, а не на ' + actualPosition + '-ом.'
            );
        }
    };
    this.putCursorAtEnd = function () {
        this.putCursorAt(inputElement.value.length);
    };
    this.putCursorAtBegining = function () {
        this.putCursorAt(0);
    };
    this.putCursorAt = function (position) {
        this.select(position, position);
    };
    this.selectAll = function () {
        this.select(0, inputElement.value.length);
    };
    this.select = function (selectionStart, selectionEnd) {
        this.expectToBeEnabled();
        this.focus();
        inputElement.setSelectionRange(selectionStart, selectionEnd);
    };
    this.expectToBeEnabled = function () {
        componentElementTester.expectToBeEnabled();
    };
    this.expectToBeDisabled = function () {
        componentElementTester.expectToBeDisabled();
    };
    this.paste = function (value) {
        var length = value.length,
            i = 0,
            oldValue = inputElement.value,
            selectionStart = inputElement.selectionStart,
            cursorPosition = selectionStart + length,
            beforeCursor = oldValue.substr(0, selectionStart),
            afterCursor = oldValue.substr(inputElement.selectionEnd);

        var setValue = function () {
            inputElement.value = beforeCursor + value + afterCursor;
            inputElement.setSelectionRange(cursorPosition, cursorPosition);
        };

        this.focus();

        var event = new ClipboardEvent('paste', {
            clipboardData: new DataTransfer()
        });

        utils.addPreventDefaultHandler(event, function () {
            setValue = function () {};
        });

        event.clipboardData.setData('text', value);

        inputElement.dispatchEvent(event);
        setValue();

        wait();
    };
    this.input = function (value) {
        this.expectToBeEnabled();
        this.focus();
        input(value);
        wait();
    };
    this.fill = function (value) {
        this.expectToBeEnabled();
        clear();
        inputElement.setSelectionRange(0, 0);
        input(value);
        wait();
    };
    this.clear = function () {
        this.expectToBeEnabled();
        clear();
        wait();
    };
    function getValue () {
        me.expectToBeVisible();
        return inputElement.value ? (inputElement.value + '') : '';
    }
    this.expectToHaveValue = function (expectedValue) {
        var actualValue = getValue();

        if (actualValue != expectedValue) {
            throw new Error(
                utils.capitalize(nominativeDescription) + ' ' + gender.should + ' иметь значение "' + expectedValue +
                '", а не "' + actualValue + '".'
            );
        }
    };
    this.expectValueToMatch = function (pattern) {
        var actualValue = getValue();

        if (!pattern.test(actualValue)) {
            throw new Error(
                'Значение "' + actualValue + '" ' + genetiveDescription + ' должно удовлетворять регулярному ' +
                'выражению "' + pattern + '".'
            );
        }
    };
}

function JsTester_DescendantsTesterFactory (getDomElement, utils, testersFactory) {
    getDomElement = utils.makeFunction(getDomElement);

    this.forDescendant = function (selector) {
        return testersFactory.createDomElementTester(function () {
            domElement = getDomElement();
            return domElement && domElement.querySelector(selector);
        });
    };

    this.forDescendantWithText = function (desiredTextContent, selector) {
        return testersFactory.createDomElementTester(function () {
            return utils.findElementByTextContent(getDomElement(), desiredTextContent,
                selector);
        });
    };
}

function JsTester_DomElement (
    domElement, wait, utils, testersFactory, gender, nominativeDescription, accusativeDescription,
    genetiveDescription, factory
) {
    var getDomElement = utils.makeFunction(domElement),
        getNominativeDescription = utils.makeFunction(nominativeDescription),
        getAccusativeDescription = utils.makeFunction(accusativeDescription),
        getGenetiveDescription = utils.makeFunction(genetiveDescription);

    function convertDecimalToHex (c) {
        var hex = c.toString(16);
        return hex.length == 1 ? '0' + hex : hex;
    }

    function convertColorPropertyValueToHex (colorPropertyValue) {
        var rgb = colorPropertyValue.match(/\d+/g);

        if (!rgb) {
            return '#000000';
        }

        if (rgb.length == 4 && rgb[3] === '0') {
            return 'transparent';
        }

        return '#' + (
            convertDecimalToHex(parseInt(rgb[0], 0)) +
            convertDecimalToHex(parseInt(rgb[1], 0)) +
            convertDecimalToHex(parseInt(rgb[2], 0))
        );
    }

    function getStylePropertyValue (propertyName) {
        var actualValue = getComputedStyle(getDomElement())[propertyName];

        if (/\bcolor\b/.test(propertyName)) {
            actualValue = convertColorPropertyValueToHex(actualValue);
        }

        return actualValue;
    }

    this.focus = function () {
        var domElement = getDomElement();

        this.expectToBeVisible();
        domElement.focus();

        domElement.dispatchEvent(new Event('focus', {
            bubbles: true,
            cancelable: true
        }));
    };
    this.blur = function () {
        var domElement = getDomElement();

        this.expectToBeVisible();
        domElement.blur();

        domElement.dispatchEvent(new Event('blur', {
            bubbles: true,
            cancelable: true
        }));
    };
    this.expectToHaveClass = function (className) {
        this.expectToBeVisible();

        if (!getDomElement().classList.contains(className)) {
            throw new Error(
                utils.capitalize(getNominativeDescription()) + ' ' + gender.should + ' иметь класс "' +
                className + '", тогда, как ' + gender.pronoun + ' имеет классы "' + getDomElement().className + '".'
            );
        }
    };
    this.expectNotToHaveClass = function (className) {
        this.expectToBeVisible();

        if (getDomElement().classList.contains(className)) {
            throw new Error(
                utils.capitalize(getNominativeDescription()) + ' не ' + gender.should + ' иметь класс "' +
                className + '".'
            );
        }
    };
    this.expectTextContentToHaveSubstring = function (expectedSubstring) {
        this.expectToBeVisible();

        var actualContent = utils.getTextContent(getDomElement());

        if (actualContent.indexOf(expectedSubstring) === -1) {
            throw new Error(
                utils.capitalize(getNominativeDescription()) + ' ' + gender.should + ' содержать текст, содержащий ' +
                'подстроку "' + expectedSubstring + '", тогда, как ' + gender.pronoun + ' содержит текст "' +
                actualContent + '".'
            );
        }
    };
    this.expectTextContentNotToHaveSubstring = function (unexpectedSubstring) {
        this.expectToBeVisible();

        var actualContent = utils.getTextContent(getDomElement());

        if (actualContent.indexOf(unexpectedSubstring) !== -1) {
            throw new Error(
                utils.capitalize(getNominativeDescription()) + ' не ' + gender.should + ' содержать текст, ' +
                'содержащий подстроку "' + unexpectedValue + '", тогда, как ' + gender.pronoun + ' содержит текст "' +
                actualContent + '".'
            );
        }
    };
    this.expectToHaveTextContent = function (expectedContent) {
        this.expectToBeVisible();

        var actualContent = utils.getTextContent(getDomElement());

        if (actualContent != expectedContent) {
            throw new Error(
                utils.capitalize(getNominativeDescription()) + ' ' + gender.should + ' содержать текст "' +
                expectedContent + '", тогда, как ' + gender.pronoun + ' содержит текст "' + actualContent + '".'
            );
        }
    };
    this.expectToHaveContent = function (expectedContent) {
        this.expectToBeVisible();

        var actualContent = getDomElement().innerHTML;

        if (actualContent != expectedContent) {
            throw new Error(
                utils.capitalize(getNominativeDescription()) + ' ' + gender.should + ' иметь содержимое "' +
                expectedContent + '", тогда, как ' + gender.pronoun + ' имеет содержимое "' + actualContent + '".'
            );
        }
    };
    this.expectToBeVisible = function () {
        this.expectToExist();

        if (!utils.isVisible(getDomElement())) {
            throw new Error(
                utils.capitalize(getNominativeDescription()) + ' ' + gender.should + ' быть ' + gender.visible + '.'
            );
        }
    };
    this.expectToBeHidden = function () {
        this.expectToExist();

        if (utils.isVisible(getDomElement())) {
            throw new Error(
                utils.capitalize(getNominativeDescription()) + ' ' + gender.should + ' быть ' + gender.hidden + '.'
            );
        }
    };
    this.expectToBeCollapsed = function () {
        this.expectToExist();

        if (utils.isNotCollapsed(getDomElement())) {
            throw new Error(
                utils.capitalize(getNominativeDescription()) + ' ' + gender.should + ' быть ' + gender.collapsed + '.'
            );
        }
    };
    this.expectNotToBeCollapsed = function () {
        this.expectToExist();

        if (!utils.isNotCollapsed(getDomElement())) {
            throw new Error(
                utils.capitalize(getNominativeDescription()) + ' не ' + gender.should + ' быть ' + gender.collapsed +
                '.'
            );
        }
    };
    this.expectToBeHiddenOrNotExist = function () {
        if (getDomElement()) {
            this.expectToBeHidden();
        }
    };
    this.expectNotToExist = function () {
        if (getDomElement()) {
            throw new Error(
                utils.capitalize(getNominativeDescription()) + ' ' + gender.should + ' отсутствовать.'
            );
        }
    };
    this.expectToExist = function () {
        if (!getDomElement()) {
            throw new Error(
                utils.capitalize(getNominativeDescription()) + ' ' + gender.should + ' существовать.'
            );
        }
    };
    this.expectToHaveStyle = function (propertyName, expectedValue) {
        var actualValue = getStylePropertyValue(propertyName);

        if (actualValue != expectedValue) {
            throw new Error(
                'Свойство "' + propertyName + '" стиля ' + getGenetiveDescription() + ' должно иметь значение "' +
                    expectedValue + '", а не "' + actualValue + '".'
            );
        }
    };
    this.expectNotToHaveStyle = function (propertyName, unexpectedValue) {
        var actualValue = getStylePropertyValue(propertyName);

        if (actualValue == unexpectedValue) {
            throw new Error(
                'Свойство "' + propertyName + '" стиля ' + getGenetiveDescription() + ' не должно иметь значение "' +
                    unexpectedValue + '".'
            );
        }
    };
    this.putMouseOver = function () {
        this.expectToBeVisible();
        utils.dispatchMouseEvent(getDomElement(), 'mouseover');
    };
    this.mousedown = function () {
        this.focus();
        utils.dispatchMouseEvent(getDomElement(), 'mousedown');
    };
    this.click = function () {
        this.focus();
        utils.dispatchMouseEvent(getDomElement(), 'click');
    };
    this.findAnchor = function (text) {
        var domElement;

        getDomElement().querySelectorAll('a').forEach(function (anchor) {
            if (utils.getTextContent(anchor) == text) {
                domElement = anchor;
            }
        });

        return testersFactory.createAnchorTester(domElement, text);
    };
    this.getElement = function () {
        return getDomElement();
    };
    this.findElement = function (selector) {
        return getDomElement().querySelector(selector);
    };
    this.findElementByTextContent = function (desiredTextContent, selector) {
        return utils.findElementByTextContent(getDomElement(), desiredTextContent, selector);
    };
    this.createTester = function () {
        return testersFactory.createDescendantsTesterFactory(getDomElement);
    };
    this.createTesterForAscendant = function (selector) {
        return testersFactory.createDomElementTester(function () {
            return getDomElement().closest(selector);
        });
    };
}

function JsTester_ParamsContainingExpectation (actualParams, paramsDescription) {
    paramsDescription = paramsDescription ? (' ' + paramsDescription) : '';

    var forEachArrayItem = function (expectedParams, callback) {
        expectedParams.forEach(callback);
    };

    var forEachObjectItem = function (expectedParams, callback) {
        var name;

        for (name in expectedParams) {
            callback(expectedParams[name], name);
        }
    };

    function checkExpectation (expectedParams, actualParams, forEach, getParamDescription) {
        forEach(expectedParams, function (expectedValue, key) {
            var keyDescription = getParamDescription(key);

            if (!actualParams) {
                throw new Error('Невозможно найти параметр ' + keyDescription + ' в пустом объекте.');
            }

            var actualValue = actualParams[key];

            if (expectedValue !== null && typeof expectedValue == 'object') {
                if (Array.isArray(expectedValue)) {
                    checkExpectation(expectedValue, actualValue,
                        forEachArrayItem, function (key) {
                            return keyDescription + '[' + key + ']';
                        });
                } else {
                    checkExpectation(expectedValue, actualValue,
                        forEachObjectItem, function (key) {
                            return keyDescription + '.' + key;
                        });
                }

                return;
            }

            var expectationDescription = 'Параметр ' + keyDescription + paramsDescription + ' должен иметь значение ' +
                JSON.stringify(expectedValue) + ', тогда, как он';
            
            if (actualValue === undefined && expectedValue !== undefined) {
                throw new Error(expectationDescription + ' остутствует.');
            }

            if (actualValue !== expectedValue) {
                throw new Error(expectationDescription + ' имеет значение ' +
                    JSON.stringify(actualValue) + '.');
            }
        });
    }

    return function (expectedParams) {
        checkExpectation(expectedParams, actualParams, forEachObjectItem, function (key) {
            return key;
        });
    };
}

function JsTester_Query (query, utils) {
    var expectToContain = new JsTester_ParamsContainingExpectation(query, 'URL');

    this.testParam = function (paramName, tester) {
        if (!(paramName in query)) {
            throw new Error('Параметр "' + paramName + '" не найден в URL.');
        }

        tester(query[paramName]);
    };
    this.expectToContain = function (params) {
        expectToContain(params);
    };
    this.getDescription = function () {
        return 'с параметрами ' + utils.getVariablePresentation(query);
    };
}

function JsTester_NoQuery (utils) {
    this.testParam = function (paramName, tester) {
        throw new Error('URL не содержит параметров тогда, как он должен содержать параметр "' + paramName + '"');
    };
    this.expectToContain = function (params) {
        var name;

        for (name in params) {
            throw new Error(
                'URL не содержит параметров тогда, как он должен содержать параметры ' +
                utils.getVariablePresentation(params)
            );
        }
    };
    this.getDescription = function () {
        return 'без параметров.';
    };
}

function JsTester_DelayedTask (id, runTask, tasks) {
    this.remove = function () {
        delete(tasks[id]);
    };
    this.run = function () {
        runTask();
    };
}

function JsTester_OneTimeDelayedTask (id, runTask, tasks) {
    JsTester_DelayedTask.apply(this, arguments);

    var run = this.run;

    this.run = function () {
        run.apply(this, run);
        this.remove();
    };
}

function JsTester_TimeoutCallbackRunner (setterName, clearerName, DelayedTask) {
    var tasks = {},
        lastId = 0;

    window[setterName] = function (callback) {
        lastId ++;

        var task = new DelayedTask(lastId, callback, tasks);

        tasks[lastId] = task;
        return task;
    };

    window[clearerName] = function (task) {
        if (task && typeof task.remove == 'function') {
            task.remove();
        }
    };

    return function () {
        var id;

        for (id in tasks) {
            tasks[id].run();
        }
    };
}

function JsTester_Timeout (setterName, clearerName, DelayedTask) {
    var setter = window[setterName],
        clearer = window[clearerName],
        runCallbacks = function () {};

    this.runCallbacks = function () {
        runCallbacks();
    };
    this.replaceByFake = function () {
        runCallbacks = new JsTester_TimeoutCallbackRunner(setterName, clearerName, DelayedTask);
    };
    this.restoreReal = function () {
        window[setterName] = setter;
        window[clearerName] = clearer;
    };
}

function JsTester_Debugger () {
    var maxdepth,
        getStringPresentation,
        head,
        restore,
        normal,
        style,
        headless,
        getTrace;
    
    getTrace = function (e) {
        var stack = [];

        (function (items) {
            var i,
                length = items.length,
                item;

            for (i = 2; i < length; i ++) {
                item = items[i];

                if (item.indexOf('/jasmine-core/') != -1) {
                    break;
                }

                item = item.replace(
                    /\(http:\/\/localhost:[^\/]*\/(base\/)?/, '(');
                
                item = item.replace(/^at /, '');

                item = item.replace(/:[0-9]+\)/, ')');

                item = item.replace(/\?[^:]*:/, ':');

                stack.push(item);
            }
        })(e.stack.split("\n"));

        return "\n\n" + stack.join("\n");
    };

    normal = {
        object: function (o) {
            if (typeof o == 'function') {
                return '[Fn]';
            }

            if (o && o.$className) {
                return '[' + o.$className + ']';
            }

            return o;
        },
        head: function (o, val) {
            return val;
        },
        skip: function (o, k) {
            return false;
        }
    };

    headless = {
        object: function (o) {
            return o;
        },
        head: function (o, val) {
            return '';
        },
        skip: function (o, k) {
            return false;
        }
    };

    restore = function () {
        maxdepth = 3;
        style = normal;
    };

    restore();

    head = function (o) {
        var res = '';

        if (o && typeof o == 'object') {
            if (o.$className) {
                res = '['+o.$className+'] ';
            } else {
                res = '['+Object.prototype.toString.call(o).slice(8, -1)+'] ';
            }
        }

        if (res) {
            res = style.head(o, res);
        }

        return res;
    };

    getStringPresentation = function (o, depth) {
        var k,
            v,
            indent = '',
            result = '',
            i,
            addt;

        o = style.object(o);

        if (o === null) {
            result += '[null]';
        } else if (typeof o == 'object') {
            if (depth < maxdepth) {
                result += indent+head(o)+"(\n";


                for (i = 0; i < depth; i ++) {
                    indent += '    ';
                }

                for (k in o) {
                    if (style.skip(o, k)) {
                        continue;
                    }

                    v = o[k];

                    result += indent+'    '+k+' => '+getStringPresentation(v, depth+1)+"\n";
                }
                result += indent+')';
            } else {
                result += indent+head(o)+'...';
            }
        } else {
            if (typeof o != 'function') {
                result += o;
            }
        }

        return result;
    };

    function print (object) {
        console.log("\n\n" + getStringPresentation(object, 0));
    }

    this.setMaxDepth = function (value) {
        maxdepth = value;
        return this;
    };
    this.getVariablePresentation = function (o) {
        style = headless;
        var result = getStringPresentation(o, 0);

        restore();
        return result;
    };
    this.printWithSpecificStyle = function (component, value) {
        style = value;
        print(component);
    };
    this.printVariable = function (o) {
        print(o);
        restore();
    };
    this.printCallStack = function () {
        try {
            throw new Error();
        } catch(e) {
            console.log(getTrace(e));
        }
    };
    this.getCallStack = function () {
        try {
            throw new Error();
        } catch(e) {
            return getTrace(e);
        }
    };
}
