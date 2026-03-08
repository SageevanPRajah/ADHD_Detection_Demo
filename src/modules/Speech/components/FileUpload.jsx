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
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      mediaRecorder.ondataavailable = (event) => { if (event.data.size > 0) chunksRef.current.push(event.data); };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `recording_${Date.now()}.webm`, { type: 'audio/webm' });
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
    navigate('/results');
    performAnalysis(fileToUpload);
  };

  const performAnalysis = async (fileToUpload) => {
    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('child_age', childAge.toString());
      const response = await fetch('http://localhost:8000/analyze', { method: 'POST', body: formData });
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try { errorData = JSON.parse(errorText); } catch { errorData = { detail: errorText }; }
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      sessionStorage.setItem('analysisResult', JSON.stringify(result));
      sessionStorage.removeItem('isAnalyzing');
      navigate('/results', { state: { result }, replace: true });
      onAnalysisComplete(result);
    } catch (error) {
      console.error('Analysis error:', error);
      sessionStorage.removeItem('isAnalyzing');
      sessionStorage.setItem('analysisError', error.message || (t('speech.analysisFailure') || 'Failed to analyze audio. Please try again.'));
      onError(error.message || (t('speech.analysisFailure') || 'Failed to analyze audio. Please try again.'));
      navigate('/analyze', { replace: true });
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
          className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${dragActive ? 'border-blue-400 bg-blue-500/20 scale-105' : selectedFile ? 'border-green-400 bg-green-500/20' : 'border-white/30 hover:border-white/50 hover:bg-white/5 cursor-pointer'}`}
          onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
          onClick={() => { if (!selectedFile) fileInputRef.current?.click(); }}
        >
          <input ref={fileInputRef} type="file" accept={allowedExtensions.join(',')} onChange={handleFileInputChange}
            className={`absolute inset-0 w-full h-full opacity-0 ${selectedFile ? 'pointer-events-none' : 'cursor-pointer'}`} />
          <div className="space-y-6">
            {selectedFile ? (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-6">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{selectedFile.name}</h3>
                  <p className="text-white/80 mb-4">{formatFileSize(selectedFile.size)}</p>
                  <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); clearFile(); }}
                    className="relative z-10 text-white/70 hover:text-white transition-colors text-sm font-medium">
                    {t('speech.removeFile')}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-2xl mb-6">
                  <svg className="w-10 h-10 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">{t('speech.dropAudio')}</h3>
                  <p className="text-white/80 mb-6 max-w-md mx-auto">{t('speech.dropAudioDesc')}</p>
                  <div className="flex flex-wrap justify-center gap-2 text-sm text-white/60">
                    {allowedExtensions.map((ext, index) => (
                      <span key={index} className="px-3 py-1 bg-white/10 rounded-full">{ext.toUpperCase()}</span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Recording Area */}
      {mode === 'record' && (
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 text-center border border-white/20">
          <div className="space-y-6">
            {selectedFile && recordedBlob ? (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-6">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{t('speech.recordingSaved')}</h3>
                  <p className="text-white/80 mb-4">{t('speech.duration')}: {formatTime(recordingTime)}</p>
                  <button onClick={clearFile} className="text-white/70 hover:text-white transition-colors text-sm font-medium">
                    {t('speech.recordAgain')}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 ${isRecording ? 'bg-red-500/50 animate-pulse' : 'bg-white/10'}`}>
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {isRecording ? t('speech.recordingStatus') : t('speech.clickToRecord')}
                  </h3>
                  {isRecording && (
                    <div className="mb-6">
                      <div className="text-3xl font-mono font-bold text-red-400 mb-2">{formatTime(recordingTime)}</div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
                      </div>
                    </div>
                  )}
                  <p className="text-white/80 mb-6 max-w-md mx-auto">
                    {isRecording ? t('speech.recordingTip') : t('speech.recordPermTip')}
                  </p>
                  <button onClick={() => { isRecording ? stopRecording() : startRecording(); }}
                    className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${isRecording ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' : 'bg-white/20 hover:bg-white/30 text-white border border-white/30'}`}>
                    {isRecording ? t('speech.stopRecording') : t('speech.startRecording')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Age Selection */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <div className="max-w-md mx-auto">
          <label htmlFor="childAge" className="block text-lg font-semibold text-white mb-4">{t('speech.childAge')}</label>
          <select id="childAge" value={childAge} onChange={(e) => setChildAge(parseInt(e.target.value))}
            className="w-full px-6 py-4 text-lg bg-white/10 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all">
            {Array.from({ length: 7 }, (_, i) => i + 6).map(age => (
              <option key={age} value={age} className="text-lg bg-[#0E1B4D]">{age} {t('speech.yearsOld')}</option>
            ))}
          </select>
          <p className="text-sm text-white/70 mt-3 text-center">{t('speech.ageNote')}</p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="text-center">
        <button onClick={() => handleSubmit()} disabled={!selectedFile}
          className={`px-12 py-5 rounded-2xl font-bold text-lg uppercase tracking-wider transition-all duration-300 transform ${selectedFile ? 'bg-white text-[#0E1B4D] hover:bg-white/90 hover:scale-105 shadow-lg hover:shadow-xl' : 'bg-white/10 text-white/50 cursor-not-allowed border border-white/20'}`}>
          {selectedFile ? t('speech.analyzeBtn') : mode === 'upload' ? t('speech.selectFileFirst') : t('speech.recordFirst')}
        </button>
      </div>
    </div>
  );
});

FileUpload.displayName = 'FileUpload';

export default FileUpload;