const casterToken = await fromUuid(args[0].tokenUuid);
if(args[0].itemData.name === "Scorching Ray"){    
    const spellLevel = args[0].spellLevel;
    let itemData = duplicate(args[0].itemData);
    itemData.name = "Aditional Scorching Ray";
    itemData.data.level = 0;
    itemData.data.uses.max = spellLevel;
    itemData.data.uses.value = spellLevel;
    itemData.data.preparation.mode = "innate";
    casterToken.actor.createEmbeddedDocuments("Item",[itemData]);
    const effectData = {
        label: "Aditional Scorching Ray", 
        changes: [
        {"key": "macro.itemMacro.GM","mode": 0,"value": "","priority": "20"}
        ],  
        origin: args[0].itemUuid, 
        disabled: false,
        icon: "systems/dnd5e/icons/spells/beam-red-2.jpg",
        duration: { turns: 1, seconds: 6},
        flags: {
            "dae": {
                "transfer": false,
                "itemData": {
                    "flags": {
                        "itemacro": {
                            "macro": {
                                "data": {
                                    "command": `
                                    if(args[0] === "off"){
                                        const lastArg = args[args.length-1];
                                        const casterToken = await fromUuid(lastArg.tokenUuid)
                                        casterToken.actor.deleteEmbeddedDocuments("Item",casterToken.actor.items.filter(i=>i.name === "Aditional Scorching Ray").map(i=>i.id))
                                        }`
                                }
                            }
                        }
                    }
                }
            }
        }
    };
    await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: casterToken.actor.uuid, effects: [effectData]});
}
if(args[0].itemData.name === "Aditional Scorching Ray"){
    await casterToken.actor.updateEmbeddedDocuments("Item",[{_id:args[0].item._id,'data.uses.value':args[0].item.data.uses.value - 1}]);
    if(args[0].item.data.uses.value <= 1){
        casterToken.actor.deleteEmbeddedDocuments("Item",[args[0].item._id]);
        casterToken.actor.deleteEmbeddedDocuments("ActiveEffect",casterToken.actor.effects.filter(i=>i.data.label === "Aditional Scorching Ray").map(i=>i.id));
        return;
    }
}
let caster = casterToken.actor;
let itemMessage  = game.messages.get(args[0].itemCardId);
let contentOld = itemMessage.data.content;
let contentNew = itemMessage.data.content + `<button id="button-${itemMessage.id}">Aditional Scorching Ray</button>`;
await await ChatMessage.updateDocuments([{_id:args[0].itemCardId,content:contentNew}]);
$(`#button-${itemMessage.id}`).click(async function(){
    await caster.items.getName("Aditional Scorching Ray").roll();
})