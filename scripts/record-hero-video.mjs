// Backwards-compatible entry point. New scenarios use render-configurator-video.mjs.
process.argv.push('--scenario', 'configurator-hero');
if (!process.argv.includes('--formats')) process.argv.push('--formats', 'web');
await import('./render-configurator-video.mjs');
