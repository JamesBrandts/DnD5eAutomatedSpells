if(args[0].macroPass !== "DamageBonus")return;
if(args[0].item.system.actionType !== "mwak")return;
if(args[0].hitTargetUuids.length < 1)return;
const [item] = await actor.createEmbeddedDocuments("Item", [getItemData()]);
await MidiQOL.completeItemUse(item, {}, { targetUuids:args[0].hitTargetUuids });
let concentrationTargets = getProperty(actor.flags, "midi-qol.concentration-data.targets") ?? [];
concentrationTargets = concentrationTargets.concat([{tokenUuid:args[0].targetUuids[0],actorUuid:args[0].targetUuids[0]}]);
if (concentrationTargets.length > 0) actor.setFlag("midi-qol", "concentration-data.targets", concentrationTargets);
actor.setFlag("midi-qol", "concentration-data.uuid", item.uuid);
await actor.deleteEmbeddedDocuments("Item", [item.id])

function getItemData(){
    return {
        "name": "Blinding Smite Effect",
        "type": "spell",
        "img": "icons/magic/perception/eye-ringed-glow-angry-large-red.webp",
        "data": {
            "description": {
                "value": "<p>The target must succeed on a Constitution saving throw or be blinded until the spell ends.</p>",
                "chat": "",
                "unidentified": ""
            },
            "activation": {
                "type": "none",
                "cost": 0,
                "condition": ""
            },
            "actionType": "save",
            "save": {
                "ability": "con",
                "dc": null,
                "scaling": "spell"
            },
            "level": 0,
            "school": "evo",
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
                        "key": "flags.midi-qol.OverTime",
                        "mode": 2,
                        "value": "turn=end,\nsaveAbility=con,\nsaveDC=@attributes.spelldc,\nlabel=Blinded",
                        "priority": "20"
                    }
                ],
                "disabled": false,
                "duration": {
                    "startTime": null,
                    "seconds": 60,
                    "rounds": 10
                },
                "icon": "icons/magic/perception/eye-ringed-glow-angry-large-red.webp",
                "label": "Blinded",
                "transfer": false,
            }
        ]
    }
}

async function useItem(tokenUuid, targetUuids, itemData) {
    const token = await fromUuid(tokenUuid)
    const actor = token.actor ?? token
    let [item] = await actor.createEmbeddedDocuments("Item", [itemData])
    await MidiQOL.completeItemUse(item, {}, { targetUuids });
    await actor.deleteEmbeddedDocuments("Item", [item.id])
}
