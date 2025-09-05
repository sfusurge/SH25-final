<script lang="ts">
    interface Props {
        height: any;
        width: any;
        className?: string;
    }

    let { height, width, className = '' }: Props = $props();
</script>

<img
        src="/assets/line-diamond.svg"
        {height}
        {width}
        alt="horizontal pattern"
        class="flex-1 {className}"
        data-demon="border"
/>