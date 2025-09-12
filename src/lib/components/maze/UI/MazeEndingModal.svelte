<script lang="ts">
    export let score: number = 0;
    export let onRestart: (() => void) | undefined;
</script>

<div class="modal-backdrop" data-maze-ui>
    <div class="modal">
        <div class="content">
            <div class="inner">
                <div class="header">
                    <h2 class="title">Game Over!</h2>
                    <div class="score-display">
                        <img
                            src="/assets/experiences/leaf/ending_modal/final_leaf.png"
                            alt="Leaf"
                            class="leaf-icon"
                        />
                        <span class="score-text">{score}</span>
                    </div>
                </div>
                <div class="image-container">
                    <img
                        src="/assets/experiences/leaf/ending_modal/image.png"
                        alt="Success"
                        class="success-image"
                    />
                </div>
                <div class="message">
                    you reached the end wow
                </div>
                <button class="restart-btn" type="button" on:click={onRestart}>Play Again</button>
            </div>
        </div>
    </div>
</div>

<style>
    .modal-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: block;
        z-index: 10000; /* Highest priority - above all game elements */
    }
    .modal {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 50%;
        height: 77%;
        background: url("/assets/experiences/leaf/modal_bg.png") center / 100% 100% no-repeat;
        border-radius: 0;
        padding: 0;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
        text-align: left;
        overflow: hidden;
    }
    .content {
        padding: 5cqh 3cqw;
        box-sizing: border-box;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .inner {
        width: 100%;
        padding: 0cqh 0cqw;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2.5cqh;
        max-height: 100%;
        overflow: hidden;
    }
    .header {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5cqh;
        width: 100%;
    }
    .title {
        margin: 0;
        color: #f1eceb;
        text-align: center;
        font-family: var(--font-catriel);
        font-size: 2cqw;
        font-style: italic;
        font-weight: 5900;
        line-height: normal;
    }
    .score-display {
        display: flex;
        align-items: center;
        gap: 0.5cqw;
    }
    .leaf-icon {
        width: 2cqw;
        height: 2cqw;
        object-fit: contain;
    }
    .score-text {
        color: #f1eceb;
        text-align: center;
        font-family: var(--font-catriel);
        font-size: 2cqw;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
    }
    .image-container {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .success-image {
        width: 100%;
        height: auto;
        aspect-ratio: 497 / 267;
        object-fit: contain;
    }
    .message {
        width: 100%;
        color: #8a6f6a;
        font-family: var(--font-catriel);
        font-size: 1.2cqw;
        font-style: normal;
        font-weight: 400;
        line-height: 1.4;
        text-align: center;
    }
    .restart-btn {
        display: flex;
        width: 12cqw;
        height: 2.5cqw;
        padding: 0.2cqw 0.6cqw;
        justify-content: center;
        align-items: center;
        gap: 0.5cqw;
        flex-shrink: 0;
        background: rgba(6, 6, 5, 0.6);
        color: #f1eceb;
        border: 0.643px solid #f1eceb;
        border-radius: 0;
        font-size: 1cqw;
        cursor: pointer;
    }

    @container (max-width: 640px) {
        .modal {
            width: 90%;
            height: 60%;
        }

        .inner {
            width: 90%;
            height: 100%;
        }

        .title {
            font-size: 6cqw;
        }

        .leaf-icon {
            width: 3.5cqw;
            height: 3.5cqw;
            object-fit: contain;
        }

        .score-text {
            font-size: 3.5cqw;
        }

        .score-display {
            gap: 2cqw;
        }

        .success-image {
            width: 100cqw;
        }

        .message {
            font-size: 2.5cqw;
            margin-bottom: -1cqh;
        }

        .restart-btn {
            width: 20cqw;
            height: 4.5cqw;
            font-size: 2cqw;
        }
    }

    @container (max-width: 400px) {
        .modal {
            width: 90%;
            height: 48%;
        }

        .inner {
            width: 90%;
            height: 95%;
        }

        .title {
            font-size: 4cqw;
        }

        .start-btn {
            width: 20cqw;
            height: 4.5cqw;
            font-size: 2cqw;
        }

        .description {
            height: 7cqh;
            padding: 0;
            font-size: 2cqw;
            margin-bottom: -4cqh;
        }

        .nav-btn {
            width: 8cqw;
            height: 8cqw;
            margin: 0 0cqw;
        }

        .pagination-dot {
            width: 1cqw;
            height: 1cqw;
        }

        .pagination {
            gap: 0.6cqw;
        }
    }
</style>
