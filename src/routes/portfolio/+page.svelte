<script lang="ts">
    import {
        Collections,
        PortfolioCompaniesStageOptions,
        type PortfolioCompaniesResponse,
    } from "$lib/pb-types";
    import { getFileUrl, getPortfolios, pb } from "$lib/pocketbase";
    import { inlineSvg } from "@svelte-put/inline-svg";
    import {
        createFilterStore,
        type FilterDimension,
        type FilterStore,
    } from "@zshzebra/svelte-multi-filter";
    import { onMount } from "svelte";

    const stages = [
        { value: "Any", label: "Any" },
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
    let filterablePortfolios = $state<PortfolioFilter[]>([]);

    interface PortfolioFilter {
        id: string;
        stage:
            | "product_launch"
            | "market_validation"
            | "scaling"
            | "revenue_momentum"
            | "liquidity_event";
        fund:
            | "0jz3m1u87fm8c5j"
            | "l7bnwnwwzs3yr4n"
            | "4f6b55zzbes47nj"
            | "h8c2tlfs7gt29nv";
    }

    const config = {
        stage: [
            "product_launch",
            "market_validation",
            "scaling",
            "revenue_momentum",
            "liquidity_event",
        ],
        fund: [
            "0jz3m1u87fm8c5j",
            "l7bnwnwwzs3yr4n",
            "4f6b55zzbes47nj",
            "h8c2tlfs7gt29nv",
        ],
    } satisfies Record<string, any>;

    let portfolioMap = $state<Record<string, PortfolioCompaniesResponse>>({});

    let filterStore: FilterStore<Record<string, any>>;

    let dimensions = $state<{
        stage: FilterDimension<string>;
        fund: FilterDimension<string>;
    }>();
    let results = $state<PortfolioCompaniesResponse[]>([]);
    let availableStageOptions = $state<String[]>([]);
    let availableFundOptions = $state<String[]>([]);

    onMount(async () => {
        portfolios = await getPortfolios();

        filterablePortfolios = portfolios.map((p) => ({
            id: p.id,
            stage: p.stage,
            fund: p.funds[0],
        }));

        portfolios.forEach((p) => {
            portfolioMap[p.id] = p;
        });

        let fundsResp = await pb.collection(Collections.Funds).getFullList();

        funds = [
            { value: "Any", label: "Any" },
            ...fundsResp.map((fund) => ({
                value: fund.id,
                label: fund.name,
            })),
        ];

        filterStore = createFilterStore(filterablePortfolios, config);

        filterStore.subscribe((dims) => {
            dimensions = dims;
        });

        filterStore.filteredItems.subscribe((items) => {
            results = items;
        });

        filterStore.getAvailableOptions("stage").subscribe((options) => {
            availableStageOptions = options;
        });

        filterStore.getAvailableOptions("fund").subscribe((options) => {
            availableFundOptions = options;
        });
    });
</script>

<div class="grid place-content-center">
    <h2 class="text-7xl font-medium">Portfolio</h2>
    <div class="relative w-full max-w-7xl lg:m-8 m-4 flex gap-4">
        <!-- Selection filters -->
        <div class="w-0 h-0 sticky left-0 top-10">
            <div class="border-2 p-4 border-zinc-700 bg-white w-64">
                <div class="flex flex-col">
                    <h3 class="font-bold text-xl">Stage</h3>
                    {#each stages as stage}
                        <div class="flex flex-row gap-2 items-center p-1">
                            <input
                                type="radio"
                                name="stage"
                                value={stage.value}
                                class="appearance-none w-3 h-3 rounded-full border border-zinc-900 focus:bg-zinc-900 checked:bg-zinc-900 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                id={`stage-${stage.value}`}
                                disabled={!availableStageOptions.includes(
                                    stage.value
                                ) && stage.value !== "Any"}
                                onchange={() => {
                                    filterStore.select("stage", stage.value);
                                }}
                                checked={dimensions?.stage.selected ===
                                    stage.value}
                            />
                            <label
                                for={`stage-${stage.value}`}
                                class="cursor-pointer"
                                >{stage.label}
                                {portfolios
                                    .map((p) => p.stage)
                                    .includes(
                                        stage.value as PortfolioCompaniesStageOptions
                                    )
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
                                disabled={!availableFundOptions.includes(
                                    fund.value
                                ) && fund.value !== "Any"}
                                onchange={() => {
                                    filterStore.select("fund", fund.value);
                                }}
                                checked={dimensions?.fund.selected ===
                                    fund.value}
                            />
                            <label for={`fund-${fund.value}`}
                                >{fund.label}
                                {portfolios
                                    .map((p) => p.funds)
                                    .filter((f) => f.includes(fund.value))
                                    .length
                                    ? `(${portfolios.map((p) => p.funds).filter((f) => f.includes(fund.value)).length})`
                                    : ""}
                            </label>
                        </div>
                    {/each}
                </div>
            </div>
        </div>

        <!-- Portfolio results -->
        <main
            class="lg:ml-64 grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4 gap-4"
        >
            {#each portfolios as result}
                {#if portfolios.find((p) => p.id === result.id)}
                    <a
                        href={portfolioMap[result.id].homepage}
                        target="_blank"
                        class="border-2 border-zinc-900 bg-white p-4 group"
                        class:hidden={!results.some((r) => r.id === result.id)}
                        aria-label="View {result.name} portfolio"
                    >
                        <div class="">
                            <svg
                                class="portfolio w-full h-full"
                                style:--accent={portfolioMap[result.id].accent}
                                width="16rem"
                                height="16rem"
                                use:inlineSvg={getFileUrl(
                                    portfolioMap[result.id],
                                    portfolioMap[result.id].logo
                                )}
                            />
                        </div>
                    </a>
                {/if}
            {/each}
        </main>
    </div>
</div>

<style>
    .portfolio {
        color: var(--accent);
    }

    input:disabled + label {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
