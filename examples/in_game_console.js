// ==UserScript==
// @name         User Console
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

game.HTMLfocus = HTMLElement.prototype.focus.bind(HTMLElement);
HTMLElement.prototype.focus = () => {};
const blur = HTMLElement.prototype.blur;
HTMLElement.prototype.blur = () => {};
const a = window.alert;

window.alert = (function (...args) {
  if (args[0] === "Are you sure you wanna quit?") return;
  a(...args);
}).bind(window)

player.on('spawn', () => setTyping(true));

const id = "diep-ingame-console";

const html = `
<style>
#${id} {
    width: 300px;
    height: 500px;
    border: 1px solid black;
    padding: 0;
    box-shadow: 2px 2px;
    background-color: #ffe0f3;
    position: absolute;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: height 0.3s;
    transition-timing-function: ease-out;
    z-index: 99999;
}

#${id}.collapsed {
    height: 40px;
}

#${id} * {
    font-family: monospace;
    z-index: 99999;
}

#${id}header {
    padding: 10px;
    cursor: move;
}

#${id}-drawer {
    display: flex;
    flex-direction: column;
    padding: 10px;
    height: 100%;
}

#${id}-drawer > input {
    border: none;
    color: black;
    padding: 0;
    margin: 0;
    outline: none;
    border: 1px solid black;
    border-radius: 0;
    margin: 0;
}

#${id}-drawer-list {
    height: 100%;
    overflow-y: scroll;
    margin: 0;
    padding-left: 0;
    -ms-overflow-style: none;  /* Internet Explorer 10+ */
    scrollbar-width: none;  /* Firefox */
}

#${id}-drawer-list::-webkit-scrollbar  {
  display: none;  /* Safari and Chrome */
}

</style>
<div id="${id}">
    <div id="${id}header">Console</div>
    <div id="${id}-drawer">
        <ul id="${id}-drawer-list">

        </ul>
        <input
        type="text" id="${id}-drawer-input" placeholder="evaluate console or /command"
        ></input>
    </div>
</div>
`

window.onload = async function() {
    document.body.insertAdjacentHTML("beforeend", html);

    // Make the DIV element draggable:
    register(document.getElementById(id));
}

let keydown = window.onkeydown.bind(window);

window.onkeydown = (...args) => {
    if (document.activeElement.tagName === "INPUT" && document.activeElement.id !== "textInput") return;
    keydown(...args);
}

window.addEventListener("click", e => {
  if (event.target.id !== `${id}-drawer-input`) {
    blur.bind(document.getElementById(`${id}-drawer-input`))();
  }
})

function register(elmnt) {
  const i = document.getElementById(`${id}-drawer-input`);
  i.addEventListener(`keydown`, e => {
    if (event.key === "Enter") {
      const input = i.value;
      i.value = "";
      game.emit('consolecommand', input);
    }
  });
  let moved = 0;
  const collapse = document.getElementById(`${id}header`);
  collapse.addEventListener(`click`, e => {
    if (moved > 3) {
      moved = 0;
      return;
    }
    moved = 0;
    elmnt.classList.toggle("collapsed");
  });

  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    moved++;
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
    moved++;
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

game.on('consolecommand', entry => {
    entry = entry?.message ?? entry;
    if (typeof entry !== 'string') return;

    game.emit('console', `> ${entry}`);

    if (!entry.startsWith('/')) {
        game.emit('console', eval(entry));
    } else {
        const command = entry.substring(1);
        if (command === "hi") {
            game.console.log("why hello there");
        }
    }
});

game.on('console', entry => {
    entry = entry.message ?? entry;
    const l = document.getElementById(id + '-drawer-list');
    if (l.childElementCount > 100) {
        l.removeChild(l.firstChild);
    }
    l.innerHTML += `<li>${entry}</li>`;
})

for (const level of ['error', 'warn', 'info','log', 'assert']) {
    const l = console[level].bind(console);
    console[level] = (function(...args) {
        l(...args);
        game.console.log({
            message: args[0]?.toString() ?? args[0],
            level
        });
    });
}
