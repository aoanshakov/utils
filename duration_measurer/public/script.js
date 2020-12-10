document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('record-request-button').addEventListener('click', function () {
        var url = document.getElementById('record-url-input').value,
            messageDisplay = document.getElementById('message-display');

        messageDisplay.style.display = 'block';

        if (!url) {
            messageDisplay.innerHTML = 'Введите URL записи.';
            return;
        }

        var request = new XMLHttpRequest();
        request.responseType = 'arraybuffer';

        request.open('GET', url, true);
        messageDisplay.innerHTML = 'Запрос отправлен.';
        document.getElementById('record-url-display').innerHTML = url;

        request.onload = function () {
            if (request.status != 200) {
                messageDisplay.innerHTML = 'Произошла ошибка при обработке запроса сервером.';
                console.log(request);
                return;
            }

            messageDisplay.innerHTML = 'Ответ получен. Происходит декодирование записи.';

            (new AudioContext()).decodeAudioData(this.response).then(function (buffer) {
                var secondsInMinute = 60,
                    secondsInHour = secondsInMinute * 60,
                    duration = buffer.duration,
                    hours = Math.floor(duration / secondsInHour),
                    remainder = duration % secondsInHour,
                    minutes = Math.floor(remainder / secondsInMinute),
                    seconds = Math.floor(remainder % secondsInMinute);

                document.getElementById('record-duration-display').innerHTML = (hours ? [hours] : []).concat(
                    [minutes, seconds].map(function (value) {
                        return value > 9 ? value : '0' + value;
                    })
                ).join(':');

                messageDisplay.innerHTML = 'Запись декодирована.';
            }).catch(function (error) {
                messageDisplay.innerHTML = 'Не удалось декодировать запись.';
                console.log(error);
            });
        };

        request.send();
        return true;
    });
});
