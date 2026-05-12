<script lang="ts">
	import { Chart, registerables } from 'chart.js';
	import { onMount } from 'svelte';
	import type { MonthlyTrend } from '$lib/utils';

	Chart.register(...registerables);

	let {
		data = [] as MonthlyTrend[],
		title = 'Tren Bulanan'
	} = $props();

	let canvas = $state<HTMLCanvasElement | null>(null);
	let chart: Chart | null = null;

	function getMonthLabel(ym: string): string {
		const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
		const [, m] = ym.split('-').map(Number);
		return months[m - 1] || ym;
	}

	function buildChart() {
		if (!canvas) return;
		if (chart) chart.destroy();

		const ctx2d = canvas.getContext('2d')!;
		const h = canvas.parentElement?.clientHeight || 280;

		// Sage green gradient for income
		const incomeGrad = ctx2d.createLinearGradient(0, 0, 0, h);
		incomeGrad.addColorStop(0, 'rgba(107, 143, 78, 0.92)');
		incomeGrad.addColorStop(1, 'rgba(107, 143, 78, 0.52)');

		// Brick red gradient for expense
		const expenseGrad = ctx2d.createLinearGradient(0, 0, 0, h);
		expenseGrad.addColorStop(0, 'rgba(195, 59, 42, 0.92)');
		expenseGrad.addColorStop(1, 'rgba(195, 59, 42, 0.52)');

		const labels  = data.map((d) => getMonthLabel(d.month));
		const incomes  = data.map((d) => d.income);
		const expenses = data.map((d) => d.expense);

		chart = new Chart(canvas, {
			type: 'bar',
			data: {
				labels,
				datasets: [
					{
						label: 'Pemasukan',
						data: incomes,
						backgroundColor: incomeGrad,
						borderRadius: 6,
						borderSkipped: false
					},
					{
						label: 'Pengeluaran',
						data: expenses,
						backgroundColor: expenseGrad,
						borderRadius: 6,
						borderSkipped: false
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: { intersect: false, mode: 'index' },
				animation: {
					duration: 600,
					easing: 'easeOutQuart'
				},
				scales: {
					x: {
						grid: { display: false },
						border: { display: false },
						ticks: {
							font: { family: 'DM Sans', size: 11 },
							color: '#716257'
						}
					},
					y: {
						beginAtZero: true,
						grid: {
							color: '#DDD4C7',
							lineWidth: 1
						},
						border: { display: false, dash: [4, 4] },
						ticks: {
							font: { family: 'DM Sans', size: 11 },
							color: '#716257',
							maxTicksLimit: 5,
							callback(value) {
								const val = value as number;
								if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(0)}jt`;
								if (val >= 1_000)     return `${(val / 1_000).toFixed(0)}rb`;
								return val.toString();
							}
						}
					}
				},
				plugins: {
					legend: {
						position: 'bottom',
						labels: {
							padding: 16,
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
								const val = context.parsed.y as number;
								return ` ${context.dataset.label}: Rp${val.toLocaleString('id-ID')}`;
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
	<h3 class="chart-title">
		<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="color:var(--md-secondary)"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>
		{title}
	</h3>
	<div class="chart-wrapper">
		{#if data.length === 0}
			<div class="empty-state">
				<svg width="44" height="44" viewBox="0 0 24 24" fill="#CEC3B6">
					<path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
				</svg>
				<p>Belum ada data tren</p>
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
		padding: 22px;
		animation: chart-enter var(--anim-slow) cubic-bezier(0.2, 0, 0, 1) both;
		animation-delay: 80ms;
	}

	@keyframes chart-enter {
		from { opacity: 0; transform: scale(0.97); }
		to   { opacity: 1; transform: scale(1); }
	}

	.chart-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--md-on-surface);
		margin: 0 0 16px;
		display: flex;
		align-items: center;
		gap: 8px;
		letter-spacing: -0.01em;
	}

	.chart-wrapper {
		height: 250px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	canvas {
		max-height: 230px;
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
