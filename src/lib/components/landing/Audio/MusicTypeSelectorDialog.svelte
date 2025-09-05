<script lang="ts">
    import Dialog from "$lib/components/landing/Audio/Dialog.svelte";
    import HoverEffectButton from "$lib/components/landing/HoverEffectButton.svelte";
    import { PlayerState, type MusicLib } from "$lib/sharedStates/music.svelte";

    interface Props {
        onClose?: any;
        mobile?: boolean;
        triggerButton?: any;
        show?: boolean;
    }

    let { onClose = () => {}, mobile = false, show = false }: Props = $props();
</script>

<Dialog title="Music Type" {onClose} {mobile} {show}>
    <div class="flex gap-2">
        {#each ["calm", "special", "epic"] as MusicLib[] as item}
            <HoverEffectButton
                onClick={() => {
                    PlayerState.currentLibName = item;
                }}
                style="padding: 0.1rem 0.75rem"
                active={PlayerState.currentLibName === item}
            >
                {item.charAt(0).toUpperCase() + item.slice(1).toLowerCase()}
            </HoverEffectButton>
        {/each}
    </div>
</Dialog>
