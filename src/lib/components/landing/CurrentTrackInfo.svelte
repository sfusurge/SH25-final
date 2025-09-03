<script>
    import ScrollingText from '$lib/components/landing/Audio/ScrollingText.svelte';

    import { musicLib, trackIndex } from '$lib/stores/music.js';

    $: currentTrack = $musicLib[$trackIndex];
    $: currentTitle = currentTrack?.title || '';
    $: currentArtist = currentTrack?.artist || '';
</script>

<div class="flex flex-col flex-1 min-w-0 pr-3 w-[20px]">
    <ScrollingText text={currentTitle} className="font-bold" />
    <ScrollingText text={currentArtist} className="font-primary" />
</div>