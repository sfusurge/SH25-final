<script lang="ts">
    import ScalableFrame from "$lib/components/maze/UI/ScalableFrame.svelte";
    import { global } from "../../../../routes/+layout.svelte";

    interface Props {
        key: number | string;
        imageUrls?: string[];
    }

    const { key, imageUrls = [] }: Props = $props();
</script>

<div class="parent" class:mobile={global.mobile}>
    <ScalableFrame style="width:100%; max-width:600px;">
        <div class="imgWrapper">
            <div class="image-container">
                {#each imageUrls as imageUrl, index}
                    <img src={imageUrl} alt="Image {index + 1}" />
                {/each}
            </div>
        </div>
    </ScalableFrame>
</div>

<style>
  
    .parent {
        flex: 1;
        min-width: 0;
        min-height: 0;

        display: flex;
        padding: 5rem;

        justify-content: center;
    }

    .parent.mobile {
        padding: 0;
    }

    .imgWrapper {
        display: flex;
        width: 100%;
        max-height: 100%;

        overflow: auto;
        scrollbar-width: thin;
        scroll-behavior: smooth;

        background-color: var(--bg2);
    }

    .image-container {
        width: 100%;
        display: flex;
        flex-direction: column;
    }
</style>
