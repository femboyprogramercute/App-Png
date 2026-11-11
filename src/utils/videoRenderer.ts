/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VtuberConfig, AvatarStateId } from '../types/vtuber';

export interface RenderProgress {
  currentFrame: number;
  totalFrames: number;
  percent: number;
  statusText: string;
}

export interface RenderOptions {
  audioBlob: Blob;
  images: Record<AvatarStateId, HTMLImageElement>;
  config: VtuberConfig;
  format: 'webm-transparent' | 'webm-chroma';
  chromaColor: string;
  width: number;
  height: number;
  fps: number;
  onProgress?: (p: RenderProgress) => void;
}

export class VideoRenderer {
  public static async renderVideo(options: RenderOptions): Promise<{ blob: Blob; filename: string }> {
    const {
      audioBlob,
      images,
      config,
      format,
      chromaColor,
      width,
      height,
      fps,
      onProgress,
    } = options;

    // 1. Decode audio data offline to extract volume envelope per frame
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const duration = audioBuffer.duration;
    const totalFrames = Math.max(1, Math.ceil(duration * fps));

    // Calculate volume envelope per frame (samplesPerFrame)
    const channelData = audioBuffer.getChannelData(0);
    const samplesPerFrame = Math.floor(audioBuffer.sampleRate / fps);
    const frameVolumes: number[] = [];

    for (let f = 0; f < totalFrames; f++) {
      const start = f * samplesPerFrame;
      const end = Math.min(channelData.length, start + samplesPerFrame);
      let sum = 0;
      let count = 0;
      for (let s = start; s < end; s += 2) {
        sum += Math.abs(channelData[s] || 0);
        count++;
      }
      const avg = count > 0 ? sum / count : 0;
      // map to 0 - 100
      const vol = Math.min(100, Math.round((avg / 0.12) * 100));
      frameVolumes.push(vol);
    }

    // 2. Setup rendering canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: format === 'webm-transparent' });
    if (!ctx) throw new Error('Could not get canvas 2d context');

    // 3. Setup MediaStream & Audio mixing
    const canvasStream = canvas.captureStream(fps);

    // Setup real-time audio playback into MediaStreamDestination for the MediaRecorder
    const playbackCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const streamDest = playbackCtx.createMediaStreamDestination();
    const audioSource = playbackCtx.createBufferSource();
    audioSource.buffer = audioBuffer;
    audioSource.connect(streamDest);

    // Combine video track + audio track
    const combinedTracks = [
      ...canvasStream.getVideoTracks(),
      ...streamDest.stream.getAudioTracks(),
    ];
    const combinedStream = new MediaStream(combinedTracks);

    // 4. Determine supported mime type
    let mimeType = 'video/webm;codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm;codecs=vp8,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }
    }

    const recordedChunks: Blob[] = [];
    const recorder = new MediaRecorder(combinedStream, {
      mimeType,
      videoBitsPerSecond: 10_000_000, // 10 Mbps for crisp 1080p rendering
    });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    const recordPromise = new Promise<{ blob: Blob; filename: string }>((resolve, reject) => {
      recorder.onstop = () => {
        playbackCtx.close();
        audioCtx.close();
        const outputBlob = new Blob(recordedChunks, { type: 'video/webm' });
        const isTransparent = format === 'webm-transparent';
        const filename = `pngtuber_${isTransparent ? 'alpha_transparente' : 'chroma_greenscreen'}_${Date.now()}.webm`;
        resolve({ blob: outputBlob, filename });
      };
      recorder.onerror = (err) => reject(err);
    });

    recorder.start(100);
    audioSource.start(0);

    // 5. Frame-by-frame animation simulation loop
    let lastMouthOpenTime = -9999;
    let isBlinking = false;
    let nextBlinkTime = 1.5 + Math.random() * config.blinkRate;
    let blinkStartTime = 0;

    const frameInterval = 1000 / fps;
    const startTime = performance.now();

