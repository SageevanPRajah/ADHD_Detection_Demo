import { useEffect, useRef, useState } from "react";

/**
 * useHandwritingCanvas
 *
 *
 *
 * @param {object} params
 * @param {boolean} params.gameStarted
 * @param {boolean} params.showResultScreen
 * @param {number}  params.currentIndex
 * @param {number}  params.penSize
 * @param {number}  params.breakLeft
 * @param {object|null} params.currentActivity
 */
export function useHandwritingCanvas({
  gameStarted,
  showResultScreen,
  currentIndex,
  penSize,
  breakLeft,
  currentActivity
}) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const strokeDataRef = useRef([]);
  const pointerIdRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  /* ---- guide watermark ---- */
  const drawGuide = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx || !currentActivity) return;
    try {
      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.fillStyle = '#000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const fontSize = Math.max(48, Math.min(120, canvas.width / (6 * (window.devicePixelRatio || 1))));
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillText(
        currentActivity.content,
        canvas.width / (2 * (window.devicePixelRatio || 1)),
        canvas.height / (2 * (window.devicePixelRatio || 1))
      );
      ctx.restore();
    } catch (e) {
      // ignore drawing guide errors
    }
  };

  /* ---- clear canvas ---- */
  const clearCanvas = (keepGuide = false) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokeDataRef.current = [];
    setHasDrawn(false);

    if (keepGuide) drawGuide();
  };

  /* ---- pointer position helper ---- */
  const getEventPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const ev = e.nativeEvent || e;
    const touch =
      (ev.touches && ev.touches[0]) ||
      (ev.changedTouches && ev.changedTouches[0]) ||
      ev;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  };

  /* ---- drawing handlers ---- */
  const startDrawing = (e) => {
    if (breakLeft > 0) return;
    e.preventDefault();

    const ctx = ctxRef.current;
    if (!ctx) return;

    const pos = getEventPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, Math.max(1, penSize / 2), 0, Math.PI * 2);
    ctx.fill();

    strokeDataRef.current.push({
      type: "start",
      x: pos.x,
      y: pos.y,
      timestamp: Date.now()
    });

    setIsDrawing(true);
    setHasDrawn(true);
    const ev = e.nativeEvent || e;
    if (ev.pointerId && canvasRef.current && canvasRef.current.setPointerCapture) {
      pointerIdRef.current = ev.pointerId;
      try { canvasRef.current.setPointerCapture(ev.pointerId); } catch (err) { /* ignore */ }
    }
  };

  const draw = (e) => {
    if (!isDrawing || breakLeft > 0) return;
    e.preventDefault && e.preventDefault();

    const ctx = ctxRef.current;
    if (!ctx) return;

    const pos = getEventPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    strokeDataRef.current.push({
      type: "move",
      x: pos.x,
      y: pos.y,
      timestamp: Date.now()
    });
  };

  const stopDrawing = () => {
    const id = pointerIdRef.current;
    if (id && canvasRef.current && canvasRef.current.releasePointerCapture) {
      try { canvasRef.current.releasePointerCapture(id); } catch (err) { /* ignore */ }
      pointerIdRef.current = null;
    }
    setIsDrawing(false);
  };

  /* ---- resize observer & canvas init ---- */
  useEffect(() => {
    if (!gameStarted || showResultScreen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.style.width = '100%';
      const displayWidth = canvas.offsetWidth || 600;
      const displayHeight = 300;
      const ratio = window.devicePixelRatio || 1;
      canvas.width = displayWidth * ratio;
      canvas.height = displayHeight * ratio;
      canvas.style.height = `${displayHeight}px`;
      const ctx = canvas.getContext('2d');
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = penSize;
      ctxRef.current = ctx;
      clearCanvas(true);
      drawGuide();
    };

    resizeCanvas();
    const ro = new ResizeObserver(resizeCanvas);
    ro.observe(canvas);
    window.addEventListener('orientationchange', resizeCanvas);
    return () => {
      ro.disconnect();
      window.removeEventListener('orientationchange', resizeCanvas);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted, showResultScreen, currentIndex]);

  /* ---- pointer / touch event listeners ---- */
  useEffect(() => {
    if (!gameStarted || showResultScreen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onDown = (ev) => startDrawing(ev);
    const onMove = (ev) => draw(ev);
    const onUp = (ev) => stopDrawing(ev);

    canvas.addEventListener('pointerdown', onDown, { passive: false });
    canvas.addEventListener('pointermove', onMove, { passive: false });
    canvas.addEventListener('pointerup', onUp, { passive: false });
    canvas.addEventListener('pointercancel', onUp, { passive: false });
    canvas.addEventListener('pointerleave', onUp, { passive: false });

    canvas.addEventListener('touchstart', onDown, { passive: false });
    canvas.addEventListener('touchmove', onMove, { passive: false });
    canvas.addEventListener('touchend', onUp, { passive: false });

    return () => {
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('pointerleave', onUp);

      canvas.removeEventListener('touchstart', onDown);
      canvas.removeEventListener('touchmove', onMove);
      canvas.removeEventListener('touchend', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted, showResultScreen]);

  /* ---- pen size sync ---- */
  useEffect(() => {
    if (ctxRef.current) ctxRef.current.lineWidth = penSize;
  }, [penSize]);

  return {
    canvasRef,
    strokeDataRef,
    hasDrawn,
    setHasDrawn,
    clearCanvas,
    startDrawing,
    draw,
    stopDrawing
  };
}
