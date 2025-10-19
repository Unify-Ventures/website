<script lang="ts">
	import { twMerge } from "tailwind-merge";
	import type { Snippet } from "svelte";

	let {
		variant = "primary",
		href,
		class: className = "",
		children,
		...rest
	}: {
		variant?: "primary" | "secondary" | "ghost";
		href?: string;
		class?: string;
		children?: Snippet;
		[key: string]: any;
	} = $props();

	const baseClasses =
		"flex items-center justify-center gap-sm p-md transition-all duration-200 cursor-pointer";

	const variantClasses = {
		primary: "bg-primary text-primary-content hover:bg-primary-hover",
		secondary:
			"border-2 border-border hover:bg-primary hover:text-primary-content",
		ghost: "hover:underline",
	};

	const merged = twMerge(baseClasses, variantClasses[variant], className);
</script>

{#if href}
	<a {href} class={merged} {...rest}>
		{@render children?.()}
	</a>
{:else}
	<button class={merged} {...rest}>
		{@render children?.()}
	</button>
{/if}
