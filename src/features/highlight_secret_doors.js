import { settingsKey } from "../settings.js";

const SECRET_DOOR_TINT = 0x888888;

// Tint all secret doors dark grey
export function onCanvasReady(currentCanvas) {
	if (game.settings.get(settingsKey, "highlightSecretDoors")) {
		const secretDoors = canvas.controls.doors.children.filter(
			control => control.wall.document.door === CONST.WALL_DOOR_TYPES.SECRET,
		);
		secretDoors.forEach(control => (control.icon.tint = SECRET_DOOR_TINT));
	}
}

// If door type has been changed, tint the door accordingly
export function onUpdateWall(wall, update, options) {
	if (!game.settings.get(settingsKey, "highlightSecretDoors")) return;
	const TYPES = CONST.WALL_DOOR_TYPES;
	if (wall.door === TYPES.NONE) return;
	// Find the door control corresponding to the changed door
	const changedDoor = canvas.controls.doors.children.find(control => control.wall.id === wall.id);
	// If the changed door doesn't have a control it's not on this scene - ignore it
	if (!changedDoor) return;
	// The wall object we got passed might be from another scene so we replace it with the door from the current scene
	wall = changedDoor.wall;
	if (wall.document.door === TYPES.DOOR)
		changedDoor.icon.tint = 0xffffff;
	else if (wall.document.door === TYPES.SECRET)
		changedDoor.icon.tint = SECRET_DOOR_TINT;
	else
		console.warn(
			"Smart Doors | Encountered unknown door type " +
			wall.door +
			" while highlighting secret doors.",
		);
}
