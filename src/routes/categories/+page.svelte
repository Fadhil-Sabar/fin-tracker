<script lang="ts">
	import { createStore } from '$lib/stores.svelte';
	import { formatCurrency, getMonthName } from '$lib/utils';

	const store = createStore();
	const {
		categoryBreakdown,
		filters,
		setFilter,
		loading
	} = store;

	const categories = $derived(categoryBreakdown);
	const totalExpense = $derived(categories.reduce((s, c) => s + c.total, 0));

	const now = new Date();
	const currentMonthLabel = `${getMonthName(now.getMonth())} ${now.getFullYear()}`;

	// Category colors
	const CAT_COLORS = [
		'#1A73E8', '#34A853', '#EA4335', '#FBBC04',
		'#0891A3', '#7C4DFF', '#FF6D01', '#C5221F',
		'#185ABC', '#137333', '#E37400', '#9334E6'
	];
</script>

<div class="categories-page">
	<!-- Header info -->
	<div class="page-info">
		<h2 class="page-info-title">Breakdown Pengeluaran</h2>
		<p class="page-info-sub">{currentMonthLabel}</p>
	</div>

	{#if loading}
		<div class="skeleton-list">
			{#each Array(5) as _}
				<div class="md-card" style="padding: 16px;">
					<div class="md-skeleton" style="width: 60%; height: 20px; margin-bottom: 12px;"></div>
					<div class="md-skeleton" style="width: 100%; height: 8px; margin-bottom: 8px;"></div>
					<div class="md-skeleton" style="width: 40%; height: 14px;"></div>
				</div>
			{/each}
		</div>
	{:else if categories.length === 0}
		<div class="empty-state">
			<svg width="64" height="64" viewBox="0 0 24 24" fill="#DADCE0">
				<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
			</svg>
			<h3>Belum Ada Pengeluaran</h3>
			<p>Tidak ada data pengeluaran untuk bulan ini.</p>
		</div>
	{:else}
		<!-- Category breakdown list -->
		<div class="category-list">
			{#each categories as cat, i}
				<div class="category-item md-card">
					<div class="cat-header">
						<div class="cat-info">
							<span class="cat-dot" style="background: {CAT_COLORS[i % CAT_COLORS.length]};"></span>
							<span class="cat-name">{cat.category.charAt(0).toUpperCase() + cat.category.slice(1)}</span>
							<span class="cat-count">{cat.count} transaksi</span>
						</div>
						<div class="cat-amount">
							<span class="cat-total">{formatCurrency(cat.total)}</span>
							<span class="cat-pct">{cat.percentage}%</span>
						</div>
					</div>
					<div class="progress-track">
						<div
							class="progress-fill"
							style="width: {cat.percentage}%; background: {CAT_COLORS[i % CAT_COLORS.length]};"
						></div>
					</div>
				</div>
			{/each}
		</div>

		<!-- Total summary -->
		<div class="total-section md-card">
			<div class="total-label">Total Pengeluaran</div>
			<div class="total-amount tabular-nums">{formatCurrency(totalExpense)}</div>
		</div>
	{/if}
</div>

<style>
	.categories-page {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.page-info {
		margin-bottom: 4px;
	}
	.page-info-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--md-on-surface);
		margin: 0;
	}
	.page-info-sub {
		font-size: 0.875rem;
		color: var(--md-on-surface-variant);
		margin: 2px 0 0;
	}
	.category-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.category-item {
		padding: 16px;
	}
	.cat-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 12px;
	}
	.cat-info {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}
	.cat-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		flex-shrink: 0;
	}
	.cat-name {
		font-size: 0.9375rem;
		font-weight: 500;
		color: var(--md-on-surface);
		text-transform: capitalize;
	}
	.cat-count {
		font-size: 0.75rem;
		color: var(--md-on-surface-variant);
	}
	.cat-amount {
		text-align: right;
	}
	.cat-total {
		display: block;
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--md-on-surface);
	}
	.cat-pct {
		font-size: 0.75rem;
		color: var(--md-on-surface-variant);
	}
	.progress-track {
		height: 8px;
		background: var(--md-surface-container-high);
		border-radius: var(--md-shape-full);
		overflow: hidden;
	}
	.progress-fill {
		height: 100%;
		border-radius: var(--md-shape-full);
		transition: width 0.6s ease;
	}
	.total-section {
		padding: 20px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: var(--md-primary);
		color: white;
	}
	.total-label {
		font-size: 0.9375rem;
		font-weight: 500;
	}
	.total-amount {
		font-size: 1.25rem;
		font-weight: 700;
	}
	.empty-state {
		text-align: center;
		padding: 60px 20px;
		color: var(--md-on-surface-variant);
	}
	.empty-state h3 {
		margin: 16px 0 8px;
		color: var(--md-on-surface);
	}
	.empty-state p {
		margin: 0;
		font-size: 0.875rem;
	}
	.skeleton-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
</style>
