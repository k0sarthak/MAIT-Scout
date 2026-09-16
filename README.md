# MAIT Scout

AI/Browser-Agent opportunity discovery tool for MAIT students.

## Problem

Opportunities for MAIT students are fragmented across platforms:
- **Unstop**: Hackathons, internships, competitions
- **Devfolio**: Hackathons, developer events  
- **MAIT/CSE**: Campus workshops, scholarships, events
- **Other sources**: Scholarships, competitions, workshops

MAIT Scout gathers, normalizes, and prioritizes relevant opportunities for each student's profile.

## Architecture

```
MAIT Scout/
├── src/
│   ├── sources/          # Data source adapters
│   │   ├── unstop.js    # Unstop public API
│   │   └── mait.js      # MAIT website (WebCMD browser)
│   ├── normalize.js     # Schema normalization
│   ├── profile.js       # Student profile & scoring
│   ├── rank.js          # Ranking algorithm
│   └── index.js         # Main CLI entry point
└── package.json
```

## Core Features

### 1. Hybrid Source Integration
- **Unstop**: Public API (no authentication required)
- **MAIT/CSE**: WebCMD browser automation + fallback static data
- **Modular**: Add new sources easily

### 2. Smart Scoring
Transparent heuristic (not ML):
- Degree/eligibility match (+20)
- Year eligibility (+15)  
- Interest match (+25 max)
- Skill match (+20 max)
- Location/remote compatibility (+10)
- Urgency (+10)

### 3. WebCMD Integration
- **Current**: Browser automation interface ready
- **Fallback**: Graceful degradation if browser runtime unavailable
- **Recovery**: Can switch between API and browser sources

## Quick Start

```bash
# Install dependencies
npm install

# Run scout
npm run scout

# Run with verbose output
npm run scout -- --verbose
```

## Example Output

```
MAIT SCOUT
Student: B.Tech CSE • Year 2 • AI/ML/Data Science

1. [HACKATHON] AI Innovation Challenge 2026
   Score: 95/100
   Deadline: 2026-10-15
   Why: Matches CSE degree + Matches interests (AI/ML/Data Science) + Delhi/Remote compatible
   Source: Unstop
   URL: https://unstop.com/ai-challenge-2026
```

## WebCMD Browser Integration

The project includes WebCMD browser automation for:
- **MAIT website**: Extract campus opportunities
- **Devfolio**: Extract hackathon listings (future)
- **Browser-based sources**: Any site requiring interaction

### Current Status
- WebCMD 0.8.4 installed
- Daemon running
- Browser integration interface ready
- Fallback to static data if browser unavailable

## Student Profile (MVP)

```javascript
{
  "degree": "B.Tech CSE",
  "year": 2,
  "interests": ["AI", "ML", "Data Science"],
  "skills": ["Python", "C++"],
  "location": "Delhi"
}
```

## Opportunity Categories

- `internship`
- `hackathon` 
- `scholarship`
- `competition`
- `event`
- `workshop`
- `campus_notice`

## Hackathon Priorities

1. **Live Reliability** (30%) - Works end-to-end, handles failures gracefully
2. **Real-World Usefulness** (25%) - Solves actual student problem
3. **Technical Depth & Recovery** (20%) - WebCMD integration with fallbacks
4. **Creativity** (15%) - Smart scoring, explainable results
5. **Demo & Storytelling** (10%) - Clear output, debugging info

## Next Steps

1. **Integrate Devfolio** with WebCMD browser
2. **Add more campus sources** (MAIT portals)
3. **Enrich scoring** with additional heuristics
4. **Add persistence** for seen opportunities
5. **Build simple web UI** for browsing

## Error Handling

- **Source failures**: Continue with available sources
- **Browser unavailable**: Fallback to static/demo data
- **Network issues**: Timeout handling, retry logic
- **Data normalization**: Skip malformed entries

## License

MIT
