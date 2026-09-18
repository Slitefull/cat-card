import { useState } from 'react'
import { useAnimate, useReducedMotion } from 'motion/react'
import { meows, play } from './meow'

export function useMeow() {
  const [count, setCount] = useState(0)
  const [scope, animate] = useAnimate()
  const reduceMotion = useReducedMotion()

  function meow() {
    const sound = meows[count % meows.length]
    play(sound)
    if (!reduceMotion) animate('[data-wiggle]', sound.shake, { duration: sound.length })
    setCount((n) => n + 1)
  }

  const last = count ? meows[(count - 1) % meows.length] : undefined
  return { scope, count, last, meow }
}

export type MeowState = Omit<ReturnType<typeof useMeow>, 'scope'>
