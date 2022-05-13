import * as fileSaver from 'file-saver';
import utils from './utils';

const addButtonClickListener = ({
    selector,
    contentType,
    filePath,
    fileName,
    convertToBlob,
    processRequest = () => null
}) => document.querySelector(selector).addEventListener('click', () => {
    const request = new XMLHttpRequest();
    processRequest(request);

    request.addEventListener('load', () =>
        fileSaver.saveAs(convertToBlob(request)(contentType), fileName));

    request.open('GET', filePath);
    request.send();
});

document.addEventListener('DOMContentLoaded', () => {
    addButtonClickListener({
        selector: '.zip',
        contentType: 'application/zip',
        fileName: 'archive.zip',
        filePath: './files/archive.zip',
        convertToBlob: request => utils.stringToBlob(request.response),
        processRequest: request => (request.responseType = 'arraybuffer')
    });

    addButtonClickListener({
        selector: '.wav',
        contentType: 'audio/wav',
        fileName: 'rington.wav',
        filePath: './files/base64',
        convertToBlob: request => utils.base64ToBlob(request.responseText)
    });
});
