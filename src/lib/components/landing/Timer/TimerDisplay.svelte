<script lang="ts">
    import { paused, minutes, seconds } from '$lib/sharedStates/timer.js';
    import { derived } from 'svelte/store';

    interface Props {
        showWhenPaused?: boolean;
    }

    let { showWhenPaused = false }: Props = $props();

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