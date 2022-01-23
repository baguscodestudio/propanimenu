local menu = MenuV:CreateMenu('Prop & Animation Menu', 'BagusCodeStudio', 'topright', 255, 0, 0, 'size-100', 'default', 'menuv', 'animation_menu', 'native')
local find = string.find
local nuiOpen = false
local index, searching, currentProp, currentBone, xpos, ypos, zpos, xrot, yrot, zrot = 1, false, '', 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
local searchingString = ""
local spawnedProp = nil

function SendNotification(text)
    BeginTextCommandThefeedPost('STRING')
    AddTextComponentString(text)
    EndTextCommandThefeedPostTicker(true, true)
end

RotationToDirection = function(rotation)
    -- https://github.com/Risky-Shot/new_banking/blob/main/new_banking/client/client.lua
	local adjustedRotation =
	{
		x = (math.pi / 180) * rotation.x,
		y = (math.pi / 180) * rotation.y,
		z = (math.pi / 180) * rotation.z
	}
	local direction =
	{
		x = -math.sin(adjustedRotation.z) * math.abs(math.cos(adjustedRotation.x)),
		y = math.cos(adjustedRotation.z) * math.abs(math.cos(adjustedRotation.x)),
		z = math.sin(adjustedRotation.x)
	}
	return direction
end

RayCastGamePlayCamera = function(distance)
    -- https://github.com/Risky-Shot/new_banking/blob/main/new_banking/client/client.lua
    local cameraRotation = GetGameplayCamRot()
	local cameraCoord = GetGameplayCamCoord()
	local direction = RotationToDirection(cameraRotation)
	local destination =
	{
		x = cameraCoord.x + direction.x * distance,
		y = cameraCoord.y + direction.y * distance,
		z = cameraCoord.z + direction.z * distance
	}
	local a, b, c, d, e = GetShapeTestResult(StartShapeTestRay(cameraCoord.x, cameraCoord.y, cameraCoord.z, destination.x, destination.y, destination.z, -1, PlayerPedId(), 0))
	return b, c, e
end

function DrawText3D(x, y, z, text, scale, r, g, b, a) 
    local onScreen, _x, _y = World3dToScreen2d(x, y, z) 
    local pX, pY, pZ = table.unpack(GetGameplayCamCoords()) 
	local dist = #(vector3(pX,pY,pZ) - vector3(x,y,z))
	local scale = (1/dist)*2
	local fov = (1/GetGameplayCamFov())*100
	local scale = scale * fov
	if onScreen then
		SetTextScale(0.0*scale, 0.50*scale) 
		SetTextFont(0) 
		SetTextProportional(1) 
		SetTextEntry("STRING") 
		SetTextCentre(true) 
		SetTextOutline()
		SetTextColour(r, g, b, a) 
		AddTextComponentString(text) 
		DrawText(_x, _y) 
	end
end

local function GoUpInAnimations(deepness)
	deepness = deepness or 1

	if index == 1 then
		index = #Animations
	else
		index = index - 1
	end

	if deepness <= #Animations then
		if searching then
			if not find(Animations[index][1]..Animations[index][2], searchingString) then
				GoUpInAnimations(deepness + 1)
			end
		end
	else
		SendNotification("~r~~h~ERROR ~h~~w~: No results found. Your research parameter got deleted.")
		searching = false
		searchingString = ""
	end
end

local function GoDownInAnimations(deepness)
	deepness = deepness or 1

	if index == #Animations then
		index = 1
	else
		index = index + 1
	end

	if deepness <= #Animations then
		if searching then
			if not find(Animations[index][1]..Animations[index][2], searchingString) then
				GoDownInAnimations(deepness + 1)
			end
		end
	else
		SendNotification("~r~~h~ERROR ~h~~w~: No results found. Your research parameters got deleted.")
		searching = false
		searchingString = ""
	end
end

