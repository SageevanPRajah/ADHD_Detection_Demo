import { Fox } from "./entities/Fox";
import { Rabbit } from "./entities/Rabbit";
import { Holes } from "./entities/Holes";
import { createLogger } from "./logger";

const STATE = {
  FOX_PATROL: "FOX_PATROL",          // smooth pursuit window
  RING_ORANGE: "RING_ORANGE",        // fixation window
  FOX_FREEZE: "FOX_FREEZE",          // fox "pre-launch" + cue
  RABBIT_ON: "RABBIT_ON",            // rabbit visible: pro/anti response window
};

// ✅ Background image (must be in /public)
const bgImage = new Image();
bgImage.src = "/background.jpg";

// Draw background in "cover" mode (no stretch, fills screen)
function drawImageCover(ctx, img, x, y, w, h) {
  if (!img || !img.naturalWidth || !img.naturalHeight) return false;

  const iw = img.naturalWidth;
  const ih = img.naturalHeight;

  const scale = Math.max(w / iw, h / ih);
  const sw = w / scale;
  const sh = h / scale;

  const sx = (iw - sw) / 2;
  const sy = (ih - sh) / 2;

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  return true;
}

export function createGame() {
  const fox = new Fox();
  const rabbit = new Rabbit();
  const holes = new Holes();
  const log = createLogger();

  let state = STATE.FOX_PATROL;
  let timer = 0;

  // trial variables
  let cueHole = 0;          // where orange ring shows
  let targetHole = 0;       // where rabbit actually appears
  let trialType = "pro";    // "pro" | "anti"
  let tRabbitOn = null;

  // knobs (tune later)
  const PROB_ANTI = 0.35;   // 35% anti trials
  const PATROL_SEC = 2.5;
  const ORANGE_SEC = 0.8;
  const FREEZE_SEC = 0.6;
  const RABBIT_TIMEOUT_SEC = 1.2;

  function setState(next) {
    state = next;
    timer = 0;
    log.event("state", { state: next });
  }

  function oppositeHoleIndex(i) {
    // works best when holes.count is odd (we use 7)
    return holes.count - 1 - i;
  }

  function pickCueHole(w) {
    // Choose a cue hole near fox OR far from fox
    const foxSideLeft = fox.x < w / 2;

    const leftIndices = [0, 1, 2];
    const rightIndices = [holes.count - 1, holes.count - 2, holes.count - 3];

    const nearList = foxSideLeft ? leftIndices : rightIndices;
    const farList = foxSideLeft ? rightIndices : leftIndices;

    // 60% cue near fox, 40% far
    const list = Math.random() < 0.6 ? nearList : farList;
    cueHole = list[Math.floor(Math.random() * list.length)];

    log.event("cue_pick", { cueHole, near_fox: list === nearList ? 1 : 0 });
  }

  function decideTrial() {
    trialType = Math.random() < PROB_ANTI ? "anti" : "pro";

    if (trialType === "anti") targetHole = oppositeHoleIndex(cueHole);
    else targetHole = cueHole;

    log.event("trial_plan", { trialType, cueHole, targetHole });
  }

  function isCueNearFox(w) {
    const cuePos = holes.pos(cueHole);
    return Math.abs(cuePos.x - fox.x) < w * 0.22;
  }

  return {
    update(dt, w, h) {
      timer += dt;

      holes.layout(w, h);

      if (state === STATE.FOX_PATROL) {
        fox.freeze(false);
        fox.update(dt, w, h);

        if (timer > PATROL_SEC) {
          pickCueHole(w);
          setState(STATE.RING_ORANGE);
        }
      }

      if (state === STATE.RING_ORANGE) {
        fox.freeze(true);
        if (timer > ORANGE_SEC) {
          decideTrial();
          setState(STATE.FOX_FREEZE);
        }
      }

      if (state === STATE.FOX_FREEZE) {
        fox.freeze(true);

        if (timer < 0.05) {
          const near = isCueNearFox(w) ? 1 : 0;
          log.event("fox_freeze_start", { cueHole, near_fox: near });

          if (trialType === "anti") {
            log.event("antisaccade_cue", { cueHole, msg: "fox_trick" });
          }
        }

        if (timer > FREEZE_SEC) {
          rabbit.spawnAt(holes.pos(targetHole));
          tRabbitOn = performance.now();
          log.event("rabbit_on", { trialType, cueHole, targetHole });
          setState(STATE.RABBIT_ON);
        }
      }

      if (state === STATE.RABBIT_ON) {
        fox.freeze(true);
        rabbit.update(dt);

        if (timer > RABBIT_TIMEOUT_SEC) {
          log.event("trial_end", { trialType, cueHole, targetHole, reason: "timeout" });
          rabbit.hide();
          setState(STATE.FOX_PATROL);
        }
      }

      log.tick(dt, {
        state,
        trialType,
        cueHole,
        targetHole,
        fox: fox.snapshot(),
        rabbit: rabbit.snapshot(),
      });
    },

    draw(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);

      // ✅ background (free-viewing)
      const ok = drawImageCover(ctx, bgImage, 0, 0, w, h);
      if (!ok) {
        ctx.fillStyle = "#0b132b";
        ctx.fillRect(0, 0, w, h);
      }

      // ✅ optional dark overlay for readability
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(0, 0, w, h);

      holes.draw(ctx, { cueHole, targetHole, state, trialType });

      fox.draw(ctx, { state, trialType });
      rabbit.draw(ctx);

      // tiny HUD (debug)
      ctx.fillStyle = "#e5e7eb";
      ctx.font = "14px system-ui";
      ctx.fillText(`State: ${state}`, 12, 20);
      ctx.fillText(`Trial: ${trialType}  cue:${cueHole}  target:${targetHole}`, 12, 40);
    },

    onClick(x, y) {
      if (state !== STATE.RABBIT_ON) return;

      const hit = rabbit.hitTest(x, y);
      const rt = tRabbitOn ? Math.round(performance.now() - tRabbitOn) : "";

      log.event("click", { x, y, hit: hit ? 1 : 0, rt_ms: rt });

      if (hit) {
        log.event("trial_end", { trialType, cueHole, targetHole, reason: "hit", rt_ms: rt });
        rabbit.hide();
        setState(STATE.FOX_PATROL);
      } else {
        log.event("miss", { trialType, cueHole, targetHole });
      }
    },

    exportLogs() {
      return log.export();
    },
  };
}
