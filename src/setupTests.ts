import '@testing-library/jest-dom/vitest'

// jsdom has no scrollTo; router scroll restoration calls it
window.scrollTo = () => {}
