function JsTester_Factory () {
    this.createDebugger = function () {
        return new JsTester_Debugger();
    };
    this.createUtils = function (debug) {
        return new JsTester_Utils(debug);
    };
    this.createDomElementTester = function (
        domElement, wait, utils, testersFactory, gender, nominativeDescription, accusativeDescription,
        genetiveDescription
    ) {
        return new JsTester_DomElement(domElement, wait, utils, testersFactory, gender, nominativeDescription,
            accusativeDescription, genetiveDescription);
    };
    this.admixDomElementTester = function (me, args) {
        JsTester_DomElement.apply(me, args);
    };
    this.createTestersFactory = function (wait, utils) {
        return new JsTester_TestersFactory(wait, utils, this);
    };
    this.createGender = function () {
        return {
            female: {
                should: 'должна',
                hidden: 'скрытой',
                visible: 'видимой',
                disabled: 'заблокированной',
                enabled: 'доступной',
                masked: 'маскированной',
                pronoun: 'она',
                checked: 'отмечена',
                readonly: 'недоступна'
            },
            male: {
                should: 'должен',
                hidden: 'скрытым',
                visible: 'видимым',
                disabled: 'заблокированным',
                enabled: 'доступным',
                masked: 'маскированным',
                pronoun: 'он',
                checked: 'отмечен',
                readonly: 'недоступен'
            },
            neuter: {
                should: 'должно',
                hidden: 'скрытым',
                visible: 'видимым',
                disabled: 'заблокированным',
                enabled: 'доступным',
                masked: 'маскированным',
                pronoun: 'оно',
                checked: 'отмечено',
                readonly: 'недоступно'
            }
        };
    };
}

function JsTester_Logger () {
    var log,
        trace;

    this.trace = function () {
        trace();
    };
    this.log = function () {
        log.apply(null, arguments);
    };
    this.enable = function () {
        log = function () {
            console.trace.apply(console, arguments);
        };

        trace = function () {
            console.trace();
        };
    };
    this.disable = function () {
        log = trace = function () {};
    };

    this.disable();
}

function JsTester_UserMediaEventHandlersItem (handleSuccess, handleError, callStack) {
    this.handleSuccess = function (stream) {
        handleSuccess(stream);
    };
    this.handleError = function (error) {
        handleError(error);
    };
    this.getCallStack = function () {
        return callStack;
    };
}

function JsTester_Queue (emptyValue) {
    var emptyItem = new JsTester_EmptyQueueItem(emptyValue),
        lastItem = emptyItem;
    
    this.forEach = function (callback) {
        var currentItem = lastItem;

        while (currentItem != emptyItem) {
            callback(currentItem.getValue());
            currentItem = currentItem.getPrevious();
        }
    };
    this.add = function (value) {
        lastItem = new JsTester_QueueItem(lastItem, value);
    };
    this.pop = function () {
        var value = lastItem.getValue();
        lastItem = lastItem.getPrevious();
        return value;
    };
    this.isEmpty = function () {
        return lastItem === emptyItem;
    };
    this.removeAll = function () {
        lastItem = emptyItem;
    };

    this.removeAll();
}

function JsTester_EmptyQueueItem (emptyValue) {
    this.getPrevious = function () {
        return new JsTester_EmptyQueueItem(emptyValue);
    };
    this.getValue = function () {
        return emptyValue;
    };
}

function JsTester_QueueItem (previous, value) {
    this.getPrevious = function () {
        return previous;
    };
    this.getValue = function () {
        return value;
    };
}

function JsTester_UserMediaEventHandlers (debug) {
    function throwNoUserMediaRequested () {
        throw new Error('Ввод медиа-данных должен быть запрошен.');
    }

    var handlers = new JsTester_Queue(new JsTester_UserMediaEventHandlersItem(throwNoUserMediaRequested,
        throwNoUserMediaRequested));

    this.addHandlers = function (successHandler, errorHandler) {
        handlers.add(new JsTester_UserMediaEventHandlersItem(successHandler, errorHandler, debug.getCallStack()));
    };
    this.handleSuccess = function (stream) {
        handlers.pop().handleSuccess(stream);
    };
    this.handleError = function (error) {
        handlers.pop().handleError(error);
    };
    this.assertNoUserMediaRequestLeftUnhandled = function (exceptions) {
        if (!handlers.isEmpty()) {
            exceptions.push(new Error('Запрос медиа-данных должен быть обработан. Стэк вызовов:' +
                handlers.pop().getCallStack() + "\n\n"));
        }
    };
}

function JsTester_UserMedia (eventHandlers) {
    this.allowMediaInput = function () {
        eventHandlers.handleSuccess(new MediaStream());
    };
    this.disallowMediaInput = function () {
        eventHandlers.handleError(new DOMException('Permission denied by system', 'NotAllowedError'));
    };
}

function JsTester_UserMediaGetter (eventHandlers) {
    return function (constraints, successHandler, errorHandler) {
        successHandler = successHandler || function() {};
        errorHandler = errorHandler || function() {};

        eventHandlers.addHandlers(function (stream) {
            successHandler(stream);
        }, function (error) {
            errorHandler(error);
        });
    };
}

function JsTester_MediaDevicesUserMediaGetter (eventHandlers) {
    return function (constraints) {
        return new Promise(function (resolve, reject) {
            eventHandlers.addHandlers(function (stream) {
                resolve(stream);
            }, function (error) {
                reject(error);
            });
        });
    };
}

function JsTester_NavigatorMock (getUserMedia, getMediaDevicesUserMedia) {
    var me = this,
        navigator = window.navigator;

    Object.defineProperty(window, 'navigator', {
        get: function () {
            return me;
        },
        set: function () {}
    });

    this.mediaDevices = {
        getUserMedia: getMediaDevicesUserMedia,
        addEventListener: function () {}
    };

    this.getUserMedia = getUserMedia;
    this.userAgent = navigator.userAgent;
}

function JsTester_RTCConnectionSender () {
    this.replaceTrack = function () {
    };
}

function JsTester_MediaStream () {
    this.getAudioTracks = function () {
        return [{}];
    };
}

function JsTester_RTCPeerConnection (options) {
    var connections = options.connections,
        rtcMediaStreams = options.rtcMediaStreams;

    return function () {
        var remoteStream = new JsTester_MediaStream(),
            localStream = new JsTester_MediaStream(),
            sender = new JsTester_RTCConnectionSender();

        rtcMediaStreams.set(remoteStream, this);
        rtcMediaStreams.set(localStream, this);

        this.iceConnectionState = 'new';

        var eventHandlers = {};
        connections.push([eventHandlers, this]);

        this.addEventListener = function (eventName, handler) {
            if (!eventHandlers[eventName]) {
                eventHandlers[eventName] = [];
            }

            handler.handlerFunctionId = eventHandlers[eventName].length;
            eventHandlers[eventName].push(handler);
        };
        this.removeEventListener = function (eventName, handler) {
            if (!handler.handlerFunctionId || !eventHandlers[eventName]) {
                return;
            }

            eventHandlers[eventName][handler.handlerFunctionId] = function () {};
        };
        this.setRemoteDescription = function (sessionDescription) {
            return new Promise(function (resolve) {
                resolve();
            });
        };
        this.setLocalDescription = function (sessionDescription) {
            var me = this;
            return new Promise(function (resolve) {
                me.localDescription = sessionDescription;
                resolve();
            });
        };
        this.createAnswer = function () {
            return new Promise(function (resolve) {
                resolve(new RTCSessionDescription());
            });
        };
        this.createOffer = function () {
            this.iceGatheringState = 'complete';

            return new Promise(function (resolve) {
                resolve(new RTCSessionDescription());
            });
        };
        this.getLocalStreams = function () {
            return [localStream];
        };
        this.getRemoteStreams = function () {
            return [remoteStream];
        };
        this.getSenders = function () {
            return [sender];
        };
        this.close = function () {
            this.iceConnectionState = 'closed';

            var handlers = eventHandlers.iceconnectionstatechange;

            if (handlers) {
                handlers.forEach(function (handler) {
                    handler();
                });
            }
        };
    };
}

function JsTester_FunctionVariable (value) {
    this.setValue = function (v) {
        value = v;
    };

    this.createValueCaller = function () {
        return function () {
            value.apply(null, arguments);
        };
    };
}

function JsTester_RTCPeerConnectionTester (options) {
    var eventHandlers = options.eventHandlers,
        connection = options.connection,
        index = options.index;

    function handleEvent (eventName, args) {
        var handlers = eventHandlers[eventName];
        
        if (handlers) {
            handlers.forEach(function (handler) {
                handler.apply(null, args);
            });
        }
    }
    this.addRemoteStreamPlayingExpectation = function (streamPlayingExpectations) {
        return streamPlayingExpectations.add(connection.getRemoteStreams()[0]);
    };
    this.expectToBeConnected = function () {
        var actualState = connection.iceConnectionState;

        if (actualState != 'connected') {
            throw new Error(index + '-ое RTC соединение должно быть подключенным, тогда как оно имеет состояние "' +
                actualState + '".');
        }
    };
    this.expectToBeClosed = function () {
        var actualState = connection.iceConnectionState;

        if (actualState != 'closed') {
            throw new Error(index + '-ое RTC соединение должно быть закрытым, тогда как оно имеет состояние "' +
                actualState + '".');
        }
    };
    this.addCandidate = function () {
        handleEvent('icecandidate', [{}]);
    };
    this.connect = function () {
        var iceConnectionState = connection.iceConnectionState;

        if (iceConnectionState != 'new') {
            throw new Error('Не удается подключить ' + index + '-ое RTC-соединение, так как оно имеет состояние "' +
                iceConnectionState + '".');
        }

        connection.iceConnectionState = 'connected';
        handleEvent('iceconnectionstatechange', []);
    };
}

