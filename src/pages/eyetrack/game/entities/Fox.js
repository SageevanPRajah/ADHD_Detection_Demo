export class Fox {
  constructor() {
    this.x = 80;
    this.y = 80;
    this.v = 140; // px/s
    this.dir = 1;
    this.isFrozen = false;
  }

  freeze(on) { this.isFrozen = on; }

  update(dt, w, h) {
    if (this.isFrozen) return;
    const minX = 60, maxX = w - 60;
    this.x += this.dir * this.v * dt;
    if (this.x < minX) { this.x = minX; this.dir = 1; }
    if (this.x > maxX) { this.x = maxX; this.dir = -1; }
    this.y = 90;
  }

  draw(ctx, { state, trialType } = {}) {
  let emoji = "🦊";

  // During FOX_FREEZE on anti trials, show a brief "twitch" cue
  // (you can later replace this with an animation frame)
  if (state === "FOX_FREEZE" && trialType === "anti") {
    // pulse between 🦊 and 😈 quickly using time
    const t = performance.now();
    emoji = (Math.floor(t / 120) % 2 === 0) ? "🦊" : "😈";
  }

  ctx.font = "52px serif";
  ctx.textAlign = "center";
  ctx.fillText(emoji, this.x, this.y);
}


  snapshot() {
    return { x: Math.round(this.x), y: Math.round(this.y), frozen: this.isFrozen };
  }
}
