<script lang="ts">
	import type { PortfolioCompaniesResponse } from '$lib/pb-types';
	import { getFileUrl } from '$lib/pocketbase';

	interface Props {
		/**
		 * The portfolio company to display in the dialog
		 */
		portfolio: PortfolioCompaniesResponse | null;
		/**
		 * Bind to the dialog element for programmatic control
		 */
		dialogElement?: HTMLDialogElement;
	}

	let { portfolio, dialogElement = $bindable() }: Props = $props();
</script>

<dialog
	bind:this={dialogElement}
	class="fixed m-auto max-w-md outline-none border-2"
	style="width: calc(100vw - var(--spacing) * 8);"
>
	{#if portfolio}
		<div class="flex flex-col">
			<div class="bg-zinc-100 p-4">
				{#if portfolio.logo.endsWith('.svg')}
					<img
						class="w-full h-full aspect-video"
						width="14rem"
						height="14rem"
						src={getFileUrl(portfolio, portfolio.logo)}
						aria-hidden
						alt={`${portfolio.name}'s Logo'`}
					/>
				{:else}
					<img
						class={'w-full h-full object-contain' +
							(portfolio.invert_foreground ? ' invert hue-rotate-180 contrast-75' : '')}
						src={getFileUrl(portfolio, portfolio.logo)}
						alt={`${portfolio.name}'s logo'`}
					/>
				{/if}
			</div>
			<div class="p-4">
				<h2 class="text-2xl font-bold">{portfolio.name}</h2>
				{@html portfolio.blurb || '<i>No blurb available</i>'}
				<a
					class="flex flex-row gap-2 p-2 bg-zinc-900 text-white justify-center mt-4"
					href={portfolio.homepage}>Visit homepage</a
				>
			</div>
		</div>
	{:else}
		<h2>No startup selected</h2>
	{/if}
</dialog>
