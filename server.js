/**
 * Express server for MAIT Scout web interface
 * Acts as middleware between React frontend and Scout Agent backend
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { ScoutAgent } = require('./src/agent/scout-agent');
const { defaultProfile } = require('./src/profile');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Default student profile
const DEFAULT_PROFILE = {
  degree: "B.Tech CSE",
  year: 2,
  interests: ["AI", "ML", "Data Science"],
  skills: ["Python", "C++"],
  location: "Delhi"
};

/**
 * API endpoint to run the Scout Agent
 */
app.post('/api/scout', async (req, res) => {
  try {
    const { request, profile = DEFAULT_PROFILE, verbose = false, simulateBrowserFailure = false } = req.body;

    if (!request) {
      return res.status(400).json({ error: 'Request is required' });
    }

    console.log(`[Server] Scout request: "${request}" (simulateBrowserFailure: ${simulateBrowserFailure})`);

    // Initialize agent
    const agent = new ScoutAgent({ verbose, simulateBrowserFailure });

    // Execute scouting mission
    const result = await agent.scout(request, profile);

    // Clean up
    await agent.cleanup();

    // Return structured results
    res.json({
      success: true,
      request,
      intent: result.intent,
      candidates: result.candidates,
      opportunities: result.opportunities,
      actionLog: result.actionLog,
      errors: result.errors,
      browserAvailable: result.browserAvailable,
      simulatedFailure: result.simulatedFailure,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Server] Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'MAIT Scout Agent',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

/**
 * Agent status endpoint
 */
app.get('/api/status', async (req, res) => {
  try {
    const agent = new ScoutAgent({ verbose: false });
    const browserStatus = agent.browser.getStatus();
    await agent.cleanup();

    res.json({
      agent: 'ready',
      browser: {
        initialized: browserStatus.initialized,
        runtimeAvailable: browserStatus.runtimeAvailable,
        sessionId: browserStatus.sessionId
      },
      sources: ['Unstop', 'Devfolio', 'MAIT'],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({
      agent: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Serve static files
 */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║        MAIT SCOUT Web Server                 ║
║        Running on port ${PORT}                   ║
╚══════════════════════════════════════════════╝

  Agent: http://localhost:${PORT}
  Health: http://localhost:${PORT}/api/health
  Status: http://localhost:${PORT}/api/status
  `);
});

module.exports = app;