console.log('DnD5e Automated Spells 2.0.0|| Registering Hooks');

let socket;

Hooks.once("socketlib.ready", () => {
    console.log('DnD5e Automated Spells|| Registering Sockets');
    socket = socketlib.registerModule("dnd5e-automated-spells");
    socket.register("useItem", useItem);    
});



async function useItem(tokenUuid, targetUuids, itemData) {
    const token = await fromUuid(tokenUuid)
    const actor = token.actor ?? token
    let [item] = await actor.createEmbeddedDocuments("Item", [itemData])
    await MidiQOL.completeItemUse(item, {}, { targetUuids });
    await actor.deleteEmbeddedDocuments("Item", [item.id])
}


//Armor of Agathys
Hooks.on("midi-qol.damageApplied", async (token, info) => {
    if (!token.actor?.flags?.dae?.ArmorOfAgathysDamage > 0) return;
    useItem(info.ditem.tokenUuid, [info.workflow.tokenUuid], ArmorOfAgathysDamageData(token.actor?.flags?.dae.ArmorOfAgathysDamage))
    if (info.ditem.newTempHP > 0) return;
    await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: info.ditem.tokenUuid, effects: [token.actor?.flags?.dae.ArmorOfAgathysEffectId] });
})

function ArmorOfAgathysDamageData(damage) {
    return {
        "name": "Armor of Agathys Damage",
        "type": "spell",
        "img": "icons/magic/defensive/shield-barrier-flaming-diamond-blue.webp",
        "data": {
            "activation": {
                "type": "none",
                "cost": 0,
                "condition": ""
            },
            "damage": {
                "parts": [
                    [
                        `${damage}`,
                        "piercing"
                    ]
                ],
            },
            "level": 0,
            "school": "abj",
            "preparation": {
                "mode": "innate",
            }
        },
    }
}


//Absorb Elements
Hooks.on("midi-qol.preambleComplete", async (workflow) => {
    for (let target of workflow.targets) {
        const items = target.actor.items.filter(item => item.flags?.dnd5e?.spellName === "Absorb Elements")
        if (items.lenght < 1) continue;
        if (!workflow.item?.system?.damage?.parts[0]) continue;
        const damageType = workflow.item?.system?.damage?.parts[0][1]
        if (["acid", "cold", "fire", "lightning", "thunder"].includes(damageType))
            for (let item of items) {
                const copy_item = duplicate(item.toObject(false))
                copy_item.system.activation.type = "reactiondamage"
                copy_item.effects.map(effect => effect)[0].changes[0].value = damageType
                copy_item.effects.map(effect => effect)[1].changes[0].value = `(@spellLevel)d6[${damageType}]`
                copy_item.effects.map(effect => effect)[1].changes[1].value = `(@spellLevel)d6[${damageType}]`
                await target.actor.updateEmbeddedDocuments("Item", [copy_item])
            }

        else
            for (let item of items) item.update({ system: { activation: { type: "reactionmanual" } } })
    }
})
