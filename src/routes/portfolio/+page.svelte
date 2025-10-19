<script lang="ts">
    import {
        Collections,
        PortfolioCompaniesStageOptions,
        type PortfolioCompaniesResponse,
    } from "$lib/pb-types";
    import { getFileUrl, getPortfolios, pb } from "$lib/pocketbase";
    import { createFilterStore } from "$lib/multi-filter.svelte";
    import { inlineSvg } from "@svelte-put/inline-svg";
    import ChevronDown from "lucide-svelte/icons/chevron-down";
    import { onMount } from "svelte";
    import { slide } from "svelte/transition";
    import { Radio, Button } from "$lib/components/ui";

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

    // Fix: Declare filterStore as reactive state
    let filterStore = $state<ReturnType<
        typeof createFilterStore<PortfolioFilter>
    > | null>(null);

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

        // Now this assignment will properly trigger reactivity
        filterStore = createFilterStore(filterablePortfolios, config);
    });

    function fundToLabel(fund: string) {
        return funds.find((f) => f.value === fund)?.label ?? "";
    }

    function stageToLabel(stage: string) {
        return stages.find((s) => s.value === stage)?.label ?? "";
    }
</script>

{#if filterStore}
    <div class="grid place-content-center">
        <h2 class="text-hero font-medium">Portfolio</h2>
        <div
            class="relative w-full max-w-7xl lg:m-8 my-md mx-auto flex flex-col xl:flex-row gap-md min-h-full"
        >
            <!-- Desktop filters -->
            <div class="sticky left-0 top-10 hidden lg:block">
                <div class="border-2 p-md border-border bg-base w-64">
                    <div class="flex flex-col">
                        <h3 class="font-bold text-subtitle">Stage</h3>
                        {#each stages as stage}
                            <Radio
                                name="stage"
                                value={stage.value}
                                id={`stage-${stage.value}`}
                                disabled={!filterStore
                                    .getAvailableOptions("stage")
                                    .includes(stage.value) &&
                                    stage.value !== "Any"}
                                onchange={() =>
                                    filterStore.select(
                                        "stage",
                                        stage.value,
                                    )}
                                checked={filterStore.dimensions.stage
                                    .selected === stage.value}
                            >
                                {#snippet children()}
                                    {stage.label}
                                    {portfolios
                                        .map((p) => p.stage)
                                        .includes(
                                            stage.value as PortfolioCompaniesStageOptions,
                                        )
                                        ? `(${portfolios.filter((p) => p.stage === stage.value).length})`
                                        : ""}
                                {/snippet}
                            </Radio>
                        {/each}

                        <h3 class="font-bold text-subtitle mt-md">Fund</h3>
                        {#each funds as fund}
                            <Radio
                                name="fund"
                                value={fund.value}
                                id={`fund-${fund.value}`}
                                disabled={!filterStore
                                    .getAvailableOptions("fund")
                                    .includes(fund.value) &&
                                    fund.value !== "Any"}
                                onchange={() =>
                                    filterStore.select("fund", fund.value)}
                                checked={filterStore.dimensions.fund
                                    .selected === fund.value}
                            >
                                {#snippet children()}
                                    {fund.label}
                                    {portfolios
                                        .map((p) => p.funds)
                                        .filter((f) => f.includes(fund.value))
                                        .length
                                        ? `(${portfolios.map((p) => p.funds).filter((f) => f.includes(fund.value)).length})`
                                        : ""}
                                {/snippet}
                            </Radio>
                        {/each}

                        <Button
                            variant="secondary"
                            onclick={filterStore.reset}
                            class="mt-lg"
                        >
                            Reset Filters
                        </Button>
                    </div>
                </div>
            </div>

            <!-- Mobile filters -->
            <div
                class="sticky left-0 top-0 lg:hidden w-full bg-base pt-md h-full mb-md"
            >
                <div class="border-2 p-md border-border bg-base w-full">
                    <div class="flex flex-col">
                        <button
                            class="font-bold text-subtitle text-left flex flex-row items-center gap-md"
                            onclick={() => {
                                expandStage = !expandStage;
                                expandFund = false;
                            }}
                        >
                            <span class="w-14">Stage</span>
                            <span class="font-normal text-body text-base-content-muted"
                                >{stageToLabel(
                                    filterStore.dimensions.stage.selected,
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
                                    <Radio
                                        name="stage"
                                        value={stage.value}
                                        id={`stage-mobile-${stage.value}`}
                                        disabled={!filterStore
                                            .getAvailableOptions("stage")
                                            .includes(stage.value) &&
                                            stage.value !== "Any"}
                                        onchange={() =>
                                            filterStore.select(
                                                "stage",
                                                stage.value,
                                            )}
                                        checked={filterStore.dimensions
                                            .stage.selected === stage.value}
                                    >
                                        {#snippet children()}
                                            {stage.label}
                                            {filterStore.filteredItems
                                                .map(
                                                    (p) =>
                                                        portfolioMap[p.id]
                                                            ?.stage,
                                                )
                                                .includes(
                                                    stage.value as PortfolioCompaniesStageOptions,
                                                )
                                                ? `(${filterStore.filteredItems.filter((p) => portfolioMap[p.id]?.stage === stage.value).length})`
                                                : ""}
                                        {/snippet}
                                    </Radio>
                                {/each}
                            </div>
                        {/if}

                        <button
                            class="font-bold text-subtitle mt-md text-left flex flex-row items-center gap-md"
                            onclick={() => {
                                expandFund = !expandFund;
                                expandStage = false;
                            }}
                            ><span class="w-14">Fund</span><span
                                class="font-normal text-body text-base-content-muted"
                                >{fundToLabel(
                                    filterStore.dimensions.fund.selected,
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
                                    <Radio
                                        name="fund"
                                        value={fund.value}
                                        id={`fund-mobile-${fund.value}`}
                                        disabled={!filterStore
                                            .getAvailableOptions("fund")
                                            .includes(fund.value) &&
                                            fund.value !== "Any"}
                                        onchange={() =>
                                            filterStore.select(
                                                "fund",
                                                fund.value,
                                            )}
                                        checked={filterStore.dimensions.fund
                                            .selected === fund.value}
                                    >
                                        {#snippet children()}
                                            {fund.label}
                                            {portfolios
                                                .map((p) => p.funds)
                                                .filter((f) =>
                                                    f.includes(fund.value),
                                                ).length
                                                ? `(${portfolios.map((p) => p.funds).filter((f) => f.includes(fund.value)).length})`
                                                : ""}
                                        {/snippet}
                                    </Radio>
                                {/each}
                            </div>
                        {/if}

                        {#if (expandStage || expandFund) && !(filterStore.dimensions.fund.selected === "Any" && filterStore.dimensions.stage.selected === "Any")}
                            <div transition:slide>
                                <Button
                                    variant="secondary"
                                    onclick={filterStore.reset}
                                    class="w-full mt-lg"
                                >
                                    Reset Filters
                                </Button>
                            </div>
                        {/if}
                    </div>
                </div>
            </div>

            <!-- Portfolio results -->
            <main
                class="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-md mb-8 h-max"
            >
                {#each portfolios as portfolio}
                    <a
                        href={portfolioMap[portfolio.id].homepage}
                        target="_blank"
                        class="bg-muted p-md group h-40 w-40"
                        class:hidden={!filterStore.filteredItems.some(
                            (r) => r.id === portfolio.id,
                        )}
                        aria-label="View {portfolio.name} portfolio"
                    >
                        <div class="p-1">
                            <svg
                                class="portfolio w-full h-full"
                                style:--accent={portfolioMap[portfolio.id]
                                    .accent}
                                width="14rem"
                                height="14rem"
                                use:inlineSvg={getFileUrl(
                                    portfolioMap[portfolio.id],
                                    portfolioMap[portfolio.id].logo,
                                )}
                            />
                        </div>
                    </a>
                {/each}
            </main>
        </div>
    </div>
{/if}

<style>
    .portfolio {
        color: var(--accent);
    }

    input:disabled + label {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
