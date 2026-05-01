/**
 * featureCompute.js
 *
 * JavaScript mirror of the Python backend's extract_features_from_sequence().
 * Produces the exact same 8 features from the pose sequence.
 *
 * seq: Array of rows. Each row = [x1,y1, x2,y2, ..., x8,y8] (16 numbers)
 * Landmark order: shoulder_L, shoulder_R, elbow_L, elbow_R,
 *                 wrist_L, wrist_R, hip_L, hip_R
 */

function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function std(arr) {
  const m = mean(arr);
  return Math.sqrt(mean(arr.map((x) => (x - m) ** 2)));
}

function rowNorm(row) {
  return Math.sqrt(row.reduce((s, v) => s + v * v, 0));
}

/**
 * Compute the 8 behavioral features used by the Random Forest model.
 * Throws if the sequence is too short (< 5 frames).
 */
export function computeFeatures(seq) {
  const T = seq.length;

  if (T < 5) {
    throw new Error(
      `Not enough pose frames detected: got ${T}, need at least 5. ` +
        "Make sure the child is visible in the webcam."
    );
  }

  // --- Frame-to-frame difference rows ---
  const diffRows = [];
  for (let i = 1; i < T; i++) {
    diffRows.push(seq[i].map((v, j) => v - seq[i - 1][j]));
  }

  // --- Velocity features (norm of each diff row) ---
  const velocities = diffRows.map(rowNorm);
  const mean_velocity = mean(velocities);
  const max_velocity = Math.max(...velocities);
  const std_velocity = std(velocities);
  const mean_abs_displacement = mean_velocity; // same calculation, matches Python

  // --- Stability (inverse of velocity) ---
  const stability_score = 1.0 / (1.0 + mean_velocity);

  // --- Fidget score ---
  // Python: np.mean(np.abs(np.diff(seq[:, 4:12], axis=0)))
  // Indices 4–11 = elbow_L_x/y, elbow_R_x/y, wrist_L_x/y, wrist_R_x/y
  const fidgetDiffs = [];
  for (const diffRow of diffRows) {
    for (let j = 4; j < 12; j++) {
      fidgetDiffs.push(Math.abs(diffRow[j]));
    }
  }
  const fidget_score = mean(fidgetDiffs);

  // --- Sway (shoulder midpoint standard deviation) ---
  // left_shoulder = cols 0,1 | right_shoulder = cols 2,3
  const midX = seq.map((row) => (row[0] + row[2]) / 2);
  const midY = seq.map((row) => (row[1] + row[3]) / 2);
  const sway_x = std(midX);
  const sway_y = std(midY);

  return {
    fidget_score,
    sway_x,
    sway_y,
    mean_velocity,
    max_velocity,
    std_velocity,
    mean_abs_displacement,
    stability_score,
  };
}
