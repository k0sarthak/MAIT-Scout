/**
 * Quick test to verify real API sources work
 */

const { fetchUnstop } = require('./src/sources/unstop');
const { fetchDevfolio } = require('./src/sources/devfolio');

async function testSources() {
  console.log('Testing real data sources...\n');

  // Test Unstop
  console.log('=== Testing Unstop API ===');
  try {
    const { results, errors, status } = await fetchUnstop({ limit: 5 });
    console.log(`Status: ${status}`);
    console.log(`Results: ${results.length}`);
    console.log(`Errors: ${errors.length}`);
    if (results.length > 0) {
      console.log('\nSample opportunity:');
      console.log(JSON.stringify(results[0], null, 2));
    }
  } catch (e) {
    console.log(`FAILED: ${e.message}`);
  }

  console.log('\n=== Testing Devfolio ===');
  try {
    const { results, errors, status, method } = await fetchDevfolio({ useBrowser: false });
    console.log(`Status: ${status}`);
    console.log(`Method: ${method}`);
    console.log(`Results: ${results.length}`);
    console.log(`Errors: ${errors.length}`);
    if (results.length > 0) {
      console.log('\nSample hackathon:');
      console.log(JSON.stringify(results[0], null, 2));
    }
  } catch (e) {
    console.log(`FAILED: ${e.message}`);
  }

  console.log('\nTest complete.');
}

testSources().catch(console.error);
