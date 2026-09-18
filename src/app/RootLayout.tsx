import { HeadContent, Outlet } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Settings } from '@/features/settings/Settings'
import { Backdrop } from './Backdrop'

export function RootLayout() {
  const { t } = useTranslation()
  return (
    <>
      <HeadContent />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:inline-flex focus:h-11 focus:items-center focus:rounded-full focus:bg-white focus:px-5 focus:text-sm focus:font-medium focus:text-neutral-950 focus:shadow-lg dark:focus:bg-neutral-900 dark:focus:text-neutral-50"
      >
        {t('skipLink')}
      </a>
      <div className="relative isolate grid min-h-[100dvh] grid-rows-[auto_1fr] overflow-x-clip bg-neutral-50 px-4 pb-4 short:pt-4 [@media(width>=40rem)_and_(height>=54rem)]:grid-rows-[1fr_auto_1fr] text-neutral-950 antialiased before:absolute before:inset-0 before:-z-10 before:bg-[image:radial-gradient(rgb(23_23_23/0.14)_1px,transparent_1px)] before:bg-size-[22px_22px] before:[mask-image:radial-gradient(ellipse_at_center,black_15%,transparent_70%)] dark:bg-neutral-950 dark:text-neutral-50 dark:before:bg-[image:radial-gradient(rgb(250_250_250/0.14)_1px,transparent_1px)]">
        <Backdrop />
        <header className="flex items-start justify-end py-4 compact:py-2 short:absolute short:top-0 short:right-4">
          <Settings />
        </header>
        <main id="main" tabIndex={-1} className="grid place-items-center outline-none">
          <Outlet />
        </main>
      </div>
    </>
  )
}
