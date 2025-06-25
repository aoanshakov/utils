const doNothing = () => {};

const waitForValueBeingEqualTo = (getActualValue, expectedValue, message) =>
    cy.wrap(null, { log: false }).should(() => {
        expect(getActualValue(), message).to.equal(expectedValue);
    });

function FakeWebSocketCore({ url, constants, logEnabled }) {
    let readyState = constants.CLOSED,
        connectionState = 'connecting',
        messages = [],
        messageIndex = 0;

    const listenerPropeties = {
        onopen: doNothing,
        onclose: doNothing,
        onerror: doNothing,
        onmessage: doNothing,
    };

    const listeners = {
        open: [],
        close: [],
        error: [],
        message: []
    };

    const callListeners = (name, args) => {
        args = args || [];

        listenerPropeties['on' + name].apply(null, args);
        listeners[name].forEach(handle => handle.apply(null, args));
    };

    const createNormalDisconnectingEvent = code => ({
        code: code || 1000,
        wasClean: true
    });

    const disconnect = event => {
        readyState = constants.CLOSED;
        connectionState = 'disconnected';

        createHandlerCaller('close', [event])
    };

    const expectToBeConnected = () => {
        expect(
            connectionState,
            `Соединеие по веб-сокету с URL "${url}" должно быть установлено.`,
        ).to.equal('connected');
    };

    this.expectToBeDisconnected = function () {
        expect(
            connectionState,
            `Соединеие по веб-сокету с URL "${url}" должно быть разорвано.`,
        ).to.equal('disconnected');
    };

    this.expectToBeConnecting = function () {
        expect(
            connectionState,
            `Соединеие по веб-сокету с URL "${url}" должно устанавливаться.`
        ).to.equal('connecting');
    };

    this.waitForBeingDisconnecting = function () {
        return waitForValueBeingEqualTo(
            () => connectionState,
            'disconnecting',
            `Соединеие по веб-сокету с URL "${url}" должно разрываться.`
        );
    };

    this.setListenerByProperty = function (name, listener) {
        listenerPropeties[name] = listener;
    };

    this.addListener = function (name, listener) {
        listeners[name].push(listener);
    };

    this.removeListener = function (name, listener) {
        listeners[name].forEach((currentListener, index) =>
            currentListener == listener && listeners[name].splice(index, 1));
    };

    this.handleClosing = function () {
        readyState = constants.CLOSING;
        connectionState = 'disconnecting';
    };
    
    this.finishDisconnecting = function (code) {
        this.waitForBeingDisconnecting().then(() => disconnect(createNormalDisconnectingEvent(code)));
    };

    this.connect = function () {
        this.expectToBeConnecting();

        readyState = constants.OPEN;
        connectionState = 'connected';

        callListeners('open');
    };

    this.disconnect = function (code) {
        expectToBeConnected();
        disconnect(createNormalDisconnectingEvent(code));
    };

    this.disconnectAbnormally = function (code) {
        expectToBeConnected();
        callListeners('error', [{}]);

        disconnect({
            code: code || 4999,
            wasClean: false
        });
    };

    this.receiveMessage = function (message) {
        expectToBeConnected();

        if (typeof message != 'string') {
            message = JSON.parse(message);
        }

        callListeners('message', [new MessageEvent('message', {
            data: message,
        })]);
    };

    this.getReadyState = function () {
        return readyState;
    };

    this.send = function (message) {
        expectToBeConnected();

        logEnabled && console.log(message);
        messages.push(message);
    };

    this.popRecentlySentMessage = function () {
        return waitForValueBeingEqualTo(
            () => {
                console.log('WAIT FOR VALUE', {
                    messageIndex,
                    messageCount: messages.length,
                    messageSent: messageIndex >= messages.length,
                });

                return messages.length >= messageIndex;
            },
            true,
            `Сообщение должно быть отправлено в вебсокет с URL ${url}.`,
        ).then(() => {
            const message = messages[messageIndex];

            messageIndex ++;
            return message;
        });
    };

    this.expectSentMessageToContain = function (expectedContent) {
        return this.popRecentlySentMessage().
            then(actualMessage => {
                console.log('ACTUAL MESSAGE', actualMessage);
                expect(JSON.parse(actualMessage)).to.deep.include(expectedContent);
            });
    };
};

