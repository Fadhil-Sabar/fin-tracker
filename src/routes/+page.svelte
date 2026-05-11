<script lang="ts">
	import { onMount } from 'svelte';
	import { createStore } from '$lib/stores.svelte';
	import SummaryCard from '$lib/components/SummaryCard.svelte';
	import DonutChart from '$lib/components/DonutChart.svelte';
	import TrendChart from '$lib/components/TrendChart.svelte';
	import TransactionTable from '$lib/components/TransactionTable.svelte';

	const store = createStore();

	const loading     = $derived(store.loading);
	const error       = $derived(store.error);
	const summary     = $derived(store.dashboardSummary);
	const categories  = $derived(store.categoryBreakdown);
	const trend       = $derived(store.monthlyTrend);
	const recentTxns  = $derived(store.filteredTransactions.slice(0, 10));
	const loadTransactions = store.loadTransactions;

	let initialLoading = $state(true);

	onMount(() => {
		const unsub = $effect.root(() => {
			$effect(() => {
				if (!loading && initialLoading) {
					setTimeout(() => { initialLoading = false; }, 300);
				}
			});
		});
		return () => unsub();
	});
</script>

{#if initialLoading}
	<!-- Skeleton -->
	<div class="dashboard">
		<div class="cards-grid">
			{#each Array(4) as _}
				<div class="md-card skeleton-card">
					<div class="md-skeleton" style="width: 70px; height: 12px; margin-bottom: 14px;"></div>
					<div class="md-skeleton" style="width: 130px; height: 28px; margin-bottom: 10px;"></div>
					<div class="md-skeleton" style="width: 90px; height: 11px;"></div>
				</div>
			{/each}
		</div>
		<div class="charts-grid">
			{#each Array(2) as _}
				<div class="md-card skeleton-chart">
					<div class="md-skeleton" style="width: 150px; height: 16px; margin-bottom: 20px;"></div>
					<div class="md-skeleton" style="width: 100%; height: 230px; border-radius: var(--md-shape-small);"></div>
				</div>
			{/each}
		</div>
		<div class="md-card skeleton-chart" style="margin-top: 0;">
			<div class="md-skeleton" style="width: 160px; height: 16px; margin-bottom: 20px;"></div>
			{#each Array(5) as _}
				<div class="md-skeleton" style="height: 36px; margin-bottom: 8px; border-radius: 6px;"></div>
			{/each}
		</div>
	</div>

{:else if error}
	<!-- Error state -->
	<div class="error-state">
		<div class="error-icon">
			<svg width="32" height="32" viewBox="0 0 24 24" fill="var(--md-error)">
				<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
			</svg>
		</div>
		<h2 class="error-title">Gagal Memuat Data</h2>
		<p class="error-msg">{error}</p>
		<button class="retry-btn" onclick={() => loadTransactions()}>
			Coba Lagi
		</button>
	</div>

{:else}
	<!-- Dashboard content -->
	<div class="dashboard">
		<!-- Summary Cards -->
		<div class="cards-grid">
			<div class="card-enter" style="--delay: 0ms;">
				<SummaryCard
					title="Total Pemasukan"
					value={summary.totalIncome}
					delta={summary.lastMonthIncome > 0
						? Math.round(((summary.totalIncome - summary.lastMonthIncome) / summary.lastMonthIncome) * 100)
						: null}
					icon="trending_up"
					color="secondary"
				/>
			</div>
			<div class="card-enter" style="--delay: 70ms;">
				<SummaryCard
					title="Total Pengeluaran"
					value={summary.totalExpense}
					delta={summary.lastMonthExpense > 0
						? Math.round(((summary.totalExpense - summary.lastMonthExpense) / summary.lastMonthExpense) * 100)
						: null}
					icon="trending_down"
					color="error"
				/>
			</div>
			<div class="card-enter" style="--delay: 140ms;">
				<SummaryCard
					title="Saldo Bersih"
					value={summary.balance}
					icon="account_balance"
					color="primary"
				/>
			</div>
			<div class="card-enter" style="--delay: 210ms;">
				<SummaryCard
					title="Estimasi Tabungan"
					value={summary.savings}
					icon="savings"
					color="tertiary"
				/>
			</div>
		</div>

		<!-- Charts -->
		<div class="charts-grid">
			<DonutChart data={categories} />
			<TrendChart data={trend} />
		</div>

		<!-- Recent Transactions -->
		<div class="recent-section">
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

	/* Wrapper that drives staggered entrance */
	.card-enter {
		animation: card-in var(--anim-slow) cubic-bezier(0.2, 0, 0, 1) both;
		animation-delay: var(--delay, 0ms);
	}

	/* Make the card fill its wrapper */
	.card-enter :global(.summary-card) {
		height: 100%;
	}

	@keyframes card-in {
		from { opacity: 0; transform: translateY(10px); }
		to   { opacity: 1; transform: translateY(0); }
	}

	.charts-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 16px;
	}

	/* Skeleton variants */
	.skeleton-card {
		padding: 20px;
	}

	.skeleton-chart {
		padding: 20px;
	}

	/* Error */
	.error-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 64px 20px;
		text-align: center;
		color: var(--md-on-surface-variant);
		gap: 8px;
	}

	.error-icon {
		width: 64px;
		height: 64px;
		background: var(--md-error-container);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 8px;
	}

	.error-title {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--md-on-surface);
	}

	.error-msg {
		margin: 0;
		font-size: 0.875rem;
		max-width: 360px;
	}

	.retry-btn {
		margin-top: 8px;
		padding: 10px 28px;
		background: var(--md-primary);
		color: white;
		border: none;
		border-radius: var(--md-shape-full);
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all var(--anim-fast) ease;
		font-family: inherit;
	}

	.retry-btn:hover {
		opacity: 0.88;
		box-shadow: var(--md-elevation-2);
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

		.dashboard {
			gap: 20px;
		}
	}
</style>
