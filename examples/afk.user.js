// ==UserScript==
// @name         AFK Script
// @description  press Q to activate AFK
// @version      0.0.3
// @author       Cazka
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?domain=diep.io
// @namespace    https://greasyfork.org/users/541070
// @grant        none
// ==/UserScript==
if (!window.diepAPI) return window.alert('Please install diepAPI to use this script');

const { player, game, Vector, gamepad } = window.diepAPI;

let afkActive = false;
let afkPosition;

window.addEventListener('keydown', (e) => {
    if (e.code != 'KeyQ') return;

    afkActive = !afkActive;
    gamepad.connected = afkActive;

    if (afkActive) afkPosition = player.position;
});

game.on('frame', () => {
    if (!afkActive) return;

    const direction = Vector.subtract(afkPosition, player.position);
    const distance = Vector.len(direction);

    if (distance <= 50) {
        gamepad.x = 0;
        gamepad.y = 0;
        return;
    }

    //max speed
    const velocity = Vector.scale(1 / distance, direction);
    gamepad.x = velocity.x;
    gamepad.y = velocity.y;
});
