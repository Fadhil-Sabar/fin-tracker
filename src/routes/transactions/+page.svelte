<script lang="ts">
	import { createStore } from '$lib/stores.svelte';
	import TransactionTable from '$lib/components/TransactionTable.svelte';
	import FilterBar from '$lib/components/FilterBar.svelte';

	const store = createStore();
	const {
		filteredTransactions,
		allCategories,
		filters,
		setFilter,
		resetFilters
	} = store;
</script>

<div class="transactions-page">
	<!-- Search bar -->
	<div class="search-container">
		<svg width="20" height="20" viewBox="0 0 24 24" fill="#5F6368" class="search-icon">
			<path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
		</svg>
		<input
			type="text"
			class="search-input"
			placeholder="Cari transaksi..."
			bind:value={filters.search}
			oninput={() => setFilter({ search: filters.search })}
		/>
		{#if filters.search}
			<button class="clear-btn" onclick={() => setFilter({ search: '' })} aria-label="Hapus pencarian">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="#5F6368">
					<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
				</svg>
			</button>
		{/if}
	</div>

	<!-- Filter chips -->
	<div class="filters-section">
		<FilterBar
			categories={allCategories}
			activeFilters={filters}
			onFilter={(update) => setFilter(update)}
		/>
		<button class="reset-btn" onclick={resetFilters}>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
				<path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
			</svg>
			Reset
		</button>
	</div>

	<!-- Transaction count -->
	<div class="result-count">
		Menampilkan <strong>{filteredTransactions.length}</strong> transaksi
	</div>

	<!-- Transactions table (all rows) -->
	<TransactionTable transactions={filteredTransactions} maxRows={1000} />
</div>

<style>
	.transactions-page {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.search-container {
		display: flex;
		align-items: center;
		gap: 8px;
		background: var(--md-surface);
		border: 1px solid var(--md-outline);
		border-radius: var(--md-shape-full);
		padding: 8px 16px;
		transition: border-color 0.15s ease;
	}
	.search-container:focus-within {
		border-color: var(--md-primary);
		box-shadow: 0 0 0 1px var(--md-primary);
	}
	.search-icon {
		flex-shrink: 0;
	}
	.search-input {
		flex: 1;
		border: none;
		outline: none;
		font-size: 0.9375rem;
		font-family: 'DM Sans', sans-serif;
		color: var(--md-on-surface);
		background: transparent;
	}
	.search-input::placeholder {
		color: var(--md-on-surface-variant);
	}
	.clear-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
	}
	.clear-btn:hover {
		background: var(--md-surface-container);
	}
	.filters-section {
		display: flex;
		flex-direction: column;
		gap: 12px;
		position: relative;
	}
	.reset-btn {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 6px 12px;
		background: none;
		border: 1px solid var(--md-outline);
		border-radius: var(--md-shape-full);
		color: var(--md-on-surface-variant);
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
		align-self: flex-start;
	}
	.reset-btn:hover {
		background: var(--md-surface-container);
	}
	.result-count {
		font-size: 0.875rem;
		color: var(--md-on-surface-variant);
	}
	.result-count strong {
		color: var(--md-on-surface);
	}
</style>
