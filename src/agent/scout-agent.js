/**
 * MAIT Scout - Opportunity Scout Agent
 *
 * An AI browser agent that finds opportunities relevant to a student profile.
 * Uses WebCMD browser when available, falls back to HTTP when not.
 */

const { BrowserTool } = require('../tools/browser');
const { HTTPTool } = require('../tools/http');
const { normalizeOpportunity, isActive, deduplicate } = require('../normalize');
const { scoreOpportunity, explainScore } = require('../profile');
const { rankOpportunities, getTopOpportunities, summarizeRanking } = require('../rank');

/**
 * Source configurations
 */
const SOURCES = {
  unstop: {
    name: 'Unstop',
    types: ['hackathon', 'internship', 'competition', 'scholarship', 'workshop', 'event'],
    priority: 1,
    baseUrl: 'https://unstop.com',
    apiUrl: 'https://unstop.com/api/public/opportunity/search-result'
  },
  devfolio: {
    name: 'Devfolio',
    types: ['hackathon'],
    priority: 2,
    baseUrl: 'https://devfolio.co',
    hackathonsUrl: 'https://devfolio.co/hackathons'
  },
  mait: {
    name: 'MAIT',
    types: ['campus_notice', 'event', 'workshop', 'scholarship'],
    priority: 3,
    baseUrl: 'https://www.mait.ac.in'
  }
};

/**
 * Scout Agent Class
 */
class ScoutAgent {
  constructor(options = {}) {
    this.browser = new BrowserTool();
    this.http = new HTTPTool();
    this.sessionName = options.sessionName || 'mait-scout';
    this.verbose = options.verbose || false;
    this.simulateBrowserFailure = options.simulateBrowserFailure || false;
    this.actionLog = [];
    this.candidates = [];
    this.errors = [];
  }

  /**
   * Log agent action
   */
  log(action, detail = '') {
    const entry = `[Agent] ${action}${detail ? ': ' + detail : ''}`;
    this.actionLog.push(entry);
    console.log(entry);
  }

  /**
   * Main entry point - process a user request
   */
  async scout(request, profile) {
    console.log(`
╔══════════════════════════════════════════════╗
║           MAIT SCOUT                         ║
║      Opportunity Scout Agent                 ║
╚══════════════════════════════════════════════╝
`);

    // Reset state
    this.actionLog = [];
    this.candidates = [];
    this.errors = [];

    this.log('Starting opportunity discovery');
    if (this.simulateBrowserFailure) {
      this.log('[SIMULATED BROWSER FAILURE MODE ACTIVE]', 'Demonstrating browser failure detection & HTTP recovery');
    }
    this.log(`Request: "${request}"`);

    // Step 1: Understand the request
    const intent = this.parseIntent(request, profile);
    this.log('Intent understood', JSON.stringify(intent));

    // Step 2: Select sources based on intent
    const selectedSources = this.selectSources(intent);
    this.log('Sources selected', selectedSources.map(s => s.name).join(', '));

    // Step 3: Initialize browser (attempt)
    await this.initializeBrowser();

    // Step 4: Fetch from each source
    for (const source of selectedSources) {
      await this.fetchFromSource(source, intent);
    }

    // Step 5: Normalize and filter candidates
    this.log('Normalizing candidates');
    const normalized = this.candidates.map(raw => normalizeOpportunity(raw)).filter(Boolean);
    this.log(`Normalized ${normalized.length} opportunities`);

    // Step 6: Filter active opportunities
    const active = normalized.filter(opp => isActive(opp));
    this.log('Filtering', `${normalized.length - active.length} expired/inactive removed`);

    // Step 7: Rank opportunities
    const ranked = rankOpportunities(active, profile);
    this.log('Ranking complete', `${ranked.length} candidates`);

    // Step 8: Return results
    return {
      intent,
      sources: selectedSources,
      candidates: this.candidates,
      opportunities: ranked,
      actionLog: this.actionLog,
      errors: this.errors,
      browserAvailable: this.browser.isAvailable(),
      simulatedFailure: this.simulateBrowserFailure
    };
  }

