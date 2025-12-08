<script lang="ts">
    import { onMount } from "svelte";
    import { untrack } from "svelte";
    import type { Snippet } from "svelte";

    interface Props {
        /**
         * Scrolling speed in pixels per second
         * @default 60
         */
        speed?: number;
        /**
         * Pause animation on hover
         * @default true
         */
        pauseOnHover?: boolean;
        /**
         * Pause the animation due to an external condition
         * @default false
         */
        externalPause?: boolean;
        /**
         * Start animation automatically
         * @default true
         */
        autoStart?: boolean;
        /**
         * Gap between items in pixels
         * @default 24
         */
        gap?: number;
        /**
         * CSS class to apply to container
         */
        class?: string;
        /**
         * CSS class to apply to track
         */
        trackClass?: string;
        /**
         * Enable fade-out effect on edges
         * @default true
         */
        fade?: boolean;
        /**
         * Percentage of width to fade at each edge
         * @default 20
         */
        fadePercent?: number;
        /**
         * Content to render and repeat infinitely
         */
        children: Snippet;
    }

    let {
        speed = 60,
        pauseOnHover = true,
        externalPause = false,
        autoStart = true,
        gap = 24,
        class: className = "",
        trackClass = "",
        fade = true,
        fadePercent = 20,
        children,
    }: Props = $props();

    // State
    let container = $state<HTMLDivElement | undefined>(undefined);
    let track = $state<HTMLDivElement | undefined>(undefined);
    let originalContent = $state<HTMLDivElement | undefined>(undefined);
    let currentX = $state(0);
    let isRunning = $state(false);
    let isPaused = $state(false);
    let isHovering = $state(false);
    let animationId = $state<number | null>(null);
    let lastTime = $state(0);
    let setWidth = $state(0);
    let containerWidth = $state(0);
    let setsNeeded = $state(3);

    // Derived
    let duplicatedSets = $derived(
        Array.from({ length: setsNeeded }, (_, i) => i),
    );
    let maskStyle = $derived(
        fade
            ? `linear-gradient(to right, transparent 0%, black ${fadePercent}%, black ${100 - fadePercent}%, transparent 100%)`
            : "none",
    );

    /**
     * Calculate dimensions and number of sets needed for seamless scrolling
     */
    function calculateDimensions() {
        if (!container || !originalContent) return;

        containerWidth = container.offsetWidth;
        setWidth = originalContent.offsetWidth + gap;

        // Calculate how many sets needed for seamless scrolling
        // Need at least enough to fill viewport width * 2, plus one extra set
        const minSets = Math.ceil((containerWidth * 2) / setWidth) + 1;
        setsNeeded = Math.max(3, minSets);
    }

    /**
     * Animation frame handler
     */
    function animate(currentTime: number) {
        if (!isRunning) {
            animationId = requestAnimationFrame(animate);
            return;
        }

        // Handle pause - reset time tracking during pause
        if ((pauseOnHover && isHovering) || externalPause || isPaused) {
            lastTime = currentTime;
            animationId = requestAnimationFrame(animate);
            return;
        }

        // Initialize time
        if (lastTime === 0) {
            lastTime = currentTime;
        }

        // Calculate movement
        const deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;
        currentX -= speed * deltaTime;

        // Seamless loop reset
        if (Math.abs(currentX) >= setWidth) {
            currentX = currentX + setWidth;
        }

        // Apply transform
        if (track) {
            track.style.transform = `translateX(${currentX}px)`;
        }

        // Continue animation
        animationId = requestAnimationFrame(animate);
    }

    /**
     * Start the animation
     */
    function start() {
        if (isRunning) return;

        isRunning = true;
        lastTime = 0;
        animationId = requestAnimationFrame(animate);
    }

    /**
     * Stop the animation
     */
    function stop() {
        if (!isRunning) return;

        isRunning = false;

        if (animationId !== null) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }

    /**
     * Pause the animation
     */
    function pause() {
        if (!isRunning) return;
        isPaused = true;
    }

    /**
     * Resume the animation
     */
    function resume() {
        if (!isRunning) return;
        isPaused = false;
    }

    /**
     * Refresh carousel (recalculate and restart if needed)
     */
    function refresh() {
        const wasRunning = isRunning;
        stop();
        calculateDimensions();

        if (wasRunning) {
            start();
        }
    }

    // Setup event listeners
    $effect(() => {
        if (!container) return;
        const containerRef = container;

        const handleMouseEnter = () => {
            isHovering = true;
        };

        const handleMouseLeave = () => {
            isHovering = false;
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                pause();
            } else if (isRunning) {
                resume();
            }
        };

        containerRef.addEventListener("mouseenter", handleMouseEnter);
        containerRef.addEventListener("mouseleave", handleMouseLeave);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            containerRef.removeEventListener("mouseenter", handleMouseEnter);
            containerRef.removeEventListener("mouseleave", handleMouseLeave);
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange,
            );
        };
    });

    // Handle resize
    $effect(() => {
        if (!container) return;

        const resizeObserver = new ResizeObserver(() => {
            // Use untrack to prevent infinite loops
            untrack(() => {
                refresh();
            });
        });

        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
        };
    });

    // Initial setup and start
    onMount(() => {
        calculateDimensions();

        if (autoStart && setWidth > 0) {
            start();
        }

        return () => {
            stop();
        };
    });

    // Recalculate when children change
    $effect(() => {
        // Track the snippet to re-run when it changes
        void children;

        // Use untrack to avoid infinite loops when updating dimensions
        untrack(() => {
            // Wait for DOM update
            setTimeout(() => {
                refresh();
            }, 0);
        });
    });
</script>

<div
    bind:this={container}
    class="carousel-container {className}"
    style:mask-image={maskStyle}
    style:-webkit-mask-image={maskStyle}
>
    <div
        bind:this={track}
        class="carousel-track {trackClass}"
        style:gap="{gap}px"
    >
        <!-- Hidden original content for measurement -->
        <div
            bind:this={originalContent}
            class="carousel-set"
            style:gap="{gap}px"
        >
            {@render children()}
        </div>

        <!-- Duplicated sets for infinite scroll -->
        {#each duplicatedSets.slice(1) as set (set)}
            <div class="carousel-set" style:gap="{gap}px">
                {@render children()}
            </div>
        {/each}
    </div>
</div>

<style>
    .carousel-container {
        overflow: hidden;
        position: relative;
        width: 100%;
    }

    .carousel-track {
        display: flex;
        flex-direction: row;
        width: max-content;
        will-change: transform;
    }

    .carousel-set {
        display: flex;
        flex-direction: row;
        flex-shrink: 0;
    }
</style>
