import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Theme = 'light' | 'dark'

const themes: Theme[] = ['light', 'dark']

export function ThemeToggle() {
  // index.html already applied the saved/system theme before paint, read it back
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  )

  function choose(next: Theme) {
    document.documentElement.classList.toggle('dark', next === 'dark')
    try {
      localStorage.setItem('theme', next)
    } catch {
      // storage blocked (private mode): theme still applies for this visit
    }
    setTheme(next)
  }

  return (
    <fieldset
      aria-label="Theme"
      className="flex gap-1 rounded-full bg-white p-1 shadow-[0_1px_2px_rgb(23_23_23/0.04)] ring-1 ring-neutral-950/5 dark:bg-neutral-900 dark:ring-white/10"
    >
      {themes.map((t) => (
        <Button
          key={t}
          size="sm"
          variant={theme === t ? 'default' : 'ghost'}
          aria-pressed={theme === t}
          onClick={() => choose(t)}
          // 44px target (WCAG 2.5.5) for head pointers, mouth sticks, eye tracking
          className={cn('h-11 px-4 text-sm capitalize', theme !== t && 'text-muted-foreground')}
        >
          {t}
        </Button>
      ))}
    </fieldset>
  )
}
