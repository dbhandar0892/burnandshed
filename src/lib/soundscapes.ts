import { Music, Waves, CloudRain, Flame, Trees, Radio } from 'lucide-react';

export type SoundId = 'pad' | 'ocean' | 'rain' | 'fire' | 'forest' | 'hum';

export const SOUNDS: { id: SoundId; label: string; icon: typeof Music }[] = [
  { id: 'pad', label: 'Ambient', icon: Music },
  { id: 'ocean', label: 'Ocean', icon: Waves },
  { id: 'rain', label: 'Rain', icon: CloudRain },
  { id: 'fire', label: 'Fire', icon: Flame },
  { id: 'forest', label: 'Forest', icon: Trees },
  { id: 'hum', label: 'Deep Hum', icon: Radio },
];

// Base per-sound output level, before the user volume slider
export const BASE_GAIN: Record<SoundId, number> = {
  pad: 0.5,
  ocean: 0.45,
  rain: 0.4,
  fire: 0.45,
  forest: 0.4,
  hum: 0.5,
};

export interface SoundHandle {
  stops: (OscillatorNode | AudioBufferSourceNode)[];
  master: GainNode;
  intervals: ReturnType<typeof setInterval>[];
}

const makeNoiseBuffer = (ctx: AudioContext) => {
  const seconds = 2;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    // Pink-ish noise for a softer, more natural sound
    const white = Math.random() * 2 - 1;
    last = 0.97 * last + 0.03 * white;
    data[i] = last * 3.5;
  }
  return buffer;
};

