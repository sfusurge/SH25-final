<script>
    import BlockPatternVertical from "$lib/components/landing/svgs/BlockPatternVertical.svelte";

    const companies = {
        monetary: {
            platinum: [
                {
                    name: "Scalar",
                    tier: "Platinum",
                    picture: "/assets/sponsors/Monetary/Logo/Scalar/scalar-logo.svg",
                    link: "https://scalar.com/"
                },
                {
                    name: "Transoft",
                    tier: "Platinum",
                    picture: "/assets/sponsors/Monetary/Logo/Transoft/transoft_white.svg",
                    link: "https://www.transoftsolutions.com/"
                },
                {
                    name: "Trulioo",
                    tier: "Platinum",
                    picture: "/assets/sponsors/Monetary/Logo/Trulioo/Trulioo light.png",
                    link: "https://www.trulioo.com/"
                },
                {
                    name: "Safe Software",
                    tier: "Platinum",
                    picture: "/assets/sponsors/Monetary/Logo/Safe Software/Alternative Platinum Safe Software.png",
                    link: "https://www.safe.com/"
                },
                {
                    name: "AMD",
                    tier: "Platinum",
                    picture: "/assets/sponsors/Monetary/Logo/AMD/AMD-Logo-SVG_001.svg",
                    link: "https://www.amd.com/en.html"
                },
                {
                    name: "Vercel",
                    tier: "Platinum",
                    picture: "/assets/sponsors/Monetary/Logo/Vercel/Vercel_logo_black.svg",
                    link: "https://vercel.com/"
                }
            ],
            gold: [
                {
                    name: "Clay",
                    tier: "Gold",
                    picture: "/assets/sponsors/Monetary/Logo/Clay/Clay Logo Light.png",
                    link: "https://clay.com/"
                }
            ],
            bronze: [
                {
                    name: "Motorola",
                    tier: "Bronze",
                    picture: "/assets/sponsors/Monetary/Logo/Motorola/Motorola_Logo_White.png",
                    link: "https://www.motorola.com/ca/en/homepage"
                },
                {
                    name: "Kardium",
                    tier: "Bronze",
                    picture: "/assets/sponsors/Monetary/Logo/Kardium/Kardium.svg",
                    link: "https://kardium.com/"
                },
                {
                    name: "Centre for Digital Media",
                    tier: "Bronze",
                    picture: "/assets/sponsors/Monetary/Logo/CDM/Blue_Centre for digital media.png",
                    link: "https://thecdm.ca/"
                },
                {
                    name: "Microsoft",
                    tier: "Bronze",
                    picture: "/assets/sponsors/Monetary/Logo/Microsoft/microsoft.png",
                    link: "https://www.microsoft.com/en-ca"
                },
                {
                    name: "ColorStack",
                    tier: "Bronze",
                    picture: "/assets/sponsors/Monetary/Logo/ColorStack SFU/Platinum-ColorStack.png",
                    link: "https://www.colorstack.org/"
                }
            ]
        },
        inKind: [
            {
                name: "T1",
                picture: "/assets/sponsors/In-Kind/Logos/T1/T1_logo.svg",
                link: "https://www.t1.gg/"
            },
            // {
            //     name: "Microsoft",
            //     picture: "/assets/sponsors/In-Kind/Logos/Microsoft/microsoft.png",
            //     link: "https://www.microsoft.com/en-ca"
            // },
            {
                name: "Electronic Arts",
                picture: "/assets/sponsors/In-Kind/Logos/Electronic Arts/EA_Logo_WH.svg",
                link: "https://www.ea.com/"
            },
            {
                name: "RedBull",
                picture: "/assets/sponsors/In-Kind/Logos/RedBull/redbull-logo.svg",
                link: "https://www.redbull.com/ca-en/"
            },
            {
                name: "The Hive (Mt. Pleasant)",
                picture: "/assets/sponsors/In-Kind/Logos/The Hive (Mt. Pleasant)/HIVE-MAIN LOGO.png",
                link: "https://hiveclimbing.com/mountpleasant/"
            },
            {
                name: "Vancouver Mysteries",
                picture: "/assets/sponsors/In-Kind/Logos/Vancouver Mysteries/transparent.png",
                link: "https://vancouvermysteries.com/"
            },
            {
                name: "Vancouver Water Games",
                picture: "/assets/sponsors/In-Kind/Logos/Vancouver Water Games/VWA Logo (1).png",
                link: "https://www.vancouverwatergames.com/"
            },
            {
                name: "Old Spaghetti Factory",
                picture: "/assets/sponsors/In-Kind/Logos/Old Spaghetti Factory/osf-logo.svg",
                link: "https://oldspaghettifactory.ca/"
            },
            {
                name: "Taphouse",
                picture: "/assets/sponsors/In-Kind/Logos/Taphouse/taphouse.png",
                link: "https://www.thetaphouse.ca/"
            },
            {
                name: "Rio Theatre",
                picture: "/assets/sponsors/In-Kind/Logos/Rio Theatre/rio-theatre-logo.png",
                link: "https://riotheatre.ca/"
            },
            {
                name: "Steelseries",
                picture: "/assets/sponsors/In-Kind/Logos/Steelseries/Steelseries-logo-white.png",
                link: "https://steelseries.com/en-ca"
            },
            {
                name: "Indomie",
                picture: "/assets/sponsors/In-Kind/Logos/Indomie/indomie.png",
                link: "https://indomieonline.ca/"
            }
        ]
    };
