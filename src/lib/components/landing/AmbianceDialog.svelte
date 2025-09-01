<script>
    import Dialog from "$lib/components/landing/Dialog.svelte";
    import Slider from "$lib/components/landing/Slider.svelte";
    import { masterVolume, ambianceVolumes, setAmbianceVolume } from "$lib/stores/ambiance.js";

    export let onClose = () => {};
    export let mobileMode = false;
    export let mobileTriggerButton = null;
    export let mobileShow = false;

    const options = ["Rain", "Cafe", "Water", "Fire"];

    function handleMasterVolumeChange(val) {
        masterVolume.set(val);
    }

    function handleAmbianceVolumeChange(name, val) {
        setAmbianceVolume(name, val);
    }
</script>

<style>
    .container {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        width: 100%;
    }

    .header {
        font-weight: 600;
        margin-bottom: 0.5rem;
        color: var(--color-text);
    }

    .row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
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

    .slider-wrapper {
        width: 100%;
        position: relative;
    }

    .slider {
        -webkit-appearance: none;
        width: 100%;
        height: 6px;
        border-radius: 3px;
        background: linear-gradient(
                to right,
                var(--color-primary) 0%,
                var(--color-primary) calc(var(--progress) * 100%),
                var(--color-background-alt) calc(var(--progress) * 100%),
                var(--color-background-alt) 100%
        );
        outline: none;
        cursor: pointer;
    }

    .slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--color-primary);
        cursor: pointer;
        border: 2px solid var(--color-border);
    }

    .slider::-moz-range-thumb {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--color-primary);
        cursor: pointer;
        border: 2px solid var(--color-border);
    }

    .progress-bar {
        pointer-events: none;
    }
</style>

<Dialog
        title="Sound Settings"
        {onClose}
        {mobileMode}
        {mobileTriggerButton}
        {mobileShow}
>
    <div class="container">
        <div>
            <p class="header">Music Volume</p>
            <div class="row">
                <img
                        src="/assets/mute.svg"
                        alt=""
                        data-demon="primary"
                />
                <Slider
                        initialVal={$masterVolume * 100}
                        onChange={handleMasterVolumeChange}
                />
                <img
                        src="/assets/fullSound.svg"
                        alt=""
                        data-demon="primary"
                />
            </div>
        </div>

        <div>
            <p class="header">Environment Sounds</p>
            {#each options as name}
                <div class="ambiance-row">
                    <span class="ambiance-label">{name}</span>
                    <Slider
                            initialVal={$ambianceVolumes[name] * 100}
                            onChange={(val) => handleAmbianceVolumeChange(name, val)}
                    />
                </div>
            {/each}
        </div>
    </div>
</Dialog>

