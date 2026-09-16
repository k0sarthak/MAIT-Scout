/**
 * Normalize opportunities from various sources into a unified schema
 */

const OPPORTUNITY_SCHEMA = {
  title: "",
  type: "", // internship, hackathon, scholarship, competition, event, workshop, campus_notice
  source: "", // Unstop, Devfolio, MAIT, CSE
  deadline: "", // ISO 8601 date
  eligibility: "",
  location: "",
  url: ""
};

/**
 * Normalize an Unstop opportunity
 */
/**
 * Normalize an Unstop opportunity
 */
function normalizeUnstop(raw) {
  if (!raw) return null;

  const category = raw.type || raw.subtype || raw.category || raw.opportunity_type || '';
  const location = raw.region || raw.location || raw.job_location || raw.address || raw.city || 'Online';
  const type = mapType(category);

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
 * Normalize a Devfolio opportunity (from HTML parsing)
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
 * Normalize a MAIT/CSE opportunity (from HTML parsing)
 */
function normalizeMAIT(raw) {
  if (!raw) return null;

  return {
    title: raw.title || "",
    type: mapType(raw.category || "campus_notice"),
    source: "MAIT",
    deadline: raw.deadline || "",
    eligibility: raw.eligibility || "CSE students",
    location: raw.location || "MAIT Campus, Delhi",
    url: raw.url || ""
  };
}

/**
 * Map category names to standard types
 */
function mapType(category) {
  if (!category) return "event";

  const lower = category.toLowerCase();

  if (lower.includes("hackathon") || lower.includes("hack")) return "hackathon";
  if (lower.includes("intern") || lower.includes("placement")) return "internship";
  if (lower.includes("scholarship")) return "scholarship";
  if (lower.includes("competition") || lower.includes("contest")) return "competition";
  if (lower.includes("workshop") || lower.includes("training")) return "workshop";
  if (lower.includes("event") || lower.includes("summit")) return "event";
  if (lower.includes("notice") || lower.includes("announcement")) return "campus_notice";

  return "event";
}

/**
 * Filter out expired/clearly closed opportunities
 */
function isActive(opportunity) {
  if (!opportunity || !opportunity.deadline) return true;

  try {
    const deadline = new Date(opportunity.deadline);
    if (isNaN(deadline.getTime())) return true;
    return deadline >= new Date();
  } catch {
    return true; // If can't parse, assume active
  }
}

/**
 * Deduplicate opportunities by URL
 */
function deduplicate(opportunities) {
  const seen = new Set();
  return opportunities.filter(opp => {
    const key = opp.url || opp.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Normalize an opportunity from any source
 * Routes to the appropriate normalizer based on source field
 */
function normalizeOpportunity(raw) {
  if (!raw) return null;

  // If already normalized with valid source, title, type, and url, return as-is
  if (raw.source && raw.type && raw.title && raw.url) {
    return raw;
  }

  // Detect source and normalize accordingly
  if (raw.source === 'Unstop' || raw.public_url || raw.regnRequirements || raw.opportunity_type) {
    return normalizeUnstop(raw);
  } else if (raw.source === 'Devfolio' || raw.slug || raw.hackathon_name) {
    return normalizeDevfolio(raw);
  } else if (raw.source === 'MAIT') {
    return normalizeMAIT(raw);
  } else {
    // Generic normalization
    return {
      title: raw.title || raw.name || '',
      type: mapType(raw.category || raw.type || ''),
      source: raw.source || 'Unknown',
      deadline: raw.deadline || raw.end_date || '',
      eligibility: raw.eligibility || '',
      location: raw.location || 'Online',
      url: raw.url || ''
    };
  }
}

module.exports = {
  OPPORTUNITY_SCHEMA,
  normalizeUnstop,
  normalizeDevfolio,
  normalizeMAIT,
  normalizeOpportunity,
  isActive,
  deduplicate,
  mapType
};
