/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AvatarStateId } from '../types/vtuber';
import { ImageSlotCard } from './ImageSlotCard';
import { Layers, FolderArchive, Info, Wand2 } from 'lucide-react';

interface SlotManagerProps {
  slots: Record<AvatarStateId, string | null>;
  activeState: AvatarStateId;
  onSlotChange: (id: AvatarStateId, dataUrl: string) => void;
  onClearSlot: (id: AvatarStateId) => void;
  onBulkUpload: (files: FileList | File[]) => void;
}

export const SlotManager: React.FC<SlotManagerProps> = ({
  slots,
  activeState,
  onSlotChange,
  onClearSlot,
  onBulkUpload,
}) => {
  const [isBulkDragOver, setIsBulkDragOver] = useState(false);

  const slotMetadata: Array<{
    id: AvatarStateId;
    label: string;
    subtitle: string;
    eyesOpen: boolean;
    mouthOpen: boolean;
  }> = [
    {
      id: 'idle',
      label: '1. Reposo (Boca Cerrada)',
      subtitle: 'Ojos abiertos • En silencio',
      eyesOpen: true,
      mouthOpen: false,
    },
    {
      id: 'talk',
      label: '2. Hablando (Boca Abierta)',
      subtitle: 'Ojos abiertos • Con voz activa',
      eyesOpen: true,
      mouthOpen: true,
    },
    {
      id: 'blinkIdle',
      label: '3. Pestañeo en Silencio',
      subtitle: 'Ojos cerrados • Boca cerrada',
      eyesOpen: false,
      mouthOpen: false,
    },
    {
      id: 'blinkTalk',
      label: '4. Pestañeo Hablando',
      subtitle: 'Ojos cerrados • Boca abierta',
      eyesOpen: false,
      mouthOpen: true,
    },
  ];

  const handleBulkDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsBulkDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onBulkUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header and bulk upload helper */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-violet-400" />
          <h2 className="text-sm font-bold text-white tracking-tight">
            Los 4 Estados del Modelo 2D (PNGs)
          </h2>
          <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
            4 / 4 Slots
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-violet-300 hover:text-white bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/20 rounded-lg cursor-pointer transition"
            title="Sube los 4 archivos a la vez; el sistema los ordenará automáticamente por nombre"
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span>Subir 4 PNGs juntos</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  onBulkUpload(e.target.files);
                }
              }}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Global Drag & Drop Notice Banner */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsBulkDragOver(true);
        }}
        onDragLeave={() => setIsBulkDragOver(false)}
        onDrop={handleBulkDrop}
        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-3 transition ${
          isBulkDragOver
            ? 'border-violet-500 bg-violet-950/40 text-violet-200'
            : 'border-zinc-800/80 bg-zinc-900/40 text-zinc-400'
        }`}
      >
        <div className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-violet-400 shrink-0" />
          <span>
            <strong>Consejo para editores:</strong> Puedes arrastrar tus 4 archivos PNG aquí. Los nombres que contengan "habla/talk", "cerrad/close", "pestañeo/blink" se asignarán solos.
          </span>
        </div>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {slotMetadata.map((slot) => (
          <ImageSlotCard
            key={slot.id}
            id={slot.id}
            label={slot.label}
            subtitle={slot.subtitle}
            eyesOpen={slot.eyesOpen}
            mouthOpen={slot.mouthOpen}
            imageUrl={slots[slot.id]}
            isActive={activeState === slot.id}
            onImageChange={onSlotChange}
            onClearImage={onClearSlot}
          />
        ))}
      </div>
    </div>
  );
};
