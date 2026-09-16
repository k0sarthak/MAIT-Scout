/**
 * Test Devfolio public page
 * Run: node test-devfolio.js
 */

const https = require('https');

const DEVFOLIO_URL = 'https://devfolio.co/hackathons';

function testDevfolioPage() {
  console.log('[TEST] Testing Devfolio hackathons page...\n');
  console.log(`Endpoint: ${DEVFOLIO_URL}\n`);

  const url = new URL(DEVFOLIO_URL);

  const options = {
    hostname: url.hostname,
    path: url.pathname,
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`Status: ${res.statusCode}`);

      if (res.statusCode === 200) {
        // Look for JSON data in the page
        const jsonMatch = data.match(/<script[^>]*>window\.__NEXT_DATA__\s*=\s*({.+?})<\/script>/);
        if (jsonMatch) {
          try {
            const jsonData = JSON.parse(jsonMatch[1]);
            console.log('[SUCCESS] Found NEXT_DATA in Devfolio page\n');
            console.log('Structure:');
            console.log(JSON.stringify(jsonData, null, 2).substring(0, 3000));
          } catch (e) {
            console.log('[WARN] Could not parse NEXT_DATA');
          }
        } else {
          // Check for other data patterns
          console.log('[INFO] Page accessible, looking for hackathon data patterns...');
          const hackathonMatches = data.match(/hackathons?["']?\s*:\s*\[/gi);
          if (hackathonMatches) {
            console.log('[SUCCESS] Found hackathon data patterns in HTML');
          }

          // Try to find API endpoint in page
          const apiMatch = data.match(/["']https?:\/\/[^"']*api[^"']*hackathon[^"']*["']/gi);
          if (apiMatch) {
            console.log('\nFound potential API endpoints:');
            apiMatch.slice(0, 5).forEach(m => console.log(`  - ${m}`));
          }
        }

        // Show sample HTML
        console.log('\nFirst 500 chars of HTML:');
        console.log(data.substring(0, 500));
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

testDevfolioPage();
