<script lang="ts">
	import { Button } from 'bits-ui';
	import type { ComponentProps } from 'svelte';

	type Props = ComponentProps<typeof Button.Root> & {
		label?: string;
		variant?: 'filled' | 'outlined';
	};

	let {
		label,
		children,
		variant = 'filled',
		class: className = '',
		...restProps
	}: Props = $props();
</script>

<Button.Root
	class={[
		'inline-flex h-9 items-center justify-center gap-2 rounded-sm px-4 text-[15px] font-bold no-underline transition-colors',
		variant === 'filled' &&
			'disabled:ring-peach/50 bg-text text-bg hover:bg-accent hover:text-white',
		variant === 'outlined' &&
			'border border-accent bg-transparent text-text hover:bg-accent disabled:opacity-50',
		className
	]}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		{label}
	{/if}
</Button.Root>
