// ==UserScript==
// @name         Press O
// @description  best script
// @version      0.0.2
// @author       Cazka
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?domain=diep.io
// @namespace    https://greasyfork.org/users/541070
// @grant        none
// ==/UserScript==
if (!window.diepAPI) return window.alert('Please install diepAPI to use this script');

const { player } = window.diepAPI.apis;

player.on('spawn', async () => await player.keyPress('o'));
player.on('dead', async () => await player.spawn());
