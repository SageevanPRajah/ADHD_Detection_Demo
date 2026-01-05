const API_BASE = import.meta.env?.VITE_API_BASE || "http://localhost:8000";

// OLD JSON endpoint (keep if you want)
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
        gender: meta.gender || "M",
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

// ✅ NEW: video upload endpoint
export async function sendAdhdVideo(fileOrBlob, meta) {
  try {
    const form = new FormData();

    // if blob, wrap as File
    let file = fileOrBlob;
    if (fileOrBlob instanceof Blob && !(fileOrBlob instanceof File)) {
      file = new File([fileOrBlob], "recording.webm", { type: "video/webm" });
    }

    form.append("video", file);
    form.append("child_id", meta.childId || "demo_001");
    form.append("age", String(meta.age ?? 8));
    form.append("group", meta.group || "Unknown");
    form.append("rounds", String(meta.rounds ?? 0));
    form.append("gender", meta.gender || "M");

    const res = await fetch(`${API_BASE}/predict`, {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`API ${res.status}: ${txt}`);
    }

    return await res.json();
  } catch (err) {
    console.error("sendAdhdVideo failed:", err);
    return null;
  }
}

export const sendToADHDModel = sendAdhdSession;
