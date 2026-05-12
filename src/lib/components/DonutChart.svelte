<script lang="ts">
	import { Chart, registerables } from 'chart.js';
	import { onMount } from 'svelte';
	import type { CategoryBreakdown } from '$lib/utils';
	import { formatCurrencyShort } from '$lib/utils';

	Chart.register(...registerables);

	let {
		data = [] as CategoryBreakdown[],
		title = 'Pengeluaran per Kategori'
	} = $props();

	let canvas = $state<HTMLCanvasElement | null>(null);
	let chart: Chart | null = null;

	const COLORS = [
		'#B5653C', '#6B8F4E', '#C33B2A', '#C08050',
		'#D4B096', '#A3C48A', '#D98A6F', '#E6C39A',
		'#8F735F', '#7CA86E', '#BF553E', '#B3927A'
	];

	// Plugin: draw total amount in the donut center
	const centerTextPlugin = {
		id: 'centerText',
		afterDraw(ch: Chart) {
			const { ctx, chartArea } = ch;
			if (!chartArea) return;
			const ds = ch.data.datasets[0];
			if (!ds) return;
			const values = ds.data as number[];
			const total = values.reduce((a, b) => a + b, 0);
			if (total === 0) return;

			const cx = (chartArea.left + chartArea.right) / 2;
			const cy = (chartArea.top + chartArea.bottom) / 2;

			ctx.save();
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';

			ctx.font = '500 11px "DM Sans", sans-serif';
			ctx.fillStyle = '#716257';
			ctx.fillText('Total', cx, cy - 11);

			ctx.font = 'bold 14px "DM Sans", sans-serif';
			ctx.fillStyle = '#36271D';
			ctx.fillText(formatCurrencyShort(total), cx, cy + 9);

			ctx.restore();
		}
	};

	function buildChart() {
		if (!canvas) return;
		if (chart) chart.destroy();

		const labels = data.map((d) => d.category.charAt(0).toUpperCase() + d.category.slice(1));
		const values = data.map((d) => d.total);
		const bgColors = data.map((_, i) => COLORS[i % COLORS.length]);

		chart = new Chart(canvas, {
			type: 'doughnut',
			plugins: [centerTextPlugin],
			data: {
				labels,
				datasets: [{
					data: values,
					backgroundColor: bgColors,
					borderWidth: 0,
					hoverOffset: 6,
					hoverBorderWidth: 2,
					hoverBorderColor: '#fff'
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				cutout: '65%',
				animation: {
					animateRotate: true,
					animateScale: true,
					duration: 600,
					easing: 'easeOutQuart'
				},
				plugins: {
					legend: {
						position: 'bottom',
						labels: {
							padding: 14,
							usePointStyle: true,
							pointStyleWidth: 8,
							font: { family: 'DM Sans', size: 12 },
							color: '#716257'
						}
					},
					tooltip: {
						backgroundColor: '#2d2d2d',
						titleFont: { family: 'DM Sans', size: 13, weight: 'bold' },
						bodyFont: { family: 'DM Sans', size: 12 },
						padding: 12,
						cornerRadius: 10,
						displayColors: true,
						boxWidth: 10,
						boxHeight: 10,
						callbacks: {
							label(context) {
								const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
								const val = context.parsed as number;
								const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
								const formatted = new Intl.NumberFormat('id-ID', {
									style: 'currency',
									currency: 'IDR',
									minimumFractionDigits: 0
								}).format(val);
								return ` ${formatted}  (${pct}%)`;
							}
						}
					}
				}
			}
		});
	}

	$effect(() => {
		data;
		if (canvas) buildChart();
	});

	onMount(() => {
		if (data.length > 0 && canvas) buildChart();
	});

	$effect(() => {
		return () => {
			if (chart) { chart.destroy(); chart = null; }
		};
	});
</script>

<div class="chart-section">
	<h3 class="chart-title">{title}</h3>
	<div class="chart-wrapper">
		{#if data.length === 0}
			<div class="empty-state">
				<svg width="44" height="44" viewBox="0 0 24 24" fill="#CEC3B6">
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
		animation: chart-enter var(--anim-slow) cubic-bezier(0.2, 0, 0, 1) both;
	}

	@keyframes chart-enter {
		from { opacity: 0; transform: scale(0.97); }
		to   { opacity: 1; transform: scale(1); }
	}

	.chart-title {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--md-on-surface);
		margin: 0 0 16px;
		letter-spacing: -0.01em;
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
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}

	.empty-state p {
		margin: 0;
	}
</style>
