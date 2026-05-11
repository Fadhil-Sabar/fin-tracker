import { fetchTransactions } from '$lib/sheets';
import type { Transaction } from '$lib/utils';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const transactions: Transaction[] = await fetchTransactions();

		// Optional: filter by month query param
		const month = url.searchParams.get('month');
		if (month) {
			const filtered = transactions.filter((t) => t.date.startsWith(month));
			return new Response(JSON.stringify(filtered), {
				headers: { 'Content-Type': 'application/json' }
			});
		}

		return new Response(JSON.stringify(transactions), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unknown error';
		return new Response(JSON.stringify({ error: message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
