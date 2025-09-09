<script>
    import Diamond from "$lib/components/landing/svgs/Diamond.svelte";
    export let width = '';
    export let height = '';
    export let src = '';
    export let alt = 'Image';
    export let href = '';
    export let padding = '8px';
</script>

<div class="image-container"
     style="width: {width}; height: {height};"
>
    <div class="diamond-row">
        <Diamond width={8} height={14} />
        <Diamond width={8} height={14} />
    </div>

    <div class="image-wrapper" style="padding: {padding}">
        <a {href} target="_blank" rel="noopener noreferrer">
            <img
                    class="contained-image"
                    loading="lazy"
                    {src}
                    {alt}
            />
        </a>
    </div>

    <div class="diamond-row">
        <Diamond width={8} height={14} />
        <Diamond width={8} height={14} />
    </div>
</div>

<style>
    .image-container {
        border: 1px solid #574E49;
        background: #151313;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        box-sizing: border-box;
        padding: 8px;
    }

    .diamond-row {
        display: flex;
        justify-content: space-between;
        width: 100%;
        height: 14px;
        flex-shrink: 0;
    }

    .image-wrapper {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        overflow: hidden;
    }

    a {
        display: flex;
        align-items: center;
        justify-content: center;
        max-width: 100%;
        max-height: 100%;
        text-decoration: none;
        width: 100%;
        height: 100%;
    }

    .contained-image {
        max-width: 100%;
        max-height: 100%;
        width: auto;
        height: auto;
        object-fit: contain;
        display: block;
    }

    a:hover .contained-image {
        opacity: 0.8;
        transition: opacity 0.2s ease;
    }
</style>
