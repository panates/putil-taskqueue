/* putil-taskqueue
 ------------------------
 (c) 2017-present Panates
 SQB may be freely distributed under the MIT license.
 For details and documentation:
 https://panates.github.io/putil-taskqueue/
 */

/**
 * Expose `TaskQueue`.
 */

module.exports = TaskQueue;

/**
 * Module dependencies.
 * @private
 */

function TaskQueue(options) {
  this._queue = [];
  this._cancelOnError = options.cancelOnError;
}

const proto = TaskQueue.prototype = {};
proto.constructor = TaskQueue;

/**
 *
 * @param {Function} resolver
 */
proto.enqueue = function(resolver) {
  this._queue.push(resolver);
  this.next();
};

/**
 *
 * @param {Function} resolver
 */
proto.enqueueTop = function(resolver) {
  this._queue.splice(0, 0, resolver);
  this.next();
};

proto.next = function() {
  const self = this;
  if (self._taskRunning) return;

  if (!self._queue.length)
    self._taskRunning = false;
  else {
    const fn = self._queue.shift();
    self._taskRunning = true;
    setImmediate(function() {
      try {
        fn(function() {
          self._taskRunning = false;
          self.next();
        });
      } catch (e) {
        self._taskRunning = false;
        if (self._cancelOnError)
          self.clear();
        throw e;
      }
    });
  }
};

/**
 *
 */
proto.clear = function() {
  this._queue = [];
};
