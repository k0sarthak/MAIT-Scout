/**
 * Thin client for the existing Express API (server.js).
 * No agent logic lives here â€” this only calls the real backend.
 */

export async function runScout({ request, profile, simulateBrowserFailure = false, verbose = false }) {
  const res = await fetch('/api/scout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ request, profile, simulateBrowserFailure, verbose }),
  });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Scout request failed (HTTP ${res.status})`);
  }

  if (!res.ok || data.success === false) {
    throw new Error(data.error || `Scout request failed (HTTP ${res.status})`);
  }

  return data;
}

export async function getStatus() {
  const res = await fetch('/api/status');
  return res.json();
}

