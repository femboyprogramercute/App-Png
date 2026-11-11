/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class AudioEngine {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private audioSourceNode: MediaElementAudioSourceNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  private dataArray: Uint8Array | null = null;

  public init() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.4;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public getAudioContext(): AudioContext | null {
    this.init();
    return this.audioCtx;
  }

  // --- Microphone Support ---
  public async startMicrophone(): Promise<MediaStream> {
    this.init();
    if (!this.audioCtx || !this.analyser) {
      throw new Error('Audio context not initialized');
    }

    // Stop previous mic if any
    this.stopMicrophone();

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    this.micStream = stream;
    this.micSource = this.audioCtx.createMediaStreamSource(stream);
    this.micSource.connect(this.analyser);
    // Note: Do not connect micSource to destination to prevent feedback loop!
    return stream;
  }

  public stopMicrophone() {
    if (this.micSource) {
      try {
        this.micSource.disconnect();
      } catch {
        // ignore
      }
      this.micSource = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
  }

  // --- Audio Element Support (Voiceover Track) ---
  public attachAudioElement(audio: HTMLAudioElement) {
    this.init();
    if (!this.audioCtx || !this.analyser) return;

    if (this.audioElement !== audio) {
      this.audioElement = audio;
      try {
        if (!this.audioSourceNode) {
          this.audioSourceNode = this.audioCtx.createMediaElementSource(audio);
          this.audioSourceNode.connect(this.analyser);
          this.analyser.connect(this.audioCtx.destination);
        }
      } catch {
        // Source node already connected or cors, handled gracefully
      }
    }
  }

  // --- Volume Calculation (0 - 100) ---
  public getVolumeLevel(): number {
    if (!this.analyser || !this.dataArray) return 0;
    this.analyser.getByteFrequencyData(this.dataArray as any);

    let sum = 0;
    // We focus on vocal frequencies (approx 80Hz - 2500Hz)
    const binCount = this.dataArray.length;
    const vocalRange = Math.min(binCount, Math.floor(binCount * 0.7));

    for (let i = 2; i < vocalRange; i++) {
      sum += this.dataArray[i];
    }

    const average = sum / (vocalRange - 2 || 1);
    // Map 0-255 to 0-100 with a slight non-linear curve for responsive voice sensing
    const normalized = Math.min(100, Math.round((average / 180) * 100));
    return normalized;
  }

  // --- Voiceover Microphone Recording ---
  public async startRecording(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.recordedChunks = [];
    this.mediaRecorder = new MediaRecorder(stream);

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.recordedChunks.push(e.data);
      }
    };

    this.mediaRecorder.start();
  }

  public stopRecording(): Promise<{ blob: Blob; url: string }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No media recorder active'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        this.mediaRecorder?.stream.getTracks().forEach((track) => track.stop());
        this.mediaRecorder = null;
        resolve({ blob, url });
      };

      this.mediaRecorder.stop();
    });
  }

  // Extract waveform peaks from an AudioBuffer or File
  public static async extractWaveform(file: File | Blob, sampleCount = 120): Promise<number[]> {
    const arrayBuffer = await file.arrayBuffer();
    const tempCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    try {
      const audioBuffer = await tempCtx.decodeAudioData(arrayBuffer);
      const rawData = audioBuffer.getChannelData(0); // primary channel
      const step = Math.floor(rawData.length / sampleCount);
      const peaks: number[] = [];

      for (let i = 0; i < sampleCount; i++) {
        const start = i * step;
        let max = 0;
        for (let j = 0; j < step; j += 4) {
          const val = Math.abs(rawData[start + j] || 0);
          if (val > max) max = val;
        }
        peaks.push(Math.min(1, max));
      }
      return peaks;
    } finally {
      tempCtx.close();
    }
  }

  // Generate demo voice sound synth into a playable audio blob
  public static generateDemoVoiceover(type: 'intro' | 'excited' | 'tutorial'): Promise<{ blob: Blob; url: string; peaks: number[] }> {
    return new Promise((resolve) => {
      const sampleRate = 44100;
      let duration = 4.0;
      if (type === 'excited') duration = 3.5;
      if (type === 'tutorial') duration = 5.0;

      const numFrames = Math.floor(sampleRate * duration);
      const offlineCtx = new OfflineAudioContext(1, numFrames, sampleRate);

      // Create speech-like formant synthesizer
      const osc = offlineCtx.createOscillator();
      const osc2 = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();
      const filter = offlineCtx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc2.type = 'triangle';

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, 0);
      filter.Q.setValueAtTime(3.0, 0);

      // Syllables pattern
      let syllables: Array<{ start: number; len: number; pitch: number }> = [];

      if (type === 'intro') {
        // "¡Hola a todos, bienvenidos a mi video!"
        syllables = [
          { start: 0.2, len: 0.25, pitch: 260 },
          { start: 0.5, len: 0.2, pitch: 300 },
          { start: 0.75, len: 0.2, pitch: 280 },
          { start: 1.0, len: 0.25, pitch: 330 },
          { start: 1.4, len: 0.35, pitch: 350 },
          { start: 1.85, len: 0.25, pitch: 290 },
          { start: 2.2, len: 0.3, pitch: 310 },
          { start: 2.6, len: 0.2, pitch: 370 },
          { start: 2.85, len: 0.35, pitch: 400 },
          { start: 3.3, len: 0.4, pitch: 320 },
        ];
      } else if (type === 'excited') {
        // "¡No te lo vas a creer! ¡Miren esta jugada!"
        syllables = [
          { start: 0.15, len: 0.18, pitch: 380 },
          { start: 0.35, len: 0.18, pitch: 420 },
          { start: 0.55, len: 0.25, pitch: 460 },
          { start: 0.9, len: 0.3, pitch: 500 },
          { start: 1.3, len: 0.2, pitch: 390 },
          { start: 1.6, len: 0.3, pitch: 480 },
          { start: 2.0, len: 0.25, pitch: 520 },
          { start: 2.3, len: 0.4, pitch: 550 },
          { start: 2.8, len: 0.35, pitch: 430 },
        ];
      } else {
        // "En este paso vamos a cortar el clip y sincronizar el avatar."
        syllables = [
          { start: 0.2, len: 0.22, pitch: 220 },
          { start: 0.45, len: 0.2, pitch: 240 },
          { start: 0.7, len: 0.28, pitch: 260 },
          { start: 1.1, len: 0.25, pitch: 250 },
          { start: 1.45, len: 0.3, pitch: 290 },
          { start: 1.85, len: 0.25, pitch: 230 },
          { start: 2.2, len: 0.25, pitch: 270 },
          { start: 2.55, len: 0.35, pitch: 300 },
          { start: 3.0, len: 0.25, pitch: 280 },
          { start: 3.35, len: 0.35, pitch: 240 },
          { start: 3.8, len: 0.45, pitch: 260 },
          { start: 4.3, len: 0.35, pitch: 220 },
        ];
      }

      gain.gain.setValueAtTime(0, 0);

      syllables.forEach((s) => {
        osc.frequency.setValueAtTime(s.pitch, s.start);
        osc2.frequency.setValueAtTime(s.pitch * 0.5, s.start);
        filter.frequency.setValueAtTime(s.pitch * 2.8, s.start);

        gain.gain.setValueAtTime(0, s.start);
        gain.gain.linearRampToValueAtTime(0.7, s.start + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, s.start + s.len);
      });

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(offlineCtx.destination);

      osc.start(0);
      osc2.start(0);
      osc.stop(duration);
      osc2.stop(duration);

      offlineCtx.startRendering().then((renderedBuffer) => {
        // Convert to WAV Blob
        const wavBlob = audioBufferToWav(renderedBuffer);
        const url = URL.createObjectURL(wavBlob);

        // Precompute peaks
        const peaks: number[] = [];
        const raw = renderedBuffer.getChannelData(0);
        const step = Math.floor(raw.length / 120);
        for (let i = 0; i < 120; i++) {
          let max = 0;
          for (let j = 0; j < step; j += 4) {
            const v = Math.abs(raw[i * step + j] || 0);
            if (v > max) max = v;
          }
          peaks.push(max);
        }

        resolve({ blob: wavBlob, url, peaks });
      });
    });
  }
}

// Minimal AudioBuffer to WAV encoder
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const length = buffer.length * blockAlign;
  const bufferArray = new ArrayBuffer(44 + length);
  const view = new DataView(bufferArray);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  view.setUint32(40, length, true);

  // write interleaved samples
  let offset = 44;
  const channelData: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channelData.push(buffer.getChannelData(c));
  }

  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < numChannels; c++) {
      let sample = channelData[c][i];
      sample = Math.max(-1, Math.min(1, sample));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([bufferArray], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
