<script lang="ts">
    interface Props {
        imageUrls?: string[];
    }

    let { imageUrls = [] }: Props = $props();
</script>

<div class="wrapper">
    <div class="container">
        <div class="diamond diamond-top-left"></div>
        <div class="diamond diamond-top-right"></div>
        <div class="diamond diamond-bottom-left"></div>
        <div class="diamond diamond-bottom-right"></div>

        <div class="image-container">
            {#each imageUrls as imageUrl, index}
                <img src={imageUrl} alt="Image {index + 1}" />
            {/each}
        </div>
    </div>
</div>

<style>
    .wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        padding: 20px;
        box-sizing: border-box;
        width: 100%;
    }

    .container {
        position: relative;
        width: 889px;
        height: 750px;
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
    }

    .diamond-top-left {
        top: -11px;
        left: -11px;
    }

    .diamond-top-right {
        top: -11px;
        right: -11px;
    }

    .diamond-bottom-left {
        bottom: -11px;
        left: -11px;
    }

    .diamond-bottom-right {
        bottom: -11px;
        right: -11px;
    }

    .image-container {
        position: absolute;
        top: 50px;
        left: 50px;
        right: 50px;
        bottom: 50px;
        overflow: auto;
        border: 1px solid #574E49;
        background: #2a2a2a;
    }

    .image-container img {
        width: 100%;
        height: auto;
        display: block;
        margin: 0;
        padding: 0;
    }

    .image-container::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }

    .image-container::-webkit-scrollbar-track {
        background: #2a2a2a;
    }

    .image-container::-webkit-scrollbar-thumb {
        background: #574E49;
        border-radius: 4px;
    }

    .image-container::-webkit-scrollbar-thumb:hover {
        background: #6b5f59;
    }
</style>