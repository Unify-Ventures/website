<script>
    import Footer from "$lib/components/footer.svelte";
    import Header from "$lib/components/header.svelte";
    import "../app.css";

    const { children } = $props();
</script>

<div class="flex min-h-full flex-col">
    <Header />
    <div class="flex-1">
      {@render children()}
    </div>
    <Footer />
</div>

<style>
    :global body {
        /* HACK: The web is broken... Why does this work? Might break someday */
        min-height: 100%;
        height: 100vh;
    }
</style>
