/* putil-taskqueue
 ------------------------
 (c) 2017-present Panates
 SQB may be freely distributed under the MIT license.
 For details and documentation:
 https://panates.github.io/putil-taskqueue/
 */

/**
 * Module dependencies.
 * @private
 */

const EventEmitter = require('events').EventEmitter;
const DoublyLinked = require('doublylinked');

/**
 * Expose `TaskQueue`.
 */

module.exports = TaskQueue;

/**
 *
 * @param {Object} [options]
 * @param {int} [options.maxQueue]
 * @constructor
 */
function TaskQueue(options) {
  EventEmitter.call(this);
  this._queue = new DoublyLinked();
  this.maxQueue = options && options.maxQueue;
}

TaskQueue.prototype = {
  get size() {
    return this._queue.length + (this._taskRunning ? 1 : 0);
  }
};
Object.setPrototypeOf(TaskQueue.prototype, EventEmitter.prototype);
TaskQueue.prototype.constructor = TaskQueue;

/**
 *
 * @param {Function} resolver
 */
TaskQueue.prototype.enqueue = function(resolver) {
  this.push.apply(this, arguments);
};

TaskQueue.prototype.push = function(resolver) {
  if (this.maxQueue && this.size >= this.maxQueue)
    throw new Error('Queue limit exceeded');
  this._queue.push(resolver);
  this.next();
};

/**
 *
 * @param {Function} resolver
 */
TaskQueue.prototype.unshift = function(resolver) {
  this._queue.unshift(resolver);
  this.next();
};

TaskQueue.prototype.next = function() {
  const self = this;
  if (self._taskRunning)
    return;

  const fn = self._taskRunning = self._queue.shift();
  if (fn) {
    try {
      fn(function() {
        setImmediate(function() {
          self._taskRunning = null;
          self.next();
        });
      });
    } catch (e) {
      self._taskRunning = null;
      if (self.listenerCount('error') > 0)
        self.emit('error', e);
      setImmediate(function() {
        self.next();
      });
    }
  }
};

/**
 *
 */
TaskQueue.prototype.clear = function() {
  this._queue = new DoublyLinked();
};
