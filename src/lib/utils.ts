/**
 * Utility functions for formatting currency and dates (Indonesia locale).
 */

/**
 * Format a number as IDR currency.
 * @example formatCurrency(75000) → "Rp75.000"
 */
export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(amount);
}

/**
 * Short format: "Rp75rb" for 75000, "Rp1jt" for 1000000
 */
export function formatCurrencyShort(amount: number): string {
	if (amount >= 1_000_000) {
		const val = amount / 1_000_000;
		return `Rp${val.toFixed(val % 1 === 0 ? 0 : 1)}jt`;
	}
	if (amount >= 1_000) {
		const val = amount / 1_000;
		return `Rp${val.toFixed(0)}rb`;
	}
	return `Rp${amount}`;
}

/**
 * Format date string (YYYY-MM-DD) to Indonesian locale.
 * @example formatDate("2026-05-11") → "11 Mei 2026"
 */
export function formatDate(dateStr: string): string {
	const date = new Date(dateStr + 'T00:00:00');
	return new Intl.DateTimeFormat('id-ID', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	}).format(date);
}

/**
 * Short date: "11 Mei"
 */
export function formatDateShort(dateStr: string): string {
	const date = new Date(dateStr + 'T00:00:00');
	return new Intl.DateTimeFormat('id-ID', {
		day: 'numeric',
		month: 'short'
	}).format(date);
}

/**
 * Get month name in Indonesian.
 */
export function getMonthName(monthIndex: number): string {
	const months = [
		'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
		'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
	];
	return months[monthIndex] ?? '';
}

/**
 * Get month options for the last 6 months.
 */
export function getLastMonths(count = 6): { value: string; label: string }[] {
	const now = new Date();
	const months: { value: string; label: string }[] = [];
	for (let i = count - 1; i >= 0; i--) {
		const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
		const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
		const label = getMonthName(d.getMonth());
		months.push({ value, label });
	}
	return months;
}

/**
 * Format raw number for display (grouped thousands).
 */
export function formatNumber(num: number): string {
	return new Intl.NumberFormat('id-ID').format(num);
}

/**
 * Calculate percentage difference.
 */
export function percentDiff(current: number, previous: number): number | null {
	if (previous === 0) return current > 0 ? 100 : null;
	return Math.round(((current - previous) / previous) * 100);
}

/**
 * Transaction types and categories (re-exported for convenience).
 */
export type TransactionType = 'income' | 'expense';
export type Transaction = {
	date: string;
	amount: number;
	category: string;
	detail: string;
	type: TransactionType;
};

/**
 * Summarized data for the dashboard.
 */
export type DashboardSummary = {
	totalIncome: number;
	totalExpense: number;
	balance: number;
	savings: number;
	lastMonthIncome: number;
	lastMonthExpense: number;
};

export type CategoryBreakdown = {
	category: string;
	total: number;
	count: number;
	percentage: number;
};

export type MonthlyTrend = {
	month: string;
	income: number;
	expense: number;
};
