<script lang="ts">
    import { page } from "$app/state";
    import HoverEffectButton from "$lib/components/landing/HoverEffectButton.svelte";
    import Sidebar from "$lib/components/landing/Sidebar/Sidebar.svelte";
    import TopBar from "$lib/components/landing/views/shared/TopBar.svelte";

    const pages: { [key: string]: string } = {
        "/faq": "Frequently Asked Questions",
        "/garden": "Garden Game",
        "/partners": "Our Partners",
    };

    let showDropdown = $state(false);
</script>

<TopBar {showDropdown}>
    <h1>{pages[page.url.pathname] ?? ""}</h1>
    <HoverEffectButton
        large
        onClick={() => {
            showDropdown = !showDropdown;
        }}
        style="background-color: var(--bg); margin-left:auto;"
    >
        <div class="burger"></div>
    </HoverEffectButton>

    {#snippet dropDownContent()}
        <Sidebar />
    {/snippet}
</TopBar>

<style>
    .burger {
        width: 20px;
        height: 20px;

        background-color: var(--border);
        position: relative;
        transform: scale(1.1, 0.9);
    }

    .burger::before {
        content: "";
        position: absolute;
        left: 0;
        top: 4px;
        width: 100%;
        height: 4px;

        background-color: var(--bg);
    }

    .burger::after {
        content: "";
        position: absolute;
        left: 0;
        top: 12px;
        width: 100%;
        height: 4px;

        background-color: var(--bg);
    }
</style>
