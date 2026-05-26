import { useCallback, useEffect, useState } from 'react';

/** Desktop: expanded vs icon rail. Mobile: drawer open vs off-screen. */
export function useSidebarState(options?: { wide?: boolean }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const toggleSidebar = useCallback(() => {
    if (window.matchMedia('(min-width: 1024px)').matches) {
      setMobileOpen(false);
      setSidebarExpanded((v) => !v);
    } else {
      setMobileOpen((v) => !v);
    }
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const mainOffsetClass = sidebarExpanded
    ? options?.wide
      ? 'lg:pl-72'
      : 'lg:pl-64'
    : 'lg:pl-[4.5rem]';

  return {
    sidebarExpanded,
    mobileOpen,
    toggleSidebar,
    closeMobile,
    mainOffsetClass,
    setSidebarExpanded,
  };
}
