<script lang="ts">
	import { Button } from 'bits-ui';
	import type { ComponentProps } from 'svelte';

	type Props = ComponentProps<typeof Button.Root> & {
		label?: string;
	};

	let { label, children, class: className = '', ...restProps }: Props = $props();
</script>

<Button.Root
	class="disabled:ring-peach/50 inline-flex h-9
	items-center justify-center gap-2 rounded-sm
    bg-pine px-4 text-[15px] font-bold text-white
	[--casl:1]  hover:text-pine-text
	{className}"
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		{label}
	{/if}
</Button.Root>
