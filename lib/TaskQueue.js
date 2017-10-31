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
  this.cancelOnError = options && options.cancelOnError;
  this.maxQueue = options && options.maxQueue;
}

const proto = TaskQueue.prototype = {
  get size() {
    return this._queue.length;
  }
};
proto.constructor = TaskQueue;

/**
 *
 * @param {Function} resolver
 */
proto.enqueue = function(resolver) {
  if (this.maxQueue && this._queue.length >= this.maxQueue)
    throw new Error('Queue limit exceeded');
  this._queue.push(resolver);
  this.next();
};

/**
 *
 * @param {Function} resolver
 */
proto.enqueueTop = function(resolver) {
  this._queue.unshift(resolver);
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
        if (self.cancelOnError)
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
