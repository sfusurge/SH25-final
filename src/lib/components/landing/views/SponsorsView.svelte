<script>
    import { onMount } from 'svelte';
    import SponsorFrame from "$lib/components/sponsor/SponsorFrame.svelte";
    import companies from "$lib/SponsorList.json";
    let width = '550px';
    let height = '240px';

    function updateSize() {
        if (window.innerWidth >= 768) { // md breakpoint
            width = '400px';
            height = '200px';
        } else {
            width = '350px';
            height = '140px';
        }
    }

    onMount(() => {
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    });

</script>

<div class="w-full h-screen overflow-y-auto py-8 ">
    <div class="flex flex-col items-center gap-6 w-full max-w-[680px] mx-auto">
        <h1 class="header top-0 bg-inherit z-10 py-4">
            Our Sponsors
        </h1>

        <div class="flex">
            <div class="flex flex-col gap-4 w-full">
                {#each companies.monetary.gold as company}
                    <SponsorFrame
                            height={height}
                            width={width}
                            src={company.picture}
                            alt={company.name}
                            href={company.link}
                            padding={company.padding}
                    />
                {/each}
            </div>

        </div>

        <div class="flex">
            <div class="grid grid-cols-1 md:grid-cols-2 items-center gap-x-15 gap-y-10 w-full">
                {#each companies.monetary.platinum as company}
                    <SponsorFrame
                            height="140px"
                            width="330px"
                            src={company.picture}
                            alt={company.name}
                            href={company.link}
                            padding={company.padding}
                    />
                {/each}
            </div>
        </div>

        <div class="flex">
            <div class="grid grid-cols-1 md:grid-cols-3 items-center gap-10 w-full">
                {#each companies.monetary.bronze as company}
                    {#if company.name.toLowerCase() !== 'buffer'}
                        <SponsorFrame
                                height="93px"
                                width="220px"
                                src={company.picture}
                                alt={company.name}
                                href={company.link}
                                padding={company.padding}
                        />
                    {:else}
                        <div class="hidden md:block" style="height:93px; width:220px;"></div>
                    {/if}
                {/each}
            </div>
        </div>

        <h1 class="header top-0 bg-inherit z-10 py-4">
            In-Kind Partners
        </h1>

        <div class="flex">
            <div class="grid grid-cols-1 md:grid-cols-3 items-center gap-6 w-full">
                {#each companies.inKind as company}
                    <SponsorFrame
                            height="93px"
                            width="220px"
                            src={company.picture}
                            alt={company.name}
                            href={company.link}
                            padding={company.padding}
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