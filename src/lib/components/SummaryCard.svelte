<script lang="ts">
	import { formatCurrency } from '$lib/utils';

	let {
		title = '',
		value = 0,
		delta = null as number | null,
		icon = '',
		color = 'primary'
	}: {
		title: string;
		value: number;
		delta?: number | null;
		icon?: string;
		color?: 'primary' | 'secondary' | 'error' | 'tertiary';
	} = $props();

	const colors = {
		primary:   { bg: '#D2E3FC', text: '#1A73E8', glow: 'rgba(26,115,232,0.15)',  deltaUp: '#34A853', deltaDown: '#EA4335' },
		secondary: { bg: '#CEEAD6', text: '#34A853', glow: 'rgba(52,168,83,0.15)',   deltaUp: '#34A853', deltaDown: '#EA4335' },
		error:     { bg: '#FAD2CF', text: '#EA4335', glow: 'rgba(234,67,53,0.15)',   deltaUp: '#34A853', deltaDown: '#EA4335' },
		tertiary:  { bg: '#C3ECF0', text: '#0891A3', glow: 'rgba(8,145,163,0.15)',   deltaUp: '#34A853', deltaDown: '#EA4335' }
	};

	const palette = $derived(colors[color]);

	const deltaFormatted = $derived(
		delta !== null ? `${delta > 0 ? '+' : ''}${delta}% dari bulan lalu` : null
	);

	const deltaColor = $derived(
		delta !== null
			? (delta >= 0 ? palette.deltaUp : palette.deltaDown)
			: 'var(--md-on-surface-variant)'
	);

	const svgPaths: Record<string, string> = {
		trending_up:     'M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z',
		trending_down:   'M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z',
		account_balance: 'M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z',
		savings:         'M19.83 7.5l-2.27-2.27c.07-.42.18-.81.32-1.15.23-.56.56-1.06.97-1.5-.7-.37-1.5-.58-2.35-.58-1.64 0-3.09.79-4 2h-5C4.46 4 2 6.46 2 9.5S4.5 21 4.5 21H10v-2h2v2h5.5l1.68-5.59 2.82-.94V7.5h-2.17zM13 9H8V7h5v2zm3 2c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z'
	};

	// ── Count-up animation ──────────────────────────────────
	let displayValue = $state(0);
	let animFrame = 0;

	function animateTo(target: number) {
		cancelAnimationFrame(animFrame);
		const origin = displayValue;
		const duration = 750;
		const t0 = performance.now();

		function tick(now: number) {
			const elapsed = now - t0;
			const progress = Math.min(elapsed / duration, 1);
			// ease-out quart
			const eased = 1 - Math.pow(1 - progress, 4);
			displayValue = Math.round(origin + (target - origin) * eased);
			if (progress < 1) {
				animFrame = requestAnimationFrame(tick);
			} else {
				displayValue = target;
			}
		}

		animFrame = requestAnimationFrame(tick);
	}

	$effect(() => {
		animateTo(value);
		return () => cancelAnimationFrame(animFrame);
	});
</script>

<div
	class="md-card summary-card"
	style="--accent: {palette.text}; --accent-bg: {palette.bg}; --accent-glow: {palette.glow};"
>
	<div class="summary-header">
		<span class="summary-icon">
			<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
				<path d={svgPaths[icon] || svgPaths.trending_up} />
			</svg>
		</span>
		<span class="summary-title">{title}</span>
	</div>
	<div class="summary-value tabular-nums">{formatCurrency(displayValue)}</div>
	{#if deltaFormatted}
		<div class="summary-delta" style="color: {deltaColor}">
			{deltaFormatted}
		</div>
	{/if}
</div>

<style>
	.summary-card {
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		border-left: 3px solid var(--accent);
		transition:
			transform var(--anim-normal) cubic-bezier(0.2, 0, 0, 1),
			box-shadow var(--anim-normal) cubic-bezier(0.2, 0, 0, 1);
	}

	.summary-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--md-elevation-2);
	}

	.summary-header {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.summary-icon {
		width: 36px;
		height: 36px;
		border-radius: 10px;
		background: var(--accent-bg);
		color: var(--accent);
		box-shadow: 0 0 0 4px var(--accent-glow);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: box-shadow var(--anim-normal) ease;
	}

	.summary-card:hover .summary-icon {
		box-shadow: 0 0 0 7px var(--accent-glow);
	}

	.summary-title {
		font-size: 0.8125rem;
		color: var(--md-on-surface-variant);
		font-weight: 500;
		line-height: 1.3;
	}

	.summary-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--md-on-surface);
		letter-spacing: -0.03em;
		line-height: 1.2;
	}

	.summary-delta {
		font-size: 0.75rem;
		font-weight: 500;
		line-height: 1;
	}

	@media (min-width: 1024px) {
		.summary-value {
			font-size: 1.625rem;
		}
	}
</style>