function JsTester_RTCPeerConnections (options) {
    var connections = options.connections,
        stateChecker = options.stateChecker;

    this.getConnectionAtIndex = function (index) {
        var connectionsCount = connections.length;

        if (index >= connectionsCount) {
            throw new Error('Всего было создано ' + connectionsCount + ' RTC-соединений, тогда как их должно быть ' +
                'как минимум ' + (index + 1) + '.');
        }

        var options = connections[index];

        return new JsTester_RTCPeerConnectionTester({
            eventHandlers: options[0],
            connection: options[1],
            index: index
        });
    };
    this.dontCheckState = function () {
        stateChecker.setValue(function () {});
    };
}

function JsTester_RTCPeerConnectionMocker (options) {
    var connections = options.connections,
        rtcConnectionStateChecker = options.rtcConnectionStateChecker,
        rtcMediaStreams = options.rtcMediaStreams,
        RealRCTPreerConnection = RTCPeerConnection,
        RTCPeerConnectionMock = new JsTester_RTCPeerConnection({
            connections: connections,
            rtcMediaStreams: rtcMediaStreams
        }),
        checkConnectionState = new JsTester_RTCConnectionStateChecker(connections);

    this.replaceByFake = function () {
        connections.splice(0, connections.length);
        rtcConnectionStateChecker.setValue(checkConnectionState);
        RTCPeerConnection = RTCPeerConnectionMock;
    };
    this.restoreReal = function () {
        RTCPeerConnection = RealRCTPreerConnection;
    };
}

function JsTester_Storage () {
    var keys,
        values,
        keyToIndex;
    
    this.setItemInAnotherTab = function (key, value) {
        var oldValue = values[key];

        this.setItem(key, value);

        window.dispatchEvent(new StorageEvent('storage', {
            key: key,
            oldValue: oldValue,
            newValue: value
        }));
    };
    this.setItem = function (key, value) {
        if (!(key in values)) {
            var index = keys.length;
            keys.push(key);
            keyToIndex[key] = index;
        }

        values[key] = value;
    };
    this.getItem = function (key) {
        return values[key] || null;
    };
    this.removeItem = function (key) {
        if (!(key in values)) {
            return;
        }

        keys.splice(keyToIndex[key], 1);
        delete(keyToIndex[key]);
        delete(values[key]);
    };
    this.clear = function () {
        keys = [];
        values = {};
        keyToIndex = {};
    };
    this.key = function (index) {
        return keys[index];
    };

    Object.defineProperty(this, 'length', {
        get: function () {
            return keys.length;
        },
        set: function () {}
    });

    this.clear();
}

function JsTester_StorageMocker () {
    var realLocalStorage = window.localStorage,
        currentLocalStorage,
        realSessionStorage = window.sessionStorage,
        currentSessionStorage;

    Object.defineProperty(window, 'localStorage', {
        get: function () {
            return currentLocalStorage;
        },
        set: function () {}
    });

    Object.defineProperty(window, 'sessionStorage', {
        get: function () {
            return currentSessionStorage;
        },
        set: function () {}
    });

    this.replaceByFake = function () {
        currentLocalStorage = new JsTester_Storage();
        currentSessionStorage = new JsTester_Storage();
    };
    this.restoreReal = function () {
        currentLocalStorage = realLocalStorage;
        currentSessionStorage = realSessionStorage;
    };
}

function JsTester_RTCConnectionStateChecker (connections) {
    return function (exceptions) {
        if (connections.some(function (connection) {
            return connection[1].iceConnectionState == 'new';
        })) {
            exceptions.push(new Error('Было создано RTC соединение, которое еще не было подключено'));
        }
    };
}

function JsTester_Audio (options) {
    var audioTracks = options.audioTracks,
        debug = options.debug;

    var audioTrackOptions = {
        stream: options.stream,
        audio: this,
        playing: false
    };

    audioTracks.push(audioTrackOptions);

    Object.defineProperty(this, 'srcObject', {
        get : function () {
            return audioTrackOptions.stream;
        },
        set: function (value) {
            audioTrackOptions.stream = value;
        }
    });     

    this.addEventListener = function () {
    };
    this.removeEventListener = function () {
    };
    this.play = function () {
        audioTrackOptions.playing = true;
        audioTrackOptions.callStack = debug.getCallStack();
        return Promise.resolve();
    };
    this.pause = function () {
        audioTrackOptions.playing = false;
        return Promise.resolve();
    };
}

function JsTester_AudioReplacer (options) {
    var audioTracks = options.audioTracks,
        debug = options.debug,
        realAudio = window.Audio;

    this.replaceByFake = function () {
        window.Audio = function (stream) {
            return new JsTester_Audio({
                audioTracks: audioTracks,
                debug: debug,
                stream: stream
            });
        };
    };
    this.restoreReal = function () {
        window.Audio = realAudio;
    };
}

function JsTester_StreamsPlayingExpectaion (options) {
    var streams = [],
        audioTracks = options.audioTracks,
        rtcMediaStreams = options.rtcMediaStreams;

    this.add = function (stream) {
        streams.push(stream);
        return this;
    };
    this.expect = function () {
        var map = new Map();

        audioTracks.forEach(function (track) {
            var stream = track.stream;

            if (!map.has(stream)) {
                map.set(stream, []);
            }

            map.get(stream).push(track);
        });

        map.forEach(function (tracks, stream) {
            var playing = false,
                callStack;

            tracks.forEach(function (track) {
                if (track.playing && (
                    !rtcMediaStreams.has(track.stream) ||
                    rtcMediaStreams.get(track.stream).iceConnectionState == 'connected'
                )) {
                    if (playing) {
                        throw new Error(
                            'Два одинаковых звука звучат одновременно. Возможно здесь что-то не так.'
                        );
                    }

                    playing = true;
                    callStack = track.callStack;
                }
            });

            if (streams.includes(stream)) {
                if (!playing) {
                    throw new Error('Звук должен звучать.');
                }
            } else {
                if (playing) {
                    throw new Error(
                        'Звук не должен звучать. Обрати внимание на этот стек вызовов, чтобы понять почему звук ' +
                        'зазвучал.' + "\n\n" + callStack
                    );
                }
            }
        });
    };
}

function JsTester_StreamsPlayingExpectaionFactory (options) {
    return function () {
        return new JsTester_StreamsPlayingExpectaion(options);
    };
}

function JsTester_MediaStreamSource (stream) {
    this.connect = function () {
    };
}

function JsTester_Gain () {
    var value;

    this.connect = function () {
    };

    Object.defineProperty(this, 'gain', {
        get: function () {
            var gain = {};

            Object.defineProperty(gain, 'value', {
                get: function () {
                    return value;
                },
                set: function (newValue) {
                    value = newValue;
                }
            });

            return gain;
        },
        set: function () {}
    });     
}

function JsTester_MediaStreamDestination () {
    var stream = new JsTester_MediaStream();

    Object.defineProperty(this, 'stream', {
        get: function () {
            return stream;
        },
        set: function () {}
    });     
}

function JsTester_AudioContextMock () {
    this.createMediaStreamSource = function (stream) {
        return new JsTester_MediaStreamSource(stream);
    };
    this.createGain = function () {
        return new JsTester_Gain();
    };
    this.createMediaStreamDestination = function () {
        return new JsTester_MediaStreamDestination();
    };
}

function JsTester_AudioContextReplacer () {
    var RealAudioContext = window.AudioContext;

    this.replaceByFake = function () {
        window.AudioContext = JsTester_AudioContextMock;
    };
    this.restoreReal = function () {
        window.AudioContext = RealAudioContext;
    };
}

