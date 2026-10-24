// Synthesized game-show cues, so the app ships with no audio files.
import type { ThemeId } from './themes'

let ctx: AudioContext | null = null
let master: GainNode | null = null
let reverb: ConvolverNode | null = null

/** Browsers only allow audio after a click, so call this from one. */
export function unlockAudio() {
  if (!ctx) {
    ctx = new AudioContext()
    // A gentle limiter keeps stacked cues (sting over music) from clipping.
    const limiter = ctx.createDynamicsCompressor()
    limiter.threshold.value = -10
    limiter.ratio.value = 8
    master = ctx.createGain()
    master.connect(limiter).connect(ctx.destination)
    reverb = ctx.createConvolver()
    reverb.buffer = impulse(ctx, 2.6)
    reverb.connect(master)
  }
  void ctx.resume()
}

export function audioReady() {
  return ctx?.state === 'running'
}

/** Shared output for the music engine. */
export function audioGraph() {
  return ctx && master && reverb ? { ctx, master, reverb } : null
}

function impulse(ac: BaseAudioContext, seconds: number) {
  const length = Math.floor(ac.sampleRate * seconds)
  const buffer = ac.createBuffer(2, length, ac.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch)
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 2.5
  }
  return buffer
}

let noiseBuffer: AudioBuffer | null = null
function noise(ac: AudioContext) {
  if (!noiseBuffer) {
    noiseBuffer = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  }
  return noiseBuffer
}

/** Route a node to the dry output and, optionally, the reverb. */
function out(node: AudioNode, wet = 0) {
  node.connect(master!)
  if (wet > 0) {
    const send = ctx!.createGain()
    send.gain.value = wet
    node.connect(send).connect(reverb!)
  }
}

interface ToneOptions {
  type?: OscillatorType
  gain?: number
  attack?: number
  wet?: number
  /** Lowpass cutoff; omit for none. */
  filter?: number
  detune?: number
}

/** One enveloped oscillator note. Times are seconds from now. */
export function tone(freq: number, start: number, duration: number, opts: ToneOptions = {}) {
  if (!ctx) return
  const { type = 'sine', gain = 0.3, attack = 0.01, wet = 0, filter, detune = 0 } = opts
  const t = ctx.currentTime + start
  const osc = ctx.createOscillator()
  const amp = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  osc.detune.value = detune
  amp.gain.setValueAtTime(0.0001, t)
  amp.gain.exponentialRampToValueAtTime(gain, t + attack)
  amp.gain.exponentialRampToValueAtTime(0.0001, t + duration)
  let last: AudioNode = osc.connect(amp)
  if (filter) {
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = filter
    last = amp.connect(lp)
  }
  out(last, wet)
  osc.start(t)
  osc.stop(t + duration + 0.05)
}

function noiseBurst(start: number, duration: number, gain: number, type: BiquadFilterType, freq: number, q = 1, wet = 0) {
  if (!ctx) return
  const t = ctx.currentTime + start
  const src = ctx.createBufferSource()
  src.buffer = noise(ctx)
  const filter = ctx.createBiquadFilter()
  filter.type = type
  filter.frequency.value = freq
  filter.Q.value = q
  const amp = ctx.createGain()
  amp.gain.setValueAtTime(0.0001, t)
  amp.gain.exponentialRampToValueAtTime(gain, t + 0.005)
  amp.gain.exponentialRampToValueAtTime(0.0001, t + duration)
  out(src.connect(filter).connect(amp), wet)
  src.start(t, Math.random())
  src.stop(t + duration + 0.05)
}

const midi = (n: number) => 440 * 2 ** ((n - 69) / 12)

/* ───────── Game cues ───────── */

/** Bright two-note bell for a revealed answer. */
export function playDing() {
  tone(1318.5, 0, 0.9, { gain: 0.35 })
  tone(1975.5, 0, 0.6, { gain: 0.12 })
  tone(1760, 0.12, 1.1, { gain: 0.3 })
  tone(2637, 0.12, 0.7, { gain: 0.1 })
}

/** Harsh low buzzer for a strike. */
export function playBuzzer() {
  tone(92, 0, 0.85, { type: 'sawtooth', gain: 0.32 })
  tone(97, 0, 0.85, { type: 'square', gain: 0.18 })
  tone(184, 0, 0.85, { type: 'sawtooth', gain: 0.08 })
}

/** Rising arpeggio when a team takes the bank. */
export function playFanfare() {
  ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
    tone(f, i * 0.11, i === 3 ? 0.9 : 0.25, { type: 'triangle', gain: 0.28 })
  })
}

/** Brass chord stab: stacked detuned saws through a lowpass. */
function brass(notes: number[], start: number, duration: number, gain = 0.12) {
  for (const n of notes) {
    for (const detune of [-8, 8]) {
      tone(midi(n), start, duration, { type: 'sawtooth', gain, attack: 0.04, filter: 2200, detune, wet: 0.25 })
    }
  }
}

