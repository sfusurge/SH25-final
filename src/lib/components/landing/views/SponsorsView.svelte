<script>
    import BlockPatternVertical from "$lib/components/landing/svgs/BlockPatternVertical.svelte";

    const companies = {
        monetary: {
            platinum: [
                {
                    name: "Transoft",
                    tier: "Platinum",
                    picture: "/assets/sponsors/Monetary/Logo/Transoft/Transoft_logo_stacked_version_CLR.png",
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
                    picture: "/assets/sponsors/Monetary/Logo/Safe Software/Platinum Safe Software.png",
                    link: "https://www.safe.com/"
                },
                {
                    name: "AMD",
                    tier: "Platinum",
                    picture: "/assets/sponsors/Monetary/Logo/CDM/Blue_Centre for digital media.png",
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
                    picture: "/assets/sponsors/Monetary/Logo/Kardium/Bronze Kardium.png",
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
            {
                name: "Microsoft",
                picture: "/assets/sponsors/In-Kind/Logos/Microsoft/microsoft.png",
                link: "https://www.microsoft.com/en-ca"
            },
            {
                name: "Electronic Arts",
                picture: "/assets/sponsors/In-Kind/Logos/Electronic Arts/EA_Logo_WH.svg",
                link: "https://www.ea.com/"
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

<div class="flex flex-col items-center justify-center min-h-screen gap-2 p-4 w-screen">

    <div class="flex flex-col w-full max-w-6xl border border-[#574E49] bg-[#161414] backdrop-blur-[5px] overflow-hidden overflow-y-auto overflow-x-hidden h-full hidden-scrollbar">
        <div class="flex flex-row items-center justify-between">
            <BlockPatternVertical className="h-full flex-shrink-0" />

            <div class="flex flex-col flex-1 items-center">
                <h1 class="text-2xl font-semibold pt-2 mb-4 text-white">
                    Monetary Sponsors
                </h1>

                {#if companies.monetary.platinum.length > 0}
                    <div class="mb-4 w-full">
                        <h2 class="text-gray-400 italic self-stretch leading-normal font-bold text-center py-2">
                            Platinum
                        </h2>
                        <div class="flex flex-row gap-8 justify-center items-center flex-wrap px-4">
                            {#each companies.monetary.platinum as company}
                                <a
                                        href={company.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="hover:scale-110 transition-transform duration-200 bg-white/10 p-6 backdrop-blur-sm hover:bg-white/20 rounded-lg"
                                        title={company.name}
                                >
                                    <img
                                            src={company.picture}
                                            alt={company.name}
                                            class="object-contain w-20 h-20"
                                    />
                                </a>
                            {/each}
                        </div>
                    </div>
                {/if}

                {#if companies.monetary.gold.length > 0}
                    <div class="mb-4 w-full">
                        <h2 class="text-yellow-400 italic self-stretch leading-normal font-bold text-center py-2">
                            Gold
                        </h2>
                        <div class="flex flex-row gap-6 justify-center items-center flex-wrap px-4">
                            {#each companies.monetary.gold as company}
                                <a
                                        href={company.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="hover:scale-110 transition-transform duration-200 bg-white/10 p-5 backdrop-blur-sm hover:bg-white/20 rounded-lg"
                                        title={company.name}
                                >
                                    <img
                                            src={company.picture}
                                            alt={company.name}
                                            class="object-contain w-20 h-20"
                                    />
                                </a>
                            {/each}
                        </div>
                    </div>
                {/if}

                {#if companies.monetary.bronze.length > 0}
                    <div class="w-full mb-8">
                        <h2 class="text-amber-600 italic self-stretch leading-normal font-bold text-center py-2">
                            Bronze
                        </h2>
                        <div class="flex flex-row gap-4 justify-center items-center flex-wrap px-4">
                            {#each companies.monetary.bronze as company}
                                <a
                                        href={company.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="hover:scale-110 transition-transform duration-200 bg-white/10 p-4 backdrop-blur-sm hover:bg-white/20 rounded-lg"
                                        title={company.name}
                                >
                                    <img
                                            src={company.picture}
                                            alt={company.name}
                                            class="object-contain w-20 h-20"
                                    />
                                </a>
                            {/each}
                        </div>
                    </div>
                {/if}
            </div>

            <BlockPatternVertical className="h-full rotate-180 flex-shrink-0" />
        </div>
    </div>

    <div class="flex flex-col w-full max-w-6xl border border-[#574E49] bg-[#161414] backdrop-blur-[5px] overflow-hidden my-4 overflow-y-auto overflow-x-hidden h-full hidden-scrollbar">
        <div class="flex flex-row items-stretch min-h-[300px]">
            <BlockPatternVertical className="h-full flex-shrink-0" />

            <div class="flex flex-col flex-1 items-center">
                <h1 class="text-2xl font-semibold pt-2 mb-4 text-white">
                    In Kind Sponsors
                </h1>
                <div class="flex flex-row gap-6 justify-center items-center flex-wrap p-8 w-full">
                    {#each companies.inKind as company}
                        <a
                                href={company.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="hover:scale-110 transition-transform duration-200 bg-white/10 p-4 backdrop-blur-sm hover:bg-white/20 rounded-lg"
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

<style>
    .hidden-scrollbar {
        -webkit-scrollbar: none;
        -ms-overflow-style: none;
        scrollbar-width: none;
    }

    .hidden-scrollbar::-webkit-scrollbar {
        display: none;
    }
</style>