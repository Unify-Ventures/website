<script lang="ts">
	import { twMerge } from "tailwind-merge";
	import type { Snippet } from "svelte";

	let {
		value,
		name,
		id,
		disabled = false,
		checked = false,
		class: className = "",
		children,
		onchange,
		...rest
	}: {
		value: string;
		name: string;
		id: string;
		disabled?: boolean;
		checked?: boolean;
		class?: string;
		children?: Snippet;
		onchange?: (e: Event) => void;
		[key: string]: any;
	} = $props();

	const baseClasses =
		"appearance-none w-3 h-3 rounded-full border border-border focus:bg-primary checked:bg-primary disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed";

	const merged = twMerge(baseClasses, className);
</script>

<div class="flex flex-row gap-sm items-center p-1">
	<input
		type="radio"
		{name}
		{value}
		{id}
		{disabled}
		{checked}
		{onchange}
		class={merged}
		{...rest}
	/>
	{#if children}
		<label for={id} class="cursor-pointer">
			{@render children()}
		</label>
	{/if}
</div>

<style>
	input:disabled + label {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
