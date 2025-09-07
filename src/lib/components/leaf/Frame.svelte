<script lang="ts">
    import Background from "./Background.svelte";
    import LeafGame from "./LeafGame.svelte";
    interface Props {
        mobile?: boolean;
    }
    let { mobile = false }: Props = $props();
</script>

<div class="relative w-full h-full">
    <div
        class="absolute inset-0 w-full h-full scale-x-[1.0] scale-y-[1.0] origin-center"
    >
        <div
            class="absolute top-[4.5%] left-[11%] right-[11%] bottom-[4.9%] z-20 overflow-hidden"
        >
            <Background />
        </div>

        <img
            src="/assets/frame.svg"
            alt="frame"
            class="absolute inset-0 w-full h-full object-contain pointer-events-none z-30"
            loading="eager"
        />
    </div>
</div>
