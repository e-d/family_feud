// Soft looping title music, sequenced live with Web Audio. All tunes are original.
import { audioGraph } from './sound'
import type { ThemeId } from './themes'

type Voice = 'epiano' | 'musicbox' | 'pluck' | 'bell' | 'bugle'

interface Song {
  bpm: number
  /** One chord per bar, as MIDI notes, lowest first. */
  chords: number[][]
  /** Chord-tone index per eighth note; -1 rests. */
  arp: number[]
  voice: Voice
  octave: number
  pad: boolean
  bass: boolean
  percussion?: 'hat' | 'jingle' | 'snare'
}

const SONGS: Record<ThemeId, Song> = {
  classic: {
    bpm: 108,
    chords: [
      [60, 64, 67, 71],
      [57, 60, 64, 67],
      [53, 57, 60, 64],
      [55, 59, 62, 65],
    ],
    arp: [0, 2, 1, 3, 2, 1, 3, 2],
    voice: 'epiano',
    octave: 12,
    pad: true,
    bass: true,
    percussion: 'hat',
  },
  halloween: {
    bpm: 76,
    chords: [
      [62, 65, 69],
      [58, 62, 65],
      [55, 58, 62],
      [57, 61, 64],
    ],
    arp: [0, 2, 1, 2, 0, 2, 1, -1],
    voice: 'musicbox',
    octave: 12,
    pad: true,
    bass: false,
  },
  thanksgiving: {
    bpm: 96,
    chords: [
      [55, 59, 62],
      [60, 64, 67],
      [55, 59, 62],
      [62, 66, 69],
    ],
    arp: [0, 1, 2, 1, 0, 1, 2, 1],
    voice: 'pluck',
    octave: 12,
    pad: false,
    bass: true,
  },
  christmas: {
    bpm: 92,
    chords: [
      [65, 69, 72],
      [62, 65, 69],
      [58, 62, 65],
      [60, 64, 67, 70],
    ],
    arp: [0, 1, 2, 1, 2, -1, 1, 0],
    voice: 'bell',
    octave: 12,
    pad: true,
    bass: true,
    percussion: 'jingle',
  },
  valentines: {
    bpm: 68,
    chords: [
      [63, 67, 70, 74],
      [60, 63, 67, 70],
      [56, 60, 63, 67],
      [58, 62, 65, 68],
    ],
    arp: [0, 2, 1, 3, -1, 2, 1, -1],
    voice: 'epiano',
    octave: 12,
    pad: true,
    bass: true,
  },
  independence: {
    bpm: 112,
    chords: [
      [58, 62, 65],
      [63, 67, 70],
      [65, 69, 72],
      [58, 62, 65],
    ],
    arp: [0, -1, 1, 2, 0, -1, 2, 1],
    voice: 'bugle',
    octave: 0,
    pad: false,
    bass: true,
    percussion: 'snare',
  },
}

const VOLUME = 0.16
const LOOKAHEAD = 0.35

const freq = (n: number) => 440 * 2 ** ((n - 69) / 12)

let current: { theme: ThemeId; bus: GainNode; timer: number } | null = null

/** Start (or switch to) the title music for a theme. Safe to call repeatedly. */
export function startMusic(theme: ThemeId) {
  if (current?.theme === theme) return
  stopMusic()
  const graph = audioGraph()
  if (!graph) return
  const { ctx, master, reverb } = graph
  const song = SONGS[theme]

  const bus = ctx.createGain()
  bus.gain.setValueAtTime(0.0001, ctx.currentTime)
  bus.gain.exponentialRampToValueAtTime(VOLUME, ctx.currentTime + 2.5)
  bus.connect(master)
  const send = ctx.createGain()
  send.gain.value = 0.35
  bus.connect(send).connect(reverb)

  const stepLength = 60 / song.bpm / 2
  let step = 0
  let next = ctx.currentTime + 0.1

  const schedule = () => {
    while (next < ctx.currentTime + LOOKAHEAD) {
      playStep(ctx, bus, song, step, next, stepLength)
      next += stepLength
      step++
    }
  }
  schedule()
  current = { theme, bus, timer: window.setInterval(schedule, 100) }
}

/** Fade out and stop whatever is playing. */
export function stopMusic() {
  if (!current) return
  const graph = audioGraph()
  const { bus, timer } = current
  current = null
  window.clearInterval(timer)
  if (!graph) return
  const now = graph.ctx.currentTime
  bus.gain.cancelScheduledValues(now)
  bus.gain.setValueAtTime(Math.max(bus.gain.value, 0.0001), now)
  bus.gain.exponentialRampToValueAtTime(0.0001, now + 1.2)
  window.setTimeout(() => bus.disconnect(), 1500)
}

