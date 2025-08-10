<script lang="ts">
    import AudioWaves from "$lib/components/beatmapper/AudioWaves.svelte";

    let files: FileList | undefined = $state();

    let bpm = $state(30);
    let bpmOffset = $state(0);
</script>

<!-- :skull: -->
<svelte:boundary>
    <label for="fileinput">File:<input type="file" id="fileinput" bind:files /></label>
    <label for="bpmInput"
        >Bpm: {bpm}
        <input type="range" min="30" max="180" id="bpmInput" bind:value={bpm} /></label
    >
    <label for="offsetInput"
        >Offset: {`${bpmOffset.toPrecision(3).padEnd(5, "0")}`}s
        <input
            step="any"
            type="range"
            min="0"
            max="1"
            id="offsetInput"
            bind:value={bpmOffset}
        /></label
    >

    <AudioWaves {bpm} {bpmOffset} file={(files ?? [])[0]} />

    {#snippet pending()}
        Loading audio...
    {/snippet}
</svelte:boundary>

<style>
    /* CSS */
</style>
