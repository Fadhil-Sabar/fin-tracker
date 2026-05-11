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
		<div class="brand-logo">
			<svg width="18" height="18" viewBox="0 0 24 24" fill="white">
				<path d="M19.83 7.5l-2.27-2.27c.07-.42.18-.81.32-1.15.23-.56.56-1.06.97-1.5-.7-.37-1.5-.58-2.35-.58-1.64 0-3.09.79-4 2h-5C4.46 4 2 6.46 2 9.5S4.5 21 4.5 21H10v-2h2v2h5.5l1.68-5.59 2.82-.94V7.5h-2.17z"/>
			</svg>
		</div>
		<span class="nav-brand-text">FinTrack</span>
	</div>

	<div class="nav-items">
		{#each navItems as item}
			<a
				href={item.path}
				class="nav-item"
				class:active={isActive(item.path)}
				aria-current={isActive(item.path) ? 'page' : undefined}
			>
				<span class="nav-indicator">
					<span class="nav-icon">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
							<path d={svgPaths[item.icon]} />
						</svg>
					</span>
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
			aria-current={isActive(item.path) ? 'page' : undefined}
		>
			<span class="bottom-indicator">
				<span class="bottom-icon">
					<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
						<path d={svgPaths[item.icon]} />
					</svg>
				</span>
			</span>
			<span class="bottom-label">{item.label}</span>
		</a>
	{/each}
</nav>

<style>
	/* ── Desktop Nav Rail ── */
	.nav-rail {
		display: none;
		position: fixed;
		left: 0;
		top: 0;
		width: 80px;
		height: 100vh;
		background: var(--md-surface);
		border-right: 1px solid var(--md-outline-variant);
		flex-direction: column;
		align-items: center;
		padding: 20px 0 16px;
		z-index: 100;
	}

	.nav-brand {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		margin-bottom: 28px;
	}

	.brand-logo {
		width: 40px;
		height: 40px;
		background: var(--md-primary);
		border-radius: var(--md-shape-medium);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 8px rgba(26, 115, 232, 0.3);
	}

	.nav-brand-text {
		font-size: 0.5625rem;
		font-weight: 700;
		color: var(--md-on-surface-variant);
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.nav-items {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
	}

	.nav-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		padding: 4px 0 6px;
		width: 100%;
		text-decoration: none;
		color: var(--md-on-surface-variant);
		transition: color var(--anim-fast) ease;
	}

	.nav-indicator {
		width: 56px;
		height: 32px;
		border-radius: var(--md-shape-full);
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		transition:
			background var(--anim-normal) cubic-bezier(0.2, 0, 0, 1),
			transform var(--anim-fast) ease;
	}

	.nav-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform var(--anim-fast) cubic-bezier(0.2, 0, 0, 1);
	}

	.nav-item:hover .nav-indicator {
		background: var(--md-surface-container);
	}

	.nav-item:hover .nav-icon {
		transform: scale(1.15);
	}

	.nav-item.active {
		color: var(--md-primary);
	}

	.nav-item.active .nav-indicator {
		background: var(--md-primary-container);
		transform: scale(1.05);
	}

	.nav-label {
		font-size: 0.625rem;
		font-weight: 600;
		text-align: center;
		letter-spacing: 0.01em;
	}

	/* ── Mobile Bottom Nav ── */
	.bottom-nav {
		display: flex;
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 64px;
		background: var(--md-surface);
		border-top: 1px solid var(--md-outline-variant);
		z-index: 100;
		justify-content: space-around;
		align-items: center;
		padding: 0 8px;
	}

	.bottom-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		flex: 1;
		text-decoration: none;
		color: var(--md-on-surface-variant);
		transition: color var(--anim-fast) ease;
	}

	.bottom-indicator {
		width: 64px;
		height: 32px;
		border-radius: var(--md-shape-full);
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		transition:
			background var(--anim-normal) cubic-bezier(0.2, 0, 0, 1),
			transform var(--anim-fast) ease;
	}

	.bottom-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform var(--anim-fast) cubic-bezier(0.2, 0, 0, 1);
	}

	.bottom-item:hover .bottom-icon {
		transform: scale(1.1);
	}

	.bottom-item.active {
		color: var(--md-primary);
	}

	.bottom-item.active .bottom-indicator {
		background: var(--md-primary-container);
		transform: scale(1.05);
	}

	.bottom-label {
		font-size: 0.625rem;
		font-weight: 600;
	}

	/* ── Responsive ── */
	@media (min-width: 768px) {
		.nav-rail   { display: flex; }
		.bottom-nav { display: none; }
	}
</style>
