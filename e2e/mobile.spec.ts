import { expect, test } from '@playwright/test'
import { axeViolations, mockApi } from './fixtures.ts'

const screens = [
  { name: 'small phone', width: 320, height: 568, phone: true },
  { name: 'phone', width: 390, height: 664, phone: true },
  { name: 'phone on its side', width: 844, height: 340, phone: true },
  { name: 'tablet', width: 768, height: 1024, phone: false },
  { name: 'tablet on its side', width: 1024, height: 700, phone: false },
]

for (const { name, width, height, phone } of screens) {
  test.describe(`${name} ${width}x${height}`, () => {
    test.use({ viewport: { width, height }, hasTouch: true })

    test('card and all three buttons fit on one screen, no scrolling', async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem('lang', 'uk'))
      await mockApi(page)
      await page.goto('/')
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

      for (const label of ['Далі', 'Мяукнути', 'Подобається']) {
        await expect(page.getByRole('button', { name: label })).toBeInViewport({ ratio: 1 })
      }
      for (const caption of ['Далі', 'Подобається']) {
        await expect(page.getByText(caption, { exact: true })).toBeInViewport({ ratio: 1 })
      }
      const size = await page.locator('html').evaluate(({ scrollWidth, scrollHeight }) => ({ scrollWidth, scrollHeight }))
      expect(size).toEqual({ scrollWidth: width, scrollHeight: height })
    })

    if (!phone) {
      test('language and theme switches sit in the header', async ({ page }) => {
        await mockApi(page)
        await page.goto('/')
        await expect(page.getByRole('group', { name: 'Theme' })).toBeVisible()
        await expect(page.getByRole('button', { name: 'Settings' })).toBeHidden()
      })
      return
    }

    test('language and theme switches live in the sidebar', async ({ page }) => {
      await mockApi(page)
      await page.goto('/')
      await expect(page.getByRole('group', { name: 'Theme' })).toBeHidden()

      await page.getByRole('button', { name: 'Settings' }).click()
      const sidebar = page.getByRole('dialog', { name: 'Settings' })
      await expect(sidebar).toBeVisible()
      expect(await axeViolations(page)).toEqual([])
      await sidebar.getByRole('button', { name: 'dark' }).click()
      await expect(page.locator('html')).toHaveClass('dark')
      expect(await axeViolations(page)).toEqual([])

      await sidebar.getByRole('button', { name: 'Українська' }).click()
      await expect(page.locator('html')).toHaveAttribute('lang', 'uk')
      await page.keyboard.press('Escape')
      await expect(sidebar).toBeHidden()
      await expect(page.getByRole('button', { name: 'Подобається' })).toBeInViewport()
    })
  })
}
