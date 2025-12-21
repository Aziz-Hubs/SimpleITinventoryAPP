/**
 * @file use-mobile.ts
 * @description Responsive hook to detect if the user's viewport is below the mobile breakpoint.
 * Uses a media query listener for performance instead of window resize events.
 * @path /hooks/use-mobile.ts
 */

import * as React from "react"

/**
 * Breakpoint in pixels (768px) consistent with Tailwind's 'md' breakpoint.
 */
const MOBILE_BREAKPOINT = 768

/**
 * Hook to reactively track mobile viewport status.
 * 
 * @returns {boolean} True if the viewport is less than 768px.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

   React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      // Check both innerWidth and media query status for reliability
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Modern event listener for media queries
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
