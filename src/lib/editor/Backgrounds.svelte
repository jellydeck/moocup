<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { Dialog } from 'bits-ui';
	import ImageIcon from 'phosphor-svelte/lib/ImageIcon';
	import CaretUpIcon from 'phosphor-svelte/lib/CaretUpIcon';
	import PlusIcon from 'phosphor-svelte/lib/PlusIcon';
	import XIcon from 'phosphor-svelte/lib/XIcon';
	import { mockupStore } from '$lib/contexts/store.svelte';

	import deepHorizon from '$lib/assets/deep_horizon.webp';
	import oceanGlow from '$lib/assets/ocean_glow.webp';
	import oceanBreeze from '$lib/assets/ocean_breeze.png';
	import purpleHaze from '$lib/assets/purple_haze.png';
	import summerVibes from '$lib/assets/summer_vibes.png';
	import rainbowDreams from '$lib/assets/rainbow_dreams.png';
	import neonHeat from '$lib/assets/neon_heat.webp';
	import purpleMagic from '$lib/assets/purple_magic.png';
	import sunsetGlow from '$lib/assets/sunset_glow.png';
	import warmEmbrace from '$lib/assets/warm_embrace.png';
	import cosmicNight from '$lib/assets/cosmic_night.webp';
	import mintBreeze from '$lib/assets/mint_breeze.webp';
	import neonMidnight from '$lib/assets/neon_midnight.webp';
	import monochrome from '$lib/assets/monochrome.png';
	import arcticPulse from '$lib/assets/arctic_pulse.webp';
	import moltenDusk from '$lib/assets/molten_dusk.webp';
	import twilightEmber from '$lib/assets/twilight_ember.webp';

	interface GradientPreset {
		name: string;
		image: string;
	}

	interface CustomBackground {
		name: string;
		image: string;
	}

	let isSheetOpen = $state(false);
	let isDialogOpen = $state(false);
	let isDragOver = $state(false);
	let fileInputRef = $state<HTMLInputElement | null>(null);

	const MAX_FILE_SIZE = 10 * 1024 * 1024;

	const gradientPresets: GradientPreset[] = [
		{ name: 'Deep Horizon', image: deepHorizon },
		{ name: 'Ocean Glow', image: oceanGlow },
		{ name: 'Ocean Breeze', image: oceanBreeze },
		{ name: 'Purple Haze', image: purpleHaze },
		{ name: 'Summer Vibes', image: summerVibes },
		{ name: 'Rainbow Dreams', image: rainbowDreams },
		{ name: 'Neon Heat', image: neonHeat },
		{ name: 'Purple Magic', image: purpleMagic },
		{ name: 'Sunset Glow', image: sunsetGlow },
		{ name: 'Warm Embrace', image: warmEmbrace },
		{ name: 'Cosmic Night', image: cosmicNight },
		{ name: 'Mint Breeze', image: mintBreeze },
		{ name: 'Neon Midnight', image: neonMidnight },
		{ name: 'Monochrome', image: monochrome },
		{ name: 'Arctic Pulse', image: arcticPulse },
		{ name: 'Molten Dusk', image: moltenDusk },
		{ name: 'Twilight Ember', image: twilightEmber }
	];

	const handleCustomBackground = (gradient: GradientPreset | CustomBackground) => {
		mockupStore.setBackgroundImage(gradient.image);
		isSheetOpen = false;
	};

	const handleImageUpload = (file: File) => {
		if (!['image/jpeg', 'image/png'].includes(file.type)) {
			toast.error('Invalid file format! Please use JPG, PNG.');
			isDragOver = false;
			isDialogOpen = false;
			return;
		}
		if (file.size > MAX_FILE_SIZE) {
			toast.error('File too large! Maximum size is 10MB.');
			isDragOver = false;
			isDialogOpen = false;
			return;
		}
		const reader = new FileReader();
		reader.onload = (e) => {
			const base64Image = e.target?.result as string;
			if (base64Image) {
				const newBg: CustomBackground = {
					name: `Custom ${mockupStore.customBackgrounds.length + 1}`,
					image: base64Image
				};
				mockupStore.addCustomBackground(newBg);
				toast('Background added successfully!');
				setTimeout(() => (isDialogOpen = false), 300);
				isDragOver = false;
			}
		};
		reader.onerror = () => {
			toast.error('Failed to read the file. Please try again.');
			isDragOver = false;
			isDialogOpen = false;
		};
		reader.readAsDataURL(file);
	};

	const handleDrop = (e: DragEvent) => {
		e.preventDefault();

		isDragOver = false;
		const file = e.dataTransfer?.files[0];
		if (!file) {
			toast.error('No valid file dropped.');
			isDialogOpen = false;
		} else {
			handleImageUpload(file);
		}
	};

	const handleFileInput = (e: Event) => {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) {
			toast.error('No file selected.');
			isDialogOpen = false;
		} else {
			handleImageUpload(file);
		}
	};

	const handlePaste = (e: ClipboardEvent) => {
		const file = e.clipboardData?.files[0];
		if (!file) {
			toast.error('No valid image pasted.');
			isDialogOpen = false;
		} else {
			handleImageUpload(file);
		}
	};
</script>

