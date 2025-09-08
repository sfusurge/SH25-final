<script lang="ts">
    import Background from "./Background.svelte";
    import LeafGame from "./LeafGame.svelte";
    import { global } from "../../../routes/+layout.svelte";
    import Pause from "./Pause.svelte";
    import DesktopShop from "./DesktopShop.svelte";
    import DesktopTimer from "./DesktopTimer.svelte";
    import {
        gamePhase,
        showInstructionsDuringGame,
        shopOpen,
    } from "$lib/components/leaf/gameData/LeafGame";
    import DesktopScore from "./DesktopScore.svelte";
</script>

{#if !global.mobile}
    <div class="relative w-screen h-screen grid place-items-center">
        <div class="frame-container">
            <div
                class="absolute z-10 overflow-hidden"
                style="
                    top: var(--inset-top, 2.87%);
                    right: var(--inset-right, 2.87%);
                    bottom: var(--inset-bottom, 2.87%);
                    left: var(--inset-left, 2.87%);
                    "
            >
                <Background />
            </div>
            <img
                src="/assets/frame.svg"
                alt=""
                class="absolute inset-0 z-30 w-full h-full pointer-events-none"
                loading="eager"
            />
            <!-- Overlays above the frame image -->
            {#if !global.mobile}
                <div
                    class="absolute top-0 left-0 right-0 z-10 flex justify-between items-start pt-8 px-8 m-5"
                    class:pointer-events-none={$gamePhase !== "running" ||
                        $showInstructionsDuringGame ||
                        $shopOpen}
                >
                    <Pause />
                    <DesktopShop />
                </div>
            {/if}
        </div>
    </div>
{:else}
    <div class="mobile-background-container">
        <Background />
    </div>
{/if}

<style>
    .frame-container {
        /* Match MainView Frame sizing exactly for desktop */
        position: relative;
        height: 80%;
        width: auto;
        max-width: 100%;
        aspect-ratio: 872 / 511;
    }

    /* Responsive adjustments for smaller screens */
    @media (max-width: 1240px) {
        .frame-container {
            /* At 1240px and below, fill the entire width of the screen */
            width: 100%;
            height: auto;
            min-height: 350px;
            min-width: unset;
        }
    }

    @media (max-width: 768px) {
        .frame-container {
            /* Mobile adjustments */
            min-height: 300px;
            min-width: 525px; /* 300 * (872/511) */
        }
    }

    @media (max-width: 640px) {
        .frame-container {
            /* Small mobile adjustments */
            width: 100%;
            height: auto;
            min-height: 250px;
            min-width: unset;
        }
    }

    .mobile-background-container {
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
    }
</style>
