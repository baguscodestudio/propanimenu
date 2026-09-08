<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";

	export const badgeVariants = tv({
		base: "inline-flex select-none items-center justify-center rounded-md border px-2 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-1 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all",
		variants: {
			variant: {
				default: "border-transparent bg-primary text-primary-foreground shadow-xs [a&]:hover:bg-primary/90",
				secondary: "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
				destructive: "border-transparent bg-destructive text-white shadow-xs [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
				outline: "text-foreground border-border [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	});

	export type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];
</script>

<script lang="ts">
	import { cn } from "$lib/utils.js";
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAnchorAttributes, HTMLAttributes } from "svelte/elements";

	export type BadgeProps = WithElementRef<HTMLAttributes<HTMLDivElement>> &
		WithElementRef<HTMLAnchorAttributes> & {
			variant?: BadgeVariant;
		};

	let {
		ref = $bindable(null),
		href,
		class: className,
		variant = "default",
		children,
		...restProps
	}: BadgeProps = $props();
</script>

{#if href}
	<a
		bind:this={ref}
		{href}
		class={cn(badgeVariants({ variant }), className)}
		{...restProps}
	>
		{@render children?.()}
	</a>
{:else}
	<div
		bind:this={ref}
		class={cn(badgeVariants({ variant }), className)}
		{...restProps}
	>
		{@render children?.()}
	</div>
{/if}
