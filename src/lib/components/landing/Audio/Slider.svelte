<script>
    import { onMount } from "svelte";
    export let initialVal = 0;
    export let onChange = (val) => {};

    let val = initialVal;

    // Sync external updates
    $: val = initialVal;

    function handleChange(e) {
        const newVal = parseInt(e.target.value);
        val = newVal;
        onChange(newVal / 100);
    }
</script>

<div
        class="sliderWrapper"
        style="--progress: {val / 100}"
>
    <input
            type="range"
            min="0"
            max="100"
            class="slider"
            value={val}
            on:input={handleChange}
    />
</div>

<style>
    .sliderWrapper {
        position: relative;
        height: 0.5rem;
        display: flex;
        width: 100%;
    }

    .slider {
        width: 100%;
        height: 0.5rem;
        position: relative;
        border: 1px solid var(--color-primary);
        box-sizing: border-box;
        -webkit-appearance: none;
        z-index: 2;
        cursor: pointer;
    }

    .sliderWrapper::after {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: calc(100% * var(--progress));
        background-color: var(--color-primary);
        pointer-events: none;
        z-index: 0;
    }

    .slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 1rem;
        height: 1rem;
        background: transparent;
        cursor: pointer;
    }

    .slider::-moz-range-thumb {
        width: 1rem;
        height: 1rem;
        background: transparent;
        border: none;
        cursor: pointer;
    }
</style>
