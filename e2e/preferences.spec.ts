import { expect, test } from '@playwright/test'
import { mockApi } from './fixtures.ts'

test.beforeEach(async ({ page }) => {
  await mockApi(page)
})

test.describe('theme', () => {
  test('a chosen theme survives reload, applied by index.html before the app loads', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'dark' }).click()
    await expect(page.locator('html')).toHaveClass('dark')

    await page.route('**/assets/*.js', (route) => route.abort())
    await page.reload()
    await expect(page.locator('html')).toHaveClass('dark')
  })

  test.describe('system in dark mode', () => {
    test.use({ colorScheme: 'dark' })

    test('follows the system when nothing is saved', async ({ page }) => {
      await page.goto('/')
      await expect(page.locator('html')).toHaveClass('dark')
      await expect(page.getByRole('button', { name: 'dark' })).toHaveAttribute('aria-pressed', 'true')
    })

    test('a saved light choice beats the system', async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem('theme', 'light'))
      await page.goto('/')
      await expect(page.getByRole('button', { name: 'light' })).toHaveAttribute('aria-pressed', 'true')
      await expect(page.locator('html')).not.toHaveClass('dark')
    })
  })
})

test.describe('language', () => {
  test.describe('Ukrainian browser', () => {
    test.use({ locale: 'uk-UA' })

    test('first visit comes up in Ukrainian', async ({ page }) => {
      await page.goto('/')
      await expect(page.locator('html')).toHaveAttribute('lang', 'uk')
      await expect(page.getByRole('button', { name: 'Подобається' })).toBeVisible()
      await expect(page).toHaveTitle('Whiskers, кіт породи Persian')
    })
  })

  test('a chosen language survives reload', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Русский' }).click()
    await expect(page.getByRole('button', { name: 'Нравится' })).toBeVisible()

    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru')
    await expect(page.getByRole('button', { name: 'Русский' })).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('button', { name: 'Нравится' })).toBeVisible()
  })
})
