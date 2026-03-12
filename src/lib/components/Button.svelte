<script lang="ts">
	import { cn } from '$lib/utils';
	import { Button } from 'bits-ui';
	import type { ComponentProps } from 'svelte';

	type Props = ComponentProps<typeof Button.Root> & {
		label?: string;
		variant?: 'filled' | 'outlined';
		active?: boolean;
	};

	let {
		children,
		variant = 'filled',
		active = false,
		class: className = '',
		...restProps
	}: Props = $props();
</script>

<Button.Root
	class={cn([
		'inline-flex h-9 items-center justify-center gap-2 rounded-sm px-4 text-[15px] font-bold no-underline transition-colors',
		variant === 'filled' &&
			'disabled:ring-peach/50 bg-text text-bg hover:bg-accent hover:text-white data-[active=true]:bg-accent data-[active=true]:text-white',
		variant === 'outlined' &&
			'border border-accent bg-transparent text-text hover:bg-accent disabled:opacity-50 data-[active=true]:bg-accent',
		className
	])}
	data-active={active}
	{...restProps}
>
	{@render children?.()}
</Button.Root>
