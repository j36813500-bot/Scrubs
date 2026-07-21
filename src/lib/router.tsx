import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'

interface RouterState {
  path: string
  query: Record<string, string>
  navigate: (to: string) => void
  push: (to: string) => void
}

const RouterContext = createContext<RouterState | null>(null)

function parseHash(): { path: string; query: Record<string, string> } {
  const hash = window.location.hash.slice(1) || '/'
  const [path, queryString] = hash.split('?')
  const query: Record<string, string> = {}
  if (queryString) {
    new URLSearchParams(queryString).forEach((v, k) => { query[k] = v })
  }
  return { path: path || '/', query }
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(parseHash)

  useEffect(() => {
    const onHashChange = () => setState(parseHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = useCallback((to: string) => {
    window.location.hash = to
    window.scrollTo(0, 0)
  }, [])

  const push = useCallback((to: string) => {
    window.location.hash = to
    window.scrollTo(0, 0)
  }, [])

  return (
    <RouterContext.Provider value={{ ...state, navigate, push }}>
      {children}
    </RouterContext.Provider>
  )
}

export function useRouter(): RouterState {
  const ctx = useContext(RouterContext)
  if (!ctx) throw new Error('useRouter must be used within RouterProvider')
  return ctx
}
