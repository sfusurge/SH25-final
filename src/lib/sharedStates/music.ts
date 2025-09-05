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

class _PlayerState {
    trackIndex = $state(0);
    currentLibName = $state<MusicLib>("calm");
    currentMusicLib = $derived(shuffleArr(musicLibOptions[this.currentLibName]));
    currentTrack = $derived(this.currentMusicLib[this.trackIndex]);

    constructor(){
        $effect(()=>{
            this.trackIndex = Math.max(Math.min(this.currentMusicLib.length - 1, this.trackIndex), 0);
        })
    }
}

export const PlayerState = new _PlayerState();

