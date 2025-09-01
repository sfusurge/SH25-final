<div class="horizontal-divider">
    <div class="divider" data-demon="border"></div>
    <div class="divider flipped" data-demon="border"></div>
</div>

<style>
    .horizontal-divider {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-around;
        width: 100%;
    }

    .divider {
        flex: 1;
        height: 1px;
        background: var(--border);
    }

    .divider.flipped {
        transform: scale(-1, 1);
    }
</style>