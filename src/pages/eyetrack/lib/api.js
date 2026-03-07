const API = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

async function readErrorMessage(response) {
  try {
    const data = await response.json();
    if (typeof data?.detail === 'string') return data.detail;
    if (typeof data?.message === 'string') return data.message;
    return JSON.stringify(data);
  } catch {
    return await response.text();
  }
}

async function requestJson(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error((await readErrorMessage(response)) || `Request failed with ${response.status}`);
  }

  return response.json();
}

export async function analyzeSession({ sessionMeta, events, gaze, calibration = [] }) {
  return requestJson('/analyze-session', {
    method: 'POST',
    body: JSON.stringify({
      sessionMeta,
      events,
      gaze,
      calibration,
    }),
  });
}

export function downloadRunArtifactsUrl(runId) {
  return `${API}/runs/${encodeURIComponent(runId)}/download`;
}

export async function getHealth() {
  return requestJson('/health');
}
