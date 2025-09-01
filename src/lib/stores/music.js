import { writable, derived } from 'svelte/store';
import {
    calmMusicLibrary,
    epicMusicLibrary,
    specialMusicLibrary,
    ambianceLibrary
} from '$lib/stores/audioLibrary.js';

export const musicLibOptions = {
    calm: calmMusicLibrary,
    epic: epicMusicLibrary,
    special: specialMusicLibrary,
    ambiance: ambianceLibrary,
};

function shuffleArr(arr) {
    const shuffled = [...arr]; // Create a copy to avoid mutating the original
    for (let i = shuffled.length - 1; i > 0; i--) { // Changed condition to i > 0
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[j], shuffled[i]] = [shuffled[i], shuffled[j]];
    }
    return shuffled;
}

export const trackIndex = writable(0);
export const currentLibType = writable('calm');

const _musicLib = writable(shuffleArr(musicLibOptions.calm));

export const musicLib = derived(_musicLib, ($lib) => $lib);

export function setMusicLibrary(variant) {
    console.error(`Setting music library to: ${variant}`);
    if (!musicLibOptions[variant]) {
        console.error(`Invalid music library variant: ${variant}`);
        return;
    }

    const newLib = shuffleArr(musicLibOptions[variant]);
    _musicLib.set(newLib);
    trackIndex.set(0);
    currentLibType.set(variant);
}
