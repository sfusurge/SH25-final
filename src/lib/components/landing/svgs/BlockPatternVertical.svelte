<script lang="ts">
    interface Props {
        className?: string;
    }

    let { className = '' }: Props = $props();
</script>

<div
        class={`w-[11px] bg-repeat-x ${className}`}
        style="background: url('/assets/block-pattern-vertical.svg');"
        data-demon="border"
>   </div>
