<script lang="ts">
	let {
		currentPath = '/'
	} = $props();

	const navItems = [
		{ path: '/', label: 'Dashboard', icon: 'dashboard' },
		{ path: '/transactions', label: 'Transaksi', icon: 'receipt' },
		{ path: '/categories', label: 'Kategori', icon: 'category' }
	];

	function isActive(path: string): boolean {
		if (path === '/') return currentPath === '/';
		return currentPath.startsWith(path);
	}

	const svgPaths: Record<string, string> = {
		dashboard: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
		receipt: 'M18 17H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V7h12v2zM3 22l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20z',
		category: 'M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7a2.5 2.5 0 010-5 2.5 2.5 0 010 5zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z'
	};
</script>

<!-- Desktop: Navigation Rail -->
<nav class="nav-rail" aria-label="Navigasi utama">
	<div class="nav-brand">
		<svg width="28" height="28" viewBox="0 0 24 24" fill="#1A73E8">
			<path d="M19.83 7.5l-2.27-2.27c.07-.42.18-.81.32-1.15.23-.56.56-1.06.97-1.5-.7-.37-1.5-.58-2.35-.58-1.64 0-3.09.79-4 2h-5C4.46 4 2 6.46 2 9.5S4.5 21 4.5 21H10v-2h2v2h5.5l1.68-5.59 2.82-.94V7.5h-2.17z"/>
		</svg>
		<span class="nav-brand-text">FinTrack</span>
	</div>

	<div class="nav-items">
		{#each navItems as item}
			<a
				href={item.path}
				class="nav-item"
				class:active={isActive(item.path)}
			>
				<span class="nav-icon">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
						<path d={svgPaths[item.icon]} />
					</svg>
				</span>
				<span class="nav-label">{item.label}</span>
			</a>
		{/each}
	</div>
</nav>

<!-- Mobile: Bottom Navigation -->
<nav class="bottom-nav" aria-label="Navigasi mobile">
	{#each navItems as item}
		<a
			href={item.path}
			class="bottom-item"
			class:active={isActive(item.path)}
		>
			<span class="bottom-icon">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
					<path d={svgPaths[item.icon]} />
				</svg>
			</span>
			<span class="bottom-label">{item.label}</span>
		</a>
	{/each}
</nav>

<style>
	/* Desktop Nav Rail */
	.nav-rail {
		display: none;
		position: fixed;
		left: 0;
		top: 0;
		width: 80px;
		height: 100vh;
		background: var(--md-surface);
		border-right: 1px solid var(--md-outline);
		flex-direction: column;
		align-items: center;
		padding: 16px 0;
		gap: 8px;
		z-index: 100;
	}
	.nav-brand {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		margin-bottom: 16px;
	}
	.nav-brand-text {
		font-size: 0.625rem;
		font-weight: 700;
		color: var(--md-primary);
		letter-spacing: 0.05em;
	}
	.nav-items {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		width: 100%;
	}
	.nav-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		padding: 12px 0;
		width: 64px;
		border-radius: var(--md-shape-large);
		text-decoration: none;
		color: var(--md-on-surface-variant);
		transition: all 0.15s ease;
	}
	.nav-item:hover {
		background: var(--md-surface-container);
	}
	.nav-item.active {
		color: var(--md-primary);
		background: var(--md-primary-container);
	}
	.nav-label {
		font-size: 0.625rem;
		font-weight: 500;
		text-align: center;
	}

	/* Mobile Bottom Nav */
	.bottom-nav {
		display: flex;
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 64px;
		background: var(--md-surface);
		border-top: 1px solid var(--md-outline);
		z-index: 100;
		justify-content: space-around;
		align-items: center;
		padding: 0 8px;
	}
	.bottom-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		padding: 8px 12px;
		border-radius: var(--md-shape-large);
		text-decoration: none;
		color: var(--md-on-surface-variant);
		transition: all 0.15s ease;
		min-width: 64px;
	}
	.bottom-item.active {
		color: var(--md-primary);
	}
	.bottom-label {
		font-size: 0.625rem;
		font-weight: 500;
	}

	/* Responsive */
	@media (min-width: 768px) {
		.nav-rail {
			display: flex;
		}
		.bottom-nav {
			display: none;
		}
	}
</style>
