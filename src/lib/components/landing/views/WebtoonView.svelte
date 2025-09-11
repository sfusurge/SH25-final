<script lang="ts">
    import { onMount, onDestroy } from 'svelte';

    export let imageUrls: string[] = [];
    export let fixedThumbHeight: number = 50;
    export let trackWidth: number = 5;

    let container: HTMLElement | null = null;
    let thumb: HTMLElement | null = null;

    let thumbHeight = 0;
    let thumbTop = 0;

    function clamp(v: number, a: number, b: number) {
        return Math.max(a, Math.min(b, v));
    }

    function updateThumb() {
        if (!container) return;
        const trackHeight = container.clientHeight;
        const scrollHeight = container.scrollHeight;

        if (scrollHeight <= trackHeight) {
            thumbHeight = trackHeight;
            thumbTop = 0;
            return;
        }

        const proportional = (trackHeight / scrollHeight) * trackHeight;
        thumbHeight = Math.min(trackHeight, Math.max(fixedThumbHeight, proportional));

        const maxThumbTop = trackHeight - thumbHeight;
        const scrollable = scrollHeight - trackHeight;
        const scrollRatio = scrollable > 0 ? container.scrollTop / scrollable : 0;
        thumbTop = maxThumbTop * scrollRatio;
    }

    function onScroll() {
        updateThumb();
    }

    let resizeObserver: ResizeObserver | null = null;
    let mutationObserver: MutationObserver | null = null;

    onMount(() => {
        updateThumb();
        if (container) {
            resizeObserver = new ResizeObserver(updateThumb);
            resizeObserver.observe(container);

            mutationObserver = new MutationObserver(updateThumb);
            mutationObserver.observe(container, { childList: true, subtree: true, characterData: true });

            container.addEventListener('scroll', onScroll);
        }
        window.addEventListener('resize', updateThumb);
    });

    onDestroy(() => {
        if (resizeObserver) resizeObserver.disconnect();
        if (mutationObserver) mutationObserver.disconnect();
        if (container) container.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', updateThumb);
    });

    let dragging = false;
    let startPointerY = 0;
    let startThumbTop = 0;

    function onThumbPointerDown(e: PointerEvent) {
        e.preventDefault();
        if (!thumb) return;
        dragging = true;
        const pid = (e as PointerEvent).pointerId;
        try { (thumb as HTMLElement).setPointerCapture(pid); } catch {}
        startPointerY = e.clientY;
        startThumbTop = thumbTop;
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp, { once: true });
    }

    function onPointerMove(e: PointerEvent) {
        if (!dragging || !container) return;
        const trackHeight = container.clientHeight;
        const maxThumbTop = trackHeight - thumbHeight;
        const delta = e.clientY - startPointerY;
        const newTop = clamp(startThumbTop + delta, 0, maxThumbTop);
        thumbTop = newTop;

        const scrollable = container.scrollHeight - trackHeight;
        if (scrollable > 0 && maxThumbTop > 0) {
            container.scrollTop = (newTop / maxThumbTop) * scrollable;
        } else {
            container.scrollTop = 0;
        }
    }

    function onPointerUp(e: PointerEvent) {
        dragging = false;
        try { (thumb as HTMLElement)?.releasePointerCapture((e as PointerEvent).pointerId); } catch {}
        window.removeEventListener('pointermove', onPointerMove);
    }

    function onTrackPointerDown(e: PointerEvent) {
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        const newTop = clamp(clickY - thumbHeight / 2, 0, container.clientHeight - thumbHeight);
        const scrollable = container.scrollHeight - container.clientHeight;
        if (scrollable > 0) {
            container.scrollTop = (newTop / (container.clientHeight - thumbHeight)) * scrollable;
        } else {
            container.scrollTop = 0;
        }
        updateThumb();
    }
</script>

<div class="wrapper">
    <div class="container">
        <div class="diamond diamond-top-left"></div>
        <div class="diamond diamond-top-right"></div>
        <div class="diamond diamond-bottom-left"></div>
        <div class="diamond diamond-bottom-right"></div>

        <div class="image-container" bind:this={container} aria-hidden="false">
            {#each imageUrls as imageUrl, index}
                <img src={imageUrl} alt="Image {index + 1}" />
            {/each}
        </div>

        <div
                class="custom-scrollbar"
                on:pointerdown={onTrackPointerDown}
                style="--track-width: {trackWidth}px"
                aria-hidden="true"
        >
            <div
                    class="thumb"
                    bind:this={thumb}
                    on:pointerdown={onThumbPointerDown}
                    style="height: {thumbHeight}px; transform: translateY({thumbTop}px);"
            ></div>
        </div>
    </div>
</div>

<style>
    .wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100dvh;
        padding: 10px;
        box-sizing: border-box;
        width: 100%;
    }

    .container {
        position: relative;
        width: min(889px, 100%);
        height: min(750px, calc(100vh - 20px));
        height: min(750px, calc(100dvh - 20px));
        max-width: calc(100vw - 20px);
        flex-shrink: 0;
        border: 1px solid #574E49;
        background: #363636;
    }

    .diamond {
        position: absolute;
        width: 21.985px;
        height: 21.985px;
        transform: rotate(-45deg);
        flex-shrink: 0;
        border: 1px solid #574E49;
        background: #0C0C0B;
        z-index: 20;
    }

    .diamond-top-left { top: -11px; left: -11px; }
    .diamond-top-right { top: -11px; right: -11px; }
    .diamond-bottom-left { bottom: -11px; left: -11px; }
    .diamond-bottom-right { bottom: -11px; right: -11px; }

    .image-container {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        overflow: auto;
        background: #2a2a2a;
        z-index: 10;
        -ms-overflow-style: none;
        scrollbar-width: none;
    }

    .image-container::-webkit-scrollbar {
        display: none;
    }

    .image-container img {
        width: 100%;
        height: auto;
        display: block;
        margin: 0;
        padding: 0;
    }

    .custom-scrollbar {
        position: absolute;
        top: 0;
        right: 0;
        height: 100%;
        width: var(--track-width, 12px);
        display: flex;
        align-items: flex-start;
        justify-content: center;
        z-index: 10;
    }

    .custom-scrollbar .thumb {
        width: 8px;
        border-radius: 4px;
        background: #5c4b48;
        cursor: pointer;
        will-change: transform;
        transition: background-color 120ms;
        box-shadow: none;
    }

    .custom-scrollbar .thumb:hover {
        background: #6b5f59;
    }

    @media (max-width: 768px) {
        .wrapper {
            padding: 8px;
            height: 100vh;
            height: 100dvh;
        }

        .container {
            width: calc(100vw - 16px);
            height: calc(100vh - 16px);
            height: calc(100dvh - 16px);
        }

        .diamond {
            width: 18px;
            height: 18px;
        }

        .diamond-top-left { top: -9px; left: -9px; }
        .diamond-top-right { top: -9px; right: -9px; }
        .diamond-bottom-left { bottom: -9px; left: -9px; }
        .diamond-bottom-right { bottom: -9px; right: -9px; }
    }

    @media (max-width: 480px) {
        .wrapper {
            padding: 4px;
        }

        .container {
            max-height: calc(100vh - 80px);
            max-height: calc(100dvh - 80px);
            max-width: calc(100vw - 30px);
        }
    }
</style>