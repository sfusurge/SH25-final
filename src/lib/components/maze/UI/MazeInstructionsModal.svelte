<script lang="ts">
    import SlideShow from "./SlideShow.svelte";

    interface Props {
        isRunning?: boolean;
        onStart?: () => void;
        showCloseButton?: boolean;
        onClose?: () => void;
    }

    let { isRunning = false, onStart, showCloseButton = false, onClose }: Props = $props();

    // TODO: use actual stuff, just used gpt to spew out some random stuff for now
    const instructionSlides = [
        {
            imageSrc: "/maze/player_sprites/trap.webp", 
            content:
                "<strong>Welcome to the Maze Adventure!</strong><br><br>Navigate through the maze using the arrow keys or on-screen controls. Your goal is to find the exit while avoiding traps and enemies.",
        },
        {
            imageSrc: "/assets/maze/controller_base.webp", 
            content:
                "<strong>Movement Controls:</strong><br><br>Use <strong>ARROW KEYS</strong> or <strong>WASD</strong> on desktop.<br>On mobile, use the <strong>touch controls</strong> that appear on screen.",
        },
        {
            imageSrc: "/assets/maze/trap.webp",
            content:
                "<strong>Watch out for hazards!</strong><br><br>Avoid traps and enemies as you navigate. Some areas may have special mechanics - explore carefully to find the safest path.",
        },
    ];
</script>

<SlideShow
    slides={instructionSlides}
    title="Maze Instructions"
    show={true}
    onAction={onStart}
    onClose={showCloseButton ? onClose : undefined}
    mode="instructions"
    {isRunning}
/>
