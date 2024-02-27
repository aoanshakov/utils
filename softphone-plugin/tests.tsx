import React, { useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryHistory } from 'history';

import Softphone from '@/Root';
import Popup from '@/popup/Root';
import IframeContent from '@/iframe/Root';
import Amocrm from '@/amocrm/Root';
import initialize from '@/background/initialize';

let root;

const Background = () => {
    useEffect(() => void initialize(), []);
    return <></>;
};

const history = createMemoryHistory();

const applications = {
    softphone: Softphone,
    popup: Popup,
    background: Background,
    iframeContent: IframeContent,
    amocrm: Amocrm,
    amocrmIframeContent: IframeContent,
};

window.application = {
    run({
        application = 'softphone',
        setHistory,
    }) {
        let rootStore;
        const Root = applications[application] || Softphone;
        setHistory(history);

        this.exit();

        const container = document.createElement('div');
        container.id = 'root';
        document.body.appendChild(container);

        root = createRoot(document.getElementById('root')),
        root.render(<Root history={history} />);
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
