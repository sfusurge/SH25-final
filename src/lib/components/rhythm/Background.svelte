<script lang="ts">
    // order of which elements should appear, from back -> front
    const backgrounds : string[] = [
        'skydetail', 
        'sun1',
        'pillar3',
        'cloud6',
        'pillar2',
        'cloud5',
        'cloud4',
        'cloud3',
        'sun2',
        'cloud2',
        'pillar1',
        'cloud1'
    ];

    const backgroundLoopDuration:number = 120;
    const animationSpeedDifferenceFactor:number = 5;
    const imgType:string = 'webp';

    const staticImgNames:string[] = ['sun1', 'sun2'];

</script>

<div id="rhythmBg" class="rhythmBg">
    {#each backgrounds as bg, idx}
        <div 
            class="rhythmBg movingBg"
            style="
                background-image: url(/rhythm/{bg}.{imgType});
                {(staticImgNames.includes(bg)) ? `background-position: 45% 0;`
                    : `animation: scroll ${backgroundLoopDuration - idx * animationSpeedDifferenceFactor}s linear infinite;`}"
        ></div>
    {/each}
</div>

<style>
    *{
        --rhythmViewportHeight: 80vh;
    }

    .rhythmBg{
        height: var(--rhythmViewportHeight);
        width: 100vw;
        position: absolute;
    }

    .movingBg{
        background-size:cover;
        background-repeat: repeat-x;
        position: absolute;
    }

    @keyframes -global-scroll {
        0% {
            background-position: 0 0;
        }

        100% {
            background-position: calc(-100% + 99vw) 0;
        }
    }
</style>