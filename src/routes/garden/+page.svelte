<script lang="ts">
    import DesktopShop from "$lib/components/leaf/DesktopShop.svelte";
    import Frame from "$lib/components/leaf/Frame.svelte";
    import Pause from "$lib/components/leaf/Pause.svelte";
</script>

<div class="flex-1 sm:flex flex-col hidden h-full" style="max-height: 100dvh">
    <div class="flex justify-between items-start pt-8 px-8">
        <Pause />
        <DesktopShop />
    </div>

    <div
        class="m-8 flex-1 flex items-center justify-center"
        style="min-height: 0"
    >
        <Frame />
    </div>

    <div class="flex justify-center pb-4"></div>
</div>
