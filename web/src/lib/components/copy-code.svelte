<script lang="ts">
    import * as Dialog from '$lib/components/ui/dialog';
    import { Button } from '$lib/components/ui/button';
    import { Check, Copy } from 'lucide-svelte';
    import {
        SNIPPET_OPTIONS,
        copySnippet,
        type SnippetOption,
    } from '$lib/snippets';

    let {
        open = $bindable(false),
        anim = { dict: '', name: '' },
        model = '',
        bone = 0,
        coords = { x: 0, y: 0, z: 0 },
        rot = { x: 0, y: 0, z: 0 },
    }: {
        open: boolean;
        anim: { dict: string; name: string };
        model: string;
        bone: number;
        coords: { x: number; y: number; z: number };
        rot: { x: number; y: number; z: number };
    } = $props();

    let activeTab = $state<SnippetOption['id']>('native');
    let copied = $state(false);

    const code = $derived(
        copySnippet(activeTab, {
            anim,
            model,
            bone,
            coords,
            rot,
        }),
    );

    async function handleCopy() {
        await navigator.clipboard.writeText(code);
        copied = true;
        setTimeout(() => {
            copied = false;
        }, 2000);
    }
</script>

<Dialog.Root bind:open>
    <Dialog.Content class="w-fit max-w-[90vw] p-0 gap-0 overflow-hidden">
        <Dialog.Header class="px-5 pt-5 pb-3 border-b border-zinc-800">
            <Dialog.Title>Code Snippet</Dialog.Title>
            <Dialog.Description class="text-xs text-zinc-400">
                Pilih format yang ingin digunakan lalu salin kode ke clipboard.
            </Dialog.Description>
        </Dialog.Header>

        <div class="p-5 flex flex-col gap-3">
            <div
                class="grid grid-cols-3 gap-1.5 p-1 bg-zinc-900 border border-zinc-800"
            >
                {#each SNIPPET_OPTIONS as tab}
                    <button
                        type="button"
                        class={`py-1.5 px-3 text-xs font-medium transition-colors cursor-pointer text-center whitespace-nowrap ${
                            activeTab === tab.id
                                ? 'bg-zinc-800 text-zinc-50 shadow-sm'
                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                        }`}
                        onclick={() => {
                            activeTab = tab.id;
                            copied = false;
                        }}
                    >
                        {tab.label}
                    </button>
                {/each}
            </div>

            <div
                class="relative group border border-zinc-800 bg-zinc-900 overflow-hidden"
            >
                <div
                    class="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-950"
                >
                    <span class="text-[11px] font-mono text-zinc-400">lua</span>
                    <Button
                        size="sm"
                        variant="ghost"
                        class="h-7 gap-1.5 px-2.5 text-xs text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800"
                        onclick={handleCopy}
                    >
                        {#if copied}
                            <Check class="size-3.5 text-emerald-400" />
                            <span class="text-emerald-400 font-medium"
                                >Copied</span
                            >
                        {:else}
                            <Copy class="size-3.5" />
                            <span>Copy</span>
                        {/if}
                    </Button>
                </div>
                <pre
                    class="p-3.5 text-xs text-zinc-200 font-mono leading-relaxed overflow-x-auto max-h-[350px] whitespace-pre selection:bg-zinc-700"><code
                        >{code}</code
                    ></pre>
            </div>
        </div>
    </Dialog.Content>
</Dialog.Root>
