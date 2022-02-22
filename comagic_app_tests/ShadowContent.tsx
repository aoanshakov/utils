import React from 'react';
import ReactDOM from 'react-dom';

export const getShadowRoot = (): HTMLElement => document.querySelector('#analytics') || document.createElement('div');
const ShadowContent: React.FC = ({ children }) => <div id="analytics">{children}</div>;

export default ShadowContent;
