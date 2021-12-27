define(function () {
    return function (args) {
        var utils = args.utils,
            debug = args.debug,
            spendTime = args.spendTime,
            opened,
            messages,
            messageHandlers = {};

        function NoMessage () {
            this.expectNotToBeSent = function () {};

            this.expectToBeSentToChannel = function (expectedChannel) {
                throw new Error(
                    'Сообщение должно быть отправлено в канал "' + expectedChannel + '", тогда как никакое сообщение ' +
                    'отправлено не было.'
                );
            };

            this.expectToBeSentWithArguments = function () {
                throw new Error(
                    'Сообщение должно быть отправлено с аргументами ' +
                    JSON.stringify(Array.prototype.slice.call(arguments, 0)) + ', тогда как никакое сообщение ' +
                    'отправлено не было.'
                );
            };
        }

        function Message (args) {
            var actualChannel = args[0],
                actualArguments = args.slice(1),
                callStack = debug.getCallStack();

            this.expectToBeSentToChannel = function (expectedChannel) {
                if (actualChannel != expectedChannel) {
                    throw new Error(
                        'Сообщение должно быть отправлено в канал "' + expectedChannel + '", а не "' + actualChannel +
                        '".'
                    );
                }

                return this;
            };

            this.expectToBeSentWithArguments = function () {
                utils.expectObjectToContain(
                    actualArguments,
                    Array.prototype.slice.call(arguments, 0).concat([undefined])
                )

                return this;
            };

            this.expectNotToBeSent = function () {
                throw new Error(
                    'Ни одно сообщение не должно быть отправлено, тогда как было отправлено сообщение в канал "' +
                    actualChannel + '".' + "\n\n" + callStack
                );
            };
        }

        return {
            electron: {
                shell: {
                    expectExternalUrlToBeOpened: function (url) {
                        if (opened[url]) {
                            return;
                        }

                        if (!Object.keys(opened).length) {
                            throw new Error('Должен быть открыт URL "' + url + '".');
                        }

                        if (Object.keys(opened).length > 1) {
                            throw new Error('Должен быть открыт URL "' + url + '", тогда как были открыты URLы "' +
                                Object.keys(opened).join('", "') + '"');
                        }

                        throw new Error('Должен быть открыт URL "' + url+ '", а не "' + Object.keys(opened)[0] + '".');
                        return this;
                    }
                },
                ipcRenderer: {
                    receiveMessage: function (channel) {
                        var args = Array.prototype.slice.call(arguments, 0);

                        (messageHandlers[channel] || []).forEach(function (handler) {
                            handler.apply(null, args);
                        });

                        spendTime(0);
                    },
                    recentlySentMessage: function () {
                        return messages.pop();
                    },
                    expectNoMessageToBeSent: function () {
                        return messages.pop().expectNotToBeSent();
                    }
                }
            },
            replaceByFake: function () {
                opened = {};
                messages = new JsTester_Queue(new NoMessage());

                window.require = function (name) {
                    var packages = {
                        electron: {
                            shell: {
                                openExternal: function (url) {
                                    opened[url] = true;
                                }
                            },
                            remote: {
                                app: {
                                    getVersion: function () {
                                        return '1.0.0';
                                    }
                                },
                                require: window.require
                            },
                            ipcRenderer: {
                                on: function (eventName, handler) {
                                    (messageHandlers[eventName] || (messageHandlers[eventName] = [])).push(handler)
                                },
                                send: function () {
                                    messages.add(new Message(Array.prototype.slice.call(arguments, 0)));
                                }
                            }
                        },
                        'electron-log': {
                            info: function () {},
                            error: function () {}
                        }
                    };

                    return packages[name] || {};
                };
            }
        };
    }
});
