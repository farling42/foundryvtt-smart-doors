import {libWrapper} from "../../lib/libwrapper_shim.js";
import {settingsKey} from "../settings.js";

// Adjust the repositioning formula for the door controls
export function hookDoorControlReposition() {
	libWrapper.register(
		"smart-doors",
		`foundry.canvas.containers.DoorControl.prototype.reposition`,
		function () {
			let gridSize = this.wall.scene.grid.size;
			gridSize *= game.settings.get(settingsKey, "doorControlSizeFactor");
			const pos = this.wall.midpoint.map(p => p - gridSize * 0.2);
			this.position.set(...pos);
		},
		"OVERRIDE",
	);
}

// Set the size of all door controls in relation to the grid size so it'll have a constant percieved size
export function onCanvasReady(currentCanvas) {
	const doors = currentCanvas.controls.doors.children;
	doors.forEach(control => fixDoorControlSize(control));
}

// Set the size of the door control in relation to the grid size so it'll have a constant percieved size
export function onDoorControlPostDraw() {
	// If the canvas isn't ready we'll do this after the "canvasReady" event is fired instead
	if (!canvas.ready) return;

	fixDoorControlSize(this);
}

// Resizes the door control according to the grid size
function fixDoorControlSize(control) {
    // see DoorControl.draw()
	let gridSize = control.wall.scene.grid.size;
	gridSize *= game.settings.get(settingsKey, "doorControlSizeFactor");
	control.icon.width = control.icon.height = gridSize * 0.4;
	control.hitArea = new PIXI.Rectangle(
		gridSize * -0.02,
		gridSize * -0.02,
		gridSize * 0.44,
		gridSize * 0.44,
	);
	control.border
		.clear()
		.lineStyle(1, 0xff5500, 0.8)
		.drawRoundedRect(
			gridSize * -0.02,
			gridSize * -0.02,
			gridSize * 0.44,
			gridSize * 0.44,
			gridSize * 0.05,
		)
		.endFill();
	control.bg
		.clear()
		.beginFill(0x000000, 1.0)
		.drawRoundedRect(
			gridSize * -0.02,
			gridSize * -0.02,
			gridSize * 0.44,
			gridSize * 0.44,
			gridSize * 0.05,
		)
		.endFill();
}
