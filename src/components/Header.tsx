/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Download, Upload, HelpCircle, Sparkles, MonitorDown, RotateCcw } from 'lucide-react';
import { PRESET_AVATARS } from '../utils/defaultAvatars';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  currentPresetId: string;
  onSelectPreset: (presetId: string) => void;
  onExportPack: () => void;
  onImportPack: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetToCurrentPreset: () => void;
  onOpenGuide: () => void;
  onOpenExportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPresetId,
  onSelectPreset,
  onExportPack,
  onImportPack,
  onResetToCurrentPreset,
  onOpenGuide,
  onOpenExportModal,
}) => {
  const { isInstallable, install } = usePWAInstall();

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur sticky top-0 z-40 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-pink-500 p-0.5 shadow-lg shadow-violet-500/20">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center overflow-hidden">
              <span className="text-xl">🦊</span>
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-zinc-950"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                PNGtuber <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">Studio</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                Para Editores de Video
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">
              Sincroniza tus 4 PNGs con voz y exporta para CapCut, Premiere y DaVinci
            </p>
          </div>
        </div>

        {/* Preset Selector & Action Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Preset Picker */}
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-zinc-400 font-medium">Modelo:</span>
            <select
              value={currentPresetId}
              onChange={(e) => onSelectPreset(e.target.value)}
              className="bg-transparent text-xs text-zinc-100 font-medium focus:outline-none cursor-pointer pr-1"
            >
              {PRESET_AVATARS.map((p) => (
                <option key={p.id} value={p.id} className="bg-zinc-900 text-zinc-200">
                  {p.name}
                </option>
              ))}
              <option value="custom" className="bg-zinc-900 text-zinc-200">
                🎨 Mi Modelo Personalizado
              </option>
            </select>
          </div>

          {/* Reset / Clean buttons */}
          <button
            onClick={onResetToCurrentPreset}
            title="Restablecer imágenes del modelo seleccionado"
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg border border-transparent hover:border-zinc-800 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Export / Import Pack */}
          <button
            onClick={onExportPack}
            title="Guardar pack de avatar (.json)"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Guardar Pack</span>
          </button>

          <label
            title="Cargar pack de avatar (.json)"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg cursor-pointer transition"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Cargar Pack</span>
            <input type="file" accept=".json" onChange={onImportPack} className="hidden" />
          </label>

          {/* Video Editor Guide Button */}
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg transition"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Guía de Editores</span>
          </button>

          {/* PWA Install Button if available */}
          {isInstallable && (
            <button
              onClick={install}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition animate-pulse"
              title="Instalar como aplicación en tu escritorio para usarlo junto a tu editor"
            >
              <MonitorDown className="w-3.5 h-3.5" />
              <span>Instalar App</span>
            </button>
          )}

          {/* Main Action: Export Video */}
          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-lg shadow-md shadow-violet-600/30 transition transform active:scale-95"
          >
            <span>🎬 Exportar Video</span>
          </button>
        </div>
      </div>
    </header>
  );
};
