// ==UserScript==
// @name         AFK Script
// @description  press Q to activate AFK
// @version      0.0.1
// @author       Cazka
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?domain=diep.io
// @namespace    https://greasyfork.org/users/541070
// @grant        none
// ==/UserScript==
if (!window.diepAPI) return window.alert('Please install diepAPI to use this script');

const { PlayerMovement, CanvasKit, Vector, DiepGamepad } = window.diepAPI;
const playerMovement = new PlayerMovement();
const gamepad = new DiepGamepad();

let afkActive = false;
let afkPosition;

window.addEventListener('keydown', (e) => {
    if (e.code != 'KeyQ') return;

    afkActive = !afkActive;
    gamepad.connected = afkActive;

    if (afkActive) afkPosition = playerMovement.position;
});

CanvasKit.hookRAF(() => {
    if (!afkActive) return;

    const direction = Vector.subtract(afkPosition, playerMovement.position);
    const distance = Vector.length(direction);

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
