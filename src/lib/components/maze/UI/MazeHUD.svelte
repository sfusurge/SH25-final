<script lang="ts">
    import { global } from "../../../../routes/+layout.svelte";
    import { GameState } from "$lib/components/maze/MazeGameState.svelte";
    import HudBox from "../../leaf/HudBox.svelte";
    import BlockPatternVertical from "$lib/components/landing/svgs/BlockPatternVertical.svelte";
    import RockFilter from "$lib/components/landing/svgs/RockFilter.svelte";

    // Timer formatting function
    function fmt(ms: number) {
        const s = Math.floor(ms / 1000);
        const mm = String(Math.floor(s / 60)).padStart(2, "0");
        const ss = String(s % 60).padStart(2, "0");
        return `${mm}:${ss}`;
    }

    let sessionTimeLeftMs = $derived(GameState.timeRemaining);

    // HUD data - same for both mobile and desktop
    const hudItems = $derived([
        { iconSrc: "/assets/clock.svg", value: fmt(sessionTimeLeftMs), alt: "clock" },
        { iconSrc: "/assets/diamond.svg", value: GameState.score, alt: "Score Icon" },
        { iconSrc: "/assets/eye-open.svg", value: GameState.health, alt: "Health Icon" },
    ]);
</script>

<!-- having trouble simplifying -->
{#if global.mobile}
    <!-- Mobile -->
    <div class="center-strip" data-maze-ui>
        <div class="hud">
            {#each hudItems as item}
                <HudBox mode="display" iconSrc={item.iconSrc} value={item.value} />
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
            <div class="desktop-hud-item border border-border bg-background">
                <RockFilter />
                <div class="flex justify-between items-center h-full w-40">
                    <BlockPatternVertical className="h-11 mr-2" />
                    <div class="flex items-center gap-2">
                        <img
                            src={hudItems[2].iconSrc}
                            alt={hudItems[2].alt}
                            height="15"
                            width="16"
                        />
                        <span class="desktop-value">{hudItems[2].value}</span>
                    </div>
                    <BlockPatternVertical className="h-11 rotate-180 ml-2" />
                </div>
            </div>
        </div>

        <!-- Timer and Score -->
        <div class="desktop-bottom">
            {#each hudItems.slice(0, 2) as item}
                <div class="desktop-hud-item border border-border bg-background">
                    <RockFilter />
                    <div class="flex justify-between items-center h-full w-40">
                        <BlockPatternVertical className="h-11 mr-2" />
                        <div class="flex items-center gap-2">
                            <img src={item.iconSrc} alt={item.alt} height="15" width="16" />
                            <span class="desktop-value">{item.value}</span>
                        </div>
                        <BlockPatternVertical className="h-11 rotate-180 ml-2" />
                    </div>
                </div>
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
    }

    .desktop-health {
        position: absolute;
        top: 0;
        right: 0;
        padding: 2rem 2rem 0 0;
        margin: 1.25rem;
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
    }

    .desktop-hud-item {
        margin-top: auto;
        margin-bottom: 2rem;
        position: relative;
        height: 2.75rem;
        z-index: 0;
    }

    .desktop-value {
        color: hsl(var(--primary));
        font-size: 0.875rem;
        font-weight: 400;
        line-height: normal;
        font-family: var(--font-catriel);
    }
</style>
