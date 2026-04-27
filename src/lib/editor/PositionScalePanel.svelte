<script lang="ts">
	import { mockupStore } from '$lib/contexts/store.svelte';
	import { Checkbox, Label, Tabs } from 'bits-ui';
	import Slider from '$lib/components/Slider.svelte';
	import Button from '$lib/components/Button.svelte';

	import DotsSixVerticalIcon from 'phosphor-svelte/lib/DotsSixVerticalIcon';
	import ArrowCounterClockwiseIcon from 'phosphor-svelte/lib/ArrowCounterClockwiseIcon';
	import CheckFatIcon from 'phosphor-svelte/lib/CheckFatIcon';
	import XIcon from 'phosphor-svelte/lib/XIcon';

	import { browser } from '$app/environment';

	const { onClose } = $props();

	let isDragging = $state(false);
	let windowPosition = $state({
		x: 150,
		y: 70
	});
	let dragStart = $state({
		x: 0,
		y: 0
	});
	let activeTab = $state<'position' | 'margins'>('position');
	let marginPreset = $state<'small' | 'medium' | 'large' | ''>('medium');
	let isMobile = $state(browser ? window.innerWidth < 768 : false);

	const devicePosition = $derived(mockupStore.devicePosition);
	const fixedMargin = $derived(mockupStore.fixedMargin);
	let scale = $derived(devicePosition.scale);

	let gridRef: HTMLDivElement | null = $state(null);

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

	function handleBallClick(e: MouseEvent) {
		if (!gridRef) return;

		const rect = gridRef.getBoundingClientRect();
		const ball = e.currentTarget as HTMLElement;
		const ballRect = ball.getBoundingClientRect();

		const ballCenterX = ballRect.left + ballRect.width / 2 - rect.left;
		const ballCenterY = ballRect.top + ballRect.height / 2 - rect.top;

		const ballRadius = 25;
		const gridWidth = rect.width;
		const gridHeight = rect.height;

		const deviceX = ((ballCenterX - ballRadius) / (gridWidth - ballRadius * 2)) * 400 - 200;
		const deviceY = ((ballCenterY - ballRadius) / (gridHeight - ballRadius * 2)) * 400 - 200;

		mockupStore.updateDevicePosition({ x: deviceX, y: deviceY });
	}

	function resetPosition() {
		scale = 1;

		mockupStore.updateDevicePosition({
			x: 0,
			y: 0,
			scale: 1
		});

		mockupStore.setFixedMargin(false);

		mockupStore.setMargin({
			top: 35,
			right: 35,
			bottom: 35,
			left: 35
		});

		marginPreset = 'medium';
	}

	function handleMarginPresetChange(preset: 'small' | 'medium' | 'large') {
		marginPreset = preset;

		let value = 35;
		if (preset === 'small') value = 20;
		if (preset === 'medium') value = 35;
		if (preset === 'large') value = 50;

		mockupStore.setMargin({
			top: value,
			right: value,
			bottom: value,
			left: value
		});
	}

	const getChecked = () => fixedMargin;
	const setfixedMargin = (v: boolean) => mockupStore.setFixedMargin(v);

	const positionBalls = [
		{ style: 'left:25px; top:25px' }, // top-left
		{ style: 'left:50%; top:25px; transform:translateX(-50%)' }, // top-center
		{ style: 'right:25px; top:25px' }, // top-right

		{ style: 'left:25px; top:50%; transform:translateY(-50%)' }, // middle-left
		{ style: 'left:50%; top:50%; transform:translate(-50%,-50%)' }, // center
		{ style: 'right:25px; top:50%; transform:translateY(-50%)' }, // middle-right

		{ style: 'left:25px; bottom:25px' }, // bottom-left
		{ style: 'left:50%; bottom:25px; transform:translateX(-50%)' }, // bottom-center
		{ style: 'right:25px; bottom:25px' } // bottom-right
	];
</script>

<svelte:window onmousemove={handleWindowDrag} onmouseup={handleWindowDragEnd} />

