<script lang="ts">
	import { formatCurrency } from '$lib/utils';

	let {
		title = '',
		value = 0,
		deltaLabel = null as string | null,
		icon = '',
		color = 'primary'
	}: {
		title: string;
		value: number;
		deltaLabel?: string | null;
		icon?: string;
		color?: 'primary' | 'secondary' | 'error' | 'tertiary';
	} = $props();

	const colors = {
		primary:   { bar: '#B5653C', bg: '#F3DCCF', text: '#3D2214' },
		secondary: { bar: '#6B8F4E', bg: '#DEE8D2', text: '#1F2E12' },
		error:     { bar: '#C33B2A', bg: '#F5D6D0', text: '#520F08' },
		tertiary:  { bar: '#C08050', bg: '#F4E1CD', text: '#3E2110' }
	};

	const palette = $derived(colors[color]);
	const valueColor = $derived(color === 'primary' ? 'var(--md-primary)' : color === 'secondary' ? 'var(--md-secondary)' : color === 'error' ? 'var(--md-error)' : 'var(--md-tertiary)');

	const svgPaths: Record<string, string> = {
		trending_up:     'M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z',
		trending_down:   'M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z',
		account_balance: 'M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z',
		savings:         'M19.83 7.5l-2.27-2.27c.07-.42.18-.81.32-1.15.23-.56.56-1.06.97-1.5-.7-.37-1.5-.58-2.35-.58-1.64 0-3.09.79-4 2h-5C4.46 4 2 6.46 2 9.5S4.5 21 4.5 21H10v-2h2v2h5.5l1.68-5.59 2.82-.94V7.5h-2.17zM13 9H8V7h5v2zm3 2c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z'
	};

	// ── Count-up animation ──
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
	style="--card-accent: {palette.bar}; --card-accent-bg: {palette.bg};"
>
	<div class="accent-bar"></div>
	<div class="card-body">
		<div class="card-top">
			<span class="card-label">{title}</span>
			<div class="card-icon" style="background: {palette.bg}; color: {palette.bar};">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
					<path d={svgPaths[icon] || svgPaths.trending_up} />
				</svg>
			</div>
		</div>
		<div class="card-value tabular-nums" style="color: {valueColor}">
			{formatCurrency(displayValue)}
		</div>
		{#if deltaLabel}
			<div class="card-delta">{deltaLabel}</div>
		{/if}
	</div>
</div>

<style>
	.summary-card {
		display: flex;
		flex-direction: column;
		overflow: hidden;
		transition:
			transform var(--anim-normal) cubic-bezier(0.2, 0, 0, 1),
			box-shadow var(--anim-normal) cubic-bezier(0.2, 0, 0, 1);
	}

	.summary-card:hover {
		transform: translateY(-3px);
		box-shadow: var(--md-elevation-3);
	}

	.accent-bar {
		height: 3px;
		background: var(--card-accent);
		flex-shrink: 0;
	}

	.card-body {
		padding: 18px 20px 20px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.card-top {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
	}

	.card-label {
		font-size: 0.75rem;
		color: var(--md-on-surface-variant);
		font-weight: 500;
		line-height: 1.3;
	}

	.card-icon {
		width: 32px;
		height: 32px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: transform var(--anim-fast) ease;
	}

	.summary-card:hover .card-icon {
		transform: scale(1.08);
	}

	.card-value {
		font-size: 1.5rem;
		font-weight: 700;
		letter-spacing: -0.03em;
		line-height: 1.2;
	}

	.card-delta {
		font-size: 0.6875rem;
		font-weight: 500;
		color: var(--md-on-surface-variant);
		line-height: 1;
	}

	@media (min-width: 1024px) {
		.card-value {
			font-size: 1.625rem;
		}
	}
</style>
