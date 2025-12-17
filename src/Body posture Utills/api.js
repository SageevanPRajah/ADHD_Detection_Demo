// Simple ADHD model API helper
// Falls back to localhost if VITE_API_BASE is not set.
const API_BASE = import.meta.env?.VITE_API_BASE || "http://localhost:8000";

export async function sendAdhdSession(features, meta) {
  try {
    const res = await fetch(`${API_BASE}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        child_id: meta.childId,
        age: meta.age,
        group: meta.group,
        rounds: meta.rounds,
        features,
      }),
    });

    if (!res.ok) throw new Error(`API error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("sendAdhdSession failed:", err);
    return null;
  }
}

// Back-compat alias for older imports
export const sendToADHDModel = sendAdhdSession;
