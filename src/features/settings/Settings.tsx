import { useTranslation } from 'react-i18next'
import { Drawer } from '@base-ui/react/drawer'
import { Settings2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LanguageToggle } from './LanguageToggle'
import { ThemeToggle } from './ThemeToggle'

const ease = 'duration-[450ms] ease-settle data-swiping:duration-0 motion-reduce:transition-none'
const pill = 'size-11 bg-white dark:bg-neutral-900'
const group = 'grid justify-items-start gap-2'
const caption = 'text-sm text-muted-foreground'

export function Settings() {
  const { t } = useTranslation()
  return (
    <>
      <div className="flex flex-wrap justify-end gap-2 compact:hidden">
        <LanguageToggle />
        <ThemeToggle />
      </div>
      <div className="hidden compact:block">
        <Drawer.Root swipeDirection="right">
          <Drawer.Trigger
            aria-label={t('settings.title')}
            render={<Button variant="outline" size="icon" className={pill} />}
          >
            <Settings2 className="size-5" />
          </Drawer.Trigger>
          <Drawer.Portal>
            <Drawer.Backdrop
              className={`fixed inset-0 bg-neutral-950/30 opacity-[calc(1-var(--drawer-swipe-progress))] transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0 dark:bg-neutral-950/60 ${ease}`}
            />
            <Drawer.Viewport className="fixed inset-0 flex justify-end p-2">
              <Drawer.Popup
                className={`grid h-full w-[min(20rem,85vw)] content-start gap-6 overflow-y-auto overscroll-contain rounded-2xl bg-white p-5 text-neutral-950 shadow-[0_12px_32px_-16px_rgb(23_23_23/0.3)] ring-1 ring-neutral-950/5 outline-none [transform:translateX(var(--drawer-swipe-movement-x))] transition-transform data-ending-style:[transform:translateX(calc(100%+0.5rem))] data-starting-style:[transform:translateX(calc(100%+0.5rem))] dark:bg-neutral-900 dark:text-neutral-50 dark:ring-white/10 ${ease}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <Drawer.Title className="text-xl font-semibold tracking-tight">{t('settings.title')}</Drawer.Title>
                  <Drawer.Close
                    aria-label={t('settings.close')}
                    render={<Button variant="outline" size="icon" className={pill} />}
                  >
                    <X className="size-5" />
                  </Drawer.Close>
                </div>
                <div className={group}>
                  <p aria-hidden="true" className={caption}>
                    {t('language.label')}
                  </p>
                  <LanguageToggle />
                </div>
                <div className={group}>
                  <p aria-hidden="true" className={caption}>
                    {t('theme.label')}
                  </p>
                  <ThemeToggle />
                </div>
              </Drawer.Popup>
            </Drawer.Viewport>
          </Drawer.Portal>
        </Drawer.Root>
      </div>
    </>
  )
}
