export const backgrounds = Object.freeze({
    SPARKY_WRITE: "/backgrounds/SparkyWrite.webp",
    FOUNTAIN: "/backgrounds/fountain.webp",
});


export type Background = (typeof backgrounds)[keyof (typeof backgrounds)];
export const currentBackground: { val: Background } = $state({ val: "/backgrounds/SparkyWrite.webp" });

// TODO: adapt for more backgrounds
export function toggleBackground() {
    if (currentBackground.val === backgrounds.FOUNTAIN) {
        currentBackground.val = backgrounds.SPARKY_WRITE;
    } else {
        currentBackground.val = backgrounds.FOUNTAIN;
    }
}