import { fetchCat } from './api'

const cat = { name: 'miso', breed: 'siamese', image: 'https://example.com/miso.jpg' }

test('uses the mock while VITE_API_URL is empty', async () => {
  const fetchMock = vi.fn<typeof fetch>()
  vi.stubGlobal('fetch', fetchMock)
  await expect(fetchCat(1)).resolves.toMatchObject({ name: 'whiskers' })
  expect(fetchMock).not.toHaveBeenCalled()
})

test('asks the one random-cat URL uncached, numbers the card itself and drops extra fields', async () => {
  vi.stubEnv('VITE_API_URL', 'https://api.test/cat/')
  const fetchMock = vi.fn<typeof fetch>(async () => Response.json({ ...cat, id: 'abc', votes: 3 }))
  vi.stubGlobal('fetch', fetchMock)
  const { signal } = new AbortController()

  await expect(fetchCat(7, signal)).resolves.toEqual({ ...cat, id: 7 })
  expect(fetchMock).toHaveBeenCalledWith('https://api.test/cat/', { signal, cache: 'no-store' })
})

test('rejects on HTTP errors and on an unexpected response shape', async () => {
  vi.stubEnv('VITE_API_URL', '/api')

  vi.stubGlobal('fetch', vi.fn<typeof fetch>(async () => new Response(null, { status: 503 })))
  await expect(fetchCat(7)).rejects.toThrow('GET /api failed with 503')

  vi.stubGlobal('fetch', vi.fn<typeof fetch>(async () => Response.json({ data: cat })))
  await expect(fetchCat(7)).rejects.toThrow('unexpected shape')
})

test('mock resolves after its fake latency and cycles through the cats for any id', async () => {
  vi.useFakeTimers()
  try {
    const pending = fetchCat(7)
    let done = false
    void pending.then(() => (done = true))
    await vi.advanceTimersByTimeAsync(799)
    expect(done).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    await expect(pending).resolves.toEqual({
      id: 7,
      name: 'whiskers',
      breed: 'persian',
      image: '/cats/persian.webp',
    })
  } finally {
    vi.useRealTimers()
  }
})

test.each([
  ['null', null],
  ['a missing image', { ...cat, image: undefined }],
  ['a numeric name', { ...cat, name: 7 }],
  ['a missing breed', { ...cat, breed: undefined }],
])('rejects %s as an unexpected shape', async (_, body) => {
  vi.stubEnv('VITE_API_URL', '/api')
  vi.stubGlobal('fetch', vi.fn<typeof fetch>(async () => Response.json(body)))
  await expect(fetchCat(7)).rejects.toThrow('GET /api returned an unexpected shape')
})

test('passes an abort through to the caller', async () => {
  vi.stubEnv('VITE_API_URL', '/api')
  vi.stubGlobal('fetch', vi.fn<typeof fetch>(async () => Promise.reject(new DOMException('aborted', 'AbortError'))))
  await expect(fetchCat(7)).rejects.toThrow('aborted')
})
