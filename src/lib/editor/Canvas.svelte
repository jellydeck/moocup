<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { mockupStore } from '$lib/contexts/store.svelte';
	import Button from '$lib/components/Button.svelte';
	import { extractDominantColor } from '$lib/utils';

	import ImageIcon from 'phosphor-svelte/lib/ImageIcon';
	import ClipboardIcon from 'phosphor-svelte/lib/ClipboardIcon';
	import demoImage from '$lib/assets/demo.webp';

	let fileInputRef = $state<HTMLInputElement | null>(null);
	let isDragOver = $state(false);
	let showPasteHint = $state(false);

	/* ---------------- viewport ---------------- */

	let viewport = $state({
		width: 0,
		height: 0
	});

	/* ---------------- image natural size ---------------- */

	let naturalSize = $state<{ w: number; h: number } | null>(null);

	$effect(() => {
		const src = mockupStore.uploadedImage;
		if (!src) {
			naturalSize = null;
			return;
		}

		const img = new Image();
		img.onload = () => {
			naturalSize = {
				w: img.naturalWidth,
				h: img.naturalHeight
			};
		};
		img.src = src;
	});

	/* ---------------- layout (ALL responsive logic) ---------------- */

	const layout = $derived.by(() => {
		if (!naturalSize) {
			return {
				width: 400,
				height: 300,
				canvasWidth: '100%',
				canvasHeight: '100%'
			};
		}

		const vw = viewport.width;
		const vh = viewport.height;

		const isMobile = vw < 768;
		const isTablet = vw >= 768 && vw < 1024;

		const basePadding = isMobile ? 40 : isTablet ? 100 : 200;
		const scaleMultiplier = isMobile ? 0.95 : isTablet ? 0.85 : 0.8;

		const maxWidth = isMobile ? 1000 : isTablet ? 1100 : 1200;
		const maxHeight = isMobile ? 700 : isTablet ? 750 : 800;

		const availableWidth = vw - basePadding;
		const availableHeight = vh - basePadding;

		const containerMaxW = Math.min(availableWidth * scaleMultiplier, maxWidth);
		const containerMaxH = Math.min(availableHeight * scaleMultiplier, maxHeight);

		const scale = Math.min(containerMaxW / naturalSize.w, containerMaxH / naturalSize.h, 1);

		const width = Math.round(naturalSize.w * scale);
		const height = Math.round(naturalSize.h * scale);

		let canvasWidth: string | number = '100%';
		let canvasHeight: string | number = '100%';

		if (mockupStore.fixedMargin && mockupStore.uploadedImage) {
			canvasWidth = width + mockupStore.margin.left + mockupStore.margin.right + 'px';

			canvasHeight = height + mockupStore.margin.top + mockupStore.margin.bottom + 'px';
		}

		return {
			width,
			height,
			canvasWidth,
			canvasHeight
		};
	});

	/* ---------------- styles ---------------- */

	const backgroundStyle = $derived.by(() => {
		const s = mockupStore;

		if (s.backgroundImage) {
			return `
    				background-image:url(${s.backgroundImage});
    				background-size:cover;
    				background-position:center;
    				background-repeat:no-repeat;
    				width:100%;
    				height:100%;
    			`;
		}
	});

	const imageContainerStyle = $derived.by(() => {
		if (mockupStore.fixedMargin && mockupStore.uploadedImage) {
			return `
    				position:absolute;
    				top:${mockupStore.margin.top}px;
    				right:${mockupStore.margin.right}px;
    				bottom:${mockupStore.margin.bottom}px;
    				left:${mockupStore.margin.left}px;
    				display:flex;
    				align-items:center;
    				justify-content:center;
    			`;
		}

		return `
    			display:flex;
    			align-items:center;
    			justify-content:center;
    			width:100%;
    			height:100%;
    		`;
	});

	const imageStyle = $derived.by(() => {
		const { x, y, scale, rotation } = mockupStore.devicePosition;
		const { rotateX, rotateY, rotateZ, skew } = mockupStore.rotation3D;

		const transform = `
    			translate(${x}px,${y}px)
    			scale(${scale})
    			rotate(${rotation}deg)
    			rotateX(${rotateX}deg)
    			rotateY(${rotateY}deg)
    			rotateZ(${rotateZ}deg)
    			skew(${skew}deg)
    		`;

		let style = `
    			width:${layout.width}px;
    			height:${layout.height}px;
    			transform:${transform};
    			transform-origin:center center;
    			transform-style:preserve-3d;
    		`;

		const b = mockupStore.imageBorder;

		if (b.enabled) {
			style += `
    				border:${b.width}px solid ${b.color};
    				border-radius:${b.radius}px;
    				box-shadow:${b.shadow};
    			`;
		}

		return style;
	});

	/* ---------------- clipboard paste ---------------- */

	$effect(() => {
		const onPaste = async (e: ClipboardEvent) => {
			const file = Array.from(e.clipboardData?.items ?? [])
				.find((i) => i.type.startsWith('image/'))
				?.getAsFile();

			if (!file) return;

			if (mockupStore.uploadedImage) {
				showPasteHint = true;

				toast('Image in clipboard detected!', {
					duration: 3000,
					action: {
						label: 'Clear & Paste',
						onClick: () => {
							mockupStore.setUploadedImage(null);
							localStorage.removeItem('demoImage');
							setTimeout(() => uploadFile(file), 100);
						}
					}
				});

				setTimeout(() => (showPasteHint = false), 3000);
			} else {
				await uploadFile(file);
				localStorage.removeItem('demoImage');
				toast('Image pasted successfully!');
			}
		};

		document.addEventListener('paste', onPaste);
		return () => document.removeEventListener('paste', onPaste);
	});

	/* ---------------- upload helpers ---------------- */

	const hexToRgb = (hex: string) => ({
		r: parseInt(hex.slice(1, 3), 16),
		g: parseInt(hex.slice(3, 5), 16),
		b: parseInt(hex.slice(5, 7), 16)
	});

	const applyBorder = (hex?: string) => {
		const color = hex
			? (() => {
					const { r, g, b } = hexToRgb(hex);
					return `rgba(${r},${g},${b},0.5)`;
				})()
			: 'rgba(156,163,137,0.5)';

		mockupStore.setImageBorder({
			enabled: true,
			width: 8,
			color,
			shadow: 'rgba(0,0,0,0.16) 0px 3px 6px, rgba(0,0,0,0.23) 0px 3px 6px'
		});
	};

	const toDataUrl = (file: File): Promise<string> =>
		new Promise((resolve, reject) => {
			if (file.size < 2 * 1024 * 1024) {
				const r = new FileReader();
				r.onload = (e) => resolve(e.target!.result as string);
				r.onerror = reject;
				r.readAsDataURL(file);
				return;
			}

			const img = new Image();

			img.onload = () => {
				const canvas = document.createElement('canvas');

				const ratio = Math.min(2400 / img.width, 1800 / img.height, 1);

				canvas.width = Math.round(img.width * ratio);
				canvas.height = Math.round(img.height * ratio);

				canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);

				resolve(canvas.toDataURL('image/png'));
			};

			img.onerror = reject;

			img.src = URL.createObjectURL(file);
		});

	const uploadFile = async (file: File) => {
		const loadingToast =
			file.size > 1024 * 1024 ? toast('Processing image...', { duration: Infinity }) : undefined;

		const dataUrl = await toDataUrl(file);

		mockupStore.setUploadedImage(dataUrl);

		if (loadingToast) toast.dismiss(loadingToast);

		try {
			const dominant = await extractDominantColor(dataUrl);

			applyBorder(/^#[0-9A-Fa-f]{6}$/.test(dominant) ? dominant : undefined);
		} catch {
			applyBorder();
		}

		toast('Image uploaded!');
	};

	const onDrop = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();

		isDragOver = false;

		const file = Array.from(e.dataTransfer?.files ?? []).find((f) => f.type.startsWith('image/'));

		if (file) {
			localStorage.removeItem('demoImage');
			uploadFile(file);
		}
	};

	const onFileSelect = (e: Event) => {
		const file = (e.target as HTMLInputElement).files?.[0];

		if (file) {
			localStorage.removeItem('demoImage');
			uploadFile(file);
		}
	};

	const onDemoImage = async (e: MouseEvent) => {
		e.stopPropagation();

		try {
			const blob = await fetch(demoImage).then((r) => r.blob());

			await uploadFile(new File([blob], 'demo.webp', { type: 'image/webp' }));

			localStorage.setItem('demoImage', demoImage);
		} catch {
			toast.error('Failed to load demo image.');
		}
	};
