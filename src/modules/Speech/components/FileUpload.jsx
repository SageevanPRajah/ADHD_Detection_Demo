import React, { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const FileUpload = forwardRef(({ onAnalysisComplete, onError, onLoading, initialFile, initialChildAge, autoAnalyze }, ref) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedFile, setSelectedFile] = useState(initialFile || null);
  const [childAge, setChildAge] = useState(initialChildAge || 8);
  const [dragActive, setDragActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [mode, setMode] = useState('upload'); // 'upload' or 'record'

  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const allowedExtensions = ['.wav', '.mp3', '.m4a', '.flac', '.ogg', '.webm'];
  const maxFileSize = 50 * 1024 * 1024; // 50MB

  const validateFile = (file) => {
    if (!file) return 'No file selected';

    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      return `Unsupported file type. Allowed: ${allowedExtensions.join(', ')}`;
    }

    if (file.size > maxFileSize) {
      return 'File size too large. Maximum 50MB allowed.';
    }

    return null;
  };

  const startRecording = useCallback(async () => {
    console.log('startRecording called');
    try {
      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone access granted');
      streamRef.current = stream;
      chunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorder.ondataavailable = (event) => {
        console.log('Data available, size:', event.data.size);
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('Recording stopped, creating blob...');
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `recording_${Date.now()}.webm`, { type: 'audio/webm' });
        console.log('Recording file created:', file.name, 'Size:', file.size);
        setRecordedBlob(blob);
        setSelectedFile(file);
        // Don't reset recordingTime here - preserve it to show the duration
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      console.log('Recording started');

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      onError('Could not access microphone. Please check permissions.');
    }
  }, [onError]);

  const stopRecording = useCallback(() => {
    console.log('stopRecording called');
    if (mediaRecorderRef.current && isRecording) {
      // Clear the timer first to preserve the final recording time
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      console.log('Stopping media recorder...');
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    } else {
      console.log('No active recording to stop');
    }
  }, [isRecording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileSelect = (file) => {
    console.log('handleFileSelect called with file:', file);
    const error = validateFile(file);
    if (error) {
      console.log('File validation error:', error);
      onError(error);
      return;
    }

    console.log('File selected successfully:', file.name);
    setSelectedFile(file);
    onError(null); // Clear any previous errors
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('File dropped, files:', e.dataTransfer.files);
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    } else {
      console.log('No files in drop event');
    }
  };

  const handleFileInputChange = (e) => {
    console.log('File input changed, files:', e.target.files);
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    } else {
      console.log('No file selected');
    }
  };

  const handleSubmit = async () => {
    const fileToUpload = selectedFile;
    if (!fileToUpload) {
      onError('Please select an audio file or record audio first');
      return;
    }

    // Set analyzing flag and navigate to results page immediately
    sessionStorage.setItem('isAnalyzing', 'true');
    sessionStorage.setItem('pendingChildAge', childAge.toString());
    
    // Navigate to results page immediately to show loading
    navigate('/results');
    
    // Start analysis immediately (continues even after navigation)
    // Don't store file in sessionStorage - use it directly
    performAnalysis(fileToUpload);
  };

  const performAnalysis = async (fileToUpload) => {
    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('child_age', childAge.toString());

      console.log('Sending request to:', 'http://localhost:8000/analyze');
      console.log('File:', fileToUpload.name, 'Size:', fileToUpload.size);

      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: errorText };
        }
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Analysis result:', result);
      
      // Store result and clear loading flag
      sessionStorage.setItem('analysisResult', JSON.stringify(result));
      sessionStorage.removeItem('isAnalyzing');
      
      // Navigate to results page with result
      navigate('/results', { state: { result }, replace: true });
      onAnalysisComplete(result);

    } catch (error) {
      console.error('Analysis error:', error);
      sessionStorage.removeItem('isAnalyzing');
      sessionStorage.setItem('analysisError', error.message || 'Failed to analyze audio. Please try again.');
      onError(error.message || 'Failed to analyze audio. Please try again.');
      // Navigate back to analyze page on error
      navigate('/analyze', { replace: true });
    } finally {
      onLoading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setRecordedBlob(null);
    setRecordingTime(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Stop recording if active
    if (isRecording) {
      stopRecording();
    }
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    handleAutoAnalyze: (file, age) => {
      if (file) {
        setSelectedFile(file);
        if (age) setChildAge(age);
        // Trigger analysis automatically
        setTimeout(() => {
          handleSubmit();
        }, 100);
      }
    }
  }));

  // Auto-analyze when component mounts with initial file
  useEffect(() => {
    if (autoAnalyze && initialFile && location.pathname === '/analyze') {
      const timer = setTimeout(() => {
        handleSubmit();
      }, 500);
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
          <button
            onClick={() => {
              console.log('Upload File mode clicked');
              setMode('upload');
            }}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              mode === 'upload'
                ? 'bg-white/20 text-white shadow-md'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Upload File
          </button>
          <button
            onClick={() => {
              console.log('Record Audio mode clicked');
              setMode('record');
            }}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              mode === 'record'
                ? 'bg-white/20 text-white shadow-md'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Record Audio
          </button>
        </div>
      </div>

      {/* File Upload Area */}
      {mode === 'upload' && (
        <div
          className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
            dragActive
              ? 'border-blue-400 bg-blue-500/20 scale-105'
              : selectedFile
              ? 'border-green-400 bg-green-500/20'
              : 'border-white/30 hover:border-white/50 hover:bg-white/5 cursor-pointer'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => {
            if (!selectedFile) {
              fileInputRef.current?.click();
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={allowedExtensions.join(',')}
            onChange={handleFileInputChange}
            className={`absolute inset-0 w-full h-full opacity-0 ${selectedFile ? 'pointer-events-none' : 'cursor-pointer'}`}
          />

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
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      console.log('Remove file button clicked');
                      clearFile();
                    }}
                    className="relative z-10 text-white/70 hover:text-white transition-colors text-sm font-medium"
                  >
                    Remove file
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
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Drop your audio file here
                  </h3>
                  <p className="text-white/80 mb-6 max-w-md mx-auto">
                    or click to browse. We support WAV, MP3, M4A, FLAC, and OGG files up to 50MB.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 text-sm text-white/60">
                    {allowedExtensions.map((ext, index) => (
                      <span key={index} className="px-3 py-1 bg-white/10 rounded-full">
                        {ext.toUpperCase()}
                      </span>
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
                  <h3 className="text-2xl font-bold text-white mb-2">Recording Saved</h3>
                  <p className="text-white/80 mb-4">Duration: {formatTime(recordingTime)}</p>
                  <button
                    onClick={clearFile}
                    className="text-white/70 hover:text-white transition-colors text-sm font-medium"
                  >
                    Record Again
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 ${
                  isRecording ? 'bg-red-500/50 animate-pulse' : 'bg-white/10'
                }`}>
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {isRecording ? 'Recording...' : 'Click to Record'}
                  </h3>
                  {isRecording && (
                    <div className="mb-6">
                      <div className="text-3xl font-mono font-bold text-red-400 mb-2">
                        {formatTime(recordingTime)}
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
                      </div>
                    </div>
                  )}
                  <p className="text-white/80 mb-6 max-w-md mx-auto">
                    {isRecording
                      ? 'Speak clearly for at least 30 seconds. Click stop when finished.'
                      : 'Record your voice directly in the browser. Make sure to grant microphone permissions.'
                    }
                  </p>
                  <button
                    onClick={() => {
                      console.log('Record button clicked, isRecording:', isRecording);
                      if (isRecording) {
                        stopRecording();
                      } else {
                        startRecording();
                      }
                    }}
                    className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                      isRecording
                        ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                        : 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
                    }`}
                  >
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
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
          <label htmlFor="childAge" className="block text-lg font-semibold text-white mb-4">
            Child's Age
          </label>
          <select
            id="childAge"
            value={childAge}
            onChange={(e) => setChildAge(parseInt(e.target.value))}
            className="w-full px-6 py-4 text-lg bg-white/10 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all"
          >
            {Array.from({ length: 7 }, (_, i) => i + 6).map(age => (
              <option key={age} value={age} className="text-lg bg-[#0E1B4D]">{age} years old</option>
            ))}
          </select>
          <p className="text-sm text-white/70 mt-3 text-center">
            Age affects analysis parameters and reading expectations
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="text-center">
        <button
          onClick={() => {
            console.log('Analyze button clicked');
            handleSubmit();
          }}
          disabled={!selectedFile}
          className={`px-12 py-5 rounded-2xl font-bold text-lg uppercase tracking-wider transition-all duration-300 transform ${
            selectedFile
              ? 'bg-white text-[#0E1B4D] hover:bg-white/90 hover:scale-105 shadow-lg hover:shadow-xl'
              : 'bg-white/10 text-white/50 cursor-not-allowed border border-white/20'
          }`}
        >
          {selectedFile ? 'Analyze Speech' : mode === 'upload' ? 'Select File First' : 'Record Audio First'}
        </button>
      </div>
    </div>
  );
});

FileUpload.displayName = 'FileUpload';

export default FileUpload;