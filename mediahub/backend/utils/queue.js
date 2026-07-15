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
   * @param {string} [id] - Optional task identifier.
   * @returns {Promise}
   */
  async run(task, id) {
    return new Promise((resolve, reject) => {
      this.queue.push({ id, task, resolve, reject });
      this._next();
    });
  }

  /**
   * Cancels a task in the queue if it has not started executing yet.
   * @param {string} id - The ID of the task to cancel.
   * @returns {boolean} True if successfully cancelled, false if not found.
   */
  cancel(id) {
    if (!id) return false;
    const index = this.queue.findIndex(item => item.id === id);
    if (index !== -1) {
      const { reject } = this.queue.splice(index, 1)[0];
      reject(new Error('Task cancelled in queue.'));
      return true;
    }
    return false;
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
