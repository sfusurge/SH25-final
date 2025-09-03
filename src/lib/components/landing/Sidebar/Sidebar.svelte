<script>
    import Socials from '$lib/components/landing/Socials.svelte';
    import StormHacksLogo from '$lib/components/landing/svgs/StormHacksLogo.svelte';
    import BlockPattern from '$lib/components/landing/svgs/BlockPattern.svelte';
    import Diamond from '$lib/components/landing/svgs/Diamond.svelte';
    import LineDiamond from '$lib/components/landing/svgs/LineDiamond.svelte';
    import LineDiamondVertical from '$lib/components/landing/svgs/LineDiamondVertical.svelte';
    import RockFilter from '$lib/components/landing/svgs/RockFilter.svelte';
    import ContentScroll from "$lib/components/landing/Sidebar/ContentScroll.svelte";
    import MLH from "$lib/components/landing/Sidebar/MLH.svelte";
</script>

<div class="w-full sm:w-64 flex-none p-4 sm:pb-4 pb-8 flex flex-col lg:w-[302px] lg:border-r border-b lg:border-b-0 border-border bg-[#231f1f] justify-between items-center gap-4 relative">
    <!-- filter -->
    <RockFilter />

    <div class="w-full items-center">
        <div class="w-full flex items-center justify-center flex-col">
            <BlockPattern />

            <div class="flex flex-row justify-between w-full my-2">
                <Diamond width={8} height={14} />
                <Diamond width={8} height={14} />
            </div>
        </div>

        <div class="flex flex-col lg:flex lg:flex-col px-0 gap-10">
            <div>
                <StormHacksLogo />
                <MLH />
            </div>

            <div class="md:flex flex-col items-center hidden lg:hidden xl:hidden">
                <LineDiamondVertical
                        height={138}
                        width={16}
                        className="w-4 h-full"
                />
                <LineDiamondVertical
                        height={138}
                        width={16}
                        className="rotate-180 w-4 h-full"
                />
            </div>

            <div class="w-full flex md:hidden lg:flex xl:flex items-center px-5">
                <LineDiamond height={16} width={120} />
                <LineDiamond
                        className="rotate-180"
                        height={16}
                        width={120}
                />
            </div>

            <div class="flex flex-col gap-3 text-left">

            </div>
        </div>
    </div>

    <ContentScroll/>

    <div class="w-full flex items-center justify-center flex-col">
        <div class="hidden lg:block">
            <Socials />
        </div>
        <div class="flex flex-row justify-between w-full my-2">
            <Diamond width={8} height={14} />
            <Diamond width={8} height={14} />
        </div>

        <BlockPattern />
    </div>
</div>