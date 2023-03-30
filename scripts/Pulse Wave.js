if (args[0].tag === "OnUse") {
  const direction = await ShowDialog()
  await DAE.setFlag(args[0].actor, "PulseWaveDirection", direction)
}

if (args[0] === "on") {
  const lastArg = args[args.length - 1]
  const ttarget = canvas.scene.tokens.get(lastArg.tokenId)
  const tokenD = canvas.tokens.get(args[1]);
  await DAE.setFlag(ttarget, "forcedMovement", 2)
  let square = canvas.dimensions.size
  if (tokenD.actor.flags.dae.PulseWaveDirection === "pull")
    square = 0 - square
  let ux = tokenD.x
  let uy = tokenD.y
  for (let i = 0; i < 3; i++) {
    let tx = ttarget.x
    let ty = ttarget.y
    if (ux < tx) { await ttarget.update({ x: tx + square }) }
    if (ux > tx) { await ttarget.update({ x: tx - square }) }
    if (uy < ty) { await ttarget.update({ y: ty + square }) }
    if (uy > ty) { await ttarget.update({ y: ty - square }) }
  }
  await DAE.unsetFlag(ttarget, "forcedMovement")
  ttarget.actor.deleteEmbeddedDocuments("ActiveEffect", [lastArg.effectId]);
}

async function ShowDialog() {
  return await new Promise((resolve) => {
    new Dialog({
      title: "Pulse Wave",
      content: `Pull or Push Targets?`,
      buttons: {
        pull: {
          label: "Pull",
          callback: () => {
            resolve("pull");
          }
        },
        push: {
          label: "Push",
          callback: () => {
            resolve("push");
          }
        }
      },
      default: "pull"
    }).render(true);
  })
}