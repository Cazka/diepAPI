// ==UserScript==
// @name         diepAPI
// @description  https://github.com/Cazka/diepAPI
// @version      3.3.0
// @author       Cazka
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?domain=diep.io
// @namespace    https://greasyfork.org/users/541070
// @run-at       document-start
// @grant        none
// ==/UserScript==
(() => {
  const _window = 'undefined' == typeof unsafeWindow ? window : unsafeWindow;
  if (_window.diepAPI) return;

  //diepAPI start
  //diepAPI end

  _window.diepAPI = diepAPI;
})();
