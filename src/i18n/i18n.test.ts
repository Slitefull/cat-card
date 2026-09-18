import en from './locales/en.json'
import ru from './locales/ru.json'
import uk from './locales/uk.json'
import i18n, { languages } from '@/i18n'

const flatten = (obj: object, prefix = ''): Record<string, string> =>
  Object.fromEntries(
    Object.entries(obj).flatMap(([key, value]) =>
      typeof value === 'object' ? Object.entries(flatten(value, `${prefix}${key}.`)) : [[`${prefix}${key}`, value]],
    ),
  )

const placeholders = (s: string) => (s.match(/{{\w+}}/g) ?? []).sort()

const english = flatten(en)

test.each([
  ['uk', uk],
  ['ru', ru],
])('%s has exactly the English keys, none empty, same placeholders', (_, locale) => {
  const translated = flatten(locale)
  expect(Object.keys(translated).sort()).toEqual(Object.keys(english).sort())
  for (const [key, text] of Object.entries(translated)) {
    expect(text.trim(), key).not.toBe('')
    expect(placeholders(text), key).toEqual(placeholders(english[key]))
  }
})

test('every offered language has resources and is supported', () => {
  for (const lng of Object.keys(languages)) {
    expect(i18n.hasResourceBundle(lng, 'translation')).toBe(true)
    expect(i18n.options.supportedLngs).toContain(lng)
  }
})

test('changing language updates <html lang>', async () => {
  await i18n.changeLanguage('uk')
  expect(document.documentElement.lang).toBe('uk')
  expect(i18n.t('theme.dark')).toBe('темна')
})

test('an unsupported language falls back to English', async () => {
  await i18n.changeLanguage('de')
  expect(i18n.resolvedLanguage).toBe('en')
  expect(i18n.t('theme.dark')).toBe('dark')
})

test('interpolation leaves names unescaped (React escapes them)', () => {
  expect(i18n.t('cat.imageAlt', { name: 'Tom & Jerry', breed: '<mix>' })).toBe('Tom & Jerry, a <mix> cat')
})
