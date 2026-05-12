<script lang="ts">
	import { formatCurrency, formatDateShort } from '$lib/utils';
	import type { Transaction } from '$lib/utils';

	let {
		transactions = [] as Transaction[],
		maxRows = 10
	} = $props();

	let sortField = $state<'date' | 'amount'>('date');
	let sortDir   = $state<'asc' | 'desc'>('desc');

	const sorted = $derived.by(() => {
		const arr = [...transactions];
		arr.sort((a, b) => {
			const cmp = sortField === 'date'
				? a.date.localeCompare(b.date)
				: a.amount - b.amount;
			return sortDir === 'desc' ? -cmp : cmp;
		});
		return arr.slice(0, maxRows);
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
		<h3 class="table-title">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="color:var(--md-on-surface-variant)"><path d="M18 17H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V7h12v2zM3 22l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20z"/></svg>
			Transaksi Terbaru
		</h3>
	</div>

	{#if transactions.length === 0}
		<div class="empty-state">
			<svg width="44" height="44" viewBox="0 0 24 24" fill="#CEC3B6">
				<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
			</svg>
			<p>Belum ada transaksi</p>
		</div>
	{:else}
		<!-- Desktop table -->
		<div class="table-scroll">
			<table class="transaction-table">
				<thead>
					<tr>
						<th onclick={() => toggleSort('date')} role="button" tabindex="0">
							Tanggal{sortIcon('date')}
						</th>
						<th>Kategori</th>
						<th class="hide-mobile">Keterangan</th>
						<th
							onclick={() => toggleSort('amount')}
							role="button"
							tabindex="0"
							class="amount-col"
						>
							Nominal{sortIcon('amount')}
						</th>
					</tr>
				</thead>
				<tbody>
					{#each sorted as txn, i (txn.date + txn.amount + txn.detail)}
						<tr style="animation-delay: {i * 45}ms;">
							<td class="date-cell" data-label="Tanggal">{formatDateShort(txn.date)}</td>
							<td data-label="Kategori">
								<span
									class="cat-tag"
									class:expense={txn.type === 'expense'}
									class:income={txn.type === 'income'}
								>
									{txn.category}
								</span>
							</td>
							<td class="detail-cell hide-mobile" data-label="Keterangan">
								{txn.detail || '—'}
							</td>
							<td
								class="amount-cell tabular-nums"
								class:expense={txn.type === 'expense'}
								class:income={txn.type === 'income'}
								data-label="Nominal"
							>
								{txn.type === 'expense' ? '' : '+'}{formatCurrency(txn.amount)}
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
		padding: 22px;
	}

	.table-header {
		margin-bottom: 16px;
	}

	.table-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--md-on-surface);
		margin: 0;
		display: flex;
		align-items: center;
		gap: 8px;
		letter-spacing: -0.01em;
	}

	.table-scroll {
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
	}

	/* ── Table ── */
	.transaction-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
	}

	.transaction-table th {
		text-align: left;
		padding: 10px 8px;
		font-weight: 700;
		color: var(--md-on-surface-variant);
		font-size: 0.6875rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		border-bottom: 1.5px solid var(--md-outline-variant);
		cursor: pointer;
		user-select: none;
		white-space: nowrap;
		transition: color var(--anim-fast) ease;
	}

	.transaction-table th:hover {
		color: var(--md-on-surface);
	}

	.transaction-table td {
		padding: 11px 8px;
		border-bottom: 1px solid var(--md-outline-variant);
		vertical-align: middle;
	}

	.transaction-table tr:last-child td {
		border-bottom: none;
	}

	.transaction-table tbody tr:hover td {
		background: var(--md-surface-container-low);
	}

	.transaction-table tbody tr {
		transition: background var(--anim-fast) ease;
		animation: row-in var(--anim-normal) ease both;
	}

	@keyframes row-in {
		from { opacity: 0; transform: translateY(6px); }
		to   { opacity: 1; transform: translateY(0); }
	}

	.transaction-table tbody tr:hover {
		background: var(--md-surface-container-low);
	}

	.date-cell {
		color: var(--md-on-surface-variant);
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

	.amount-cell.expense { color: var(--md-error); }
	.amount-cell.income  { color: var(--md-secondary); }

	.amount-col { text-align: right; }

	.cat-tag {
		display: inline-block;
		padding: 3px 10px;
		border-radius: var(--md-shape-full);
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: capitalize;
	}

	.cat-tag.expense {
		background: var(--md-error-container);
		color: var(--md-on-error);
	}

	.cat-tag.income {
		background: var(--md-secondary-container);
		color: var(--md-on-secondary-container);
	}

	.empty-state {
		text-align: center;
		padding: 40px 20px;
		color: var(--md-on-surface-variant);
		font-size: 0.875rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}

	.empty-state p { margin: 0; }

	/* ── Desktop only columns ── */
	.hide-mobile { display: none; }

	@media (min-width: 640px) {
		.hide-mobile { display: table-cell; }
	}

	/* ── Mobile: card-style rows ── */
	@media (max-width: 639px) {
		.table-scroll { overflow-x: unset; }

		.transaction-table,
		.transaction-table thead,
		.transaction-table tbody,
		.transaction-table tr {
			display: block;
		}

		.transaction-table thead { display: none; }

		.transaction-table tbody tr {
			background: var(--md-surface-container-low);
			border: 1px solid var(--md-outline-variant);
			border-radius: var(--md-shape-medium);
			margin-bottom: 8px;
			padding: 12px 14px;
			display: grid;
			grid-template-columns: 1fr auto;
			grid-template-areas:
				"category amount"
				"date     amount";
			gap: 4px 8px;
			align-items: center;
		}

		.transaction-table tbody tr:hover {
			background: var(--md-surface-container);
		}

		.transaction-table td {
			padding: 0;
			border: none;
			font-size: 0.875rem;
		}

		.transaction-table td[data-label="Tanggal"] {
			grid-area: date;
			font-size: 0.75rem;
			color: var(--md-on-surface-variant);
			font-weight: 400;
		}

		.transaction-table td[data-label="Kategori"] {
			grid-area: category;
		}

		.transaction-table td[data-label="Nominal"] {
			grid-area: amount;
			text-align: right;
			align-self: center;
		}
	}
</style>