function JsTester_Tests (factory) {
    var testRunners = [],
        requiredClasses = [],
        storageMocker = new JsTester_StorageMocker(),
        timeoutLogger = new JsTester_Logger(),
        timeout = new JsTester_Timeout('setTimeout', 'clearTimeout', JsTester_OneTimeDelayedTask, timeoutLogger),
        interval = new JsTester_Timeout('setInterval', 'clearInterval', JsTester_DelayedTask, timeoutLogger),
        debug = factory.createDebugger(),
        utils = factory.createUtils(debug),
        requestsManager = new JsTester_RequestsManager(utils, debug),
        windowOpener = new JsTester_WindowOpener(utils),
        webSocketLogger = new JsTester_Logger(),
        webSocketFactory = new JsTester_WebSocketFactory(utils, webSocketLogger, debug),
        webSockets = webSocketFactory.createCollection(),
        webSocketReplacer = new JsTester_WebSocketReplacer(webSocketFactory),
        userMediaEventHandlers = new JsTester_UserMediaEventHandlers(debug),
        mediaDevicesUserMediaGetter = new JsTester_MediaDevicesUserMediaGetter(userMediaEventHandlers),
        userMediaGetter = new JsTester_UserMediaGetter(userMediaEventHandlers),
        userMedia = new JsTester_UserMedia(userMediaEventHandlers),
        navigatorMock = new JsTester_NavigatorMock(userMediaGetter, mediaDevicesUserMediaGetter),
        rtcConnectionStateChecker = new JsTester_FunctionVariable(function () {}),
        rtcConnections = [],
        audioTracks = [],
        rtcMediaStreams = new Map(),
        rtcPeerConnectionMocker = new JsTester_RTCPeerConnectionMocker({
            connections: rtcConnections,
            rtcConnectionStateChecker: rtcConnectionStateChecker,
            rtcMediaStreams: rtcMediaStreams
        }),
        rtcConnectionsMock = new JsTester_RTCPeerConnections({
            connections: rtcConnections,
            stateChecker: rtcConnectionStateChecker
        }),
        testsExecutionBeginingHandlers = [],
        checkRTCConnectionState = rtcConnectionStateChecker.createValueCaller(),
        streamPlayingExpectaionFactory = new JsTester_StreamsPlayingExpectaionFactory({
            audioTracks: audioTracks,
            rtcMediaStreams: rtcMediaStreams
        }),
        audioReplacer = new JsTester_AudioReplacer({
            audioTracks: audioTracks,
            debug: debug
        }),
        audioContextReplacer = new JsTester_AudioContextReplacer();

    audioReplacer.replaceByFake();

    window.URL.createObjectURL = function (object) {
        return 'http://127.0.0.1/#' + object.id;
    };

    window.moment = function () {
        return {
            format: function () {
                return '05:32';
            }
        };
    };

    var wait = function () {
        if (arguments[0]) {
            var repetitionsCount = arguments[0], i;

            for (i = 0; i < repetitionsCount; i ++) {
                wait();
            }

            return;
        }

        timeout.runCallbacks();
        interval.runCallbacks();
    };

    var spendTime = function (time) {
        timeout.spendTime(time);
        interval.spendTime(time);
    };

    this.exposeDebugUtils = function (variableName) {
        window[variableName] = debug;
    };
    this.addTest = function (testRunner) {
        testRunners.push(testRunner);
    };
    this.runTests = function (options) {
        var testersFactory;
        options = options || {};
        
        try {
            testersFactory = factory.createTestersFactory(wait, utils);
        } catch(e) {
            error = e;
        }

        var args = {
            ajax: requestsManager,
            testersFactory: testersFactory,
            wait: wait,
            spendTime: spendTime,
            utils: utils,
            windowOpener: windowOpener,
            webSockets: webSockets,
            webSocketLogger: webSocketLogger,
            userMedia: userMedia,
            rtcConnectionsMock: rtcConnectionsMock,
            navigatorMock: navigatorMock,
            timeoutLogger: timeoutLogger,
            createStreamPlayingExpectation: streamPlayingExpectaionFactory
        };

        (function () {
            var name;

            for (name in options) {
                args[name] = options[name];
            }
        })();

        this.handleBeginingOfTestsExecution(args);

        testRunners.forEach(function (runTest) {
            runTest.call(null, args);
        });
    };
    this.requireClass = function (className) {
        requiredClasses.push(className);
    };
    this.runBeforeTestsExecution = function (handleBeginingOfTestsExecution) {
        testsExecutionBeginingHandlers.push(handleBeginingOfTestsExecution);
    };
    this.handleBeginingOfTestsExecution = function (args) {
        testsExecutionBeginingHandlers.forEach(function (handleBeginingOfTestsExecution) {
            handleBeginingOfTestsExecution.call(null, args);
        });
    };
    this.getRequiredClasses = function () {
        return requiredClasses;
    };
    this.beforeEach = function () {
        rtcMediaStreams.clear();
        audioContextReplacer.replaceByFake();
        audioTracks.splice(0, audioTracks.length);
        storageMocker.replaceByFake();
        rtcPeerConnectionMocker.replaceByFake();
        webSocketReplacer.replaceByFake();
        requestsManager.createAjaxMock();
        timeout.replaceByFake();
        interval.replaceByFake();
        windowOpener.replaceByFake();
    };
    this.restoreRealDelayedTasks = function () {
        timeout.restoreReal();
        interval.restoreReal();
    };
    this.afterEach = function () {
        var exceptions = [];

        audioContextReplacer.restoreReal();
        checkRTCConnectionState(exceptions);
        storageMocker.restoreReal();
        rtcPeerConnectionMocker.restoreReal();
        userMediaEventHandlers.assertNoUserMediaRequestLeftUnhandled(exceptions);
        requestsManager.destroyAjaxMock(exceptions);
        windowOpener.restoreReal();
        webSockets.expectWasConnected(exceptions);
        webSockets.expectNoMessageToBeSent(exceptions);
        webSocketReplacer.restoreReal();

        exceptions.forEach(function (exception) {
            throw exception;
        });
    };
}

function JsTester_TestersFactory (wait, utils, factory) {
    var gender = factory.createGender(),
        female = gender.female,
        neuter = gender.neuter,
        male = gender.male;

    this.createAnchorTester = function (domElement, text) {
        return new JsTester_Anchor(domElement, wait, utils, this, female, 'ссылка с текстом "' + text + '"',
            'JsTester_AudioMockerссылку с текстом "' + text + '"', 'ссылки с текстом "' + text + '"', factory);
    };
    this.createTextFieldTester = function (domElement, label) {
        var getDomElement = utils.makeFunction(domElement);

        return new JsTester_InputElement(getDomElement, wait, utils, this, neuter,
            utils.fieldDescription('текстовое поле', label),
            utils.fieldDescription('текстовое поле', label), utils.fieldDescription('текстового поля', label), factory);
    };
    this.createDomElementTester = function () {
        var getDomElement = utils.makeFunction(arguments[0]);

        return factory.createDomElementTester(getDomElement, wait, utils, this, male, function () {
            return 'элемент ' + utils.getTypeDescription(getDomElement());
        }, function () {
            return 'элемент ' + utils.getTypeDescription(getDomElement());
        }, function () {
            return 'элемента ' + utils.getTypeDescription(getDomElement());
        }, factory);
    };
}

function JsTester_QueryParams() {
    var params = {};

    this.add = function (nameComponents, value) {
        if (!nameComponents.length) {
            throw new Error('Имя параметра не должно быть пустым');
        }

        var namespace = params,
            lastComponentIndex = nameComponents.length - 1,
            i = 0,
            deeperNamespace,
            component;

        for (; i < lastComponentIndex; i ++) {
            component = nameComponents[i];

            if (component in namespace) {
                namespace = namespace[component];
            } else {
                deeperNamespace = {};
                namespace[component] = deeperNamespace;
                namespace = deeperNamespace;
            }
        }

        component = nameComponents[lastComponentIndex];

        if (component in namespace) {
            var oldValue = namespace[component];

            if (Array.isArray(oldValue)) {
                oldValue.push(value);
            } else {
                namespace[component] = [oldValue];
            }
        } else {
            namespace[component] = value;
        }
    };
    this.get = function () {
        return params;
    };
}

function JsTester_DescendantFinder (ascendantElement, utils) {
    var selector = '*';

    var isDesiredText = function () {
        throw new Error('Не указаны критерии поиска');
    };

    this.matchesSelector = function (value) {
        selector = value;
        return this;
    };

    this.textEquals = function (desiredTextContent) {
        isDesiredText = function (actualTextContent) {
            return actualTextContent == desiredTextContent;
        };

        return this;
    };

    this.textContains = function (desiredTextContent) {
        isDesiredText = function (actualTextContent) {
            return actualTextContent.indexOf(desiredTextContent) != -1;
        };

        return this;
    };

    this.find = function () {
        var i,
            descendants = ascendantElement.querySelectorAll(selector),
            length = descendants.length,
            descendant;
        
        for (i = 0; i < length; i ++) {
            descendant = descendants[i];

            if (isDesiredText(utils.getTextContent(descendant))) {
                return descendant;
            }
        }
    };
}

function JsTester_Utils (debug) {
    this.makeFunction = function (value) {
        if (typeof value == 'function') {
            return value;
        } else {
            var domElement = value;
            return function () {
                return domElement;
            };
        }
    };
    this.fieldDescription = function (description, label) {
        return description + (label ? (' "' + label + '"') : '');
    };
    this.isVisible = function(domElement) {
        return !!(domElement.offsetWidth || domElement.offsetHeight || domElement.getClientRects().length);
    };
    this.getVariablePresentation = function (object) {
        return "\n \n" + debug.getVariablePresentation(object) + "\n \n";
    };
    this.dispatchMouseEvent = function (domElement, eventName) {
        domElement.dispatchEvent(new MouseEvent(eventName, {
            view: window,
            bubbles: true,
            cancelable: true
        }));
    };
    this.getTextContent = function (value) {
        if (!value) {
            return '';
        }

        if (typeof value != 'string') {
            value = value.innerHTML;
        }

        return value.replace(/<[^<>]*>/g, ' ').replace(/[\s]+/g, ' ').trim();
    };
    function parseName (name) {
        var result = name.match(/^([^\[\]]+)(?:\[([^\[\]]+)\])+$/);

        if (!result) {
            return [name];
        }

        var length = result.length,
            i = 1,
            components = [];

        for (; i < length; i ++) {
            components.push(result[i]);
        }

        return components;
    }
    this.parseQueryString = function (queryString) {
        var parts = queryString.replace(/^\?/, '').split('&'),
            queryParams = new JsTester_QueryParams(),
            components,
            name,
            value,
            i,
            ln,
            part,
            plusRe = /\+/g;

        for (i = 0 , ln = parts.length; i < ln; i++) {
            part = parts[i];

            if (part.length > 0) {
                components = part.split('=');
                name = components[0];
                name = name.replace(plusRe, '%20');
                name = decodeURIComponent(name);
                value = components[1];

                if (value !== undefined) {
                    value = value.replace(plusRe, '%20');
                    value = decodeURIComponent(value);
                } else {
                    value = '';
                }

                queryParams.add(parseName(name), value);
            }
        }

        return queryParams.get();
    };
    this.parseUrl = function (url) {
        var origin = window.location.origin;

        if (url.indexOf(origin) === 0) {
            url = url.substr(origin.length);
        }

        url = url.split('?');

        var query;

        if (url[1]) {
            query = new JsTester_Query(this.parseQueryString(url[1]), this);
        } else {
            query = new JsTester_NoQuery(this);
        }

        return {
            path: url[0],
            query: query
        };
    };
    this.isDate = function(value) {
        return toString.call(value) === '[object Date]';
    };
    this.getTypeDescription = function (value) {
        var type = typeof value;

        if (type == 'object') {
            if (Array.isArray(value)) {
                return 'array';
            } else if (this.isDate(value)) {
                return 'date';
            } else if (value === null) {
                return 'null';
            } else if (value.nodeName) {
                return value.nodeName;
            } else {
                return 'object';
            }
        } else {
            return type;
        }
    };
    this.capitalize = function(string) {
        if (!string) {
            return '';
        }

        string = string + '';

        return string.charAt(0).toUpperCase() + string.substr(1);
    };
    this.descendantOf = function (ascendantElement) {
        return new JsTester_DescendantFinder(ascendantElement, this);
    };
    this.descendantOfBody = function () {
        return this.descendantOf(document.body);
    };
    this.findElementByTextContent = function (ascendantElement, desiredTextContent, selector) {
        return (new JsTester_DescendantFinder(ascendantElement, this)).matchesSelector(selector || '*').
            textEquals(desiredTextContent).find();
    };
    this.expectObjectToContain = function (object, expectedContent) {
        (new JsTester_ParamsContainingExpectation(object))(expectedContent);
    };
    function getVisible (domElements, handleError) {
        var results = Array.prototype.filter.call(domElements, (function (domElement) {
            return this.isVisible(domElement);
        }).bind(this));

        if (results.length != 1) {
            handleError(results.length);
        }

        return results[0];
    }
    this.getVisibleSilently = function (domElements) {
        return getVisible.call(this, domElements, function () {});
    };
    this.getVisible = function (domElements) {
        return getVisible.call(this, domElements, function (count) {
            throw new Error('Найдено ' + count + ' видимых элементов, тогда как видимым должен быть только один.');
        });
    };
}

