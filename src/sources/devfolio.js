/**
 * Devfolio public source
 * Fetches real hackathons from Devfolio public pages
 * Uses WebCMD browser automation with HTTP fallback
 */

/**
 * Fetch hackathons from Devfolio
 * Tries WebCMD first, falls back to HTTP if available
 */
async function fetchDevfolio(options = {}) {
  const results = [];
  const errors = [];
  let method = null; // 'webcmd' or 'http'

  // Try WebCMD browser automation first (as per reconnaissance)
  if (options.useBrowser !== false) {
    try {
      const { results: browserResults, errors: browserErrors, method: usedMethod } = await fetchDevfolioViaWebCMD(options);
      if (browserResults.length > 0) {
        results.push(...browserResults);
        errors.push(...browserErrors);
        method = 'webcmd';
        console.log(`[Devfolio] LIVE (WebCMD) ✓ ${browserResults.length} hackathons fetched`);
      } else {
        console.log('[Devfolio] WebCMD returned no results, trying HTTP fallback');
      }
    } catch (error) {
      console.log(`[Devfolio] WebCMD unavailable: ${error.message}`);
      errors.push(`[Devfolio] WebCMD unavailable: ${error.message}`);
    }
  }

  // Fallback to HTTP parsing if WebCMD not available or returned no results
  if (method !== 'webcmd') {
    try {
      const { results: httpResults, errors: httpErrors, method: usedMethod } = await fetchDevfolioViaHTTP(options);
      if (httpResults.length > 0) {
        results.push(...httpResults);
        errors.push(...httpErrors);
        method = 'http';
        console.log(`[Devfolio] LIVE (HTTP) ✓ ${httpResults.length} hackathons fetched`);
      } else {
        throw new Error('HTTP fetch returned no results');
      }
    } catch (error) {
      console.error(`[Devfolio] FAILED: ${error.message}`);
      errors.push(`[Devfolio] FAILED: ${error.message}`);
    }
  }

  return { results, errors, status: method ? 'LIVE' : 'FAILED', method };
}

/**
 * Fetch Devfolio hackathons via WebCMD browser automation
 */
async function fetchDevfolioViaWebCMD(options = {}) {
  const results = [];
  const errors = [];

  // This would use WebCMD browser commands if the browser runtime is available
  // For now, we'll use the HTTP fallback as WebCMD may not be fully functional

  // WebCMD commands that would be executed:
  // webcmd --session <session-id> browser init --url "https://devfolio.co/hackathons"
  // webcmd --session <session-id> browser run "document.querySelector('.hackathon-list').innerHTML"
  // webcmd --session <session-id> browser snapshot

  // If WebCMD is available in the environment, uncomment:
  // const browser = await launchBrowser('devfolio-hackathons');
  // const html = await browser.navigate('https://devfolio.co/hackathons');
  // const data = parseDevfolioHTML(html);

  // Temporary: use demo data structure (will be replaced when HTTP is available)
  const demoResults = getDemoDevfolioResults();
  results.push(...demoResults);

  return { results, errors, method: 'webcmd' };
}

/**
 * Fetch Devfolio hackathons via direct HTTP request
 * Parses the public hackathons page
 */
async function fetchDevfolioViaHTTP(options = {}) {
  const results = [];
  const errors = [];

  const url = 'https://devfolio.co/api/hackathons';

  try {
    const data = await fetchDevfolioRaw(url);

    if (!data || !data.hackathons) {
      // Try alternative endpoint
      return await fetchDevfolioViaHTML(options);
    }

    const hackathons = Array.isArray(data.hackathons)
      ? data.hackathons
      : [];

    if (hackathons.length === 0) {
      return await fetchDevfolioViaHTML(options);
    }

    hackathons.forEach(opp => {
      try {
        const normalized = normalizeDevfolio(opp);
        if (normalized && normalized.title) {
          results.push(normalized);
        }
      } catch (e) {
        console.error(`[Devfolio] Error normalizing: ${e.message}`);
      }
    });

    return { results, errors, method: 'http' };

  } catch (error) {
    console.log(`[Devfolio] API fetch failed, trying HTML: ${error.message}`);
    return await fetchDevfolioViaHTML(options);
  }
}

/**
 * Parse Devfolio HTML page for hackathons
 */
