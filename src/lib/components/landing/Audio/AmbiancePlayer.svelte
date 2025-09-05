<script lang="ts">
    import {
        masterVolume,
        ambianceVolumes,
        type Ambiance,
    } from "$lib/sharedStates/ambiance.svelte.js";

    const options = $state<{ name: Ambiance; file: string; element: HTMLAudioElement | null }[]>([
        {
            name: "Rain",
            file: "audio/Ambiance/light_rain.mp3",
            element: null,
        },
        {
            name: "Cafe",
            file: "audio/Ambiance/cofee_shop_ambience.mp3",
            element: null,
        },
        {
            name: "Water",
            file: "audio/Ambiance/gentle_ocean_waves.mp3",
            element: null,
        },
        {
            name: "Fire",
            file: "audio/Ambiance/burning_fireplace_crackling_fire.mp3",
            element: null,
        },
    ]);

    const paused = $derived(options.map((item) => ambianceVolumes[item.name] > 0));
</script>

<div style="display: none;">
    {#each options as opt, index}
        <audio
            loop
            bind:this={opt.element}
            volume={ambianceVolumes[opt.name] * masterVolume.volume}
            bind:paused={paused[index]}
        ></audio>
    {/each}
</div>