function JsTester_OpenedWindow (path, query) {
    this.expectToHavePath = function (expectedValue) {
        if (path != expectedValue) {
            throw new Error('Должно быть открыто окно, URL которого имеет путь "' + expectedValue + '", тогда как ' +
                'URL имеет путь "' + path + '".');
        }
    };
    this.expectQueryToContain = function (params) {
        query.expectToContain(params);
    };
}

function JsTester_NoWindowOpened (utils) {
    this.expectToHavePath = function (expectedValue) {
        throw new Error('Дожен быть открыт URL с путем "' + expectedValue + '".');
    };
    this.expectQueryToContain = function (params) {
        throw new Error('Должен быть открыт URL с параметрами' + utils.getVariablePresentation(params));
    };
}

function JsTester_WindowOpener (utils) {
    var open = window.open,
        actualWindow = new JsTester_NoWindowOpened(utils);

    this.expectToHavePath = function (expectedValue) {
        actualWindow.expectToHavePath(expectedValue);
        return this;
    };
    this.expectQueryToContain = function (params) {
        actualWindow.expectQueryToContain(params);
        return this;
    };
    this.replaceByFake = function () {
        actualWindow = new JsTester_NoWindowOpened();

        window.open = function (url) {
            var results = utils.parseUrl(url);
            actualWindow = new JsTester_OpenedWindow(results.path, results.query);
        };
    };
    this.restoreReal = function () {
        actualWindow = new JsTester_NoWindowOpened();
        window.open = open;
    };
}

function JsTester_JasmineAjaxMockExtender (utils, debug) {
    return function (JasmineAjaxMock, requestAssertions, errors, requests) {
        var prototype = JasmineAjaxMock.prototype;

        var constructor = function () {
            JasmineAjaxMock.apply(this, arguments);
            
            var index = jasmine.Ajax.requests.count() - 1,
                parentOpen = this.open,
                async,
                parentSend = this.send,
                me = this;

            function send (data) {
                var callStack = debug.getCallStack();

                parentSend.apply(me, arguments);
                requests.addCallStack(callStack);

                if (async) {
                    return;
                }

                var assertions;

                if (!(assertions = requestAssertions.pop())) {
                    throw new Error('Ни один запрос не был отправлен');
                }

                var request = new JsTester_Request(me, utils, callStack);

                assertions.forEach(function (assert) {
                    try {
                        assert(request);
                    } catch (e) {
                        errors.push(e);
                    }
                });
            }

            function dontSend () {
                throw new Error('Совершена попытка отправить запрос, при том, что URL еще не был открыт.');
            }

            var maybeSend = dontSend;

            this.open = function () {
                maybeSend = send;
                async = arguments[2] === undefined ? true : arguments[2];

                parentOpen.apply(this, arguments);

                if (async) {
                    return;
                }

                var length = jasmine.Ajax.requests.count(),
                    requests = [],
                    i;

                for (i = 0; i < length; i ++) {
                    if (i != index) {
                        requests.push(jasmine.Ajax.requests.at(i));
                    }
                }

                jasmine.Ajax.requests.reset();
                length = requests.length;

                for (i = 0; i < length; i ++) {
                    jasmine.Ajax.requests.track(requests[i]);
                }
            };
            this.send = function (data) {
                maybeSend(data);
            };
        };

        constructor.prototype = prototype;
        return constructor;
    };
}

function JsTester_Request (request, utils, callStack) {
    var result = utils.parseUrl(request.url),
        path = result.path,
        query = result.query,
        method = request.method;

    var body = (function (bodyParams) {
        var name;

        for (name in bodyParams) {
            return new JsTester_Body(bodyParams, utils);
        }

        return new JsTester_NoBody(utils);
    })(request.data());

    this.printCallStack = function () {
        console.log(callStack);
        return this;
    };
    this.respondSuccessfullyWith = function (responseObject) {
        request.respondWith({
            status: 200,
            responseText: typeof responseObject == 'string' ? responseObject : JSON.stringify(responseObject)
        });

        return this;
    };
    this.respondUnsuccessfullyWith = function (responseObject) {
        request.respondWith({
            status: 500,
            responseText: typeof responseObject == 'string' ? responseObject : JSON.stringify(responseObject)
        });

        return this;
    };
    this.expectPathToContain = function (expectedValue) {
        if (!path.includes(expectedValue)) {
            throw new Error(
                'В данный момент должен быть отправлен запрос по пути, который содержит подстроку "' + expectedValue +
                '", тем не менее запрос был отправлен по пути "' + path + '".'
            );
        }

        return this;
    };
    this.expectToHavePath = function (expectedValue) {
        if (path != expectedValue) {
            throw new Error(
                'В данный момент должен быть отправлен запрос по пути "' + expectedValue + '", тем не менее запрос ' +
                'был отправлен по пути "' + path + '".'
            );
        }

        return this;
    };
    this.expectToHaveMethod = function (expectedValue) {
        if (method != expectedValue) {
            throw new Error(
                'Запрос должен быть отправлен методом "' + expectedValue + '", тогда как он был отправлен методом "' +
                method + '".'
            );
        }

        return this;
    };
    this.testBodyParam = function (name, tester) {
        body.testBodyParam(name, tester);
        return this;
    };
    this.expectBodyToContain = function (params) {
        body.expectToContain(params);
        return this;
    };
    this.expectQueryToContain = function (params) {
        query.expectToContain(params);
        return this;
    };
    this.getDescription = function () {
        return 'Запрос отправлен методом "' + method + '" по пути "' + path + '" ' + query.getDescription() + 'Тело ' +
            'запроса ' + body.getDescription();
    };
}

function JsTester_PredictedRequest (assertions, utils) {
    var me = this;

    function defineWrapperMethod (methodName) {
        me[methodName] = function () {
            var args = arguments;

            assertions.push(function (request) {
                request[methodName].apply(request, args);
            });

            return me;
        };
    }

    defineWrapperMethod('respondSuccessfullyWith');
    defineWrapperMethod('expectToHavePath');
    defineWrapperMethod('expectToHaveMethod');
    defineWrapperMethod('testBodyParam');
    defineWrapperMethod('expectBodyToContain');
    defineWrapperMethod('expectQueryToContain');
}

function JsTester_RequestsManager (utils, debug) {
    var requests,
        requestAssertions,
        JasmineAjaxMock,
        errors = [],
        extendJasmineAjaxMock = new JsTester_JasmineAjaxMockExtender(utils, debug);

    this.predictSyncRequest = function () {
        var assertions = [],
            predictedRequest = new JsTester_PredictedRequest(assertions, utils);

        requestAssertions.push(assertions);
        return predictedRequest;
    };
    this.recentRequest = function () {
        return requests.recentRequest();
    };
    this.expectSomeRequestsToBeSent = function () {
        requests.expectSomeRequestsToBeSent();
    };
    this.expectNoRequestsToBeSent = function () {
        return requests.expectNoRequestsToBeSent();
    };
    this.expectNoSyncRequestsToBePredicted = function () {
        if (requestAssertions.length) {
            throw new Error('Должен быть отправлен синхронный запрос.');
        }
    };
    this.expectNoExceptionsToBeThrown = function () {
        errors.forEach(function (error) {
            throw error;
        });
    };
    this.createAjaxMock = function () {
        jasmine.Ajax.install();
        requests = new JsTester_Requests(jasmine.Ajax.requests, utils);
        requestAssertions = [];
        errors = [];
        JasmineAjaxMock = window.XMLHttpRequest;
        window.XMLHttpRequest = extendJasmineAjaxMock(JasmineAjaxMock, requestAssertions, errors, requests);
    };
    this.destroyAjaxMock = function (exceptions) {
        try {
            this.expectNoRequestsToBeSent();
            this.expectNoSyncRequestsToBePredicted();
            this.expectNoExceptionsToBeThrown();
        } catch (e) {
            exceptions.push(e);
        }

        window.XMLHttpRequest = JasmineAjaxMock;
        jasmine.Ajax.uninstall();
    };
}

