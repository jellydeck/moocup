<script lang="ts">
	import { mockupStore } from '$lib/contexts/store.svelte';
	import { Separator, Tabs } from 'bits-ui';
	import PerspectiveIcon from 'phosphor-svelte/lib/PerspectiveIcon';
	import ArrowsOutCardinalIcon from 'phosphor-svelte/lib/ArrowsOutCardinalIcon';
	import SelectionIcon from 'phosphor-svelte/lib/SelectionIcon';
	import BroomIcon from 'phosphor-svelte/lib/BroomIcon';
	import Button from '$lib/components/Button.svelte';
	import RotationSkewPanel from './RotationSkewPanel.svelte';
	import PositionScalePanel from './PositionScalePanel.svelte';
	import ImageBorderPanel from './ImageBorderPanel.svelte';
	import { browser } from '$app/environment';

	let activePanel = $state('');
	let isMobile = $state(browser ? window.innerWidth < 768 : false);
	let hasImage = $derived(!!mockupStore.uploadedImage);

	function handleReset() {
		mockupStore.setMargin({ top: 0, right: 0, bottom: 0, left: 0 });
		mockupStore.setFixedMargin(false);
		mockupStore.setUploadedImage(null);
		mockupStore.updateDevicePosition({ x: 0, y: 0, scale: 1, rotation: 0 });
		mockupStore.set3DRotation({ rotateX: 0, rotateY: 0, rotateZ: 0, skew: 0 });
		mockupStore.setImageBorder({ width: 8, color: '#FF6B6B', radius: 22, enabled: false });
		activePanel = '';
	}

	function handleResize() {
		isMobile = window.innerWidth < 768;
	}

	function makeToggle(value: string) {
		return {
			onclick: (e: MouseEvent) => {
				if (activePanel === value) {
					e.preventDefault();
					e.stopPropagation();
					activePanel = '';
				}
			},
			onkeydown: (e: KeyboardEvent) => {
				if (e.key === 'Escape') {
					e.preventDefault();
					activePanel = '';
				} else if ((e.key === 'Enter' || e.key === ' ') && activePanel === value) {
					e.preventDefault();
					e.stopPropagation();
					activePanel = '';
				}
			}
		};
	}
</script>

<svelte:window on:resize={handleResize} />

{#if isMobile && hasImage}
	<div class="fixed right-0 bottom-0 left-0 bg-bg">
		<Tabs.Root bind:value={activePanel} activationMode="manual">
			<Tabs.List class="flex h-20 items-center gap-2 px-4">
				<Button onclick={handleReset} disabled={!hasImage} class="flex-1" variant="outlined">
					<BroomIcon size={16} weight="bold" />
				</Button>
				<Tabs.Trigger value="rotation" class="flex-1">
					{#snippet child({ props })}
						<Button {...props} disabled={!hasImage} class="w-full">
							<PerspectiveIcon size={16} weight="bold" />
						</Button>
					{/snippet}
				</Tabs.Trigger>
				<Tabs.Trigger value="position" class="flex-1">
					{#snippet child({ props })}
						<Button {...props} disabled={!hasImage} class="w-full">
							<ArrowsOutCardinalIcon size={16} weight="bold" />
						</Button>
					{/snippet}
				</Tabs.Trigger>
				<Tabs.Trigger value="border" class="flex-1">
					{#snippet child({ props })}
						<Button {...props} disabled={!hasImage} class="w-full">
							<SelectionIcon size={16} weight="bold" />
						</Button>
					{/snippet}
				</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="rotation">
				<RotationSkewPanel onClose={() => (activePanel = '')} />
			</Tabs.Content>
			<Tabs.Content value="position">
				<PositionScalePanel onClose={() => (activePanel = '')} />
			</Tabs.Content>
			<Tabs.Content value="border">
				<ImageBorderPanel onClose={() => (activePanel = '')} />
			</Tabs.Content>
		</Tabs.Root>
	</div>
{:else if hasImage}
	<Tabs.Root
		bind:value={activePanel}
		activationMode="manual"
		class="absolute inset-x-auto bottom-6 z-30"
	>
		<div
			class="flex items-center gap-1 rounded-full border-2 border-border bg-bg p-1.5 shadow-2xl backdrop-blur-lg"
		>
			<Button onclick={handleReset} disabled={!hasImage} variant="outlined" class="rounded-l-2xl">
				<BroomIcon size={16} />
				Reset
			</Button>
			<Separator.Root orientation="vertical" class="mx-1 h-6 bg-border" />
			<Tabs.List class="flex items-center gap-1">
				<Tabs.Trigger value="rotation" {...makeToggle('rotation')}>
					{#snippet child({ props })}
						<Button {...props} disabled={!hasImage} active={activePanel === 'rotation'}>
							<PerspectiveIcon class="h-5 w-5" />
							Rotate <span class="hidden lg:block">& Transform</span>
						</Button>
					{/snippet}
				</Tabs.Trigger>
				<Tabs.Trigger value="position" {...makeToggle('position')}>
					{#snippet child({ props })}
						<Button {...props} disabled={!hasImage} active={activePanel === 'position'}>
							<ArrowsOutCardinalIcon class="h-5 w-5" />
							Position <span class="hidden lg:block">& Scale</span>
						</Button>
					{/snippet}
				</Tabs.Trigger>
				<Tabs.Trigger value="border" {...makeToggle('border')}>
					{#snippet child({ props })}
						<Button
							{...props}
							disabled={!hasImage}
							active={activePanel === 'border'}
							class="rounded-r-2xl"
						>
							<SelectionIcon class="h-5 w-5" />
							Border
						</Button>
					{/snippet}
				</Tabs.Trigger>
			</Tabs.List>
		</div>
		<Tabs.Content value="rotation">
			<RotationSkewPanel onClose={() => (activePanel = '')} />
		</Tabs.Content>
		<Tabs.Content value="position">
			<PositionScalePanel onClose={() => (activePanel = '')} />
		</Tabs.Content>
		<Tabs.Content value="border">
			<ImageBorderPanel onClose={() => (activePanel = '')} />
		</Tabs.Content>
	</Tabs.Root>
{/if}
