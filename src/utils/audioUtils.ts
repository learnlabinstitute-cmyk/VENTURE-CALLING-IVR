/**
 * Utility functions for raw PCM audio handling, resampling,
 * Base64 conversions, and gapless Web Audio playback.
 */

// Convert Float32Array audio samples into 16-bit Linear PCM Base64
export function float32To16BitPCMBase64(input: Float32Array): string {
  const buffer = new ArrayBuffer(input.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    // 16-bit PCM scale (-32768 to 32767)
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 16-bit Linear PCM to Float32Array
export function base64ToFloat32PCM(base64: string): Float32Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const dataView = new DataView(bytes.buffer);
  const sampleCount = Math.floor(bytes.length / 2);
  const float32 = new Float32Array(sampleCount);

  for (let i = 0; i < sampleCount; i++) {
    const int16 = dataView.getInt16(i * 2, true);
    float32[i] = int16 < 0 ? int16 / 0x8000 : int16 / 0x7fff;
  }

  return float32;
}

// Resample Float32 array from inRate to outRate (e.g. 48000/44100 to 16000)
export function resampleAudioBuffer(
  audioData: Float32Array,
  inRate: number,
  outRate: number
): Float32Array {
  if (inRate === outRate) return audioData;
  const ratio = inRate / outRate;
  const newLength = Math.round(audioData.length / ratio);
  const result = new Float32Array(newLength);

  for (let i = 0; i < newLength; i++) {
    const position = i * ratio;
    const index = Math.floor(position);
    const fraction = position - index;

    if (index + 1 < audioData.length) {
      result[i] = audioData[index] * (1 - fraction) + audioData[index + 1] * fraction;
    } else {
      result[i] = audioData[index] || 0;
    }
  }

  return result;
}

// Calculate RMS volume level (0 to 1) for visualizers
export function calculateRMS(data: Float32Array): number {
  if (!data || data.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i] * data[i];
  }
  const rms = Math.sqrt(sum / data.length);
  // Amplify slightly for visual impact
  return Math.min(1, rms * 4);
}

// Player class for gapless 24kHz Gemini Live Output
export class LiveAudioPlayer {
  private audioCtx: AudioContext | null = null;
  private nextStartTime: number = 0;
  private activeSourceNodes: AudioBufferSourceNode[] = [];
  private analyserNode: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 1.0;

  constructor() {
    // Initialized lazily on user gesture
  }

  public init() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass({ sampleRate: 24000 });
      
      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = 256;
      this.analyserNode.smoothingTimeConstant = 0.8;

      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.value = this.volume;

