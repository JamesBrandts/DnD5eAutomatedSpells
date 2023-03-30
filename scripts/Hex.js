if(args[0].macroPass === "postActiveEffects"){
    let tokenU = await fromUuid(args[0].tokenUuid)
    updateItemEffect()
    let concentrationDataUuid
    if(args[0].item.name != "Hex"){
        tokenU.actor.effects.find(i=>i.label === "Hex").delete()
        concentrationDataUuid = tokenU.actor.getFlag("midi-qol","concentration-data").uuid
    }
    else{
        concentrationDataUuid = args[0].itemUuid
    }
    const effectData2 = {
        changes: [
          {key: "flags.midi-qol.hex", mode: 5, value: args[0].targetUuids[0], priority: 20},
          {key: "flags.dnd5e.DamageBonusMacro", mode: 0, value: `ItemMacro.${args[0].item.name}`, priority: 20}
        ],  
        origin: concentrationDataUuid,
        disabled: false,
        duration: args[0].item.effects[0].duration,
        icon: args[0].item.img,
        label: 'Hex'
    }
    MidiQOL.socket().executeAsGM("createEffects", {actorUuid: tokenU.actor.uuid, effects: [effectData2]})
    if(args[0].item.name != "Hex")return;
    let hexPassData = args[0].item
    hexPassData.name = "Hex Transffer";
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
    if(tokenU.actor.flags["midi-qol"].hex != args[0].hitTargetUuids[0])return;
    const diceMult = args[0].isCritical ? 2: 1;
    return {damageRoll: `${diceMult}d6[necrotic]`, flavor: "Hex Damage"}
}
if(args[0].macroPass === "preItemRoll"){
    if(args[0].item.name === "Hex")return;
    const tokenU =  await fromUuid(args[0].tokenUuid);
    const lastTarget = await fromUuid(tokenU.actor.flags["midi-qol"].hex)
    if(lastTarget.actor.system.attributes.hp.value > 0){
        ui.notifications.warn("Your last Hex target has more than 0 HP currently")
        return false
    }
}
if(args[0] === "on"){
    const lastArg = args[args.length-1]
    const origin = await fromUuid(lastArg.origin)
    const tokenU = await fromUuid(lastArg.tokenUuid)
    if(origin.name === "Hex")return;
    let effectUuid = tokenU.actor.uuid + ".ActiveEffect." + lastArg.effectId
    addToRemoveConcentration(origin.actor,effectUuid)
}
async function updateItemEffect(){
    const abilities = [
        {name:"Strength",id:"str"},
        {name:"Dexterity",id:"dex"},
        {name:"Constitution",id:"con"},
        {name:"Intelligence",id:"int"},
        {name:"Wisdom",id:"wis"},
        {name:"Charisma",id:"cha"}
    ]
    let abilitiesContent = ""
    for (let ability of abilities) {
        abilitiesContent += `<option value=${ability.id}>${ability.name}</option>`;
    }
    await Dialog.prompt({
        title: 'Hex',
        content: `
            <div class="form-group">
            <label for="exampleSelect">Selecione o Elemento</label>
            <select name="exampleSelect">
                ${abilitiesContent}
            </select>
            </div>
        `,
            callback: async(html) => {
            let select = html.find('[name="exampleSelect"]').val();
            let abilityId = select;
            let targetToken = await fromUuid(args[0].targetUuids[0])
            let hexEffect = targetToken.actor.effects.find(i=>i.label === "Hexed")
            let changes = [
            {
                "key": "macro.itemMacro.GM",
                "value": "0",
                "mode": 0,
                "priority": "20"
            },
            {
                "key": `flags.midi-qol.disadvantage.ability.check.${abilityId}`,
                "value": "1",
                "mode": 2,
                "priority": "20"
            }
            ]
            await MidiQOL.socket().executeAsGM("updateEffects", {actorUuid: targetToken.actor.uuid, updates: [{_id:hexEffect.id,changes}]})                   
        }        
        }
    )
}

function addToRemoveConcentration(actor,...uuids){
    let removeUuids = getProperty(actor.flags, "midi-qol.concentration-data.removeUuids") ?? [];
    removeUuids = removeUuids.concat(uuids);
    if (removeUuids.length > 0) actor.setFlag("midi-qol", "concentration-data.removeUuids", removeUuids);
}