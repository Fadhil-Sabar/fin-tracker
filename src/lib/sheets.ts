/**
 * Google Sheets API bridge — server-only module.
 *
 * Dual-mode auth:
 *   - Local dev: OAuth2 user token (reads from file via GOOGLE_TOKEN_PATH)
 *   - Cloudflare: Service Account JWT (reads from GOOGLE_SERVICE_ACCOUNT_KEY env var)
 *
 * During production build, the `node:fs` import is tree-shaken by Vite/Rolldown
 * because `dev` is statically replaced with `false`, removing the local auth path.
 */
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import type { Transaction } from './utils';

const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

// ─── Types ──────────────────────────────────────────────

interface ServiceAccountKey {
	client_email: string;
	private_key: string;
}

interface GoogleToken {
	client_id: string;
	client_secret: string;
	refresh_token: string;
	access_token?: string;
	expiry?: string;
}

// ─── Token Cache ───────────────────────────────────────

let cachedToken: { access_token: string; expiry: number } | null = null;

// ─── Helpers ───────────────────────────────────────────

function b64url(data: string): string {
	return btoa(data)
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
	const b64 = pem
		.replace(/-----BEGIN PRIVATE KEY-----/, '')
		.replace(/-----END PRIVATE KEY-----/, '')
		.replace(/\s/g, '');
	const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
	return bytes.buffer;
}

// ─── Cloudflare: Service Account JWT Auth ─────────────

async function getServiceAccountToken(key: ServiceAccountKey): Promise<string> {
	if (cachedToken && Date.now() < cachedToken.expiry - 60_000) {
		return cachedToken.access_token;
	}

	const now = Math.floor(Date.now() / 1000);

	const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
	const payload = b64url(
		JSON.stringify({
			iss: key.client_email,
			scope: 'https://www.googleapis.com/auth/spreadsheets',
			aud: 'https://oauth2.googleapis.com/token',
			exp: now + 3600,
			iat: now
		})
	);

	const message = `${header}.${payload}`;

	const privateKey = await globalThis.crypto.subtle.importKey(
		'pkcs8',
		pemToArrayBuffer(key.private_key),
		{ name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
		false,
		['sign']
	);

	const signature = await globalThis.crypto.subtle.sign(
		{ name: 'RSASSA-PKCS1-v1_5' },
		privateKey,
		new TextEncoder().encode(message)
	);

	const jwt = `${message}.${b64url(String.fromCharCode(...new Uint8Array(signature)))}`;

	const response = await fetch('https://oauth2.googleapis.com/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
			assertion: jwt
		})
	});

	if (!response.ok) {
		throw new Error(`Service account auth failed: ${response.status} ${await response.text()}`);
	}

	const data: { access_token: string; expires_in?: number } = await response.json();
	cachedToken = {
		access_token: data.access_token,
		expiry: Date.now() + (data.expires_in || 3600) * 1000
	};

	return data.access_token;
}

// ─── Local Dev: OAuth2 Token Auth (tree-shaken in Cloudflare build) ──

async function getLocalToken(tokenPath: string): Promise<string> {
	// `dev` is statically replaced by Vite — `false` during production build.
	// The bundler tree-shakes this entire branch when building for Cloudflare,
	// so `node:fs` never appears in the deployed bundle.
	if (!dev) {
		throw new Error('Local OAuth token auth is only available in dev mode');
	}

	if (cachedToken && Date.now() < cachedToken.expiry - 60_000) {
		return cachedToken.access_token;
	}

	const fs = await import('node:fs');
	const raw = fs.readFileSync(tokenPath, 'utf-8');
	const token: GoogleToken = JSON.parse(raw);

	if (token.access_token && token.expiry) {
		const expiry = new Date(token.expiry).getTime();
		if (Date.now() < expiry - 60_000) {
			cachedToken = { access_token: token.access_token, expiry };
			return token.access_token;
		}
	}

	if (!token.refresh_token) {
		throw new Error('No refresh_token in token file');
	}

	const params = new URLSearchParams({
		client_id: token.client_id,
		client_secret: token.client_secret,
		refresh_token: token.refresh_token,
		grant_type: 'refresh_token'
	});

	const response = await fetch('https://oauth2.googleapis.com/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: params
	});

	if (!response.ok) {
		throw new Error(`Token refresh failed: ${response.status} ${await response.text()}`);
	}

	const data: { access_token: string; expires_in?: number } = await response.json();
	const expiresIn = data.expires_in || 3600;

	cachedToken = {
		access_token: data.access_token,
		expiry: Date.now() + expiresIn * 1000
	};

	token.access_token = data.access_token;
	token.expiry = new Date(Date.now() + expiresIn * 1000).toISOString();
	fs.writeFileSync(tokenPath, JSON.stringify(token, null, 2));

	return data.access_token;
}

// ─── Auth Router ──────────────────────────────────────

async function getAccessToken(): Promise<string> {
	// 1. Cloudflare: Service Account key from runtime env
	const saKeyRaw = env.GOOGLE_SERVICE_ACCOUNT_KEY;
	if (saKeyRaw) {
		return getServiceAccountToken(JSON.parse(saKeyRaw) as ServiceAccountKey);
	}

	// 2. Local: OAuth token file from env
	const tokenPath = env.GOOGLE_TOKEN_PATH;
	if (tokenPath) {
		return getLocalToken(tokenPath);
	}

	throw new Error(
		'No auth method configured. Set GOOGLE_SERVICE_ACCOUNT_KEY (Cloudflare) or GOOGLE_TOKEN_PATH (local) in environment.'
	);
}

// ─── Spreadsheet Fetch ────────────────────────────────

async function fetchRawRows(spreadsheetId: string, sheetName: string): Promise<string[][]> {
	const accessToken = await getAccessToken();
	const range = `${sheetName}!A:E`;
	const url = `${SHEETS_API_BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}`;

	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		const errText = await response.text();
		throw new Error(`Sheets API error: ${response.status} ${errText}`);
	}

	const data: { values?: string[][] } = await response.json();
	return data.values || [];
}

// ─── Data Parsing ─────────────────────────────────────

function parseTransactions(rows: string[][]): Transaction[] {
	if (rows.length < 2) return [];

	return rows
		.slice(1)
		.filter((row) => row.length >= 4)
		.map((row) => ({
			date: (row[0] || '').trim(),
			amount: parseInt(row[1]?.replace(/[^0-9]/g, ''), 10) || 0,
			category: (row[2] || 'Lainnya').trim().toLowerCase(),
			detail: (row[3] || '').trim(),
			type: (row[4] || 'expense').trim().toLowerCase() as 'income' | 'expense'
		}))
		.filter((t) => t.date && t.amount > 0);
}

// ─── Public API ───────────────────────────────────────

/**
 * Fetch all transactions from the configured Google Spreadsheet.
 *
 * Auth method is auto-selected based on which env var is set:
 *   GOOGLE_SERVICE_ACCOUNT_KEY → Cloudflare (Service Account JWT)
 *   GOOGLE_TOKEN_PATH          → Local dev (OAuth refresh, tree-shaken in production)
 */
export async function fetchTransactions(): Promise<Transaction[]> {
	const spreadsheetId = env.GOOGLE_SHEETS_SPREADSHEET_ID;
	if (!spreadsheetId) {
		throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID is not set');
	}

	const sheetName = env.SHEET_NAME || 'Sample';
	const rows = await fetchRawRows(spreadsheetId, sheetName);
	return parseTransactions(rows);
}
