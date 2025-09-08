<script lang="ts">
    import Background from "./Background.svelte";
    import LeafGame from "./LeafGame.svelte";
    interface Props {
        mobile?: boolean;
    }
    let { mobile = false }: Props = $props();
</script>

<div class="relative w-full h-full grid place-items-center">
    <!-- The sizing box: fits by height, clamps by width, keeps aspect -->
    <div class="relative h-full w-auto max-w-full aspect-[872/511]">
        <!-- Inner opening (use per-side insets if needed) -->
        <div
            class="absolute z-10 overflow-hidden"
            style="
          top: var(--inset-top, 2.87%);
          right: var(--inset-right, 2.87%);
          bottom: var(--inset-bottom, 2.87%);
          left: var(--inset-left, 2.87%);
        "
        >
            <Background />
        </div>

        <!-- Decorative frame -->
        <img
            src="/assets/frame.svg"
            alt=""
            class="absolute inset-0 z-20 w-full h-full"
            loading="eager"
        />
    </div>
</div>

<style>
    .frame-wrap {
        --inset-top: 2.9%;
        --inset-right: 2.7%;
        --inset-bottom: 3.4%; /* a touch more if the bottom leaks */
        --inset-left: 2.8%;
    }
</style>
