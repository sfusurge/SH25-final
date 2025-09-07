<script lang="ts">
    import LeafGame from "./LeafGame.svelte";
    interface Props {
        mobile?: boolean;
    }
    let { mobile = false }: Props = $props();
</script>

<div class="relative w-full h-full">
    <div class="absolute inset-[2.87%] z-20 overflow-hidden">
        <LeafGame />
    </div>

    <img
        src="/assets/frame.svg"
        alt="frame"
        class="absolute inset-0 w-full h-full object-contain pointer-events-none z-30"
        loading="eager"
        data-demon="border"
    />
</div>
