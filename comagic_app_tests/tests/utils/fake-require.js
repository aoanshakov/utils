define(function () {
    return function () {
        var opened,
            maximizeChangeHandlers = [];

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
                    collapse: function () {
                        maximizeChangeHandlers.forEach(function (handler) {
                            handler({}, {
                                appSimpleMode: true
                            });
                        });
                    }
                }
            },
            replaceByFake: function () {
                opened = {};

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
                                    eventName == 'maximizechange' && maximizeChangeHandlers.push(handler);
                                },
                                send: function () {}
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
