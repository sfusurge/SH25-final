<script>
    import BlockPatternVertical from "$lib/components/landing/svgs/BlockPatternVertical.svelte";

    const companies = {
        monetary: [
            {
                name: "Centre for Digital Media",
                picture: "/assets/sponsors/Monetary/Logo/CDM/Blue_Centre for digital media.png",
                link: "https://thecdm.ca/"
            },
            {
                name: "ColorStack SFU",
                picture: "/assets/sponsors/Monetary/Logo/ColorStack SFU/Platinum-ColorStack.png",
                link: "https://www.colorstack.org/"
            },
            {
                name: "Kardium",
                picture: "/assets/sponsors/Monetary/Logo/Kardium/Bronze Kardium.png",
                link: "https://kardium.com/"
            },
            {
                name: "Safe Software",
                picture: "/assets/sponsors/Monetary/Logo/Safe Software/Platinum Safe Software.png",
                link: "https://www.safe.com/"
            },
            {
                name: "Transoft",
                picture: "/assets/sponsors/Monetary/Logo/Transoft/Transoft_logo_stacked_version_CLR.png",
                link: "https://www.transoftsolutions.com/"
            },
            {
                name: "Trulioo",
                picture: "/assets/sponsors/Monetary/Logo/Trulioo/Trulioo Logo.png",
                link: "https://www.trulioo.com/"
            },
            {
                name: "Vercel",
                picture: "/assets/sponsors/Monetary/Logo/Vercel/Vercel_logo_black.svg",
                link: "https://vercel.com/"
            }
        ],
        inKind: [
            {
                name: "Balsamiq",
                picture: "/assets/sponsors/In-Kind/Logos/Balsamiq/balsamiq_logomark.png",
                link: "https://balsamiq.com/"
            },
            {
                name: "CloudNine Clothing",
                picture: "/assets/sponsors/In-Kind/Logos/CloudNine Clothing/CloudNine-01.png",
                link: "https://www.cloudnineclothing.com/"
            },
            {
                name: "CodeCrafters",
                picture: "/assets/sponsors/In-Kind/Logos/CodeCrafters/Copy of Logomark (No BG).png",
                link: "https://codecrafters.io/"
            },
            {
                name: "Electronic Arts",
                picture: "/assets/sponsors/In-Kind/Logos/Electronic Arts/EA_Logo_BLK.png",
                link: "https://www.ea.com/"
            },
            {
                name: "Museum of Vancouver",
                picture: "/assets/sponsors/In-Kind/Logos/Museum of Vancouver (MOV)/Copy of MOV Logo (Colour) High Res No Background.png",
                link: "https://museumofvancouver.ca/"
            },
            {
                name: "The Hive (Mt. Pleasant)",
                picture: "/assets/sponsors/In-Kind/Logos/The Hive (Mt. Pleasant)/HIVE-MAIN LOGO.png",
                link: "https://hiveclimbing.com/mountpleasant/"
            },
            {
                name: "Vancouver Mysteries",
                picture: "/assets/sponsors/In-Kind/Logos/Vancouver Mysteries/VAN_MYST_LOGO_FINALv5_STANDARD LOGO.png",
                link: "https://vancouvermysteries.com/"
            },
            {
                name: "Vancouver Water Games",
                picture: "/assets/sponsors/In-Kind/Logos/Vancouver Water Games/VWA Logo (1).png",
                link: "https://www.vancouverwatergames.com/"
            }
        ]
    };
</script>

<div class="flex flex-col items-center justify-center min-h-screen gap-2 p-4 w-screen">

    <div class="flex flex-col w-full max-w-6xl border border-[#574E49] bg-[#161414] backdrop-blur-[5px] overflow-hidden">
        <div class="flex flex-row items-center justify-between min-h-[200px]">
            <BlockPatternVertical className="h-full flex-shrink-0" />

            <div class="flex flex-col flex-1 items-center">
                <h1 class="text-start font-semibold pt-2">
                    Monetary
                </h1>
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

    <div class="flex flex-col w-full max-w-6xl border border-[#574E49] bg-[#161414] backdrop-blur-[5px] overflow-hidden">
        <div class="flex flex-row items-center justify-between min-h-[200px]">
            <BlockPatternVertical className="h-full flex-shrink-0" />

            <div class="flex flex-col flex-1 items-center">
                <h1 class="text-start font-semibold pt-2">
                    In Kind
                </h1>
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