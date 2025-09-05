import { browser } from '$app/environment';

// Master volume store with localStorage persistence

class _MasterVolume {
    volume = $state(0.5);

    constructor() {
        if (browser) {
            this.volume = parseFloat(localStorage.getItem("masterVolume") ?? "0.5");
        }

        $effect.root(() => {
            $effect(() => {
                this.volume = Math.max(Math.min(1, this.volume), 0);
                localStorage.setItem("masterVolume", `${this.volume.toFixed(2)}`);
            })
        })
    }
}


export const masterVolume = new _MasterVolume();

export const ambianceVolumes = $state({
    Rain: 0,
    Cafe: 0,
    Water: 0,
    Fire: 0
});


export type Ambiance = keyof (typeof ambianceVolumes);