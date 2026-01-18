#!/usr/bin/env node
// shim that runs the watcher placed in tools/watch-images.js
try {
  require('./tools/watch-images.js');
} catch (err) {
  console.error('Failed to start tools/watch-images.js:', err);
  process.exit(1);
}
