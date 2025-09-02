<script>
    import { paused, minutes, seconds } from '$lib/stores/timer.js';
    import { derived } from 'svelte/store';

    export let showWhenPaused = false;

    const formattedTime = derived(
        [minutes, seconds],
        ([$minutes, $seconds]) => {
            return `${$minutes}:${$seconds}`;
        }
    );
</script>

{#if !$paused || showWhenPaused}
    <span class="text-decor">
        {$formattedTime}
    </span>
{/if}