function playStep(ctx: AudioContext, bus: GainNode, song: Song, step: number, t: number, stepLength: number) {
  const bar = Math.floor(step / 8)
  const beat = step % 8
  const chord = song.chords[bar % song.chords.length]
  const barLength = stepLength * 8

  if (beat === 0) {
    if (song.pad) for (const n of chord) pad(ctx, bus, freq(n), t, barLength, song.voice === 'musicbox' ? 500 : 1100)
    if (song.bass) note(ctx, bus, 'bass', freq(chord[0] - 24), t, stepLength * 3)
  }
  if (song.bass && beat === 4) note(ctx, bus, 'bass', freq(chord[Math.min(2, chord.length - 1)] - 24), t, stepLength * 3)

  const index = song.arp[beat]
  if (index >= 0) note(ctx, bus, song.voice, freq(chord[index % chord.length] + song.octave), t, stepLength * 2)

  if (song.percussion) tick(ctx, bus, song.percussion, beat, t)
}

function note(ctx: AudioContext, bus: GainNode, voice: Voice | 'bass', f: number, t: number, length: number) {
  const parts: [OscillatorType, number, number, number][] =
    voice === 'epiano'
      ? [['sine', 1, 0.22, 1.4], ['sine', 2, 0.05, 0.4]]
      : voice === 'musicbox'
        ? [['sine', 1, 0.18, 1.8], ['sine', 4, 0.04, 0.6], ['triangle', 2, 0.03, 0.9]]
        : voice === 'pluck'
          ? [['triangle', 1, 0.22, 0.6], ['square', 2, 0.02, 0.15]]
          : voice === 'bell'
            ? [['sine', 1, 0.18, 2], ['sine', 2.76, 0.05, 0.8]]
            : voice === 'bugle'
              ? [['sawtooth', 1, 0.11, length]]
              : [['triangle', 1, 0.3, length]]
  for (const [type, ratio, gain, decay] of parts) {
    const osc = ctx.createOscillator()
    const amp = ctx.createGain()
    osc.type = type
    osc.frequency.value = f * ratio
    amp.gain.setValueAtTime(0.0001, t)
    amp.gain.exponentialRampToValueAtTime(gain, t + (voice === 'bugle' ? 0.03 : 0.008))
    amp.gain.exponentialRampToValueAtTime(0.0001, t + decay)
    let last: AudioNode = osc.connect(amp)
    if (voice === 'bugle') {
      const lp = ctx.createBiquadFilter()
      lp.frequency.value = 1800
      last = amp.connect(lp)
    }
    last.connect(bus)
    osc.start(t)
    osc.stop(t + decay + 0.05)
  }
}

function pad(ctx: AudioContext, bus: GainNode, f: number, t: number, length: number, cutoff: number) {
  const lp = ctx.createBiquadFilter()
  lp.frequency.value = cutoff
  const amp = ctx.createGain()
  amp.gain.setValueAtTime(0.0001, t)
  amp.gain.exponentialRampToValueAtTime(0.035, t + length * 0.35)
  amp.gain.exponentialRampToValueAtTime(0.0001, t + length * 1.05)
  lp.connect(amp).connect(bus)
  for (const detune of [-7, 7]) {
    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.value = f
    osc.detune.value = detune
    osc.connect(lp)
    osc.start(t)
    osc.stop(t + length * 1.1)
  }
}

let noiseBuffer: AudioBuffer | null = null
function tick(ctx: AudioContext, bus: GainNode, kind: 'hat' | 'jingle' | 'snare', beat: number, t: number) {
  const pattern = { hat: [0, 1, 0, 1, 0, 1, 0, 1], jingle: [1, 1, 1, 1, 1, 1, 1, 1], snare: [1, 0, 0, 1, 1, 0, 1, 1] }[kind]
  if (!pattern[beat]) return
  if (!noiseBuffer) {
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  }
  const src = ctx.createBufferSource()
  src.buffer = noiseBuffer
  const filter = ctx.createBiquadFilter()
  filter.type = kind === 'snare' ? 'bandpass' : 'highpass'
  filter.frequency.value = kind === 'snare' ? 2000 : 7000
  const amp = ctx.createGain()
  const level = kind === 'snare' ? 0.12 : kind === 'jingle' ? (beat % 2 ? 0.05 : 0.08) : 0.05
  const length = kind === 'snare' ? 0.12 : 0.05
  amp.gain.setValueAtTime(0.0001, t)
  amp.gain.exponentialRampToValueAtTime(level, t + 0.003)
  amp.gain.exponentialRampToValueAtTime(0.0001, t + length)
  src.connect(filter).connect(amp).connect(bus)
  src.start(t, Math.random() * 0.5)
  src.stop(t + length + 0.02)
}
