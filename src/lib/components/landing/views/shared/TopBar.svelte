<script lang="ts">
    import HoverEffectButton from "$lib/components/landing/HoverEffectButton.svelte";
    import RockFilter from "$lib/components/landing/svgs/RockFilter.svelte";
    import type { Snippet } from "svelte";

    interface Props {
        children?: Snippet;
    }

    let { children }: Props = $props();
</script>

<div class="topbar">
    <RockFilter />
    <HoverEffectButton
        onClick={() => {
            history.back();
        }}
        large
    >
        <img src="/assets/prev.svg" alt="back icon" class="icon" />
    </HoverEffectButton>

    {@render children?.()}
</div>

<style>
    .topbar {
        width: 100%;
        background-color: var(--color-background);
        position: sticky;
        top: 0;
        padding: 1rem;

        display: flex;
        flex-direction: row;
        gap: 1rem;
        align-items: center;

        z-index: 100;
    }

    .icon {
        width: 16px;
        height: 16px;
    }
</style>
