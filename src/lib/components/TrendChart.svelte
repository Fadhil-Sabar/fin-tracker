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

		if (chart) {
			chart.destroy();
		}

		const labels = data.map((d) => getMonthLabel(d.month));
		const incomes = data.map((d) => d.income);
		const expenses = data.map((d) => d.expense);

		chart = new Chart(canvas, {
			type: 'bar',
			data: {
				labels,
				datasets: [
					{
						label: 'Pemasukan',
						data: incomes,
						backgroundColor: '#34A853',
						borderRadius: 4,
						borderSkipped: false
					},
					{
						label: 'Pengeluaran',
						data: expenses,
						backgroundColor: '#EA4335',
						borderRadius: 4,
						borderSkipped: false
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: {
					intersect: false,
					mode: 'index'
				},
				scales: {
					x: {
						grid: { display: false },
						ticks: {
							font: { family: 'DM Sans', size: 11 },
							color: '#5F6368'
						}
					},
					y: {
						beginAtZero: true,
						grid: {
							color: '#E8EAED',
							drawBorder: false
						},
						ticks: {
							font: { family: 'DM Sans', size: 11 },
							color: '#5F6368',
							callback: function(value) {
								const val = value as number;
								if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(0)}jt`;
								if (val >= 1_000) return `${(val / 1_000).toFixed(0)}rb`;
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
