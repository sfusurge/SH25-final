<!-- @migration-task Error while migrating Svelte code: Can't migrate code with afterUpdate. Please migrate by hand. -->
<script>
    export let text = '';
    export let className = '';

    const speed = 40;
    const pauseDuration = 1500;

    let containerRef;
    let textRef;
    let shouldScroll = false;
    let translateX = 0;
    let animationRef = null;
    let isAnimating = false;

    function setupScrolling() {
        if (!containerRef || !textRef) {
            console.log('Refs not ready');
            return;
        }

        // Stop any existing animation
        if (animationRef) {
            cancelAnimationFrame(animationRef);
            animationRef = null;
            isAnimating = false;
        }
        const containerWidth = containerRef.offsetWidth;
        const textWidth = textRef.scrollWidth;

        const needsScrolling = textWidth > containerWidth;
        shouldScroll = needsScrolling;

        if (!needsScrolling) {
            translateX = 0;
            return;
        }

        const maxScroll = textWidth - containerWidth;
        let currentPosition = 0;
        let direction = 1;
        let lastTime = Date.now();
        let pauseEndTime = Date.now() + pauseDuration;
        isAnimating = true;

        const animate = () => {
            if (!isAnimating) return;

            const now = Date.now();
            const deltaTime = now - lastTime;
            lastTime = now;

            if (pauseEndTime > now) {
                animationRef = requestAnimationFrame(animate);
                return;
            }

            const moveDistance = (speed * deltaTime) / 1000;
            currentPosition += moveDistance * direction;

            if (currentPosition >= maxScroll) {
                currentPosition = maxScroll;
                direction = -1;
                pauseEndTime = now + pauseDuration;
            } else if (currentPosition <= 0) {
                currentPosition = 0;
                direction = 1;
                pauseEndTime = now + pauseDuration;
            }

            translateX = -currentPosition;
            animationRef = requestAnimationFrame(animate);
        };

        // Start animation after initial pause
        animationRef = requestAnimationFrame(animate);
    }

    // Use afterUpdate to ensure DOM is ready
    import { afterUpdate, onDestroy, onMount } from 'svelte';

    let mounted = false;

    onMount(() => {
        mounted = true;
    });

    afterUpdate(() => {
        if (mounted && text && containerRef && textRef) {
            // Use setTimeout to ensure layout is complete
            setTimeout(setupScrolling, 0);
        }
    });

    // Handle component cleanup
    onDestroy(() => {
        isAnimating = false;
        if (animationRef) {
            cancelAnimationFrame(animationRef);
        }
    });

    // Reactive statement for text changes
    $: if (mounted && text) {
        // Reset position when text changes
        translateX = 0;
        setTimeout(setupScrolling, 100);
    }
</script>

<div
        bind:this={containerRef}
        class="overflow-hidden {className}"
        style="width: 100%; position: relative;"
>
    <div
            bind:this={textRef}
            class="whitespace-nowrap"
            style="transform: translateX({translateX}px); transition: none; display: inline-block;"
    >
        {text}
    </div>
</div>