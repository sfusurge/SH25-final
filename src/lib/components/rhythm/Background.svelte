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

    const backgroundLoopDuration: number = 160;
    const animationSpeedDifferenceFactor: number = 5;
    const imgType: string = "webp";

    const staticImgNames: string[] = ["sun1", "sun2"];
</script>

<div id="rhythmBg" class="rhythmBg">
    {#each backgrounds as bg, idx}
        {#if !staticImgNames.includes(bg)}
            <div
                class="movingBg"
                style="animation: scroll {backgroundLoopDuration -
                    idx * animationSpeedDifferenceFactor}s linear infinite; z-index: {idx}"
            >
                <img src="/rhythm/{bg}.{imgType}" />
                <img src="/rhythm/{bg}.{imgType}" />
            </div>
        {/if}
    {/each}

    <img src="/rhythm/sun1.webp" alt="" class="static" style="opacity: 0.4;"/>
    <img src="/rhythm/sun2.webp" alt="" class="static" />
</div>

<style>
    .static {
        position: absolute;
        top: 0;
        left: 60%;
        height: 100%;
        transform: translate(-50%, 0);
        width: auto;
        max-width: unset;
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
        transform: translateZ(0);

        overflow: hidden;
    }

    .movingBg {
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: fit-content;

        display: flex;
        flex-direction: row;
    }

    .movingBg > img {
        height: 100%;
        width: auto;
        max-width: unset;
    }

    @keyframes -global-scroll {
        0% {
            transform: translate(-50%, 0);
        }

        100% {
            /* update here to avoid teleporting sprites */
            transform: translate(50%, 0);
        }
    }
</style>
