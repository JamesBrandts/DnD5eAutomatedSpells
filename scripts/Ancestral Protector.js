const lastArg = args[args.length-1]
if (args[0] === "each" || args[0] === "on") {
    token = await fromUuid(lastArg.tokenUuid)
    token.actor.createEmbeddedDocuments("ActiveEffect", [getAncestralProtectorEffectsData()])
}
function getAncestralProtectorEffectsData(){
    return {
        "label": "Ancestral Protectors",
        "icon": "icons/magic/holy/barrier-shield-winged-cross.webp",
        "origin": "Actor.xBYOjtb2JsFrZHbO",
        "duration": {
            "turns": 1,
        },
        "disabled": false,
        "changes": [
            {
                "key": "flags.dnd5e.DamageBonusMacro",
                "mode": 0,
                "value": "ItemMacro.Rage(Ancestral Guardian)",
                "priority": 20
            }
        ],
        "flags": {
            "dae": {
                "transfer": false,
                "specialDuration": [
                    "1Hit"
                ],
                "stackable": "multi",
                "macroRepeat": "none"
            },
        }
    }
}

if(lastArg.tag === "DamageBonus"){
    MidiQOL.socket().executeAsGM("createEffects", {actorUuid: lastArg.targetUuids[0], effects: [getAncestralProtectorFlag(lastArg.tokenId)]})
}


function getAncestralProtectorFlag(tokenId){
    return {
        "label": "Ancestral Protectors",
        "icon": "icons/magic/holy/barrier-shield-winged-cross.webp",
        "origin": "Actor.xBYOjtb2JsFrZHbO",
        "duration": {
            "rounds": 1,
        },
        "disabled": false,
        "changes": [
            {
                "key": "flags.dae.AncestralProtectorsTokenId",
                "mode": 2,
                "value": tokenId,
                "priority": 20
            }
        ]
    }
}

let hookId = Hooks.once("midi-qol.preAttackRoll", async (workflow) => {
    if(!workflow.actor.flags.dae.AncestralProtectorsTokenId)return;
    if(Array.from(workflow.targets).map(i=>i.id).includes(workflow.actor.flags.dae.AncestralProtectorsTokenId))return;
    workflow.disadvantage = true
});