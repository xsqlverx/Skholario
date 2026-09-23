// Web Audio API Synthesizer for study soundscapes & chimes (Zero external audio files required)

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSuccessChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = "sine";
  osc2.type = "sine";

  // Arpeggiated C-Major Chord (C5 -> E5 -> G5)
  osc1.frequency.setValueAtTime(523.25, now);
  osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.1);
  osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.2);

  osc2.frequency.setValueAtTime(261.63, now);
  osc2.frequency.exponentialRampToValueAtTime(329.63, now + 0.15);

  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.6);
  osc2.stop(now + 0.6);
}

export function playTickSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

  gain.gain.setValueAtTime(0.04, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.05);
}

// Procedural Ambient Noise Generators (Rain, White Noise, Deep Drone)
let ambientNode: AudioNode | null = null;
let ambientGain: GainNode | null = null;

export function startAmbientNoise(type: "rain" | "whitenoise" | "drone", volume = 0.15) {
  stopAmbientNoise();
  const ctx = getAudioContext();
  if (!ctx) return;

  ambientGain = ctx.createGain();
  ambientGain.gain.setValueAtTime(volume, ctx.currentTime);
  ambientGain.connect(ctx.destination);

  if (type === "whitenoise" || type === "rain") {
    // Generate pink/brown filtered noise
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === "rain") {
        // Brown noise filter for rain/waterfall effect
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      } else {
        // White noise
        data[i] = white * 0.3;
      }
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    // Filter to make it warm and cozy
    const filter = ctx.createBiquadFilter();
    filter.type = type === "rain" ? "lowpass" : "bandpass";
    filter.frequency.value = type === "rain" ? 800 : 1200;

    noiseSource.connect(filter);
    filter.connect(ambientGain);
    noiseSource.start();
    ambientNode = noiseSource;
  } else if (type === "drone") {
    // Lo-fi deep warm drone (55Hz A1 + harmonic)
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(55, ctx.currentTime);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 220;

    osc.connect(filter);
    filter.connect(ambientGain);
    osc.start();
    ambientNode = osc;
  }
}

export function stopAmbientNoise() {
  if (ambientNode) {
    try {
      (ambientNode as AudioScheduledSourceNode).stop();
    } catch {
      // ignore if already stopped
    }
    ambientNode.disconnect();
    ambientNode = null;
  }
  if (ambientGain) {
    ambientGain.disconnect();
    ambientGain = null;
  }
}

export function setAmbientVolume(volume: number) {
  if (ambientGain && audioCtx) {
    ambientGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), audioCtx.currentTime);
  }
}
