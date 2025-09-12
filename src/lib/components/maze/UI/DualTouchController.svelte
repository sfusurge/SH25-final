<script lang="ts">
    import { Vector2 } from "$lib/Vector2";

    interface Props {
        onMoveInput?: (input: Vector2) => void;
        onShootInput?: (input: Vector2) => void;
        canvasElement?: HTMLElement;
    }

    let { onMoveInput, onShootInput, canvasElement }: Props = $props();

    // Touch tracking
    let leftTouch: { id: number; startX: number; startY: number; currentInput: Vector2 } | null =
        null;
    let rightTouch: { id: number; startX: number; startY: number; currentInput: Vector2 } | null =
        null;

    // Visual joystick elements
    let leftJoystick: HTMLDivElement | undefined = $state();
    let rightJoystick: HTMLDivElement | undefined = $state();
    let leftKnob: HTMLDivElement | undefined = $state();
    let rightKnob: HTMLDivElement | undefined = $state();

    const joystickRadius = 48;
    const knobRadius = 20;
    const maxDistance = joystickRadius - knobRadius;

    function getScreenSide(clientX: number): "left" | "right" {
        const screenMidpoint = window.innerWidth / 2;
        return clientX < screenMidpoint ? "left" : "right";
    }

    function updateJoystickPosition(
        side: "left" | "right",
        clientX: number,
        clientY: number,
        startX: number,
        startY: number
    ) {
        const deltaX = clientX - startX;
        const deltaY = clientY - startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        const clampedDistance = Math.min(distance, maxDistance);

        let normalizedX = 0;
        let normalizedY = 0;

        if (distance > 0) {
            normalizedX = (deltaX / distance) * clampedDistance;
            normalizedY = (deltaY / distance) * clampedDistance;
        }

        // Update visual knob position
        const knob = side === "left" ? leftKnob : rightKnob;
        if (knob) {
            knob.style.transform = `translate(-50%, -50%) translate(${normalizedX}px, ${normalizedY}px)`;
        }

        // Calculate input vector: [-1, 1]
        const inputVector = new Vector2(
            clampedDistance > 0 ? normalizedX / maxDistance : 0,
            clampedDistance > 0 ? normalizedY / maxDistance : 0
        );

        // Send input to appropriate handler
        if (side === "left") {
            onMoveInput?.(inputVector);
            if (leftTouch) {
                leftTouch.currentInput = inputVector;
            }
        } else {
            onShootInput?.(inputVector);
            if (rightTouch) {
                rightTouch.currentInput = inputVector;
            }
        }
    }

    function positionJoystick(side: "left" | "right", clientX: number, clientY: number) {
        const joystick = side === "left" ? leftJoystick : rightJoystick;
        if (!joystick || !canvasElement) return;

        const canvasRect = canvasElement.getBoundingClientRect();

        // Position joystick relative to canvas
        const relativeX = clientX - canvasRect.left - joystickRadius;
        const relativeY = clientY - canvasRect.top - joystickRadius;

        // Clamp to canvas bounds
        const clampedX = Math.max(
            10,
            Math.min(canvasRect.width - joystickRadius * 2 - 10, relativeX)
        );
        const clampedY = Math.max(
            10,
            Math.min(canvasRect.height - joystickRadius * 2 - 10, relativeY)
        );

        joystick.style.left = `${clampedX}px`;
        joystick.style.top = `${clampedY}px`;
        joystick.style.display = "block";
    }

    function hideJoystick(side: "left" | "right") {
        const joystick = side === "left" ? leftJoystick : rightJoystick;
        const knob = side === "left" ? leftKnob : rightKnob;

        if (joystick) {
            joystick.style.display = "none";
        }

        if (knob) {
            knob.style.transform = "translate(-50%, -50%)";
        }

        // Reset input
        if (side === "left") {
            onMoveInput?.(Vector2.ZERO);
        } else {
            onShootInput?.(Vector2.ZERO);
        }
    }

    function handleTouchStart(event: TouchEvent) {
        event.preventDefault();

        for (const touch of Array.from(event.changedTouches)) {
            const side = getScreenSide(touch.clientX);

            // Only allow one touch per side
            if (side === "left" && !leftTouch) {
                leftTouch = {
                    id: touch.identifier,
                    startX: touch.clientX,
                    startY: touch.clientY,
                    currentInput: Vector2.ZERO,
                };
                positionJoystick("left", touch.clientX, touch.clientY);
                updateJoystickPosition(
                    "left",
                    touch.clientX,
                    touch.clientY,
                    touch.clientX,
                    touch.clientY
                );
            } else if (side === "right" && !rightTouch) {
                rightTouch = {
                    id: touch.identifier,
                    startX: touch.clientX,
                    startY: touch.clientY,
                    currentInput: Vector2.ZERO,
                };
                positionJoystick("right", touch.clientX, touch.clientY);
                updateJoystickPosition(
                    "right",
                    touch.clientX,
                    touch.clientY,
                    touch.clientX,
                    touch.clientY
                );
            }
        }
    }

    function handleTouchMove(event: TouchEvent) {
        event.preventDefault();

        for (const touch of Array.from(event.touches)) {
            if (leftTouch && touch.identifier === leftTouch.id) {
                updateJoystickPosition(
                    "left",
                    touch.clientX,
                    touch.clientY,
                    leftTouch.startX,
                    leftTouch.startY
                );
            } else if (rightTouch && touch.identifier === rightTouch.id) {
                updateJoystickPosition(
                    "right",
                    touch.clientX,
                    touch.clientY,
                    rightTouch.startX,
                    rightTouch.startY
                );
            }
        }
    }

    function handleTouchEnd(event: TouchEvent) {
        event.preventDefault();

        for (const touch of Array.from(event.changedTouches)) {
            if (leftTouch && touch.identifier === leftTouch.id) {
                leftTouch = null;
                hideJoystick("left");
            } else if (rightTouch && touch.identifier === rightTouch.id) {
                rightTouch = null;
                hideJoystick("right");
            }
        }
    }
</script>

<!-- Touch event handler overlay -->
{#if canvasElement}
    <div
        class="touch-overlay"
        data-maze-ui
        ontouchstart={handleTouchStart}
        ontouchmove={handleTouchMove}
        ontouchend={handleTouchEnd}
        ontouchcancel={handleTouchEnd}
    >
        <!-- Left joystick -->
        <div class="joystick" bind:this={leftJoystick}>
            <div class="joystick-base">
                <div class="joystick-knob" bind:this={leftKnob}></div>
            </div>
        </div>

        <!-- Right joystick -->
        <div class="joystick" bind:this={rightJoystick}>
            <div class="joystick-base">
                <div class="joystick-knob" bind:this={rightKnob}></div>
            </div>
        </div>
    </div>
{/if}

<style>
    .touch-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: auto;
        z-index: 1000;
        touch-action: none;
    }

    .joystick {
        position: absolute;
        width: 96px; /* joystickRadius * 2 */
        height: 96px;
        display: none;
        pointer-events: none;
        opacity: 0.8;
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
        width: 40px; /* knobRadius * 2 */
        height: 40px;
        background-image: url("/maze/controller_knob.webp");
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        transform: translate(-50%, -50%);
        transition: transform 0.1s ease-out;
        box-sizing: border-box;
    }

    .joystick:active .joystick-knob {
        transition: none;
    }
</style>