      this.gainNode.connect(this.analyserNode);
      this.analyserNode.connect(this.audioCtx.destination);
    }

    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.gainNode) {
      this.gainNode.gain.value = this.isMuted ? 0 : this.volume;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.gainNode) {
      this.gainNode.gain.value = muted ? 0 : this.volume;
    }
  }

  public playPCMChunk(base64Data: string) {
    this.init();
    if (!this.audioCtx || !this.gainNode) return;

    try {
      const float32Samples = base64ToFloat32PCM(base64Data);
      if (float32Samples.length === 0) return;

      const audioBuffer = this.audioCtx.createBuffer(
        1,
        float32Samples.length,
        24000
      );
      audioBuffer.getChannelData(0).set(float32Samples);

      const sourceNode = this.audioCtx.createBufferSource();
      sourceNode.buffer = audioBuffer;
      sourceNode.connect(this.gainNode);

      const currentTime = this.audioCtx.currentTime;
      // Gapless scheduling
      const startTime = Math.max(currentTime + 0.005, this.nextStartTime);
      sourceNode.start(startTime);

      this.nextStartTime = startTime + audioBuffer.duration;
      this.activeSourceNodes.push(sourceNode);

      sourceNode.onended = () => {
        const idx = this.activeSourceNodes.indexOf(sourceNode);
        if (idx > -1) {
          this.activeSourceNodes.splice(idx, 1);
        }
      };
    } catch (e) {
      console.error("Error playing audio chunk:", e);
    }
  }

  // Alias for WebSocket / Live streaming audio chunks
  public playChunkBase64(base64Data: string) {
    this.playPCMChunk(base64Data);
  }

  // Play full base64 audio response (decodes standard audio container or raw 24kHz PCM)
  public async playBase64Audio(base64Data: string): Promise<void> {
    this.init();
    if (!this.audioCtx || !this.gainNode) return;

    try {
      const cleanBase64 = base64Data.replace(/[\r\n\t ]/g, "");
      const binaryString = atob(cleanBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Try decoding as container (WAV, MP3, etc.)
      try {
        const audioBuffer = await this.audioCtx.decodeAudioData(bytes.buffer.slice(0));
        await this.playAudioBuffer(audioBuffer);
        return;
      } catch {
        // Fall back to raw 24kHz PCM AudioBuffer
        const float32Samples = base64ToFloat32PCM(cleanBase64);
        if (float32Samples.length > 0) {
          const audioBuffer = this.audioCtx.createBuffer(1, float32Samples.length, 24000);
          audioBuffer.getChannelData(0).set(float32Samples);
          await this.playAudioBuffer(audioBuffer);
          return;
        }
      }
    } catch (e) {
      console.error("Error in playBase64Audio:", e);
      this.playPCMChunk(base64Data);
    }
  }

  private playAudioBuffer(audioBuffer: AudioBuffer): Promise<void> {
    return new Promise((resolve) => {
      if (!this.audioCtx || !this.gainNode) {
        resolve();
        return;
      }
      const sourceNode = this.audioCtx.createBufferSource();
      sourceNode.buffer = audioBuffer;
      sourceNode.connect(this.gainNode);
      this.activeSourceNodes.push(sourceNode);

      sourceNode.onended = () => {
        const idx = this.activeSourceNodes.indexOf(sourceNode);
        if (idx > -1) {
          this.activeSourceNodes.splice(idx, 1);
        }
        resolve();
      };

      sourceNode.start();
    });
  }

  public getAudioFrequencyData(targetArray: Uint8Array): void {
    if (this.analyserNode) {
      this.analyserNode.getByteFrequencyData(targetArray);
    }
  }

  public getAudioLevel(): number {
    if (!this.analyserNode) return 0;
    const data = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i];
    }
    const avg = sum / (data.length * 255);
    return Math.min(1, avg * 2.2);
  }

  public isPlaying(): boolean {
    if (!this.audioCtx) return false;
    return this.audioCtx.currentTime < this.nextStartTime;
  }

  public stopAll() {
    this.activeSourceNodes.forEach((node) => {
      try {
        node.stop();
        node.disconnect();
      } catch (e) {}
    });
    this.activeSourceNodes = [];
    if (this.audioCtx) {
      this.nextStartTime = this.audioCtx.currentTime;
    }
  }

  public close() {
    this.stopAll();
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}

// WAV encoder for creating downloadable audio blobs
export function encodeWAV(samples: Float32Array, sampleRate: number = 24000): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, "RIFF");
  // file length
  view.setUint32(4, 36 + samples.length * 2, true);
  // RIFF type
  writeString(view, 8, "WAVE");
  // format chunk identifier
  writeString(view, 12, "fmt ");
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw PCM = 1)
  view.setUint16(20, 1, true);
  // channel count (1 = mono)
  view.setUint16(22, 1, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sampleRate * 2 * 1)
  view.setUint32(28, sampleRate * 2, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  writeString(view, 36, "data");
  // data chunk length
  view.setUint32(40, samples.length * 2, true);

  // write PCM samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([view], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// DTMF Tone Frequencies Map
const DTMF_FREQS: Record<string, [number, number]> = {
  "1": [697, 1209],
  "2": [697, 1336],
  "3": [697, 1477],
  "4": [770, 1209],
  "5": [770, 1336],
  "6": [770, 1477],
  "7": [852, 1209],
  "8": [852, 1336],
  "9": [852, 1477],
  "*": [941, 1209],
  "0": [941, 1336],
  "#": [941, 1477],
};

let soundAudioCtx: AudioContext | null = null;
function getSoundAudioContext(): AudioContext {
  if (!soundAudioCtx || soundAudioCtx.state === "closed") {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    soundAudioCtx = new AudioCtxClass();
  }
  if (soundAudioCtx.state === "suspended") {
    soundAudioCtx.resume();
  }
  return soundAudioCtx;
}

// Play authentic iPhone DTMF keypad tone
export function playDTMFTone(key: string, durationMs: number = 180) {
  try {
    const freqs = DTMF_FREQS[key];
    if (!freqs) return;
    const ctx = getSoundAudioContext();
    const now = ctx.currentTime;
    const duration = durationMs / 1000;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "sine";
    osc2.type = "sine";
    osc1.frequency.setValueAtTime(freqs[0], now);
    osc2.frequency.setValueAtTime(freqs[1], now);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  } catch (err) {
    // Audio context not allowed without gesture
  }
}

// Play dialing / ring tone
export function playRingSound() {
  try {
    const ctx = getSoundAudioContext();
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "sine";
    osc2.type = "sine";
    osc1.frequency.setValueAtTime(440, now);
    osc2.frequency.setValueAtTime(480, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.setValueAtTime(0.08, now + 1.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.4);
    osc2.stop(now + 1.4);
  } catch (e) {}
}

// Play call end / disconnect click
export function playHangupSound() {
  try {
    const ctx = getSoundAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.setValueAtTime(320, now + 0.12);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  } catch (e) {}
}

// Cache voices as soon as browser notifies
let cachedVoices: SpeechSynthesisVoice[] = [];
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  try {
    cachedVoices = window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoices = window.speechSynthesis.getVoices();
    };
  } catch {}
}

