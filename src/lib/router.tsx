import { useEffect, useState, useCallback } from 'react';

type RouterState = { path: string; query: URLSearchParams };

let currentState: RouterState = { path: '/', query: new URLSearchParams() };
const listeners = new Set<() => void>();

function parseHash(): RouterState {
  const hash = window.location.hash.slice(1) || '/';
  const [path, queryString] = hash.split('?');
  return { path: path || '/', query: new URLSearchParams(queryString || '') };
}

function update() {
  currentState = parseHash();
  listeners.forEach(l => l());
}

window.addEventListener('hashchange', update);

export function useRouter() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const l = () => setTick(t => t + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);

  const navigate = useCallback((to: string) => {
    window.location.hash = to;
  }, []);

  return { ...currentState, navigate };
}

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<RouterState>(() => parseHash());
  useEffect(() => {
    const l = () => setState(parseHash());
    listeners.add(l);
    setState(parseHash());
    return () => { listeners.delete(l); };
  }, []);
  return <>{children}</>;
}
