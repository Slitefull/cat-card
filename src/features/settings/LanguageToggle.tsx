import { type ReactNode, useId } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { languages } from '@/i18n'

const flags = {
  en: (clip: string) => (
    <>
      <rect width="60" height="30" fill="#012169" />
      <clipPath id={clip}>
        <path d="M30,15h30v15zv15h-30zh-30v-15zv-15h30z" />
      </clipPath>
      <path d="M0,0L60,30M60,0L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0L60,30M60,0L0,30" stroke="#C8102E" strokeWidth="4" clipPath={`url(#${clip})`} />
      <path d="M30,0v30M0,15h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0v30M0,15h60" stroke="#C8102E" strokeWidth="6" />
    </>
  ),
  uk: () => (
    <>
      <rect width="60" height="15" fill="#0057B7" />
      <rect y="15" width="60" height="15" fill="#FFD700" />
    </>
  ),
  ru: () => (
    <>
      <rect width="60" height="10" fill="#fff" />
      <rect y="10" width="60" height="10" fill="#0039A6" />
      <rect y="20" width="60" height="10" fill="#D52B1E" />
    </>
  ),
} satisfies Record<keyof typeof languages, (clip: string) => ReactNode>

export function LanguageToggle() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const clip = useId()

  async function choose(lng: string) {
    await i18n.changeLanguage(lng)
    void router.load()
  }

  return (
    <fieldset
      aria-label={t('language.label')}
      className="flex gap-1 rounded-full bg-white p-1 shadow-[0_1px_2px_rgb(23_23_23/0.04)] ring-1 ring-neutral-950/5 dark:bg-neutral-900 dark:ring-white/10"
    >
      {Object.entries(languages).map(([lng, name]) => {
        const active = i18n.resolvedLanguage === lng
        return (
          <Button
            key={lng}
            lang={lng}
            size="icon"
            variant={active ? 'default' : 'ghost'}
            aria-pressed={active}
            aria-label={name}
            title={name}
            onClick={() => choose(lng)}
            className="size-11"
          >
            <svg
              viewBox="0 0 60 30"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
              className="size-6 rounded-full ring-1 ring-neutral-950/10 dark:ring-white/20"
            >
              {flags[lng as keyof typeof flags](clip)}
            </svg>
          </Button>
        )
      })}
    </fieldset>
  )
}
