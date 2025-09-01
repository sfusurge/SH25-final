<div>
    <div class="flex flex-row justify-center items-center gap-4 mt-4">
        {#each [
            { href: "https://www.instagram.com/sfusurge/", src: "/assets/ig.svg", alt: "Instagram" },
            { href: "https://sfusurge.com", src: "/assets/web.svg", alt: "Website" },
            { href: "https://www.linkedin.com/company/sfu-surge/", src: "/assets/linkedin.svg", alt: "LinkedIn" }
        ] as icon}
            <a href={icon.href} target="_blank" rel="noopener noreferrer">
                <img
                        src={icon.src}
                        alt={icon.alt}
                        height="24"
                        width="24"
                        class="w-[44px] h-[44px] sm:w-[24px] sm:h-[24px]"
                        data-demon="primary"
                />
            </a>
        {/each}
    </div>
</div>
