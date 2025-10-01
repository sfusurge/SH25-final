<script lang="ts">
    import type { MazeGame } from "../MazeGameRenderer.svelte";
    import type { ActiveEffect, EffectPickup } from "../EffectSystem.svelte";
    import { EffectKind } from "../EffectSystem.svelte";

    interface Props {
        gameRenderer: MazeGame;
    }

    let { gameRenderer }: Props = $props();

    // Track recent effects to display briefly (including passives and instants)
    let recentEffects = $state<Array<{ pickup: EffectPickup; timestamp: number }>>([]);
    let recentInstantEffects = $state<Array<{ pickup: EffectPickup; timestamp: number }>>([]);
    let lastPickup = $state<EffectPickup | null>(null);

    // Watch for new pickups
    $effect(() => {
        const currentPickup = gameRenderer.effects.lastPickup;
        if (currentPickup && currentPickup !== lastPickup) {
            lastPickup = currentPickup;

            // Add to recent effects list for text popup
            recentEffects = [...recentEffects, { pickup: currentPickup, timestamp: Date.now() }];

            if (currentPickup.definition.kind === EffectKind.INSTANT) {
                recentInstantEffects = [
                    ...recentInstantEffects,
                    { pickup: currentPickup, timestamp: Date.now() },
                ];

                // Remove instant effect icon after 3 seconds
                setTimeout(() => {
                    recentInstantEffects = recentInstantEffects.filter(
                        (e) => e.pickup !== currentPickup
                    );
                }, 3000);
            }

            // Remove text popup after 3 seconds
            setTimeout(() => {
                recentEffects = recentEffects.filter((e) => e.pickup !== currentPickup);
            }, 3000);
        }
    });

    // Transform world coordinates to screen coordinates
    function worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
        if (!gameRenderer.canvas) return { x: 0, y: 0 };

        const dpr = window.devicePixelRatio || 1;
        const canvasWidth = gameRenderer.canvas.width / dpr;
        const canvasHeight = gameRenderer.canvas.height / dpr;

        const screenX = (worldX - gameRenderer.camera.x) * gameRenderer.zoom + canvasWidth / 2;
        const screenY = (worldY - gameRenderer.camera.y) * gameRenderer.zoom + canvasHeight / 2;

        return { x: screenX, y: screenY };
    }

    // Get screen position for effect display (above player)
    let effectDisplayPosition = $derived.by(() => {
        const playerPos = worldToScreen(
            gameRenderer.player.x,
            gameRenderer.player.y - 50 // offset above player
        );
        return playerPos;
    });

    // Get active effects
    let activeEffects = $derived(gameRenderer.effects.active);

    // Only show timed effects in icons
    let timedEffects = $derived.by(() =>
        activeEffects.filter((e) => e.definition.kind === EffectKind.TIMED)
    );

    // Show passive effects temporarily
    let passiveEffects = $derived.by(() =>
        activeEffects.filter((e) => {
            if (e.definition.kind !== EffectKind.PASSIVE) return false;
            const age = (Date.now() - e.startedAtMs) / 1000;
            return age < 4; // Show for 4 seconds after gaining
        })
    );

    // Show instant effects as temporary icons
    let instantEffectIcons = $derived.by(() =>
        recentInstantEffects.map(
            ({ pickup, timestamp }) =>
                ({
                    id: pickup.definition.id,
                    uniqueKey: `${pickup.definition.id}-${timestamp}`, // Unique key for tracking (id is for effect type)
                    definition: pickup.definition,
                    startedAtMs: timestamp,
                    stacks: 1,
                    remainingDuration: null,
                    totalDuration: null,
                }) as ActiveEffect & { uniqueKey: string }
        )
    );

    // Combine timed, temporary passive, and temporary instant effects
    let displayedEffects = $derived([...timedEffects, ...passiveEffects, ...instantEffectIcons]);

    function getPercentRemaining(effect: ActiveEffect): number {
        if (effect.definition.kind !== EffectKind.TIMED) {
            return 0; // No ring for passive or instant effects
        }
        if (!effect.remainingDuration || !effect.totalDuration) return 0;
        return (effect.remainingDuration / effect.totalDuration) * 100;
    }

    function getElapsedSeconds(timestamp: number): number {
        return (Date.now() - timestamp) / 1000;
    }

    function getEffectColour(pickup: EffectPickup): string {
        // Negative effect IDs are traps/debuffs (red)
        if (pickup.definition.id < 0) return "red";
        // Passives get gold
        if (pickup.definition.kind === EffectKind.PASSIVE) return "gold";
        // All other positives (timed and instant) get green
        return "green";
    }
