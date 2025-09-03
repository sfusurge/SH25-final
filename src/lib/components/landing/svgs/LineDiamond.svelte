<script>
    export let height;
    export let width;
    export let className = '';
</script>

<img
        src="/assets/line-diamond.svg"
        {height}
        {width}
        alt="horizontal pattern"
        class="flex-1 {className}"
        data-demon="border"
/>