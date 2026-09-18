import { useTranslation } from 'react-i18next'
import { Bird, Fish, Milk, Moon, PawPrint, Sparkles } from 'lucide-react'
import { meows } from '@/features/meow/meow'

const icons = [
  [PawPrint, 'top-[14%] left-[8%] size-10 -rotate-12'],
  [Sparkles, 'top-[22%] right-[12%] size-8 rotate-6'],
  [Fish, 'top-[60%] left-[6%] hidden size-12 rotate-12 sm:block'],
  [Milk, 'top-[50%] right-[6%] hidden size-9 -rotate-12 sm:block'],
  [Moon, 'bottom-[4%] left-[14%] sm:bottom-[12%] size-10 -rotate-6'],
  [Bird, 'right-[9%] bottom-[6%] sm:bottom-[18%] size-11 rotate-6'],
] as const

export function Backdrop() {
  const { t } = useTranslation()
  const words = meows.map((m) => t(`stack.sounds.${m.name}`)).join(' ')

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[radial-gradient(ellipse_at_50%_45%,oklch(0.83_0.12_60/0.3),transparent_65%)] dark:bg-[radial-gradient(ellipse_at_50%_45%,oklch(0.7_0.14_55/0.12),transparent_65%)]"
    >
      <div
        data-words={words}
        className="absolute top-[38%] left-0 -translate-y-1/2 text-[clamp(6rem,18vw,16rem)] leading-none font-semibold tracking-tighter whitespace-pre text-orange-400/15 after:content-[attr(data-words)] dark:text-orange-300/10"
      />
      {icons.map(([Icon, place], i) => (
        <Icon key={i} strokeWidth={1.5} className={`absolute text-neutral-950/15 dark:text-neutral-50/15 ${place}`} />
      ))}
    </div>
  )
}
