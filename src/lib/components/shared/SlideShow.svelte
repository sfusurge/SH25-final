<script lang="ts">
    import Dialog from "$lib/components/landing/Audio/Dialog.svelte";
    import HoverEffectButton from "$lib/components/landing/HoverEffectButton.svelte";
    import { global } from "$lib/../routes/+layout.svelte";
    import Diamond from "$lib/components/landing/svgs/Diamond.svelte";

    // Main slide interface
    interface Slide {
        imageSrc: string;
        content: string; // HTML content that can be rendered with {@html}
    }

    interface ActionButton {
        text: string;
        action: () => void;
        className?: string;
    }

    // Game result types for win/lose conditions
    type GameResult = "win" | "lose" | null;

    interface ResultSlidesConfig {
        win?: Slide[];
        lose?: Slide[];
        default?: Slide[]; // fallback or third option idk lol
    }

    interface Props {
        slides: Slide[] | ResultSlidesConfig; // can just use simple array for instructions
        title?: string;
        show?: boolean;
        onClose?: () => void;
        actionButton?: ActionButton;
        showScore?: number; // optional score display
        showCloseButton?: boolean;
        dataMazeUi?: boolean; // for maze, ignore
        gameResult?: GameResult; // determines which slides to show from the config
    }

    let {
        slides,
        title = "Game",
        show = true,
        onClose,
        actionButton,
        showScore,
        showCloseButton = false,
        dataMazeUi = false,
        gameResult = null,
    }: Props = $props();

    // Current slide state
    let currentSlideIndex = $state(0);

    const slidesToDisplay = $derived.by(() => {
        if (Array.isArray(slides)) {
            return slides;
        }

        const config = slides as ResultSlidesConfig;
        if (gameResult === "win" && config.win) {
            return config.win;
        }
        if (gameResult === "lose" && config.lose) {
            return config.lose;
        }
        return config.default || [];
    });

    // Computed properties
    const hasMultipleSlides = $derived(slidesToDisplay.length > 1);
    const currentSlide = $derived(
        slidesToDisplay[currentSlideIndex] || { imageSrc: "", content: "" }
    );

    // Navigation functions
    function nextSlide() {
        if (hasMultipleSlides) {
            currentSlideIndex = (currentSlideIndex + 1) % slidesToDisplay.length;
        }
    }

    function prevSlide() {
        if (hasMultipleSlides) {
            currentSlideIndex =
                currentSlideIndex > 0 ? currentSlideIndex - 1 : slidesToDisplay.length - 1;
        }
    }

    function goToSlide(index: number) {
        currentSlideIndex = index;
    }
</script>

<!-- content -->
<Dialog
    {title}
    {show}
    onClose={showCloseButton ? onClose : undefined}
    mobile={global.mobile}
    offsetDirection={"center"}
    {dataMazeUi}
>
    <div class="slideshow-content" class:data-maze-ui={dataMazeUi}>
        {#if showScore !== undefined}
            <div class="score-display">
                <span class="score-label">Score:</span>
                <span class="score-value">{showScore}</span>
            </div>
        {/if}

        <!-- Main slide image (fixed height) -->
        <div class="slide-image-container">
            {#if currentSlide.imageSrc}
                <img
                    src={currentSlide.imageSrc}
                    alt="Slide {currentSlideIndex + 1}"
                    class="slide-image"
                />
            {/if}
        </div>

        <!-- Slide content -->
        <div class="slide-content">
            {@html currentSlide.content}
        </div>

        <!-- Nav controls (fixed height) -->
        <div class="navigation-controls" class:visible={hasMultipleSlides}>
            <HoverEffectButton onClick={prevSlide} square>←</HoverEffectButton>

            <!-- Pagination dots -->
            <div class="pagination-dots">
                {#if hasMultipleSlides}
                    {#each slidesToDisplay as _, index}
                        <button
                            class="pagination-dot"
                            class:active={index === currentSlideIndex}
                            onclick={() => goToSlide(index)}
                        ></button>
                    {/each}
                {:else}
                    <!-- Reserved space for at least 3 dots -->
                    {#each Array(3) as _, index}
                        <div class="pagination-dot placeholder"></div>
                    {/each}
                {/if}
            </div>

            <HoverEffectButton onClick={nextSlide} square>→</HoverEffectButton>
        </div>

        <!-- Action button -->
        {#if actionButton}
            <div class="action-section">
                <HoverEffectButton
                    onClick={actionButton.action}
                    className={actionButton.className || "action-button"}
                >
                    {actionButton.text}
                </HoverEffectButton>
            </div>
        {/if}
    </div>
</Dialog>

<style>
    .slideshow-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.1rem;
        width: 500px;
        max-height: 50vh;
        height: fit-content;
    }

    .score-display {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1.1rem;
        font-weight: bold;
        color: var(--color-header);
        margin-bottom: 0.5rem;
    }

    .score-value {
        color: var(--color-primary);
    }

    .slide-image-container {
        width: fit-content;
        aspect-ratio: 16/9;
        height: auto;
        height: 150px;
        overflow: auto;
        border-radius: 4px;
        border: 1px solid var(--color-border);
        /* background-color: var(--color-background-secondary, #f5f5f5); */
    }

    .slide-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        display: block;
    }

    .slide-content {
        color: var(--color-text);
        font-size: 0.9rem;
        line-height: 1.4;
        text-align: center;
        max-width: 100%;
        flex: 1;
        padding: 0.2rem 0;
        display: table-cell;
        vertical-align: middle;
    }

    .navigation-controls {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-top: 0.2rem;
        height: 2rem;
        visibility: hidden;
    }

    .navigation-controls.visible {
        visibility: visible;
    }

    .pagination-dots {
        display: flex;
        gap: 0.3rem;
        align-items: center;
        min-width: 80px;
        justify-content: center;
    }

    .pagination-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        border: none;
        background-color: var(--color-border);
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    .pagination-dot.placeholder {
        opacity: 0;
        cursor: default;
    }

    .pagination-dot:hover {
        background-color: var(--color-text);
    }

    .pagination-dot.active {
        background-color: var(--color-primary);
    }

    .action-section {
        margin-top: 0.5rem;
        display: flex;
        justify-content: center;
    }

    /* Custom styling for the action button */
    :global(.action-button) {
        min-width: 120px !important;
        width: auto !important;
        padding: 8px 16px !important;
        white-space: nowrap !important;
        font-size: 14px !important;
    }

    /* tablet(?) specific styling */
    @media (max-width: 1200px) {
        .slideshow-content {
            width: 90vw;
            max-width: 350px;
            gap: 0.2rem;
        }

        .slide-image-container {
            max-width: 280px;
        }

        .slide-content {
            font-size: 0.7rem;
            max-height: 80px;
        }

        .navigation-controls {
            gap: 0.8rem;
        }
    }

     /* Mobile specific styling */
    @media (max-width: 768px) {
        .slideshow-content {
            width: 90vw;
            max-width: 350px;
            gap: 0.2rem;

        }

        .slide-image-container {
            max-width: 280px;
        }

        .slide-content {
            font-size: 0.8rem;
            max-height: 120px;
        }

        .navigation-controls {
            gap: 0.8rem;
        }
    }
</style>
