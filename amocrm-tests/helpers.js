define(function () {
    var namespace = {};
    
    function Message (options) {
        this.expectToHaveText = function (expectedText) {
            if (!options) {
                throw new Error(
                    'Ни одно сообщение не было отображено, тогда как должно было отобразиться сообщение "' +
                    expectedText + '".'
                );
            }

            var actualText = options.text;

            if (actualText != expectedText) {
                throw new Error(
                    'Должно было отобразиться сообщение с текстом "' + expectedText + '", а не "' + actualText +
                    '".'
                );
            }
        };
    }

    function Notifications () {
        var messages = new JsTester_Queue();

        this.showMessage = function (options) {
            messages.add(options);
        };

        this.addCall = function (options) {
            messages.add(options);
        };

        this.recentMessage = function () {
            return new Message(messages.pop());
        };
    }

    var notifications = new Notifications();

    var phoneIconClickHandler = function () {
        throw new Error('Обработчик нажатие на иконку с телефоном не был установлен.');
    };

    function createAMOCRM (notifications, phoneIconClickHandler, userData, errors) {
        function Router () {
            var url;

            this.reset = function () {
                url = null;
            };

            this.expectToHaveUrl = function (expectedUrl) {
                if (!url) {
                    throw new Error('Должен быть открыт URL "' + expectedUrl + '".');
                }

                if (url != expectedUrl) {
                    throw new Error('Должен быть открыт URL "' + expectedUrl + '", а не "' + url + '".');
                }
            };

            this.navigate = function (value) {
                url = value;
            };
        }

        var errorTesters = [];

        var AMOCRM = {
            getBaseEntity: function () {
                return 'widgetsSettings';
            },
            notifications: {
                add_error: function (error) {
                    errors.add(error);
                },
                show_message: function (options) {
                    notifications.showMessage(options);
                },
                add_call: function (options) {
                    notifications.addCall(options);
                }
            },
            widgets: {
                system: {
                    amouser: 'darya.simha@gmail.com',
                    subdomain: 'comagicwidgets',
                    domain: 'comagicwidgets.amocrm.ru',
                    amohash: '442bd71353615168b7907d2a63b72f9e0def8d40'
                },
                list: {
                    uis_widget: {
                        params: {
                            active: 'N'
                        }
                    }
                },
                notificationsPhone: function (options) {
                    phoneIconClickHandler.setValue(options.click);
                }
            },
            router: new Router(),
            constant: function (key) {
                if (key == 'user') {
                    return {
                        id: 2851135,
                        login: AMOCRM.widgets.system.amouser,
                        personal_mobile: userData.get('phone'),
                        name: userData.get('name')
                    };
                } else if (key == 'account') {
                    return {
                        id: 939285
                    };
                }
            },
            element_types: {
                amoforms: 19,
                catalogs: 10,
                companies: 3,
                contacts: 1,
                contacts_and_companies: 17,
                customers: 12,
                events: 23,
                leads: 2,
                mail: 16,
                tags: 7,
                todo: 4,
                transactions: 13,
                unsorted: 14
            },
            lang: {}
        };

        return AMOCRM;
    }

    function loadFiles (baseUrl, filePaths, callback) {
        var files = {},
            filesCount = filePaths.length,
            loadedFilesCount = 0;
        
        if (baseUrl[baseUrl.length - 1] != '/') {
            baseUrl += '/';
        }

        function maybeCallback () {
            loadedFilesCount ++;

            if (loadedFilesCount == filesCount) {
                callback(files);
            }
        }

        filePaths.forEach(function (filePath) {
            var request = new XMLHttpRequest();
            request.open('GET', baseUrl + filePath, true);
            request.onload = function () {
                if (request.status == 200) {
                    files[baseUrl + filePath] = this.responseText;
                }

                maybeCallback();
            };

            request.send();
        });
    }
    
    function WidgetActions () {
        var actions = {};

        this.addAction = function (type, action) {
            actions[type] = action;
        };
        this.executeAction = function (type, data) {
            var execute = actions[type];

            if (execute) {
                execute(data);
            }
        };
    }

    function SentSipMessage (message, webSocket, uaOptions, lines, headers) {
        message.split("\r\n").forEach(function (line) {
            lines.push(line);
        });

        var length = lines.length;
        
        if (!length) {
            throw new Error('Сообщение является пустым.');
        }

        for (i = 1; i < length; i ++) {
            var header = lines[i].trim();

            if (!header) {
                break;
            }

            var pair = header.split(':');

            if (pair.length < 2) {
                throw new Error('Строка "' + header + '" должна быть парой из ключа и значения, разделенных ' +
                    'двоеточием.');
            }

            var headerName = pair[0].trim();

            if (!headerName) {
                throw new Error('Ключ в строке "' + header + '" является пустым.');
            }

            headers[headerName] = header;
        }

        var contactHeader;

        if ((contactHeader = headers.Contact)) {
            uaOptions.username = contactHeader.match(/<sip:([a-zA-Z0-9\-_]+)@/)[1];
        }

        this.expectHeaderToContain = function (headerName, expectedValue) {
            var header = headers[headerName];

            if (!header) {
                throw new Error('Не найден заголовок с именем "' + headerName + '". Отправленное сообщение:' +
                    "\n\n" + message);
            }

            if (header.indexOf(expectedValue) == -1) {
                throw new Error('Заголовок "' + headerName + '" должен содержать значение "' + expectedValue +
                    '".' + "\n\n" + 'Заголовок:' + "\n\n" + header + "\n\n");
            }

            return this;
        };
        this.expectToHaveHeader = function (headerName) {
            if (!(headerName in headers)) {
                throw new Error('Заголовок "' + headerName + '" не найден в сообщении. Отправленное ' +
                    'сообщение:' + "\n\n" + message);
            }

            return this;
        };
    }

    function SentSipRequest (message, webSocket, uaOptions) {
        var lines = [],
            headers = {};

        SentSipMessage.apply(this, Array.prototype.slice.call(arguments, 0).concat([lines, headers]));

        var firstHeader = lines[0].trim(),
            result = firstHeader.split(' ');

        if (result.length < 2) {
            throw new Error('Первый заголовок "' + firstHeader + '" должен содержать метод и имя сервера.');
        }

        var method = result[0].trim(),
            serverName = result[1].trim();

        this.expectToHaveServerName = function (expectedServerName) {
            if (serverName != expectedServerName) {
                throw new Error('Сообщение должно быть отправлено на сервер "' + expectedServerName + '", а ' +
                    'не "' + serverName + '".');
            }

            return this;
        };
        this.expectToHaveMethod = function (expectedMethod) {
            if (method != expectedMethod) {
                throw new Error('Сообщение должно быть отправлено методом "' + expectedMethod + '", а не "' +
                    method + '".');
            }

            return this;
        };
        this.response = function () {
            return new SipResponseBuilder(headers, serverName, webSocket);
        };
    }

    function SentSipResponse (message, webSocket, uaOptions) {
        var lines = [],
            headers = {};

        SentSipMessage.apply(this, Array.prototype.slice.call(arguments, 0).concat([lines, headers]));

        var firstHeader = lines[0].trim(),
            result = firstHeader.split(' ');

        if (result.length < 2) {
            throw new Error('Первый заголовок "' + firstHeader + '" должен содержать статус.');
        }

        var status = parseInt(result[1].trim(), 0);

        this.expectOk = function () {
            if (status != 200) {
                throw new Error('Сообщение, должно иметь статус "200 OK". Отправленное сообщение:' +
                    "\n\n" + message);
            }

            return this;
        };
        this.expectTrying = function () {
            if (status != 100) {
                throw new Error('Сообщение, должно иметь статус "100 Trying". Отправленное сообщение:' +
                    "\n\n" + message);
            }

            return this;
        };
        this.expectRinging = function () {
            if (status != 180) {
                throw new Error('Сообщение, должно иметь статус "180 Ringing". Отправленное сообщение:' +
                    "\n\n" + message);
            }

            return this;
        };
        this.expectToHaveServerName = function (expectedServerName) {
            if (serverName != expectedServerName) {
                throw new Error('Сообщение должно быть отправлено на сервер "' + expectedServerName + '", а ' +
                    'не "' + serverName + '".');
            }

            return this;
        };
        this.expectToHaveMethod = function (expectedMethod) {
            if (method != expectedMethod) {
                throw new Error('Сообщение должно быть отправлено методом "' + expectedMethod + '", а не "' +
                    method + '".');
            }

            return this;
        };
        this.request = function () {
            return new ReceivedSipMessage(webSocket, uaOptions, headers);
        };
    }

    function randomString (length) {
       var result = '',
           characters = 'abcdefghijklmnopqrstuvwxyz0123456789',
           charactersCount = characters.length;

       for (var i = 0; i < length; i++) {
          result += characters.charAt(Math.floor(Math.random() * charactersCount));
       }

       return result;
    }

    function SipResponseBuilder (requestHeaders, serverName, webSocket) {
        var status = '200 Ok',
            headers = [],
            toHeader = requestHeaders.To,
            toTag,
            requestHasNoToTag = false,
            tasks = [],
            body = "\r\n",
            contentLength = 0;

        toHeader.split(';').forEach(function (item) {
            var pair = item.trim().split('=');

            if (pair.length == 2 && pair[0].trim() == 'tag') {
                toTag = pair[1];
            }
        });

        if (!toTag) {
            requestHasNoToTag = true;
            toTag = randomString(32);
        }

        this.setUnauthorized = function () {
            status = '401 Unauthorized';
            return this;
        };
        this.setRinging = function () {
            status = '180 Ringing';
            return this;
        };
        this.setOk = function () {
            status = '200 Ok';
            return this;
        };
        this.setTrying = function () {
            status = '100 Trying';
            return this;
        };
        this.setBody = function (value) {
            body = value;
            contentLength = body.length;
            return this;
        };
        this.setToTag = function (value) {
            toTag = value;
            return this;
        };
        this.getToTag = function () {
            return toTag;
        };
        this.copyHeader = function (headerName) {
            headers.push(requestHeaders[headerName]);
            return this;
        };
        this.addHeader = function (header) {
            tasks.push(function () {
                header = header.replace('{server_name}', serverName.split(':')[1]);
                header = header.replace('{to_tag}', toTag);
                headers.push(header);
            });

            return this;
        };
        this.send = function () {
            tasks.forEach(function (executeTask) {
                executeTask();
            });

            if (requestHasNoToTag) {
                toHeader += ';tag=' + toTag;
            }

            var lines = [
                'SIP/2.0 ' + status,
                requestHeaders.Via + ';received=10.81.21.122',
                requestHeaders.From,
                toHeader,
                requestHeaders['Call-ID'],
                requestHeaders.CSeq
            ];

            lines = lines.concat(headers).concat([
                'Server: TS-v4.7.3-16',
                'Content-Length: ' + contentLength
            ]);

            webSocket.receiveMessage(lines.join("\r\n") + "\r\n\r\n" + body);
        };
    }

    function ReceivedSipMessage (webSocket, uaOptions, lastHeaders) {
        var method,
            serverName,
            callReceiverName,
            callReceiverLogin,
            body,
            contentType,
            headers = [],
            fromHeader = lastHeaders ? lastHeaders.From : '';

        this.setMethod = function (value) {
            method = value;
            return this;
        };
        this.setServerName = function (value) {
            serverName = value;
            return this;
        };
        this.setCallReceiverName = function (value) {
            callReceiverName = value;
            return this;
        };
        this.setCallReceiverLogin = function (value) {
            callReceiverLogin = value;
            return this;
        };
        this.setBody = function () {
            body = Array.prototype.slice.call(arguments, 0).join('\r\n');
            return this;
        };
        this.setSdpType = function () {
            contentType = 'application/sdp';
            return this;
        };
        this.addHeader = function (header) {
            var pair = header.split(':');

            if (pair[0].trim() == 'From') {
                fromHeader = header;
            } else {
                headers.push(header);
            }

            return this;
        };
        this.copyHeader = function (name) {
            headers.push(lastHeaders[name]);
            return this;
        };
        this.receive = function () {
            fromHeader = fromHeader || 'From: "Ivanov Ivan Ivanovich" <sip:invanov@somedomain.com>';

            if (!/\btag=/.test(fromHeader)) {
                fromHeader += ';tag=' + randomString(32);
            }

            var lines = [
                method + ' sip:' + uaOptions.username + '@' + serverName  + ' SIP/2.0',
                'Via: SIP/2.0/WSS 9jb2r27il5un.invalid;branch=z9hG4bK' + randomString(10),
                fromHeader,
                lastHeaders ? lastHeaders.To :
                    'To: "' + callReceiverName + '" <sip:' + callReceiverLogin + '@' + serverName + '>',
                lastHeaders ? lastHeaders['Call-ID'] : 'Call-ID: ' + randomString(22),
                'CSeq: 1 ' + method
            ];

            lines = lines.concat(headers);

            if (body) {
                lines.push(
                    'Content-Type: ' + contentType
                );
            }

            lines = lines.concat([
                '',
                body
            ]);
            
            webSocket.receiveMessage(lines.join("\r\n"));
        };
    }

    function createWidget (Widget, libsMap, Twig, i18n, widgetActions, userData) {
        var widget = new Widget();

        widget.i18n = function (key) {
            return i18n[key];
        };

        widget.langs = i18n;

        widget.params = {
            path: '/amocrm-widget',
            widget_code: 'uis_widget',
            phone: userData.get('phone'),
            name: userData.get('name')
        };

        widget.system = function () {
            return AMOCRM.widgets.system;
        };

        widget.render = function (options, data) {
            return Twig.twig(options).render(data);
        };

        widget.add_action = function (type, action) {
            widgetActions.addAction(type, action);
        };

        var originalRequire = window.require;
        var originalGetDebugOptions = window.getDebugOptions;

        window.require = function (paths, callback) {
            callback.apply(null, paths.map(function (path) {
                return libsMap[path];
            }));
        };

        window.require.config = function () {};

        window.getDebugOptions = function () {
            return {
                libsUrl: '/amocrm-widget'
            };
        };

        widget.callbacks.init();

        window.require = originalRequire;
        window.getDebugOptions = originalGetDebugOptions;

        return widget;
    }

    function UserData () {
        var data = {
            phone: '79252117620',
            name: 'Darya Simha'
        };

        this.get = function (paramName) {
            return data[paramName];
        };
        this.set = function (paramName, value) {
            data[paramName] = value;
        };
    }

    function ErrorNotifications (errors) {
        this.expectToHaveError = function (expectedError) {
            if (!errors.isEmpty()) {
                throw new Error(
                    'Должно быть отображено сообщение "' + expectedError + '", тогда как ни одно сообщение не было ' +
                    'отображено.'
                );
            }
            
            var actualError = errors.pop();
            actualError = actualError ? actualError.text : '';

            if (actualError != expectedError) {
                throw new Error(
                    'Должно быть отображено сообщение "' + expectedError + '", а не "' + actualError + '".'
                );
            }
        };
        this.expectToHaveNoError = function () {
            if (!errors.isEmpty()) {
                throw new Error(
                    'Ни одно сообщение об ошибке не должно быть отображено, тогда как были отображены сообщения ' + (
                        function () {
                            var result = [];

                            errors.forEach(function (error) {
                                result.push('"' + error.text + '"');
                            });

                            return result.join(', ');
                        }
                    )()
                );
            }
        };
    }

    function Setuper (files) {
        return function (ajax, handleWidgetModulesRequired) {
            var i18n = JSON.parse(files['/amocrm-widget/i18n/ru.json']),
                notifications,
                phoneIconClickHandler,
                widgetActions,
                widget,
                userData = new UserData(),
                errors = new JsTester_Queue(),
                errorNotifications = new ErrorNotifications(errors);

            handleWidgetModulesRequired = handleWidgetModulesRequired || function () {};

            var libs = [
                '/amocrm-widget/Util.js',
                '/amocrm-widget/Notification.js',
                '/amocrm-widget/Comagic.js',
                '/amocrm-widget/Specificity.js'
            ].filter(function (path) {
                return path in files;
            });
            
            var libsMap = {};

            requirejs(['script', 'templates'].concat(libs), function (Widget, Twig) {
                var length = arguments.length;

                for (var i = 2; i < length; i ++) {
                    libsMap[libs[i - 2]] = arguments[i];
                }

                widgetActions = new WidgetActions();
                notifications = new Notifications();
                phoneIconClickHandler = new JsTester_FunctionVariable(function () {
                    throw new Error('Обработчик нажатие на иконку с телефоном не был установлен.');
                });

                window.AMOCRM = createAMOCRM(notifications, phoneIconClickHandler, userData, errors);

                handleWidgetModulesRequired.apply(null, arguments);
                widget = createWidget(Widget, libsMap, Twig, i18n, widgetActions, userData);
            });

            return {
                clickPhoneIcon: phoneIconClickHandler.createValueCaller(),
                notifications: notifications,
                errorNotifications: errorNotifications,
                widgetActions: widgetActions,
                i18n: i18n,
                widget: widget,
                userData: userData
            };
        };
    }

    namespace.PhoneActionModel = function (dataToGetViaGetter, dataPresentedAsPropeties) {
        this.get = function (key) {
            return dataToGetViaGetter[key];
        };

        var key;

        for (key in dataPresentedAsPropeties) {
            this[key] = dataPresentedAsPropeties[key];
        }
    };

    namespace.Sip = function (webSocket) {
        var uaOptions = {};

        this.recentResponse = function () {
            return new SentSipResponse(webSocket.popRecentlySentMessage(), webSocket, uaOptions);
        };
        this.recentRequest = function () {
            return new SentSipRequest(webSocket.popRecentlySentMessage(), webSocket, uaOptions);
        };
        this.request = function () {
            return new ReceivedSipMessage(webSocket, uaOptions);
        };
    };

    namespace.createSetuper = function (handleFilesLoaded) {
        loadFiles('/amocrm-widget', [
            'i18n/ru.json',
            'script.js',
            'accounting.js',
            'store.js',
            'elements_view.js',
            'lib/common/fn.js',
            'lib/common/urlparams.js',
            'lib/components/base/modal.js',
            'lib/core/view.js',
            'lib/utils/format/index.js',
            'lib/utils/format/transliterate.js',
            'lib/utils/tester.js',
            'lib/utils/generator.js',
            'lib/utils/url_parser.js',
            'lib/utils/account/system.js',
            'lib/interface/notes/constants.js',
            'lib/interface/settings/digital_pipeline/controls/utils.js',
            'lib/interface/controls/checkboxes_dropdown/format_days.js',
            'lib/interface/controls/overlay.js',
            'lib/interface/controls/common.js',
            'lib/dev/timer.js',
            'Modernizr.js',
            'device.js',
            'vendor/nonbounce.js',
            'pubsub.js',
            'google-libphonenumber.js',
            'jssip.js',
            'gtag.js',
            'moment.min.js',
            'moment.js',
            'Settings.js',
            'TabManager.js',
            'InCall.js',
            'Dialpad.js',
            'EmployeeStatus.js',
            'CallStatus.js',
            'IncomingCall.js',
            'View.js',
            'Online.js',
            'WebPhone.js',
            'Is.js',
            'Sip.js',
            'Util.js',
            'Notification.js',
            'Comagic.js',
            'Specificity.js',
            'twig.js',
            'twig89.js',
            'twig-core.js',
            'twig-augmented.js',
            'twig.min.js',
            'templates.js',
            'templates/PhoneEnteringWindow.twig',
            'templates/ModalWindow.twig',
            'templates/CallStatus.twig',
            'templates/CustomerInfo.twig',
            'templates/Dialpad.twig',
            'templates/EmployeeStatus.twig',
            'templates/InCall.twig',
            'templates/IncomingCall.twig',
            'templates/Online.twig',
            'templates/Settings.twig'
        ], function (files) {
            handleFilesLoaded({
                files: files,
                setup: new Setuper(files)
            });
        });
    };

    return namespace;
});
