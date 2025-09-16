<script lang="ts">
    import SlideShow from "./SlideShow.svelte";

    interface Props {
        score?: number;
        onRestart?: () => void;
    }

    let { score = 0, onRestart }: Props = $props();

    // TODO: use actual stuff, just used gpt to spew out some random stuff for now
    const endingSlides = [
        {
            imageSrc: "/maze/player_sprites/player_down_neutral.webp", 
            content: `<strong>Congratulations!</strong><br><br>You successfully navigated the maze and completed your adventure! Well done on reaching the exit.`,
        },
    ];
</script>

<SlideShow
    slides={endingSlides}
    title="Maze Complete!"
    show={true}
    onAction={onRestart}
    mode="ending"
    {score}
/>
