/**
 * Test Unstop API endpoint
 * Run: node test-unstop.js
 */

const https = require('https');

const UNSTOP_ENDPOINT = 'https://unstop.com/api/public/opportunity/search-result';

function testUnstopAPI() {
  console.log('[TEST] Testing Unstop API endpoint...\n');
  console.log(`Endpoint: ${UNSTOP_ENDPOINT}\n`);

  const url = new URL(UNSTOP_ENDPOINT);
  url.searchParams.append('limit', '20');

  const options = {
    hostname: url.hostname,
    path: url.pathname + url.search,
    method: 'GET',
    headers: {
      'User-Agent': 'MAIT-Scout/1.0',
      'Accept': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}\n`);

      if (res.statusCode === 200) {
        try {
          const json = JSON.parse(data);
          console.log('Response Structure:');
          console.log(JSON.stringify(json, null, 2).substring(0, 3000));
          console.log('\n[SUCCESS] Unstop API is accessible\n');
        } catch (e) {
          console.log('Raw response (first 1000 chars):');
          console.log(data.substring(0, 1000));
        }
      } else {
        console.log('Error response:');
        console.log(data.substring(0, 500));
      }
    });
  });

  req.on('error', (e) => {
    console.error(`[ERROR] ${e.message}`);
  });

  req.setTimeout(10000, () => {
    console.error('[ERROR] Request timeout');
    req.destroy();
  });

  req.end();
}

testUnstopAPI();
