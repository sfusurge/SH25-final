import { writable } from 'svelte/store';

export const isMobile = writable(false);
export const isNarrow = writable(false);

// Align with Tailwind's sm: breakpoint (640px)
export const MOBILE_BREAKPOINT_PX = 640;


export function observeLayout(node: HTMLElement, breakpointPx: number = MOBILE_BREAKPOINT_PX) {
    const updateLayout = () => {
        const w = window.innerWidth;

        isMobile.set(w < breakpointPx);
        isNarrow.set(w < 400); // Keep existing narrow detection
    };

    updateLayout();


    const ro = new ResizeObserver(() => {
        updateLayout();
    });

    const handleResize = () => {
        updateLayout();
    };

    ro.observe(node);
    window.addEventListener('resize', handleResize);

    return {
        destroy() {
            ro.disconnect();
            window.removeEventListener('resize', handleResize);
        }
    };
}