</script>


<div class="flex flex-col items-center justify-center w-full gap-6 p-6">
    <div class="grid grid-cols-1 md:grid-cols-3 w-full max-w-6xl gap-4 md:max-h-80">
        <div class="flex flex-row items-stretch border border-[#574E49] bg-[#161414]/90 backdrop-blur-md overflow-hidden h-80 md:h-full">
            <BlockPatternVertical className="h-full flex-shrink-0" />
            <div class="flex flex-col flex-1 p-4 overflow-y-auto hidden-scrollbar">
                <div class="w-full mb-4">
                    <h1 class="text-[#F1ECEB] text-[12px] italic font-bold leading-normal text-left">
                        Platinum Sponsors
                    </h1>
                </div>

                <div class="flex flex-col items-center gap-4 w-full flex-1">
                    {#each companies.monetary.platinum as company}
                        <a
                                href={company.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="hover:scale-105 transition-transform duration-200"
                                title={company.name}
                        >
                            <img
                                    src={company.picture}
                                    alt={company.name}
                                    class="max-h-20 max-w-[120px] object-contain"
                            />
                        </a>
                    {/each}
                </div>
            </div>
            <BlockPatternVertical className="h-full rotate-180 flex-shrink-0" />
        </div>

        <div class="flex flex-row items-stretch border border-[#574E49] bg-[#161414]/90 backdrop-blur-md overflow-hidden max-h-80 md:h-full">
            <BlockPatternVertical className="h-full flex-shrink-0" />
            <div class="flex flex-col flex-1 items-center p-4 overflow-y-auto hidden-scrollbar">
                <div class="w-full mb-4">
                    <h1 class="text-[#F1ECEB] text-[12px] italic font-bold leading-normal text-left">
                        Gold Sponsors
                    </h1>
                </div>
                <div class="flex flex-col items-center justify-center h-full gap-4 w-full">
                    {#each companies.monetary.gold as company}
                        <a
                                href={company.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="hover:scale-105 transition-transform duration-200"
                                title={company.name}
                        >
                            <img
                                    src={company.picture}
                                    alt={company.name}
                                    class="max-h-20 max-w-[120px] object-contain"
                            />
                        </a>
                    {/each}
                </div>
            </div>
            <BlockPatternVertical className="h-full rotate-180 flex-shrink-0" />
        </div>

        <div class="flex flex-row items-stretch border border-[#574E49] bg-[#161414]/90 backdrop-blur-md overflow-hidden max-h-80 md:h-full">
            <BlockPatternVertical className="h-full flex-shrink-0" />
            <div class="flex flex-col flex-1 items-center p-4 overflow-y-auto hidden-scrollbar">
                <div class="w-full mb-4">
                    <h1 class="text-[#F1ECEB] text-[12px] italic font-bold leading-normal text-left">
                        Bronze Sponsors
                    </h1>
                </div>
                <div class="flex flex-col items-center gap-4 w-full">
                    {#each companies.monetary.bronze as company}
                        <a
                                href={company.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="hover:scale-105 transition-transform duration-200"
                                title={company.name}
                        >
                            <img
                                    src={company.picture}
                                    alt={company.name}
                                    class="max-h-20 max-w-[120px] object-contain"
                            />
                        </a>
                    {/each}
                </div>
            </div>
            <BlockPatternVertical className="h-full rotate-180 flex-shrink-0" />
        </div>
    </div>

    <div class="flex flex-col w-full max-w-6xl border border-[#574E49] bg-[#161414]/90 backdrop-blur-md overflow-hidden my-4">
        <div class="flex flex-row items-stretch min-h-[300px]">
            <BlockPatternVertical className="h-full flex-shrink-0" />
            <div class="flex flex-col flex-1 items-center py-6">
                <div class="w-full px-6 mb-4">
                    <h1 class="text-[#F1ECEB] text-[12px] italic font-bold leading-normal text-left">
                        In-Kind Sponsors
                    </h1>
                </div>
                <div class="flex flex-row gap-6 md:gap-10 justify-center items-center flex-wrap px-6 pb-6 w-full">
                    {#each companies.inKind as company}
                        <a
                                href={company.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="hover:scale-105 transition-transform duration-200"
                                title={company.name}
                        >
                            <img
                                    src={company.picture}
                                    alt={company.name}
                                    class="max-h-16 md:max-h-20 max-w-[100px] md:max-w-[120px] object-contain"
                            />
                        </a>
                    {/each}
                </div>
            </div>
            <BlockPatternVertical className="h-full rotate-180 flex-shrink-0" />
        </div>
    </div>
</div>

<style>
    .hidden-scrollbar {
        -ms-overflow-style: none; /* IE/Edge */
        scrollbar-width: none; /* Firefox */
    }
    .hidden-scrollbar::-webkit-scrollbar {
        display: none; /* Chrome/Safari */
    }
</style>