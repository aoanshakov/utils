define(function () {
    return function (args) {
        var utils = args.utils,
            debug = args.debug,
            spendTime = args.spendTime,
            opened,
            messages,
            messageHandlers = {},
            infoLogMessages = [];

        window.printLog = () => console.log(infoLogMessages.join("\n\n"));

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
                    'Ни одно сообщение не должно быть отправлено, тогда как сообщение ' +
                    JSON.stringify(actualArguments) + ' было отправлено в канал "' + actualChannel + '".' + "\n\n" +
                    callStack
                );
            };
        }
        
        function MessageProxy (methodCalls) {
            this.expectNotToBeSent = () => {
                methodCalls.push(message => message.expectNotToBeSent());
                return this;
            };

            this.expectToBeSentToChannel = expectedChannel => {
                methodCalls.push(message => message.expectToBeSentToChannel(expectedChannel));
                return this;
            };

            this.expectToBeSentWithArguments = (...args) => {
                methodCalls.push(message => message.expectToBeSentWithArguments(...args));
                return this;
            };
        }

        function MessagesInAnyOrder (messages) {
            const recentMessages = new Set(),
                tests = new Set();
            
            this.someSentMessage = () => {
                const methodCalls = [];

                recentMessages.add(messages.pop());
                tests.add(methodCalls);

                return new MessageProxy(methodCalls);
            };

            this.checkCompliance = () => {
                while (tests.size) {
                    const complient = Array.from(recentMessages).find(message => {
                        const errors = Array.from(tests).map(methodCalls => {
                            try {
                                methodCalls.forEach(callMethod => callMethod(message));
                            } catch (e) {
                                return [methodCalls, e.message];
                            }

                            return [methodCalls, null];
                        });

                        const item = errors.find(([methodCalls, error]) => !error),
                            isComplient = !!item;

                        if (!isComplient) {
                            throw new Error(errors.map(([methodCalls, error]) => error).join("\n\n"));
                        }

                        tests.delete(item[0]);
                        return true;
                    });

                    recentMessages.delete(complient);
                }
            };
        }

        return {
            'electron-log': {
                print: () => console.log(infoLogMessages.join("\n\n")),
                expectToContain: expectedSubstring => {
                    if (!infoLogMessages.some(message => message.includes(expectedSubstring))) {
                        console.log(infoLogMessages);

                        throw new Error(
                            `В лог должно быть выведено сообщение содержащее подстроку "${expectedSubstring}", ` +
                            `однако содержимое лога таково`
                        );
                    }
                }
            },
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
                    inAnyOrder: () => new MessagesInAnyOrder(messages),
                    receiveMessage: function (channel) {
                        var args = Array.prototype.slice.call(arguments, 0);

                        (messageHandlers[channel] || []).forEach(function (handler) {
                            handler.apply(null, args);
                        });

                        spendTime(0);
                        spendTime(0);
                        spendTime(0);
                        spendTime(0);
                    },
                    nextSentMessage: function () {
                        return messages.pop();
                    },
                    expectNoMessageToBeSent: function () {
                        return messages.pop().expectNotToBeSent();
                    }
                }
            },
            replaceByFake: function () {
                opened = {};
                messages = new JsTester_Stack(new NoMessage());

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
                                send: function (channel, message) {
                                    if (channel == 'log') {
                                        infoLogMessages.push(message);
                                        return;
                                    }

                                    messages.add(new Message(Array.prototype.slice.call(arguments, 0)));
                                },
                                removeAllListeners: eventName => 
                                    messageHandlers[eventName] && messageHandlers[eventName].splice(
                                        0,
                                        messageHandlers[eventName].length,
                                    ),
                            }
                        },
                        'electron-log': {
                            info: function (message) {
                                infoLogMessages.push(message);
                            },
                            error: function () {}
                        }
                    };

                    return packages[name] || {};
                };
            }
        };
    }
});
