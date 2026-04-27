<script lang="ts">
	import { mockupStore } from '$lib/contexts/store.svelte';

	import DotsSixVerticalIcon from 'phosphor-svelte/lib/DotsSixVerticalIcon';
	import ArrowCounterClockwiseIcon from 'phosphor-svelte/lib/ArrowCounterClockwiseIcon';
	import FlipVerticalIcon from 'phosphor-svelte/lib/FlipVerticalIcon';
	import FlipHorizontalIcon from 'phosphor-svelte/lib/FlipHorizontalIcon';
	import ArrowsClockwiseIcon from 'phosphor-svelte/lib/ArrowsClockwiseIcon';
	import CubeIcon from 'phosphor-svelte/lib/CubeIcon';
	import ArrowUpIcon from 'phosphor-svelte/lib/ArrowUpIcon';
	import Button from '$lib/components/Button.svelte';
	import Slider from '$lib/components/Slider.svelte';
	import { XIcon } from 'phosphor-svelte';
	import { browser } from '$app/environment';

	const { onClose } = $props();

	let isDragging = $state(false);
	let isMobile = $state(browser ? window.innerWidth < 768 : false);

	let windowPosition = $state({
		x: 100,
		y: 70
	});

	let dragStart = $state({
		x: 0,
		y: 0
	});

	const rotation3D = $derived(mockupStore.rotation3D);

	function handleWindowDragStart(e: MouseEvent) {
		e.preventDefault();

		isDragging = true;

		dragStart = {
			x: e.clientX - windowPosition.x,
			y: e.clientY - windowPosition.y
		};
	}

	function handleWindowDrag(e: MouseEvent) {
		if (!isDragging) return;

		windowPosition = {
			x: e.clientX - dragStart.x,
			y: e.clientY - dragStart.y
		};
	}

	function handleWindowDragEnd() {
		isDragging = false;
	}

	function updateRotation(type: 'rotateX' | 'rotateY' | 'rotateZ' | 'skew', value: number) {
		mockupStore.set3DRotation({ [type]: value });
	}

	function resetRotation() {
		mockupStore.set3DRotation({
			rotateX: 0,
			rotateY: 0,
			rotateZ: 0,
			skew: 0
		});
	}

	const presets = [
		{ rotateX: 20, rotateY: 0, rotateZ: 0, skew: 0 },
		{ rotateX: 30, rotateY: -15, rotateZ: 25, skew: 0 },
		{ rotateX: 0, rotateY: 0, rotateZ: 15, skew: 0 },
		{ rotateX: -20, rotateY: 0, rotateZ: 0, skew: 0 },
		{ rotateX: 0, rotateY: -20, rotateZ: 0, skew: 0 },
		{ rotateX: 0, rotateY: 0, rotateZ: -15, skew: 0 }
	];
</script>

<svelte:window onmousemove={handleWindowDrag} onmouseup={handleWindowDragEnd} />

<div class="z-60 select-none md:fixed" style="left:{windowPosition.x}px; top:{windowPosition.y}px">
	<div class="min-w-80 overflow-hidden rounded-2xl border border-border bg-bg max-md:border-none">
		<div
			role="button"
			tabindex="0"
			class="flex items-center justify-between border-b border-border bg-bg p-4 md:cursor-move"
			onmousedown={handleWindowDragStart}
		>
			<div class="flex items-center gap-3">
				<DotsSixVerticalIcon size={16} weight="bold" class="hidden md:block" />
				<span class="text-lg font-semibold text-white">Rotation & Skew</span>
			</div>

			<div>
				<Button onclick={resetRotation} variant="outlined">
					<ArrowCounterClockwiseIcon size={16} weight="bold" />
				</Button>

				{#if isMobile && onClose}
					<Button onclick={onClose} variant="outlined">
						<XIcon size={16} weight="bold" />
					</Button>
				{/if}
			</div>
		</div>

		<div class="space-y-6 bg-bg p-6">
			<div class="space-y-4">
				<!-- Rotate X -->
				<div class="flex items-center gap-4">
					<div class="w-6 text-text">
						<FlipVerticalIcon size={24} weight="regular" />
					</div>

					<div class="flex-1">
						<Slider
							type="single"
							min={-45}
							max={45}
							step={1}
							bind:value={() => rotation3D.rotateX, (value) => updateRotation('rotateX', value)}
						/>
					</div>

					<span class="w-8 text-right text-sm text-white">
						{rotation3D.rotateX}
					</span>
				</div>

				<!-- Rotate Y -->
				<div class="flex items-center gap-4">
					<div class="w-6 text-text">
						<FlipHorizontalIcon size={24} weight="regular" />
					</div>

					<div class="flex-1">
						<Slider
							type="single"
							min={-45}
							max={45}
							step={1}
							bind:value={() => rotation3D.rotateY, (value) => updateRotation('rotateY', value)}
						/>
					</div>

					<span class="w-8 text-right text-sm text-white">
						{rotation3D.rotateY}
					</span>
				</div>

				<!-- Rotate Z -->
				<div class="flex items-center gap-4">
					<div class="w-6 text-text">
						<ArrowsClockwiseIcon size={24} weight="regular" />
					</div>

					<div class="flex-1">
						<Slider
							type="single"
							min={-45}
							max={45}
							step={1}
							bind:value={() => rotation3D.rotateZ, (value) => updateRotation('rotateZ', value)}
						/>
					</div>

					<span class="w-8 text-right text-sm text-white">
						{rotation3D.rotateZ}
					</span>
				</div>

				<!-- Skew -->
				<div class="flex items-center gap-4">
					<div class="w-6 text-text">
						<CubeIcon size={24} weight="regular" />
					</div>

					<div class="flex-1">
						<Slider
							type="single"
							min={0}
							max={45}
							step={1}
							bind:value={() => rotation3D.skew, (value) => updateRotation('skew', value)}
						/>
					</div>

					<span class="w-8 text-right text-sm text-white">
						{rotation3D.skew}
					</span>
				</div>
			</div>

			<div class="grid grid-cols-3 gap-2">
				{#each presets as preset, index (index)}
					<Button
						variant="outlined"
						onclick={() => mockupStore.set3DRotation(preset)}
						class="h-16 rounded-lg perspective-near"
					>
						<div
							class="relative mb-1 flex h-8 w-10 items-center justify-center rounded-sm border border-text bg-accent [&>svg]:text-text"
							style="transform:
								rotateX({preset.rotateX}deg)
								rotateY({preset.rotateY}deg)
								rotateZ({preset.rotateZ}deg)"
						>
							<ArrowUpIcon size={18} weight="bold" />
						</div>
					</Button>
				{/each}
			</div>
		</div>
	</div>
</div>
