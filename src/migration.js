import {settingsKey} from "./settings.js";

const currentDataVersion = "1.1.0";

export function performMigrations() {
	if (!game.user.isGM) return;

	let dataVersion = game.settings.get(settingsKey, "dataVersion");
	if (dataVersion === "fresh install") {
		game.settings.set(settingsKey, "dataVersion", currentDataVersion);
		return;
	}

	if (dataVersion === "1.0.0") {
		dataVersion = "1.1.0";
		ui.notifications.info(
			game.i18n.format("smart-doors.ui.messages.migrating", {version: dataVersion}),
		);

		// Make a dictionary that maps all door ids to their scenes
		const walls = game.scenes.reduce((dict, scene) => {
			scene.walls.forEach(wall => {
				if (wall.door !== CONST.WALL_DOOR_TYPES.NONE) dict[wall.id] = scene.id;
			});
			return dict;
		}, {});

		// Migrate all messages that have a (wall) source id
		game.messages.forEach(async message => {
			const wallId = message.flags.smartdoors?.sourceId;
			if (!wallId) return;
			const flags = message.flags;
			delete flags.smartdoors.sourceId;
			const scene = walls[wallId];
			// If there is no wall with this id anymore we can drop the value. It has no purpose anymore
			if (!scene) {
				if (!message.flags.smartdoors) delete flags.smartdoors;
			} else {
				// Assign the id and the scene id to the new data structure
				flags.smartdoors.source = {wall: wallId, scene: scene};
			}

			// We have to disable recursive here so deleting keys will actually work
			message.update({flags: flags}, {diff: false, recursive: false});
		});

		game.settings.set(settingsKey, "dataVersion", dataVersion);
		ui.notifications.info(
			game.i18n.format("smart-doors.ui.messages.migrationDone", {version: dataVersion}),
		);
	}
	if (dataVersion !== currentDataVersion)
		ui.notifications.error(
			game.i18n.format("smart-doors.ui.messages.unknownVersion", {version: dataVersion}),
			{permanent: true},
		);
}
