Error.stackTraceLimit = Infinity;

var testsComplete = false;

var ConsoleReporter = function() {
    jasmineRequire.JsApiReporter.apply(this, arguments);
};

ConsoleReporter.prototype = jasmineRequire.JsApiReporter.prototype;
ConsoleReporter.prototype.constructor = ConsoleReporter;
ConsoleReporter.prototype.jasmineDone = function() {
    testsComplete = true;
};
ConsoleReporter.prototype.specDone = function(o) {
    o = o || {};

    if (o.status == 'pending') {
        return;
    }

    if (o.status == 'passed') {
        console.log('%c%s', 'color: green;', "\n" + 'Passed: ' + o.fullName);
    }

    if (o.status !== 'passed') {
        var expectation = o.failedExpectations[0];
            stack = expectation && expectation.stack ? expectation.stack : '';
            message = (!expectation || stack.indexOf(expectation.message) != -1) ? '' : expectation.message;

        console.log(
            '%c%s', 'color: red;', "\n" + 'Failed: ' + o.fullName + "\n\n" + message + stack
        );
    }
};

var env = jasmine.getEnv();

env.configure({
    random: false
});

env.addReporter(new ConsoleReporter());
