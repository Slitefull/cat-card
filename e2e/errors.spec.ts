import { expect, test } from '@playwright/test'
import { type Overrides, mockApi } from './fixtures.ts'

test('a failed first load recovers with Refresh once the API is back', async ({ page }) => {
  const overrides: Overrides = { 1: 503 }
  await mockApi(page, overrides)
  await page.goto('/')
  await expect(page.getByRole('alert')).toContainText("Couldn't load the cat")

  delete overrides[1]
  await page.getByRole('button', { name: 'Refresh page' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('a malformed response is an error, not a broken card', async ({ page }) => {
  await mockApi(page, { 2: 'malformed' })
  await page.goto('/')
  await expect(page.getByRole('alert')).toBeVisible()
  await expect(page.getByRole('img')).toHaveCount(0)
})

test('when fetching more cats fails, the error shows only after the deck runs out', async ({ page }) => {
  await mockApi(page, { 4: 500, 5: 500, 6: 500 })
  await page.goto('/')
  const like = page.getByRole('button', { name: 'Like' })

  await like.click()
  await like.click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('pirozhok')
  await expect(page.getByRole('alert')).toHaveCount(0)

  await like.click()
  await expect(page.getByRole('alert')).toBeVisible()
  await expect(like).toBeDisabled()
})

test('unknown URL shows a noindex 404 that links back to the cat', async ({ page }) => {
  await mockApi(page)
  await page.goto('/nope')
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
  await expect(page).toHaveTitle('Page not found')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex')

  await page.getByRole('link', { name: 'Back to the cat' }).click()
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('whiskers')
})
