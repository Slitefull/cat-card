import { type Page, expect, test } from '@playwright/test'
import { cat, mockApi } from './fixtures.ts'

const heading = (page: Page) => page.getByRole('heading', { level: 1 })
const flip = (page: Page) => page.getByRole('button', { name: 'Flip card' })

async function drag(page: Page, dx: number, dy = 0) {
  const box = (await flip(page).boundingBox())!
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  for (let step = 1; step <= 6; step++) {
    await page.mouse.move(x + (dx * step) / 6, y + (dy * step) / 6)
    await page.waitForTimeout(30)
  }
  await page.waitForTimeout(200)
  await page.mouse.up()
}

test('boots with the first three cats and fills the head for SEO', async ({ page }) => {
  const requested = await mockApi(page)
  await page.goto('/')

  await expect(heading(page)).toHaveText('whiskers')
  expect(requested).toHaveLength(3)
  await expect(page).toHaveTitle('Whiskers, Persian cat')
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', cat(1).image)
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    'Whiskers is a persian cat. See their photo and profile.',
  )
})

test('Like, Skip and the keyboard deal the next cat and fetch one more', async ({ page }) => {
  const requested = await mockApi(page)
  await page.goto('/')
  await expect(heading(page)).toHaveText('whiskers')

  await page.getByRole('button', { name: 'Like' }).click()
  await expect(heading(page)).toHaveText('miso')
  await expect.poll(() => requested).toContain(4)

  await page.getByRole('button', { name: 'Skip' }).click()
  await expect(heading(page)).toHaveText('pirozhok')
  await expect.poll(() => requested).toContain(5)

  await flip(page).focus()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Skip' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(heading(page)).toHaveText('nori')
})

test('keyboard only: the skip link jumps past settings, arrows swipe, focus stays on the card', async ({ page }) => {
  await mockApi(page)
  await page.goto('/')
  await expect(heading(page)).toHaveText('whiskers')

  await page.keyboard.press('Tab')
  const skipLink = page.getByRole('link', { name: 'Jump to the cats' })
  await expect(skipLink).toBeFocused()
  await expect(skipLink).toBeInViewport({ ratio: 1 })
  await page.keyboard.press('Enter')
  await page.keyboard.press('Tab')
  await expect(flip(page)).toBeFocused()

  await page.keyboard.press('ArrowRight')
  await expect(heading(page)).toHaveText('miso')
  await expect(flip(page)).toBeFocused()
  await page.keyboard.press('ArrowLeft')
  await expect(heading(page)).toHaveText('pirozhok')
  await expect(flip(page)).toBeFocused()
})

test('dragging past the threshold swipes the card either way', async ({ page }) => {
  const requested = await mockApi(page)
  await page.goto('/')
  await expect(heading(page)).toHaveText('whiskers')

  await drag(page, 180)
  await expect(heading(page)).toHaveText('miso')
  await drag(page, -180)
  await expect(heading(page)).toHaveText('pirozhok')
  await expect.poll(() => requested).toEqual(expect.arrayContaining([4, 5]))
})

test('a short slow drag snaps back without swiping or flipping', async ({ page }) => {
  await mockApi(page)
  await page.goto('/')
  await expect(heading(page)).toHaveText('whiskers')

  await drag(page, 40)
  await expect(heading(page)).toHaveText('whiskers')
  await expect(flip(page)).toHaveAttribute('aria-pressed', 'false')
})

test('keyboard flips the card even right after a drag released off the card', async ({ page }) => {
  await mockApi(page)
  await page.goto('/')
  await expect(heading(page)).toHaveText('whiskers')

  const box = (await flip(page).boundingBox())!
  await drag(page, 40, box.height)
  await expect(flip(page)).toHaveAttribute('aria-pressed', 'false')

  await flip(page).focus()
  await page.keyboard.press('Enter')
  await expect(flip(page)).toHaveAttribute('aria-pressed', 'true')
})

test('clicking the card flips it over and back', async ({ page }) => {
  await mockApi(page)
  await page.goto('/')
  await expect(heading(page)).toHaveText('whiskers')

  await flip(page).click()
  await expect(flip(page)).toHaveAttribute('aria-pressed', 'true')
  await expect(heading(page)).toHaveCount(0)
  await flip(page).click()
  await expect(heading(page)).toHaveText('whiskers')
})

test('meow pops a bubble that changes voice each time', async ({ page }) => {
  await mockApi(page)
  await page.goto('/')
  const meow = page.getByRole('button', { name: 'Meow' })

  await meow.click()
  await expect(page.getByRole('status')).toHaveText('Meow!')
  await meow.click()
  await expect(page.getByRole('status')).toHaveText('Mew!')
})
