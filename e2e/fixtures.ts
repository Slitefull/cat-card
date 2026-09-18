import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import type { Page } from '@playwright/test'

const names = [
  ['whiskers', 'persian'],
  ['miso', 'siamese'],
  ['pirozhok', 'british shorthair'],
  ['nori', 'bengal'],
  ['kavun', 'maine coon'],
  ['taro', 'ragdoll'],
]

const photo = (id: number) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><rect width="400" height="500" fill="hsl(${id * 47} 60% 60%)"/></svg>`,
  )}`

export const cat = (n: number) => {
  const [name, breed] = names[(n - 1) % names.length]
  return { name, breed, image: photo(n) }
}

export type Overrides = Record<number, number | 'malformed'>

export async function mockApi(page: Page, overrides: Overrides = {}) {
  const requested: number[] = []
  await page.route('**/api', (route) => {
    const n = requested.push(requested.length + 1)
    const override = overrides[n]
    if (typeof override === 'number') return route.fulfill({ status: override })
    return route.fulfill({ json: override === 'malformed' ? { data: cat(n) } : cat(n) })
  })
  return requested
}

type Axe = typeof import('axe-core')

export async function axeViolations(page: Page, { skip = [] as string[] } = {}) {
  await page.evaluate(await readFile(fileURLToPath(import.meta.resolve('axe-core/axe.min.js')), 'utf8'))
  return page.evaluate(async (skip) => {
    const rules = Object.fromEntries(skip.map((id) => [id, { enabled: false }]))
    const { violations } = await (globalThis as unknown as { axe: Axe }).axe.run({ rules })
    return violations.map((v) => `${v.id}: ${v.help} -> ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
  }, skip)
}
