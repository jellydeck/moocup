<script lang="ts">
	import '$lib/styles/global.css';
	import Navbar from '$lib/editor/Navbar.svelte';
	import { mockupStore } from '$lib/contexts/store.svelte';
	import { onMount } from 'svelte';
	import FloatingBar from '$lib/editor/FloatingBar.svelte';

	let { children } = $props();

	onMount(() => mockupStore.hydrate());
</script>

<svelte:head>
	<title>Moocup - Beautiful mockups</title>

	<link rel="icon" type="image/svg+xml" href="/favicon.svg" />

	<meta name="description" content="Create beautiful mockups in seconds" />
	<meta name="author" content="Moocup Editor" />

	<meta property="og:title" content="Moocup - Create beautiful mockups in seconds" />
	<meta property="og:description" content="Create beautiful mockups in seconds" />
	<meta property="og:type" content="website" />
	<meta property="og:image" content="https://moocup.jaydip.me/og.webp" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@JellyDeck" />
	<meta name="twitter:image" content="https://moocup.jaydip.me/og.webp" />
</svelte:head>

{#if mockupStore.hydrated}
	<div class="flex h-screen flex-col bg-bg">
		<Navbar />

		<div class="flex flex-1 overflow-hidden">
			{@render children()}
		</div>

		<FloatingBar />
	</div>
{:else}
	<div class="grid h-screen place-items-center">
		<span class="text-muted-foreground text-sm">Loading...</span>
	</div>
{/if}
