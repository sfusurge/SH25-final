export const backgrounds = Object.freeze({
    SPARKY_WRITE: "/backgrounds/writing.mp4",
    FOUNTAIN: "/backgrounds/fountain.mp4",
});

export const bgMobileStyle = Object.freeze({
    [backgrounds.FOUNTAIN]: "",
    [backgrounds.SPARKY_WRITE]: "object-position: right 35% top 0;"
})

export type Background = (typeof backgrounds)[keyof (typeof backgrounds)];
export const currentBackground: { val: Background } = $state({ val: "/backgrounds/writing.mp4" });

// TODO: adapt for more backgrounds
export function toggleBackground() {
    if (currentBackground.val === backgrounds.FOUNTAIN) {
        currentBackground.val = backgrounds.SPARKY_WRITE;
    } else {
        currentBackground.val = backgrounds.FOUNTAIN;
    }
}