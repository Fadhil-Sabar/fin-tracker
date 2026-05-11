/**
 * Global reactive stores for the finance tracker.
 * Uses Svelte 5 runes via .svelte.ts module.
 */
import type {
	Transaction,
	DashboardSummary,
	CategoryBreakdown,
	MonthlyTrend
} from './utils';

// ─── Types for filters ─────────────────────────────────────

export type FilterState = {
	type: 'all' | 'income' | 'expense';
	category: string;
	month: string;
	search: string;
};

// ─── Reactive State (Svelte 5 runes) ─────────────────────

let transactions = $state<Transaction[]>([]);
let loading = $state(true);
let error = $state<string | null>(null);
let filters = $state<FilterState>({
	type: 'all',
	category: '',
	month: '',
	search: ''
});
let snackbar = $state<string | null>(null);

// Get current month if none selected
function getCurrentMonth(): string {
	const now = new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// ─── Derived State ────────────────────────────────────────

const filteredTransactions = $derived.by(() => {
	let result = transactions;

	// Filter by type
	if (filters.type !== 'all') {
		result = result.filter((t) => t.type === filters.type);
	}

	// Filter by category
	if (filters.category) {
		result = result.filter((t) => t.category === filters.category);
	}

	// Filter by month
	const targetMonth = filters.month || getCurrentMonth();
	result = result.filter((t) => t.date.startsWith(targetMonth));

	// Filter by search text
	if (filters.search) {
		const q = filters.search.toLowerCase();
		result = result.filter(
			(t) =>
				t.detail.toLowerCase().includes(q) ||
				t.category.toLowerCase().includes(q)
		);
	}

	return result;
});

const dashboardSummary = $derived.by((): DashboardSummary => {
	const allData = transactions;

	// Current month
	const currentMonth = filters.month || getCurrentMonth();
	const currentData = allData.filter((t) => t.date.startsWith(currentMonth));

	const totalIncome = currentData
		.filter((t) => t.type === 'income')
		.reduce((sum, t) => sum + t.amount, 0);

	const totalExpense = currentData
		.filter((t) => t.type === 'expense')
		.reduce((sum, t) => sum + t.amount, 0);

	// Last month for comparison
	const [year, month] = currentMonth.split('-').map(Number);
	const lastMonthDate = new Date(year, month - 2, 1);
	const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;
	const lastMonthData = allData.filter((t) => t.date.startsWith(lastMonth));

	const lastMonthIncome = lastMonthData
		.filter((t) => t.type === 'income')
		.reduce((sum, t) => sum + t.amount, 0);

	const lastMonthExpense = lastMonthData
		.filter((t) => t.type === 'expense')
		.reduce((sum, t) => sum + t.amount, 0);

	// Savings: 20% of income (estimate)
	const savings = Math.round(totalIncome * 0.2);

	return {
		totalIncome,
		totalExpense,
		balance: totalIncome - totalExpense,
		savings,
		lastMonthIncome,
		lastMonthExpense
	};
});

const categoryBreakdown = $derived.by((): CategoryBreakdown[] => {
	const currentMonth = filters.month || getCurrentMonth();
	const expenseData = transactions.filter(
		(t) => t.type === 'expense' && t.date.startsWith(currentMonth)
	);

	const totals = new Map<string, number>();
	const counts = new Map<string, number>();
	let grandTotal = 0;

	for (const t of expenseData) {
		totals.set(t.category, (totals.get(t.category) || 0) + t.amount);
		counts.set(t.category, (counts.get(t.category) || 0) + 1);
		grandTotal += t.amount;
	}

	const breakdown: CategoryBreakdown[] = [];
	for (const [category, total] of totals) {
		breakdown.push({
			category,
			total,
			count: counts.get(category) || 0,
			percentage: grandTotal > 0 ? Math.round((total / grandTotal) * 100) : 0
		});
	}

	// Sort by total descending
	breakdown.sort((a, b) => b.total - a.total);

	return breakdown;
});

const monthlyTrend = $derived.by((): MonthlyTrend[] => {
	const months = new Map<string, { income: number; expense: number }>();

	// Group by year-month
	for (const t of transactions) {
		const ym = t.date.substring(0, 7); // "2026-05"
		if (!months.has(ym)) {
			months.set(ym, { income: 0, expense: 0 });
		}
		const entry = months.get(ym)!;
		if (t.type === 'income') {
			entry.income += t.amount;
		} else {
			entry.expense += t.amount;
		}
	}

	// Convert to sorted array
	const trend: MonthlyTrend[] = [];
	for (const [month, data] of months) {
		trend.push({ month, ...data });
	}
	trend.sort((a, b) => a.month.localeCompare(b.month));

	// Return last 6 months
	return trend.slice(-6);
});

const allCategories = $derived<string[]>(() => {
	const cats = new Set<string>();
	for (const t of transactions) {
		cats.add(t.category);
	}
	return Array.from(cats).sort();
});

// ─── Actions ──────────────────────────────────────────────

async function loadTransactions(): Promise<void> {
	loading = true;
	error = null;

	try {
		const response = await fetch('/api/transactions');
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${await response.text()}`);
		}
		const data: Transaction[] = await response.json();
		transactions = data;
	} catch (e) {
		const msg = e instanceof Error ? e.message : 'Gagal memuat data';
		error = msg;
		showSnackbar('Gagal mengambil data dari spreadsheet');
	} finally {
		loading = false;
	}
}

function setFilter(update: Partial<FilterState>): void {
	filters = { ...filters, ...update };
}

function resetFilters(): void {
	filters = { type: 'all', category: '', month: '', search: '' };
}

function showSnackbar(msg: string): void {
	snackbar = msg;
	setTimeout(() => {
		snackbar = null;
	}, 4000);
}

function dismissSnackbar(): void {
	snackbar = null;
}

// ─── Exported interface ───────────────────────────────────

export function createStore() {
	return {
		get transactions() { return transactions; },
		get loading() { return loading; },
		get error() { return error; },
		get filters() { return filters; },
		get filteredTransactions() { return filteredTransactions; },
		get dashboardSummary() { return dashboardSummary; },
		get categoryBreakdown() { return categoryBreakdown; },
		get monthlyTrend() { return monthlyTrend; },
		get allCategories() { return allCategories; },
		get snackbar() { return snackbar; },
		loadTransactions,
		setFilter,
		resetFilters,
		showSnackbar,
		dismissSnackbar
	};
}
