/* putil-taskqueue
 ------------------------
 (c) 2017-present Panates
 SQB may be freely distributed under the MIT license.
 For details and documentation:
 https://panates.github.io/putil-taskqueue/
 */

/**
 * @class
 * @public
 */

class TaskQueue {

  constructor(options) {
    this._queue = [];
    this._cancelOnError = options.cancelOnError;
  }

  /**
   *
   * @param {Function} resolver
   */
  enqueue(resolver) {
    this._queue.push(resolver);
    this.next();
  }

  /**
   *
   * @param {Function} resolver
   */
  enqueueTop(resolver) {
    this._queue.splice(0, 0, resolver);
    this.next();
  }

  next() {
    const self = this;
    if (self._taskRunning) return;

    if (!self._queue.length)
      self._taskRunning = false;
    else {
      const fn = self._queue.shift();
      self._taskRunning = true;
      setImmediate(() => {
        try {
          fn(() => {
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
  }

  /**
   *
   */
  clear() {
    this._queue = [];
  }

}

module.exports = TaskQueue;
