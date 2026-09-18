import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import App from './App'

const meta = (key: string) =>
  document.head.querySelector(`meta[name="${key}"], meta[property="${key}"]`)?.getAttribute('content')

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
  expect(screen.getByRole('img')).toHaveAttribute('src', '/cats/persian.webp')

  await waitFor(() => expect(document.title).toBe('Whiskers, Persian cat'))
  expect(meta('description')).toBe('Whiskers is a persian cat. See their photo and profile.')
  expect(meta('og:title')).toBe('Whiskers, Persian cat')
  expect(meta('og:description')).toBe('Whiskers is a persian cat. See their photo and profile.')
  expect(meta('og:image')).toBe('/cats/persian.webp')
  expect(meta('og:image:alt')).toBe('Whiskers, a persian cat')
  expect(meta('og:type')).toBe('website')
  expect(meta('twitter:card')).toBe('summary_large_image')
  expect(document.head.querySelectorAll('title')).toHaveLength(1)
  expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1)
})

test('404 page is noindex, keeps the default description and links back home', async () => {
  window.history.pushState({}, '', '/nope')
  render(<App />)
  expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Back to the cat' })).toHaveAttribute('href', '/')
  await waitFor(() => expect(meta('description')).toBe('Photo and details of a cat.'))
  expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex')
})

test('backend failure shows the error with a refresh button described by it', async () => {
  vi.stubEnv('VITE_API_URL', '/api')
  vi.stubGlobal('fetch', vi.fn<typeof fetch>(async () => new Response(null, { status: 503 })))
  render(<App />)
  expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't load the cat")
  expect(screen.getByRole('button', { name: 'Refresh page' })).toHaveAccessibleDescription(
    "Couldn't load the cat. Check your connection and try again.",
  )
  expect(screen.queryByRole('button', { name: 'Like' })).not.toBeInTheDocument()
})

test('switching language keeps the current place in the stack', async () => {
  render(<App />)
  await screen.findByRole('heading', { level: 1 }, { timeout: 2000 })
  await userEvent.click(screen.getByRole('button', { name: 'Like' }))
  await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('miso'))

  await userEvent.click(screen.getByRole('button', { name: 'Українська' }))
  await waitFor(() => expect(document.title).toBe('Whiskers, кіт породи Persian'), { timeout: 2000 })
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('miso')
  expect(screen.getByRole('button', { name: 'Подобається' })).toHaveAttribute('aria-disabled', 'false')
})

test('switching language does not refetch, so a backend blip cannot replace the stack with an error', async () => {
  vi.stubEnv('VITE_API_URL', '/api')
  let up = true
  const fetchMock = vi.fn<typeof fetch>(async () =>
    up ? Response.json({ name: 'miso', breed: 'siamese', image: 'x.jpg' }) : new Response(null, { status: 503 }),
  )
  vi.stubGlobal('fetch', fetchMock)
  render(<App />)
  await screen.findByRole('heading', { level: 1 })
  up = false

  await userEvent.click(screen.getByRole('button', { name: 'Українська' }))
  await waitFor(() => expect(document.title).toBe('Miso, кіт породи Siamese'))
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('miso')
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(fetchMock).toHaveBeenCalledTimes(3)
})

test('stack: swipe buttons deal the next cat, card flips, meow pops a bubble', async () => {
  render(<App />)
  const heading = () => screen.getByRole('heading', { level: 1 })
  await screen.findByRole('heading', { level: 1 }, { timeout: 2000 })
  expect(heading()).toHaveTextContent('whiskers')

  await userEvent.click(screen.getByRole('button', { name: 'Like' }))
  await waitFor(() => expect(heading()).toHaveTextContent('miso'))
  await userEvent.click(screen.getByRole('button', { name: 'Skip' }))
  await waitFor(() => expect(heading()).toHaveTextContent('pirozhok'))

  const flip = screen.getByRole('button', { name: 'Flip card' })
  await userEvent.click(flip)
  expect(flip).toHaveAttribute('aria-pressed', 'true')
  expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
  await userEvent.click(flip)
  expect(heading()).toHaveTextContent('pirozhok')

  await userEvent.click(screen.getByRole('button', { name: 'Meow' }))
  expect(screen.getByRole('status')).toHaveTextContent('Meow!')
  await userEvent.click(screen.getByRole('button', { name: 'Meow' }))
  expect(screen.getByRole('status')).toHaveTextContent('Mew!')

  await waitFor(() => expect(document.querySelectorAll('img')).toHaveLength(3), { timeout: 2000 })
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

test('language switch translates the page, head and <html lang>, and remembers choice', async () => {
  render(<App />)
  await screen.findByRole('heading', { level: 1 }, { timeout: 2000 })
  await userEvent.click(screen.getByRole('button', { name: 'Українська' }))

  expect(document.documentElement.lang).toBe('uk')
  expect(localStorage.lang).toBe('uk')
  expect(screen.getByRole('button', { name: 'Українська' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('group', { name: 'Тема' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'темна' })).toBeInTheDocument()
  await waitFor(() => expect(document.title).toBe('Whiskers, кіт породи Persian'), { timeout: 2000 })
})
