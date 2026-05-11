<script lang="ts">
	import { Chart, registerables } from 'chart.js';
	import { onMount } from 'svelte';
	import type { CategoryBreakdown } from '$lib/utils';

	Chart.register(...registerables);

	let {
		data = [] as CategoryBreakdown[],
		title = 'Pengeluaran per Kategori'
	} = $props();

	let canvas = $state<HTMLCanvasElement | null>(null);
	let chart: Chart | null = null;

	// Category colors (M3 palette)
	const COLORS = [
		'#1A73E8', '#34A853', '#EA4335', '#FBBC04',
		'#0891A3', '#7C4DFF', '#FF6D01', '#C5221F',
		'#185ABC', '#137333', '#E37400', '#9334E6'
	];

	function buildChart() {
		if (!canvas) return;

		if (chart) {
			chart.destroy();
		}

		const labels = data.map((d) => d.category.charAt(0).toUpperCase() + d.category.slice(1));
		const values = data.map((d) => d.total);
		const colors = data.map((_, i) => COLORS[i % COLORS.length]);

		chart = new Chart(canvas, {
			type: 'doughnut',
			data: {
				labels,
				datasets: [{
					data: values,
					backgroundColor: colors,
					borderWidth: 2,
					borderColor: '#FFFFFF',
					hoverOffset: 8
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				cutoff: 0.6,
				plugins: {
					legend: {
						position: 'bottom',
						labels: {
							padding: 16,
							usePointStyle: true,
							pointStyleWidth: 10,
							font: { family: 'DM Sans', size: 12 },
							color: '#5F6368'
						}
					},
					tooltip: {
						backgroundColor: '#323232',
						titleFont: { family: 'DM Sans', size: 13 },
						bodyFont: { family: 'DM Sans', size: 12 },
						padding: 12,
						cornerRadius: 8,
						callbacks: {
							label: function(context) {
								const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
								const val = context.parsed as number;
								const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
								const formatted = new Intl.NumberFormat('id-ID', {
									style: 'currency',
									currency: 'IDR',
									minimumFractionDigits: 0
								}).format(val);
								return ` ${formatted} (${pct}%)`;
							}
						}
					}
				}
			}
		});
	}

	$effect(() => {
		// React to data changes
		data;
		if (canvas) {
			buildChart();
		}
	});

	onMount(() => {
		if (data.length > 0 && canvas) {
			buildChart();
		}
	});

	$effect(() => {
		return () => {
			if (chart) {
				chart.destroy();
				chart = null;
			}
		};
	});
</script>

<div class="chart-section">
	<h3 class="chart-title">{title}</h3>
	<div class="chart-wrapper">
		{#if data.length === 0}
			<div class="empty-state">
				<svg width="48" height="48" viewBox="0 0 24 24" fill="#DADCE0">
					<path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
				</svg>
				<p>Tidak ada data pengeluaran bulan ini</p>
			</div>
		{:else}
			<canvas bind:this={canvas}></canvas>
		{/if}
	</div>
</div>

<style>
	.chart-section {
		background: var(--md-surface);
		border-radius: var(--md-shape-medium);
		box-shadow: var(--md-elevation-1);
		padding: 20px;
	}
	.chart-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--md-on-surface);
		margin: 0 0 16px 0;
	}
	.chart-wrapper {
		height: 280px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	canvas {
		max-height: 260px;
	}
	.empty-state {
		text-align: center;
		color: var(--md-on-surface-variant);
		font-size: 0.875rem;
	}
	.empty-state svg {
		margin-bottom: 8px;
	}
	.empty-state p {
		margin: 0;
	}
</style>
