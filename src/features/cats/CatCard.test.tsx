import { render, screen } from '@testing-library/react'
import { CatCard, CatCardBack, CatCardSkeleton } from './CatCard'
import { CatError } from './CatError'

const cat = { id: 7, name: 'miso', breed: 'siamese', image: 'https://example.com/miso.jpg' }

describe('CatCard', () => {
  test('shows photo, name, breed and id', () => {
    render(<CatCard cat={cat} />)
    const img = screen.getByRole('img', { name: 'miso, a siamese cat' })
    expect(img).toHaveAttribute('src', cat.image)
    expect(img).toHaveAttribute('draggable', 'false')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('miso')
    expect(screen.getByText('siamese')).toBeInTheDocument()
    expect(screen.getByText('#7')).toBeInTheDocument()
  })

  test('hidden face leaves the a11y tree and tab order', () => {
    const { container } = render(<CatCard cat={cat} hidden />)
    const article = container.querySelector('article')!
    expect(article).toHaveAttribute('aria-hidden', 'true')
    expect(article).toHaveAttribute('inert')
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  test('merges a custom className', () => {
    const { container } = render(<CatCard cat={cat} className="backface-hidden" />)
    expect(container.querySelector('article')).toHaveClass('backface-hidden', 'rounded-2xl')
  })
})

test('CatCardSkeleton announces loading and is marked busy', () => {
  const { container } = render(<CatCardSkeleton />)
  expect(screen.getByText('Loading cat')).toBeInTheDocument()
  expect(container.querySelector('article')).toHaveAttribute('aria-busy', 'true')
})

describe('CatCardBack', () => {
  const background = (id: number) => {
    const { container, unmount } = render(<CatCardBack id={id} />)
    const back = container.firstElementChild as HTMLElement
    const value = back.getAttribute('style')
    unmount()
    return value
  }

  test('is decorative', () => {
    const { container } = render(<CatCardBack id={1} />)
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
    expect(container).toHaveTextContent('🐱')
  })

  test('neighbours in the stack get different backs; the 6 designs repeat by id', () => {
    const backs = [1, 2, 3, 4, 5, 6].map(background)
    expect(new Set(backs).size).toBe(6)
    expect(background(7)).toBe(backs[0])
  })
})

test('CatError alerts and offers a refresh described by the message', () => {
  render(<CatError />)
  const message = "Couldn't load the cat. Check your connection and try again."
  expect(screen.getByRole('alert')).toHaveTextContent(message)
  expect(screen.getByRole('button', { name: 'Refresh page' })).toHaveAccessibleDescription(message)
})
