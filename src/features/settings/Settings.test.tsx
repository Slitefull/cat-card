import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Settings } from './Settings'

vi.mock('@tanstack/react-router', () => ({ useRouter: () => ({ load: vi.fn() }) }))

test('the phone sidebar switches language and theme, and the header switches follow', async () => {
  render(<Settings />)
  await userEvent.click(screen.getByRole('button', { name: 'Settings' }))
  const sidebar = await screen.findByRole('dialog', { name: 'Settings' })

  await userEvent.click(within(sidebar).getByRole('button', { name: 'dark' }))
  await userEvent.click(within(sidebar).getByRole('button', { name: 'Українська' }))
  expect(document.documentElement).toHaveClass('dark')
  expect(document.documentElement.lang).toBe('uk')

  await userEvent.click(within(sidebar).getByRole('button', { name: 'Закрити' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  expect(screen.getByRole('button', { name: 'темна' })).toHaveAttribute('aria-pressed', 'true')
})
