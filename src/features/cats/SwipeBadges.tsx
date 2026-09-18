import { type MotionValue, motion, useTransform } from 'motion/react'
import { Heart, X } from 'lucide-react'

export function SwipeBadges({ x }: { x: MotionValue<number> }) {
  const likeOpacity = useTransform(x, [20, 120], [0, 1])
  const nopeOpacity = useTransform(x, [-120, -20], [1, 0])
  return (
    <>
      <motion.span
        aria-hidden="true"
        style={{ opacity: likeOpacity }}
        className="pointer-events-none absolute top-4 left-4 grid size-14 place-items-center rounded-full bg-orange-400 text-neutral-950 shadow-lg"
      >
        <Heart className="size-7 fill-current" />
      </motion.span>
      <motion.span
        aria-hidden="true"
        style={{ opacity: nopeOpacity }}
        className="pointer-events-none absolute top-4 right-4 grid size-14 place-items-center rounded-full bg-white text-neutral-950 shadow-lg dark:bg-neutral-900 dark:text-neutral-50"
      >
        <X className="size-7" />
      </motion.span>
    </>
  )
}
