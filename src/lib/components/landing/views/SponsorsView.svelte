<script>
    import BlockPatternVertical from "$lib/components/landing/svgs/BlockPatternVertical.svelte";
    const companies = {
        monetary: [
            {
                name: "Transoft",
                tier: "Platinum",
                picture:
                    "/assets/sponsors/Monetary/Logo/Transoft/Transoft_logo_stacked_version_CLR.png",
                link: "https://www.transoftsolutions.com/",
            },
            {
                name: "Trulioo",
                tier: "Platinum",
                picture: "/assets/sponsors/Monetary/Logo/Trulioo/Trulioo light.png",
                link: "https://www.trulioo.com/",
            },
            {
                name: "Safe Software",
                tier: "Platinum",
                picture: "/assets/sponsors/Monetary/Logo/Safe Software/Platinum Safe Software.png",
                link: "https://www.safe.com/",
            },
            {
                name: "AMD",
                tier: "Platinum",
                picture: "/assets/sponsors/Monetary/Logo/CDM/Blue_Centre for digital media.png",
                link: "https://www.amd.com/en.html",
            },
            {
                name: "Vercel",
                tier: "Platinum",
                picture: "/assets/sponsors/Monetary/Logo/Vercel/Vercel_logo_black.svg",
                link: "https://vercel.com/",
            },
            {
                name: "Clay",
                tier: "Gold",
                picture: "/assets/sponsors/Monetary/Logo/Clay/Clay Logo Light.png",
                link: "https://clay.com/",
            },
            {
                name: "Motorola",
                tier: "Bronze",
                picture: "/assets/sponsors/Monetary/Logo/Motorola/Motorola_Logo_White.png",
                link: "https://www.motorola.com/ca/en/homepage",
            },
            {
                name: "Kardium",
                tier: "Bronze",
                picture: "/assets/sponsors/Monetary/Logo/Kardium/Bronze Kardium.png",
                link: "https://kardium.com/",
            },
            {
                name: "Centre for Digital Media",
                tier: "Bronze",
                picture: "/assets/sponsors/Monetary/Logo/CDM/Blue_Centre for digital media.png",
                link: "https://thecdm.ca/",
            },
            {
                name: "Microsoft",
                tier: "Bronze",
                picture: "/assets/sponsors/Monetary/Logo/Microsoft/microsoft.png",
                link: "https://www.microsoft.com/en-ca",
            },
            {
                name: "ColorStack",
                tier: "Bronze",
                picture: "/assets/sponsors/Monetary/Logo/ColorStack SFU/Platinum-ColorStack.png",
                link: "https://www.colorstack.org/",
            },
        ],
        inKind: [
            {
                name: "T1",
                picture: "/assets/sponsors/In-Kind/Logos/T1/T1_logo.svg",
                link: "https://www.t1.gg/",
            },
            {
                name: "Microsoft",
                picture: "/assets/sponsors/In-Kind/Logos/Microsoft/microsoft.png",
                link: "https://www.microsoft.com/en-ca",
            },
            // {
            //     name: "Balsamiq",
            //     picture: "/assets/sponsors/In-Kind/Logos/Balsamiq/balsamiq_logomark.png",
            //     link: "https://balsamiq.com/"
            // },
            // {
            //     name: "CloudNine Clothing",
            //     picture: "/assets/sponsors/In-Kind/Logos/CloudNine Clothing/CloudNine-01.png",
            //     link: "https://www.cloudnineclothing.com/"
            // },
            // {
            //     name: "CodeCrafters",
            //     picture: "/assets/sponsors/In-Kind/Logos/CodeCrafters/Copy of CodeCrafters Workmark (White).png",
            //     link: "https://codecrafters.io/"
            // },
            {
                name: "Electronic Arts",
                picture: "/assets/sponsors/In-Kind/Logos/Electronic Arts/EA_Logo_WH.svg",
                link: "https://www.ea.com/",
            },
            // {
            //     name: "Museum of Vancouver",
            //     picture: "/assets/sponsors/In-Kind/Logos/Museum of Vancouver (MOV)/Copy of MOV Logo (Colour) High Res No Background.png",
            //     link: "https://museumofvancouver.ca/"
            // },
            {
                name: "The Hive (Mt. Pleasant)",
                picture:
                    "/assets/sponsors/In-Kind/Logos/The Hive (Mt. Pleasant)/HIVE-MAIN LOGO.png",
                link: "https://hiveclimbing.com/mountpleasant/",
            },
            {
                name: "Vancouver Mysteries",
                picture: "/assets/sponsors/In-Kind/Logos/Vancouver Mysteries/transparent.png",
                link: "https://vancouvermysteries.com/",
            },
            {
                name: "Vancouver Water Games",
                picture: "/assets/sponsors/In-Kind/Logos/Vancouver Water Games/VWA Logo (1).png",
                link: "https://www.vancouverwatergames.com/",
            },
            {   
                link: "https://oldspaghettifactory.ca/",
            },
            {
                name: "Taphouse",
                picture: "/assets/sponsors/In-Kind/Logos/Taphouse/taphouse.png",
                link: "https://www.thetaphouse.ca/",
            },
            {
                name: "Vancouver Water Games",
                picture: "/assets/sponsors/In-Kind/Logos/Vancouver Water Games/VWA Logo (1).png",
                link: "https://www.vancouverwatergames.com/",
            },
            {
                name: "Rio Theatre",
                picture: "/assets/sponsors/In-Kind/Logos/Rio Theatre/rio-theatre-logo.png",
                link: "https://riotheatre.ca/",
            },
            {
                name: "Steelseries",
                picture: "/assets/sponsors/In-Kind/Logos/Steelseries/Steelseries-logo-white.png",
                link: "https://steelseries.com/en-ca",
            },
            {
                name: "Indomie",
                picture: "/assets/sponsors/In-Kind/Logos/Indomie/indomie.png",
                link: "https://indomieonline.ca/",
            },
            // {
            //     name: "Steve's Poke Bar",
            //     picture: "/assets/sponsors/In-Kind/Logos/Vancouver Water Games/VWA Logo (1).png",
            //     link: "https://www.vancouverwatergames.com/"
            // },
            // {
            //     name: "Promosapien",
            //     picture: "/assets/sponsors/In-Kind/Logos/Vancouver Water Games/VWA Logo (1).png",
            //     link: "https://www.vancouverwatergames.com/"
            // },
            // {
            //     name: "RedBull",
            //     picture: "/assets/sponsors/In-Kind/Logos/Vancouver Water Games/VWA Logo (1).png",
            //     link: "https://www.vancouverwatergames.com/"
            // },
            // {
            //     name: "Rain or Shine Ice Cream",
            //     picture: "/assets/sponsors/In-Kind/Logos/Vancouver Water Games/VWA Logo (1).png",
            //     link: "https://www.vancouverwatergames.com/"
            // }
        ],
    };
