import { readable, writable, derived } from "svelte/store";

export const backgrounds = readable([
    "/backgrounds/SparkyWrite.webp",
    "/backgrounds/fountain.webp",
]);

export const currentBackgroundIndex = writable(0);

// Derived store for the current background URL
export const currentBackground = derived(
    [backgrounds, currentBackgroundIndex],
    ([$backgrounds, $index]) => $backgrounds[$index] ?? null
);
