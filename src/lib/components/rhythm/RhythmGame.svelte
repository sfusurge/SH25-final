<script lang="ts">
    import { RhythmRenderer } from "$lib/components/rhythm/RhythmRenderer.svelte";
    import Background from "$lib/components/rhythm/Background.svelte";
    import ScalableFrame from "$lib/components/maze/UI/ScalableFrame.svelte";

    let canvas: HTMLCanvasElement | undefined;

    const renderer = $derived.by(() => {
        if (!canvas) {
            return undefined;
        }
        return new RhythmRenderer(canvas);
    });

    $effect(() => {
        renderer;
    });

    // onMount(() => {
    //     new RhythmRenderer(canvas!);
    // })

    // onMount(() => {
    //     let ctx = canvas!.getContext("2d");
    //     var cntx:CanvasRenderingContext2D;
    //     if(ctx == null){
    //         return;
    //     }
    //     cntx = ctx!;

    //     let testSong =
    //     `
    //     test
    //     1
    //     0, 50
    //     0, 75
    //     0, 100
    //     1, 100
    //     2, 100
    //     `

    //     let beatMap =
    //     `0, 2500
    //     0, 5000
    //     0, 5500
    //     1, 6000
    //     2, 6000`
    //     let beatsList = beatMap.split("\n")

    //     let cloudSprites = ["red clouds", "green clouds", "yellow clouds"]
    //     const trackPositions = [0.625, 0.725, 0.825]

    //     TrackSetup();

    //     function TrackSetup(){
    //         cntx.fillStyle = "black";
    //         cntx.globalAlpha = 0.4;
    //         cntx.fillRect(xStd(0.1), yStd(0.58), xStd(0.8), yStd(0.37));

    //         const trackWidth = 0.065;
    //         const trackLength = 0.75;
    //         const xPos = 0.125;

    //         cntx.strokeStyle = "white";
    //         cntx.lineWidth = 1.5;
    //         trackPositions.forEach(yPos => {
    //             cntx.globalAlpha = 0.4;
    //             cntx.fillRect(xStd(xPos), yStd(yPos), xStd(trackLength), yStd(trackWidth));

    //             cntx.globalAlpha = 1;
    //             cntx.strokeRect(xStd(xPos), yStd(yPos), xStd(trackLength), yStd(trackWidth));
    //         });

    //         const btnPos = 0.75;
    //         const btnColors = ["FF9D9D", "DFFFBE", "F9E8A5"]
    //         trackPositions.forEach((yPos, i) => {
    //             cntx.beginPath();
    //             cntx.lineWidth = 0.1;
    //             cntx.arc(xStd(btnPos), yStd(yPos + trackWidth / 2), yStd(trackWidth/2 - .01), 0, 2 * Math.PI);
    //             cntx.fillStyle = "#" + btnColors[i];
    //             cntx.fill();
    //             cntx.stroke();
    //         });

    //         feedTrack(0)
    //     }

    //     const runtimeMS = 500;

    //     function feedTrack(note:number){
    //         let data:string[] = beatsList[note].split(", ");
    //         let trackNo:number = parseInt(data[0]);
    //         let duration:number = parseInt(data[1]);
    //         if(note != 0){
    //             duration -= parseInt(beatsList[note - 1].split(", ")[1]);
    //         }
    //         setTimeout(() => {
    //             let cloud = new Image();
    //             cloud.src = `/rhythm/${cloudSprites[trackNo]}.webp`;
    //             spawnCloud(trackNo, cloud)
    //             feedTrack(note + 1)
    //         }, duration)
    //     }

    //     function spawnCloud(track: number, sprite: HTMLImageElement){
    //         const startPos = 0.2;
    //         const finalPos = 0.75;
    //         const animFrames = 50;
    //         var cPosition = startPos;
    //         const cloudObj = setInterval(() => {
    //             cntx.drawImage(sprite, xStd(cPosition), yStd(trackPositions[track]));
    //             cPosition += (finalPos - startPos) / animFrames
    //             if(cPosition > finalPos){
    //                 clearInterval(cloudObj);
    //             }
    //         }, runtimeMS / animFrames);
    //     }
    // });

    //all props are rendered based on a certain aspect ratio
    // function xStd(size: number){
    //     return size * innerWidth
    // }

    // function yStd(size: number){
    //     return size * innerHeight * 1.2
    // }
</script>

<ScalableFrame style="flex:1;">
    <Background />
    <canvas tabindex="1" bind:this={canvas} ></canvas>
</ScalableFrame>

<style>
    canvas {
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
    }
</style>
