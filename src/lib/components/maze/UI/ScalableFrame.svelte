<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        children?: Snippet;
        style?: string;
        borderWidth?: number;
    }

    let { children, borderWidth = 20, style = "" }: Props = $props();
</script>

<div class="rootContainer" style="--borderWidth: {borderWidth}px; {style}">
    <div class="decor bot"></div>
    <div class="decor top"></div>
    <div class="decor left"></div>
    <div class="decor right"></div>

    <div class="inner">
        {@render children?.()}
    </div>
</div>

<style>
    .inner {
        width: 100%;
        height: 100%;

        position: relative;
        z-index: 1;
    }

    .rootContainer {
        display: flex;
        position: relative;

        border: 2px solid var(--border);
        min-width: 100px;
        min-height: 100px;

        box-sizing: border-box;
    }

    .decor {
        position: absolute;
        box-sizing: border-box;
        z-index: 2;
    }

    .top,
    .bot {
        background-image: url("/assets/borderPattern.svg");
        background-size: auto var(--borderWidth);

        width: calc(100% + var(--borderWidth) * 2);
        height: var(--borderWidth);
        left: calc(-1 * var(--borderWidth));
    }

    .top {
        top: calc(-1 * var(--borderWidth) - 2px);
        border-top: 2px solid var(--border);
    }
    .bot {
        top: calc(100% + 2px);
        border-bottom: 2px solid var(--border);
    }

    .left,
    .right {
        background-image: url("/assets/borderPatternVer.svg");
        background-repeat: repeat;
        background-size: var(--borderWidth) auto;
    }

    .left {
        position: absolute;
        left: calc(-1 * var(--borderWidth));
        top: 0;

        height: 100%;
        width: var(--borderWidth);
        border-left: 2px solid var(--border);
    }

    .right {
        position: absolute;
        left: calc(100%);
        top: 0;

        height: 100%;
        width: var(--borderWidth);

        border-right: 2px solid var(--border);
    }

    .left::before,
    .right::before {
        content: "";
        width: 36px;
        height: 36px;

        background-color: var(--bg);
        border: 2px solid var(--border);

        position: absolute;

        top: 0;
        left: 50%;

        transform: translate(-50%, calc(-50% - var(--borderWidth) / 2)) rotate(45deg);
    }

    .left::after,
    .right::after {
        content: "";
        width: 36px;
        height: 36px;

        background-color: var(--bg);
        border: 2px solid var(--border);

        position: absolute;

        top: 100%;
        left: 50%;

        transform: translate(-50%, calc(-50% + var(--borderWidth) / 2)) rotate(45deg);
    }
</style>