/**
 * Natural Speech Synthesis Helper.
 * Carefully avoids mechanical or robotic default voices by selecting
 * high-fidelity neural/natural female Hindi/Indian voices with warm cadence.
 */
export function speakTextViaSpeechSynthesis(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  lang: string = "hi-IN"
): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    if (onEnd) onEnd();
    return false;
  }

  try {
    window.speechSynthesis.cancel();

    // Clean text of markdown, bullet markers, asterisks, brackets
    const cleanText = text
      .replace(/[*_#`[\]()]/g, " ")
      .replace(/https?:\/\/\S+/gi, "link")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanText) {
      if (onEnd) onEnd();
      return false;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Get current or cached voices
    let voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) {
      voices = cachedVoices;
    }

    // Select the warmest, most natural voice available (avoiding local robotic synthesizer)
    const selectedVoice =
      voices.find(
        (v) =>
          (v.lang.startsWith("hi") || v.lang.includes("IN")) &&
          (v.name.toLowerCase().includes("natural") ||
            v.name.toLowerCase().includes("online") ||
            v.name.toLowerCase().includes("neural") ||
            v.name.toLowerCase().includes("google") ||
            v.name.toLowerCase().includes("swara") ||
            v.name.toLowerCase().includes("neerja") ||
            v.name.toLowerCase().includes("kalpana"))
      ) ||
      voices.find((v) => v.lang.startsWith("hi") && !v.name.toLowerCase().includes("espeak")) ||
      voices.find(
        (v) =>
          (v.lang.includes("en-IN") || v.lang.includes("hi")) &&
          v.name.toLowerCase().includes("female")
      ) ||
      voices.find(
        (v) =>
          (v.name.toLowerCase().includes("natural") ||
            v.name.toLowerCase().includes("neural") ||
            v.name.toLowerCase().includes("google")) &&
          v.name.toLowerCase().includes("female")
      ) ||
      voices.find((v) => v.lang.startsWith("hi")) ||
      voices.find((v) => v.lang.includes("en-IN")) ||
      voices.find((v) => v.name.toLowerCase().includes("samantha")) ||
      voices.find((v) => v.lang.startsWith("en"));

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = lang;
    }

    // Natural, warm conversational cadence (not fast or robotic)
    utterance.rate = 0.94;
    utterance.pitch = 1.0;

    let hasEnded = false;
    const finish = () => {
      if (!hasEnded) {
        hasEnded = true;
        if (onEnd) onEnd();
      }
    };

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = finish;
    utterance.onerror = (e) => {
      console.warn("speechSynthesis notice:", e);
      finish();
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.warn("Speech synthesis invocation failed:", err);
    if (onEnd) onEnd();
    return false;
  }
}

export function stopSpeechSynthesis() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
}

