<script lang="ts">
    import {
        Collections,
        PortfolioCompaniesStageOptions,
        type FundsResponse,
        type PortfolioCompaniesResponse,
    } from "$lib/pb-types";
    import {
        getFileUrl,
        getPortfolios,
        pb,
        type PortfolioExpand,
    } from "$lib/pocketbase";
    import { adjustLightColor } from "$lib/color-utils";
    import { createFilterStore } from "$lib/multi-filter.svelte";
    import { inlineSvg } from "@svelte-put/inline-svg";
    import ChevronDown from "lucide-svelte/icons/chevron-down";
    import { onMount, tick } from "svelte";
    import { slide } from "svelte/transition";
    import PortfolioDialog from "$lib/components/PortfolioDialog.svelte";
    import { page } from "$app/state";
    import { toCamelCase } from "$lib/case";
    import { CircleSlash } from "lucide-svelte";

    const stages: { value: "Any" | PortfolioCompaniesStageOptions; label: string }[] = [
        { value: "Any", label: "Any" },
        ...Object.values(PortfolioCompaniesStageOptions).map((stage) => ({
            value: stage,
            label: toTitleCase(stage.replace(/_/g, " ")),
        })),
    ];

    let funds = $state<
        Array<{
            value: string;
            label: string;
            managerName?: string;
            managerFeatured?: boolean;
        }>
    >([{ value: "any", label: "Any" }]);

    let expandStage = $state(false);
    let expandFund = $state(false);

    function toTitleCase(str: string) {
        return str.replace(/\w\S*/g, (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }

    let portfolios = $state<PortfolioCompaniesResponse[]>([]);

    let dialogStartup = $state<PortfolioCompaniesResponse | null>(null);
    let startupModal = $state<HTMLDialogElement | undefined>(undefined);
    let portfolioGrid = $state<HTMLElement | null>(null);
    let relativeScroll = $state<number | null>(null);

    interface PortfolioFilterItem {
        [key: string]: string | PortfolioCompaniesStageOptions;
        id: string;
        stage: PortfolioCompaniesStageOptions;
        fund: string;
    }

    const config = {
        id: [] as string[],
        stage: [
            PortfolioCompaniesStageOptions.product_launch,
            PortfolioCompaniesStageOptions.market_validation,
            PortfolioCompaniesStageOptions.scaling,
            PortfolioCompaniesStageOptions.revenue_momentum,
            PortfolioCompaniesStageOptions.liquidity_event,
            PortfolioCompaniesStageOptions.unassigned,
        ],
        fund: [] as string[],
    };

    let portfolioMap = $state<Record<string, PortfolioCompaniesResponse>>({});

    let filterStore = $state<ReturnType<
        typeof createFilterStore<PortfolioFilterItem>
    > | null>(null);

    function handleHash() {
        if (!window.location.hash) return;
        const portfolioElement = document.getElementById(
            (Object.entries(portfolioMap).find(
                ([_, value]) =>
                    toCamelCase(value.name) === page.url.hash.slice(1),
            ) || [])[0] || "",
        );

        if (!portfolioElement) return;

        let scrollEndHandler = () => {
            portfolioElement.classList.add("flash");
            setTimeout(() => {
                portfolioElement.classList.remove("flash");
            }, 750);
            window.removeEventListener("scrollend", scrollEndHandler);
        };

        window.addEventListener("scrollend", scrollEndHandler);

        portfolioElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
    }

    $effect(() => {
        if (page.url.hash) handleHash();
    });

    onMount(async () => {
        portfolios = await getPortfolios();

        const filterablePortfolios: PortfolioFilterItem[] = portfolios.map((p) => ({
            id: p.id,
            stage: p.stage ?? PortfolioCompaniesStageOptions.unassigned,
            fund: p.funds?.[0] ?? "",
        }));

        portfolios.forEach((p) => {
            portfolioMap[p.id] = p;
        });

        let fundsResp: FundsResponse<unknown>[];

        if (process.env.NODE_ENV === "development") {
            fundsResp = await pb.collection(Collections.Funds).getFullList({
                expand: "manager",
            });
        } else {
            fundsResp = (await (await fetch("/pb/funds.json")).json()) as any[];
        }

        funds = [
            { value: "Any", label: "Any" },
            ...fundsResp
                .sort((a, b) => {
                    const aExpand = a.expand as any;
                    const bExpand = b.expand as any;
                    const aFeatured = aExpand?.manager?.featured ?? false;
                    const bFeatured = bExpand?.manager?.featured ?? false;

                    if (aFeatured !== bFeatured) return bFeatured ? 1 : -1;

                    const aName = aExpand?.manager?.name ?? "";
                    const bName = bExpand?.manager?.name ?? "";
                    return aName.localeCompare(bName);
                })
                .map((fund) => {
                    const expand = fund.expand as any;
                    return {
                        value: fund.id,
                        label: fund.short_name || fund.name,
                        managerName: expand?.manager?.name ?? "",
                        managerFeatured: expand?.manager?.featured ?? false,
                    };
                }),
        ];

        const dynamicConfig = {
            id: filterablePortfolios.map((p) => p.id),
            stage: config.stage,
            fund: [...new Set(filterablePortfolios.map((p) => p.fund))],
        };

        filterStore = createFilterStore(filterablePortfolios, dynamicConfig);

        setTimeout(handleHash, 500);
    });

    function fundToLabel(fund: string) {
        return funds.find((f) => f.value === fund)?.label ?? "";
    }

    function stageToLabel(stage: string) {
        return stages.find((s) => s.value === stage)?.label ?? "";
    }

    function saveScrollPosition() {
        if (!portfolioGrid) return;
        const rect = portfolioGrid.getBoundingClientRect();
        if (rect.height <= window.innerHeight) return;
        const gridTop = rect.top + window.scrollY;
        const viewportCenter = window.scrollY + window.innerHeight / 2;
        relativeScroll = Math.max(0, Math.min(1, (viewportCenter - gridTop) / rect.height));
    }

    function selectFilter(dimension: "stage" | "fund", value: string) {
        saveScrollPosition();
        filterStore!.select(dimension, value);
    }

    function resetFilters() {
        saveScrollPosition();
        filterStore!.reset();
    }

    $effect(() => {
        filterStore?.filteredItems;
        if (relativeScroll === null || !portfolioGrid) return;
        tick().then(() => {
            const rect = portfolioGrid!.getBoundingClientRect();
            const gridTop = rect.top + window.scrollY;
            const target = gridTop + relativeScroll! * rect.height - window.innerHeight / 2;
            window.scrollTo({ top: Math.max(0, target), behavior: "instant" });
            relativeScroll = null;
        });
    });
</script>

{#if filterStore}
    <div class="grid place-content-center">
        <h2 class="text-7xl font-medium">Portfolio</h2>
        <div
            class="relative w-full max-w-7xl lg:m-8 my-4 mx-auto flex flex-col lg:flex-row gap-4 min-h-full"
        >
            <!-- Desktop filters -->
            <div class="sticky left-0 top-10 self-start hidden lg:block mb-16">
                <!-- TODO: Implement proper overflow handling for when filter is not floating -->
                <div
                    class="border-2 p-4 border-zinc-700 bg-white w-64 max-h-[calc(100vh-80px)] overflow-scroll"
                >
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
                                    disabled={stage.value !== "Any" &&
                                        !filterStore
                                            .getAvailableOptions("stage")
                                            .includes(stage.value)}
                                    onchange={() => selectFilter("stage", stage.value)}
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
                        {#each funds as fund, index}
                            {#if index > 0 && fund.managerName && (index === 1 || fund.managerName !== funds[index - 1].managerName)}
                                <div
                                    class="text-xs font-semibold text-zinc-600 mt-3 mb-1 px-1"
                                >
                                    {fund.managerName}
                                </div>
                            {/if}
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
                                    onchange={() => selectFilter("fund", fund.value)}
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
                            onclick={resetFilters}>Reset Filters</button
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
                                            disabled={stage.value !== "Any" &&
                                                !filterStore
                                                    .getAvailableOptions("stage")
                                                    .includes(stage.value)}
                                            onchange={() => selectFilter("stage", stage.value)}
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
                                {#each funds as fund, index}
                                    {#if index > 0 && fund.managerName && (index === 1 || fund.managerName !== funds[index - 1].managerName)}
                                        <div
                                            class="text-xs font-semibold text-zinc-600 mt-3 mb-1 px-1"
                                        >
                                            {fund.managerName}
                                        </div>
                                    {/if}
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
                                            onchange={() => selectFilter("fund", fund.value)}
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
                                onclick={resetFilters}
                                >Reset Filters</button
                            >
                        {/if}
                    </div>
                </div>
            </div>

            <!-- Portfolio results -->
            <main
                bind:this={portfolioGrid}
                class="grid grid-cols-2 min-w-[336px] lg:min-w-lg 2xl:min-w-[688px] lg:grid-cols-3 2xl:grid-cols-4 gap-4 mb-8 h-max"
            >
                {#each portfolios as portfolio}
                    <button
                        class="bg-zinc-100 p-4 group h-40 w-40 grid place-content-center cursor-pointer"
                        class:hidden={!filterStore.filteredItems.some(
                            (r) => r.id === portfolio.id,
                        )}
                        aria-label="View {portfolio.name} portfolio"
                        onclick={() => {
                            dialogStartup = portfolio;
                            startupModal?.showModal();
                        }}
                        id={portfolio.id}
                    >
                        <!-- TODO: Find a better method to constrain SVG size -->
                        <div
                            class="p-1 text-(--accent) transition-all duration-150 max-h-16 aspect-video"
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
                            {:else if portfolio.logo}
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
                            {:else}
                                <div
                                    class="w-full h-full grid place-content-center"
                                >
                                    <CircleSlash size="64" />
                                </div>
                            {/if}
                        </div>
                    </button>
                {/each}
            </main>
        </div>
    </div>
    <PortfolioDialog
        portfolio={dialogStartup}
        logos={portfolios.map((p) => ({
            logoURL: getFileUrl(
                p,
                !p.use_unoptimised_logo ? p.logo : p.unoptimised_logo,
            ),
            portfolio: p,
        }))}
        bind:dialogElement={startupModal}
        onclose={() => {}}
    />
{/if}

<style>
    input:disabled + label {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .flash {
        animation: flash 750ms ease-in-out;
    }

    @keyframes flash {
        0% {
            transform: scale(1);
        }
        15% {
            transform: scale(1.1);
        }
        30% {
            transform: scale(0.9);
        }
        50% {
            transform: scale(1.075);
        }
        65% {
            transform: scale(0.95);
        }
        100% {
            transform: scale(1);
        }
    }
</style>
