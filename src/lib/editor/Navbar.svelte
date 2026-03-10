<script lang="ts">
	import { Dialog, Popover, ToggleGroup } from 'bits-ui';
	import DownloadSimpleIcon from 'phosphor-svelte/lib/DownloadSimpleIcon';
	import CaretDownIcon from 'phosphor-svelte/lib/CaretDownIcon';
	import CoffeeIcon from 'phosphor-svelte/lib/CoffeeIcon';
	import ArrowSquareOutIcon from 'phosphor-svelte/lib/ArrowSquareOutIcon';
	import SpinnerGapIcon from 'phosphor-svelte/lib/SpinnerGapIcon';
	import HeartIcon from 'phosphor-svelte/lib/HeartIcon';
	import XIcon from 'phosphor-svelte/lib/XIcon';
	import GithubLogoIcon from 'phosphor-svelte/lib/GithubLogoIcon';
	import XLogoIcon from 'phosphor-svelte/lib/XLogoIcon';

	import { toast } from 'svelte-sonner';
	import { mockupStore } from '$lib/contexts/store.svelte';
	import html2canvas from 'html2canvas';
	import upiQR from '$lib/assets/upiQR.png';
	import Button from '$lib/components/Button.svelte';

	let exportFormat = $state('PNG');
	let quality = $state('2');
	let isExporting = $state(false);
	let isDialogOpen = $state(false);
	let isUpiDialogOpen = $state(false);

	const { uploadedImage } = $derived(mockupStore);

	const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

	async function exportImage(format: string, qualityMultiplier: number) {
		if (!uploadedImage) return;

		const mockupElement = document.querySelector('[data-mockup-canvas]') as HTMLDivElement;
		if (!mockupElement) throw new Error('Mockup canvas not found');

		const imgElement = mockupElement.querySelector('img') as HTMLImageElement;
		if (!imgElement) throw new Error('Image element not found');

		const canvas = await html2canvas(mockupElement, {
			scale: qualityMultiplier * 2,
			useCORS: true,
			allowTaint: true,
			backgroundColor: null
		});

		const mimeType = `image/${format.toLowerCase()}`;
		const imageQuality = format === 'JPEG' ? 1 : undefined;

		canvas.toBlob(
			(blob) => {
				if (!blob) throw new Error('Failed to create blob');
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `mockup-${Date.now()}.${format.toLowerCase()}`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
			},
			mimeType,
			imageQuality
		);
	}

	async function handleSingleExport() {
		if (!uploadedImage) {
			toast.error('Please upload an image first');
			return;
		}
		isExporting = true;
		try {
			await exportImage(exportFormat, parseInt(quality));
			toast.success(`Successfully exported as ${exportFormat}!`);
		} catch {
			toast.error('Failed to export image. Please try again.');
		} finally {
			isExporting = false;
		}
	}

	async function handleAllFormatsExport() {
		if (!uploadedImage) {
			toast.error('Please upload an image first');
			return;
		}
		isExporting = true;
		const formats = ['PNG', 'JPEG', 'WebP'];
		try {
			await Promise.all(formats.map((f) => exportImage(f, parseInt(quality))));
			toast.success(`Successfully exported all formats (${formats.join(', ')})!`);
		} catch {
			toast.error('Failed to export some formats. Please try again.');
		} finally {
			isExporting = false;
		}
	}
</script>

