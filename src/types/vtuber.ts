/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AvatarStateId = 'idle' | 'talk' | 'blinkIdle' | 'blinkTalk';

export interface AvatarStateSlot {
  id: AvatarStateId;
  label: string;
  subtitle: string;
  mouthOpen: boolean;
  eyesOpen: boolean;
  imageDataUrl: string | null;
  defaultFallbackUrl?: string;
}

export type AnimationBounceType = 'bounce' | 'squash' | 'shake' | 'nod' | 'none';

export interface VtuberConfig {
  threshold: number; // 0 to 100 (% of volume)
  mouthDelay: number; // ms to keep mouth open after drop below threshold
  bounceType: AnimationBounceType;
  bounceHeight: number; // px (0 to 60)
  bounceSpeed: number; // 1 to 10
  breathingEnabled: boolean;
  breathingSpeed: number; // 0.5 to 3
  breathingAmount: number; // px (1 to 15)
  blinkRate: number; // average seconds between blinks (1 to 8)
  blinkDuration: number; // ms (80 to 350)
  scale: number; // 0.5 to 2.5
  offsetX: number; // px
  offsetY: number; // px
}

export type PreviewBackgroundType = 'checker' | 'chroma-green' | 'chroma-blue' | 'chroma-magenta' | 'dark' | 'editor-bg' | 'gameplay-bg';

export interface ExportSettings {
  format: 'webm-transparent' | 'webm-chroma' | 'png-sequence';
  chromaColor: string;
  resolution: { width: number; height: number; label: string };
  fps: 30 | 60;
  audioInclude: boolean;
}

export interface CharacterPreset {
  id: string;
  name: string;
  description: string;
  slots: Record<AvatarStateId, string>;
}
