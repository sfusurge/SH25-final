<script>
    import HoverEffectButton from "$lib/components/landing/HoverEffectButton.svelte";
    import BlockPatternVertical from "$lib/components/landing/svgs/BlockPatternVertical.svelte";
    import RockFilter from "$lib/components/landing/svgs/RockFilter.svelte";
    import { backgrounds,currentBackground } from "$lib/sharedStates/background.svelte";

</script>

<div class="mt-auto mb-8 relative border border-border bg-background h-11">
    <RockFilter />
    <div class="flex justify-between items-center h-full">
        <BlockPatternVertical className="h-11 mr-1.5" />

        <HoverEffectButton
                className="cursor-pointer w-full h-[24px] px-1 bg-[#06060599] text-[#8A6F6A] text-[12px]"
            onClick={()=>{
                if (currentBackground.val === backgrounds.FOUNTAIN){
                    currentBackground.val = backgrounds.SPARKY_WRITE;
                } else {
                    currentBackground.val = backgrounds.FOUNTAIN;
                }
            }}
        >
            Swap Background
        </HoverEffectButton>

        <BlockPatternVertical className="h-11 rotate-180 ml-1.5" />
    </div>
</div>