    for (let f = 0; f < totalFrames; f++) {
      const currentTimeSec = f / fps;
      const vol = frameVolumes[f] || 0;

      // Mouth talking detection with delay
      if (vol >= config.threshold) {
        lastMouthOpenTime = currentTimeSec;
      }
      const isTalking = (currentTimeSec - lastMouthOpenTime) <= (config.mouthDelay / 1000);

      // Blinking simulation
      if (!isBlinking && currentTimeSec >= nextBlinkTime) {
        isBlinking = true;
        blinkStartTime = currentTimeSec;
      }
      if (isBlinking && (currentTimeSec - blinkStartTime) >= (config.blinkDuration / 1000)) {
        isBlinking = false;
        nextBlinkTime = currentTimeSec + (config.blinkRate * 0.7) + (Math.random() * config.blinkRate * 0.6);
      }

      // Pick avatar image
      let currentState: AvatarStateId = 'idle';
      if (isTalking) {
        currentState = isBlinking ? 'blinkTalk' : 'talk';
      } else {
        currentState = isBlinking ? 'blinkIdle' : 'idle';
      }
      const img = images[currentState] || images.idle;

      // Draw background
      if (format === 'webm-transparent') {
        ctx.clearRect(0, 0, width, height);
      } else {
        ctx.fillStyle = chromaColor;
        ctx.fillRect(0, 0, width, height);
      }

      // Physics & Motion calculations
      let bounceY = 0;
      let scaleX = 1;
      let scaleY = 1;
      let rotation = 0;

      // Idle breathing
      if (config.breathingEnabled) {
        const breathTime = currentTimeSec * config.breathingSpeed * Math.PI * 2;
        bounceY += Math.sin(breathTime) * config.breathingAmount;
      }

      // Bounce/talking motions
      if (isTalking) {
        const bounceCycle = (currentTimeSec * config.bounceSpeed * Math.PI * 4) % (Math.PI * 2);
        if (config.bounceType === 'bounce') {
          bounceY -= Math.abs(Math.sin(bounceCycle)) * config.bounceHeight;
        } else if (config.bounceType === 'squash') {
          const factor = Math.sin(bounceCycle) * 0.08;
          scaleX += factor;
          scaleY -= factor;
          bounceY -= (config.bounceHeight * 0.4);
        } else if (config.bounceType === 'shake') {
          bounceY += (Math.random() - 0.5) * (config.bounceHeight * 0.6);
          rotation = (Math.random() - 0.5) * 0.04;
        } else if (config.bounceType === 'nod') {
          rotation = Math.sin(bounceCycle) * 0.05;
          bounceY -= Math.sin(bounceCycle) * (config.bounceHeight * 0.5);
        }
      }

      // Draw Avatar
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        const centerX = width / 2 + config.offsetX;
        const centerY = height * 0.6 + config.offsetY + bounceY;

        ctx.translate(centerX, centerY);
        ctx.rotate(rotation);
        ctx.scale(config.scale * scaleX, config.scale * scaleY);

        // Aspect fit image
        const targetW = width * 0.55;
        const aspect = img.naturalHeight / img.naturalWidth;
        const drawW = targetW;
        const drawH = targetW * aspect;

        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
      }

      if (onProgress && f % 5 === 0) {
        onProgress({
          currentFrame: f,
          totalFrames,
          percent: Math.min(100, Math.round((f / totalFrames) * 100)),
          statusText: `Renderizando cuadro ${f} de ${totalFrames}...`,
        });
      }

      // Sleep just enough to keep video real-time synchronization with audio
      const elapsed = performance.now() - startTime;
      const targetTime = (f + 1) * frameInterval;
      const waitTime = targetTime - elapsed;
      if (waitTime > 2) {
        await new Promise((r) => setTimeout(r, waitTime));
      }
    }

    if (onProgress) {
      onProgress({
        currentFrame: totalFrames,
        totalFrames,
        percent: 100,
        statusText: 'Finalizando archivo de video...',
      });
    }

    // Stop recorder and return result
    recorder.stop();
    return recordPromise;
  }
}
