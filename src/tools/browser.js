/**
 * WebCMD Browser Tool
 * Provides browser automation capabilities via WebCMD
 * Handles runtime failures gracefully
 */

const { spawn } = require('child_process');

class BrowserTool {
  constructor(sessionId = null) {
    this.sessionId = sessionId;
    this.available = false;
    this.runtimeAvailable = false;
    this.lastError = null;
  }

  /**
   * Initialize browser session
   */
  async init(sessionName = 'mait-scout') {
    try {
      // Try to create a new session
      const result = await this.execute('session', ['create', sessionName], 5000);

      if (result.success) {
        // Extract session ID from output
        const match = result.output.match(/id:\s*(\S+)/);
        if (match) {
          this.sessionId = match[1];
          // Verify browser is actually operational
          const connTest = await this.testConnection(5000);
          if (connTest.success) {
            this.available = true;
            this.runtimeAvailable = true;
            return { success: true, sessionId: this.sessionId };
          } else {
            this.available = false;
            this.runtimeAvailable = false;
            this.lastError = connTest.error || 'Session created but browser runtime offline';
            return { success: false, error: this.lastError };
          }
        }
      }

      // Session might already exist, try to use it
      return await this.useExistingSession(sessionName);

    } catch (error) {
      this.available = false;
      this.runtimeAvailable = false;
      this.lastError = error.message;
      return { success: false, error: error.message };
    }
  }

  /**
   * Use an existing session
   */
  async useExistingSession(sessionName) {
    try {
      const listResult = await this.execute('session', ['list']);
      if (listResult.success && listResult.output.includes(sessionName)) {
        // Find the session ID
        const lines = listResult.output.split('\n');
        for (const line of lines) {
          if (line.includes(sessionName)) {
            const match = line.match(/id:\s*(\S+)/);
            if (match) {
              this.sessionId = match[1];
              this.available = true;
              // Test if browser is actually usable
              return await this.testConnection();
            }
          }
        }
      }
      return { success: false, error: 'Session not found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Test if browser connection is working
   */
  async testConnection() {
    try {
      const result = await this.execute('browser', ['tabs']);
      if (result.success) {
        this.runtimeAvailable = true;
        return { success: true };
      }
      this.runtimeAvailable = false;
      return { success: false, error: 'Browser command failed' };
    } catch (error) {
      this.runtimeAvailable = false;
      this.lastError = error.message;
      return { success: false, error: error.message };
    }
  }

  /**
   * Navigate to a URL
   */
  async navigate(url) {
    if (!this.available || !this.sessionId) {
      return { success: false, error: 'Browser not initialized' };
    }

    try {
      const result = await this.execute('browser', ['run', `--url`, url, `return document.body.innerHTML`]);
      return {
        success: result.success,
        html: result.success ? result.output : null,
        error: result.success ? null : result.output
      };
    } catch (error) {
      this.lastError = error.message;
      return { success: false, error: error.message };
    }
  }

  /**
   * Execute JavaScript in the browser context
   */
  async executeScript(script) {
    if (!this.available || !this.sessionId) {
      return { success: false, error: 'Browser not initialized' };
    }

    try {
      const result = await this.execute('browser', ['run', script]);
      return {
        success: result.success,
        output: result.output,
        error: result.success ? null : result.output
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get page snapshot
   */
  async snapshot() {
    if (!this.available || !this.sessionId) {
      return { success: false, error: 'Browser not initialized' };
    }

    try {
      const result = await this.execute('browser', ['snapshot']);
      return {
        success: result.success,
        output: result.output,
        error: result.success ? null : result.output
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Take a screenshot (if supported)
   */
  async screenshot() {
    if (!this.available || !this.sessionId) {
      return { success: false, error: 'Browser not initialized' };
    }

    try {
      const result = await this.execute('browser', ['snapshot', '--format', 'png']);
      return {
        success: result.success,
        data: result.output,
        error: result.success ? null : result.output
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Close the browser session
   */
  async close() {
    if (!this.sessionId) {
      return { success: true };
    }

    try {
      const result = await this.execute('session', ['close', this.sessionId]);
      this.available = false;
      this.runtimeAvailable = false;
      return { success: result.success };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Execute a WebCMD command
   */
  execute(command, args = [], timeoutMs = 10000) {
    return new Promise((resolve) => {
      const cmdArgs = this.sessionId
        ? ['--session', this.sessionId, command, ...args]
        : [command, ...args];
      const proc = spawn('webcmd', cmdArgs, {
        shell: true,
        timeout: timeoutMs + 2000
      });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, output: stdout });
        } else {
          resolve({ success: false, output: stderr || stdout, code });
        }
      });

      proc.on('error', (error) => {
        resolve({ success: false, output: error.message, code: -1 });
      });

      // Timeout
      setTimeout(() => {
        proc.kill();
        resolve({ success: false, output: 'Command timeout', code: -1 });
      }, timeoutMs);
    });
  }

  /**
   * Check if browser is available
   */
  isAvailable() {
    return this.available && this.runtimeAvailable;
  }

  /**
   * Get status
   */
  getStatus() {
    return {
      initialized: this.available,
      runtimeAvailable: this.runtimeAvailable,
      sessionId: this.sessionId,
      lastError: this.lastError
    };
  }
}

module.exports = { BrowserTool };