import type { Cat } from './CatCard'

const mockCat: Cat = {
  id: 1,
  name: 'whiskers',
  breed: 'persian',
  image: 'https://cataas.com/cat?width=500',
}

function isCat(value: unknown): value is Cat {
  const c = value as Partial<Cat> | null
  return (
    typeof c?.id === 'number' &&
    typeof c.name === 'string' &&
    typeof c.breed === 'string' &&
    typeof c.image === 'string'
  )
}

export async function fetchCat(id: number, signal?: AbortSignal): Promise<Cat> {
  const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, '')

  if (!baseUrl) {
    await new Promise((resolve) => setTimeout(resolve, 800))
    return mockCat
  }

  const res = await fetch(`${baseUrl}/cats/${id}`, { signal })
  if (!res.ok) throw new Error(`GET /cats/${id} failed with ${res.status}`)

  const data: unknown = await res.json()
  if (!isCat(data)) throw new Error(`GET /cats/${id} returned an unexpected shape`)
  return data
}
