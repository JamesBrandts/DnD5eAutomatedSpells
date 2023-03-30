const lastArg = args[args.length - 1]
if (args[0] === "on") {
    const spellLevel = args[1]
    const actor = await fromUuid(lastArg.actorUuid)
    const item = await fromUuid(lastArg.origin)
    const [newItem] = await actor.createEmbeddedDocuments("Item", [VampiricTouchAttackData(spellLevel,item)])
    await DAE.setFlag(actor, "vampiricTouchAttackId", newItem.id);

}
if (args[0] === "off") {
    const actor = await fromUuid(lastArg.actorUuid)
    const flag = await DAE.getFlag(actor, "vampiricTouchAttackId")
    await actor.deleteEmbeddedDocuments("Item", [flag])
    await DAE.unetFlag(actor, "vampiricTouchAttackId")
}

if(lastArg.tag === "DamageBonus"){
    if(lastArg.actor.flags.dae.vampiricTouchAttackId !== lastArg.item._id)return
    if(lastArg.hitTargetUuids.length <1)return
    const regain = Math.floor(lastArg.damageTotal/2)
    actor.applyDamage(-regain)
}

function VampiricTouchAttackData(spellLevel,item) {
    return {
        "name": ` ${item.name} Attack`,
        "type": "spell",
        "img": item.img,
        "system": {
            "activation": {
                "type": "action",
                "cost": 1,
                "condition": ""
            },
            "actionType": "msak",
            "damage": {
                "parts": [
                    [
                        `${spellLevel}d6`,
                        "necrotic"
                    ]
                ],
            },
            "level": 0,
            "school": "nec",
            "preparation": {
                "mode": "innate",
            }
        },
    }
}

