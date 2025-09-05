<div class="flex flex-row justify-center items-center gap-4 mt-4">
    {#each [{ href: "https://www.instagram.com/sfusurge/", src: "/assets/ig.svg", alt: "Instagram" }, { href: "https://sfusurge.com", src: "/assets/web.svg", alt: "Website" }, { href: "https://www.linkedin.com/company/sfu-surge/", src: "/assets/linkedin.svg", alt: "LinkedIn" }] as icon}
        <a href={icon.href} target="_blank" rel="noopener noreferrer">
            <img
                src={icon.src}
                alt={icon.alt}
                height="16"
                width="16"
                class="w-[24px] h-[24px] sm:w-[16px] sm:h-[16px]"
                data-demon="primary"
            />
        </a>
    {/each}
</div>

<style>
    a {
        transition: filter 250ms ease-out;
    }
    a:hover,
    a:active,
    a:focus {
        filter: brightness(1.25);
    }
</style>
