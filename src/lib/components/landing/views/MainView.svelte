<script>
    import Frame from '$lib/components/landing/Frame.svelte';
    import CurrentBackgroundMobile from '$lib/components/landing/background/CurrentBackgroundMobile.svelte';
    import Controls from '$lib/components/landing/Audio/MusicPlayer.svelte';
    import CurrentTrackInfo from '$lib/components/landing/CurrentTrackInfo.svelte';
    import Timer from '$lib/components/landing/Timer/Timer.svelte';
    import TimerDisplay from '$lib/components/landing/Timer/TimerDisplay.svelte';
    import SwapBackground from '$lib/components/landing/background/SwapBackground.svelte';
    import HoverEffectButton from '$lib/components/landing/Audio/ScrollingText.svelte';
    import TimerDialog from '$lib/components/landing/Timer/TimerDialog.svelte';
    import { currentBackground, backgrounds, toggleBackground } from '$lib/sharedStates/background.svelte.js';

    let showSettings = $state(false);



    function toggleSettings() {
        showSettings = !showSettings;
    }

    function closeSettings() {
        showSettings = false;
    }

</script>

<div >
    <div class="sm:hidden w-full">
        <div class="flex w-full px-5 py-5 italic justify-between leading-tight">
            <CurrentTrackInfo />

            <!-- <div class="flex justify-center items-center gap-3">
                <TimerDisplay />
                <TimerDialog
                        mobileTriggerButton={true}
                        mobileShow={showSettings}
                        
                        mobileMode={true}
                        onClose={closeSettings}
                >
                    {#snippet trigger()}
                                        <HoverEffectButton

                                style="width: 40px; aspect-ratio: 1"
                                onClick={toggleSettings}
                        >
                            <img
                                    data-demon="primary"
                                    src="/assets/gear.svg"
                                    height="40"
                                    width="40"
                                    alt="Open Settings Modal"
                                    style="width: 32px"
                            />
                        </HoverEffectButton>
                                    {/snippet}
                </TimerDialog>
            </div> -->
        </div>
        <div class="relative w-full h-full">
            <CurrentBackgroundMobile {currentBackground} />
        </div>
    </div>

    <!-- Desktop layout -->
    <div class="flex-1 sm:flex flex-col hidden h-full" style="max-height: 100dvh">
        <div class="flex justify-between items-start pt-8 px-8">
            <Timer />
            <SwapBackground />
        </div>

        <div class="m-8 flex-1 flex items-center justify-center" style="min-height: 0">
            <Frame />
        </div>

        <div class="flex justify-center pb-4">
            <Controls />
        </div>
    </div>
</div>
