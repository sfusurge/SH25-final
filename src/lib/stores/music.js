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
    for (let i = arr.length - 1; i > -1; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[j], arr[i]] = [arr[i], arr[j]];
    }
    return arr;
}

// Core stores
export const trackIndex = writable(0);
export const currentLibType = writable('calm');

// Internal music library store
const _musicLib = writable(shuffleArr([...musicLibOptions.calm]));

// Derived store for reading music library
export const musicLib = derived(_musicLib, ($lib) => $lib);

// Function to change music library
export function setMusicLibrary(variant) {
    const newLib = [...musicLibOptions[variant]];
    shuffleArr(newLib);
    _musicLib.set(newLib);
    trackIndex.set(0);
    currentLibType.set(variant);
}