<!-- ─── Export Panel Snippet ──────────────────────────────── -->
{#snippet exportOptions()}
	<div class={isMobile ? 'flex flex-col gap-2' : 'grid grid-cols-2 gap-6'}>
		<!-- Controls col -->
		<div class={!isMobile ? 'order-2' : 'order-1'}>
			<h3 class="text-foreground mb-6 flex items-center gap-2 text-xl font-semibold">
				<DownloadSimpleIcon size={20} class="text-primary" />
				Export Settings
			</h3>

			<!-- Format -->
			<div class="space-y-2">
				<label class="text-sm font-medium">Format</label>
				<ToggleGroup.Root
					type="single"
					bind:value={exportFormat}
					class="bg-sidebar/80 ring-secondary flex gap-1 rounded-full p-1 ring-2"
				>
					{#each ['PNG', 'JPEG', 'WebP'] as fmt}
						<ToggleGroup.Item
							value={fmt}
							class="hover:bg-secondary hover:text-secondary-foreground data-[state=on]:bg-primary/20 data-[state=on]:text-primary flex-1 cursor-pointer rounded-full px-3 py-1.5 text-sm transition-colors"
						>
							{fmt}
						</ToggleGroup.Item>
					{/each}
				</ToggleGroup.Root>
			</div>

			<!-- Quality -->
			<div class="mt-6 space-y-2">
				<label class="text-sm font-medium">Quality</label>
				<ToggleGroup.Root
					type="single"
					bind:value={quality}
					class="bg-sidebar/80 ring-secondary flex gap-1 rounded-full p-1 ring-2"
				>
					{#each [['1', 'Standard'], ['2', 'High'], ['3', 'Ultra']] as [val, label]}
						<ToggleGroup.Item
							value={val}
							class="hover:bg-secondary hover:text-secondary-foreground data-[state=on]:bg-primary/20 data-[state=on]:text-primary flex-1 cursor-pointer rounded-full px-3 py-1.5 text-sm transition-colors"
						>
							{label}
						</ToggleGroup.Item>
					{/each}
				</ToggleGroup.Root>
			</div>

			<!-- Export Buttons -->
			<div class="mt-12 grid grid-cols-2 gap-3">
				<Button onclick={handleSingleExport} disabled={isExporting || !uploadedImage}>
					{#if isExporting}
						<SpinnerGapIcon size={20} class="animate-spin" /> Exporting...
					{:else}
						<DownloadSimpleIcon size={20} /> Export as {exportFormat}
					{/if}
				</Button>

				<Button onclick={handleAllFormatsExport} disabled={isExporting || !uploadedImage}>
					{#if isExporting}
						<SpinnerGapIcon size={20} class="animate-spin" /> Exporting All...
					{:else}
						<DownloadSimpleIcon size={20} /> Export All Formats
					{/if}
				</Button>
			</div>

			<a
				href="https://github.com/jellydeck/moocup"
				target="_blank"
				rel="noopener noreferrer"
				class="text-muted-foreground hover:text-foreground mt-3 inline-flex w-full items-center justify-center gap-2 py-2 text-sm transition-colors"
			>
				<GithubLogoIcon size={20} />
				Hey, You can also help us out here
			</a>
		</div>

		<!-- Support card col -->
		<div
			class={`border-primary/20 rounded-xl border-2 border-dashed p-5 ${!isMobile ? 'order-1' : 'order-2'} group`}
		>
			<HeartIcon
				size={20}
				weight="duotone"
				class="text-primary mb-4 transition-colors group-hover:animate-pulse"
			/>

			<div class="mb-4 space-y-1">
				<p class="text-foreground text-sm leading-relaxed">
					Hi, I'm
					<a
						href="https://jaydip.me"
						target="_blank"
						rel="noopener noreferrer"
						class="text-primary mx-1 inline-flex items-center gap-1 underline hover:no-underline"
					>
						Jaydip <ArrowSquareOutIcon size={12} />
					</a>
				</p>
				<p class="text-muted-foreground text-sm leading-relaxed">
					moocup is a simple offline tool.
				</p>
				<p class="text-muted-foreground text-sm leading-relaxed">
					focus on your craft, we'll take care of rest.
				</p>
				<p class="text-muted-foreground text-sm leading-relaxed">
					you can show your support by sponsoring my work!
				</p>
			</div>

			<div class="space-y-3">
				<a
					href="https://ko-fi.com/jaydipsanghani"
					target="_blank"
					rel="noopener noreferrer"
					class="bg-primary text-primary-foreground hover:bg-primary/90 flex h-12 w-full items-center justify-center gap-2 rounded-md font-medium shadow-md transition-colors"
				>
					<CoffeeIcon size={20} />
					Buy a coffee
				</a>

				<!-- UPI Dialog -->
				<Dialog.Root bind:open={isUpiDialogOpen}>
					<Dialog.Trigger
						class="border-primary/30 bg-background hover:bg-primary/5 hover:border-primary/50 flex h-12 w-full items-center justify-center rounded-md border font-medium transition-colors"
					>
						UPI (India)
					</Dialog.Trigger>
					<Dialog.Portal>
						<Dialog.Overlay
							class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80"
						/>
						<Dialog.Content
							class="bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 w-full max-w-xs translate-x-[-50%] translate-y-[-50%] rounded-xl border p-6 shadow-lg outline-none"
						>
							<Dialog.Title class="mb-4 text-center text-lg font-semibold">
								Thanks for contribution!
							</Dialog.Title>
							<div class="flex flex-col items-center gap-4 py-4">
								<div
									class="bg-muted border-muted-foreground/20 flex h-48 w-48 items-center justify-center rounded-xl border-2 border-dashed"
								>
									<img src={upiQR} class="size-full" alt="QR code for UPI payment" />
								</div>
								<p class="text-muted-foreground text-center text-sm">Scan with any UPI app</p>
							</div>
							<Dialog.Close
								class="absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100"
								aria-label="Close"
							>
								<XIcon size={16} />
							</Dialog.Close>
						</Dialog.Content>
					</Dialog.Portal>
				</Dialog.Root>
			</div>

			<!-- Social links -->
			<div class="mt-4 space-y-2">
				<h4 class="text-muted-foreground text-sm font-medium">
					Say Hi!
					<span class="ml-2 text-sm">I'm always up for quick chat :)</span>
				</h4>
				<div class="flex gap-2">
					<a
						href="https://bsky.app/profile/jellydeck.bsky.social"
						target="_blank"
						rel="noopener noreferrer"
						class="bg-secondary text-secondary-foreground hover:bg-secondary/80 flex h-9 flex-1 items-center justify-center gap-2 rounded-md text-sm transition-colors"
					>
						<!-- Bluesky has no Phosphor icon — inline SVG -->
						<svg
							width="16"
							height="16"
							viewBox="0 0 360 320"
							fill="currentColor"
							aria-hidden="true"
						>
							<path
								d="M180 142c-16-79-79-131-130-131C20 11 0 45 0 80c0 30 13 54 35 64C14 148 0 168 0 192c0 37 28 64 65 64 41 0 75-26 96-64 7-13 13-27 19-42 6 15 12 29 19 42 21 38 55 64 96 64 37 0 65-27 65-64 0-24-14-44-35-48 22-10 35-34 35-64 0-35-20-69-50-69-51 0-114 52-130 131z"
							/>
						</svg>
						Bluesky
					</a>
					<a
						href="https://x.com/JellyDeck"
						target="_blank"
						rel="noopener noreferrer"
						class="bg-secondary text-secondary-foreground hover:bg-secondary/80 flex h-9 flex-1 items-center justify-center gap-2 rounded-md text-sm transition-colors"
					>
						<XLogoIcon size={16} />
						Twitter
					</a>
				</div>
			</div>
		</div>
	</div>
{/snippet}

<!-- ─── Navbar ─────────────────────────────────────────────── -->
<div class="bg-background/80 sticky top-0 z-50 border-b backdrop-blur-lg">
	<div class="flex h-16 items-center justify-between px-4 lg:mx-40">
		<!-- Logo -->
		<div class="flex items-center gap-4">
			<div class="flex items-center">
				<h1 class="text-primary text-xl font-bold">Moo</h1>
				<a href="https://ko-fi.com/jaydipsanghani" target="_blank" rel="noopener noreferrer">
					<CoffeeIcon
						size={24}
						class="text-primary hover:text-primary/80 cursor-pointer transition-transform hover:rotate-12"
					/>
				</a>
			</div>
			{#if !isMobile}
				<div class="text-muted-foreground flex items-center gap-2 text-sm">
					<span>crafted by</span>
					<a
						href="https://jaydip.me"
						target="_blank"
						rel="noopener noreferrer"
						class="text-primary text-sm underline hover:no-underline"
					>
						Jaydip
					</a>
				</div>
			{/if}
		</div>

		<!-- Actions -->
		<div class="flex items-center gap-2">
			<Button href="https://github.com/jellydeck/moocup" target="_blank" rel="noopener noreferrer">
				<GithubLogoIcon size={20} weight="bold" /> Send us a star!
			</Button>

			{#if isMobile}
				<!-- Mobile: Dialog -->
				<Dialog.Root bind:open={isDialogOpen}>
					<Dialog.Trigger
						disabled={!uploadedImage}
						class="bg-primary text-primary-foreground hover:bg-primary/90 flex h-10 w-10 items-center justify-center rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-50"
					>
						<DownloadSimpleIcon size={20} />
					</Dialog.Trigger>
					<Dialog.Portal>
						<Dialog.Overlay
							class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80"
						/>
						<Dialog.Content
							class="bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 flex h-[90vh] max-h-[90vh] w-[95vw] max-w-md translate-x-[-50%] translate-y-[-50%] flex-col rounded-xl border shadow-lg outline-none"
						>
							<div class="flex shrink-0 items-center justify-between border-b p-4">
								<Dialog.Title class="text-lg font-semibold">Export & Support</Dialog.Title>
								<Dialog.Close
									class="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-accent"
								>
									<XIcon size={16} />
								</Dialog.Close>
							</div>
							<div class="flex-1 overflow-y-auto">
								<div class="px-4 pb-4">
									{@render exportOptions()}
								</div>
							</div>
						</Dialog.Content>
					</Dialog.Portal>
				</Dialog.Root>
			{:else}
				<!-- Desktop: Popover -->
				<Popover.Root>
					<Popover.Trigger disabled={!uploadedImage}>
						<Button>
							Export
							<CaretDownIcon
								size={16}
								weight="bold"
								class="ms-2 transition-transform group-data-[state=open]:rotate-180"
							/>
						</Button>
					</Popover.Trigger>
					<Popover.Portal>
						<Popover.Content
							align="end"
							sideOffset={6}
							class="bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 z-50 w-[900px] rounded-2xl border p-6 shadow-lg outline-none"
						>
							{@render exportOptions()}
						</Popover.Content>
					</Popover.Portal>
				</Popover.Root>
			{/if}
		</div>
	</div>
</div>
