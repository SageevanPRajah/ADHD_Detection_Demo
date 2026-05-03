import React from "react";
import { Eraser, XCircle, CheckCircle, ArrowRight } from "lucide-react";

/**
 * DrawingCanvas
 * Renders the <canvas> element and the three bottom action buttons
 * (Clear, Let's Practice, Good Job).
 */
export default function DrawingCanvas({
  canvasRef,
  startDrawing,
  draw,
  stopDrawing,
  breakLeft,
  hasDrawn,
  clearCanvas,
  handleWrong,
  handleCorrect,
  t
}) {
  return (
    <>
      <div className="rounded-2xl bg-white p-2">
        <canvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          onPointerLeave={stopDrawing}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          style={{ touchAction: 'none', userSelect: 'none' }}
          className={`block w-full rounded-xl bg-white ${breakLeft > 0 ? "opacity-70" : ""}`}
        />
      </div>

      {/* Bottom action buttons */}
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <button
          type="button"
          onClick={() => clearCanvas(true)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-800 px-4 py-3 text-sm font-bold text-white ring-1 ring-white/10 hover:bg-slate-700"
        >
          <Eraser className="h-5 w-5" /> {t("hw.clear")}
        </button>

        <button
          type="button"
          onClick={handleWrong}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-bold text-white hover:bg-rose-500"
        >
          <XCircle className="h-5 w-5" /> {t("hw.letsPractice")}
        </button>

        <button
          type="button"
          onClick={handleCorrect}
          disabled={!hasDrawn}
          className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-white transition ${
            hasDrawn
              ? "bg-emerald-600 hover:bg-emerald-500"
              : "cursor-not-allowed bg-emerald-900/40 text-emerald-200/50"
          }`}
          title={!hasDrawn ? t("hw.drawFirst") : t("hw.markCorrect")}
        >
          <CheckCircle className="h-5 w-5" /> {t("hw.goodJob")} <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-3 text-center text-[11px] text-slate-200">
        {t("hw.parentTaps")} <span className="font-semibold text-amber-100">{t("hw.goodJob")}</span> {t("hw.parentTapsEnd")}
      </div>
    </>
  );
}
