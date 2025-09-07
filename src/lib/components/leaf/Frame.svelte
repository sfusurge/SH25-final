<script lang="ts">
    import Background from "./Background.svelte";
    import LeafGame from "./LeafGame.svelte";
    interface Props {
        mobile?: boolean;
    }
    let { mobile = false }: Props = $props();
</script>

<div
    class="inset-0 relative"
    style="
        height: 100%;
        width: auto;
        max-width: 100%;
        object-fit: contain;
        display: flex;
        aspect-ratio: calc(872/511);
    "
>
    <div
        style="
            width: calc(100% - (2 * 2.87%));
            max-width: 100%;
            object-fit: contain;
            margin: 2.87%;
            position: relative;
            z-index: 2;
            overflow: hidden;
            "
    >
        <Background />
    </div>

    <img
        src="/assets/frame.svg"
        alt="frame"
        class="object-contain absolute inset-0 pointer-events-none z-10 w-full h-full"
        loading="eager"
        data-demon="border"
    />
</div>
