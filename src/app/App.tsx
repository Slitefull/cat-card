import { useState } from 'react'
import { RouterProvider } from '@tanstack/react-router'
import { createAppRouter } from './router'

export default function App({ router: loaded }: { router?: ReturnType<typeof createAppRouter> }) {
  const [router] = useState(() => loaded ?? createAppRouter())
  return <RouterProvider router={router} />
}
