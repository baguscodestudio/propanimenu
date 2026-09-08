<script lang="ts">
    import { cn } from '$lib/utils.js';
    import type { WithElementRef } from '$lib/utils.js';
    import type { HTMLInputAttributes } from 'svelte/elements';

    export type InputProps = WithElementRef<HTMLInputAttributes>;

    let {
        ref = $bindable(null),
        value = $bindable(),
        class: className,
        type = 'text',
        ...restProps
    }: InputProps = $props();
</script>

<input
    bind:this={ref}
    bind:value
    {type}
    data-slot="input"
    class={cn(
        'border-input bg-muted/40 text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex h-8 w-full min-w-0 border px-2.5 py-1 text-xs shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-1 aria-invalid:ring-1',
        className,
    )}
    {...restProps}
/>
