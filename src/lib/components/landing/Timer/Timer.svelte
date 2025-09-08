<script lang="ts">
    import BlockPatternVertical from "$lib/components/landing/svgs/BlockPatternVertical.svelte";
    import RockFilter from "$lib/components/landing/svgs/RockFilter.svelte";
    import TimerComp from "$lib/components/landing/Timer/TimerComp.svelte";
</script>

<div class="hidden sm:flex mt-auto relative border border-border bg-[#231f1f] h-11">
    <RockFilter />
    <div class="flex justify-between  h-full">
        <BlockPatternVertical  />
        <TimerComp   />
        <BlockPatternVertical/>
    </div>
</div>
