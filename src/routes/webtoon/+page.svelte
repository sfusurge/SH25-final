<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import WebtoonView from "$lib/components/landing/views/WebtoonView.svelte";

    const Webtoon1 = ["/assets/webtoons/1/1.1.png","/assets/webtoons/1/1.2.png","/assets/webtoons/1/1.3.png","/assets/webtoons/1/1.4.png","/assets/webtoons/1/1.5.png","/assets/webtoons/1/1.6.png","/assets/webtoons/1/1.7.png","/assets/webtoons/1/1.8.png","/assets/webtoons/1/1.9.png"]
    let currentHash = '';
    let webtoonArray = [];

    onMount(() => {
        currentHash = window.location.hash;
        const handleHashChange = () => {
            currentHash = window.location.hash;
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    });

    $: if (currentHash === '#1') {
        webtoonArray = Webtoon1;
    } else {
        webtoonArray = Webtoon1;
    }
</script>

<WebtoonView imageUrls={Webtoon1}/>