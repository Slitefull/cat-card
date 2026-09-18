import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import i18n from '@/i18n'
import { ThemeToggle } from './ThemeToggle'

const html = document.documentElement

test('starts from the theme index.html already applied', () => {
  html.classList.add('dark')
  render(<ThemeToggle />)
  expect(screen.getByRole('button', { name: 'dark' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: 'light' })).toHaveAttribute('aria-pressed', 'false')
})

test('choosing a theme toggles the class and saves it', async () => {
  render(<ThemeToggle />)
  expect(screen.getByRole('button', { name: 'light' })).toHaveAttribute('aria-pressed', 'true')

  await userEvent.click(screen.getByRole('button', { name: 'dark' }))
  expect(html).toHaveClass('dark')
  expect(localStorage.getItem('theme')).toBe('dark')
  expect(screen.getByRole('button', { name: 'dark' })).toHaveAttribute('aria-pressed', 'true')

  await userEvent.click(screen.getByRole('button', { name: 'light' }))
  expect(html).not.toHaveClass('dark')
  expect(localStorage.getItem('theme')).toBe('light')
})

test('still switches when storage is blocked (private mode)', async () => {
  const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new DOMException('blocked', 'SecurityError')
  })
  try {
    render(<ThemeToggle />)
    await userEvent.click(screen.getByRole('button', { name: 'dark' }))
    expect(html).toHaveClass('dark')
    expect(screen.getByRole('button', { name: 'dark' })).toHaveAttribute('aria-pressed', 'true')
  } finally {
    setItem.mockRestore()
  }
})

test('labels follow the language; the other translations stay hidden', async () => {
  render(<ThemeToggle />)
  await act(() => i18n.changeLanguage('uk'))
  expect(screen.getByRole('group', { name: 'Тема' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'світла' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'темна' })).toBeInTheDocument()
  const english = screen.getByText('dark')
  expect(english).toHaveAttribute('aria-hidden', 'true')
  expect(english).toHaveClass('invisible')
})
