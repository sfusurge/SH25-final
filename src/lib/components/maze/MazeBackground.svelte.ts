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
            }, 0);
        }
    }

    private updateCanvasSize = () => {
        if (!this.canvasContainer || !this.canvas) return;

        // Get the actual display size of the container
        const containerRect = this.canvasContainer.getBoundingClientRect();
        const displayWidth = containerRect.width;
        const displayHeight = containerRect.height;

        // Use device pixel ratio for sharp rendering on high-DPI displays
        const dpr = window.devicePixelRatio || 1;

        // Set the internal canvas resolution (accounts for device pixel ratio)
        const internalWidth = displayWidth * dpr;
        const internalHeight = displayHeight * dpr;

        // Update our state variables
        this.canvasWidth = internalWidth;
        this.canvasHeight = internalHeight;

        // Set the canvas internal resolution
        this.canvas.width = internalWidth;
        this.canvas.height = internalHeight;

        // Scale the canvas back down using CSS to account for device pixel ratio
        this.canvas.style.width = displayWidth + "px";
        this.canvas.style.height = displayHeight + "px";

        // Notify the game controller about the size change
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
        return !!(this.gameRenderer && this.gameRenderer.mobileMode);
    }

    private cleanup() {
        // TODO destroy MazeGame controller and unmount all related event listners.
        window.removeEventListener("resize", this.updateCanvasSize);

        if (this.cleanupClickListener) {
            this.cleanupClickListener();
        }
    }
}
