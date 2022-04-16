// ==UserScript==
// @name         Farm Script
// @description  press P to start the farmer
// @version      0.0.7
// @author       Cazka
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?domain=diep.io
// @namespace    https://greasyfork.org/users/541070
// @grant        none
// ==/UserScript==
if (!window.diepAPI) return window.alert('Please install diepAPI to use this script');

const { Vector } = window.diepAPI.core;
const { player, game } = window.diepAPI.apis;
const { entityManager } = window.diepAPI.extensions;

entityManager.load();

let farmActive = false;

window.addEventListener('keydown', (e) => {
    if (e.code != 'KeyP') return;

    farmActive = !farmActive;
});

game.on('frame', () => {
    if (!farmActive) return;
    const entities = entityManager.entities.filter((x) => x.type > 3 && x.type !== 9);

    if (entities.length === 0) {
        return;
    }

    const entity = entities.reduce((acc, x) => {
        const distAcc = Vector.distance(acc.predictPos(100), player.predictPos(100));
        const distX = Vector.distance(x.predictPos(100), player.predictPos(100));

        return distX < distAcc ? x : acc;
    });
    if (entity) player.lookAt(entity.position);
});
