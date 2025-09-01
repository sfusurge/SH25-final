<script>
    export let imageUrl = "";
</script>

<div class="container">
    <!-- Top diamond -->
    <div class="diamond diamond-top"></div>

    <!-- Left diamond -->
    <div class="diamond diamond-left"></div>

    <!-- Right diamond -->
    <div class="diamond diamond-right"></div>

    <!-- Bottom diamond -->
    <div class="diamond diamond-bottom"></div>

    <!-- Central scrollable image area -->
    <div class="image-container">
        <img src={imageUrl} alt="Scrollable content" />
    </div>
</div>

<style>
    .container {
        position: relative;
        width: 889px;
        height: 750px;
        flex-shrink: 0;
        border: 1px solid #574E49;
        background: #363636;
        margin: 20px auto;
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

    .diamond-top {
        top: -11px;
        left: 50%;
        transform: translateX(-50%) rotate(-45deg);
    }

    .diamond-bottom {
        bottom: -11px;
        left: 50%;
        transform: translateX(-50%) rotate(-45deg);
    }

    .diamond-left {
        left: -11px;
        top: 50%;
        transform: translateY(-50%) rotate(-45deg);
    }

    .diamond-right {
        right: -11px;
        top: 50%;
        transform: translateY(-50%) rotate(-45deg);
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
    }

    /* Custom scrollbar styling */
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