# propanimenu

Prop and Animation developer tool

## Dependencies

[**menuv**](https://github.com/ThymonA/menuv/)

[**nh-keyboard**](https://github.com/baguscodestudio/nh-keyboard) a fork of nerohiro version with before keyup update

## Usage

### Commands

**/propanimation** Opens the menu

**/propmenu** toggles back nui focus after pressing toggle nui button

After choosing and inputting all the information you can use _Copy Codes_ in the menu.
An example of a copied information

```lua
local playerPed = PlayerPedId()
local prop = GetHashKey('prop_leaf_blower_01')
RequestModel(prop)
while not HasModelLoaded(prop) do
  Wait(100)
  RequestModel(prop)
end
local spawnedProp = CreateObject(prop, GetEntityCoords(playerPed), true, true, true)
AttachEntity(spawnedProp, playerPed, GetPedBoneIndex(playerPed, 28422), 0.05, 0, 0, 0, 0, 0, true, true, true, false, 1, true)
RequestAnimDict("amb@code_human_wander_gardener_leaf_blower@base")
while not HasAnimDictLoaded("amb@code_human_wander_gardener_leaf_blower@base") do
  Wait(100)
end
TaskPlayAnimc(playerPed, "amb@code_human_wander_gardener_leaf_blower@base", "static", 8.0, 1.0, -1, 1)
RemoveAnimDict("amb@code_human_wander_gardener_leaf_blower@base")
```

## Screenshots & Preview

https://youtu.be/XLlStooJ5S4 (Laggy Video)

![preview1](https://cdn.discordapp.com/attachments/351377961011904512/917335815498113044/unknown.png)
![preview2](https://cdn.discordapp.com/attachments/351377961011904512/917335815846256640/unknown.png)

### Credits

@[ThymonA](https://github.com/ThymonA/menuv/) for menuv

@[eblio](https://github.com/eblio/animenu) for converting the animation list and basic codes for animation

@[AnDylek](https://forum.cfx.re/t/paid-dev-tool-prop-attach-to-ped-tool/4782266) for inspiration
