/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { VtuberConfig, AnimationBounceType } from '../types/vtuber';
import { Sliders, Activity, Zap, Eye, Wind, Maximize } from 'lucide-react';

interface MotionControlsProps {
  config: VtuberConfig;
  volumeLevel: number;
  onUpdateConfig: (partial: Partial<VtuberConfig>) => void;
}

export const MotionControls: React.FC<MotionControlsProps> = ({
  config,
  volumeLevel,
  onUpdateConfig,
}) => {
  const bounceOptions: Array<{ id: AnimationBounceType; label: string; desc: string }> = [
    { id: 'bounce', label: 'Salto Clásico', desc: 'Salta hacia arriba al detectar voz' },
    { id: 'squash', label: 'Squash & Stretch', desc: 'Se comprime y estira como caricatura' },
    { id: 'shake', label: 'Temblor Enérgico', desc: 'Vibración rápida para emoción o risas' },
    { id: 'nod', label: 'Asentir Cabeza', desc: 'Inclinación sutil rítmica' },
    { id: 'none', label: 'Solo Labios', desc: 'Sin movimiento corporal' },
  ];

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      {/* Title */}
      <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-2.5">
        <Sliders className="w-4 h-4 text-violet-400" />
        <h3 className="text-sm font-bold text-white tracking-tight">
          Ajustes de Movimiento y Sensibilidad
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Panel 1: Sensibilidad de Voz */}
        <div className="flex flex-col gap-3 p-3 rounded-lg border border-zinc-800/80 bg-zinc-950/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-pink-400" />
              Sensibilidad de Voz (Umbral)
            </span>
            <span className="text-xs font-mono font-bold text-pink-400">{config.threshold}%</span>
          </div>

          <p className="text-[11px] text-zinc-400">
            Nivel mínimo de volumen para que el modelo abra la boca.
          </p>

          <input
            type="range"
            min="1"
            max="90"
            value={config.threshold}
            onChange={(e) => onUpdateConfig({ threshold: Number(e.target.value) })}
            className="w-full accent-pink-500 cursor-pointer"
          />

          {/* Real-time VU comparison */}
          <div className="flex items-center gap-2 pt-1 text-[10px] text-zinc-400 font-mono">
            <span>Volumen actual:</span>
            <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden relative">
              <div
                className={`h-full transition-all duration-75 ${
                  volumeLevel >= config.threshold ? 'bg-pink-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, volumeLevel)}%` }}
              />
              {/* Threshold line indicator */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-sm z-10"
                style={{ left: `${config.threshold}%` }}
              />
            </div>
            <span className="w-8 text-right">{volumeLevel}%</span>
          </div>

          {/* Mouth delay slider */}
          <div className="pt-2 border-t border-zinc-900">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-zinc-300">Retraso al cerrar boca:</span>
              <span className="font-mono text-zinc-400">{config.mouthDelay} ms</span>
            </div>
            <input
              type="range"
              min="50"
              max="450"
              step="10"
              value={config.mouthDelay}
              onChange={(e) => onUpdateConfig({ mouthDelay: Number(e.target.value) })}
              className="w-full accent-violet-500 cursor-pointer"
            />
            <span className="text-[10px] text-zinc-500 mt-0.5 block">
              Evita que la boca parpadee rápido entre sílabas
            </span>
          </div>
        </div>

        {/* Panel 2: Tipo de Movimiento y Salto */}
        <div className="flex flex-col gap-3 p-3 rounded-lg border border-zinc-800/80 bg-zinc-950/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Animación al Hablar
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {bounceOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => onUpdateConfig({ bounceType: opt.id })}
                className={`p-2 rounded text-left transition ${
                  config.bounceType === opt.id
                    ? 'bg-violet-600 text-white font-semibold shadow'
                    : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-850 border border-zinc-800'
                }`}
              >
                <span className="text-xs block">{opt.label}</span>
                <span className="text-[10px] text-zinc-400 opacity-80 block truncate">
                  {opt.desc}
                </span>
              </button>
            ))}
          </div>

          {/* Bounce Height */}
          <div className="pt-2 border-t border-zinc-900">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-zinc-300">Altura del Salto:</span>
              <span className="font-mono text-zinc-400">{config.bounceHeight} px</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={config.bounceHeight}
              onChange={(e) => onUpdateConfig({ bounceHeight: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Bounce Speed */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-300">Frecuencia de rebote:</span>
            <span className="font-mono text-zinc-400">{config.bounceSpeed}x</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={config.bounceSpeed}
            onChange={(e) => onUpdateConfig({ bounceSpeed: Number(e.target.value) })}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>

        {/* Panel 3: Respiración & Pestañeo */}
        <div className="flex flex-col gap-3 p-3 rounded-lg border border-zinc-800/80 bg-zinc-950/60">
          {/* Breathing */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              Respiración en Silencio
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.breathingEnabled}
                onChange={(e) => onUpdateConfig({ breathingEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-300">Intensidad respiración:</span>
            <span className="font-mono text-zinc-400">{config.breathingAmount} px</span>
          </div>
          <input
            type="range"
            min="1"
            max="20"
            disabled={!config.breathingEnabled}
            value={config.breathingAmount}
            onChange={(e) => onUpdateConfig({ breathingAmount: Number(e.target.value) })}
            className="w-full accent-cyan-500 cursor-pointer disabled:opacity-30"
          />

          {/* Blink Rate & Duration */}
          <div className="pt-2 border-t border-zinc-900 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                Pestañeo Aleatorio
              </span>
              <span className="text-xs font-mono text-indigo-400">c/{config.blinkRate}s</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Intervalo de pestañeo:</span>
              <span className="font-mono text-zinc-400">{config.blinkRate} seg</span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              step="0.5"
              value={config.blinkRate}
              onChange={(e) => onUpdateConfig({ blinkRate: Number(e.target.value) })}
              className="w-full accent-indigo-500 cursor-pointer"
            />

            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Duración del pestañeo:</span>
              <span className="font-mono text-zinc-400">{config.blinkDuration} ms</span>
            </div>
            <input
              type="range"
              min="80"
              max="350"
              step="10"
              value={config.blinkDuration}
              onChange={(e) => onUpdateConfig({ blinkDuration: Number(e.target.value) })}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
