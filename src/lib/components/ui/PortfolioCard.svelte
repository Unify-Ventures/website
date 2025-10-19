<script lang="ts">
	import { twMerge } from "tailwind-merge";
	import { inlineSvg } from "@svelte-put/inline-svg";
	import ArrowRight from "lucide-svelte/icons/arrow-right";
	import type { PortfolioCompaniesResponse } from "$lib/pb-types";
	import { getFileUrl } from "$lib/pocketbase";

	let {
		portfolio,
		portfolioIter = 0,
		href,
		onmouseenter,
		onmouseleave,
		class: className = "",
		...rest
	}: {
		portfolio: PortfolioCompaniesResponse;
		portfolioIter?: number;
		href?: string;
		onmouseenter?: (e: MouseEvent) => void;
		onmouseleave?: (e: MouseEvent) => void;
		class?: string;
		[key: string]: any;
	} = $props();

	const baseClasses =
		"w-40 md:w-64 aspect-square bg-muted portfolio relative group text-base-content overflow-hidden";

	const invertClass = portfolio.invert_foreground
		? "hover:[&:not(.no-hover)]:text-primary-content"
		: "";

	const managerLogoBaseClasses =
		"p-sm h-12 max-w-28 text-base-content bg-base-alt absolute bottom-0 right-0";
	const managerLogoClasses = href
		? twMerge(
				managerLogoBaseClasses,
				"translate-y-0 group-hover:translate-y-full transition-all duration-150",
			)
		: managerLogoBaseClasses;

	const merged = twMerge(baseClasses, invertClass, className);
</script>

<div
	class={merged}
	style:--accent={portfolio.accent}
	{onmouseenter}
	{onmouseleave}
	role="img"
	{...rest}
>
	<div
		role="img"
		class="flex justify-center items-center p-lg xl:p-lg transition-colors duration-150"
		id={`portfolio-${portfolio.id}-${portfolioIter}`}
	>
		<svg use:inlineSvg={getFileUrl(portfolio, portfolio.logo)} width="100%" />
	</div>
	{#if portfolio.expand?.funds?.[0]?.expand?.manager?.logo}
		<svg
			use:inlineSvg={getFileUrl(
				portfolio.expand.funds[0].expand.manager,
				portfolio.expand.funds[0].expand.manager.logo,
			)}
			class={managerLogoClasses}
		></svg>
	{/if}
	{#if href}
		<a
			{href}
			class="flex flex-row gap-sm bg-primary p-md text-primary-content absolute bottom-0 right-0 translate-y-full group-hover:translate-y-0 transition-all duration-150"
		>
			Learn More <ArrowRight />
		</a>
	{/if}
</div>

<style>
	.portfolio:hover:not(.no-hover) > div {
		background-color: var(--accent);
		transition: all 150ms ease;
	}
</style>
