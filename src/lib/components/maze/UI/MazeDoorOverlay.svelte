<script lang="ts">
    import { fade } from "svelte/transition";
    import HorizontalDivider from "$lib/components/landing/HorizontalDivider.svelte";
    import RockFilter from "$lib/components/landing/svgs/RockFilter.svelte";
    import { DoorTransitionState } from "$lib/components/maze/DoorTransitionState.svelte.ts";

    const phase = $derived(DoorTransitionState.phase);
    const promptTitle = $derived(DoorTransitionState.promptTitle);
    const promptCancel = $derived(DoorTransitionState.promptCancel);
    const transitionMessage = $derived(DoorTransitionState.transitionMessage);
    const holdProgress = $derived(DoorTransitionState.holdProgress);
    const transitionProgress = $derived(DoorTransitionState.transitionProgress);

    const isHolding = $derived(phase === "holding");
    const isTransitioning = $derived(phase === "transition");
    const showOverlay = $derived(isHolding || isTransitioning);
    const progress = $derived(holdProgress);
    const progressPercent = $derived(Math.min(100, Math.max(0, Math.round(progress * 100))));
</script>

{#if showOverlay}
    <div class="door-overlay" data-maze-ui>
        <div class="door-card" transition:fade={{ duration: 120 }}>
            <RockFilter />
            <div class="decor decor-top" data-demon="border"></div>
            <div class="decor decor-bottom" data-demon="border"></div>

            <div class="card-content" role="status" aria-live="polite">
                <p class="title">{promptTitle}</p>
                <HorizontalDivider />

                {#if isHolding}
                    <p class="subtitle">Stay in the doorway to continue</p>
                    <div class="progress" aria-hidden="false">
                        <div class="progress-bar" aria-hidden="true">
                            <div class="progress-fill" style:width={`${progressPercent}%`}></div>
                        </div>
                        <span class="progress-value">{progressPercent}%</span>
                    </div>
                    <p class="hint">{promptCancel}</p>
                {:else if isTransitioning}
                    <p class="subtitle transition-message">{transitionMessage}</p>
                {/if}
            </div>
        </div>
    </div>
{/if}


<!-- Styled with AI help, I think it works quite well -->
<style>
    .door-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: clamp(1rem, 4vw, 2.5rem);
        pointer-events: none;
        z-index: 240;
    }

    .door-card {
        position: relative;
        min-width: min(420px, 90%);
        max-width: min(480px, 95%);
        border: 1px solid var(--color-border);
        background: linear-gradient(135deg, rgba(35, 31, 31, 0.95), rgba(21, 19, 17, 0.92));
        box-shadow: 0 18px 36px rgba(0, 0, 0, 0.45);
        overflow: hidden;
    }

    .card-content {
        position: relative;
        z-index: 2;
        padding: clamp(1.75rem, 3vw, 2.75rem) clamp(1.5rem, 3vw, 3rem);
        display: flex;
        flex-direction: column;
        gap: clamp(0.75rem, 1.5vw, 1.4rem);
        align-items: center;
        text-align: center;
    }

    .decor {
        position: absolute;
        left: 0;
        width: 100%;
        height: 0.5rem;
        background-image: url("/assets/block-pattern.svg");
        z-index: 1;
    }

    .decor-top {
        top: 0;
    }

    .decor-bottom {
        bottom: 0;
    }

    .title {
        font-size: clamp(1rem, 1.6vw, 1.2rem);
        font-style: italic;
        color: var(--color-header);
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }

    .subtitle {
        color: var(--color-primary);
        font-size: clamp(0.95rem, 1.5vw, 1.05rem);
        line-height: 1.4;
    }

    .progress {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        width: 100%;
        align-items: center;
    }

    .transition-message {
        color: var(--color-primary);
        font-size: clamp(0.95rem, 1.5vw, 1.05rem);
        line-height: 1.4;
    }

    .progress-bar {
        width: 100%;
        height: 0.8rem;
        border: 1px solid var(--color-border);
        border-radius: 999px;
        background: rgba(15, 13, 13, 0.85);
        overflow: hidden;
        position: relative;
    }

    .progress-fill {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 0;
        background: linear-gradient(90deg, var(--color-border) 0%, var(--color-primary) 100%);
        box-shadow: 0 0 18px rgba(211, 134, 155, 0.45);
        transition: width 120ms ease-out;
    }

    .progress-value {
        font-size: clamp(0.85rem, 1.3vw, 0.95rem);
        font-weight: 700;
        color: var(--color-header);
        font-variant-numeric: tabular-nums;
        letter-spacing: 0.08em;
    }

    .hint {
        font-size: clamp(0.75rem, 1.2vw, 0.85rem);
        color: var(--color-special-text);
    }

    @media (max-width: 720px) {
        .door-card {
            min-width: min(320px, 92vw);
        }
    }

    @media (max-width: 520px) {
        .door-overlay {
            padding: clamp(0.75rem, 5vw, 1.5rem);
        }

        .door-card {
            min-width: 88vw;
        }
    }
</style>
