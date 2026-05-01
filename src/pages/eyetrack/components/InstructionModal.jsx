import React from 'react';
import { Play } from 'lucide-react';

export default function InstructionModal({ open, title, image, en, si, ta, onOk }) {
  if (!open) return null;

  return (
    <div className="modalOverlay" style={{ backdropFilter: 'blur(8px)', background: 'rgba(15, 26, 51, 0.85)' }}>
      <div className="modal card" style={{
        background: 'linear-gradient(145deg, #152447 0%, #0b132b 100%)',
        border: '1px solid rgba(37, 99, 235, 0.3)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        borderRadius: '24px',
        padding: '32px'
      }}>
        <h2 style={{ marginTop: 0, fontSize: '28px', color: '#fff', textAlign: 'center', marginBottom: '24px', fontWeight: 800 }}>
          {title}
        </h2>
        <div className="grid2" style={{ gap: '24px', alignItems: 'stretch' }}>

          {/* Left side: Image and Tip */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)', background: '#0b132b', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {image && <img src={image} alt="Instruction" style={{ width: '100%', objectFit: 'contain', maxHeight: '300px', display: 'block' }} />}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(11,19,43,0.8) 0%, transparent 40%)', pointerEvents: 'none' }} />
            </div>
            <div style={{
              background: 'rgba(37, 99, 235, 0.1)',
              borderLeft: '4px solid #2563eb',
              padding: '12px 16px',
              borderRadius: '0 12px 12px 0',
              fontSize: '14px',
              color: '#e2e8f0'
            }}>
              <span style={{ fontWeight: 700, color: '#60a5fa', marginRight: 8 }}>Tip:</span>
              Keep your face centered and avoid bright backlight during the game.
            </div>
          </div>

          {/* Right side: Instructions and Button */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div className="card" style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '16px',
              padding: '24px',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <div>
                <div className="pill" style={{ marginBottom: '8px', background: '#1d4ed8', border: '1px solid #2563eb', color: '#fff', fontWeight: 600 }}>English</div>
                <div style={{ fontSize: '15px', color: '#e2e8f0', lineHeight: 1.5 }}>{en}</div>
              </div>
              <div>
                <div className="pill" style={{ marginBottom: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>සිංහල</div>
                <div style={{ fontSize: '15px', color: '#cbd5e1', lineHeight: 1.5 }}>{si}</div>
              </div>
              <div>
                <div className="pill" style={{ marginBottom: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>தமிழ்</div>
                <div style={{ fontSize: '15px', color: '#cbd5e1', lineHeight: 1.5 }}>{ta}</div>
              </div>
            </div>

            <button
              className="btn primary"
              style={{
                width: '100%',
                marginTop: '20px',
                padding: '16px',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                border: 'none',
                boxShadow: '0 8px 16px rgba(37, 99, 235, 0.3)'
              }}
              onClick={onOk}
            >
              <Play size={20} fill="currentColor" /> Let's Play
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
