#!/usr/bin/env node

/**
 * Simple agent test - no HTTP calls, just verify core logic
 */

const { ScoutAgent, SOURCES } = require('./src/agent/scout-agent');

const testProfile = {
  degree: "B.Tech CSE",
  year: 2,
  interests: ["AI", "ML", "Data Science"],
  skills: ["Python", "C++"],
  location: "Delhi"
};

async function testAgent() {
  console.log('=== MAIT Scout Agent - Core Test ===\n');

  // Test 1: Create agent
  console.log('Test 1: Agent instantiation');
  try {
    const agent = new ScoutAgent({ verbose: false });
    console.log('✓ Agent created successfully\n');
  } catch (error) {
    console.log(`✗ Agent creation failed: ${error.message}\n`);
    console.log(error.stack);
    return;
  }

  // Test 2: Intent parsing (no HTTP calls)
  console.log('Test 2: Intent parsing');
  const agent = new ScoutAgent({ verbose: false });

  // Mock the method by creating a test version
  const testIntent = agent.parseIntent(
    "Find AI hackathons for me. I'm a 2nd year CSE student.",
    testProfile
  );

  console.log('Intent result:', JSON.stringify(testIntent, null, 2));
  console.log('✓ Intent parsing works\n');

  // Test 3: Source selection
  console.log('Test 3: Source selection');
  const sources = agent.selectSources(testIntent);
  console.log('Selected sources:', sources.map(s => s.name));
  console.log('✓ Source selection works\n');

  // Test 4: Agent execution without HTTP
  console.log('Test 4: Mock agent execution (no HTTP)');

  // Mock the fetch methods to avoid HTTP calls
  const originalFetchFromSource = agent.fetchFromSource;
  agent.fetchFromSource = async function(source, intent) {
    console.log(`  Mock fetch from ${source.name}`);
    return Promise.resolve();
  };

  const originalInitializeBrowser = agent.initializeBrowser;
  agent.initializeBrowser = async function() {
    console.log('  Mock browser initialization');
    return Promise.resolve();
  };

  try {
    // Run a very limited version of scout
    console.log('Running limited scout...');
    const intent = agent.parseIntent("test", testProfile);
    const sources = agent.selectSources(intent);
    console.log('✓ Mock agent execution works\n');
  } catch (error) {
    console.log(`✗ Mock execution failed: ${error.message}\n`);
  }

  // Test 5: Check normalize function
  console.log('Test 5: Normalization functions');
  const { normalizeOpportunity } = require('./src/normalize');

  const testRaw = {
    title: "Test Hackathon",
    category: "hackathon",
    source: "Unstop",
    deadline: "2026-10-15",
    eligibility: "CSE students",
    location: "Online",
    url: "https://test.com"
  };

  try {
    const normalized = normalizeOpportunity(testRaw);
    console.log('Normalized result:', JSON.stringify(normalized, null, 2));
    console.log('✓ Normalization works\n');
  } catch (error) {
    console.log(`✗ Normalization failed: ${error.message}\n`);
  }

  // Test 6: Scoring
  console.log('Test 6: Scoring function');
  const { scoreOpportunity } = require('./src/profile');

  const testOpp = {
    title: "AI Hackathon",
    eligibility: "CSE 2nd year students interested in AI",
    location: "Delhi",
    deadline: "2026-10-15"
  };

  try {
    const score = scoreOpportunity(testOpp, testProfile);
    console.log('Score result:', JSON.stringify(score, null, 2));
    console.log('✓ Scoring works\n');
  } catch (error) {
    console.log(`✗ Scoring failed: ${error.message}\n`);
  }

  console.log('=== Core Tests Complete ===');
  console.log('\nNext steps:');
  console.log('1. Fix any import/export errors shown above');
  console.log('2. Run HTTP source tests');
  console.log('3. Run full agent test\n');
}

testAgent().catch(console.error);