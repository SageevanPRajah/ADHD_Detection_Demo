const GATEWAY_BASE = (
  import.meta.env?.VITE_API_BASE ||
  import.meta.env?.VITE_API_BASE_URL ||
  import.meta.env?.VITE_API_URL ||
  'http://localhost:8000'
).replace(/\/$/, '');

const HANDWRITING_API = `${GATEWAY_BASE}/handwriting`;

async function parseError(response) {
  const errorText = await response.text();
  let errorMessage = errorText || `HTTP error! status: ${response.status}`;

  try {
    const errorJson = JSON.parse(errorText);
    errorMessage = errorJson.detail || errorJson.error || errorMessage;
  } catch {
    // keep raw text
  }

  return errorMessage;
}

export async function predictFromJSON(jsonData, age, gender) {
  const body = { json_data: jsonData, age, gender };

  try {
    const res = await fetch(`${HANDWRITING_API}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(await parseError(res));
    }

    return await res.json();
  } catch (error) {
    if (
      error.name === 'TypeError' &&
      (error.message.includes('fetch') || error.message.includes('Failed to fetch'))
    ) {
      throw new Error(
        `Failed to connect to gateway server at ${GATEWAY_BASE}. Please ensure the gateway is running.`
      );
    }
    throw error;
  }
}

export async function predictFromFile(file, age, gender) {
  const fd = new FormData();
  fd.append('file', file, file.name);
  if (age != null) fd.append('age', String(age));
  if (gender) fd.append('gender', gender);

  try {
    const res = await fetch(`${HANDWRITING_API}/analyze`, {
      method: 'POST',
      body: fd,
    });

    if (!res.ok) {
      throw new Error(await parseError(res));
    }

    return await res.json();
  } catch (error) {
    if (
      error.name === 'TypeError' &&
      (error.message.includes('fetch') || error.message.includes('Failed to fetch'))
    ) {
      throw new Error(
        `Failed to connect to gateway server at ${GATEWAY_BASE}. Please ensure the gateway is running.`
      );
    }
    throw error;
  }
}

export async function analyzeHandwritingSession(sessionJSON) {
  const res = await fetch(`${HANDWRITING_API}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sessionJSON),
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return await res.json();
}

export { GATEWAY_BASE, HANDWRITING_API };
