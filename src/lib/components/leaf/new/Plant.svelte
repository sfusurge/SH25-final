<script lang="ts">
    // plant fields: key, position, narrow, mobile
    let { plant } = $props();
    import { game } from "./game.svelte.ts";

    let unlocked = $state(false);
    let stock = $state(0);
    let disabled = $state(false);

    $effect(() => {
        const key = plant.key as keyof typeof game.inventory;
        unlocked = game.shop[key] === true;
        stock = game.inventory[key] ?? 0;
        disabled = unlocked && stock === 0;
    });
</script>

{#if unlocked}
    <img
        class="plant {disabled ? 'disabled' : ''}"
        src={`/assets/experiences/leaf/plants/${plant.key}.png`}
        style="
      left:{plant.position.left};
      top:{plant.position.top};
      width:{plant.plantPosition.width};
      transform:{plant.plantTransform};
      z-index:{plant.key === 'carrot' ? 3 : plant.key === 'vine' ? 2 : 0};"
        on:click={() => {
            if (!disabled)
                game.clickPlant(plant.key as keyof typeof game.inventory);
        }}
    />
{/if}

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
