export const backgrounds = Object.freeze({
    SPARKY_WRITE: "/backgrounds/writing.mp4",
    FOUNTAIN: "/backgrounds/fountain.mp4",
    SPARKY_WRITE_DARK: "/backgrounds/writing_dark.mp4",
    FOUNTAIN_DARK: "/backgrounds/fountain_dark.mp4"
});

export const bgMobileStyle = Object.freeze({
    [backgrounds.FOUNTAIN]: "object-position: right 20% top 0;",
    [backgrounds.FOUNTAIN_DARK]: "object-position: right 20% top 0;",

    [backgrounds.SPARKY_WRITE]: "object-position: right 35% top 0;",
    [backgrounds.SPARKY_WRITE_DARK]: "object-position: right 35% top 0;",
})

export type Background = (typeof backgrounds)[keyof (typeof backgrounds)];
export const currentBackground: { val: Background } = $state({ val: "/backgrounds/writing.mp4" });
let isDark = $state(false);
let toggle = $state(false);
// TODO: adapt for more backgrounds
export function toggleBackground(toggleDark = false) {
    if (toggleDark) {
        isDark = !isDark;
    } else {
        toggle = !toggle;
    }

    if (!toggle) {
        if (isDark) {
            currentBackground.val = backgrounds.SPARKY_WRITE_DARK;
        } else {
            currentBackground.val = backgrounds.SPARKY_WRITE;
        }
    } else {
        if (isDark) {
            currentBackground.val = backgrounds.FOUNTAIN_DARK;
        } else {
            currentBackground.val = backgrounds.FOUNTAIN;
        }
    }
}