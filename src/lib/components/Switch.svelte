<script lang="ts">
	import { Switch, Label, useId, type WithoutChildrenOrChild } from 'bits-ui';

	let {
		id = useId(),
		checked = $bindable(false),
		ref = $bindable(null),
		labelText,
		...restProps
	}: WithoutChildrenOrChild<Switch.RootProps> & {
		labelText: string;
	} = $props();
</script>

<Label.Root for={id} class="text-sm text-white">{labelText}</Label.Root>
<Switch.Root
	bind:checked
	bind:ref
	{id}
	{...restProps}
	class="inline-flex h-8 w-14 cursor-pointer items-center rounded-3xl border border-accent/80
		bg-transparent p-0.75 inset-shadow-[0_2px_4px_0] inset-shadow-bg/80 transition-colors
		duration-200 hover:bg-accent/70
		disabled:cursor-not-allowed disabled:opacity-40
		data-[state=checked]:bg-accent/70"
>
	<Switch.Thumb
		class="pointer-events-none block size-6 shrink-0 rounded-full bg-text transition-transform duration-200
			data-[state=checked]:translate-x-6
			data-[state=unchecked]:translate-x-0"
	/>
</Switch.Root>
