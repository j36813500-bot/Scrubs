import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';

type RouterContextType = {
  path: string;
  query: URLSearchParams;
  navigate: (to: string) => void;
};

const RouterContext = createContext<RouterContextType>({
  path: '/',
  query: new URLSearchParams(),
  navigate: () => {},
});

export function useRouter() {
  return useContext(RouterContext);
}

function parseHash(): { path: string; query: URLSearchParams } {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  const [path, qs] = hash.split('?');
  return { path: path || '/', query: new URLSearchParams(qs || '') };
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [{ path, query }, setState] = useState(parseHash);

  useEffect(() => {
    const onChange = () => {
      setState(parseHash());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', onChange);
    if (!window.location.hash) window.location.hash = '/';
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((to: string) => {
    window.location.hash = to;
  }, []);

  return (
    <RouterContext.Provider value={{ path, query, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}
