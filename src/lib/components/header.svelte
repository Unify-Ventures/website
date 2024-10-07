<script lang="ts">
    import Logo from "$lib/components/logo.svelte";
    import { Backpack } from "lucide-svelte";
</script>

<div class="flex justify-between items-center p-6">
    <Logo id="logo" class="w-36 h-min m-2" />
    <div class="w-full"></div>
    <div class="flex items-center gap-4">
        <button>
            <Backpack size="32" aria-label="Backpack" />
        </button>
    </div>
</div>
