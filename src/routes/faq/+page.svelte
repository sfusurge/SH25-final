<script lang="ts">
    import Faq from "$lib/components/landing/views/FAQ.svelte";
    import TopBar from "$lib/components/landing/views/shared/TopBar.svelte";
    import { global } from "../+layout.svelte";
</script>

<div class="ver w-full relative">
    {#if global.mobile}
        <TopBar>FAQ</TopBar>
    {/if}
    <Faq />
</div>
