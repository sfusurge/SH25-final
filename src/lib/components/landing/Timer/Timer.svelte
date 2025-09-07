<script lang="ts">
    import BlockPatternVertical from "$lib/components/landing/svgs/BlockPatternVertical.svelte";
    import RockFilter from "$lib/components/landing/svgs/RockFilter.svelte";
    import TimerComp from "$lib/components/landing/Timer/TimerComp.svelte";
</script>

<div class="hidden sm:flex mt-auto relative border border-border bg-[#231f1f] h-11">
    <RockFilter />
    <div class="flex justify-between items-center h-full">
        <BlockPatternVertical className="h-[44px] mr-1.5" />
        <div
            class="flex justify-between px-2 items-center w-[153px] gap-2 h-[33px] p-[6.427px] flex-shrink-0 border-[0.643px] border-borderalt bg-[#06060599] alt"
        >
            <div class="flex flex-row gap-0 justify-between items-center text-[#8A6F6A]">
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
                className="bg-[#06060599] text-[#8A6F6A] px-2 py-1 text-[12px] border-[0.643px] h-[20px] w-[45px] flex items-center justify-center cursor-pointer text-decor border-decor hover:border-main"
            >
                {$paused ? "Start" : "Stop"}
            </HoverEffectButton>
        </div>
        <BlockPatternVertical className="h-11 ml-1.5 rotate-180" />
    </div>
</div>

<style>
    .timeInputContainer {
        display: flex;
        align-items: center;
        font-size: 12px;
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
