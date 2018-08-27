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
      this._queue.push((...args) => {
        try {
          return Promise.resolve(task(...args))
              .then(() => resolve())
              .catch(e => {
                reject(e);
                throw e;
              });
        } catch (e) {
          reject(e);
          return Promise.reject(e);
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
    let fn;
    const handleCallback = (err) => {
      if (!fn) return;
      fn = null;
      if (err && this.listenerCount('error') > 0)
        this.emit('error', err);
      this._taskRunning = null;
      setImmediate(() => this._next());
    };

    fn = this._taskRunning = this._queue.shift();
    if (fn) {
      try {
        fn((err) => handleCallback(err))
            .then(() => handleCallback())
            .catch(e => handleCallback(e));
      } catch (e) {
        handleCallback(e);
      }
    }
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
