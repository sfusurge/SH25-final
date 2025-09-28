<script lang="ts">
    import BlockPatternVertical from "$lib/components/landing/svgs/BlockPatternVertical.svelte";
    import RockFilter from "$lib/components/landing/svgs/RockFilter.svelte";

    export let iconSrc: string;
    export let value: string | number;
    export let alt: string;
    export let mobile: boolean = false;
</script>

<div class="hud-item border border-border bg-background" class:mobile>
    <RockFilter />
    <div class="hud-inner h-full" class:mobile-inner={mobile} style={mobile ? "" : "width: 10rem;"}>
        <BlockPatternVertical className={mobile ? "h-full" : "h-11 mr-2"} />
        <div class="flex items-center gap-2">
            <img src={iconSrc} {alt} class="icon" />
            <span class="value">{value}</span>
        </div>
        <BlockPatternVertical className={mobile ? "h-full rotate-180" : "h-11 rotate-180 ml-2"} />
    </div>
</div>

<style>
    /* Base styles */
    .hud-item {
        position: relative;
        z-index: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.6vw;
    }

    .hud-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        height: 100%;
    }

    .value {
        font-weight: 400;
        letter-spacing: 0.02em;
        font-family: var(--font-catriel);
    }

    .icon {
        width: 16px;
        height: 15px;
        pointer-events: none;
    }

    /* Desktop styles */
    .hud-item:not(.mobile) {
        height: 2.75rem;
        margin-top: auto;
        margin-bottom: 2rem;
    }

    .hud-item:not(.mobile) .value {
        color: hsl(var(--primary));
        font-size: 0.875rem;
    }

    /* Mobile styles */
    .mobile {
        width: 25vw;
        height: 4vh;
    }

    .mobile .value {
        font-size: max(0.625vw, 1.11vh);
        color: var(--color-text-primary);
    }

    @container (max-width: 640px) {

        .mobile .icon {
            width: 2.2cqw !important;
            height: 2.2cqw !important;
        }

        .mobile .value {
            font-size: 2.5cqw !important;
        }
    }

    @container (max-width: 400px) {
        .mobile {
            width: 25vw;
            height: 5vh;
        }

        .mobile .icon {
            width: 4.5cqw !important;
            height: 4.5cqw !important;
        }

        .mobile .value {
            font-size: 3.5cqw !important;
        }
    }
</style>
