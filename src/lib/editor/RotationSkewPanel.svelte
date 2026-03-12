<script lang="ts">
	import { mockupStore } from '$lib/contexts/store.svelte';
	import { Slider } from 'bits-ui';

	import DotsSixVerticalIcon from 'phosphor-svelte/lib/DotsSixVerticalIcon';
	import ArrowCounterClockwiseIcon from 'phosphor-svelte/lib/ArrowCounterClockwiseIcon';
	import FlipVerticalIcon from 'phosphor-svelte/lib/FlipVerticalIcon';
	import FlipHorizontalIcon from 'phosphor-svelte/lib/FlipHorizontalIcon';
	import ArrowsClockwiseIcon from 'phosphor-svelte/lib/ArrowsClockwiseIcon';
	import CubeIcon from 'phosphor-svelte/lib/CubeIcon';
	import ArrowUpIcon from 'phosphor-svelte/lib/ArrowUpIcon';
	import Button from '$lib/components/Button.svelte';

	let { onClose }: { onClose?: () => void } = $props();

	let isDragging = $state(false);

	let windowPosition = $state({
		x: 100,
		y: 100
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

<div class="z-40 select-none md:fixed" style="left:{windowPosition.x}px; top:{windowPosition.y}px">
	<div
		class="bg-sidebar border-sidebar-border min-w-80 overflow-hidden rounded-2xl border max-md:border-none"
	>
		<!-- HEADER -->
		<div
			role="button"
			tabindex="0"
			class="flex items-center justify-between border-b border-border bg-bg p-4 md:cursor-move"
			onmousedown={handleWindowDragStart}
		>
			<div class="flex items-center gap-3">
				<DotsSixVerticalIcon size={16} weight="bold" />
				<span class="text-lg font-semibold text-white">Rotation & Skew</span>
			</div>

			<Button onclick={resetRotation} variant="outlined">
				<ArrowCounterClockwiseIcon size={16} weight="bold" />
			</Button>
		</div>

		<!-- BODY -->
		<div class="space-y-6 bg-bg p-6">
			<div class="space-y-4">
				<!-- Rotate X -->
				<div class="flex items-center gap-4">
					<div class="w-6 text-text">
						<FlipVerticalIcon size={24} weight="regular" />
					</div>

					<div class="flex-1">
						<Slider.Root
							type="single"
							min={-45}
							max={45}
							step={1}
							value={rotation3D.rotateX}
							onValueChange={(v) => updateRotation('rotateX', v)}
							class="relative flex w-full touch-none items-center select-none"
						>
							<span
								class="relative h-2 w-full grow cursor-pointer overflow-hidden rounded-full bg-pine-text"
							>
								<Slider.Range class="absolute h-full bg-text" />
							</span>

							<Slider.Thumb
								index={0}
								class="block size-5 cursor-pointer rounded-full border border-white bg-white shadow"
							/>
						</Slider.Root>
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
						<Slider.Root
							type="single"
							min={-45}
							max={45}
							step={1}
							value={rotation3D.rotateY}
							onValueChange={(v) => updateRotation('rotateY', v)}
							class="relative flex w-full items-center"
						>
							<span
								class="relative h-2 w-full grow cursor-pointer overflow-hidden rounded-full bg-pine-text"
							>
								<Slider.Range class="absolute h-full bg-text" />
							</span>

							<Slider.Thumb index={0} class="size-5 rounded-full border border-white bg-white" />
						</Slider.Root>
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
						<Slider.Root
							type="single"
							min={-180}
							max={180}
							step={1}
							value={rotation3D.rotateZ}
							onValueChange={(v) => updateRotation('rotateZ', v)}
							class="relative flex w-full items-center"
						>
							<span
								class="relative h-2 w-full grow cursor-pointer overflow-hidden rounded-full bg-pine-text"
							>
								<Slider.Range class="absolute h-full bg-text" />
							</span>

							<Slider.Thumb index={0} class="size-5 rounded-full border border-white bg-white" />
						</Slider.Root>
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
						<Slider.Root
							type="single"
							min={0}
							max={45}
							step={1}
							value={rotation3D.skew}
							onValueChange={(v) => updateRotation('skew', v)}
							class="relative flex w-full items-center"
						>
							<span
								class="relative h-2 w-full grow cursor-pointer overflow-hidden rounded-full bg-pine-text"
							>
								<Slider.Range class="absolute h-full bg-text" />
							</span>

							<Slider.Thumb index={0} class="size-5 rounded-full border border-white bg-white" />
						</Slider.Root>
					</div>

					<span class="w-8 text-right text-sm text-white">
						{rotation3D.skew}
					</span>
				</div>
			</div>

			<!-- PRESETS -->
			<div class="grid grid-cols-3 gap-2">
				{#each presets as preset, index (index)}
					<button
						onclick={() => mockupStore.set3DRotation(preset)}
						class="flex h-16 flex-col items-center justify-center rounded-lg border border-border bg-bg perspective-near hover:bg-accent/50"
					>
						<div
							class="relative mb-1 flex h-8 w-10 items-center justify-center rounded-sm bg-accent [&>svg]:text-text"
							style="transform:
								rotateX({preset.rotateX}deg)
								rotateY({preset.rotateY}deg)
								rotateZ({preset.rotateZ}deg)"
						>
							<ArrowUpIcon size={18} />
						</div>
					</button>
				{/each}
			</div>
		</div>
	</div>
</div>
