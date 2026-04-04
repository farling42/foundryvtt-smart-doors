import { settingsKey } from "../settings.js";

// Searches through all scenes for a wall that matches the given filter criteria
function findFirstWallOfGroup(synchronizationGroup, ids) {
	// TODO The performance of this could be increased by stopping the search on the first hit
	for (const scene of game.scenes) {
		for (const wall of scene.walls) {
			// We only search for doors
			// We only want doors in the same synchronization group
			// Doors on this scene that have their id included in `ids` are currently being changed. Ignore them.
			if (wall.door !== CONST.WALL_DOOR_TYPES.NONE &&
				wall.flags.smartdoors?.synchronizationGroup === synchronizationGroup &&
				(wall.parent.id !== canvas.scene.id || !ids.includes(wall.id)))
				return wall;
		}
	}
	return undefined;
}

let wall_config_fields;

function wallConfigFields() {
	if (wall_config_fields) return wall_config_fields;

	const fields = foundry.data.fields;
	const PREFIX = `smart-doors.ui.synchronizedDoors`;
	// Create a fake DataField for the image (generic)

	wall_config_fields = new fields.SchemaField({
		//label: "Smart Doors",
		synchronizationGroup: new fields.StringField({
			label: `${PREFIX}.groupNameShort`
		}),
		synchronizeSecretStatus: new fields.BooleanField({
			label: `${PREFIX}.synchronizeSecretStatusShort`
		}),
	}, {
		// Options
	}, {
		// Context
		name: `flags.smartdoors`
	})
	return wall_config_fields;
}

// Inject settings for synchronized doors
export function onRenderWallConfig(wallConfig, html, data) {
	if (!game.settings.get(settingsKey, "synchronizedDoors")) return;
	const hidden = (data.document.door === CONST.WALL_DOOR_TYPES.NONE);

	const smartdoorsData = data.document.flags.smartdoors;

	// append another fieldset
	const fields = wallConfigFields().fields;

	const group = document.createElement("fieldset");
	group.hidden = hidden;  // WallConfig#toggleDoorOptions toggles visibility of door controls
	const legend = document.createElement("legend");
	legend.innerText = game.i18n.localize(`smart-doors.settings.synchronizedDoors.name`);
	group.append(legend);

	group.append(fields.synchronizationGroup.toFormGroup({ localize: true }, {
		value: smartdoorsData?.synchronizationGroup,
		localize: true,
	}));

	group.append(fields.synchronizeSecretStatus.toFormGroup({ localize: true }, {
		value: smartdoorsData?.synchronizeSecretStatus,
		localize: true,
	}));

	let section = html.querySelector('div.standard-form');
	section.append(group);

	// Recalculate config window height
	wallConfig.setPosition({ height: "auto" });
}

// Store our custom data from the WallConfig dialog
export async function onWallConfigUpdate(event, formData) {
	const { synchronizeSecretStatus, synchronizationGroup } = formData;
	const updateData = { flags: { smartdoors: { synchronizationGroup: synchronizationGroup } } };
	let ids = this.editTargets ?? [];
	if (ids instanceof Set) {
		ids = [...ids.map(wall => wall.id)]; // Foundry V13
	}
	if (ids.length === 0) {
		ids = [this.document.id];
	}

	// If a synchronization group is set, get the state of existing doors and assume their state
	if (synchronizationGroup) {
		// Update the synchronizeSecretStatus flag
		updateData.flags.smartdoors.synchronizeSecretStatus = synchronizeSecretStatus;

		// Transfer from an existing door in the named group, to set the correct status on this new door.    
		const doorInGroup = findFirstWallOfGroup(synchronizationGroup, ids);
		if (doorInGroup) {
			// ds is the door state in foundry
			updateData.ds = doorInGroup.ds;

			if (synchronizeSecretStatus) {
				// door is the door type in foundry
				updateData.door = doorInGroup.door;
			}
		}
	}

	// Update all the edited walls
	const updateResult = await WallDocument.updateDocuments(
		ids.map(id => { return { _id: id, ...updateData } }),
		{ parent: canvas.scene });

	// If door is synchronized, synchronize secret status among synchronized doors
	if (synchronizationGroup)
		await updateSynchronizedDoors(synchronizationGroup, updateData);

	return updateResult;
}

export function onWallConfigChange(_formConfig, event) {
	if (event.target.name === 'door') {
		const select = this.form["flags.smartdoors.synchronizationGroup"];
		select.closest("fieldset").hidden = (Number(event.target.value) === CONST.WALL_DOOR_TYPES.NONE);
	}
}

// Update the state of all synchronized doors
export function onDoorLeftClick() {
	// Check if this feature is enabled
	if (!game.settings.get(settingsKey, "synchronizedDoors")) return false;

	// Does this door have a synchronization group? If not there is nothing to do
	const synchronizationGroup = this.wall.document.flags.smartdoors?.synchronizationGroup;
	if (!synchronizationGroup) return false;

	// If the door is locked there is nothing to synchronize
	const state = this.wall.document.ds;
	const STATES = CONST.WALL_DOOR_STATES;
	if (state === STATES.LOCKED) return false;

	// Calculate new door state
	const newstate = state === STATES.CLOSED ? STATES.OPEN : STATES.CLOSED;

	// Update all doors belonging to the synchronization group
	updateSynchronizedDoors(synchronizationGroup, { ds: newstate });

	return true;
}

export function onDoorRightClick() {
	// Check if this feature is enabled
	if (!game.settings.get(settingsKey, "synchronizedDoors")) return false;

	// Does this door have a synchronization group? If not there is nothing to do
	const synchronizationGroup = this.wall.document.flags.smartdoors?.synchronizationGroup;
	if (!synchronizationGroup) return false;

	// Only the gm is allowed to lock/unlock doors
	if (!game.user.isGM) return false;

	// If the door is currently opened we cannot lock the door
	const state = this.wall.document.ds;
	const STATES = CONST.WALL_DOOR_STATES;
	if (state === STATES.OPEN) return false;

	// Calculate new door state
	const newstate = state === STATES.LOCKED ? STATES.CLOSED : STATES.LOCKED;

	// Update all doors belonging to the synchronization group
	updateSynchronizedDoors(synchronizationGroup, { ds: newstate });

	return true;
}

/**
 * Updates all doors in the specified synchronization group with the provided data
 * @param {*} synchronizationGroup [String] The name of the group to be affected
 * @param {*} updateData [Array<updates>] The updates to apply to each door in the group
 * @returns [Promise] which resolves when all doors have been updated
 */
// 
export function updateSynchronizedDoors(synchronizationGroup, updateData) {

	// Search for doors belonging to the synchronization group in all scenes.
	// Update all doors in the synchronization group.
	let promises = [];

	for (const scene of game.scenes) {
		const updates = [];
		for (const wall of scene.walls) {
			if (wall.door !== CONST.WALL_DOOR_TYPES.NONE && wall.flags.smartdoors?.synchronizationGroup === synchronizationGroup)
				updates.push({ _id: wall.id, ...updateData });
		}
		if (updates.length > 0)
			promises.push(WallDocument.updateDocuments(updates, { parent: scene }))
	}
	return Promise.all(promises);
}
