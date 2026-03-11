<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { extractDominantColor } from '$lib/utils';
	import ImageIcon from 'phosphor-svelte/lib/ImageIcon';
	import Clipboard from 'phosphor-svelte/lib/Clipboard';
	import { mockupStore } from '$lib/contexts/store.svelte';

	// ─── Types ───────────────────────────────────────────────────────────────────

	interface ResponsiveConfig {
		isMobile: boolean;
		isTablet: boolean;
		basePadding: number;
		scaleMultiplier: number;
		maxContainerWidth: number;
		maxContainerHeight: number;
		dropZoneWidth: string;
		dropZoneHeight: string;
	}

	interface ImageDimensions {
		width: number;
		height: number;
	}

	// ─── Responsive config ───────────────────────────────────────────────────────

	const getResponsiveConfig = (): ResponsiveConfig => {
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;
		const isMobile = viewportWidth < 768;
		const isTablet = viewportWidth >= 768 && viewportWidth < 1024;
		const basePadding = isMobile ? 40 : isTablet ? 100 : 200;
		const scaleMultiplier = isMobile ? 0.95 : isTablet ? 0.85 : 0.8;
		const maxWidth = isMobile ? 1000 : isTablet ? 1100 : 1200;
		const maxHeight = isMobile ? 700 : isTablet ? 750 : 800;
		const availableWidth = viewportWidth - basePadding;
		const availableHeight = viewportHeight - basePadding;
		const maxContainerWidth = Math.min(availableWidth * scaleMultiplier, maxWidth);
		const maxContainerHeight = Math.min(availableHeight * scaleMultiplier, maxHeight);
		return {
			isMobile,
			isTablet,
			basePadding,
			scaleMultiplier,
			maxContainerWidth,
			maxContainerHeight,
			dropZoneWidth: isMobile ? '95%' : isTablet ? '70%' : '60%',
			dropZoneHeight: isMobile ? '60%' : '50%'
		};
	};

	// ─── Image utilities ─────────────────────────────────────────────────────────

	const optimizeImage = (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			if (file.size < 2 * 1024 * 1024) {
				const reader = new FileReader();
				reader.onload = (e) => resolve(e.target?.result as string);
				reader.onerror = reject;
				reader.readAsDataURL(file);
				return;
			}
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			const img = new Image();
			img.onload = () => {
				const MAX_WIDTH = 2400;
				const MAX_HEIGHT = 1800;
				let { width, height } = img;
				if (width > MAX_WIDTH || height > MAX_HEIGHT) {
					const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
					width = Math.round(width * ratio);
					height = Math.round(height * ratio);
				}
				canvas.width = width;
				canvas.height = height;
				ctx?.drawImage(img, 0, 0, width, height);
				let optimizedDataUrl: string;
				try {
					optimizedDataUrl = canvas.toDataURL('image/png');
					if (optimizedDataUrl.length > 5 * 1024 * 1024) {
						optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
					}
				} catch {
					optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
				}
				resolve(optimizedDataUrl);
			};
			img.onerror = reject;
			img.src = URL.createObjectURL(file);
		});
	};

	const fetchDemoImage = async (): Promise<File> => {
		const response = await fetch('/assets/demo.webp');
		if (!response.ok) throw new Error('Failed to fetch demo image');
		const blob = await response.blob();
		return new File([blob], 'demo.webp', { type: 'image/webp' });
	};

	const hexToRgb = (hex: string) => ({
		r: parseInt(hex.slice(1, 3), 16),
		g: parseInt(hex.slice(3, 5), 16),
		b: parseInt(hex.slice(5, 7), 16)
	});

	// ─── Local state ─────────────────────────────────────────────────────────────

	let fileInputRef = $state<HTMLInputElement | null>(null);
	let isDragOver = $state(false);
	let imageDimensions = $state<ImageDimensions | null>(null);
	let responsiveConfig = $state<ResponsiveConfig>(getResponsiveConfig());
	let showPasteHint = $state(false);

	// ─── Derived styles ──────────────────────────────────────────────────────────

	const canvasStyle = $derived.by((): string => {
		if (!mockupStore.fixedMargin || !imageDimensions || !mockupStore.uploadedImage) {
			return 'width:100%;height:100%';
		}
		const totalWidth = imageDimensions.width + mockupStore.margin.left + mockupStore.margin.right;
		const totalHeight = imageDimensions.height + mockupStore.margin.top + mockupStore.margin.bottom;
		return `width:${totalWidth}px;height:${totalHeight}px`;
	});

	const backgroundStyle = $derived.by((): string => {
		let bg = '';
		if (mockupStore.backgroundType === 'pattern' && mockupStore.backgroundImage) {
			bg = `background-image:url(${mockupStore.backgroundImage});background-size:cover;background-position:center;background-repeat:no-repeat;`;
		} else if (mockupStore.backgroundType === 'gradient') {
			const direction = mockupStore.gradientDirection.replace('to-', '');
			const degreeMap: Record<string, string> = {
				r: '90deg',
				br: '135deg',
				b: '180deg',
				bl: '225deg',
				l: '270deg',
				tl: '315deg',
				t: '0deg',
				tr: '45deg'
			};
			const angle = degreeMap[direction] ?? '135deg';
			bg = `background:linear-gradient(${angle},${mockupStore.gradientColors.join(',')});`;
		} else {
			bg = `background-color:${mockupStore.backgroundColor};`;
		}
		return bg + 'width:100%;height:100%';
	});

	const imageContainerStyle = $derived.by((): string => {
		if (!mockupStore.fixedMargin || !imageDimensions || !mockupStore.uploadedImage) {
			return 'display:flex;align-items:center;justify-content:center;width:100%;height:100%';
		}
		return [
			'position:absolute',
			`top:${mockupStore.margin.top}px`,
			`right:${mockupStore.margin.right}px`,
			`bottom:${mockupStore.margin.bottom}px`,
			`left:${mockupStore.margin.left}px`,
			'display:flex',
			'align-items:center',
			'justify-content:center'
		].join(';');
	});

	const imageStyle = $derived.by((): string => {
		const dims = imageDimensions ?? { width: 400, height: 300 };
		const transform = [
			`translate(${mockupStore.devicePosition.x}px,${mockupStore.devicePosition.y}px)`,
			`scale(${mockupStore.devicePosition.scale})`,
			`rotate(${mockupStore.devicePosition.rotation}deg)`,
			`rotateX(${mockupStore.rotation3D.rotateX}deg)`,
			`rotateY(${mockupStore.rotation3D.rotateY}deg)`,
			`rotateZ(${mockupStore.rotation3D.rotateZ}deg)`,
			`skew(${mockupStore.rotation3D.skew}deg)`
		].join(' ');

		let style = `width:${dims.width}px;height:${dims.height}px;transform:${transform};transform-origin:center center;transform-style:preserve-3d;`;

		if (mockupStore.imageBorder.enabled) {
			style += `border:${mockupStore.imageBorder.width}px solid ${mockupStore.imageBorder.color};border-radius:${mockupStore.imageBorder.radius}px;box-shadow:${mockupStore.imageBorder.shadow};`;
		}
		return style;
	});

	const dropZoneClasses = $derived(
		[
			'relative transition-all duration-300 cursor-pointer border-2 border-dashed rounded-xl bg-gray-900/50 mx-auto top-[15%] md:top-[25%]',
			'hover:bg-gray-900/70',
			isDragOver ? 'scale-105 border-primary' : 'border-gray-400'
		].join(' ')
	);

	const overlayTextSize = $derived(responsiveConfig.isMobile ? 'text-base' : 'text-xl');
	const iconSize = $derived(responsiveConfig.isMobile ? 32 : 48);

	// ─── Effects ─────────────────────────────────────────────────────────────────

	$effect(() => {
		const handleResize = () => {
			responsiveConfig = getResponsiveConfig();
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});

	$effect(() => {
		const handlePaste = async (e: ClipboardEvent) => {
			const items = e.clipboardData?.items;
			if (!items) return;
			for (const item of Array.from(items)) {
				if (item.type.startsWith('image/')) {
					const file = item.getAsFile();
					if (file) {
						if (mockupStore.uploadedImage) {
							showPasteHint = true;
							toast('Image in clipboard detected! Clear current image to paste new one.', {
								duration: 3000,
								action: {
									label: 'Clear & Paste',
									onClick: () => {
										mockupStore.setUploadedImage(null);
										localStorage.removeItem('demoImage');
										setTimeout(() => handleImageUpload(file), 100);
									}
								}
							});
							setTimeout(() => {
								showPasteHint = false;
							}, 3000);
						} else {
							await handleImageUpload(file);
							localStorage.removeItem('demoImage');
							toast('Image pasted successfully!');
						}
					}
					break;
				}
			}
		};
		document.addEventListener('paste', handlePaste);
		return () => document.removeEventListener('paste', handlePaste);
	});

	$effect(() => {
		if (!mockupStore.uploadedImage) {
			imageDimensions = null;
			return;
		}
		const img = new Image();
		img.onload = () => {
			const { maxContainerWidth, maxContainerHeight } = responsiveConfig;
			const scaleX = maxContainerWidth / img.width;
			const scaleY = maxContainerHeight / img.height;
			const scale = Math.min(scaleX, scaleY, 1);
			imageDimensions = {
				width: Math.round(img.width * scale),
				height: Math.round(img.height * scale)
			};
		};
		img.src = mockupStore.uploadedImage;
	});

	// ─── Handlers ────────────────────────────────────────────────────────────────

	const handleImageUpload = async (file: File) => {
		let loadingToast: string | number | undefined;
		if (file.size > 1024 * 1024) {
			loadingToast = toast('Processing image...', { duration: Infinity });
		}

		const applyBorder = (r: number, g: number, b: number) => {
			const borderWidth = responsiveConfig.isMobile ? 4 : 8;
			mockupStore.setImageBorder({
				enabled: true,
				width: borderWidth,
				color: `rgba(${r},${g},${b},0.5)`,
				shadow: 'rgba(0,0,0,0.16) 0px 3px 6px, rgba(0,0,0,0.23) 0px 3px 6px'
			});
		};

		const applyDefaultBorder = () => {
			const borderWidth = responsiveConfig.isMobile ? 4 : 8;
			mockupStore.setImageBorder({
				enabled: true,
				width: borderWidth,
				color: 'rgba(156,163,137,0.5)',
				shadow: 'rgba(0,0,0,0.16) 0px 3px 6px, rgba(0,0,0,0.23) 0px 3px 6px'
			});
		};

		try {
			const dataUrl = await optimizeImage(file);
			mockupStore.setUploadedImage(dataUrl);

			requestAnimationFrame(async () => {
				try {
					const dominant = await extractDominantColor(dataUrl);
					const validHex = /^#[0-9A-Fa-f]{6}$/.test(dominant) ? dominant : '#9CA389';
					const { r, g, b } = hexToRgb(validHex);
					applyBorder(r, g, b);
					toast('Image uploaded with transparent border!');
				} catch {
					applyDefaultBorder();
					toast('Image uploaded with default transparent border!');
				} finally {
					if (loadingToast !== undefined) toast.dismiss(loadingToast);
				}
			});
		} catch {
			// Fallback: plain FileReader
			const reader = new FileReader();
			reader.onload = async (e) => {
				const result = e.target?.result as string;
				mockupStore.setUploadedImage(result);
				try {
					const dominant = await extractDominantColor(result);
					const validHex = /^#[0-9A-Fa-f]{6}$/.test(dominant) ? dominant : '#9CA389';
					const { r, g, b } = hexToRgb(validHex);
					applyBorder(r, g, b);
					toast('Image uploaded with transparent border!');
				} catch {
					applyDefaultBorder();
					toast('Image uploaded with default transparent border!');
				}
			};
			reader.readAsDataURL(file);
			if (loadingToast !== undefined) toast.dismiss(loadingToast);
		}
	};

	const handleDrop = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		isDragOver = false;
		const imageFile = Array.from(e.dataTransfer?.files ?? []).find((f) =>
			f.type.startsWith('image/')
		);
		if (imageFile) {
			localStorage.removeItem('demoImage');
			handleImageUpload(imageFile);
		}
	};

	const handleDragOver = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		isDragOver = true;
	};

	const handleFileSelect = (e: Event) => {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (file) {
			localStorage.removeItem('demoImage');
			handleImageUpload(file);
		}
	};

	const handleDemoImage = async (e?: MouseEvent) => {
		e?.stopPropagation();
		try {
			const demoFile = await fetchDemoImage();
			await handleImageUpload(demoFile);
			localStorage.setItem('demoImage', '/assets/demo.webp');
			toast('Demo image applied successfully!');
		} catch (err) {
			toast.error('Failed to load demo image.');
			console.error(err);
		}
	};
