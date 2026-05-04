const GATEWAY_BASE = (
  import.meta.env?.VITE_API_BASE ||
  import.meta.env?.VITE_API_BASE_URL ||
  "http://localhost:8000"
).replace(/\/$/, "");

const POSTURE_API = `${GATEWAY_BASE}/posture`;

export async function sendAdhdSession(features, meta) {
  console.warn("sendAdhdSession is not part of the active body-posture flow in this project.");
  return null;
}

export async function sendAdhdVideoTest(videoBlob, rounds) {
  try {
    console.log(
      "sendAdhdVideoTest: sending video blob, size:",
      videoBlob?.size,
      "rounds:",
      rounds
    );

    const formData = new FormData();
    formData.append("video", videoBlob, "recording.webm");
    formData.append("rounds", String(rounds));

    const res = await fetch(`${POSTURE_API}/predict-test`, {
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

export async function sendAdhdVideoPredict(videoBlob, { rounds, age, gender, group } = {}) {
  try {
    const formData = new FormData();
    formData.append("video", videoBlob, "recording.webm");

    if (rounds !== undefined && rounds !== null) formData.append("rounds", String(rounds));
    if (age !== undefined && age !== null) formData.append("age", String(age));
    if (gender) formData.append("gender", gender);
    if (group) formData.append("group", group);

    const res = await fetch(`${POSTURE_API}/predict`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Predict failed:", errorText);
      throw new Error(`API error ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error("sendAdhdVideoPredict failed:", err);
    return null;
  }
}

// Back-compat alias
export const sendToADHDModel = sendAdhdSession;

/**
 * Fast path — sends 8 pre-computed pose features (from browser MediaPipe)
 * to /predict-features. No video upload needed. Result in < 500ms.
 */
export async function sendAdhdFeatures(features, meta = {}) {
  try {
    const API_BASE = (
      import.meta.env?.VITE_API_BASE ||
      import.meta.env?.VITE_API_BASE_URL ||
      "http://localhost:8000"
    ).replace(/\/$/, "");

    console.log("[API] Sending features to /predict-features:", features);

    const res = await fetch(`${API_BASE}/predict-features`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fidget_score:          features.fidget_score,
        sway_x:                features.sway_x,
        sway_y:                features.sway_y,
        mean_velocity:         features.mean_velocity,
        max_velocity:          features.max_velocity,
        std_velocity:          features.std_velocity,
        mean_abs_displacement: features.mean_abs_displacement,
        stability_score:       features.stability_score,
        rounds:  meta.rounds  ?? null,
        age:     meta.age     ?? null,
        gender:  meta.gender  ?? null,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API error ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    console.log("[API] /predict-features response:", data);
    return data;
  } catch (err) {
    console.error("[API] sendAdhdFeatures failed:", err);
    return null;
  }
}