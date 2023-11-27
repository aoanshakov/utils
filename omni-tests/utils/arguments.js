const path = require('path'),
    fs = require('fs');

module.exports.log = label => value => console.log(`${label}: ${value}`);
module.exports.logOptional = log => (value, args) => log(value || 'None', args);
module.exports.logBoolean = log => (value, args) => log(value ? 'Yes' : 'No', args);

module.exports.isOneOf = (...variants) => (key, value) => {
    if (variants.some(variant => value == variant)) {
        return value;
    }

    const lastIndex = variants.length - 1;

    variants = variants.map(variant => JSON.stringify(variant));
    variants = `${variants.slice(variants, lastIndex).join(', ')} or ${variants[lastIndex]}`;

    throw new Error(`Value for argument "${key}" should be ${variants}`);
};

module.exports.isListOf = (...variants) => (key, value) => {
    if (value === true) {
        return [];
    }

    value = value.split(',');

    value.forEach(
        value => module.exports.isOneOf(...variants)(key, value)
    );

    return value;
};

module.exports.isTrue = (key, value) => {
    if (value !== true) {
        throw new Error(`Value for argument "${key}" cannot be specified`);
    }

    return true;
};

module.exports.isString = (key, value) => {
    if (typeof value != 'string') {
        throw new Error(`Value of argument "${key}" should be string`);
    }

    return value;
};

module.exports.isInteger = (key, value) => {
    value = value ? `${value}` : '';
    const convertedValue = parseInt(value, 0);

    if (`${convertedValue}` !== value) {
        throw new Error(`Value of argument "${key}" should be integer`);
    }

    return convertedValue;
};

module.exports.isPath = (key, value) => {
    value = module.exports.isString(key, value);

    if (value[0] != '/') {
        value = path.resolve(__dirname, value);
    }

    if (!fs.existsSync(value)) {
        throw new Error(`File "${value}" not exists`);
    }
    
    return value;
};

module.exports.Args = function (availableArgs) {
    const checkArgument = (key, value) => {
        if (!value) {
            throw new Error(`Argument "${key}" should not be empty`);
        }

        const argument = availableArgs[key];

        if (!argument) {
            throw new Error(`Argument "${key}" is not supported`);
        }

        return argument.validate(key, value);
    };

    return {
        createObjectFromArgsArray: args => {
            args = args.slice(2);
            let previousKey;
            const {length} = args,
                result = {};
            const checkCommandLineArgument = () =>
                (result[previousKey] = checkArgument(previousKey, result[previousKey]));

            const maybeSetBooleanValue = () => {
                if (previousKey && !(previousKey in result)) {
                    result[previousKey] = true;
                    checkCommandLineArgument();
                }
            };

            for (let i = 0; i < length; i ++) {
                const argument = args[i],
                    match = argument.match(/^--([a-z\-0-9]*)$/),
                    isKey = !!match;

                if (isKey) {
                    maybeSetBooleanValue();
                    previousKey = match[1];
                } else {
                    if (!previousKey) {
                        throw new Error(`Key is undefined for value "${argument}"`);
                    }

                    if (previousKey in result) {
                        !Array.isArray(result[previousKey]) && (result[previousKey] = [result[previousKey]]);
                        result[previousKey].push(argument);
                    } else {
                        result[previousKey] = argument;
                    }

                    checkCommandLineArgument();
                }
            }

            maybeSetBooleanValue();
            return result;
        },
        createArgsArrayFromObject: args => {
            const result = [];

            Object.entries(availableArgs).forEach(([key]) => {
                if (!(key in args)) {
                    return;
                }

                const value = checkArgument(key, args[key]);
                result.push(`--${key}`);
                value !== true && result.push(value);
            });

            return result;
        },
        log: args => {
            console.log();

            Object.entries(availableArgs).forEach(([key, value]) => {
                value.log(args[key], args);
            });

            console.log();
        }
    };
};
