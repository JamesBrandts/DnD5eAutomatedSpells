if(args[0].macroPass === "postActiveEffects"){
    let tokenU = await fromUuid(args[0].tokenUuid)
    let concentrationDataUuid
    if(args[0].item.name != "Hunter's Mark"){
        tokenU.actor.effects.find(i=>i.label === "Hunter's Mark").delete()
        concentrationDataUuid = tokenU.actor.getFlag("midi-qol","concentration-data").uuid
    }
    else{
        concentrationDataUuid = args[0].itemUuid
    }
    const effectData2 = {
        changes: [
          {key: "flags.midi-qol.hunt", mode: 5, value: args[0].targetUuids[0], priority: 20},
          {key: "flags.dnd5e.DamageBonusMacro", mode: 0, value: `ItemMacro.${args[0].item.name}`, priority: 20}
        ],  
        origin: concentrationDataUuid,
        disabled: false,
        duration: args[0].item.effects[0].duration,
        icon: args[0].item.img,
        label: 'Hunter\'s Mark'
    }
    MidiQOL.socket().executeAsGM("createEffects", {actorUuid: tokenU.actor.uuid, effects: [effectData2]})
    if(args[0].item.name != "Hunter's Mark")return;
    let hexPassData = args[0].item
    hexPassData.name = "Hunter's Mark Transffer";
    hexPassData.system.level = 0;
    hexPassData.system.preparation.mode = "innate"
    hexPassData.system.components.concentration = false
    let items = (await tokenU.actor.createEmbeddedDocuments("Item",[hexPassData])).map(i=>i.uuid)
    addToRemoveConcentration(tokenU.actor,items[0])
}
if(args[0].macroPass === "DamageBonus"){
    if(!["mwak","msak","rwak","rsak"].includes(args[0].item.system.actionType))return;
    if(args[0].hitTargetUuids.length < 1)return;
    const tokenU =  await fromUuid(args[0].tokenUuid);
    if(tokenU.actor.flags["midi-qol"].hunt != args[0].hitTargetUuids[0])return;
    const diceMult = args[0].isCritical ? 2: 1;
    return {damageRoll: `${diceMult}d6`, flavor: "Hunter's Mark Damage"}
}
if(args[0].macroPass === "preItemRoll"){
    if(args[0].item.name === "Hunter's Mark")return;
    const tokenU =  await fromUuid(args[0].tokenUuid);
    const lastTarget = await fromUuid(tokenU.actor.flags["midi-qol"].hunt)
    if(lastTarget.actor.system.attributes.hp.value > 0){
        ui.notifications.warn("Your last Hunter's Mark target has more than 0 HP currently")
        return false
    }
}
if(args[0] === "on"){
    const lastArg = args[args.length-1]
    const origin = await fromUuid(lastArg.origin)
    const tokenU = await fromUuid(lastArg.tokenUuid)
    if(origin.name === "Hunter's Mark")return;
    let effectUuid = tokenU.actor.uuid + ".ActiveEffect." + lastArg.effectId
    addToRemoveConcentration(origin.actor,effectUuid)
}


function addToRemoveConcentration(actor,...uuids){
    let removeUuids = getProperty(actor.flags, "midi-qol.concentration-data.removeUuids") ?? [];
    removeUuids = removeUuids.concat(uuids);
    if (removeUuids.length > 0) actor.setFlag("midi-qol", "concentration-data.removeUuids", removeUuids);
}