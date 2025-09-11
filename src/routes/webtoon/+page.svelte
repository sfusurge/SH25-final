<script lang="ts">
    import WebtoonView from "$lib/components/landing/views/WebtoonView.svelte";
    import { page } from "$app/state";

    const webtoons = [
        [
            "/assets/webtoons/1/1.1.webp",
            "/assets/webtoons/1/1.2.webp",
            "/assets/webtoons/1/1.3.webp",
            "/assets/webtoons/1/1.4.webp",
            "/assets/webtoons/1/1.5.webp",
            "/assets/webtoons/1/1.6.webp",
            "/assets/webtoons/1/1.7.webp",
            "/assets/webtoons/1/1.8.webp",
            "/assets/webtoons/1/1.9.webp",
        ],
    ];

    const currentIdx = $derived.by(() => {
        const idx = parseInt(page.url.hash);
        if (!idx || isNaN(idx) || idx < 1 || idx > webtoons.length) {
            return 0;
        }
        return idx - 1;
    });

    const currentWebToons = $derived(webtoons[currentIdx]);

    $effect(() => {
        location.hash = `${currentIdx + 1}`;
    });
</script>

<WebtoonView key={`webtoon#${currentIdx + 1}`} imageUrls={currentWebToons} />
