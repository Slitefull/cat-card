import { MotionGlobalConfig } from 'motion/react'
import '@testing-library/jest-dom/vitest'
import i18n from '@/i18n'

window.scrollTo = () => {}

MotionGlobalConfig.skipAnimations = true

afterEach(async () => {
  await i18n.changeLanguage('en')
  localStorage.clear()
  document.documentElement.classList.remove('dark')
  window.history.pushState({}, '', '/')
})