  /**
   * Parse user request to understand intent
   */
  parseIntent(request, profile) {
    const lower = request.toLowerCase();

    // Determine opportunity types
    const types = [];
    if (lower.includes('hackathon')) types.push('hackathon');
    if (lower.includes('internship') || lower.includes('intern')) types.push('internship');
    if (lower.includes('scholarship')) types.push('scholarship');
    if (lower.includes('competition') || lower.includes('contest')) types.push('competition');
    if (lower.includes('workshop')) types.push('workshop');
    if (lower.includes('event')) types.push('event');
    if (lower.includes('campus') || lower.includes('mait')) types.push('campus_notice');

    // Default to all types if none specified
    if (types.length === 0) {
      types.push('hackathon', 'internship', 'competition', 'event');
    }

    // Extract interests from request or use profile
    const interests = profile.interests || [];

    return {
      types,
      interests,
      profile,
      rawRequest: request
    };
  }

  /**
   * Select relevant sources based on intent
   */
  selectSources(intent) {
    const selected = [];

    for (const [key, source] of Object.entries(SOURCES)) {
      // Check if source has any of the requested types
      const hasRelevantType = source.types.some(t => intent.types.includes(t));
      if (hasRelevantType) {
        selected.push(source);
      }
    }

    // Sort by priority
    selected.sort((a, b) => a.priority - b.priority);

    return selected;
  }

  /**
   * Initialize browser tool
   */
  async initializeBrowser() {
    this.log('Initializing browser...');

    if (this.simulateBrowserFailure) {
      this.log('Browser initialized', 'session: mait-scout-sim (simulated mode)');
      return;
    }

    const result = await this.browser.init(this.sessionName);

    if (result.success) {
      this.log('Browser initialized', `session: ${this.browser.sessionId}`);
    } else {
      this.log('Browser unavailable', result.error || 'Runtime not accessible');
      this.errors.push(`Browser: ${result.error || 'unavailable'}`);
    }
  }

  /**
   * Fetch opportunities from a specific source
   */
  async fetchFromSource(source, intent) {
    this.log(`Inspecting ${source.name}`);

    let results = [];
    let status = 'unknown';

    if (this.simulateBrowserFailure) {
      this.log('ACT → WebCMD browser');
      this.log('Browser action failed', '[SIMULATED FAILURE] Navigation timeout (30s) / Session lost');
      this.log('Diagnosing failure...');
      this.log('Recovery strategy: HTTP adapter');
      this.log('Retrying via HTTP');

      const httpResult = await this.fetchViaHTTP(source, intent);
      if (httpResult.success && Array.isArray(httpResult.data) && httpResult.data.length > 0) {
        results = httpResult.data;
        status = 'LIVE (HTTP recovery)';
        this.log('Recovery successful');
        this.log('Continuing pipeline...');
      }
    } else {
      if (this.browser.isAvailable()) {
        const browserResult = await this.fetchViaBrowser(source, intent);
        if (browserResult.success && Array.isArray(browserResult.data) && browserResult.data.length > 0) {
          results = browserResult.data;
          status = 'LIVE (browser)';
        }
      }

      if (results.length === 0) {
        const httpResult = await this.fetchViaHTTP(source, intent);
        if (httpResult.success && Array.isArray(httpResult.data) && httpResult.data.length > 0) {
          results = httpResult.data;
          status = 'LIVE (HTTP)';
        }
      }
    }

    // Report status
    if (results.length > 0) {
      this.log(`${source.name} ✓ ${status}`, `${results.length} opportunities`);
      this.candidates.push(...results);
    } else {
      this.log(`${source.name} ✗ FAILED`, 'No data retrieved');
      this.errors.push(`${source.name}: No data retrieved`);
    }
  }

