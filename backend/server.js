/**
 * AgentOS Backend Redirect
 * This root server.js now proxies all logic to the 'sanskar' workspace.
 * To push your work, only the 'sanskar' folder is required.
 */
const path = require('path');
const fs = require('fs');

const sanskarServerPath = path.join(__dirname, 'sanskar', 'server.js');

if (fs.existsSync(sanskarServerPath)) {
  console.log('🚀 Launching Sanskar Unified Backend...');
  require(sanskarServerPath);
} else {
  console.error('❌ Sanskar workspace not found. Please ensure the /sanskar folder exists.');
  process.exit(1);
}
