actor = await fromUuid(args[0].actorUuid);
const itemData = {
    name: args[0].itemData.name + " Cure",
    type: "spell",
    
    img: args[0].itemData.img,
    data: {
        actionType: "heal",
        activation: {type: "bonus"},
        damage: {parts: [["2d6", "healing"]]},
        target: {value: 1, type: "creature"},
        level: 0,
        school: "evo",
        range: {value: 30, units: "ft"}
    }
};
const items = (await actor.createEmbeddedDocuments("Item", [itemData])).map(i=> i.uuid);
let removeUuids = getProperty(actor.flags, "midi-qol.concentration-data.removeUuids") ?? [];
removeUuids = removeUuids.concat(items);
if (removeUuids.length > 0) actor.setFlag("midi-qol", "concentration-data.removeUuids", removeUuids);