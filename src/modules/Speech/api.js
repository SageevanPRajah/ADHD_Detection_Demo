const GATEWAY_BASE = (
  import.meta.env?.VITE_API_BASE ||
  import.meta.env?.VITE_API_BASE_URL ||
  import.meta.env?.VITE_API_URL ||
  'http://localhost:8000'
).replace(/\/$/, '');

const VOICE_API = `${GATEWAY_BASE}/voice`;

export async function analyzeVoiceAudio(file, childAge) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('child_age', String(childAge));

  const response = await fetch(`${VOICE_API}/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { detail: errorText };
    }
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export { GATEWAY_BASE, VOICE_API };
