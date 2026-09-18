import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './button'

test('renders a native button with variant classes plus custom ones', async () => {
  const onClick = vi.fn()
  render(
    <Button variant="outline" size="icon" className="size-14" onClick={onClick}>
      x
    </Button>,
  )
  const button = screen.getByRole('button', { name: 'x' })
  expect(button.tagName).toBe('BUTTON')
  expect(button).toHaveAttribute('data-slot', 'button')
  expect(button).toHaveClass('border-border', 'size-14')
  expect(button).not.toHaveClass('size-8')
  await userEvent.click(button)
  expect(onClick).toHaveBeenCalledOnce()
})

test('defaults to the primary variant', () => {
  render(<Button>go</Button>)
  expect(screen.getByRole('button')).toHaveClass('bg-primary', 'h-8')
})

test('disabled button ignores clicks', async () => {
  const onClick = vi.fn()
  render(
    <Button disabled onClick={onClick}>
      go
    </Button>,
  )
  const button = screen.getByRole('button')
  expect(button).toBeDisabled()
  await userEvent.click(button)
  expect(onClick).not.toHaveBeenCalled()
})
