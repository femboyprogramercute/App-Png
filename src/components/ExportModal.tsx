/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Video, Download, CheckCircle, AlertTriangle, Sparkles, Layers, Sliders } from 'lucide-react';
import { VtuberConfig, AvatarStateId } from '../types/vtuber';
import { VideoRenderer, RenderProgress } from '../utils/videoRenderer';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  slots: Record<AvatarStateId, string | null>;
  config: VtuberConfig;
  audioBlob: Blob | null;
  onOpenGuide: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  slots,
  config,
  audioBlob,
  onOpenGuide,
}) => {
  const [format, setFormat] = useState<'webm-transparent' | 'webm-chroma'>('webm-transparent');
  const [chromaColor, setChromaColor] = useState('#00ff00');
  const [resolutionPreset, setResolutionPreset] = useState<'1080p' | 'vertical' | 'square' | '720p'>('1080p');
  const [fps, setFps] = useState<30 | 60>(30);
  const [isRendering, setIsRendering] = useState(false);
  const [progress, setProgress] = useState<RenderProgress | null>(null);
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);
  const [exportedFilename, setExportedFilename] = useState<string | null>(null);

  if (!isOpen) return null;

  const resolutionMap = {
    '1080p': { width: 1920, height: 1080, label: '1080p Horizontal (16:9)' },
    'vertical': { width: 1080, height: 1920, label: 'TikTok / Shorts / Reels (9:16)' },
    'square': { width: 1080, height: 1080, label: 'Cuadrado (1:1)' },
    '720p': { width: 1280, height: 720, label: '720p Rápido (16:9)' },
  };

  const handleStartRender = async () => {
    if (!audioBlob) {
      alert('Debes tener una pista de audio cargada o grabada para renderizar la sincronización de voz.');
      return;
    }

    setIsRendering(true);
    setProgress({ currentFrame: 0, totalFrames: 100, percent: 0, statusText: 'Iniciando renderizador...' });
    setExportedVideoUrl(null);

    try {
      // Pre-load images
      const images: Record<AvatarStateId, HTMLImageElement> = {
        idle: new Image(),
        talk: new Image(),
        blinkIdle: new Image(),
        blinkTalk: new Image(),
      };

      const loadPromises = Object.entries(slots).map(([key, url]) => {
        return new Promise<void>((resolve) => {
          if (!url) {
            resolve();
            return;
          }
          const img = new Image();
          img.src = url;
          img.onload = () => {
            images[key as AvatarStateId] = img;
            resolve();
          };
          img.onerror = () => resolve();
        });
      });

      await Promise.all(loadPromises);

      const targetRes = resolutionMap[resolutionPreset];

      const result = await VideoRenderer.renderVideo({
        audioBlob,
        images,
        config,
        format,
        chromaColor,
        width: targetRes.width,
        height: targetRes.height,
        fps,
        onProgress: (p) => setProgress(p),
      });

      const videoUrl = URL.createObjectURL(result.blob);
      setExportedVideoUrl(videoUrl);
      setExportedFilename(result.filename);

      // Trigger automatic download
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Render error:', err);
      alert('Hubo un problema al exportar el video: ' + (err as Error).message);
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isRendering}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition disabled:opacity-40"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Exportar para tu Editor de Video
            </h2>
            <p className="text-xs text-zinc-400">
              Genera un video sincronizado con audio para CapCut, Premiere, DaVinci o Vegas
            </p>
          </div>
        </div>

        {/* Check if audio is missing */}
        {!audioBlob && (
          <div className="mb-4 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              Aún no has seleccionado un audio. En la sección "Pista de Audio", elige un demo de voz o sube tu archivo antes de exportar.
            </span>
          </div>
        )}

        {/* Format Selection */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-2">
              Tipo de Fondo del Video:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: WebM Transparent Alpha */}
              <div
                onClick={() => setFormat('webm-transparent')}
                className={`p-3.5 rounded-xl border cursor-pointer transition ${
                  format === 'webm-transparent'
                    ? 'border-violet-500 bg-violet-950/30 ring-1 ring-violet-500'
                    : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-violet-400"></span>
                    Video Transparente (Alpha)
                  </span>
                  <span className="text-[10px] uppercase font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded">
                    Recomendado
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Fondo 100% transparente sin bordes verdes. Solo arrastra el archivo sobre tu video en Premiere, DaVinci o CapCut PC.
                </p>
              </div>

              {/* Option 2: Chroma Key / Green Screen */}
              <div
                onClick={() => setFormat('webm-chroma')}
                className={`p-3.5 rounded-xl border cursor-pointer transition ${
                  format === 'webm-chroma'
                    ? 'border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500'
                    : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    Pantalla Verde (Chroma Key)
                  </span>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    Universal
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Compatible con todos los editores (móviles y PC). Usa el efecto "Chroma Key / Clave de Color" con 1 clic.
                </p>
              </div>
            </div>
          </div>

          {/* Chroma Color Picker (if chroma selected) */}
          {format === 'webm-chroma' && (
            <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
              <span className="text-xs text-zinc-300">Color de la Pantalla:</span>
              <div className="flex items-center gap-2">
                {[
                  { label: 'Verde', hex: '#00ff00' },
                  { label: 'Azul', hex: '#0000ff' },
                  { label: 'Magenta', hex: '#ff00ff' },
                ].map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setChromaColor(c.hex)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs border ${
                      chromaColor === c.hex
                        ? 'border-white bg-zinc-800 text-white font-bold'
                        : 'border-zinc-700 text-zinc-400'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.hex }}></span>
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Resolution & FPS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Resolución:
              </label>
              <select
                value={resolutionPreset}
                onChange={(e) => setResolutionPreset(e.target.value as any)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
              >
                <option value="1080p">1080p Full HD Horizontal (1920x1080)</option>
                <option value="vertical">9:16 Vertical TikTok / Shorts (1080x1920)</option>
                <option value="square">1:1 Cuadrado (1080x1080)</option>
                <option value="720p">720p Rápido (1280x720)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Cuadros por segundo (FPS):
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[30, 60].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFps(f as 30 | 60)}
                    className={`p-2 rounded-lg text-xs font-medium border text-center transition ${
                      fps === f
                        ? 'border-violet-500 bg-violet-600/20 text-violet-300 font-bold'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {f} FPS {f === 60 ? '⚡ Ultra Fluido' : '🎬 Estándar'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Progress Bar during render */}
          {isRendering && progress && (
            <div className="p-4 rounded-xl border border-violet-500/40 bg-violet-950/30 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-semibold text-violet-200">
                <span>{progress.statusText}</span>
                <span>{progress.percent}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-zinc-850 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all duration-150 rounded-full"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <span className="text-[10px] text-zinc-400">
                Sincronizando fotogramas con la pista de voz...
              </span>
            </div>
          )}

          {/* Export Complete Box */}
          {exportedVideoUrl && (
            <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/20 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <CheckCircle className="w-4 h-4" />
                <span>¡Video renderizado con éxito! Descargado automáticamente.</span>
              </div>
              <p className="text-[11px] text-zinc-300">
                Archivo: <span className="font-mono text-white">{exportedFilename}</span>
              </p>
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={exportedVideoUrl}
                  download={exportedFilename || 'pngtuber_video.webm'}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar de Nuevo
                </a>
                <button
                  type="button"
                  onClick={onOpenGuide}
                  className="px-3 py-1.5 text-xs text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition"
                >
                  Ver Cómo Importar en CapCut / Premiere
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-zinc-800/80">
          <button
            type="button"
            onClick={onOpenGuide}
            className="text-xs text-violet-400 hover:text-violet-300 hover:underline flex items-center gap-1"
          >
            <span>📖 ¿Cómo colocarlo en CapCut o Premiere?</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isRendering}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition disabled:opacity-50"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleStartRender}
              disabled={isRendering || !audioBlob}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-lg shadow-lg shadow-violet-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Video className="w-4 h-4" />
              <span>{isRendering ? 'Renderizando...' : 'Renderizar y Descargar'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
