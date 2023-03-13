import React, { useCallback, useState } from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { notification } from 'magic-ui';

import { eventBus, isElectron } from '@comagic/core';
import Root from '@/bootstrap';

import { createRootStore as createSoftphoneRootStore } from 'softphone/src/models/RootStore';
import { createRootStore as createChatsRootStore } from 'chats/src/models/RootStore';
import { createRootStore as createContactsRootStore } from 'contacts/src/models/RootStore';

import { intl } from './i18n';
import { createMemoryHistory } from 'history';

import { App as Softphone } from '@/applications/softphone';
import { App as ComagicApp } from '@/applications/default';

import { createRootStore } from '@models/default/RootStore';
import { createRootStore as createElectronRootStore } from '@models/softphone/RootStore';

const TestBody = ({children}) => <div className="cm-test-body">{children}</div>,
    Window = ({children}) => <div className="cm-test-window">{children}</div>,
    history = createMemoryHistory();
let root;

const Fiber = () => {
    const [counter, setCounter] = useState(0);

    return <div>
        <p>Clicks count: {counter}</p>
        <button onClick={useCallback(() => setCounter(counter + 1), [counter])}>Increment</button>
    </div>;
};

const units = {
    fiber: Fiber,
};

window.application = {
    run({
        setReactDOM = () => null,
        setEventBus = () => null,
        setHistory = () => null,
        setNotification = () => null,
        setChatsRootStore = () => null,
        appName = ''
    }) {
        const Unit = units[appName];
        let rootStore;

        if (!Unit) {
            setReactDOM(ReactDOM);
            setEventBus(eventBus);
            rootStore = (isElectron() ? createElectronRootStore : createRootStore)();
            setChatsRootStore(createChatsRootStore());
            createSoftphoneRootStore();
            createContactsRootStore();
            setHistory(history);
            setNotification(notification);
        }
         
        this.exit();

        const container = document.createElement('div');
        container.id = 'root';
        document.body.appendChild(container);

        root = createRoot(document.getElementById('root')),

        root.render(Unit ? <TestBody><Unit /></TestBody> : <Root {...{ rootStore, history }}>
            {isElectron() ? <Softphone /> : <ComagicApp />}
        </Root>);
    },

    exit() {
        const container = document.getElementById('root');

        if (!container) {
            return;
        }

        container.firstChild && root?.unmount();
        container.remove();
    }
};