export const createSoundscape = (
  ctx: AudioContext,
  sound: SoundId,
  volume: number
): SoundHandle => {
  const now = ctx.currentTime;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0, now);
  master.gain.linearRampToValueAtTime(BASE_GAIN[sound] * volume, now + 3);
  master.connect(ctx.destination);

  const stops: (OscillatorNode | AudioBufferSourceNode)[] = [];
  const intervals: ReturnType<typeof setInterval>[] = [];

  if (sound === 'pad') {
    // Warm C major 9th pad with gentle vibrato
    const frequencies = [65.41, 82.41, 98.0, 146.83, 164.81]; // C2, E2, G2, D3, E3
    frequencies.forEach((freq) => {
      const osc = ctx.createOscillator();
      const voice = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.2, now);
      lfoGain.gain.setValueAtTime(2, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.Q.setValueAtTime(1, now);

      voice.gain.setValueAtTime(1 / frequencies.length, now);

      osc.connect(filter);
      filter.connect(voice);
      voice.connect(master);

      osc.start(now);
      stops.push(osc, lfo);
    });
  } else if (sound === 'ocean') {
    // Slow rolling waves: pink noise through a low-pass whose cutoff and
    // level swell on long LFO cycles
    const noise = ctx.createBufferSource();
    noise.buffer = makeNoiseBuffer(ctx);
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    filter.Q.setValueAtTime(0.8, now);

    const waveGain = ctx.createGain();
    waveGain.gain.setValueAtTime(0.6, now);

    // Swell the wave level (~8 second cycle)
    const levelLfo = ctx.createOscillator();
    const levelDepth = ctx.createGain();
    levelLfo.frequency.setValueAtTime(0.12, now);
    levelDepth.gain.setValueAtTime(0.35, now);
    levelLfo.connect(levelDepth);
    levelDepth.connect(waveGain.gain);
    levelLfo.start(now);

    // Sweep the filter cutoff so each wave sounds different
    const filterLfo = ctx.createOscillator();
    const filterDepth = ctx.createGain();
    filterLfo.frequency.setValueAtTime(0.07, now);
    filterDepth.gain.setValueAtTime(250, now);
    filterLfo.connect(filterDepth);
    filterDepth.connect(filter.frequency);
    filterLfo.start(now);

    noise.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(master);
    noise.start(now);

    stops.push(noise, levelLfo, filterLfo);
  } else if (sound === 'rain') {
    // Rain: steady filtered hiss plus random soft droplet ticks
    const noise = ctx.createBufferSource();
    noise.buffer = makeNoiseBuffer(ctx);
    noise.loop = true;

    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.setValueAtTime(1800, now);
    band.Q.setValueAtTime(0.5, now);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.55, now);

    noise.connect(band);
    band.connect(rainGain);
    rainGain.connect(master);
    noise.start(now);
    stops.push(noise);

    // Droplet ticks
    intervals.push(
      setInterval(() => {
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const tickGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(900 + Math.random() * 900, t);
        tickGain.gain.setValueAtTime(0.08 + Math.random() * 0.06, t);
        tickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
        osc.connect(tickGain);
        tickGain.connect(master);
        osc.start(t);
        osc.stop(t + 0.1);
      }, 120)
    );
  } else if (sound === 'fire') {
    // Crackling fire: warm low roar plus random crackle pops
    const noise = ctx.createBufferSource();
    noise.buffer = makeNoiseBuffer(ctx);
    noise.loop = true;

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(520, now);
    lp.Q.setValueAtTime(0.7, now);

    const roarGain = ctx.createGain();
    roarGain.gain.setValueAtTime(0.5, now);

    // Slow flicker in the roar level
    const flickerLfo = ctx.createOscillator();
    const flickerDepth = ctx.createGain();
    flickerLfo.frequency.setValueAtTime(0.9, now);
    flickerDepth.gain.setValueAtTime(0.18, now);
    flickerLfo.connect(flickerDepth);
    flickerDepth.connect(roarGain.gain);
    flickerLfo.start(now);

    noise.connect(lp);
    lp.connect(roarGain);
    roarGain.connect(master);
    noise.start(now);
    stops.push(noise, flickerLfo);

    // Crackles: short bursts of filtered noise
    intervals.push(
      setInterval(() => {
        if (Math.random() > 0.65) return;
        const t = ctx.currentTime;
        const pop = ctx.createBufferSource();
        pop.buffer = makeNoiseBuffer(ctx);
        const popFilter = ctx.createBiquadFilter();
        popFilter.type = 'bandpass';
        popFilter.frequency.setValueAtTime(1200 + Math.random() * 2200, t);
        popFilter.Q.setValueAtTime(3, t);
        const popGain = ctx.createGain();
        popGain.gain.setValueAtTime(0.14 + Math.random() * 0.12, t);
        popGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06 + Math.random() * 0.05);
        pop.connect(popFilter);
        popFilter.connect(popGain);
        popGain.connect(master);
        pop.start(t);
        pop.stop(t + 0.15);
      }, 110)
    );
  } else if (sound === 'forest') {
    // Forest night: soft air movement plus occasional cricket chirps
    const noise = ctx.createBufferSource();
    noise.buffer = makeNoiseBuffer(ctx);
    noise.loop = true;

    const airFilter = ctx.createBiquadFilter();
    airFilter.type = 'lowpass';
    airFilter.frequency.setValueAtTime(700, now);
    airFilter.Q.setValueAtTime(0.6, now);

    const airGain = ctx.createGain();
    airGain.gain.setValueAtTime(0.28, now);

    const breezeLfo = ctx.createOscillator();
    const breezeDepth = ctx.createGain();
    breezeLfo.frequency.setValueAtTime(0.06, now);
    breezeDepth.gain.setValueAtTime(0.12, now);
    breezeLfo.connect(breezeDepth);
    breezeDepth.connect(airGain.gain);
    breezeLfo.start(now);

    noise.connect(airFilter);
    airFilter.connect(airGain);
    airGain.connect(master);
    noise.start(now);
    stops.push(noise, breezeLfo);

    // Crickets: short high trills at irregular intervals
    intervals.push(
      setInterval(() => {
        if (Math.random() > 0.35) return;
        const t = ctx.currentTime;
        const base = 3600 + Math.random() * 1200;
        const pulses = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < pulses; i++) {
          const at = t + i * 0.055;
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(base, at);
          g.gain.setValueAtTime(0, at);
          g.gain.linearRampToValueAtTime(0.045, at + 0.008);
          g.gain.exponentialRampToValueAtTime(0.0001, at + 0.035);
          osc.connect(g);
          g.connect(master);
          osc.start(at);
          osc.stop(at + 0.05);
        }
      }, 900)
    );
  } else {
    // Deep hum: low steady drone with slow beating for focus
    const freqs = [55, 55.4, 110, 164.81];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const lp = ctx.createBiquadFilter();

      osc.type = i === 3 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now);

      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(400, now);

      g.gain.setValueAtTime(i === 3 ? 0.12 : 0.3, now);

      osc.connect(lp);
      lp.connect(g);
      g.connect(master);
      osc.start(now);
      stops.push(osc);
    });

    // Very slow swell so the drone breathes
    const swell = ctx.createOscillator();
    const swellDepth = ctx.createGain();
    swell.frequency.setValueAtTime(0.05, now);
    swellDepth.gain.setValueAtTime(0.1, now);
    swell.connect(swellDepth);
    swellDepth.connect(master.gain);
    swell.start(now);
    stops.push(swell);
  }

  return { stops, master, intervals };
};

export const stopSoundscape = (ctx: AudioContext | null, handle: SoundHandle | null) => {
  if (!ctx || !handle) return;

  const now = ctx.currentTime;

  handle.intervals.forEach(clearInterval);
  handle.master.gain.cancelScheduledValues(now);
  handle.master.gain.setValueAtTime(handle.master.gain.value, now);
  handle.master.gain.linearRampToValueAtTime(0, now + 1);

  setTimeout(() => {
    handle.stops.forEach((s) => {
      try {
        s.stop();
      } catch {
        // already stopped
      }
    });
    handle.master.disconnect();
  }, 1000);
};
