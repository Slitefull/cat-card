import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import App from './App'

afterEach(() => {
  window.history.pushState({}, '', '/')
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

// jsdom has no layout, so contrast is checked in a real browser, not here
const axeViolations = async () =>
  (await axe.run(document.body, { rules: { 'color-contrast': { enabled: false } } })).violations.map(
    (v) => `${v.id}: ${v.help}`,
  )

test('no axe violations on the cat, error and 404 pages', async () => {
  const { unmount } = render(<App />)
  await screen.findByRole('heading', { level: 1 }, { timeout: 2000 })
  expect(await axeViolations()).toEqual([])
  unmount()

  vi.stubEnv('VITE_API_URL', '/api')
  vi.stubGlobal('fetch', vi.fn<typeof fetch>(async () => new Response(null, { status: 503 })))
  const error = render(<App />)
  await screen.findByRole('alert')
  expect(await axeViolations()).toEqual([])
  error.unmount()

  window.history.pushState({}, '', '/nope')
  render(<App />)
  expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
  await waitFor(() => expect(document.title).toBe('Page not found'))
  expect(await axeViolations()).toEqual([])
})

test('shows skeleton, then the fetched cat with SEO tags', async () => {
  render(<App />)
  expect(await screen.findByText('Loading cat')).toBeInTheDocument()
  expect(await screen.findByRole('heading', { level: 1 }, { timeout: 2000 })).toHaveTextContent('whiskers')
  expect(screen.getByText('persian')).toBeInTheDocument()
  expect(screen.getByRole('img')).toHaveAttribute('src', 'https://cataas.com/cat?width=500')

  await waitFor(() => expect(document.title).toBe('Whiskers, Persian cat'))
  const meta = (key: string) =>
    document.head.querySelector(`meta[name="${key}"], meta[property="${key}"]`)?.getAttribute('content')
  expect(meta('description')).toBe('Whiskers is a persian cat. See their photo and profile.')
  expect(meta('og:image')).toBe('https://cataas.com/cat?width=500')
  expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1)
})

test('theme switch toggles dark class and remembers choice', async () => {
  render(<App />)
  await userEvent.click(await screen.findByRole('button', { name: 'dark' }))
  expect(document.documentElement).toHaveClass('dark')
  expect(localStorage.theme).toBe('dark')
  expect(screen.getByRole('button', { name: 'dark' })).toHaveAttribute('aria-pressed', 'true')

  await userEvent.click(screen.getByRole('button', { name: 'light' }))
  expect(document.documentElement).not.toHaveClass('dark')
  expect(localStorage.theme).toBe('light')
})
