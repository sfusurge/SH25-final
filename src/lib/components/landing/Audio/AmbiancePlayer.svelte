<script>
    import { onMount } from 'svelte';
    import { masterVolume, ambianceVolumes } from '$lib/sharedStates/ambiance.svelte.js';

    const options = $state([
        {
            name: "Rain",
            file: "audio/Ambiance/light_rain.mp3",
            element: null
        },
        {
            name: "Cafe",
            file: "audio/Ambiance/cofee_shop_ambience.mp3",
            element: null
        },
        {
            name: "Water",
            file: "audio/Ambiance/gentle_ocean_waves.mp3",
            element: null
        },
        {
            name: "Fire",
            file: "audio/Ambiance/burning_fireplace_crackling_fire.mp3",
            element: null
        }
    ]);

    let masterVol = 0.5;
    let volumes = {
        Rain: 0,
        Cafe: 0,
        Water: 0,
        Fire: 0
    };

    // Subscribe to store changes
    masterVolume.subscribe(value => {
        masterVol = value;
        updateAudioElements();
    });

    ambianceVolumes.subscribe(value => {
        volumes = value;
        updateAudioElements();
    });

    function updateAudioElements() {
        for (const opt of options) {
            const vol = volumes[opt.name];
            const audio = opt.element;

            if (audio) {
                audio.volume = masterVol * vol;

                if (vol > 0 && audio.paused) {
                    audio.src = opt.file;
                    audio.play().catch(console.log);
                } else if (vol === 0 && !audio.paused) {
                    audio.pause();
                }
            }
        }
    }

    onMount(() => {
        // Initialize master volume from localStorage
        masterVolume.init();

        // Store references to audio elements after component mounts
        options.forEach(opt => {
            const audioElement = document.querySelector(`audio[data-ambiance="${opt.name}"]`);
            if (audioElement) {
                opt.element = audioElement;
            }
        });
    });
</script>

<div style="display: none;">
    {#each options as opt}
        <audio
                loop
                data-ambiance={opt.name}
                bind:this={opt.element}
></audio>
    {/each}
</div>