<script>
    // plant fields: key, position, narrow, mobile
    let { plant } = $props();
</script>

<img
    class="plant"
    src={`/assets/experiences/leaf/plants/${plant.key}.png`}
    style="
    left: {plant.position.left};
    top: {plant.position.top};
    width: {plant.plantPosition.width};
    transform: {plant.plantTransform};
    z-index:{plant.key === 'carrot' ? 3 : plant.key === 'vine' ? 2 : 0};" 
/>

<img
    src={`/assets/experiences/leaf/${plant.pot}/default.png`}
    style="
    position: absolute;
    left: {plant.position.left};
    top: {plant.position.top};
    width: {plant.position.width}"
/>

<style>
    .plant {
        position: absolute;
        cursor: pointer;
        transition:
            transform 0.15s ease,
            filter 0.15s ease;
        pointer-events: auto;
    }

    .plant:hover {
        filter: brightness(1.05);
    }
    .plant:active {
        filter: brightness(0.95);
    }
    .plant.selected {
        filter: drop-shadow(0 0 8px #ffd700) brightness(1.1);
        transform: scale(1.05);
    }

    .plant.selected:hover {
        filter: drop-shadow(0 0 8px #ffd700) brightness(1.15);
    }

    .plant.selected:active {
        filter: drop-shadow(0 0 8px #ffd700) brightness(1.05);
    }

    .plant.disabled {
        opacity: 0.3;
        pointer-events: none;
        cursor: default;
        filter: none;
    }
</style>
