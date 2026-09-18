import type { PointerEvent } from 'react'
import { useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'

const spring = { stiffness: 200, damping: 18 }

export function useHoverTilt(enabled: boolean) {
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [8, -8]), spring)
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-10, 10]), spring)
  const reduceMotion = useReducedMotion()

  function reset() {
    px.set(0)
    py.set(0)
  }

  function onPointerMove(e: PointerEvent<HTMLElement>) {
    if (!enabled || reduceMotion || e.pointerType !== 'mouse' || e.buttons) return
    const box = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - box.left) / box.width - 0.5)
    py.set((e.clientY - box.top) / box.height - 0.5)
  }

  return { rotateX, rotateY, reset, onPointerMove }
}
