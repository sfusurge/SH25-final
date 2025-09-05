<script lang="ts">
    import AudioWaves from "$lib/components/beatmapper/AudioWaves.svelte";
    import BeatMapper, { type Beat } from "$lib/components/beatmapper/BeatMapper.svelte";

    let files: FileList | undefined = $state();

    let bpm = $state(30);
    let bpmOffset = $state(0);

    let beats: Beat[] = $state([]);

    let title = $state("");
    let difficulty = $state("");

    function exportMap() {
        let buffer = `# ${title}\n# ${difficulty}\n`;

        for (const b of beats.toSorted((a, b) => a.time - b.time)) {
            buffer += `${b.value},${b.time.toFixed(3)}\n`;
        }

        const anchor = document.createElement("a");
        anchor.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(buffer));
        anchor.setAttribute("download", `${title}.beatmap`);
        anchor.style.display = "none";

        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    }

    let importedFiles: FileList | undefined = $state();
    async function importMap() {
        if (importedFiles?.length !== 1) {
            importedFiles = undefined;
            return;
        }

        const f = importedFiles[0];
        const lines = (await f.text()).split("\n");
        title = lines[0].split("#")[1].trim();
        difficulty = lines[1].split("#")[1].trim();

        beats = [];

        for (let i = 2; i < lines.length; i++) {
            const [_value, _time] = lines[i].trim().split(",");
            beats.push({
                value: parseInt(_value) as unknown as 0 | 1 | 2,
                time: parseFloat(_time),
            });
        }
    }
</script>

<!-- :skull: -->
<svelte:boundary>
    <label for="fileinput">File:<input type="file" id="fileinput" bind:files /></label>
    <label for="bpmInput"
        >Bpm: {bpm}
        <input type="range" min="30" max="180" id="bpmInput" bind:value={bpm} /></label
    >
    <label for="offsetInput"
        >Offset: {`${bpmOffset.toPrecision(3).padEnd(5, "0")}`}s
        <input
            step="any"
            type="range"
            min="0"
            max="1"
            id="offsetInput"
            bind:value={bpmOffset}
        /></label
    >

    <AudioWaves {bpm} {bpmOffset} file={(files ?? [])[0]} />
    <BeatMapper bind:beats />

    <label for="">Title: <input type="text" bind:value={title} /></label>
    <label for="">Difficulty: <input type="text" bind:value={difficulty} /></label>
    <button onclick={exportMap}>Export</button>

    <label for=""
        >Import file: <input type="file" accept=".beatmap" bind:files={importedFiles} /></label
    >
    <button onclick={importMap}>Import</button>

    {#snippet pending()}
        Loading audio...
    {/snippet}
</svelte:boundary>

<h1>Instruction</h1>
<ul>
    <li>
        First upload a audio file to display and play it
    </li>
    <li>
        Scroll wheen in the audio track to zoom in/out (jank)
    </li>
    <li>
        Middle mouse and drag to shift the track, or use arrow keys to shift by 1 second
    </li>
    <li>
        Left click to set play progress (orange line)
    </li>
    <li>
        Set the bpm/offset to maybe used as a guide when setting notes
    </li>
    <li>
        When hovering over a time, press 1, 2, 3 key to set a note
    </li>
    <li>
        Click on a note to delete it.
    </li>
    <li>Type in the title and click export to download as a file</li>
    <li>Use import input field and Import button to load a previously downloaded file</li>
</ul>

<style>
    button,
    input {
        padding: 0.5rem;
        border: 1px solid var(--border);
        margin: 0.25rem;
    }

    input {
        background-color: var(--bg2);
    }

    label {
        display: flex;
        align-items: center;
    }
</style>
