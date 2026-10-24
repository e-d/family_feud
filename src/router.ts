import { useEffect, useState } from 'react'

// Hash routes keep the app a plain static site: no server rewrites needed on Vercel.
export type Route = '/' | '/host' | '/board'

function current(): Route {
  const path = location.hash.replace(/^#/, '') || '/'
  return path === '/host' || path === '/board' ? path : '/'
}

export function navigate(route: Route) {
  location.hash = route
}

export function useRoute(): Route {
  const [route, setRoute] = useState(current)
  useEffect(() => {
    const onChange = () => setRoute(current())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}
