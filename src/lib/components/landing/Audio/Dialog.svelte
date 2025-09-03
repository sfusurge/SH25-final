<script>
    import HoverEffectButton from "$lib/components/landing/HoverEffectButton.svelte";
    import RockFilter from "$lib/components/landing/svgs/RockFilter.svelte";
    import HorizontalDivider from "../HorizontalDivider.svelte";

    export let title;
    export let onClose = () => {};
    export let mobileMode = false;
    export let mobileTriggerButton = null;
    export let mobileShow = false;

    function handleBackdropClick(e) {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }
</script>

<style>
    .dialog {
        position: absolute;
        left: 50%;
        top: 0;
        transform: translate(-50%, calc(-100% - 1rem));

        border: 1px solid var(--color-border);

        padding: 2rem 1.5rem;
        box-sizing: border-box;

        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        min-width: 250px;
        width: fit-content;
        height: fit-content;

        background-color: var(--color-background);
        z-index: 1002;
    }

    .dialog.mobile {
        z-index: 1004;
        top: unset;
        left: unset;
        transform: none;
        min-width: 275px;
        justify-content: center;
        align-items: center;
        pointer-events: auto;
    }

    .dialogBackdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(22, 20, 20, 0.85);
        z-index: 1000;
        display: flex;
        justify-content: center;
        align-items: center;
        pointer-events: auto;
    }

    .decorBar {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 0.5rem;
        background-image: url("/assets/block-pattern.svg");
    }

    .titleBar {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }

    .title {
        font-size: 15px;
        font-style: italic;
        color: var(--color-header);
        font-weight: 700;
    }
</style>

{#if mobileMode}
    {#if mobileShow}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="dialogBackdrop" on:click={handleBackdropClick} />
        <div class="w-full h-full fixed top-0 left-0 flex justify-center items-center z-[1002] pointer-events-none">
            <div class="dialog mobile">
                <RockFilter />

                <div data-demon='border' class="decorBar"></div>
                <div data-demon='border' class="decorBar" style="top: unset; bottom: 0;"></div>

                <div class="titleBar">
                    <p class="title">{title}</p>
                    <HoverEffectButton onClick={onClose} style="width: 24px; height: 24px;">
                        X
                    </HoverEffectButton>
                </div>
                <HorizontalDivider />
                <slot />
            </div>
        </div>
    {/if}

    {#if mobileTriggerButton}
        <div class={mobileShow ? "z-[1001]" : "flex"}>
<!--            <svelte:component this={mobileTriggerButton} />-->
        </div>
    {/if}
{:else}
    <div class="dialog bg-background">
        <RockFilter />

        <div data-demon='border' class="decorBar"></div>
        <div data-demon='border' class="decorBar" style="top: unset; bottom: 0;"></div>

        <div class="titleBar">
            <p class="title">{title}</p>
            <HoverEffectButton onClick={onClose} style="width: 24px; height: 24px;">
                X
            </HoverEffectButton>
        </div>
        <HorizontalDivider />
        <slot />
    </div>
{/if}
