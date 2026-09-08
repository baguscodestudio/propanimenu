<script lang="ts">
    import { useNuiEvent } from '$lib/hooks/use-nuievent';
    import { fetchNui } from '$lib/fetch-nui';
    import { Button } from '$lib/components/ui/button';
    import {
        Card,
        CardHeader,
        CardTitle,
        CardDescription,
        CardContent,
        CardFooter,
    } from '$lib/components/ui/card';
    import { cn } from '$lib/utils';
    import SearchableSelect from '$lib/components/searchable-select.svelte';
    import type { Animations, Props } from '$lib/types';

    import { appState } from '$lib/states/app.svelte';
    import { animations, propsList, PED_BONES } from '$lib/stores/data';
    import { MOCK_ANIMATIONS, MOCK_PROPS } from '$lib/mock-data';
    import Input from '$lib/components/ui/input/input.svelte';
    import CopySnippet from '$lib/components/copy-snippet.svelte';
    import { X } from 'lucide-svelte';

    let selectedAnim = $state({ dict: '', name: '' });
    let selectedModel = $state('');
    let selectedBone = $state<number>(0);
    let coords = $state({ x: 0, y: 0, z: 0 });
    let rot = $state({ x: 0, y: 0, z: 0 });
    let coordsStep = $state(0.01);
    let rotStep = $state(1.0);
    let showCopyDialog = $state(false);

    useNuiEvent<boolean>('setVisible', (data) => {
        appState.setVisible(data);
    });

    function handleClose() {
        appState.setVisible(false);
        fetchNui('close');
    }

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Escape' && appState.visible) {
            handleClose();
        }
    }

    $effect(() => {
        if (appState.visible) {
            if ($animations.length === 0 || $propsList.length === 0) {
                fetchNui<{ animations: Animations; props: Props }>(
                    'getData',
                    null,
                    {
                        delay: 500,
                        data: {
                            animations: MOCK_ANIMATIONS,
                            props: MOCK_PROPS,
                        },
                    },
                ).then((data) => {
                    if (data) {
                        $animations = data.animations.map(
                            ([dict, anim]) => `${dict} | ${anim}`,
                        );
                        selectedAnim = {
                            dict: data.animations[0][0],
                            name: data.animations[0][1],
                        };

                        $propsList = data.props;
                        selectedModel = data.props[0];
                    }
                });
            }
        }
    });

    $effect(() => {
        if (appState.visible) {
            fetchNui('setData', {
                anim: selectedAnim,
                bone: selectedBone,
                model: selectedModel,
                coords: coords,
                rot: rot,
            });
        }
    });
</script>

<svelte:window onkeydown={handleKeyDown} />

{#if appState.visible}
    <Card class={cn('absolute top-1/2 left-10 -translate-y-1/2', 'w-100')}>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
            <div>
                <CardTitle>Prop Menu</CardTitle>
                <CardDescription>-</CardDescription>
            </div>
            <Button
                variant="ghost"
                size="icon-xs"
                class="size-6 -mr-2 -mt-2 text-muted-foreground hover:text-foreground"
                onclick={handleClose}
            >
                <X class="size-4" />
            </Button>
        </CardHeader>
        <CardContent class="flex flex-col gap-2">
            <SearchableSelect
                options={$animations}
                value={selectedAnim.dict
                    ? `${selectedAnim.dict} | ${selectedAnim.name}`
                    : ''}
                placeholder="Select Animation..."
                searchPlaceholder="Search animation..."
                onchange={(val: string) => {
                    if (!val) {
                        selectedAnim = { dict: '', name: '' };
                        return;
                    }
                    const [dict, name] = val.split(' | ');
                    selectedAnim = { dict: dict ?? '', name: name ?? '' };
                }}
            />
            <SearchableSelect
                options={$propsList}
                bind:value={selectedModel}
                placeholder="Select Prop..."
                searchPlaceholder="Search prop..."
            />
            <SearchableSelect
                options={PED_BONES}
                bind:value={selectedBone}
                placeholder="Select Bone..."
                searchPlaceholder="Search bone..."
            />

            <div class="flex items-center justify-between text-xs text-muted-foreground">
                <span>Coords</span>
                <div class="flex items-center gap-1.5">
                    <span>Step:</span>
                    <Input
                        type="number"
                        step={0.001}
                        min={0.001}
                        class="h-6 w-18 text-xs px-1.5 py-0"
                        bind:value={coordsStep}
                    />
                </div>
            </div>
            <div class="grid grid-cols-3 gap-2">
                {#each Object.keys(coords) as (keyof typeof coords)[] as value}
                    <Input
                        type="number"
                        step={coordsStep || 0.01}
                        placeholder={value.toUpperCase()}
                        bind:value={coords[value]}
                    />
                {/each}
            </div>

            <div class="flex items-center justify-between text-xs text-muted-foreground">
                <span>Rotation</span>
                <div class="flex items-center gap-1.5">
                    <span>Step:</span>
                    <Input
                        type="number"
                        step={0.1}
                        min={0.01}
                        class="h-6 w-18 text-xs px-1.5 py-0"
                        bind:value={rotStep}
                    />
                </div>
            </div>
            <div class="grid grid-cols-3 gap-2">
                {#each Object.keys(rot) as (keyof typeof rot)[] as value}
                    <Input
                        type="number"
                        step={rotStep || 1.0}
                        placeholder={value.toUpperCase()}
                        bind:value={rot[value]}
                    />
                {/each}
            </div>
        </CardContent>
        <CardFooter class="flex justify-end gap-2">
            <Button
                variant="outline"
                onclick={() => {
                    fetchNui('stopAnimation');
                }}>Stop Animation</Button
            >
            <Button
                onclick={() => {
                    fetchNui('playAnimation');
                }}>Play Animation</Button
            >
            <Button
                onclick={() => {
                    showCopyDialog = true;
                }}>Copy Snippet</Button
            >
        </CardFooter>
    </Card>

    <CopySnippet
        bind:open={showCopyDialog}
        anim={selectedAnim}
        model={selectedModel}
        bone={selectedBone}
        {coords}
        {rot}
    />
{/if}

