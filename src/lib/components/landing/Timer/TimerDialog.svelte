<script>
    import Dialog from "$lib/components/landing/Audio/Dialog.svelte";
    import Timer from '$lib/components/landing/Timer/Timer.svelte';
    import MobileSwapBackground from '$lib/components/landing/background/MobileSwapBackground.svelte';

    export let onClose;
    export let mobileMode = false;
    export let onChangeBackground = null;
    export let mobileTriggerButton;
    export let mobileShow;
</script>

<Dialog
        title="Timer"
        {onClose}
        {mobileMode}
        {mobileTriggerButton}
        {mobileShow}
>
    <div class="flex flex-col gap-8 w-full">
        <Timer />

        {#if onChangeBackground}
            <div class="flex flex-col gap-2">
                <p class="font-bold text-[15px] italic text-main">
                    Background
                </p>
                <MobileSwapBackground {onChangeBackground} />
            </div>
        {/if}
    </div>
</Dialog>