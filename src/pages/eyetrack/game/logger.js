export function createLogger() {
  const events = [];
  let acc = 0;

  return {
    event(type, payload = {}) {
      events.push({ t: performance.now(), type, payload });
    },

    tick(dt, payload = {}) {
      acc += dt;
      if (acc >= 0.05) { // ~20Hz
        acc = 0;
        events.push({ t: performance.now(), type: "tick", payload });
      }
    },

    export() {
      return { events };
    },
  };
}
