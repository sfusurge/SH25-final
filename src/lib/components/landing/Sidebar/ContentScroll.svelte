<script>
    import HoverEffectButton from "$lib/components/landing/HoverEffectButton.svelte";
    import ExperienceTile from "$lib/components/landing/Sidebar/ExperienceTile.svelte";

    function handleClick(option) {
        window.open('https://stormhacks2025.devpost.com/', '_blank');
    }
</script>

<div class={`flex flex-col overflow-y-auto overflow-x-hidden h-full w-full bg-[#0C0C0B] border border-[#574E49] custom-scrollbar`}>
    <div class="flex flex-col justify-center pt-5 pr-6 pl-6 pb-10">
        <div class="pb-6">
            <h1 class="text-header text-sm italic self-stretch leading-normal font-bold">
                Welcome to StormHacks 2025!
            </h1>
            <h3 class="text-textalt text-[12px] italic font-normal leading-normal">
                Join us at SFU Burnaby Campus from October 4th to 5th for StormHacks 2025. This is Western Canada’s biggest hackathon, a place where innovators like you can turn their visions into reality.
            </h3>
        </div>

        <HoverEffectButton> Apply Now</HoverEffectButton>
    </div>

    <div class="flex flex-col justify-center pt-5 pr-6 pl-6 pb-10">
        <h1 class="text-header italic self-stretch leading-normal font-bold">
            Interactive Experiences
        </h1>
        <ExperienceTile
                imageSrc="/assets/experiences/garden.png"
                imageAlt="Stump's Community Garden"
                imageClass="w-full h-32 object-cover"
                className="mt-4"
                onClick={handleClick('AI Art')}
                header="Stump's Community Garden"
                text="Tend to your garden and its visitors, expanding your plant shop's catalogue and handling challenges as they arise."
        />
    </div>

</div>


<style>
    .custom-scrollbar::-webkit-scrollbar {
        width: 2px;
    }

    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: #5C4B48;
        border-radius: 1px;
        height: 29px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background-color: #6b5855;
    }

    .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: #5C4B48 transparent;
    }
</style>