<script lang="ts">
    import {
        Collections,
        PortfolioCompaniesStageOptions,
        type FundsResponse,
        type PortfolioCompaniesResponse,
    } from "$lib/pb-types";
    import { getFileUrl, getPortfolios, pb } from "$lib/pocketbase";
    import { adjustLightColor } from "$lib/color-utils";
    import { createFilterStore } from "$lib/multi-filter.svelte";
    import { inlineSvg } from "@svelte-put/inline-svg";
    import ChevronDown from "lucide-svelte/icons/chevron-down";
    import { onMount } from "svelte";
    import { slide } from "svelte/transition";
    import PortfolioDialog from "$lib/components/PortfolioDialog.svelte";

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

    let dialogStartup = $state<PortfolioCompaniesResponse | null>();
    let startupModal = $state<HTMLDialogElement | null>();

    interface PortfolioFilter {
        id: string;
        stage:
            | "product_launch"
            | "market_validation"
            | "scaling"
            | "revenue_momentum"
            | "liquidity_event"
            | "unassigned";
        fund:
            | "wxjsqai6fhw7mgq"
            | "hkdul6sd7xx2u6i"
            | "73tuvm8ll0jlo6x"
            | "4hwukm1xi68x58b"
            | "18vybohe60ln3n4"
            | "h8c2tlfs7gt29nv"
            | "l7bnwnwwzs3yr4n"
            | "0jz3m1u87fm8c5j";
    }

    const config = {
        stage: [
            "product_launch",
            "market_validation",
            "scaling",
            "revenue_momentum",
            "liquidity_event",
            "unassigned",
        ],
        fund: [
            "wxjsqai6fhw7mgq",
            "hkdul6sd7xx2u6i",
            "73tuvm8ll0jlo6x",
            "4hwukm1xi68x58b",
            "18vybohe60ln3n4",
            "h8c2tlfs7gt29nv",
            "l7bnwnwwzs3yr4n",
            "0jz3m1u87fm8c5j",
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

        let fundsResp: FundsResponse<unknown>[];

        if (process.env.NODE_ENV === "development") {
            fundsResp = await pb.collection(Collections.Funds).getFullList();
        } else {
            fundsResp = (await (await fetch("/pb/funds.json")).json()) as any[];
        }

        funds = [
            { value: "Any", label: "Any" },
            ...fundsResp
                .sort((a, b) => (a.manager > b.manager ? 1 : 0))
                .map((fund) => ({
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
        <h2 class="text-7xl font-medium">Portfolio</h2>
        <div
            class="relative w-full max-w-7xl lg:m-8 my-4 mx-auto flex flex-col xl:flex-row gap-4 min-h-full"
        >
            <!-- Desktop filters -->
            <div class="sticky left-0 top-10 self-start hidden lg:block mb-16">
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
                                />
                                <label
                                    for={`stage-${stage.value}`}
                                    class="cursor-pointer"
                                    >{stage.label}
                                    {portfolios
                                        .map((p) => p.stage)
                                        .includes(
                                            stage.value as PortfolioCompaniesStageOptions,
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
                                    disabled={!filterStore
                                        .getAvailableOptions("fund")
                                        .includes(fund.value) &&
                                        fund.value !== "Any"}
                                    onchange={() =>
                                        filterStore.select("fund", fund.value)}
                                    checked={filterStore.dimensions.fund
                                        .selected === fund.value}
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

            <!-- Mobile filters -->
            <div
                class="sticky left-0 top-0 lg:hidden w-full bg-white pt-4 h-full mb-4 z-10"
            >
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
                                    <div
                                        class="flex flex-row gap-2 items-center p-1"
                                    >
                                        <input
                                            type="radio"
                                            name="stage"
                                            value={stage.value}
                                            class="appearance-none w-3 h-3 rounded-full border border-zinc-900 focus:bg-zinc-900 checked:bg-zinc-900 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
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
                                            checked={filterStore.dimensions
                                                .stage.selected === stage.value}
                                        />
                                        <label
                                            for={`stage-${stage.value}`}
                                            class="cursor-pointer"
                                            >{stage.label}
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
                                    <div
                                        class="flex flex-row gap-2 items-center p-1"
                                    >
                                        <input
                                            type="radio"
                                            name="fund"
                                            value={fund.value}
                                            class="appearance-none w-3 h-3 rounded-full border border-zinc-900 focus:bg-zinc-900 checked:bg-zinc-900 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                            id={`fund-${fund.value}`}
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
                                        />
                                        <label for={`fund-${fund.value}`}
                                            >{fund.label}
                                            {portfolios
                                                .map((p) => p.funds)
                                                .filter((f) =>
                                                    f.includes(fund.value),
                                                ).length
                                                ? `(${portfolios.map((p) => p.funds).filter((f) => f.includes(fund.value)).length})`
                                                : ""}
                                        </label>
                                    </div>
                                {/each}
                            </div>
                        {/if}

                        {#if (expandStage || expandFund) && !(filterStore.dimensions.fund.selected === "Any" && filterStore.dimensions.stage.selected === "Any")}
                            <button
                                transition:slide
                                class="flex flex-row gap-2 border-2 border-zinc-900 justify-center p-2 mt-6 hover:bg-zinc-900 hover:text-white transition-all duration-200"
                                onclick={filterStore.reset}
                                >Reset Filters</button
                            >
                        {/if}
                    </div>
                </div>
            </div>

            <!-- Portfolio results -->
            <main
                class="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 mb-8 h-max"
            >
                {#each portfolios as portfolio}
                    <button
                        class="bg-zinc-100 p-4 group h-40 w-40 grid place-content-center"
                        class:hidden={!filterStore.filteredItems.some(
                            (r) => r.id === portfolio.id,
                        )}
                        aria-label="View {portfolio.name} portfolio"
                        onclick={() => {
                            dialogStartup = portfolio;
                            startupModal?.showModal();
                        }}
                    >
                        <!-- TODO: Find a better method to constrain SVG size -->
                        <div
                            class="p-1 text-[var(--accent)] transition-all duration-150 max-h-16 aspect-video"
                            style:--accent={adjustLightColor(
                                portfolioMap[portfolio.id].accent,
                            )}
                        >
                            {#if portfolio.logo.endsWith(".svg")}
                                <svg
                                    class="w-full h-full"
                                    width="14rem"
                                    height="14rem"
                                    use:inlineSvg={getFileUrl(
                                        portfolioMap[portfolio.id],
                                        !portfolioMap[portfolio.id]
                                            .use_unoptimised_logo
                                            ? portfolioMap[portfolio.id].logo
                                            : portfolioMap[portfolio.id]
                                                  .unoptimised_logo,
                                    )}
                                />
                            {:else}
                                <img
                                    class={"w-full h-full object-contain" +
                                        (portfolio.invert_foreground
                                            ? " invert hue-rotate-180 contrast-75"
                                            : "")}
                                    src={getFileUrl(
                                        portfolioMap[portfolio.id],
                                        !portfolioMap[portfolio.id]
                                            .use_unoptimised_logo
                                            ? portfolioMap[portfolio.id].logo
                                            : portfolioMap[portfolio.id]
                                                  .unoptimised_logo,
                                    )}
                                    alt={`${portfolioMap[portfolio.id].name}'s logo'`}
                                />
                            {/if}
                        </div>
                    </button>
                {/each}
            </main>
        </div>
    </div>
    <PortfolioDialog
        portfolio={dialogStartup}
        bind:dialogElement={startupModal}
    />
{/if}

<style>
    input:disabled + label {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