</script>

<!-- Text popup showing what effect was gained -->
{#each recentEffects as { pickup, timestamp } (timestamp)}
    {@const elapsed = getElapsedSeconds(timestamp)}
    {@const colour = getEffectColour(pickup)}
    <div
        class="effect-text-popup {colour}"
        style="left: {effectDisplayPosition.x}px; top: {effectDisplayPosition.y -
            45}px; --elapsed: {elapsed};"
    >
        <span class="popup-text">{pickup.definition.name}</span>
    </div>
{/each}

<!-- Compact icon-only display above player -->
{#if displayedEffects.length > 0}
    <div
        class="effect-icons"
        style="left: {effectDisplayPosition.x}px; top: {effectDisplayPosition.y}px;"
    >
        {#each displayedEffects as effect ("uniqueKey" in effect ? effect.uniqueKey : effect.id)}
            <div
                class="effect-icon-wrapper"
                class:passive={effect.definition.kind === EffectKind.PASSIVE}
                class:instant={effect.definition.kind === EffectKind.INSTANT && effect.id > 0}
                class:timed-positive={effect.definition.kind === EffectKind.TIMED && effect.id > 0}
                class:negative={effect.id < 0}
                title={effect.definition.name}
            >
                {#if effect.definition.icon}
                    <img src={effect.definition.icon} alt={effect.definition.name} class="icon" />
                {/if}
                {#if effect.stacks > 1}
                    <span class="stack-badge">{effect.stacks}</span>
                {/if}
                {#if effect.definition.kind === EffectKind.TIMED}
                    <div class="timer-ring" style="--percent: {getPercentRemaining(effect)}"></div>
                {/if}
            </div>
        {/each}
    </div>
{/if}

<style>
    /* Text popup above icons showing what was gained */
    .effect-text-popup {
        position: absolute;
        transform: translate(-50%, calc(-100% - var(--elapsed) * 15px));
        padding: 6px 12px;
        border-radius: 6px;
        pointer-events: none;
        z-index: 150;
        opacity: calc(1 - var(--elapsed) / 3);
        font-size: 14px;
        font-weight: 700;
        white-space: nowrap;
        letter-spacing: 0.02em;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.9);
        animation: textFloat 3s ease-out forwards;
        font-family: "Catriel", sans-serif;
    }

    .effect-text-popup.timed {
        color: #f1eceb;
        background: rgba(35, 31, 31, 0.85);
        border: 2px solid rgba(208, 167, 157, 0.6);
        box-shadow: 0 0 12px rgba(208, 167, 157, 0.3);
    }

    .effect-text-popup.gold {
        color: #f4b942;
        background: rgba(35, 31, 31, 0.85);
        border: 2px solid rgba(244, 185, 66, 0.85);
        box-shadow: 0 0 30px rgba(244, 185, 66, 0.6);
        text-shadow:
            0 0 15px rgba(244, 185, 66, 0.8),
            0 2px 4px rgba(0, 0, 0, 0.9);
    }

    .effect-text-popup.green {
        color: #7fc857;
        background: rgba(35, 31, 31, 0.85);
        border: 2px solid rgba(127, 200, 87, 0.8);
        box-shadow: 0 0 18px rgba(127, 200, 87, 0.5);
        text-shadow:
            0 0 12px rgba(127, 200, 87, 0.7),
            0 2px 4px rgba(0, 0, 0, 0.9);
    }

    .effect-text-popup.red {
        color: #ea6962;
        background: rgba(35, 31, 31, 0.85);
        border: 2px solid rgba(234, 105, 98, 0.7);
        box-shadow: 0 0 15px rgba(234, 105, 98, 0.5);
        text-shadow:
            0 0 10px rgba(234, 105, 98, 0.6),
            0 2px 4px rgba(0, 0, 0, 0.9);
    }

    @keyframes textFloat {
        from {
            transform: translate(-50%, -100%);
            opacity: 1;
        }
        to {
            transform: translate(-50%, calc(-100% - 45px));
            opacity: 0;
        }
    }

    .popup-text {
        display: block;
    }

    /* Compact icon display above player */
    .effect-icons {
        position: absolute;
        transform: translate(-50%, -100%);
        display: flex;
        gap: 5px;
        pointer-events: none;
        z-index: 100;
    }

    .effect-icon-wrapper {
        position: relative;
        width: 34px;
        height: 34px;
        background: rgba(35, 31, 31, 0.8);
        border: 2px solid rgba(208, 167, 157, 0.6);
        border-radius: 8px;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.6);
        pointer-events: none;
    }

    .effect-icon-wrapper.passive {
        border-color: rgba(244, 185, 66, 0.9);
        box-shadow: 0 0 25px rgba(244, 185, 66, 0.95);
    }

    .effect-icon-wrapper.instant {
        border-color: rgba(127, 200, 87, 0.9);
        box-shadow: 0 0 15px rgba(127, 200, 87, 0.6);
    }

    .effect-icon-wrapper.timed-positive {
        border-color: rgba(127, 200, 87, 0.9);
        box-shadow: 0 0 15px rgba(127, 200, 87, 0.6);
    }

    .effect-icon-wrapper.negative {
        border-color: rgba(234, 105, 98, 0.8);
        box-shadow: 0 0 12px rgba(234, 105, 98, 0.6);
    }

    .icon {
        width: 100%;
        height: 100%;
        object-fit: contain;
        padding: 5px;
        filter: brightness(1.1) contrast(1.1);
    }

    /* Stack count badge */
    .stack-badge {
        position: absolute;
        top: -5px;
        right: -5px;
        background: #f1eceb;
        color: #231f1f;
        font-size: 11px;
        font-weight: 700;
        padding: 2px 5px;
        border-radius: 10px;
        min-width: 16px;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
        font-family: "Catriel", sans-serif;
        letter-spacing: 0.01em;
    }

    /* Timer ring animation - fills as a circle */
    .timer-ring {
        position: absolute;
        inset: -2px;
        border-radius: 8px;
        background: conic-gradient(
            rgba(76, 196, 88, 0.8) calc(var(--percent) * 1%),
            transparent calc(var(--percent) * 1%)
        );
        pointer-events: none;
        z-index: -1;
    }

    .effect-icon-wrapper.negative .timer-ring {
        background: conic-gradient(
            rgba(234, 105, 98, 0.8) calc(var(--percent) * 1%),
            transparent calc(var(--percent) * 1%)
        );
    }

    /* Mobile adjustments */
    @media (max-width: 640px) {
        .effect-icon-wrapper {
            width: 30px;
            height: 30px;
        }

        .effect-text-popup {
            font-size: 13px;
            padding: 5px 10px;
        }
    }

    /* Animation for new effects - bouncy entrance */
    @keyframes iconPop {
        0% {
            transform: scale(0);
            opacity: 0;
        }
        50% {
            transform: scale(1.15);
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }

    .effect-icon-wrapper {
        animation: iconPop 0.35s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    /* Fade out animation for passive effects after 4 seconds */
    @keyframes passiveFadeOut {
        0% {
            opacity: 1;
            transform: scale(1);
        }
        100% {
            opacity: 0;
            transform: scale(0.8);
        }
    }
</style>
