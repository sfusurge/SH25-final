import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Master volume store with localStorage persistence
function createMasterVolume() {
    let vol = $state(0.5);
    $effect(() => {
        if (browser) {
            vol = parseFloat(localStorage.getItem("masterVolume") ?? "0.5");
        }
    });
    return {
        get volume() {
            return vol;
        },
        set volume(newVal: number) {
            vol = Math.max(Math.min(1, newVal), 0);
            localStorage.setItem("masterVolume", `${vol.toFixed(2)}`);
        }
    };
}

export const masterVolume = createMasterVolume();

export const ambianceVolumes = $state({
    Rain: 0,
    Cafe: 0,
    Water: 0,
    Fire: 0
});
