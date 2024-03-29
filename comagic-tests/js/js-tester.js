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
        return {};
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

function JsTester_ParentWindowReplacer (fakeWindow) {
    var realParent = window.parent,
        win = realParent;

    Object.defineProperty(window, 'parent', {
        get : function () {
            return win;
        }
    });     

    this.replaceByFake = function () {
        win = fakeWindow;
    };
    this.restoreReal = function () {
        win = realParent;
    };
}

function JsTester_EmptyQueueItem (emptyValue) {
    this.getPrevious = function () {
        return this;
    };
    this.getValue = function () {
        return emptyValue;
    };
}

function JsTester_QueueItem (previous, value) {
    this.getPrevious = function () {
        return previous;
    };
    this.getValue = function () {
        return value;
    };
}

function JsTester_Queue (emptyValue) {
    var emptyItem = new JsTester_EmptyQueueItem(emptyValue),
        lastItem;

    this.forEach = function (callback) {
        var currentItem = lastItem;

        while (currentItem != emptyItem) {
            callback(currentItem.getValue());
            currentItem = currentItem.getPrevious();
        }
    };
    this.add = function (value) {
        lastItem = new JsTester_QueueItem(lastItem, value);
    };
    this.pop = function () {
        var value = lastItem.getValue();
        lastItem = lastItem.getPrevious();
        return value;
    };
    this.isEmpty = function () {
        return lastItem === emptyItem;
    };
    this.removeAll = function () {
        lastItem = emptyItem;
    };

    this.removeAll();
}

function JsTester_NoWindowMessage () {
    this.expectToEqual = function (expectedMessage) {
        throw new Error(
            'Ни одно сообщение не было отправлено в родительское окно, однако должно было быть отправлено ' +
            'сообщение "' + expectedMessage + '".'
        );
    };

    this.expectNotToExist = function () {
    };
}

function JsTester_WindowMessage (args) {
    var actualMessage = args.actualMessage,
        debug = args.debug,
        callStack = debug.getCallStack();

    this.expectToEqual = function (expectedMessage) {
        if (actualMessage != expectedMessage) {
            throw new Error(
                'В родительское окно должно быть отправлено сообщение "' + expectedMessage + '", однако было ' +
                'отправлено сообщение "' + actualMessage + '".' + "\n\n" + callStack
            );
        }
    };

    this.expectNotToExist = function (errors) {
        var error = new Error(
            'Ни одно сообщение не должно быть отправлено в родительское окно, однако было отправлено сообщение "' +
            actualMessage + '".' + "\n\n" + callStack + "\n\n"
        );

        if (errors) {
            errors.push(error);
        } else {
            throw error;
        }
    };
}

function JsTester_FakeWindow (args) {
    var postMessages = args.postMessages,
        debug = args.debug;

    this.postMessage = function (actualMessage) {
        postMessages.add(new JsTester_WindowMessage({
            actualMessage: actualMessage,
            debug: debug
        }));
    };
}

