import { renderToString } from 'react-dom/server'
import { RouterProvider, createMemoryHistory } from '@tanstack/react-router'
import { createAppRouter } from './app/router'
import i18n from './i18n'

export async function render() {
  await i18n.changeLanguage('en')
  const router = createAppRouter(createMemoryHistory())
  await router.load()
  const cats = router.state.matches.find((match) => match.routeId === '/')?.loaderData
  return { html: renderToString(<RouterProvider router={router} />), cats }
}
