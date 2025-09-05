<script lang="ts">
    interface Props {
        onClick?: any;
        className?: string;
        style?: string;
        active?: boolean;
        imageSrc?: string;
        imageAlt?: string;
        imageClass?: string;
        header?: string;
        text?: string;
    }

    let {
        onClick = () => {},
        className = '',
        style = '',
        active = false,
        imageSrc = '',
        imageAlt = '',
        imageClass = '',
        header = '',
        text = ''
    }: Props = $props();
</script>

<button
        {style}
        class={`bg-[#231f1f] pt-2 pb-2 alt flex flex-row items-start gap-2.5 self-stretch cursor-pointer group relative transition-all duration-300 border-[0.643px] border-primary hover:border-border hover:shadow-[0_0_6px_0_var(--color-primary)] ${className} ${active ? "shadow-[0_0_12px_0_var(--color-primary)] border-border" : ""}`}
        onclick={onClick}
>
    {#if imageSrc}
        <img
                src={imageSrc}
                alt={imageAlt}
                class={imageClass}
                width="35"
                height="35"
        />
    {/if}

    {#if header || text}
        <div class="transition-all duration-300 group-hover:brightness-[1.8] group-hover:sepia-[0.2] group-hover:hue-rotate-[15deg] text-start">
            {#if header}
                <h1 class="text-header text-xs italic self-stretch leading-normal font-bold">
                    {header}
                </h1>
            {/if}
            {#if text}
                <h3 class="text-textalt text-xs italic font-normal leading-normal">
                    {text}
                </h3>
            {/if}
        </div>
    {/if}

    <span class="absolute -top-0.5 -left-0.5 w-2 h-2 border-l-1 border-t-1 border-main opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
    <span class="absolute -top-0.5 -right-0.5 w-2 h-2 border-r-1 border-t-1 border-main opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
    <span class="absolute -bottom-0.5 -left-0.5 w-2 h-2 border-l-1 border-b-1 border-main opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
    <span class="absolute -bottom-0.5 -right-0.5 w-2 h-2 border-r-1 border-b-1 border-main opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
</button>