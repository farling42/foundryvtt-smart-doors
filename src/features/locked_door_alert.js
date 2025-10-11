import { settingsKey } from "../settings.js";

// Tint the source door red when a locked alert is hovered
export function onRenderChatMessage(message, html, data) {
    // Tint the door that generated this message
    const source = message.flags.smartdoors?.source;
    if (!source) return;

    // Tint on mouse enter
    const mouseEnter = function () {
        const sourceDoor = canvas.controls.doors.children.find(
            door => door.wall.id === source.wall && door.wall.scene.id === source.scene,
        );
        if (sourceDoor) sourceDoor.icon.tint = 0xff0000;
    };
    html.on("mouseenter", mouseEnter);

    // Remove tint on mouse leave
    const mouseLeave = function () {
        const sourceDoor = canvas.controls.doors.children.find(
            door => door.wall.id === source.wall && door.wall.scene.id === source.scene,
        );
        if (sourceDoor) sourceDoor.icon.tint = 0xffffff;
    };
    html.on("mouseleave", mouseLeave);

    // Localize the message
    html.find(".message-content")[0].innerText = game.i18n.localize("smart-doors.ui.lockedDoorAlert");
}

// Creates a chat message stating that a player tried to open a locked door
export function onDoorLeftClick() {
    // Check if this feature is enabled
    if (!game.settings.get(settingsKey, "lockedDoorAlert")) return false;

    // Only create messages when the door is locked.
    if (this.wall.document.ds !== CONST.WALL_DOOR_STATES.LOCKED) return false;

    // Generate no message if the gm attempts to open the door
    if (game.user.isGM) return false;

    
    // Use logic from Wall._playDoorSound to pick correct sound to play for all clients.
    const doorSound = CONFIG.Wall.doorSounds[this.wall.document.doorSound];
    let sounds = doorSound?.['test'];
    if ( sounds && !Array.isArray(sounds) ) 
        sounds = [sounds];
    else if ( !sounds?.length )
      sounds = [CONFIG.sounds.lock];
    const sound = sounds[Math.floor(Math.random() * sounds.length)];

    // Create and send the chat message
    const message = {
        user    : game.user.id,
        content : game.i18n.localize("smart-doors.ui.lockedDoorAlert"),
        sound   : sound,
        flags   : { smartdoors: { source: { wall: this.wall.id, scene: this.wall.scene.id } } }
    };
    if (game.user.character) message.speaker = { actor: game.user.character };
    ChatMessage.create(message);
    return true;
}
