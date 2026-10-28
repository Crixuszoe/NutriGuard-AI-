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
} from 'lucide-react';
import { SAMPLE_PRESETS, PresetFoodItem } from '../data/samplePresets';
import { AnalysisMode } from '../types/food';

interface ScannerUploaderProps {
  onAnalyze: (params: { image?: string; foodDescription?: string }) => void;
  isLoading: boolean;
  activeMode: AnalysisMode | 'alerts' | 'chat';
}

export const ScannerUploader: React.FC<ScannerUploaderProps> = ({
  onAnalyze,
  isLoading,
  activeMode,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [foodNote, setFoodNote] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setFoodNote((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsRecording(false);
        };

        recognition.onerror = () => {
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Stop camera stream when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your query.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Speech recognition error:', err);
      }
    }
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

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Unable to access live webcam/camera:', err);
      setIsCameraActive(false);
      // Fallback: trigger native file picker with camera
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
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
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setSelectedImage(dataUrl);
      setSelectedPresetId(null);
    }
    stopCamera();
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
    stopCamera();
  };

  const handleScanSubmit = () => {
    if (!selectedImage && !foodNote.trim() && !selectedPresetId) {
      // Pick first preset as default
      selectPreset(SAMPLE_PRESETS[1]);
      onAnalyze({ foodDescription: SAMPLE_PRESETS[1].queryHint });
      return;
    }

    onAnalyze({
      image: selectedImage || undefined,
      foodDescription: foodNote || (selectedPresetId ? SAMPLE_PRESETS.find(p => p.id === selectedPresetId)?.queryHint : undefined),
    });
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl backdrop-blur-md">
      {/* Hidden file input */}
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
            {/* Viewfinder crosshairs & scan HUD overlay */}
            <div className="absolute inset-4 border-2 border-emerald-400/40 rounded-xl pointer-events-none flex flex-col justify-between p-3">
              <div className="flex justify-between text-[11px] text-emerald-400 font-mono tracking-wider">
                <span>[ LIVE AI OPTICAL SENSOR ]</span>
                <span className="animate-pulse">REC ●</span>
              </div>
              <div className="w-full h-0.5 bg-emerald-400/70 shadow-[0_0_12px_#34d399] animate-bounce" />
              <div className="text-center text-xs text-slate-300 bg-slate-900/80 backdrop-blur-md py-1 px-3 rounded-full mx-auto font-mono">
                Frame food within target
              </div>
            </div>

            {/* Camera controls */}
            <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4 z-20">
              <button
                onClick={stopCamera}
                className="px-4 py-2 rounded-xl bg-slate-800/90 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={capturePhoto}
                className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 transition transform active:scale-95"
              >
                <div className="w-11 h-11 rounded-full border-2 border-slate-950 flex items-center justify-center">
                  <Camera className="w-6 h-6" />
                </div>
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
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <button
                onClick={clearSelection}
                className="w-8 h-8 rounded-full bg-slate-950/80 text-slate-300 hover:text-white flex items-center justify-center backdrop-blur-md transition"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Visual scan frame */}
            <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-800 text-[11px] text-emerald-400 font-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Optical Frame Ready</span>
            </div>
          </div>
        ) : selectedPresetId ? (
          <div className="relative w-full h-full p-6 flex flex-col items-center justify-center text-center bg-gradient-to-b from-slate-900/90 to-slate-950">
            <div className="text-5xl mb-3">
              {SAMPLE_PRESETS.find((p) => p.id === selectedPresetId)?.svgIcon}
            </div>
            <h3 className="text-base font-bold text-slate-100">
              {SAMPLE_PRESETS.find((p) => p.id === selectedPresetId)?.name}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              {SAMPLE_PRESETS.find((p) => p.id === selectedPresetId)?.description}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
                Preset Sample Selected
              </span>
              <button
                onClick={clearSelection}
                className="text-xs text-slate-400 hover:text-white underline ml-2"
              >
                Reset
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full h-full p-5 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <ScanLine className="w-7 h-7" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-200">
              Capture or Upload Food Sample
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              Analyze in real time for poison, contaminants, allergens, and macros
            </p>

            {/* Quick Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mt-4 w-full max-w-xs px-2">
              <button
                type="button"
                onClick={startCamera}
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95 min-h-[44px]"
              >
                <Camera className="w-4 h-4" />
                <span>Take Photo / Camera</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs border border-slate-700 transition-all active:scale-95 min-h-[44px]"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Image</span>
              </button>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 z-30">
            <div className="relative w-16 h-16 flex items-center justify-center mb-4">
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
              <ScanLine className="w-7 h-7 text-emerald-400 animate-pulse" />
            </div>
            <p className="text-sm font-semibold text-slate-100">Forensic AI Analysis in Progress...</p>
            <p className="text-xs text-slate-400 font-mono mt-1 text-center max-w-xs">
              Matching spectrometry, poison databases & USDA nutrient tables
            </p>
          </div>
        )}
      </div>

      {/* Preset Fast-Select Row (Responsive horizontal scroll on mobile, grid on desktop) */}
      <div className="mt-3.5">
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Quick Food Tests
          </span>
          <span className="text-[10px] text-slate-500">Tap to load sample scenario</span>
        </div>

        <div className="flex sm:grid sm:grid-cols-4 gap-2 overflow-x-auto no-scrollbar pb-1">
          {SAMPLE_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => selectPreset(preset)}
                className={`p-2.5 rounded-xl border text-left transition-all flex items-center sm:items-start gap-2.5 shrink-0 sm:shrink min-w-[190px] sm:min-w-0 ${
                  isSelected
                    ? 'bg-emerald-500/10 border-emerald-500/60 ring-1 ring-emerald-500/30'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="text-2xl shrink-0">{preset.svgIcon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-200 truncate">{preset.name}</p>
                  <p
                    className={`text-[10px] font-medium truncate mt-0.5 ${
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

      {/* Voice & Contextual Text Input */}
      <div className="mt-3.5 flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={foodNote}
            onChange={(e) => {
              setFoodNote(e.target.value);
              setSelectedPresetId(null);
            }}
            placeholder="Type notes or speak (e.g., street vendor chicken skewer, smells sour)"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Voice Input Button */}
        <button
          type="button"
          onClick={toggleVoiceInput}
          title={isRecording ? 'Stop listening' : 'Start voice input'}
          className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
            isRecording
              ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
              : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
          }`}
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
      </div>

      {/* Scan CTA Trigger Button */}
      <div className="mt-4">
        <button
          onClick={handleScanSubmit}
          disabled={isLoading}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>Execute Food Security & Nutrition Scan</span>
        </button>
      </div>
    </div>
  );
};
