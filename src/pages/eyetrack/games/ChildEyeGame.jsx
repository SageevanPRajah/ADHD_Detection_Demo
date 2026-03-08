import React, { useCallback, useRef, useState } from 'react';
import EyeTrackerPanel from '../components/EyeTrackerPanel';
import InstructionModal from '../components/InstructionModal';
import Calibration from './Calibration';
import Game1BubbleButterfly from './Game1BubbleButterfly';
import Game2FruitCatching from './Game2FruitCatching';
import Game3AntiTreasure from './Game3AntiTreasure';
import Game4FixationStar from './Game4FixationStar';
import Game5PursuitShip from './Game5PursuitShip';
import { analyzeSession, downloadRunArtifactsUrl } from '../lib/api';

function Header({ title }) {
  return <h2 style={{ margin: '0 0 8px 0' }}>{title}</h2>;
}

function makeLocalSessionId(participantId) {
  const safeId = (participantId || 'participant').trim().replace(/[^a-zA-Z0-9_-]+/g, '_') || 'participant';
  return `${safeId}_${Date.now()}`;
}

export default function ChildEyeGame() {
  const [meta, setMeta] = useState({ participantId: 'UID001', age: 8, condition: 'Unsure' });
  const [localSessionId, setLocalSessionId] = useState('');
  const [sessionStatus, setSessionStatus] = useState('idle');
  const [eyeEnabled, setEyeEnabled] = useState(true);
  const [showEyePreview, setShowEyePreview] = useState(false);
  const [affine, setAffine] = useState(null);
  const [calibrationStatus, setCalibrationStatus] = useState('not_started');
  const [step, setStep] = useState('consent');
  const [showInstr, setShowInstr] = useState(false);
  const [pendingStep, setPendingStep] = useState('calibration');
  const [instr, setInstr] = useState({ title: '', image: '', en: '', si: '', ta: '' });
  const [analysisState, setAnalysisState] = useState({
    status: 'idle',
    error: '',
    result: null,
    runId: '',
    summaryFeatureColumns: [],
    generatedFeatureFiles: {},
  });

  const latestRaw = useRef({ valid: false });
  const isCollectingRef = useRef(false);
  const finalizingRef = useRef(false);
  const eventsRef = useRef([]);
  const gazeRef = useRef([]);
  const calibrationRef = useRef([]);

  const openInstr = useCallback((next, title, image, en, si, ta) => {
    setPendingStep(next);
    setInstr({ title, image, en, si, ta });
    setShowInstr(true);
  }, []);

  const resetBuffers = useCallback(() => {
    eventsRef.current = [];
    gazeRef.current = [];
    calibrationRef.current = [];
    latestRaw.current = { valid: false };
    finalizingRef.current = false;
  }, []);

  const sendEvent = useCallback((name, payload = {}) => {
    if (!isCollectingRef.current) return;
    eventsRef.current.push({
      t_ms: performance.now(),
      name,
      payload: payload ?? {},
    });
  }, []);

  const sendCalib = useCallback((sample) => {
    if (!isCollectingRef.current) return;
    calibrationRef.current.push({
      t_ms: performance.now(),
      ...sample,
    });
  }, []);

  const onGaze = useCallback((g) => {
    latestRaw.current = {
      xNorm: g.raw?.xNorm,
      yNorm: g.raw?.yNorm,
      valid: g.valid,
    };

    if (!isCollectingRef.current) return;

    gazeRef.current.push({
      t_ms: g.t_ms,
      x: g.x,
      y: g.y,
      valid: g.valid,
      raw: g.raw || {},
    });
  }, []);

  const finalize = useCallback(async () => {
    if (finalizingRef.current) return;
    finalizingRef.current = true;

    sendEvent('session_done', {
      total_events: eventsRef.current.length,
      total_gaze_samples: gazeRef.current.length,
      total_calibration_samples: calibrationRef.current.length,
    });

    isCollectingRef.current = false;
    setSessionStatus('analyzing');
    setAnalysisState({
      status: 'running',
      error: '',
      result: null,
      runId: '',
      summaryFeatureColumns: [],
      generatedFeatureFiles: {},
    });

    try {
      const response = await analyzeSession({
        sessionMeta: {
          ...meta,
          localSessionId,
        },
        events: eventsRef.current,
        gaze: gazeRef.current,
        calibration: calibrationRef.current,
      });

      setAnalysisState({
        status: 'success',
        error: '',
        result: response.result || null,
        runId: response.run_id || '',
        summaryFeatureColumns: response.summary_feature_columns || [],
        generatedFeatureFiles: response.generated_feature_files || {},
      });
      setSessionStatus('completed');
    } catch (error) {
      setAnalysisState({
        status: 'error',
        error: error?.message || String(error),
        result: null,
        runId: '',
        summaryFeatureColumns: [],
        generatedFeatureFiles: {},
      });
      setSessionStatus('failed');
    }
  }, [localSessionId, meta, sendEvent]);

  const startSessionFlow = async () => {
    if (!meta.participantId.trim()) {
      alert('Enter User_ID (Participant ID)');
      return;
    }

    if (!meta.age || meta.age < 3 || meta.age > 18) {
      alert('Enter age 3..18');
      return;
    }

    resetBuffers();
    setAffine(null);
    setCalibrationStatus('not_started');
    setAnalysisState({
      status: 'idle',
      error: '',
      result: null,
      runId: '',
      summaryFeatureColumns: [],
      generatedFeatureFiles: {},
    });

    const newLocalSessionId = makeLocalSessionId(meta.participantId);
    setLocalSessionId(newLocalSessionId);
    isCollectingRef.current = true;
    setSessionStatus('collecting');
    setStep('calibration');

    sendEvent('session_start', {
      ...meta,
      localSessionId: newLocalSessionId,
    });

    alert('Session started. Do calibration first, then complete all 5 games. The backend analysis will run automatically after Game 5.');
  };

  const gotoWithInstr = useCallback((next) => {
    if (next === 'g1') {
      openInstr('g1', 'Game 1 — Pop the bubbles', '/assets/plainSky.png', 'Pop bubbles to free butterflies. Click the bubble to release the butterfly. Play for 30 seconds.', 'බබල් එක මත ක්ලික් කර පපයන්න. බටර්ෆ්ලයි එක නිදහස් කරන්න. තත්පර 30ක් ක්‍රීඩා කරන්න.', 'குமிழிகளை கிளிக் செய்து பட்டாம்பூச்சிகளை விடுவிக்கவும். 30 விநாடிகள் விளையாடுங்கள்.');
      return;
    }
    if (next === 'g2') {
      openInstr('g2', 'Game 2 — Catch the red fruit', '/assets/fruits/redStrawberry.png', 'Click the red strawberry when it appears. You can click near the fruit (kid-friendly). 45 seconds.', 'රතු ස්ට්‍රෝබෙරි පෙනෙන විට ක්ලික් කරන්න. ගෙඩිය අසල ක්ලික් කළත් අල්ලාගන්න පුළුවන්. තත්පර 45ක්.', 'சிகப்பு ஸ்ட்ராபெர்ரி தோன்றும் போது கிளிக் செய்யுங்கள். பழத்தின் அருகே கிளிக் செய்தாலும் சரி. 45 விநாடிகள்.');
      return;
    }
    if (next === 'g3') {
      openInstr('g3', 'Game 3 — Catch treasure (don’t click alien)', '/assets/alien.png', 'When the alien appears on one side, the treasure appears on the opposite side. Click the treasure. If you click the alien, you lose that trial. 45 seconds.', 'එක පැත්තක එලියන් පෙනුනොත් අනෙක් පැත්තේ නිධානය පෙනේ. නිධානය ක්ලික් කරන්න. එලියන් ක්ලික් කලොත් වැරදියි. තත්පර 45ක්.', 'ஒரு பக்கத்தில் அயலன் வந்தால் எதிர்பக்கத்தில் புதையல் வரும். புதையலை கிளிக் செய்யுங்கள். அயலனை கிளிக் செய்தால் தவறு. 45 விநாடிகள்.');
      return;
    }
    if (next === 'g4') {
      openInstr('g4', 'Game 4 — Fixation (look at the star)', '/assets/star/star1.png', 'Keep your eyes on the star at the center. 20 seconds.', 'මැද තියෙන තාරකාවට නෙත් තබාගෙන ඉන්න. තත්පර 20ක්.', 'மையத்தில் இருக்கும் நட்சத்திரத்தை பார்த்துக்கொண்டிருக்கவும். 20 விநாடிகள்.');
      return;
    }
    if (next === 'g5') {
      openInstr('g5', 'Game 5 — Follow the spaceship', '/assets/spaceShip.png', 'Follow the moving spaceship with your eyes. 20 seconds.', 'ගමන් කරන නාවිකයාව නෙත් වලින් අනුගමනය කරන්න. තත්පර 20ක්.', 'நகரும் விண்கலத்தை கண்களால் பின்தொடருங்கள். 20 விநாடிகள்.');
      return;
    }

    setStep(next);
  }, [openInstr]);

  const onInstructionOk = useCallback(() => {
    setShowInstr(false);
    setStep(pendingStep);
    sendEvent('step_start', { step: pendingStep });
  }, [pendingStep, sendEvent]);

  const canUseSessionControls = sessionStatus === 'collecting';
  const runDownloadUrl = analysisState.runId ? downloadRunArtifactsUrl(analysisState.runId) : '';

  const renderStage = () => {
    if (step === 'consent') {
      return (
        <div style={{ padding: 16 }}>
          <div className="card" style={{ maxWidth: 860 }}>
            <h2 style={{ marginTop: 0 }}>Consent & Setup</h2>
            <p style={{ opacity: .9 }}>
              This research task uses the webcam to estimate gaze during the tasks.
              Please ensure guardian consent and child assent before starting.
            </p>
            <ul style={{ opacity: .9 }}>
              <li>Good lighting (no bright backlight)</li>
              <li>Face centered, ~50–70cm from camera</li>
              <li>Try not to move chair during tasks</li>
            </ul>
            <button className="btn primary" onClick={() => setStep('calibration')}>I Understand</button>
          </div>
        </div>
      );
    }

    if (step === 'calibration') {
      return (
        <div style={{ height: '100%', position: 'relative' }}>
          <Calibration
            onEvent={(n, p) => sendEvent(n, p)}
            onCalibSample={sendCalib}
            getLatestGaze={() => latestRaw.current}
            onModel={(m) => {
              setAffine(m);
              setCalibrationStatus(m ? 'ready' : 'failed');
              sendEvent('calib_model', { ok: !!m });
            }}
          />
          <div className="card" style={{ position: 'absolute', bottom: 16, left: 16, maxWidth: 720 }}>
            <div style={{ fontWeight: 800 }}>Next</div>
            <div style={{ opacity: .85, marginTop: 6 }}>
              Try <b>9-point calibration</b> first. If it fails, you can still continue to gameplay.
            </div>
            <div style={{ marginTop: 10, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <button className="btn secondary" onClick={() => gotoWithInstr('g1')} disabled={!canUseSessionControls}>Start Game 1</button>
              <button
                className="btn ghost"
                onClick={() => {
                  setCalibrationStatus('skipped');
                  sendEvent('calib_skipped', { reason: 'user_continue_without_calibration' });
                  gotoWithInstr('g1');
                }}
                disabled={!canUseSessionControls}
              >
                Continue Without Calibration
              </button>
              <span className="pill">Calibration model: {affine ? 'ready' : 'not ready'}</span>
              <span className="pill">Status: {calibrationStatus.replace('_', ' ')}</span>
            </div>
          </div>
        </div>
      );
    }

    if (step === 'g1') return <Game1BubbleButterfly durationMs={30000} onEvent={sendEvent} onDone={() => gotoWithInstr('g2')} />;
    if (step === 'g2') return <Game2FruitCatching durationMs={45000} onEvent={sendEvent} onDone={() => gotoWithInstr('g3')} />;
    if (step === 'g3') return <Game3AntiTreasure durationMs={45000} onEvent={sendEvent} onDone={() => gotoWithInstr('g4')} />;
    if (step === 'g4') return <Game4FixationStar durationMs={20000} onEvent={sendEvent} onDone={() => gotoWithInstr('g5')} />;
    if (step === 'g5') {
      return (
        <Game5PursuitShip
          durationMs={20000}
          onEvent={sendEvent}
          onDone={async () => {
            setStep('finish');
            await finalize();
          }}
        />
      );
    }

    if (step === 'finish') {
      const result = analysisState.result;
      return (
        <div style={{ padding: 16 }}>
          <div className="card" style={{ maxWidth: 820 }}>
            <h2 style={{ marginTop: 0 }}>Finished ✅</h2>
            <p style={{ opacity: .9 }}>
              Session data has been collected and sent to the backend for final model inference.
            </p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
              <span className="pill">Events: {eventsRef.current.length}</span>
              <span className="pill">Gaze samples: {gazeRef.current.length}</span>
              <span className="pill">Calibration samples: {calibrationRef.current.length}</span>
              {analysisState.runId && <span className="pill">Run: {analysisState.runId}</span>}
            </div>

            {analysisState.status === 'running' && (
              <div style={{ opacity: .9 }}>
                Backend is generating task features and running the trained model...
              </div>
            )}

            {analysisState.status === 'success' && result && (
              <div>
                <div className="card" style={{ marginTop: 12, background: 'rgba(255,255,255,0.03)' }}>
                  <div style={{ fontWeight: 800, marginBottom: 8 }}>Model Result</div>
                  <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
                    <span className="pill">Prediction: {result.prediction}</span>
                    <span className="pill">Confidence: {typeof result.confidence === 'number' ? `${(result.confidence * 100).toFixed(1)}%` : '-'}</span>
                    <span className="pill">Score: {result.score ?? '-'}/10</span>
                    <span className="pill">Severity: {result.severity || '-'}</span>
                  </div>

                  {Array.isArray(result.warnings) && result.warnings.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>Warnings</div>
                      <ul style={{ margin: 0, paddingLeft: 18, opacity: .9 }}>
                        {result.warnings.map((warning, idx) => (
                          <li key={`${warning}_${idx}`}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="row" style={{ marginTop: 14, gap: 10, flexWrap: 'wrap' }}>
                  {runDownloadUrl && (
                    <a className="btn primary" href={runDownloadUrl} target="_blank" rel="noreferrer">
                      Download Run Artifacts
                    </a>
                  )}
                  <button className="btn ghost" onClick={startSessionFlow}>Start New Session</button>
                </div>

                <div style={{ marginTop: 10, fontSize: 12, opacity: .85 }}>
                  Summary feature columns generated: {analysisState.summaryFeatureColumns.length}
                </div>
              </div>
            )}

            {analysisState.status === 'error' && (
              <div>
                <div style={{ color: '#fca5a5', fontWeight: 700, marginTop: 10 }}>Backend analysis failed</div>
                <div style={{ marginTop: 6, opacity: .9 }}>{analysisState.error}</div>
                <div className="row" style={{ marginTop: 14, gap: 10, flexWrap: 'wrap' }}>
                  <button className="btn ghost" onClick={startSessionFlow}>Try Again</button>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="page">
      <aside className="sidebar">
        <Header title="🎮 ADHD Eye Tasks" />

        <div className="card">
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Participant</div>
          <div className="row" style={{ marginBottom: 10 }}>
            <input
              placeholder="User_ID / Participant ID"
              value={meta.participantId}
              onChange={e => setMeta(m => ({ ...m, participantId: e.target.value }))}
            />
          </div>
          <div className="row" style={{ marginBottom: 10 }}>
            <input
              type="number"
              min={3}
              max={18}
              placeholder="Child age"
              value={meta.age}
              onChange={e => setMeta(m => ({ ...m, age: Number(e.target.value) }))}
            />
          </div>
          <div className="row">
            <button
              className="btn primary"
              onClick={startSessionFlow}
              disabled={sessionStatus === 'collecting' || sessionStatus === 'analyzing'}
            >
              Start Session
            </button>
            <span className="pill">{sessionStatus}</span>
          </div>
          {localSessionId && (
            <div style={{ marginTop: 8, fontSize: 12, opacity: .85 }}>
              Local session: <span className="pill">{localSessionId}</span>
            </div>
          )}
        </div>

        <div className="card" style={{ marginTop: 10 }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div><strong>Controls</strong></div>
            <div className="pill">Step: {step}</div>
          </div>
          <div className="row" style={{ marginTop: 10 }}>
            <button className="btn ghost" onClick={() => setStep('calibration')} disabled={!canUseSessionControls}>Calibration</button>
            <button className="btn ghost" onClick={() => gotoWithInstr('g1')} disabled={!canUseSessionControls}>Games</button>
          </div>
          <div className="row" style={{ marginTop: 10 }}>
            <label className="row" style={{ gap: 8 }}>
              <input type="checkbox" checked={eyeEnabled} onChange={e => setEyeEnabled(e.target.checked)} />
              Eye tracking ON
            </label>
          </div>
          <div className="row" style={{ marginTop: 8 }}>
            <label className="row" style={{ gap: 8 }}>
              <input type="checkbox" checked={showEyePreview} onChange={e => setShowEyePreview(e.target.checked)} />
              Show preview
            </label>
          </div>
        </div>

        

        <div style={{ marginTop: 10 }}>
          {eyeEnabled && (
            <EyeTrackerPanel
              enabled={eyeEnabled}
              showPreview={showEyePreview && (import.meta.env.VITE_ENABLE_EYE_PANEL === 'true')}
              affine={affine}
              onGaze={onGaze}
            />
          )}
        </div>

        <div className="card" style={{ marginTop: 10, fontSize: 12, opacity: .85 }}>
          All rights reserved by SLIIT RP. Your datas will be save with us.
        </div>
      </aside>

      <main className="stageWrap">
        {renderStage()}
      </main>

      <InstructionModal
        open={showInstr}
        title={instr.title}
        image={instr.image}
        en={instr.en}
        si={instr.si}
        ta={instr.ta}
        onOk={onInstructionOk}
      />
    </div>
  );
}
