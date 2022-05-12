let handleSoundsLoaded = () => null,
    play = () => null;

window.addEventListener('message', event => {
    if (event.data != 'play') {
        return;
    }

    handleSoundsLoaded = () => play();
    play();
});

document.addEventListener('DOMContentLoaded', () => {
    const request = new XMLHttpRequest();

    const throwError = () => {
        throw new Error('Не удалось получить звуки.');
    };

    const parse = response => {
        try {
            return JSON.parse(response) || {};
        } catch (e) {
            return {};
        }
    };

    request.open('GET', '/public/defaultSounds.json', true);

    request.onload = function () {
        if (request.status != 200) {
            throwError();
            return;
        }

        const {busySignal} = parse(this.responseText);

        if (!busySignal) {
            throwError();
        }

        play = () => (new Audio(busySignal)).play();
        handleSoundsLoaded();
    };

    request.addEventListener('error', throwError);
    request.send();
});
