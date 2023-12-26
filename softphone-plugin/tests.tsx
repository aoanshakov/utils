import React, { useCallback, useState } from 'react';
import { createRoot } from 'react-dom/client';

import Softphone from '@/Root';
import Popup from '@/popup/Root';
let root;

const applications = {
    softphone: Softphone,
    popup: Popup
};

window.application = {
    run(application = 'softphone') {
        let rootStore;
        const Root = applications[application] || Softphone;

        this.exit();

        const container = document.createElement('div');
        container.id = 'root';
        document.body.appendChild(container);

        root = createRoot(document.getElementById('root')),
        root.render(<Root />);
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
