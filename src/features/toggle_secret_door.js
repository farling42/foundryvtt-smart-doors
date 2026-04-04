import { toggleSecretDoor } from "../keybindings.js";
import { settingsKey } from "../settings.js";
import { updateSynchronizedDoors } from "./synchronized_doors.js";

// Toggles between normal and secret doors
export function onDoorLeftClick() {
	// We don't trust the event to be filled with the expected data for compatibilty with arms reach (which passes a broken event)
	if (!toggleSecretDoor || !game.user.isGM) return false;

	const TYPES = CONST.WALL_DOOR_TYPES;
	const updateData = { door: this.wall.document.door === TYPES.DOOR ? TYPES.SECRET : TYPES.DOOR };
	const synchronizationGroup = this.wall.document.flags.smartdoors?.synchronizationGroup;
	if (game.settings.get(settingsKey, "synchronizedDoors") &&
		synchronizationGroup &&
		this.wall.document.flags.smartdoors?.synchronizeSecretStatus)
		updateSynchronizedDoors(synchronizationGroup, updateData);
	else
		this.wall.document.update(updateData);

	return true;
}
