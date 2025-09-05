<script lang="ts">
    interface Props {
        className?: string;
    }

    let { className = '' }: Props = $props();
</script>

<div
        class="h-[11px] w-full bg-repeat-x {className}"
        style="background: url('/assets/block-pattern.svg')"
        data-demon="border">

</div>