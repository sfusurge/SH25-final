<script lang="ts">
    import RhythmGame from "$lib/components/rhythm/RhythmGame.svelte";
</script>

<div class="gameParent">

    <RhythmGame/>
</div>

<style>
    .gameParent {
        width: 100%;
        height: 100dvh;

        padding: 5rem;
        box-sizing: border-box;

        display: flex;
    }
</style>