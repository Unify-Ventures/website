<script lang="ts">
    import Header from "$lib/components/header.svelte";
    import gsap from "gsap";
    import ScrollTrigger from "gsap/dist/ScrollTrigger";
    import { onMount } from "svelte";
    import Typewriter from "svelte-typewriter";
    import { Select } from "bits-ui";
    import { ChevronsUpDown, ArrowRight, LoaderCircle } from "lucide-svelte";
    import {
        getFeaturedPortfolios,
        getFileUrl,
        getTeam,
        type PortfolioExpand,
    } from "$lib/pocketbase";
    import { inlineSvg } from "@svelte-put/inline-svg";
    import {
        type PortfolioCompaniesResponse,
        type TeamResponse,
    } from "$lib/pb-types";

    let activeTimeline: GSAPTimeline | null = null;
    let scrollingTl: GSAPTimeline | null = null;

    const portfolioCategories = [
        { value: "product_launch", label: "Product Launch" },
        { value: "market_validation", label: "Market Validation" },
        { value: "revenue_momentum", label: "Revenue Momentum" },
        { value: "scaling", label: "Scaling" },
        { value: "liquidity_event", label: "Liquidity Event" },
    ];

    let portfolios = $state<PortfolioCompaniesResponse<PortfolioExpand>[]>([]);
    let portfolioIter = $state(1);
    let team = $state<TeamResponse[]>([]);

    $effect(() => {
        portfolios = portfolios;
        setupScrolling();
    });

    async function loadPortfolios(
        status: string = "scaling",
        featured: boolean = true
    ) {
        portfolios = await getFeaturedPortfolios(status, featured);
        portfolioIter = 1;

        if (portfolios.length > 4) {
            while (portfolios.length < 20) {
                portfolios.push(...portfolios);
                portfolioIter++;
            }
        }

        return portfolios;
    }

    onMount(async () => {
        portfolios = await loadPortfolios();
        team = await getTeam();
        console.log(team);
    });

    onMount(() => {
        gsap.registerEffect({
            name: "counter",
            extendTimeline: true,
            defaults: {
                end: 0,
                duration: 0.5,
                ease: "power1",
                increment: 1,
            },
            effect: (targets: HTMLElement[], config: any) => {
                let tl = gsap.timeline();
                const num = targets[0].innerText.replace(/\,/g, "");
                targets[0].innerText = num;

                tl.to(
                    targets,
                    {
                        duration: config.duration,
                        innerText: config.end,
                        modifiers: {
                            innerText: (innerText: string) => {
                                return gsap.utils
                                    .snap(
                                        config.increment,
                                        parseFloat(innerText)
                                    )
                                    .toString()
                                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                            },
                        },
                        ease: config.ease,
                    },
                    0
                );

                return tl;
            },
        });

        gsap.registerPlugin(ScrollTrigger);
    });

    const timelineValues = [
        [
            { width: "75%", height: "75%" },
            { width: "25%", height: "75%" },
            { width: "75%", height: "25%" },
            { width: "25%", height: "25%" },
        ],
        [
            { width: "25%", height: "75%" },
            { width: "75%", height: "75%" },
            { width: "25%", height: "25%" },
            { width: "75%", height: "25%" },
        ],
        [
            { width: "75%", height: "25%" },
            { width: "25%", height: "25%" },
            { width: "75%", height: "75%" },
            { width: "25%", height: "75%" },
        ],
        [
            { width: "25%", height: "25%" },
            { width: "75%", height: "25%" },
            { width: "25%", height: "75%" },
            { width: "75%", height: "75%" },
        ],
    ];

    const setupTimeline = (elmId: string, idx: number): void => {
        const elmElement = document.getElementById(elmId);
        if (!elmElement) return;

        const tl = gsap.timeline({ paused: true });
        tl.to(`#anim${idx + 1}`, { duration: 0.6, opacity: 1 }, 0);

        timelineValues[idx].forEach((val, i) => {
            tl.to(`#elm${i + 1}`, { duration: 0.6, ...val }, 0);
        });

        elmElement.addEventListener("mouseenter", () => {
            if (activeTimeline && activeTimeline !== tl) {
                activeTimeline.reverse();
            }
            tl.play();
            activeTimeline = tl;
        });

        elmElement.addEventListener("mouseleave", () => {
            if (activeTimeline === tl) {
                tl.reverse();
            }
        });
    };

    onMount(() => {
        ["elm1", "elm2", "elm3", "elm4"].forEach((elm, idx) =>
            setupTimeline(elm, idx)
        );

        const statTl = gsap
            .timeline({
                scrollTrigger: {
                    trigger: "#partner-stat",
                },
            })
            .pause();

        statTl.counter(
            "#partner-stat",
            { end: 3, ease: "linear", duration: 0.6 },
            0
        );
        statTl.counter(
            "#b2b-stat",
            { end: 27, ease: "linear", duration: 1.2 },
            0
        );
        statTl.counter(
            "#fin-stat",
            { end: 12, ease: "linear", duration: 1 },
            0
        );
    });

    function setupScrolling() {
        const portfolioContainer = document.getElementById(
            "portfolio-container"
        );
        const portfolios = document.querySelectorAll(".portfolio");

        scrollingTl = gsap.timeline({
            repeat: -1,
            paused: true,
            onRepeat: () => {
                const firstPortfolio = portfolioContainer?.children[0];

                if (!firstPortfolio) return;

                portfolioContainer?.appendChild(firstPortfolio);
                gsap.set(portfolioContainer, { x: 0 });
            },
        });

        if (portfolioContainer && portfolios.length > 5) {
            scrollingTl.to(portfolios, {
                x: `-=${(portfolios[0] as HTMLElement).offsetWidth + 20}`,
                ease: "linear",
                duration: portfolios.length * 0.25,
            });

            scrollingTl.play();
        }
    }