function JsTester_PostMessageTester (postMessages) {
    this.expectMessageToBeSent = function (expectedMessage) {
        postMessages.pop().expectToEqual(expectedMessage);
    };

    this.expectNoMessageToBeSent = function (errors) {
        postMessages.pop().expectNotToExist(errors);
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
        return new JsTester_InputElement(
            (
                typeof field == 'function' ? field : (
                    field && field.inputEl ? field.inputEl.dom : null
                )
            ),
            (
                typeof field != 'function' && field && field.el ? field.el.dom : null
            ),
            wait,
            utils,
            this,
            neuter,
            utils.fieldDescription('текстовое поле', label),
            utils.fieldDescription('текстовое поле', label),
            utils.fieldDescription('текстового поля', label),
            factory
        );
    };
    this.createDomElementTester = function () {
        var getDomElement = utils.makeDomElementGetter(arguments[0]);

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

function JsTester_NoElement () {
    this.classList = {
        add: function () {
            throw new Error('Элемент должен существовать');
        }
    };
    this.closest = function () {
        return new JsTester_NoElement();
    };
    this.querySelector = function () {
        return new JsTester_NoElement();
    };
    this.querySelectorAll = function () {
        return [];
    };
    this.getBoundingClientRect = function () {
        return {
            left: 0,
            top: 0,
            width: 0,
            height: 0
        };
    };
}

function JsTester_Element({ utils, getAscendant }) {
    getAscendant = utils.makeDomElementGetter(getAscendant);

    this.querySelector = function (selector) {
        return utils.getVisibleSilently(this.querySelectorAll(selector)) || new JsTester_NoElement();
    };

    this.querySelectorAll = function (selector) {
        return (getAscendant() || new JsTester_NoElement()).querySelectorAll(selector)
;
    };
}

function JsTester_Utils (debug) {
    var me = this;

    this.receiveWindowMessage = function (args) {
        window.dispatchEvent(new MessageEvent('message', args));
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
    this.expectToContain = function (object, expectedContent) {
        new JsTester_ParamsContainingExpectation(object)(expectedContent);
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
    this.makeDomElementGetter = function (value) {
        var getDomElement = typeof value == 'string' ? function () {
            return me.getVisibleSilently(document.querySelectorAll(value));
        } : this.makeFunction(value);

        return function () {
            var element = getDomElement();

            if (element instanceof JsTester_NoElement) {
                return null;
            }

            return element;
        };
    };
    this.fieldDescription = function (description, label) {
        return description + (label ? (' "' + label + '"') : '');
    };
    this.isVisible = function(domElement) {
        if (!domElement) {
            return false;
        }

        if (getComputedStyle(domElement).visibility == 'hidden') {
            return false;
        }

        domElement.scrollIntoView();

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
    this.getCallStack = function () {
        return debug.getCallStack();
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
    this.descendantOf = function (ascendantElement) {
        return new JsTester_DescendantFinder(ascendantElement, this);
    };
    this.descendantOfBody = function () {
        return this.descendantOf(document.body);
    };
    this.element = function (getAscendant) {
        return new JsTester_Element({
            utils: this,
            getAscendant: getAscendant,
        });
    };
    this.querySelectorAll = function (selector) {
        return this.element(document.body).querySelectorAll(selector);
    };
    this.querySelector = function (selector) {
        return this.element(document.body).querySelector(selector);
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
    this.getAllVisible = function (domElements) {
        return Array.prototype.filter.call(domElements, (function (domElement) {
            return this.isVisible(domElement);
        }).bind(this));
    };
    function getVisible (domElements, handleError) {
        var results = me.getAllVisible(domElements);

        if (results.length != 1) {
            handleError(results.length);
            return;
        }

        return results[0];
    }
    this.getVisibleSilently = function (domElements) {
        return getVisible.call(this, domElements, function () {});
    };
    this.getVisible = function (domElements) {
        return getVisible.call(this, domElements, function (count) {
            throw new Error('Найдено ' + count + ' видимых элементов, тогда как видимым должен быть только один.');
        });
    };
    this.expectToInclude = function (expectedSubset) {
        return new JsTests_ArrayInclusionExpectation({
            expectedSubset,
            utils: this,
        });
    };
}

function JsTester_OpenedWindow (path, query) {
    this.expectToHavePath = function (expectedValue) {
        if (path != expectedValue) {
            throw new Error(
                'Должно быть открыто окно, URL которого имеет путь "' + expectedValue + '", тогда как ' +
                'URL имеет путь "' + path + '".'
            );
        }
    };

    this.expectQueryToContain = function (params) {
        query.expectToContain(params);
    };
}

function JsTester_Storage () {
    var keys,
        values,
        keyToIndex;
    
    this.setItemInAnotherTab = function (key, value) {
        var oldValue = values[key];

        this.setItem(key, value);

        window.dispatchEvent(new StorageEvent('storage', {
            key: key,
            oldValue: oldValue,
            newValue: value
        }));
    };
    this.setItem = function (key, value) {
        if (!(key in values)) {
            var index = keys.length;
            keys.push(key);
            keyToIndex[key] = index;
        }

        values[key] = value;
    };
    this.getItem = function (key) {
        return values[key] || null;
    };
    this.removeItem = function (key) {
        if (!(key in values)) {
            return;
        }

        keys.splice(keyToIndex[key], 1);
        delete(keyToIndex[key]);
        delete(values[key]);
    };
    this.clear = function () {
        keys = [];
        values = {};
        keyToIndex = {};
    };
    this.key = function (index) {
        return keys[index];
    };

    Object.defineProperty(this, 'length', {
        get: function () {
            return keys.length;
        },
        set: function () {}
    });

    this.clear();
}

function JsTester_StorageMocker () {
    var realLocalStorage = window.localStorage,
        currentLocalStorage = realLocalStorage,
        realSessionStorage = window.sessionStorage,
        currentSessionStorage = realSessionStorage;

    Object.defineProperty(window, 'localStorage', {
        get: function () {
            return currentLocalStorage;
        },
        set: function () {}
    });

    Object.defineProperty(window, 'sessionStorage', {
        get: function () {
            return currentSessionStorage;
        },
        set: function () {}
    });

    this.replaceByFake = function () {
        currentLocalStorage = new JsTester_Storage();
        currentSessionStorage = new JsTester_Storage();
    };
    this.restoreReal = function () {
        currentLocalStorage = realLocalStorage;
        currentSessionStorage = realSessionStorage;
    };
}

function JsTester_CommandExecutor (copiedTexts) {
    return function (type) {
        type == 'copy' && copiedTexts.push(window.getSelection().toString());
    };
}

function JsTester_ExecCommandReplacer (copiedTexts) {
    var execCommand = document.execCommand;

    this.replaceByFake = function () {
        copiedTexts.splice(0, copiedTexts.length);
        document.execCommand = new JsTester_CommandExecutor(copiedTexts);
    };

    this.restoreReal = function () {
        document.execCommand = execCommand;
    };
}

function JsTester_CopiedText (text) {
    return {
        expectToEqual: function (expectedText) {
            if (text != expectedText) {
                throw new Error('Должен быть скопирован текст "' + expectedText + '", а не "' + text + '".');
            }
        }
    };
}

function JsTester_CopiedTextsTester (copiedTexts) {
    return {
        last: function () {
            var length = copiedTexts.length;

            if (!length) {
                throw new Error('Не один текст не был скопирован.');
            }

            return new JsTester_CopiedText(copiedTexts[length - 1]);
        }
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

    this.expectNoWindowToBeOpened = function () {
        if (!(actualWindow instanceof JsTester_NoWindowOpened)) {
            throw new Error('Ни одно окно не должно быть открыто.');
        }

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
    this.respondUnsuccessfullyWith = function (responseText) {
        request.respondWith({
            status: 500,
            responseText,
        });

        return this;
    };
    this.respondForbidden = function () {
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
    getDomElement, componentElement, wait, utils, testersFactory, gender, nominativeDescription,
    accusativeDescription, genetiveDescription, factory
) {
    getDomElement = utils.makeDomElementGetter(getDomElement);

    var me = this;

    factory.admixDomElementTester(this, [
        getDomElement, wait, utils, testersFactory, gender, nominativeDescription, accusativeDescription,
        genetiveDescription, factory
    ]);

    var componentElementTester = componentElement && factory.createDomElementTester(
        componentElement, wait, utils, testersFactory, gender, nominativeDescription, accusativeDescription,
        genetiveDescription
    );

    function input (value) {
        var length = value.length,
            i = 0,
            oldValue = getDomElement().value,
            beforeCursor = oldValue.substr(0, getDomElement().selectionStart),
            afterCursor = oldValue.substr(getDomElement().selectionEnd),
            cursorPosition = beforeCursor.length,
            inputedValue = '';

        var update = function () {
            getDomElement().value = beforeCursor + inputedValue + afterCursor;
            getDomElement().setSelectionRange(cursorPosition, cursorPosition);
        };

        var CharacterAppender = function (character) {
            return function () {
                inputedValue += character;
                cursorPosition ++;
                getDomElement().value = beforeCursor + inputedValue + afterCursor;
                getDomElement().setSelectionRange(cursorPosition, cursorPosition);
            };
        };
        
        if (getDomElement().readOnly) {
            throw new Error('Невозможно ввести значение, так как ' + nominativeDescription + ' ' + gender.readonly +
                ' для редактирования.');
        }

        for (i = 0; i < length; i ++) {
            utils.pressKey(getDomElement(), value.charCodeAt(i), new CharacterAppender(value[i]));
        }
    }

    function erase (updateBeforeCursor, updateAfterCursor, keyCode) {
        var oldValue = getDomElement().value,
            selectionStart = getDomElement().selectionStart,
            selectionEnd = getDomElement().selectionEnd,
            beforeCursor = oldValue.substr(0, selectionStart),
            afterCursor = oldValue.substr(selectionEnd);
        
        if (getDomElement().readOnly) {
            throw new Error('Невозможно ввести значение, так как ' + nominativeDescription + ' ' + gender.readonly +
                ' для редактирования.');
        }

        if (selectionStart == selectionEnd) {
            beforeCursor = updateBeforeCursor(beforeCursor);
            afterCursor = updateAfterCursor(afterCursor);
        }

        utils.pressSpecialKey(getDomElement(), keyCode, function () {
            getDomElement().value = beforeCursor + afterCursor;
        }, function () {
            var cursorPosition = beforeCursor.length;
            getDomElement().setSelectionRange(cursorPosition, cursorPosition);
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
        getDomElement().setSelectionRange(0, getDomElement().value.length);
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
        this.expectSelectionEndToBeAt(getDomElement().value.length);
    };
    this.expectCursorToBeAtEnd = function () {
        this.expectCursorToBeAt(getDomElement().value.length);
    };
    this.expectCursorToBeAt = function (expectedPostition) {
        this.expectSelectionStartToBeAt(expectedPostition);
        this.expectSelectionEndToBeAt(expectedPostition);
    };
    this.expectSelectionStartToBeAt = function (expectedPostition) {
        var actualPosition = getDomElement().selectionStart;

        if (expectedPostition != actualPosition) {
            throw new Error(
                'Выделение ' + genetiveDescription + ' ' + gender.should + ' начинаться на ' + expectedPostition +
                '-ом символе, а не на ' + actualPosition + '-ом.'
            );
        }
    };
    this.expectSelectionEndToBeAt = function (expectedPostition) {
        var actualPosition = getDomElement().selectionEnd;

        if (expectedPostition != actualPosition) {
            throw new Error(
                'Выделение ' + genetiveDescription + ' ' + gender.should + ' заканчиваться на ' + expectedPostition +
                '-ом символе, а не на ' + actualPosition + '-ом.'
            );
        }
    };
    this.putCursorAtEnd = function () {
        this.putCursorAt(getDomElement().value.length);
    };
    this.putCursorAtBegining = function () {
        this.putCursorAt(0);
    };
    this.putCursorAt = function (position) {
        this.select(position, position);
    };
    this.selectAll = function () {
        this.select(0, getDomElement().value.length);
    };
    this.select = function (selectionStart, selectionEnd) {
        this.expectToBeEnabled();
        this.focus();
        getDomElement().setSelectionRange(selectionStart, selectionEnd);
    };
    this.expectToBeEnabled = function () {
        componentElementTester && componentElementTester.expectToBeEnabled();
    };
    this.expectToBeDisabled = function () {
        componentElementTester.expectToBeDisabled();
    };
    this.paste = function (value) {
        var length = value.length,
            i = 0,
            oldValue = getDomElement().value,
            selectionStart = getDomElement().selectionStart,
            cursorPosition = selectionStart + length,
            beforeCursor = oldValue.substr(0, selectionStart),
            afterCursor = oldValue.substr(getDomElement().selectionEnd);

        var setValue = function () {
            getDomElement().value = beforeCursor + value + afterCursor;
            getDomElement().setSelectionRange(cursorPosition, cursorPosition);
        };

        this.focus();

        var event = new ClipboardEvent('paste', {
            clipboardData: new DataTransfer()
        });

        utils.addPreventDefaultHandler(event, function () {
            setValue = function () {};
        });

        event.clipboardData.setData('text', value);

        getDomElement().dispatchEvent(event);
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
        getDomElement().setSelectionRange(0, 0);
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
        return getDomElement().value ? (getDomElement().value + '') : '';
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
    getDomElement = utils.makeDomElementGetter(getDomElement);

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
    var getDomElement = utils.makeDomElementGetter(domElement),
        getNominativeDescription = utils.makeFunction(nominativeDescription),
        getAccusativeDescription = utils.makeFunction(accusativeDescription),
        getGenetiveDescription = utils.makeFunction(genetiveDescription),
        isAssumedHidden = false;

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
                'содержащий подстроку "' + unexpectedSubstring + '", тогда, как ' + gender.pronoun + ' содержит ' +
                'текст "' + actualContent + '".'
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
        
        if (isAssumedHidden) {
            return;
        }

        if (!utils.isVisible(getDomElement())) {
            throw new Error(
                utils.capitalize(getNominativeDescription()) + ' ' + gender.should + ' быть ' + gender.visible + '.'
            );
        }
    };
    this.scrollIntoView = function () {
        this.expectToExist();
        getDomElement().scrollIntoView();
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
    this.click = function (x, y) {
        this.mousedown(x, y);
        this.mouseup(x, y);

        return this
    };
    this.mousedown = function (x, y) {
        this.expectToBeVisible();
        this.focus();

        utils.dispatchMouseEvent(getDomElement(), 'mousedown', null, x, y);
    };
    this.mouseup = function (x, y) {
        this.expectToBeVisible();
        var domElement = getDomElement();

        utils.dispatchMouseEvent(domElement, 'mouseup', null, x, y);
        utils.dispatchMouseEvent(domElement, 'click', null, x, y);
    };
    this.assumeHidden = function () {
        isAssumedHidden = true;
        return this;
    };
    this.expectAttributeToHaveValue = function (attributeName, expectedValue) {
        this.expectToBeVisible();

        var actualValue = getDomElement().getAttribute(attributeName);

        if (actualValue != expectedValue) {
            throw new Error(
                'Атрибут "' + attributeName + '" ' + getGenetiveDescription() + ' ' + gender.should +
                ' иметь значение "' + expectedValue + '"'
            );
        }
    };
    this.expectToHaveAttribute = function (attributeName) {
        this.expectToBeVisible();

        if (getDomElement().getAttribute(attributeName) === null) {
            throw new Error(utils.capitalize(getNominativeDescription()) + ' ' + gender.should + ' иметь атрибут "' +
                attributeName + '"');
        }
    };
    this.expectNotToHaveAttribute = function (attributeName) {
        this.expectToBeVisible();

        if (getDomElement().getAttribute(attributeName) !== null) {
            throw new Error(utils.capitalize(getNominativeDescription()) + ' не ' + gender.should + ' иметь атрибут "' +
                attributeName + '"');
        }
    };
    this.putMouseOver = function () {
        this.expectToBeVisible();
        utils.dispatchMouseEvent(getDomElement(), 'mouseover');
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

function JsTests_ParamExpectation () {
    this.maybeThrowError = function (actualValue, keyDescription) {};
}

JsTests_ParamExpectationPrototype = new JsTests_ParamExpectation();

function JsTests_EmptyObjectExpectaion () {
    this.maybeThrowError = function (actualValue, keyDescription) {
        if (
            !actualValue ||
            typeof actualValue != 'object' ||
            Array.isArray(actualValue) ||
            Object.values(actualValue).length > 0
        ) {
            throw new Error('Значением параметра ' + keyDescription + ' должен быть пустой объект, тогда как ' +
                'значение параметра таково ' + JSON.stringify(actualValue) + '.');
        }
    };
}

function JsTests_PrefixExpectaion (expectedPrefix) {
    this.maybeThrowError = function (actualValue, keyDescription) {
        if (
            !actualValue ||
            typeof actualValue != 'string' ||
            actualValue.indexOf(expectedPrefix) !== 0
        ) {
            throw new Error(
                'Значением параметра ' + keyDescription + ' должна быть строка с префиксом "' + expectedPrefix + '", ' +
                'однако значение параметра таково ' + JSON.stringify(actualValue) + '.'
            );
        }
    };
}

function JsTests_StringExpectaion () {
    this.maybeThrowError = function (actualValue, keyDescription) {
        if (
            !actualValue ||
            typeof actualValue != 'string'
        ) {
            throw new Error(
                'Значением параметра ' + keyDescription + ' должна быть строка, однако значение параметра таково ' +
                JSON.stringify(actualValue) + '.'
            );
        }
    };
}

function JsTests_ArrayInclusionExpectation ({
    expectedSubset,
    utils,
}) {
    this.maybeThrowError = function (actualValue, keyDescription) {
        if (!Array.isArray(actualValue)) {
            throw new Error(
                'Значением параметра ' + keyDescription + ' должен быть массив, однако значение параметра таково ' +
                JSON.stringify(actualValue) + '.'
            );
        }

        if (!Array.isArray(expectedSubset)) {
            throw new Error('Ожидаемым значением параметра ' + keyDescription + ' должен быть массив.');
        }

        if (expectedSubset.some(function (item) {
            if (typeof item == 'object') {
                return !expectedSubset.every(function (item) {
                    return actualValue.some(function (actualItem) {
                        var isContained = true;

                        try {
                            utils.expectToContain(actualItem, item);
                        } catch (e) {
                            isContained = false;
                        }

                        return isContained;
                    });

                });
            }

            return !actualValue.includes(item);
        })) {
            throw new Error(
                'Значением параметра ' + keyDescription + ' должнна быть массив, включающий такие элементы - ' +

                expectedSubset.map(function (item) {
                    return JSON.stringify(item);
                }).join(', ') +

                ', однако значение параметра таково ' + JSON.stringify(actualValue) + '.'
            );
        }
    };
}

function JsTests_UniqueValueExpectation (values) {
    var value;

    var checkUniqueness = function (keyDescription) {
        checkUniqueness = function () {};

        if (values.has(value)) {
            throw new Error('Значение параметра ' + keyDescription + ' не должно быть равно значению параметр ' +
                values.get(value));
        }

        values.set(value, keyDescription);
    };

    this.maybeThrowError = function (actualValue, keyDescription) {
        if (!actualValue) {
            throw new Error('Значение параметра ' + keyDescription + ' не должно быть пустым.');
        }

        if (value && actualValue !== value) {
            throw new Error('Параметр ' + keyDescription + ' должен иметь значение ' + JSON.stringify(value) +
                ', тогда, как он имеет значение ' + JSON.stringify(actualValue) + '.');
        }

        value = actualValue;
        checkUniqueness(keyDescription);
    };
}

function JsTests_UniqueValueExpectationFactory () {
    var values = new Map();

    return function () {
        return new JsTests_UniqueValueExpectation(values);
    };
}

JsTests_EmptyObjectExpectaion.prototype = JsTests_ParamExpectationPrototype;
JsTests_PrefixExpectaion.prototype = JsTests_ParamExpectationPrototype;
JsTests_StringExpectaion.prototype = JsTests_ParamExpectationPrototype;
JsTests_ArrayInclusionExpectation.prototype = JsTests_ParamExpectationPrototype;
JsTests_UniqueValueExpectation.prototype = JsTests_ParamExpectationPrototype;

function JsTester_ParamsContainingExpectation (actualParams, paramsDescription) {
    paramsDescription = paramsDescription || '';

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

            if (expectedValue instanceof JsTests_ParamExpectation) {
                expectedValue.maybeThrowError(actualValue, keyDescription);
                return;
            }

            if (expectedValue instanceof RegExp) {
                if (!expectedValue.test(actualValue)) {
                    throw new Error(
                        'Параметр ' + keyDescription + (
                            paramsDescription ? (' ' + paramsDescription) : ''
                        ) + ' должен иметь значение, удовлетворяющее регулярному выражению /' + expectedValue + '/, ' +
                        'тогда как он имеет значение ' + JSON.stringify(actualValue)
                    );
                }

                return;
            }

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

            var expectationDescription = 'Параметр ' +
                keyDescription + (paramsDescription ? (' ' + paramsDescription) : '') +
                ' должен иметь значение ' + JSON.stringify(expectedValue) +
                ', тогда, как он';
            
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

function JsTester_Tests (factory) {
    var testRunners = [],
        requiredClasses = [],
        responseFileNames = [],
        timeout = new JsTester_Timeout('setTimeout', 'clearTimeout', JsTester_OneTimeDelayedTask),
        interval = new JsTester_Timeout('setInterval', 'clearInterval', JsTester_DelayedTask),
        storageMocker = new JsTester_StorageMocker(),
        debug = factory.createDebugger(),
        utils = factory.createUtils(debug),
        requestsManager = new JsTester_RequestsManager(utils),
        windowOpener = new JsTester_WindowOpener(utils),
        testsExecutionBeginingHandlers = [],
        postMessages = new JsTester_Queue(new JsTester_NoWindowMessage()),
        postMessagesTester = new JsTester_PostMessageTester(postMessages),
        fakeWindow = new JsTester_FakeWindow({
            postMessages: postMessages,
            debug: debug
        }),
        parentWindowReplacer = new JsTester_ParentWindowReplacer(fakeWindow),
        copiedTexts = [],
        copiedTextsTester = new JsTester_CopiedTextsTester(copiedTexts),
        execCommandReplacer = new JsTester_ExecCommandReplacer(copiedTexts);

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
    this.runTests = function (responses) {
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
            runTest(Object.assign({
                requestsManager: requestsManager,
                testersFactory: testersFactory,
                wait: wait,
                utils: utils,
                windowOpener: windowOpener,
                postMessagesTester: postMessagesTester,
                debug: debug,
                copiedTexts: copiedTextsTester,
                responses: responses
            }, factory.createTestArguments()));
        });
    };
    this.requireClass = function (className) {
        requiredClasses.push(className);
    };
    this.requireResponse = function (responseFileName) {
        responseFileNames.push(responseFileName);
    };
    this.getResponseFileNames = function () {
        return responseFileNames;
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
        postMessages.removeAll();
        requestsManager.createAjaxMock();
        parentWindowReplacer.replaceByFake();
        execCommandReplacer.replaceByFake();
        storageMocker.replaceByFake();
        timeout.replaceByFake();
        interval.replaceByFake();
        windowOpener.replaceByFake();
        factory.beforeEach();
    };
    this.afterEach = function () {
        var errors = [];

        postMessagesTester.expectNoMessageToBeSent(errors);
        parentWindowReplacer.restoreReal();
        requestsManager.destroyAjaxMock();
        timeout.restoreReal();
        interval.restoreReal();
        execCommandReplacer.restoreReal();
        storageMocker.restoreReal();
        windowOpener.restoreReal();
        factory.afterEach();

        errors.forEach(function (error) {
            throw error;
        });
    };
}

function JsTester_DescendantFinder (getAscendantElement, utils) {
    var selector = '*';
    getAscendantElement = utils.makeDomElementGetter(getAscendantElement);

    var isDesiredText = function () {
        throw new Error('Не указаны критерии поиска');
    };

    this.matchesSelector = function (value) {
        selector = value;
        return this;
    };

    this.textEquals = function (desiredTextContent) {
        isDesiredText = function (actualTextContent, comparisons) {
            const result = actualTextContent == desiredTextContent;

            (comparisons || []).push(
                `Строка ${
                    JSON.stringify(actualTextContent)
                } должна быть равна строке ${
                    JSON.stringify(desiredTextContent)
                }. Условие ${result ? '' : 'не '}удовлетворено.`
            );

            return result;
        };

        return this;
    };

    this.textContains = function (desiredTextContent) {
        isDesiredText = function (actualTextContent, comparisons) {
            const result = actualTextContent.indexOf(desiredTextContent) != -1;

            (comparisons || []).push(
                `Строка ${
                    JSON.stringify(actualTextContent)
                } должна содержать строку ${
                    JSON.stringify(desiredTextContent)
                }. Условие ${result ? '' : 'не '}удовлетворено.`
            );

            return result;
        };

        return this;
    };

    this.findAll = function (logEnabled) {
        if (!(getAscendantElement() || new JsTester_NoElement()).querySelectorAll) {
            throw new Error(`Объект ${getAscendantElement()} не является HTML-элементом.`);
        }

        var i,
            descendants = (getAscendantElement() || new JsTester_NoElement()).querySelectorAll(selector),
            length = descendants.length,
            descendant,
            text,
            desiredDescendants = [],
            allDescendants = [],
            comparisons = [];

        for (i = 0; i < length; i ++) {
            descendant = descendants[i];
            text = utils.getTextContent(descendant);

            logEnabled && allDescendants.push({
                domElement: descendant,
                text: text
            });

            if (isDesiredText(text, comparisons)) {
                desiredDescendants.push(descendant);
            }
        }

        logEnabled && console.log({
            selector,
            ascendantElement: getAscendantElement(),
            comparisons,
            allDescendants,
            desiredDescendants
        });

        return desiredDescendants;
    };

    this.findAllVisible = function () {
        return this.findAll().filter(function (domElement) {
            return utils.isVisible(domElement);
        });
    };

    this.find = function (logEnabled) {
        var desiredDescendants = this.findAll(logEnabled);

        if (desiredDescendants.length) {
            return utils.getVisibleSilently(desiredDescendants) || new JsTester_NoElement();
        }

        return new JsTester_NoElement();
    };
}
