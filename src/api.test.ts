import { fetchCat } from './api'

const cat = { id: 7, name: 'miso', breed: 'siamese', image: 'https://example.com/miso.jpg' }

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

test('uses the mock while VITE_API_URL is empty', async () => {
  const fetchMock = vi.fn<typeof fetch>()
  vi.stubGlobal('fetch', fetchMock)
  await expect(fetchCat(1)).resolves.toMatchObject({ name: 'whiskers' })
  expect(fetchMock).not.toHaveBeenCalled()
})

test('switches to the real endpoint once VITE_API_URL is set', async () => {
  vi.stubEnv('VITE_API_URL', 'https://api.test/')
  const fetchMock = vi.fn<typeof fetch>(async () => Response.json(cat))
  vi.stubGlobal('fetch', fetchMock)
  const { signal } = new AbortController()

  await expect(fetchCat(7, signal)).resolves.toEqual(cat)
  expect(fetchMock).toHaveBeenCalledWith('https://api.test/cats/7', { signal })
})

test('rejects on HTTP errors and on an unexpected response shape', async () => {
  vi.stubEnv('VITE_API_URL', '/api')

  vi.stubGlobal('fetch', vi.fn<typeof fetch>(async () => new Response(null, { status: 503 })))
  await expect(fetchCat(7)).rejects.toThrow('GET /cats/7 failed with 503')

  vi.stubGlobal('fetch', vi.fn<typeof fetch>(async () => Response.json({ data: cat })))
  await expect(fetchCat(7)).rejects.toThrow('unexpected shape')
})
