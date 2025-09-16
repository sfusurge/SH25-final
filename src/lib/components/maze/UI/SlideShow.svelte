<script lang="ts">
    import Dialog from "$lib/components/landing/Audio/Dialog.svelte";
    import HoverEffectButton from "$lib/components/landing/HoverEffectButton.svelte";
    import { global } from "../../../../routes/+layout.svelte";

    // Props interface following the suggested structure
    interface Props {
        slides: {
            imageSrc: string;
            content: string; // can render raw html with {@html}
        }[];
        title?: string;
        show?: boolean;
        onClose?: () => void;
        onAction?: () => void; // main action button (Start Game/Play Again)
        actionText?: string; // text for the main action button
        mode?: "instructions" | "ending"; // determines layout and behavior
        score?: number; // for ending modal
        isRunning?: boolean; // for instructions modal - affects action button text
    }

    let {
        slides,
        title = "Maze Game",
        show = true,
        onClose,
        onAction,
        actionText,
        mode = "instructions",
        score,
        isRunning = false,
    }: Props = $props();

    // Current slide state
    let currentSlideIndex = $state(0);

    // Computed properties
    const hasMultipleSlides = $derived(slides.length > 1);
    const currentSlide = $derived(slides[currentSlideIndex] || { imageSrc: "", content: "" });

    // Determine action button text based on mode and state
    const finalActionText = $derived.by(() => {
        if (actionText) return actionText;

        if (mode === "ending") {
            return "Play Again";
        } else {
            return isRunning ? "Continue Game" : "Start Game";
        }
    });

    // Navigation functions
    function nextSlide() {
        if (hasMultipleSlides) {
            currentSlideIndex = (currentSlideIndex + 1) % slides.length;
        }
    }

    function prevSlide() {
        if (hasMultipleSlides) {
            currentSlideIndex = currentSlideIndex > 0 ? currentSlideIndex - 1 : slides.length - 1;
        }
    }

    function goToSlide(index: number) {
        currentSlideIndex = index;
    }
</script>

<Dialog
    {title}
    {show}
    {onClose}
    mobile={global.mobile}
    offsetDirection={global.mobile ? "center" : "center"}
    dataMazeUi={true}
>
    <div class="slideshow-content" data-maze-ui>
        <!-- Score display for ending mode -->
        {#if mode === "ending" && score !== undefined}
            <div class="score-display">
                <span class="score-label">Score:</span>
                <span class="score-value">{score}</span>
            </div>
        {/if}

        <!-- Main slide image -->
        {#if currentSlide.imageSrc}
            <div class="slide-image-container">
                <img
                    src={currentSlide.imageSrc}
                    alt="Slide {currentSlideIndex + 1}"
                    class="slide-image"
                />
            </div>
        {/if}

        <!-- Slide content -->
        <div class="slide-content">
            {@html currentSlide.content}
        </div>

        <!-- Navigation controls (only if multiple slides) -->
        {#if hasMultipleSlides}
            <div class="navigation-controls">
                <HoverEffectButton onClick={prevSlide} square>←</HoverEffectButton>

                <!-- Pagination dots -->
                <div class="pagination-dots">
                    {#each slides as _, index}
                        <button
                            class="pagination-dot"
                            class:active={index === currentSlideIndex}
                            onclick={() => goToSlide(index)}
                        ></button>
                    {/each}
                </div>

                <HoverEffectButton onClick={nextSlide} square>→</HoverEffectButton>
            </div>
        {/if}

        <!-- Action button -->
        <div class="action-section">
            <HoverEffectButton onClick={onAction} className="action-button">
                {finalActionText}
            </HoverEffectButton>
        </div>
    </div>
</Dialog>

<style>
    .slideshow-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        max-width: 400px;
        width: 100%;
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
        width: 100%;
        max-width: 300px;
        aspect-ratio: 16/9;
        overflow: hidden;
        border-radius: 4px;
        border: 1px solid var(--color-border);
    }

    .slide-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }

    .slide-content {
        color: var(--color-text);
        font-size: 0.9rem;
        line-height: 1.4;
        text-align: center;
        max-width: 100%;
    }

    .navigation-controls {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-top: 0.5rem;
    }

    .pagination-dots {
        display: flex;
        gap: 0.3rem;
        align-items: center;
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

    .pagination-dot:hover {
        background-color: var(--color-text);
    }

    .pagination-dot.active {
        background-color: var(--color-primary);
    }

    .action-section {
        margin-top: 1rem;
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

    /* Mobile specific styling */
    @media (max-width: 768px) {
        .slideshow-content {
            max-width: 90vw;
            gap: 0.8rem;
        }

        .slide-image-container {
            max-width: 280px;
        }

        .slide-content {
            font-size: 0.85rem;
        }

        .navigation-controls {
            gap: 0.8rem;
        }
    }
</style>
