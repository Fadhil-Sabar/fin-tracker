<script lang="ts">
	import { onMount } from 'svelte';
	import { createStore } from '$lib/stores.svelte';
	import SummaryCard from '$lib/components/SummaryCard.svelte';
	import DonutChart from '$lib/components/DonutChart.svelte';
	import TrendChart from '$lib/components/TrendChart.svelte';
	import TransactionTable from '$lib/components/TransactionTable.svelte';
	import { formatCurrencyShort, formatDate } from '$lib/utils';

	const store = createStore();
	const {
		loading,
		error,
		dashboardSummary,
		categoryBreakdown,
		monthlyTrend,
		filteredTransactions,
		loadTransactions
	} = store;

	let initialLoading = $state(true);

	onMount(() => {
		// Give a brief loading state on first load
		const unsub = $effect.root(() => {
			$effect(() => {
				if (!loading && initialLoading) {
					setTimeout(() => { initialLoading = false; }, 300);
				}
			});
		});
		return () => unsub();
	});

	const summary = $derived(dashboardSummary);
	const categories = $derived(categoryBreakdown);
	const trend = $derived(monthlyTrend);
	const recentTxns = $derived(filteredTransactions.slice(0, 10));
</script>

{#if initialLoading}
	<!-- Skeleton Loading -->
	<div class="dashboard">
		<div class="cards-grid">
			{#each Array(4) as _}
				<div class="md-card" style="padding: 20px;">
					<div class="md-skeleton" style="width: 80px; height: 20px; margin-bottom: 12px;"></div>
					<div class="md-skeleton" style="width: 140px; height: 32px;"></div>
					<div class="md-skeleton" style="width: 100px; height: 14px; margin-top: 8px;"></div>
				</div>
			{/each}
		</div>
		<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px;">
			{#each Array(2) as _}
				<div class="md-card" style="padding: 20px; height: 320px;">
					<div class="md-skeleton" style="width: 160px; height: 20px; margin-bottom: 16px;"></div>
					<div class="md-skeleton" style="width: 100%; height: 240px;"></div>
				</div>
			{/each}
		</div>
	</div>
{:else if error}
	<!-- Error State -->
	<div class="error-state">
		<svg width="64" height="64" viewBox="0 0 24 24" fill="#EA4335">
			<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
		</svg>
		<h2>Gagal Memuat Data</h2>
		<p>{error}</p>
		<button class="retry-btn" onclick={() => loadTransactions()}>
			Coba Lagi
		</button>
	</div>
{:else}
	<!-- Dashboard Content -->
	<div class="dashboard">
		<!-- Summary Cards -->
		<div class="cards-grid">
			<SummaryCard
				title="Total Pemasukan"
				value={summary.totalIncome}
				delta={summary.lastMonthIncome > 0 ? Math.round(((summary.totalIncome - summary.lastMonthIncome) / summary.lastMonthIncome) * 100) : null}
				icon="trending_up"
				color="secondary"
			/>
			<SummaryCard
				title="Total Pengeluaran"
				value={summary.totalExpense}
				delta={summary.lastMonthExpense > 0 ? Math.round(((summary.totalExpense - summary.lastMonthExpense) / summary.lastMonthExpense) * 100) : null}
				icon="trending_down"
				color="error"
			/>
			<SummaryCard
				title="Saldo Bersih"
				value={summary.balance}
				icon="account_balance"
				color="primary"
			/>
			<SummaryCard
				title="Estimasi Tabungan"
				value={summary.savings}
				icon="savings"
				color="tertiary"
			/>
		</div>

		<!-- Charts Row -->
		<div class="charts-grid">
			<DonutChart data={categories} />
			<TrendChart data={trend} />
		</div>

		<!-- Recent Transactions -->
		<div class="recent-section" style="margin-top: 16px;">
			<TransactionTable transactions={recentTxns} maxRows={10} />
		</div>
	</div>
{/if}

<style>
	.dashboard {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.cards-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
	}
	.charts-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 16px;
	}
	.error-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 60px 20px;
		text-align: center;
		color: var(--md-on-surface-variant);
	}
	.error-state h2 {
		margin: 16px 0 8px;
		font-size: 1.25rem;
		color: var(--md-on-surface);
	}
	.error-state p {
		margin: 0 0 20px;
		font-size: 0.875rem;
	}
	.retry-btn {
		padding: 10px 24px;
		background: var(--md-primary);
		color: white;
		border: none;
		border-radius: var(--md-shape-full);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s ease;
	}
	.retry-btn:hover {
		opacity: 0.9;
		box-shadow: var(--md-elevation-1);
	}

	@media (min-width: 640px) {
		.cards-grid {
			grid-template-columns: repeat(4, 1fr);
			gap: 16px;
		}
	}
	@media (min-width: 1024px) {
		.charts-grid {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
