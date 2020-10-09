/* eslint-disable */
const assert = require('assert');
const TaskQueue = require('../');

describe('TaskQueue', function() {

  it('should construct', function() {
    const queue = new TaskQueue();
    assert.strictEqual(queue.maxQueue, undefined);
  });

  it('should construct with options', function() {
    const queue = new TaskQueue({
      maxQueue: 100
    });
    assert.strictEqual(queue.maxQueue, 100);
  });

  it('should not exceed maxQueue', async function() {
    const queue = new TaskQueue({
      maxQueue: 1
    });
    queue.enqueue(() => {});
    try {
      await queue.enqueue(() => {});
    } catch (e) {
      return;
    }
    assert(1);
  });

  it('should execute task', function(done) {
    const queue = new TaskQueue();
    queue.enqueue(() => {
      done();
    });
  });

  it('should task return a result', async function() {
    const queue = new TaskQueue();
    const result = await queue.enqueue(() => {
      return 123;
    });
    assert.strictEqual(result, 123);
  });

  it('should emit "enqueue" event', function(done) {
    const queue = new TaskQueue();
    queue.on('enqueue', () => {
      done();
    });
    queue.enqueue(() => {
    });
  });

  it('should emit "task-complete" event after each task completed', function(done) {
    const queue = new TaskQueue();
    let i = 0;
    queue.on('finish', () => {
      assert.strictEqual(i, 2);
      done();
    });
    queue.on('task-complete', () => {
      i++;
    });
    queue.enqueue(() => {});
    queue.enqueue(() => {});
  });

  it('should emit "finish" event after all task completed', function(done) {
    const queue = new TaskQueue();
    let i = 0;
    queue.on('finish', () => {
      assert.strictEqual(i, 2);
      done();
    });
    queue.enqueue(() => {
      i++;
    });
    queue.enqueue(() => {
      i++;
    });
  });

  it('should enqueue return promise', function() {
    const queue = new TaskQueue();
    const p = queue.enqueue(() => {});
    assert(p instanceof Promise);
  });

  it('should promise resolved after task executed successfully', function(done) {
    const queue = new TaskQueue();
    let ok;
    queue.enqueue((taskDone) => {
      ok = 1;
      taskDone();
    }).then(() => {
      assert(ok);
      done();
    });
  });

  it('should task return promise', function() {
    const queue = new TaskQueue();
    return queue.enqueue(() => {
      return Promise.resolve();
    });
  });

  it('should handle nested promise', function(done) {
    const queue = new TaskQueue();
    queue.enqueue(() => {
      return Promise.reject();
    }).then(() => done('Failed'))
        .catch(() => done());
  });

  it('should reject promise when task throws error', function(done) {
    const queue = new TaskQueue();
    queue.enqueue(() => {
      throw new Error('Any error');
    }).then(() => done('Failed'))
        .catch(() => done());
  });

  it('should execute next on error', function() {
    const queue = new TaskQueue();
    queue.enqueue(() => {
      throw new Error('test');
    }).catch(() => {});
    return queue.enqueue(() => Promise.resolve());
  });

  it('should emit error event on throw', function(done) {
    const queue = new TaskQueue();
    queue.on('error', () => {
      done();
    });
    queue.enqueue(() => {
      throw new Error('test');
    }).catch(() => {});
  });

  it('should emit error event when task returned rejected promise', function(done) {
    const queue = new TaskQueue();
    queue.on('error', () => {
      done();
    });
    queue.enqueue(() => {
      return Promise.reject('test');
    }).catch(() => {});
  });

  it('should clear', function(done) {
    const queue = new TaskQueue();
    let err;
    queue.enqueue((next) => {
      setTimeout(next, 10);
    });
    queue.enqueue(() => {
      err = new Error('Failed');
    });
    queue.clear();
    queue.enqueue(() => done(err));
  });

});
