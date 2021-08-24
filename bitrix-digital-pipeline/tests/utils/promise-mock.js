define(['promise-polyfill'], function (Promise) {
    'use strict';

    function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

    var root = typeof window === 'undefined' ? global : window;


    function PromiseMock() {
        this.callStack = jsTestDebug.getCallStack();
        //console.log(arguments[0]);
      Promise.apply(this, arguments);
    }
    PromiseMock.prototype = Object.create(Promise.prototype);
    Object.keys(Promise).forEach(function (key) {
      PromiseMock[key] = Promise[key];
    });

    // Queue of waiting callbacks
    PromiseMock.waiting = [];


    /**
     * Execute a pending Promise
     */
    PromiseMock.run = function run(count, printCallStack) {
      var runTimes = count ? count : 1;

      if (PromiseMock.waiting.length === 0) {
        throw new Error('No Promises waiting. Can\'t Promise.run()')
      }

      while (runTimes > 0 && PromiseMock.waiting.length > 0) {
        var fn = PromiseMock.waiting.shift();

          if (printCallStack) {
              console.log(fn.callStack);
          }

        fn();
        runTimes--;
      }
    };

    /**
     * Execute all pending Promises
     */
    PromiseMock.runAll = function runAll(printCallStack, silently) {
      if (PromiseMock.waiting.length === 0) {
          if (!silently) {
              throw new Error('No Promises waiting. Can\'t Promise.runAll()')
          }

          return;
      }

      while (PromiseMock.waiting.length > 0) {
        PromiseMock.run(1, printCallStack);
      }
    };


    PromiseMock._orginal = null;
    PromiseMock.install = function install() {
      PromiseMock._original = root.Promise;
      PromiseMock._originalImmediate = Promise._immediateFn;
      // Update the immediate function to push to queue
      Promise._immediateFn = function mockImmediateFn(fn) {
        fn.callStack = (function () {
            try {
                throw new Error();
            } catch(e) {
                return e.stack;
            }
        })();

        PromiseMock.waiting.push(fn);
      };

      root.Promise = PromiseMock;
    };

    PromiseMock.uninstall = function uninstall() {
      PromiseMock.clear();
      if (PromiseMock._original) {
        root.Promise = PromiseMock._original;
      }

      if (PromiseMock._originalImmediate) {
        Promise._immediateFn = PromiseMock._originalImmediate;
      }
    };

    /**
     * Get the result of a Promise synchronously, throws on Promise reject
     * @param {Promise} promise
     * @returns {*}
     */
    PromiseMock.getResult = function result(promise) {
      var result, error;
      promise.then(function (promResult) {
        result = promResult;
      }, function (promError) {
        error = promError;
      });
      PromiseMock.runAll();
      if (error) {
        throw error;
      }
      return result;
    };

    /**
     * Clear all pending Promises
     */
    PromiseMock.clear = function clear() {
      PromiseMock.waiting = [];
    };

    return PromiseMock;
});
