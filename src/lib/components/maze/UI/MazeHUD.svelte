<script lang="ts">
    import { global } from "../../../../routes/+layout.svelte";
    import { GameState } from "$lib/components/maze/MazeGameState.svelte";
    import HudContainer from "./HudContainer.svelte";

    // HUD data - same for both mobile and desktop
    const hudItems = $derived([
        { iconSrc: "/assets/clock.svg", value: GameState.formattedElapsedTime, alt: "clock" },
        { iconSrc: "/assets/diamond.svg", value: GameState.score, alt: "Score Icon" },
        { iconSrc: "/assets/eye-open.svg", value: GameState.health, alt: "Health Icon" },
    ]);
</script>

{#if global.mobile}
    <!-- Mobile -->
    <div class="center-strip" data-maze-ui>
        <div class="hud">
            {#each hudItems as item}
                <HudContainer {...item} mobile={true} />
            {/each}
        </div>
    </div>
{:else}
    <!-- Desktop -->
    <div
        class="desktop-container"
        class:pointer-events-none={GameState.isGamePre || GameState.showInstructionsDuringGame}
        data-maze-ui
    >
        <!-- Health -->
        <div class="desktop-health">
            <HudContainer {...hudItems[2]} />
        </div>

        <!-- Timer and Score -->
        <div class="desktop-bottom">
            {#each hudItems.slice(0, 2) as item}
                <HudContainer {...item} />
            {/each}
        </div>
    </div>
{/if}

<style>
    /* Mobile styles (copied from MazeMobileUI) */
    .center-strip {
        position: absolute;
        /* top 28px -> 2.59vh */
        top: 2.59vh;
        left: 50%;
        transform: translateX(-50%);
        z-index: 2;
    }

    .hud {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.8vw;
    }

    @container (max-width: 640px) {
        .center-strip {
            width: 90%; /* nearly full width; use 95cqw for slight inset */
        }
        .hud {
            width: 100%; /* let the flex row span the strip */
            justify-content: space-between; /* spread the 3 boxes edge-to-edge */
            gap: 0cqw; /* small minimum spacing */
            padding: 0 3cqw;
        }
    }

    /* Desktop styles */
    .desktop-container {
        position: absolute;
        inset: 0;
        z-index: 10;
        pointer-events: none;
    }

    .desktop-health {
        position: absolute;
        top: 0;
        right: 0;
        padding: 2rem 2rem 0 0;
        margin: 1.25rem;
        pointer-events: auto;
    }

    .desktop-bottom {
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        z-index: 50;
        display: flex;
        justify-content: center;
        align-items: start;
        padding-bottom: 0;
        gap: 2rem;
        pointer-events: auto;
    }
</style>
