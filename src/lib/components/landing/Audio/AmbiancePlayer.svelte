<script lang="ts">
    import {
        masterVolume,
        ambianceVolumes,
        type Ambiance,
    } from "$lib/sharedStates/ambiance.svelte.js";
    import { untrack } from "svelte";

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

    $effect(() => {
        for (const opt of options) {
            if (ambianceVolumes[opt.name] > 0) {
                untrack(() => {
                    if (opt.element?.paused) {
                        opt.element!.src = opt.file;
                        opt.element?.play();
                    }
                });
            } else {
                opt.element?.pause();
            }
        }
    });
</script>

<div style="display: none;">
    {#each options as opt}
        <audio loop bind:this={opt.element} volume={ambianceVolumes[opt.name] * masterVolume.volume}
        ></audio>
    {/each}
</div>
