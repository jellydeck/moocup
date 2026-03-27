<script lang="ts">
	import { mockupStore } from '$lib/contexts/store.svelte';
	import { extractDominantColor } from '$lib/utils';
	import DotsSixVerticalIcon from 'phosphor-svelte/lib/DotsSixVerticalIcon';
	import ArrowCounterClockwiseIcon from 'phosphor-svelte/lib/ArrowCounterClockwiseIcon';
	import MagicWandIcon from 'phosphor-svelte/lib/MagicWandIcon';
	import Button from '$lib/components/Button.svelte';
	import Slider from '$lib/components/Slider.svelte';
	import Switch from '$lib/components/Switch.svelte';
	import { XIcon } from 'phosphor-svelte';
	import { browser } from '$app/environment';

	const { onClose } = $props();

	let isDragging = $state(false);
	let windowPosition = $state({ x: 300, y: 100 });
	let dragStart = $state({ x: 0, y: 0 });
	let isLoadingColor = $state(false);
	let isMobile = $state(browser ? window.innerWidth < 768 : false);

	let imageBorder = $derived(mockupStore.imageBorder);
	let uploadedImage = $derived(mockupStore.uploadedImage);
	let initialRgba = $derived(parseRgba(imageBorder.color));
	let isTransparent = $derived(initialRgba.a < 1);
	let opacity = $derived(Math.max(0.3, initialRgba.a));

	function parseRgba(color: string): { r: number; g: number; b: number; a: number } {
		const matches = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
		if (matches) {
			return {
				r: parseInt(matches[1]),
				g: parseInt(matches[2]),
				b: parseInt(matches[3]),
				a: parseFloat(matches[4])
			};
		}
		return { r: 156, g: 163, b: 137, a: 1 };
	}

	function convertToRgba(r: number, g: number, b: number, a: number): string {
		return `rgba(${r}, ${g}, ${b}, ${a})`;
	}

	function hexToRgb(hex: string): { r: number; g: number; b: number } {
		return {
			r: parseInt(hex.slice(1, 3), 16),
			g: parseInt(hex.slice(3, 5), 16),
			b: parseInt(hex.slice(5, 7), 16)
		};
	}

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

	function resetBorder() {
		mockupStore.setImageBorder({
			width: 8,
			color: 'rgba(156, 163, 137, 1)',
			radius: 22,
			enabled: false,
			shadow: 'rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px'
		});
		isTransparent = false;
		opacity = 1;
	}

	async function handleMagicWandClick() {
		if (!uploadedImage) return;
		isLoadingColor = true;
		try {
			const dominantColor = await extractDominantColor(uploadedImage);
			const hex = /^#[0-9A-Fa-f]{6}$/.test(dominantColor) ? dominantColor : '#9CA389';
			const { r, g, b } = hexToRgb(hex);
			mockupStore.setImageBorder({
				color: convertToRgba(r, g, b, isTransparent ? opacity : 1)
			});
		} catch {
			mockupStore.setImageBorder({
				color: convertToRgba(156, 163, 137, isTransparent ? opacity : 1)
			});
		} finally {
			isLoadingColor = false;
		}
	}

	function handleColorSelect(color: string) {
		const { r, g, b } = parseRgba(color);
		mockupStore.setImageBorder({
			color: convertToRgba(r, g, b, isTransparent ? opacity : 1)
		});
	}

	function handleOpacityChange(value: number) {
		const newOpacity = Math.max(0.3, value);
		opacity = newOpacity;
		if (isTransparent) {
			const { r, g, b } = parseRgba(imageBorder.color);
			mockupStore.setImageBorder({ color: convertToRgba(r, g, b, newOpacity) });
		}
	}

	const colorOptions = [
		'rgba(255, 255, 255, 1)',
		'rgba(156, 163, 137, 1)',
		'rgba(0, 0, 0, 1)',
		'rgba(255, 107, 107, 1)',
		'rgba(254, 202, 87, 1)',
		'rgba(78, 205, 196, 1)',
		'rgba(69, 183, 209, 1)'
	];

	function isColorSelected(color: string): boolean {
		const { r, g, b } = parseRgba(color);
		return imageBorder.color === color || imageBorder.color === convertToRgba(r, g, b, opacity);
	}
</script>

<svelte:window onmousemove={handleWindowDrag} onmouseup={handleWindowDragEnd} />

<div class="z-60 select-none md:fixed" style="left:{windowPosition.x}px; top:{windowPosition.y}px">
	<div class="min-w-80 overflow-hidden rounded-2xl border border-border bg-bg max-md:border-none">
		<!-- HEADER -->
		<div
			role="button"
			tabindex="0"
			class="flex items-center justify-between border-b border-border bg-bg p-4 md:cursor-move"
			onmousedown={handleWindowDragStart}
		>
			<div class="flex items-center gap-3">
				<DotsSixVerticalIcon size={16} weight="bold" class="hidden md:block" />
				<span class="text-lg font-semibold text-white">Image Border</span>
			</div>

			<div>
				<Button onclick={resetBorder} variant="outlined">
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
			<!-- Enable Border -->
			<div class="flex items-center justify-between">
				<Switch bind:checked={imageBorder.enabled} labelText="border" />
			</div>

			<!-- Transparent Border -->
			{#if imageBorder.enabled}
				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<Switch bind:checked={isTransparent} labelText="Transparent Border" />
					</div>
					{#if isTransparent}
						<div class="space-y-3">
							<div class="flex items-center justify-between">
								<span class="text-sm text-white">Opacity</span>
								<span class="text-sm text-text">{Math.round(opacity * 100)}%</span>
							</div>
							<Slider
								type="single"
								min={0.3}
								max={1}
								step={0.01}
								bind:value={() => opacity, handleOpacityChange}
							/>
						</div>
					{/if}
				</div>

				<!-- Color -->
				<div class="space-y-3">
					<div class="flex items-center gap-2">
						<span class="text-sm text-white">Color</span>
					</div>
					<div class="grid grid-cols-4 gap-3">
						<!-- Magic Wand -->
						<Button
							variant="outlined"
							onclick={handleMagicWandClick}
							disabled={isLoadingColor || !uploadedImage}
						>
							<MagicWandIcon size={20} class="text-text" />
						</Button>

						<!-- Color swatches -->
						{#each colorOptions as color (color)}
							{@const { r, g, b } = parseRgba(color)}
							<Button
								onclick={() => handleColorSelect(color)}
								class={[
									'h-10 w-full rounded-md outline-2 outline-offset-2 hover:inset-shadow-none hover:outline-text',
									isColorSelected(color) && 'outline-text'
								]}
								style="background-color: {isTransparent ? convertToRgba(r, g, b, opacity) : color}"
							/>
						{/each}
					</div>
				</div>

				<!-- Width -->
				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<span class="text-sm text-white">Width</span>
						</div>
						<span class="text-sm text-text">{imageBorder.width}px</span>
					</div>
					<Slider
						type="single"
						min={0}
						max={20}
						step={1}
						bind:value={() => imageBorder.width, (v) => mockupStore.setImageBorder({ width: v })}
					/>
				</div>

				<!-- Radius -->
				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<span class="text-sm text-white">Radius</span>
						</div>
						<span class="text-sm text-text">{imageBorder.radius}px</span>
					</div>
					<Slider
						type="single"
						min={0}
						max={50}
						step={1}
						bind:value={() => imageBorder.radius, (v) => mockupStore.setImageBorder({ radius: v })}
					/>
				</div>
			{/if}
		</div>
	</div>
</div>