/** Final scores: a big brass flourish over a few seconds of applause. */
export function playCelebration() {
  if (!ctx) return
  brass([60, 64, 67], 0, 0.22)
  brass([60, 64, 67], 0.22, 0.22)
  brass([60, 64, 67], 0.44, 0.22)
  brass([65, 69, 72], 0.7, 0.4)
  brass([67, 71, 74], 1.1, 0.4)
  brass([72, 76, 79, 84], 1.5, 2.4, 0.14)
  tone(midi(36), 1.5, 2.4, { type: 'triangle', gain: 0.35 })
  playApplause(0.3, 5)
  // A couple of "woo!" whistles from the crowd.
  for (const at of [1.7, 2.6]) whoo(at)
}

function whoo(start: number) {
  if (!ctx) return
  const t = ctx.currentTime + start
  const osc = ctx.createOscillator()
  const amp = ctx.createGain()
  osc.frequency.setValueAtTime(900, t)
  osc.frequency.exponentialRampToValueAtTime(1900, t + 0.25)
  osc.frequency.exponentialRampToValueAtTime(1500, t + 0.6)
  amp.gain.setValueAtTime(0.0001, t)
  amp.gain.exponentialRampToValueAtTime(0.06, t + 0.08)
  amp.gain.exponentialRampToValueAtTime(0.0001, t + 0.65)
  out(osc.connect(amp), 0.4)
  osc.start(t)
  osc.stop(t + 0.7)
}

let applauseBuffer: AudioBuffer | null = null
/** Hundreds of short noise "claps" rendered once into a buffer. */
function applause(ac: AudioContext, seconds: number) {
  if (applauseBuffer) return applauseBuffer
  const rate = ac.sampleRate
  const buffer = ac.createBuffer(2, Math.floor(rate * seconds), rate)
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch)
    const claps = Math.floor(seconds * 90)
    for (let c = 0; c < claps; c++) {
      const at = Math.random() * seconds
      // Fewer claps toward the end so it tails off naturally.
      if (Math.random() > 1 - (at / seconds) ** 1.5 * 0.9 && at > seconds * 0.4) continue
      const start = Math.floor(at * rate)
      const len = Math.floor(rate * (0.008 + Math.random() * 0.012))
      const level = 0.25 + Math.random() * 0.35
      for (let i = 0; i < len && start + i < data.length; i++) {
        data[start + i] += (Math.random() * 2 - 1) * level * (1 - i / len) ** 2
      }
    }
  }
  applauseBuffer = buffer
  return buffer
}

function playApplause(start: number, seconds: number) {
  if (!ctx) return
  const t = ctx.currentTime + start
  const src = ctx.createBufferSource()
  src.buffer = applause(ctx, seconds)
  const band = ctx.createBiquadFilter()
  band.type = 'bandpass'
  band.frequency.value = 1800
  band.Q.value = 0.6
  const amp = ctx.createGain()
  amp.gain.setValueAtTime(0.0001, t)
  amp.gain.exponentialRampToValueAtTime(0.9, t + 0.4)
  amp.gain.setValueAtTime(0.9, t + seconds * 0.5)
  amp.gain.exponentialRampToValueAtTime(0.0001, t + seconds)
  out(src.connect(band).connect(amp), 0.3)
  src.start(t)
}

/* ───────── Theme stings (title → board) ───────── */

export function playThemeSting(theme: ThemeId) {
  if (!ctx) return
  ;({
    classic: classicSting,
    halloween: wolfHowl,
    thanksgiving: gobble,
    christmas: sleighBells,
    valentines: harpSweep,
    independence: firework,
  })[theme]()
}

function classicSting() {
  brass([67, 72, 76], 0, 0.14, 0.17)
  brass([67, 72, 76], 0.16, 0.14, 0.17)
  brass([72, 76, 79, 84], 0.34, 1.4, 0.17)
  tone(midi(48), 0.34, 1.4, { type: 'triangle', gain: 0.3 })
}

/** A howl: a nasal saw gliding up, holding with vibrato, and falling away. */
function howl(start: number, base: number, gain: number, wet: number) {
  if (!ctx) return
  const t = ctx.currentTime + start
  const osc = ctx.createOscillator()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(base * 0.75, t)
  osc.frequency.exponentialRampToValueAtTime(base * 1.35, t + 0.55)
  osc.frequency.setValueAtTime(base * 1.35, t + 1.7)
  osc.frequency.exponentialRampToValueAtTime(base * 0.9, t + 2.8)
  const vibrato = ctx.createOscillator()
  const depth = ctx.createGain()
  vibrato.frequency.value = 5.5
  depth.gain.setValueAtTime(0, t)
  depth.gain.linearRampToValueAtTime(base * 0.025, t + 0.8)
  vibrato.connect(depth).connect(osc.frequency)
  // Two formant bands give it an "oo" vowel instead of a buzz.
  const amp = ctx.createGain()
  amp.gain.setValueAtTime(0.0001, t)
  amp.gain.exponentialRampToValueAtTime(gain, t + 0.35)
  amp.gain.setValueAtTime(gain, t + 1.9)
  amp.gain.exponentialRampToValueAtTime(0.0001, t + 2.9)
  for (const [freq, q] of [
    [base * 1.4, 6],
    [base * 2.6, 9],
  ]) {
    const band = ctx.createBiquadFilter()
    band.type = 'bandpass'
    band.frequency.value = freq
    band.Q.value = q
    osc.connect(band).connect(amp)
  }
  out(amp, wet)
  osc.start(t)
  vibrato.start(t)
  osc.stop(t + 3)
  vibrato.stop(t + 3)
}

