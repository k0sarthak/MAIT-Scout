/**
 * MAIT public source (WebCMD browser-based + static fallback)
 * Uses WebCMD to access MAIT/CSE pages
 */

const { normalizeMAIT } = require('../normalize');

/**
 * Fetch opportunities from MAIT public website
 * Uses WebCMD browser automation with fallback to static data
 */
async function fetchMAIT(options = {}) {
  const results = [];
  const errors = [];
  let status = 'UNAVAILABLE';

  console.log('[MAIT] Attempting WebCMD browser fetch...');

  try {
    // Attempt WebCMD browser automation
    const webcmdResults = await fetchMAITViaWebCMD(options);
    if (webcmdResults.length > 0) {
      results.push(...webcmdResults);
      status = 'LIVE';
      console.log(`[MAIT] LIVE (WebCMD) ✓ ${webcmdResults.length} opportunities`);
    } else {
      throw new Error('WebCMD returned no results');
    }

  } catch (webcmdError) {
    console.log(`[MAIT] WebCMD unavailable: ${webcmdError.message}`);
    errors.push(`WebCMD unavailable: ${webcmdError.message}`);

    // Use static fallback data - clearly labeled as fallback
    console.log('[MAIT] Using FALLBACK static data (not live)');
    const staticResults = getStaticMAITOpportunities();
    results.push(...staticResults);
    status = 'UNAVAILABLE (using fallback)';
    console.log(`[MAIT] UNAVAILABLE ⚠ ${staticResults.length} fallback opportunities`);
  }

  return { results, errors, status };
}

/**
 * Use WebCMD browser to fetch from MAIT website
 */
async function fetchMAITViaWebCMD(options = {}) {
  const results = [];

  // This is the interface for WebCMD browser integration
  // In production, this would use actual WebCMD commands
  const { useBrowser } = options;

  if (!useBrowser) {
    throw new Error('WebCMD browser not enabled');
  }

  // WebCMD commands that would be executed:
  // webcmd --session mait-session browser init --url "https://www.mait.ac.in"
  // webcmd --session mait-session browser run "document.querySelector('.events').innerHTML"
  // Then parse the extracted HTML for opportunities

  // For MVP, WebCMD browser runtime may not be fully functional
  // This will throw to trigger fallback to static data
  throw new Error('WebCMD browser runtime not fully configured');

  // When WebCMD is available:
  // const browser = await initWebCMDBrowser();
  // const html = await browser.navigate('https://www.mait.ac.in/cse-events');
  // const opportunities = parseMAITHTML(html);
  // return opportunities.map(normalizeMAIT);
}

/**
 * Static fallback MAIT opportunities (clearly labeled as fallback, not live)
 */
function getStaticMAITOpportunities() {
  const staticData = [
    {
      title: "CSE AI/ML Workshop by Industry Experts",
      category: "workshop",
      deadline: "2026-10-20",
      eligibility: "CSE 2nd-4th year students",
      location: "MAIT Campus, Delhi",
      url: "https://www.mait.ac.in/events/aiml-workshop-2026"
    },
    {
      title: "MAIT Tech Fest 2026 Registration Open",
      category: "event",
      deadline: "2026-11-05",
      eligibility: "All MAIT students",
      location: "MAIT Campus, Delhi",
      url: "https://www.mait.ac.in/techfest-2026"
    },
    {
      title: "Campus Scholarship for AI Research",
      category: "scholarship",
      deadline: "2026-10-10",
      eligibility: "CSE students with AI/ML projects",
      location: "MAIT Campus, Delhi",
      url: "https://www.mait.ac.in/scholarships/ai-research-2026"
    }
  ];

  return staticData.map(raw => {
    try {
      return normalizeMAIT(raw);
    } catch {
      return null;
    }
  }).filter(Boolean);
}

module.exports = {
  fetchMAIT,
  fetchMAITViaWebCMD
};
