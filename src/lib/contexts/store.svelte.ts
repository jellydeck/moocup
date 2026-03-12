// lib/stores/mockup.svelte.ts
import deepHorizon from '$lib/assets/deep_horizon.webp';
const STORE_KEY = 'mockup-store';

// ── tiny IndexedDB helpers (no deps)
function openDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open('mockup-db', 1);
		req.onupgradeneeded = () => req.result.createObjectStore('kv');
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}

async function idbGet(key: string): Promise<string | null> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const req = db.transaction('kv').objectStore('kv').get(key);
		req.onsuccess = () => resolve(req.result ?? null);
		req.onerror = () => reject(req.error);
	});
}

async function idbSet(key: string, value: string): Promise<void> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const req = db.transaction('kv', 'readwrite').objectStore('kv').put(value, key);
		req.onsuccess = () => resolve();
		req.onerror = () => reject(req.error);
	});
}

// ── store ─────────────────────────────────────────────────────
class MockupStore {
	uploadedImage = $state<string | null>(null);
	backgroundColor = $state('#FF6B6B');
	backgroundType = $state<'solid'>('solid');
	backgroundImage = $state<string | null>(deepHorizon);
	aspectRatio = $state('16:9');
	fixedMargin = $state(false);
	devicePosition = $state({ x: 0, y: 0, scale: 1, rotation: 0 });
	rotation3D = $state({ rotateX: 0, rotateY: 0, rotateZ: 0, skew: 0 });
	imageBorder = $state({
		width: 8,
		color: '#FF6B6B',
		radius: 12,
		shadow: 'rgba(0,0,0,0.16) 0px 3px 6px, rgba(0,0,0,0.23) 0px 3px 6px',
		enabled: true
	});
	margin = $state({ top: 35, right: 35, bottom: 35, left: 35 });
	customBackgrounds = $state<{ name: string; image: string }[]>([]);
	hydrated = $state(false);

	// ── actions ──────────────────────────────────────────────
	setUploadedImage(v: string | null) {
		this.uploadedImage = v;
		this.#save();
	}
	setBackgroundColor(v: string) {
		this.backgroundColor = v;
		this.#save();
	}
	setBackgroundType(v: 'solid') {
		this.backgroundType = v;
		this.#save();
	}
	setBackgroundImage(v: string | null) {
		this.backgroundImage = v;
		this.#save();
	}
	setAspectRatio(v: string) {
		this.aspectRatio = v;
		this.#save();
	}
	setFixedMargin(v: boolean) {
		this.fixedMargin = v;
		this.#save();
	}
	setUnsplashImage(v: string | null) {
		this.uploadedImage = v;
		this.#save();
	}

	updateDevicePosition(v: Partial<typeof this.devicePosition>) {
		this.devicePosition = { ...this.devicePosition, ...v };
		this.#save();
	}

	set3DRotation(v: Partial<typeof this.rotation3D>) {
		this.rotation3D = { ...this.rotation3D, ...v };
		this.#save();
	}

	setImageBorder(v: Partial<typeof this.imageBorder>) {
		this.imageBorder = { ...this.imageBorder, ...v };
		this.#save();
	}

	setMargin(v: Partial<typeof this.margin>) {
		this.margin = { ...this.margin, ...v };
		this.#save();
	}

	addCustomBackground(bg: { name: string; image: string }) {
		this.customBackgrounds = [...this.customBackgrounds, bg];
		this.#save();
	}

	// ── persistence ──────────────────────────────────────────
	async #save() {
		try {
			await idbSet(
				STORE_KEY,
				JSON.stringify({
					uploadedImage: this.uploadedImage,
					backgroundColor: this.backgroundColor,
					backgroundType: this.backgroundType,
					backgroundImage: this.backgroundImage,
					aspectRatio: this.aspectRatio,
					fixedMargin: this.fixedMargin,
					devicePosition: this.devicePosition,
					rotation3D: this.rotation3D,
					imageBorder: this.imageBorder,
					margin: this.margin,
					customBackgrounds: this.customBackgrounds
				})
			);
		} catch (e) {
			console.error('MockupStore save error:', e);
		}
	}

	async hydrate() {
		try {
			const raw = await idbGet(STORE_KEY);
			if (!raw) return;

			const s = JSON.parse(raw);
			if (s.uploadedImage !== undefined) this.uploadedImage = s.uploadedImage;
			if (s.backgroundColor !== undefined) this.backgroundColor = s.backgroundColor;
			if (s.backgroundType !== undefined) this.backgroundType = s.backgroundType;
			if (s.backgroundImage !== undefined) this.backgroundImage = s.backgroundImage;
			if (s.aspectRatio !== undefined) this.aspectRatio = s.aspectRatio;
			if (s.fixedMargin !== undefined) this.fixedMargin = s.fixedMargin;
			if (s.devicePosition !== undefined)
				this.devicePosition = { ...this.devicePosition, ...s.devicePosition };
			if (s.rotation3D !== undefined) this.rotation3D = { ...this.rotation3D, ...s.rotation3D };
			if (s.imageBorder !== undefined) this.imageBorder = { ...this.imageBorder, ...s.imageBorder };
			if (s.margin !== undefined) this.margin = { ...this.margin, ...s.margin };
			if (s.customBackgrounds !== undefined) this.customBackgrounds = s.customBackgrounds;
		} catch (e) {
			console.error('MockupStore hydrate error:', e);
		} finally {
			this.hydrated = true;
		}
	}
}

export const mockupStore = new MockupStore();
