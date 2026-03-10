<script lang="ts">
	import '$lib/styles/global.css';
	import Navbar from '$lib/editor/Navbar.svelte';
	import favicon from '$lib/assets/favicon.svg';
	import { mockupStore } from '$lib/contexts/store.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => mockupStore.hydrate());
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if mockupStore.hydrated}
	<div class="flex h-screen flex-col bg-bg">
		<Navbar />

		<div class="flex flex-1 overflow-hidden">
			{@render children()}
		</div>

		<!-- <FloatingBar /> -->
	</div>
{:else}
	<div class="grid h-screen place-items-center">
		<span class="text-muted-foreground text-sm">Loading...</span>
	</div>
{/if}
