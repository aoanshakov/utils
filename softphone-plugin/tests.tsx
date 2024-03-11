import React, { useRef, useCallback, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryHistory } from 'history';

import Softphone from '@/chrome/content/Root';
import Popup from '@/chrome/popup/Root';
import initialize from '@/chrome/background/initialize';

import Amocrm from '@/amocrm/parent/Root';
import Application from '@/amocrm/parent/Application';

import IframeContent from '@/iframeContent/Root';

let root;

const Background = () => {
    useEffect(() => void initialize(), []);
    return <></>;
};

const history = createMemoryHistory();

class Widget {
    private widgetActions;
    private settings;

    constructor(active) {
        this.widgetActions = {};

        this.settings = {
            finished: active ? 'Y' : 'N',
            id: 1022170,
            status: 'installed',
            widget_code: 'qxxjueyui7po3xx7xhiw52sy9kzy1pxnfjgofuit',
            path: '/upl/qxxjueyui7po3xx7xhiw52sy9kzy1pxnfjgofuit/widget',
            version: '1.0.0',
            oauth_client_uuid: 'e4830af5-279e-440b-a955-18a3cf60fd3c',
            widget_active: 'Y',
            images_path: '/upl/qxxjueyui7po3xx7xhiw52sy9kzy1pxnfjgofuit/widget/images',
            support: [],
        };
    }

    get_settings() {
        return this.settings;
    }

    add_action(name, callback) {
        this.widgetActions[name] = callback;
    }

    handleAction(name, ...args) {
        const action = this.widgetActions[name];
        action && action.apply(null, args);
    }

    i18n(key) {
        const dictionary = {
            userLang: {
                install: 'Завершить установку',
                settings: 'Перейти к настройкам',
            },
        };

        return dictionary[key];
    }
}

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
    chatsIframe: IframeContent,
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
        active = false,
        setHistory,
    }) {
        let rootStore;
        const Root = applications[application] || Softphone;
        setHistory(history);

        this.exit();

        const container = document.createElement('div');
        container.id = 'root';
        document.body.appendChild(container);

        window.widget = new Widget(active);
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
