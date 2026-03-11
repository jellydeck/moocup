import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const extractDominantColor = (imageUrl: string): Promise<string> => {
	return new Promise((resolve) => {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		const img = new Image();

		img.crossOrigin = 'anonymous';
		img.onload = () => {
			canvas.width = img.width;
			canvas.height = img.height;
			ctx?.drawImage(img, 0, 0);

			const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
			if (!imageData) {
				resolve('#9CA389'); // fallback color
				return;
			}

			const colorMap = new Map<string, number>();
			const data = imageData.data;

			// Sample every 10th pixel for performance
			for (let i = 0; i < data.length; i += 40) {
				const r = data[i];
				const g = data[i + 1];
				const b = data[i + 2];
				const alpha = data[i + 3];

				// Skip transparent pixels
				if (alpha < 128) continue;

				// Convert to hex
				const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;

				colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
			}

			// Find the most frequent color
			let dominantColor = '#9CA389';
			let maxCount = 0;

			for (const [color, count] of colorMap.entries()) {
				if (count > maxCount) {
					maxCount = count;
					dominantColor = color;
				}
			}

			resolve(dominantColor);
		};

		img.onerror = () => {
			resolve('#9CA389'); // fallback color
		};

		img.src = imageUrl;
	});
};
