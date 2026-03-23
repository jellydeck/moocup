<script lang="ts">
	import { Slider } from 'bits-ui';
	import type { WithoutChildren } from 'bits-ui';
	import type { ComponentProps } from 'svelte';

	type Props = WithoutChildren<ComponentProps<typeof Slider.Root>>;

	let {
		value = $bindable(),
		ref = $bindable(null),
		class: className,
		...restProps
	}: Props = $props();
</script>

<Slider.Root
	type="single"
	bind:value
	bind:ref
	class="relative flex w-full touch-none items-center select-none {className ?? ''}"
	{...restProps as any}
>
	<span class="relative h-2 w-full grow overflow-hidden rounded-full bg-border">
		<Slider.Range class="absolute h-full bg-text" />
	</span>
	<Slider.Thumb
		index={0}
		class="focus-visible:ring-none size-5 rounded-full border bg-accent inset-shadow-[0_2px_4px_0] inset-shadow-bg/80 focus-visible:translate-y-1 focus-visible:shadow-[0_0_4px_4px] focus-visible:shadow-text/80 focus-visible:outline-transparent!"
	/>
</Slider.Root>
