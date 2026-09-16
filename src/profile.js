/**
 * Student profile definition and matching utilities
 */

const defaultProfile = {
  degree: "B.Tech CSE",
  year: 2,
  interests: ["AI", "ML", "Data Science"],
  skills: ["Python", "C++"],
  location: "Delhi"
};

/**
 * Check if a string contains any of the target keywords (case-insensitive)
 */
function containsAny(text, keywords) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return keywords.some(k => lower.includes(k.toLowerCase()));
}

/**
 * Score an opportunity against the student profile
 * @returns {object} { score, maxScore, breakdown: {reason: points, ...} }
 */
function scoreOpportunity(opportunity, profile) {
  let score = 0;
  const breakdown = {};
  const maxScore = 100;

  const { title, eligibility, type, deadline } = opportunity;
  const allText = [title, eligibility, type].filter(Boolean).join(" ");

  // Degree/eligibility match (+20)
  if (containsAny(allText, ["CSE", "Computer Science", "B.Tech", "Engineering", "Information Technology"])) {
    score += 20;
    breakdown.degreeMatch = 20;
  }

  // Year eligibility (+15)
  if (containsAny(eligibility, ["2nd year", "second year", "year 2", "2nd sem", "semester 3", "semester 4"])) {
    score += 15;
    breakdown.yearMatch = 15;
  } else if (containsAny(eligibility, ["1st", "2nd", "3rd", "4th"])) {
    // Broader year match
    score += 8;
    breakdown.yearMatch = 8;
  }

  // Interest match (+25)
  const interestMatches = profile.interests.filter(interest =>
    containsAny(allText, [interest])
  ).length;
  const interestPoints = Math.min(25, interestMatches * 10);
  if (interestPoints > 0) {
    score += interestPoints;
    breakdown.interestMatch = interestPoints;
  }

  // Skill match (+20)
  const skillMatches = profile.skills.filter(skill =>
    containsAny(allText, [skill])
  ).length;
  const skillPoints = Math.min(20, skillMatches * 8);
  if (skillPoints > 0) {
    score += skillPoints;
    breakdown.skillMatch = skillPoints;
  }

  // Location/remote compatibility (+10)
  if (containsAny(allText, ["Remote", "Online", "Virtual", "Delhi", "NCR", "India"])) {
    score += 10;
    breakdown.locationMatch = 10;
  }

  // Urgency/active deadline (+10)
  if (deadline) {
    const deadlineDate = new Date(deadline);
    const daysUntil = (deadlineDate - new Date()) / (1000 * 60 * 60 * 24);
    if (daysUntil > 0 && daysUntil <= 7) {
      score += 10;
      breakdown.urgency = 10;
    } else if (daysUntil > 7 && daysUntil <= 30) {
      score += 5;
      breakdown.urgency = 5;
    }
  }

  // Penalize clearly irrelevant types
  if (type && containsAny(type, ["irrelevant", "spam"])) {
    score = Math.max(0, score - 50);
    breakdown.irrelevant = -50;
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    breakdown
  };
}

/**
 * Format scoring breakdown into human-readable explanation
 */
function explainScore(scoreData) {
  const reasons = [];

  if (scoreData.breakdown.degreeMatch) {
    reasons.push("Matches CSE degree");
  }
  if (scoreData.breakdown.yearMatch) {
    reasons.push("Eligible for your year");
  }
  if (scoreData.breakdown.interestMatch) {
    reasons.push("Matches your interests (AI/ML/Data Science)");
  }
  if (scoreData.breakdown.skillMatch) {
    reasons.push("Matches your skills (Python/C++)");
  }
  if (scoreData.breakdown.locationMatch) {
    reasons.push("Delhi/Remote compatible");
  }
  if (scoreData.breakdown.urgency) {
    reasons.push("Active/upcoming deadline");
  }

  return reasons.length > 0 ? reasons.join(" + ") : "Generic opportunity";
}

module.exports = {
  defaultProfile,
  scoreOpportunity,
  explainScore
};
