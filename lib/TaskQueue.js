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
 *
 * @class
 */
class TaskQueue extends EventEmitter {
  /**
   *
   * @param {Object} [options]
   * @param {int} [options.maxQueue]
   * @constructor
   */
  constructor(options) {
    super();
    this._queue = new DoublyLinked();
    this.maxQueue = options && options.maxQueue;
  }

  get size() {
    return this._queue.length + (this._taskRunning ? 1 : 0);
  }

  /**
   *
   * @param {Function} task Adds new task to the execute queue
   * @return {Promise}
   */
  enqueue(task) {
    if (this.maxQueue && this.size >= this.maxQueue)
      throw new Error('Queue limit exceeded');
    return new Promise((resolve, reject) => {
      this._queue.push(() => {
        let resolved;
        const handleCallback = (err) => {
          if (resolved) return;
          resolved = true;
          this._taskRunning = null;
          setImmediate(() => this._next());
          if (err) {
            reject(err);
            if (this.listenerCount('error') > 0)
              this.emit('error', err);
          } else
            resolve();
        };
        try {
          const o = task(handleCallback);
          if (typeof o === 'object' && typeof o.then === 'function' &&
              typeof o.catch === 'function') {
            o.then(() => handleCallback())
                .catch(e => handleCallback(e || 'Rejected'));
          }

        } catch (e) {
          handleCallback(e);
        }
      });
      this._next();
    });
  }

  /**
   * Executes next task
   * @private
   */
  _next() {
    if (this._taskRunning)
      return;
    this._taskRunning = this._queue.shift();
    if (this._taskRunning)
      this._taskRunning();
  }

  /**
   *
   */
  clear() {
    this._queue = new DoublyLinked();
  }
}

/**
 * Expose `TaskQueue`.
 */

module.exports = TaskQueue;
