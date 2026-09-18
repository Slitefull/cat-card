import { useTranslation } from 'react-i18next'

export function NotFound() {
  const { t } = useTranslation()
  return (
    <div className="grid justify-items-center gap-4 text-center">
      <title>{t('notFound.title')}</title>
      <meta name="robots" content="noindex" />
      <h1 className="text-xl font-semibold tracking-tight">{t('notFound.title')}</h1>
      <a href="/" className="inline-flex min-h-11 items-center px-2 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
        {t('notFound.back')}
      </a>
    </div>
  )
}
