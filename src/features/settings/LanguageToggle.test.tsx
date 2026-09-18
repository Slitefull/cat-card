import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import i18n from '@/i18n'
import { LanguageToggle } from './LanguageToggle'

const load = vi.fn()
vi.mock('@tanstack/react-router', () => ({ useRouter: () => ({ load }) }))

beforeEach(() => {
  load.mockClear()
})

test('offers every language by its own name, current one pressed', () => {
  render(<LanguageToggle />)
  expect(screen.getByRole('group', { name: 'Language' })).toBeInTheDocument()
  for (const [name, lang, pressed] of [
    ['English', 'en', 'true'],
    ['Українська', 'uk', 'false'],
    ['Русский', 'ru', 'false'],
  ]) {
    const button = screen.getByRole('button', { name })
    expect(button).toHaveAttribute('lang', lang)
    expect(button).toHaveAttribute('title', name)
    expect(button).toHaveAttribute('aria-pressed', pressed)
  }
})

test('choosing a language switches, saves it and reruns route heads', async () => {
  render(<LanguageToggle />)
  let languageAtLoad: string | undefined
  load.mockImplementation(() => (languageAtLoad = i18n.resolvedLanguage))

  await userEvent.click(screen.getByRole('button', { name: 'Русский' }))

  expect(load).toHaveBeenCalledOnce()
  expect(languageAtLoad).toBe('ru')
  expect(document.documentElement.lang).toBe('ru')
  expect(localStorage.getItem('lang')).toBe('ru')
  expect(screen.getByRole('group', { name: 'Язык' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Русский' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'false')
})

test('each toggle clips its UK flag with its own clipPath (Settings renders two)', () => {
  render(
    <>
      <LanguageToggle />
      <LanguageToggle />
    </>,
  )
  const flags = screen.getAllByRole('button', { name: 'English' }).map((b) => b.querySelector('svg')!)
  const ids = flags.map((svg) => svg.querySelector('clipPath')!.id)
  expect(new Set(ids).size).toBe(2)
  for (const [i, svg] of flags.entries()) {
    expect(svg.querySelector('[clip-path]')).toHaveAttribute('clip-path', `url(#${ids[i]})`)
  }
})
