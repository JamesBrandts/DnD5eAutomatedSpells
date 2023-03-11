console.log('DnD5e Automated Spells 2.0.0|| Registering Hooks');

let socket;

//Socketlib register
Hooks.once("socketlib.ready", () => {
    console.log('DnD5e Automated Spells|| Registering Sockets');
    socket = socketlib.registerModule("dnd5e-automated-spells");
    socket.register("useItem", useItem);
    socket.register("updateItem", updateItem);
});


//Armor of Agathys
Hooks.on("midi-qol.damageApplied", async (token, info) => {
    if (!token.actor?.flags?.dae?.ArmorOfAgathysDamage > 0) return;
    if (["msak", "mwak"].includes(info.item.system.actionType))
        await socket.executeAsGM("useItem", info.ditem.tokenUuid, [info.workflow.tokenUuid], ArmorOfAgathysDamageData(token.actor?.flags?.dae.ArmorOfAgathysDamage))
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
                await socket.executeAsGM("updateItem", target.actor, copy_item);

            }
        else {
            for (let item of items) {
                const copy_item = duplicate(item.toObject(false))
                copy_item.system.activation.type = "reactionmanual"
                await socket.executeAsGM("updateItem", target.actor, copy_item);
            }
        }
    }
})

//Protection from Evil and Good
Hooks.on("midi-qol.preAttackRoll", async (workflow) => {
    if (!["aberration", "celestial", "elemental", "fey", "fiend", "undead"].includes(workflow.actor.system.details?.type?.value)) return;
    for (let target of workflow.targets)
        if (target.actor.flags.dae?.ProtectionFromEvilAndGood)
            workflow.disadvantage = true
});

//Ancestral Protectors
Hooks.on("midi-qol.preAttackRoll", async (workflow) => {
    if(!["rsak","rwak","msak","mwak"].includes(workflow.item.system.actionType))return;
    if(!workflow.actor.flags.dae?.AncestralProtectorsTokenId)return;
    if(Array.from(workflow.targets).map(i=>i.id).includes(workflow.actor.flags.dae.AncestralProtectorsTokenId))return;
    workflow.disadvantage = true
});

Hooks.on("midi-qol.preDamageRoll", async (workflow) => {
    if(!["rsak","rwak","msak","mwak"].includes(workflow.item.system.actionType))return;
    if(!workflow.actor.flags.dae?.AncestralProtectorsTokenId)return;
    if(Array.from(workflow.targets).map(i=>i.id).includes(workflow.actor.flags.dae.AncestralProtectorsTokenId))return;
    for(let target of workflow.hitTargets)
        await MidiQOL.socket().executeAsGM("createEffects", {actorUuid: target.actor.uuid, effects: [getAncientProtectionData()]});
});


async function useItem(tokenUuid, targetUuids, itemData) {
    const token = await fromUuid(tokenUuid)
    const actor = token.actor ?? token
    let [item] = await actor.createEmbeddedDocuments("Item", [itemData])
    await MidiQOL.completeItemUse(item, {}, { targetUuids });
    await actor.deleteEmbeddedDocuments("Item", [item.id])
}

async function updateItem(actor, copy_item) {
    await actor.updateEmbeddedDocuments("Item", [copy_item])
}

function getAncientProtectionData(){
    return{
        "label": "Protection",
        "icon": "icons/magic/holy/barrier-shield-winged-cross.webp",
        "origin": "Scene.nTYd3NCIVb4nUKjV.Token.YrjyelbOJpjC3tLs",
        "duration": {
            "turns": 1
        },
        "disabled": false,
        "changes": [
            {
                "key": "system.traits.dr.all",
                "mode": 0,
                "value": "",
                "priority": 20
            }
        ],
        "flags": {
            "dae": {
                "transfer": true,
                "specialDuration": [
                    "isDamaged"
                ]
            }
        }
    }
}


/*
globalThis.DnD5eAutomatedSpellsAPI = {testFunction}
function testFunction(){
    console.log("Aqui")
}
*/