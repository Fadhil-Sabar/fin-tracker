<script lang="ts">
	import { onMount } from 'svelte';
	import { createStore } from '$lib/stores.svelte';
	import SummaryCard from '$lib/components/SummaryCard.svelte';
	import DonutChart from '$lib/components/DonutChart.svelte';
	import TrendChart from '$lib/components/TrendChart.svelte';
	import TransactionTable from '$lib/components/TransactionTable.svelte';
	import { getLastMonths, getMonthName, percentDiff } from '$lib/utils';

	const store = createStore();

	const loading = $derived(store.loading);
	const summary = $derived(store.dashboardSummary);
	const categoryData = $derived(store.categoryBreakdown);
	const trendData = $derived(store.monthlyTrend);
	const recentTxns = $derived(store.filteredTransactions.slice(0, 10));

	const months = getLastMonths(6);
	const currentMonth = new Date();
	const currentMonthLabel = `${getMonthName(currentMonth.getMonth())} ${currentMonth.getFullYear()}`;

	let selectedMonth = $state(currentMonthLabel);

	onMount(() => {
		store.loadTransactions();
	});
</script>

<div class="dashboard">
	<!-- Top Bar: Brand Title + Actions (sketch matching) -->
	<div class="top-bar">
		<h1 class="page-title"><span class="title-accent">Fin</span>Track</h1>
		<div class="top-actions">
			<button class="top-btn top-btn-secondary">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
					<path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/>
				</svg>
				Filter
			</button>
			<button class="top-btn top-btn-primary">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
					<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
				</svg>
				+ Tambah
			</button>
		</div>
	</div>

	<!-- Summary Cards Grid -->
	{#if loading}
		<div class="cards-grid">
			{#each Array(4) as _}
				<div class="md-card" style="padding: 20px;">
					<div class="md-skeleton" style="width: 40%; height: 14px; margin-bottom: 12px;"></div>
					<div class="md-skeleton" style="width: 65%; height: 24px; margin-bottom: 8px;"></div>
					<div class="md-skeleton" style="width: 30%; height: 12px;"></div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="cards-grid">
			<SummaryCard
				title="Total Pemasukan"
				value={summary.totalIncome}
				deltaLabel={percentDiff(summary.totalIncome, summary.lastMonthIncome) !== null
					? `▲ ${percentDiff(summary.totalIncome, summary.lastMonthIncome)}% dari bulan lalu`
					: null}
				icon="trending_up"
				color="secondary"
			/>
			<SummaryCard
				title="Total Pengeluaran"
				value={summary.totalExpense}
				deltaLabel={percentDiff(summary.totalExpense, summary.lastMonthExpense) !== null
					? `▲ ${percentDiff(summary.totalExpense, summary.lastMonthExpense)}% dari bulan lalu`
					: null}
				icon="trending_down"
				color="error"
			/>
			<SummaryCard
				title="Saldo Bersih"
				value={summary.balance}
				deltaLabel="● Sehat"
				icon="account_balance"
				color="primary"
			/>
			<SummaryCard
				title="Estimasi Tabungan"
				value={summary.savings}
				deltaLabel={summary.savings > 0 && summary.totalIncome > 0
					? `${Math.round((summary.savings / summary.totalIncome) * 100)}% dari penghasilan`
					: null}
				icon="savings"
				color="tertiary"
			/>
		</div>
	{/if}

	<!-- Charts Row -->
	<div class="charts-row">
		<div class="chart-col">
			<DonutChart data={categoryData} />
		</div>
		<div class="chart-col">
			<TrendChart data={trendData} />
		</div>
	</div>

	<!-- Recent Transactions -->
	<div class="recent-section">
		<TransactionTable transactions={recentTxns} maxRows={10} />
	</div>
</div>

<style>
	.dashboard {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	/* ── Top Bar (sketch: "Fin" primary + "Track") ── */
	.top-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 4px;
	}

	.page-title {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0;
		letter-spacing: -0.03em;
		color: var(--md-on-surface);
	}

	.title-accent {
		color: var(--md-primary);
	}

	.top-actions {
		display: flex;
		gap: 8px;
	}

	.top-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 8px 18px;
		border-radius: var(--md-shape-full);
		font-size: 0.8125rem;
		font-weight: 600;
		font-family: inherit;
		cursor: pointer;
		transition: all var(--anim-fast) cubic-bezier(0.2, 0, 0, 1);
		border: none;
	}

	.top-btn-primary {
		background: var(--md-primary);
		color: var(--md-on-primary);
	}

	.top-btn-primary:hover {
		background: #A05733;
		box-shadow: var(--md-elevation-2);
	}

	.top-btn-secondary {
		background: var(--md-surface-container);
		border: 1px solid var(--md-outline);
		color: var(--md-on-surface-variant);
	}

	.top-btn-secondary:hover {
		background: var(--md-surface-container-high);
	}

	/* ── Cards Grid ── */
	.cards-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 14px;
	}

	@media (min-width: 640px) {
		.cards-grid { grid-template-columns: repeat(2, 1fr); }
	}

	@media (min-width: 1024px) {
		.cards-grid { grid-template-columns: repeat(4, 1fr); }
	}

	/* ── Charts Row ── */
	.charts-row {
		display: grid;
		grid-template-columns: 1fr;
		gap: 18px;
	}

	.chart-col {
		overflow: hidden;
	}

	@media (min-width: 768px) {
		.charts-row { grid-template-columns: 1fr 1fr; }
	}

	.recent-section {
		/* card container handled by TransactionTable */
	}
</style>
