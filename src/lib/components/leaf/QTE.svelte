<script module lang="ts">
	export interface QTEProps {
		onQTE: (val: number) => void;
		onDone?: (successes: number) => void;
		attempts?: number;
		sizeCqw?: number;
		config: {
			duration: number;
			count: number;
			major: number;
			minor: number;
			majorMod: number;
			minorMod: number;
		};
	}
</script>

<script lang="ts">
	let { onQTE, onDone, attempts = 3, sizeCqw, config }: QTEProps = $props();

	// -------- geometry constants (single source of truth) ----------
	const RADIUS_INSET_FRAC = 0.01875; // 1.5px on an 80px button
	const THICKNESS_FRAC = 0.125; // 10px on an 80px button
	const MIN_THICKNESS_PX = 6; // don’t let it get too thin

	// Random hotspots (unchanged)
	let arcs = $derived.by(() => {
		const _arcs: number[] = [];
		let tries = 100;
		let remain = Math.max(0, config.count);
		while (tries > 0 && remain > 0) {
			tries--;
			const cand = Math.random() * config.duration;
			let legal = true;
			for (const a of _arcs) {
				if (Math.abs(a - cand) < config.minor + config.major) {
					legal = false;
					break;
				}
			}
			if (legal) {
				_arcs.push(cand);
				remain--;
			}
		}
		return _arcs;
	});

	// Timer (unchanged)
	let timer = $state(0);
	let rafId: number | null = null;
	let clicks = $state(0);
	let successes = $state(0);
	let sessionDone = $state(false);

	function updateTimer(t: number) {
		if (sessionDone) return;
		timer = (t % (config.duration * 1000)) / 1000;
		rafId = requestAnimationFrame(updateTimer);
	}

	$effect(() => {
		rafId = requestAnimationFrame(updateTimer);
		return () => {
			if (rafId != null) cancelAnimationFrame(rafId);
			rafId = null;
		};
	});

	// Button size tracking (unchanged)
	let btnRef: HTMLButtonElement | null = null;
	let btnSizePx = $state(80);
	$effect(() => {
		if (!btnRef) return;
		const ro = new ResizeObserver((entries) => {
			const cr = entries[0]?.contentRect;
			if (cr) btnSizePx = cr.width;
		});
		ro.observe(btnRef);
		return () => ro.disconnect();
	});

	// ---- unified geometry helper (used by both ring and arcs) ----
	function getGeom() {
		const center = btnSizePx / 2;

		const thickness = Math.max(MIN_THICKNESS_PX, btnSizePx * THICKNESS_FRAC);
		const outerR = Math.max(0, center - btnSizePx * RADIUS_INSET_FRAC);
		const innerR = Math.max(0, outerR - thickness);

		return { center, outerR, innerR, thickness };
	}

	// Build a donut segment centered at `center` with half-range `range`
	function buildArc(centerTime: number, rangeTime: number) {
		const { center, outerR, innerR } = getGeom();

		// Convert time to angle (12 o’clock = 0°, clockwise)
		const ca = (centerTime / config.duration) * Math.PI * 2;
		const ra = (rangeTime / config.duration) * Math.PI * 2;

		// Endpoints on the outer radius
		const ax0 = center + Math.sin(ca - ra) * outerR;
		const ay0 = center - Math.cos(ca - ra) * outerR;
		const ax1 = center + Math.sin(ca + ra) * outerR;
		const ay1 = center - Math.cos(ca + ra) * outerR;

		// Endpoints on the inner radius
		const ix1 = center + Math.sin(ca + ra) * innerR;
		const iy1 = center - Math.cos(ca + ra) * innerR;
		const ix0 = center + Math.sin(ca - ra) * innerR;
		const iy0 = center - Math.cos(ca - ra) * innerR;

		// Large-arc flag if sweep > 180°
		const largeArc = 2 * ra > Math.PI ? 1 : 0;

		let d = '';
		d += `M ${ax0} ${ay0} `;
		d += `A ${outerR} ${outerR} 0 ${largeArc} 1 ${ax1} ${ay1} `;
		d += `L ${ix1} ${iy1} `;
		d += `A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix0} ${iy0} `;
		d += 'Z';
		return d;
	}

	// Full donut ring matching the same outer/inner radii
	function buildRingPath() {
		const { center, outerR, innerR } = getGeom();

		// We draw outer full circle as two 180° arcs (A ... 0 1 1), then
		// inner full circle reversed (A ... 0 1 0) to form a donut
		const a0 = 0;
		const a1 = Math.PI;
		const a2 = Math.PI * 2;

		const ox0 = center + Math.sin(a0) * outerR;
		const oy0 = center - Math.cos(a0) * outerR;
		const ox1 = center + Math.sin(a1) * outerR;
		const oy1 = center - Math.cos(a1) * outerR;
		const ox2 = center + Math.sin(a2) * outerR;
		const oy2 = center - Math.cos(a2) * outerR;

		const ix2 = center + Math.sin(a2) * innerR;
		const iy2 = center - Math.cos(a2) * innerR;
		const ix1 = center + Math.sin(a1) * innerR;
		const iy1 = center - Math.cos(a1) * innerR;
		const ix0 = center + Math.sin(a0) * innerR;
		const iy0 = center - Math.cos(a0) * innerR;

		let d = '';
		d += `M ${ox0} ${oy0} `;
		d += `A ${outerR} ${outerR} 0 1 1 ${ox1} ${oy1} `;
		d += `A ${outerR} ${outerR} 0 1 1 ${ox2} ${oy2} `;
		d += `L ${ix2} ${iy2} `;
		d += `A ${innerR} ${innerR} 0 1 0 ${ix1} ${iy1} `;
		d += `A ${innerR} ${innerR} 0 1 0 ${ix0} ${iy0} `;
		d += 'Z';
		return d;
	}

	function finishIfNeeded() {
		if (clicks >= attempts && !sessionDone) {
			sessionDone = true;
			if (rafId != null) cancelAnimationFrame(rafId);
			rafId = null;
			if (onDone) onDone(successes);
		}
	}

	function checkClick() {
		if (sessionDone) return;
		let majorHit = false;
		let minorHit = false;
		for (const a of arcs) {
			if (Math.abs(a - timer) < config.major / 2) {
				majorHit = true;
				break;
			}
		}
		if (!majorHit) {
			for (const a of arcs) {
				if (Math.abs(a - timer) < (config.major + config.minor) / 2) {
					minorHit = true;
					break;
				}
			}
		}
		if (majorHit) onQTE(config.majorMod);
		else if (minorHit) onQTE(config.minorMod);
		if (majorHit || minorHit) successes = successes + 1;
		clicks = clicks + 1;
		finishIfNeeded();
	}
