<script lang="ts">
    import { onNavigate } from "$app/navigation";
    import HoverEffectButton from "$lib/components/landing/HoverEffectButton.svelte";
    import RockFilter from "$lib/components/landing/svgs/RockFilter.svelte";
    import type { Snippet } from "svelte";

    interface Props {
        children?: Snippet;
        dropDownContent?: Snippet;
        showDropdown?: boolean;
    }

    onNavigate(() => {
        showDropdown = false;
    });

    let { children, dropDownContent, showDropdown = $bindable() }: Props = $props();
</script>

<div class="blocker"></div>

<div class="topbar" class:showDropdown>
    <RockFilter />
    <div class="title">
        <HoverEffectButton
            onClick={() => {
                if (showDropdown) {
                    showDropdown = false;
                } else {
                    history.back();
                }
            }}
            large
        >
            {#if !showDropdown}
                <img src="/assets/prev.svg" alt="back icon" class="icon" />
            {:else}
                X
            {/if}
        </HoverEffectButton>

        {@render children?.()}
    </div>

    {#if dropDownContent}
        <div
            class="dropDownHolder"
            style="max-height: {showDropdown ? 'calc(100dvh - 3rem)' : '0'};"
        >
            {@render dropDownContent()}
        </div>
    {/if}
</div>

<style>
    .blocker {
        display: flex;
        width: 100%;
        min-height: 3rem;
        position: relative;
    }
    .title {
        display: flex;
        flex-direction: row;
        gap: 1rem;
        align-items: center;
        border-bottom: 1px solid var(--border);
        padding: 1rem;
        height: 3rem;
        width: 100%;
    }
    .topbar {
        width: 100dvw;
        background-color: var(--color-background);
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;

        display: flex;
        flex-direction: column;
        align-items: center;
        height: 3rem;
        height: min-content;

        z-index: 100;
    }

    .dropDownHolder {
        width: 100%;
        height: calc(100dvh - 4rem);
        max-height: 0;
        overflow: hidden;
        transition: max-height 500ms ease-out;

        display: flex;
        flex-direction: column;
    }

    .showDropdown > .dropDownHolder {
        overflow-y: scroll;
    }

    .icon {
        width: 16px;
        height: 16px;
    }
</style>
