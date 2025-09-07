<script>
    import HoverEffectButton from "$lib/components/landing/HoverEffectButton.svelte";
    import RockFilter from "$lib/components/landing/svgs/RockFilter.svelte";
    import BlockPatternVertical from "$lib/components/landing/svgs/BlockPatternVertical.svelte";
    import {
        paused,
        minutes,
        seconds,
        toggleTimer,
        setTime,
        cleanup,
    } from "$lib/sharedStates/timer.js";
    import { onDestroy } from "svelte";
    import { global } from "../../../../routes/+layout.svelte";

    let minRef = $state();
    let secRef = $state();

    onDestroy(() => {
        cleanup();
    });

    function handleMinutesChange(e) {
        const inputValue = e.target.value;

        if (inputValue === "") {
            setTime({ minutes: "0" });
            return;
        }

        const val = Math.max(Math.min(999, parseInt(inputValue)), 0);
        if (isNaN(val)) {
            setTime({ minutes: "0" });
            return;
        }
        setTime({ minutes: `${val}` });
    }

    function handleSecondsChange(e) {
        const inputValue = e.target.value;

        // Allow empty input for better UX
        if (inputValue === "") {
            setTime({ seconds: "00" });
            return;
        }

        const val = Math.max(Math.min(59, parseInt(inputValue)), 0);
        if (isNaN(val)) {
            setTime({ seconds: "00" });
            return;
        }

        const formattedSeconds = val < 10 ? `0${val}` : `${val}`;
        setTime({ seconds: formattedSeconds });
    }

    function handleMinutesKeyup(e) {
        if (e.key === "Enter" || e.key === ":") {
            e.preventDefault();
            minRef?.blur();
            secRef?.focus();
            secRef?.select();
        }
    }

    function handleSecondsKeyup(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            secRef?.blur();
            toggleTimer();
        }
    }

    function handleMinutesFocus(e) {
        e.target.select();
    }

    function handleSecondsFocus(e) {
        e.target.select();
    }

    function handleMinutesKeydown(e) {
        if (
            [8, 9, 27, 13, 35, 36, 37, 39, 46].indexOf(e.keyCode) !== -1 ||
            (e.keyCode === 65 && e.ctrlKey === true) ||
            (e.keyCode === 67 && e.ctrlKey === true) ||
            (e.keyCode === 86 && e.ctrlKey === true) ||
            (e.keyCode === 88 && e.ctrlKey === true)
        ) {
            return;
        }
        if (
            (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
            (e.keyCode < 96 || e.keyCode > 105)
        ) {
            e.preventDefault();
        }
    }

    function handleSecondsKeydown(e) {
        if (
            [8, 9, 27, 13, 35, 36, 37, 39, 46].indexOf(e.keyCode) !== -1 ||
            (e.keyCode === 65 && e.ctrlKey === true) ||
            (e.keyCode === 67 && e.ctrlKey === true) ||
            (e.keyCode === 86 && e.ctrlKey === true) ||
            (e.keyCode === 88 && e.ctrlKey === true)
        ) {
            return;
        }
        if (
            (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
            (e.keyCode < 96 || e.keyCode > 105)
        ) {
            e.preventDefault();
        }
    }
</script>

<div
    class:mobile={global.mobile}
    class="flex justify-between items-center w-[153px] gap-2 flex-shrink-0 border-[0.643px] border-border bg-[#06060599] root"
>
    <div class="flex flex-row gap-0 justify-between items-center">
        <img src="/assets/clock.svg" height="15" width="16" data-demon="primary" alt="clock" />
        <span class="timeInputContainer" class:mobile={global.mobile}>
            <input
                bind:this={minRef}
                bind:value={$minutes}
                class="timeInputField minutes"
                type="number"
                min="0"
                max="999"
                oninput={handleMinutesChange}
                onkeyup={handleMinutesKeyup}
                onkeydown={handleMinutesKeydown}
                onfocus={handleMinutesFocus}
            />
            :
            <input
                bind:this={secRef}
                bind:value={$seconds}
                class="timeInputField seconds"
                type="number"
                min="0"
                max="59"
                oninput={handleSecondsChange}
                onkeyup={handleSecondsKeyup}
                onkeydown={handleSecondsKeydown}
                onfocus={handleSecondsFocus}
            />
        </span>
    </div>
    <HoverEffectButton
        onClick={toggleTimer}
        style="line-height: 1rem; font-size: {global.mobile ? 14 : 12}px; padding:0.25rem;"
        className="flex items-center justify-center cursor-pointer text-decor border-decor hover:border-main"
    >
        {$paused ? "Start" : "Stop"}
    </HoverEffectButton>
</div>

<style>
    .root {
        padding: 0.25rem 0.5rem;
    }
    .root.mobile {
        width: 100%;
    }

    .timeInputContainer {
        display: flex;
        align-items: center;
        font-size: 12px;
    }

    .timeInputContainer.mobile {
        font-size: 14px;
    }

    .timeInputField {
        background: transparent;
        border: none;
        color: inherit;
        font-family: inherit;
        font-size: inherit;
        width: 2ch;
        padding: 0;
        margin: 0;
        outline: none;
        text-align: center;
    }

    .timeInputField:focus {
        outline: none;
        background-color: rgba(255, 255, 255, 0.1);
    }

    .timeInputField.minutes {
        text-align: right;
        width: 3ch; /* Slightly wider for up to 3 digits */
    }

    .timeInputField.seconds {
        text-align: left;
        width: 2ch;
    }

    /* Remove number input arrows */
    .timeInputField::-webkit-outer-spin-button,
    .timeInputField::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    .timeInputField[type="number"] {
        -moz-appearance: textfield;
    }
</style>
