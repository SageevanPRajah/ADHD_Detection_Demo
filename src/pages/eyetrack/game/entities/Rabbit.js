export class Rabbit {
  constructor() {
    this.visible = false;
    this.x = 0;
    this.y = 0;
    this.r = 34;
  }

  spawnAt(p) {
    this.visible = true;
    this.x = p.x;
    this.y = p.y - 14;
  }

  hide() { this.visible = false; }

  update() {}

  draw(ctx) {
    if (!this.visible) return;
    ctx.font = "52px serif";
    ctx.textAlign = "center";
    ctx.fillText("🐇", this.x, this.y);
  }

  hitTest(x, y) {
    if (!this.visible) return false;
    const dx = x - this.x, dy = y - this.y;
    return (dx * dx + dy * dy) <= (this.r * this.r);
  }

  snapshot() {
    return this.visible ? { visible: 1, x: Math.round(this.x), y: Math.round(this.y) } : { visible: 0 };
  }
}
