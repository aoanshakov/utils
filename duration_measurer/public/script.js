document.addEventListener('DOMContentLoaded', function () {
    var disabled = false,
        source;

    document.getElementById('record-request-button').addEventListener('click', function () {
        if (disabled) {
            return;
        }
        
        source && source.stop(0);
        disabled = true;

        var url = document.getElementById('record-url-input').value.trim(),
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

            var context = new AudioContext();

            context.decodeAudioData(this.response).then(function (buffer) {
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

                messageDisplay.innerHTML = 'Запись декодирована. Запись проигрывается.';
                disabled = false;

                source = context.createBufferSource();  

                source.addEventListener('ended', function () {
                    messageDisplay.innerHTML = 'Проигрывание записи завершено.';
                });

                source.buffer = buffer;
                source.connect(context.destination);
                source.start(0);
            }).catch(function (error) {
                messageDisplay.innerHTML = 'Не удалось декодировать запись.';
                console.log(error);
                disabled = false;
            });
        };

        request.addEventListener('error', function (error) {
            messageDisplay.innerHTML = 'Произошла ошибка при обработке запроса сервером.';
            console.log(error);
            disabled = false;
        });

        request.send();
        return true;
    });
});