function JsTester_Requests (requests, utils) {
    var indexOfRecentRequest = 0,
        recentRequest,
        callStacks = [];

    function getRecentRequest () {
        var request = requests.at(indexOfRecentRequest);
        indexOfRecentRequest ++;
        return request;
    }

    function createRequestTester (recentRequest) {
        return new JsTester_Request(recentRequest, utils, callStacks[indexOfRecentRequest - 1]);
    }

    this.addCallStack = function (callStack) {
        callStacks.push(callStack);
    };
    this.recentRequest = function () {
        var recentRequest = getRecentRequest();

        if (!recentRequest) {
            throw new Error(
                'Было отправлено только ' + requests.count() + ' запросов, тогда как их должно быть больше.'
            );
        }

        return createRequestTester(recentRequest);
    };
    this.expectSomeRequestsToBeSent = function () {
        var newIndexOfRecentRequest = requests.count();

        if (newIndexOfRecentRequest == indexOfRecentRequest) {
            throw new Error('Должен быть отправлен хотя бы один запрос.');
        }

        indexOfRecentRequest = newIndexOfRecentRequest;
    };
    this.expectNoRequestsToBeSent = function () {
        var recentRequest = getRecentRequest();

        if (recentRequest) {
            throw new Error(
                'Был отправлен запрос, тогда как ни один запрос не должен был быть отправлен. ' +
                createRequestTester(recentRequest).getDescription()
            );
        }
    };
}

function JsTester_Body (bodyParams, utils) {
    var expectToContain = new JsTester_ParamsContainingExpectation(bodyParams, 'тела запроса');

    this.testBodyParam = function (name, tester) {
        if (!(name in bodyParams)) {
            throw new Error('Не удалось найти параметр "' + name + '" в теле запроса. Тело запроса ' +
                this.getDescription());
        }

        tester(bodyParams[name]);
    };
    this.expectToContain = function (params) {
        expectToContain(params);
    };
    this.getDescription = function () {
        return 'содержит параметеры ' + utils.getVariablePresentation(bodyParams);
    };
}

function JsTester_NoBody (utils) {
    this.testBodyParam = function (name) {
        throw new Error('Не удалось найти параметр "' + name + '" в теле запроса, так как запрос был отправлен с ' +
            'пустым телом.');
    };
    this.expectToContain = function (params) {
        var name;

        for (name in params) {
            throw new Error(
                'Запрос был отправлен с пустым телом, тогда, как его тело должно было содержать параметры ' +
                utils.getVariablePresentation(params)
            );
        }
    };
    this.getDescription = function () {
        return 'является пустым.';
    };
}

function JsTester_Anchor (
    domElement, wait, utils, testersFactory, gender, nominativeDescription, accusativeDescription,
    genetiveDescription, factory
) {
    if (typeof domElement == 'function') {
        getDomElement = domElement;
    } else {
        getDomElement = function () {
            return domElement;
        };
    }

    factory.admixDomElementTester(this, arguments);

    this.expectHrefToHavePath = function (expectedValue) {
        this.expectToBeVisible();

        var actualPath = utils.parseUrl(getDomElement().href).path;
        
        if (actualPath != expectedValue) {
            throw new Error('Путь ' + genetiveDescription + 'должен быть "' + expectedValue + '", а не "' +
                actualPath + '".');
        }

        return this;
    };

    this.expectHrefQueryToContain = function (params) {
        this.expectToBeVisible();

        utils.parseUrl(getDomElement().href).query.expectToContain(params);
        return this;
    };
}

function JsTester_InputElement (
    getDomElement, wait, utils, testersFactory, gender, nominativeDescription, accusativeDescription,
    genetiveDescription, factory
) {
    var me = this,
        nativeValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;

    function nativeSetValue (value) {
        nativeValueSetter.call(getDomElement(), value);
    }

    factory.admixDomElementTester(this, [
        getDomElement, wait, utils, testersFactory, gender, nominativeDescription, accusativeDescription,
        genetiveDescription, factory
    ]);

    function addPreventDefaultHandler (event, preventDefaultHandler) {
        var preventDefault = event.preventDefault;

        event.preventDefault = function () {
            preventDefault.apply(event, arguments);
            preventDefaultHandler();
        };
    }

    function createKeyboardEvent (
        eventName, keyCode, preventDefaultHandler
    ) {
        var keyboardEvent = document.createEvent('KeyboardEvent');

        addPreventDefaultHandler(keyboardEvent, preventDefaultHandler);

        keyboardEvent.initKeyboardEvent(
            eventName, true, false, null, 0, false, 0, false, keyCode, 0);
        keyboardEvent.which = keyboardEvent.keyCode = keyCode;

        ['keyCode', 'which'].forEach(function (propertyName) {
            Object.defineProperty(keyboardEvent, propertyName, {
                get : function () {
                    return keyCode;
                }
            });     
        });

        return keyboardEvent;
    }

    function keyPress (keyCode, addCharacter) {
        var eventNames = ['keydown', 'keypress'],
            i = 0;

        var dispatchNext = function () {
            if (i == eventNames.length) {
                return;
            }

            var keyboardEvent = createKeyboardEvent(
                eventNames[i], keyCode, function () {
                    dispatchNext = function () {};
                    addCharacter = function () {};
                }
            );

            i ++;

            getDomElement().dispatchEvent(keyboardEvent);
            dispatchNext();
        };

        dispatchNext();
        addCharacter();

        getDomElement().dispatchEvent(createKeyboardEvent(
            'keyup', keyCode, function () {}));
    }

    function fireChange () {
        getDomElement().dispatchEvent(new Event('input', {
            bubbles: true
        }));
    }

    function input (value) {
        var length = value.length,
            i = 0,
            inputElement = getDomElement(),
            oldValue = inputElement.value,
            beforeCursor = oldValue.substr(0, inputElement.selectionStart),
            afterCursor = oldValue.substr(inputElement.selectionEnd),
            cursorPosition = beforeCursor.length,
            inputedValue = '';

        var update = function () {
            nativeSetValue(beforeCursor + inputedValue + afterCursor);
            inputElement.setSelectionRange(cursorPosition, cursorPosition);
        };

        var CharacterAppender = function (character) {
            return function () {
                inputedValue += character;
                cursorPosition ++;
                nativeSetValue(beforeCursor + inputedValue + afterCursor);
                inputElement.setSelectionRange(cursorPosition, cursorPosition);
            };
        };
        
        if (inputElement.readOnly) {
            throw new Error('Невозможно ввести значение, так как ' + nominativeDescription + ' ' + gender.readonly +
                ' для редактирования.');
        }

        for (i = 0; i < length; i ++) {
            keyPress(value.charCodeAt(i), new CharacterAppender(value[i]));
        }

        fireChange();
    }

    function erase (updateBeforeCursor, updateAfterCursor, keyCode) {
        var inputElement = getDomElement(),
            oldValue = inputElement.value,
            selectionStart = inputElement.selectionStart,
            selectionEnd = inputElement.selectionEnd,
            beforeCursor = oldValue.substr(0, selectionStart),
            afterCursor = oldValue.substr(selectionEnd);
        
        if (selectionStart == selectionEnd) {
            beforeCursor = updateBeforeCursor(beforeCursor);
            afterCursor = updateAfterCursor(afterCursor);
        }

        var moveCursor = function () {
            var cursorPosition = beforeCursor.length;
            inputElement.setSelectionRange(cursorPosition, cursorPosition);
        };

        var setValue = function () {
            nativeSetValue(beforeCursor + afterCursor);
        };

        inputElement.dispatchEvent(createKeyboardEvent('keydown', keyCode,
            function () {
                setValue = function () {};
                moveCursor = function () {};
            }));

        setValue();

        inputElement.dispatchEvent(createKeyboardEvent('keyup', keyCode, function () {}));

        moveCursor();
        fireChange();
    }

    function pressDelete () {
        erase(function (beforeCursor) {
            return beforeCursor;
        }, function (afterCursor) {
            return afterCursor.substr(1);
        }, 46);
    }

    function clear () {
        me.focus();
        getDomElement().setSelectionRange(0, getDomElement().value.length);
        pressDelete();
    }

    function getErrorIcon () {
        return testersFactory.createErrorIconTester(function () {
            return componentElement.querySelector('.x-form-error-msg');
        });
    }

    this.expectToHaveError = function (errorMessage) {
        getErrorIcon().expectTooltipWithText(errorMessage).toBeShownOnMouseOver();
    };
    this.expectToHaveNoError = function () {
        getErrorIcon().expectToBeHiddenOrNotExist();
    };
    this.pressBackspace = function () {
        this.focus();

        erase(function (beforeCursor) {
            return beforeCursor.substr(0, beforeCursor.length - 1);
        }, function (afterCursor) {
            return afterCursor;
        }, 8);

        return this;
    };
    this.pressDelete = function () {
        this.focus();

        pressDelete();

        return this;
    };
    this.expectCursorToBeAtEnd = function () {
        this.expectCursorToBeAt(getDomElement().value.length);
    };
    this.expectCursorToBeAt = function (expectedPostition) {
        this.expectSelectionStartToBeAt(expectedPostition);
        this.expectSelectionEndToBeAt(expectedPostition);
    };
    this.expectSelectionStartToBeAt = function (expectedPostition) {
        var actualPosition = getDomElement().selectionStart;

        if (expectedPostition != actualPosition) {
            throw new Error(
                'Выделение ' + genetiveDescription + ' ' + gender.should + ' начинаться на ' + expectedPostition +
                '-ом символе, а не на ' + actualPosition + '-ом.'
            );
        }
    };
    this.expectSelectionEndToBeAt = function (expectedPostition) {
        var actualPosition = getDomElement().selectionEnd;

        if (expectedPostition != actualPosition) {
            throw new Error(
                'Выделение ' + genetiveDescription + ' ' + gender.should + ' заканчиваться на ' + expectedPostition +
                '-ом символе, а не на ' + actualPosition + '-ом.'
            );
        }
    };
    this.putCursorAtEnd = function () {
        this.putCursorAt(getDomElement().value.length);
    };
    this.putCursorAtBegining = function () {
        this.putCursorAt(0);
    };
    this.putCursorAt = function (position) {
        this.select(position, position);
    };
    this.selectAll = function () {
        this.select(0, getDomElement().value.length);
    };
    this.select = function (selectionStart, selectionEnd) {
        this.focus();
        getDomElement().setSelectionRange(selectionStart, selectionEnd);
    };
    this.paste = function (value) {
        var length = value.length,
            i = 0,
            inputElement = getDomElement(),
            oldValue = inputElement.value,
            selectionStart = inputElement.selectionStart,
            cursorPosition = selectionStart + length,
            beforeCursor = oldValue.substr(0, selectionStart),
            afterCursor = oldValue.substr(inputElement.selectionEnd);

        var setValue = function () {
            nativeSetValue(beforeCursor + value + afterCursor);
            inputElement.setSelectionRange(cursorPosition, cursorPosition);
        };

        this.focus();

        var event = new ClipboardEvent('paste', {
            clipboardData: new DataTransfer()
        });

        addPreventDefaultHandler(event, function () {
            setValue = function () {};
        });

        event.clipboardData.setData('text', value);

        inputElement.dispatchEvent(event);
        setValue();
    };
    this.input = function (value) {
        this.focus();
        input(value);
    };
    this.fill = function (value) {
        clear();
        getDomElement().setSelectionRange(0, 0);
        input(value);
    };
    this.clear = function () {
        clear();
    };
    this.expectToHaveValue = function (expectedValue) {
        this.expectToBeVisible();

        var actualValue = getDomElement().value ? (getDomElement().value + '') : '';

        if (actualValue != expectedValue) {
            throw new Error(
                utils.capitalize(nominativeDescription) + ' ' + gender.should + ' иметь значение "' + expectedValue +
                '", а не "' + actualValue + '".'
            );
        }
    };
}

