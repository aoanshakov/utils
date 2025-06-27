const maybeParseJSON = value => {
    if (typeof value !== 'string') {
        return value;
    }

    try {
        return JSON.parse(value);
    } catch (e) {
        return value;
    }
};

function ParamExpectation () {
    this.maybeThrowError = function (actualValue, keyDescription) {
    };
}

const objectIncludes = ({
    actualParams,
    expectedParams,
    paramsDescription,
}) => {
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

            if (expectedValue instanceof ParamExpectation) {
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

    try {
        checkExpectation(expectedParams, actualParams, forEachObjectItem, function (key) {
            return key;
        });
    } catch (e) {
        console.debug(e);
        return false;
    }

    return true;
};

export function SentMessages({
    logEnabled,

    assertionMessages: {
        messageBeingSentAssertion,
        contentInclusionAssertion,
        paramsDescription,
    },
}) {
    const messages = new Set();

    this.send = function (data) {
        logEnabled && console.log(maybeParseJSON(data));
        messages.add({ data });
    };

    const expectSomeMessageToBeSent = () => {
        expect(
            messages.size,
            messageBeingSentAssertion,
        ).to.be.above(0);
    };

    this.enableLogging = function () {
        logEnabled = true;
    };

    this.reset = function () {
        messages.clear();
    };

    this.popNextSentMessage = function () {
        return cy.wrap(null, { log: false }).should(() => {
            expectSomeMessageToBeSent();
        }).then(() => {
            const message = Array.from(messages)[0];
            messages.delete(message);
            return message.data;
        });
    };

    this.expectSentMessageToInclude = function (expectedContent) {
        let foundMessage;

        return cy.wrap(null, { log: false }).should(() => {
            expectSomeMessageToBeSent();

            let message;

            try {
                message = Array.from(messages).find(message => objectIncludes({
                    actualParams: maybeParseJSON(message.data),
                    expectedParams: expectedContent,
                    paramsDescription,
                }))
            } catch (e) {
                console.error(e);
            }

            message && messages.delete(message);
            expect(!!message, `${contentInclusionAssertion} ${JSON.stringify(expectedContent)}`).to.be.true;

            foundMessage = maybeParseJSON(message.data);
        }).then(() => foundMessage);
    };
}
