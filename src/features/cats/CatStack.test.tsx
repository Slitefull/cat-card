import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { meows, play } from '@/features/meow/meow'
import { fetchCat } from './api'
import { CatStack } from './CatStack'

vi.mock('./api', () => ({ fetchCat: vi.fn(), prerendered: undefined }))
vi.mock('@/features/meow/meow', async (importOriginal) => ({ ...(await importOriginal<typeof import('@/features/meow/meow')>()), play: vi.fn() }))

const cat = (id: number) => ({ id, name: `cat${id}`, breed: 'tabby', image: `https://example.com/${id}.jpg` })
const deck = (...ids: number[]) => ids.map(cat)

const heading = () => screen.getByRole('heading', { level: 1 })
const button = (name: string) => screen.getByRole('button', { name })
const images = () => [...document.querySelectorAll('img')].map((img) => img.getAttribute('src'))

beforeEach(() => {
  vi.mocked(fetchCat).mockReset().mockImplementation(async (id) => cat(id))
  vi.mocked(play).mockClear()
})

test('deals at most 3 cards and exposes only the top one', () => {
  render(<CatStack initial={deck(1, 2, 3, 4)} />)
  expect(images()).toEqual(['https://example.com/1.jpg', 'https://example.com/2.jpg', 'https://example.com/3.jpg'])
  expect(screen.getAllByRole('heading')).toHaveLength(1)
  expect(heading()).toHaveTextContent('cat1')
  expect(screen.getAllByRole('button', { name: 'Flip card' })).toHaveLength(1)
})

test('Like and Skip drop the top card and fetch ids after the highest one', async () => {
  render(<CatStack initial={deck(5, 2, 9)} />)

  await userEvent.click(button('Like'))
  await waitFor(() => expect(heading()).toHaveTextContent('cat2'))
  expect(fetchCat).toHaveBeenLastCalledWith(10, expect.any(AbortSignal))

  await userEvent.click(button('Skip'))
  await waitFor(() => expect(heading()).toHaveTextContent('cat9'))
  expect(fetchCat).toHaveBeenLastCalledWith(11, expect.any(AbortSignal))

  await waitFor(() =>
    expect(images()).toEqual(['https://example.com/9.jpg', 'https://example.com/10.jpg', 'https://example.com/11.jpg']),
  )
})

test('flip turns the card face down; the next card always arrives face up', async () => {
  render(<CatStack initial={deck(1, 2, 3)} />)
  await userEvent.click(button('Flip card'))
  expect(button('Flip card')).toHaveAttribute('aria-pressed', 'true')
  expect(screen.queryByRole('heading')).not.toBeInTheDocument()

  await userEvent.click(button('Like'))
  await waitFor(() => expect(heading()).toHaveTextContent('cat2'))
  expect(button('Flip card')).toHaveAttribute('aria-pressed', 'false')
})

test('a new initial prop (loader refetch on language switch) does not reset the deck', async () => {
  const { rerender } = render(<CatStack initial={deck(1, 2, 3)} />)
  await userEvent.click(button('Like'))
  await waitFor(() => expect(heading()).toHaveTextContent('cat2'))

  rerender(<CatStack initial={deck(1, 2, 3)} />)
  expect(heading()).toHaveTextContent('cat2')
})

test('empty deck waiting on the API shows the skeleton and disables the controls without dropping focus', async () => {
  vi.mocked(fetchCat).mockReturnValue(new Promise(() => {}))
  render(<CatStack initial={deck(1)} />)
  await userEvent.click(button('Like'))

  expect(await screen.findByText('Loading cat')).toBeInTheDocument()
  for (const name of ['Like', 'Skip', 'Meow']) expect(button(name)).toHaveAttribute('aria-disabled', 'true')
  expect(button('Like')).toHaveFocus()
})

test('arrow keys skip and like, announced on the buttons', async () => {
  render(<CatStack initial={deck(1, 2, 3)} />)
  expect(button('Skip')).toHaveAttribute('aria-keyshortcuts', 'ArrowLeft')
  expect(button('Like')).toHaveAttribute('aria-keyshortcuts', 'ArrowRight')

  await userEvent.keyboard('{ArrowRight}')
  await waitFor(() => expect(heading()).toHaveTextContent('cat2'))
  expect(fetchCat).toHaveBeenLastCalledWith(4, expect.any(AbortSignal))
  await userEvent.keyboard('{ArrowLeft}')
  await waitFor(() => expect(heading()).toHaveTextContent('cat3'))
})

test('held keys, modifiers and an open dialog do not swipe', async () => {
  render(
    <>
      <CatStack initial={deck(1, 2, 3)} />
      <dialog open aria-label="Settings">
        <button type="button">Close</button>
      </dialog>
    </>,
  )
  fireEvent.keyDown(window, { key: 'ArrowRight', repeat: true })
  await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}{Control>}{ArrowLeft}{/Control}')
  screen.getByRole('button', { name: 'Close' }).focus()
  await userEvent.keyboard('{ArrowRight}')

  expect(heading()).toHaveTextContent('cat1')
  expect(fetchCat).not.toHaveBeenCalled()
})

test('swiping from the card moves focus to the next card, not the page', async () => {
  render(<CatStack initial={deck(1, 2, 3)} />)
  button('Flip card').focus()

  await userEvent.keyboard('{ArrowRight}')
  await waitFor(() => expect(heading()).toHaveTextContent('cat2'))
  expect(button('Flip card')).toHaveFocus()

  await userEvent.click(button('Skip'))
  await waitFor(() => expect(heading()).toHaveTextContent('cat3'))
  expect(button('Skip')).toHaveFocus()
})

test('a failed fetch only shows the error once the deck runs out', async () => {
  vi.mocked(fetchCat).mockRejectedValue(new Error('GET /api failed with 500'))
  render(<CatStack initial={deck(1, 2)} />)

  await userEvent.click(button('Like'))
  await waitFor(() => expect(heading()).toHaveTextContent('cat2'))
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()

  await userEvent.click(button('Like'))
  expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't load the cat")
  expect(button('Refresh page')).toBeInTheDocument()
})

test('unmounting aborts fetches still in flight', async () => {
  vi.mocked(fetchCat).mockReturnValue(new Promise(() => {}))
  const { unmount } = render(<CatStack initial={deck(1, 2)} />)
  await userEvent.click(button('Like'))
  const signal = vi.mocked(fetchCat).mock.calls[0][1]!

  expect(signal.aborted).toBe(false)
  unmount()
  expect(signal.aborted).toBe(true)
})

test('meow cycles through every voice and shows its bubble', async () => {
  render(<CatStack initial={deck(1)} />)
  expect(screen.getByRole('status')).toBeEmptyDOMElement()

  const bubbles = ['Meow!', 'Mew!', 'Mrrrow!', 'Mrrp?', 'Meeeow!', 'Meow!']
  for (const [i, bubble] of bubbles.entries()) {
    await userEvent.click(button('Meow'))
    expect(screen.getByRole('status')).toHaveTextContent(bubble)
    expect(play).toHaveBeenLastCalledWith(meows[i % meows.length])
  }
  expect(play).toHaveBeenCalledTimes(bubbles.length)
})

test('screen readers hear which cat is on top', async () => {
  render(<CatStack initial={deck(1, 2)} />)
  const live = document.querySelector('[aria-live="polite"]')
  expect(live).toHaveTextContent('cat1, a tabby cat')
  await userEvent.click(button('Skip'))
  await waitFor(() => expect(live).toHaveTextContent('cat2, a tabby cat'))
})
