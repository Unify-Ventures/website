<script lang="ts">
    import {
        Collections,
        PortfolioCompaniesStageOptions,
        type PortfolioCompaniesResponse,
    } from "$lib/pb-types";
    import { getFileUrl, pb } from "$lib/pocketbase";
    import { inlineSvg } from "@svelte-put/inline-svg";
    import type { FilterConfig } from "@zshzebra/svelte-multi-filter";
    import { onMount } from "svelte";

    const stages = [
        ...Object.keys(PortfolioCompaniesStageOptions).map((stage) => {
            return {
                value: stage,
                label: toTitleCase(stage.replace(/_/g, " ")),
            };
        }),
    ];

    let funds = $state([{ value: "any", label: "Any" }]);

    function toTitleCase(str: string) {
        return str.replace(/\w\S*/g, (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }

    let portfolios = $state<PortfolioCompaniesResponse[]>([]);

    interface ProductFilter {
        stage: 	'product_launch' | 'market_validation' | 'scaling' | 'revenue_momentum' | 'liquidity_event',
    }

    const config = {
        stage: ['product_launch', 'market_validation', 'scaling', 'revenue_momentum', 'liquidity_event'],
    } satisfies FilterConfig<ProductFilter>;

    onMount(async () => {
        portfolios = await pb
            .collection(Collections.PortfolioCompanies)
            .getFullList();

        let fundsResp = await pb.collection(Collections.Funds).getFullList();

        funds = [
            { value: "any", label: "Any" },
            ...fundsResp.map((fund) => ({
                value: fund.id,
                label: fund.name,
            })),
        ];
    });
</script>

<div class="grid place-content-center">
    <h2 class="text-7xl font-medium">Portfolio</h2>
    <div class="relative w-full max-w-7xl lg:m-8 m-4">
        <div class="w-0 h-0 sticky -left-0 top-10">
            <div class="border-2 p-4 border-zinc-700 bg-white w-64">
                <div class="flex flex-col">
                    <h3 class="font-bold text-xl">Stage</h3>
                    {#each stages as stage}
                        <div class="flex flex-row gap-2 items-center p-1" s>
                            <input
                                type="radio"
                                name="stage"
                                value={stage.value}
                                class="appearance-none w-3 h-3 rounded-full border border-zinc-900 focus:bg-zinc-900 checked:bg-zinc-900 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                id={`stage-${stage.value}`}
                            />
                            <label for={`stage-${stage.value}`} class="cursor-pointer"
                                >{stage.label}
                                {portfolios
                                    .map((p) => p.stage)
                                    .includes(stage.value as PortfolioCompaniesStageOptions)
                                    ? `(${portfolios.filter((p) => p.stage === stage.value).length})`
                                    : ""}</label
                            >
                        </div>
                    {/each}
                    <h3 class="font-bold text-xl mt-4">Fund</h3>
                    {#each funds as fund}
                        <div class="flex flex-row gap-2 items-center p-1">
                            <input
                                type="radio"
                                name="fund"
                                value={fund.value}
                                class="appearance-none w-3 h-3 rounded-full border border-zinc-900 focus:bg-zinc-900 checked:bg-zinc-900 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                id={`fund-${fund.value}`}
                            />
                            <label for={`fund-${fund.value}`}
                                >{fund.label}
                                {portfolios
                                    .map((p) => p.funds)
                                    .filter((f) => f.includes(fund.value))
                                    .length ? `(${portfolios.map((p) => p.funds).filter((f) => f.includes(fund.value)).length})` : ""}
                                </label>
                        </div>
                    {/each}
                </div>
            </div>
        </div>

        <main class="lg:ml-64">
            {#each Object.entries(groupedPortfolios) as [stage, portfolios]}
                <div>
                    {#if filter.stage === "any"}
                        <h3 class="text-3xl font-bold mb-4 text-center">
                            {stages.find((s) => s.value === stage)?.label}
                        </h3>
                    {/if}
                    <div
                        class="grid xl:grid-cols-3 sm:grid-cols-2 gap-12 max-w-6xl"
                    >
                        {#each portfolios as portfolio}
                            <div class="flex flex-col mx-auto max-w-64 gap-2">
                                <div
                                    class="portfolio grid place-content-center border-2 border-zinc-900 aspect-square w-64 h-64"
                                    style:--accent={portfolio.accent}
                                >
                                    <svg
                                        width="12rem"
                                        height="12rem"
                                        use:inlineSvg={getFileUrl(
                                            portfolio,
                                            portfolio.logo
                                        )}
                                    />
                                </div>

                                <div class="prose-sm">
                                    {@html portfolio.blurb}
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            {/each}
        </main>
    </div>
</div>

<style>
    .portfolio {
        color: var(--accent);
    }

    input:disabled+label {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
