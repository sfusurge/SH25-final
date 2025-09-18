<script>
    // plant fields: key, position, narrow, mobile
    let { plant } = $props();
</script>

<img
    src="/assets/experiences/leaf/bucket1/default.png"
    style="
    position: absolute;
    left: {plant.position.left};
    top: {plant.position.top};
    width: 10%"
/>

<style>
</style>
