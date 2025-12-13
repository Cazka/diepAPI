// ==UserScript==
// @name         Safe Zone Keeper
// @description  press Z to activate safe zone mode
// @version      0.0.1
// @author       Cazka
// @match        https://diep.io/*
// @require      https://github.com/Cazka/diepAPI/releases/latest/download/diepAPI.user.js
// @icon         https://www.google.com/s2/favicons?domain=diep.io
// @grant        none
// ==/UserScript==

const { Vector } = window.diepAPI.core;
const { player, game, scaling } = window.diepAPI.apis;
const { overlay } = window.diepAPI.tools;

// Safe zone configuration
const SAFE_ZONE_RADIUS = 1000; // units from arena center
const ARENA_CENTER = new Vector(0, 0);

let safeZoneActive = false;

// Toggle safe zone mode with Z key
window.addEventListener('keydown', (e) => {
  if (e.code != 'KeyZ') return;

  // Toggle safe zone state
  safeZoneActive = !safeZoneActive;

  // Enable/disable API control of player movement
  player.useGamepad(safeZoneActive);

  console.log(`Safe Zone ${safeZoneActive ? 'activated' : 'deactivated'}`);
});

// Every frame, check if player is outside safe zone
game.on('frame', () => {
  // Draw safe zone boundary (always visible)
  drawSafeZoneBoundary();

  if (!safeZoneActive || player.isDead) return;

  // Calculate distance from arena center
  const distanceFromCenter = Vector.distance(player.position, ARENA_CENTER);

  // If player is outside safe zone, move back toward center
  if (distanceFromCenter > SAFE_ZONE_RADIUS) {
    // Calculate direction vector toward center
    const directionToCenter = Vector.subtract(ARENA_CENTER, player.position);

    // Normalize the direction vector (make it length 1)
    const magnitude = Vector.len(directionToCenter);
    const normalized = Vector.scale(directionToCenter, 1 / magnitude);

    // Move player toward center
    // Using a small step to make movement smooth
    const targetPos = Vector.add(player.position, Vector.scale(normalized, 50));
    player.moveTo(targetPos);
  }
});

// Draw the safe zone boundary circle on the overlay
function drawSafeZoneBoundary() {
  const ctx = overlay.ctx;

  // Convert arena center to canvas coordinates
  const centerCanvas = scaling.toCanvasPos(ARENA_CENTER);

  // Convert radius to canvas units
  const radiusCanvas = scaling.toCanvasUnits(new Vector(SAFE_ZONE_RADIUS, 0)).x;

  ctx.save();

  // Draw boundary circle
  ctx.strokeStyle = safeZoneActive ? '#00ff00' : '#ffff00';
  ctx.lineWidth = 3 * window.devicePixelRatio;
  ctx.setLineDash([10, 10]);

  ctx.beginPath();
  ctx.arc(centerCanvas.x, centerCanvas.y, radiusCanvas, 0, 2 * Math.PI);
  ctx.stroke();

  // Draw status text
  const fontSize = 18 * window.devicePixelRatio;
  ctx.font = `${fontSize}px Ubuntu`;
  ctx.fillStyle = safeZoneActive ? '#00ff00' : '#ffff00';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = fontSize / 8;
  ctx.setLineDash([]);

  const statusText = `SAFE ZONE: ${safeZoneActive ? 'ON' : 'OFF'}`;

  ctx.strokeText(statusText, 20, 40);
  ctx.fillText(statusText, 20, 40);

  ctx.restore();
}
