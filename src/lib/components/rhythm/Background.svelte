<script lang="ts">
    // order of which elements should appear, from back -> front
    const backgrounds: string[] = [
        "skydetail",
        "sun1",
        "pillar3",
        "cloud6",
        "pillar2",
        "cloud5",
        "cloud4",
        "cloud3",
        "sun2",
        "cloud2",
        "pillar1",
        "cloud1",
    ];

    const backgroundLoopDuration: number = 120;
    const animationSpeedDifferenceFactor: number = 5;
    const imgType: string = "webp";

    const staticImgNames: string[] = ["sun1", "sun2"];
</script>

<div id="rhythmBg" class="rhythmBg">
    {#each backgrounds as bg, idx}
        <div
            class="movingBg"
            class:static={staticImgNames.includes(bg)}
            style="background-image: url(/rhythm/{bg}.{imgType}); animation: scroll {backgroundLoopDuration -
                idx * animationSpeedDifferenceFactor}s linear infinite; z-index:{idx};"
        ></div>
    {/each}
</div>

<style>
    .static {
        background-position: 45% 0;
        animation: none;
    }

    .rhythmBg {
        height: 100%;
        width: 100%;
        position: absolute;
        left: 0;
        top: 0;
        z-index: 0;

        background-color: #aadcff;
    }

    .movingBg {
        position: absolute;
        left:0;
        top: 0;
        width: 100%;
        height: 100%;

        background-size: cover;
        background-repeat: repeat-x;
    }

    @keyframes -global-scroll {
        0% {
            background-position: -50% 0;
        }

        100% {
            /* update here to avoid teleporting sprites */
            background-position: calc(50%) 0;
        }
    }
</style>