  /**
   * Fetch via WebCMD browser
   */
  async fetchViaBrowser(source, intent) {
    try {
      this.log(`${source.name} → Using browser`);

      // Navigate to source page
      const url = source.hackathonsUrl || source.apiUrl || source.baseUrl;
      const navResult = await this.browser.navigate(url);

      if (!navResult.success) {
        return { success: false, data: [], error: navResult.error };
      }

      // Extract data based on source
      let data = [];
      let extractSuccess = false;

      if (source.name === 'Devfolio') {
        data = this.extractDevfolioFromHTML(navResult.html);
        extractSuccess = true;
      } else if (source.name === 'Unstop') {
        data = this.extractUnstopFromHTML(navResult.html);
        extractSuccess = true;
      } else if (source.name === 'MAIT') {
        data = this.extractMAITFromHTML(navResult.html);
        extractSuccess = true;
      }

      if (!extractSuccess || data.length === 0) {
        this.log(`${source.name} extraction failed`, 'HTML structure may have changed');
        return { success: false, data: [], error: 'Extraction failed' };
      }

      return { success: true, data };

    } catch (error) {
      this.log(`${source.name} browser error`, error.message);
      return { success: false, data: [], error: error.message };
    }
  }

  /**
   * Fetch via HTTP (fallback)
   */
  async fetchViaHTTP(source, intent) {
    try {
      this.log(`${source.name} → Using HTTP fallback`);

      let data = [];
      let url = null;

      if (source.name === 'Unstop') {
        const searchParams = new URLSearchParams({
          limit: 30,
          offset: 0,
          type: intent.types.join(',')
        });
        url = `${source.apiUrl}?${searchParams}`;
      } else if (source.name === 'Devfolio') {
        url = source.hackathonsUrl;
      } else if (source.name === 'MAIT') {
        url = source.baseUrl;
      }

      if (!url) {
        return { success: false, data: [], error: 'No URL for source' };
      }

      const response = await this.http.get(url);

      if (response.status !== 200) {
        return { success: false, data: [], error: `HTTP ${response.status}` };
      }

      // Parse response based on source
      if (source.name === 'Unstop' && response.isJson) {
        const rawOpps = response.parsed?.data?.data ||
          response.parsed?.data ||
          response.parsed?.opportunities ||
          (Array.isArray(response.parsed) ? response.parsed : []);
        data = rawOpps.map(o => ({ ...o, source: 'Unstop' }));
      } else if (source.name === 'Devfolio') {
        data = this.extractDevfolioFromHTML(response.body);
      } else {
        data = this.extractMAITFromHTML(response.body);
      }

      return { success: true, data };

    } catch (error) {
      this.log(`${source.name} HTTP error`, error.message);
      return { success: false, data: [], error: error.message };
    }
  }

  /**
   * Extract Devfolio hackathons from HTML
   */
  extractDevfolioFromHTML(html) {
    const results = [];

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
                  category: 'hackathon',
                  source: 'Devfolio'
                });
              });
            }
          });
        });

      } catch (e) {
        this.log('Devfolio JSON parse failed', e.message);
      }
    }

    return results;
  }

  /**
   * Extract Unstop opportunities from HTML
   */
  extractUnstopFromHTML(html) {
    // Try to find JSON data in page
    const results = [];

    const jsonMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*({.+?});/);
    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[1]);
        const opportunities = data.opportunities || data.data?.opportunities || [];
        return opportunities.map(o => ({
          title: o.title || o.name,
          type: o.category || 'event',
          source: 'Unstop',
          deadline: o.deadline || o.end_date || '',
          eligibility: o.eligibility || '',
          location: o.location || 'Online',
          url: o.url || `https://unstop.com/p/${o.id}`
        }));
      } catch (e) {
        this.log('Unstop JSON parse failed', e.message);
      }
    }

    return results;
  }

  /**
   * Extract MAIT opportunities from HTML
   */
  extractMAITFromHTML(html) {
    // Look for event/notice patterns
    const results = [];

    // Simple extraction - look for common MAIT event patterns
    const eventPattern = /<a[^>]*href="(\/[^"]+)"[^>]*>([^<]+)<\/a>/g;
    let match;

    while ((match = eventPattern.exec(html)) !== null && results.length < 10) {
      const href = match[1];
      const title = match[2].trim();

      if (title.length > 10 && (href.includes('event') || href.includes('notice') || href.includes('news'))) {
        results.push({
          title,
          type: 'campus_notice',
          source: 'MAIT',
          deadline: '',
          eligibility: 'MAIT students',
          location: 'MAIT Campus, Delhi',
          url: `https://www.mait.ac.in${href}`
        });
      }
    }

    return results;
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    if (this.browser.isAvailable()) {
      await this.browser.close();
    }
  }
}

module.exports = { ScoutAgent, SOURCES };