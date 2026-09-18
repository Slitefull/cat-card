export type Cat = {
  id: number
  name: string
  breed: string
  image: string
}

const mockCats = [
  { name: 'whiskers', breed: 'persian', image: '/cats/persian.webp' },
  { name: 'miso', breed: 'siamese', image: '/cats/siamese.webp' },
  { name: 'pirozhok', breed: 'british shorthair', image: '/cats/british-shorthair.webp' },
  { name: 'nori', breed: 'bengal', image: '/cats/bengal.webp' },
  { name: 'kavun', breed: 'maine coon', image: '/cats/maine-coon.webp' },
  { name: 'taro', breed: 'ragdoll', image: '/cats/ragdoll.webp' },
]

export const prerendered: Cat[] | undefined =
  typeof document === 'undefined' ? undefined : JSON.parse(document.getElementById('root')?.dataset.cats ?? 'null') ?? undefined

function isCat(value: unknown): value is Omit<Cat, 'id'> {
  const c = value as Partial<Cat> | null
  return (
    typeof c?.name === 'string' &&
    typeof c.breed === 'string' &&
    typeof c.image === 'string'
  )
}

export async function fetchCat(id: number, signal?: AbortSignal): Promise<Cat> {
  const url = import.meta.env.VITE_API_URL

  if (!url) {
    await new Promise((resolve) => setTimeout(resolve, 800))
    return { ...mockCats[(id - 1) % mockCats.length], id }
  }

  const res = await fetch(url, { signal, cache: 'no-store' })
  if (!res.ok) throw new Error(`GET ${url} failed with ${res.status}`)

  const data: unknown = await res.json()
  if (!isCat(data)) throw new Error(`GET ${url} returned an unexpected shape`)
  const { name, breed, image } = data
  return { id, name, breed, image }
}
