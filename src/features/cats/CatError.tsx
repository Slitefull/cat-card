import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export function CatError() {
  const { t } = useTranslation()
  return (
    <div className="grid justify-items-center gap-4 text-center">
      <p id="cat-error" role="alert" className="text-sm text-muted-foreground">
        {t('error.load')}
      </p>
      <Button size="lg" className="h-11 px-5" aria-describedby="cat-error" onClick={() => window.location.reload()}>
        {t('error.refresh')}
      </Button>
    </div>
  )
}
