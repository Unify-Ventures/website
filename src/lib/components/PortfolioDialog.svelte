<script lang="ts">
    import { page } from "$app/state";
    import { toCamelCase } from "$lib/case";
    import type { PortfolioCompaniesResponse } from "$lib/pb-types";
    import { Link } from "lucide-svelte";
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
            class="absolute top-2.5 left-2.5"
            onclick={() => {
                navigator.clipboard.writeText(
                    page.url.host +
                        "/portfolio/#" +
                        toCamelCase(portfolio?.name ?? ""),
                );
                // TODO: #16 Add visual feedback
            }}
        >
            <Link />
        </button>
        <div class="bg-zinc-100 p-4">
            {#each logos as logo (logo.portfolio.id)}
                {#if logo.logoURL.endsWith(".svg")}
                    <img
                        class="aspect-video h-full w-full"
                        class:hidden={!(
                            portfolio?.logo === logo.portfolio.logo
                        )}
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
                        class:hidden={!(
                            portfolio?.logo === logo.portfolio.logo
                        )}
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
