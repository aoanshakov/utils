const {exec} = require('child_process');

const execute = (command, callback) => {
    if (!command) {
        callback();
        return;
    }

    if (typeof command == 'function') {
        command.getDescription && console.log(command.getDescription());
        const result = command();

        if (!result || typeof result.then != 'function') {
            callback();
            return;
        }

        result.catch(error => {
            throw new Error(error);
        }).then(callback)

        return;
    }

    if (typeof command == 'string') {
        console.log(`> ${command}`);
    }

    const stream = exec(
        command,
        {maxBuffer: 1024 * 1024 * 500},
        error => error ? console.log(`Failed to execute command: ${command}`, error) : callback()
    );

    stream.stdout.pipe(process.stdout)
    stream.stderr.pipe(process.stdout)
};

module.exports = commands => new Promise(resolve => {
    commands = typeof commands == 'string' ? [commands] : commands;
    const {length} = commands;

    if (!length) {
        resolve();
        return;
    }

    const executeQueue = i => {
        if (i == length) {
            resolve();
            return;
        }

        execute(commands[i], () => executeQueue(i + 1));
    };

    executeQueue(0);
});
