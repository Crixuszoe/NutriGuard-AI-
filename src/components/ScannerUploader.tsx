import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Mic,
  MicOff,
  Sparkles,
  RefreshCw,
  X,
  ScanLine,
  Image as ImageIcon,
  CheckCircle2,
  FileQuestion,
  RotateCw,
  Volume2,
  Loader2,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { SAMPLE_PRESETS, PresetFoodItem } from '../data/samplePresets';
import { AnalysisMode } from '../types/food';
import { transcribeVoiceApi } from '../services/api';

interface ScannerUploaderProps {
  onAnalyze: (params: { image?: string; foodDescription?: string }) => void;
  isLoading: boolean;
  activeMode: AnalysisMode | 'alerts' | 'chat';
}

const QUICK_OBSERVATION_TAGS = [
  'Sour odor / possible spoilage',
  'Street food skewer',
  'Wild foraged mushroom',
  'Unpasteurized raw milk',
  'Check for peanuts & shellfish',
  'Tap water purity test',
];

export const ScannerUploader: React.FC<ScannerUploaderProps> = ({
  onAnalyze,
  isLoading,
  activeMode,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [foodNote, setFoodNote] = useState<string>('');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // Speech-to-text state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Audio / Speech refs
  const recognitionInstanceRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);

  // Clean up media streams and speech instances on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      stopVoiceInput();
    };
  }, []);

  // ----------------------------------------------------
  // CAMERA HANDLING (Mobile-first with camera flip & fallback)
  // ----------------------------------------------------
  const startCamera = async (targetFacing: 'environment' | 'user' = facingMode) => {
    stopCamera();
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: targetFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Direct webcam/camera stream inaccessible:', err);
      setIsCameraActive(false);
      // Fallback on mobile: trigger native camera file dialog directly
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  const flipCamera = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    if (isCameraActive) {
      startCamera(nextFacing);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setSelectedImage(dataUrl);
      setSelectedPresetId(null);
    }
    stopCamera();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setSelectedPresetId(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // ----------------------------------------------------
  // SPEECH-TO-TEXT SYSTEM (Web Speech + MediaRecorder Fallback)
  // ----------------------------------------------------
  const toggleVoiceInput = () => {
    if (isListening || isTranscribing) {
      stopVoiceInput();
    } else {
      startVoiceInput();
    }
  };

  const startVoiceInput = () => {
    setVoiceNotice(null);
    setInterimTranscript('');

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          let currentInterim = '';
          let currentFinal = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              currentFinal += transcript;
            } else {
              currentInterim += transcript;
            }
          }

          if (currentInterim) {
            setInterimTranscript(currentInterim);
          }

          if (currentFinal) {
            setFoodNote((prev) => {
              const trimmed = prev.trim();
              return trimmed ? `${trimmed} ${currentFinal.trim()}` : currentFinal.trim();
            });
            setInterimTranscript('');
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Web Speech API error:', event.error);
          // If browser restricts Web Speech in iframe or mic was not granted, switch to MediaRecorder
          if (
            event.error === 'not-allowed' ||
            event.error === 'service-not-allowed' ||
            event.error === 'audio-capture' ||
            event.error === 'network'
          ) {
            recognition.stop();
            recognitionInstanceRef.current = null;
            startMediaRecorderFallback();
          } else if (event.error === 'no-speech') {
            // keep listening, don't abort immediately
          } else {
            setIsListening(false);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          setInterimTranscript('');
        };

        recognitionInstanceRef.current = recognition;
        recognition.start();
        return;
      } catch (err) {
        console.warn('Could not launch Web Speech API, falling back to MediaRecorder:', err);
      }
    }

    // If Web Speech API is absent or threw on start, fall back to MediaRecorder
    startMediaRecorderFallback();
  };

  const startMediaRecorderFallback = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showVoiceNotice('Voice input is not available on this browser. Tap a quick tag below.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      audioChunksRef.current = [];

      // Determine supported mime type
      const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
      let selectedMime = 'audio/webm';
      for (const m of mimeTypes) {
        if (MediaRecorder.isTypeSupported(m)) {
          selectedMime = m;
          break;
        }
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType: selectedMime });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsListening(false);
        setIsTranscribing(true);
        setVoiceNotice('AI transcribing voice note...');

        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: selectedMime });
          const reader = new FileReader();

          reader.onloadend = async () => {
            const base64Data = reader.result as string;
            try {
              const res = await transcribeVoiceApi(base64Data, selectedMime);
              if (res.text) {
                setFoodNote((prev) => {
                  const trimmed = prev.trim();
                  return trimmed ? `${trimmed} ${res.text}` : res.text;
                });
                setVoiceNotice(null);
              }
            } catch (err: any) {
              console.warn('Transcription API error:', err);
              setVoiceNotice('Could not transcribe audio. You can type or tap a quick tag.');
              setTimeout(() => setVoiceNotice(null), 4000);
            } finally {
              setIsTranscribing(false);
            }
          };

          reader.readAsDataURL(audioBlob);
        } catch (e) {
          setIsTranscribing(false);
          setVoiceNotice(null);
        } finally {
          // Clean up stream tracks
          if (audioStreamRef.current) {
            audioStreamRef.current.getTracks().forEach((track) => track.stop());
            audioStreamRef.current = null;
          }
        }
      };

      mediaRecorder.start();
      setIsListening(true);
      setVoiceNotice('Listening... Speak your food description or question.');
    } catch (err: any) {
      console.warn('Microphone permission error:', err);
      setIsListening(false);
      showVoiceNotice('Microphone access denied. You can tap quick observation tags below or type.');
    }
  };

  const stopVoiceInput = () => {
    if (recognitionInstanceRef.current) {
      try {
        recognitionInstanceRef.current.stop();
      } catch {}
      recognitionInstanceRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }

    setIsListening(false);
    setInterimTranscript('');
  };

  const showVoiceNotice = (msg: string) => {
    setVoiceNotice(msg);
    setTimeout(() => {
      setVoiceNotice((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  const selectPreset = (preset: PresetFoodItem) => {
    setSelectedPresetId(preset.id);
    setFoodNote(preset.queryHint);
    setSelectedImage(null);
  };

  const clearSelection = () => {
    setSelectedImage(null);
    setSelectedPresetId(null);
    setFoodNote('');
    setInterimTranscript('');
    stopCamera();
    stopVoiceInput();
  };

  const addObservationTag = (tag: string) => {
    setFoodNote((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed}, ${tag}` : tag;
    });
    setSelectedPresetId(null);
  };

  const handleScanSubmit = () => {
    if (!selectedImage && !foodNote.trim() && !selectedPresetId) {
      selectPreset(SAMPLE_PRESETS[1]);
      onAnalyze({ foodDescription: SAMPLE_PRESETS[1].queryHint });
      return;
    }

    onAnalyze({
      image: selectedImage || undefined,
      foodDescription:
        foodNote ||
        (selectedPresetId
          ? SAMPLE_PRESETS.find((p) => p.id === selectedPresetId)?.queryHint
          : undefined),
    });
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xl backdrop-blur-md">
      {/* Hidden file input for native camera / gallery selection */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* Main Scanner Viewport Area */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/90 aspect-[16/10] sm:aspect-[16/9] flex items-center justify-center">
        {isCameraActive ? (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Viewfinder HUD Overlay */}
            <div className="absolute inset-3 sm:inset-4 border-2 border-emerald-400/40 rounded-xl pointer-events-none flex flex-col justify-between p-3">
              <div className="flex justify-between text-[11px] text-emerald-400 font-mono tracking-wider">
                <span>[ AI SPECTROMETRY LENS ]</span>
                <span className="flex items-center gap-1.5 animate-pulse text-rose-400">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>LIVE</span>
                </span>
              </div>
              <div className="w-full h-0.5 bg-emerald-400/80 shadow-[0_0_12px_#34d399] animate-bounce" />
              <div className="text-center text-[11px] sm:text-xs text-slate-200 bg-slate-950/80 backdrop-blur-md py-1 px-3 rounded-full mx-auto font-mono border border-slate-800">
                Align food within target frame
              </div>
            </div>

            {/* Camera Floating Controls */}
            <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-4 z-20 px-4">
              <button
                type="button"
                onClick={stopCamera}
                className="px-3.5 py-2 rounded-xl bg-slate-900/90 text-slate-300 text-xs font-semibold hover:bg-slate-800 border border-slate-700 min-h-[44px]"
              >
                Cancel
              </button>

              {/* Shutter capture button */}
              <button
                type="button"
                onClick={capturePhoto}
                aria-label="Capture Food Photo"
                className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-xl shadow-emerald-500/40 transition transform active:scale-90 ring-4 ring-slate-900"
              >
                <div className="w-12 h-12 rounded-full border-2 border-slate-950 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-slate-950" />
                </div>
              </button>

              {/* Switch front / back camera */}
              <button
                type="button"
                onClick={flipCamera}
                title="Flip Camera"
                className="w-11 h-11 rounded-xl bg-slate-900/90 text-slate-300 flex items-center justify-center hover:bg-slate-800 border border-slate-700 min-h-[44px]"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : selectedImage ? (
          <div className="relative w-full h-full">
            <img
              src={selectedImage}
              alt="Food capture preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2.5 right-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={clearSelection}
                className="w-8 h-8 rounded-full bg-slate-950/80 text-slate-300 hover:text-white flex items-center justify-center backdrop-blur-md transition border border-slate-800"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Visual scan frame confirmation */}
            <div className="absolute bottom-2.5 left-2.5 bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-800 text-[11px] text-emerald-400 font-mono flex items-center gap-1.5 shadow-md">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Optical Frame Ready for Analysis</span>
            </div>
          </div>
        ) : selectedPresetId ? (
          <div className="relative w-full h-full p-4 sm:p-6 flex flex-col items-center justify-center text-center bg-gradient-to-b from-slate-900/90 to-slate-950">
            <div className="text-4xl sm:text-5xl mb-2">
              {SAMPLE_PRESETS.find((p) => p.id === selectedPresetId)?.svgIcon}
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-100">
              {SAMPLE_PRESETS.find((p) => p.id === selectedPresetId)?.name}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 max-w-sm mt-0.5 line-clamp-2">
              {SAMPLE_PRESETS.find((p) => p.id === selectedPresetId)?.description}
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
                Preset Scenario Loaded
              </span>
              <button
                type="button"
                onClick={clearSelection}
                className="text-xs text-slate-400 hover:text-white underline ml-1"
              >
                Reset
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full h-full p-4 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2.5">
              <ScanLine className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-100">
              Scan Food with Phone Camera
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 max-w-xs mt-0.5">
              Instant AI check for biotoxins, chemical poison, spoilage & nutrition
            </p>

            {/* Quick Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mt-3.5 w-full max-w-xs px-1">
              <button
                type="button"
                onClick={() => startCamera('environment')}
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95 min-h-[44px]"
              >
                <Camera className="w-4 h-4" />
                <span>Open Live Camera</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs border border-slate-700 transition-all active:scale-95 min-h-[44px]"
              >
                <Upload className="w-4 h-4" />
                <span>Photo / Upload</span>
              </button>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 z-30">
            <div className="relative w-16 h-16 flex items-center justify-center mb-3">
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
              <ScanLine className="w-7 h-7 text-emerald-400 animate-pulse" />
            </div>
            <p className="text-sm font-bold text-slate-100">Running Multimodal AI Diagnostics...</p>
            <p className="text-xs text-slate-400 font-mono mt-1 text-center max-w-xs">
              Matching chemical toxicology, USDA nutrient data & bacterial spoilage markers
            </p>
          </div>
        )}
      </div>

      {/* Preset Fast-Select Row */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Quick Food Scenarios
          </span>
          <span className="text-[10px] text-slate-500">Tap to load sample</span>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 snap-x">
          {SAMPLE_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => selectPreset(preset)}
                className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 shrink-0 snap-start min-w-[170px] cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/10 border-emerald-500/60 ring-1 ring-emerald-500/30'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="text-xl shrink-0">{preset.svgIcon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-200 truncate">{preset.name}</p>
                  <p
                    className={`text-[10px] font-medium truncate ${
                      preset.badgeType === 'hazard'
                        ? 'text-rose-400'
                        : preset.badgeType === 'safe'
                        ? 'text-emerald-400'
                        : preset.badgeType === 'water'
                        ? 'text-blue-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {preset.badge}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Voice Feedback Banner (when recording or transcribing) */}
      {(isListening || isTranscribing || voiceNotice) && (
        <div className="mt-2.5 px-3 py-2 rounded-xl bg-slate-950 border border-emerald-500/40 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {isTranscribing ? (
              <Loader2 className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
            ) : isListening ? (
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
              </span>
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            )}

            <p className="text-slate-200 text-xs truncate">
              {isTranscribing
                ? 'AI Transcribing your voice with Gemini...'
                : isListening
                ? interimTranscript
                  ? `"${interimTranscript}"`
                  : 'Listening... speak now into phone mic'
                : voiceNotice}
            </p>
          </div>

          {isListening && (
            <button
              type="button"
              onClick={stopVoiceInput}
              className="ml-2 px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[11px] shrink-0"
            >
              Done
            </button>
          )}
        </div>
      )}

      {/* Food Observation Input & Speech-to-Text Button */}
      <div className="mt-3 flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={foodNote}
            onChange={(e) => {
              setFoodNote(e.target.value);
              setSelectedPresetId(null);
            }}
            placeholder="Type note or tap mic (e.g. street chicken, sour smell)"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3.5 pr-8 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition min-h-[44px]"
          />

          {/* Quick Clear Button if text entered */}
          {foodNote && (
            <button
              type="button"
              onClick={() => setFoodNote('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
              title="Clear text"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Robust Voice Input Button */}
        <button
          type="button"
          onClick={toggleVoiceInput}
          title={isListening ? 'Stop listening' : 'Start speech-to-text dictation'}
          aria-label={isListening ? 'Stop listening' : 'Start speech-to-text dictation'}
          className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all cursor-pointer min-h-[44px] shrink-0 ${
            isListening
              ? 'bg-rose-500 text-white border-rose-400 animate-pulse shadow-md shadow-rose-500/30 ring-2 ring-rose-500/40'
              : isTranscribing
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-spin'
              : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700 active:scale-95'
          }`}
        >
          {isTranscribing ? (
            <Loader2 className="w-4 h-4" />
          ) : isListening ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4 text-emerald-400" />
          )}
        </button>
      </div>

      {/* Quick Observation Tags (Tap to add, zero typing required on mobile) */}
      <div className="mt-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[10px] text-slate-500 shrink-0 flex items-center gap-1">
            <Tag className="w-2.5 h-2.5" />
            <span>Quick notes:</span>
          </span>
          {QUICK_OBSERVATION_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => addObservationTag(tag)}
              className="shrink-0 text-[10px] font-medium px-2 py-1 rounded-lg bg-slate-950/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-850 hover:border-slate-700 transition active:scale-95 whitespace-nowrap cursor-pointer"
            >
              + {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Main Scan Trigger CTA Button */}
      <div className="mt-3.5">
        <button
          onClick={handleScanSubmit}
          disabled={isLoading}
          className="w-full py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>Execute Food Security & Nutrition Scan</span>
        </button>
      </div>
    </div>
  );
};
