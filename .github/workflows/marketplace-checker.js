const fs = require('fs');

const marketplace = fs.readFileSync('./.claude-plugin/marketplace-json', 'utf8');

if (!marketplace) {
  console.error('No marketplace found.');
} else {
  console.log('Fine');
}
