<script lang="ts">
	import { formatCurrency, formatDateShort } from '$lib/utils';
	import type { Transaction } from '$lib/utils';

	let {
		transactions = [] as Transaction[],
		maxRows = 10
	} = $props();

	let sortField = $state<'date' | 'amount'>('date');
	let sortDir = $state<'asc' | 'desc'>('desc');

	const sorted = $derived.by(() => {
		const sorted = [...transactions];
		sorted.sort((a, b) => {
			let cmp: number;
			if (sortField === 'date') {
				cmp = a.date.localeCompare(b.date);
			} else {
				cmp = a.amount - b.amount;
			}
			return sortDir === 'desc' ? -cmp : cmp;
		});
		return sorted.slice(0, maxRows);
	});

	function toggleSort(field: 'date' | 'amount') {
		if (sortField === field) {
			sortDir = sortDir === 'desc' ? 'asc' : 'desc';
		} else {
			sortField = field;
			sortDir = 'desc';
		}
	}

	function sortIcon(field: string): string {
		if (sortField !== field) return '';
		return sortDir === 'desc' ? ' ↓' : ' ↑';
	}
</script>

<div class="table-section">
	<div class="table-header">
		<h3 class="table-title">Transaksi Terbaru</h3>
	</div>

	{#if transactions.length === 0}
		<div class="empty-state">
			<svg width="48" height="48" viewBox="0 0 24 24" fill="#DADCE0">
				<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
			</svg>
			<p>Belum ada transaksi</p>
		</div>
	{:else}
		<div class="table-scroll">
			<table class="transaction-table">
				<thead>
					<tr>
						<th onclick={() => toggleSort('date')} role="button" tabindex="0">
							Tanggal{sortIcon('date')}
						</th>
						<th>Kategori</th>
						<th class="hide-mobile">Keterangan</th>
						<th onclick={() => toggleSort('amount')} role="button" tabindex="0" class="amount-col">
							Jumlah{sortIcon('amount')}
						</th>
					</tr>
				</thead>
				<tbody>
					{#each sorted as txn (txn.date + txn.amount + txn.detail)}
						<tr>
							<td class="date-cell">{formatDateShort(txn.date)}</td>
							<td>
								<span
									class="category-badge"
									class:expense={txn.type === 'expense'}
									class:income={txn.type === 'income'}
								>
									{txn.category}
								</span>
							</td>
							<td class="detail-cell hide-mobile">{txn.detail || '—'}</td>
							<td class="amount-cell tabular-nums" class:expense={txn.type === 'expense'} class:income={txn.type === 'income'}>
								{txn.type === 'expense' ? '−' : '+'}{formatCurrency(txn.amount)}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<style>
	.table-section {
		background: var(--md-surface);
		border-radius: var(--md-shape-medium);
		box-shadow: var(--md-elevation-1);
		padding: 20px;
	}
	.table-header {
		margin-bottom: 16px;
	}
	.table-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--md-on-surface);
		margin: 0;
	}
	.table-scroll {
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
	}
	.transaction-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
	}
	.transaction-table th {
		text-align: left;
		padding: 10px 12px;
		font-weight: 600;
		color: var(--md-on-surface-variant);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		border-bottom: 1px solid var(--md-outline);
		cursor: pointer;
		user-select: none;
		white-space: nowrap;
	}
	.transaction-table th:hover {
		color: var(--md-on-surface);
	}
	.transaction-table td {
		padding: 12px;
		border-bottom: 1px solid var(--md-outline-variant);
		vertical-align: middle;
	}
	.transaction-table tr:last-child td {
		border-bottom: none;
	}
	.transaction-table tr:hover {
		background: var(--md-surface-container);
	}
	.date-cell {
		color: var(--md-on-surface);
		font-weight: 500;
		white-space: nowrap;
	}
	.detail-cell {
		color: var(--md-on-surface-variant);
		max-width: 200px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.amount-cell {
		font-weight: 600;
		text-align: right;
		white-space: nowrap;
	}
	.amount-cell.expense {
		color: var(--md-error);
	}
	.amount-cell.income {
		color: var(--md-secondary);
	}
	.amount-col {
		text-align: right;
	}
	.category-badge {
		display: inline-block;
		padding: 2px 8px;
		border-radius: var(--md-shape-full);
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: capitalize;
	}
	.category-badge.expense {
		background: var(--md-error-container);
		color: var(--md-error);
	}
	.category-badge.income {
		background: var(--md-secondary-container);
		color: var(--md-on-secondary-container);
	}
	.empty-state {
		text-align: center;
		padding: 40px 20px;
		color: var(--md-on-surface-variant);
		font-size: 0.875rem;
	}
	.empty-state svg {
		margin-bottom: 8px;
	}
	.empty-state p {
		margin: 0;
	}
	.hide-mobile {
		display: none;
	}
	@media (min-width: 640px) {
		.hide-mobile {
			display: table-cell;
		}
	}
</style>
