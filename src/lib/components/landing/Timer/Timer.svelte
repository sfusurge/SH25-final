<script>
    import HoverEffectButton from '$lib/components/landing/HoverEffectButton.svelte';
    import RockFilter from '$lib/components/landing/svgs/RockFilter.svelte';
    import BlockPatternVertical from '$lib/components/landing/svgs/BlockPatternVertical.svelte';
    import {
        paused,
        minutes,
        seconds,
        toggleTimer,
        setTime,
        cleanup
    } from '$lib/stores/timer.js';
    import {onDestroy} from 'svelte';

    let minRef;
    let secRef;

    onDestroy(() => {
        cleanup();
    });

    function handleMinutesChange(e) {
        const inputValue = e.target.value;

        if (inputValue === '') {
            setTime({minutes: '0'});
            return;
        }

        const val = Math.max(Math.min(999, parseInt(inputValue)), 0);
        if (isNaN(val)) {
            setTime({minutes: '0'});
            return;
        }
        setTime({minutes: `${val}`});
    }

    function handleSecondsChange(e) {
        const inputValue = e.target.value;

        // Allow empty input for better UX
        if (inputValue === '') {
            setTime({seconds: '00'});
            return;
        }

        const val = Math.max(Math.min(59, parseInt(inputValue)), 0);
        if (isNaN(val)) {
            setTime({seconds: '00'});
            return;
        }

        const formattedSeconds = val < 10 ? `0${val}` : `${val}`;
        setTime({seconds: formattedSeconds});
    }

    function handleMinutesKeyup(e) {
        if (e.key === 'Enter' || e.key === ':') {
            e.preventDefault();
            minRef?.blur();
            secRef?.focus();
            secRef?.select();
        }
    }

    function handleSecondsKeyup(e) {
        if (e.key === 'Enter') {
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
        if ([8, 9, 27, 13, 35, 36, 37, 39, 46].indexOf(e.keyCode) !== -1 ||
            (e.keyCode === 65 && e.ctrlKey === true) ||
            (e.keyCode === 67 && e.ctrlKey === true) ||
            (e.keyCode === 86 && e.ctrlKey === true) ||
            (e.keyCode === 88 && e.ctrlKey === true)) {
            return;
        }
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    }

    function handleSecondsKeydown(e) {
        if ([8, 9, 27, 13, 35, 36, 37, 39, 46].indexOf(e.keyCode) !== -1 ||
            (e.keyCode === 65 && e.ctrlKey === true) ||
            (e.keyCode === 67 && e.ctrlKey === true) ||
            (e.keyCode === 86 && e.ctrlKey === true) ||
            (e.keyCode === 88 && e.ctrlKey === true)) {
            return;
        }
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    }
</script>

<style>
    .timeInputContainer {
        display: flex;
        align-items: center;
        gap: 0.25rem;
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

    .timeInputField[type=number] {
        -moz-appearance: textfield;
    }
</style>

<!-- Mobile -->
<div class="flex flex-row gap-0 items-center border border-border bg-[#231f1f] w-full py-2 px-3 sm:hidden justify-between relative">
    <div class="flex flex-row gap-1.5">
        <img
                src="/assets/clock.svg"
                height="32"
                width="32"
                alt="clock"
                data-demon="primary"
        />
        <span class="timeInputContainer">
            <input
                    bind:this={minRef}
                    bind:value={$minutes}
                    class="timeInputField minutes text-base"
                    type="number"
                    min="0"
                    max="999"
                    on:input={handleMinutesChange}
                    on:keyup={handleMinutesKeyup}
                    on:keydown={handleMinutesKeydown}
                    on:focus={handleMinutesFocus}
            />
            :
            <input
                    bind:this={secRef}
                    bind:value={$seconds}
                    class="timeInputField seconds text-base"
                    type="number"
                    min="0"
                    max="59"
                    on:input={handleSecondsChange}
                    on:keyup={handleSecondsKeyup}
                    on:keydown={handleSecondsKeydown}
                    on:focus={handleSecondsFocus}
            />
        </span>
    </div>
    <HoverEffectButton
            onClick={toggleTimer}
            className="bg-[#06060599] text-md px-2 py-1 border-[0.643px] flex items-center justify-center cursor-pointer text-decor not-italic border-decor hover:border-main"
    >
        {$paused ? 'Start' : 'Stop'}
    </HoverEffectButton>
</div>

<div class="hidden sm:flex mt-auto mb-8 relative border border-border bg-[#231f1f] h-11">
    <RockFilter/>
    <div class="flex justify-between items-center h-full">
        <BlockPatternVertical className="h-[44px] mr-1.5"/>
        <div class="flex justify-between px-2 items-center w-[153px] gap-2 h-[33px] p-[6.427px] flex-shrink-0 border-[0.643px] border-borderalt  bg-[#06060599] alt">
            <div class="flex flex-row gap-0 justify-between items-center ">
                <img
                        src="/assets/clock.svg"
                        height="15"
                        width="16"
                        data-demon="primary"
                        alt="clock"
                />
                <span class="timeInputContainer">
                    <input
                            bind:this={minRef}
                            bind:value={$minutes}
                            class="timeInputField minutes"
                            type="number"
                            min="0"
                            max="999"
                            on:input={handleMinutesChange}
                            on:keyup={handleMinutesKeyup}
                            on:keydown={handleMinutesKeydown}
                            on:focus={handleMinutesFocus}
                    />
                    :
                    <input
                            bind:this={secRef}
                            bind:value={$seconds}
                            class="timeInputField seconds"
                            type="number"
                            min="0"
                            max="59"
                            on:input={handleSecondsChange}
                            on:keyup={handleSecondsKeyup}
                            on:keydown={handleSecondsKeydown}
                            on:focus={handleSecondsFocus}
                    />
                </span>
            </div>
            <HoverEffectButton
                    onClick={toggleTimer}
                    className="bg-[#06060599] px-2 py-1 text-xs border-[0.643px] h-[20px] w-[45px] flex items-center justify-center cursor-pointer text-decor border-decor hover:border-main"
            >
                {$paused ? 'Start' : 'Stop'}
            </HoverEffectButton>
        </div>
        <BlockPatternVertical className="h-11 ml-1.5 rotate-180"/>
    </div>
</div>