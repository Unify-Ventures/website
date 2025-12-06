<script lang="ts">
    import { page } from "$app/state";
    import { toCamelCase } from "$lib/case";
    import type { PortfolioCompaniesResponse } from "$lib/pb-types";
    import { getFileUrl } from "$lib/pocketbase";
    import { Link } from "lucide-svelte";
    import type { EventHandler } from "svelte/elements";

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
    class="fixed m-auto max-w-md outline-none border-2"
    style="width: calc(100vw - var(--spacing) * 8);"
    closedby="any"
>
    <div class="flex flex-col relative">
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
            {#each logos as logo}
                {#if logo.logoURL.endsWith(".svg")}
                    <img
                        class="w-full h-full aspect-video"
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
                        class={"w-full h-full object-contain" +
                            (logo.portfolio.invert_foreground
                                ? " invert hue-rotate-180 contrast-75"
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
                {@html portfolio.blurb || "<i>No blurb available</i>"}
                <a
                    class="flex flex-row gap-2 p-2 bg-zinc-900 text-white justify-center mt-4"
                    href={portfolio.homepage}>Visit homepage</a
                >
            {:else}
                <h2>No startup selected</h2>
            {/if}
        </div>
    </div>
</dialog>
