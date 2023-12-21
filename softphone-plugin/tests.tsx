import React, { useCallback, useState } from 'react';
import { createRoot } from 'react-dom/client';

import Root from '@/Root';
let root;

window.application = {
    run() {
        let rootStore;

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
