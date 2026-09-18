import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { prerendered } from '@/features/cats/api'
import App from './App'
import { createAppRouter } from './router'

export async function mount(root: HTMLElement) {
  const router = createAppRouter()
  if (prerendered) await router.load()
  createRoot(root).render(
    <StrictMode>
      <App router={router} />
    </StrictMode>,
  )
}
