<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import NavRail from '$lib/components/NavRail.svelte';
	import { createStore } from '$lib/stores.svelte';
	import { fade } from 'svelte/transition';

	let { children } = $props();

	const store = createStore();

	const snackbar = $derived(store.snackbar);
	const dismissSnackbar = store.dismissSnackbar;
	const loadTransactions = store.loadTransactions;

	let path = $state('/');

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

<svelte:head>
	<title>FinTrack — Keuangan Pribadi</title>
</svelte:head>

<div class="app-shell">
	<NavRail currentPath={path} />

	<main class="main-content">
		{#key path}
			<div
				in:fade={{ duration: 180, delay: 20 }}
				out:fade={{ duration: 120 }}
			>
				{@render children()}
			</div>
		{/key}
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
		padding: 20px 20px 80px;
		display: flex;
		flex-direction: column;
	}

	/* Desktop */
	@media (min-width: 768px) {
		.main-content {
			margin-left: 80px;
			padding: 28px 32px 32px;
		}
	}
</style>
