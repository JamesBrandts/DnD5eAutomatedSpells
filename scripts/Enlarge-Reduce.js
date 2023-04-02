const lastArg = args[args.length-1];
const casterToken = await fromUuid(lastArg.tokenUuid);
const origin = lastArg.itemUuid
const targetToken = lastArg.targets[0]



const effectsData = [
    {
        "changes": [
            {
                "key": "flags.midi-qol.advantage.ability.save.str",
                "mode": 2,
                "value": "0",
                "priority": "20"
            },
            {
                "key": "flags.midi-qol.advantage.ability.check.str",
                "mode": 2,
                "value": "0",
                "priority": "20"
            },
            {
                "key": "data.bonuses.mwak.damage",
                "mode": 2,
                "value": "1d4",
                "priority": "20"
            },
            {
                "key": "data.bonuses.rwak.damage",
                "mode": 2,
                "value": "1d4",
                "priority": "20"
            }
        ],
        "disabled": false,
        "duration": {
            "seconds": 60,
            "rounds": 10
        },
        "icon": "icons/magic/control/silhouette-grow-shrink-blue.webp",
        "label": "Enlarge",
        "origin": origin,
        "transfer": false,
    },
    {
        "changes": [
            {
                "key": "flags.midi-qol.disadvantage.ability.save.str",
                "mode": 2,
                "value": "0",
                "priority": "20"
            },
            {
                "key": "flags.midi-qol.disadvantage.ability.check.str",
                "mode": 2,
                "value": "0",
                "priority": "20"
            },
            {
                "key": "data.bonuses.mwak.damage",
                "mode": 2,
                "value": "-1d4",
                "priority": "20"
            },
            {
                "key": "data.bonuses.rwak.damage",
                "mode": 2,
                "value": "-1d4",
                "priority": "20"
            }
        ],
        "disabled": false,
        "duration": {
            "rounds": 10,
            "startTime": null,
            "seconds": 60
        },
        "icon": "icons/magic/control/silhouette-grow-shrink-tan.webp",
        "label": "Reduce",
        "origin": origin,
        "transfer": false,
    }
]
await new Dialog({
        title: 'Enlarge/Reduce',
        buttons: {
            enlarge: {
                label: 'Enlarge',
                callback: (html) => {
                    MidiQOL.socket().executeAsGM("createEffects", {actorUuid: targetToken.actor.uuid, effects: [effectsData[0]]});                
                }
            },
            reduce: {
                label: 'Reduce',
                callback: (html) => {
                    MidiQOL.socket().executeAsGM("createEffects", {actorUuid: targetToken.actor.uuid, effects: [effectsData[1]]});                
                }
            },
        }
}).render(true)