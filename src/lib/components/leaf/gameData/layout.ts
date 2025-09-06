import { writable } from 'svelte/store';

export const isMobile = writable(false);
export const isNarrow = writable(false);
export const MOBILE_BREAKPOINT_PX = 640;

export function observeLayout(node: HTMLElement, breakpointPx: number = MOBILE_BREAKPOINT_PX) {
    const ro = new ResizeObserver(([entry]) => {
        const w = entry?.contentRect?.width ?? window.innerWidth;
        isMobile.set(w < breakpointPx);
        isNarrow.set(w < 400);
    });
    ro.observe(node);
    return {
        destroy() {
            ro.disconnect();
        }
    };
}