</script>

<div class="qteContainer" style={sizeCqw != null ? `--container-size:${sizeCqw}cqw;` : ''}>
	<button
		bind:this={btnRef}
		class="qteBtn"
		style="--angle:{((timer / config.duration) * 360).toFixed(2)}deg;"
		onclick={() => {
			checkClick();
		}}
	>
		<img src="/finger.png" alt="finger" />
		{#each arcs as center}
			<div
				class="arc"
				style="--path: '{buildArc(center, config.major / 2)}'; --color: var(--border2); z-index: 2;"
			></div>

			<div
				class="arc"
				style="--path: '{buildArc(
					center,
					(config.minor + config.major) / 2
				)}'; --color: var(--border); z-index: 1;"
			></div>
		{/each}

		<!-- Full ring matching arc geometry, rendered under segments -->
		<div
			class="arc full-ring"
			style="--path: '{buildRingPath()}'; --color: var(--border); z-index: 0;"
		></div>
	</button>
</div>

<style>
	* {
		image-rendering: smooth;
	}

	.qteContainer {
		position: relative;
		--container-size: 5.5cqw;
		--btn-size: calc(var(--container-size) * 0.8888889);
		width: var(--container-size);
		height: var(--container-size);
		background-color: var(--bg-trans);
		border-radius: 50%;
	}

	.arc {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		background-color: var(--color);
		width: var(--btn-size);
		height: var(--btn-size);
		clip-path: path(var(--path));
	}

	.qteBtn {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		border-radius: 50%;
		width: var(--btn-size);
		height: var(--btn-size);
		background-color: var(--bg);
		border: 0;
		cursor: pointer;
	}

	.qteBtn::before {
		display: none;
	}

	.qteBtn::after {
		content: '';
		position: absolute;
		left: 50%;
		top: 50%;
		transform-origin: center;
		transform: translate(-50%, -50%) rotate(var(--angle));
		width: calc(var(--btn-size) * 0.05);
		height: calc(100% + (var(--btn-size) * 0.075));
		box-sizing: border-box;
		border-top: calc(var(--btn-size) * 0.225) solid var(--header);
		z-index: 10;
	}

	.qteBtn > img {
		width: calc(var(--btn-size) * 0.5);
		height: calc(var(--btn-size) * 0.5);
		position: absolute;
		left: 46%;
		top: 47%;
		transform: translate(-50%, -50%);
		z-index: 20;
		pointer-events: none;
	}

	@container (max-width: 640px) {
		.qteContainer {
			--container-size: 14cqw;
		}
	}
	@container (max-width: 400px) {
		.qteContainer {
			--container-size: 15cqw;
		}
	}
</style>
