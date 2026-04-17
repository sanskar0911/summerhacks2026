const fs = require('fs');
const path = require('path');
const filePath = 'c:\\Users\\sanskar jagdish\\OneDrive\\Desktop\\summerhacks\\backend\\sanskar\\data\\opportunities.json';
try {
  const data = fs.readFileSync(filePath, 'utf8');
  const json = JSON.parse(data);
  console.log('SUCCESS: Parsed', json.length, 'items');
} catch (e) {
  console.error('ERROR:', e.message);
  console.log('Sample data:', fs.readFileSync(filePath, 'utf8').substring(0, 100));
}