local function PlayAnimation()
	local playerPed = PlayerPedId()
	RequestAnimDict(Animations[index][1])
	local j = 0
	while not HasAnimDictLoaded(Animations[index][1]) and j <= 50 do 
		Citizen.Wait(100)
		j = j + 1
	end

	if j >= 50 then
		SendNotification("~r~~h~ERROR ~h~~w~: The animation dictionnary took too long to load.")
	else
		TaskPlayAnim(playerPed, Animations[index][1], Animations[index][2], 8.0, 1.0, -1, 1)
		RemoveAnimDict(Animations[index][1])
	end
end

local function SearchAnimation()
	local data = exports.ox_inventory:Keyboard("Animation", {"Search string"})
    if data then
		searchingString = data[1]:lower()
		searching = searchingString ~= "" and searchingString ~= nil
    end
end

local function CancelAnimation()
	ClearPedTasksImmediately(PlayerPedId())
end

function CopyClipboard()
	local text = "local playerPed = PlayerPedId()\nlocal prop = GetHashKey('"..currentProp.."')\n"
	text = text..'RequestModel(prop)\n'
	text = text..'while not HasModelLoaded(prop) do\n'
	text = text..'\tWait(100)\nRequestModel(prop)\nend\n'
	text = text..'local spawnedProp = CreateObject(prop, GetEntityCoords(playerPed), true, true, true)\n'
	text = text..'AttachEntityToEntity(spawnedProp, playerPed, GetPedBoneIndex(playerPed, '..currentBone..'), '..xpos..', '..ypos..', '..zpos..', '..xrot..', '..yrot..', '..zrot..', true, true, true, false, 1, true)\n'
	text = text..'RequestAnimDict("'..Animations[index][1]..'")\n'
	text = text..'while not HasAnimDictLoaded("'..Animations[index][1]..'") do\n'
	text = text..'Wait(100)\nend\n'
	text = text..'TaskPlayAnim(playerPed, "'..Animations[index][1]..'", "'..Animations[index][2]..'", 8.0, 1.0, -1, 49)\n'
	text = text..'RemoveAnimDict("'..Animations[index][1]..'")'

	SetNuiFocus(true, true)
	SendNUIMessage({
		action="copyClipboard",
		data = {
			text=text
		}
	})
	Wait(150)
	SetNuiFocus(false, false)

end

RegisterNUICallback('hideFrame', function(data, cb)
	nuiOpen = false
	SetNuiFocus(false, false)
	cb(1)
end)

RegisterNUICallback('setPropData', function(data, cb)
	currentProp = data.prop
	currentBone = tonumber(data.bone)
	xpos = tonumber(data.xpos)
	ypos = tonumber(data.ypos)
	zpos = tonumber(data.zpos)
	xrot = tonumber(data.xrot)
	yrot = tonumber(data.yrot)
	zrot = tonumber(data.zrot)
	if spawnedProp then
		AttachEntityToEntity(spawnedProp, PlayerPedId(), GetPedBoneIndex(PlayerPedId(), currentBone), xpos, ypos, zpos, xrot, yrot, zrot, true, true, true, false, 1, true)
	end
	UpdateInfoText()
	cb(1)
end)

RegisterCommand('propstuck', function()
    for k, v in pairs(GetGamePool('CObject')) do
        if IsEntityAttachedToEntity(PlayerPedId(), v) then
            SetEntityAsMissionEntity(v, true, true)
            DeleteObject(v)
            DeleteEntity(v)
        end
    end
end)

RegisterNUICallback('deleteProp', function(data, cb)
	spawnedProp = nil
	for k, v in pairs(GetGamePool('CObject')) do
        if IsEntityAttachedToEntity(PlayerPedId(), v) then
            SetEntityAsMissionEntity(v, true, true)
            DeleteObject(v)
            DeleteEntity(v)
        end
    end
	cb(1)
end)

RegisterNUICallback('spawnProp', function(data,cb)
	cb(1)
	local prop = GetHashKey(data.prop)
	RequestModel(prop)
	while not HasModelLoaded(prop) do
		Citizen.Wait(100)
		RequestModel(prop)
	end
	spawnedProp = CreateObject(prop, GetEntityCoords(GetPlayerPed(-1)), true, true, true)
	AttachEntityToEntity(spawnedProp, GetPlayerPed(-1), GetPedBoneIndex(GetPlayerPed(-1), currentBone), xpos, ypos, zpos, xrot, yrot, zrot, true, true, true, false, 1, true)
end)

