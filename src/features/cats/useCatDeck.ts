import { useEffect, useRef, useState } from 'react'
import { type Cat, fetchCat } from './api'

export const DEPTH = 3

export type Direction = 1 | -1

export function useCatDeck(initial: Cat[]) {
  const [cats, setCats] = useState(initial)
  const [flipped, setFlipped] = useState(false)
  const [direction, setDirection] = useState<Direction>(1)
  const [error, setError] = useState(false)
  const nextId = useRef(Math.max(0, ...initial.map((cat) => cat.id)) + 1)
  const signal = useRef<AbortSignal>(undefined)

  useEffect(() => {
    const controller = new AbortController()
    signal.current = controller.signal
    return () => controller.abort()
  }, [])

  function swipe(dir: Direction) {
    setDirection(dir)
    setFlipped(false)
    setCats((c) => c.slice(1))
    const s = signal.current
    fetchCat(nextId.current++, s)
      .then((cat) => setCats((c) => [...c, cat]))
      .catch(() => {
        if (!s?.aborted) setError(true)
      })
  }

  const flip = () => setFlipped((f) => !f)
  return { cats, top: cats.at(0), direction, error, flipped, flip, swipe }
}
