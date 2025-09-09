<script>
    import SponsorFrame from "$lib/components/sponsor/SponsorFrame.svelte";

    import companies from "$lib/SponsorList.json";
</script>

<div class="w-full h-screen overflow-y-auto pt-8 ">
    <div class="flex flex-col items-center gap-4">
        <h1 class="header top-0 bg-inherit z-10 py-4">
            Our Sponsors
        </h1>

        <div class="flex">
            <div class="flex flex-col items-center justify-center gap-4 w-full">
                {#each companies.monetary.gold as company}
                    <SponsorFrame
                            height="240px"
                            width="550px"
                            src={company.picture}
                            alt={company.name}
                            href={company.link}
                    />
                {/each}
            </div>
        </div>

        <div class="flex">
            <div class="grid grid-cols-2 items-center gap-4 w-full">
                {#each companies.monetary.platinum as company}
                    <SponsorFrame
                            height="140px"
                            width="330px"
                            src={company.picture}
                            alt={company.name}
                            href={company.link}
                    />
                {/each}
            </div>
        </div>

        <div class="flex">
            <div class="grid grid-cols-3 items-center gap-4 w-full">
                {#each companies.monetary.bronze as company}
                    <SponsorFrame
                            height="93px"
                            width="220px"
                            src={company.picture}
                            alt={company.name}
                            href={company.link}
                    />
                {/each}
            </div>
        </div>

        <h1 class="header top-0 bg-inherit z-10 py-4">
            In-Kind Partners
        </h1>

        <div class="flex">
            <div class="grid grid-cols-3 items-center gap-4 w-full">
                {#each companies.inKind as company}
                    <SponsorFrame
                            height="93px"
                            width="220px"
                            src={company.picture}
                            alt={company.name}
                            href={company.link}
                    />
                {/each}
            </div>
        </div>
    </div>
</div>

<style>
    .header {
        color: #F1ECEB;
        text-align: center;
        font-size: 24px;
        font-style: italic;
        font-weight: 700;
        line-height: normal;
    }
</style>