function JsTester_Factory () {
    this.createDebugger = function () {
        return new JsTester_Debugger();
    };
    this.createUtils = (...args) => new JsTester_Utils(...args);
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
    this.createTestersFactory = function (args) {
        args.factory = this;
        return new JsTester_TestersFactory(args);
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
            console.log.apply(console, arguments);
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

function JsTester_UserMediaEventHandlersItem (options) {
    var handleSuccess = options.successHandler,
        handleError = options.errorHandler,
        callStack = options.callStack,
        constraints = options.constraints;

    this.getConstraints = function () {
        return constraints;
    };
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

function JsTester_QueueItemAppender () {
    return function (args) {
        var currentItem = args.currentItem,
            newItem = args.newItem;

        newItem.setOther(currentItem);
        return newItem;
    };
}

function JsTester_StackItemAppender () {
    return function (args) {
        var currentItem = args.currentItem,
            lastItem = args.lastItem,
            newItem = args.newItem,
            emptyItem = args.emptyItem;

        if (emptyItem == currentItem) {
            currentItem = newItem;
        }

        newItem.setOther(emptyItem);
        lastItem.setOther(newItem);
        return currentItem;
    };
}

function JsTester_Container (args) {
    var emptyValue = args.emptyValue,
        add = args.appender,
        emptyItem = new JsTester_EmptyContainerItem(emptyValue),
        currentItem,
        lastItem;

    this.forEach = function (callback) {
        var item = currentItem;

        while (item != emptyItem) {
            callback(item.getValue());
            item = item.getOther();
        }
    };
    this.add = function (value) {
        const newItem = new JsTester_ContainerItem(value);

        currentItem = add({
            emptyItem: emptyItem,
            newItem: newItem,
            currentItem: currentItem,
            lastItem: lastItem
        });

        lastItem = newItem;
    };
    this.pop = function () {
        var value = currentItem.getValue();
        currentItem = currentItem.getOther();
        return value;
    };
    this.isEmpty = function () {
        return currentItem === emptyItem;
    };
    this.removeAll = function () {
        currentItem = lastItem = emptyItem;
    };

    this.removeAll();
}

function JsTester_EmptyContainerItem (emptyValue) {
    this.setOther = function () {};
    this.getOther = function () {
        return this;
    };
    this.getValue = function () {
        return emptyValue;
    };
}

function JsTester_ContainerItem (value) {
    var other;

    this.setOther = function (value) {
        other = value;
    };
    this.getOther = function () {
        return other;
    };
    this.getValue = function () {
        return value;
    };
}

function JsTester_Queue (emptyValue, logEnabled) {
    return new JsTester_Container({
        logEnabled,
        emptyValue,
        appender: new JsTester_QueueItemAppender()
    });
}

function JsTester_Stack (emptyValue) {
    return new JsTester_Container({
        emptyValue: emptyValue,
        appender: new JsTester_StackItemAppender()
    });
}

function JsTester_UserMediaEventHandlers (debug) {
    function throwNoUserMediaRequested () {
        throw new Error('Ввод медиа-данных должен быть запрошен.');
    }

    var handlers = new JsTester_Queue(new JsTester_UserMediaEventHandlersItem({
        successHandler: throwNoUserMediaRequested,
        errorHandler: throwNoUserMediaRequested
    }));

    this.addHandlers = function (options) {
        var constraints = options.constraints,
            successHandler = options.successHandler,
            errorHandler = options.errorHandler;

        handlers.add(new JsTester_UserMediaEventHandlersItem({
            constraints: constraints,
            successHandler: successHandler,
            errorHandler: errorHandler,
            callStack: debug.getCallStack()
        }));
    };
    this.handleSuccess = function (createStream) {
        var handlersItem = handlers.pop();
        handlersItem.handleSuccess(createStream(handlersItem.getConstraints()));
    };
    this.handleError = function (error) {
        handlers.pop().handleError(error);
    };
    this.expectUserMediaToBeRequested = function () {
        handlers.pop();
    };
    this.assertNoUserMediaRequestLeftUnhandled = function (exceptions) {
        if (!handlers.isEmpty()) {
            exceptions.push(new Error('Запрос медиа-данных должен быть обработан. Стэк вызовов:' +
                handlers.pop().getCallStack() + "\n\n"));
        }

        handlers.removeAll();
    };
}

function JsTester_UserMedia (args) {
    var eventHandlers = args.eventHandlers,
        mediaStreams = args.mediaStreams,
        debug = args.debug,
        tracksCreationCallStacks = args.tracksCreationCallStacks,
        additionalDevices = args.additionalDevices,
        mediaDevicesEventListeners = args.mediaDevicesEventListeners,
        spendTime = args.spendTime;

    function handleDeviceChange () {
        mediaDevicesEventListeners.get('devicechange') && mediaDevicesEventListeners.get('devicechange').
            forEach(handleDeviceChange => handleDeviceChange());

        Promise.runAll(false, true);
        spendTime(0);
    }

    this.plugInNewDevice = () => {
        additionalDevices.push({
            kind: 'audiooutput',
            label: 'Колонка Marshall',
            deviceId: 'tg4j0oz8g03ogjgo3q8uj0qo83j40toto8s4jql83otul34tu84tz8utoz4tl8z4'
        });

        handleDeviceChange();
    };

    this.unplugDevice = function () {
        additionalDevices.splice(additionalDevices.findIndex(function (device) {
            return device.deviceId == 'g8294gjg29guslg82pgj2og8ogjwog8u29gj0pagulo48g92gj28ogtjog82jgab';
        }), 1);

        handleDeviceChange();
    };

    this.expectToBeRequested = function () {
        eventHandlers.expectUserMediaToBeRequested();
    };

    this.allowMediaInput = function () {
        var mediaStream;

        eventHandlers.handleSuccess(function (constraints) {
            var audioTrack = new JsTester_AudioTrack({
                mediaStreams: mediaStreams,
                constraints: constraints,
                tracksCreationCallStacks: tracksCreationCallStacks,
                debug: debug
            });

            mediaStream = new JsTester_MediaStreamWrapper({
                mediaStream: mediaStreams.create([audioTrack]),
                audioTrack: audioTrack
            });

            return mediaStream;
        });
        
        return mediaStream;
    };

    this.disallowMediaInput = function () {
        eventHandlers.handleError(new DOMException('Permission denied by system', 'NotAllowedError'));
    };
}

function JsTester_UserMediaGetter (eventHandlers) {
    return function (constraints, successHandler, errorHandler) {
        successHandler = successHandler || function() {};
        errorHandler = errorHandler || function() {};

        eventHandlers.addHandlers({
            constraints: constraints,
            successHandler: function (stream) {
                successHandler(stream);
            },
            errorHandler: function (error) {
                errorHandler(error);
            }
        });
    };
}

function JsTester_MediaDevicesUserMediaGetter (eventHandlers) {
    return function (constraints) {
        return new Promise(function (resolve, reject) {
            eventHandlers.addHandlers({
                constraints: constraints,
                successHandler: function (stream) {
                    resolve(stream);
                },
                errorHandler: function (error) {
                    reject(error);
                }
            });
        });
    };
}

function JsTester_NavigatorMock (args) {
    var me = this,
        navigator = window.navigator,
        additionalDevices = args.additionalDevices,
        mediaDevicesEventListeners = args.mediaDevicesEventListeners,
        getUserMedia = args.userMediaGetter,
        getMediaDevicesUserMedia = args.mediaDevicesUserMediaGetter,
        userDeviceHandling = args.userDeviceHandling;

    Object.defineProperty(window, 'navigator', {
        get: function () {
            return me;
        },
        set: function () {}
    });

    this.mediaSession = {
        setActionHandler: () => null,
    };

    this.mediaDevices = {
        getUserMedia: getMediaDevicesUserMedia,
        addEventListener: function (eventName, listener) {
            if (!mediaDevicesEventListeners.has(eventName)) {
                mediaDevicesEventListeners.set(eventName, []);
            }

            mediaDevicesEventListeners.get(eventName).push(listener);
        },
        enumerateDevices: function () {
            return new Promise.resolve([{
                kind: 'audioinput',
                label: 'По умолчанию',
                deviceId: 'default'
            }, {
                kind: 'audiooutput',
                label: 'По умолчанию',
                deviceId: 'default'
            }, {
                kind: 'audioinput',
                label: 'Встроенный микрофон',
                deviceId: '99036f0a1b112286e437e0692ed4f03f52a9865927fffb76e1a65a5b9fb446bb'
            }, {
                kind: 'audioinput',
                label: 'Микрофон SURE',
                deviceId: '98g2j2pg9842gi2gh89hl48ogh2og82h9g724hg427gla8g2hg289hg9a48ghal4'
            }, {
                kind: 'audiooutput',
                label: 'Встроенный динамик',
                deviceId: '6943f509802439f2c170bea3f42991df56faee134b25b3a2f2a13f0fad6943ab'
            }].concat(additionalDevices));
        }
    };

    Object.defineProperty(this.mediaDevices, 'ondevicechange', {
        get: function () {
            return userDeviceHandling.getListener('devicechange');
        },
        set: function (value) {
            userDeviceHandling.setListener('devicechange', value);
        }
    });

    this.getUserMedia = getUserMedia;
    this.userAgent = navigator.userAgent;
    this.vendor = navigator.vendor;
}

function JsTester_RTCConnectionSender (track) {
    this.replaceTrack = function (value) {
        track = value;
        return Promise.resolve();
    };

    Object.defineProperty(this, 'track', {
        set: function () {},
        get: function () {
            return track;
        }
    });
}

function JsTester_AudioTrack (options) {
    var enabled = true,
        me = this,
        mediaStreams = options.mediaStreams,
        constraints = options.constraints,
        tracksCreationCallStacks = options.tracksCreationCallStacks,
        debug = options.debug;

    tracksCreationCallStacks.set(me, debug.getCallStack());

    this.getSettings = function () {
        return constraints && constraints.audio && constraints.audio.deviceId && constraints.audio.deviceId.exact ? {
            deviceId: constraints.audio.deviceId.exact
        } : {};
    };

    this.stop = function () {};

    Object.defineProperty(this, 'kind', {
        set: function () {},
        get: function () {
            return 'audio';
        }
    });

    Object.defineProperty(this, 'enabled', {
        get: function () {
            return enabled;
        },
        set: function (value) {
            enabled = value;
            mediaStreams.setDisabled(me, !enabled);
        }
    });
}

function JsTester_MediaStreamWrapper (options) {
    var audioTrack = options.audioTrack,
        mediaStream = options.mediaStream;

    this.getTracks = function () {
        return [audioTrack];
    };

    this.getAudioTracks = function () {
        return [audioTrack];
    };

    Object.keys(this).forEach((function (key) {
        mediaStream[key] = this[key];
    }).bind(this));

    Object.defineProperty(mediaStream, 'active', {
        get: function () {
            return true;
        },
        set: function () {}
    });

    return mediaStream;
}

function JsTester_Variable () {
    var value = arguments.length == 0 ? false : arguments[0],
        isLogEnabled = arguments[1];

    this.createGetter = function () {
        return function () {
            return value;
        };
    };
    this.createSetter = function () {
        return function (newValue) {
            const isChanged = newValue !== value;
            value = newValue;

            return isChanged
        };
    };
}

function JsTester_RWVariable (value) {
    var variable = new JsTester_Variable(value);

    this.get = variable.createGetter();
    this.set = variable.createSetter();
}

function JsTester_RTCRtpReceiver (getTrack) {
    Object.defineProperty(this, 'track', {
        get: function () {
            return getTrack();
        },
        set: function (value) {
        }
    });
}

function JsTester_TrackHandler (args) {
    var call = function () {},
        callback = args.callback || function () {};

    this.setValue = function (value) {
        call = value || function () {};
    };

    this.call = function (event) {
        callback();
        call(event);
        this.setValue(null);
    };

    this.setValue(null);
}

function JsTester_RTCPeerConnection (options) {
    var connections = options.connections,
        mediaStreams = options.mediaStreams,
        tracksCreationCallStacks = options.tracksCreationCallStacks,
        debug = options.debug,
        sdp = options.sdp,
        spendTime = options.spendTime;

    return function (pcConfig) {
        var iceServers = ((pcConfig || {}).iceServers || []),
            localStream = null,
            sender = new JsTester_RTCConnectionSender(),
            iceConnectionState,
            remoteAudioTrack = new JsTester_AudioTrack({
                tracksCreationCallStacks: tracksCreationCallStacks,
                mediaStreams: mediaStreams,
                debug: debug
            }),
            getRemoteAudioTrack = function () {},
            trackHandler = new JsTester_TrackHandler({
                debug: debug,
                callback: function () {
                    getRemoteAudioTrack = function () {
                        return remoteAudioTrack;
                    }
                }
            }),
            ontrack,
            currentRemoteDescription,
            finishLastIceGathering = () => null,
            finishIceGathering = () => (this.iceGatheringState = 'complete');

        const iceGatheringFinishing = new JsTester_FunctionVariable(
            finishIceGathering => finishIceGathering()
        );

        const doFinishIceGathering = iceGatheringFinishing.createValueCaller();

        Object.defineProperty(this, 'iceConnectionState', {
            get: function () {
                return iceConnectionState;
            },
            set: function (value) {
                iceConnectionState = value;

                if (iceConnectionState == 'connected') {
                    mediaStreams.setDisconnected(remoteAudioTrack, false);
                } else {
                    mediaStreams.setDisconnected(remoteAudioTrack, true);
                }
            }
        });

        this.iceConnectionState = 'new';
        var eventHandlers = {};

        connections.push([eventHandlers, this, function () {
            return sender.track;
        }, trackHandler, iceServers, debug.getCallStack(), iceGatheringFinishing]);

        Object.defineProperty(this, 'ontrack', {
            get: function () {
                return trackHandler;
            },
            set: function (value) {
                ontrack = value;
                trackHandler.setValue(value);
            }
        });

        this.addEventListener = function (eventName, handler) {
            (eventHandlers[eventName] || (eventHandlers[eventName] = new Set())).add(handler);
        };
        this.removeEventListener = function (eventName, handler) {
            eventHandlers[eventName]?.delete(handler);
        };
        Object.defineProperty(this, 'currentRemoteDescription', {
            get: function () {
                return currentRemoteDescription;
            },
            set: function () {
            }
        });
        this.setRemoteDescription = function (sessionDescription) {
            return new Promise(function (resolve) {
                currentRemoteDescription = sessionDescription;
                resolve();
            });
        };
        this.setLocalDescription = function (description) {
            var me = this;

            return new Promise(function (resolve) {
                me.localDescription = description;

                finishLastIceGathering = () => {
                    finishIceGathering();
                    iceGatheringFinishing.setValue(() => null);
                };

                let doAfterIceGatheringFinishing = () => null;

                doFinishIceGathering(() => {
                    finishIceGathering();
                    doAfterIceGatheringFinishing();
                });

                doAfterIceGatheringFinishing = () => {
                    me.dispatchEvent(
                        new RTCPeerConnectionIceEvent('icecandidate', {
                            candidate: null 
                        })
                    );

                    spendTime(0);
                };

                resolve();
            });
        };
        function createPromise (type, doResolve) {
            return new Promise(function (resolve) {
                var description = new RTCSessionDescription();

                description.type = type;
                description.sdp = sdp;

                resolve(description);
            });
        }
        this.createAnswer = function () {
            return createPromise('answer');
        };
        this.createOffer = function () {
            return createPromise('offer');
        };
        this.addTrack = function (track, stream) {
            sender = new JsTester_RTCConnectionSender(track);
            localStream = stream;

            return sender;
        };
        this.getRemoteStreams = function () {
            return [(function (mediaStream) {
                return new JsTester_MediaStreamWrapper({
                    mediaStream: mediaStream,
                    audioTrack: remoteAudioTrack
                });
            })(mediaStreams.create([remoteAudioTrack]))];
        };
        this.getReceivers = function () {
            return [new JsTester_RTCRtpReceiver(function () {
                return getRemoteAudioTrack();
            })];
        };
        this.getSenders = function () {
            return [sender];
        };
        this.getStats = function () {
            return Promise.resolve([]);
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
        this.dispatchEvent = function (event) {
            event.type === 'icecandidate' && event.candidate === null && finishLastIceGathering();
            eventHandlers[event.type].forEach(handle => handle(event));
        };
    };
}

function JsTester_FunctionVariable (value) {
    this.setValue = function (v) {
        value = v;
    };

    this.createValueCaller = function (me) {
        return function () {
            value.apply(me || null, arguments);
        };
    };
}

function JsTester_RTCPeerConnectionTester (options) {
    var mediaStreamTracks = options.mediaStreamTracks,
        eventHandlers = options.eventHandlers,
        connection = options.connection,
        index = options.index,
        getLocalAudioTrack = options.getLocalAudioTrack,
        trackHandler = options.trackHandler,
        iceServers = options.iceServers,
        tracksCreationCallStacks = options.tracksCreationCallStacks,
        mediaStreams = options.mediaStreams,
        iceGatheringFinishing = options.iceGatheringFinishing;

    function isMute () {
        return !getLocalAudioTrack().enabled;
    }
    
    function getDeviceId () {
        return getLocalAudioTrack().getSettings().deviceId;
    }

    function handleEvent (eventName, args) {
        var handlers = eventHandlers[eventName];

        if (handlers) {
            handlers.forEach(function (handler) {
                handler.apply(null, args);
            });
        }
    }

    this.expectLocalTrackToBe = function (expectedTrack) {
        var localAudioTrack = getLocalAudioTrack();

        if (!localAudioTrack && expectedTrack) {
            throw new Error('Никакой трек не проигрывается.');
        }

        if (localAudioTrack !== expectedTrack) {
            throw new Error('Ожидаемый трек не проигрывается.' + (tracksCreationCallStacks.has(localAudioTrack) ?
                (tracksCreationCallStacks.get(localAudioTrack) + "\n\n") : ''));
        }
    };

    this.expectRemoteSinkIdToEqual = function (sinkId) {
        var track = this.getRemoteAudioTrack();

        if (!mediaStreamTracks.has(track)) {
            throw new Error('Звук должнен звучать.');
        }

        mediaStreams.expectSinkIdToEqual(mediaStreamTracks.get(track).mediaStream, sinkId);
    };

    this.expectRemoteStreamToHaveVolume = function (expectedVolume) {
        var track = this.getRemoteAudioTrack();

        if (!mediaStreamTracks.has(track)) {
            throw new Error('Звук должнен звучать.');
        }

        mediaStreams.expectVolumeToEqual(mediaStreamTracks.get(track).mediaStream, expectedVolume);
    };

    this.getLocalAudioTrack = getLocalAudioTrack;

    this.getRemoteAudioTrack = function () {
        return connection.getReceivers()[0].track;
    };

    this.getRemoteStream = function () {
        return connection.getRemoteStreams()[0];
    };

    this.delayIceGatheringFinishing  = function () {
        let resume;
        iceGatheringFinishing.setValue(finishIceGathering => (resume = finishIceGathering));

        return function () {
            if (!resume) {
                throw new Error('Offer creating did not started yet');
            }

            resume();
        };
    };

    this.callTrackHandler = function () {
        trackHandler.call([{
            streams: connection.getRemoteStreams()
        }]);
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

    this.expectInputDeviceNotToBeSpecified = function () {
        var actualValue = getDeviceId();

        if (actualValue) {
            throw new Error('Устройство не должно быть выбрано, однако было выбрано устройство ' + actualValue + '.');
        }
    };

    this.expectInputDeviceIdToEqual = function (expectedValue) {
        var actualValue = getDeviceId();

        if (!actualValue) {
            throw new Error('Устройство не выбрано.');
        }

        if (actualValue != expectedValue) {
            throw new Error('Идентификатор устройства должен быть равен ' + expectedValue + ', а не ' + actualValue +
                '.');
        }
    };

    this.expectToBeMute = function () {
        if (!isMute()) {
            throw new Error('Микрофон должен быть выключен');
        }
    };

    this.expectNotToBeMute = function () {
        if (isMute()) {
            throw new Error('Микрофон не должен быть выключен');
        }
    };

    this.addCandidate = function () {
        handleEvent('icecandidate', [{}]);
    };

    this.expectToHaveIceServer = function (expectedIceServer) {
        var urls = (iceServers || []).reduce(function (result, value) {
            return value.urls ? result.concat(Array.isArray(value.urls) ? value.urls : [value.urls]) : result;
        }, []);

        if (!urls.length) {
            throw new Error('ICE-сервера не найдены, тогда, как должен быть найден сервер "' + expectedIceServer + '"');
        }

        if (!urls.find(url => url == expectedIceServer)) {
            throw new Error('ICE-сервер "' + expectedIceServer + '" не найден, однако найдены такие сервера "' +
                urls.join('", "') + '"');
        }
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
        stateChecker = options.stateChecker,
        tracksCreationCallStacks = options.tracksCreationCallStacks,
        mediaStreamTracks = options.mediaStreamTracks,
        mediaStreams = options.mediaStreams;

    this.getConnectionAtIndex = function (index) {
        var connectionsCount = connections.length;

        if (index >= connectionsCount) {
            throw new Error('Всего было создано ' + connectionsCount + ' RTC-соединений, тогда как их должно быть ' +
                'как минимум ' + (index + 1) + '.');
        }

        var options = connections[index];

        return new JsTester_RTCPeerConnectionTester({
            mediaStreams: mediaStreams,
            mediaStreamTracks: mediaStreamTracks,
            tracksCreationCallStacks: tracksCreationCallStacks,
            eventHandlers: options[0],
            connection: options[1],
            getLocalAudioTrack: options[2],
            trackHandler: options[3],
            iceServers: options[4],
            iceGatheringFinishing: options[6],
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
        mediaStreams = options.mediaStreams,
        debug = options.debug,
        RealRCTPreerConnection = RTCPeerConnection,
        sdp = options.sdp,
        tracksCreationCallStacks = options.tracksCreationCallStacks,
        spendTime = options.spendTime,
        RTCPeerConnectionMock = new JsTester_RTCPeerConnection({
            connections: connections,
            mediaStreams: mediaStreams,
            debug: debug,
            tracksCreationCallStacks: tracksCreationCallStacks,
            sdp: sdp,
            spendTime,
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

        values[key] = value + '';
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
        currentLocalStorage = realLocalStorage,
        realSessionStorage = window.sessionStorage,
        currentSessionStorage = realSessionStorage;

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

function JsTester_CommandExecutor (copiedTexts) {
    return function (type) {
        type == 'copy' && copiedTexts.push(window.getSelection().toString());
    };
}

function JsTester_ExecCommandReplacer (copiedTexts) {
    var execCommand = document.execCommand;

    this.replaceByFake = function () {
        copiedTexts.splice(0, copiedTexts.length);
        document.execCommand = new JsTester_CommandExecutor(copiedTexts);
    };

    this.restoreReal = function () {
        document.execCommand = execCommand;
    };
}

function JsTester_CopiedText (text) {
    return {
        expectToEqual: function (expectedText) {
            if (text != expectedText) {
                throw new Error('Должен быть скопирован текст "' + expectedText + '", а не "' + text + '".');
            }
        }
    };
}

function JsTester_CopiedTextsTester (copiedTexts) {
    return {
        getLast: function () {
            var length = copiedTexts.length;

            if (!length) {
                throw new Error('Не один текст не был скопирован.');
            }

            return new JsTester_CopiedText(copiedTexts[length - 1]);
        }
    };
}

function JsTester_CookieTester (cookie) {
    Object.defineProperty(document, 'cookie', {
        get: function () {
            return cookie.get();
        },
        set: function (value) {
            cookie.set(value);
        }
    });

    return {
        expectToEqual: function (expectedValue) {
            if (expectedValue != cookie.get()) {
                throw new Error(
                    'В куки должна быть такая строка "' + expectedValue + '", однако там сохранена такая строка "' +
                    cookie.get() + '".'
                );
            }
        }
    };
}

function JsTester_RTCConnectionStateChecker (connections) {
    return function (exceptions) {
        var connection = connections.find(function (connection) {
            return connection[1].iceConnectionState == 'new';
        });

        connection && exceptions.push(new Error(
            'Было создано RTC соединение, которое еще не было подключено' + connection[5]
        ));
    };
}

function JsTester_Audio (args) {
    var mediaStreams = args.mediaStreams,
        debug = args.debug,
        maybeUnsetSource,
        options = {},
        mediaStream,
        mediaStreamProxy = {},
        me = this;

    var audioEndListeners = {
        ended: new Map(),
        canplaythrough: new Map()
    };

    [
        'play',
        'stop',
        'setCyclical',
        'setVolume',
        'setMuted',
        'setSinkId',
        'addAudioEndListener',
        'removeAudioEndListener'
    ].forEach(function (methodName) {
        mediaStreamProxy[methodName] = function () {
            if (!mediaStream) {
                return;
            }

            mediaStreams[methodName].apply(mediaStreams,
                [mediaStream].concat(Array.prototype.slice.call(arguments, 0)));
        };
    });

    function applyOptions () {
        mediaStreamProxy.setCyclical(options.loop);
        mediaStreamProxy.setVolume(options.volume);
        mediaStreamProxy.setMuted(options.muted);
        mediaStreamProxy.setSinkId(options.sinkId);
    }

    Object.defineProperty(this, 'srcObject', {
        get: function () {
            return mediaStream;
        },
        set: function (value) {
            maybeUnsetSource();
            setSource(value);
        }
    });

    Object.defineProperty(this, 'loop', {
        get: function () {
            return options.loop;
        },
        set: function (value) {
            options.loop = value;
            mediaStreamProxy.setCyclical(options.loop);
        }
    });

    Object.defineProperty(this, 'volume', {
        get: function () {
            return options.volume;
        },
        set: function (value) {
            options.volume = value;
            mediaStreamProxy.setVolume(options.volume);
        }
    });

    Object.defineProperty(me, 'muted', {
        get: function () {
            return options.muted;
        },
        set: function (value) {
            options.muted = value;
            applyOptions();
        }
    });

    this.addEventListener = function (eventName, listener) {
        if (!audioEndListeners[eventName]) {
            return;
        }

        audioEndListeners[eventName].set(listener, listener);
        mediaStreamProxy.addAudioEndListener(eventName, listener);
    };
    this.removeEventListener = function (eventName, listener) {
        if (eventName != 'ended') {
            return;
        }

        audioEndListeners[eventName].delete(listener);
        mediaStreamProxy.removeAudioEndListener(eventName, listener);
    };
    this.play = function () {
        mediaStreamProxy.play();
        return Promise.resolve();
    };
    this.pause = function () {
        mediaStreamProxy.stop();
        return Promise.resolve();
    };

    var canPlayThroughListener = function () {};

    Object.defineProperty(this, 'oncanplaythrough', {
        get: function () {
            return canPlayThroughListener;
        },
        set: function (listener) {
            mediaStream && audioEndListeners.canplaythrough.forEach(function (listener) {
                mediaStreams.removeAudioEndListener(mediaStream, 'canplaythrough', listener);
            });

            audioEndListeners.canplaythrough.clear();
            audioEndListeners.canplaythrough.set(listener, listener);
            mediaStream && mediaStreams.addAudioEndListener(mediaStream, 'canplaythrough', listener);

            canPlayThroughListener = listener;
        }
    });     

    this.setSinkId = function (value) {
        options.sinkId = value;
        mediaStreamProxy.setSinkId(options.sinkId);
    };

    function unsetSource () {
        Object.entries(audioEndListeners).forEach(function (entry) {
            entry[1].forEach(function (listener) {
                mediaStreams.removeAudioEndListener(mediaStream, entry[0], listener);
            })
        });

        mediaStreams.stop(mediaStream);
    }

    function setSource (value) {
        mediaStream = value;

        if (mediaStream) {
            Object.entries(audioEndListeners).forEach(function (entry) {
                entry[1].forEach(function (listener) {
                    mediaStreams.addAudioEndListener(mediaStream, entry[0], listener);
                })
            });

            mediaStreams.register(mediaStream);
            applyOptions();
            maybeUnsetSource = unsetSource;
        } else {
            maybeUnsetSource = function () {};
        }
    }

    this.loop = false;
    this.volume = 1;
    this.muted = false;
    this.setSinkId('default');
    this.load = () => null;

    setSource(args.mediaStream);
}

function JsTester_AudioReplacer (options) {
    var mediaStreams = options.mediaStreams,
        debug = options.debug,
        realAudio = window.Audio;

    this.replaceByFake = function () {
        window.Audio = function (mediaStream) {
            return new JsTester_Audio({
                mediaStreams: mediaStreams,
                mediaStream: mediaStream,
                debug: debug
            });
        };
    };
    this.restoreReal = function () {
        window.Audio = realAudio;
    };
}

function JsTester_MediaStreamsPlayingExpectation (args) {
    var mediaStreamsTester = args.mediaStreamsTester,
        mediaStreamTracks = args.mediaStreamTracks,
        streams = [],
        me = this;

    this.addStream = function (stream) {
        streams.push(stream);
        return me;
    };
    this.addTrack = function (track) {
        if (!mediaStreamTracks.has(track)) {
            throw new Error('Звук должнен звучать.');
        }

        streams.push(mediaStreamTracks.get(track).mediaStream);
        return me;
    };
    this.expectStreamsToPlay = function () {
        mediaStreamsTester.expectStreamsToPlay.apply(mediaStreamsTester, streams);
    };
}

function JsTester_MediaStreamsPlayingExpectationFactory (mediaStreamTracks) {
    return function (mediaStreamsTester) {
        return new JsTester_MediaStreamsPlayingExpectation({
            mediaStreamTracks: mediaStreamTracks,
            mediaStreamsTester: mediaStreamsTester
        });
    };
}

function JsTester_MediaStreamsTester ({spendTime, ...options}) {
    var createMediaStreamsPlayingExpectaion = options.mediaStreamsPlayingExpectaionFactory,
        playingMediaStreams = options.playingMediaStreams,
        mediaStreams = options.mediaStreams,
        me = this;

    function throwStreamShouldNotPlay (callStack) {
        throw new Error('Звук не должен звучать.' + "\n\n" + callStack);
    }

    this.finish = function (mediaStream) {
        mediaStreams.finish(mediaStream);
    };

    this.setIsAbleToPlayThough = function (mediaStream) {
        mediaStreams.setIsAbleToPlayThough(mediaStream);
        spendTime(0);
    };

    this.expectNoStreamToPlay = function () {
        if (playingMediaStreams.size) {
            playingMediaStreams.forEach(throwStreamShouldNotPlay);
        }
    };

    this.createStreamsPlayingExpectation = function () {
        return createMediaStreamsPlayingExpectaion(this);
    };

    this.expectTrackToPlay = function (track) {
        if (!track) {
            throw new Error('Переданный трек является пустым значением.');
        }

        this.createStreamsPlayingExpectation().addTrack(track).expectStreamsToPlay();
    };

    ['expectVolumeToEqual', 'expectSinkIdToEqual'].forEach(function (methodName) {
        me[methodName] = function (mediaStream, expectedValue) {
            mediaStreams[methodName](mediaStream, expectedValue);
        };
    });

    this.expectStreamsToPlay = function () {
        var map = new Map(),
            streams = Array.prototype.slice.call(arguments, 0);

        streams.forEach(function (stream) {
            if (!playingMediaStreams.has(stream)) {
                throw new Error('Звук должнен звучать.');
            }

            map.set(stream, true);
        });

        if (map.size != playingMediaStreams.size) {
            playingMediaStreams.forEach(function (callStack, mediaStream) {
                if (!map.has(mediaStream)) {
                    throwStreamShouldNotPlay(callStack);
                }
            });
        }
    };
}

function JsTester_MediaStreamSource (args) {
    var stream = args.stream,
        audioNodesConnection = args.audioNodesConnection,
        mediaStreamSourceToMediaStream = args.mediaStreamSourceToMediaStream;

    mediaStreamSourceToMediaStream.set(this, stream);

    this.connect = function (node) {
        audioNodesConnection.connect(this, node);
    };
}

function JsTester_Gain (audioNodesConnection) {
    var value,
        me = this;

    this.connect = function (node) {
        audioNodesConnection.connect(this, node);
    };

    this.disconnect = function () {
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
                    audioNodesConnection.setGainValue(me, value)
                }
            });

            return gain;
        },
        set: function () {}
    });     
}

function JsTester_MediaStreamDestination (args) {
    var track = {},
        bufferToContent = args.bufferToContent,
        destinationToSource = args.destinationToSource,
        trackToDestination = args.trackToDestination,
        mediaStreams = args.mediaStreams,
        tracksCreationCallStacks = args.tracksCreationCallStacks,
        debug = args.debug;

    var audioTrack = new JsTester_AudioTrack({
        tracksCreationCallStacks: tracksCreationCallStacks,
        mediaStreams: mediaStreams,
        debug: debug
    });

    var stream = new JsTester_MediaStreamWrapper({
        mediaStream: mediaStreams.create([audioTrack]),
        audioTrack: audioTrack
    });

    trackToDestination.set(audioTrack, this);

    Object.defineProperty(this, 'stream', {
        get: function () {
            return stream;
        },
        set: function () {}
    });     
}

function JsTester_AudioBufferSourceNode (args) {
    var destinationToSource = args.destinationToSource,
        audioNodesConnection = args.audioNodesConnection;

    this.disconnect = function () {
    };

    this.connect = function (value) {
        audioNodesConnection.connect(this, value);
    };

    this.start = function () {
    };

    this.stop = function () {
    };

    var playbackRate = new JsTester_PlaybackRate(),
        buffer;

    Object.defineProperty(this, 'buffer', {
        get: function () {
            return buffer;
        },
        set: function (value) {
            buffer = value;
        }
    });

    Object.defineProperty(this, 'playbackRate', {
        get: function () {
            return playbackRate;
        },
        set: function () {}
    });
}

function JsTester_PlaybackRate () {
    this.setValueAtTime = function () {
    };
}

function JsTester_Frequency (args) {
    var value = args.value,
        debug = args.debug,
        frequency;

    Object.defineProperty(this, 'value', {
        get: function () {
            return frequency;
        },
        set: function (newValue) {
            value.frequency = frequency = newValue;
            value.frequencySetCallStack = debug.getCallStack();
        }
    });
}

function JsTester_Oscillator (args) {
    var frequency,
        playingOscillators = args.playingOscillators,
        debug = args.debug,
        me = this,
        value = {};

    var frequency = new JsTester_Frequency({
        value: value,
        debug: debug
    });

    Object.defineProperty(this, 'frequency', {
        get: function () {
            return frequency;
        },
        set: function () {}
    });

    this.start = function () {
        value.startCallStack = debug.getCallStack();
        playingOscillators.set(this, value);
    };
    this.stop = function () {
        playingOscillators.delete(this);
    };
    this.connect = function () {};
}

function JsTester_PlayingOscillatorsTester (playingOscillators) {
    this.expectNoFrequenciesToPlay = function () {
        this.expectFrequenciesToPlay();
    };
    this.expectFrequenciesToPlay = function () {
        var expectedFrequencies = new Map();

        Array.prototype.slice.call(arguments, 0).forEach(function (frequency) {
            expectedFrequencies.set(frequency, true);
        });

        playingOscillators.forEach(function (oscillator) {
            var frequency = oscillator.frequency;

            if (!expectedFrequencies.has(frequency)) {
                throw new Error('Частота ' + frequency + ' не должна звучать.' + "\n\n" + oscillator.startCallStack +
                    "\n\n" + oscillator.frequencySetCallStack);
            }

            expectedFrequencies.delete(frequency);
        });

        expectedFrequencies.forEach(function () {
            throw new Error('Частота ' + arguments[1] + ' должна звучать.');
        });
    };
}

function JsTester_BiquadFilter (debug) {
    var frequency = new JsTester_Frequency({
        value: {},
        debug: debug
    });
    
    Object.defineProperty(this, 'frequency', {
        get: function () {
            return frequency;
        },
        set: function () {}
    }); 

    this.connect = function () {};
}

function JsTester_TypedArray () {
    var array = [];

    this.set = function (items, start) {
        array.splice.apply(array, [start, 0].concat(items));
    };
}

function JsTester_Buffer (args) {
    Object.defineProperty(this, 'length', {
        get: function () {
            return 1;
        },
        set: function () {}
    }); 

    Object.defineProperty(this, 'sampleRate', {
        get: function () {
            return 1;
        },
        set: function () {}
    }); 

    Object.defineProperty(this, 'numberOfChannels', {
        get: function () {
            return 1;
        },
        set: function () {}
    }); 
    
    this.getChannelData = function (index) {
        return new JsTester_TypedArray();
    };
}

function JsTester_AudioNode () {
    this.connect = function () {
    };

    this.disconnect = function () {
    };
}

function JsTester_AudioContextMock (args) {
    var audioDecodingTasks = args.audioDecodingTasks,
        debug = args.debug,
        utils = args.utils,
        bufferToContent = args.bufferToContent,
        destinationToSource = args.destinationToSource,
        trackToDestination = args.trackToDestination,
        mediaStreams = args.mediaStreams,
        tracksCreationCallStacks = args.tracksCreationCallStacks,
        audioNodesConnection = args.audioNodesConnection,
        mediaStreamSourceToMediaStream = args.mediaStreamSourceToMediaStream;

    function addAudioDecodingTask (args) {
        var buffer = args.buffer,
            callback = args.callback,
            failure = args.failure;

        audioDecodingTasks.add({
            callStack: debug.getCallStack(),
            callback: function () {
                callback(buffer);
            },
            failure: function () {
                failure(new DOMException('Unable to decode audio data', 'UnableToDecodeAudioData'));
            }
        });
    }
    this.createBuffer = function (arguments) {
        return new JsTester_Buffer(Array.prototype.slice.call(arguments, 0));
    };
    this.createAnalyser = function () {
        return new JsTester_AudioNode();
    };
    this.createScriptProcessor = function () {
        return new JsTester_AudioNode();
    };
    this.decodeAudioData = function (buffer) {
        var fakeBuffer = new JsTester_Buffer(),
            binary = '',
            bytes = new Uint8Array(buffer),
            length = bytes.byteLength,
            i;

        for (i = 0; i < length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }

        bufferToContent.set(fakeBuffer, window.btoa(binary));

        if (arguments.length == 1) {
            return new Promise(function (resolve, reject) {
                addAudioDecodingTask({
                    buffer: fakeBuffer,
                    callback: resolve,
                    failure: reject
                });
            });
        }

        addAudioDecodingTask({
            buffer: fakeBuffer,
            callback: arguments[1],
            failure: arguments[2]
        });
    };
    this.createBufferSource = function () {
        return new JsTester_AudioBufferSourceNode({
            destinationToSource: destinationToSource,
            audioNodesConnection: audioNodesConnection
        });
    };
    this.createMediaStreamSource = function (stream) {
        return new JsTester_MediaStreamSource({
            stream: stream,
            audioNodesConnection: audioNodesConnection,
            mediaStreamSourceToMediaStream: mediaStreamSourceToMediaStream
        });
    };
    this.createGain = function () {
        return new JsTester_Gain(audioNodesConnection);
    };
    this.createMediaStreamDestination = function () {
        return new JsTester_MediaStreamDestination({
            debug: debug,
            destinationToSource: destinationToSource,
            bufferToContent: bufferToContent,
            trackToDestination: trackToDestination,
            tracksCreationCallStacks: tracksCreationCallStacks,
            mediaStreams: mediaStreams
        });
    };
    this.createOscillator = function () {
        return new JsTester_Oscillator(args);
    };
    this.createBiquadFilter = function () {
        return new JsTester_BiquadFilter(debug);
    };
}

function JsTester_AudioDecodingTester ({
    audioDecodingTasks,
    factory,
    spendTime
}) {
    this.failToDecodeAudio = function () {
        audioDecodingTasks.pop().failure();
        Promise.runAll(false, true);
    };
    this.accomplishAudioDecoding = function () {
        audioDecodingTasks.pop().callback();

        spendTime(0);
        spendTime(0);
        spendTime(0);
    };
    this.expectAudioDecodingToHappen = function () {
        audioDecodingTasks.pop();
    };
    this.expectNoAudioDecodingToHappen = function () {
        var exceptions = [];
        factory.assertNoAudioDecodingHappens(exceptions);

        exceptions.forEach(function (exception) {
            throw exception;
        });
    };
}

function JsTester_AudioContextFactory (args) {
    var audioDecodingTasks = new JsTester_Queue({
        callback: function () {
            throw new Error('В данный момент должно происходить декодирование.');
        },
        failure: function () {
            throw new Error('В данный момент должно происходить декодирование.');
        }
    });

    args.audioDecodingTasks = audioDecodingTasks;

    this.reset = function () {
        audioDecodingTasks.removeAll();
    };
    this.assertNoAudioDecodingHappens = function (exceptions) {
        !audioDecodingTasks.isEmpty() && exceptions.push(new Error(
            'В данный момент не должно происходить декодирование. ' + "\n\n" +
            audioDecodingTasks.pop().callStack + "\n\n\n\n"
        ));
    };
    this.createAudioDecodingTester = function () {
        return new JsTester_AudioDecodingTester({
            audioDecodingTasks,
            spendTime: args.spendTime,
            factory: this
        });
    };
    this.createAudioContext = function () {
        return new JsTester_AudioContextMock(args);
    };
}

function JsTester_AudioContextReplacer (audioContextFactory) {
    var RealAudioContext = window.AudioContext;

    this.replaceByFake = function () {
        window.AudioContext = audioContextFactory.createAudioContext;
    };
    this.restoreReal = function () {
        window.AudioContext = RealAudioContext;
    };
}

function JsTester_MediaStream (track) {
    this.getTracks = function () {
        return [track];
    };
    this.getAudioTracks = function () {
        return [track];
    };
    this.getVideoTracks = function () {
        return [];
    };
}

function JsTester_StateCounter (args) {
    var tracksCount = args.tracksCount,
        setState = args.stateSetter,
        disconnectedTracksCount = 0;

    this.increase = function () {
        disconnectedTracksCount ++;
        (tracksCount == disconnectedTracksCount) && setState(true);
    };
    this.decrease = function () {
        disconnectedTracksCount --;
        setState(false);
    };
}

function JsTester_CountingState (stateCounter) {
    var disable,
        enable;

    function setInitalBehaviour () {
        disable = stateCounter.increase;
        enable = function () {};
    }
    this.disable = function () {
        disable();
        disable = function () {};
        enable = stateCounter.decrease;
    };
    this.enable = function () {
        enable();
        setInitalBehaviour();
    };

    setInitalBehaviour();
}

function JsTester_MediaStreamPlayingState(options) {
    var mediaStream = options.mediaStream,
        playingMediaStreams = options.playingMediaStreams,
        audioEndListeners = options.audioEndListeners,
        debug = options.debug,
        maybeFinish,
        maybeStop,
        audioNodesCount,
        maybeThrowIsNotPlaying;

    var state = {
        volume: 1,
        playing: false,
        disabled: true,
        muted: false,
        disconnected: false,
        sourcesStopped: false
    };

    function setState (key, value) {
        if (state[key] === value) {
            return;
        }

        state[key] = value;
        var hasMediaStream = playingMediaStreams.has(mediaStream);

        if (
            state.playing &&
            !state.disabled &&
            !state.muted &&
            !state.disconnected &&
            !state.sourcesStopped &&
            state.volume
        ) {
            !hasMediaStream && playingMediaStreams.set(mediaStream, debug.getCallStack());
            maybeThrowIsNotPlaying = function () {};
        } else {
            hasMediaStream && playingMediaStreams.delete(mediaStream);
            maybeThrowIsNotPlaying = throwIsNotPlaying;
        }
    }
    function setNotPlaying () {
        maybeStop = function () {};
        setState('playing', false);
    }
    function throwIsCyclical () {
        throw new Error('Не удалось закончить воспроизведение звука, так как он проигрывается в цикле.');
    }
    function throwIsNotPlaying () {
        throw new Error('Не удалось закончить воспроизведение звука, так как он и не воспроизводится в данный момент.');
    }
    function stop () {
        audioNodesCount --;

        if (!audioNodesCount) {
            setNotPlaying();
        }
    }
    function finish () {
        maybeThrowIsNotPlaying();
        stop();
        audioEndListeners.ended.forEach(function (listener) {
            listener();
        });
    }
    this.play = function () {
        if (audioNodesCount == 0) {
            maybeStop = stop;
            setState('playing', true);
        } else {
            console.log('Одинаковые звуки воспроизводятся одновременно. Может быть что-то пошло не так?' + "\n\n" +
                debug.getCallStack());
        }

        audioNodesCount ++;
    };
    this.setVolume = function (value) {
        setState('volume', value);
    };
    this.setDisconnected = function (value) {
        setState('disconnected', value);
    };
    this.setDisabled = function (value) {
        setState('disabled', value);
    };
    this.setMuted = function (value) {
        setState('muted', value);
    };
    this.setSourceStopped = function (value) {
        setState('sourcesStopped', value);
    };
    this.setCyclical = function (value) {
        maybeFinish = value ? throwIsCyclical : finish;
    };
    this.finish = function () {
        maybeFinish();
    };
    this.stop = function () {
        maybeStop();
    };
    this.reset = function () {
        audioNodesCount = 0;
        setNotPlaying();
        this.setDisconnected(false);
        this.setDisabled(false);
        this.setMuted(false);
        this.setSourceStopped(false);
    };

    this.setCyclical(false);
    this.reset();
}

function JsTester_MediaStreams (options) {
    var mediaStreams = new Map(),
        playingMediaStreams = options.playingMediaStreams,
        mediaStreamTracks = options.mediaStreamTracks,
        debug = options.debug,
        RealMediaStream = options.RealMediaStream,
        audioSources = options.audioSources,
        initialMediaStreams = new Map(),
        initialMediaStreamTracks = new Map();

    function createInitialObjectsMap (objects, initialObjectsMap) {
        objects.forEach(function (value, key) {
            initialObjectsMap.set(key, true);
        });
    }

    this.considerInitial = function () {
        initialMediaStreams = new Map();
        initialMediaStreamTracks = new Map();

        createInitialObjectsMap(mediaStreams, initialMediaStreams);
        createInitialObjectsMap(initialMediaStreamTracks, initialMediaStreamTracks);
    };

    function removeNonInitialObjects (objects, initialObjectsMap, handleInitialObject) {
        objects.forEach(function (value, key) {
            if (initialMediaStreams.has(key)) {
                handleInitialObject(value);
            } else {
                objects.delete(key);
            }
        });
    }

    this.clear = function () {
        removeNonInitialObjects(mediaStreams, initialMediaStreams, function (item) {
            item.mediaStreamPlayingState.reset();
        });

        removeNonInitialObjects(mediaStreamTracks, initialMediaStreamTracks, function () {});
        playingMediaStreams.clear();
    };

    this.register = function (mediaStream, tracks) {
        tracks = tracks || [];

        if (mediaStreams.has(mediaStream)) {
            return;
        }

        var audioEndListeners = {
            ended: new Map(),
            canplaythrough: new Map()
        };

        var mediaStreamPlayingState = new JsTester_MediaStreamPlayingState({
            mediaStream: mediaStream,
            playingMediaStreams: playingMediaStreams,
            audioEndListeners: audioEndListeners,
            debug: debug
        });

        var trackDisconnectednessCounter = new JsTester_StateCounter({
            tracksCount: tracks.length,
            stateSetter: mediaStreamPlayingState.setDisconnected
        });

        var trackUnavailabilityCounter = new JsTester_StateCounter({
            tracksCount: tracks.length,
            stateSetter: mediaStreamPlayingState.setDisabled
        });

        tracks.forEach(function (track) {
            mediaStreamTracks.set(track, {
                mediaStream: mediaStream,
                trackDisconnectedness: new JsTester_CountingState(trackDisconnectednessCounter),
                trackUnavailability: new JsTester_CountingState(trackUnavailabilityCounter)
            });
        });

        mediaStreams.set(mediaStream, {
            audioEndListeners: audioEndListeners,
            mediaStreamPlayingState: mediaStreamPlayingState,
            volume: 1,
            muted: false,
        });
    };

    this.create = function (tracks) {
        var mediaStream = new RealMediaStream();
        this.register(mediaStream, tracks);
        return mediaStream;
    };

    [
        ['setDisabled', 'trackUnavailability'],
        ['setDisconnected', 'trackDisconnectedness']
    ].forEach((function (args) {
        var methodName = args[0],
            stateName = args[1];

        this[methodName] = function (track, value) {
            var trackState = mediaStreamTracks.get(track);
            trackState && trackState[stateName][value ? 'disable' : 'enable']();
        };
    }).bind(this));

    [
        'finish',
        'play',
        'stop',
        'setCyclical',
        'setMuted',
    ].forEach((function (methodName) {
        this[methodName] = function () {
            var args = Array.prototype.slice.call(arguments, 0),
                mediaStream = args.shift(),
                mediaStreamPlayingState = mediaStreams.get(mediaStream).mediaStreamPlayingState;

            mediaStreamPlayingState[methodName].apply(mediaStreamPlayingState, args);
        };
    }).bind(this));

    this.setVolume = function (mediaStream, value) {
        expectMediaStreamToExist(mediaStream);
        mediaStreams.get(mediaStream).volume = value;
        mediaStreams.get(mediaStream).mediaStreamPlayingState.setVolume(value);
    };

    this.setSinkId = function (mediaStream, value) {
        mediaStreams.get(mediaStream).sinkId = value;
    };

    this.expectVolumeToEqual = function (mediaStream, expectedVolume) {
        expectMediaStreamToExist(mediaStream);

        var actualVolume = parseInt(mediaStreams.get(mediaStream).volume * 100, 0);

        if (expectedVolume != actualVolume) {
            throw new Error('Громкость звука должна быть ' + expectedVolume + '%, а не ' + actualVolume + '%.');
        }
    };

    this.expectSinkIdToEqual = function (mediaStream, expectedSinkId) {
        var actualSinkId = mediaStreams.get(mediaStream).sinkId;

        if (expectedSinkId != actualSinkId) {
            throw new Error('Идентификатор устройства должен быть таким - "' + expectedSinkId + '", а не такими - "' +
                actualSinkId + '".');
        }
    };

    function expectMediaStreamToExist (mediaStream) {
        if (!mediaStreams.get(mediaStream)) {
            throw new Error('Медиа-поток не найден.');
        }
    }

    this.setIsAbleToPlayThough = function (mediaStream) {
        expectMediaStreamToExist(mediaStream);

        mediaStreams.get(mediaStream).audioEndListeners.canplaythrough.forEach(function (listener) {
            listener();
        });
    };

    this.addAudioEndListener = function (mediaStream, eventName, listener) {
        mediaStreams.get(mediaStream).audioEndListeners[eventName].set(listener, listener);
    };

    this.removeAudioEndListener = function (mediaStream, eventName, listener) {
        if (!mediaStreams.get(mediaStream).audioEndListeners[eventName]) {
            console.trace(eventName);
        }
        mediaStreams.get(mediaStream).audioEndListeners[eventName].delete(listener);
    };
}

function JsTester_NowGetter (args) {
    var originalNow = args.originalNow,
        getNow = args.getNow;

    return function () {
        return getNow() || originalNow.call(Date);
    };
}

function JsTester_Now (args) {
    var originalNow = args.originalNow,
        getNow = args.getNow;

    this.replaceByFake = function () {
        Date.now = getNow;
    };
    this.restoreReal = function () {
        Date.now = originalNow;
    };
}

function JsTester_NowSetter (setNow) {
    return function (value) {
        setNow(value ? Date.parse(value) : null);
    };
}

function JsTester_WindowEventsFirerer (windowEventsListeners) {
    return function (eventName) {
        var args = Array.prototype.slice.call(arguments, 1);

        (windowEventsListeners.get(eventName) || []).forEach(function ([eventListener, useCapture]) {
            eventListener.apply(null, args);
        });
    };
}

function JsTester_EventListenerAssigner (args) {
    var object = args.object,
        eventsListeners = args.eventsListeners,
        realEventListenerAssigner = args.realEventListenerAssigner;

    return function (eventName, eventListener, useCapture) {
        if (!eventsListeners.has(eventName)) {
            eventsListeners.set(eventName, []);
        }

        eventsListeners.get(eventName).push([eventListener, useCapture]);
        realEventListenerAssigner.apply(object, arguments);
    };
}

function JsTester_EventsReplacer (args) {
    var object = args.object,
        eventsListeners = args.eventsListeners,
        fakeListenerAssigner = args.fakeListenerAssigner,
        realEventListenerAssigner = args.realEventListenerAssigner,
        originalEventsListeners = new Map();

    function setOriginal () {
        eventsListeners.forEach(function (eventListeners, eventName) {
            originalEventsListeners.set(eventName, eventListeners.slice(0));
        });

        maybeSetOriginal = function () {};
    }
    this.prepareToTest = function () {
        maybeSetOriginal();
        this.replaceByFake();
    };
    this.replaceByFake = function () {
        object.addEventListener = fakeListenerAssigner;
    };
    this.restoreReal = function () {
        object.addEventListener = realEventListenerAssigner;

        eventsListeners.forEach(function (eventListeners, eventName) {
            eventListeners.forEach(function ([listener, useCapture]) {
                object.removeEventListener(eventName, listener, useCapture);
            });
        });

        eventsListeners.clear();

        originalEventsListeners.forEach(function (eventListeners, eventName) {
            eventsListeners.set(eventName, eventListeners.slice(0));
        });
    };

    var maybeSetOriginal = setOriginal;
}

function JsTester_NoNotificationMessage () {
    var throwError = function () {
        throw new Error('Уведомление должно было отобразиться.');
    };

    this.click = throwError;
    this.expectToBeOpened = throwError;
    this.expectToBeClosed = throwError;
    this.expectToHaveBody = throwError;
    this.expectToHaveTag = throwError;
    this.expectToHaveTitle = throwError;
    this.expectNotToExist = function () {};
    this.expectToExist = throwError;
}

function JsTester_NotificationMessage (args) {
    var actualTitle = args.title,
        actualOptions = args.options || {},
        actualTag = actualOptions.tag,
        actualBody = actualOptions.body,
        handleClick = args.notificationClickHandler,
        assertIsClosed = args.assertIsClosed,
        assertIsOpen = args.assertIsOpen,
        debug = args.debug,
        spendTime = args.spendTime,
        callStack = debug.getCallStack();

    this.expectToBeOpened = assertIsOpen;
    this.expectToBeClosed = assertIsClosed;

    this.click = function () {
        handleClick();
        spendTime(0);

        return this;
    };

    this.expectToHaveBody = function (expectedBody) {
        if (actualBody != expectedBody) {
            throw new Error('Уведомление должно иметь тело "' + expectedBody + '", а не "' + actualBody + '".');
        }

        return this;
    };
    this.expectToHaveTag = function (expectedTag) {
        if (actualTag != expectedTag) {
            throw new Error('Уведомление должно иметь тэг "' + expectedTag + '", а не "' + actualTag + '".');
        }

        return this;
    };
    this.expectToHaveTitle = function (expectedTitle) {
        if (actualTitle != expectedTitle) {
            throw new Error('Уведомление должно иметь заголовок "' + expectedTitle + '", а не "' + actualTitle + '".');
        }

        return this;
    };

    this.expectToExist = function () {};

    this.expectNotToExist = function (exceptions) {
        var parts = [
            ['заголовком', actualTitle],
            ['тэгом', actualTag],
            ['телом', actualBody]
        ].filter(item => !!item[1]).map(item => item[0] + ' "' + item[1] + '"');

        var description = '',
            length = parts.length;

        if (length) {
            length > 1 && parts.splice(length - 1, 0, 'и');
            description = 'Отображено уведомление с ' + parts.join(' ');
        }

        var error = new Error(
            description + ". Ни одно уведомление не должно быть отображено.\n\n" + callStack + "\n\n\n\n"
        );

        if (exceptions) {
            exceptions.push(error);
        } else {
            throw error;
        }
    };
}

function JsTester_NotificationMock (args) {
    var getNotificationPermission = args.notificationPermissionGetter,
        notificationPermissionRequests = args.notificationPermissionRequests,
        notifications = args.notifications,
        notificationClickHandler = args.notificationClickHandler,
        debug = args.debug,
        spendTime = args.spendTime;

    var constructor = function (title, options) {
        function throwShoudBeOpen () {
            throw new Error('Уведосмление должно быть открытым.');
        }
        
        function throwShouldBeClosed () {
            throw new Error('Уведомление должно быть закрытым.');
        }

        var assertIsClosed = new JsTester_FunctionVariable(throwShouldBeClosed),
            assertIsOpen = new JsTester_FunctionVariable(function () {});

        notifications.add(new JsTester_NotificationMessage({
            assertIsClosed: assertIsClosed.createValueCaller(),
            assertIsOpen: assertIsOpen.createValueCaller(),
            notificationClickHandler: notificationClickHandler.createValueCaller(this),
            debug: debug,
            title: title,
            options: options,
            spendTime,
        }));

        var onclick = function () {},
            clickHandlers = [],
            me = this;

        notificationClickHandler.setValue(function () {
            onclick.apply(me);

            clickHandlers.forEach(function (handle) {
                handle();
            });
        });

        Object.defineProperty(this, 'onclick', {
            get: function () {
                return onclick;
            },
            set: function (value) {
                onclick = value || function () {};
            }
        }); 

        this.addEventListener = function (eventName, handler) {
            eventName == 'click' && clickHandlers.push(handler);
        };

        this.close = function () {
            assertIsClosed.setValue(function () {});
            assertIsOpen.setValue(throwShoudBeOpen);
        };
    };

    Object.defineProperty(constructor, 'permission', {
        get: getNotificationPermission,
        set: function () {}
    }); 

    function addRequestPermissionCallback (callback) {
        notificationPermissionRequests.add({
            callback: callback,
            callStack: debug.getCallStack()
        });
    }

    constructor.requestPermission = function (callback) {
        if (callback) {
            addRequestPermissionCallback(callback);
        } else {
            return new Promise(function (resolve) {
                addRequestPermissionCallback(resolve);
            });
        }
    };

    return constructor;
}

function JsTester_NotificationReplacer (args) {
    var OriginalNotification = window.Notification,
        notificationPermission = args.notificationPermission,
        notificationPermissionRequests = args.notificationPermissionRequests,
        notifications = args.notifications,
        debug = args.debug,
        notificationClickHandler = args.notificationClickHandler,
        spendTime = args.spendTime;

    this.replaceByFake = function () {
        notificationPermission.set('default');
        notifications.removeAll();
        notificationPermissionRequests.removeAll();
        notificationClickHandler.setValue(function () {});

        window.Notification = new JsTester_NotificationMock({
            notificationClickHandler: notificationClickHandler,
            notificationPermissionRequests: notificationPermissionRequests,
            notificationPermissionGetter: notificationPermission.get,
            notifications: notifications,
            debug: debug,
            spendTime,
        });
    };
    this.restoreReal = function () {
        window.Notification = OriginalNotification;
    };
}

function JsTester_NotificationTester (args) {
    var setNotificationPermission = args.notificationPermissionSetter,
        notificationPermissionRequests = args.notificationPermissionRequests,
        notifications = args.notifications;

    var update = function (permission) {
        setNotificationPermission(permission);
        notificationPermissionRequests.pop().callback(permission);
    };

    this.grantPermission = function () {
        update('granted');
        Promise.runAll(false, true);
        return this;
    };
    this.denyPermission = function () {
        update('denied');
        Promise.runAll(false, true);
        return this;
    };
    this.recentNotification = function () {
        return notifications.pop();
    };
    this.assumeSomeNotificationsMayExist = function () {
        this.recentNotification();
    };
    this.expectNotificationPermissionNotToBeRequested = function (exceptions) {
        var error;

        if (!notificationPermissionRequests.isEmpty()) {
            error = new Error(
                "Разрешение на уведомления не должно быть запрошено.\n\n" +
                notificationPermissionRequests.pop().callStack + "\n\n\n\n"
            );
        }

        if (error) {
            if (exceptions) {
                exceptions.push(error);
            } else {
                throw error;
            }
        }
    };
}

function JsTester_BrowserVisibilityReplacer ({
    isBrowserHidden,
    isBrowserVisible,
}) {
    var getBrowserHiddennes = isBrowserHidden.createGetter(),
        getBrowserVisibility = isBrowserVisible.createGetter();

    this.replaceByFake = function () {
        Object.defineProperty(document, 'hidden', {
            get: getBrowserHiddennes,
            set: function () {}
        }); 

        Object.defineProperty(document, 'visibilityState', {
            get: getBrowserVisibility,
            set: function () {}
        }); 
    };
}

function JsTester_FocusReplacer (hasFocus) {
    var originalHasFocus = window.document.hasFocus,
        setFocus = hasFocus.createSetter(),
        getFocus = hasFocus.createGetter();

    this.replaceByFake = function () {
        setFocus(true);
        window.document.hasFocus = getFocus;
    };
    this.restoreReal = function () {
        window.document.hasFocus = originalHasFocus.bind(window.document);
    };
}

function JsTester_BlobTester(args) {
    var constructorArguments = args.constructorArguments,
        utils = args.utils,
        me = this;

    function getActualContent () {
        var actualContent = '';

        if (constructorArguments && constructorArguments[0]) {
            constructorArguments[0].forEach(function (part) {
                actualContent += utils.maybeDecodeArrayBuffer(part);
            });

            actualContent = actualContent.trim();
        }

        return actualContent;
    }

    this.expectToBeCreatedFromArray = function (expectedArray) {
        var actualArray = (constructorArguments[0] || [])[0];

        [
            [expectedArray, 'Ожидаемое значение имеет некорректный тип.'],
            [actualArray, 'Блоб должен быть создан на основе массива.']
        ].forEach(function (args) {
            var array = args[0],
                message = args[1];

            if (!array || !array.buffer || !(array.buffer instanceof ArrayBuffer)) {
                throw new Error(message);
            }
        });

        function serialize (array) {
            return JSON.stringify(Object.values(array));
        }

        if (serialize(expectedArray) != serialize(actualArray)) {
            throw new Error('Массив на основе которого был создан блоб не соответствует ожидаемому.');
        }

        return this;
    };

    this.expectToHaveType = function (expectedType) {
        var actualType = constructorArguments[1] && constructorArguments[1].type;

        if (actualType != expectedType) {
            throw new Error('Блоб должен иметь тип "' + expectedType + '", однако он имеет тип "' + actualType + '".');
        }

        return this;
    };

    this.expectToHaveSubstrings = function (expectedSubstrings) {
        expectedSubstrings.forEach(function (expectedSubstring) {
            me.expectToHaveSubstring(expectedSubstring);
        });

        return this;
    };

    this.expectToHaveSubstring = function (expectedSubstring) {
        var actualContent = getActualContent();

        if (!actualContent.includes(expectedSubstring)) {
            throw new Error(
                'Блоб должен содержать такую подстроку:' + "\n\n" + expectedSubstring + "\n\n" + 'Однако он имеет ' +
                'такое содержание ' + "\n\n" + actualContent + "\n\n"
            );
        }

        return this;
    };

    this.expectNotToHaveSubstring = function (expectedSubstring) {
        var actualContent = getActualContent();

        if (actualContent.includes(expectedSubstring)) {
            throw new Error(
                'Блоб не должен содержать такую подстроку:' + "\n\n" + expectedSubstring + "\n\n" + 'Однако он имеет ' +
                'такое содержание ' + "\n\n" + actualContent + "\n\n"
            );
        }

        return this;
    };

    this.expectToHaveContent = function (expectedContent) {
        var actualContent = getActualContent();

        if (actualContent != expectedContent) {
            throw new Error(
                'Блоб должен иметь такое содержание:' + "\n\n" + expectedContent + "\n\n" + 'Однако он имеет ' +
                'такое содержание ' + "\n\n" + actualContent + "\n\n"
            );
        }

        return this;
    };
}

function JsTester_BlobFactory (args) {
    var OriginalBlob = args.OriginalBlob,
        blobs = args.blobs,
        utils = args.utils;

    return function (...args) {
        var object = new OriginalBlob(...args),
            id = blobs.length;

        Object.defineProperty(object, 'id', {
            get: function () {
                return id;
            },
            set: function () {}
        }); 

        blobs.push(new JsTester_BlobTester({
            constructorArguments: Array.prototype.slice.call(arguments, 0),
            utils: utils
        }));

        return object;
    };
}

function JsTester_BlobReplacer (args) {
    var OriginalBlob = args.OriginalBlob,
        factory = args.factory,
        blobs = args.blobs;

    this.replaceByFake = function () {
        blobs.splice(0, blobs.length);
        window.Blob = factory;
    };

    this.restoreReal = function () {
        window.Blob = OriginalBlob;
    };
}

function JsTester_BlobsTester (args) {
    var blobs = args.blobs,
        utils = args.utils;

    this.getLast = function () {
        var length = blobs.length;
        return this.getAt(length ? length - 1 : 0);
    };
    this.getAt = function (id) {
        if (id > (blobs.length -1)) {
            throw new Error('По-крайней мере ' + (id + 1) + ' блобов должно быть создано, тогда как всего блобов ' +
                'было создано ' + blobs.length);
        }

        return blobs[id];
    };
    this.some = function (callback) {
        if (!blobs.length) {
            throw new Error('Должен существовать хотя бы один блоб');
        }

        const errors = [];

        blobs.forEach(blob => {
            try {
                callback(blob);
            } catch (e) {
                errors.push(e);
            }
        });

        if (errors.length == blobs.length) {
            errors.forEach(error => console.error(error));
            throw new Error('Ни один блоб не удовлетворяет ожиданиям');
        }
    };
}

function JsTester_DecodedTracksTester (args) {
    var bufferToContent = args.bufferToContent,
        destinationToSource = args.destinationToSource,
        trackToDestination = args.trackToDestination;

    this.expectTrackContentToBe = function (track, expectedContent) {
        var actualContent = bufferToContent.get((destinationToSource.get(trackToDestination.get(track)) || {}).buffer);

        if (actualContent != expectedContent) {
            throw new Error('Декодированный звук не соответствует ожидаемому.');
        }
    };
}

function JsTester_FileLoading () {
    var handler = function () {},
        me = this,
        blob = '';

    var maybeGetBlob = function () {
        return '';
    };
    
    var runHandler = function () {
        maybeGetBlob = function () {
            return 'data:audio/wav;base64,' + blob;
        };

        handler({
            target: me.getBlob(),
        });

        runHandler = function () {
            throw new Error('Файл уже загружен.');
        };
    };

    this.getBlob = function () {
        return maybeGetBlob();
    };
    this.setBlob = function (value) {
        blob = value;
    };
    this.setHandler = function (value) {
        handler = value;
    };
    this.runHandler = function () {
        runHandler();
    };
}

function JsTester_FileReader (files) {
    return function () {
        var loading = new JsTester_FileLoading(),
            handler;

        Object.defineProperty(this, 'onload', {
            get: function () {
                return handler;
            },
            set: function (value) {
                handler = value;
                loading.setHandler(handler);
            }
        }); 

        Object.defineProperty(this, 'result', {
            get: function () {
                return loading.getBlob();
            },
            set: function () {}
        });

        this.readAsDataURL = function (blob) {
            loading.setBlob(blob);
            files.set(blob, loading);
        };
    };
}

function JsTester_FileReaderTester ({ files, spendTime }) {
    function getFile (blob) {
        var file = files.get(blob);

        if (!file && Array.from(files.entries())?.[0]?.[0]?.name == blob) {
            blob = Array.from(files.entries())?.[0]?.[0];
            file = Array.from(files.entries())?.[0]?.[1];
        }

        if (!file) {
            throw new Error('Файл не загружается.');
        }

        files.delete(blob);
        return file;
    }

    this.expectNoFileToBeLoading = function () {
        if (files.size > 0) {
            throw new Error('Ни один файл не должен загружаться.');
        }
    };
    
    this.expectFileToBeLoading = function (blob) {
        getFile(blob);
    };

    this.accomplishFileLoading = function (blob) {
        getFile(blob).runHandler();

        spendTime(0);
        spendTime(0);
    };
}

function JsTester_FileReaderMocker (files) {
    var RealFileReader = window.FileReader;

    this.replaceByFake = function () {
        files.clear();
        window.FileReader = new JsTester_FileReader(files);
    };

    this.restoreReal = function () {
        window.FileReader = RealFileReader;
    };
}

function JsTester_EventHandling (args) {
    var listeners = args.listeners,
        events = args.events,
        defaultListeners;

    this.reset = function () {
        listeners.clear();
        defaultListeners = {};

        events.forEach(function (eventName) {
            defaultListeners[eventName] = function () {};

            listeners.set(eventName, [function () {
                defaultListeners[eventName]();
            }]);
        });
    };

    this.setListener = function (eventName, listener) {
        return defaultListeners[eventName] = listener || function () {};
    };

    this.getListener = function (eventName) {
        return defaultListeners[eventName];
    };

    this.reset();
}

function JsTester_AudioNodesConnection (args) {
    var destinationToSources = args.destinationToSource,
        destinationToGain = args.destinationToGain,
        trackToDestination = args.trackToDestination,
        mediaStreamSourceToMediaStream = args.mediaStreamSourceToMediaStream,
        connections = new Map();

    function addConnection (key, value) {
        if (!connections.has(key)) {
            connections.set(key, []);
        }

        connections.get(key).push(value);
    }

    function eachConnected (node, callback) {
        var nodes = new Map();

        function doCallback (node) {
            callback(node);
            nodes.set(node, true);
            eachConnected(node);
        };

        function eachConnected (node) {
            (connections.get(node) || []).forEach(function (node) {
                if (nodes.has(node)) {
                    return;
                }

                doCallback(node);
            });
        }

        doCallback(node);
    }

    function findBy (node, isDesired) {
        var desiredNodes = [];

        eachConnected(node, function (node) {
            if (isDesired(node)) {
                desiredNodes.push(node);
            }
        });

        return desiredNodes;
    }

    function findByConstructor (node, constructors) {
        return findBy(node, function (node) {
            return constructors.some(function (constructor) {
                return node instanceof constructor;
            });
        });
    }

    function findDestinations (node) {
        return findByConstructor(node, [JsTester_MediaStreamDestination]);
    }

    function findSources (node) {
        return findByConstructor(node, [JsTester_AudioBufferSourceNode, JsTester_MediaStreamSource]);
    }

    function findMediaStreamSources (node) {
        return findByConstructor(node, [JsTester_MediaStreamSource]);
    }

    function findGain (node) {
        const results = findByConstructor(node, [JsTester_Gain]);
        
        return results.length == 1 ? results[0] : {
            gain: {
                value: 1
            }
        };
    }

    this.connect = function (node1, node2) {
        addConnection(node1, node2);
        addConnection(node2, node1);

        var sources = findSources(node1),
            gain = findGain(node1),
            mediaStreamSources = findMediaStreamSources(node1);

        findDestinations(node1).forEach(function (destination) {
            destinationToGain.set(destination, gain.gain.value)

            mediaStreamSources.forEach(function (source) {
                trackToDestination.set(mediaStreamSourceToMediaStream.get(source).getAudioTracks()[0], destination);
            });

            sources.forEach(function (source) {
                destinationToSources.set(destination, source);
            });
        });
    };

    this.setGainValue = function (node, value) {
        findDestinations(node).forEach(function (destination) {
            destinationToGain.set(destination, value)
        });
    };

    this.reset = function () {
        connections.clear();
        destinationToGain.clear();
    };
}

function JsTester_AudioGainTester (args) {
    var destinationToGain = args.destinationToGain,
        trackToDestination = args.trackToDestination,
        utils = args.utils;

    function getGain (track) {
        if (!trackToDestination.has(track)) {
            return 1;
        }

        var destination = trackToDestination.get(track);

        if (!destinationToGain.has(destination)) {
            return 1;
        }

        return destinationToGain.get(destination);
    }

    this.expectTrackToHaveGain = function (track, expectedGain) {
        var actualGain = utils.toPercents(getGain(track));

        if (actualGain != expectedGain) {
            throw new Error('Громкость должна быть ' + expectedGain + '%, а не ' + actualGain + '%.');
        }
    };
}

function JsTester_AudioProcessingNoStream () {
    this.track = function () {
        return null;
    };
}

function JsTester_AudioProcessingNoDestination () {
    this.stream = function () {
        return new JsTester_AudioProcessingNoStream();
    };
}

function JsTester_AudioProcessingStream (stream) {
    this.track = function () {
        return stream.getAudioTracks()[0];
    };
}

function JsTester_AudioProcessingDestination (destination) {
    this.stream = function () {
        return new JsTester_AudioProcessingStream(destination.stream);
    };
}

function JsTester_AudioProcessingTrack (args) {
    var trackToDestination = args.trackToDestination,
        track = args.track;

    this.destination = () => {
        return trackToDestination.has(track) ?
            new JsTester_AudioProcessingDestination(trackToDestination.get(track)) :
            new JsTester_AudioProcessingNoDestination();
    };
}

function JsTester_AudioProcessingTester (args) {
    var trackToDestination = args.trackToDestination;

    this.track = function (track) {
        return new JsTester_AudioProcessingTrack({
            trackToDestination: trackToDestination,
            track: track
        });
    };
}

function JsTester_DisableableFunction (fn) {
    const originalFn = fn;

    this.disable = function () {
        fn = function () {};
    };

    this.enable = function () {
        fn = originalFn;
    };

    this.createFunctionCaller = function () {
        return function () {
            fn.apply(null, arguments);
        };
    };
}

function JsTester_MutationObserver (args) {
    var callback = args.callback,
        domElementToMutationCallback = args.domElementToMutationCallback;

    if (!callback) {
        throw new Error('Обработчик мутации должен быть определен.');
    }

    var disableableFunction = new JsTester_DisableableFunction(callback),
        callback = disableableFunction.createFunctionCaller();

    this.observe = function (domElement, config) {
        if (!domElement) {
            throw new Error('Элемент должен существовать.');
        }

        if (domElement != document && !(domElement instanceof Text) && !domElement.getClientRects) {
            throw new Error('Объект не является HTML-элементом.');
        }

        if (!domElementToMutationCallback.has(domElement)) {
            domElementToMutationCallback.set(domElement, []);
        }

        domElementToMutationCallback.get(domElement).push({
            config: config,
            callback: callback
        });
    };

    this.disconnect = function () {
        disableableFunction.disable();
    };
}

function JsTester_MutationObserverTester (args) {
    var domElementToMutationCallback = args.domElementToMutationCallback,
        utils = args.utils;

    return function (domElement, expectedConfig, mutations) {
        if (!domElementToMutationCallback.has(domElement)) {
            return;
        }

        var observations = domElementToMutationCallback.get(domElement);

        observations.forEach(function (observation) {
            var callback = observation.callback,
                actualConfig = observation.config;

            try {
                utils.expectObjectToContain(actualConfig, expectedConfig);
                callback(mutations || []);
            } catch (e) {}
        });
    };
}

function JsTester_MutationObserverFactory (utils) {
    var domElementToMutationCallback = new Map();

    this.createTester = function () {
        return new JsTester_MutationObserverTester({
            domElementToMutationCallback: domElementToMutationCallback,
            utils: utils
        });
    };

    this.createInstance = function (callback) {
        return new JsTester_MutationObserver({
            callback: callback,
            domElementToMutationCallback: domElementToMutationCallback
        });
    };

    this.reset = function () {
        domElementToMutationCallback.clear();
    };
}

function JsTester_MutationObserverMocker (factory) {
    var RealMutationObserver = window.MutationObserver;

    this.replaceByFake = function () {
        factory.reset();
        window.MutationObserver = factory.createInstance;
    };

    this.restoreReal = function () {
        window.MutationObserver = RealMutationObserver;
    };
}

function JsTester_IntersectionObserver ({
    callback,
    intersectionObservations,
    intersectionObservationHandlers
}) {
    this.observe = function (domElement) {
        !intersectionObservations.has(domElement) && intersectionObservations.set(domElement, new Set());
        intersectionObservations.get(domElement).add(callback);

        Promise.resolve().then(() => {
            const uniqueHandlers = new Set();

            intersectionObservationHandlers.forEach(
                (handlers, getDomElement) =>
                    domElement && getDomElement() == domElement &&
                    handlers.forEach(handle => uniqueHandlers.add(handle))
            );

            uniqueHandlers.forEach(handle => handle(domElement));
        });
    };

    this.unobserve = function (domElement) {
        intersectionObservations.get(domElement)?.delete(callback);
    };

    this.disconnect = () => null;
}

function JsTester_IntersectionObserverFactory ({
    intersectionObservations,
    intersectionObservationHandlers
}) {
    return function (callback) {
        return new JsTester_IntersectionObserver({
            callback,
            intersectionObservations,
            intersectionObservationHandlers
        });
    };
}

function JsTester_IntersectionObserverMocker (FakeIntersectionObserver) {
    var RealIntersectionObserver = window.IntersectionObserver;

    this.replaceByFake = function () {
        window.IntersectionObserver = FakeIntersectionObserver;
    };

    this.restoreReal = function () {
        window.IntersectionObserver = RealIntersectionObserver;
    };
}

function JsTester_IntersectionObservableTester ({
    utils,
    getDomElement,
    intersectionObservations,
    intersectionObservationHandlers
}) {
    getDomElement = utils.makeDomElementGetter(getDomElement);

    this.onObserve = function (handler) {
        !intersectionObservationHandlers.has(getDomElement) && intersectionObservationHandlers.set(getDomElement, []);
        intersectionObservationHandlers.get(getDomElement).push(handler);
    };
    
    this.runCallback = function (entries) {
        (intersectionObservations.get(getDomElement()) || []).forEach(callback => callback(entries));
    };
}

function JsTester_IntersectionObservablesTester ({
    utils,
    intersectionObservations,
    intersectionObservationHandlers
}) {
    return function (getDomElement) {
        return new JsTester_IntersectionObservableTester({
            utils,
            getDomElement,
            intersectionObservations,
            intersectionObservationHandlers
        });
    };
}

function JsTester_ZipArchive () {
    return new Uint8Array([
        80,75,3,4,10,0,0,0,0,0,173,56,49,84,7,161,234,221,2,0,0,0,2,0,0,0,1,0,28,0,97,85,84,9,0,3,54,21,229,97,54,21,
        229,97,117,120,11,0,1,4,0,0,0,0,4,0,0,0,0,97,10,80,75,1,2,30,3,10,0,0,0,0,0,173,56,49,84,7,161,234,221,2,0,0,0,
        2,0,0,0,1,0,24,0,0,0,0,0,1,0,0,0,164,129,0,0,0,0,97,85,84,5,0,3,54,21,229,97,117,120,11,0,1,4,0,0,0,0,4,0,0,0,0,
        80,75,5,6,0,0,0,0,1,0,1,0,71,0,0,0,61,0,0,0,0,0
    ]);
}

function JsTester_WindowSize (spendTime) {
    var originalInnerHeight = window.innerHeight,
        innerHeight = originalInnerHeight;

    var redefineProperty = function () {
        Object.defineProperty(window, 'innerHeight', {
            get: function () {
                return innerHeight;
            },
            set: function () {}
        });

        redefineProperty = () => null;
    };

    this.getOriginalHeight = () => originalInnerHeight;

    this.setHeight = function (value) {
        redefineProperty();
        innerHeight = value;
        window.dispatchEvent(new Event('resize'));
        spendTime(0);
        spendTime(0);
    };

    this.reset = function () {
        innerHeight = originalInnerHeight;
    };
}

function JsTeste_Observable (args) {
    var eventNames = args.eventNames,
        handlers = args.handlers,
        shortcutHandlers = args.shortcutHandlers,
        me = args.me;

    eventNames.forEach(function (eventName) {
        var shortcutHandler;

        shortcutHandlers[eventName] = function () {};
        handlers[eventName] = new Map();

        Object.defineProperty(me, 'on' + eventName, {
            get: function () {
                return shortcutHandler;
            },
            set: function (handler) {
                shortcutHandlers[eventName] = shortcutHandler = handler;
            }
        }); 

        me.addEventListener = function (eventName, handler) {
            handlers[eventName].set(handler, handler);
        };

        me.removeEventListener = function (eventName, handler) {
            handlers[eventName].delete(handler);
        };
    });

    return function (eventName) {
        var args = Array.prototype.slice.call(arguments, 1);

        [handlers[eventName], [shortcutHandlers[eventName]]].forEach(function (handlers) {
            handlers.forEach(function (handle) {
                handle.apply(null, args);
            });
        });
    };
}
    
function JsTester_NoBroadcastChannelMessage () {
    this.expectNotToExist = function () {};

    this.expectToHaveContent = function (expectedMessge) {
        throw new Error(
            'Должно быть отправлено сообщение с содержимым "' + expectedMessage + '", тогда, как ни одно ' +
            'сообщение не было отправлено".'
        );
    };

    this.expectToBeSentToChannel = function (expectedChannelName) {
        throw new Error(
            'Сообщение должно быть передано в канал "' + expectedChannelName + '", тогда, как ни одно ' +
            'сообщение не было отправлено".'
        );
    };
    
    this.expectToContain = function (expectedContent) {
        throw new Error(
            'Должно быть отправлено сообщение с содержимым "' + JSON.stringify(expectedContent) + '", тогда, как ни ' +
            'одно сообщение не было отправлено".'
        );
    };

    this.getContent = function () {
        throw new Error('Должно быть отправлено сообщение, тогда, как ни одно сообщение не было отправлено.');
    };
}

function JsTester_BroadcastChannelMessage (args) {
    var actualMessage = args.message,
        actualChannelName = args.channelName,
        utils = args.utils,
        debug = args.debug,
        callStack = debug.getCallStack();

    this.expectToBeSentToChannel = function (expectedChannelName) {
        if (actualChannelName != expectedChannelName) {
            throw new Error(
                'Сообщение должно быть передано в канал "' + expectedChannelName + '", тогда, как оно было передано ' +
                'в канал "' + actualChannelName + '".'
            );
        }

        return this;
    };
    
    this.expectToHaveContent = function (expectedMessge) {
        if (actualMessage != expectedMessage) {
            throw new Error(
                'Сообщение должно иметь содержимое "' + expectedMessage + '", а не "' + actualMessage + '".'
            );
        }

        return this;
    };

    this.expectToContain = function (expectedContent) {
        utils.expectObjectToContain(actualMessage, expectedContent);

        return this;
    };

    this.getContent = function () {
        return actualMessage;
    };

    this.expectNotToExist = function (exceptions) {
        var exception = new Error(
            'Ни одно сообщение не должно быть отправлено, тогда как было отправлено сообщение ' +
                (typeof actualMessage == 'string' ? actualMessage : JSON.stringify(actualMessage)) +
            '.' + "\n\n" + callStack
        );

        if (exceptions) {
            exceptions.push(exception);
        } else {
            throw exception;
        }
    };
}

function JsTester_BroadcastChannelFactory (args) {
    var broadcastChannelMessages = args.broadcastChannelMessages,
        broadcastChannelMessageEventFirers = args.broadcastChannelMessageEventFirers,
        handlers = args.handlers,
        shortcutHandlers = args.shortcutHandlers,
        utils = args.utils,
        debug = args.debug;

    return function (channelName) {
        handlers[channelName] = {};
        shortcutHandlers[channelName] = {};
        channelHandlers = handlers[channelName];
        shortcutChannelHandlers = shortcutHandlers[channelName];

        this.postMessage = function (message) {
            broadcastChannelMessages.add(new JsTester_BroadcastChannelMessage({
                channelName: channelName,
                message: message,
                utils: utils,
                debug: debug
            }));
        };

        this.close = function () {
        };

        broadcastChannelMessageEventFirers[channelName] = new JsTeste_Observable({
            me: this,
            eventNames: ['message'],
            handlers: channelHandlers,
            shortcutHandlers: shortcutChannelHandlers
        });
    };
}

function JsTester_BroadcastChannelTester (args) {
    var fireEvent = args.eventFirer,
        channelName = args.channelName,
        broadcastChannelsToIgnore = args.broadcastChannelsToIgnore;

    this.assumeSomeMessageMayBeSent = function () {
        broadcastChannelsToIgnore.set(channelName);
    };

    this.expectToExist = function () {
        if (!fireEvent) {
            throw new Error('Канал "' + channelName + '" должен был быть создан.');
        }
    };

    this.expectNotToExist = function () {
        if (fireEvent) {
            throw new Error('Канал "' + channelName + '" не должен быть создан.');
        }
    };

    this.receiveMessage = function (message) {
        fireEvent('message', {
            data: message
        });
    };
}

function JsTester_BroadcastChannelsTester (args) {
    var broadcastChannelMessages = args.broadcastChannelMessages,
        broadcastChannelMessageEventFirers = args.broadcastChannelMessageEventFirers,
        broadcastChannelsToIgnore = args.broadcastChannelsToIgnore;

    this.nextMessage = function () {
        return broadcastChannelMessages.pop();
    };

    this.channel = function (channelName) {
        return new JsTester_BroadcastChannelTester({
            eventFirer: broadcastChannelMessageEventFirers[channelName],
            channelName: channelName,
            broadcastChannelsToIgnore: broadcastChannelsToIgnore
        });
    };
}

function JsTester_BroadcastChannelMocker (args) {
    var RealBroadcastChannel = window.BroadcastChannel,
        broadcastChannelMessages = args.broadcastChannelMessages,
        broadcastChannelTester = args.broadcastChannelTester,
        BroadcastChannel = args.BroadcastChannel,
        handlers = args.handlers,
        shortcutHandlers = args.shortcutHandlers,
        broadcastChannelMessageEventFirers = args.broadcastChannelMessageEventFirers;

    this.replaceByFake = function () {
        broadcastChannelMessages.removeAll();

        Object.keys(broadcastChannelMessageEventFirers).forEach(function (channelName) {
            delete(broadcastChannelMessageEventFirers[channelName]);
        });

        Object.keys(shortcutHandlers).forEach(function (channelName) {
            delete(shortcutHandlers[channelName]);
        });

        Object.keys(handlers).forEach(function (channelName) {
            delete(handlers[channelName]);
        });

        window.BroadcastChannel = BroadcastChannel;
    };

    this.restoreReal = function () {
        window.BroadcastChannel = RealBroadcastChannel;
    };
}

function JsTester_VisibilitySetter ({
    setFocus,
    setBrowserHidden,
    setBrowserVisible,
    isBrowserHidden,
    spendTime,
}) {
    return function (newValue) {
        newValue = !newValue;
        const isChanged = newValue !== isBrowserHidden();

        setBrowserHidden(newValue);
        setBrowserVisible(!newValue);
        
        isChanged && document.dispatchEvent(new Event('visibilitychange'));
        Promise.runAll(false, true);
        spendTime(0);
    };
}

function JsTester_FocusSetter (setFocus) {
    return function (newValue) {
        const isChanged = setFocus(newValue);
        isChanged && window.dispatchEvent(new Event(newValue ? 'focus' : 'blur'));
    }
}

function JsTester_ResizeObserverTrigger (resizeObservables) {
    return domElement => resizeObservables.has(domElement) &&
        resizeObservables.get(domElement).forEach(callback => callback([{
            contentRect: domElement.getClientRects()
        }]));
}

function JsTester_ResizeObserver ({
    callback,
    resizeObservables
}) {
    const domElements = new Set();

    this.observe = domElement => {
        if (!domElement) {
            return;
        }

        domElements.add(domElement);

        !resizeObservables.has(domElement) && resizeObservables.set(domElement, new Set());
        resizeObservables.get(domElement).add(callback);
    };

    this.unobserve = domElement => {
        if (!domElement) {
            return;
        }

        resizeObservables.has(domElement) && resizeObservables.get(domElement).delete(callback);
    };

    this.disconnect = () => {
        domElements.forEach(domElement =>
            resizeObservables.has(domElement) &&
            resizeObservables.get(domElement).delete(callback));

        domElements.clear();
    };
}

function JsTester_ResizeObserverFactory (resizeObservables) {
    return function (callback) {
        return new JsTester_ResizeObserver({
            resizeObservables,
            callback
        });
    };
}

function JsTester_DownloadPreventer () {
    const listener = event => event.target.tagName == 'A' &&
        event.target.getAttribute('download') &&
        event.preventDefault();

    this.prevent = () => document.body.addEventListener('click', listener);
    this.resume = () => document.body.removeEventListener('click', listener);
}

function JsTester_FileField (
    getDomElement, wait, utils, testersFactory, gender, nominativeDescription, accusativeDescription,
    genetiveDescription, factory
) {
    factory.admixDomElementTester(this, arguments);

    this.upload = function (fileName) {
        this.expectToExist();

        var event = new Event('change', {
            bubbles: true
        });

        var fileList = [new File([], fileName)];

        Object.defineProperty(fileList[0], 'type', {
            set: function () {},
            get: function () {
                return 'application/zip';
            }
        });     

        Object.defineProperty(getDomElement(), 'files', {
            set: function () {},
            get: function () {
                return fileList;
            }
        });     

        getDomElement().dispatchEvent(event);
    };
}

function JsTester_TextArea (
    domElement, wait, utils, testersFactory, gender, nominativeDescription, accusativeDescription,
    genetiveDescription, factory, blobsTester
) {
    var getDomElement = utils.makeDomElementGetter(domElement);
    factory.admixDomElementTester(this, arguments);

    this.fill = function (value) {
        this.expectToBeVisible();

        getDomElement().focus();
        getDomElement().innerHTML = value;
        getDomElement().blur();
        getDomElement().dispatchEvent(new Event('change', {
            bubbles: true
        }))
    };
}

function JsTester_TestersFactory (args) {
    var wait = args.wait,
        utils = args.utils,
        factory = args.factory,
        blobsTester = args.blobsTester,
        gender = factory.createGender(),
        female = gender.female,
        neuter = gender.neuter,
        male = gender.male,
        spendTime = args.spendTime;

    this.createFileFieldTester = function () {
        var getDomElement = utils.makeDomElementGetter(arguments[0]);

        return new JsTester_FileField(
            getDomElement, wait,
            utils,
            this,
            neuter,
            'поле загрузки файла',
            'поле загрузки файла',
            'поля загрузки файла',
            factory
        );
    };
    this.createIframeTester = function (domElement) {
        return new JsTester_Iframe(utils.makeDomElementGetter(domElement), wait, utils, this, male, 'Iframe', 'Iframe',
            'Iframe', factory);
    };
    this.createAnchorTester = function (domElement, text) {
        return new JsTester_Anchor(utils.makeDomElementGetter(domElement), wait, utils, this, female,
            (text ? ('ссылка с текстом "' + text + '"') : 'ссылка'),
            (text ? ('ссылку с текстом "' + text + '"') : 'ссылку'),
            (text ? ('ссылки с текстом "' + text + '"') : 'ссылки'),
            factory, blobsTester);
    };
    this.createTextFieldTester = function (domElement, label) {
        var getDomElement = utils.makeDomElementGetter(domElement);

        return new JsTester_InputElement(
            getDomElement,
            wait,
            utils,
            this,
            neuter,
            utils.fieldDescription('текстовое поле', label),
            utils.fieldDescription('текстовое поле', label),
            utils.fieldDescription('текстового поля', label),
            factory,
        );
    };
    this.createTextAreaTester = function (getDomElement, label) {
        return new JsTester_TextArea(
            getDomElement,
            wait,
            utils,
            this,
            female,
            utils.fieldDescription('текстовая область', label),
            utils.fieldDescription('текстовую область', label),
            utils.fieldDescription('текстовой области', label),
            factory
        );
    };
    this.createDomElementTester = function () {
        var getDomElement = utils.makeDomElementGetter(arguments[0]);

        return factory.createDomElementTester(getDomElement, wait, utils, this, male, function () {
            return 'элемент' + utils.getElementDescription(getDomElement());
        }, function () {
            return 'элемент' + utils.getElementDescription(getDomElement());
        }, function () {
            return 'элемента' + utils.getElementDescription(getDomElement());
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
                namespace[component] = [oldValue, value];
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
    ascendantElement = ascendantElement || new JsTester_NoElement();

    var isDesiredText = function () {
        throw new Error('Не указаны критерии поиска');
    };

    this.matchesSelector = function (value) {
        selector = value;
        return this;
    };

    this.textEquals = function (desiredTextContent) {
        isDesiredText = function (actualTextContent, comparisons) {
            const result = actualTextContent == desiredTextContent;

            (comparisons || []).push(
                `Строка ${
                    JSON.stringify(actualTextContent)
                } должна быть равна строке ${
                    JSON.stringify(desiredTextContent)
                }. Условие ${result ? '' : 'не '}удовлетворено.`
            );

            return result;
        };

        return this;
    };

    this.textContains = function (desiredTextContent) {
        isDesiredText = function (actualTextContent, comparisons) {
            const result = actualTextContent.indexOf(desiredTextContent) != -1;

            (comparisons || []).push(
                `Строка ${
                    JSON.stringify(actualTextContent)
                } должна содержать строку ${
                    JSON.stringify(desiredTextContent)
                }. Условие ${result ? '' : 'не '}удовлетворено.`
            );

            return result;
        };

        return this;
    };

    this.findAll = function (logEnabled) {
        if (!ascendantElement.querySelectorAll) {
            throw new Error(`Объект ${ascendantElement} не является HTML-элементом.`);
        }

        var i,
            descendants = ascendantElement.querySelectorAll(selector),
            length = descendants.length,
            descendant,
            text,
            desiredDescendants = [],
            allDescendants = [],
            comparisons = [];

        for (i = 0; i < length; i ++) {
            descendant = descendants[i];
            text = utils.getTextContent(descendant);

            logEnabled && allDescendants.push({
                domElement: descendant,
                text: text
            });

            if (isDesiredText(text, comparisons)) {
                desiredDescendants.push(descendant);
            }
        }

        logEnabled && console.log({
            selector,
            ascendantElement,
            comparisons,
            allDescendants,
            desiredDescendants
        });

        return desiredDescendants;
    };

    this.find = function (logEnabled) {
        var desiredDescendants = this.findAll(logEnabled);

        if (desiredDescendants.length) {
            return utils.getVisibleSilently(desiredDescendants) || new JsTester_NoElement();
        }

        return new JsTester_NoElement();
    };
}

function JsTester_TextExpectations (throwSubstringInclusionError) {
    this.substringExpectation = function (args) {
        var substring = args.substring,
            isExpected = args.isExpected,
            maybeNot = args.maybeNot,
            actualContent = args.actualContent;
        
        var index = actualContent.indexOf(substring);

        if (!isExpected(index !== -1)) {
            throw throwSubstringInclusionError(args);
        }

        return index;
    };

    this.expectTextNotToHaveSubstring = function (args) {
        args.maybeNot = 'не ';

        args.isExpected = function (doesActualTextContainSubstring) {
            return !doesActualTextContainSubstring;
        };

        this.substringExpectation(args);
    };

    this.getTextContentSubstringInclusionExpectationArguments = function (args) {
        args = args || {};

        args.maybeNot = '';
        args.isExpected = function (doesActualTextContainSubstring) {
            return doesActualTextContainSubstring;
        };

        return args;
    };
    
    this.expectTextToHaveSubstringsConsideringOrder = function(actualContent, expectedSubstrings) {
        expectedSubstrings.forEach(function (expectedSubstring) {
            var index = this.substringExpectation(this.getTextContentSubstringInclusionExpectationArguments({
                substring: expectedSubstring,
                actualContent: actualContent
            }));

            actualContent = actualContent.substr(index + expectedSubstring.length);
        }.bind(this));
    };
}

function JsTester_Element ({
    getElement,
    utils
}) {
    var oldGetElement = getElement;
    var getElement = utils.makeFunction(getElement);

    function querySelectorAll (selector, logEnabled) {
        const element = getElement(),
            result = (getElement() || new JsTester_NoElement()).querySelectorAll(selector);

        logEnabled && console.log({
            element,
            result
        });

        return result;
    }
    this.querySelector = function (selector, logEnabled) {
        const elements = querySelectorAll(selector, logEnabled);
        return utils.getVisibleSilently(querySelectorAll(selector)) || new JsTester_NoElement();
    };

    this.querySelectorAll = function (selector, logEnabled) {
        return utils.getAllVisible(querySelectorAll(selector, logEnabled));
    };
}

function JsTester_Utils ({debug, windowSize, spendTime, args}) {
    var me = this,
        doNothing = function () {};

    function scrollIntoView (domElement) {
        domElement.scrollIntoView();
    }

    this.toPercents = function (value) {
        return parseInt(value * 100, 0);
    };

    this.isNonExisting = function (value) {
        return !value || value instanceof JsTester_NoElement;
    };

    this.pipe = function () {
        var functions = Array.prototype.slice.call(arguments, 0);

        return function () {
            var args = Array.prototype.slice.call(arguments, 0);

            functions.forEach(function (callFunction) {
                args = [callFunction.apply(null, args)];
            });

            return args[0];
        };
    };

    this.receiveWindowMessage = function (args) {
        window.dispatchEvent(new MessageEvent('message', args));
        spendTime(0);
        spendTime(0);
    };

    this.maybeDecodeArrayBuffer = function (data) {
        if (data instanceof ArrayBuffer) {
            data = (new TextDecoder()).decode(new Uint8Array(data));
        }

        return data;
    };

    this.enableScrollingIntoView = function () {
        maybeScrollIntoView = scrollIntoView;
    };

    this.disableScrollingIntoView = function () {
        maybeScrollIntoView = doNothing;
    };

    this.getWindowHeight = () => windowSize.getOriginalHeight();

    this.scrollIntoView = function (domElement) {
        maybeScrollIntoView(domElement);
    };

    this.expectNonStrict = function (expectedValue) {
        return new JsTests_NonStrictExpectaion(expectedValue);
    };
        
    this.expectFileToHaveSubstring = function (expectedValue) {
        return new JsTests_FileContentSubstringExpectaion(expectedValue);
    };

    this.expectBlob = function (expectedValue) {
        return new JsTests_BlobExpectaion({
            expectedValue,
            blobsTester: args.blobsTester,
        });
    };

    this.expectEmptyObject = function () {
        return new JsTests_EmptyObjectExpectaion();
    };

    this.expectToBeEmpty = function () {
        return new JsTests_EmptyExpectaion();
    };

    this.expectNotToBeEmpty = function () {
        return new JsTests_NotEmptyExpectaion();
    };

    this.expectToHavePrefix = function (expectedPrefix) {
        return new JsTests_PrefixExpectaion(expectedPrefix);
    };

    this.expectToStartWith = function (expectedPrefix) {
        return this.expectToHavePrefix(expectedPrefix);
    };

    this.expectToHaveSubstring = function (expectedSubstring) {
        return new JsTests_SubstringExpectaion(expectedSubstring);
    };

    this.expectToBeString = function () {
        return new JsTests_StringExpectaion();
    };

    this.expectToHaveLength = function (expectedLength) {
        return new JsTests_LengthExpectaion(expectedLength);
    };

    this.expectToInclude = function (expectedSubset) {
        return new JsTests_SetInclusionExpectation({
            expectedSubset: expectedSubset,
            utils: this,
            description: 'включающий',
            compliesExpectation: function (isIncluded) {
                return !isIncluded;
            }
        });
    };

    this.expectToExclude = function (expectedSubset) {
        return new JsTests_SetInclusionExpectation({
            expectedSubset: expectedSubset,
            utils: this,
            description: 'исключающий',
            compliesExpectation: function (isIncluded) {
                return isIncluded;
            }
        });
    };

    this.createParamExpectation = function (expectation) {
        var Constructor = function () {
            this.maybeThrowError = expectation;
        };

        Constructor.prototype = JsTests_ParamExpectationPrototype;

        return new Constructor();
    };

    this.addPreventDefaultHandler = function (event, preventDefaultHandler) {
        var preventDefault = event.preventDefault;

        event.preventDefault = function () {
            preventDefault.apply(event, arguments);
            preventDefaultHandler();
        };
    };
    function createKeyboardEvent (eventName, key, keyCode, preventDefaultHandler, code) {
        var keyboardEvent = document.createEvent('KeyboardEvent');

        me.addPreventDefaultHandler(keyboardEvent, preventDefaultHandler);

        keyboardEvent.initKeyboardEvent(
            eventName, true, false, null, 0, false, 0, false, keyCode, 0);
        keyboardEvent.which = keyboardEvent.keyCode = keyCode;
        keyboardEvent.key = key;
        code && (keyboardEvent.code = code);

        Object.defineProperty(keyboardEvent, 'code', {
            get: function () {
                return code;
            }
        });     

        ['keyCode', 'which', 'charCode'].forEach(function (propertyName) {
            Object.defineProperty(keyboardEvent, propertyName, {
                get: function () {
                    return keyCode;
                }
            });     
        });

        Object.defineProperty(keyboardEvent, 'key', {
            get: function () {
                return key;
            }
        });

        return keyboardEvent;
    };
    this.pressKey = function (key, target, callback) {
        target = target || document;
        callback = callback || function () {};

        var keyCode = key.charCodeAt(0);

        var eventNames = ['keydown', 'keypress'],
            i = 0;

        var dispatchNext = function () {
            if (i == eventNames.length) {
                return;
            }

            var keyboardEvent = createKeyboardEvent(
                eventNames[i], key, keyCode, function () {
                    dispatchNext = function () {};
                    callback = function () {};
                }
            );

            i ++;

            target.dispatchEvent(keyboardEvent);
            dispatchNext();
        };

        dispatchNext();
        callback();

        target.dispatchEvent(createKeyboardEvent(
            'keyup', key, keyCode, function () {}));
    };
    this.pressSpecialKey = function (target, keyCode, handleKeyDown, handleKeyUp, code) {
        target = target || document;

        handleKeyDown = handleKeyDown || function() {};
        handleKeyUp = handleKeyUp || function() {};

        target.dispatchEvent(createKeyboardEvent('keydown', '', keyCode,
            function () {
                handleKeyDown = function () {};
                handleKeyUp = function () {};
            }, code));

        handleKeyDown();

        target.dispatchEvent(createKeyboardEvent('keyup', '', keyCode, function () {}, code));
        handleKeyUp();
    };
    this.pressEscape = function (target) {
        this.pressSpecialKey(target, 27);
        spendTime(0);
    };
    this.pressEnter = function (target) {
        this.pressSpecialKey(target, 13, undefined, undefined, 'Enter');
    };
    this.pressSpace = function (target) {
        this.pressSpecialKey(target, 32, undefined, undefined, 'Space');
    };
    this.pressRight = function (target, repetitions) {
        this.repeat(repetitions, function () {
            me.pressSpecialKey(target, 39);
        });
    };
    this.pressLeft = function (target, repetitions) {
        this.repeat(repetitions, function () {
            me.pressSpecialKey(target, 37);
        });
    };
    this.repeat = function (repetitions, callback) {
        if (!repetitions) {
            callback();
            return;
        }
        
        var i = 0;

        for (; i < repetitions; i ++) {
            callback();
        }
    };
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
    this.makeDomElementGetter = function (value) {
        var getDomElement = typeof value == 'string' ? function () {
            return me.getVisibleSilently(document.querySelectorAll(value));
        } : this.makeFunction(value);

        return function () {
            var element = getDomElement();

            if (element instanceof JsTester_NoElement) {
                return null;
            }

            return element;
        };
    };
    this.fieldDescription = function (description, label) {
        return description + (label ? (' "' + label + '"') : '');
    };
    this.isVisible = function(domElement) {
        if (!domElement) {
            return false;
        }

        return !!(domElement.offsetWidth || domElement.offsetHeight || domElement.getClientRects?.()?.length);
    };
    this.getVariablePresentation = function (object) {
        return "\n \n" + debug.getVariablePresentation(object) + "\n \n";
    };
    this.dispatchMouseEvent = function (domElement, eventName, anotherDomElement, xRelToEl, yRelToEl) {
        var rect = (anotherDomElement || domElement).getBoundingClientRect(),
            x = rect.left + window.scrollX,
            y = rect.top + window.scrollY;
        xRelToEl = xRelToEl === undefined ? 0.5 : xRelToEl / 100;
        yRelToEl = yRelToEl === undefined ? 0.5 : yRelToEl / 100;

        var mouseEvent = new MouseEvent(eventName, {
            view: window,
            bubbles: true,
            cancelable: true
        });

        [
            ['pageX', x + Math.round(rect.width * xRelToEl)],
            ['pageY', y + Math.round(rect.height * yRelToEl)]
        ].forEach(function (options) {
            Object.defineProperty(mouseEvent, options[0], {
                get: function () {
                    return options[1];
                }
            });
        });

        domElement.dispatchEvent(mouseEvent);
    };
    this.getTextContent = function (value) {
        if (!value) {
            return '';
        }

        if (typeof value != 'string') {
            value = value.innerHTML;
        }

        return value.replace(/<[^<>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/[\s]+/g, ' ').trim();
    };
    function parseName (name) {
        if (/^[^\[\]]+\[\]$/.test(name)) {
            return [name.slice(0, -2)];
        }

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
    function parseQueryString (queryString, doSomethingIfPartIsInvalid) {
        var parts = queryString.replace(/^\?/, '').split('&'),
            queryParams = new JsTester_QueryParams(),
            components,
            name,
            value,
            i,
            ln,
            part,
            plusRe = /\+/g,
            shouldContinueParsing = false;

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
            } else {
                doSomethingIfPartIsInvalid(function () {
                    shouldContinueParsing = true; 
                });

                if (!shouldContinueParsing) {
                    break;
                }
            }
        }

        return queryParams.get();
    };
    this.maybeParseQueryString = function (queryString) {
        var isParsed = true;

        var result = parseQueryString(queryString, function (stopParsing) {
            isParsed = false;
            stopParsing();
        });

        return isParsed ? result : queryString;
    };
    this.parseQueryString = function (queryString) {
        return parseQueryString(queryString, function () {});
    };
    this.parseUrl = function (url) {
        var origin = window.location.origin;
        url = (url || '') + '';

        if (url.indexOf(origin) === 0) {
            url = url.substr(origin.length);
        }

        var hash = url.split('#')[1];
        url = url.split('?');

        var query;

        if (url[1]) {
            query = new JsTester_RequestParams({
                params: this.parseQueryString(url[1]),
                utils: this,
                name: 'URL',
                parameterNotFoundMessage:
                    'Не удалось найти параметр "{name}" в URL запроса. Запрос отправлен {description}' ,
                description: 'с параметрами'
            });
        } else {
            query = new JsTester_NoRequestParams({
                utils: this,
                description: 'без параметров.',
                parameterNotFoundMessage: 'Не удалось найти параметр "{name}" в URL запроса, так как запрос был ' +
                    'отправлен без параметров.',
                shouldContainParametersMessage: 'URL не содержит параметров тогда, как он должен содержать параметры ' +
                    '{description}'
            });
        }

        return {
            hash: hash,
            path: url[0],
            query: query
        };
    };
    this.isDate = function(value) {
        return toString.call(value) === '[object Date]';
    };
    this.getElementDescription = function (value) {
        if (!value ) {
            return '';
        } else if (typeof value == 'object') {
            if (value.nodeName) {
                return ' ' + value.nodeName;
            } else {
                return '';
            }
        } else {
            return '';
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
    this.expectJSONObjectToContain = function () {
        const { object, expectedContent } = (args => {
            if (args.length == 1) {
                return {
                    object: null,
                    expectedContent: args[0],
                };
            }

            return {
                object: args[0],
                expectedContent: args[1],
            };
        })(arguments);

        const expectation = new JsTests_JSONContentExpectation(expectedContent);

        if (arguments.length == 1) {
            return expectation;
        }

        expectation.checkCompliance(object);
    };
    
    this.expectTime = expectedValue => new JsTests_TimeExpectation({
        expectedValue,
        utils: this,
    });

    this.expectJSONToContain = this.expectJSONObjectToContain;
    this.expectObjectToContain = function (object, expectedContent) {
        if (typeof expectedContent != 'object') {
            if (typeof object == 'object') {
                throw new Error('Значение ' + JSON.stringify(expectedContent) + ' должно быть объектом.');
            }

            if (object !== expectedContent) {
                throw new Error('Значение ' + JSON.stringify(object) + ' должно быть равно значению ' +
                    JSON.stringify(expectedContent));
            }

            return;
        }

        (new JsTester_ParamsContainingExpectation(object))(expectedContent);
    };
    function getVisible (domElements, handleError) {
        var results = me.getAllVisible(domElements);

        if (results.length != 1) {
            handleError(results.length);
            return;
        }

        return results[0];
    }
    this.getAllVisible = function (domElements) {
        return Array.prototype.filter.call(domElements, (function (domElement) {
            return this.isVisible(domElement);
        }).bind(this));
    };
    this.getVisibleSilently = function (domElements) {
        return getVisible.call(this, domElements, function () {});
    };
    this.getVisible = function (domElements) {
        return getVisible.call(this, domElements, function (count) {
            throw new Error('Найдено ' + count + ' видимых элементов, тогда как видимым должен быть только один.');
        });
    };
    this.formatDate = function (date) {
        if (typeof date == 'number') {
            date = new Date(date);
        }

        maybeAddZero = function (time) {
            return (time <= 9 ? '0' : '') + time;
        };

        if (!(date instanceof Date)) {
            throw new Error('Value is not a date');
        }

        return date.getFullYear() + '-' +
            maybeAddZero((date.getMonth() + 1)) + '-' +
            maybeAddZero(date.getDate()) + 'T' +
            maybeAddZero(date.getHours()) + ':' +
            maybeAddZero(date.getMinutes()) + ':' +
            maybeAddZero(date.getSeconds()) + '.' + (function () {
                var time = date.getMilliseconds() + '',
                    length = 3 - time.length,
                    zeroes = '';

                for (var i = 0; i < length; i ++) {
                    zeroes += '0';
                }

                return zeroes + time;
            })() + '+03:00';
    };
    this.encodeQuery = function (query) {
        function getComponents (prefixes, query) {
            var result = [],
                i,
                length;

            function processItem (name) {
                var value,
                    fullName,
                    i,
                    length;

                if (!/^[\-_0-9a-zA-Z]+$/.test(name)) {
                    throw new Error('Некорректное имя параметра запроса - "' + name + '"');
                }

                value = query[name];

                if (typeof value == 'object') {
                    result = result.concat(getComponents(prefixes.concat(name), value));
                } else {
                    fullName = [name];
                    length = prefixes.length;

                    if (length) {
                        for (i = length - 1; i < length; i ++) {
                            fullName[0] = '[' + fullName[0] + ']'
                            fullName.unshift(prefixes[i]);
                        }
                    }

                    result.push(fullName.join('') + '=' + encodeURIComponent(value));
                }
            }

            if (Array.isArray(query)) {
                for (i = 0; i < length; i ++) {
                    processItem(i + '');
                }
            } else {
            }

            for (name in query) {
                processItem(name);
            }

            return result;
        }

        return '?' + getComponents([], query).join('&');
    };

    this.element = function (getElement) {
        return new JsTester_Element({
            getElement,
            utils: this
        });
    };

    var element = this.element(() => document.body);

    this.querySelector = function (selector, isLogEnabled) {
        return element.querySelector(selector, isLogEnabled);
    };

    this.isIntersecting = function (container, contained) {
        const containerRect = container.getBoundingClientRect(),
            containedRect = contained.getBoundingClientRect();

        return !(
            (containedRect.top < containerRect.top && containedRect.bottom < containerRect.top) ||
            (containedRect.top > containerRect.bottom && containedRect.bottom > containerRect.bottom)
        );
    };

    this.getRandomString = function (length = 10) {
       var result = '',
           characters = 'abcdefghijklmnopqrstuvwxyz0123456789',
           charactersCount = characters.length;

       for (var i = 0; i < length; i++) {
          result += characters.charAt(Math.floor(Math.random() * charactersCount));
       }

       return result;
    };

    this.enableScrollingIntoView();
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

    this.expectNoWindowToBeOpened = function () {
        throw new Error(
            'Окно не должно быть открыто, тогда как было открыто окно, URL которого имеет путь "' + path + '".'
        );
    };

    this.expectTextToContain = function (expectedSubstring) {
        const decoded = decodeURIComponent(path.substr(21));

        if (!decoded.includes(expectedSubstring)) {
            throw new Error(
                'Должен быть открыт текстовый документ с подстрокой "' + expectedSubstring + '", тогда как текстовый ' +
                'документ имеет такое содержание' + "\n\n" + decoded
            );
        }
    }
}

function JsTester_NoWindowOpened (utils) {
    this.expectToHavePath = function (expectedValue) {
        throw new Error('Дожен быть открыт URL с путем "' + expectedValue + '".');
    };
    this.expectQueryToContain = function (params) {
        throw new Error('Должен быть открыт URL с параметрами' + utils.getVariablePresentation(params));
    };
    this.expectTextToContain = function (expectedSubstring) {
        throw new Error('Должен быть открыт текстовый документ с подстрокой "' + expectedSubstring + '"');
    }
    this.expectNoWindowToBeOpened = function () {};
}

function JsTester_WindowOpener (utils) {
    var open = window.open,
        close = window.close,
        actualWindow = new JsTester_NoWindowOpened(utils);

    this.expectNoWindowToBeOpened = function () {
        actualWindow.expectNoWindowToBeOpened();
    };
    this.expectToHavePath = function (expectedValue) {
        actualWindow.expectToHavePath(expectedValue);
        return this;
    };
    this.expectQueryToContain = function (params) {
        actualWindow.expectQueryToContain(params);
        return this;
    };
    this.expectTextToContain = function (expectedSubstring) {
        actualWindow.expectTextToContain(expectedSubstring);
        return this;
    };
    this.replaceByFake = function () {
        actualWindow = new JsTester_NoWindowOpened();
        window.close = () => null;

        window.open = function (url) {
            var results = utils.parseUrl(url);
            actualWindow = new JsTester_OpenedWindow(results.path, results.query);
        };
    };
    this.restoreReal = function () {
        actualWindow = new JsTester_NoWindowOpened();
        window.open = open;
        window.close = close;
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
        method = request.method.toUpperCase(),
        requestHeaders = request.requestHeaders || {};

    function parseFormData (formData) {
        var result = {};

        formData.forEach(function (value, key) {
            result[key] = value;
        });

        return result;
    }

    var body = (function (bodyParams) {
        var name;

        for (name in bodyParams) {
            return new JsTester_RequestParams({
                params: bodyParams,
                utils: utils,
                name: 'тела запроса',
                parameterNotFoundMessage:
                    'Не удалось найти параметр "{name}" в теле запроса. Тело запроса {description}' ,
                description: 'содержит параметеры'
            });
        }

        return new JsTester_NoRequestParams({
            utils: utils,
            description: 'является пустым.',
            parameterNotFoundMessage: 'Не удалось найти параметр "{name}" в теле запроса, так как запрос был ' +
                'отправлен с пустым телом.',
            shouldContainParametersMessage: 'Запрос был отправлен с пустым телом, тогда, как его тело должно было ' +
                'содержать параметры {description}'
        });
    })(request.params instanceof FormData ? parseFormData(request.params) : request.data());

    this.printCallStack = function () {
        console.log(callStack);
        return this;
    };
    this.proceedUploading = function () {
        var event = new Event('progress');

        event.total = 1400;
        event.loaded = 350;

        request.upload.dispatchEvent(event);

        return this;
    };
    this.respondWithoutContent = function () {
        request.respondWith({
            status: 204,
            responseText: ''
        });

        return this;
    };
    this.networkError = function() {
        request.responseError();
        return this;
    };
    this.respondSuccessfullyWith = function (responseObject) {
        request.respondWith({
            status: 200,
            statusText: 'OK',
            responseText: typeof responseObject == 'string' ? responseObject : JSON.stringify(responseObject)
        });

        return this;
    };
    function respond ({status, responseObject, ...args}) {
        request.respondWith({
            status: status,
            responseText: typeof responseObject == 'string' ? responseObject : JSON.stringify(responseObject),
            ...args
        });
    }
    this.respond = respond;
    this.respondUnsuccessfullyWith = function (responseObject) {
        respond({
            responseObject: responseObject,
            status: 500,
            statusText: 'Internal server error',
        });

        return this;
    };
    this.respondUnauthorizedWith = function (responseObject) {
        respond({
            responseObject: responseObject,
            status: 401,
            statusText: 'Unauthorized',
        });

        return this;
    };
    this.expectPathToMatch = function (pattern) {
        if (!pattern.test(path)) {
            throw new Error(
                'В данный момент должен быть отправлен запрос по пути, который удовлетворяет регулярному ' +
                'выражению "' + pattern + '", тем не менее запрос был отправлен по пути "' + path + '".' +
                this.getDescription()
            );
        }

        return this;
    };
    this.expectPathToContain = function (expectedValue) {
        if (!path.includes(expectedValue)) {
            throw new Error(
                'В данный момент должен быть отправлен запрос по пути, который содержит подстроку "' + expectedValue +
                '", тем не менее запрос был отправлен по пути "' + path + '".' + this.getDescription()
            );
        }

        return this;
    };
    this.expectToHavePath = function (expectedValue) {
        if (path != expectedValue) {
            throw new Error(
                'В данный момент должен быть отправлен запрос по пути "' + expectedValue + '", тем не менее запрос ' +
                'был отправлен по пути "' + path + '". ' + this.getDescription()
            );
        }

        return this;
    };
    this.expectToHaveMethod = function (expectedValue) {
        expectedValue = expectedValue.toUpperCase();

        if (method != expectedValue) {
            throw new Error(
                'Запрос должен быть отправлен методом "' + expectedValue + '", тогда как он был отправлен методом "' +
                method + '". ' + this.getDescription()
            );
        }

        return this;
    };
    this.expectToHaveHeaders = function (expectedHeaders) {
        utils.expectObjectToContain(requestHeaders, expectedHeaders);
        return this;
    };
    this.testBodyParam = function (name, tester) {
        body.testParam(name, tester);
        return this;
    };
    this.testQueryParam = function (name, tester) {
        query.testParam(name, tester);
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
        return 'Запрос отправлен методом "' + method + '" по пути "' + path + '" ' + query.getDescription() +
            ' Тело запроса ' + body.getDescription();
    };
    this.getPath = function () {
        return path;
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

function JsTester_SomeRequest (args) {
    var calls = args.calls,
        responder = args.responder;

    [
        'expectPathToMatch',
        'expectPathToContain',
        'expectToHavePath',
        'expectToHaveMethod',
        'expectToHaveHeaders',
        'testBodyParam',
        'testQueryParam',
        'expectBodyToContain',
        'expectQueryToContain'
    ].forEach(function (methodName) {
        this[methodName] = function () {
            calls.push({
                methodName: methodName,
                args: Array.prototype.slice.call(arguments, 0)
            });

            return this;
        };
    }.bind(this));

    [
        'printCallStack',
        'proceedUploading',
        'respond',
        'respondSuccessfullyWith',
        'respondUnsuccessfullyWith',
        'respondUnauthorizedWith'
    ].forEach(function (methodName) {
        this[methodName] = function () {
            responder[methodName].apply(responder, arguments);
        };
    }.bind(this));
}

function JsTester_MaybeResponder () {
    var responder;

    [
        'printCallStack',
        'proceedUploading',
        'respond',
        'respondSuccessfullyWith',
        'respondUnsuccessfullyWith',
        'respondUnauthorizedWith'
    ].forEach(function (methodName) {
        this[methodName] = function () {
            if (!responder) {
                throw new Error('Запрос не найден.');
            }

            responder[methodName].apply(responder, arguments);
            Promise.runAll(false, true);
        };
    }.bind(this));

    this.setResponder = function (value) {
        responder = value;
    };
}

function JsTester_RequestInAnyOrder (requests) {
    var testings = [],
        recentRequests = [],
        errors = [];

    this.someRequest = function () {
        var calls = [],
            responder = new JsTester_MaybeResponder();

        testings.push({
            calls: calls,
            responder: responder
        });

        recentRequests.push(requests.recentRequest());

        return new JsTester_SomeRequest({
            calls: calls,
            responder: responder
        });
    };

    function callMethods (me, calls) {
        calls.forEach(function (a) {
            var methodName = a.methodName,
                args = a.args;

            me[methodName].apply(me, args);
        });
    }

    this.expectToBeSent = function () {
        var failedTestings = [];

        testings.forEach(function (args) {
            var calls = args.calls,
                responder = args.responder;

            var index = recentRequests.findIndex(function (request) {
                try {
                    callMethods(request, calls);
                } catch (e) {
                    return false;
                }

                return true;
            });

            if (index == -1) {
                failedTestings.push(calls);
            } else {
                responder.setResponder(recentRequests[index]);
                recentRequests.splice(index, 1);
            }
        });

        if (failedTestings.length) {
            failedTestings.forEach(function (calls) {
                recentRequests.forEach(function (request) {
                    try {
                        callMethods(request, calls)
                    } catch (e) {
                        errors.push(e.message);
                    }
                });
            });

            throw new Error(errors.join("\n\n"));
        }
    };
}

function JsTester_RequestTester (args) {
    var requests,
        utils = args.utils,
        createRequestsProvider = args.createRequestsProvider,
        replaceByFake = args.replaceByFake,
        expectNoExceptionsToBeThrown = args.expectNoExceptionsToBeThrown;

    this.inAnyOrder = function () {
        return new JsTester_RequestInAnyOrder(requests);
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
    this.replaceByFake = function () {
        requests = new JsTester_Requests({
            requests: createRequestsProvider(),
            utils,
        });

        replaceByFake(requests);
    };
    this.restoreReal = function (exceptions) {
        try {
            expectNoExceptionsToBeThrown();
            this.expectNoRequestsToBeSent();
        } catch (e) {
            exceptions.push(e);
        }
    };
}

function JsTester_AjaxTester (utils, debug) {
    var JasmineAjaxMock,
        extendJasmineAjaxMock = new JsTester_JasmineAjaxMockExtender(utils, debug),
        me = this,
        errors = [];

    JsTester_RequestTester.call(this, {
        utils: utils,
        createRequestsProvider: function () {
            jasmine.Ajax.install();
            return jasmine.Ajax.requests;
        },
        replaceByFake: function (requests) {
            requestAssertions = [];
            JasmineAjaxMock = window.XMLHttpRequest;
            window.XMLHttpRequest = extendJasmineAjaxMock(JasmineAjaxMock, requestAssertions, errors, requests);
        },
        expectNoExceptionsToBeThrown: function () {
            me.expectNoExceptionsToBeThrown();
            me.expectNoSyncRequestsToBePredicted();
        }
    });

    var restoreReal = this.restoreReal;

    this.expectNoExceptionsToBeThrown = function () {
        errors.forEach(function (error) {
            throw error;
        });
    };
    this.predictSyncRequest = function () {
        var assertions = [],
            predictedRequest = new JsTester_PredictedRequest(assertions, utils);

        requestAssertions.push(assertions);
        return predictedRequest;
    };
    this.expectNoSyncRequestsToBePredicted = function () {
        if (requestAssertions.length) {
            throw new Error('Должен быть отправлен синхронный запрос.');
        }
    };
    this.restoreReal = function (exceptions) {
        restoreReal.call(this, exceptions);

        window.XMLHttpRequest = JasmineAjaxMock;
        jasmine.Ajax.uninstall();
    };
}

function JsTester_FetchTester (utils) {
    var requestsList = [],
        requests = new JsTester_FetchRequests(requestsList),
        originalFetch = window.fetch;

    var fetchMock = new JsTester_FetchMock({
        utils: utils,
        requestsList: requestsList
    });

    JsTester_RequestTester.call(this, {
        utils: utils,
        createRequestsProvider: function () {
            return requests;
        },
        replaceByFake: function (requests) {
            requestsList.splice(0, requestsList.length);
            window.fetch = fetchMock;
        },
        expectNoExceptionsToBeThrown: function () {}
    });

    var restoreReal = this.restoreReal;

    this.restoreReal = function (exceptions) {
        restoreReal.call(this, exceptions);
        window.fetch = originalFetch;
    };
}

function JsTester_FetchMock (args) {
    var requestsList = args.requestsList,
        utils = args.utils;

    return function (url, options) {
        options = options || {
            method: 'GET'
        };

        var method = options.method,
            body = options.body,
            resolver = new JsTester_FunctionVariable(function () {}),
            rejector = new JsTester_FunctionVariable(function () {});

        const requestHeaders = options.headers ?
            Array.from(options.headers.entries()).
                reduce((result, [key, value]) => (result[key] = value, result), {}) :
            null;

        var promise = new Promise(function (resolve, reject) {
            resolver.setValue(function (response) {
                resolve(response);
            });

            rejector.setValue(function (error) {
                reject(error);
            });
        });

        requestsList.push(new JsTester_FetchRequest({
            url: url,
            method: method,
            body: method == 'GET' ? null : body,
            utils: utils,
            requestHeaders,
            resolve: resolver.createValueCaller(),
            reject: rejector.createValueCaller(),
        }));
        
        return promise;
    };
}

function JsTester_FetchRequest (args) {
    var url = args.url,
        requestHeaders = args.requestHeaders,
        method = args.method,
        body = args.body,
        utils = args.utils,
        resolve = args.resolve,
        reject = args.reject,
        data;

    body = utils.maybeDecodeArrayBuffer(body);

    if (body) {
        body instanceof FormData && (body = new URLSearchParams(body).toString());

        if (typeof body == 'object') {
            data = body;
        } else {
            try {
                data = JSON.parse(body);
            } catch (e) {
                data = body;
            }

            if (typeof data == 'string') {
                data = utils.maybeParseQueryString(data);
            }
        }
    }

    Object.defineProperty(this, 'requestHeaders', {
        get: function () {
            return requestHeaders;
        }
    });

    Object.defineProperty(this, 'url', {
        get: function () {
            return url;
        }
    });

    Object.defineProperty(this, 'method', {
        get: function () {
            return method;
        }
    });

    this.data = function () {
        return data;
    };

    this.respondWith = function (args) {
        resolve(new JsTester_FetchResponse(args));
    };

    this.responseError = function (args) {
        reject(new Error('Network error'));
    };
}

function JsTester_FetchResponse (args) {
    var status = args.status,
        responseText = args.responseText;

    this.json = function () {
        let json,
            error;

        try {
            json = JSON.parse(responseText);
        } catch (e) {
            error = e;
        }

        return error ? Promise.reject(error) : Promise.resolve(json);
    };

    this.text = function () {
        return Promise.resolve(responseText);
    };

    Object.defineProperty(this, 'body', {
        get: function () {
            return new JsTester_ReadableStream(responseText);
        }
    });

    Object.defineProperty(this, 'ok', {
        get: function () {
            return status < 300;
        }
    });

    Object.defineProperty(this, 'status', {
        get: function () {
            return status;
        }
    });

    Object.defineProperty(this, 'statusText', {
        get: function () {
            return status == 200 ? 'OK' : 'Some error';
        }
    });

    Object.defineProperty(this, 'headers', {
        get: function () {
            return [];
        }
    });
}

function JsTester_StreamReader (data) {
    var getResult = function () {
        var result = {
            done: false,
            value: (new TextEncoder()).encode(data)
        };

        getResult = function () {
            return {
                done: true,
                value: null
            };
        };

        return result;
    };

    this.read = function () {
        return new Promise(function (resolve) {
            resolve(getResult());
        });
    };
}

function JsTester_FetchRequests (requestsList) {
    this.at = function (index) {
        return requestsList[index];
    };
    this.count = function () {
        return requestsList.length;
    };
}

function JsTester_ReadableStream (data) {
    this.getReader = function () {
        return new JsTester_StreamReader(data);
    };
}

function JsTester_Requests ({ requests, utils }) {
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
        var recentRequest = getRecentRequest(),
            callStack = callStacks[indexOfRecentRequest];

        if (recentRequest) {
            throw new Error(
                'Был отправлен запрос, тогда как ни один запрос не должен был быть отправлен. ' +
                createRequestTester(recentRequest).getDescription() + "\n" + callStack
            );
        }
    };
}

function JsTester_RequestParams (args) {
    var params = args.params,
        utils = args.utils,
        name = args.name,
        description = args.description,
        parameterNotFoundMessage = args.parameterNotFoundMessage,
        expectToContain = new JsTester_ParamsContainingExpectation(params, name);

    this.testParam = function (name, tester) {
        if (!(name in params)) {
            throw new Error(
                parameterNotFoundMessage.replace('{name}', name).replace('{description}', this.getDescription())
            );
        }

        var result = tester(params[name]);

        if (result === false) {
            throw new Error('Параметр "{name}" имеет некорректное значение.'.replace('{name}', name));
        }
    };
    this.expectToContain = function (params) {
        expectToContain(params);
    };
    this.getDescription = function () {
        return description + ' ' + utils.getVariablePresentation(params);
    };
}

function JsTester_NoRequestParams (args) {
    var utils = args.utils,
        parameterNotFoundMessage = args.parameterNotFoundMessage,
        description = args.description,
        shouldContainParametersMessage = args.shouldContainParametersMessage;
   
    this.testParam = function (name) {
        throw new Error(parameterNotFoundMessage.replace('{name}', name));
    };
    this.expectToContain = function (params) {
        var name;

        for (name in params) {
            if (params[name] === undefined) {
                continue;
            }

            throw new Error(
                shouldContainParametersMessage.replace('{description}', utils.getVariablePresentation(params))
            );
        }
    };
    this.getDescription = function () {
        return description;
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

function JsTester_UrlAttributeTester (args) {
    var tester = args.tester,
        getDomElement = args.getDomElement,
        utils = args.utils,
        genetiveDescription = args.genetiveDescription,
        attributeName = args.attributeName;

    function parseUrl () {
        return utils.parseUrl(getDomElement()[attributeName]);
    }

    function testPath (args) {
        var isComplyingExcpectation = args.isComplyingExcpectation,
            getErrorMessage = args.getErrorMessage;

        tester.expectToBeVisible();

        var actualPath = parseUrl().path;
        
        if (!isComplyingExcpectation(actualPath)) {
            throw new Error(getErrorMessage(actualPath));
        }

        return tester;
    }

    this.expectToHaveHash = function (expectedHash) {
        const actualHash = parseUrl().hash;

        if (actualHash != expectedHash) {
            throw new Error(`Ожидается хэш "${expectedHash}", а не ${actualHash}`);
        }
    };

    this.expectToHavePath = function (expectedValue) {
        testPath({
            isComplyingExcpectation: function (actualPath) {
                return actualPath == expectedValue;
            },
            getErrorMessage: function (actualPath) {
                return 'Путь ' + genetiveDescription + ' должен быть "' + expectedValue + '", а не "' + actualPath +
                    '".';
            }
        });
    };
    
    this.expectPathToContain = function (expectedSubstring) {
        testPath({
            isComplyingExcpectation: function (actualPath) {
                return actualPath.includes(expectedSubstring);
            },
            getErrorMessage: function (actualPath) {
                return 'Путь ' + genetiveDescription + ' должен содержать "' + expectedSubstring + '", а не "' +
                    actualPath + '".';
            }
        });
    };

    this.expectQueryToContain = function (params) {
        tester.expectToBeVisible();

        parseUrl().query.expectToContain(params);
        return tester;
    };
}

function JsTester_Iframe (
    getDomElement, wait, utils, testersFactory, gender, nominativeDescription, accusativeDescription,
    genetiveDescription, factory
) {
    factory.admixDomElementTester(this, arguments);

    var urlTester = new JsTester_UrlAttributeTester({
        tester: this,
        getDomElement: getDomElement,
        utils: utils,
        genetiveDescription: genetiveDescription,
        attributeName: 'src'
    });

    this.expectSrcToHavePath = function (expectedValue) {
        urlTester.expectToHavePath(expectedValue);
        return this;
    };

    this.expectSrcQueryToContain = function (params) {
        urlTester.expectQueryToContain(params);
        return this;
    };
}

function JsTester_Anchor (
    getDomElement, wait, utils, testersFactory, gender, nominativeDescription, accusativeDescription,
    genetiveDescription, factory, blobsTester
) {
    var me = this;

    factory.admixDomElementTester(this, arguments);

    var urlTester = new JsTester_UrlAttributeTester({
        tester: this,
        getDomElement: getDomElement,
        utils: utils,
        genetiveDescription: genetiveDescription,
        attributeName: 'href'
    });

    function getBlob () {
        me.expectToBeVisible();

        var hash = utils.parseUrl(getDomElement().href).hash,
            id = parseInt(hash, 0);

        if (!hash && hash !== '0' && hash !== (id + '')) {
            throw new Error('Хэш ' + genetiveDescription + ' должен содержать блоб.');
        }

        return blobsTester.getAt(id);
    }

    this.expectHrefToHaveHash = function (expectedHash) {
        urlTester.expectToHaveHash(expectedHash);
        return this;
    };

    this.expectHrefToBeBlobWithSubstrings = function (expectedSubstrings) {
        getBlob().expectToHaveSubstrings(expectedSubstrings);
    };

    this.expectHrefToBeBlobWithSubstring = function (expectedSubstring) {
        getBlob().expectToHaveSubstring(expectedSubstring);
        return this;
    };

    this.expectHrefToBeBlobWithoutSubstring = function (expectedSubstring) {
        getBlob().expectNotToHaveSubstring(expectedSubstring);
        return this;
    };

    this.expectHrefToBeBlobWithContent = function (expectedContent) {
        getBlob().expectToHaveContent(expectedContent);
        return this;
    };

    this.expectHrefToHavePath = function (expectedValue) {
        urlTester.expectToHavePath(expectedValue);
        return this;
    };

    this.expectHrefPathToContain = function (expectedSubstring) {
        urlTester.expectPathToContain(expectedSubstring);
        return this;
    };

    this.expectHrefQueryToContain = function (params) {
        urlTester.expectQueryToContain(params);
        return this;
    };
}

function JsTester_InputElement (
    getDomElement, wait, utils, testersFactory, gender, nominativeDescription, accusativeDescription,
    genetiveDescription, factory, spendTime
) {
    var me = this;

    function nativeSetValue (value) {
        Object.getOwnPropertyDescriptor(
            (
                getDomElement() instanceof HTMLInputElement ?
                    HTMLInputElement :
                    HTMLTextAreaElement
            ).prototype,
            'value'
        ).set.call(getDomElement(), value);
    }

    factory.admixDomElementTester(this, [
        getDomElement, wait, utils, testersFactory, gender, nominativeDescription, accusativeDescription,
        genetiveDescription, factory
    ]);

    function fireChange () {
        getDomElement().dispatchEvent(new Event('input', {
            bubbles: true
        }));
    }

    function input (value) {
        runAsText(domElement => {
            var length = value.length,
                i = 0,
                oldValue = domElement.value,
                beforeCursor = oldValue.substr(0, domElement.selectionStart),
                afterCursor = oldValue.substr(domElement.selectionEnd),
                cursorPosition = beforeCursor.length,
                inputedValue = '';

            var update = function () {
                nativeSetValue(beforeCursor + inputedValue + afterCursor);
                setSelectionRange(cursorPosition, cursorPosition);
            };

            var CharacterAppender = function (character) {
                return function () {
                    inputedValue += character;
                    cursorPosition ++;
                    nativeSetValue(beforeCursor + inputedValue + afterCursor);
                    setSelectionRange(cursorPosition, cursorPosition);
                };
            };
            
            if (domElement.readOnly || domElement.disabled) {
                throw new Error('Невозможно ввести значение, так как ' + nominativeDescription + ' ' + gender.readonly +
                    ' для редактирования.');
            }

            for (i = 0; i < length; i ++) {
                utils.pressKey(value[i], domElement, new CharacterAppender(value[i]));
            }

            fireChange();
        });
    }

    function erase (updateBeforeCursor, updateAfterCursor, keyCode) {
        runAsText(domElement => {
            var oldValue = domElement.value,
                selectionStart = domElement.selectionStart,
                selectionEnd = domElement.selectionEnd,
                beforeCursor = oldValue.substr(0, selectionStart),
                afterCursor = oldValue.substr(selectionEnd);
            
            if (domElement.readOnly || domElement.disabled) {
                throw new Error('Невозможно ввести значение, так как ' + nominativeDescription + ' ' + gender.readonly +
                    ' для редактирования.');
            }

            if (selectionStart == selectionEnd) {
                beforeCursor = updateBeforeCursor(beforeCursor);
                afterCursor = updateAfterCursor(afterCursor);
            }

            utils.pressSpecialKey(domElement, keyCode, function () {
                nativeSetValue(beforeCursor + afterCursor);
                fireChange();
            }, function () {
                var cursorPosition = beforeCursor.length;
                setSelectionRange(cursorPosition, cursorPosition);
            });
        });
    }

    function pressDelete () {
        erase(function (beforeCursor) {
            return beforeCursor;
        }, function (afterCursor) {
            return afterCursor.substr(1);
        }, 46);
    }

    function runAsText (callback) {
        me.expectToExist();

        const domElement = getDomElement(),
            type = domElement.type;

        if (type == 'number') {
            domElement.type = 'text';
        }

        callback(domElement);
        domElement.type = type;
    }

    function setSelectionRange (...args) {
        runAsText(domElement => domElement.setSelectionRange(...args));
    }

    function clear () {
        me.click();

        runAsText(domElement => {
            setSelectionRange(0, domElement.value.length);
            pressDelete();
        });
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
        this.click();

        erase(function (beforeCursor) {
            return beforeCursor.substr(0, beforeCursor.length - 1);
        }, function (afterCursor) {
            return afterCursor;
        }, 8);

        return this;
    };
    this.pressDelete = function () {
        this.click();
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
        return this;
    };
    this.putCursorAtBegining = function () {
        this.putCursorAt(0);
        return this;
    };
    this.putCursorAt = function (position) {
        this.select(position, position);
        this.click();
        return this;
    };
    this.selectAll = function () {
        this.select(0, getDomElement().value.length);
    };
    this.select = function (selectionStart, selectionEnd) {
        this.click();
        setSelectionRange(selectionStart, selectionEnd);
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
            setSelectionRange(cursorPosition, cursorPosition);
        };

        this.click();

        var event = new ClipboardEvent('paste', {
            clipboardData: new DataTransfer()
        });

        utils.addPreventDefaultHandler(event, function () {
            setValue = function () {};
        });

        event.clipboardData.setData('text', value);

        inputElement.dispatchEvent(event);
        setValue();
    };
    this.input = function (value) {
        this.click();
        input(value);
    };
    this.fill = function (value) {
        clear();

        setSelectionRange(0, 0);
        input(value);
    };
    this.clear = function () {
        clear();
    };
    this.expectToHavePlaceholder = function (expectedValue) {
        this.expectToBeVisible();

        var actualValue = getDomElement().placeholder ? (getDomElement().placeholder + '') : '';

        if (actualValue != expectedValue) {
            throw new Error(
                utils.capitalize(nominativeDescription) + ' ' + gender.should + ' иметь плейсхолдер "' + expectedValue +
                '", а не "' + actualValue + '".'
            );
        }
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

function JsTester_NoElement () {
    Object.defineProperty(this, 'innerHTML', {
        set: function () {},
        get: function () {
            return '';
        }
    });

    Object.defineProperty(this, 'parentNode', {
        set: function () {},
        get: function () {
            return new JsTester_NoElement();
        }
    });

    Object.defineProperty(this, 'style', {
        set: function () {},
        get: function () {
            return {};
        }
    });

    Object.defineProperty(this, 'classList', {
        set: function () {},
        get: function () {
            return {
                add: function () {
                    throw new Error('Элемент должен существовать');
                },
                contains: function () {
                    throw new Error('Элемент должен существовать');
                }
            };
        }
    });

    this.addEventListener = () => null;

    this.dispatchEvent = function () {
        throw new Error('Элемент должен существовать');
    };
    this.closest = function () {
        return new JsTester_NoElement();
    };
    this.querySelector = function () {
        return new JsTester_NoElement();
    };
    this.querySelectorAll = function () {
        return [];
    };
    this.getBoundingClientRect = function () {
        return {
            left: 0,
            top: 0,
            width: 0,
            height: 0
        };
    };
}

function JsTester_DomElement (
    domElement, wait, utils, testersFactory, gender, nominativeDescription, accusativeDescription,
    genetiveDescription, factory
) {
    var getDomElement = utils.makeDomElementGetter(domElement),
        getNominativeDescription = utils.makeFunction(nominativeDescription),
        getAccusativeDescription = utils.makeFunction(accusativeDescription),
        getGenetiveDescription = utils.makeFunction(genetiveDescription),
        me = this;

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

        if (/\bcolor\b/.test(propertyName) || propertyName == 'fill') {
            actualValue = convertColorPropertyValueToHex(actualValue);
        }

        return actualValue;
    }

    this.scrollTo = function (top) {
        var element = getDomElement(),
            event = new Event('scroll');

        event.target = element;
        element.scrollTop = top;
        element.dispatchEvent(event);
    };
    this.log = function () {
        this.expectToExist();
        console.log(getDomElement());
    };
    this.endTransition = function (propertyName) {
        getDomElement()?.dispatchEvent(new TransitionEvent('transitionend', {
            bubbles: true,
            propertyName
        }));
    };
    this.pressEscape = function () {
        this.expectToBeVisible();
        utils.pressEscape(getDomElement());
    };
    this.pressEnter = function () {
        this.expectToBeVisible();
        utils.pressEnter(getDomElement());
    };
    this.pressLeft = function (repetitions) {
        this.expectToBeVisible();
        utils.pressLeft(getDomElement(), repetitions);
    };
    this.pressRight = function (repetitions) {
        this.expectToBeVisible();
        utils.pressRight(getDomElement(), repetitions);
    };
    this.pressKey = function (key) {
        this.expectToBeVisible();
        utils.pressKey(key, getDomElement());
    };
    this.focus = function () {
        var domElement = getDomElement();

        this.expectToBeVisible();
        domElement.focus();

        domElement.dispatchEvent(new Event('focus', {
            bubbles: true,
            cancelable: true
        }));
    };
    this.expectToBeFocused = function () {
        this.expectToBeVisible();

        if (getDomElement() != document.activeElement) {
            throw new Error(getNominativeDescription() + ' ' + gender.should + ' быть в фокусе.');
        }
    };
    this.expectNotToBeFocused = function () {
        this.expectToBeVisible();

        if (getDomElement() == document.activeElement) {
            throw new Error(getNominativeDescription() + ' не ' + gender.should + ' быть в фокусе.');
        }
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
    this.expectAttributeToHaveValue = function (attributeName, expectedValue) {
        this.expectToBeVisible();

        var actualValue = getDomElement().getAttribute(attributeName);

        if (actualValue != expectedValue) {
            throw new Error(
                'Атрибут "' + attributeName + '" ' + getGenetiveDescription() + ' ' + gender.should +
                ' иметь значение "' + expectedValue + '", а не "' + actualValue + '".'
            );
        }

        return this;
    };
    this.expectToHaveAttribute = function (attributeName) {
        this.expectToBeVisible();

        if (getDomElement().getAttribute(attributeName) === null) {
            throw new Error(utils.capitalize(getNominativeDescription()) + ' ' + gender.should + ' иметь атрибут "' +
                attributeName + '"');
        }
    };
    this.expectNotToHaveAttribute = function (attributeName) {
        this.expectToBeVisible();

        if (getDomElement().getAttribute(attributeName) !== null) {
            throw new Error(utils.capitalize(getNominativeDescription()) + ' не ' + gender.should + ' иметь атрибут "' +
                attributeName + '"');
        }
    };
    this.expectToHaveAnyOfClasses = classNames => {
        this.expectToBeVisible();

        if (!classNames.some(className => getDomElement().classList.contains(className))) {
            var actualClassName = getDomElement().className;
            classNames = '"' + classNames.join('", "') + '"';

            throw new Error(
                utils.capitalize(getNominativeDescription()) + ' ' + gender.should + ' иметь один из этих классов ' +
                classNames + ', тогда, как ' + gender.pronoun + ' имеет классы "' + actualClassName + '".'
            );
        }
    };
    this.expectToHaveNoneOfClasses = classNames => {
        this.expectToBeVisible();

        classNames.forEach(className => {
            if (getDomElement().classList.contains(className)) {
                throw new Error(
                    utils.capitalize(getNominativeDescription()) + ' не ' + gender.should + ' иметь класс "' +
                    className + '".'
                );
            }
        })
    };
    this.expectToHaveAllOfClasses = function (classNames) {
        classNames.forEach(className => this.expectToHaveClass(className));
    };
    this.expectToHaveClass = function (className) {
        this.expectToBeVisible();

        if (!getDomElement().classList.contains(className)) {
            var actualClassName = getDomElement().className;

            if (actualClassName && typeof actualClassName == 'object') {
                actualClassName = actualClassName.baseVal;
            }

            throw new Error(
                utils.capitalize(getNominativeDescription()) + ' ' + gender.should + ' иметь класс "' +
                className + '", тогда, как ' + gender.pronoun + ' имеет классы "' + actualClassName + '".'
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
    function throwSubstringInclusionError (args) {
        var substring = args.substring,
            maybeNot = args.maybeNot,
            actualContent = args.actualContent;

        throw new Error(
            utils.capitalize(getNominativeDescription()) + ' ' + maybeNot + gender.should + ' содержать текст, ' +
            'содержащий ' + (typeof substring == 'string' ? 'подстроку' : 'подстроки') + ' "' +
            (typeof substring == 'string' ? substring : substring.join('", "')) + '", тогда, как ' + gender.pronoun +
            ' содержит текст "' + actualContent + '".'
        );
    }

    var textExpectations = new JsTester_TextExpectations(throwSubstringInclusionError);

    function getActualTextContent () {
        me.expectToBeVisible();
        return utils.getTextContent(getDomElement());
    }
    function textContentSubstringExpectation (args) {
        args.actualContent = getActualTextContent();
        textExpectations.substringExpectation(args);
    }
    this.expectTextContentNotToHaveSubstrings = function () {
        Array.prototype.slice.call(arguments, 0).forEach(function (expectedSubstring) {
            me.expectTextContentNotToHaveSubstring(expectedSubstring);
        });
    };
    this.expectTextContentToHaveSubstringsConsideringOrder = function () {
        textExpectations.expectTextToHaveSubstringsConsideringOrder(
            getActualTextContent(),
            Array.prototype.slice.call(arguments, 0)
        );
    };
    this.expectTextContentNotToHaveSubstringsConsideringOrder = function () {
        var actualContent = allActualContent = getActualTextContent(),
            hasSubstring = true,
            args = Array.prototype.slice.call(arguments, 0);
        
        try {
            args.forEach(function (expectedSubstring) {
                var index = textExpectations.substringExpectation(
                    textExpectations.getTextContentSubstringInclusionExpectationArguments({
                        substring: expectedSubstring,
                        actualContent: actualContent
                    })
                );

                actualContent = actualContent.substr(index + expectedSubstring.length);
            });
        } catch (e) {
            hasSubstring = false;
        }

        hasSubstring && throwSubstringInclusionError({
            substring: args,
            actualContent: allActualContent,
            maybeNot: 'не '
        });
    };
    this.expectTextContentToHaveSubstring = function (expectedSubstring) {
        textContentSubstringExpectation(textExpectations.getTextContentSubstringInclusionExpectationArguments({
            substring: expectedSubstring
        }));
    };
    this.expectTextContentNotToHaveSubstring = function (expectedSubstring) {
        textExpectations.expectTextNotToHaveSubstring({
            actualContent: getActualTextContent(),
            substring: expectedSubstring
        });
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

        return this;
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
    function isAudio () {
        me.expectToExist();
        return getDomElement().tagName.toLowerCase() == 'audio';
    }
    function scrollIntoView () {
        if (isAudio()) {
            return false;
        }

        utils.scrollIntoView(getDomElement());
        return true;
    };
    this.scrollIntoView = function () {
        scrollIntoView();
    };
    this.expectToBeVisible = function () {
        if (isAudio()) {
            return;
        }

        const domElement = getDomElement();

        parseInt((domElement.getClientRects() || {}).y, 0) || 0;

        scrollIntoView();

        if (!utils.isVisible(getDomElement())) {
            throw new Error(
                utils.capitalize(getNominativeDescription()) + ' ' + gender.should + ' быть ' + gender.visible + '.'
            );
        }

        return this;
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

    this.expectToHaveTag = expectedTag => {
        const actualTag = getDomElement().tagName.toLowerCase();

        if (actualTag != expectedTag) {
            throw new Error(
                `${getNominativeDescription()} ${gender.should} иметь тэг ${expectedTag}, а не ${actualTag}.`
            );
        }

        return me;
    };

    this.expectToExist = function () {
        var domElement = getDomElement();

        if (!domElement) {
            throw new Error(
                utils.capitalize(getNominativeDescription()) + ' ' + gender.should + ' существовать.'
            );
        }

        if (!domElement.getClientRects) {
            console.log(domElement);
            throw new Error('Объект не является HTML-элементом.');
        }
    };
    this.expectToHaveStyle = function (propertyName, expectedValue) {
        this.expectToBeVisible();

        if (typeof propertyName != 'string') {
            throw new Errror('Некорректный аргумент');
        }

        var actualValue = getStylePropertyValue(propertyName);

        if (actualValue != expectedValue) {
            throw new Error(
                'Свойство "' + propertyName + '" стиля ' + getGenetiveDescription() + ' должно иметь значение "' +
                    expectedValue + '", а не "' + actualValue + '".'
            );
        }
    };
    this.expectNotToHaveStyle = function (propertyName, unexpectedValue) {
        this.expectToBeVisible();

        if (typeof propertyName != 'string') {
            throw new Errror('Некорректный аргумент');
        }

        var actualValue = getStylePropertyValue(propertyName);

        if (actualValue == unexpectedValue) {
            throw new Error(
                'Свойство "' + propertyName + '" стиля ' + getGenetiveDescription() + ' не должно иметь значение "' +
                    unexpectedValue + '".'
            );
        }
    };
    this.click = function (x, y) {
        this.mousedown(x, y);
        this.mouseup(x, y);
        Promise.runAll(false, true);
    };
    this.putMouseOver = function () {
        this.expectToBeVisible();
        utils.dispatchMouseEvent(getDomElement(), 'mouseover');
        utils.dispatchMouseEvent(getDomElement(), 'mouseenter');
    };
    this.moveMouseOut = function () {
        this.expectToBeVisible();
        utils.dispatchMouseEvent(getDomElement(), 'mouseout');
    };
    function dispatchDragEvent (type) {
        me.expectToBeVisible();

        var event = document.createEvent('DragEvent');
        event.initEvent(type, true, true);

        getDomElement().dispatchEvent(event);
    }
    this.startDrag = function () {
        dispatchDragEvent('dragstart');
        dispatchDragEvent('dragenter');
        dispatchDragEvent('dragover');
        dispatchDragEvent('dragleave');
    };
    this.drop = function () {
        dispatchDragEvent('dragenter');
        dispatchDragEvent('dragover');
        dispatchDragEvent('dragleave');
        dispatchDragEvent('drop');
        dispatchDragEvent('dragend');
    };
    this.mousedown = function (x, y) {
        this.expectToBeVisible();
        this.focus();

        utils.dispatchMouseEvent(getDomElement(), 'mousedown', null, x, y);
    };
    this.mouseup = function (x, y) {
        this.expectToBeVisible();
        var domElement = getDomElement();

        utils.dispatchMouseEvent(domElement, 'mouseup', null, x, y);
        utils.dispatchMouseEvent(domElement, 'click', null, x, y);
    };
    this.findAnchor = function (text) {
        return testersFactory.createAnchorTester(function () {
            var domElement;

            getDomElement().querySelectorAll('a').forEach(function (anchor) {
                if (!text || utils.getTextContent(anchor) == text) {
                    domElement = anchor;
                }
            });

            return domElement;
        }, text);
    };
    this.findElement = function (selector) {
        return testersFactory.createDomElementTester(
            () => (getDomElement() || (new JsTester_NoElement())).querySelector(selector)
        );
    };
    this.findElementByTextContent = function (text) {
        return testersFactory.createDomElementTester(utils.findElementByTextContent(getDomElement(), text));
    };
    this.closest = function (selector) {
        return testersFactory.createDomElementTester(getDomElement().closest(selector));
    };

    Object.defineProperty(this.closest, 'anchor', {
        set: function () {},
        get: function () {
            return testersFactory.createAnchorTester(() => {
                return getDomElement().closest('a');
            });
        }
    });

    function getBoundingClientRect () {
        me.expectToBeVisible();
        return getDomElement().getBoundingClientRect();
    }
    this.expectToHaveTopOffset = function (expectedTopOffset) {
        var actualTopOffset = getBoundingClientRect().y;

        if (expectedTopOffset != actualTopOffset) {
            throw new Error('Вертикальная позиция ' + getGenetiveDescription() + ' должна быть равна ' +
                expectedTopOffset + ', а не ' + actualTopOffset);
        }
    };
    this.expectToHaveLeftOffset = function (expectedLeftOffset) {
        var actualLeftOffset = getBoundingClientRect().x;

        if (expectedLeftOffset != actualLeftOffset) {
            throw new Error('Горизонтальная позиция ' + getGenetiveDescription() + ' должна быть равна ' +
                expectedLeftOffset + ', а не ' + actualLeftOffset);
        }
    };
    this.expectToHaveHeight = function (expectedHeight) {
        var actualHeight = getBoundingClientRect().height;

        if (expectedHeight != actualHeight) {
            throw new Error('Высота ' + getGenetiveDescription() + ' должна быть равна ' + expectedHeight + ', а не ' +
                actualHeight);
        }
    };
    this.expectHeightToBeMoreThan = function (expectedHeight) {
        var actualHeight = getBoundingClientRect().height;

        if (actualHeight <= expectedHeight) {
            throw new Error('Высота ' + getGenetiveDescription() + ' должна быть больше ' + expectedHeight + ', ' +
                'тогда как она равна ' + actualHeight);
        }
    };
    this.expectToHaveWidth = function (expectedWidth) {
        var actualWidth = getBoundingClientRect().width;

        if (expectedWidth != actualWidth) {
            throw new Error('Ширина ' + getGenetiveDescription() + ' должна быть равна ' + expectedWidth + ', а не ' +
                actualWidth);
        }
    };
    this.expectWidthToBePositive = function () {
        if (getBoundingClientRect().width <= 0) {
            throw new Error('Ширина ' + getGenetiveDescription() + ' должно быть больше нуля.');
        }
    };
    this.getWidth = function () {
        return getBoundingClientRect().width;
    };
    this.addClass = function (className) {
        this.expectToBeVisible();
        getDomElement().classList.add(className);
    };
    this.getElement = function () {
        return getDomElement() || new JsTester_NoElement();
    };
}

function JsTests_ParamExpectation () {
    this.maybeThrowError = function (actualValue, keyDescription) {};
}

JsTests_ParamExpectationPrototype = new JsTests_ParamExpectation();

function JsTests_EmptyObjectExpectaion () {
    this.maybeThrowError = function (actualValue, keyDescription) {
        if (
            !actualValue ||
            typeof actualValue != 'object' ||
            Array.isArray(actualValue) ||
            Object.values(actualValue).length > 0
        ) {
            throw new Error('Значением параметра ' + keyDescription + ' должен быть пустой объект, тогда как ' +
                'значение параметра таково ' + JSON.stringify(actualValue) + '.');
        }
    };
}

function JsTests_PrefixExpectaion (expectedPrefix) {
    this.maybeThrowError = function (actualValue, keyDescription) {
        if (
            !actualValue ||
            typeof actualValue != 'string' ||
            actualValue.indexOf(expectedPrefix) !== 0
        ) {
            throw new Error(
                'Значением параметра ' + keyDescription + ' должна быть строка, начинающаяся с подстроки ' +
                JSON.stringify(expectedPrefix) + ', однако значение параметра таково ' + JSON.stringify(actualValue) +
                '.'
            );
        }
    };
}

function JsTests_SubstringExpectaion (expectedSubstring) {
    this.maybeThrowError = function (actualValue, keyDescription) {
        if (
            !actualValue ||
            typeof actualValue != 'string' ||
            !actualValue.includes(expectedSubstring)
        ) {
            throw new Error(
                'Значением параметра ' + keyDescription + ' должна быть строка, содержащия подстроку ' +
                JSON.stringify(expectedSubstring) + ', однако значение параметра таково ' +
                JSON.stringify(actualValue) + '.'
            );
        }
    };
}

function JsTests_StringExpectaion () {
    this.maybeThrowError = function (actualValue, keyDescription) {
        if (
            !actualValue ||
            typeof actualValue != 'string'
        ) {
            throw new Error(
                'Значением параметра ' + keyDescription + ' должна быть непустая строка, однако значение параметра ' +
                'таково ' + JSON.stringify(actualValue) + '.'
            );
        }
    };
}

function JsTests_SetInclusionExpectation (args) {
    var expectedSubset = args.expectedSubset,
        utils = args.utils,
        compliesExpectation = args.compliesExpectation,
        description = args.description;

    this.maybeThrowError = function (actualValue, keyDescription) {
        if (!Array.isArray(actualValue)) {
            throw new Error(
                'Значением параметра ' + keyDescription + ' должен быть массив, однако значение параметра таково ' +
                JSON.stringify(actualValue) + '.'
            );
        }

        if (!Array.isArray(expectedSubset)) {
            throw new Error('Ожидаемым значением параметра ' + keyDescription + ' должен быть массив.');
        }

        if (expectedSubset.some(function (item) {
            return compliesExpectation(typeof item == 'object' ? actualValue.some(function (actualValue) {
                try {
                    utils.expectObjectToContain(actualValue, item);
                } catch (e) {
                    return false;
                }

                return true;
            }) : actualValue.includes(item));
        })) {
            throw new Error(
                'Значением параметра ' + keyDescription + ' должен быть массив, ' + description +' такие элементы - ' +

                expectedSubset.map(function (item) {
                    return JSON.stringify(item);
                }).join(', ') +

                ', однако значение параметра таково ' + JSON.stringify(actualValue) + '.'
            );
        }
    };
}

function JsTests_NonStrictExpectaion (expectedValue) {
    this.maybeThrowError = function (actualValue, keyDescription) {
        if (actualValue != expectedValue) {
            throw new Error(
                'Значением параметра ' + keyDescription + ' должно быть ' + JSON.stringify(expectedValue) + ', а не ' +
                JSON.stringify(actualValue) + '.'
            );
        }
    };
}

function JsTests_NotEmptyExpectaion () {
    this.maybeThrowError = function (actualValue, keyDescription) {
        if (!actualValue) {
            throw new Error('Значение параметра ' + keyDescription + ' не должно быть пустым.');
        }
    };
}

function JsTests_EmptyExpectaion () {
    this.maybeThrowError = function (actualValue, keyDescription) {
        if (actualValue) {
            throw new Error(
                'Значение параметра ' + keyDescription + ' должно быть пустым, тогда как значением является ' +
                JSON.stringify(actualValue) + '.'
            );
        }
    };
}

function JsTests_LengthExpectaion (expectedLength) {
    this.maybeThrowError = function (actualValue, keyDescription) {
        (new JsTests_StringExpectaion()).maybeThrowError(actualValue, keyDescription);

        var actualLength = actualValue.length;

        if (actualLength != expectedLength) {
            throw new Error(
                'Длина параметра ' + keyDescription + ' должна быть равна ' + expectedLength + ', однако длиной ' +
                'параметра является ' + actualLength + '.'
            );
        }
    };
}

function JsTests_StringExpectaion () {
    this.maybeThrowError = function (actualValue, keyDescription) {
        if (
            !actualValue ||
            typeof actualValue != 'string'
        ) {
            throw new Error(
                'Значением параметра ' + keyDescription + ' должна быть строка, однако значение параметра таково ' +
                JSON.stringify(actualValue) + '.'
            );
        }
    };
}

function JsTests_BlobExpectaion ({
    expectedValue,
    blobsTester,
}) {
    this.maybeThrowError = function (actualValue, keyDescription) {
        console.log({
            actualValue,
            keyDescription,
            blobsTester,
        });

        return;

        if (actualValue != expectedValue) {
            throw new Error(
                'Значением параметра ' + keyDescription + ' должно быть ' + JSON.stringify(expectedValue) + ', а не ' +
                JSON.stringify(actualValue) + '.'
            );
        }
    };
}

function JsTests_FileContentSubstringExpectaion (expectedValue) {
    this.maybeThrowError = function (actualValue, keyDescription) {
        if (!actualValue) {
            throw new Error(
                'Значением параметра ' + keyDescription + ' должен быть файл, тогда как значение параметра является ' +
                'пустым.'
            );
        }

        if (!(actualValue instanceof File)) {
            throw new Error(
                'Значением параметра ' + keyDescription + ' должен быть файл, тогда как параметра имеет значение ' +
                JSON.stringify(expectedValue) + '.'
            );
        }

        console.log({
            expectedValue,
            actualValue,
            keyDescription,
        });

        return;

        if (actualValue != expectedValue) {
            throw new Error(
                'Значением параметра ' + keyDescription + ' должно быть ' + JSON.stringify(expectedValue) + ', а не ' +
                JSON.stringify(actualValue) + '.'
            );
        }
    };
}

function JsTests_JSONContentExpectation (expectedContent) {
    this.checkCompliance = (actualValue, description) => {
        description = 'Значение ' + description;

        if (!actualValue) {
            throw new Error(description + ', которое необходимо разобрать как JSON не должна быть пустой.');
        }

        if (typeof actualValue != 'string') {
            throw new Error(
                `${description},переданное для разбора в качестве JSON должно быть строковым, однако значение ` +
                `таково - ${JSON.stringify(actualValue)}.`
            );
        }

        try {
            actualValue = JSON.parse(actualValue);
        } catch (e) {
            throw new Error(description + 'не удалось разобрать.');
        }

        (new JsTester_ParamsContainingExpectation(actualValue, description))(expectedContent);
    };

    this.maybeThrowError = function (actualValue, keyDescription) {
        this.checkCompliance(actualValue, 'параметра ' + keyDescription);
    };
}

function JsTests_TimeExpectation ({
    utils,
    expectedValue,
}) {
    this.checkCompliance = (actualValue, description) => {
        description = 'Значение ' + description;

        try {
            actualValue = (value => value.slice(0, value.length - 1).join('.'))(
                utils.formatDate(
                    typeof actualValue == 'number' ? actualValue : parseInt(actualValue, 0)
                ).split('+')[0].split('.'),
            );
        } catch (e) {
            throw new Error(
                `${description} должно быть временем ${expectedValue}, тогда как параметр имеет ` +
                `значение ${actualValue}.`
            );
        }

        if (!actualValue) {
            throw new Error(
                `${description} должно быть временем ${expectedValue}, тогда как значение является пустым.`
            );
        }

        if (expectedValue !== actualValue) {
            throw new Error(
                `${description},  должно быть временем ${expectedValue} однако значение таково - ${actualValue}.`
            );
        }
    };

    this.maybeThrowError = function (actualValue, keyDescription) {
        this.checkCompliance(actualValue, 'параметра ' + keyDescription);
    };
}

JsTests_TimeExpectation.prototype = JsTests_ParamExpectationPrototype;
JsTests_FileContentSubstringExpectaion.prototype = JsTests_ParamExpectationPrototype;
JsTests_BlobExpectaion.prototype = JsTests_ParamExpectationPrototype;
JsTests_NonStrictExpectaion.prototype = JsTests_ParamExpectationPrototype;
JsTests_EmptyObjectExpectaion.prototype = JsTests_ParamExpectationPrototype;
JsTests_PrefixExpectaion.prototype = JsTests_ParamExpectationPrototype;
JsTests_SubstringExpectaion.prototype = JsTests_ParamExpectationPrototype;
JsTests_StringExpectaion.prototype = JsTests_ParamExpectationPrototype;
JsTests_SetInclusionExpectation.prototype = JsTests_ParamExpectationPrototype;
JsTests_NotEmptyExpectaion.prototype = JsTests_ParamExpectationPrototype;
JsTests_EmptyExpectaion.prototype = JsTests_ParamExpectationPrototype;
JsTests_LengthExpectaion.prototype = JsTests_ParamExpectationPrototype;
JsTests_JSONContentExpectation.prototype = JsTests_ParamExpectationPrototype

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

            if (expectedValue instanceof JsTests_ParamExpectation) {
                expectedValue.maybeThrowError(actualValue, keyDescription);
                return;
            }

            if (expectedValue instanceof RegExp) {
                if (!expectedValue.test(actualValue)) {
                    throw new Error(
                        'Параметр ' + keyDescription + (
                            paramsDescription ? (' ' + paramsDescription) : ''
                        ) + ' должен иметь значение, удовлетворяющее регулярному выражению /' + expectedValue + '/, ' +
                        'тогда как он имеет значение ' + JSON.stringify(actualValue)
                    );
                }

                return;
            }

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
    this.remove = function () {
        delete(tasks[id]);
    };
    this.spendTime = function (time) {};
    this.runCallbacks = function () {};
}

function JsTester_RepetitiveDelayedTask (id, runTask, tasks, timeout, callStack) {
    var initialTimeout = timeout.clone();

    JsTester_DelayedTask.apply(this, arguments);
    var remove = this.remove;

    this.remove = function () {
        remove();
        runTask = function() {};
    };
    this.runCallbacks = function () {
        runTask();
    };
    this.spendTime = function (time) {
        var value;

        while (time) {
            value = timeout.getValue();

            if (time >= value) {
                runTask();
                time -= value;
                timeout = initialTimeout.clone();
            } else {
                timeout.subtract(time);
                time = 0;
            }
        }

        !timeout.getValue() && (timeout = initialTimeout.clone());
    };
}

function JsTester_OneTimeDelayedTask (id, runTask, tasks, timeout, callStack) {
    JsTester_DelayedTask.apply(this, arguments);

    this.runCallbacks = function () {
        runTask();
        this.remove();
    };
    this.spendTime = function (time) {
        if (time >= timeout.getValue()) {
            this.runCallbacks();
        } else {
            timeout.subtract(time);
        }
    };
}

function JsTester_TimeoutCallbackRunner (setterName, clearerName, DelayedTask, logger, debug) {
    var tasks = {},
        lastId = 0;

    window[setterName] = function (callback, timeout) {
        lastId ++;

        logger.log(timeout, callback);
        logger.trace();

        var task = new DelayedTask(
            lastId,
            callback,
            tasks,
            new JsTester_IntegerVariable(timeout),
            debug.getCallStack()
        );

        tasks[lastId] = task;
        return lastId;
    };

    window[clearerName] = function (id) {
        const task = id && tasks[id];

        if (task && typeof task.remove == 'function') {
            task.remove();
        }
    };

    function eachTask (callback) {
        var id;

        for (id in tasks) {
            callback(tasks[id]);
        }
    }

    this.spendTime = function (time) {
        eachTask(function (task) {
            task.spendTime(time);
        });
    };
    this.runCallbacks = function () {
        eachTask(function (task) {
            task.runCallbacks();
        });
    };
}

function JsTester_NoTimeoutCallbackRunner () {
    this.spendTime = function (time) {};
    this.runCallbacks = function () {};
}

function JsTester_Timeout (
    setterName,
    clearerName,
    DelayedTask,
    logger,
    debug
) {
    var setter = window[setterName],
        clearer = window[clearerName],
        callbacksRunner = new JsTester_NoTimeoutCallbackRunner();

    window[setterName + 'Actually'] = setter;

    this.runCallbacks = function () {
        callbacksRunner.runCallbacks();
    };
    this.spendTime = function (time) {
        callbacksRunner.spendTime(time < 0 ? 0 : time);
    };
    this.replaceByFake = function () {
        callbacksRunner = new JsTester_TimeoutCallbackRunner(setterName, clearerName, DelayedTask, logger, debug);
    };
    this.restoreReal = function () {
        window[setterName] = setter;
        window[clearerName] = clearer;
    };
}

function JsTester_WebSocketMockCore (args) {
    var encoder = args.encoder,
        url = args.url,
        utils = args.utils,
        constants = args.constants,
        logger = args.logger,
        debug = args.debug,
        spendTime = args.spendTime,
        readyState = constants.CLOSED,
        messages = [],
        messageIndex = 0,
        callStacks = [];

    function throwIsNotConnecting () {
        throw new Error('Соединеие по веб-сокету с URL "' + url + '" должно устанавливаться.');
    }
    
    function throwIsConnecting () {
        throw new Error('Устанавливается соединение по веб-сокету с URL "' + url + '".' + "\n" + creatingCallStack);
    }

    function throwIsConnected () {
        throw new Error('Соединение по веб-сокету с URL "' + url + '" не должно быть установлено.');
    }

    function throwIsDisconnecting () {
        throw new Error('Соединение по веб-сокету с URL "' + url + '" разрывается.' + "\n" + disconnectingCallStack +
            "\n\n" + debug.getCallStack() + "\n\n");
    }

    function throwIsNotDisconnecting () {
        throw new Error('Соединение по веб-сокету с URL "' + url + '" не разрывается.');
    }

    function throwIsNotConnected () {
        throw new Error('Соединение по веб-сокету с URL "' + url + '" должно быть установлено.');
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
        handleDisconnect,
        assertIsNotConnecting = throwIsConnecting,
        assertIsConnecting = doNothing,
        assertIsConnected,
        assertIsNotConnected,
        assertIsDisconnecting,
        assertIsNotDisconnecting,
        disconnectingCallStack,
        creatingCallStack = debug.getCallStack(),
        maybeStartDisconnecting,
        maybeDisconnect,
        maybeDisconnectAbnormally;

    var handlers = {
        onopen: doNothing,
        onclose: doNothing,
        onerror: doNothing,
        onmessage: doNothing
    };

    var listeners = {
        open: [],
        close: [],
        error: [],
        message: []
    };

    function createHandlerCaller (name) {
        return function () {
            var args = Array.prototype.slice.call(arguments, 0);

            handlers['on' + name].apply(null, args);
            listeners[name].forEach(function (handle) {
                handle.apply(null, args);
            });
        };
    }
    function handleResponse (eventName) {
        return createHandlerCaller(eventName);
    }
    function setNotConnected () {
        readyState = constants.CLOSED;
        assertIsConnected = throwIsNotConnected,
        assertIsNotConnected = doNothing;
        handleConnect = createHandlerCaller('open');
    }
    function setNotDisconnected () {
        handleDisconnect = createHandlerCaller('close');
        maybeStartDisconnecting = startDisconnecting;
        maybeDisconnect = publicDisconnect;
        maybeDisconnectAbnormally = disconnectAbnormally;
    }
    function setNotDisconnecting () {
        assertIsNotDisconnecting = doNothing,
        assertIsDisconnecting = throwIsNotDisconnecting;
        disconnectingCallStack = '';
    }
    function disconnect (event) {
        assertIsConnecting = throwIsNotConnecting;
        assertIsNotConnecting = doNothing;
        maybeStartDisconnecting = doNothing;
        maybeDisconnect = doNothing;
        maybeDisconnectAbnormally = doNothing;

        setNotConnected();

        handleDisconnect(event);
        handleDisconnect = doNothing;
    }
    function disconnectAccidentally (event) {
        assertIsNotDisconnecting();
        disconnect(event);
    }
    function createNormalDisconnectingEvent (code) {
        return {
            code: code || 1000,
            wasClean: true
        };
    }
    function startDisconnecting () {
        readyState = constants.CLOSING;
        assertIsNotDisconnecting = throwIsDisconnecting;
        assertIsDisconnecting = doNothing;
        disconnectingCallStack = debug.getCallStack();
    }
    function publicDisconnect (code) {
        disconnectAccidentally(createNormalDisconnectingEvent(code));
    }
    function disconnectAbnormally (code) {
        me.fail({});

        disconnectAccidentally({
            code: code || 4999,
            wasClean: false
        });
    }

    this.setHandler = function (name, handler) {
        handlers[name] = handler || doNothing;
    };
    this.addListener = function (name, handler) {
        listeners[name].push(handler);
    };
    this.removeListener = function (name, handler) {
        listeners[name].forEach((currentHandler, index) =>
            currentHandler == handler && listeners[name].splice(index, 1));
    };
    this.setEncoder = function (value) {
        encoder = value;
    };
    this.connect = function () {
        readyState = constants.OPEN;
        assertIsConnecting = throwIsNotConnecting;
        assertIsConnected = doNothing,
        assertIsNotConnected = throwIsConnected;
        assertIsNotConnecting = doNothing;
        setNotDisconnected();

        handleConnect();
        handleConnect = doNothing;
    };
    this.startDisconnecting = function () {
        maybeStartDisconnecting();
    };
    this.finishDisconnecting = function (code) {
        assertIsDisconnecting();
        setNotDisconnecting();
        disconnect(createNormalDisconnectingEvent(code));
        spendTime(0);
    };
    this.disconnect = function (code) {
        maybeDisconnect(code);
        
        spendTime(0);
        spendTime(0);
    };
    this.disconnectAbnormally = function (code) {
        maybeDisconnectAbnormally(code);
    };
    this.fail = function (errorMessage) {
        handleResponse('error')(errorMessage);
    };
    this.receiveMessage = function (message) {
        assertIsConnected();

        if (typeof message != 'string') {
            message = encoder.encode(message);
        }

        logger.log(message);

        handleResponse('message')(new MessageEvent('message', {
            data: message
        }));
    };
    this.getReadyState = function () {
        return readyState;
    };
    this.send = function (message) {
        assertIsConnected();
        logger.log(message);
        messages.push(message);
        callStacks.push(debug.getCallStack());
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
                'как были отправлены сообщения ' + "\n" + unexpectedMessages.join("\n") + "\n" + '. Стек вызовов для ' +
                'первого сообщения:' + "\n" + callStacks[messageIndex] + "\n\n");
        }
    };
    this.expectToBeConnecting = function () {
        assertIsConnecting();
    };
    this.expectWasConnected = function () {
        assertIsNotConnecting();
    };
    this.expectToBeConnected = function () {
        assertIsConnected();
    };
    this.expectNotToBeConnected = function () {
        assertIsNotConnected();
    };
    this.expectNotDisconnecting = function () {
        assertIsNotDisconnecting();
    };

    setNotConnected();
    setNotDisconnected();
    setNotDisconnecting();
}

function JsTester_WebSocketFactory ({
    utils,
    logger,
    debug,
    spendTime,
}) {
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

        var lastIndex = 0;

        var constructor = function (url, protocols) {
            var index = lastIndex;
            lastIndex ++;

            var mockCore = new JsTester_WebSocketMockCore({
                encoder,
                url,
                utils,
                constants,
                logger,
                debug,
                spendTime,
            }), me = this;
            
            copyConstants(this);

            if (!sockets[url]) {
                sockets[url] = [];
            }

            sockets[url].push([new JsTester_WebSocketTester(mockCore, debug.getCallStack()), index]);

            function defineHandler (propertyName) {
                var currentValue;

                Object.defineProperty(me, propertyName, {
                    set: function (newValue) {
                        currentValue = newValue;
                        mockCore.setHandler(propertyName, newValue);
                    },
                    get: function () {
                        return currentValue;
                    }
                });
            }

            Object.defineProperty(this, 'url', {
                set: function () {},
                get: function () {
                    return url;
                },
            });

            Object.defineProperty(this, 'readyState', {
                set: function () {},
                get: function () {
                    return mockCore.getReadyState();
                },
            });

            defineHandler('onopen');
            defineHandler('onclose');
            defineHandler('onmessage');
            defineHandler('onerror');

            this.addEventListener = function (name, listener) {
                mockCore.addListener(name, listener);
            };
            this.removeEventListener = function (name, listener) {
                mockCore.removeListener(name, listener);
            };
            this.send = function (message) {
                mockCore.send(message);
            };
            this.close = function () {
                mockCore.startDisconnecting();
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
            sockets[url].forEach(function (item) {
                callback(item[0]);
            });
        }
    }

    this.getSocket = function () {
        var urls = Object.keys(sockets),
            urlsCount = urls.length,
            url,
            index,
            argumentsCount = arguments.length,
            socketsWithUrl = [];

        if (!urlsCount) {
            throw new Error('Ожидалось, что будет создан веб-сокет, однако ни один веб-сокет не был создан');
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
            socketsWithUrl = sockets[url] || [];
        } else if (url instanceof RegExp) {
            socketsWithUrl = Object.keys(sockets).filter(function (actualUrl) {
                return url.test(actualUrl);
            }).reduce(function (socketsWithUrl, url) {
                return socketsWithUrl.concat(sockets[url]);
            }, []);
        }

        socketsWithUrl = socketsWithUrl.sort(function (a, b) {
            return a[1] - b[1];
        }).map(function (item) {
            return item[0];
        });

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
    this.expectNoWebSocketToBeCreatedWithURL = function (url) {
        if (url in sockets) {
            throw new Error('Ни один веб-сокет не должен быть создан с URL ' + url);
        }
    };
    this.expectNoMessageToBeSent = function (exceptions) {
        function checkCompliance () {
            forEach(function (socket) {
                socket.expectNoMessageToBeSent();
            });
        }

        if (!exceptions) {
            checkCompliance();
            return;
        }

        try {
            checkCompliance();
        } catch (e) {
            exceptions.push(e);
        }
    };
    this.expectWasConnected = function (exceptions) {
        forEach(function (socket) {
            socket.expectWasConnected(exceptions);
        });
    };
    this.expectNotDisconnecting = function (exceptions) {
        forEach(function (socket) {
            socket.expectNotDisconnecting(exceptions);
        });
    };
    this.logMessages = function () {
        forEach(function (socket) {
            socket.logMessages();
        });
    };
    this.afterEach = function (exceptions) {
        forEach(function (socket) {
            socket.afterEach(exceptions);
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
        Promise.runAll(false, true);
        return this;
    };
    this.finishDisconnecting = function (code) {
        mockCore.finishDisconnecting(code);
        return this;
    };
    this.disconnect = function (code) {
        mockCore.disconnect(code);
        return this;
    };
    this.disconnectAbnormally = function (code) {
        mockCore.disconnectAbnormally(code);
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
    this.expectToBeConnected = function () {
        mockCore.expectToBeConnected();
        return this;
    };
    this.expectNotToBeConnected = function () {
        mockCore.expectNotToBeConnected();
        return this;
    };
    this.expectNotDisconnecting = function (exceptions) {
        try {
            mockCore.expectNotDisconnecting();
        } catch (e) {
            exceptions.push(e);
        }

        return this;
    };
    function checkConnection (exceptions) {
        mockCore.expectWasConnected(exceptions);
    }
    var maybeCheckConnection = checkConnection;
    this.expectToBeConnecting = function () {
        mockCore.expectToBeConnecting();
        maybeCheckConnection = function () {};
    };
    this.afterEach = function (exceptions) {
        maybeCheckConnection(exceptions);
        mockCore.expectNotDisconnecting(exceptions);
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

                if (item.indexOf('/jasmine-core/') != -1) {
                    break;
                }

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
        maxdepth = 7;
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
            if (o instanceof File) {
                result += indent + 'File [' + (o.name || 'unnamed') + ']';
            } else {
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

function JsTester_NoWindowMessage () {
    this.getJSON = function () {
        return {};
    };

    this.startsWith = () => false;
    this.log = () => console.log(`Window message: not exists`);

    this.expectMessageToContain = function (expectedContent) {
        throw new Error(
            'Ни одно сообщение не было отправлено в родительское окно, однако должно быть отправлено JSON-сообщение ' +
            'с таким содержимым ' + JSON.stringify(expectedContent) + '.'
        );
    };

    this.expectTargetOriginToEqual = function (expectedTargetOrigin) {
        throw new Error(
            'Ни одно сообщение не было отправлено в родительское окно, однако сообщение должно быть отправлено в ' +
            'окно с хостом "' + expectedTargetOrigin + '".'
        );
    };

    this.expectMessageToEqual = function (expectedMessage) {
        throw new Error(
            'Ни одно сообщение не было отправлено в родительское окно, однако должно было быть отправлено ' +
            'сообщение "' + expectedMessage + '".'
        );
    };

    this.expectMessageToStartsWith = function (expectedPrefix) {
        if (!this.startsWith(expectedPrefix)) {
            throw new Error(
                'В родительское окно должно быть отправлено сообщение начинающееся с "' + expectedPrefix + '", ' +
                'однако ни одно сообщение не было отправлено.'
            );
        }

        return this;
    };

    this.expectNotToExist = function () {};
}

function JsTester_WindowMessage (args) {
    var actualMessage = args.actualMessage,
        actualTargetOrigin = args.actualTargetOrigin,
        debug = args.debug,
        utils = args.utils,
        callStack = debug.getCallStack();

    this.startsWith = prefix => actualMessage.indexOf(prefix) === 0;
    this.log = () => console.log(`Window message: ${actualMessage}`);

    this.getJSON = function () {
        var data;

        try {
            data = JSON.parse(actualMessage);
        } catch (e) {
            data = {};
        }

        return data || {};
    };

    this.expectMessageToContain = function (expectedContent) {
        if (typeof expectedContent === 'string' ) {
            if (!actualMessage.includes(expectedContent)) {
                throw new Error(
                    'В окно должно быть отправлено сообщение, содержащее подстроку "' + expectedContent + '", однако ' +
                    'в окно было отправлено сообщение "' + actualMessage + '".'
                );
            }

            return this;
        }

        utils.expectObjectToContain(this.getJSON(), expectedContent);
        return this;
    };

    this.expectTargetOriginToEqual = function (expectedTargetOrigin) {
        if (expectedTargetOrigin != actualTargetOrigin) {
            throw new Error(
                'Сообщение должно быть отправлено в окно с хостом "' + expectedTargetOrigin + '", тогда, как оно ' +
                'было отправлено в окно с хостом "' + actualTargetOrigin + '".'
            );
        }

        return this;
    };

    this.expectMessageToEqual = function (expectedMessage) {
        if (actualMessage != expectedMessage) {
            throw new Error(
                'В окно должно быть отправлено сообщение "' + expectedMessage + '", однако было ' +
                'отправлено сообщение "' + actualMessage + '".' + "\n\n" + callStack
            );
        }

        return this;
    };

    this.expectMessageToStartsWith = function (expectedPrefix) {
        if (!this.startsWith(expectedPrefix)) {
            throw new Error(
                'В окно должно быть отправлено сообщение начинающееся с "' + expectedPrefix + '", ' +
                'однако было отправлено сообщение "' + actualMessage + '".' + "\n\n" + callStack
            );
        }

        return this;
    };

    this.expectNotToExist = function (errors) {
        var error = new Error(
            'Ни одно сообщение не должно быть отправлено в окно, однако было отправлено сообщение "' +
            actualMessage + '".' + "\n\n" + callStack + "\n\n"
        );

        if (errors) {
            errors.push(error);
        } else {
            throw error;
        }
    };
}

function JsTester_FakeWindow (args) {
    var postMessages = args.postMessages,
        debug = args.debug,
        utils = args.utils;

    this.focus = function () {};

    this.location = {
        href: 'https://fake-window.com',
    };

    this.postMessage = function (actualMessage, actualTargetOrigin) {
        postMessages.add(new JsTester_WindowMessage({
            actualMessage: actualMessage,
            actualTargetOrigin: actualTargetOrigin,
            debug: debug,
            utils: utils
        }));
    };
}

function JsTester_ParentWindowReplacer (fakeWindow) {
    var realParent = window.parent,
        win = realParent;

    Object.defineProperty(window, 'parent', {
        get : function () {
            return win;
        }
    });     

    this.replaceByFake = function () {
        win = fakeWindow;
    };
    this.restoreReal = function () {
        win = realParent;
    };
}

function JsTester_PostMessageTester ({
    postMessages,
    utils,
}) {
    this.nextMessage = () => postMessages.pop();

    this.receive = message => utils.receiveWindowMessage(message.data && message.origin ? {
        ...message,
        data: typeof message.data == 'string' ? message.data : JSON.stringify(message.data),
    } : {
        data: typeof message == 'string' ? message : JSON.stringify(message),
        origin: 'https://somedomain.com',
    });
}

function JsTester_Tests (factory) {
    Object.defineProperty(window, 'MessageChannel', {
        get: function () {
            return undefined;
        },
        set: function () {}
    }); 

    Object.defineProperty(window, 'performance', {
        get: function () {
            return {};
        },
        set: function () {}
    });

    ['requestAnimationFrame', 'requestIdleCallback', 'queueMicrotask'].forEach(methodName => {
        Object.defineProperty(window, methodName, {
            get: function () {
                return function (callback) {
                    return setTimeout(callback, 0);
                };
            },
            set: function () {}
        });
    });

    const resizeObservables = new Map(),
        triggerResize = new JsTester_ResizeObserverTrigger(resizeObservables),
        ResizeObserver = new JsTester_ResizeObserverFactory(resizeObservables);

    Object.defineProperty(window, 'ResizeObserver', {
        get: function () {
            return ResizeObserver;
        },
        set: function () {}
    });

    Object.defineProperty(window, 'cancelAnimationFrame', {
        get: function () {
            return function (handle) {
                clearTimeout(handle);
            };
        },
        set: function () {}
    }); 

    var args = {},
        testRunners = [],
        requiredClasses = [],
        files = new Map(),
        cookie = new JsTester_RWVariable(''),
        cookieTester = new JsTester_CookieTester(cookie),
        storageMocker = new JsTester_StorageMocker(),
        timeoutLogger = new JsTester_Logger(),
        downloadPreventer = new JsTester_DownloadPreventer(),
        debug = factory.createDebugger(),
        timeout = new JsTester_Timeout(
            'setTimeout',
            'clearTimeout',
            JsTester_OneTimeDelayedTask,
            timeoutLogger,
            debug
        ),
        interval = new JsTester_Timeout(
            'setInterval',
            'clearInterval',
            JsTester_RepetitiveDelayedTask,
            timeoutLogger,
            debug
        );

    var spendTime = function (time) {
        timeout.spendTime(time);
        interval.spendTime(time);
        Promise.runAll(false, true);
    };

    var fileReaderTester = new JsTester_FileReaderTester({ files, spendTime }),
        fileReaderMocker = new JsTester_FileReaderMocker(files);

    var windowSize = new JsTester_WindowSize(spendTime),
        utils = factory.createUtils({
            debug,
            windowSize,
            spendTime,
            args,
        }),
        broadcastChannelMessages = new JsTester_Queue(new JsTester_NoBroadcastChannelMessage()),
        broadcastChannelHandlers = {},
        broadcastChannelShortcutHandlers = {},
        broadcastChannelMessageEventFirers = {},
        broadcastChannelsToIgnore = new Set(),
        BroadcastChannel = new JsTester_BroadcastChannelFactory({
            debug: debug,
            utils: utils,
            handlers: broadcastChannelHandlers,
            shortcutHandlers: broadcastChannelShortcutHandlers,
            broadcastChannelMessages: broadcastChannelMessages,
            broadcastChannelMessageEventFirers: broadcastChannelMessageEventFirers
        }),
        broadcastChannelTester = new JsTester_BroadcastChannelsTester({
            broadcastChannelMessages: broadcastChannelMessages,
            broadcastChannelMessageEventFirers: broadcastChannelMessageEventFirers,
            broadcastChannelsToIgnore: broadcastChannelsToIgnore
        }),
        broadcastChannelMocker = new JsTester_BroadcastChannelMocker({
            broadcastChannelMessageEventFirers: broadcastChannelMessageEventFirers,
            broadcastChannelTester: broadcastChannelTester,
            broadcastChannelMessages: broadcastChannelMessages,
            BroadcastChannel: BroadcastChannel,
            handlers: broadcastChannelHandlers,
            shortcutHandlers: broadcastChannelShortcutHandlers
        }),
        intersectionObservations = new Map(),
        intersectionObservationHandlers = new Map(),
        FakeIntersectionObserver = new JsTester_IntersectionObserverFactory({
            intersectionObservations,
            intersectionObservationHandlers
        }),
        intersectionObservablesTester = new JsTester_IntersectionObservablesTester({
            utils,
            intersectionObservations,
            intersectionObservationHandlers
        }),
        intersectionObserverMocker = new JsTester_IntersectionObserverMocker(FakeIntersectionObserver),
        mutationObserverFactory = new JsTester_MutationObserverFactory(utils),
        mutationObserverMocker = new JsTester_MutationObserverMocker(mutationObserverFactory),
        mutationObserverTester =  mutationObserverFactory.createTester(),
        hasFocus = new JsTester_Variable(),
        isBrowserHidden = new JsTester_Variable(),
        isBrowserVisible = new JsTester_Variable(true),
        setBrowserHidden = isBrowserHidden.createSetter(),
        setBrowserVisible = isBrowserVisible.createSetter(),
        focusReplacer = new JsTester_FocusReplacer(hasFocus),
        browserVisibilityReplacer = new JsTester_BrowserVisibilityReplacer({
            isBrowserHidden,
            isBrowserVisible
        }),
        notifications = new JsTester_Queue(new JsTester_NoNotificationMessage()),
        notificationPermissionRequests = new JsTester_Queue({
            callback: function () {}
        }),
        notificationPermission = new JsTester_RWVariable(),
        notificationClickHandler = new JsTester_FunctionVariable(function () {}),
        notificationTester = new JsTester_NotificationTester({
            notifications: notifications,
            notificationClickHandler: notificationClickHandler.createValueCaller(),
            notificationPermissionRequests: notificationPermissionRequests,
            notificationPermissionSetter: notificationPermission.set
        }),
        notificationReplacer = new JsTester_NotificationReplacer({
            spendTime,
            debug: debug,
            notificationClickHandler: notificationClickHandler,
            notifications: notifications,
            notificationPermissionRequests: notificationPermissionRequests,
            notificationPermission: notificationPermission
        }),
        ajaxTester = new JsTester_AjaxTester(utils, debug),
        fetchTester = new JsTester_FetchTester(utils),
        windowOpener = new JsTester_WindowOpener(utils),
        webSocketLogger = new JsTester_Logger(),
        webSocketFactory = new JsTester_WebSocketFactory({
            utils,
            logger: webSocketLogger,
            debug,
            spendTime,
        }),
        webSockets = webSocketFactory.createCollection(),
        webSocketReplacer = new JsTester_WebSocketReplacer(webSocketFactory),
        userMediaEventHandlers = new JsTester_UserMediaEventHandlers(debug),
        mediaDevicesUserMediaGetter = new JsTester_MediaDevicesUserMediaGetter(userMediaEventHandlers),
        userMediaGetter = new JsTester_UserMediaGetter(userMediaEventHandlers),
        additionalDevices = [],
        mediaDevicesEventListeners = new Map(),
        userDeviceHandling = new JsTester_EventHandling({
            listeners: mediaDevicesEventListeners,
            events: ['devicechange']
        }),
        navigatorMock = new JsTester_NavigatorMock({
            userMediaGetter: userMediaGetter,
            mediaDevicesUserMediaGetter: mediaDevicesUserMediaGetter,
            additionalDevices: additionalDevices,
            mediaDevicesEventListeners: mediaDevicesEventListeners,
            userDeviceHandling: userDeviceHandling
        }),
        rtcConnectionStateChecker = new JsTester_FunctionVariable(function () {}),
        rtcConnections = [],
        tracksCreationCallStacks = new Map(),
        playingMediaStreams = new Map(),
        mediaStreamTracks = new Map(),
        audioSources = new Map(),
        mediaStreams = new JsTester_MediaStreams({
            mediaStreamTracks: mediaStreamTracks,
            playingMediaStreams: playingMediaStreams,
            audioSources: audioSources,
            debug: debug,
            RealMediaStream: window.MediaStream
        }),
        userMedia = new JsTester_UserMedia({
            additionalDevices: additionalDevices,
            mediaDevicesEventListeners: mediaDevicesEventListeners,
            tracksCreationCallStacks: tracksCreationCallStacks,
            mediaStreams: mediaStreams,
            eventHandlers: userMediaEventHandlers,
            spendTime: spendTime,
            debug: debug
        }),
        sdp = [
            'v=0',
            'o=- 6845874344053138478 2 IN IP4 127.0.0.1',
            's=-',
            't=0 0',
            'a=group:BUNDLE 0',
            'a=msid-semantic: WMS 2c90093a-9b17-4821-aaf3-7b858065ff07',
            'm=audio 9 UDP/TLS/RTP/SAVPF 111 103 104 9 0 8 106 105 13 110 112 113 126',
            'c=IN IP4 0.0.0.0',
            'a=rtcp:9 IN IP4 0.0.0.0',
            'a=ice-ufrag:7MXY',
            'a=ice-pwd:KAoEygUaHA9Mla0gjHYN9/tK',
            'a=ice-options:trickle',
            'a=fingerprint:sha-256 59:53:4D:AF:66:F5:F1:CE:3A:F7:93:13:5A:E6:07:19:1E:03:E9:22:A1:19:B2:49:6B:C7:37:86:90:21:2B:42',
            'a=setup:actpass',
            'a=mid:0',
            'a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level',
            'a=extmap:2 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01',
            'a=extmap:3 urn:ietf:params:rtp-hdrext:sdes:mid',
            'a=extmap:4 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id',
            'a=extmap:5 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id',
            'a=sendrecv',
            'a=msid:2c90093a-9b17-4821-aaf3-7b858065ff07 f807f562-5698-4b34-a298-bc3f780934c3',
            'a=rtcp-mux',
            'a=rtpmap:111 opus/48000/2',
            'a=rtcp-fb:111 transport-cc',
            'a=fmtp:111 minptime=10;useinbandfec=1',
            'a=rtpmap:103 ISAC/16000',
            'a=rtcp-fb:103 transport-cc',
            'a=fmtp:103 minptime=10;useinbandfec=1',
            'a=rtpmap:104 ISAC/32000',
            'a=rtpmap:9 G722/8000',
            'a=rtpmap:0 PCMU/8000',
            'a=rtpmap:8 PCMA/8000',
            'a=rtpmap:106 CN/32000',
            'a=rtpmap:105 CN/16000',
            'a=rtpmap:13 CN/8000',
            'a=rtpmap:110 telephone-event/48000',
            'a=rtpmap:112 telephone-event/32000',
            'a=rtpmap:113 telephone-event/16000',
            'a=rtpmap:126 telephone-event/8000',
            'a=ssrc:3906726496 cname:bn9leCsdnF9+R5yv',
            'a=ssrc:3906726496 msid:2c90093a-9b17-4821-aaf3-7b858065ff07 f807f562-5698-4b34-a298-bc3f780934c3',
            'a=ssrc:3906726496 mslabel:2c90093a-9b17-4821-aaf3-7b858065ff07',
            'a=ssrc:3906726496 label:f807f562-5698-4b34-a298-bc3f780934c3',
            ''
        ].join("\r\n"),
        image = 'iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAA1dJREFUaEPtmWmoTVEYhp+LhGRI' +
            'lAyJP6TwQxm6yZwh0iUlQwnhhpIfKKJEhFDGiB+mdJWMGW4yRqSUUFJCpMhc5qFXa9223dlnrz2ce86O78+pc9Z+v/c9a61vr+9dZWQ8' +
            'yjLOn39SQEOgPvAu5dlrCnwFPkXBDZsB/d4bGAMMA9oDzUyC78B94BpQBZwHfjomrwMMAsYBfYEuQF3z7BvgCXAaOApcB34F4eYT0B9Y' +
            'DfRyJHUXWAocCRk/FlhhSLtAS8Ai4GKuwbkEaHlsBma4oOcYo9mYBnzw/dYE2ANUxMTdAcwFvnmf9wvQOjwG9IuZxD52GxgKvDRftALO' +
            'Ad0S4l4CRgHvLY5XgNbgcWB4wiT28RvAAPhT6S4APVPCPQWMBn4IzytgFbA4pSQWZiugDTsrZdyVwBKvgI6momj9pxm2eoRVu6g5v5gi' +
            '8MgC7wMmRkUp8vi9wBQJaGw2W4MiE4qaXi+8lhKgl4lKXxajQgLWAQuyyB5YKwEHgAkZFbBfAvSCGZxRAdUScBjQ+SSLUSUBm4B5WWQP' +
            'bJSASmBLRgVUSkAb4KnvWJEFPeo92tk38VXTWGSBuOUozuVWgKqQqlGWQh3iGe8h6yQwIiMKTpi+4K/jdFvT3+qzlEP7tQ/wTCT9x1x1' +
            'TJcBtX+lGOrEyoE7llyuc7o6JzkCLUpMwVuzxOWC1ERQo9EDOKvjaomIeG1snZt+Pvk6pc6mMhV7T7wwBkHNsnGZATumA1ANdCrSTDw2' +
            'B82HQfldetXWZia61rKIB4a8qk5guAjQw/J1tCe615KIe8AQ4HlYPlcBwmkOyJORV1rIuGU27CuXJFEECE8GgAzXgS7gMcZcAUZ6nbcw' +
            'jKgChNfIGLiyDtMMuXeyDT9GAY0jQPgywA4mMGr9HHUOkzvyOQp5jY0rQM/KS90tcylqUt/4Q8Bkv+vsiplEgBWxHZjumtA3To7gVECX' +
            'JbEiqQA7i+uB+REZbAPmRLjVyQmfhgALvBxY5ihijbl1cRwePCxNAcqy0FxL5SOWGvmkmziI5GxzRaV7AW/IapeFuSHx3+4BSHsGLPQk' +
            'cx9Wz3whB2EmsCtN8oWaActxPLDTXJGKvMpl6lGoGbBE7QzELpNhigstICx/4t//C0j8FyYE+A2omn8yNA4wuwAAAABJRU5ErkJggg==',
        rtcPeerConnectionMocker = new JsTester_RTCPeerConnectionMocker({
            sdp: sdp,
            connections: rtcConnections,
            rtcConnectionStateChecker: rtcConnectionStateChecker,
            mediaStreams: mediaStreams,
            tracksCreationCallStacks: tracksCreationCallStacks,
            debug: debug,
            spendTime,
        }),
        rtcConnectionsMock = new JsTester_RTCPeerConnections({
            tracksCreationCallStacks: tracksCreationCallStacks,
            connections: rtcConnections,
            stateChecker: rtcConnectionStateChecker,
            mediaStreamTracks: mediaStreamTracks,
            mediaStreams: mediaStreams
        }),
        testsExecutionBeginingHandlers = [],
        checkRTCConnectionState = rtcConnectionStateChecker.createValueCaller(),
        mediaStreamsTester = new JsTester_MediaStreamsTester({
            spendTime,
            mediaStreamsPlayingExpectaionFactory: new JsTester_MediaStreamsPlayingExpectationFactory(mediaStreamTracks),
            playingMediaStreams: playingMediaStreams,
            mediaStreams: mediaStreams
        }),
        playingOscillators = new Map(),
        playingOscillatorsTester = new JsTester_PlayingOscillatorsTester(playingOscillators),
        bufferToContent = new Map(),
        destinationToSource = new Map(),
        trackToDestination = new Map(),
        destinationToGain = new Map(),
        audioGainTester = new JsTester_AudioGainTester({
            destinationToGain: destinationToGain,
            trackToDestination: trackToDestination,
            utils: utils
        }),
        audioProcessingTester = new JsTester_AudioProcessingTester({
            trackToDestination: trackToDestination
        }),
        decodedTracksTester = new JsTester_DecodedTracksTester({
            bufferToContent: bufferToContent,
            destinationToSource: destinationToSource,
            trackToDestination: trackToDestination
        }),
        mediaStreamSourceToMediaStream = new Map(),
        audioNodesConnection = new JsTester_AudioNodesConnection({
            destinationToSource: destinationToSource,
            destinationToGain: destinationToGain,
            mediaStreamSourceToMediaStream: mediaStreamSourceToMediaStream,
            trackToDestination: trackToDestination
        }),
        audioContextFactory = new JsTester_AudioContextFactory({
            mediaStreamSourceToMediaStream,
            audioNodesConnection,
            mediaStreams,
            bufferToContent,
            destinationToSource,
            trackToDestination,
            playingOscillators,
            tracksCreationCallStacks,
            spendTime,
            debug,
            utils
        }),
        audioDecodingTester = audioContextFactory.createAudioDecodingTester(),
        audioContextReplacer = new JsTester_AudioContextReplacer(audioContextFactory),
        audioReplacer = new JsTester_AudioReplacer({
            mediaStreams: mediaStreams,
            debug: debug
        }),
        nowValue = new JsTester_Variable(),
        getNow = new JsTester_NowGetter({
            originalNow: Date.now,
            getNow: nowValue.createGetter()
        }),
        setNow = new JsTester_NowSetter(nowValue.createSetter()),
        addSecond = function () {
            nowValue.createSetter()(nowValue.createGetter()() + 1000);
            spendTime(1000);
            spendTime(0);
        },
        now = new JsTester_Now({
            originalNow: Date.now,
            getNow: getNow
        }),
        documentEventsListeners = new Map(),
        windowEventsListeners = new Map(),
        windowEventsFirerer = new JsTester_WindowEventsFirerer(windowEventsListeners),
        windowEventsReplacer = new JsTester_EventsReplacer({
            object: window,
            eventsListeners: windowEventsListeners,
            realEventListenerAssigner: window.addEventListener,
            fakeListenerAssigner: new JsTester_EventListenerAssigner({
                object: window,
                eventsListeners: windowEventsListeners,
                realEventListenerAssigner: window.addEventListener
            })
        }),
        documentEventsReplacer = new JsTester_EventsReplacer({
            object: document,
            eventsListeners: documentEventsListeners,
            realEventListenerAssigner: document.addEventListener,
            fakeListenerAssigner: new JsTester_EventListenerAssigner({
                object: document,
                eventsListeners: documentEventsListeners,
                realEventListenerAssigner: document.addEventListener
            })
        }),
        blobs = [],
        blobsTester = new JsTester_BlobsTester({
            blobs: blobs,
            utils: utils
        }),
        OriginalBlob = window.Blob,
        blobReplacer = new JsTester_BlobReplacer({
            OriginalBlob,
            blobs,
            factory: new JsTester_BlobFactory({
                OriginalBlob,
                blobs,
                utils,
            })
        }),
        copiedTexts = [],
        copiedTextsTester = new JsTester_CopiedTextsTester(copiedTexts),
        execCommandReplacer = new JsTester_ExecCommandReplacer(copiedTexts),
        postMessages = new JsTester_Stack(new JsTester_NoWindowMessage()),
        postMessagesTester = new JsTester_PostMessageTester({
            postMessages,
            utils,
        }),
        fakeWindow = new JsTester_FakeWindow({
            postMessages: postMessages,
            debug: debug,
            utils: utils
        }),
        parentWindowReplacer = new JsTester_ParentWindowReplacer(fakeWindow);

    audioReplacer.replaceByFake();
    windowEventsReplacer.replaceByFake();
    documentEventsReplacer.replaceByFake();
    browserVisibilityReplacer.replaceByFake();

    window.MediaStream = function () {
        var audioTracks;

        if (arguments.length == 1) {
            audioTracks = arguments[0];
        }

        if (audioTracks.length == 1) {
            return new JsTester_MediaStreamWrapper({
                mediaStream: mediaStreams.create(audioTracks),
                audioTrack: audioTracks[0]
            });
        }

        return mediaStreams.create.apply(mediaStreams, arguments);
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
            testersFactory = factory.createTestersFactory({
                wait: wait,
                utils: utils,
                blobsTester: blobsTester,
                spendTime: spendTime
            });
        } catch(e) {
            error = e;
        }

        args.error = '<html>' +
            '<head>' +
                '<title>500 Internal Server Error</title>' +
            '</head>' +
            '<body bgcolor="white">' +
                '<center>' +
                    '<h1>500 Internal Server Error</h1>' +
                '</center>' +
                '<hr>' +
                '<center>nginx/1.10.2</center>' +
            '</body>' +
        '</html>';
        args.triggerResize = triggerResize;
        args.sdp = sdp;
        args.image = image;
        args.windowSize = windowSize;
        args.broadcastChannels = broadcastChannelTester;
        args.mutationObserverMocker = mutationObserverMocker;
        args.intersectionObservable = intersectionObservablesTester;
        args.cookie = cookieTester;
        args.addSecond = addSecond;
        args.unload = () => {
            windowEventsFirerer('unload');
            Promise.runAll(false, true);
        };
        args.fileReader = fileReaderTester;
        args.triggerMutation = mutationObserverTester;
        args.ajax = ajaxTester;
        args.fetch = fetchTester;
        args.testersFactory = testersFactory;
        args.wait = wait;
        args.spendTime = spendTime;
        args.utils = utils;
        args.debug = debug;
        args.windowOpener = windowOpener;
        args.webSockets = webSockets;
        args.webSocketLogger = webSocketLogger;
        args.userMedia = userMedia;
        args.rtcConnectionsMock = rtcConnectionsMock;
        args.navigatorMock = navigatorMock;
        args.timeoutLogger = timeoutLogger;
        args.mediaStreamsTester = mediaStreamsTester;
        args.setNow = setNow;
        args.playingOscillatorsTester = playingOscillatorsTester;
        args.audioDecodingTester = audioDecodingTester;
        args.decodedTracksTester = decodedTracksTester;
        args.audioProcessing = audioProcessingTester;
        args.audioGain = audioGainTester;
        args.notificationTester = notificationTester;
        args.setFocus = new JsTester_FocusSetter(hasFocus.createSetter());
        args.setDocumentVisible = new JsTester_VisibilitySetter({
            setBrowserHidden,
            setBrowserVisible,
            isBrowserHidden: isBrowserHidden.createGetter(),
            spendTime,
        });
        args.blobsTester = blobsTester;
        args.copiedTextsTester = copiedTextsTester;
        args.postMessages = postMessagesTester;

        (function () {
            var name;

            for (name in options) {
                args[name] = options[name];
            }
        })();

        this.handleBeginingOfTestsExecution(args);

        mediaStreams.considerInitial();

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
        window.URL.createObjectURL = function (object) {
            return location.href + '#' + (typeof object == 'string' ? object : object.id);
        };

        setNow(null);

        postMessages.removeAll();
        resizeObservables.clear();
        intersectionObservations.clear();
        intersectionObservationHandlers.clear();
        downloadPreventer.prevent();
        setBrowserHidden(false);
        setBrowserVisible(true);
        audioNodesConnection.reset();
        parentWindowReplacer.replaceByFake();
        additionalDevices.splice(0, additionalDevices.length);
        additionalDevices.push({
            kind: 'audiooutput',
            label: 'Колонка JBL',
            deviceId: 'g8294gjg29guslg82pgj2og8ogjwog8u29gj0pagulo48g92gj28ogtjog82jgab'
        });
        userDeviceHandling.reset();
        utils.enableScrollingIntoView();
        broadcastChannelMocker.replaceByFake();
        mutationObserverMocker.replaceByFake();
        intersectionObserverMocker.replaceByFake();
        fileReaderMocker.replaceByFake();
        execCommandReplacer.replaceByFake();
        blobReplacer.replaceByFake();
        focusReplacer.replaceByFake();
        bufferToContent.clear();
        destinationToSource.clear();
        trackToDestination.clear();
        playingOscillators.clear();
        mediaStreams.clear();
        windowEventsReplacer.prepareToTest();
        documentEventsReplacer.prepareToTest();
        notificationReplacer.replaceByFake();
        audioContextReplacer.replaceByFake();
        cookie.set('');
        storageMocker.replaceByFake();
        rtcPeerConnectionMocker.replaceByFake();
        webSocketReplacer.replaceByFake();
        ajaxTester.replaceByFake();
        fetchTester.replaceByFake();
        timeout.replaceByFake();
        interval.replaceByFake();
        windowOpener.replaceByFake();
        now.replaceByFake();
    };
    this.restoreRealDelayedTasks = function () {
        timeout.restoreReal();
        interval.restoreReal();
        now.restoreReal();
    };
    this.afterEach = function () {
        var exceptions = [];

        this.restoreRealDelayedTasks();
        downloadPreventer.resume();
        broadcastChannelTester.nextMessage().expectNotToExist(exceptions);
        windowSize.reset();
        broadcastChannelMocker.restoreReal();
        postMessagesTester.nextMessage().expectNotToExist(exceptions);
        parentWindowReplacer.restoreReal();
        mutationObserverMocker.restoreReal();
        intersectionObserverMocker.restoreReal();
        fileReaderTester.expectNoFileToBeLoading();
        fileReaderMocker.restoreReal();
        execCommandReplacer.restoreReal();
        blobReplacer.restoreReal();
        notificationTester.recentNotification().expectNotToExist(exceptions);
        notificationTester.expectNotificationPermissionNotToBeRequested(exceptions);
        Promise.clear();
        focusReplacer.restoreReal();
        windowEventsReplacer.restoreReal();
        documentEventsReplacer.restoreReal();
        notificationReplacer.restoreReal();
        audioContextReplacer.restoreReal();
        checkRTCConnectionState(exceptions);
        storageMocker.restoreReal();
        rtcPeerConnectionMocker.restoreReal();
        userMediaEventHandlers.assertNoUserMediaRequestLeftUnhandled(exceptions);
        audioContextFactory.assertNoAudioDecodingHappens(exceptions);
        audioContextFactory.reset();
        ajaxTester.restoreReal(exceptions);
        fetchTester.restoreReal(exceptions);
        windowOpener.restoreReal();
        webSockets.afterEach(exceptions);
        webSockets.expectNoMessageToBeSent(exceptions);
        webSocketReplacer.restoreReal();

        exceptions.forEach(function (exception) {
            throw exception;
        });
    };
}
