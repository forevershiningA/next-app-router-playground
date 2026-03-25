#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function getArgValue(args, name, fallback) {
  const index = args.indexOf(name);
  if (index === -1 || index + 1 >= args.length) return fallback;
  return args[index + 1];
}

function run() {
  const args = process.argv.slice(2);
  const summaryPath = path.resolve(
    ROOT,
    getArgValue(args, '--summary', 'database-exports/rollout-full-summary-20260324-190828.json'),
  );
  const skippedPath = path.resolve(
    ROOT,
    getArgValue(args, '--skipped', 'database-exports/rollout-full-skipped-ids-20260324-190828.json'),
  );

  if (!fs.existsSync(summaryPath)) {
    throw new Error(`summary file not found: ${summaryPath}`);
  }
  if (!fs.existsSync(skippedPath)) {
    throw new Error(`skipped file not found: ${skippedPath}`);
  }

  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
  const skipped = JSON.parse(fs.readFileSync(skippedPath, 'utf8'));
  const combined = summary.combined || {};
  const skipHistogram = skipped.skipHistogram || {};

  const intentionalSkipCount =
    Number(skipHistogram['test-inscription'] || 0) + Number(skipHistogram['single-image-only'] || 0);
  const potentialRecoveryCount = Number(skipped.totalSkipped || 0) - intentionalSkipCount;

  const outlierId = '1578016189116';
  const outlierInSkipped = Array.isArray(skipped.skipped)
    ? skipped.skipped.find((item) => item?.id === outlierId)
    : null;

  console.log('Rollout summary');
  console.log(`- Summary: ${path.relative(ROOT, summaryPath)}`);
  console.log(`- Skipped: ${path.relative(ROOT, skippedPath)}`);
  console.log(
    `- Processed=${combined.processed ?? 'n/a'} Success=${combined.success ?? 'n/a'} Failed=${combined.failed ?? 'n/a'} Skipped=${combined.skipped ?? 'n/a'}`,
  );
  console.log(
    `- Confidence high=${combined.confidence?.high ?? 0} medium=${combined.confidence?.medium ?? 0} low=${combined.confidence?.low ?? 0}`,
  );
  console.log(
    `- Skip split intentional=${intentionalSkipCount} potential-recovery=${potentialRecoveryCount}`,
  );
  console.log(
    `- Outlier ${outlierId}: ${outlierInSkipped ? `SKIPPED (${outlierInSkipped.reason || 'unknown'})` : 'not in skipped list'}`,
  );
}

run();
