/**
 * jobs/scheduler.js
 * Background job scheduler
 *
 * Runs crawler jobs during quiet hours (2-6 AM UTC / 9 PM - 1 AM EST)
 * Prevents impact on user traffic during peak hours
 */

'use strict';

const { CronJob } = require('cron');
const { crawlBusinessesJob } = require('./crawlBusinessesJob');

let scheduledJobs = [];

/**
 * Initialize job scheduler
 */
function initializeScheduler() {
  console.log('[SCHEDULER] Initializing background job scheduler...');

  // Run crawler at 2 AM UTC every day (off-peak)
  const crawlerJob = new CronJob(
    '0 2 * * *', // Every day at 2:00 AM UTC
    async () => {
      console.log('[SCHEDULER] Triggering crawler job...');
      try {
        const result = await crawlBusinessesJob();
        console.log('[SCHEDULER] Crawler job result:', result);
      } catch (err) {
        console.error('[SCHEDULER] Crawler job failed:', err.message);
      }
    },
    null, // onComplete
    true, // start immediately
    'UTC'
  );

  scheduledJobs.push({
    name: 'crawlBusinesses',
    job: crawlerJob,
    schedule: '0 2 * * * (2 AM UTC daily)',
    status: 'running'
  });

  console.log('[SCHEDULER] ✅ Crawler job scheduled for 2 AM UTC daily');

  // Optional: Run every 6 hours during off-peak
  // Uncomment to increase crawl frequency
  /*
  const crawlerJob6h = new CronJob(
    '0 0,6,12,18 * * *', // Every 6 hours
    async () => {
      console.log('[SCHEDULER] Triggering 6-hour crawler job...');
      try {
        const result = await crawlBusinessesJob();
        console.log('[SCHEDULER] Crawler job result:', result);
      } catch (err) {
        console.error('[SCHEDULER] Crawler job failed:', err.message);
      }
    },
    null,
    true,
    'UTC'
  );
  scheduledJobs.push({
    name: 'crawlBusinesses6h',
    job: crawlerJob6h,
    schedule: '0 0,6,12,18 * * * (every 6 hours)',
    status: 'running'
  });
  console.log('[SCHEDULER] Crawler job scheduled every 6 hours');
  */

  return scheduledJobs;
}

/**
 * Get scheduler status
 */
function getSchedulerStatus() {
  return {
    jobs: scheduledJobs.map(j => ({
      name: j.name,
      schedule: j.schedule,
      status: j.status,
      nextRun: j.job.nextDate().toISOString()
    }))
  };
}

/**
 * Manually trigger a job
 */
async function triggerJob(jobName) {
  if (jobName === 'crawlBusinesses') {
    return await crawlBusinessesJob();
  }
  throw new Error(`Unknown job: ${jobName}`);
}

/**
 * Stop all scheduled jobs
 */
function stopScheduler() {
  console.log('[SCHEDULER] Stopping all jobs...');
  scheduledJobs.forEach(j => {
    j.job.stop();
    j.status = 'stopped';
  });
  console.log('[SCHEDULER] All jobs stopped');
}

module.exports = {
  initializeScheduler,
  getSchedulerStatus,
  triggerJob,
  stopScheduler
};
