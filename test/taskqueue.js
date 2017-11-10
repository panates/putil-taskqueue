/* eslint-disable */
const assert = require('assert'),
    TaskQueue = require('../');

describe('TaskQueue', function() {

  it('should construct', function() {
    var queue = new TaskQueue();
    assert.equal(queue.maxQueue, undefined);
  });

  it('should construct with options', function() {
    var queue = new TaskQueue({
      maxQueue: 100
    });
    assert.equal(queue.maxQueue, 100);
  });

  it('should not exceed maxQueue', function(done) {
    var queue = new TaskQueue({
      maxQueue: 1
    });
    queue.enqueue(function() {});
    try {
      queue.enqueue(function() {});
    } catch (e) {
      done();
    }
    assert(1);
  });

  it('should push', function(done) {
    var queue = new TaskQueue();
    queue.push(function() {
      done();
    });
  });

  it('should enqueue', function(done) {
    var queue = new TaskQueue();
    queue.enqueue(function() {
      done();
    });
  });

  it('should unshift', function(done) {
    var queue = new TaskQueue();
    var a = [];
    queue.enqueue(function(next) {
      a.push(1);
      setTimeout(next, 10);
    });
    queue.unshift(function(next) {
      a.push(2);
      assert.deepEqual(a, [1, 3, 2]);
      done();
    });
    queue.unshift(function(next) {
      a.push(3);
      next();
    });
  });

  it('should next on error', function(done) {
    var queue = new TaskQueue();
    queue.push(function(next) {
      throw new Error('test');
    });
    queue.push(function(next) {
      next();
      done();
    });
  });

  it('should handle throwed error', function(done) {
    var queue = new TaskQueue();
    queue.on('error', function() {
      done();
    });
    queue.push(function(next) {
      throw new Error('test');
    });
  });

  it('should handle error', function(done) {
    var queue = new TaskQueue();
    queue.on('error', function() {
      done();
    });
    queue.push(function(next) {
      next(Error('test'));
    });
  });

  it('should clear', function(done) {
    var queue = new TaskQueue();
    queue.enqueue(function(next) {
      setTimeout(next, 10);
    });
    queue.clear();
    queue.push(function(next) {
      assert(1);
    });
    setTimeout(function() {
      done();
    }, 10);
  });

});