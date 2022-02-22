import React from 'react';
import ReactDOM from 'react-dom';

export const getShadowRoot = (): HTMLElement => {
    return document.querySelector('#analytics');

    const parentEl = document.querySelector('#rootMain');

    if (!parentEl) return;

    let moduleEl = parentEl.querySelector('#analytics');

    if (!moduleEl) {
        moduleEl = document.createElement('div');
        moduleEl.setAttribute('id', 'analytics');

        parentEl.appendChild(moduleEl);

        moduleEl.attachShadow({ mode: 'open' });
    }

    return (moduleEl.shadowRoot as unknown) as HTMLElement;
};

const ShadowContent: React.FC = ({ children }) => {
    return <div id="analytics">{children}</div>;

    const shadowRoot = getShadowRoot();

    if (!shadowRoot) return null;

    return ReactDOM.createPortal(children, (shadowRoot as unknown) as Element);
};

export default ShadowContent;
