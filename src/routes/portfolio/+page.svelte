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
    import ChevronDown from "lucide-svelte/icons/chevron-down";
    import { onMount } from "svelte";
    import { slide } from "svelte/transition";

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

    let expandStage = $state(false);
    let expandFund = $state(false);

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

        let fundsResp;

        // * Doesn't work when in pocketbase.ts
        if (process.env.NODE_ENV === "development") {
            fundsResp = await pb.collection(Collections.Funds).getFullList();
        } else {
            fundsResp = (await (await fetch("/pb/funds.json")).json()) as any[];
        }

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

    function fundToLabel(fund: string) {
        return funds.find((f) => f.value === fund)?.label ?? "";
    }

    function stageToLabel(stage: string) {
        return stages.find((s) => s.value === stage)?.label ?? "";
    }
</script>

<div class="grid place-content-center">
    <h2 class="text-7xl font-medium">Portfolio</h2>
    <div
        class="relative w-full max-w-7xl lg:m-8 my-4 mx-auto flex flex-col xl:flex-row gap-4 min-h-full"
    >
        <!-- Selection filters -->
        <div class="sticky left-0 top-10 hidden lg:block">
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
                    <button
                        class="flex flex-row gap-2 border-2 border-zinc-900 justify-center p-2 mt-6 hover:bg-zinc-900 hover:text-white transition-all duration-200"
                        onclick={filterStore.reset}>Reset Filters</button
                    >
                </div>
            </div>
        </div>

        <div class="sticky left-0 top-0 lg:hidden w-full bg-white pt-4 h-full">
            <div class="border-2 p-4 border-zinc-700 bg-white w-full">
                <div class="flex flex-col">
                    <button
                        class="font-bold text-xl text-left flex flex-row items-center gap-4"
                        onclick={() => {
                            expandStage = !expandStage;
                            expandFund = false;
                        }}
                    >
                        <span class="w-14">Stage</span>
                        <span class="font-normal text-sm text-zinc-700"
                            >{stageToLabel(
                                dimensions?.stage.selected ?? ""
                            )}</span
                        >
                        <ChevronDown
                            class="ml-auto transition-all duration-200 {expandStage
                                ? 'rotate-180'
                                : ''}"
                        /></button
                    >
                    {#if expandStage}
                        <div transition:slide>
                            {#each stages as stage}
                                <div
                                    class="flex flex-row gap-2 items-center p-1"
                                >
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
                                            filterStore.select(
                                                "stage",
                                                stage.value
                                            );
                                        }}
                                        checked={dimensions?.stage.selected ===
                                            stage.value}
                                    />
                                    <label
                                        for={`stage-${stage.value}`}
                                        class="cursor-pointer"
                                        >{stage.label}
                                        {results
                                            .map((p) => p.stage)
                                            .includes(
                                                stage.value as PortfolioCompaniesStageOptions
                                            )
                                            ? `(${results.filter((p) => p.stage === stage.value).length})`
                                            : ""}</label
                                    >
                                </div>
                            {/each}
                        </div>
                    {/if}
                    <button
                        class="font-bold text-xl mt-4 text-left flex flex-row items-center gap-4"
                        onclick={() => {
                            expandFund = !expandFund;
                            expandStage = false;
                        }}
                        ><span class="w-14">Fund</span><span
                            class="font-normal text-sm text-zinc-700"
                            >{fundToLabel(
                                dimensions?.fund.selected ?? ""
                            )}</span
                        ><ChevronDown
                            class="ml-auto transition-all duration-200 {expandFund
                                ? 'rotate-180'
                                : ''}"
                        /></button
                    >
                    {#if expandFund}
                        <div transition:slide>
                            {#each funds as fund}
                                <div
                                    class="flex flex-row gap-2 items-center p-1"
                                >
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
                                            filterStore.select(
                                                "fund",
                                                fund.value
                                            );
                                        }}
                                        checked={dimensions?.fund.selected ===
                                            fund.value}
                                    />
                                    <label for={`fund-${fund.value}`}
                                        >{fund.label}
                                        <!-- TODO: Use results instead of portfolios -->
                                        {portfolios
                                            .map((p) => p.funds)
                                            .filter((f) =>
                                                f.includes(fund.value)
                                            ).length
                                            ? `(${portfolios.map((p) => p.funds).filter((f) => f.includes(fund.value)).length})`
                                            : ""}
                                    </label>
                                </div>
                            {/each}
                        </div>
                    {/if}
                    {#if (expandStage || expandFund) && !(dimensions?.fund.selected === "Any" && dimensions?.stage.selected === "Any")}
                        <button
                            transition:slide
                            class="flex flex-row gap-2 border-2 border-zinc-900 justify-center p-2 mt-6 hover:bg-zinc-900 hover:text-white transition-all duration-200"
                            onclick={filterStore.reset}>Reset Filters</button
                        >
                    {/if}
                </div>
            </div>
        </div>

        <!-- Portfolio results -->
        <!-- HACK: Following mb-8 is a hack to fix overlap with footer -->
        <main
            class="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 mb-8"
        >
            {#each portfolios as result}
                {#if portfolios.find((p) => p.id === result.id)}
                    <a
                        href={portfolioMap[result.id].homepage}
                        target="_blank"
                        class="bg-zinc-100 p-4 group h-40 w-40"
                        class:hidden={!results.some((r) => r.id === result.id)}
                        aria-label="View {result.name} portfolio"
                    >
                        <div class="p-1">
                            <svg
                                class="portfolio w-full h-full"
                                style:--accent={portfolioMap[result.id].accent}
                                width="14rem"
                                height="14rem"
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
