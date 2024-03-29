define(function () {
    function SentSipMessage (message, webSocket, uaOptions, lines, headers) {
        var textExpectations = new JsTester_TextExpectations(function (args) {
            var substring = args.substring,
                maybeNot = args.maybeNot,
                actualContent = args.actualContent;

            throw new Error(
                'SIP-сообщение ' + maybeNot + 'должно содержать ' +
                (typeof substring == 'string' ? 'подстроку' : 'подстроки') + ' "' +
                (typeof substring == 'string' ? substring : substring.join('", "')) + '", тогда, как оно содержит ' +
                'текст "' + actualContent + '".'
            );
        });

        message.split("\r\n").forEach(function (line) {
            lines.push(line);
        });

        var length = lines.length;
        
        if (!length) {
            throw new Error('Сообщение является пустым.');
        }

        for (i = 1; i < length; i ++) {
            var header = lines[i].trim();

            if (!header) {
                break;
            }

            var pair = header.split(':');

            if (pair.length < 2) {
                throw new Error('Строка "' + header + '" должна быть парой из ключа и значения, разделенных ' +
                    'двоеточием.');
            }

            var headerName = pair[0].trim();

            if (!headerName) {
                throw new Error('Ключ в строке "' + header + '" является пустым.');
            }

            headers[headerName] = header;
        }

        var contactHeader;

        if ((contactHeader = headers.Contact)) {
            uaOptions.username = contactHeader.match(/<sip:([a-zA-Z0-9\-_%]+)@/)[1];
        }

        function expectHeader (headerName, expectation) {
            var header = headers[headerName];

            if (!header) {
                throw new Error('Не найден заголовок с именем "' + headerName + '". Отправленное сообщение:' +
                    "\n\n" + message);
            }

            expectation(header, function (message) {
                throw new Error('Заголовок "' + headerName + '" должен ' + message + '".' + "\n\n" + 'Действительное ' +
                    'значение заголовка:' + "\n\n" + header + "\n\n");
            });
        }

        this.expectHeaderToHaveValue = function (headerName, expectedValue) {
            expectHeader(headerName, function (header, throwError) {
                if (header != expectedValue) {
                    throwError('иметь значение "' + expectedValue + '"');
                }
            });

            return this;
        };
        this.expectHeaderToContain = function (headerName, expectedValue) {
            expectHeader(headerName, function (header, throwError) {
                if (header.indexOf(expectedValue) == -1) {
                    throwError('содержать значение "' + expectedValue + '"');
                }
            });

            return this;
        };
        this.expectToHaveHeader = function (headerName) {
            if (!(headerName in headers)) {
                throw new Error('Заголовок "' + headerName + '" не найден в сообщении. Отправленное ' +
                    'сообщение:' + "\n\n" + message);
            }

            return this;
        };
        function getBody () {
            return (message.split("\r\n\r\n")[1] || '').trim();
        }
        this.expectBodyToHaveSubstringsConsideringOrder = function () {
            textExpectations.expectTextToHaveSubstringsConsideringOrder(
                getBody(),
                Array.prototype.slice.call(arguments, 0)
            );

            return this;
        };
        this.expectBodyNotToHaveSubstrings = function () {
            Array.prototype.slice.call(arguments, 0).forEach(function (expectedSubstring) {
                this.expectBodyNotToHaveSubstring(expectedSubstring);
            }.bind(this));

            return this;
        };
        this.expectBodyNotToHaveSubstring = function (expectedSubstring) {
            textExpectations.expectTextNotToHaveSubstring({
                actualContent: getBody(),
                substring: expectedSubstring
            });

            return this;
        };
        this.expectToHaveBody = function () {
            var expectedBody = Array.prototype.join.call(arguments, "\r\n").trim(),
                actualBody = getBody();

            if (actualBody != expectedBody) {
                throw new Error('Сообщение должно иметь такое тело: ' + "\n\n" + expectedBody + "\n\n" +
                    'Отправленное сообщение:' + "\n\n" + message);
            }

            return this;
        };
    }

    function SentSipRequest (message, webSocket, uaOptions, lastSessionId) {
        var lines = [],
            headers = {};

        SentSipMessage.apply(this, [message, webSocket, uaOptions, lines, headers]);

        var firstHeader = lines[0].trim(),
            result = firstHeader.split(' ');

        if (result.length < 2) {
            throw new Error('Первый заголовок "' + firstHeader + '" должен содержать метод и имя сервера.');
        }

        var method = result[0].trim(),
            serverName = result[1].trim();

        this.expectToHaveServerName = function (expectedServerName) {
            if (serverName != expectedServerName) {
                throw new Error('Сообщение должно быть отправлено на сервер "' + expectedServerName + '", а ' +
                    'не "' + serverName + '".');
            }

            return this;
        };
        this.expectToHaveMethod = function (expectedMethod) {
            if (method != expectedMethod) {
                throw new Error('Сообщение должно быть отправлено методом "' + expectedMethod + '", а не "' +
                    method + '".');
            }

            return this;
        };
        this.response = function () {
            return new SipResponseBuilder(headers, serverName, webSocket, uaOptions, lastSessionId);
        };
    }

    function SentSipResponse (message, webSocket, uaOptions, lastSessionId) {
        var lines = [],
            headers = {};

        SentSipMessage.apply(this, [message, webSocket, uaOptions, lines, headers]);

        var firstHeader = lines[0].trim(),
            result = firstHeader.split(' ');

        if (result.length < 2) {
            throw new Error('Первый заголовок "' + firstHeader + '" должен содержать статус.');
        }

        var status = parseInt(result[1].trim(), 0);

        this.expectOk = function () {
            if (status != 200) {
                throw new Error('Сообщение, должно иметь статус "200 OK". Отправленное сообщение:' +
                    "\n\n" + message);
            }

            return this;
        };
        this.expectTrying = function () {
            if (status != 100) {
                throw new Error('Сообщение, должно иметь статус "100 Trying". Отправленное сообщение:' +
                    "\n\n" + message);
            }

            return this;
        };
        this.expectTemporarilyUnavailable = function () {
            if (status != 480) {
                throw new Error('Сообщение, должно иметь статус "480 Temporarily Unavailable". Отправленное ' +
                    'сообщение:' + "\n\n" + message);
            }

            return this;
        };
        this.expectRequestTerminated = function () {
            if (status != 487) {
                throw new Error('Сообщение, должно иметь статус "480 Request Terminated". Отправленное ' +
                    'сообщение:' + "\n\n" + message);
            }

            return this;
        };
        this.expectRinging = function () {
            if (status != 180) {
                throw new Error('Сообщение, должно иметь статус "180 Ringing". Отправленное сообщение:' +
                    "\n\n" + message);
            }

            return this;
        };
        this.expectBusy = function () {
            if (status != 486) {
                throw new Error('Сообщение, должно иметь статус "486 Busy". Отправленное сообщение:' +
                    "\n\n" + message);
            }

            return this;
        };
        this.expectToHaveServerName = function (expectedServerName) {
            if (serverName != expectedServerName) {
                throw new Error('Сообщение должно быть отправлено на сервер "' + expectedServerName + '", а ' +
                    'не "' + serverName + '".');
            }

            return this;
        };
        this.expectToHaveMethod = function (expectedMethod) {
            if (method != expectedMethod) {
                throw new Error('Сообщение должно быть отправлено методом "' + expectedMethod + '", а не "' +
                    method + '".');
            }

            return this;
        };
        this.request = function () {
            return new ReceivedSipMessage(webSocket, uaOptions, headers, lastSessionId);
        };
    }

    function randomString (length) {
       var result = '',
           characters = 'abcdefghijklmnopqrstuvwxyz0123456789',
           charactersCount = characters.length;

       for (var i = 0; i < length; i++) {
          result += characters.charAt(Math.floor(Math.random() * charactersCount));
       }

       return result;
    }

    function SipResponseBuilder (requestHeaders, serverName, webSocket, uaOptions, lastSessionId) {
        var status = '200 Ok',
            headers = [],
            toHeader = requestHeaders.To,
            toTag,
            requestHasNoToTag = false,
            tasks = [],
            body = "\r\n",
            contentLength = 0;

        toHeader.split(';').forEach(function (item) {
            var pair = item.trim().split('=');

            if (pair.length == 2 && pair[0].trim() == 'tag') {
                toTag = pair[1];
            }
        });

        if (!toTag) {
            requestHasNoToTag = true;
            toTag = randomString(32);
        }

        function getHeaderValue (header) {
            return header.split(':').slice(1).join(':');
        }
        function getToHeader () {
            return requestHasNoToTag ? (toHeader + ';tag=' + toTag) : toHeader;
        };
        this.setUnauthorized = function () {
            status = '401 Unauthorized';
            return this;
        };
        this.setRinging = function () {
            status = '180 Ringing';
            return this;
        };
        this.setBusy = function () {
            status = '486 Busy';
            return this;
        };
        this.setOk = function () {
            status = '200 Ok';
            return this;
        };
        this.setSessionProgress = function () {
            status = '183 Session Progress';
            return this;
        };
        this.setTrying = function () {
            status = '100 Trying';
            return this;
        };
        this.setForbidden = function () {
            status = '403 Forbidden';
            return this;
        };
        this.setBody = function (value) {
            body = value;
            contentLength = body.length;
            return this;
        };
        this.setToTag = function (value) {
            toTag = value;
            return this;
        };
        this.getToTag = function () {
            return toTag;
        };
        this.copyHeader = function (headerName) {
            headers.push(requestHeaders[headerName]);
            return this;
        };
        this.addHeader = function (header) {
            tasks.push(function () {
                header = header.replace('{server_name}', serverName.split(':')[1]);
                header = header.replace('{to_tag}', toTag);
                headers.push(header);
            });

            return this;
        };
        this.request = function () {
            return new ReceivedSipMessage(webSocket, uaOptions, {
                'Call-ID': requestHeaders['Call-ID'],
                From: 'From: ' + getHeaderValue(getToHeader()),
                To: 'To: ' + getHeaderValue(requestHeaders.From)
            }, lastSessionId);
        };
        this.send = function () {
            tasks.forEach(function (executeTask) {
                executeTask();
            });

            var lines = [
                'SIP/2.0 ' + status,
                requestHeaders.Via + ';received=10.81.21.122',
                requestHeaders.From,
                getToHeader(),
                requestHeaders['Call-ID'],
                requestHeaders.CSeq
            ];

            lines = lines.concat(headers).concat([
                'Server: TS-v4.7.3-16',
                'Content-Length: ' + contentLength
            ]);

            webSocket.receiveMessage(lines.join("\r\n") + "\r\n\r\n" + body);
        };
    }

    function ReceivedSipMessage (webSocket, uaOptions, lastHeaders, lastSessionId) {
        var method,
            serverName,
            callReceiverName = '',
            callReceiverLogin,
            body,
            contentType,
            headers = [],
            fromHeader = lastHeaders ? lastHeaders.From : '',
            toHeader;

        this.setMethod = function (value) {
            method = value;
            return this;
        };
        this.setServerName = function (value) {
            serverName = value;
            return this;
        };
        this.setCallReceiverName = function (value) {
            callReceiverName = ' "' + value + '"';
            return this;
        };
        this.setCallReceiverLogin = function (value) {
            callReceiverLogin = value;
            return this;
        };
        this.setBody = function () {
            body = Array.prototype.slice.call(arguments, 0).join('\r\n');
            return this;
        };
        this.setSdpType = function () {
            contentType = 'application/sdp';
            return this;
        };
        this.addHeader = function (header) {
            var pair = header.split(':'),
                name = pair[0].trim();

            if (name == 'From') {
                fromHeader = header;
            } else if (name == 'To') {
                toHeader = header;
            } else {
                headers.push(header);
            }

            return this;
        };
        this.copyHeader = function (name) {
            headers.push(lastHeaders[name]);
            return this;
        };
        this.receive = function () {
            fromHeader = fromHeader || 'From: "Ivanov Ivan Ivanovich" <sip:invanov@somedomain.com>';

            if (!/\btag=/.test(fromHeader)) {
                fromHeader += ';tag=' + randomString(32);
            }

            var callId = lastHeaders && lastHeaders['Call-ID'] ? lastHeaders['Call-ID'] : 'Call-ID: ' +
                randomString(22);

            lastSessionId.set(callId.match(/Call-ID: ([0-9a-zA-Z]+)/)[1] + fromHeader.match(/\btag=([0-9a-zA-Z]+)/)[1]);

            var lines = [
                method + ' sip:' + uaOptions.username + '@' + serverName  + ' SIP/2.0',
                lastHeaders && lastHeaders.Via ? lastHeaders.Via : (
                    'Via: SIP/2.0/WSS 9jb2r27il5un.invalid;branch=z9hG4bK' + randomString(10)
                ),
                fromHeader,
                (toHeader ? toHeader : (lastHeaders && lastHeaders.To ? lastHeaders.To : (
                    'To:' + callReceiverName + ' <sip:' + callReceiverLogin + '@' + serverName + '>'
                ))),
                callId,
                'CSeq: 1 ' + method
            ];

            lines = lines.concat(headers);

            if (body) {
                lines.push(
                    'Content-Type: ' + contentType
                );
            }

            lines = lines.concat([
                '',
                body
            ]);
            
            webSocket.receiveMessage(lines.join("\r\n"));
        };
    }

    return function (webSocket) {
        var uaOptions = {};

        var lastSessionId = (function () {
            var value;

            return {
                set: function (newValue) {
                    value = newValue;
                },
                get: function () {
                    return value;
                }
            };
        })();

        this.recentResponse = function () {
            return new SentSipResponse(webSocket.popRecentlySentMessage(), webSocket, uaOptions, lastSessionId);
        };
        this.recentRequest = function () {
            return new SentSipRequest(webSocket.popRecentlySentMessage(), webSocket, uaOptions, lastSessionId);
        };
        this.request = function () {
            return new ReceivedSipMessage(webSocket, uaOptions, null, lastSessionId);
        };
        this.lastSessionId = function () {
            return lastSessionId.get();
        };
    };
});
