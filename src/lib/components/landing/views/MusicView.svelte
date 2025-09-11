<script lang="ts">
    import Frame from "$lib/components/landing/Frame.svelte";
    import MusicPlayer from "$lib/components/landing/Audio/MusicPlayer.svelte";
    import Timer from "$lib/components/landing/Timer/Timer.svelte";
    import SwapBackground from "$lib/components/landing/background/SwapBackground.svelte";
    import {
        currentBackground,
        backgrounds,
        toggleBackground,
        bgMobileStyle,
    } from "$lib/sharedStates/background.svelte.js";
    import { global } from "../../../../routes/+layout.svelte";
    import Dialog from "$lib/components/landing/Audio/Dialog.svelte";
    import TimerComp from "$lib/components/landing/Timer/TimerComp.svelte";
    import HorizontalDivider from "$lib/components/landing/HorizontalDivider.svelte";
    import HoverEffectButton from "$lib/components/landing/HoverEffectButton.svelte";
    import TopBar from "$lib/components/landing/views/shared/TopBar.svelte";
    import ScrollingText from "$lib/components/landing/Audio/ScrollingText.svelte";
    import { PlayerState } from "$lib/sharedStates/music.svelte";

    let showSettings = $state(false);
    let top = $state<HTMLDivElement>();
    let bot = $state<HTMLDivElement>();
</script>

{#snippet TimerBackgroundDialog()}
    <Dialog
        title="Timer"
        mobile={true}
        show={showSettings}
        onClose={() => {
            showSettings = false;
        }}
    >
        <TimerComp />

        <span class="title">Background</span>
        <HorizontalDivider />

        <div class="hor gap-2">
            <HoverEffectButton
                style="font-size: 15px; padding:0.5rem; height:36px;"
                onClick={() => {
                    toggleBackground(false);
                }}
            >
                Swap Background
            </HoverEffectButton>

            <HoverEffectButton
                style="font-size: 15px; padding:0.5rem;"
                onClick={() => {
                    toggleBackground(true);
                }}
                large
            >
                <img src="/assets/moon.svg" alt="" style="width:24px; height:24px;" />
            </HoverEffectButton>
        </div>
    </Dialog>
{/snippet}

<!-- Desktop layout -->
<div
    class="flex flex-1 flex-col h-full layoutRoot"
    style="max-height: 100dvh; justify-content: center; "
    class:mobile={global.mobile}
    class:medium={global.medium}
>
    {#if global.mobile}
        <!-- Topbar -->
        <TopBar>
            <div class="ver">
                <ScrollingText
                    text={PlayerState.currentTrack.title}
                    style="color: var(--header); font-style: italic; line-height: 1rem; font-size: 13px;"
                />
                <ScrollingText
                    text={PlayerState.currentTrack.artist}
                    style="font-style:italic; line-height: 1rem; font-size:12px;"
                />
            </div>

            <HoverEffectButton
                large
                style="margin-left: auto;"
                onClick={() => {
                    showSettings = true;
                }}
            >
                <img src="/assets/gear.svg" alt="" style="width: 24px; height:24px;" />
            </HoverEffectButton>
        </TopBar>

        {@render TimerBackgroundDialog()}
    {/if}

    {#if !global.mobile}
        <div bind:this={top} class="flex justify-between items-start px-8">
            <Timer />
            <SwapBackground />
        </div>
    {/if}

    <Frame
        src={currentBackground.val}
        mobile={global.mobile}
        mobileStyle={bgMobileStyle[currentBackground.val]}
        style={!global.mobile
            ? `max-height: calc(100% - ${top?.clientHeight ?? 0}px - ${bot?.clientHeight}px - 0rem);`
            : ""}
    />

    <div bind:this={bot} class="flex justify-center">
        <MusicPlayer />
    </div>
</div>

<style>
    .title {
        font-size: 15px;
        margin-top: 1.5rem;
        font-style: italic;
        font-weight: 700;
        color: var(--header);
        margin-right: auto;
    }

    .layoutRoot {
        padding: 4rem;
        gap: 1rem;
    }
    .layoutRoot.medium {
        padding: 2rem;
    }
    .layoutRoot.mobile {
        margin: 0;
        gap: 0;
        padding: 0rem;
    }
</style>