function JsTester_DomElement (
    domElement, wait, utils, testersFactory, gender, nominativeDescription, accusativeDescription,
    genetiveDescription, factory
) {
    var getDomElement = utils.makeFunction(domElement),
        getNominativeDescription = utils.makeFunction(nominativeDescription),
        getAccusativeDescription = utils.makeFunction(accusativeDescription),
        getGenetiveDescription = utils.makeFunction(genetiveDescription);

    function convertDecimalToHex (c) {
        var hex = c.toString(16);
        return hex.length == 1 ? '0' + hex : hex;
    }

    function convertColorPropertyValueToHex (colorPropertyValue) {
        var rgb = colorPropertyValue.match(/\d+/g);

        if (!rgb) {
            return '#000000';
        }

        if (rgb.length == 4 && rgb[3] === '0') {
            return 'transparent';
        }

        return '#' + (
            convertDecimalToHex(parseInt(rgb[0], 0)) +
            convertDecimalToHex(parseInt(rgb[1], 0)) +
            convertDecimalToHex(parseInt(rgb[2], 0))
        );
    }

    function getStylePropertyValue (propertyName) {
        var actualValue = getComputedStyle(getDomElement())[propertyName];

        if (/\bcolor\b/.test(propertyName)) {
            actualValue = convertColorPropertyValueToHex(actualValue);
        }

        return actualValue;
    }

    this.focus = function () {
        var domElement = getDomElement();

        this.expectToBeVisible();
        domElement.focus();

        domElement.dispatchEvent(new Event('focus', {
            bubbles: true,
            cancelable: true
        }));
    };
    this.blur = function () {
        var domElement = getDomElement();

        this.expectToBeVisible();
        domElement.blur();

        domElement.dispatchEvent(new Event('blur', {
            bubbles: true,
            cancelable: true
        }));
    };
    this.expectToHaveClass = function (className) {
        this.expectToBeVisible();

        if (!getDomElement().classList.contains(className)) {
            throw new Error(
                utils.capitalize(getNominativeDescription()) + ' ' + gender.should + ' иметь класс "' +
                className + '", тогда, как ' + gender.pronoun + ' имеет классы "' + getDomElement().className + '".'
            );
        }
    };
    this.expectNotToHaveClass = function (className) {
        this.expectToBeVisible();

        if (getDomElement().classList.contains(className)) {
            throw new Error(
                utils.capitalize(getNominativeDescription()) + ' не ' + gender.should + ' иметь класс "' +
                className + '".'
            );
        }
    };
    this.expectTextContentToHaveSubstring = function (expectedSubstring) {
        this.expectToBeVisible();

        var actualContent = utils.getTextContent(getDomElement());

        if (actualContent.indexOf(expectedSubstring) === -1) {
            throw new Error(
                utils.capitalize(getNominativeDescription()) + ' ' + gender.should + ' содержать текст, содержащий ' +
                'подстроку "' + expectedSubstring + '", тогда, как ' + gender.pronoun + ' содержит текст "' +
                actualContent + '".'
            );
        }
    };
    this.expectToHaveTextContent = function (expectedContent) {
        this.expectToBeVisible();

        var actualContent = utils.getTextContent(getDomElement());

        if (actualContent != expectedContent) {
            throw new Error(
                utils.capitalize(getNominativeDescription()) + ' ' + gender.should + ' содержать текст "' +
                expectedContent + '", тогда, как ' + gender.pronoun + ' содержит текст "' + actualContent + '".'
            );
        }
    };
    this.expectToHaveContent = function (expectedContent) {
        this.expectToBeVisible();

        var actualContent = getDomElement().innerHTML;

        if (actualContent != expectedContent) {
            throw new Error(
                utils.capitalize(getNominativeDescription()) + ' ' + gender.should + ' иметь содержимое "' +
                expectedContent + '", тогда, как ' + gender.pronoun + ' имеет содержимое "' + actualContent + '".'
            );
        }
    };
    this.expectToBeVisible = function () {
        this.expectToExist();

        if (!utils.isVisible(getDomElement())) {
            throw new Error(
                utils.capitalize(getNominativeDescription()) + ' ' + gender.should + ' быть ' + gender.visible + '.'
            );
        }
    };
    this.expectToBeHidden = function () {
        this.expectToExist();

        if (utils.isVisible(getDomElement())) {
            throw new Error(
                utils.capitalize(getNominativeDescription()) + ' ' + gender.should + ' быть ' + gender.hidden + '.'
            );
        }
    };
    this.expectToBeHiddenOrNotExist = function () {
        if (getDomElement()) {
            this.expectToBeHidden();
        }
    };
    this.expectNotToExist = function () {
        if (getDomElement()) {
            throw new Error(
                utils.capitalize(getNominativeDescription()) + ' ' + gender.should + ' отсутствовать.'
            );
        }
    };
    this.expectToExist = function () {
        if (!getDomElement()) {
            throw new Error(
                utils.capitalize(getNominativeDescription()) + ' ' + gender.should + ' существовать.'
            );
        }
    };
    this.expectToHaveStyle = function (propertyName, expectedValue) {
        var actualValue = getStylePropertyValue(propertyName);

        if (actualValue != expectedValue) {
            throw new Error(
                'Свойство "' + propertyName + '" стиля ' + getGenetiveDescription() + ' должно иметь значение "' +
                    expectedValue + '", а не "' + actualValue + '".'
            );
        }
    };
    this.expectNotToHaveStyle = function (propertyName, unexpectedValue) {
        var actualValue = getStylePropertyValue(propertyName);

        if (actualValue == unexpectedValue) {
            throw new Error(
                'Свойство "' + propertyName + '" стиля ' + getGenetiveDescription() + ' не должно иметь значение "' +
                    unexpectedValue + '".'
            );
        }
    };
    this.click = function () {
        this.expectToExist();
        this.focus();
        utils.dispatchMouseEvent(getDomElement(), 'click');
    };
    this.findAnchor = function (text) {
        return testersFactory.createAnchorTester(function () {
            var domElement;

            getDomElement().querySelectorAll('a').forEach(function (anchor) {
                if (utils.getTextContent(anchor) == text) {
                    domElement = anchor;
                }
            });

            return domElement;
        }, text);
    };
    this.findElement = function (selector) {
        return testersFactory.createDomElementTester(getDomElement().querySelector(selector));
    };
    this.findElementByTextContent = function (text) {
        return testersFactory.createDomElementTester(utils.findElementByTextContent(getDomElement(), text));
    };
}

