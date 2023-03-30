token = await fromUuid(args[0].tokenUuid)
actor = token.actor;
let spellLevel = args[0].spellLevel
let dice = 2 + (spellLevel > 2) + (spellLevel > 4) + (spellLevel > 6)
const itemData = {
    name: args[0].itemData.name + " Summoned Weapon",
    type: "weapon",
    img: args[0].itemData.img,
    data: {
        actionType: "mwak",
        activation: {type: "action"},
        damage: {parts: [[`${dice}d8 + @mod`, "psychic"]]},
        target: {value: 1, type: "creature"},
        range: {value: 20,long: 60,units: "ft"},
        equipped: true,
        proficient: true,
        properties:{fin: true,lgt: true}
    }
};
const items = (await actor.createEmbeddedDocuments("Item", [itemData])).map(i=> i.uuid);
let removeUuids = getProperty(actor.flags, "midi-qol.concentration-data.removeUuids") ?? [];
removeUuids = removeUuids.concat(items);
if (removeUuids.length > 0) actor.setFlag("midi-qol", "concentration-data.removeUuids", removeUuids);