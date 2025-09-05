<script lang="ts">
    import Dialog from "$lib/components/landing/Audio/Dialog.svelte";
    import HoverEffectButton from "$lib/components/landing/HoverEffectButton.svelte";
    import {currentLibType, setMusicLibrary} from "$lib/sharedStates/music.js";

    interface Props {
        onClose?: any;
        mobileMode?: boolean;
        triggerButton?: any;
        show?: boolean;
    }

    let {
        onClose = () => {
    },
        mobileMode = false,
        triggerButton = null,
        show = false
    }: Props = $props();
</script>

<Dialog
        title="Music Type"
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
                style="padding: 0.1rem 0.75rem"
                active={$currentLibType === "special"}
                aria-pressed={$currentLibType === "special"}
        >
            Special
        </HoverEffectButton>

        <HoverEffectButton
                onClick={() => setMusicLibrary("epic")}
                style="padding: 0.1rem 0.75rem"
                active={$currentLibType === "epic"}
                aria-pressed={$currentLibType === "epic"}
        >
            Epic
        </HoverEffectButton>
    </div>
</Dialog>