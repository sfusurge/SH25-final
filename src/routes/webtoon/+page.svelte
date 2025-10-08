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
        [
            "/assets/webtoons/2/2.1.png",
            "/assets/webtoons/2/2.2.png",
            "/assets/webtoons/2/2.3.png",
            "/assets/webtoons/2/2.4.png",
            "/assets/webtoons/2/2.5.png",
            "/assets/webtoons/2/2.6.png",
            "/assets/webtoons/2/2.7.png",
            "/assets/webtoons/2/2.8.png",
            "/assets/webtoons/2/2.9.png",
            "/assets/webtoons/2/2.10.png",
            "/assets/webtoons/2/2.11.png",
            "/assets/webtoons/2/2.12.png",
            "/assets/webtoons/2/2.13.png",
            "/assets/webtoons/2/2.14.png",
            "/assets/webtoons/2/2.15.png"
        ],
        [
            "/assets/webtoons/3/3.1.png",
            "/assets/webtoons/3/3.2.png",
            "/assets/webtoons/3/3.3.png",
            "/assets/webtoons/3/3.4.png",
            "/assets/webtoons/3/3.5.png",
            "/assets/webtoons/3/3.6.png",
        ],
        [
            "/assets/webtoons/4/4.1.png",
            "/assets/webtoons/4/4.2.png",
            "/assets/webtoons/4/4.3.png",
            "/assets/webtoons/4/4.4.png",
            "/assets/webtoons/4/4.5.png",
            "/assets/webtoons/4/4.6.png",
        ],
        [
            "/assets/webtoons/5/5.1.png",
            "/assets/webtoons/5/5.2.png",
            "/assets/webtoons/5/5.3.png",
            "/assets/webtoons/5/5.4.png",
            "/assets/webtoons/5/5.5.png",
            "/assets/webtoons/5/5.6.png",
            "/assets/webtoons/5/5.7.png",
            "/assets/webtoons/5/5.8.png",
            "/assets/webtoons/5/5.9.png",
            "/assets/webtoons/5/5.10.png",
            "/assets/webtoons/5/5.11.png",
        ]
    ];

    const currentIdx = $derived.by(() => {
        console.log(parseInt(page.url.hash))
        const idx = parseInt(page.url.hash.slice(1));
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
