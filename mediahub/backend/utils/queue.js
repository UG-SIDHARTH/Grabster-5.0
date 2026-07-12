/**
 * A lightweight promise-based task queue to limit concurrency.
 * Ensures that no more than a specified number of downloads run simultaneously,
 * preventing server load spikes on small virtual private servers (VPS).
 */
class TaskQueue {
  constructor(concurrency = 2) {
    this.concurrency = concurrency;
    this.runningCount = 0;
    this.queue = [];
  }

  /**
   * Enqueues a task and returns a promise that resolves when the task finishes.
   * @param {Function} task - A function that returns a Promise.
   * @returns {Promise}
   */
  async run(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this._next();
    });
  }

  _next() {
    if (this.runningCount >= this.concurrency || this.queue.length === 0) {
      return;
    }

    const { task, resolve, reject } = this.queue.shift();
    this.runningCount++;

    task()
      .then(resolve)
      .catch(reject)
      .finally(() => {
        this.runningCount--;
        this._next();
      });
  }
}

// Instantiate download queue with concurrency limit of 2
const downloadQueue = new TaskQueue(2);

module.exports = {
  downloadQueue,
  TaskQueue
};
