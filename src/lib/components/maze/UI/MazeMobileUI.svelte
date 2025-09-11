<script lang="ts">
    import HudBox from "../../leaf/HudBox.svelte";
    import {
        scoreStore,
        healthStore,
        gamePhase,
        gameEndsAt,
        nowStore,
        GAME_DURATION_MS,
    } from "$lib/components/maze/gameData/MazeGameData";
    import { game } from "$lib/components/maze/gameData/MazeGameData";

    // Timer formatting function
    function fmt(ms: number) {
        const s = Math.floor(ms / 1000);
        const mm = String(Math.floor(s / 60)).padStart(2, "0");
        const ss = String(s % 60).padStart(2, "0");
        return `${mm}:${ss}`;
    }

    let sessionTimeLeftMs = $derived(
        $gamePhase === "running" && $gameEndsAt
            ? Math.max(0, $gameEndsAt - $nowStore)
            : $gamePhase === "ended"
              ? 0
              : GAME_DURATION_MS
    );
</script>

<div class="center-strip">
    <div class="hud">
        <HudBox mode="display" iconSrc="/assets/clock.svg" value={fmt(sessionTimeLeftMs)} />
        <HudBox mode="display" iconSrc="/assets/diamond.svg" value={$scoreStore} />
        <HudBox mode="display" iconSrc="/assets/eye-open.svg" value={$healthStore} />
    </div>
</div>

<style>
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
</style>
