import { SentMessages }  from './sent_messages';

function IpcRenderer ({ log, messages, listeners }) {
    this.on = function (channel, listener) {
        (
            listeners[channel] || (listeners[channel] = new Set())
        ).add(listener);
    };

    this.off = function (channel, listener) {
        listeners[channel]?.delete(listener);
    };

    this.removeListener = this.off.bind(this);

    this.send = function (channel, message) {
        if (channel == 'log') {
            log.push(message);
            return;
        }

        messages.send({
            channel,
            arguments: Array.prototype.slice.call(arguments, 1),
        });
    };

    this.removeAllListeners = function (channel) {
        listeners[channel] && listeners[channel].clear();
    };
}

function IpcRendererTester ({ log, messages, listeners }) {
    this.enableLogging = function () {
        messages.enableLogging();
    };

    this.expectMessageToBeSent = function (channel) {
        messages.expectSentMessageToInclude({
            channel,
            arguments: Array.prototype.slice.call(arguments, 1),
        });
    };

    this.receiveMessage = function (channel) {
        cy.then(() => {
            try {
                const args = Array.prototype.slice.call(arguments, 0);

                (listeners[channel] || []).forEach(function (listener) {
                    listener.apply(null, args);
                });
            } catch (e) {
                console.error(e);
                throw e;
            }
        });
    };
}

function IpcRendererFactory () {
    const listeners = {},
        log = [];

    const messages = new SentMessages({
        assertionMessages: {
            messageBeingSentAssertion: `Сообщение должно быть отправлено в electron.ipcRenderer`,
            contentInclusionAssertion: `В electron.ipcRenderer должно быть отправлено сообщение`,
            paramsDescription: `сообщения, отправленного в electron.ipcRenderer`,
        },
    });

    let ipcRenderer;

    this.createFakeIpcRenderer = function () {
        messages.reset();
        Object.keys(listeners).forEach(channel => delete(listeners[channel]));

        ipcRenderer = new IpcRenderer({ log, messages, listeners });
        return ipcRenderer;
    };

    this.createIpcRendererTester = function () {
        return new IpcRendererTester({ log, messages, listeners });
    };
}

const ipcRendererFactory = new IpcRendererFactory(),
    ipcRenderer = ipcRendererFactory.createIpcRendererTester();

Object.defineProperty(cy, 'ipcRenderer', {
    get() {
        return ipcRenderer;
    },

    set() {},
});

Object.defineProperty(cy, 'ipcRendererFactory', {
    get() {
        return ipcRendererFactory;
    },

    set() {},
});