</script>

<Header />

<main>
    <section class="flex flex-1 justify-between">
        <h2
            class="2xl:text-7xl text-5xl font-medium lg:mx-16 mx-6 2xl:my-auto 2xl:w-1/3 min-w-96"
        >
            <span>
                We invest in thematic funds across,
                <Typewriter mode="loop">
                    <span>B2B SaaS.</span>
                    <span>Advanced Manufacturing.</span>
                    <span>Fin Tech.</span>
                </Typewriter>
            </span>
        </h2>
        <div
            class="w-full flex-1 flex-wrap h-[calc(100vh-22rem)] 2xl:flex hidden max-w-[80rem]"
        >
            {#each [1, 2, 3, 4] as i}
                <div
                    class="w-1/2 text-9xl font-bold text-white flex flex-col flex-wrap items-center justify-center"
                    class:bg-red-500={i == 1}
                    class:bg-blue-500={i == 2}
                    class:bg-green-500={i == 3}
                    class:bg-yellow-500={i == 4}
                    id={`elm${i}`}
                >
                    Hi
                    <span id={`anim${i}`} class="text-3xl opacity-0">
                        Some animation
                    </span>
                </div>
            {/each}
        </div>
    </section>

    <section class="section">
        <div>
            <h2>Unify Fund <br /> of Funds</h2>
            <p>
                Unify Ventures has established a multi-thematic fund of funds
                that invests in managers covering B2B SaaS, Advanced
                Manufacturing, and Fin Tech, with more thematics to come.
            </p>
        </div>
    </section>

    <section class="grid grid-cols-1 lg:grid-cols-3">
        <div id="stat1" class="bg-amber-400 p-16">
            <h3 class="text-2xl">Partner Funds</h3>
            <span id="partner-stat" class="text-9xl">1</span>
        </div>
        <div id="stat2" class="bg-stone-400 p-16">
            <h3 class="text-2xl">B2B SaaS</h3>
            <span id="b2b-stat" class="text-9xl">1</span><span class="text-9xl"
                >+</span
            >
        </div>
        <div id="stat3" class="bg-emerald-400 p-16">
            <h3 class="text-2xl">Fin Tech</h3>
            <span id="fin-stat" class="text-9xl">1</span><span class="text-9xl"
                >+</span
            >
        </div>
    </section>

    <section class="flex flex-col justify-center items-center mb-16">
        <div
            class="flex max-w-7xl xl:m-16 m-8 xl:gap-64 lg:gap-36 gap-12 flex-col lg:flex-row items-center justify-center flex-none"
        >
            <h2 class="text-7xl font-medium">Our Portfolio</h2>
            <div class="flex gap-2 flex-col w-full justify-end">
                <Select.Root
                    selected={portfolioCategories[3]}
                    onSelectedChange={async (obj) => {
                        if (!obj) return;
                        scrollingTl?.kill();
                        portfolios = [];
                        portfolios = await loadPortfolios(obj.value, false);
                    }}
                >
                    <Select.Trigger
                        class="border-2 p-4 border-zinc-900 hover:bg-zinc-100 transition-all duration-200 cursor-pointer inline-flex gap-2"
                        aria-label="Select a category"
                    >
                        <Select.Value
                            placeholder="Select a category"
                            class=""
                        />
                        <ChevronsUpDown class="ml-auto" />
                    </Select.Trigger>
                    <Select.Content
                        sameWidth
                        overlap
                        sideOffset={-3}
                        class="border-2 border-zinc-900 bg-white flex flex-col gap-2"
                    >
                        {#each portfolioCategories as category}
                            <Select.Item
                                value={category.value}
                                class="p-4 hover:bg-zinc-100 transition-all duration-200 cursor-pointer"
                            >
                                {category.label}
                            </Select.Item>
                        {/each}
                    </Select.Content>
                </Select.Root>
                <button
                    class="flex justify-center items-center bg-zinc-900 text-white p-4"
                >
                    See All <ArrowRight />
                </button>
            </div>
        </div>
        <div class="flex flex-row gap-2">
            <div
                class={`overflow-hidden max-w-[100vw] 2xl:max-w-fit ${}`}
                id="scroll-container"
            >
                <div class="w-max flex flex-row gap-6" id="portfolio-container">
                    {#each portfolios as portfolio, i}
                        <div
                            class={`w-40 md:w-64 aspect-square bg-zinc-100 portfolio relative group text-zinc-800 ${
                                portfolio.invert_foreground
                                    ? "hover:[&:not(.no-hover)]:text-zinc-100"
                                    : ""
                            }`}
                            style:--accent={portfolio.accent}
                            onmouseenter={(e) => {
                                scrollingTl?.pause();
                            }}
                            onmouseleave={(e) => {
                                if (portfolios.length > 5) {
                                    scrollingTl?.play();
                                }
                            }}
                            role="img"
                        >
                            <div
                                role="img"
                                class="w-40 md:w-64 aspect-square flex justify-center items-center p-6 xl:p-12 transition-colors duration-150"
                                id={`portfolio-${portfolio.id}-${portfolioIter}`}
                            >
                                <svg
                                    use:inlineSvg={getFileUrl(
                                        portfolio,
                                        portfolio.logo
                                    )}
                                    width="100%"
                                />
                            </div>
                            {#if portfolio.expand?.funds[0]?.logo}
                                <svg
                                    use:inlineSvg={getFileUrl(
                                        portfolio.expand.funds[0],
                                        portfolio.expand.funds[0].logo
                                    )}
                                    class="p-2 h-12 max-w-28 text-zinc-900 bg-zinc-200 absolute bottom-0 right-0 translate-y-0 group-hover:translate-y-full transition-all duration-150"
                                ></svg>
                            {/if}
                            <button
                                class="flex flex-row gap-2 bg-zinc-900 p-4 text-white absolute bottom-0 right-0 translate-y-full group-hover:translate-y-0 transition-all duration-150"
                            >
                                Learn More <ArrowRight />
                            </button>
                        </div>
                    {:else}
                        <p
                            class="text-6xl h-64 flex gap-6 items-center justify-center"
                        >
                            <LoaderCircle class="animate-spin" size="64" /> Loading
                            portfolios...
                        </p>
                    {/each}
                </div>
            </div>
            <div class="hidden lg:relative">
                <div
                    class="absolute top-0 left-0 bottom-0 -translate-x-full bg-gradient-to-r from-transparent via-white/75 to-white w-44 transition-all duration-150 shadow-effect"
                ></div>
                <button
                    class="flex justify-center items-center bg-zinc-900 text-white w-64 h-64 text-2xl gap-2 hover:bg-zinc-800 duration-150 transition-all"
                >
                    See All <ArrowRight />
                </button>
            </div>
        </div>
    </section>

    <section class="section">
        <div>
            <h2>Our Team</h2>
            <div
                class="flex flex-col lg:flex-row lg:space-between gap-16 flex-wrap justify-center"
            >
                {#each team as member}
                    <div class="flex flex-col items-center gap-2">
                        <img
                            src={getFileUrl(member, member.picture)}
                            alt={`${member.name}'s avatar`}
                            style="clip-path: url(#alex-path1)"
                            class="w-64 h-64 rounded-full object-cover"
                        />
                        <h3 class="text-4xl font-medium">{member.name}</h3>
                        <h4 class="text-2xl text-zinc-700">{member.title}</h4>
                        <p class="max-w-sm text-justify">{member.blurb}</p>
                    </div>
                {/each}
            </div>
        </div>
    </section>
</main>

<style>
    :root {
        --cursor-width: 0.2rem;
    }

    .portfolio:hover:not(.no-hover) > div {
        background-color: var(--accent);
        transition: all 150ms ease;
    }

    .section-wrapper {
        padding: 4rem; /* Adjust as necessary */
    }
</style>
