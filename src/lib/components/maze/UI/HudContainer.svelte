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
    <BlockPatternVertical />
    <div class="hud-inner h-full" class:mobile-inner={mobile} style={mobile ? "" : "width: 10rem;"}>
        <div class="flex items-center gap-2">
            <img src={iconSrc} {alt} class="icon" />
            <span class="value">{value}</span>
        </div>
    </div>
    <BlockPatternVertical />
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
        justify-content: center;
        width: 100%;
        height: 100%;
        margin: 0.5rem 0;
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
    .hud-item.mobile {
        flex:1;
        min-width: 100px;
        min-height: auto;
    }

    .mobile .value {
        font-size: min( max(1vw, 2vh, ), 1.5rem);
        color: var(--color-text-primary);
    }
</style>
