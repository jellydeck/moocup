<script lang="ts">
	import { Dialog, Popover, ToggleGroup } from 'bits-ui';
	import DownloadSimpleIcon from 'phosphor-svelte/lib/DownloadSimpleIcon';
	import CaretDownIcon from 'phosphor-svelte/lib/CaretDownIcon';
	import CoffeeIcon from 'phosphor-svelte/lib/CoffeeIcon';
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
	import { browser } from '$app/environment';

	let exportFormat = $state('PNG');
	let quality = $state('2');
	let isExporting = $state(false);
	let isDialogOpen = $state(false);
	let isUpiDialogOpen = $state(false);

	const { uploadedImage } = $derived(mockupStore);

	let isMobile = $state(browser ? window.innerWidth < 768 : false);

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
				a.download = `moocup-${Date.now()}.${format.toLowerCase()}`;
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
</script>

{#snippet exportOptions()}
	<div class={isMobile ? 'flex flex-col gap-2' : 'grid grid-cols-2 gap-6'}>
		<!-- Controls -->
		<div class={!isMobile ? 'order-2' : 'order-1'}>
			<h3 class="text-foreground mb-6 flex items-center gap-2 text-xl font-semibold">
				<DownloadSimpleIcon size={20} weight="bold" />
				Export Options
			</h3>

			<!-- Format -->
			<div class="space-y-2">
				<fieldset>
					<legend class="mb-1 text-sm font-bold">Format</legend>
					<ToggleGroup.Root
						type="single"
						bind:value={exportFormat}
						class="flex gap-1 rounded-full bg-pine/30 p-1"
					>
						{#each ['PNG', 'JPEG', 'WebP'] as fmt (fmt)}
							<ToggleGroup.Item value={fmt}>
								{#snippet child({ props })}
									<Button
										{...props}
										variant="outlined"
										active={props['data-state'] === 'on'}
										class="flex-1 first:rounded-l-2xl last:rounded-r-2xl"
									>
										{fmt}
									</Button>
								{/snippet}
							</ToggleGroup.Item>
						{/each}
					</ToggleGroup.Root>
				</fieldset>
			</div>

			<!-- Quality -->
			<div class="mt-6 space-y-2">
				<fieldset>
					<legend class="mb-1 text-sm font-bold">Quality</legend>
					<ToggleGroup.Root
						type="single"
						bind:value={quality}
						class="flex gap-1 rounded-full bg-pine/50 p-1"
					>
						{#each [['1', 'Standard'], ['2', 'High'], ['3', 'Ultra']] as [val, label] (label)}
							<ToggleGroup.Item value={val}>
								{#snippet child({ props })}
									<Button
										{...props}
										variant="outlined"
										active={props['data-state'] === 'on'}
										class="flex-1 first:rounded-l-2xl last:rounded-r-2xl"
									>
										{label}
									</Button>
								{/snippet}
							</ToggleGroup.Item>
						{/each}
					</ToggleGroup.Root>
				</fieldset>
			</div>

			<!-- Export Buttons -->
			<div class="mt-10 flex justify-center">
				<Button
					class="flex-1"
					onclick={handleSingleExport}
					disabled={isExporting || !uploadedImage}
				>
					{#if isExporting}
						<SpinnerGapIcon size={20} class="animate-spin" /> Exporting...
					{:else}
						<DownloadSimpleIcon size={20} weight="bold" /> Export as {exportFormat}
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
				If you like, You can also help us out here
			</a>
		</div>

		<!-- My Letter -->
		<div
			class={`rounded-3xl border-2 border-dotted border-accent/70 p-5 ${!isMobile ? 'order-1' : 'order-2'} group`}
		>
			<HeartIcon
				size={20}
				weight="duotone"
				class="mb-4 text-text transition-colors group-hover:animate-pulse"
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
						Jaydip
					</a>
				</p>
				<p class="text-muted-foreground text-sm leading-relaxed">
					moocup is a simple offline tool.
				</p>
				<p class="text-muted-foreground text-sm leading-relaxed">
					you can show your support by sponsoring my work!
				</p>
			</div>

			<div class="flex gap-2">
				<Button
					href="https://ko-fi.com/jaydipsanghani"
					target="_blank"
					rel="noopener noreferrer"
					class="transition-colors"
				>
					<CoffeeIcon size={20} weight="bold" />
					Buy a coffee
				</Button>

				<!-- UPI Dialog -->
				<Dialog.Root bind:open={isUpiDialogOpen}>
					<Dialog.Trigger>
						{#snippet child({ props })}
							<Button variant="outlined" {...props}>UPI (India)</Button>
						{/snippet}
					</Dialog.Trigger>

					<Dialog.Portal>
						<Dialog.Overlay
							class="fixed inset-0 z-50 bg-black/80 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0"
						/>
						<Dialog.Content
							class="fixed top-[50%] left-[50%] z-50 w-full max-w-xs translate-x-[-50%] translate-y-[-50%] rounded-xl border bg-bg p-6 shadow-lg outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
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
			<div class="mt-10 text-sm">
				<h4 class="text-muted-foreground mb-4 font-medium">
					Say Hi!
					<span class="ml-2">I'm always up for quick chat :)</span>
				</h4>

				<a
					href="https://bsky.app/profile/jaydip.me"
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center justify-center gap-2 rounded-md transition-colors"
				>
					<!-- Bluesky -->
					<svg fill="none" viewBox="0 0 64 57" width={20} height={20} class="text-text">
						<path
							fill="currentColor"
							d="M13.873 3.805C21.21 9.332 29.103 20.537 32 26.55v15.882c0-.338-.13.044-.41.867-1.512 4.456-7.418 21.847-20.923 7.944-7.111-7.32-3.819-14.64 9.125-16.85-7.405 1.264-15.73-.825-18.014-9.015C1.12 23.022 0 8.51 0 6.55 0-3.268 8.579-.182 13.873 3.805ZM50.127 3.805C42.79 9.332 34.897 20.537 32 26.55v15.882c0-.338.13.044.41.867 1.512 4.456 7.418 21.847 20.923 7.944 7.111-7.32 3.819-14.64-9.125-16.85 7.405 1.264 15.73-.825 18.014-9.015C62.88 23.022 64 8.51 64 6.55c0-9.818-8.578-6.732-13.873-2.745Z"
						></path>
					</svg>
					Bluesky
				</a>
				<a
					href="https://x.com/jellydeck"
					target="_blank"
					rel="noopener noreferrer"
					class="ml-4 inline-flex items-center justify-center gap-2 rounded-md text-sm transition-colors"
				>
					<XLogoIcon size={20} class="text-text" />
					Twitter
				</a>
			</div>
		</div>
	</div>
{/snippet}

<div class="bg-background/80 sticky top-0 z-50 border-b border-border">
	<div class="flex h-16 items-center justify-between px-4 lg:mr-46 lg:ml-40">
		<!-- Logo -->
		<div class="flex items-center gap-4">
			<div class="flex items-center">
				<a
					href="https://ko-fi.com/jaydipsanghani"
					target="_blank"
					rel="noopener noreferrer"
					class="group"
				>
					<CoffeeIcon
						size={24}
						weight="regular"
						class="text-primary transition-transform group-hover:hidden group-hover:rotate-12"
					/>
					<CoffeeIcon
						size={24}
						weight="duotone"
						class="text-primary hidden transition-transform group-hover:block group-hover:rotate-12"
					/>
				</a>
			</div>
			{#if !isMobile}
				<div class="flex items-center gap-2 text-text">
					<span>crafted by</span>
					<a
						href="https://jaydip.me"
						target="_blank"
						rel="noopener noreferrer"
						class="text-sm text-white underline hover:no-underline"
					>
						Jaydip
					</a>

					<div class="ml-1 flex w-60 flex-wrap rounded-md border border-border bg-accent/40 p-1">
						new look, more coming soon
					</div>
				</div>
			{/if}
		</div>

		<!-- Actions -->
		<div class="flex items-center gap-2">
			<Button
				variant="outlined"
				href="https://github.com/jellydeck/moocup"
				target="_blank"
				rel="noopener noreferrer"
			>
				<GithubLogoIcon size={20} weight="bold" /> Send us a star!
			</Button>

			{#if isMobile}
				<Dialog.Root bind:open={isDialogOpen}>
					<Dialog.Trigger
						class="flex h-10 w-10 items-center justify-center rounded-md bg-bg transition-colors disabled:cursor-not-allowed disabled:opacity-50"
					>
						<DownloadSimpleIcon size={20} weight="bold" />
					</Dialog.Trigger>
					<Dialog.Portal>
						<Dialog.Overlay
							class="fixed inset-0 z-50 bg-black/80 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0"
						/>
						<Dialog.Content
							class="fixed top-[50%] left-[50%] z-50 flex h-[90vh] max-h-[90vh] w-[95vw] max-w-md translate-x-[-50%] translate-y-[-50%] flex-col rounded-xs border bg-bg shadow-lg outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
						>
							<div class="flex shrink-0 items-center justify-between border-b p-4">
								<Dialog.Title class="text-lg font-semibold">Export & Support</Dialog.Title>
								<Dialog.Close
									class="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-accent"
								>
									<XIcon size={16} weight="bold" />
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
				<Popover.Root>
					<Popover.Trigger>
						<Button
							class="group data-[active=true]:translate-y-px data-[state=open]:bg-accent data-[state=open]:text-white data-[state=open]:inset-shadow-[0_3px_3px_0]  data-[state=open]:inset-shadow-bg/80"
						>
							Export
							<CaretDownIcon
								size={16}
								weight="bold"
								class="ms-2 transition-transform duration-200 group-data-[state=open]:rotate-180"
							/>
						</Button>
					</Popover.Trigger>
					<Popover.Portal>
						<Popover.Content
							align="end"
							sideOffset={6}
							class="z-50 mt-2 w-225 rounded-lg border border-border bg-bg p-4 text-white shadow-lg outline-none
							data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-1
							data-[state=open]:animate-in data-[state=open]:slide-in-from-top-1"
						>
							{@render exportOptions()}
						</Popover.Content>
					</Popover.Portal>
				</Popover.Root>
			{/if}
		</div>
	</div>
</div>
