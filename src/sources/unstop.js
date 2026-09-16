/**
 * Unstop public API source
 * Fetches real opportunities from Unstop's public API
 */

const https = require('https');

/**
 * Fetch opportunities from Unstop public API
 * Uses the actual /api/public/opportunity/search-result endpoint
 */
async function fetchUnstop(options = {}) {
  const results = [];
  const errors = [];

  // API endpoint discovered during reconnaissance
  const url = 'https://unstop.com/api/public/opportunity/search-result';

  console.log(`[Unstop] Fetching from real API: ${url}`);

  try {
    const data = await fetchUnstopRaw(url, options);

    const rawList = Array.isArray(data?.data?.data)
      ? data.data.data
      : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.opportunities)
      ? data.opportunities
      : Array.isArray(data)
      ? data
      : [];

    if (rawList.length === 0) {
      throw new Error('No opportunities found in response');
    }

    rawList.forEach(opp => {
      try {
        const normalized = normalizeUnstop(opp);
        if (normalized && normalized.title) {
          results.push(normalized);
        }
      } catch (e) {
        console.error(`[Unstop] Error normalizing opportunity: ${e.message}`);
      }
    });

    console.log(`[Unstop] LIVE ✓ ${results.length} opportunities fetched`);
    return { results, errors, status: 'LIVE' };

  } catch (error) {
    console.error(`[Unstop] FAILED: ${error.message}`);
    errors.push(`[Unstop] FAILED: ${error.message}`);
    return { results, errors, status: 'FAILED' };
  }
}

/**
 * Make raw HTTPS request to Unstop API
 */
function fetchUnstopRaw(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const params = new URLSearchParams({
      limit: options.limit || 30,
      offset: options.offset || 0,
      search: options.search || '',
      type: options.type || '' // filter by type: hackathon, internship, etc.
    });
    parsedUrl.search = params.toString();

    const reqOptions = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'User-Agent': 'MAIT-Scout/1.0',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 15000
    };

    const protocol = parsedUrl.protocol === 'https:' ? https : http;

    const req = protocol.request(reqOptions, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(new Error(`Failed to parse JSON: ${e.message}. Response: ${data.substring(0, 200)}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(new Error(`Network error: ${e.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout (15s)'));
    });

    req.end();
  });
}

/**
 * Normalize Unstop opportunity to standard schema
 * Parses actual API response structure
 */
function normalizeUnstop(raw) {
  if (!raw) return null;

  const category = raw.type || raw.subtype || raw.category || raw.opportunity_type || '';
  const location = raw.region || raw.location || raw.job_location || raw.address || raw.city || 'Online';

  const type = mapUnstopType(category);

  const eligibility = raw.eligible ||
    raw.eligibility ||
    raw.eligibility_requirement?.degree_required ||
    (raw.is_open_to_all ? 'Open to all students' : 'Open to eligible students');

  const deadline = raw.regnRequirements?.end_regn_dt ||
    raw.end_date ||
    raw.deadline ||
    raw.application_deadline ||
    '';

  let url = raw.public_url || raw.url || raw.app_url || raw.opportunity_url || '';
  if (url && !url.startsWith('http')) {
    url = `https://unstop.com/${url.replace(/^\//, '')}`;
  } else if (!url && raw.id) {
    url = `https://unstop.com/p/${raw.id}`;
  }

  return {
    title: raw.title || raw.name || '',
    type: type,
    source: 'Unstop',
    deadline: deadline,
    eligibility: typeof eligibility === 'object' ? JSON.stringify(eligibility) : String(eligibility),
    location: String(location),
    url: url
  };
}

/**
 * Map Unstop category to standard type
 */
function mapUnstopType(category) {
  if (!category) return 'event';

  const lower = category.toLowerCase();

  if (lower.includes('hackathon')) return 'hackathon';
  if (lower.includes('internship') || lower.includes('intern')) return 'internship';
  if (lower.includes('scholarship')) return 'scholarship';
  if (lower.includes('competition') || lower.includes('contest')) return 'competition';
  if (lower.includes('workshop') || lower.includes('training')) return 'workshop';
  if (lower.includes('event') || lower.includes('conference') || lower.includes('summit')) return 'event';
  if (lower.includes('fellowship')) return 'fellowship';
  if (lower.includes('bootcamp')) return 'bootcamp';

  return 'event';
}

module.exports = {
  fetchUnstop,
  normalizeUnstop
};
