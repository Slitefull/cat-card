import { render } from './prerender'

test('prerenders / as the dealt deck: English, first photo visible and high priority, cats handed over', async () => {
  vi.stubEnv('SSR', true)
  const { html, cats } = await render()
  expect(cats?.map((cat) => cat.name)).toEqual(['whiskers', 'miso', 'pirozhok'])
  expect(html).toContain('>whiskers</h1>')
  expect(html).toMatch(/<img src="\/cats\/persian.webp" alt="whiskers, a persian cat" fetchPriority="high"/)
  expect(html).toContain('style="z-index:3;opacity:1;transform:none')
})
