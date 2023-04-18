Hooks.once("midi-qol.AttackRollComplete", async workflow => {
    const spellLevel = workflow.actor?.flags?.dae?.LightningArrowLevel
    if (!spellLevel) return
    const target = await Array.from(workflow.targets.map(i => i))[0]
    if (workflow.hitTargets.size < 1)
        useItem(workflow.tokenUuid, [target.document.uuid], LightningArrowPrimaryDamageItemData(spellLevel))
    const targetUuids = canvas.tokens.placeables.filter(i => canvas.grid.measureDistance(i.center, target.center) <= 10).map(i => i.document.uuid)
    useItem(workflow.tokenUuid, targetUuids, LightningArrowAreaDamageItemData(spellLevel))
})

async function useItem(tokenUuid, targetUuids, itemData) {
    const token = await fromUuid(tokenUuid)
    const actor = token.actor ?? token
    let [item] = await actor.createEmbeddedDocuments("Item", [itemData])
    await MidiQOL.completeItemUse(item, {}, { targetUuids });
    await actor.deleteEmbeddedDocuments("Item", [item.id])
}

function LightningArrowPrimaryDamageItemData(level) {
    return {
        "name": "Lightning Arrow Damage on a Miss",
        "type": "spell",
        "system": {
            "activation": {
                "type": "none",
            },
            "damage": {
                "parts": [
                    [
                        `floor(${level + 1}d8/2)`,
                        "lightning"
                    ]
                ],
            },

            "level": 0,
            "school": "trs",
        },
        "img": "icons/magic/lightning/strike-arrow-spear-red.webp"
    }
}

function LightningArrowAreaDamageItemData(level) {
    return {
        "name": "Lightning Arrow Area Damage",
        "type": "spell",
        "system": {
            "activation": {
                "type": "none",
            },
            "damage": {
                "parts": [
                    [
                        `${level - 1}d8`,
                        "lightning"
                    ]
                ],
            },
            save: { ability: "dex", dc: null, scaling: "spell" },
            actionType: "save",
            "level": 0,
            "school": "trs",
        },
        "img": "icons/magic/lightning/strike-arrow-spear-red.webp"
    }
}