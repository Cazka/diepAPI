// ==UserScript==
// @name         AFK Script
// @description  press Q to activate AFK
// @version      0.0.5
// @author       Cazka
// @match        https://diep.io/*
// @require      https://github.com/Cazka/diepAPI/releases/latest/download/diepAPI.user.js
// @icon         https://www.google.com/s2/favicons?domain=diep.io
// @namespace    https://greasyfork.org/users/541070
// @grant        none
// ==/UserScript==

const { Vector } = window.diepAPI.core;
const { player, game } = window.diepAPI.apis;

let afkActive = false;
let afkPosition;

window.addEventListener('keydown', (e) => {
  if (e.code != 'KeyQ') return;

  afkActive = !afkActive;
  player.useGamepad(afkActive);

  if (afkActive) afkPosition = player.position;
});

game.on('frame', () => {
  if (!afkActive) return;
  player.moveTo(afkPosition);
});
