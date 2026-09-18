import i18n from '@/i18n'
import { type Meow, meows } from './meow'

const oscillators: FakeOscillator[] = []
const contexts = vi.fn()
class FakeParam {
  calls: [string, number, number][] = []
  setValueAtTime(value: number, at: number) {
    this.calls.push(['set', value, at])
  }
  exponentialRampToValueAtTime(value: number, at: number) {
    this.calls.push(['exp', value, at])
  }
}
class FakeNode {
  connect<T>(next: T) {
    return next
  }
}
class FakeOscillator extends FakeNode {
  frequency = new FakeParam()
  start = vi.fn()
  stop = vi.fn()
  options: OscillatorOptions
  constructor(_: unknown, options: OscillatorOptions = {}) {
    super()
    this.options = options
    oscillators.push(this)
  }
}
class FakeGain extends FakeNode {
  gain = new FakeParam()
}
class FakeFilter extends FakeNode {
  frequency = new FakeParam()
}
class FakeContext {
  currentTime = 0
  destination = {}
  constructor() {
    contexts()
  }
}

async function loadPlay() {
  vi.resetModules()
  return (await import('./meow')).play
}

function stubWebAudio() {
  oscillators.length = 0
  contexts.mockClear()
  vi.stubGlobal('AudioContext', FakeContext)
  vi.stubGlobal('OscillatorNode', FakeOscillator)
  vi.stubGlobal('GainNode', FakeGain)
  vi.stubGlobal('BiquadFilterNode', FakeFilter)
  vi.spyOn(Math, 'random').mockReturnValue(0.5)
}

const byName = (name: Meow['name']) => meows.find((m) => m.name === name)!

afterEach(() => {
  vi.restoreAllMocks()
})

describe('voices', () => {
  test('names are unique and each has a speech bubble in every language', () => {
    const names = meows.map((m) => m.name)
    expect(new Set(names).size).toBe(names.length)
    for (const lng of ['en', 'uk', 'ru']) {
      for (const name of names) expect(i18n.exists(`stack.sounds.${name}`, { lng }), `${lng} ${name}`).toBe(true)
    }
  })

  test.each(meows.map((m) => [m.name, m] as const))('%s curves start at 0, move forward, stay positive and in length', (_, meow) => {
    for (const curve of [meow.pitch, meow.vowel]) {
      expect(curve[0][1]).toBe(0)
      curve.forEach(([value, at], i) => {
        expect(value).toBeGreaterThan(0)
        if (i) expect(at).toBeGreaterThan(curve[i - 1][1])
      })
      expect(curve.at(-1)![1]).toBeLessThanOrEqual(meow.length)
    }
    expect(Object.keys(meow.shake).length).toBeGreaterThan(0)
  })
})

describe('play', () => {
  test('is a silent no-op without Web Audio (jsdom, old browsers)', async () => {
    const play = await loadPlay()
    expect('AudioContext' in window).toBe(false)
    expect(() => play(meows[0])).not.toThrow()
  })

  test('traces the pitch curve on one sawtooth voice and stops it after the sound', async () => {
    stubWebAudio()
    const play = await loadPlay()
    play(byName('meow'))

    expect(oscillators).toHaveLength(1)
    const [voice] = oscillators
    expect(voice.options.type).toBe('sawtooth')
    expect(voice.frequency.calls).toEqual([
      ['set', 500, 0],
      ['exp', 800, 0.12],
      ['exp', 350, 0.6],
    ])
    expect(voice.start).toHaveBeenCalledWith(0)
    expect(voice.stop.mock.calls[0][0]).toBeCloseTo(0.7)
  })

  test('flutter and growl each add an LFO that lives exactly as long as the sound', async () => {
    stubWebAudio()
    const play = await loadPlay()

    play(byName('mrrp'))
    expect(oscillators.map((o) => o.options.frequency)).toEqual([undefined, 32])
    expect(oscillators[1].stop).toHaveBeenCalledWith(byName('mrrp').length)

    oscillators.length = 0
    play(byName('mrrow'))
    expect(oscillators.map((o) => o.options.frequency)).toEqual([undefined, 28])
  })

  test('reuses one AudioContext for every meow', async () => {
    stubWebAudio()
    const play = await loadPlay()
    for (const meow of meows) play(meow)
    expect(contexts).toHaveBeenCalledTimes(1)
  })
})
