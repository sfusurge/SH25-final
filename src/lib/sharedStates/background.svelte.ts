export const backgrounds = {
    SPARKY_WRITE: "/backgrounds/SparkyWrite.webp",
    FOUNTAIN: "/backgrounds/fountain.webp",
};


export type Background = keyof (typeof backgrounds);
export const currentBackground: { val: Background } = $state({ val: "SPARKY_WRITE" });