<script lang="ts">
    interface Props {
        text: string;
        className?: string;
        style?: string;
    }
    let { text, className, style }: Props = $props();

    let outerWidth = $state(0);
    let innerWidth = $state(0);
</script>

<span class="hidden" bind:clientWidth={innerWidth}>
    {text}
</span>

<div
    class="overflow-hidden {className} textContainer"
    style="width: 100%; position: relative; {style}"
    bind:clientWidth={outerWidth}
>
    <div class="whitespace-nowrap textContent" class:scroll={innerWidth > outerWidth}>
        <span class="whitespace-nowrap">{text}</span>
        {#if innerWidth > outerWidth}
            <span class="whitespace-nowrap">{text}</span>
        {/if}
    </div>
</div>

<style>
    span {
        display: inline-block;
    }
    .textContainer {
        overflow: hidden;
    }

    .hidden {
        position: fixed;
        left: 0;
        top: 0;
        opacity: 0;
    }

    @keyframes scroll {
        0% {
            transform: translate(-50%, 0);
        }

        100% {
            transform: translate(0, 0);
        }
    }



    .textContent.scroll {
        display: flex;
        width: fit-content;
        animation: scroll infinite 5s;
        animation-timing-function: linear;
    }
    .textContent.scroll > span {
        margin-left: 0.5rem;
        margin-right: 0.5rem;
    }
</style>
