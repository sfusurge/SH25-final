<script lang="ts">
    import Dialog from "$lib/components/landing/Audio/Dialog.svelte";
    import Slider from "$lib/components/landing/Audio/Slider.svelte";
    import { masterVolume, ambianceVolumes } from "$lib/sharedStates/ambiance.svelte.js";

    interface Props {
        onClose?: () => void;
        mobile?: boolean;
        mobileTriggerButton?: any;
        show?: boolean;
    }

    let { onClose = () => {}, mobile = false, show = false }: Props = $props();

    const options = Object.keys(ambianceVolumes) as (keyof typeof ambianceVolumes)[];
</script>

<Dialog title="Sound Settings" {onClose} {mobile} {show}>
    <div class="container">
        <div>
            <p class="header">Music Volume</p>
            <div class="row">
                <img src="/assets/mute.svg" alt="" data-demon="primary" />
                <Slider
                    bind:value={
                        () => masterVolume.volume,
                        (newVal) => {
                            masterVolume.volume = newVal / 100;
                        }
                    }
                />
                <img src="/assets/fullSound.svg" alt="" data-demon="primary" />
            </div>
        </div>

        <div>
            <p class="header">Environment Sounds</p>
            {#each options as name}
                <div class="ambiance-row">
                    <span class="ambiance-label">{name}</span>
                    <Slider
                        bind:value={
                            () => ambianceVolumes[name],
                            (newVal) => {
                                ambianceVolumes[name] = newVal / 100;
                            }
                        }
                    />
                </div>
            {/each}
        </div>
    </div>
</Dialog>

<style>
    .container {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        width: 100%;
    }

    .header {
        color: var(--color-header);
        font-style: italic;
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 0.5rem;
    }

    .row {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        width: 100%;
    }

    .row > img {
        display: block;
        width: 1rem;
        height: 1rem;
    }

    .ambiance-row {
        display: flex;
        margin: 0.25rem 0;
        font-style: italic;
        align-items: center;
        gap: 0.5rem;
        color: var(--color-special-text);
    }

    .ambiance-label {
        width: 4.5rem;
    }
</style>
