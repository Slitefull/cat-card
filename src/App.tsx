import { useState } from 'react'
import {
  HeadContent,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { fetchCat } from './api'
import { CatCard, CatCardSkeleton } from './CatCard'
import { ThemeToggle } from './ThemeToggle'

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const rootRoute = createRootRoute({
  head: () => ({
    meta: [
      { title: 'Cat profile' },
      { name: 'description', content: 'Photo and details of a cat.' },
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
  loader: ({ abortController }) => fetchCat(1, abortController.signal),
  pendingMs: 0,
  pendingComponent: CatCardSkeleton,
  errorComponent: CatError,
  head: ({ loaderData }) => {
    if (!loaderData) return {}
    const title = `${capitalize(loaderData.name)}, ${capitalize(loaderData.breed)} cat`
    const description = `${capitalize(loaderData.name)} is a ${loaderData.breed} cat. See their photo and profile.`
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:image', content: loaderData.image },
        { property: 'og:image:alt', content: `${capitalize(loaderData.name)}, a ${loaderData.breed} cat` },
      ],
    }
  },
  component: CatPage,
})

function createAppRouter() {
  return createRouter({ routeTree: rootRoute.addChildren([catRoute]) })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>
  }
}

function RootLayout() {
  return (
    <>
      <HeadContent />
      {/* 1fr/auto/1fr keeps the card centered, but the header gets its own row when zoomed in, so it never covers the card */}
      <div className="relative isolate grid min-h-[100dvh] grid-rows-[1fr_auto_1fr] bg-neutral-50 px-4 text-neutral-950 antialiased before:absolute before:inset-0 before:-z-10 before:bg-[image:radial-gradient(rgb(23_23_23/0.14)_1px,transparent_1px)] before:bg-size-[22px_22px] before:[mask-image:radial-gradient(ellipse_at_center,black_15%,transparent_70%)] dark:bg-neutral-950 dark:text-neutral-50 dark:before:bg-[image:radial-gradient(rgb(250_250_250/0.14)_1px,transparent_1px)]">
        <header className="flex items-start justify-end py-4">
          <ThemeToggle />
        </header>
        <main className="grid place-items-center">
          <Outlet />
        </main>
      </div>
    </>
  )
}

function CatPage() {
  return <CatCard cat={catRoute.useLoaderData()} />
}

function CatError() {
  return (
    <div className="grid justify-items-center gap-4 text-center">
      <p id="cat-error" role="alert" className="text-sm text-muted-foreground">
        Couldn't load the cat. Check your connection and try again.
      </p>
      <Button size="lg" className="h-11 px-5" aria-describedby="cat-error" onClick={() => window.location.reload()}>
        Refresh page
      </Button>
    </div>
  )
}

function NotFound() {
  return (
    <div className="grid justify-items-center gap-4 text-center">
      <title>Page not found</title>
      <meta name="robots" content="noindex" />
      <h1 className="text-xl font-semibold tracking-tight">Page not found</h1>
      {/* ponytail: plain <a>, not <Link>. Full load = screen readers announce the new page and focus starts
          at the top; a client-side swap would drop focus on <body>. Add a route focus manager if more routes appear. */}
      <a href="/" className="inline-flex min-h-11 items-center px-2 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
        Back to the cat
      </a>
    </div>
  )
}

export default function App() {
  const [router] = useState(createAppRouter)
  return <RouterProvider router={router} />
}
