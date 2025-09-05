import {
    calmMusicLibrary,
    epicMusicLibrary,
    specialMusicLibrary,
    ambianceLibrary
} from '$lib/sharedStates/audioLibrary.js';

export const musicLibOptions = {
    calm: calmMusicLibrary,
    epic: epicMusicLibrary,
    special: specialMusicLibrary,
    ambiance: ambianceLibrary,
};

export type MusicLib = keyof (typeof musicLibOptions);

function shuffleArr<T>(arr: T[]) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[j], shuffled[i]] = [shuffled[i], shuffled[j]];
    }
    return shuffled;
}

function _mod(n: number, d: number) {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder
    return ((n % d) + d) % d;
}

class _PlayerState {
    trackIndex = $state(0);
    currentLibName = $state<MusicLib>("calm");
    currentMusicLib = $derived(shuffleArr(musicLibOptions[this.currentLibName]));
    currentTrack = $derived(this.currentMusicLib[this.trackIndex]);

    constructor() {
        $effect.root(() => {
            $effect(() => {
                if (this.trackIndex >= this.currentMusicLib.length) {
                    this.currentMusicLib = shuffleArr(this.currentMusicLib);
                    this.trackIndex = 0;
                }
                this.trackIndex = _mod(this.trackIndex, this.currentMusicLib.length);
            });
        });
    }
}

export const PlayerState = new _PlayerState();