function FakeWebSocketTester (getCore) {
    this.connect = function () {
        return getCore().then(core => core.connect());
    };

    this.finishDisconnecting = function (code) {
        return getCore().then(core => core.finishDisconnecting(code));
    };

    this.disconnect = function (code) {
        return getCore().then(core => core.disconnect(code));
    };

    this.disconnectAbnormally = function (code) {
        return getCore().then(core => core.disconnectAbnormally(code));
    };

    this.receiveMessage = function (message) {
        return getCore().then(core => core.receiveMessage(message));
    };

    this.expectToBeConnecting = function () {
        return getCore().then(core => core.expectToBeConnecting());
    };

    this.waitForBeingDisconnecting = function () {
        return getCore().then(core => core.waitForBeingDisconnecting());
    };

    this.expectSentMessageToContain = function (expectedContent) {
        return getCore().then(core => core.expectSentMessageToContain());
    };

    this.popRecentlySentMessage = function (expectation) {
        return getCore().then(core => core.popRecentlySentMessage());
    };
}

function FakeWebSocketTesters (cores) {
    this.reset = function () {
        Object.keys(cores).forEach(url => delete(cores[url]));
    };

    this.withUrl = function (url) {
        return new FakeWebSocketTester(
            () => waitForValueBeingEqualTo(() => !!cores[url], true, `Вебсокет с ${url} не был создан`)
                .then(() => cores[url])
        );
    };
}

function FakeWebSocketFactory () {
    let cores = {},
        RealWebSocket = window.WebSocket,
        constants = {},
        factory = this,
        logEnabled = false;

    function copyConstants (target) {
        [
            'CONNECTING',
            'OPEN',
            'CLOSING',
            'CLOSED'
        ].forEach(function (name) {
            target[name] = RealWebSocket[name];
        });
    }

    copyConstants(constants);

    this.enableLogging = function () {
        logEnabled = true;
    };

    this.createConstructor = function () {
        const constructor = function (url) {
            const me = this;

            const core = new FakeWebSocketCore({
                url,
                constants,
                logEnabled,
            });

            copyConstants(this);

            cores[url]?.expectToBeDisconnected();
            cores[url] = core;

            [
                'onopen',
                'onclose',
                'onmessage',
                'onerror',
            ].forEach(propertyName => {
                let currentValue;

                Object.defineProperty(me, propertyName, {
                    set: function (newValue) {
                        currentValue = newValue;
                        core.setListenerByProperty(propertyName, newValue);
                    },
                    get: function () {
                        return currentValue;
                    }
                });
            });

            Object.defineProperty(this, 'url', {
                set: function () {},

                get: function () {
                    return url;
                },
            });

            Object.defineProperty(this, 'readyState', {
                set: function () {},

                get: function () {
                    return core.getReadyState();
                },
            });

            this.addEventListener = function (name, listener) {
                core.addListener(name, listener);
            };

            this.removeEventListener = function (name, listener) {
                core.removeListener(name, listener);
            };

            this.send = function (message) {
                core.send(message);
            };

            this.close = function () {
                core.handleClosing();
            };
        };

        copyConstants(constructor);
        return constructor;
    };

    this.createCollection = function () {
        return new FakeWebSocketTesters(cores);
    };
};

const factory = new FakeWebSocketFactory(),
    collection = factory.createCollection();

Object.defineProperty(cy, 'websocketsFactory', {
    get() {
        return factory;
    },

    set() {},
});

Object.defineProperty(cy, 'websockets', {
    get() {
        return collection;
    },

    set() {},
});
