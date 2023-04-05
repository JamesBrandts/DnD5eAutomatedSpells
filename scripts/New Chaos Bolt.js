if (args[0].macroPass === "postActiveEffects") {
    if (args[0].item.system.level > 0) return
    actor.deleteEmbeddedDocuments("Item", [args[0].item._id])
}
if (args[0].macroPass != "postDamageRoll") return;
const spellLevel = args[0].spellLevel
const damage_types = ["Acid", "Cold", "Fire", "Fire", "Lightning", "Poison", "Psychic", "Thunder",];
const element1 = damage_types[args[0].damageRoll.terms[0].values[0] - 1]
const element2 = damage_types[args[0].damageRoll.terms[0].values[1] - 1]
const theItem = await fromUuid(args[0].uuid);
theItem.system.damage.parts[0][1] = element1.toLowerCase()
let content = "Select damage type:"
if (element1 === element2) {
    content = "Chaos bolt bounces! Additional Chaos Bolt was created on your spellbook. Cast it again on another target within 30ft of the current one."
    let itemData = duplicate(args[0].itemData);
    itemData.system.level = 0;
    itemData.system.preparation.mode = "innate";
    itemData.name = "Additional " + itemData.name
    itemData.system.damage.parts[0][0] = `2d8+${spellLevel}d6`
    let item = await actor.createEmbeddedDocuments("Item", [itemData])
    Hooks.once('updateCombat', () => {
        Hooks.off("midi-qol.RollComplete", hookId)
        if (actor.items.get(item[0].id))
            actor.deleteEmbeddedDocuments("Item", [item[0].id])
    })
    const damageType = await choose([element1])
    theItem.system.damage.parts[0][1] = damageType.toLowerCase()
}
else {
    const damageType = await choose([element1, element2])
    theItem.system.damage.parts[0][1] = damageType.toLowerCase()
}

async function choose(options) {
    let value = await new Promise((resolve) => {
        let buttons = options.map((type) => {
            return {
                label: type,
                callback: () => {
                    resolve(type);
                },
            };
        });
        new Dialog({
            title: "Chaos Bolt",
            content,
            buttons: buttons,
        }).render(true);
    });
    return value;
}