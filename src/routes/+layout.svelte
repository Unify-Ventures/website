<script>
    import Footer from "$lib/components/footer.svelte";
    import Header from "$lib/components/header.svelte";
    import "../app.css";
</script>

<div class="flex min-h-full flex-col">
    <Header />
    <div class="flex-1">
        <slot></slot>
    </div>
    <Footer />
</div>

<style>
    :global body {
        /* * The web is broken... Why does this work? Might break someday */
        min-height: 100%;
        height: 100vh;
    }

    :global body > div {
        min-height: 100%;
    }
</style>