function JsTester_ParamsContainingExpectation (actualParams, paramsDescription) {
    paramsDescription = paramsDescription || '';

    var forEachArrayItem = function (expectedParams, callback) {
        expectedParams.forEach(callback);
    };

    var forEachObjectItem = function (expectedParams, callback) {
        var name;

        for (name in expectedParams) {
            callback(expectedParams[name], name);
        }
    };

    function checkExpectation (expectedParams, actualParams, forEach, getParamDescription) {
        forEach(expectedParams, function (expectedValue, key) {
            var keyDescription = getParamDescription(key);

            if (!actualParams) {
                throw new Error('Невозможно найти параметр ' + keyDescription + ' в пустом объекте.');
            }

            var actualValue = actualParams[key];

            if (expectedValue !== null && typeof expectedValue == 'object') {
                if (Array.isArray(expectedValue)) {
                    checkExpectation(expectedValue, actualValue,
                        forEachArrayItem, function (key) {
                            return keyDescription + '[' + key + ']';
                        });
                } else {
                    checkExpectation(expectedValue, actualValue,
                        forEachObjectItem, function (key) {
                            return keyDescription + '.' + key;
                        });
                }

                return;
            }

            var expectationDescription = 'Параметр ' +
                keyDescription + (paramsDescription ? (' ' + paramsDescription) : '') +
                ' должен иметь значение ' + JSON.stringify(expectedValue) +
                ', тогда, как он';
            
            if (actualValue === undefined && expectedValue !== undefined) {
                throw new Error(expectationDescription + ' остутствует.');
            }

            if (actualValue !== expectedValue) {
                throw new Error(expectationDescription + ' имеет значение ' +
                    JSON.stringify(actualValue) + '.');
            }
        });
    }

    return function (expectedParams) {
        checkExpectation(expectedParams, actualParams, forEachObjectItem, function (key) {
            return key;
        });
    };
}

function JsTester_Query (query, utils) {
    var expectToContain = new JsTester_ParamsContainingExpectation(query, 'URL');

    this.expectToContain = function (params) {
        expectToContain(params);
    };
    this.getDescription = function () {
        return 'с параметрами ' + utils.getVariablePresentation(query);
    };
}

function JsTester_NoQuery (utils) {
    this.expectToContain = function (params) {
        var name;

        for (name in params) {
            throw new Error(
                'URL не содержит параметров тогда, как он должен содержать параметры ' +
                utils.getVariablePresentation(params)
            );
        }
    };
    this.getDescription = function () {
        return 'без параметров.';
    };
}

function JsTester_IntegerVariable (value) {
    function convertToInteger (value) {
        return value ? (parseInt(value, 0) || 0) : 0;
    }

    value = convertToInteger(value);

    this.clone = function () {
        return new JsTester_IntegerVariable(value);
    };
    this.setValue = function (v) {
        value = convertToInteger(v);
    };
    this.getValue = function () {
        return value;
    };
    this.subtract = function (v) {
        this.setValue(value - convertToInteger(v));
    };
    this.add = function (v) {
        this.setValue(value + convertToInteger(v));
    };
}

function JsTester_DelayedTask (id, runTask, tasks, timeout) {
    var initialTimeout = timeout.clone();
    
    this.remove = function () {
        delete(tasks[id]);
        runTask = function() {};
    };
    this.run = function (callbackRunner) {
        callbackRunner(function (times) {
            times = times || 1;

            for (var i = 0; i < times; i ++) {
                runTask();
            }
        }, timeout);
        timeout = initialTimeout.clone();
    };
}

function JsTester_OneTimeDelayedTask (id, runTask, tasks, timeout) {
    var me = this;

    JsTester_DelayedTask.apply(this, arguments);

    this.run = function (callbackRunner) {
        callbackRunner(function (times) {
            runTask();
            me.remove();
        }, timeout);
    };
}

function JsTester_TimeoutCallbackRunner (setterName, clearerName, DelayedTask, logger) {
    var tasks = {},
        lastId = 0;

    window[setterName] = function (callback, timeout) {
        lastId ++;

        logger.log(timeout, callback);
        logger.trace();

        var task = new DelayedTask(lastId, callback, tasks, new JsTester_IntegerVariable(timeout));

        tasks[lastId] = task;
        return task;
    };

    window[clearerName] = function (task) {
        if (task && typeof task.remove == 'function') {
            task.remove();
        }
    };

    return function (callbackRunner) {
        var id;

        for (id in tasks) {
            tasks[id].run(callbackRunner);
        }
    };
}

function JsTester_Timeout (setterName, clearerName, DelayedTask, logger) {
    var setter = window[setterName],
        clearer = window[clearerName],
        runCallbacks = function () {};

    this.runCallbacks = function () {
        runCallbacks(function (run, timeout) {
            run();
        });
    };
    this.spendTime = function (time) {
        runCallbacks(function (run, timeout) {
            var value = timeout.getValue(),
                timeSpent = time;

            if (time >= value) {
                var times = value ? Math.floor(time / value) : 1,
                    i = 0;
                
                run(times);

                timeSpent -= value * times;
                timeout.subtract(timeSpent);
            } else {
                timeout.subtract(time);
            }
        });
    };
    this.replaceByFake = function () {
        runCallbacks = new JsTester_TimeoutCallbackRunner(setterName, clearerName, DelayedTask, logger);
    };
    this.restoreReal = function () {
        window[setterName] = setter;
        window[clearerName] = clearer;
    };
}

function JsTester_WebSocketMockCore (encoder, url, utils, constants, logger) {
    var readyState = constants.CLOSED,
        messages = [],
        messageIndex = 0;
    
    function throwWasNotConnected () {
        throw new Error('Устанавливается соединение по веб-сокету с URL "' + url + '".');
    }

    function createValueReturner (value) {
        return function () {
            return value;
        };
    }

    function createTasksRunner (tasks) {
        return function () {
            tasks.forEach(function (runTask) {
                runTask();
            });
        };
    }

    var me = this,
        doNothing = function() {},
        handleConnect,
        handleDisconnect = doNothing,
        getHandlerOfFirstTimeCloseHandlerSetting = createValueReturner(doNothing),
        assertWasConnected = throwWasNotConnected;

    var handlers = {
        onopen: doNothing,
        onclose: doNothing,
        onerror: doNothing,
        onmessage: doNothing
    };

    var listsOfHandlersOfFirstTimeHandlerSetting = {
        onerror: [],
        onmessage: []
    };

    var handlersOfFirstTimeHandlerSetting = {
        onerror: createTasksRunner(listsOfHandlersOfFirstTimeHandlerSetting.onerror),
        onmessage: createTasksRunner(listsOfHandlersOfFirstTimeHandlerSetting.onmessage)
    };

    function createHandlerCaller (name, args) {
        args = args || [];

        return function () {
            handlers[name].apply(null, args);
        };
    }

    function handleResponse (eventName, args) {
        var handle = createHandlerCaller(eventName, args);

        me.connect();
        listsOfHandlersOfFirstTimeHandlerSetting[eventName].push(handle);
        handle();
    }

    function disconnect (event) {
        readyState = constants.CLOSED;
        handleDisconnect(event);

        handleConnect = createHandlerCaller('onopen');
        handleDisconnect = doNothing;
        handlersOfFirstTimeHandlerSetting.onopen = doNothing;
        handlersOfFirstTimeHandlerSetting.onclose = getHandlerOfFirstTimeCloseHandlerSetting();
    }

    this.setHandler = function (name, handler) {
        var wasEmpty = handlers[name] == doNothing;
        handlers[name] = handler;

        if (wasEmpty) {
            handlersOfFirstTimeHandlerSetting[name]();
        }
    };
    this.setEncoder = function (value) {
        encoder = value;
    };
    this.connect = function () {
        readyState = constants.OPEN;
        handleConnect();

        assertWasConnected = doNothing;
        handleConnect = doNothing;

        handleDisconnect = function () {
            handlers.onclose.apply(null, arguments);
        };

        handlersOfFirstTimeHandlerSetting.onopen = createHandlerCaller('onopen');
        handlersOfFirstTimeHandlerSetting.onclose = doNothing;
        getHandlerOfFirstTimeCloseHandlerSetting = createValueReturner(handleDisconnect);
    };
    this.disconnect = function () {
        disconnect({
            wasClean: true
        });
    };
    this.disconnectAbnormally = function () {
        this.fail({});
        disconnect({
            wasClean: false
        });
    };
    this.fail = function (errorMessage) {
        handleResponse('onerror', [errorMessage]);
    };
    this.receiveMessage = function (message) {
        if (typeof message != 'string') {
            message = encoder.encode(message);
        }

        logger.log(message);

        handleResponse('onmessage', [new MessageEvent('message', {
            data: message
        })]);
    };
    this.getReadyState = function () {
        return readyState;
    };
    this.send = function (message) {
        logger.log(message);
        messages.push(message);
    };
    this.expectToBeSent = function (expectedMessage) {
        var actualMessage = this.popRecentlySentMessage();

        if (actualMessage != expectedMessage) {
            throw new Error('Должно быть отправлено сообщение "' + actualMessage + '", тогда как было отправлено ' +
                'сообщение "' + expectedMessage + '".');
        }

        return this;
    };
    this.expectSentMessageToContain = function (expectedContent) {
        (new JsTester_ParamsContainingExpectation(
            encoder.decode(this.popRecentlySentMessage()),
            'сообщения, переданного через веб-сокет по URL "' + url + '"'
        ))(expectedContent);

        return this;
    };
    this.popRecentlySentMessage = function (expectation) {
        var messagesCount = messages.length;

        if (messageIndex >= messagesCount) {
            throw new Error('Через веб-сокет по URL "' + url + '" должно быть отправлено как минимум ' +
                (messageIndex + 1) + ' сообщений, тогда, как было отправлено только ' + messagesCount + ' сообщений.');
        }

        var message = messages[messageIndex];

        messageIndex ++;
        return message;
    };
    this.expectNoMessageToBeSent = function () {
        var unexpectedMessages = messages.slice(messageIndex);

        if (unexpectedMessages.length) {
            throw new Error('Ни одно сообщение не должно быть отправлено через веб-сокет по URL "' + url + '", тогда ' +
                'как были отправлены сообщения ' + "\n" + unexpectedMessages.join("\n") + "\n" + '.');
        }
    };
    this.expectWasConnected = function () {
        assertWasConnected();
    };

    this.disconnect();
}

