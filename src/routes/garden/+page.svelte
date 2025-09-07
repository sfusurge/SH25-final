<script lang="ts">
    import Pause from "$lib/components/leaf/Pause.svelte";
    import DesktopShop from "$lib/components/leaf/DesktopShop.svelte";
    import Frame from "$lib/components/leaf/Frame.svelte";
</script>

<div class="w-full h-full min-w-0">
    <div class="sm:hidden w-full">
        <Frame mobile={true} />
    </div>

    <!-- Desktop -->
    <div class="hidden sm:flex flex-col w-full min-w-0 h-dvh">
        <!-- Top bar -->
        <div class="flex justify-between items-start pt-8 px-8 w-full min-w-0">
            <Pause />
            <DesktopShop />
        </div>

        <div
            class="m-8 flex-1 w-full min-w-0 flex items-center justify-center min-h-0"
        >
            <div class="relative w-full min-w-0 aspect-[872/511]">
                <div class="absolute inset-[2.87%] z-10 overflow-hidden">
                    <Frame />
                </div>
            </div>
        </div>
    </div>
</div>
