/**
 * HTTP Tool
 * Provides HTTP request capabilities as fallback when browser is unavailable
 */

const https = require('https');
const http = require('http');

class HTTPTool {
  constructor() {
    this.timeout = 15000;
  }

  /**
   * Make an HTTP/HTTPS request
   */
  async fetch(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const lib = isHttps ? https : http;

      const reqOptions = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: {
          'User-Agent': 'MAIT-Scout/1.0',
          'Accept': 'application/json, text/html, */*',
          ...options.headers
        },
        timeout: options.timeout || this.timeout
      };

      const req = lib.request(reqOptions, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          // Try to parse JSON, fallback to raw text
          let parsed = null;
          let isJson = false;

          try {
            parsed = JSON.parse(data);
            isJson = true;
          } catch (e) {
            parsed = data;
          }

          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data,
            parsed,
            isJson
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (options.body) {
        req.write(options.body);
      }

      req.end();
    });
  }

  /**
   * GET request
   */
  async get(url, options = {}) {
    return this.fetch(url, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post(url, body, options = {}) {
    return this.fetch(url, {
      ...options,
      method: 'POST',
      body: typeof body === 'string' ? body : JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
  }

  /**
   * Check if URL is accessible
   */
  async ping(url) {
    try {
      const response = await this.fetch(url, { timeout: 5000 });
      return { accessible: response.status < 500, status: response.status };
    } catch (error) {
      return { accessible: false, error: error.message };
    }
  }
}

module.exports = { HTTPTool };