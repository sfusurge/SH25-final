<script>
    import Socials from "$lib/components/landing/Socials.svelte";
    import BlockPattern from "$lib/components/landing/svgs/BlockPattern.svelte";
    import Diamond from "$lib/components/landing/svgs/Diamond.svelte";
    import LineDiamond from "$lib/components/landing/svgs/LineDiamond.svelte";
    import LineDiamondVertical from "$lib/components/landing/svgs/LineDiamondVertical.svelte";
    import RockFilter from "$lib/components/landing/svgs/RockFilter.svelte";
    import ContentScroll from "$lib/components/landing/Sidebar/ContentScroll.svelte";
    import MLH from "$lib/components/landing/Sidebar/MLH.svelte";
    import { global } from "../../../../routes/+layout.svelte";
</script>

<div
    class="sidebar border-border bg-background justify-between items-center gap-4 relative"
    class:medium={global.medium}
    class:mobile={global.mobile}
>
    <!-- filter -->
    <RockFilter />
    <div class="w-full flex items-center justify-center flex-col">
        <BlockPattern />

        <div class="flex flex-row justify-between w-full my-2">
            <Diamond width={8} height={14} />
            <Diamond width={8} height={14} />
        </div>
    </div>

    <div class="sidebarContent">
        <div class="title" class:medium={global.medium}>
            <img
                width="193"
                height="124"
                class="fill-main h-auto w-full"
                src="/assets/SH-logo.svg"
                alt="Stormhacks title"
            />
            <MLH />
        </div>

        {#if global.medium}
            <div class="ver" style="padding: 1rem;">
                <LineDiamondVertical height={138} width={16} className="w-4 h-full" />
                <LineDiamondVertical height={138} width={16} className="rotate-180 w-4 h-full" />
            </div>
        {/if}

        {#if global.desktop || global.mobile}
            <div class="w-full flex" style="padding: 1rem;">
                <LineDiamond height={16} width={120} />
                <LineDiamond className="rotate-180" height={16} width={120} />
            </div>
        {/if}

        <ContentScroll />
    </div>

    <div class="w-full flex items-center justify-center flex-col">
        {#if !global.medium}
            <Socials />
        {/if}

        <div class="flex flex-row justify-between w-full my-2">
            <Diamond width={8} height={14} />
            <Diamond width={8} height={14} />
        </div>

        <BlockPattern />
    </div>
</div>

<style>
    .sidebar {
        max-height: 100dvh;
        min-width: 325px;
        width: 325px;
        display: flex;
        flex-direction: column;
        padding: 1rem;

        border: none;
        border-right: 1px solid var(--border);
    }

    .sidebar.mobile {
        border: none;
        width: 100%;
        padding: 2rem;

        min-height: fit-content;
        height: fit-content;
        max-height: fit-content;

        .sidebarContent {
            flex: unset;
            height: fit-content;
            min-height: fit-content;
        }
    }

    .sidebarContent {
        width: 100%;
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;

        align-items: center;
        justify-content: space-around;
    }

    .sidebar.medium {
        width: 100dvw;
        height: 40dvh;
        min-height: 400px;
        border: none;
        border-bottom: 1px solid var(--border);

        .sidebarContent {
            display: flex;
            flex-direction: row;
        }
    }
    .title {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 1rem;
    }
    .title.medium {
        flex: 2;
        max-width: 300px;
        img {
            width: 100%;
        }
    }
</style>
