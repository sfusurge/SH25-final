<script lang="ts">
    import HoverEffectButton from "$lib/components/landing/HoverEffectButton.svelte";
    import ExperienceTile from "$lib/components/landing/Sidebar/ExperienceTile.svelte";
    import LockedTile from "$lib/components/landing/Sidebar/LockedTile.svelte";
    import WebtoonTile from "$lib/components/landing/Sidebar/WebtoonTile.svelte";
    import InformationTile from "$lib/components/landing/Sidebar/InformationTile.svelte";
    import { currentView } from '$lib/stores/currentView.js';

    type TileType = 'garden' | 'lofi' | 'webtoon-1' | 'FAQ' | 'partners';

    function handleClick(option: TileType) {
        currentView.set(option);
    }
</script>

<div class={`flex flex-col overflow-y-auto overflow-x-hidden h-full w-full bg-[#0C0C0B] border border-[#574E49] custom-scrollbar`}>
    <div class="flex flex-col justify-center pt-5 pr-6 pl-6 pb-10">
        <div class="pb-6">
            <h1 class="text-header text-sm italic self-stretch leading-normal font-bold">
                Welcome to StormHacks 2025!
            </h1>
            <h3 class="text-textalt text-[12px] italic font-normal leading-normal">
                Join us at SFU Burnaby Campus from October 4th to 5th for StormHacks 2025. This is Western Canada's biggest hackathon, a place where innovators like you can turn their visions into reality.
            </h3>
        </div>

        <HoverEffectButton
                onClick={()=>window.open('https://portal.sfusurge.com', '_blank')}
        >
            Apply Now
        </HoverEffectButton>
    </div>

    <div class="flex flex-col justify-center pt-5 pr-3 pl-6 pb-10 gap-5">
        <h1 class="text-header italic self-stretch leading-normal font-bold">
            Interactive Experiences
        </h1>
        <ExperienceTile
                imageSrc="/assets/experiences/garden.png"
                imageAlt="Stump's Community Garden"
                imageClass="w-full h-32 object-cover p-2"
                className="mt-4"
                onClick={() => handleClick('garden')}
                header="Stump's Community Garden"
                text="Tend to your garden and its visitors, expanding your plant shop's catalogue and handling challenges as they arise."
        />
        <ExperienceTile
                imageSrc="/assets/experiences/lofi.png"
                imageAlt="Lofi Player"
                imageClass="w-full h-32 object-cover p-2"
                className="mt-4"
                onClick={() => handleClick('lofi')}
                header="Lofi Player"
                text="Tend to your garden and its visitors, expanding your plant shop's catalogue and handling challenges as they arise."
        />
        <LockedTile release="Releases [09/15/2025]"/>
        <LockedTile release="Releases [10/04/2025]"/>
    </div>

    <div class="flex flex-col justify-center pt-5 pr-3 pl-6 pb-10 gap-5">
        <h1 class="text-header italic self-stretch leading-normal font-bold">
            WebToon Series
        </h1>
        <WebtoonTile
                imageSrc="/assets/ig.svg"
                imageAlt="[Ch 1] Together"
                imageClass="h-[35px] w-[35px] object-cover p-2 header header-[#D9D9D9]"
                className="mt-4"
                onClick={() => handleClick('webtoon-1')}
                header="[Ch 1] Together"
                text="Stormy and Sparky embark on an adventure, meeting a new friend called Scummy."
        />
        <LockedTile release="Releases [09/15/2025]"/>
        <LockedTile release="Releases [09/22/2025]"/>
        <LockedTile release="Releases [09/29/2025]"/>
        <LockedTile release="Releases [10/04/2025]"/>
    </div>

    <div class="flex flex-col justify-center pt-5 pr-3 pl-6 pb-10 gap-5">
        <h1 class="text-header italic self-stretch leading-normal font-bold">
            Information
        </h1>
        <InformationTile
                className="p-2"
                onClick={() => handleClick('FAQ')}
                header="Frequently Asked Questions"
                text="Confused about anything related to StormHacks? Check out our curated list of questions and answers."
        />
        <InformationTile
                className="p-2"
                onClick={() => handleClick('partners')}
                header="Our Partners"
                text="Take a look at the amazing organizations that helped make StormHacks 2025 a reality."/>
        <LockedTile release="Coming Soon..."/>
    </div>

</div>


<style>
    .custom-scrollbar::-webkit-scrollbar {
        width: 1px;
    }

    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: #5C4B48;
        border-radius: 1px;
        height: 5px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background-color: #6b5855;
    }

    .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: #5C4B48 transparent;
    }
</style>