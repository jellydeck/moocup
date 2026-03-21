<script lang="ts">
	import { tv } from 'tailwind-variants';
	import { Button } from 'bits-ui';
	import type { ComponentProps } from 'svelte';
	import { cn } from '$lib/utils';

	const buttonVariants = tv({
		base: [
			'inline-flex h-9 items-center justify-center gap-2 rounded-sm',
			'px-4 text-[15px] font-bold no-underline transition-colors',
			'active:translate-y-px active:hover:inset-shadow-[0_3px_3px_0] active:inset-shadow-bg/80'
		],
		variants: {
			variant: {
				filled: [
					'bg-text text-bg backdrop-blur-md',
					'hover:bg-accent/60 hover:text-white',
					'disabled:bg-text/30',
					'data-[active=true]:translate-y-px data-[active=true]:bg-accent',
					'data-[active=true]:text-white data-[active=true]:inset-shadow-[0_2px_2px_0]',
					'data-[active=true]:inset-shadow-bg/80'
				],
				outlined: [
					'border-2 border-accent/50 bg-transparent text-text backdrop-blur-md',
					'hover:bg-accent/40',
					'disabled:opacity-50',
					'data-[active=true]:translate-y-px data-[active=true]:bg-accent',
					'data-[active=true]:inset-shadow-[0_3px_3px_0] data-[active=true]:inset-shadow-bg/80'
				]
			}
		},
		defaultVariants: {
			variant: 'filled'
		}
	});

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

<Button.Root class={cn(buttonVariants({ variant }), className)} data-active={active} {...restProps}>
	{@render children?.()}
</Button.Root>
