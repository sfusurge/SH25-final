<script>
    import HoverEffectButton from '$lib/components/landing/HoverEffectButton.svelte';
    import RockFilter from '$lib/components/landing/RockFilter.svelte';
    import BlockPatternVertical from '$lib/components/landing/svgs/BlockPatternVertical.svelte';
    import {
        paused,
        minutes,
        seconds,
        toggleTimer,
        setTime
    } from '$lib/stores/timer.js';

    let minRef;
    let secRef;

    function handleMinutesChange(e) {
        const val = Math.max(Math.min(999, parseInt(e.target.value)), 0);
        if (isNaN(val)) {
            return setTime({ minutes: '0' });
        }
        setTime({ minutes: `${val}` });
    }

    function handleSecondsChange(e) {
        const val = Math.max(Math.min(59, parseInt(e.target.value)), 0);

        if (isNaN(val)) {
            return setTime({ seconds: '00' });
        }

        const formattedSeconds = val < 10 ? `0${val}` : `${val}`;
        setTime({ seconds: formattedSeconds });
    }

    function handleMinutesKeyup(e) {
        if (e.key === 'Enter' || e.key === ':') {
            minRef?.blur();
            secRef?.select();
        }
    }

    function handleSecondsKeyup(e) {
        if (e.key === 'Enter') {
            secRef?.blur();
            toggleTimer();
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
    }

    .timeInputField:focus {
        outline: none;
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
              class="timeInputField text-base w-5"
              style="text-align: right;"
              type="number"
              min="0"
              max="999"
              on:input={handleMinutesChange}
              on:keyup={handleMinutesKeyup}
      />
      :
      <input
              bind:this={secRef}
              bind:value={$seconds}
              class="timeInputField text-base w-5"
              style="text-align: left;"
              type="number"
              min="0"
              max="59"
              on:input={handleSecondsChange}
              on:keyup={handleSecondsKeyup}
      />
    </span>
    </div>
    <HoverEffectButton
            on:click={toggleTimer}
            class="bg-[#06060599] text-md px-2 py-1 border-[0.643px] flex items-center justify-center cursor-pointer text-decor not-italic border-decor hover:border-main"
    >
        {$paused ? 'Start' : 'Stop'}
    </HoverEffectButton>
</div>

<!-- Desktop -->
<div class="hidden sm:flex mt-auto mb-8 relative border border-border bg-[#231f1f] h-11">
    <RockFilter />
    <div class="flex justify-between items-center h-full">
        <BlockPatternVertical class="h-[44px] mr-1.5" />
        <div class="flex justify-between px-2 items-center w-[153px] gap-2 h-[33px] p-[6.427px] flex-shrink-0 border-[0.643px] border-borderalt bg-[#231f1f] alt">
            <div class="flex flex-row gap-0 justify-between items-center">
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
                  class="timeInputField"
                  style="text-align: right;"
                  type="number"
                  min="0"
                  max="999"
                  on:input={handleMinutesChange}
                  on:keyup={handleMinutesKeyup}
          />
          :
          <input
                  bind:this={secRef}
                  bind:value={$seconds}
                  class="timeInputField"
                  style="text-align: left;"
                  type="number"
                  min="0"
                  max="59"
                  on:input={handleSecondsChange}
                  on:keyup={handleSecondsKeyup}
          />
        </span>
            </div>
            <HoverEffectButton
                    on:click={toggleTimer}
                    class="bg-[#06060599] px-2 py-1 text-xs border-[0.643px] h-[20px] w-[45px] flex items-center justify-center cursor-pointer text-decor border-decor hover:border-main"
            >
                {$paused ? 'Start' : 'Stop'}
            </HoverEffectButton>
        </div>
        <BlockPatternVertical class="h-11 ml-1.5 rotate-180" />
    </div>
</div>