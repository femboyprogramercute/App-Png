/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { VtuberConfig, AvatarStateId, PreviewBackgroundType } from '../types/vtuber';
import { Maximize2, Move, ZoomIn, ZoomOut, RotateCcw, MonitorPlay, Sparkles } from 'lucide-react';

interface AvatarCanvasProps {
  slots: Record<AvatarStateId, string | null>;
  config: VtuberConfig;
  isTalking: boolean;
  volumeLevel: number;
  activeState: AvatarStateId;
  setActiveState: (state: AvatarStateId) => void;
  bgType: PreviewBackgroundType;
  setBgType: (bg: PreviewBackgroundType) => void;
  onUpdateConfig: (partial: Partial<VtuberConfig>) => void;
}

export const AvatarCanvas: React.FC<AvatarCanvasProps> = ({
  slots,
  config,
  isTalking,
  volumeLevel,
  activeState,
  setActiveState,
  bgType,
  setBgType,
  onUpdateConfig,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Cached HTMLImageElements
  const imagesRef = useRef<Record<AvatarStateId, HTMLImageElement | null>>({
    idle: null,
    talk: null,
    blinkIdle: null,
    blinkTalk: null,
  });

  // Dragging state
  const isDraggingRef = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const startOffset = useRef({ x: 0, y: 0 });

  // Blinking timer state
  const isBlinkingRef = useRef(false);
  const nextBlinkTimeRef = useRef(Date.now() + 2000);
  const blinkEndRef = useRef(0);

  // Load and cache images whenever slots change
  useEffect(() => {
    Object.entries(slots).forEach(([stateKey, url]) => {
      const key = stateKey as AvatarStateId;
      if (url) {
        const img = new Image();
        img.src = url;
        img.onload = () => {
          imagesRef.current[key] = img;
        };
      } else {
        imagesRef.current[key] = null;
      }
    });
  }, [slots]);

  // Main interactive animation render loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let startTime = performance.now();

    const loop = (time: number) => {
      animId = requestAnimationFrame(loop);

      const elapsed = (time - startTime) / 1000;
      const now = Date.now();

      // Check and update blinking logic
      if (!isBlinkingRef.current && now >= nextBlinkTimeRef.current) {
        isBlinkingRef.current = true;
        blinkEndRef.current = now + config.blinkDuration;
      }
      if (isBlinkingRef.current && now >= blinkEndRef.current) {
        isBlinkingRef.current = false;
        // Schedule next random blink based on blinkRate
        const variance = (Math.random() - 0.5) * (config.blinkRate * 800);
        nextBlinkTimeRef.current = now + config.blinkRate * 1000 + variance;
      }

      // Determine active AvatarStateId
      let current: AvatarStateId = 'idle';
      if (isTalking) {
        current = isBlinkingRef.current ? 'blinkTalk' : 'talk';
      } else {
        current = isBlinkingRef.current ? 'blinkIdle' : 'idle';
      }

      // Sync active state back for visual slot highlight
      if (current !== activeState) {
        setActiveState(current);
      }

      // Handle Canvas size
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const displayWidth = Math.floor(rect.width * dpr);
      const displayHeight = Math.floor(rect.height * dpr);

      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
      }

      const w = canvas.width;
      const h = canvas.height;

      // Draw background
      ctx.save();
      if (bgType === 'checker') {
        ctx.clearRect(0, 0, w, h);
        // Draw checkered pattern
        const size = 20 * dpr;
        for (let x = 0; x < w; x += size) {
          for (let y = 0; y < h; y += size) {
            const isDark = (Math.floor(x / size) + Math.floor(y / size)) % 2 === 0;
            ctx.fillStyle = isDark ? '#18181b' : '#27272a';
            ctx.fillRect(x, y, size, size);
          }
        }
      } else if (bgType === 'chroma-green') {
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(0, 0, w, h);
      } else if (bgType === 'chroma-blue') {
        ctx.fillStyle = '#0000ff';
        ctx.fillRect(0, 0, w, h);
      } else if (bgType === 'chroma-magenta') {
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(0, 0, w, h);
      } else if (bgType === 'dark') {
        ctx.fillStyle = '#09090b';
        ctx.fillRect(0, 0, w, h);
      } else if (bgType === 'editor-bg') {
        // Video Editor Mockup Backdrop
        ctx.fillStyle = '#1e1e24';
        ctx.fillRect(0, 0, w, h);
        // Video timeline tracks simulation
        ctx.fillStyle = '#2d2d38';
        ctx.fillRect(0, h * 0.75, w, h * 0.25);
        ctx.fillStyle = '#4f46e5';
        ctx.fillRect(20 * dpr, h * 0.78, w * 0.45, 24 * dpr);
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(w * 0.5, h * 0.78, w * 0.4, 24 * dpr);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(20 * dpr, h * 0.86, w * 0.85, 20 * dpr);
      } else if (bgType === 'gameplay-bg') {
        // Gaming Backdrop gradient simulation
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#1e1b4b');
        grad.addColorStop(0.5, '#312e81');
        grad.addColorStop(1, '#0f172a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      // Physics & Motions
      let bounceY = 0;
      let scaleX = 1;
      let scaleY = 1;
      let rotation = 0;

      // Breathing animation
      if (config.breathingEnabled) {
        const breathTime = elapsed * config.breathingSpeed * Math.PI * 2;
        bounceY += Math.sin(breathTime) * config.breathingAmount * dpr;
      }

      // Talking bounces & squashes
      if (isTalking) {
        const bounceCycle = (elapsed * config.bounceSpeed * Math.PI * 4) % (Math.PI * 2);
        if (config.bounceType === 'bounce') {
          bounceY -= Math.abs(Math.sin(bounceCycle)) * config.bounceHeight * dpr;
        } else if (config.bounceType === 'squash') {
          const factor = Math.sin(bounceCycle) * 0.08;
          scaleX += factor;
          scaleY -= factor;
          bounceY -= (config.bounceHeight * 0.4) * dpr;
        } else if (config.bounceType === 'shake') {
          bounceY += (Math.random() - 0.5) * (config.bounceHeight * 0.6) * dpr;
          rotation = (Math.random() - 0.5) * 0.04;
        } else if (config.bounceType === 'nod') {
          rotation = Math.sin(bounceCycle) * 0.05;
          bounceY -= Math.sin(bounceCycle) * (config.bounceHeight * 0.5) * dpr;
        }
      }

      // Draw Avatar Image
      const activeImg = imagesRef.current[current] || imagesRef.current.idle;

      if (activeImg && activeImg.complete && activeImg.naturalWidth > 0) {
        ctx.save();
        const centerX = w / 2 + config.offsetX * dpr;
        const centerY = h * 0.55 + config.offsetY * dpr + bounceY;

        ctx.translate(centerX, centerY);
        ctx.rotate(rotation);
        ctx.scale(config.scale * scaleX, config.scale * scaleY);

        const targetW = w * 0.5;
        const aspect = activeImg.naturalHeight / activeImg.naturalWidth;
        const drawW = targetW;
        const drawH = targetW * aspect;

        ctx.drawImage(activeImg, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
      } else {
        // Placeholder text if no image
        ctx.fillStyle = '#71717a';
        ctx.font = `${14 * dpr}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('Sube una imagen o selecciona un modelo para comenzar', w / 2, h / 2);
      }

      ctx.restore();
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [config, isTalking, bgType, activeState, setActiveState]);

  // Handle Drag to position avatar
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    startOffset.current = { x: config.offsetX, y: config.offsetY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    onUpdateConfig({
      offsetX: Math.round(startOffset.current.x + dx),
      offsetY: Math.round(startOffset.current.y + dy),
    });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Fullscreen trigger
  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl"
    >
      {/* Canvas Top Bar */}
      <div className="p-2.5 px-3 flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 bg-zinc-900/70">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isTalking ? 'bg-pink-500 animate-ping' : 'bg-emerald-500'
              }`}
            />
            <span className="text-xs font-semibold text-white tracking-tight">
              {isTalking ? 'Hablando' : 'Silencio / Idle'}
            </span>
          </div>

          <span className="text-[11px] text-zinc-400 font-mono hidden sm:inline">
            Volumen: {volumeLevel}%
          </span>
        </div>

        {/* Background Switcher for Video Editors */}
        <div className="flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800 rounded-lg p-1">
          <span className="text-[10px] text-zinc-400 px-1 font-medium hidden md:inline">
            Fondo:
          </span>
          <button
            onClick={() => setBgType('checker')}
            title="Transparente (Patrón cuadriculado)"
            className={`px-2 py-0.5 text-[11px] rounded transition ${
              bgType === 'checker' ? 'bg-violet-600 text-white font-semibold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Transparente
          </button>
          <button
            onClick={() => setBgType('chroma-green')}
            title="Pantalla Verde (Chroma Key #00FF00)"
            className={`px-2 py-0.5 text-[11px] rounded transition flex items-center gap-1 ${
              bgType === 'chroma-green' ? 'bg-emerald-600 text-white font-semibold' : 'text-emerald-400 hover:text-emerald-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#00ff00]"></span>
            Chroma Verde
          </button>
          <button
            onClick={() => setBgType('chroma-blue')}
            title="Pantalla Azul (Chroma Blue #0000FF)"
            className={`px-2 py-0.5 text-[11px] rounded transition flex items-center gap-1 ${
              bgType === 'chroma-blue' ? 'bg-blue-600 text-white font-semibold' : 'text-blue-400 hover:text-blue-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#0000ff]"></span>
            Azul
          </button>
          <button
            onClick={() => setBgType('editor-bg')}
            title="Vista previa sobre Línea de Tiempo de Editor de Video"
            className={`px-2 py-0.5 text-[11px] rounded transition hidden lg:inline ${
              bgType === 'editor-bg' ? 'bg-indigo-600 text-white font-semibold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Línea de Tiempo
          </button>
        </div>

        {/* Canvas Quick Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onUpdateConfig({ scale: Math.max(0.5, config.scale - 0.1) })}
            title="Reducir tamaño"
            className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-zinc-400 w-8 text-center">
            {Math.round(config.scale * 100)}%
          </span>
          <button
            onClick={() => onUpdateConfig({ scale: Math.min(2.5, config.scale + 0.1) })}
            title="Aumentar tamaño"
            className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onUpdateConfig({ offsetX: 0, offsetY: 0, scale: 1.0 })}
            title="Centrar posición"
            className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition ml-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleFullscreen}
            title="Pantalla completa"
            className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div
        className="relative w-full h-[380px] sm:h-[460px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Drag Hint overlay on bottom left */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur text-[11px] text-zinc-300 pointer-events-none">
          <Move className="w-3 h-3 text-violet-400" />
          <span>Arrastra para mover el avatar</span>
        </div>
      </div>
    </div>
  );
};
