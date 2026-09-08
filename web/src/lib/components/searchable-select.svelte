<script lang="ts">
    import { buttonVariants } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import * as Popover from '$lib/components/ui/popover';
    import { fetchNui } from '$lib/fetch-nui';
    import { cn } from '$lib/utils';
    import { Check, ChevronsUpDown } from 'lucide-svelte';

    export interface OptionItem<T = any> {
        label: string;
        value: T;
    }

    let {
        options = [],
        value = $bindable(undefined),
        placeholder = 'Select option...',
        searchPlaceholder = 'Search...',
        disabled = false,
        pageSize = 50,
        class: className = '',
        onchange = () => {},
    }: {
        options: (string | OptionItem<any>)[];
        value?: any;
        placeholder?: string;
        searchPlaceholder?: string;
        disabled?: boolean;
        pageSize?: number;
        class?: string;
        onchange?: (val: any) => void;
    } = $props();

    let open = $state(false);
    let search = $state('');
    let page = $state(1);
    let limit = $derived(page * pageSize);

    $effect(() => {
        search;
        page = 1;
    });

    $effect(() => {
        if (!open) {
            search = '';
            page = 1;
        }
    });

    function getLabel(opt: string | OptionItem): string {
        return typeof opt === 'object' ? opt.label : opt;
    }

    function getValue(opt: string | OptionItem): string | number {
        return typeof opt === 'object' ? opt.value : opt;
    }

    let selectedLabel = $derived.by(() => {
        if (value === '' || value === undefined || value === null) return '';
        const found = options.find(
            (opt) => String(getValue(opt)) === String(value),
        );
        return found ? getLabel(found) : String(value);
    });

    let filtered = $derived.by(() => {
        const query = search.trim().toLowerCase();
        if (!query) {
            return options.slice(0, limit);
        }

        const results: (string | OptionItem)[] = [];
        for (let i = 0; i < options.length; i++) {
            const opt = options[i];
            const text = getLabel(opt).toLowerCase();
            if (text.includes(query)) {
                results.push(opt);
                if (results.length >= limit) break;
            }
        }
        return results;
    });

    function handleScroll(e: UIEvent) {
        const el = e.currentTarget as HTMLElement;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
            page += 1;
        }
    }

    function select(opt: string | OptionItem) {
        const val = getValue(opt);
        value = val;
        onchange(val);
        open = false;
    }
</script>

<Popover.Root bind:open>
    <Popover.Trigger
        type="button"
        {disabled}
        class={cn(
            buttonVariants({ variant: 'outline' }),
            'h-8 w-full justify-between px-2.5 text-xs font-normal',
            className,
        )}
    >
        <span class="truncate">{selectedLabel || placeholder}</span>
        <ChevronsUpDown class="ml-2 size-3.5 shrink-0 opacity-50" />
    </Popover.Trigger>

    <Popover.Content
        class="min-w-44 p-1 z-50"
        sideOffset={4}
        onmouseenter={() => fetchNui('disableScroll', true)}
        onmouseleave={() => fetchNui('disableScroll', false)}
    >
        <Input bind:value={search} placeholder={searchPlaceholder} />

        <div
            class="mt-1 max-h-48 overflow-y-auto overflow-x-hidden"
            onscroll={handleScroll}
        >
            {#if filtered.length === 0}
                <div class="text-muted-foreground py-2 text-center text-xs">
                    No options found.
                </div>
            {:else}
                {#each filtered as opt, i (`${getLabel(opt)}-${getValue(opt)}-${i}`)}
                    <button
                        type="button"
                        onclick={() => select(opt)}
                        class={cn(
                            'hover:bg-accent hover:text-accent-foreground flex w-full cursor-pointer items-center justify-between px-2 py-1.5 text-left text-xs outline-none transition-colors rounded-none',
                            String(value) === String(getValue(opt)) &&
                                'bg-accent/50 font-medium',
                        )}
                    >
                        <span class="truncate text-foreground"
                            >{getLabel(opt)}</span
                        >
                        <Check
                            class={cn(
                                'ml-2 size-3.5 shrink-0',
                                String(value) === String(getValue(opt))
                                    ? 'opacity-100'
                                    : 'opacity-0',
                            )}
                        />
                    </button>
                {/each}
            {/if}
        </div>
    </Popover.Content>
</Popover.Root>
