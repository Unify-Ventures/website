<script lang="ts">
	import { Select as BitsSelect } from "bits-ui";
	import { twMerge } from "tailwind-merge";
	import ChevronsUpDown from "lucide-svelte/icons/chevrons-up-down";
	import type { Snippet } from "svelte";

	let {
		options,
		value = $bindable(),
		onValueChange,
		label,
		class: className = "",
		triggerClass = "",
		contentClass = "",
		itemClass = "",
		children,
		...rest
	}: {
		options: Array<{ value: string; label: string }>;
		value?: string;
		onValueChange?: (value: string) => void;
		label?: string;
		class?: string;
		triggerClass?: string;
		contentClass?: string;
		itemClass?: string;
		children?: Snippet<[{ selected: boolean }]>;
		[key: string]: any;
	} = $props();

	const selectedLabel = $derived(
		options.find((o) => o.value === value)?.label ?? label ?? "Select...",
	);

	const baseTriggerClasses =
		"border-2 p-md border-border hover:bg-muted transition-all duration-200 cursor-pointer inline-flex gap-sm";
	const baseContentClasses =
		"border-2 border-border bg-base z-10 w-[var(--bits-select-anchor-width)] min-w-[var(--bits-select-anchor-width)]";
	const baseItemClasses =
		"p-md hover:bg-muted transition-all duration-200 cursor-pointer";

	const mergedTrigger = twMerge(baseTriggerClasses, triggerClass, className);
	const mergedContent = twMerge(baseContentClasses, contentClass);
	const mergedItem = twMerge(baseItemClasses, itemClass);
</script>

<BitsSelect.Root type="single" bind:value {onValueChange} {...rest}>
	<BitsSelect.Trigger class={mergedTrigger} aria-label={label}>
		{selectedLabel}
		<ChevronsUpDown class="ml-auto" />
	</BitsSelect.Trigger>
	<BitsSelect.Portal>
		<BitsSelect.Content sideOffset={-3} class={mergedContent}>
			<BitsSelect.ScrollUpButton
				class="flex w-full items-center justify-center py-1"
			>
				<ChevronsUpDown class="size-3" />
			</BitsSelect.ScrollUpButton>
			<BitsSelect.Viewport class="flex flex-col gap-sm p-sm">
				{#each options as option}
					<BitsSelect.Item
						value={option.value}
						label={option.label}
						class={mergedItem}
					>
						{#snippet children({ selected })}
							{#if children}
								{@render children({ selected })}
							{:else}
								{option.label}
							{/if}
						{/snippet}
					</BitsSelect.Item>
				{/each}
			</BitsSelect.Viewport>
			<BitsSelect.ScrollDownButton
				class="flex w-full items-center justify-center py-1"
			>
				<ChevronsUpDown class="size-3" />
			</BitsSelect.ScrollDownButton>
		</BitsSelect.Content>
	</BitsSelect.Portal>
</BitsSelect.Root>
