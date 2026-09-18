import { useState } from 'react'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <main className="min-h-screen grid place-items-center bg-slate-50 text-slate-900">
      <button
        onClick={() => setCount((c) => c + 1)}
        className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500"
      >
        Count: {count}
      </button>
    </main>
  )
}
