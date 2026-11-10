// Hook chargeBuilding so 3D signboards & building lights update live!
const _origChargeBuilding = chargeBuilding;
chargeBuilding = function(id, delta) {
  _origChargeBuilding(id, delta);
  refresh3DSignboardsAndLights();
};

initTown3D();

function loop() {
  if (state.activeScene === "town3d") {
    state.time += 0.0175;
    updateAndRenderTown3D();
    draw(); // Updates HUD portrait & Floating Enter Room button
  } else {
    update();
    draw();
  }
  requestAnimationFrame(loop);
}

renderBuildingsList();
updateInspector();
requestAnimationFrame(loop);
