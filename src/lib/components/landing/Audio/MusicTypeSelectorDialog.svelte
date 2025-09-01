<script>
    import Dialog from "$lib/components/landing/Audio/Dialog.svelte";
    import HoverEffectButton from "$lib/components/landing/HoverEffectButton.svelte";
    import {currentLibType, setMusicLibrary} from "$lib/stores/music.js";

    export let onClose = () => {
    };
    export let mobileMode = false;
    export let triggerButton = null;
    export let show = false;
</script>

<Dialog
        {onClose}
        {mobileMode}
        {triggerButton}
        {show}
>
    <div class="flex gap-2">
        <HoverEffectButton
                onClick={() => setMusicLibrary("calm")}
                style="padding: 0.1rem 0.75rem"
                active={$currentLibType === "calm"}
                aria-pressed={$currentLibType === "calm"}
        >
            Calm
        </HoverEffectButton>

        <HoverEffectButton
                onClick={() => setMusicLibrary("special")}
                active={$currentLibType === "special"}
                aria-pressed={$currentLibType === "special"}
        >
            Special
        </HoverEffectButton>

        <HoverEffectButton
                onClick={() => setMusicLibrary("epic")}
                active={$currentLibType === "epic"}
                aria-pressed={$currentLibType === "epic"}
        >
            Epic
        </HoverEffectButton>
    </div>
</Dialog>