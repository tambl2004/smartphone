import React, { createContext, useContext, useState, useEffect } from 'react';

interface RouterContextType {
  path: string;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextType>({
  path: '/',
  navigate: () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export const useRouter = () => useContext(RouterContext);

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    
    const handleNavigate = () => {
      setPath(window.location.pathname);
    };
    window.addEventListener('navigate', handleNavigate);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('navigate', handleNavigate);
    };
  }, []);

  const navigate = (to: string) => {
    window.history.pushState({}, '', to);
    window.dispatchEvent(new Event('navigate'));
  };

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const Link: React.FC<{
  to: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}> = ({ to, children, className, style, onClick }) => {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) onClick(e);
    navigate(to);
  };

  return (
    <a href={to} onClick={handleClick} className={className} style={style}>
      {children}
    </a>
  );
};

export const Route: React.FC<{
  path: string;
  element: React.ReactNode;
}> = ({ path, element }) => {
  const { path: currentPath } = useRouter();
  
  const matchRoute = (routePath: string, currentPath: string) => {
    if (routePath === currentPath) return true;
    
    const routeParts = routePath.split('/');
    const currentParts = currentPath.split('/');
    
    if (routeParts.length !== currentParts.length) return false;
    
    return routeParts.every((part, i) => part.startsWith(':') || part === currentParts[i]);
  };

  if (matchRoute(path, currentPath)) {
    return <>{element}</>;
  }
  
  return null;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useParams = (routePattern: string): Record<string, string> => {
  const currentPath = window.location.pathname;
  const routeParts = routePattern.split('/');
  const currentParts = currentPath.split('/');
  const params: Record<string, string> = {};

  routeParts.forEach((part, i) => {
    if (part.startsWith(':')) {
      const paramName = part.slice(1);
      params[paramName] = currentParts[i];
    }
  });

  return params;
};
