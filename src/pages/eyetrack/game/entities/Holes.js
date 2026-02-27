export class Holes {
  constructor() {
    this.count = 7; // keep odd for clean "opposite hole"
    this.points = [];
  }

  layout(w, h) {
    const cx = w * 0.5;
    const cy = h * 0.68;
    const radius = Math.min(w, h) * 0.32;

    this.points = [];
    for (let i = 0; i < this.count; i++) {
      const t = (i / (this.count - 1)) * Math.PI; // semi-circle
      const x = cx + Math.cos(Math.PI + t) * radius;
      const y = cy + Math.sin(Math.PI + t) * radius;
      this.points.push({ x, y });
    }
  }

  pos(i) {
    return this.points[i] || { x: 0, y: 0 };
  }

  draw(ctx, { cueHole, targetHole, state, trialType }) {
    for (let i = 0; i < this.points.length; i++) {
      const p = this.points[i];

      // hole
      ctx.fillStyle = "#05070f";
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, 40, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // cue ring (orange during fixation + freeze)
      const showOrange = (state === "RING_ORANGE" || state === "FOX_FREEZE") && i === cueHole;
      if (showOrange) {
        ctx.strokeStyle = "#f97316";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y - 6, 30, 0, Math.PI * 2);
        ctx.stroke();
      }

      // green ring when rabbit appears (at target hole)
      const showGreen = state === "RABBIT_ON" && i === targetHole;
      if (showGreen) {
        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y - 6, 30, 0, Math.PI * 2);
        ctx.stroke();
      }

      // OPTIONAL DEBUG: show tiny markers for anti trials
      // (remove later for real child version)
      if (state === "RABBIT_ON" && trialType === "anti" && i === cueHole) {
        ctx.font = "16px system-ui";
        ctx.fillStyle = "#fb7185";
        ctx.textAlign = "center";
        ctx.fillText("TRAP", p.x, p.y - 42);
      }
    }
  }
}
