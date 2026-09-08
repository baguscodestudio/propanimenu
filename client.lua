---@diagnostic disable-next-line
lib, cache = lib, cache
local object, model, propCoords, propRotation, bone, anim = nil, '', nil, nil, 0, nil

function HelpText(show, message)
	if show then
		lib.showTextUI(message)
	else
		lib.hideTextUI()
	end
end

function Notify(title, message, type, duration)
	lib.notify({ title = title, description = message, type = type, duration = duration })
end

function DrawText3D(x, y, z, text, scale, r, g, b, a)
	local onScreen, _x, _y = World3dToScreen2d(x, y, z)
	local pX, pY, pZ = table.unpack(GetGameplayCamCoords())
	local dist = #(vector3(pX, pY, pZ) - vector3(x, y, z))
	scale = (1 / dist) * 2
	local fov = (1 / GetGameplayCamFov()) * 100
	scale = scale * fov
	if onScreen then
		SetTextScale(0.0 * scale, 0.50 * scale)
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

function Stop()
	if object and DoesEntityExist(object) then
		DeleteEntity(object)
	end
	ClearPedTasksImmediately(cache.ped)
	object = nil
	model = ''
end

RegisterCommand('propstuck', function()
	for k, v in pairs(GetGamePool('CObject')) do
		if IsEntityAttachedToEntity(PlayerPedId(), v) then
			SetEntityAsMissionEntity(v, true, true)
			DeleteObject(v)
			DeleteEntity(v)
		end
	end
end, false)

function SetVisible(value)
	SetNuiFocus(value, value)
	SendNUIMessage({
		action = 'setVisible',
		data = value,
	})
end

CreateThread(function()
	while true do
		InvalidateIdleCam()
		InvalidateVehicleIdleCam()
		Wait(5000)
	end
end)

RegisterCommand("propanimation", function()
	Visible = not Visible
	SetVisible(Visible)
end, false)

RegisterNuiCallback("close", function(data, cb)
	Visible = false
	SetVisible(false)
	Stop()
	cb(true)
end)

RegisterNuiCallback("getData", function(data, cb)
	cb({
		animations = Animations,
		props = Props,
	})
end)

RegisterNuiCallback("setData", function(data, cb)
	local coords = GetEntityCoords(cache.ped)
	propCoords = vec3(data.coords.x, data.coords.y, data.coords.z)
	propRotation = vec3(data.rot.x, data.rot.y, data.rot.z)
	bone = data.bone
	anim = data.anim

	if not object or model ~= data.model then
		model = data.model

		if object and DoesEntityExist(object) then
			DeleteEntity(object)
		end
		lib.requestModel(model)
		object = CreateObject(model, coords.x, coords.y, coords.z, true, true, true)
		SetModelAsNoLongerNeeded(model)
		SetEntityDrawOutline(object, true)
	end

	if propCoords and propRotation then
		AttachEntityToEntity(object, cache.ped, GetPedBoneIndex(cache.ped, bone), propCoords.x, propCoords.y,
			propCoords.z, propRotation.x, propRotation.y, propRotation.z, true, true, true, false, 1, true)
	end

	cb(true)
end)

RegisterNuiCallback("playAnimation", function(data, cb)
	if anim then
		local dict = anim.dict
		local name = anim.name
		lib.requestAnimDict(anim.dict)
		lib.playAnim(cache.ped, dict, name, 8.0, 1.0, -1, 49, 0, 0, 0, 0)
		RemoveAnimDict(dict)
	end
end)

RegisterNuiCallback("stopAnimation", function(data, cb)
	ClearPedTasksImmediately(cache.ped)
end)

RegisterCommand('raycastView', function()
	HelpText(true, 'Press E to stop raycast')
	while true do
		local hit, entityHit, endCoords, surfaceNormal, materialHash = lib.raycast.fromCamera(nil, nil, 1000.0)
		local coords = GetEntityCoords(cache.ped)

		local text = 'x:' .. coords.x .. '\ny:' .. coords.y .. '\nz:' .. coords.z
		if hit == 1 and GetEntityType(entityHit) ~= 0 and IsEntityAnObject(entityHit) then
			entityHit = GetEntityModel(entityHit)
		end
		text = text .. '\nentity:' .. entityHit

		if hit then
			DrawText3D(coords.x, coords.y, coords.z, text, 0.10, 255, 255, 255, 255)
		end

		DrawLine(coords.x, coords.y, coords.z, endCoords.x, endCoords.y, endCoords.z, 255, 0, 0, 255)

		if IsControlJustReleased(0, 38) then
			print(text)
			break
		end
	end
	HelpText(false, '')
end, false)

AddEventHandler('onResourceStop', function(resource)
	if resource == GetCurrentResourceName() then
		Stop()
	end
end)
