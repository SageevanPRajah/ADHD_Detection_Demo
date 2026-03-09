import React, { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  return (
    <h2 style={{
      margin: '0 0 16px 0',
      fontSize: '22px',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      paddingBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      color: '#fff',
      fontWeight: 800
    }}>
      {title}
    </h2>
  );
}

function makeLocalSessionId(participantId) {
  const safeId = (participantId || 'participant').trim().replace(/[^a-zA-Z0-9_-]+/g, '_') || 'participant';
  return `${safeId}_${Date.now()}`;
}

export default function ChildEyeGame() {
  const navigate = useNavigate();
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
        <div style={{ padding: 16, display: 'flex', justifyContent: 'center' }}>
          <div
            className="card"
            style={{
              maxWidth: 940,
              width: '100%',
              border: '1px solid rgba(30, 42, 70, 0.25)',
              background: 'linear-gradient(140deg, rgba(30,42,70,0.06), rgba(255,255,255,0.96))',
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: 8 }}>Consent & Setup</h2>
            <p style={{ opacity: 0.9, marginBottom: 14 }}>
              This research task uses the webcam to estimate gaze during the tasks.
              Please ensure guardian consent and child assent before starting.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  border: '1px solid rgba(30, 42, 70, 0.2)',
                  borderRadius: 12,
                  padding: 12,
                  background: 'rgba(255, 255, 255, 0.9)',
                }}
              >
                <div className="pill" style={{ marginBottom: 8 }}>English</div>
                <ul style={{ opacity: 0.92, margin: 0, paddingLeft: 18, lineHeight: 1.6, color: '#334155' }}>
                  <li>Good lighting (no bright backlight)</li>
                  <li>Face centered, ~50-70cm from camera</li>
                  <li>Try not to move chair during tasks</li>
                </ul>
              </div>

              <div
                style={{
                  border: '1px solid rgba(30, 42, 70, 0.2)',
                  borderRadius: 12,
                  padding: 12,
                  background: 'rgba(255, 255, 255, 0.9)',
                }}
              >
                <div className="pill" style={{ marginBottom: 8 }}>Sinhala</div>
                <ul style={{ opacity: 0.92, margin: 0, paddingLeft: 18, lineHeight: 1.6, color: '#334155' }}>
                  <li>හොඳ ආලෝකය තිබෙන්න (පිටුපසින් තද ආලෝකය නැතිව)</li>
                  <li>මුහුණ මැදින් තබාගෙන, කැමරාවෙන් සෙ.මී. 50-70 පමණ දුරින් ඉන්න</li>
                  <li>කාර්ය අතරතුර පුටුව අඩු ලෙස සෙලවීමට උත්සාහ කරන්න</li>
                </ul>
              </div>

              <div
                style={{
                  border: '1px solid rgba(30, 42, 70, 0.2)',
                  borderRadius: 12,
                  padding: 12,
                  background: 'rgba(255, 255, 255, 0.9)',
                }}
              >
                <div className="pill" style={{ marginBottom: 8 }}>Tamil</div>
                <ul style={{ opacity: 0.92, margin: 0, paddingLeft: 18, lineHeight: 1.6, color: '#334155' }}>
                  <li>நல்ல ஒளி இருக்க வேண்டும் (பின்புறம் அதிக ஒளி இருக்கக்கூடாது)</li>
                  <li>முகம் நடுப்பகுதியில் இருக்கவும், கேமராவிலிருந்து சுமார் 50-70 செ.மீ. தூரம் வைத்திருக்கவும்</li>
                  <li>பணிகள் நடக்கும் போது நாற்காலியை அதிகம் நகர்க்காமல் இருக்க முயற்சிக்கவும்</li>
                </ul>
              </div>
            </div>

            <button className="btn primary" onClick={() => setStep('calibration')}>
              I Understand
            </button>
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
        <div style={{ padding: 16, display: 'flex', justifyContent: 'center' }}>
          <div className="card result-shell" style={{ maxWidth: 980, width: '100%' }}>
            <div className="result-shell-head">
              <h2 style={{ marginTop: 0, marginBottom: 6, color: '#1e293b' }}>Finished</h2>
              <span className="pill" style={{ fontWeight: 800 }}>Session Complete</span>
            </div>
            <p style={{ opacity: 0.9, marginBottom: 14, color: '#334155' }}>
              Session data has been collected and sent to the backend for final model inference.
            </p>

            <div className="result-top-stats">
              <div className="result-top-stat">
                <span>Events</span>
                <strong>{eventsRef.current.length}</strong>
              </div>
              <div className="result-top-stat">
                <span>Gaze samples</span>
                <strong>{gazeRef.current.length}</strong>
              </div>
              <div className="result-top-stat">
                <span>Calibration samples</span>
                <strong>{calibrationRef.current.length}</strong>
              </div>
              {analysisState.runId && (
                <div className="result-top-stat">
                  <span>Run ID</span>
                  <strong>{analysisState.runId}</strong>
                </div>
              )}
            </div>

            {analysisState.status === 'running' && (
              <div className="result-processing-box">
                <div className="result-processing-title">Analyzing Session Data</div>
                <div style={{ opacity: 0.92 }}>
                  Backend is generating task features and running the trained model.
                </div>
              </div>
            )}

            {analysisState.status === 'success' && result && (
              <div>
                <div className="result-dashboard">
                  <div className="result-header">
                    <span style={{ fontSize: '24px' }}>📊</span> Assessment Results
                  </div>

                  <div className="result-metrics">
                    {/* Score Gauge Meter */}
                    <div className="score-gauge-wrapper">
                      <svg width="150" height="85" viewBox="0 0 150 85">
                        <path
                          d="M 10 80 A 65 65 0 0 1 140 80"
                          fill="none"
                          stroke="#1e2a46"
                          strokeWidth="14"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 10 80 A 65 65 0 0 1 140 80"
                          fill="none"
                          stroke={(() => {
                            const sc = result.score ?? 0;
                            if (sc < 4) return '#ef4444'; // Red
                            if (sc < 7) return '#eab308'; // Yellow
                            return '#2563eb'; // Blue
                          })()}
                          strokeWidth="14"
                          strokeLinecap="round"
                          strokeDasharray="204.2"
                          strokeDashoffset={204.2 * (1 - ((result.score ?? 0) / 10))}
                          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                        />
                      </svg>
                      <div className="score-gauge-value">
                        {result.score ?? '-'}/10
                      </div>
                      <div className="score-gauge-label">
                        SCORE
                      </div>
                    </div>

                    {/* Confidence Segments Bar */}
                    <div className="confidence-wrapper">
                      <div className="confidence-label">CONFIDENCE</div>
                      <div className="confidence-segments">
                        {Array.from({ length: 14 }).map((_, i) => {
                          const conf = typeof result.confidence === 'number' ? result.confidence : 0;
                          const activeSegments = Math.round(conf * 14);
                          const isActive = i < activeSegments;
                          return (
                            <div
                              key={i}
                              className="segment"
                              style={{
                                background: isActive ? '#2563eb' : '#1e2a46',
                                boxShadow: isActive ? '0 0 8px rgba(37, 99, 235, 0.4)' : 'none'
                              }}
                            />
                          );
                        })}
                      </div>
                      <div className="confidence-value">
                        {typeof result.confidence === 'number' ? `${(result.confidence * 100).toFixed(1)}%` : '-'}
                      </div>
                    </div>

                    {/* Info Pills */}
                    <div className="info-panel">
                      <div className="info-pill-item">
                        <span>Prediction</span>
                        <span style={{ color: result.prediction === 'ADHD' ? '#ef4444' : '#2563eb' }}>
                          {result.prediction || '-'}
                        </span>
                      </div>
                      <div className="info-pill-item">
                        <span>Severity</span>
                        <span style={{ color: '#eab308' }}>
                          {result.severity || '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {Array.isArray(result.warnings) && result.warnings.length > 0 && (
                    <div className="warnings-box">
                      <div className="warnings-title">
                        <span style={{ fontSize: '16px' }}>⚠️</span> System Warnings
                      </div>
                      <ul className="warnings-list">
                        {result.warnings.map((warning, idx) => (
                          <li key={`${warning}_${idx}`}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="row result-action-row" style={{ marginTop: 14, gap: 10, flexWrap: 'wrap' }}>
                  {runDownloadUrl && (
                    <a className="btn primary" href={runDownloadUrl} target="_blank" rel="noreferrer">
                      Download Run Artifacts
                    </a>
                  )}
                  <button className="btn ghost" onClick={startSessionFlow}>Start New Session</button>
                  <button className="btn ghost" onClick={() => navigate('/eyetrack/terms')} style={{ border: '1px solid #1e2a46' }}>Return to Landing</button>
                </div>

                <div className="result-footnote">
                  Summary feature columns generated: {analysisState.summaryFeatureColumns.length}
                </div>
              </div>
            )}

            {analysisState.status === 'error' && (
              <div className="result-error-box">
                <div className="result-error-title">Backend analysis failed</div>
                <div style={{ marginTop: 6, opacity: 0.9 }}>{analysisState.error}</div>
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
      <aside className="sidebar" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Header title="🎮 ADHD Eye Tasks" />

        <div className="card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ fontWeight: 800, marginBottom: 16, color: '#60a5fa', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Participant</div>
          <div className="row" style={{ marginBottom: 12 }}>
            <input
              placeholder="User_ID / Participant ID"
              value={meta.participantId}
              onChange={e => setMeta(m => ({ ...m, participantId: e.target.value }))}
              style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>
          <div className="row" style={{ marginBottom: 20 }}>
            <input
              type="number"
              min={3}
              max={18}
              placeholder="Child age"
              value={meta.age}
              onChange={e => setMeta(m => ({ ...m, age: Number(e.target.value) }))}
              style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>
          <div className="row" style={{ marginBottom: localSessionId ? 16 : 0 }}>
            <button
              className="btn primary"
              style={{
                flex: 1,
                padding: '14px',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                border: 'none',
                boxShadow: '0 8px 16px rgba(37,99,235,0.2)',
                borderRadius: '12px',
                fontSize: '15px'
              }}
              onClick={startSessionFlow}
              disabled={sessionStatus === 'collecting' || sessionStatus === 'analyzing'}
            >
              Start Session
            </button>
          </div>

          {/* Status Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: localSessionId ? 16 : 0, marginTop: 12 }}>
            <span className="pill" style={{
              background: sessionStatus === 'collecting' ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
              color: sessionStatus === 'collecting' ? '#4ade80' : '#94a3b8',
              border: sessionStatus === 'collecting' ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,255,255,0.1)'
            }}>{sessionStatus.toUpperCase()}</span>
          </div>

          {localSessionId && (
            <div style={{ fontSize: 12, opacity: .9, display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <span style={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Session ID</span>
              <span style={{ color: '#e2e8f0', fontFamily: 'monospace', wordBreak: 'break-all' }}>{localSessionId}</span>
            </div>
          )}
        </div>

        <div className="card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px' }}>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontWeight: 800, color: '#60a5fa', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Controls</div>
            <div className="pill" style={{ background: 'rgba(37,99,235,0.15)', color: '#93c5fd', border: '1px solid rgba(37,99,235,0.3)' }}>Step: {step}</div>
          </div>
          <div className="row" style={{ gap: '12px' }}>
            <button
              className="btn ghost"
              style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              onClick={() => setStep('calibration')}
              disabled={!canUseSessionControls}
            >
              Calibration
            </button>
            <button
              className="btn ghost"
              style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              onClick={() => gotoWithInstr('g1')}
              disabled={!canUseSessionControls}
            >
              Games
            </button>
          </div>

          <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label className="row" style={{ gap: 12, cursor: 'pointer', fontSize: '14px', color: eyeEnabled ? '#fff' : '#94a3b8', transition: 'color 0.2s' }}>
              <input type="checkbox" checked={eyeEnabled} onChange={e => setEyeEnabled(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#2563eb', cursor: 'pointer' }} />
              Eye tracking ON
            </label>
            <label className="row" style={{ gap: 12, cursor: 'pointer', fontSize: '14px', color: showEyePreview ? '#fff' : '#94a3b8', transition: 'color 0.2s' }}>
              <input type="checkbox" checked={showEyePreview} onChange={e => setShowEyePreview(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#2563eb', cursor: 'pointer' }} />
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
