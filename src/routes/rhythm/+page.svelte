<script lang="ts">
    import RhythmGame from "$lib/components/rhythm/RhythmGame.svelte";
    import { global } from "../+layout.svelte";
</script>

<div class="gameParent" class:mobile={global.mobile}>
    <RhythmGame />
</div>

<style>
    .gameParent {
        width: 100%;
        height: 100dvh;

        padding: 5rem;
        box-sizing: border-box;

        display: flex;
    }

    .mobile {
        padding: 0;
    }
</style>
