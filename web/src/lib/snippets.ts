export interface SnippetParams {
    anim: { dict: string; name: string };
    model: string;
    bone: number;
    coords: { x: number; y: number; z: number };
    rot: { x: number; y: number; z: number };
}

export interface SnippetOption {
    id: 'native' | 'progress';
    label: string;
    generate: (params: SnippetParams) => string;
}

function formatNumber(num: number): string {
    return Number.isInteger(num) ? `${num}.0` : `${num}`;
}

export const nativeSnippet = (params: SnippetParams): string => `local ped = PlayerPedId()
local model = GetHashKey('${params.model}')
local animDict = '${params.anim.dict}'
local animName = '${params.anim.name}'

RequestModel(model)
while not HasModelLoaded(model) do
    Wait(10)
end

RequestAnimDict(animDict)
while not HasAnimDictLoaded(animDict) do
    Wait(10)
end

local coords = GetEntityCoords(ped)
local obj = CreateObject(model, coords.x, coords.y, coords.z, true, true, true)
AttachEntityToEntity(
    obj,
    ped,
    GetPedBoneIndex(ped, ${params.bone}),
    ${formatNumber(params.coords.x)}, ${formatNumber(params.coords.y)}, ${formatNumber(params.coords.z)},
    ${formatNumber(params.rot.x)}, ${formatNumber(params.rot.y)}, ${formatNumber(params.rot.z)},
    true, true, false, true, 1, true
)

TaskPlayAnim(ped, animDict, animName, 8.0, -8.0, -1, 49, 0, false, false, false)
RemoveAnimDict(animDict)
SetModelAsNoLongerNeeded(model)`;

export const oxLibProgressSnippet = (params: SnippetParams): string => `if lib.progressBar({
    duration = 5000,
    label = 'Action...',
    useWhileDead = false,
    canCancel = true,
    disable = {
        car = true,
        move = true,
    },
    anim = {
        dict = '${params.anim.dict}',
        clip = '${params.anim.name}',
        flag = 49,
    },
    prop = {
        model = \`${params.model}\`,
        bone = ${params.bone},
        pos = vec3(${formatNumber(params.coords.x)}, ${formatNumber(params.coords.y)}, ${formatNumber(params.coords.z)}),
        rot = vec3(${formatNumber(params.rot.x)}, ${formatNumber(params.rot.y)}, ${formatNumber(params.rot.z)}),
    },
}) then
    print('Done')
else
    print('Cancelled')
end`;

export const SNIPPET_OPTIONS: SnippetOption[] = [
    {
        id: 'native',
        label: 'Native',
        generate: nativeSnippet,
    },
    {
        id: 'progress',
        label: 'ox_lib Progress',
        generate: oxLibProgressSnippet,
    },
];

export function copySnippet(
    type: SnippetOption['id'],
    params: SnippetParams,
): string {
    const snippet = SNIPPET_OPTIONS.find((s) => s.id === type);
    return snippet ? snippet.generate(params) : '';
}
