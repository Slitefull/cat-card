import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, useIsPresent, useMotionValue, useTransform } from 'motion/react'
import type { Cat } from './api'
import { CatCard, CatCardBack } from './CatCard'
import { SwipeBadges } from './SwipeBadges'
import { DEPTH, type Direction } from './useCatDeck'
import { useHoverTilt } from './useHoverTilt'

type Props = { cat: Cat; index: number; flipped: boolean; takeFocus: boolean; onFlip: () => void; onSwipe: (dir: Direction) => void }

export function SwipeCard({ cat, index, flipped, takeFocus, onFlip, onSwipe }: Props) {
  const { t } = useTranslation()
  const isPresent = useIsPresent()
  const top = index === 0 && isPresent
  const faceUp = top && !flipped
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-15, 15])
  const tilt = useHoverTilt(top)
  const dragged = useRef(false)
  const flipButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (top && takeFocus) flipButton.current?.focus()
  }, [top, takeFocus])

  return (
    <motion.div
      variants={{
        exit: (dir: Direction) => ({ x: dir * 600, opacity: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }),
      }}
      initial={{ scale: 0.85, y: 40, opacity: 0 }}
      animate={{ scale: 1 - index * 0.05, y: index * 24, opacity: 1 }}
      exit="exit"
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: index * 0.06 }}
      style={{ x, rotate, zIndex: isPresent ? DEPTH - index : DEPTH + 1 }}
      drag={top ? 'x' : false}
      dragSnapToOrigin
      onPointerDown={() => {
        dragged.current = false
      }}
      onDragStart={() => {
        dragged.current = true
        tilt.reset()
      }}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.reset}
      whileHover={top ? { scale: 1.02 } : undefined}
      whileDrag={{ scale: 1.05 }}
      onDragEnd={(_, { offset, velocity }) => {
        if (Math.abs(offset.x) > 100 || Math.abs(velocity.x) > 500) onSwipe(offset.x > 0 ? 1 : -1)
      }}
      aria-hidden={!top || undefined}
      inert={!top}
      className="group/card col-start-1 row-start-1 grid justify-items-center select-none perspective-[1200px]"
    >
      <motion.div style={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY }} className="w-(--card-w)">
        <div data-wiggle={top || undefined} className="relative w-full perspective-[1200px]">
          <motion.div
            initial={{ rotateY: 180 }}
            animate={{ rotateY: faceUp ? 0 : 180 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="relative transform-3d"
          >
            <CatCard cat={cat} hidden={!faceUp} className="backface-hidden" />
            <CatCardBack id={cat.id} />
          </motion.div>

          {top && (
            <>
              <button
                type="button"
                ref={flipButton}
                aria-label={t('stack.flip')}
                aria-pressed={flipped}
                onClick={(e) => {
                  if (e.detail === 0 || !dragged.current) onFlip()
                  dragged.current = false
                }}
                className="absolute inset-0 cursor-grab rounded-2xl active:cursor-grabbing"
              />
              <SwipeBadges x={x} />
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
