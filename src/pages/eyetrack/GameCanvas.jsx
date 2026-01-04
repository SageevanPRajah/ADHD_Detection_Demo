import React, { useEffect, useRef } from "react";
import { createGame } from "./game/stateMachine";

export default function GameCanvas() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener("resize", resize);

    gameRef.current = createGame();

    let last = performance.now();
    const loop = (t) => {
      const dt = Math.min(0.033, (t - last) / 1000);
      last = t;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      gameRef.current.update(dt, w, h);
      gameRef.current.draw(ctx, w, h);

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    const onClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      gameRef.current.onClick(x, y);
    };

    canvas.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("click", onClick);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
