import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { Cat } from './api'

const shell =
  'w-(--card-w) overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgb(23_23_23/0.04),0_12px_32px_-16px_rgb(23_23_23/0.18)] ring-1 ring-neutral-950/5 dark:bg-neutral-900 dark:ring-white/10'

const bone = 'bg-neutral-100 motion-safe:animate-pulse dark:bg-neutral-800'

const photo = 'aspect-[4/5] short:aspect-[4/3]'

export function CatCardSkeleton() {
  const { t } = useTranslation()
  return (
    <article aria-busy="true" className={shell}>
      <span className="sr-only">{t('cat.loading')}</span>
      <div className={`${photo} ${bone}`} />
      <div className="p-5">
        <div className={`h-7 w-28 rounded-md ${bone}`} />
        <div className={`mt-0.5 h-5 w-16 rounded-md ${bone}`} />
      </div>
    </article>
  )
}

export function CatCard({ cat, hidden, className }: { cat: Cat; hidden?: boolean; className?: string }) {
  const { t } = useTranslation()
  return (
    <article aria-hidden={hidden} inert={hidden} className={cn(shell, className)}>
      <div className={`${photo} bg-neutral-100 dark:bg-neutral-800`}>
        <img
          src={cat.image}
          alt={t('cat.imageAlt', { name: cat.name, breed: cat.breed })}
          fetchPriority={hidden ? 'low' : 'high'}
          draggable={false}
          className="size-full object-cover transition-transform duration-700 ease-settle motion-safe:group-hover/card:scale-105"
        />
      </div>
      <div className="flex items-baseline justify-between gap-4 p-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight capitalize">{cat.name}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground capitalize">{cat.breed}</p>
        </div>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">#{cat.id}</span>
      </div>
    </article>
  )
}

const backs = [
  'radial-gradient(rgb(23 23 23 / 0.14) 1px, transparent 1.5px) 0 0 / 18px 18px, radial-gradient(at 20% 15%, oklch(0.88 0.12 85), transparent 55%), radial-gradient(at 85% 90%, oklch(0.62 0.18 35), transparent 60%), oklch(0.76 0.16 55)',
  'repeating-linear-gradient(45deg, rgb(255 255 255 / 0.16) 0 10px, transparent 10px 22px), radial-gradient(at 15% 10%, oklch(0.93 0.08 120), transparent 55%), radial-gradient(at 90% 85%, oklch(0.58 0.1 185), transparent 60%), oklch(0.78 0.1 160)',
  'linear-gradient(rgb(255 255 255 / 0.12) 1px, transparent 1px) 0 0 / 22px 22px, linear-gradient(90deg, rgb(255 255 255 / 0.12) 1px, transparent 1px) 0 0 / 22px 22px, radial-gradient(at 25% 20%, oklch(0.8 0.09 225), transparent 55%), radial-gradient(at 80% 90%, oklch(0.42 0.14 262), transparent 60%), oklch(0.6 0.14 250)',
  'repeating-radial-gradient(circle at 50% 50%, rgb(255 255 255 / 0.2) 0 2px, transparent 2px 16px), radial-gradient(at 20% 15%, oklch(0.93 0.06 60), transparent 55%), radial-gradient(at 85% 85%, oklch(0.64 0.14 12), transparent 60%), oklch(0.8 0.1 20)',
  'conic-gradient(rgb(23 23 23 / 0.05) 25%, transparent 0 50%, rgb(23 23 23 / 0.05) 0 75%, transparent 0) 0 0 / 28px 28px, radial-gradient(at 20% 15%, oklch(0.97 0.05 95), transparent 55%), radial-gradient(at 85% 90%, oklch(0.8 0.14 130), transparent 60%), oklch(0.9 0.12 100)',
  'radial-gradient(oklch(0.76 0.16 55 / 0.45) 1px, transparent 1.5px) 0 0 / 18px 18px, radial-gradient(at 20% 15%, oklch(0.4 0.03 60), transparent 55%), radial-gradient(at 85% 90%, oklch(0.16 0 0), transparent 60%), oklch(0.26 0.01 60)',
]

export function CatCardBack({ id }: { id: number }) {
  return (
    <div
      aria-hidden="true"
      style={{ background: backs[id % backs.length] }}
      className={cn(shell, 'absolute inset-0 grid rotate-y-180 place-items-center backface-hidden')}
    >
      <span className="text-8xl transition-transform duration-500 ease-pop select-none motion-safe:group-hover/card:scale-110 motion-safe:group-hover/card:-rotate-12">
        🐱
      </span>
    </div>
  )
}
