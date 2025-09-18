

export class GameMusicPlayer {

    song: AudioBuffer | undefined;

    currentTime = $state(0);
    isPlaying = $state(false);
    lastPlayTime = 0;
    offsetTime = 0;

    actx: AudioContext;

    audioSource: AudioBufferSourceNode | undefined;

    constructor() {

        this.actx = new window.AudioContext();

        $effect(() => {
            if (this.song) {
                this.currentTime = 0;
                this.lastPlayTime = 0;
                this.offsetTime = 0;
                this.isPlaying = false;
            }
        })
    }

    createSource() {
        if (!this.song) {
            return;
        }
        const bufferSource = this.actx.createBufferSource();
        bufferSource.buffer = this.song;
        bufferSource.connect(this.actx.destination);

        return bufferSource;
    }

    init() {
        requestAnimationFrame(this.update.bind(this));
    }

    update(t: number) {
        // update audio time
        if (this.isPlaying) {
            this.currentTime = this.actx.currentTime - this.lastPlayTime + this.offsetTime;
        } else {
            this.currentTime = this.offsetTime;
        }

        if (this.currentTime > (this.song?.duration ?? 0)) {
            this.isPlaying = false;
        }

        requestAnimationFrame(this.update.bind(this))
    }



    play() {
        this.audioSource = this.createSource();
        if (!this.audioSource) {
            return;
        }

        this.audioSource.start(this.actx.currentTime, this.offsetTime);
        this.lastPlayTime = this.actx.currentTime;
        this.isPlaying = true;
    }

    pause() {
        if (this.audioSource) {
            this.audioSource.stop();
            this.offsetTime += this.actx.currentTime - this.lastPlayTime;
        }

        this.isPlaying = false;
    }


    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    /**
     * sets the current playtime and pauses.
     * @param timeStamp
     * @returns
     */
    seek(timeStamp: number) {
        if (!this.song) {
            return;
        }

        this.pause();
        this.offsetTime = Math.max(0, Math.min(timeStamp, this.song.duration));
    }
}