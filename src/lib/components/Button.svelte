<script lang="ts">
	import { Button } from 'bits-ui';
	import type { ComponentProps } from 'svelte';

	type Props = ComponentProps<typeof Button.Root> & {
		label?: string;
	};

	let { label, children, class: className = '', ...restProps }: Props = $props();
</script>

<Button.Root
	class="inline-flex h-9 items-center justify-center gap-2 rounded-lg border
	border-peach bg-accent/10 px-4 text-[15px]
	font-bold text-peach
	shadow-[0_4px_0_0_var(--peach)] transition-[font-variation-settings] duration-300
	[--casl:1]
    active:translate-y-1 active:shadow-none active:inset-shadow-[0_3px_2px_var(--peach)] active:inset-shadow-peach/60 {className}"
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		{label}
	{/if}
</Button.Root>