function JsTester_WebSocketFactory (utils, logger, debug) {
    var sockets = {},
        RealWebSocket = window.WebSocket,
        constants = {};

    function copyConstants (target) {
        [
            'CONNECTING',
            'OPEN',
            'CLOSING',
            'CLOSED'
        ].forEach(function (name) {
            target[name] = RealWebSocket[name];
        });
    }

    copyConstants(constants);

    this.createConstructor = function (encoder) {
        var url;

        for (url in sockets) {
            delete(sockets[url]);
        }

        var constructor = function (url, protocols) {
            var mockCore = new JsTester_WebSocketMockCore(encoder, url, utils, constants, logger),
                me = this;
            
            copyConstants(this);

            if (!sockets[url]) {
                sockets[url] = [];
            }

            sockets[url].push(new JsTester_WebSocketTester(mockCore, debug.getCallStack()));

            function defineHandler (propertyName) {
                var currentValue;

                Object.defineProperty(me, propertyName, {
                    set: function (newValue) {
                        var currentValue;
                        mockCore.setHandler(propertyName, newValue);
                    },
                    get: function () {
                        return currentValue;
                    }
                });
            }

            Object.defineProperty(this, 'readyState', {
                set: function () {},
                get: function () {
                    return mockCore.getReadyState();
                }
            });

            defineHandler('onopen');
            defineHandler('onclose');
            defineHandler('onmessage');
            defineHandler('onerror');

            this.send = function (message) {
                mockCore.send(message);
            };
            this.close = function () {
                mockCore.disconnect();
            };
        };

        copyConstants(constructor);

        return constructor;
    };
    this.createCollection = function () {
        return new JsTester_WebSockets(sockets);
    };
}

function JsTester_WebSockets (sockets) {
    function forEach (callback) {
        var url;

        for (url in sockets) {
            sockets[url].forEach(callback);
        }
    }

    this.getSocket = function () {
        var urls = Object.keys(sockets),
            urlsCount = urls.length,
            url,
            index,
            argumentsCount = arguments.length,
            socketsWithUrl;

        if (!urlsCount) {
            throw new Error('Ожадось, что будет создан веб-сокет, однако ни один веб-сокет не был создан');
        }

        if (!argumentsCount) {
            if (urlsCount != 1) {
                throw new Error('Ожидалось, что будет создан только один веб-сокет, однако были созданы веб-сокеты с ' +
                    'такими URL: "' + urls.join('", "') + '"');
            }

            url = urls[0];
        } else {
            url = arguments[0];
        }

        if (!url) {
            throw new Error('Укажите URL веб-сокета.');
        }

        if (typeof url == 'string') {
            socketsWithUrl = sockets[url];
        } else if (url instanceof RegExp) {
            socketsWithUrl = Object.keys(sockets).filter(function (actualUrl) {
                return url.test(actualUrl);
            }).reduce(function (socketsWithUrl, url) {
                return socketsWithUrl.concat(sockets[url]);
            }, []);
        }

        if (!socketsWithUrl || !socketsWithUrl.length) {
            throw new Error('Ни один веб-сокет с URL "' + url + '" не был создан.');
        }

        countOfSocketsWithUrl = socketsWithUrl.length;

        if (argumentsCount <= 1) {
            if (countOfSocketsWithUrl > 1) {
                throw new Error('Ожидалось, что будет создан только один веб-сокет c URL "' + url + '", однако было ' +
                    'создано ' + countOfSocketsWithUrl + ' веб-сокетов.');
            }

            return socketsWithUrl[0];
        }

        if ((index = arguments[1]) >= countOfSocketsWithUrl) {
            throw new Error('Ожидалось, что с URL "' + url + '" будет создано по крайней мере ' + (index + 1) + ' ' +
                'веб-сокетов, однако было создано только ' + countOfSocketsWithUrl + ' веб-сокетов.');
        }

        return socketsWithUrl[index];
    };
    this.expectNoMessageToBeSent = function (exceptions) {
        try {
            forEach(function (socket) {
                socket.expectNoMessageToBeSent();
            });
        } catch (e) {
            exceptions.push(e);
        }
    };
    this.expectWasConnected = function (exceptions) {
        forEach(function (socket) {
            socket.expectWasConnected(exceptions);
        });
    };
    this.logMessages = function () {
        forEach(function (socket) {
            socket.logMessages();
        });
    };
}

function JsTester_WebSocketTester (mockCore, callStack) {
    this.printCallStack = function () {
        console.log(callStack);
        return this;
    };
    this.connect = function () {
        mockCore.connect();
        return this;
    };
    this.disconnect = function () {
        mockCore.disconnect();
        return this;
    };
    this.disconnectAbnormally = function () {
        mockCore.disconnectAbnormally();
        return this;
    };
    this.fail = function (errorMessage) {
        mockCore.fail(errorMessage);
        return this;
    };
    this.receiveMessage = function (message) {
        mockCore.receiveMessage(message);
        return this;
    };
    this.expectNoMessageToBeSent = function () {
        mockCore.expectNoMessageToBeSent();
        return this;
    };
    this.expectWasConnected = function (exceptions) {
        try {
            mockCore.expectWasConnected();
        } catch (e) {
            exceptions.push(e);
        }

        return this;
    };
    this.expectToBeSent = function (expectedMessage) {
        mockCore.expectToBeSent(expectedMessage);
        return this;
    };
    this.expectSentMessageToContain = function (expectedContent) {
        mockCore.expectSentMessageToContain(expectedContent);
        return this;
    };
    this.setEncoder = function (encoder) {
        mockCore.setEncoder(encoder);
        return this;
    };
    this.popRecentlySentMessage = function (expectation) {
        return mockCore.popRecentlySentMessage(expectation);
    };
    this.logMessages = function () {
        mockCore.logMessages();
    };
}

function JsTester_JSONEncoder () {
    this.encode = function (object) {
        return JSON.stringify(object);
    };
    this.decode = function (string) {
        return JSON.parse(string);
    };
}

function JsTester_WebSocketReplacer (webSocketFactory) {
    var RealWebSocket = window.WebSocket;

    this.replaceByFake = function () {
        window.WebSocket = webSocketFactory.createConstructor(new JsTester_JSONEncoder());
    };
    this.restoreReal = function () {
        window.WebSocket = RealWebSocket;
    };
}

function JsTester_Debugger () {
    var maxdepth,
        getStringPresentation,
        head,
        restore,
        normal,
        style,
        headless,
        getTrace;
    
    getTrace = function (e) {
        var stack = [];

        (function (items) {
            var i,
                length = items.length,
                item;

            for (i = 2; i < length; i ++) {
                item = items[i];

                if (item.indexOf('/jasmine-core/') != -1) { break; }

                item = item.replace(
                    /\(http:\/\/localhost:[^\/]*\/(base\/)?/, '(');
                
                item = item.replace(/^at /, '');

                item = item.replace(/:[0-9]+\)/, ')');

                item = item.replace(/\?[^:]*:/, ':');

                stack.push(item);
            }
        })(e.stack.split("\n"));

        return "\n\n" + stack.join("\n");
    };

    normal = {
        object: function (o) {
            if (typeof o == 'function') {
                return '[Fn]';
            }

            if (o && o.$className) {
                return '[' + o.$className + ']';
            }

            return o;
        },
        head: function (o, val) {
            return val;
        },
        skip: function (o, k) {
            return false;
        }
    };

    headless = {
        object: function (o) {
            return o;
        },
        head: function (o, val) {
            return '';
        },
        skip: function (o, k) {
            return false;
        }
    };

    restore = function () {
        maxdepth = 3;
        style = normal;
    };

    restore();

    head = function (o) {
        var res = '';

        if (o && typeof o == 'object') {
            if (o.$className) {
                res = '['+o.$className+'] ';
            } else {
                res = '['+Object.prototype.toString.call(o).slice(8, -1)+'] ';
            }
        }

        if (res) {
            res = style.head(o, res);
        }

        return res;
    };

    getStringPresentation = function (o, depth) {
        var k,
            v,
            indent = '',
            result = '',
            i,
            addt;

        o = style.object(o);

        if (o === null) {
            result += '[null]';
        } else if (typeof o == 'object') {
            if (depth < maxdepth) {
                result += indent+head(o)+"(\n";


                for (i = 0; i < depth; i ++) {
                    indent += '    ';
                }

                for (k in o) {
                    if (style.skip(o, k)) {
                        continue;
                    }

                    v = o[k];

                    result += indent+'    '+k+' => '+getStringPresentation(v, depth+1)+"\n";
                }
                result += indent+')';
            } else {
                result += indent+head(o)+'...';
            }
        } else {
            if (typeof o != 'function') {
                result += o;
            }
        }

        return result;
    };

    function print (object) {
        console.log("\n\n" + getStringPresentation(object, 0));
    }

    this.getVariablePresentation = function (o) {
        style = headless;
        var result = getStringPresentation(o, 0);

        restore();
        return result;
    };
    this.printWithSpecificStyle = function (component, value) {
        style = value;
        print(component);
    };
    this.printVariable = function (o) {
        print(o);
        restore();
    };
    this.printCallStack = function () {
        try {
            throw new Error();
        } catch(e) {
            console.log(getTrace(e));
        }
    };
    this.getCallStack = function () {
        try {
            throw new Error();
        } catch(e) {
            return getTrace(e);
        }
    };
}
