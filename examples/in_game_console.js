// ==UserScript==
// @name         Entity Debug Tool
// @description  https://github.com/Cazka/diepAPI
// @version      0.0.1
// @author       nopeless
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?domain=diep.io
// @namespace    https://github.com/nopeless
// @grant        none
// ==/UserScript==

if (!window.diepAPI) return window.alert('Please install diepAPI to use this script');

const { player, game, entityManager, Vector } = window.diepAPI;


const id = "diep-ingame-console";

`
<style>
#${id} {
    position: absolute;
}

#${id}header {
    cursor: move;
}

</style>
<div id="${id}">
</div>
`

// Make the DIV element draggable:
dragElement(document.getElementById("mydiv"));

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

let farmActive = false;

window.addEventListener('keydown', (e) => {
    if (e.code != 'KeyP') return;

    farmActive = !farmActive;
});

game.on('console', entry => {
    entry = entry.message ?? entry;
    if (!entry.startsWith('/')) {
        eval(entry);
    } else {
        const command = entry.substring(1);
        if (command === "hi") {
            game.console.log("why hello there");
        }
    }
})

for (const level of ['error', 'warn', 'info','log', 'assert']) {
	console[level] = (function(...args) {
		this[level](...args);
        game.console.log({
            message: args[0]?.toString() ?? args[0],
            level
        });
	}).bind(console);
}

