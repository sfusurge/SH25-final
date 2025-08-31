<script lang="ts">
    import { Vector2 } from "$lib/Vector2";

    interface Props {
        onmove?: (input: Vector2) => void;
    }

    let { onmove }: Props = $props();

    let joystickContainer: HTMLDivElement;
    let joystickKnob: HTMLDivElement;
    let isDragging = false;
    let touchId: number | null = null;

    const joystickRadius = 48;
    const knobRadius = 20;

    let joystickCenter = { x: 0, y: 0 };
    let currentInput = Vector2.ZERO;

    function updateJoystickCenter() {
        if (joystickContainer) {
            const rect = joystickContainer.getBoundingClientRect();
            joystickCenter = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
            };
        }
    }

    function handleStart(clientX: number, clientY: number, id?: number) {
        updateJoystickCenter();
        isDragging = true;
        touchId = id ?? null;
        handleMove(clientX, clientY);
    }

    function handleMove(clientX: number, clientY: number) {
        if (!isDragging) return;

        const deltaX = clientX - joystickCenter.x;
        const deltaY = clientY - joystickCenter.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        const maxDistance = joystickRadius - knobRadius;
        const clampedDistance = Math.min(distance, maxDistance);

        let normalizedX = 0;
        let normalizedY = 0;

        if (distance > 0) {
            normalizedX = (deltaX / distance) * clampedDistance;
            normalizedY = (deltaY / distance) * clampedDistance;
        }

        // Update knob position
        if (joystickKnob) {
            joystickKnob.style.transform = `translate(-50%, -50%) translate(${normalizedX}px, ${normalizedY}px)`;
        }

        // Calculate input vector: [-1, 1]
        currentInput = new Vector2(
            clampedDistance > 0 ? normalizedX / maxDistance : 0,
            clampedDistance > 0 ? normalizedY / maxDistance : 0,
        );

        onmove?.(currentInput);
    }

    function handleEnd() {
        if (!isDragging) return;

        isDragging = false;
        touchId = null;

        // Reset knob position
        if (joystickKnob) {
            joystickKnob.style.transform = "translate(-50%, -50%)";
        }

        currentInput = Vector2.ZERO;
        onmove?.(currentInput);
    }

    // Mouse events
    function onMouseDown(event: MouseEvent) {
        handleStart(event.clientX, event.clientY);
    }

    function onMouseMove(event: MouseEvent) {
        handleMove(event.clientX, event.clientY);
    }

    function onMouseUp() {
        handleEnd();
    }

    // Touch events
    function onTouchStart(event: TouchEvent) {
        const touch = event.touches[0];
        if (touch) {
            handleStart(touch.clientX, touch.clientY, touch.identifier);
        }
    }

    function onTouchMove(event: TouchEvent) {
        if (touchId !== null) {
            const touch = Array.from(event.touches).find((t) => t.identifier === touchId);
            if (touch) {
                handleMove(touch.clientX, touch.clientY);
            }
        }
    }

    function onTouchEnd(event: TouchEvent) {
        if (touchId !== null) {
            const touch = Array.from(event.changedTouches).find((t) => t.identifier === touchId);
            if (touch) {
                handleEnd();
            }
        }
    }
</script>

<svelte:window
    onmousemove={onMouseMove}
    onmouseup={onMouseUp}
    ontouchmove={onTouchMove}
    ontouchend={onTouchEnd}
/>

<div
    class="joystick-container"
    bind:this={joystickContainer}
    onmousedown={onMouseDown}
    ontouchstart={onTouchStart}
    style="--joystick-size: {joystickRadius * 2}px; --knob-size: {knobRadius * 2}px;"
    role="button"
    tabindex="0"
    aria-label="joystick for player movement"
>
    <div class="joystick-base">
        <div class="joystick-knob" bind:this={joystickKnob}></div>
    </div>
</div>

<style>
    .joystick-container {
        position: relative;
        width: var(--joystick-size);
        height: var(--joystick-size);
        user-select: none;
        touch-action: none;
        opacity: 0.7;
    }

    .joystick-base {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: url("/maze/controller_base.webp");
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        box-sizing: border-box;
    }

    .joystick-knob {
        position: relative;
        top: 50%;
        left: 50%;
        width: var(--knob-size);
        height: var(--knob-size);
        background-image: url("/maze/controller_knob.webp");
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        transform: translate(-50%, -50%);
        transition: transform 0.1s ease-out;
        box-sizing: border-box;
        pointer-events: none;
    }

    .joystick-container:active .joystick-knob {
        transition: none;
    }
</style>
