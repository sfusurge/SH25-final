import { debug, MazeGame } from "$lib/components/maze/MazeGameRenderer.svelte";
import type { Vector2 } from "$lib/Vector2";
import { onDestroy, onMount } from "svelte";
import { GameState } from "$lib/components/maze/MazeGameState.svelte.ts";

export class MazeBackgroundController {
    canvas = $state<HTMLCanvasElement>();
    canvasContainer = $state<HTMLDivElement>();
    gameRenderer = $state<MazeGame>();

    // Make canvas responsive
    canvasWidth = $state(600);
    canvasHeight = $state(600);

    private cleanupClickListener?: () => void;

    constructor() {
        onMount(() => {
            this.initializeCanvas();
        });

        onDestroy(() => {
            this.cleanup();
        });
    }

    private initializeCanvas() {
        if (this.canvas && this.canvasContainer) {
            // Set up ResizeObserver to handle container size changes
            const resizeObserver = new ResizeObserver(() => {
                this.updateCanvasSize();
            });
            resizeObserver.observe(this.canvasContainer);

            // Set up window resize listener
            window.addEventListener("resize", this.updateCanvasSize);

            // pause game on outside click
            const handleOutsideClick = (event: MouseEvent) => {
                if (!GameState.isGameRunning || GameState.paused) {
                    return;
                }

                // Don't pause on small screens where pause button is not visible
                if (window.innerWidth < 640) {
                    return;
                }

                const target = event.target as Element;

                if (this.canvasContainer?.contains(target)) {
                    return;
                }

                let element = target;
                while (element && element !== document.body) {
                    if (element.hasAttribute && element.hasAttribute("data-maze-ui")) {
                        return;
                    }
                    element = element.parentElement as Element;
                }

                GameState.pauseGame();
            };

            document.addEventListener("click", handleOutsideClick);

            // Store cleanup function
            this.cleanupClickListener = () => {
                document.removeEventListener("click", handleOutsideClick);
            };

            // Initial canvas sizing (wait for next tick to ensure DOM is ready)
            setTimeout(() => {
                this.updateCanvasSize();

                // Initialize game controller after canvas is properly sized
                if (this.canvas) {
                    this.gameRenderer = new MazeGame(this.canvas);
                    GameState.setGameCanvas(this.canvas);
                }
            }, 200);
        }
    }

    public updateCanvasSize = () => {
        if (!this.canvasContainer || !this.canvas) return;

        // Measure container (may briefly report 0 during layout thrash)
        const { width: rawWidth, height: rawHeight } = this.canvasContainer.getBoundingClientRect();
        const displayWidth = Math.floor(rawWidth);
        const displayHeight = Math.floor(rawHeight);

        // Skip updates when the container is collapsed; retry on next frame
        if (displayWidth <= 0 || displayHeight <= 0) {
            requestAnimationFrame(() => this.updateCanvasSize());
            return;
        }

        // Use device pixel ratio for sharp rendering on high-DPI displays
        const dpr = window.devicePixelRatio || 1;
        const internalWidth = Math.round(displayWidth * dpr);
        const internalHeight = Math.round(displayHeight * dpr);


        // Ignore redundant updates
        if (internalWidth === this.canvasWidth && internalHeight === this.canvasHeight) {
            return;
        }

        this.canvasWidth = internalWidth;
        this.canvasHeight = internalHeight;

        // Update the canvas resolution and CSS size
        this.canvas.width = internalWidth;
        this.canvas.height = internalHeight;
        this.canvas.style.width = `${displayWidth}px`;
        this.canvas.style.height = `${displayHeight}px`;

        if (this.gameRenderer) {
            this.gameRenderer.handleCanvasResize(internalWidth, internalHeight);
        }
    };

    handleMoveInput = (input: Vector2) => {
        if (this.gameRenderer) {
            this.gameRenderer.setJoystickInput(input);
        }
    };

    handleShootInput = (input: Vector2) => {
        if (this.gameRenderer) {
            this.gameRenderer.setShootingJoystickInput(input);
        }
    };

    get showTouchController(): boolean {
        if (!this.gameRenderer) {
            return false;
        }

        const hasTouchCapability = 'ontouchstart' in window;
        const isVerySmallScreen = window.innerWidth < 640;
        const isTouchDevice = hasTouchCapability || (isVerySmallScreen && navigator.maxTouchPoints > 0);

        return isTouchDevice && this.gameRenderer.mobileMode;
    }

    private cleanup() {
        // TODO destroy MazeGame controller and unmount all related event listners.
        window.removeEventListener("resize", this.updateCanvasSize);

        if (this.cleanupClickListener) {
            this.cleanupClickListener();
        }
    }
}
