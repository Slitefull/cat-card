import { expect, test } from '@playwright/test'
import { axeViolations, mockApi } from './fixtures.ts'

for (const theme of ['light', 'dark']) {
  test.describe(`${theme} theme`, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem('theme', t), theme)
    })

    test('cat page has no axe violations', async ({ page }) => {
      await mockApi(page)
      await page.goto('/')
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      expect(await axeViolations(page)).toEqual([])
    })

    test('error page has no axe violations', async ({ page }) => {
      await mockApi(page, { 1: 503 })
      await page.goto('/')
      await expect(page.getByRole('alert')).toBeVisible()
      expect(await axeViolations(page, { skip: ['page-has-heading-one'] })).toEqual([])
    })

    test('404 page has no axe violations', async ({ page }) => {
      await page.goto('/nope')
      await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
      expect(await axeViolations(page)).toEqual([])
    })
  })
}