<div class="z-60 select-none md:fixed" style="left:{windowPosition.x}px; top:{windowPosition.y}px">
	<div class="bg-sidebar min-w-80 overflow-hidden rounded-2xl border border-border">
		<div
			role="button"
			tabindex="0"
			class="flex items-center justify-between border-b border-border bg-bg p-4 md:cursor-move"
			onmousedown={handleWindowDragStart}
		>
			<div class="flex items-center gap-3">
				<DotsSixVerticalIcon size={16} weight="bold" class="hidden md:block" />
				<span class="text-lg font-semibold text-white">Position / Scale</span>
			</div>

			<div>
				<Button onclick={resetPosition} variant="outlined">
					<ArrowCounterClockwiseIcon size={16} weight="bold" />
				</Button>

				{#if isMobile && onClose}
					<Button onclick={onClose} variant="outlined">
						<XIcon size={16} weight="bold" />
					</Button>
				{/if}
			</div>
		</div>

		<div class="space-y-4 bg-bg p-6">
			<Tabs.Root bind:value={activeTab}>
				<Tabs.List class="flex gap-1 rounded-full bg-bg p-1 ring-2 ring-border">
					<Tabs.Trigger value="position">
						{#snippet child({ props })}
							<Button
								{...props}
								variant="filled"
								active={activeTab === 'position'}
								class="flex-1 rounded-l-2xl"
							>
								Position
							</Button>
						{/snippet}
					</Tabs.Trigger>

					<Tabs.Trigger value="margins">
						{#snippet child({ props })}
							<Button
								{...props}
								variant="filled"
								active={activeTab === 'margins'}
								class="flex-1 rounded-r-2xl"
							>
								Margins
							</Button>
						{/snippet}
					</Tabs.Trigger>
				</Tabs.List>

				<Tabs.Content value="position">
					<div
						bind:this={gridRef}
						class="relative my-4 h-60 w-full overflow-hidden rounded-xl border border-border bg-accent/10"
					>
						{#each positionBalls as ball, index (index)}
							<Button
								variant="outlined"
								class="absolute rounded-3xl p-6"
								style={ball.style}
								onclick={handleBallClick}
								aria-label="select position"
							></Button>
						{/each}
					</div>

					<div class="space-y-3">
						<div class="flex justify-between text-sm">
							<span>Scale</span>
							<span>{scale.toFixed(1)}x</span>
						</div>

						<Slider
							type="single"
							min={0.1}
							max={3}
							step={0.1}
							bind:value={
								() => scale,
								(value) => {
									scale = value;
									mockupStore.updateDevicePosition({ scale: value });
								}
							}
						/>
					</div>
				</Tabs.Content>

				<Tabs.Content value="margins">
					<div class="mt-6 space-y-2">
						<div class="mx-1 flex items-center justify-between">
							<Label.Root for="fixed-margin" class="text-sm font-medium">Fixed Margin</Label.Root>

							<Checkbox.Root
								id="fixed-margin"
								bind:checked={getChecked, setfixedMargin}
								onchange={(e) => {
									console.log('e', e);
								}}
								class="inline-flex size-5 items-center justify-center rounded-md border-2 border-text bg-bg transition active:scale-[0.98] data-[state=checked]:bg-text"
							>
								{#snippet children({ checked })}
									{#if checked}
										<CheckFatIcon size={14} class="text-bg" weight="fill" />
									{/if}
								{/snippet}
							</Checkbox.Root>
						</div>

						{#if fixedMargin}
							<div class="flex gap-1 rounded-sm bg-bg p-1">
								<Button
									active={marginPreset === 'small'}
									variant="outlined"
									class="flex-1 rounded-l-2xl "
									onclick={() => handleMarginPresetChange('small')}
								>
									Small
								</Button>

								<Button
									active={marginPreset === 'medium'}
									variant="outlined"
									onclick={() => handleMarginPresetChange('medium')}
								>
									Medium
								</Button>

								<Button
									active={marginPreset === 'large'}
									variant="outlined"
									class="rounded-r-2xl"
									onclick={() => handleMarginPresetChange('large')}
								>
									Large
								</Button>
							</div>
						{/if}
					</div>
				</Tabs.Content>
			</Tabs.Root>
		</div>
	</div>
</div>
