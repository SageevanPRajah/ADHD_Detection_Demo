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

/**
 * Sends a video file to the /predict-test endpoint (no auth or DB required).
 * This allows testing the model directly.
 */
export async function sendAdhdVideoTest(videoBlob, rounds) {
  try {
    console.log("sendAdhdVideoTest: sending video blob, size:", videoBlob?.size, "rounds:", rounds);
    const formData = new FormData();
    formData.append("video", videoBlob, "recording.webm");
    formData.append("rounds", rounds);

    const res = await fetch(`${API_BASE}/predict-test`, {
      method: "POST",
      body: formData,
    });

    console.log("sendAdhdVideoTest: response status:", res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Predict-test failed:", errorText);
      throw new Error(`API error ${res.status}`);
    }

    const data = await res.json();
    console.log("sendAdhdVideoTest: parsed response:", JSON.stringify(data));
    return data;
  } catch (err) {
    console.error("sendAdhdVideoTest failed:", err);
    return null;
  }
}

// Back-compat alias for older imports
export const sendToADHDModel = sendAdhdSession;
