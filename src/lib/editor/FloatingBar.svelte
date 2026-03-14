<script lang="ts">
	import { mockupStore } from '$lib/contexts/store.svelte';
	import { Separator } from 'bits-ui';

	import ArrowLeftIcon from 'phosphor-svelte/lib/ArrowLeftIcon';
	import PerspectiveIcon from 'phosphor-svelte/lib/PerspectiveIcon';
	import ArrowsOutCardinalIcon from 'phosphor-svelte/lib/ArrowsOutCardinalIcon';
	import SelectionIcon from 'phosphor-svelte/lib/SelectionIcon';
	import BroomIcon from 'phosphor-svelte/lib/BroomIcon';
	import Button from '$lib/components/Button.svelte';
	import RotationSkewPanel from './RotationSkewPanel.svelte';
	import PositionScalePanel from './PositionScalePanel.svelte';
	import ImageBorderPanel from './ImageBorderPanel.svelte';
	import { browser } from '$app/environment';

	let activePanel = $state<string | null>(null);

	let isMobile = $state(browser ? window.innerWidth < 768 : false);

	let hasImage = $derived(!!mockupStore.uploadedImage);

	function handleReset() {
		mockupStore.setMargin({ top: 0, right: 0, bottom: 0, left: 0 });
		mockupStore.setFixedMargin(false);
		mockupStore.setUploadedImage(null);
		mockupStore.updateDevicePosition({ x: 0, y: 0, scale: 1, rotation: 0 });
		mockupStore.set3DRotation({ rotateX: 0, rotateY: 0, rotateZ: 0, skew: 0 });
		mockupStore.setImageBorder({
			width: 8,
			color: '#FF6B6B',
			radius: 22,
			enabled: false
		});

		activePanel = null;
	}

	function togglePanel(panel: string) {
		activePanel = activePanel === panel ? null : panel;
	}

	function handleResize() {
		isMobile = window.innerWidth < 768;
	}
</script>

<svelte:window on:resize={handleResize} />

{#if isMobile && hasImage}
	<div
		class="fixed right-0 bottom-0 left-0 flex h-20 items-center justify-between border-t border-border bg-bg px-4"
	>
		<div class="flex w-full gap-2">
			<Button onclick={handleReset} disabled={!hasImage} class="flex-1" variant="outlined">
				<BroomIcon size={16} weight="bold" />
			</Button>

			<Button onclick={() => togglePanel('rotation')} disabled={!hasImage} class="flex-1">
				<PerspectiveIcon size={16} weight="bold" />
			</Button>

			<Button onclick={() => togglePanel('position')} disabled={!hasImage} class="flex-1">
				<ArrowsOutCardinalIcon size={16} weight="bold" />
			</Button>

			<Button onclick={() => togglePanel('border')} disabled={!hasImage} class="flex-1">
				<SelectionIcon size={16} weight="bold" />
			</Button>
		</div>
	</div>
{:else if hasImage}
	<div class="fixed bottom-6 left-[38%] z-30 -translate-x-1/2">
		<div
			class="flex items-center gap-1 rounded-full border-2 border-border bg-bg p-1.5 shadow-2xl backdrop-blur-lg"
		>
			<Button onclick={handleReset} disabled={!hasImage} variant="outlined" class="rounded-l-2xl">
				<BroomIcon size={16} />
				Reset
			</Button>

			<Separator.Root orientation="vertical" class="mx-1 h-6 bg-border" />

			<Button
				onclick={() => togglePanel('rotation')}
				active={activePanel === 'rotation'}
				disabled={!hasImage}
			>
				<PerspectiveIcon class="h-5 w-5" />
				Rotate & Transform
			</Button>

			<Button
				onclick={() => togglePanel('position')}
				active={activePanel === 'position'}
				disabled={!hasImage}
			>
				<ArrowsOutCardinalIcon class="h-5 w-5" />
				Position & Scale
			</Button>

			<Button
				onclick={() => togglePanel('border')}
				active={activePanel === 'border'}
				disabled={!hasImage}
				class="rounded-r-2xl"
			>
				<SelectionIcon class="h-5 w-5" />
				Border
			</Button>
		</div>
	</div>
{/if}

{#if activePanel === 'rotation'}
	<RotationSkewPanel onClose={() => (activePanel = null)} />
{/if}

{#if activePanel === 'position'}
	<PositionScalePanel onClose={() => (activePanel = null)} />
{/if}

{#if activePanel === 'border'}
	<ImageBorderPanel onClose={() => (activePanel = null)} />
{/if}
