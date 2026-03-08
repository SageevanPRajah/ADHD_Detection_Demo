import React from 'react';

const AnalysisResults = ({ result, onReset }) => {
  const { analysis, features, transcription, recommendations } = result;

  const getProbabilityColor = (probability) => {
    if (probability < 0.3) return { bg: 'bg-success-500', text: 'text-success-700', bgLight: 'bg-success-50' };
    if (probability < 0.7) return { bg: 'bg-warning-500', text: 'text-warning-700', bgLight: 'bg-warning-50' };
    return { bg: 'bg-danger-500', text: 'text-danger-700', bgLight: 'bg-danger-50' };
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence.toLowerCase()) {
      case 'high': return 'text-success-600';
      case 'medium': return 'text-warning-600';
      case 'low': return 'text-danger-600';
      default: return 'text-neutral-600';
    }
  };

  const probabilityColors = getProbabilityColor(analysis.probability);

  const downloadReport = () => {
    const date = new Date().toLocaleString();
    const riskStatus = analysis.probability < 0.3 ? 'Low Risk' : analysis.probability < 0.7 ? 'Medium Risk' : 'High Risk';
    const riskColor = analysis.probability < 0.3 ? '#10b981' : analysis.probability < 0.7 ? '#f59e0b' : '#ef4444';

    const reportHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>ADHD Speech Analysis Report - ${new Date().toISOString().split('T')[0]}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            color: #1f2937;
            line-height: 1.5;
            margin: 0;
            padding: 40px;
            background: #f9fafb;
          }
          
          .report-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 60px;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 30px;
            margin-bottom: 40px;
          }
          
          .logo-area h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 800;
            color: #1e3a8a;
            letter-spacing: -0.025em;
          }
          
          .logo-area p {
            margin: 4px 0 0;
            color: #6b7280;
            font-size: 14px;
            font-weight: 500;
          }
          
          .report-meta {
            text-align: right;
            font-size: 13px;
            color: #6b7280;
          }
          
          .section-title {
            font-size: 14px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #374151;
            margin: 40px 0 20px;
            padding-bottom: 8px;
            border-bottom: 1px solid #f3f4f6;
          }
          
          .summary-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 30px;
            margin-bottom: 40px;
          }
          
          .risk-badge {
            display: inline-block;
            padding: 12px 24px;
            border-radius: 12px;
            font-weight: 800;
            font-size: 18px;
            color: white;
            background: ${riskColor};
            margin-bottom: 10px;
          }
          
          .probability-score {
            font-size: 48px;
            font-weight: 800;
            color: #111827;
            margin: 10px 0;
          }
          
          .feature-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          
          .feature-table th {
            text-align: left;
            font-size: 12px;
            font-weight: 700;
            color: #6b7280;
            text-transform: uppercase;
            padding: 12px 16px;
            background: #f9fafb;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .feature-table td {
            padding: 16px;
            border-bottom: 1px solid #f3f4f6;
            font-size: 14px;
          }
          
          .feature-name {
            font-weight: 700;
            color: #111827;
          }
          
          .feature-desc {
            font-size: 12px;
            color: #6b7280;
            margin-top: 2px;
          }
          
          .feature-val {
            font-family: monospace;
            font-weight: 700;
            color: #1e40af;
            font-size: 16px;
          }
          
          .recommendation-box {
            background: #f0f4ff;
            border-left: 4px solid #1e40af;
            padding: 24px;
            border-radius: 0 12px 12px 0;
            margin-bottom: 40px;
          }
          
          .recommendation-box h4 {
            margin: 0 0 10px;
            color: #1e3a8a;
            font-size: 18px;
          }
          
          .disclaimer {
            font-size: 12px;
            color: #9ca3af;
            text-align: center;
            margin-top: 60px;
            padding-top: 30px;
            border-top: 1px solid #f3f4f6;
            line-height: 1.6;
          }
          
          @media print {
            body { background: white; padding: 0; }
            .report-container { box-shadow: none; max-width: 100%; padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="report-container">
          <div class="header">
            <div class="logo-area">
              <h1>ADHD SPEECH DETECTION SYSTEM</h1>
              <p>AI-Powered Clinical Screening Report</p>
            </div>
            <div class="report-meta">
              <p><strong>Report ID:</strong> SR-${Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              <p><strong>Date:</strong> ${date}</p>
            </div>
          </div>

          <div class="summary-grid">
            <div>
              <div class="section-title">Analysis Summary</div>
              <div class="risk-badge">${riskStatus}</div>
              <p style="margin: 0; color: #4b5563; font-weight: 600;">Classification: ${analysis.classification}</p>
              <p style="margin: 5px 0 0; color: #6b7280; font-size: 14px;">Confidence Level: <strong>${analysis.confidence}</strong></p>
            </div>
            <div style="text-align: right;">
              <div class="section-title">Probability</div>
              <div class="probability-score">${(analysis.probability * 100).toFixed(1)}%</div>
            </div>
          </div>

          <div class="section-title">Acoustic Feature Analysis</div>
          <table class="feature-table">
            <thead>
              <tr>
                <th>Feature Metric</th>
                <th>Measured Value</th>
                <th>Standard Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span class="feature-name">Mean Pitch</span></td>
                <td><span class="feature-val">${features.pitch_mean.toFixed(2)} Hz</span></td>
                <td>Fundamental frequency of the vocal fold vibration during speech.</td>
              </tr>
              <tr>
                <td><span class="feature-name">Jitter (Local)</span></td>
                <td><span class="feature-val">${features.jitter.toFixed(4)}</span></td>
                <td>Cycle-to-cycle variations in fundamental frequency, indicating voice stability.</td>
              </tr>
              <tr>
                <td><span class="feature-name">Shimmer (Local)</span></td>
                <td><span class="feature-val">${features.shimmer.toFixed(4)}</span></td>
                <td>Examines amplitude variability, related to perceived breathiness or tension.</td>
              </tr>
            </tbody>
          </table>

          <div class="section-title">Linguistic Performance</div>
          <table class="feature-table">
            <thead>
              <tr>
                <th>Linguistic Proxy</th>
                <th>Measured Value</th>
                <th>Standard Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span class="feature-name">Lexical Diversity</span></td>
                <td><span class="feature-val">${(features.lexical_diversity * 100).toFixed(1)}%</span></td>
                <td>Ratio of unique words used, indicating vocabulary richness.</td>
              </tr>
              <tr>
                <td><span class="feature-name">Linguistic Coherence</span></td>
                <td><span class="feature-val">${(features.coherence * 100).toFixed(1)}%</span></td>
                <td>Measures logical flow and structural organization of the story provided.</td>
              </tr>
              <tr>
                <td><span class="feature-name">Speech Fluency</span></td>
                <td><span class="feature-val">${features.fillers} Fillers</span></td>
                <td>Frequency of disfluencies (um, uh, pauses) during the reading task.</td>
              </tr>
            </tbody>
          </table>

          ${recommendations ? `
            <div class="section-title">Clinical Recommendations</div>
            <div class="recommendation-box">
              <h4>${recommendations.warning || recommendations.message}</h4>
              <p style="margin-bottom: 10px;">${recommendations.note || ''}</p>
              <p style="font-weight: 700; color: #1e3a8a;">${recommendations.advice || ''}</p>
            </div>
          ` : ''}

          <div class="disclaimer">
            <strong>IMPORTANT MEDICAL DISCLAIMER:</strong><br>
            This automated screening report is intended for preliminary evaluation only and DOES NOT constitute a medical diagnosis. 
            The results are generated by advanced machine learning models and should be interpreted by qualified healthcare professionals 
            as part of a broader clinical assessment. Early detection is key to effective intervention.
          </div>
        </div>

        <div class="no-print" style="position: fixed; bottom: 20px; right: 20px;">
          <button onclick="window.print()" style="background: #1e40af; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            Print / Save as PDF
          </button>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (!win) {
      alert('Please allow popups to view the report');
    }
  };

  return (
    <div className="space-y-12 animate-fade-in-up">
      {/* Header */}
      <div className="text-center relative">
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 drop-shadow-md">
          Analysis Complete
        </h2>
        <p className="text-xl text-white/80 font-medium">
          Here are your comprehensive speech analysis results
        </p>
      </div>

      {/* Main Probability Display */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] p-8 lg:p-12 text-center transform hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
        {/* Glow behind the circle */}
        <div className={`absolute top-12 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-[60px] opacity-40 ${analysis.probability < 0.3 ? 'bg-green-500' :
          analysis.probability < 0.7 ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>

        <div className={`relative inline-flex items-center justify-center w-40 h-40 rounded-full mb-8 border-4 shadow-[0_0_30px_rgba(0,0,0,0.2)_inset] ${analysis.probability < 0.3 ? 'border-green-400 bg-green-500/20' :
          analysis.probability < 0.7 ? 'border-yellow-400 bg-yellow-500/20' : 'border-red-400 bg-red-500/20'
          }`}>
          <div className="absolute inset-2 rounded-full border border-white/30 border-dashed animate-[spin_10s_linear_infinite]"></div>
          <div className="text-center text-white z-10">
            <div className="text-5xl font-black drop-shadow-lg">
              {(analysis.probability * 100).toFixed(0)}%
            </div>
            <div className="text-sm font-semibold tracking-wide uppercase text-white/90 mt-1">Probability</div>
          </div>
        </div>

        <h3 className="text-3xl font-bold text-white mb-4 drop-shadow-md">
          {analysis.classification}
        </h3>

        <div className={`inline-flex items-center px-6 py-3 rounded-full text-base font-bold shadow-lg mb-8 border ${analysis.probability < 0.3 ? 'bg-green-500/20 border-green-400/50 text-green-300' :
          analysis.probability < 0.7 ? 'bg-yellow-500/20 border-yellow-400/50 text-yellow-300' : 'bg-red-500/20 border-red-400/50 text-red-300'
          }`}>
          <span className={`inline-block w-3 h-3 rounded-full mr-3 animate-pulse shadow-[0_0_10px_currentColor] ${analysis.probability < 0.3 ? 'bg-green-400' :
            analysis.probability < 0.7 ? 'bg-yellow-400' : 'bg-red-400'
            }`}></span>
          {analysis.confidence} Confidence
        </div>

        {/* Progress Bar */}
        <div className="max-w-xl mx-auto mb-4 bg-black/20 p-6 rounded-3xl border border-white/5">
          <div className="w-full bg-white/10 rounded-full h-4 mb-3 border border-white/10 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-1000 relative overflow-hidden ${analysis.probability < 0.3 ? 'bg-gradient-to-r from-green-600 to-green-400' :
                analysis.probability < 0.7 ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' : 'bg-gradient-to-r from-red-600 to-red-400'
                }`}
              style={{ width: `${Math.max(5, analysis.probability * 100)}%` }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] animate-[slide_1s_linear_infinite]"></div>
            </div>
          </div>
          <div className="flex justify-between text-sm font-bold text-white/60 uppercase tracking-wider">
            <span>Low Risk</span>
            <span>High Risk</span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations && (
        <div className={`backdrop-blur-xl rounded-3xl p-8 lg:p-12 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] transform hover:scale-[1.01] transition-all duration-300 relative overflow-hidden border ${analysis.probability > 0.5
            ? 'bg-red-500/10 border-red-500/30 shadow-[0_4px_20px_rgba(239,68,68,0.15)]'
            : 'bg-green-500/10 border-green-500/30 shadow-[0_4px_20px_rgba(34,197,94,0.15)]'
          }`}>
          {/* subtle background glow */}
          <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] -z-10 opacity-30 ${analysis.probability > 0.5 ? 'bg-red-500' : 'bg-green-500'
            }`}></div>

          <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left">
            <div className="flex-shrink-0 mb-6 md:mb-0 md:mr-8">
              {analysis.probability > 0.5 ? (
                <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                  <svg className="w-10 h-10 text-red-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                  <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className={`text-2xl md:text-3xl font-black mb-4 drop-shadow-md ${analysis.probability > 0.5 ? 'text-red-300' : 'text-green-300'
                }`}>
                {recommendations.warning || recommendations.message}
              </h3>
              {recommendations.note && (
                <p className="text-lg md:text-xl text-white/90 mb-5 leading-relaxed font-medium bg-black/10 p-5 rounded-2xl border border-white/5">
                  {recommendations.note}
                </p>
              )}
              {recommendations.advice && (
                <p className="text-xl font-bold text-white drop-shadow-sm flex items-center justify-center md:justify-start">
                  <span className="mr-3 text-2xl">💡</span> {recommendations.advice}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detailed Analysis Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Acoustic Features */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] p-8 transform hover:scale-[1.02] hover:shadow-[0_15px_40px_0_rgba(31,38,135,0.5)] transition-all duration-300">
          <div className="flex items-center mb-8 border-b border-white/10 pb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mr-5 shadow-[0_0_20px_rgba(59,130,246,0.5)] relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 w-1/2 -skew-x-12 animate-[slide_2s_ease-in-out_infinite_alternate]"></div>
              <svg className="w-7 h-7 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white drop-shadow-sm">Acoustic Features</h3>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center py-4 border-b border-white/10 hover:bg-white/5 px-4 rounded-xl transition-colors">
              <div>
                <div className="font-bold text-white text-lg drop-shadow-sm">Pitch (Mean)</div>
                <div className="text-sm text-white/70 font-medium">Fundamental frequency</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.8)]">{features.pitch_mean.toFixed(2)} Hz</div>
              </div>
            </div>

            <div className="flex justify-between items-center py-4 border-b border-white/10 hover:bg-white/5 px-4 rounded-xl transition-colors">
              <div>
                <div className="font-bold text-white text-lg drop-shadow-sm">Jitter</div>
                <div className="text-sm text-white/70 font-medium">Voice stability</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.8)]">{features.jitter.toFixed(4)}</div>
              </div>
            </div>

            <div className="flex justify-between items-center py-4 hover:bg-white/5 px-4 rounded-xl transition-colors">
              <div>
                <div className="font-bold text-white text-lg drop-shadow-sm">Shimmer</div>
                <div className="text-sm text-white/70 font-medium">Amplitude variation</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.8)]">{features.shimmer.toFixed(4)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Linguistic Features */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] p-8 transform hover:scale-[1.02] hover:shadow-[0_15px_40px_0_rgba(31,38,135,0.5)] transition-all duration-300">
          <div className="flex items-center mb-8 border-b border-white/10 pb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mr-5 shadow-[0_0_20px_rgba(74,222,128,0.5)] relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 w-1/2 -skew-x-12 animate-[slide_2s_ease-in-out_infinite_alternate]" style={{ animationDelay: '0.5s' }}></div>
              <svg className="w-7 h-7 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white drop-shadow-sm">Linguistic Features</h3>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center py-4 border-b border-white/10 hover:bg-white/5 px-4 rounded-xl transition-colors">
              <div>
                <div className="font-bold text-white text-lg drop-shadow-sm">Lexical Diversity</div>
                <div className="text-sm text-white/70 font-medium">Vocabulary richness</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-green-300 drop-shadow-[0_0_8px_rgba(134,239,172,0.8)]">{(features.lexical_diversity * 100).toFixed(1)}%</div>
              </div>
            </div>

            <div className="flex justify-between items-center py-4 border-b border-white/10 hover:bg-white/5 px-4 rounded-xl transition-colors">
              <div>
                <div className="font-bold text-white text-lg drop-shadow-sm">Coherence Score</div>
                <div className="text-sm text-white/70 font-medium">Story structure quality</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-green-300 drop-shadow-[0_0_8px_rgba(134,239,172,0.8)]">{(features.coherence * 100).toFixed(1)}%</div>
              </div>
            </div>

            <div className="flex justify-between items-center py-4 hover:bg-white/5 px-4 rounded-xl transition-colors">
              <div>
                <div className="font-bold text-white text-lg drop-shadow-sm">Filler Words</div>
                <div className="text-sm text-white/70 font-medium">Use of "um", "uh", etc.</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-green-300 drop-shadow-[0_0_8px_rgba(134,239,172,0.8)]">{features.fillers}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transcription */}
      {transcription && analysis.transcription_available && (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] p-8 lg:p-12 transform hover:scale-[1.01] transition-all duration-300">
          <div className="flex items-center mb-8 border-b border-white/10 pb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mr-5 shadow-[0_0_20px_rgba(168,85,247,0.5)]">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white drop-shadow-sm">Speech Transcription</h3>
          </div>

          <div className="bg-black/20 rounded-2xl p-8 border border-white/5 shadow-inner">
            <p className="text-lg text-white/90 leading-relaxed whitespace-pre-wrap font-medium">
              {transcription}
            </p>
          </div>

          <p className="text-sm text-white/50 mt-6 text-center font-medium tracking-wide">
            * Transcription may not be 100% accurate and is provided for reference only
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-center gap-6 mt-12 pb-6">
        <button
          onClick={() => {
            console.log('Reset button clicked');
            if (onReset) onReset();
            else console.error('onReset function not provided');
          }}
          className="px-8 py-4 rounded-full font-bold text-lg text-white shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white/20 bg-white/10 hover:bg-white/20 hover:scale-105 transition-all duration-300 backdrop-blur-md"
        >
          Analyze Another File
        </button>
        <button
          onClick={downloadReport}
          className="px-8 py-4 rounded-full font-bold text-lg text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-blue-400/50 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 hover:scale-105 hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all duration-300"
        >
          Download Report
        </button>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 bg-yellow-500/10 backdrop-blur-md border border-yellow-400/30 rounded-3xl p-8 shadow-[0_4px_20px_0_rgba(234,179,8,0.1)]">
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-6">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.4)]">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-yellow-300 mb-3 drop-shadow-sm">Important Medical Disclaimer</h3>
            <p className="text-yellow-100/90 leading-relaxed text-lg">
              This tool is for screening purposes only and should not replace professional medical diagnosis.
              Results should be interpreted by qualified healthcare professionals. Early intervention can significantly improve outcomes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;