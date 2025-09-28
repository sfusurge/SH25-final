<script lang="ts">
    // order of which elements should appear, from back -> front
    const backgrounds = [
        [
            {
                src: "skydetail.webp",
                extraCss: "height: 100%;",
            },
            {
                src: "skydetail.webp",
                extraCss: "height: 100%; left: 100%;",
            },
        ],
        [
            {
                src: "cloud1.1.webp",
                extraCss: "height:55%; top:unset; bottom: 0; left: 100px;",
            },
            {
                src: "cloud1.2.webp",
                extraCss: "height:100%; top:unset; bottom: 0; left: 700px;",
            },
        ],

        [
            {
                src: "pillar3.1.webp",
                extraCss: "top:unset; bottom: 0; left: 800px; height: 50%;",
            },
            {
                src: "pillar3.2.webp",
                extraCss: "top:unset; bottom: 0; left: 1800px; height: 70%;",
            },
        ],

        [
            {
                src: "cloud5.webp",
                extraCss: "top:unset; bottom: 0; left: 600px; height: 10%;",
            },
        ],
        [
            {
                src: "cloud6.webp",
                extraCss: "top:unset; bottom: 0; left: 900px; height: 20%;",
            },
        ],
        [
            {
                src: "pillar2.1.webp",
                extraCss: "top: unset; bottom: 0; left: 700px;",
            },
            {
                src: "pillar2.2.webp",
                extraCss: "top: unset; bottom: 0; left: 1600px;",
            },
        ],
        [
            {
                src: "cloud4.webp",
                extraCss: " top:unset; height: 20%; bottom: 30%; left: 1200px;",
            },
        ],
        [
            {
                src: "cloud3.1.webp",
                extraCss: "top:unset; height: 45%; bottom: 0; left: 200px;",
            },
            {
                src: "cloud3.2.webp",
                extraCss: " top:25%;  height: 25%;   left: 600px;",
            },
        ],
        [
            {
                src: "cloud2.1.webp",
                extraCss: "height: 15%; top:30% left: 700px;",
            },
            {
                src: "cloud2.2.webp",
                extraCss: "bottom: 0; top:unset; height:45%; left: 1400px;",
            },
        ],
    ];

    const backgroundLoopDuration: number = 80;
    const animationSpeedDifferenceFactor: number = 5;
</script>

<div id="rhythmBg" class="rhythmBg">
    {#each backgrounds as bg, idx}
        {#each bg as imgItem}
            <div
                class="movingBg"
                style="--scrollTime: {backgroundLoopDuration -
                    idx * animationSpeedDifferenceFactor}s; z-index: {idx}; {imgItem.extraCss}"
            >
                <img src="/rhythm/{imgItem.src}" alt="" />
            </div>
        {/each}
    {/each}

    <img src="/rhythm/sun1.webp" alt="" class="static" style="opacity: 0.4;" />
    <img src="/rhythm/sun2.webp" alt="" class="static" />
</div>

<style>
    .static {
        position: absolute;
        top: 0;
        left: 50%;
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
        width: 1800px;

        display: flex;
        flex-direction: row;
        will-change: transform;
        animation: scroll var(--scrollTime) linear infinite;
        z-index: var(--zidx);
    }

    .movingBg > img {
        height: 100%;
        width: auto;
        max-width: unset;
    }

    img {
        transform: translate(0, 0, 0);
    }

    @keyframes scroll {
        0% {
            transform: translate3d(-100%, 0, 0);
        }

        100% {
            transform: translate3d(10%, 0, 0);
        }
    }
</style>
