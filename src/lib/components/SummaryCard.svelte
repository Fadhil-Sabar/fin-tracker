<script lang="ts">
	import { formatCurrency, formatCurrencyShort } from '$lib/utils';

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
		primary: { bg: '#D2E3FC', text: '#1A73E8', deltaUp: '#34A853', deltaDown: '#EA4335' },
		secondary: { bg: '#CEEAD6', text: '#34A853', deltaUp: '#34A853', deltaDown: '#EA4335' },
		error: { bg: '#FAD2CF', text: '#EA4335', deltaUp: '#34A853', deltaDown: '#EA4335' },
		tertiary: { bg: '#C3ECF0', text: '#0891A3', deltaUp: '#34A853', deltaDown: '#EA4335' }
	};

	const palette = $derived(colors[color]);

	const deltaFormatted = $derived(
		delta !== null ? `${delta > 0 ? '+' : ''}${delta}% dari bulan lalu` : null
	);

	const deltaColor = $derived(
		delta !== null ? (delta >= 0 ? palette.deltaUp : palette.deltaDown) : 'var(--md-on-surface-variant)'
	);

	const svgPaths: Record<string, string> = {
		trending_up: 'M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z',
		trending_down: 'M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z',
		account_balance: 'M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z',
		savings: 'M19.83 7.5l-2.27-2.27c.07-.42.18-.81.32-1.15.23-.56.56-1.06.97-1.5-.7-.37-1.5-.58-2.35-.58-1.64 0-3.09.79-4 2h-5C4.46 4 2 6.46 2 9.5S4.5 21 4.5 21H10v-2h2v2h5.5l1.68-5.59 2.82-.94V7.5h-2.17zM13 9H8V7h5v2zm3 2c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z'
	};
</script>

<div class="md-card summary-card" style="border-left: 4px solid {palette.text};">
	<div class="summary-header">
		<span class="summary-icon" style="background: {palette.bg}; color: {palette.text};">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
				<path d={svgPaths[icon] || svgPaths.trending_up} />
			</svg>
		</span>
		<span class="summary-title">{title}</span>
	</div>
	<div class="summary-value tabular-nums">{formatCurrency(value)}</div>
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
	}
	.summary-header {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.summary-icon {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	.summary-title {
		font-size: 0.875rem;
		color: var(--md-on-surface-variant);
		font-weight: 500;
	}
	.summary-value {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--md-on-surface);
		letter-spacing: -0.02em;
		line-height: 1.2;
	}
	.summary-delta {
		font-size: 0.75rem;
		font-weight: 500;
	}
</style>
