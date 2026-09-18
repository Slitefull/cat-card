import type { DOMKeyframesDefinition } from 'motion/react'

type Curve = [number, number][]

export type Meow = {
  name: 'meow' | 'mew' | 'mrrow' | 'mrrp' | 'meeow'
  pitch: Curve
  vowel: Curve
  length: number
  flutter?: [rate: number, depth: number]
  growl?: number
  shake: DOMKeyframesDefinition
}

export const meows: Meow[] = [
  {
    name: 'meow',
    pitch: [[500, 0], [800, 0.12], [350, 0.6]],
    vowel: [[900, 0], [1800, 0.15], [700, 0.6]],
    length: 0.65,
    shake: { rotate: [0, -6, 6, -4, 3, 0], scale: [1, 1.04, 1] },
  },
  {
    name: 'mew',
    pitch: [[900, 0], [1300, 0.08], [1000, 0.3]],
    vowel: [[1500, 0], [2600, 0.1], [1800, 0.3]],
    length: 0.32,
    shake: { y: [0, -16, 0, -6, 0], scale: [1, 1.02, 1] },
  },
  {
    name: 'mrrow',
    pitch: [[220, 0], [380, 0.25], [180, 0.85]],
    vowel: [[500, 0], [1100, 0.3], [450, 0.85]],
    length: 0.9,
    growl: 28,
    shake: { rotate: [0, -3, 3, -3, 3, -2, 2, 0], scale: [1, 1.06, 1] },
  },
  {
    name: 'mrrp',
    pitch: [[380, 0], [330, 0.15], [650, 0.4]],
    vowel: [[600, 0], [900, 0.2], [1600, 0.4]],
    length: 0.42,
    flutter: [32, 60],
    shake: { rotate: [0, 10, 10, 0] },
  },
  {
    name: 'meeow',
    pitch: [[520, 0], [900, 0.25], [880, 0.7], [300, 1.2]],
    vowel: [[800, 0], [2000, 0.3], [1900, 0.7], [600, 1.2]],
    length: 1.25,
    flutter: [6, 25],
    shake: { rotate: [0, -4, 4, -4, 4, -4, 0], scale: [1, 1.03, 1.03, 1] },
  },
]

let audio: AudioContext | undefined

export function play({ pitch, vowel, length, flutter, growl }: Meow) {
  if (!window.AudioContext) return
  audio ??= new AudioContext()
  const ctx = audio
  const t = ctx.currentTime
  const end = t + length
  const trace = (param: AudioParam, curve: Curve, scale = 1) =>
    curve.forEach(([value, at], i) =>
      i ? param.exponentialRampToValueAtTime(value * scale, t + at) : param.setValueAtTime(value * scale, t),
    )
  const lfo = (rate: number, depth: number, target: AudioParam) => {
    const osc = new OscillatorNode(ctx, { frequency: rate })
    osc.connect(new GainNode(ctx, { gain: depth })).connect(target)
    osc.start(t)
    osc.stop(end)
  }

  const voice = new OscillatorNode(ctx, { type: 'sawtooth' })
  trace(voice.frequency, pitch, 0.95 + Math.random() * 0.1)
  if (flutter) lfo(flutter[0], flutter[1], voice.frequency)

  const mouth = new BiquadFilterNode(ctx, { type: 'bandpass', Q: 3 })
  trace(mouth.frequency, vowel)

  const throat = new GainNode(ctx, { gain: growl ? 0.6 : 1 })
  if (growl) lfo(growl, 0.4, throat.gain)

  const volume = new GainNode(ctx)
  volume.gain.setValueAtTime(0.0001, t)
  volume.gain.exponentialRampToValueAtTime(0.3, t + 0.04)
  volume.gain.setValueAtTime(0.3, t + length * 0.7)
  volume.gain.exponentialRampToValueAtTime(0.0001, end)

  voice.connect(mouth).connect(throat).connect(volume).connect(ctx.destination)
  voice.start(t)
  voice.stop(end + 0.05)
}
