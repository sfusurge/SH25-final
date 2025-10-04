<script lang="ts">
    interface Props {
        className?: string;
        style?: string;
    }

    let { className = "", style = "" }: Props = $props();
</script>

<div
    class="pattern"
    style="{style}"
></div>


<style>
    .pattern {
        display: block;
        min-width: 11px;
        width: 11px;
        min-height: 100%;
        height: auto;
        background: url('/assets/block-pattern-vertical.svg');
        align-self: stretch;
    }
</style>
