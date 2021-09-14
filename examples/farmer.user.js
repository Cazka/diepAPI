// ==UserScript==
// @name         Farm Script
// @description  press P to start the farmer
// @version      0.0.1
// @author       Cazka
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?domain=diep.io
// @namespace    https://greasyfork.org/users/541070
// @grant        none
// ==/UserScript==
if (!window.diepAPI) return window.alert('Please install diepAPI to use this script');

const { player, game, entityManager } = window.diepAPI;

let farmActive = false;

window.addEventListener('keydown', (e) => {
    if (e.code != 'KeyP') return;

    farmActive = !farmActive;
});

game.on('frame', () => {
    if (!farmActive) return;

    const entity = entityManager.entities[0];
    if (entity) player.lookAt(entity.position);
});
