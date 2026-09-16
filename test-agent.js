#!/usr/bin/env node

/**
 * MAIT Scout Agent - Comprehensive Test
 *
 * This script demonstrates the agent's real capabilities.
 * Run: node test-agent.js
 */

const { ScoutAgent, SOURCES } = require('./src/agent/scout-agent');
const https = require('https');

async function testAgent() {
  console.log(`
╔══════════════════════════════════════════════╗
║    MAIT SCOUT AGENT - TEST SUITE             ║
╚══════════════════════════════════════════════╝
  `);

  const testProfile = {
    degree: "B.Tech CSE",
    year: 2,
    interests: ["AI", "ML", "Data Science"],
    skills: ["Python", "C++"],
    location: "Delhi"
  };

  const agent = new ScoutAgent({ verbose: true });

  // Test 1: Check HTTP sources directly
  console.log('\n[TEST 1] Direct HTTP Source Tests\n');

  // Test Unstop API
  console.log('─'.repeat(60));
  console.log('Unstop API Endpoint: https://unstop.com/api/public/opportunity/search-result');
  console.log('─'.repeat(60));

  try {
    const response = await directHTTPSFetch('https://unstop.com/api/public/opportunity/search-result?limit=10');
    console.log(`Status: ${response.status}`);

    const opps = response.parsed?.data?.data || response.parsed?.data || response.parsed?.opportunities;

    if (response.status === 200 && Array.isArray(opps)) {
      console.log(`✓ SUCCESS - ${opps.length} opportunities received\n`);
      console.log('Sample opportunities:');
      opps.slice(0, 3).forEach((o, i) => {
        console.log(`  ${i + 1}. ${o.title || o.name}`);
        console.log(`     Type: ${o.type || o.subtype || o.category || 'N/A'}`);
        console.log(`     Deadline: ${o.regnRequirements?.end_regn_dt || o.deadline || o.end_date || 'N/A'}`);
        console.log(`     Location: ${o.region || o.location || 'Online'}`);
      });
    } else {
      console.log('Response structure:');
      console.log(JSON.stringify(response.parsed, null, 2).substring(0, 1000));
    }
  } catch (error) {
    console.log(`✗ FAILED: ${error.message}`);
  }

  // Test Devfolio
  console.log('\n' + '─'.repeat(60));
  console.log('Devfolio Hackathons: https://devfolio.co/hackathons');
  console.log('─'.repeat(60));

  try {
    const response = await directHTTPSFetch('https://devfolio.co/hackathons');
    console.log(`Status: ${response.status}`);

    if (response.status === 200) {
      // Try to extract hackathon data
      const nextDataMatch = response.body.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i) ||
                            response.body.match(/window\.__NEXT_DATA__\s*=\s*({.+?});/);
      if (nextDataMatch) {
        try {
          const jsonData = JSON.parse(nextDataMatch[1]);
          const queries = jsonData.props?.pageProps?.dehydratedState?.queries || [];
          let hackathons = [];
          queries.forEach(q => {
            if (q.state?.data?.open_hackathons) hackathons.push(...q.state.data.open_hackathons);
          });
          console.log(`✓ SUCCESS - Found ${hackathons.length} hackathons in page data`);

          if (hackathons.length > 0) {
            console.log('\nSample hackathons:');
            hackathons.slice(0, 3).forEach((h, i) => {
              console.log(`  ${i + 1}. ${h.name || h.title}`);
              console.log(`     Date: ${h.ends_at || h.starts_at || 'N/A'}`);
              console.log(`     URL: https://${h.slug}.devfolio.co`);
            });
          }
        } catch (e) {
          console.log('Could not parse NEXT_DATA');
        }
      } else {
        console.log('No NEXT_DATA found - checking other patterns...');
        const titleCount = (response.body.match(/"name":/g) || []).length;
        console.log(`Found ${titleCount} potential data points in HTML`);
      }
    }
  } catch (error) {
    console.log(`✗ FAILED: ${error.message}`);
  }

  // Test 2: WebCMD Browser Status
  console.log('\n' + '═'.repeat(60));
  console.log('[TEST 2] WebCMD Browser Status');
  console.log('═'.repeat(60));

  const browserStatus = agent.browser.getStatus();
  console.log(`Session initialized: ${browserStatus.initialized}`);
  console.log(`Runtime available: ${browserStatus.runtimeAvailable}`);
  console.log(`Session ID: ${browserStatus.sessionId || 'N/A'}`);
  console.log(`Last error: ${browserStatus.lastError || 'None'}`);

  // Test 3: Full Agent Run
  console.log('\n' + '═'.repeat(60));
  console.log('[TEST 3] Full Agent Execution');
  console.log('═'.repeat(60));

  const request = "Find hackathons and internships for me. I'm a 2nd-year CSE student interested in AI/ML.";
  console.log(`\nRequest: "${request}"\n`);

  try {
    const result = await agent.scout(request, testProfile);

    console.log('\n' + '═'.repeat(60));
    console.log('AGENT EXECUTION SUMMARY');
    console.log('═'.repeat(60));

    console.log(`\nSources selected: ${result.sources.map(s => s.name).join(', ')}`);
    console.log(`Total candidates found: ${(result.candidates || []).length}`);
    console.log(`Opportunities after filtering: ${(result.opportunities || []).length}`);
    console.log(`Browser used: ${result.browserAvailable}`);

    console.log('\n' + '═'.repeat(60));
    console.log('TOP RESULTS');
    console.log('═'.repeat(60));

    const top5 = result.opportunities.slice(0, 5);
    if (top5.length === 0) {
      console.log('\nNo matching opportunities found from live sources.');
    } else {
      top5.forEach((opp, i) => {
        console.log(`\n${i + 1}. [${opp.type.toUpperCase()}] ${opp.title}`);
        console.log(`   Score: ${opp.score}/100`);
        console.log(`   Deadline: ${opp.deadline || 'N/A'}`);
        console.log(`   Source: ${opp.source}`);
        console.log(`   URL: ${opp.url}`);
      });
    }

  } catch (error) {
    console.log(`Agent execution error: ${error.message}`);
  }

  await agent.cleanup();

  console.log('\n' + '═'.repeat(60));
  console.log('TEST COMPLETE');
  console.log('═'.repeat(60));
  console.log(`
Next steps:
  • Run "npm run scout" for full agent experience
  • Run "npm run scout --verbose" for detailed logging
  • Check WebCMD daemon if browser commands fail
  • Agent will use HTTP fallback if browser unavailable
  `);
}

/**
 * Direct HTTPS fetch utility
 */
function directHTTPSFetch(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);

    const req = https.request({
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'MAIT-Scout-Test/1.0',
        'Accept': 'application/json, text/html'
      },
      timeout: 15000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = data;
        try {
          parsed = JSON.parse(data);
        } catch (e) {}
        resolve({ status: res.statusCode, body: data, parsed });
      });
    });

    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.end();
  });
}

testAgent().catch(console.error);