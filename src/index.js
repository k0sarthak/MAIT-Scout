#!/usr/bin/env node

/**
 * MAIT Scout - Opportunity Scout Agent
 *
 * Real agent-based opportunity discovery
 *
 * Usage:
 *   node src/index.js
 *   node src/index.js --request "Find AI hackathons for me"
 *   node src/index.js --verbose
 */

const { ScoutAgent, SOURCES } = require('./agent/scout-agent');
const { defaultProfile } = require('./profile');
const { getTopOpportunities } = require('./rank');

// Default student profile
const DEFAULT_PROFILE = {
  degree: "B.Tech CSE",
  year: 2,
  interests: ["AI", "ML", "Data Science"],
  skills: ["Python", "C++"],
  location: "Delhi"
};

async function main() {
  // Parse command line args
  const args = process.argv.slice(2);
  const request = extractRequest(args) || "Find opportunities I can apply to. I'm a 2nd-year CSE student interested in AI/ML.";
  const verbose = args.includes('--verbose') || args.includes('-v');
  const simulateBrowserFailure = args.includes('--simulate-browser-failure');
  const profile = DEFAULT_PROFILE;

  console.log(`
╔══════════════════════════════════════════════╗
║           MAIT SCOUT                         ║
║      Opportunity Scout Agent                 ║
╚══════════════════════════════════════════════╝
`);

  if (simulateBrowserFailure) {
    console.log(`⚠️ [SIMULATION MODE ACTIVE] --simulate-browser-failure enabled`);
    console.log(`  Browser actions will intentionally fail to demonstrate recovery via HTTP.\n`);
  }

  console.log(`User Request: "${request}"`);
  console.log(`Student Profile: ${profile.degree} • Year ${profile.year} • ${profile.interests.join('/')}`);
  console.log(`Skills: ${profile.skills.join(', ')} • Location: ${profile.location}\n`);

  // Initialize agent
  const agent = new ScoutAgent({ verbose, simulateBrowserFailure });
  const startTime = Date.now();

  try {
    // Execute scouting mission
    const result = await agent.scout(request, profile);

    // Display action log
    console.log(`\n${'═'.repeat(60)}`);
    console.log('ACTION LOG');
    console.log('═'.repeat(60));

    const filteredLog = result.actionLog.filter(entry => {
      if (verbose) return true;
      // Show key actions in non-verbose mode
      return entry.includes('✓') || entry.includes('✗') ||
             entry.includes('Sources selected') ||
             entry.includes('Ranking complete') ||
             entry.includes('ACT →') ||
             entry.includes('Browser action failed') ||
             entry.includes('Diagnosing failure') ||
             entry.includes('Recovery strategy') ||
             entry.includes('Retrying via HTTP') ||
             entry.includes('Recovery successful') ||
             entry.includes('Continuing pipeline') ||
             entry.includes('SIMULATED');
    });

    filteredLog.forEach(entry => console.log(entry));

    // Display results
    const ranked = result.opportunities;
    const topResults = getTopOpportunities(ranked, 10);

    console.log(`\n${'═'.repeat(60)}`);
    console.log(`TOP ${topResults.length} RELEVANT OPPORTUNITIES`);
    console.log('═'.repeat(60));

    if (topResults.length === 0) {
      console.log('\nNo matching opportunities found.\n');
    } else {
      topResults.forEach((opp, index) => {
        const reasons = [];

        if (opp.scoreData?.breakdown) {
          if (opp.scoreData.breakdown.degreeMatch) reasons.push('CSE match');
          if (opp.scoreData.breakdown.yearMatch) reasons.push('year eligible');
          if (opp.scoreData.breakdown.interestMatch) reasons.push('AI/ML interest');
          if (opp.scoreData.breakdown.skillMatch) reasons.push('skill match');
          if (opp.scoreData.breakdown.locationMatch) reasons.push('Delhi/Remote');
          if (opp.scoreData.breakdown.urgency) reasons.push('active deadline');
        }

        console.log(`\n${index + 1}. [${opp.type.toUpperCase()}] ${opp.title}`);
        console.log(`   Score: ${opp.score}/100`);
        console.log(`   Deadline: ${opp.deadline || 'Not specified'}`);
        console.log(`   Why: ${reasons.join(' + ') || 'Generic match'}`);
        console.log(`   Source: ${opp.source}`);
        console.log(`   URL: ${opp.url}`);
      });
    }

    // Summary
    console.log(`\n${'═'.repeat(60)}`);
    console.log('SUMMARY');
    console.log('═'.repeat(60));

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`Search duration: ${duration}s`);

    console.log(`\nLIVE SOURCES:`);
    const sourceResults = result.actionLog
      .filter(entry => entry.includes('✓') || entry.includes('✗'))
      .map(entry => entry.trim());

    sourceResults.forEach(entry => {
      const icon = entry.includes('✓') ? '✓' : '✗';
      console.log(`  ${icon} ${entry}`);
    });

    if (result.errors.length > 0) {
      console.log(`\nErrors:`);
      result.errors.forEach(e => console.log(`  ⚠ ${e}`));
    }

    // Oppty type breakdown
    const byType = {};
    ranked.forEach(opp => {
      byType[opp.type] = (byType[opp.type] || 0) + 1;
    });

    console.log(`\nOpportunity breakdown:`);
    Object.entries(byType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });

    console.log(`\nBrowser: ${result.browserAvailable ? 'Available' : 'Unavailable'}`);

    console.log(`\n${'─'.repeat(60)}`);
    console.log('AGENT CHARACTERISTICS');
    console.log('─'.repeat(60));
    console.log(`
• Intent understanding: Parses request to identify types and interests
• Source selection: Chooses relevant sources based on intent
• Browser abstraction: Uses WebCMD when available, HTTP fallback
• Recovery: Attempts HTTP if browser fails
• Transparent scoring: Explainable heuristic (not ML)
• Source URLs preserved for original reference
    `);

  } catch (error) {
    console.error(`\n❌ Agent error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await agent.cleanup();
  }
}

/**
 * Extract request from command line args
 */
function extractRequest(args) {
  const requestIndex = args.findIndex(a => !a.startsWith('--'));
  if (requestIndex >= 0 && args[requestIndex]) {
    return args[requestIndex];
  }
  return null;
}

// Handle CLI
if (require.main === module) {
  main().catch(error => {
    console.error(`\n❌ Fatal error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { main, ScoutAgent, DEFAULT_PROFILE };