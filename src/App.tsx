/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AvatarStateId, VtuberConfig, PreviewBackgroundType } from './types/vtuber';
import { PRESET_AVATARS } from './utils/defaultAvatars';
import { AudioEngine } from './utils/audioEngine';
import { Header } from './components/Header';
import { AvatarCanvas } from './components/AvatarCanvas';
import { SlotManager } from './components/SlotManager';
import { AudioTimeline } from './components/AudioTimeline';
import { MotionControls } from './components/MotionControls';
import { ExportModal } from './components/ExportModal';
import { EditorGuideModal } from './components/EditorGuideModal';

const DEFAULT_CONFIG: VtuberConfig = {
  threshold: 15,
  mouthDelay: 160,
  bounceType: 'bounce',
  bounceHeight: 18,
  bounceSpeed: 4,
  breathingEnabled: true,
  breathingSpeed: 1.2,
  breathingAmount: 4,
  blinkRate: 3.5,
  blinkDuration: 140,
  scale: 1.0,
  offsetX: 0,
  offsetY: 0,
};

export default function App() {
  const audioEngine = useMemo(() => new AudioEngine(), []);

  // Avatar Slots state
  const [currentPresetId, setCurrentPresetId] = useState<string>('aki');
  const [slots, setSlots] = useState<Record<AvatarStateId, string | null>>(() => {
    return { ...PRESET_AVATARS[0].slots };
  });

  // Active state currently rendered on screen
  const [activeState, setActiveState] = useState<AvatarStateId>('idle');

  // Animation & Physics Config
  const [config, setConfig] = useState<VtuberConfig>(DEFAULT_CONFIG);

  // Background preview type
  const [bgType, setBgType] = useState<PreviewBackgroundType>('checker');

  // Audio & speech state
  const [volumeLevel, setVolumeLevel] = useState<number>(0);
  const [isTalking, setIsTalking] = useState<boolean>(false);
  const [manualTalk, setManualTalk] = useState<boolean>(false);
  const [isMicActive, setIsMicActive] = useState<boolean>(false);

  // Loaded Audio Track
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioPeaks, setAudioPeaks] = useState<number[]>([]);

  // Modals
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  const lastMouthOpenTimeRef = useRef<number>(0);

  // Load initial demo audio on start so user can test speech sync instantly
  useEffect(() => {
    AudioEngine.generateDemoVoiceover('intro').then((demo) => {
      setAudioBlob(demo.blob);
      setAudioUrl(demo.url);
      setAudioPeaks(demo.peaks);
    });
  }, []);

  // Volume polling loop for microphone & audio playback
  useEffect(() => {
    let animId: number;

    const pollVolume = () => {
      animId = requestAnimationFrame(pollVolume);
      const vol = audioEngine.getVolumeLevel();
      setVolumeLevel(vol);

      const now = performance.now();
      if (vol >= config.threshold || manualTalk) {
        lastMouthOpenTimeRef.current = now;
      }

      const talking = (now - lastMouthOpenTimeRef.current) <= config.mouthDelay;
      setIsTalking(talking);
    };

    animId = requestAnimationFrame(pollVolume);
    return () => cancelAnimationFrame(animId);
  }, [audioEngine, config.threshold, config.mouthDelay, manualTalk]);

  // Handle Preset Selection
  const handleSelectPreset = (presetId: string) => {
    setCurrentPresetId(presetId);
    const preset = PRESET_AVATARS.find((p) => p.id === presetId);
    if (preset) {
      setSlots({ ...preset.slots });
    }
  };

  // Reset to Current Preset
  const handleResetToCurrentPreset = () => {
    const preset = PRESET_AVATARS.find((p) => p.id === currentPresetId) || PRESET_AVATARS[0];
    setSlots({ ...preset.slots });
  };

  // Update a single slot
  const handleSlotChange = (id: AvatarStateId, dataUrl: string) => {
    setSlots((prev) => ({ ...prev, [id]: dataUrl }));
    setCurrentPresetId('custom');
  };

  // Clear a slot
  const handleClearSlot = (id: AvatarStateId) => {
    setSlots((prev) => ({ ...prev, [id]: null }));
    setCurrentPresetId('custom');
  };

  // Bulk Upload 4 images with intelligent file name heuristic
  const handleBulkUpload = (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    setCurrentPresetId('custom');

    fileArray.forEach((file) => {
      const name = file.name.toLowerCase();
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (!dataUrl) return;

        // Auto-assign heuristic
        if (name.includes('talk') || name.includes('habla') || name.includes('open') || name.includes('boca_abierta')) {
          if (name.includes('blink') || name.includes('pest') || name.includes('cerrad')) {
            handleSlotChange('blinkTalk', dataUrl);
          } else {
            handleSlotChange('talk', dataUrl);
          }
        } else if (name.includes('blink') || name.includes('pest') || name.includes('ojos_cerrados')) {
          handleSlotChange('blinkIdle', dataUrl);
        } else {
          // Default to idle
          handleSlotChange('idle', dataUrl);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Export character pack to JSON
  const handleExportPack = () => {
    const pack = {
      version: 1,
      appName: 'PNGtuber Video Editor Studio',
      slots,
      config,
    };
    const blob = new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `avatar_pack_${currentPresetId}_${Date.now()}.pngtuber.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import character pack from JSON
  const handleImportPack = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        if (json.slots) {
          setSlots(json.slots);
        }
        if (json.config) {
          setConfig((prev) => ({ ...prev, ...json.config }));
        }
        setCurrentPresetId('custom');
      } catch (err) {
        alert('El archivo cargado no es un pack válido de avatar JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Toggle Microphone
  const handleToggleMic = async () => {
    if (isMicActive) {
      audioEngine.stopMicrophone();
      setIsMicActive(false);
    } else {
      try {
        await audioEngine.startMicrophone();
        setIsMicActive(true);
      } catch (err) {
        alert('No se pudo acceder al micrófono. Verifica los permisos del navegador.');
      }
    }
  };

  // Update Config helper
  const handleUpdateConfig = (partial: Partial<VtuberConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-violet-600 selection:text-white">
      {/* Top Navigation */}
      <Header
        currentPresetId={currentPresetId}
        onSelectPreset={handleSelectPreset}
        onExportPack={handleExportPack}
        onImportPack={handleImportPack}
        onResetToCurrentPreset={handleResetToCurrentPreset}
        onOpenGuide={() => setIsGuideModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Top Split: Canvas Stage & Motion Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Canvas Stage (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <AvatarCanvas
              slots={slots}
              config={config}
              isTalking={isTalking}
              volumeLevel={volumeLevel}
              activeState={activeState}
              setActiveState={setActiveState}
              bgType={bgType}
              setBgType={setBgType}
              onUpdateConfig={handleUpdateConfig}
            />

            {/* Audio Voiceover Timeline */}
            <AudioTimeline
              audioEngine={audioEngine}
              threshold={config.threshold}
              onThresholdChange={(val) => handleUpdateConfig({ threshold: val })}
              volumeLevel={volumeLevel}
              isTalking={isTalking}
              currentAudioUrl={audioUrl}
              currentPeaks={audioPeaks}
              onAudioLoaded={(blob, url, peaks) => {
                setAudioBlob(blob);
                setAudioUrl(url);
                setAudioPeaks(peaks);
              }}
              onManualTalkToggle={setManualTalk}
              isMicActive={isMicActive}
              onToggleMic={handleToggleMic}
            />
          </div>

          {/* Right: Physics and Motion controls (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <MotionControls
              config={config}
              volumeLevel={volumeLevel}
              onUpdateConfig={handleUpdateConfig}
            />
          </div>
        </div>

        {/* Bottom Section: The 4 PNG Avatar Slots */}
        <section className="pt-2">
          <SlotManager
            slots={slots}
            activeState={activeState}
            onSlotChange={handleSlotChange}
            onClearSlot={handleClearSlot}
            onBulkUpload={handleBulkUpload}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-4 px-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            PNGtuber Video Editor Studio • Compatible con CapCut, Adobe Premiere Pro, DaVinci Resolve y Sony Vegas
          </p>
          <div className="flex items-center gap-4 text-zinc-400">
            <button
              onClick={() => setIsGuideModalOpen(true)}
              className="hover:text-white transition"
            >
              Guía de Importación
            </button>
            <span>•</span>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="hover:text-white transition text-violet-400 font-medium"
            >
              Exportar Video
            </button>
          </div>
        </div>
      </footer>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        slots={slots}
        config={config}
        audioBlob={audioBlob}
        onOpenGuide={() => {
          setIsExportModalOpen(false);
          setIsGuideModalOpen(true);
        }}
      />

      {/* Video Editor Integration Guide Modal */}
      <EditorGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />
    </div>
  );
}
