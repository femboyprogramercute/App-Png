/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { Upload, Trash2, Eye, EyeOff, MessageSquare, Volume2, Check } from 'lucide-react';
import { AvatarStateId } from '../types/vtuber';

interface ImageSlotCardProps {
  id: AvatarStateId;
  label: string;
  subtitle: string;
  mouthOpen: boolean;
  eyesOpen: boolean;
  imageUrl: string | null;
  isActive: boolean;
  onImageChange: (id: AvatarStateId, dataUrl: string) => void;
  onClearImage: (id: AvatarStateId) => void;
}

export const ImageSlotCard: React.FC<ImageSlotCardProps> = ({
  id,
  label,
  subtitle,
  mouthOpen,
  eyesOpen,
  imageUrl,
  isActive,
  onImageChange,
  onClearImage,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor sube una imagen válida (PNG, WEBP o SVG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onImageChange(id, result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={`relative flex flex-col rounded-xl border transition-all duration-150 overflow-hidden ${
        isActive
          ? 'border-violet-500 bg-violet-950/20 ring-2 ring-violet-500/50 shadow-lg shadow-violet-500/10'
          : isDragOver
          ? 'border-indigo-400 bg-indigo-950/30'
          : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
      }`}
    >
      {/* Active State Pulse Badge */}
      {isActive && (
        <div className="absolute top-2 left-2 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-600 text-white text-[10px] font-bold tracking-wider uppercase shadow-md animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
          EN PANTALLA
        </div>
      )}

      {/* Top Bar with Status Icons */}
      <div className="p-3 pb-2 flex items-center justify-between border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-white tracking-tight">{label}</span>
          </div>
          <p className="text-[11px] text-zinc-400">{subtitle}</p>
        </div>

        {/* Feature Badges: Eyes & Mouth */}
        <div className="flex items-center gap-1">
          <span
            title={eyesOpen ? 'Ojos Abiertos' : 'Ojos Cerrados (Pestañeo)'}
            className={`p-1 rounded-md text-[10px] flex items-center gap-0.5 ${
              eyesOpen ? 'bg-sky-500/10 text-sky-400' : 'bg-amber-500/10 text-amber-400'
            }`}
          >
            {eyesOpen ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </span>
          <span
            title={mouthOpen ? 'Boca Abierta (Hablando)' : 'Boca Cerrada (Silencio)'}
            className={`p-1 rounded-md text-[10px] flex items-center gap-0.5 ${
              mouthOpen ? 'bg-pink-500/10 text-pink-400' : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            {mouthOpen ? <Volume2 className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
          </span>
        </div>
      </div>

      {/* Thumbnail Preview Area with Checkerboard */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="relative group h-44 w-full flex items-center justify-center cursor-pointer overflow-hidden bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:12px_12px] bg-zinc-950/80"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={label}
            className={`max-h-36 max-w-[85%] object-contain drop-shadow transition-transform duration-200 ${
              isActive ? 'scale-105' : 'group-hover:scale-102'
            }`}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <Upload className="w-8 h-8 text-zinc-600 group-hover:text-violet-400 mb-2 transition" />
            <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200">
              Haz clic o arrastra un PNG
            </span>
            <span className="text-[10px] text-zinc-600 mt-0.5">Soporta PNG transparente</span>
          </div>
        )}

        {/* Hover overlay with Change option */}
        {imageUrl && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition duration-150">
            <span className="px-2.5 py-1 text-xs font-medium text-white bg-violet-600/90 rounded-lg shadow">
              Cambiar imagen
            </span>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/webp,image/svg+xml,image/jpeg"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
          className="hidden"
        />
      </div>

      {/* Action Footer */}
      <div className="p-2 bg-zinc-900/90 flex items-center justify-between text-xs border-t border-zinc-800/80">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1 text-[11px] font-medium text-zinc-300 hover:text-white px-2 py-1 rounded hover:bg-zinc-800 transition"
        >
          <Upload className="w-3 h-3 text-violet-400" />
          Subir PNG
        </button>

        {imageUrl && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClearImage(id);
            }}
            title="Eliminar imagen"
            className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
