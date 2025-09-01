<script>
    export let initialVal = 0;
    export let onChange = (val) => {};

    let val = initialVal;

    // Update internal value when initialVal changes
    $: val = initialVal;

    function handleChange(e) {
        const newVal = parseInt(e.target.value);
        val = newVal;
        onChange(newVal / 100);
    }
</script>

<style>
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
</style>

<div
        class="slider-wrapper"
        style="--progress: {val / 100}"
>
    <input
            type="range"
            min="0"
            max="100"
            class="slider"
            bind:value={val}
            on:input={handleChange}
    />
</div>