{#snippet gradientGrid()}
	<div class="flex flex-col gap-3">
		<h3 class="text-sm font-medium text-pine-text">Background Gradients</h3>
		<div class="grid grid-cols-1 gap-3 max-md:grid-cols-2 md:grid-cols-1">
			<!-- Custom upload button -->
			<button
				class="relative flex h-16 cursor-pointer overflow-hidden rounded-md border-2 border-dashed border-accent hover:outline-2 hover:outline-offset-2 hover:outline-text focus-visible:outline-2 focus-visible:outline-accent"
				onclick={() => (isDialogOpen = true)}
			>
				<span
					class="absolute top-1 left-1 flex gap-1 rounded bg-pine px-2 py-1 text-xs font-medium text-white"
				>
					<PlusIcon size={14} weight="bold" /> Custom Background</span
				>
			</button>

			<!-- preset backgrounds -->
			{#each [...mockupStore.customBackgrounds, ...gradientPresets] as gradient, i (gradient.name + i)}
				<button
					class={[
						'relative flex h-16 cursor-pointer overflow-hidden rounded-md hover:outline-2 hover:outline-offset-2 hover:outline-text focus-visible:outline-2 focus-visible:outline-accent',
						mockupStore.backgroundImage === gradient.image && 'ring-offset-0'
					]}
					style="background-image:url({gradient.image});background-size:cover;background-position:center"
					onclick={() => handleCustomBackground(gradient)}
				>
					<span
						class="absolute top-1 left-1 rounded bg-pine/70 px-2 py-1 text-xs font-medium text-white"
					>
						{gradient.name}
					</span>
				</button>
			{/each}
		</div>
	</div>
{/snippet}

<!-- Mobile trigger (hidden on md+) -->
<button
	class="fixed right-4 bottom-24 z-50 flex cursor-pointer items-center gap-2
	       rounded-full border border-accent bg-pine px-4 py-2 text-sm
	       font-medium text-pine-text md:hidden"
	onclick={() => (isSheetOpen = true)}
>
	<CaretUpIcon size={18} weight="bold" />
	Background Gradients
</button>

<!-- Mobile bottom sheet -->
<Dialog.Root bind:open={isSheetOpen}>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-40 bg-black/60" onclick={() => (isSheetOpen = false)} />
		<Dialog.Content
			class="fixed right-0 bottom-0 left-0 z-50 flex h-[80vh] flex-col
			       rounded-t-2xl border-t border-border bg-bg outline-none"
			aria-describedby={undefined}
		>
			<!-- drag handle -->
			<div class="flex justify-center pt-3 pb-1">
				<div class="h-1.5 w-12 rounded-full bg-border"></div>
			</div>
			<div class="flex-1 overflow-y-auto p-6">
				{@render gradientGrid()}
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

<!-- Desktop sidebar (hidden on mobile)-->
<div class="hidden w-80 overflow-y-auto border-l border-border bg-bg p-6 md:block">
	{@render gradientGrid()}
</div>

<!-- Upload dialog -->
<Dialog.Root bind:open={isDialogOpen}>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-50 bg-black/80" />
		<Dialog.Content
			class="fixed top-1/2 left-1/2 z-60 w-[min(90vw,32rem)] -translate-x-1/2
			       -translate-y-1/2 rounded-2xl border border-accent bg-bg p-6 outline-none"
			onpaste={handlePaste}
			aria-describedby="upload-desc"
		>
			<Dialog.Title class="mb-1 text-base font-semibold text-pine-text">
				Upload Custom Background
			</Dialog.Title>
			<p id="upload-desc" class="mb-4 text-sm text-pine-text/60">
				Add a custom background to personalise your creation.
			</p>

			<!-- Drop zone -->
			<div
				class="relative flex h-64 w-full cursor-pointer flex-col items-center
				       justify-center rounded-xl border-2 border-dotted
				       {isDragOver ? 'border-accent bg-accent/10' : 'border-border bg-accent/5 hover:bg-accent/10'}"
				ondrop={handleDrop}
				ondragover={(e) => {
					e.preventDefault();
					isDragOver = true;
				}}
				ondragleave={() => (isDragOver = false)}
				onclick={() => fileInputRef?.click()}
				role="button"
				tabindex="0"
				onkeydown={(e) => e.key === 'Enter' && fileInputRef?.click()}
			>
				<ImageIcon size={48} class="mb-3 text-pine-text/50" />
				<p class="text-base font-semibold text-pine-text">Drop image here or click to upload</p>
				<p class="mt-1 text-sm text-pine-text/50">Supports JPG, PNG</p>

				{#if isDragOver}
					<div class="absolute inset-0 flex items-center justify-center rounded-xl bg-accent/20">
						<span class="rounded-lg bg-white/90 px-6 py-3 text-sm font-semibold text-accent">
							Drop image here
						</span>
					</div>
				{/if}
			</div>

			<input
				bind:this={fileInputRef}
				type="file"
				accept="image/jpeg,image/png"
				onchange={handleFileInput}
				class="hidden"
			/>

			<Dialog.Close
				class="absolute top-3 right-3 flex h-8 w-8 cursor-pointer items-center
				       justify-center rounded-full border-none
				       text-xs text-pine-text hover:text-text hover:ring-2 hover:ring-accent"
			>
				<XIcon size={16} weight="bold" />
			</Dialog.Close>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
