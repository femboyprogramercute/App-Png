/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Upload,
  Mic,
  MicOff,
  Radio,
  Sliders,
  Volume2,
  Sparkles,
  Repeat,
  Square,
  FileAudio,
} from 'lucide-react';
import { AudioEngine } from '../utils/audioEngine';

interface AudioTimelineProps {
  audioEngine: AudioEngine;
  threshold: number;
  onThresholdChange: (val: number) => void;
  volumeLevel: number;
  isTalking: boolean;
  onAudioLoaded: (blob: Blob, url: string, peaks: number[]) => void;
  currentAudioUrl: string | null;
  currentPeaks: number[];
  onManualTalkToggle: (talking: boolean) => void;
  isMicActive: boolean;
  onToggleMic: () => void;
}

export const AudioTimeline: React.FC<AudioTimelineProps> = ({
  audioEngine,
  threshold,
  onThresholdChange,
  volumeLevel,
  isTalking,
  onAudioLoaded,
  currentAudioUrl,
  currentPeaks,
  onManualTalkToggle,
  isMicActive,
  onToggleMic,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [isGeneratingDemo, setIsGeneratingDemo] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize and attach audio element to AudioEngine
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = 'anonymous';
    }
    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      if (!isLooping) {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [isLooping]);

  // Keep Audio element attached to audioEngine for analyser
  useEffect(() => {
    if (audioRef.current && currentAudioUrl) {
      audioRef.current.src = currentAudioUrl;
      audioRef.current.loop = isLooping;
      audioRef.current.playbackRate = playbackRate;
      audioEngine.attachAudioElement(audioRef.current);
    }
  }, [currentAudioUrl, isLooping, playbackRate, audioEngine]);

  // Sync play/pause
  const togglePlay = () => {
    if (!audioRef.current || !currentAudioUrl) return;
    audioEngine.init();

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => console.error(e));
    }
  };

  // Keyboard shortcut Spacebar for play/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentAudioUrl]);

  // Track playback time
  useEffect(() => {
    const updateTime = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
      animationFrameRef.current = requestAnimationFrame(updateTime);
    };

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateTime);
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying]);

  // Draw Waveform and Playhead
  useEffect(() => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Draw background track
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, w, h);

    // Draw threshold line across canvas
    const thresholdY = h - (threshold / 100) * h;
    ctx.beginPath();
    ctx.setLineDash([4 * dpr, 4 * dpr]);
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 1.5 * dpr;
    ctx.moveTo(0, thresholdY);
    ctx.lineTo(w, thresholdY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Threshold text tag
    ctx.fillStyle = '#ec4899';
    ctx.font = `${9 * dpr}px sans-serif`;
    ctx.fillText(`Corte de voz (${threshold}%)`, 8 * dpr, thresholdY - 4 * dpr);

    // Draw waveform bars
    const peaks = currentPeaks.length > 0 ? currentPeaks : Array(80).fill(0.05);
    const barWidth = (w / peaks.length) * 0.7;
    const barSpacing = (w / peaks.length) * 0.3;

    peaks.forEach((peak, i) => {
      const x = i * (barWidth + barSpacing);
      const barHeight = Math.max(4 * dpr, peak * h * 0.9);
      const y = h - barHeight;

      // Color active bars before playhead differently
      const progress = duration > 0 ? currentTime / duration : 0;
      const isPast = (i / peaks.length) <= progress;

      if (isPast) {
        ctx.fillStyle = peak * 100 >= threshold ? '#a855f7' : '#6366f1';
      } else {
        ctx.fillStyle = peak * 100 >= threshold ? '#7c3aed' : '#3f3f46';
      }

      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, [2 * dpr, 2 * dpr, 0, 0]);
      ctx.fill();
    });

    // Draw Playhead cursor line
    if (duration > 0) {
      const playheadX = (currentTime / duration) * w;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2 * dpr;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, h);
      ctx.stroke();

      // Playhead triangle handle
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(playheadX - 6 * dpr, 0);
      ctx.lineTo(playheadX + 6 * dpr, 0);
      ctx.lineTo(playheadX, 8 * dpr);
      ctx.closePath();
      ctx.fill();
    }
  }, [currentPeaks, currentTime, duration, threshold]);

  // Scrub click on waveform canvas
  const handleWaveformClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!audioRef.current || duration <= 0) return;
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    const newTime = ratio * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Upload custom audio file
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|ogg|m4a|aac|webm)$/i)) {
      alert('Por favor selecciona un archivo de audio válido (MP3, WAV, OGG, M4A).');
      return;
    }
    const url = URL.createObjectURL(file);
    const peaks = await AudioEngine.extractWaveform(file);
    onAudioLoaded(file, url, peaks);
  };

  // Generate demo voice clip
  const handleLoadDemo = async (type: 'intro' | 'excited' | 'tutorial') => {
    setIsGeneratingDemo(true);
    try {
      const demo = await AudioEngine.generateDemoVoiceover(type);
      onAudioLoaded(demo.blob, demo.url, demo.peaks);
    } finally {
      setIsGeneratingDemo(false);
    }
  };

  // Record voiceover via mic
  const handleToggleRecord = async () => {
    if (isRecording) {
      setIsRecording(false);
      const res = await audioEngine.stopRecording();
      const peaks = await AudioEngine.extractWaveform(res.blob);
      onAudioLoaded(res.blob, res.url, peaks);
    } else {
      setIsRecording(true);
      await audioEngine.startRecording();
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${mins}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      {/* Top Header: Voiceover Tracks & Quick Demos */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileAudio className="w-4 h-4 text-pink-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">
            Pista de Audio / Voz para el Video
          </h3>
          <span className="text-[11px] text-zinc-400">
            {currentAudioUrl ? 'Audio cargado y sincronizado' : 'Elige una voz de prueba o sube tu audio'}
          </span>
        </div>

        {/* Demo Clips Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-zinc-400 font-medium hidden sm:inline">Demos de voz:</span>
          <button
            onClick={() => handleLoadDemo('intro')}
            disabled={isGeneratingDemo}
            className="px-2.5 py-1 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 transition flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-pink-400" />
            <span>"Intro"</span>
          </button>
          <button
            onClick={() => handleLoadDemo('excited')}
            disabled={isGeneratingDemo}
            className="px-2.5 py-1 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 transition flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>"Reacción"</span>
          </button>
          <button
            onClick={() => handleLoadDemo('tutorial')}
            disabled={isGeneratingDemo}
            className="px-2.5 py-1 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 transition flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>"Tutorial"</span>
          </button>
        </div>
      </div>

      {/* Interactive Waveform Canvas */}
      <div className="relative w-full h-20 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 cursor-pointer">
        <canvas
          ref={waveformCanvasRef}
          onClick={handleWaveformClick}
          className="w-full h-full block"
        />

        {!currentAudioUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs text-zinc-400 pointer-events-none">
            Selecciona un demo de voz o sube tu archivo de audio para ver la onda
          </div>
        )}
      </div>

      {/* Playback Controls & Timeline Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-950/70 p-2.5 rounded-lg border border-zinc-800/80">
        <div className="flex items-center gap-2">
          {/* Play / Pause button */}
          <button
            onClick={togglePlay}
            disabled={!currentAudioUrl}
            className={`p-2 rounded-lg text-white font-semibold transition ${
              !currentAudioUrl
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : isPlaying
                ? 'bg-pink-600 hover:bg-pink-500 shadow-lg shadow-pink-600/30'
                : 'bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-600/30'
            }`}
            title="Reproducir / Pausar (Barra espaciadora)"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          {/* Reset button */}
          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                setCurrentTime(0);
              }
            }}
            disabled={!currentAudioUrl}
            className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition"
            title="Volver al inicio"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Loop toggle */}
          <button
            onClick={() => setIsLooping(!isLooping)}
            className={`p-1.5 rounded transition ${
              isLooping ? 'bg-violet-500/20 text-violet-300' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title="Repetir audio en bucle"
          >
            <Repeat className="w-4 h-4" />
          </button>

          {/* Time Counter */}
          <span className="text-xs font-mono text-zinc-300 ml-1">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Speed & Live Options */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-0.5 text-xs text-zinc-400">
            <span>Velocidad:</span>
            {[0.75, 1, 1.25, 1.5].map((rate) => (
              <button
                key={rate}
                onClick={() => setPlaybackRate(rate)}
                className={`px-1 py-0.5 rounded font-mono text-[11px] ${
                  playbackRate === rate ? 'text-violet-400 font-bold' : 'hover:text-zinc-200'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Upload Audio File */}
          <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg cursor-pointer transition">
            <Upload className="w-3.5 h-3.5 text-violet-400" />
            <span>Subir Audio (.mp3, .wav)</span>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              className="hidden"
            />
          </label>

          {/* Record Voiceover Mic Button */}
          <button
            onClick={handleToggleRecord}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
              isRecording
                ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
            }`}
            title="Graba tu voz con el micrófono para crear la pista de audio"
          >
            {isRecording ? <Square className="w-3.5 h-3.5 fill-current" /> : <Mic className="w-3.5 h-3.5 text-rose-400" />}
            <span>{isRecording ? 'Detener Grabación' : 'Grabar Voz'}</span>
          </button>
        </div>
      </div>

      {/* Microphone Live Testing & Manual Speech Tester */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {/* Live Mic Test */}
        <div className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleMic}
              className={`p-2 rounded-lg transition ${
                isMicActive
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {isMicActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
            <div>
              <span className="text-xs font-medium text-zinc-200 block">
                {isMicActive ? 'Micrófono en Vivo Activo' : 'Probar con Micrófono'}
              </span>
              <span className="text-[11px] text-zinc-500">
                {isMicActive ? 'Habla al micro para ver al avatar moverse' : 'Haz clic para activar'}
              </span>
            </div>
          </div>

          {/* VU meter bar */}
          <div className="w-24 flex flex-col gap-1 items-end">
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-75 rounded-full ${
                  volumeLevel >= threshold ? 'bg-pink-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, volumeLevel)}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-zinc-400">{volumeLevel}%</span>
          </div>
        </div>

        {/* Manual Test Speech Button */}
        <div className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-800 bg-zinc-950/60">
          <div>
            <span className="text-xs font-medium text-zinc-200 block">
              Prueba Manual de Boca
            </span>
            <span className="text-[11px] text-zinc-500">
              Mantén presionado para forzar boca abierta
            </span>
          </div>

          <button
            onMouseDown={() => onManualTalkToggle(true)}
            onMouseUp={() => onManualTalkToggle(false)}
            onMouseLeave={() => onManualTalkToggle(false)}
            onTouchStart={() => onManualTalkToggle(true)}
            onTouchEnd={() => onManualTalkToggle(false)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/30 active:bg-pink-600 active:text-white transition select-none"
          >
            Presiona para Hablar
          </button>
        </div>
      </div>
    </div>
  );
};
