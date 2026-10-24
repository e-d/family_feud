// Synthesized game-show cues, so the app ships with no audio files.

let ctx: AudioContext | null = null

/** Browsers only allow audio after a click, so call this from one. */
export function unlockAudio() {
  ctx ??= new AudioContext()
  void ctx.resume()
}

export function audioReady() {
  return ctx?.state === 'running'
}

function tone(freq: number, start: number, duration: number, type: OscillatorType, gain: number) {
  if (!ctx) return
  const t = ctx.currentTime + start
  const osc = ctx.createOscillator()
  const amp = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  amp.gain.setValueAtTime(0.0001, t)
  amp.gain.exponentialRampToValueAtTime(gain, t + 0.01)
  amp.gain.exponentialRampToValueAtTime(0.0001, t + duration)
  osc.connect(amp).connect(ctx.destination)
  osc.start(t)
  osc.stop(t + duration + 0.05)
}

/** Bright two-note bell for a revealed answer. */
export function playDing() {
  tone(1318.5, 0, 0.9, 'sine', 0.35)
  tone(1975.5, 0, 0.6, 'sine', 0.12)
  tone(1760, 0.12, 1.1, 'sine', 0.3)
  tone(2637, 0.12, 0.7, 'sine', 0.1)
}

/** Harsh low buzzer for a strike. */
export function playBuzzer() {
  tone(92, 0, 0.85, 'sawtooth', 0.32)
  tone(97, 0, 0.85, 'square', 0.18)
  tone(184, 0, 0.85, 'sawtooth', 0.08)
}

/** Rising fanfare when a team takes the bank. */
export function playFanfare() {
  ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
    tone(f, i * 0.11, i === 3 ? 0.9 : 0.25, 'triangle', 0.28)
  })
}
