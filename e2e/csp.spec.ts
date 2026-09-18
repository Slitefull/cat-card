import { expect, test } from '@playwright/test'
import { mockApi } from './fixtures.ts'

test.beforeEach(async ({ page }) => {
  await mockApi(page)
})

test('every feature works under the CSP, nothing gets blocked', async ({ page }) => {
  const blocked: string[] = []
  page.on('console', (m) => {
    if (m.text().includes('Content Security Policy')) blocked.push(m.text())
  })
  await page.goto('/')
  await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toHaveAttribute('content', /script-src 'self' 'sha256-/)

  await page.getByRole('button', { name: 'Flip card' }).click()
  await page.getByRole('button', { name: 'Meow' }).click()
  await page.getByRole('button', { name: 'Like' }).click()
  await page.getByRole('button', { name: 'dark' }).click()
  await page.setViewportSize({ width: 390, height: 664 })
  await page.getByRole('button', { name: 'Settings' }).click()
  await page.getByRole('dialog', { name: 'Settings' }).getByRole('button', { name: 'Українська' }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'uk')

  expect(blocked).toEqual([])
})

test('an injected inline script does not run', async ({ page }) => {
  await page.goto('/')
  await expect(page.addScriptTag({ content: 'window.injected = true' })).rejects.toThrow('Content Security Policy')
  expect(await page.evaluate('typeof window.injected')).toBe('undefined')
})
