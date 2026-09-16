/**
 * Rank and score opportunities
 */

const { scoreOpportunity, explainScore } = require('./profile');
const { isActive, deduplicate } = require('./normalize');

/**
 * Rank opportunities by relevance score
 */
function rankOpportunities(opportunities, profile) {
  // Filter active opportunities
  const active = opportunities.filter(opp => isActive(opp));

  // Score each opportunity
  const scored = active.map(opp => {
    const scoreData = scoreOpportunity(opp, profile);
    return {
      ...opp,
      score: scoreData.score,
      scoreData
    };
  });

  // Sort by score (descending)
  const sorted = scored.sort((a, b) => b.score - a.score);

  // Deduplicate
  const unique = deduplicate(sorted);

  return unique;
}

/**
 * Filter opportunities by type
 */
function filterByType(opportunities, type) {
  if (!type) return opportunities;
  return opportunities.filter(opp => opp.type === type);
}

/**
 * Get top N opportunities
 */
function getTopOpportunities(opportunities, limit = 10) {
  return opportunities.slice(0, limit);
}

/**
 * Format ranking summary
 */
function summarizeRanking(opportunities) {
  const byType = {};
  const scores = [];

  opportunities.forEach(opp => {
    byType[opp.type] = (byType[opp.type] || 0) + 1;
    scores.push(opp.score);
  });

  const avgScore = scores.length > 0 ?
    (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 0;

  return {
    total: opportunities.length,
    byType,
    avgScore,
    topScore: opportunities.length > 0 ? opportunities[0].score : 0
  };
}

module.exports = {
  rankOpportunities,
  filterByType,
  getTopOpportunities,
  summarizeRanking
};
