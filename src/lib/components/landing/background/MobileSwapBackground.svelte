<script lang="ts">
    import HoverEffectButton from '$lib/components/landing/HoverEffectButton.svelte';
    import HorizontalDivider  from '$lib/components/landing/HorizontalDivider.svelte';

    interface Props {
        onChangeBackground?: any;
    }

    let { onChangeBackground = null }: Props = $props();

</script>

<div class="w-full">
    <div class="flex justify-center">
        <HorizontalDivider />
    </div>
    <div class="flex gap-3 items-center">
        <HoverEffectButton
                className="px-4 not-italic py-2 text-base sm:text-sm text-decor border-[0.643px] border-decor cursor-pointer h-11 flex-1 flex items-center justify-center"
                onClick={onChangeBackground}
        >
            Swap Background
        </HoverEffectButton>

        <HoverEffectButton
                className="cursor-pointer border-[0.643px] border-decor hover:border-main h-11 w-11"
        >
                <img
                        src="/assets/eye-open.svg"
                        alt="mode"
                        width="22"
                        height="22"
                        style="width: 22px"
                        data-demon="primary"
                />
        </HoverEffectButton>
    </div>
</div>