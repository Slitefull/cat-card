import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, MotionConfig } from 'motion/react'
import { MeowBubble } from '@/features/meow/MeowBubble'
import { useMeow } from '@/features/meow/useMeow'
import { type Cat, prerendered } from './api'
import { CatCardSkeleton } from './CatCard'
import { CatError } from './CatError'
import { StackControls } from './StackControls'
import { SwipeCard } from './SwipeCard'
import { DEPTH, type Direction, useCatDeck } from './useCatDeck'

const arrows: Partial<Record<string, Direction>> = { ArrowLeft: -1, ArrowRight: 1 }

export function CatStack({ initial }: { initial: Cat[] }) {
  const { t } = useTranslation()
  const { cats, top, direction, error, flipped, flip, swipe } = useCatDeck(initial)
  const { scope, ...meow } = useMeow()
  const [refocusCard, setRefocusCard] = useState(false)

  function swipeTop(dir: Direction) {
    setRefocusCard(!!scope.current?.contains(document.activeElement))
    swipe(dir)
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const dir = arrows[e.key]
      if (!dir || !top || e.repeat || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
      if (e.target instanceof Element && e.target.closest('dialog, [role="dialog"]')) return
      e.preventDefault()
      swipeTop(dir)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  return (
    <MotionConfig reducedMotion="user">
      <div className="grid w-full justify-items-center gap-14 compact:gap-10 short:grid-flow-col short:items-center short:justify-center short:gap-8">
        <div ref={scope} className="relative isolate grid w-full">
          <MeowBubble count={meow.count} last={meow.last} />

          <AnimatePresence custom={direction} initial={!import.meta.env.SSR && !prerendered}>
            {cats.slice(0, DEPTH).map((cat, index) => (
              <SwipeCard
                key={cat.id}
                cat={cat}
                index={index}
                flipped={index === 0 && flipped}
                takeFocus={refocusCard}
                onFlip={flip}
                onSwipe={swipeTop}
              />
            ))}
          </AnimatePresence>

          {!top && <div className="col-start-1 row-start-1 grid justify-items-center">{error ? <CatError /> : <CatCardSkeleton />}</div>}
        </div>

        <p className="sr-only" aria-live="polite">
          {top && t('cat.imageAlt', { name: top.name, breed: top.breed })}
        </p>

        <StackControls disabled={!top} onSwipe={swipeTop} meow={meow} />
      </div>
    </MotionConfig>
  )
}
