import React from 'react';
import ReactDOM from 'react-dom';
import { notification } from 'magic-ui';

import { createMemoryHistory } from 'history';

import { eventBus, isElectron, Root } from '@comagic/core';

import { createRootStore as createSoftphoneRootStore } from 'softphone/src/models/RootStore';
import { createRootStore as createChatsRootStore } from 'chats/src/models/RootStore';
import { createRootStore as createContactsRootStore } from 'contacts/src/models/RootStore';

import { intl } from './i18n';

import Softphone from './Softphone';
import ComagicApp from './ComagicApp';

import {
    Provider,
    rootStore,
    createRootStore 
} from '@models/RootStore';

import {
    Provider as SoftphoneProvider,
    rootStore as softphoneRootStore,
    createRootStore as createSoftphoneRootStore 
} from '@models/SoftphoneRootStore';

const history = createMemoryHistory(),
    TestBody = ({children}) => <div className="cm-test-body">{children}</div>,
    Window = ({children}) => <div className="cm-test-window">{children}</div>;

const units = {};

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

        if (!Unit) {
            setReactDOM(ReactDOM);
            setEventBus(eventBus);
            (isElectron() ? createSoftphoneRootStore : createRootStore)();
            !isElectron() && setChatsRootStore(createChatsRootStore());
            createSoftphoneRootStore();
            createContactsRootStore();
            setHistory(history);
            setNotification(notification);
        }
         
        this.exit();

        const container = document.createElement('div');
        container.id = 'root';
        document.body.appendChild(container);

        ReactDOM.render(Unit ? <TestBody><Unit /></TestBody> : <Root
            {...(isElectron() ? {
                Provider: SoftphoneProvider,
                rootStore: softphoneRootStore,
            } : {
                Provider,
                rootStore
            })}

            {...({
                history,
                i18n: intl
            })}
        >{isElectron() ? <Softphone /> : <ComagicApp />}</Root>, container);
    },

    exit() {
        const container = document.getElementById('root');

        if (!container) {
            return;
        }

        container.firstChild && ReactDOM.unmountComponentAtNode(container);
        container.remove();
    }
};
