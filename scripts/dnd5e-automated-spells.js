//import ThunderGauntlets from "./features/Thunder Gauntlets"

console.log('DnD5e Automated Spells 2.0.0|| Registering Hooks');

let socket;

//Socketlib registering
Hooks.once("socketlib.ready", () => {
    console.log('DnD5e Automated Spells|| Registering Sockets');
    socket = socketlib.registerModule("dnd5e-automated-spells");
    socket.register("useItem", useItem);
    socket.register("updateItem", updateItem);
    socket.register("automatedSpikeGrowthSpell", automatedSpikeGrowthSpell);
    socket.register("automatedWebSpell", automatedWebSpell);
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


//Armor of Agathys
Hooks.on("midi-qol.damageApplied", async (token, info) => {
    if (!token.actor?.flags?.dae?.ArmorOfAgathysLevel > 0) return;
    if (["msak", "mwak"].includes(info.item.system.actionType))
        await socket.executeAsGM("useItem", info.ditem.tokenUuid, [info.workflow.tokenUuid], ArmorOfAgathysDamageData(token.actor?.flags?.dae.ArmorOfAgathysLevel * 5))
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
        if(!target.actor.flags.dae.AbsorbElements)return
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

Hooks.on("midi-qol.preAttackRoll", async (workflow)=>{
    ThunderGauntlets(workflow)
})

//Protection from Evil and Good
Hooks.on("midi-qol.preAttackRoll", async (workflow) => {
    if (!["aberration", "celestial", "elemental", "fey", "fiend", "undead"].includes(workflow.actor.system.details?.type?.value)) return;
    for (let target of workflow.targets)
        if (target.actor.flags.dae?.ProtectionFromEvilAndGood)
            workflow.disadvantage = true
    if (workflow.actor.flags.dae.BestowCurseTokenId)
        if (Array.from(workflow.targets).map(i => i.id).includes(workflow.actor.flags.dae.BestowCurseTokenId))
            workflow.disadvantage = true

});

//Ancestral Protectors
Hooks.on("midi-qol.preAttackRoll", async (workflow) => {
    if (!["rsak", "rwak", "msak", "mwak"].includes(workflow.item.system.actionType)) return;
    if (!workflow.actor.flags.dae?.AncestralProtectorsTokenId) return;
    if (Array.from(workflow.targets).map(i => i.id).includes(workflow.actor.flags.dae.AncestralProtectorsTokenId)) return;
    workflow.disadvantage = true
});

Hooks.on("midi-qol.preDamageRoll", async (workflow) => {
    if (!["rsak", "rwak", "msak", "mwak"].includes(workflow.item.system.actionType)) return;
    if (!workflow.actor.flags.dae?.AncestralProtectorsTokenId) return;
    if (Array.from(workflow.targets).map(i => i.id).includes(workflow.actor.flags.dae.AncestralProtectorsTokenId)) return;
    for (let target of workflow.hitTargets)
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target.actor.uuid, effects: [getAncientProtectionData()] });
});




function getAncientProtectionData() {
    return {
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

async function automatedSpikeGrowthSpell(args) {
    const template = await fromUuid(args[0].templateUuid)
    const casterToken = await fromUuid(args[0].tokenUuid)
    let size = canvas.grid.size
    let radius = 4 * size
    let linesInXvar = await linesInX(template.x, template.y, radius, size)
    let linesInYvar = await linesInY(template.x, template.y, radius, size)
    canvas.scene.tokens.map(i => i.setFlag("dnd5e-automated-spells", "SpikeGrowthcontrollPosition", { x: i.x, y: i.y }));
    let hookId = Hooks.on("updateToken", async (token, changes) => {
        if (!('x' in changes || 'y' in changes)) return;
        let p1x = token.getFlag("dnd5e-automated-spells", "SpikeGrowthcontrollPosition")?.x
        let p1y = token.getFlag("dnd5e-automated-spells", "SpikeGrowthcontrollPosition")?.y
        let p2x = changes.x ?? token.x
        let p2y = changes.y ?? token.y
        token.setFlag("dnd5e-automated-spells", "SpikeGrowthcontrollPosition", { x: token.x, y: token.y })
        let desl = token.height * canvas.grid.size / 2
        let crossedOnX = 0
        let crossedOnY = 0
        for (let line of linesInXvar) {
            let crossPoint = await crossLineInX(line.x, p1x + desl, p1y + desl, p2x + desl, p2y + desl)
            if (!crossPoint) continue;
            if (crossPoint > line.y1) continue;
            if (crossPoint < line.y2) continue;
            crossedOnX++
        }
        for (let line of linesInYvar) {
            let crossPoint = await crossLineInY(line.y, p1x + desl, p1y + desl, p2x + desl, p2y + desl)
            if (!crossPoint) continue;
            if (crossPoint > line.x1) continue;
            if (crossPoint < line.x2) continue;
            crossedOnY++
        }
        let dices = crossedOnX * 2;
        if (crossedOnY > crossedOnX) dices = crossedOnY * 2;
        if (dices < 1) return;
        await socket.executeAsGM("useItem", casterToken.uuid, [token.uuid], getItemData(dices))
    })
    let hookId2 = Hooks.on("deleteActiveEffect", (document) => {
        if (document.label != "Concentrating") return;
        if (document.origin != args[0].itemUuid) return;
        canvas.scene.tokens.map(i => i.unsetFlag("dnd5e-automated-spells", "SpikeGrowthcontrollPosition"));
        Hooks.off("updateToken", hookId)
        Hooks.off("deleteActiveEffect", hookId2)
    })

    function crossLineInX(x, p1x, p1y, p2x, p2y) {
        if (p1x >= x && p2x > x) return false;
        if (p1x <= x && p2x < x) return false;
        return p1y + ((x - p1x) * (p1y - p2y) / (p1x - p2x))
    }
    function crossLineInY(y, p1x, p1y, p2x, p2y) {
        if (p1y >= y && p2y > y) return false;
        if (p1y <= y && p2y < y) return false;
        return p1x + ((y - p1y) * (p1x - p2x) / (p1y - p2y))
    }
    function linesInX(x, y, radius, size) {
        let lines = [{ x: x, y1: y + radius, y2: y - radius }]
        for (let i = size; i <= radius; i += size) {
            lines.push({ x: x + i, y1: y + Math.sqrt(radius * radius - i * i), y2: y - Math.sqrt(radius * radius - i * i) })
            lines.push({ x: x - i, y1: y + Math.sqrt(radius * radius - i * i), y2: y - Math.sqrt(radius * radius - i * i) })
        }
        return lines
    }
    function linesInY(x, y, radius, size) {
        let lines = [{ y: y, x1: x + radius, x2: x - radius }]
        for (let i = size; i <= radius; i += size) {
            lines.push({ y: y + i, x1: x + Math.sqrt(radius * radius - i * i), x2: x - Math.sqrt(radius * radius - i * i) })
            lines.push({ y: y - i, x1: x + Math.sqrt(radius * radius - i * i), x2: x - Math.sqrt(radius * radius - i * i) })

        }
        return lines
    }
    function getItemData(dices) {
        return {
            "name": "Spike Growth Damage",
            "type": "spell",
            "img": `${args[0].item.img}`,
            "data": {
                "activation": {
                    "type": "none",
                    "cost": 0,
                    "condition": ""
                },
                "damage": {
                    "parts": [
                        [
                            `${dices}d4`,
                            "piercing"
                        ]
                    ],
                },
                "level": 0,
                "school": "trs",
                "preparation": {
                    "mode": "innate",
                }
            },
        }
    }
}


async function automatedWebSpell(args) {
    let casterToken = await fromUuid(args[0].tokenUuid)
    let template = await fromUuid(args[0].templateUuid)
    let origin = args[0].itemUuid
    let templateX = template.x;
    let templateY = template.y
    let item = await casterToken.actor.createEmbeddedDocuments('Item', [getWebSaveData()])
    let removeUuids = getProperty(casterToken.actor.flags, "midi-qol.concentration-data.removeUuids") ?? [];
    removeUuids = removeUuids.concat([item[0].uuid]);
    if (removeUuids.length > 0) casterToken.actor.setFlag("midi-qol", "concentration-data.removeUuids", removeUuids);
    let hookId = Hooks.on('updateToken', (token, changes) => {
        if (!('x' in changes || 'y' in changes)) return;
        let px = token.x;
        let py = token.y;
        let center = token.height * canvas.grid.size / 2;
        let size = canvas.grid.size;
        if (px + center < templateX) return;
        if (px + center > templateX + 4 * size) return;
        if (py + center < templateY) return;
        if (py + center > templateY + 4 * size) return;
        rollEffectItem(token)
    })
    let hookId2 = Hooks.on('updateCombat', (combat, turn, opions, userId) => {
        let token = canvas.scene.tokens.get(combat.current.tokenId)
        let px = token.x;
        let py = token.y;
        let center = token.height * canvas.grid.size / 2;
        let size = canvas.grid.size;
        if (px + center < templateX) return;
        if (px + center > templateX + 4 * size) return;
        if (py + center < templateY) return;
        if (py + center > templateY + 4 * size) return;
        rollEffectItem(token)
    })
    let hookId3 = Hooks.on('deleteActiveEffect', async (document) => {
        if (document.label != 'Concentrating') return;
        if (document.origin != origin) return;
        webConcentrationId = await casterToken.actor.effects.filter(i => i.label === 'Web Concentration').map(i => i.id)
        await casterToken.actor.deleteEmbeddedDocuments('ActiveEffect', webConcentrationId)
        Hooks.off('updateToken', hookId)
        Hooks.off('updateCombat', hookId2)
        Hooks.off('deleteActiveEffect', hookId3)
    })

    async function rollEffectItem(token) {
        if (token.actor.effects.filter(i => i.label === "Restrained").length > 0) return;
        await item[0].update({ 'data.uses': { per: '', max: '', value: null } });
        await MidiQOL.completeItemRoll(item[0], { targetUuids: [token.uuid ?? token.document.uuid] });
        await item[0].update({ 'data.uses': { per: 'charges', max: '1', value: 0 } });
    }

    function getWebSaveData() {
        return {
            "name": "Web Save",
            "type": "spell",
            "img": `${args[0].item.img}`,
            "data": {
                "activation": {
                    "type": "none",
                    "cost": 0,
                    "condition": ""
                },
                "actionType": "save",
                "save": {
                    "ability": "dex",
                    "dc": null,
                    "scaling": "spell"
                },
                "level": 0,
                "school": "con",
            },
            "uses": {
                "value": 0,
                "max": "1",
                "per": "charges"
            },
            "effects": [
                {
                    "changes": [
                        {
                            "key": "flags.midi-qol.disadvantage.attack.all",
                            "mode": 2,
                            "value": "1",
                            "priority": "20"
                        },
                        {
                            "key": "flags.midi-qol.grants.advantage.attack.all",
                            "mode": 2,
                            "value": "1",
                            "priority": "20"
                        },
                        {
                            "key": "data.attributes.movement.all",
                            "mode": 0,
                            "value": "*0",
                            "priority": "20"
                        },
                        {
                            "key": "macro.itemMacro.GM",
                            "mode": 0,
                            "value": "@attributes.spelldc @token",
                            "priority": "20"
                        }
                    ],
                    "disabled": false,
                    "duration": {
                        "startTime": null,
                        "seconds": 3600,
                        "rounds": 600
                    },
                    "icon": "icons/magic/control/debuff-chains-ropes-net-white.webp",
                    "label": "Restrained",
                    "transfer": false,
                    "flags": {
                        "core": {
                            "statusId": ""
                        },
                        "dae": {
                            "stackable": "none",
                            "transfer": false
                        }
                    },
                    "selectedKey": [
                        "flags.midi-qol.disadvantage.attack.all",
                        "flags.midi-qol.grants.advantage.attack.all",
                        "data.attributes.movement.all",
                        "macro.itemMacro"
                    ]
                }
            ],
            "flags": {
                "itemacro": {
                    "macro": {
                        "data": {
                            "name": "Web Save",
                            "command": getFreeFromWebCommand(),
                        }
                    }
                }
            }
        }
    }

    function getFreeFromWebCommand() {
        return `
        const lastArg = args[args.length-1];
        token = await fromUuid(lastArg.tokenUuid);
        actor = token.actor;
        const spelldc = args[1];
        if(args[0] === "on"){
            const casterToken = canvas.tokens.get(args[2])
            const effect = actor.effects.get(lastArg.effectId)
            let removeUuids = getProperty(casterToken.actor.flags, "midi-qol.concentration-data.removeUuids") ?? [];
            removeUuids = removeUuids.concat([effect.uuid]);
            if (removeUuids.length > 0) casterToken.actor.setFlag("midi-qol", "concentration-data.removeUuids", removeUuids);  
            let [item] = await actor.createEmbeddedDocuments("Item",[getFreeFromWebData()]);
            DAE.setFlag(actor,"webSaveItemId",[item.id]);
        }
        if(args[0]=== "off"){
            actor.deleteEmbeddedDocuments("Item",DAE.getFlag(actor,"webSaveItemId"));
            DAE.unsetFlag(actor,"webSaveItemId");
        }
        function getFreeFromWebData(){
            return {
                "name": "Free from Web",
                "type": "feat",
                "img": "icons/magic/control/debuff-chains-ropes-net-white.webp",
                "data": {
                    "description": {
                        "value": "Try to free from web",
                        "chat": "Try to free from web",
                        "unidentified": ""
                    },
                    "activation": {
                        "type": "action",
                        "cost": 1,
                        "condition": ""
                    },
                    "target": {
                        "value": null,
                        "width": null,
                        "units": "",
                        "type": "self"
                    },
                    "actionType": "abil",
                    "save": {
                        "ability": "str",
                        "dc": \`\${spelldc}\`,
                        "scaling": "flat"
                    },
                },
                "flags": {
                    "midi-qol": {
                        "effectActivation": false,
                        "onUseMacroName": "[postActiveEffects]ItemMacro"
                    },
                    "itemacro": {
                        "macro": {
                            "data": {
                                "name": "Free from Web",
                                "command": \`let effectId = "\${lastArg.effectId}";if(args[0].saves.length < 1)return;actor.deleteEmbeddedDocuments(\\"ActiveEffect\\",[effectId])\`,
                            }
                        }
                    }
                }
            }
        }`
    }
}

async function ThunderGauntlets(workflow){
    if(!workflow.actor.flags?.dae?.ThunderGauntlets)return
    if(workflow.targets.map(i=>i.id).has(workflow.actor.flags?.dae?.ThunderGauntlets))return
    workflow.disadvantage = true
}

/*
globalThis.DnD5eAutomatedSpellsAPI = {testFunction}
function testFunction(){
    console.log("Aqui")
}
*/


//Auras Knock Off


//Hooks.on("updateToken")

