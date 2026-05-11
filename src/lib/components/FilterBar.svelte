<script lang="ts">
	import type { FilterState } from '$lib/stores.svelte';

	let {
		categories = [] as string[],
		activeFilters = {} as FilterState,
		onFilter = (_update: Partial<FilterState>) => {}
	} = $props();

	const typeOptions = [
		{ value: 'all',     label: 'Semua' },
		{ value: 'expense', label: 'Pengeluaran' },
		{ value: 'income',  label: 'Pemasukan' }
	];
</script>

<div class="filter-bar">
	<!-- Type chips -->
	<div class="filter-group">
		<span class="filter-label">Tipe</span>
		<div class="chip-row">
			{#each typeOptions as opt}
				<button
					class="md-chip"
					class:active={activeFilters.type === opt.value}
					onclick={() => onFilter({ type: opt.value as FilterState['type'] })}
				>
					{opt.label}
				</button>
			{/each}
		</div>
	</div>

	<!-- Category chips -->
	{#if categories.length > 0}
		<div class="filter-group">
			<span class="filter-label">Kategori</span>
			<div class="chip-row">
				<button
					class="md-chip"
					class:active={!activeFilters.category}
					onclick={() => onFilter({ category: '' })}
				>
					Semua
				</button>
				{#each categories as cat}
					<button
						class="md-chip"
						class:active={activeFilters.category === cat}
						onclick={() => onFilter({ category: cat })}
					>
						{cat.charAt(0).toUpperCase() + cat.slice(1)}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.filter-bar {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.filter-label {
		font-size: 0.6875rem;
		font-weight: 700;
		color: var(--md-on-surface-variant);
		text-transform: uppercase;
		letter-spacing: 0.07em;
	}

	.chip-row {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
</style>
