<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import NavRail from '$lib/components/NavRail.svelte';
	import { createStore } from '$lib/stores.svelte';
	import { getMonthName } from '$lib/utils';
	import { fade } from 'svelte/transition';

	let { children } = $props();

	const store = createStore();

	// Reactive binding for snackbar
	const snackbar = $derived(store.snackbar);
	const dismissSnackbar = store.dismissSnackbar;
	const loadTransactions = store.loadTransactions;

	let path = $state('/');
	let refreshing = $state(false);

	let headerTitle = $derived.by(() => {
		if (path === '/') return 'Dashboard';
		if (path.startsWith('/transactions')) return 'Transaksi';
		if (path.startsWith('/categories')) return 'Kategori';
		return 'FinTrack';
	});

	const now = new Date();
	const monthLabel = `${getMonthName(now.getMonth())} ${now.getFullYear()}`;

	async function handleRefresh() {
		refreshing = true;
		await loadTransactions();
		setTimeout(() => { refreshing = false; }, 400);
	}

	// Track current path
	$effect(() => {
		if (browser) {
			path = window.location.pathname;
		}
	});

	onMount(() => {
		loadTransactions();

		const handlePop = () => {
			path = window.location.pathname;
		};
		window.addEventListener('popstate', handlePop);
		return () => window.removeEventListener('popstate', handlePop);
	});
</script>

<div class="app-shell">
	<NavRail currentPath={path} />

	<main class="main-content">
		<!-- Header -->
		<header class="app-header">
			<div class="header-left">
				<h1 class="header-title">{headerTitle}</h1>
				<p class="header-subtitle">{monthLabel}</p>
			</div>
			<button
				class="refresh-btn"
				class:spinning={refreshing}
				onclick={handleRefresh}
				aria-label="Refresh data"
				disabled={refreshing}
			>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
					<path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
				</svg>
				<span class="refresh-text">Refresh</span>
			</button>
		</header>

		<!-- Page content with crossfade transition -->
		<div class="page-content">
			{#key path}
				<div
					in:fade={{ duration: 180, delay: 20 }}
					out:fade={{ duration: 120 }}
				>
					{@render children()}
				</div>
			{/key}
		</div>
	</main>

	<!-- Snackbar -->
	{#if snackbar}
		<button
			class="md-snackbar"
			onclick={dismissSnackbar}
			onkeydown={(e) => e.key === 'Enter' && dismissSnackbar()}
			aria-label="Tutup notifikasi"
		>
			{snackbar}
		</button>
	{/if}
</div>

<style>
	.app-shell {
		display: flex;
		min-height: 100vh;
	}

	.main-content {
		flex: 1;
		margin-left: 0;
		padding-bottom: 80px; /* Space for bottom nav */
		display: flex;
		flex-direction: column;
	}

	.app-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24px 20px 8px;
		position: sticky;
		top: 0;
		background: var(--md-surface-dim);
		z-index: 50;
	}

	.header-title {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--md-on-surface);
		margin: 0;
	}

	.header-subtitle {
		font-size: 0.875rem;
		color: var(--md-on-surface-variant);
		margin: 2px 0 0 0;
	}

	.refresh-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 14px;
		border: 1px solid var(--md-outline);
		border-radius: var(--md-shape-full);
		background: var(--md-surface);
		color: var(--md-on-surface);
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
		font-family: inherit;
		user-select: none;
		transition:
			background var(--anim-fast) ease,
			box-shadow var(--anim-fast) ease,
			opacity var(--anim-fast) ease;
	}

	.refresh-btn:hover {
		background: var(--md-surface-container);
		box-shadow: var(--md-elevation-1);
	}

	.refresh-btn:active {
		transform: scale(0.97);
	}

	.refresh-btn:disabled {
		opacity: 0.7;
		cursor: default;
	}

	/* Spinning animation on refresh */
	.refresh-btn.spinning svg {
		animation: btn-spin 600ms cubic-bezier(0.4, 0, 0.2, 1) 2;
	}

	@keyframes btn-spin {
		from { transform: rotate(0deg); }
		to   { transform: rotate(360deg); }
	}

	.refresh-text {
		display: none;
	}

	.page-content {
		padding: 8px 20px 24px;
		flex: 1;
	}

	/* Desktop */
	@media (min-width: 768px) {
		.main-content {
			margin-left: 80px; /* nav rail width */
			padding-bottom: 0;
		}
		.refresh-text {
			display: inline;
		}
		.app-header {
			padding: 24px 32px 12px;
		}
		.page-content {
			padding: 8px 32px 24px;
		}
	}
</style>
