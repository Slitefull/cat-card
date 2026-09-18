import { type RouterHistory, createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { fetchCat, prerendered } from '@/features/cats/api'
import { CatCardSkeleton } from '@/features/cats/CatCard'
import { CatError } from '@/features/cats/CatError'
import i18n from '@/i18n'
import { CatPage } from './CatPage'
import { NotFound } from './NotFound'
import { RootLayout } from './RootLayout'

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const rootRoute = createRootRoute({
  head: () => ({
    meta: [
      { title: i18n.t('meta.title') },
      { name: 'description', content: i18n.t('meta.description') },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: RootLayout,
  notFoundComponent: NotFound,
})

const catRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  loader: ({ abortController }) =>
    prerendered ?? Promise.all([1, 2, 3].map((id) => fetchCat(id, abortController.signal))),
  shouldReload: false,
  pendingMs: 0,
  pendingComponent: CatCardSkeleton,
  errorComponent: CatError,
  head: ({ loaderData }) => {
    const cat = loaderData?.[0]
    if (!cat) return {}
    const { name, breed } = cat
    const title = i18n.t('meta.catTitle', { name: capitalize(name), breed: capitalize(breed) })
    const description = i18n.t('meta.catDescription', { name: capitalize(name), breed })
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:image', content: cat.image },
        { property: 'og:image:alt', content: i18n.t('cat.imageAlt', { name: capitalize(name), breed }) },
      ],
    }
  },
  component: CatPage,
})

export function createAppRouter(history?: RouterHistory) {
  return createRouter({ routeTree: rootRoute.addChildren([catRoute]), history })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>
  }
}