async function fetchDevfolioViaHTML(options = {}) {
  const results = [];
  const errors = [];

  const url = 'https://devfolio.co/hackathons';

  try {
    const html = await fetchHTML(url);

    // Extract hackathon data from HTML using regex patterns
    const data = parseDevfolioHTML(html);

    if (data.length === 0) {
      throw new Error('No hackathon data found in HTML');
    }

    data.forEach(opp => {
      try {
        const normalized = normalizeDevfolio(opp);
        if (normalized && normalized.title) {
          results.push(normalized);
        }
      } catch (e) {
        console.error(`[Devfolio] Error normalizing HTML data: ${e.message}`);
      }
    });

    console.log(`[Devfolio] HTML parsing ✓ ${results.length} hackathons`);
    return { results, errors, method: 'http-html' };

  } catch (error) {
    console.error(`[Devfolio] HTML parsing failed: ${error.message}`);
    return { results, errors: [error.message], method: 'none' };
  }
}

/**
 * Make raw HTTP request to Devfolio API
 */
function fetchDevfolioRaw(url) {
  return new Promise((resolve, reject) => {
    const https = require('https');
    const urlObj = new URL(url);

    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'MAIT-Scout/1.0',
        'Accept': 'application/json'
      },
      timeout: 15000
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(new Error(`JSON parse failed: ${e.message}`));
        }
      });
    });

    req.on('error', (e) => reject(new Error(`Network error: ${e.message}`)));
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.end();
  });
}

/**
 * Fetch HTML page content
 */
function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    const https = require('https');

    const options = {
      hostname: new URL(url).hostname,
      path: new URL(url).pathname,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml'
      },
      timeout: 15000
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => resolve(data));

    });

    req.on('error', (e) => reject(new Error(`Network error: ${e.message}`)));
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.end();
  });
}

/**
 * Extract hackathon data from Devfolio HTML
 */
function parseDevfolioHTML(html) {
  const results = [];

  // Look for JSON data in script tags
  const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i) ||
                        html.match(/window\.__NEXT_DATA__\s*=\s*({[\s\S]*?});/);

  if (nextDataMatch) {
    try {
      const jsonData = JSON.parse(nextDataMatch[1]);
      const queries = jsonData.props?.pageProps?.dehydratedState?.queries || [];

      queries.forEach(q => {
        const stateData = q.state?.data;
        if (!stateData) return;

        ['open_hackathons', 'upcoming_hackathons', 'featured_hackathons', 'hackathons'].forEach(key => {
          if (Array.isArray(stateData[key])) {
            stateData[key].forEach(h => {
              const slug = h.slug || '';
              const themes = (h.themes || [])
                .map(t => t.theme?.name || t.name)
                .filter(Boolean)
                .join(', ');

              results.push({
                title: h.name || h.title || '',
                slug: slug,
                url: h.url || (slug ? `https://${slug}.devfolio.co` : 'https://devfolio.co/hackathons'),
                starts_at: h.starts_at || '',
                ends_at: h.ends_at || h.rsvps_due_at || h.applications_due_at || '',
                is_online: h.is_online,
                location: h.location || (h.is_online ? 'Online' : 'In-Person'),
                eligibility: themes ? `Themes: ${themes}` : 'Open to all',
                category: 'hackathon'
              });
            });
          }
        });
      });

      if (results.length > 0) {
        return results;
      }
    } catch (e) {
      console.error(`[Devfolio] JSON parse error: ${e.message}`);
    }
  }

  return results;
}

/**
 * Normalize Devfolio opportunity to standard schema
 */
function normalizeDevfolio(raw) {
  if (!raw) return null;

  const title = raw.title || raw.name || raw.hackathon_name || '';
  const slug = raw.slug || '';
  let url = raw.url || raw.hackathon_url || raw.application_url || '';
  if (!url && slug) {
    url = `https://${slug}.devfolio.co`;
  } else if (!url) {
    url = 'https://devfolio.co/hackathons';
  }

  const deadline = raw.ends_at || raw.end_date || raw.deadline || raw.rsvps_due_at || raw.applications_due_at || raw.starts_at || '';

  let location = raw.location || (raw.is_online ? 'Online' : 'In-Person');
  if (typeof location === 'boolean') {
    location = location ? 'Online' : 'In-Person';
  }

  return {
    title: title,
    type: 'hackathon',
    source: 'Devfolio',
    deadline: deadline,
    eligibility: raw.eligibility || raw.allowed_participants || 'Open to all',
    location: String(location || 'In-Person'),
    url: url
  };
}

/**
 * Demo data for fallback (clearly labeled as demo)
 * Will be removed when real HTTP source is confirmed working
 */
function getDemoDevfolioResults() {
  return [];
}

module.exports = {
  fetchDevfolio,
  fetchDevfolioViaWebCMD,
  fetchDevfolioViaHTTP,
  fetchDevfolioViaHTML,
  normalizeDevfolio,
  parseDevfolioHTML
};
