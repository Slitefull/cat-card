import { useSyncExternalStore } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { languages } from '@/i18n'

type Theme = 'light' | 'dark'

const themes: Theme[] = ['light', 'dark']

const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributeFilter: ['class'] })
  return () => observer.disconnect()
}
const isDark = () => document.documentElement.classList.contains('dark')

export function ThemeToggle() {
  const { t, i18n } = useTranslation()
  const theme: Theme = useSyncExternalStore(subscribe, isDark, () => false) ? 'dark' : 'light'

  function choose(next: Theme) {
    document.documentElement.classList.toggle('dark', next === 'dark')
    try {
      localStorage.setItem('theme', next)
    } catch {
    }
  }

  return (
    <fieldset
      aria-label={t('theme.label')}
      className="grid auto-cols-fr grid-flow-col gap-1 rounded-full bg-white p-1 shadow-[0_1px_2px_rgb(23_23_23/0.04)] ring-1 ring-neutral-950/5 dark:bg-neutral-900 dark:ring-white/10"
    >
      {themes.map((value) => (
        <Button
          key={value}
          size="sm"
          variant={theme === value ? 'default' : 'ghost'}
          aria-pressed={theme === value}
          onClick={() => choose(value)}
          className={cn('grid h-11 px-3 text-sm capitalize', theme !== value && 'text-muted-foreground')}
        >
          {Object.keys(languages).map((lng) => (
            <span
              key={lng}
              aria-hidden={lng !== i18n.resolvedLanguage}
              className={cn('text-center [grid-area:1/1]', lng !== i18n.resolvedLanguage && 'invisible')}
            >
              {i18n.getFixedT(lng)(`theme.${value}`)}
            </span>
          ))}
        </Button>
      ))}
    </fieldset>
  )
}
