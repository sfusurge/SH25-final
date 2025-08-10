<script lang="ts">
    import AudioWaves from "$lib/components/beatmapper/AudioWaves.svelte";

    let files: FileList | undefined = $state();
</script>

<!-- :skull: -->
<svelte:boundary>
    <label for="fileinput">File:<input type="file" id="fileinput" bind:files /></label>

    <AudioWaves bpm={0} bpmOffset={0} file={(files ?? [])[0]} />

    {#snippet pending()}
        Loading audio...
    {/snippet}
</svelte:boundary>

<style>
    /* CSS */
</style>