RegisterNUICallback('setBone', function(data, cb)
	currentBone = data.bone
	cb(1)
end)

function toggleNUI()
	if nuiOpen then
		SetNuiFocus(false, false)
	else
		SetNuiFocus(true, true)
	end
	nuiOpen = not nuiOpen
end

RegisterCommand('propmenu', toggleNUI)

RegisterNUICallback('toggleNui', function(data,cb)
	toggleNUI()
	cb(1)
end)

RegisterNUICallback('getCurrentProp', function(data, cb)
	cb({
		prop=currentProp,
		bone=currentBone,
		xpos = tonumber(xpos),
		ypos = tonumber(ypos),
		zpos = tonumber(zpos),
		xrot = tonumber(xrot),
		yrot = tonumber(yrot),
		zrot = tonumber(zrot),
	})
end)

function UpdateInfoText()
	SendNUIMessage({
		action='setAnimPropData',
		data={
			animindex="Animation n°" .. index .. " :",
			anim=Animations[index][1] .. " / " .. Animations[index][2],
			prop=currentProp,
			bone=currentBone
		}
	})
end

CreateThread(function()
	while true do
		InvalidateIdleCam()
        InvalidateVehicleIdleCam()
	    Wait(5000)
	end
end)

RegisterCommand('propanimation', function()
	menu:ClearItems()
	local propmenu = menu:AddButton({label='Prop Menu', description='Open Prop menu'})
	local up = menu:AddButton({label= "Up", description="Go up in animations"})
	local down = menu:AddButton({label= "Down", description="Go down in animations"})
	local play = menu:AddButton({label= "Play Animation", description="Play animation"})
	local search = menu:AddButton({label= "Search animation", description="Search for an animation"})
	local cancel = menu:AddButton({label= "Cancel animation", description="Cancel or stop current animation"})
	local copyinfo = menu:AddButton({label= "Copy Codes", description="Copy current animation and prop to clipboard"})
	local closeinfo = menu:AddButton({label= "Close Info", description='Closes text information on screen'})
	
	closeinfo:On('select', function()
		SendNUIMessage({
			action='displayInfo',
			data=false
		})
	end)
	propmenu:On('select', function()
		SetNuiFocus(true, true)
		nuiOpen = true
		SendNUIMessage({
			action='displayFrame',
			data=true
		})
		menu:Close()
	end)
	up:On('select', function() GoUpInAnimations() UpdateInfoText() end)
	down:On('select', function() GoDownInAnimations() UpdateInfoText() end)
	play:On('select', function() PlayAnimation() end)
	search:On('select', function() SearchAnimation() end)
	cancel:On('select', function() CancelAnimation() end)
	copyinfo:On('select', function() 
		CopyClipboard() 
	end)
	
	menu:Open()
	SendNUIMessage({
		action='displayInfo',
		data=true
	})
	menu:On('close', function()
		isOpen = false
	end)
end)

RegisterCommand('raycastView', function()
	casting = true
	exports['hud']:displayHelp('Tekan E untuk berhenti raycast')
	while casting do
		local _ped = PlayerPedId()
		local _coords = GetEntityCoords(_ped)
		local hit, coords, entity = RayCastGamePlayCamera(1000.0)
		
		DrawLine(_coords, coords, 255, 0, 0, 255)
		
		local text = 'x:'..coords.x..'\ny:'..coords.y..'\nz:'..coords.z
		if hit == 1 and GetEntityType(entity) ~= 0 and IsEntityAnObject(entity) then
		 	entity = GetEntityModel(entity)
		end
		text = text..'\nentity:'..entity

		DrawText3D(coords.x, coords.y, coords.z, text, 0.10, 255, 255, 255, 255)
		
		if IsControlJustReleased(0, 38) then
			exports['hud']:closeHelp()
			casting = false
		elseif IsControlJustReleased(0,73) then
			print(text)
		end
		Wait(5)
	end
end)