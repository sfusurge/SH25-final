<script>
    import Frame from "$lib/components/landing/Frame.svelte";
    import CurrentBackgroundMobile from "$lib/components/landing/background/CurrentBackgroundMobile.svelte";
    import MusicPlayer from "$lib/components/landing/Audio/MusicPlayer.svelte";
    import CurrentTrackInfo from "$lib/components/landing/CurrentTrackInfo.svelte";
    import Timer from "$lib/components/landing/Timer/Timer.svelte";
    import TimerDisplay from "$lib/components/landing/Timer/TimerDisplay.svelte";
    import SwapBackground from "$lib/components/landing/background/SwapBackground.svelte";
    import HoverEffectButton from "$lib/components/landing/Audio/ScrollingText.svelte";
    import TimerDialog from "$lib/components/landing/Timer/TimerDialog.svelte";
    import {
        currentBackground,
        backgrounds,
        toggleBackground,
    } from "$lib/sharedStates/background.svelte.js";
    import { global } from "../../../../routes/+layout.svelte";

    let showSettings = $state(false);

    function toggleSettings() {
        showSettings = !showSettings;
    }

    function closeSettings() {
        showSettings = false;
    }
</script>


<!-- Desktop layout -->
<div class="flex flex-1 flex-col h-full" style="max-height: 100dvh">
    <div class="flex justify-between items-start pt-8 px-8">
        <Timer />
        <SwapBackground />
    </div>

    <div class="m-8 flex-1 items-center justify-center" style="min-height: 0">
        <Frame />
    </div>

    <div class="flex justify-center pb-4">
        <MusicPlayer />
    </div>
</div>



