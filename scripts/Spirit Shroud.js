const lastArg = args[args.length - 1]
const actor = await fromUuid(lastArg.actorUuid)
const casterToken = await fromUuid(lastArg.tokenUuid)
if (args[0] === "on") {
    const damageType = await ShowDialogSpiritShroud()
    await DAE.setFlag(actor, "SpiritShroudDamageType", damageType)
    let hookId = Hooks.on("updateCombat",(combat,turn,opions,userId)=>{
        let token = canvas.tokens.get(combat.current.tokenId)
        if(token.document.disposition === casterToken.disposition)return;
        if(canvas.grid.measureDistance(token.center,casterToken.object.center) > 10)return;
        MidiQOL.socket().executeAsGM("createEffects", { actorUuid:token.actor.uuid, effects: [effectData2()] });
    })
    DAE.setFlag(casterToken.actor,"SpiritShroudHookId",hookId)
}
if (args[0] === "off") {    
    const hookId = await DAE.getFlag(casterToken.actor,"SpiritShroudHookId")
    Hooks.off("preUpdateToken",hookId)
    await DAE.unsetFlag(actor, "SpiritShroudDamageType")
    await DAE.unsetFlag(actor, "SpiritShroudHookId")
}
if (lastArg.tag === "DamageBonus") {
    if (lastArg.hitTargetUuids.length < 1) return
    if (!["mwak", "msak", "rwak", "rsak"].includes(lastArg.item.system.actionType)) return    
    if (canvas.grid.measureDistance(casterToken, lastArg.hitTargets[0]) > 10) return
    const damageType = await DAE.getFlag(actor, "SpiritShroudDamageType")
    const spellLevel = await DAE.getFlag(actor, "SpiritShroudLevel")
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: lastArg.hitTargetUuids[0], effects: [effectData()] });
    return { damageRoll: `${Math.floor((spellLevel - 1) / 2)}d8[${damageType}]`, flavor: "Spirit Shroud" };
}

async function ShowDialogSpiritShroud() {
    return await new Promise((resolve) => {
        new Dialog({
            title: "Spirit Shroud",
            content: `Choose the type of damage`,
            buttons: {
                radiant: {
                    label: "Radiant",
                    callback: () => {
                        resolve("radiant");
                    }
                },
                necrotic: {
                    label: "Necrotic",
                    callback: () => {
                        resolve("necrotic");
                    }
                },
                cold: {
                    label: "Cold ",
                    callback: () => {
                        resolve("cold");
                    }
                }
            },
            default: "radiant"
        }).render(true);
    })
}

function effectData() {
    return {
        "label": "Spirit Shroud Heal Immunity",
        "icon": "icons/magic/unholy/silhouette-light-fire-blue.webp",
        "origin": lastArg.actorUuid,
        "duration": {
            "rounds": 1
        },
        "disabled": false,
        "changes": [
            {
                "key": "system.traits.di.value",
                "mode": 0,
                "value": "healing",
                "priority": 20
            }
        ],
        "transfer": false,
    }
}

function effectData2() {
    return {
        "label": "Spirit Shroud Movement Speed Reduction",
        "icon": "icons/magic/unholy/silhouette-light-fire-blue.webp",
        "origin": lastArg.actorUuid,
        "duration": {
            "rounds": 1
        },
        "disabled": false,
        "changes": [
            {
                "key": "system.attributes.movement.walk",
                "mode": 2,
                "value": "-10",
                "priority": 20
            }
        ],
        "transfer": false,
    }
}