</script>

<svelte:window bind:innerWidth={viewport.width} bind:innerHeight={viewport.height} />

<div
	class="relative flex flex-1 items-center justify-center"
	style={mockupStore.fixedMargin && mockupStore.uploadedImage ? 'background:black' : ''}
>
	<div
		class="overflow-hidde relative transition-all duration-300"
		role="region"
		style={`width:${layout.canvasWidth};height:${layout.canvasHeight}`}
		data-mockup-canvas
		ondrop={mockupStore.uploadedImage ? onDrop : undefined}
		ondragover={mockupStore.uploadedImage
			? (e) => {
					e.preventDefault();
					isDragOver = true;
				}
			: undefined}
		ondragleave={mockupStore.uploadedImage ? () => (isDragOver = false) : undefined}
	>
		<div class="relative size-full" style={backgroundStyle}>
			{#if mockupStore.uploadedImage}
				<div style={imageContainerStyle}>
					<div class="relative">
						<img
							src={mockupStore.uploadedImage}
							alt="Uploaded mockup"
							class="transition-all duration-300 select-none"
							style={imageStyle}
							crossorigin="anonymous"
						/>

						{#if isDragOver}
							<div
								class="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-accent/30"
							>
								<span class="rounded-lg bg-white/90 px-6 py-3 font-semibold text-accent">
									Drop to replace
								</span>
							</div>
						{/if}

						{#if showPasteHint}
							<div
								class="absolute inset-0 z-20 flex animate-pulse items-center justify-center rounded-xl bg-blue-500/20"
							>
								<div
									class="rounded-lg bg-white/95 px-6 py-3 text-center font-semibold text-blue-600 shadow-lg"
								>
									<ClipboardIcon class="mr-2 inline-block h-5 w-5" />
									Image ready to paste!
								</div>
							</div>
						{/if}
					</div>
				</div>
			{:else}
				<div
					role="button"
					tabindex="0"
					class="absolute top-1/4 left-1/2 flex h-[50%] w-[60%] -translate-x-1/2 flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-accent bg-black/40 max-md:h-[60%] max-md:w-[90%]"
					ondrop={onDrop}
					ondragover={(e) => {
						e.preventDefault();
						isDragOver = true;
					}}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							fileInputRef?.click();
						}
					}}
					ondragleave={() => (isDragOver = false)}
					onclick={() => fileInputRef?.click()}
				>
					<ImageIcon size={48} class="text-white/60" weight="duotone" />

					<div class="text-center text-white">
						<p class="font-semibold">Drop image here or click to upload</p>
						<p class="mt-1 text-sm text-white/60">Supports JPG, PNG</p>

						<div class="mt-2 flex items-center justify-center gap-2 text-sm text-white/50">
							<ClipboardIcon class="h-4 w-4" weight="bold" />
							<span>Or paste (Ctrl+V)</span>
						</div>
					</div>

					<Button variant="filled" class="rounded-full!" onclick={onDemoImage}>
						Use demo Image</Button
					>
				</div>
			{/if}
		</div>

		<input
			bind:this={fileInputRef}
			type="file"
			accept="image/*"
			onchange={onFileSelect}
			class="hidden"
		/>
	</div>
</div>
