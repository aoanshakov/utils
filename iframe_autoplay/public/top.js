document.addEventListener(
    'DOMContentLoaded',
    () => {
        const iframe = document.getElementsByTagName('iframe')[0];

        document.getElementsByTagName('button')[0].addEventListener(
            'click',
            () => iframe.contentWindow.postMessage('play', iframe.src)
        );
    } 
);