function wolfHowl() {
  howl(0, 440, 0.28, 0.5)
  howl(1.5, 520, 0.1, 0.9)
  // Low organ chord underneath.
  for (const n of [38, 45, 50, 53]) tone(midi(n), 0, 3.2, { type: 'triangle', gain: 0.07, attack: 0.6, wet: 0.5 })
}

/** Rapid nasal warble: "gobble-gobble-gobble". */
function gobble() {
  if (!ctx) return
  for (let call = 0; call < 2; call++) {
    const base = call === 0 ? 0 : 0.85
    for (let i = 0; i < 9; i++) {
      const at = base + i * 0.055
      const f = 780 - i * 22 + (i % 2) * 90
      tone(f, at, 0.07, { type: 'sawtooth', gain: 0.32, attack: 0.008, filter: 2400, wet: 0.15 })
    }
  }
  // A warm harvest chord after.
  for (const [i, n] of [55, 59, 62, 67].entries()) tone(midi(n), 1.6 + i * 0.05, 1.6, { type: 'triangle', gain: 0.12, wet: 0.3 })
}

function sleighBells() {
  for (let i = 0; i < 12; i++) {
    const at = i * 0.12 + (i % 2) * 0.015
    noiseBurst(at, 0.12, 0.25, 'highpass', 6500, 1, 0.3)
    for (let j = 0; j < 3; j++) tone(5200 + Math.random() * 3500, at, 0.12, { gain: 0.03 })
  }
  for (const [i, n] of [84, 88, 91, 96].entries()) bell(midi(n), 1.5 + i * 0.12, 0.13)
}

function bell(freq: number, start: number, gain: number) {
  tone(freq, start, 2.2, { gain, wet: 0.4 })
  tone(freq * 2.76, start, 0.9, { gain: gain * 0.35, wet: 0.4 })
  tone(freq * 5.4, start, 0.4, { gain: gain * 0.15 })
}

function harpSweep() {
  const scale = [63, 65, 67, 70, 72, 75, 77, 79, 82, 84, 87, 89, 91, 94]
  scale.forEach((n, i) => pluck(midi(n), i * 0.045, 0.16))
  for (const n of [63, 67, 70, 74]) tone(midi(n), 0.75, 2.6, { type: 'sine', gain: 0.08, attack: 0.3, wet: 0.6 })
}

function pluck(freq: number, start: number, gain: number) {
  tone(freq, start, 1.4, { type: 'triangle', gain, wet: 0.45 })
  tone(freq * 2, start, 0.5, { gain: gain * 0.25 })
}

function firework() {
  if (!ctx) return
  const t = ctx.currentTime
  // Whistle up.
  const osc = ctx.createOscillator()
  const amp = ctx.createGain()
  osc.frequency.setValueAtTime(700, t)
  osc.frequency.exponentialRampToValueAtTime(2600, t + 0.9)
  amp.gain.setValueAtTime(0.0001, t)
  amp.gain.exponentialRampToValueAtTime(0.08, t + 0.1)
  amp.gain.exponentialRampToValueAtTime(0.02, t + 0.9)
  amp.gain.exponentialRampToValueAtTime(0.0001, t + 0.95)
  out(osc.connect(amp), 0.2)
  osc.start(t)
  osc.stop(t + 1)
  // Boom.
  noiseBurst(0.95, 1.4, 0.9, 'lowpass', 220, 0.7, 0.5)
  const thump = ctx.createOscillator()
  const thumpAmp = ctx.createGain()
  thump.frequency.setValueAtTime(90, t + 0.95)
  thump.frequency.exponentialRampToValueAtTime(32, t + 1.6)
  thumpAmp.gain.setValueAtTime(0.0001, t + 0.95)
  thumpAmp.gain.exponentialRampToValueAtTime(0.7, t + 0.97)
  thumpAmp.gain.exponentialRampToValueAtTime(0.0001, t + 1.8)
  out(thump.connect(thumpAmp))
  thump.start(t + 0.95)
  thump.stop(t + 1.9)
  // Crackle.
  for (let i = 0; i < 28; i++) noiseBurst(1.2 + Math.random() * 1.3, 0.03, 0.12 + Math.random() * 0.15, 'highpass', 3000, 1, 0.3)
}
