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
const { sendSuccessEmail, sendFailureEmail } = require('../services/mailer');
const { crawlNews } = require('../services/newsCrawler');
const { getKnex } = require('../db');

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
      const startTime = Date.now();
      try {
        const result = await crawlBusinessesJob();
        console.log('[SCHEDULER] Crawler job result:', result);

        // Send success email with job result data
        const duration = Math.round((Date.now() - startTime) / 1000);
        await sendSuccessEmail({
          ...result,
          duration,
          timestamp: new Date()
        });
      } catch (err) {
        console.error('[SCHEDULER] Crawler job failed:', err.message);

        // Send failure email
        const duration = Math.round((Date.now() - startTime) / 1000);
        await sendFailureEmail(err, duration);
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

  const newsJob = new CronJob(
    '30 */6 * * *',
    () => crawlNews().catch(err => console.error('[SCHEDULER] News crawl failed:', err.message)),
    null,
    true,
    'UTC'
  );
  scheduledJobs.push({
    name: 'crawlNews',
    job: newsJob,
    schedule: '30 */6 * * * (every 6 hours)',
    status: 'running'
  });
  console.log('[SCHEDULER] ✅ News crawler scheduled every 6 hours');

  getKnex()('news_articles').first('id').then(row => {
    if (!row) {
      console.log('[SCHEDULER] News table empty, running initial crawl...');
      crawlNews().catch(err => console.error('[SCHEDULER] Initial news crawl failed:', err.message));
    }
  }).catch(err => console.error('[SCHEDULER] News table check failed:', err.message));

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
  if (jobName === 'crawlNews') {
    return await crawlNews();
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
