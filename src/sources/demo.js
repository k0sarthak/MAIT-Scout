/**
 * Demo source with static opportunity data
 * Used for testing when real APIs/browsers are unavailable
 */

const { normalizeUnstop } = require('../normalize');

/**
 * Generate demo opportunities for testing
 */
function fetchDemo(options = {}) {
  const demoData = [
    {
      title: "AI/ML Hackathon 2026 - Innovation Challenge",
      category: "hackathon",
      deadline: "2026-10-15",
      eligibility: "Students from CSE/IT, 2nd-4th year",
      location: "Online/Remote",
      url: "https://demo.unstop.com/ai-hackathon-2026"
    },
    {
      title: "Summer Internship at TechCorp - AI Research",
      category: "internship",
      deadline: "2026-04-30",
      eligibility: "CSE students with ML background, 3rd-4th year",
      location: "Bangalore (Remote option)",
      url: "https://demo.unstop.com/techcorp-internship"
    },
    {
      title: "Data Science Competition - National Level",
      category: "competition",
      deadline: "2026-09-30",
      eligibility: "All engineering students",
      location: "Online",
      url: "https://demo.unstop.com/ds-compete-2026"
    },
    {
      title: "Python & ML Workshop by Industry Experts",
      category: "workshop",
      deadline: "2026-08-20",
      eligibility: "CSE students, any year",
      location: "Delhi (Hybrid)",
      url: "https://demo.unstop.com/python-ml-workshop"
    },
    {
      title: "Scholarship for AI Research Projects",
      category: "scholarship",
      deadline: "2026-11-10",
      eligibility: "CSE students with AI/ML projects",
      location: "India",
      url: "https://demo.unstop.com/ai-scholarship-2026"
    },
    {
      title: "Tech Conference 2026 - Future of AI",
      category: "event",
      deadline: "2026-07-15",
      eligibility: "Students interested in AI",
      location: "Delhi NCR",
      url: "https://demo.unstop.com/tech-conf-2026"
    }
  ];

  const results = demoData.map(raw => normalizeUnstop(raw)).filter(Boolean);

  console.log(`[Demo] ✓ ${results.length} demo opportunities generated`);

  return {
    results,
    errors: []
  };
}

module.exports = { fetchDemo };
