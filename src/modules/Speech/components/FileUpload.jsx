import React, { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const FileUpload = forwardRef(({ onAnalysisComplete, onError, onLoading, initialFile, initialChildAge, autoAnalyze }, ref) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState(initialFile || null);
  const [childAge, setChildAge] = useState(initialChildAge || 8);
  const [dragActive, setDragActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [mode, setMode] = useState('upload');

  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const allowedExtensions = ['.wav', '.mp3', '.m4a', '.flac', '.ogg', '.webm'];
  const maxFileSize = 50 * 1024 * 1024;

  const validateFile = (file) => {
    if (!file) return t('speech.noFile') || 'No file selected';
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      return `${t('speech.unsupportedType') || 'Unsupported file type. Allowed:'} ${allowedExtensions.join(', ')}`;
    }
    if (file.size > maxFileSize) {
      return t('speech.fileTooLarge') || 'File size too large. Maximum 50MB allowed.';
    }
    return null;
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      // Best supported mimeTypes for recording
      const mimeTypes = [
        'audio/mp4',
        'audio/mpeg',
        'audio/webm;codecs=opus',
        'audio/webm'
      ];

      let selectedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType: selectedMimeType });
      mediaRecorder.ondataavailable = (event) => { if (event.data.size > 0) chunksRef.current.push(event.data); };
      mediaRecorder.onstop = () => {
        const mime = mediaRecorder.mimeType || 'audio/webm';
        const fileExtension = mime.includes('mp4') ? 'm4a' : mime.includes('mpeg') ? 'mp3' : 'webm';

        const blob = new Blob(chunksRef.current, { type: mime });
        const file = new File([blob], `recording_${Date.now()}.${fileExtension}`, { type: mime });
        setRecordedBlob(blob);
        setSelectedFile(file);
      };
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      timerRef.current = setInterval(() => { setRecordingTime(prev => prev + 1); }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      onError(t('speech.micError') || 'Could not access microphone. Please check permissions.');
    }
  }, [onError, t]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (streamRef.current) { streamRef.current.getTracks().forEach(track => track.stop()); }
    }
  }, [isRecording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileSelect = (file) => {
    const error = validateFile(file);
    if (error) { onError(error); return; }
    setSelectedFile(file);
    onError(null);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) handleFileSelect(files[0]);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileSelect(file);
  };

  const handleSubmit = async () => {
    const fileToUpload = selectedFile;
    if (!fileToUpload) {
      onError(t('speech.selectOrRecord') || 'Please select an audio file or record audio first');
      return;
    }
    sessionStorage.setItem('isAnalyzing', 'true');
    sessionStorage.setItem('pendingChildAge', childAge.toString());

    // Navigate to results page immediately to show loading
    navigate('/speech/results');

    // Start analysis immediately (continues even after navigation)
    // Don't store file in sessionStorage - use it directly
    performAnalysis(fileToUpload);
  };

  const performAnalysis = async (fileToUpload) => {
    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('child_age', childAge.toString());
      const response = await fetch('http://localhost:8003/analyze', { method: 'POST', body: formData });
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try { errorData = JSON.parse(errorText); } catch { errorData = { detail: errorText }; }
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      sessionStorage.setItem('analysisResult', JSON.stringify(result));
      sessionStorage.removeItem('isAnalyzing');

      // Navigate to results page with result
      navigate('/speech/results', { state: { result }, replace: true });
      onAnalysisComplete(result);
    } catch (error) {
      console.error('Analysis error:', error);
      sessionStorage.removeItem('isAnalyzing');
      sessionStorage.setItem('analysisError', error.message || 'Failed to analyze audio. Please try again.');
      onError(error.message || 'Failed to analyze audio. Please try again.');
      // Navigate back to analyze page on error
      navigate('/speech/analyze', { replace: true });
    } finally {
      onLoading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setRecordedBlob(null);
    setRecordingTime(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (isRecording) stopRecording();
  };

  useImperativeHandle(ref, () => ({
    handleAutoAnalyze: (file, age) => {
      if (file) {
        setSelectedFile(file);
        if (age) setChildAge(age);
        setTimeout(() => { handleSubmit(); }, 100);
      }
    }
  }));

  useEffect(() => {
    if (autoAnalyze && initialFile && location.pathname === '/analyze') {
      const timer = setTimeout(() => { handleSubmit(); }, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoAnalyze, initialFile, location.pathname]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8">
      {/* Mode Selection */}
      <div className="flex justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 flex border border-white/20">
          <button onClick={() => setMode('upload')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${mode === 'upload' ? 'bg-white/20 text-white shadow-md' : 'text-white/70 hover:text-white'}`}>
            {t('speech.uploadFileMode')}
          </button>
          <button onClick={() => setMode('record')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${mode === 'record' ? 'bg-white/20 text-white shadow-md' : 'text-white/70 hover:text-white'}`}>
            {t('speech.recordAudioMode')}
          </button>
        </div>
      </div>

      {/* File Upload Area */}
      {mode === 'upload' && (
        <div
          className={`relative border-2 border-dashed rounded-[2rem] p-12 text-center transition-all duration-300 group ${dragActive ? 'border-blue-400 bg-blue-500/20 scale-105 shadow-[0_0_30px_rgba(59,130,246,0.3)]' : selectedFile ? 'border-green-400 bg-green-500/10 shadow-[0_0_20px_rgba(74,222,128,0.2)]' : 'border-white/30 hover:border-blue-400/50 hover:bg-white/5 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] cursor-pointer'}`}
          onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
          onClick={() => { if (!selectedFile) fileInputRef.current?.click(); }}
        >
          <input ref={fileInputRef} type="file" accept={allowedExtensions.join(',')} onChange={handleFileInputChange}
            className={`absolute inset-0 w-full h-full opacity-0 ${selectedFile ? 'pointer-events-none' : 'cursor-pointer'}`} />
          <div className="space-y-6 relative z-10">
            {selectedFile ? (
              <div className="animate-fade-in-up">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl mb-6 shadow-[0_0_20px_rgba(16,185,129,0.5)] transform hover:rotate-12 transition-transform duration-300">
                  <svg className="w-12 h-12 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white mb-2 drop-shadow-sm">{selectedFile.name}</h3>
                  <p className="text-green-300 font-medium mb-6 drop-shadow-sm">{formatFileSize(selectedFile.size)}</p>
                  <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); clearFile(); }}
                    className="relative z-10 px-6 py-2 rounded-full border border-white/20 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-300 text-white/70 transition-all duration-300 text-sm font-bold tracking-wider">
                    {t('speech.removeFile')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="animate-fade-in-up group-hover:transform group-hover:-translate-y-2 transition-transform duration-300">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl mb-8 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] group-hover:bg-blue-500/20 transition-all duration-300">
                  <svg className="w-12 h-12 text-white/70 group-hover:text-blue-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white mb-4 tracking-wide group-hover:text-blue-200 transition-colors duration-300">{t('speech.dropAudio')}</h3>
                  <p className="text-white/70 font-medium mb-8 max-w-md mx-auto leading-relaxed">{t('speech.dropAudioDesc')}</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {allowedExtensions.map((ext, index) => (
                      <span key={index} className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-white/60 tracking-wider group-hover:border-white/20 group-hover:bg-white/10 transition-colors duration-300">{ext.toUpperCase()}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recording Area */}
      {mode === 'record' && (
        <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-12 text-center border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5 pointer-events-none"></div>
          <div className="space-y-8 relative z-10">
            {selectedFile && recordedBlob ? (
              <div className="animate-fade-in-up">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl mb-6 shadow-[0_0_20px_rgba(16,185,129,0.5)] transform hover:rotate-12 transition-transform duration-300">
                  <svg className="w-12 h-12 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white mb-2 drop-shadow-sm">{t('speech.recordingSaved')}</h3>
                  <p className="text-green-300 font-medium tracking-wider mb-8 drop-shadow-sm">{t('speech.duration')}: {formatTime(recordingTime)}</p>
                  <button onClick={clearFile} className="px-6 py-2 rounded-full border border-white/20 hover:bg-white/10 text-white/80 hover:text-white transition-all duration-300 text-sm font-bold tracking-wider">
                    {t('speech.recordAgain')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="animate-fade-in-up">
                <div className={`relative inline-flex items-center justify-center w-32 h-32 rounded-full mb-8 transition-all duration-300 ${isRecording ? 'bg-red-500 shadow-[0_0_40px_rgba(239,68,68,0.8)] scale-110 animate-pulse' : 'bg-white/10 border border-white/20 shadow-inner'}`}>
                  {isRecording && <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping opacity-75"></div>}
                  <svg className={`w-14 h-14 ${isRecording ? 'text-white drop-shadow-md' : 'text-white/70'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white mb-6 drop-shadow-md">
                    {isRecording ? t('speech.recordingStatus') : t('speech.clickToRecord')}
                  </h3>
                  {isRecording && (
                    <div className="mb-8 p-6 bg-black/20 rounded-2xl border border-red-500/30 backdrop-blur-md">
                      <div className="text-5xl font-mono font-black text-red-400 mb-4 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)] tracking-wider">{formatTime(recordingTime)}</div>
                      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                        <div className="bg-gradient-to-r from-red-600 to-red-400 h-full rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  )}
                  <p className="text-white/70 font-medium mb-10 max-w-md mx-auto leading-relaxed">
                    {isRecording ? t('speech.recordingTip') : t('speech.recordPermTip')}
                  </p>
                  <button onClick={() => { isRecording ? stopRecording() : startRecording(); }}
                    className={`px-10 py-5 rounded-full font-black text-lg uppercase tracking-wider transition-all duration-300 transform ${isRecording ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.5)] hover:scale-110' : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:scale-105 hover:shadow-xl backdrop-blur-md'}`}>
                    <span className="flex items-center gap-3">
                      {isRecording ? <><span className="w-3 h-3 bg-white rounded-sm animate-pulse"></span> {t('speech.stopRecording')}</> : <><span className="text-red-400">●</span> {t('speech.startRecording')}</>}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative overflow-hidden group/age">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover/age:opacity-100 transition-opacity duration-500"></div>
        <div className="max-w-md mx-auto relative z-10">
          <label htmlFor="childAge" className="block text-sm font-bold text-white/40 uppercase tracking-[0.2em] mb-4 text-center">{t('speech.childAge')}</label>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur-sm"></div>
            <select
              id="childAge"
              value={childAge}
              onChange={(e) => setChildAge(parseInt(e.target.value))}
              className="relative w-full px-8 py-5 text-2xl font-black bg-black/40 border border-white/10 rounded-2xl text-white appearance-none focus:outline-none focus:border-blue-500/50 hover:bg-black/60 transition-all duration-300 shadow-2xl cursor-pointer text-center tracking-tighter"
            >
              {[6, 7, 8, 9, 10].map(age => (
                <option key={age} value={age} className="text-lg bg-[#0E1B4D] font-bold py-4">
                  {age} {t('speech.yearsOld')}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-8 text-blue-400 group-hover:text-white transition-colors duration-300">
              <svg className="h-6 w-6 transform group-hover:translate-y-1 transition-transform duration-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <p className="text-xs font-bold text-white/30 mt-6 text-center tracking-widest uppercase">{t('speech.ageNote')}</p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="text-center mt-12 animate-fade-in-up">
        <button onClick={() => handleSubmit()} disabled={!selectedFile}
          className={`relative overflow-hidden group px-14 py-6 rounded-full font-black text-xl uppercase tracking-widest transition-all duration-300 transform ${selectedFile ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:scale-105 shadow-[0_0_30px_rgba(59,130,246,0.5)] border border-blue-400/50 hover:shadow-[0_0_40px_rgba(168,85,247,0.7)]' : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10 backdrop-blur-md'}`}>
          {selectedFile && <div className="absolute inset-0 bg-white/20 w-1/2 -skew-x-12 group-hover:animate-[slide_1s_ease-in-out]"></div>}
          <span className="relative z-10 drop-shadow-md">
            {selectedFile ? t('speech.analyzeBtn') : mode === 'upload' ? t('speech.selectFileFirst') : t('speech.recordFirst')}
          </span>
        </button>
      </div>
    </div>
  );
});

FileUpload.displayName = 'FileUpload';

export default FileUpload;