<script lang="ts">
    import HoverEffectButton from "$lib/components/landing/HoverEffectButton.svelte";
    import RockFilter from "$lib/components/landing/svgs/RockFilter.svelte";
    import { fade } from "svelte/transition";
    import HorizontalDivider from "../HorizontalDivider.svelte";

    interface Props {
        title: string;
        onClose?: () => void;
        mobile?: boolean;
        show?: boolean;
        children?: import("svelte").Snippet;
        offsetDirection?: "center" | "x-center" | "left" | "right";
        dataMazeUi?: boolean; // For maze game pausing stuff
    }

    let {
        title,
        onClose,
        show = false,
        children,
        mobile,
        offsetDirection = "center",
        dataMazeUi = false,
    }: Props = $props();

    function handleBackdropClick(e: PointerEvent | MouseEvent) {
        onClose?.();
    }

    function clickedOutside(node: Node) {
        const handleClick = (event: Event) => {
            if (node && !node.contains(event.target as Node) && !event.defaultPrevented) {
                onClose?.();
            }
        };
        document.addEventListener("pointerdown", handleClick);

        return {
            destroy() {
                document.removeEventListener("pointerdown", handleClick);
            },
        };
    }
</script>

{#if show}
    <div
        class:xcenter={offsetDirection === "x-center"}
        class:center={offsetDirection === "center"}
        class:left={offsetDirection === "left"}
        class:right={offsetDirection === "right"}
        class="dialog bg-background"
        class:mobile
        transition:fade={{ duration: 200 }}
        use:clickedOutside
        data-maze-ui={dataMazeUi ? true : undefined}
    >
        <RockFilter />
        <div data-demon="border" class="decorBar"></div>
        <div data-demon="border" class="decorBar" style="top: unset; bottom: 0;"></div>
        <div class="contentHolder">
            <div class="titleBar">
                <p class="title">{title}</p>
                {#if onClose}
                    <HoverEffectButton onClick={onClose} square>X</HoverEffectButton>
                {/if}
            </div>
            <HorizontalDivider />
            {@render children?.()}
        </div>
    </div>
    {#if mobile}
        <div
            transition:fade={{ duration: 200 }}
            class="dialogBackdrop"
            onclick={handleBackdropClick}
        ></div>
    {/if}
{/if}

<style>
    .contentHolder {
        display: flex;
        flex-direction: column;
        align-items: center;

        padding: 2rem 1.5rem;
        overflow: auto;
        height: 100%;
        width: 100%;
    }

    .dialog {
        position: absolute;
        top: 0;
        border: 1px solid var(--color-border);

        box-sizing: border-box;

        display: flex;
        flex-direction: column;

        align-items: center;

        min-width: 300px;
        max-height: 85dvh;
        width: fit-content;
        height: fit-content;

        background-color: var(--color-background);
        z-index: 10020;
    }

    :not(.mobile).left {
        left: 0;
        transform: translate(0, calc(-100% - 1rem));
    }

    :not(.mobile).right {
        right: 0;
        transform: translate(0, calc(-100% - 1rem));
    }

    :not(.mobile).xcenter {
        left: 50%;
        transform: translate(-50%, calc(-100% - 1rem));
    }

    :not(.mobile).center {
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }

    .dialog.mobile {
        z-index: 1004;
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
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
        z-index: 5;
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
