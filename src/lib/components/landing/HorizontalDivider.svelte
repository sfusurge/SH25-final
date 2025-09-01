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
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;

        width: 100%;
        height: fit-content;
    }

    .divider::before {
        content: "";
        height: 0;
        width: 65px;
        margin: 1rem 0;
        margin-right: 15px;
        flex: 1;
        border-top: 1px solid var(--color-border-s);
    }

    .divider::after {
        content: "";
        position: absolute;
        top: 50%;
        right: 0;
        transform: translate(0, -50%);
        width: 16px;
        height: 16px;
        background-image: url("/assets/swirl.svg");
    }

    .flipped {
        transform: scale(-1, 1);
    }
</style>
