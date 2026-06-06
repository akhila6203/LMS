import * as React from "react";

const MOBILE_BREAKPOINT = 768;

// ✅ Custom Hook
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(undefined);

  React.useEffect(() => {
    // ✅ fixed media query syntax
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    mql.addEventListener("change", onChange);

    // initial check
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    return () => {
      mql.removeEventListener("change", onChange);
    };
  }, []);

  return !!isMobile;
}