</script>

<div
	class="relative flex flex-1 items-center justify-center transition-all duration-300"
	style={mockupStore.fixedMargin && imageDimensions && mockupStore.uploadedImage
		? 'background-color:black'
		: ''}
>
	<div
		class="relative overflow-hidden transition-all duration-300"
		style={canvasStyle}
		data-mockup-canvas
		ondrop={mockupStore.uploadedImage ? handleDrop : undefined}
		ondragover={mockupStore.uploadedImage ? handleDragOver : undefined}
	>
		<div class="relative transition-all duration-300" style={backgroundStyle}>
			{#if mockupStore.uploadedImage}
				<div style={imageContainerStyle}>
					<div class="relative">
						<img
							src={mockupStore.uploadedImage}
							alt="Uploaded mockup"
							class="will-transform relative size-full transition-all duration-300 select-none"
							style={imageStyle}
							crossorigin="anonymous"
							ondragover={(e) => e.stopPropagation()}
						/>

						{#if isDragOver}
							<div
								class="bg-primary/30 absolute inset-0 z-10 flex items-center justify-center rounded-xl"
							>
								<div
									class="text-primary rounded-lg bg-white/90 px-6 py-3 font-semibold {overlayTextSize}"
								>
									Drop to replace image
								</div>
							</div>
						{/if}

						{#if showPasteHint}
							<div
								class="absolute inset-0 z-20 flex animate-pulse items-center justify-center rounded-xl bg-blue-500/20"
							>
								<div
									class="rounded-lg bg-white/95 px-6 py-3 text-center font-semibold text-blue-600 shadow-lg"
								>
									<Clipboard class="mr-2 inline-block h-5 w-5" />
									Image ready to paste!
								</div>
							</div>
						{/if}
					</div>
				</div>
			{:else}
				<div
					class={dropZoneClasses}
					style="width:{responsiveConfig.dropZoneWidth};height:{responsiveConfig.dropZoneHeight}"
					ondrop={handleDrop}
					ondragover={handleDragOver}
					onclick={() => fileInputRef?.click()}
					role="button"
					tabindex="0"
					onkeydown={(e) => e.key === 'Enter' && fileInputRef?.click()}
				>
					<div class="absolute inset-0 flex flex-col items-center justify-center">
						<ImageIcon size={iconSize} class="mb-4 text-gray-100" />

						<div class="px-4 text-center text-white">
							<p class="mb-1 font-semibold {responsiveConfig.isMobile ? 'text-base' : 'text-lg'}">
								Drop image here or click to upload
							</p>
							<p class="mb-2 text-white/70 {responsiveConfig.isMobile ? 'text-xs' : 'text-sm'}">
								Supports JPG, PNG
							</p>
							<div class="flex items-center justify-center gap-2 font-semibold text-white">
								<Clipboard class="h-4 w-4" strokeWidth={2.5} />
								<span class="{responsiveConfig.isMobile ? 'text-xs' : 'text-sm'} text-white/70">
									Or paste image (Ctrl+V)
								</span>
							</div>
						</div>

						<button
							class="border-primary z-50 mt-6 rounded-full border-2 bg-gray-900/50 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-900"
							onclick={handleDemoImage}
						>
							Use Demo Image
						</button>
					</div>

					{#if isDragOver}
						<div class="bg-primary/20 absolute inset-0 flex items-center justify-center rounded-xl">
							<div
								class="text-primary rounded-lg bg-white/90 px-6 py-3 font-semibold {overlayTextSize}"
							>
								Drop image here
							</div>
						</div>
					{/if}
				</div>
			{/if}
		</div>

		<input
			bind:this={fileInputRef}
			type="file"
			accept="image/*"
			onchange={handleFileSelect}
			class="hidden"
		/>
	</div>
</div>
