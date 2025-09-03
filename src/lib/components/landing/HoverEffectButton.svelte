<script>
    export let children = '';
    export let onClick = () => {};
    export let className = '';
    export let style = '';
    export let active = false;
</script>

<button
        {style}
        class={`bg-[#231f1f] alt flex justify-center items-center cursor-pointer group relative transition-all duration-300 border-[0.643px] border-primary hover:border-border hover:shadow-[0_0_6px_0_var(--color-primary)] ${className} ${active ? "shadow-[0_0_12px_0_var(--color-primary)] border-border" : ""}`}
        on:click={onClick}
>
    <div class="transition-all duration-300 group-hover:brightness-[1.8] group-hover:sepia-[0.2] group-hover:hue-rotate-[15deg]">
        {#if $$slots.default}
            <slot />
        {:else}
            {children}
        {/if}
    </div>

    <span class="absolute -top-0.5 -left-0.5 w-2 h-2 border-l-1 border-t-1 border-main opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
    <span class="absolute -top-0.5 -right-0.5 w-2 h-2 border-r-1 border-t-1 border-main opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
    <span class="absolute -bottom-0.5 -left-0.5 w-2 h-2 border-l-1 border-b-1 border-main opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
    <span class="absolute -bottom-0.5 -right-0.5 w-2 h-2 border-r-1 border-b-1 border-main opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
</button>