import React, { useRef, useCallback, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryHistory } from 'history';

import Softphone from '@/Root';
import Popup from '@/popup/Root';
import IframeContent from '@/iframe/Root';
import Amocrm from '@/amocrm/Root';
import initialize from '@/background/initialize';
import Application from '@/amocrm/Application';

let root;

const Background = () => {
    useEffect(() => void initialize(), []);
    return <></>;
};

const history = createMemoryHistory();

class Widget {
    private widgetActions;

    constructor() {
        this.reset();
    }

    add_action(name, callback) {
        this.widgetActions[name] = callback;
    }

    handleAction(name, ...args) {
        const action = this.widgetActions[name];
        action && action.apply(null, args);
    }

    reset() {
        this.widgetActions = {};
    }

    i18n(key) {
        const dictionary = {
            userLang: {
                login: 'Войти',
                logout: 'Выйти',
            },
        };

        return dictionary[key];
    }
}

window.widget = new Widget();

const Settings = ({ widget }) => {
    const ref = useRef();
    useEffect(() => widget.settings(ref.current), []);

    return <div className="widget-settings__wrap-desc-space">
        <div {...{ ref }} className="widget-settings">
            <div className="widget_settings_block__descr">
                Некое описание
            </div>
            <div className="widget_settings_block__controls_top">
                <button>Сохранить</button>
            </div>
        </div>
    </div>;
};

const applications = {
    softphone: Softphone,
    popup: Popup,
    background: Background,
    iframeContent: IframeContent,
    amocrm: Amocrm,
    amocrmIframeContent: IframeContent,
    settings: Settings,
};

const App = forwardRef(({ Root, ...props }, ref) => {
    const [areSettingsVisible, setSettingsVisibility] = useState(false);

    useImperativeHandle(
        ref,
        () => ({
            openSettings: () => setSettingsVisibility(true),
        }),
        [],
    );

    return <>
        <Root {...props} />
        {areSettingsVisible && <Settings {...props} />}
    </>;
});

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

        const widget = new Application(window.widget);

        root = createRoot(document.getElementById('root')),

        root.render(
            <App
                ref={handle => (this.openSettings = handle ? handle.openSettings : () => {
                    throw new Error('Рендеринг еще не завершился');
                })}

                {...{ Root, widget, history }}
            />
        );
    },

    openSettings() {
        throw new Error('Рендеринг еще не завершился');
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
