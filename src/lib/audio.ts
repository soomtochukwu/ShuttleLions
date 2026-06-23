export type SoundEffect =
  | 'smash'
  | 'rally'
  | 'netDrop'
  | 'courtSqueak'
  | 'whistle'
  | 'serve';

class AudioController {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('click', () => this.init(), { once: true });
      window.addEventListener('touchstart', () => this.init(), { once: true });
      window.addEventListener('keydown', () => this.init(), { once: true });
    }
  }

  private init() {
    if (this.context) return;
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    this.context = new AudioContextClass();
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = 0.3;
    this.masterGain.connect(this.context.destination);
  }

  play(effect: SoundEffect) {
    if (!this.context || !this.masterGain) {
      this.init();
      if (!this.context || !this.masterGain) return;
    }

    if (this.context.state === 'suspended') {
      this.context.resume();
    }

    const t = this.context.currentTime;

    switch (effect) {
      case 'smash':
        this.playSmash(t);
        break;
      case 'rally':
        this.playRally(t);
        break;
      case 'netDrop':
        this.playNetDrop(t);
        break;
      case 'courtSqueak':
        this.playCourtSqueak(t);
        break;
      case 'whistle':
        this.playWhistle(t);
        break;
      case 'serve':
        this.playServe(t);
        break;
    }
  }

  /** Sine spike 800->1400Hz in 15ms + high-pass noise burst */
  private playSmash(t: number) {
    if (!this.context || !this.masterGain) return;

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.015);
    gain.gain.setValueAtTime(1, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.06);

    const bufferSize = this.context.sampleRate * 0.08;
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.context.createBufferSource();
    noise.buffer = buffer;
    const hpFilter = this.context.createBiquadFilter();
    hpFilter.type = 'highpass';
    hpFilter.frequency.setValueAtTime(2000, t);
    const noiseGain = this.context.createGain();
    noiseGain.gain.setValueAtTime(0.4, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
    noise.connect(hpFilter);
    hpFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(t);
    noise.stop(t + 0.08);
  }

  /** Two sine pings 600Hz then 800Hz, 40ms each */
  private playRally(t: number) {
    if (!this.context || !this.masterGain) return;
    this.playNote(600, t, 0.04, 'sine');
    this.playNote(800, t + 0.06, 0.04, 'sine');
  }

  /** Descending 500->200Hz, 150ms, triangle wave */
  private playNetDrop(t: number) {
    if (!this.context || !this.masterGain) return;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(500, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.15);
    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  /** Upward sweep 1500->2800Hz, triangle, 60ms */
  private playCourtSqueak(t: number) {
    if (!this.context || !this.masterGain) return;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1500, t);
    osc.frequency.exponentialRampToValueAtTime(2800, t + 0.06);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  /** 1800Hz 100ms -> pause -> 2200Hz 200ms, sine */
  private playWhistle(t: number) {
    if (!this.context || !this.masterGain) return;
    this.playNote(1800, t, 0.1, 'sine');
    this.playNote(2200, t + 0.15, 0.2, 'sine');
  }

  /** Band-pass white noise 200->1200Hz, 250ms */
  private playServe(t: number) {
    if (!this.context || !this.masterGain) return;
    const bufferSize = this.context.sampleRate * 0.25;
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.context.createBufferSource();
    noise.buffer = buffer;
    const bpFilter = this.context.createBiquadFilter();
    bpFilter.type = 'bandpass';
    bpFilter.frequency.setValueAtTime(700, t);
    bpFilter.Q.setValueAtTime(0.7, t);
    const noiseGain = this.context.createGain();
    noiseGain.gain.setValueAtTime(0.5, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
    noise.connect(bpFilter);
    bpFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(t);
    noise.stop(t + 0.25);
  }

  private vibrate(effect: SoundEffect) {
    if (typeof navigator === 'undefined' || !navigator.vibrate) return;
    switch (effect) {
      case 'smash':
        navigator.vibrate([50, 30, 50]);
        break;
      case 'whistle':
        navigator.vibrate([10, 50, 10, 50, 50, 50, 100]);
        break;
      case 'serve':
        navigator.vibrate([30, 30, 30, 30, 30]);
        break;
      default:
        break;
    }
  }

  private playNote(
    freq: number,
    start: number,
    dur: number,
    type: OscillatorType = 'sine',
  ) {
    if (!this.context || !this.masterGain) return;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.5, start);
    gain.gain.exponentialRampToValueAtTime(0.01, start + dur);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(start);
    osc.stop(start + dur);
  }
}

export const audio = new AudioController();