</script>

<div class="flex flex-col items-center justify-center min-h-screen gap-2 p-4 w-screen">
    <div
        class="flex flex-col w-full max-w-6xl border border-[#574E49] bg-[#161414] backdrop-blur-[5px] overflow-hidden"
    >
        <div class="flex flex-row items-center justify-between min-h-[200px]">
            <BlockPatternVertical className="h-full flex-shrink-0" />

            <div class="flex flex-col flex-1 items-center">
                <h1 class="text-start font-semibold pt-2">Monetary</h1>
                <div class="flex flex-row gap-6 justify-center items-center flex-wrap p-8 w-full">
                    {#each companies.monetary as company}
                        <a
                            href={company.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="hover:scale-110 transition-transform duration-200 bg-white/10 p-4 backdrop-blur-sm hover:bg-white/20"
                            title={company.name}
                        >
                            <img
                                src={company.picture}
                                alt={company.name}
                                class="w-20 h-20 object-contain filter brightness-110"
                            />
                        </a>
                    {/each}
                </div>
            </div>

            <BlockPatternVertical className="h-full rotate-180 flex-shrink-0" />
        </div>
    </div>

    <div
        class="flex flex-col w-full max-w-6xl border border-[#574E49] bg-[#161414] backdrop-blur-[5px] overflow-hidden"
    >
        <div class="flex flex-row items-center justify-between min-h-[200px]">
            <BlockPatternVertical className="h-full flex-shrink-0" />

            <div class="flex flex-col flex-1 items-center">
                <h1 class="text-start font-semibold pt-2">In Kind</h1>
                <div class="flex flex-row gap-6 justify-center items-center flex-wrap p-8 w-full">
                    {#each companies.inKind as company}
                        <a
                            href={company.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="hover:scale-110 transition-transform duration-200 bg-white/10 p-4 backdrop-blur-sm hover:bg-white/20"
                            title={company.name}
                        >
                            <img
                                src={company.picture}
                                alt={company.name}
                                class="w-20 h-20 object-contain filter brightness-110"
                            />
                        </a>
                    {/each}
                </div>
            </div>

            <BlockPatternVertical className="h-full rotate-180 flex-shrink-0" />
        </div>
    </div>
</div>
