import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Master volume store with localStorage persistence
function createMasterVolumeStore() {
    const { subscribe, set, update } = writable(0.5);

    return {
        subscribe,
        set: (value) => {
            if (browser) {
                localStorage.setItem('masterVolume', value.toString());
            }
            set(value);
        },
        update,
        // Initialize from localStorage
        init: () => {
            if (browser) {
                const saved = localStorage.getItem('masterVolume');
                if (saved) {
                    set(parseFloat(saved));
                }
            }
        }
    };
}

export const masterVolume = createMasterVolumeStore();

export const ambianceVolumes = writable({
    Rain: 0,
    Cafe: 0,
    Water: 0,
    Fire: 0
});

// Helper function to set individual ambiance volume
export function setAmbianceVolume(name, volume) {
    ambianceVolumes.update(volumes => ({
        ...volumes,
        [name]: volume
    }));
}