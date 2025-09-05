<script>
    import ScrollingText from "$lib/components/landing/Audio/ScrollingText.svelte";
    import { PlayerState } from "$lib/sharedStates/music.ts";
</script>

<div class="flex flex-col flex-1 min-w-0 pr-3 w-[20px]">
    <ScrollingText text={PlayerState.currentTrack.title} className="font-bold" />
    <ScrollingText text={PlayerState.currentTrack.artist} className="font-primary" />
</div>
