<script lang="ts">
    import { page } from "$app/state";
    import { toCamelCase } from "$lib/case";
    import type { PortfolioCompaniesResponse } from "$lib/pb-types";
    import Link from "lucide-svelte/icons/link";
    import Check from "lucide-svelte/icons/check";
    import X from "lucide-svelte/icons/x";
    import type { EventHandler } from "svelte/elements";
    import DOMPurify from "isomorphic-dompurify";

    interface Props {
        /**
         * The portfolio company to display in the dialog
         */
        portfolio: PortfolioCompaniesResponse | null;
        /**
         * All of the portfolio logo URLs, pre-rendered offscreen, then made visible depending on the active selection
         */
        logos: { logoURL: string; portfolio: PortfolioCompaniesResponse }[];
        /**
         * Bind to the dialog element for programmatic control
         */
        dialogElement?: HTMLDialogElement;
        onclose: EventHandler<Event, HTMLDialogElement>;
    }

    let {
        portfolio,
        logos,
        dialogElement = $bindable(),
        onclose,
    }: Props = $props();

    let copiedFeedback = $state(false);
    let copiedErrored = $state(false);
</script>

<dialog
    bind:this={dialogElement}
    {onclose}
    class="fixed m-auto max-w-md border-2 outline-none"
    style="width: calc(100vw - var(--spacing) * 8);"
    closedby="any"
>
    <div class="relative flex flex-col">
        <button
            class="swap absolute top-5 left-2.5 h-0 w-min"
            class:swapped={copiedFeedback}
            onclick={() => {
                navigator.clipboard
                    .writeText(
                        page.url.origin +
                            "/portfolio#" +
                            toCamelCase(portfolio?.name ?? ""),
                    )
                    .then(() => (copiedErrored = false))
                    .catch(() => (copiedErrored = true));
                copiedFeedback = true;
                setTimeout(() => (copiedFeedback = false), 1000);
            }}
        >
            {#if !copiedErrored}
                <Check class="swap-on" />
            {:else}
                <X class="swap-on" />
            {/if}
            <Link class="swap-off" />
        </button>
        <div class="bg-zinc-100 p-4">
            {#each logos as logo (logo.portfolio.id)}
                {#if !logo.portfolio.logo}
                    <div
                        class="grid aspect-video h-full w-full place-content-center"
                        class:hidden={portfolio?.id !== logo.portfolio.id}
                    >
                        <span class="text-4xl font-bold"
                            >{logo.portfolio.name}</span
                        >
                    </div>
                {:else if logo.logoURL.endsWith(".svg")}
                    <img
                        class="aspect-video h-full w-full"
                        class:hidden={portfolio?.id !== logo.portfolio.id}
                        width="14rem"
                        height="14rem"
                        src={logo.logoURL}
                        aria-hidden="true"
                        alt="Portfolio logo"
                    />
                {:else}
                    <img
                        class={"h-full w-full object-contain" +
                            (logo.portfolio.invert_foreground
                                ? " contrast-75 hue-rotate-180 invert"
                                : "")}
                        class:hidden={portfolio?.id !== logo.portfolio.id}
                        src={logo.logoURL}
                        aria-hidden="true"
                        alt="Portfolio logo"
                    />
                {/if}
            {/each}
        </div>
        <div class="p-4">
            {#if portfolio}
                <h2 class="text-2xl font-bold">{portfolio.name}</h2>
                <!-- eslint-disable-next-line svelte/no-at-html-tags -- sanitized with DOMPurify -->
                {@html DOMPurify.sanitize(
                    portfolio.blurb || "<i>No blurb available</i>",
                )}
                <!-- eslint-disable svelte/no-navigation-without-resolve -- external URL -->
                <a
                    class="mt-4 flex flex-row justify-center gap-2 bg-zinc-900 p-2 text-white"
                    href={portfolio.homepage}
                    target="_blank"
                    rel="noopener noreferrer">Visit homepage</a
                >
                <!-- eslint-enable svelte/no-navigation-without-resolve -->
            {:else}
                <h2>No startup selected</h2>
            {/if}
        </div>
    </div>
</dialog>

<style>
    .swap {
        @apply relative inline-grid cursor-pointer place-content-center align-middle select-none;
    }

    .swap :global(.swap-on),
    .swap :global(.swap-off) {
        @apply col-start-1 row-start-1;
    }

    @media (prefers-reduced-motion: no-preference) {
        .swap :global(.swap-on),
        .swap :global(.swap-off) {
            transition:
                rotate 0.2s cubic-bezier(0, 0, 0.2, 1),
                opacity 0.2s cubic-bezier(0, 0, 0.2, 1);
        }
    }

    .swap :global(.swap-on) {
        @apply rotate-45 opacity-0;
    }

    .swap.swapped :global(.swap-on) {
        @apply rotate-0 opacity-100;
    }

    .swap.swapped :global(.swap-off) {
        @apply -rotate-45 opacity-0;
    }
</style>
