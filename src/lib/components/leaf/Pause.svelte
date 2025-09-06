<script>
    import HoverEffectButton from "$lib/components/landing/HoverEffectButton.svelte";
    import BlockPatternVertical from "$lib/components/landing/svgs/BlockPatternVertical.svelte";
    import RockFilter from "../landing/svgs/RockFilter.svelte";
</script>

<!-- Mobile -->
<div
    class="flex flex-row gap-0 items-center border border-border bg-[#231f1f] w-full py-2 px-3 sm:hidden justify-between relative"
></div>

<div
    class="hidden sm:flex mt-auto mb-8 relative border border-border bg-[#231f1f] h-11"
>
    <RockFilter />
    <div class="flex justify-between items-center h-full">
        <BlockPatternVertical className="h-[44px] mr-1.5" />
    </div>
</div>

<style>
</style>
