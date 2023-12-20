import React, { useCallback, useState } from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { notification } from 'magic-ui';

import App from '@/App';
let root;

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

        setReactDOM(ReactDOM);
        setNotification(notification);
         
        this.exit();

        const container = document.createElement('div');
        container.id = 'root';
        document.body.appendChild(container);

        root = createRoot(document.getElementById('root')),
        root.render(<App />);
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
