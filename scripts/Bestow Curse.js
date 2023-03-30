
const lastArg = args[args.length - 1]
const actor = await fromUuid(lastArg.actorUuid)
const curse = await ShowDialogCurse()
const item = await fromUuid(lastArg.itemUuid)
const copy_item = duplicate(item.toObject(false))
let ability = ""
if (curse === "disadvantageAbility") {
    ability = await ShowDialogHabilities()
    copy_item.effects = getAbilityDisadvantageEffectData(ability)
    actor.updateEmbeddedDocuments("Item",[temp])
}


console.log({ lastArg, curse, ability })

async function ShowDialogCurse() {
    return await new Promise((resolve) => {
        new Dialog({
            title: "Bestow Curse",
            content: `Choose the nature of the curse on the target`,
            buttons: {
                disadvantageAbility: {
                    label: "Disadvantage on ability checks and saving throws made with one ability score",
                    callback: () => {
                        resolve("disadvantageAbility");
                    }
                },
                disadvantageAttack: {
                    label: "Disadvantage on attacks made agains you ",
                    callback: () => {
                        resolve("disadvantageAttack");
                    }
                },
                wastaAction: {
                    label: "Chance of losing it's action",
                    callback: () => {
                        resolve("wastaAction");
                    }
                },
                extraDamage: {
                    label: "Take extra damage from you",
                    callback: () => {
                        resolve("extraDamage");
                    }
                }
            },
            default: "extraDamage"
        }).render(true);
    })
}

async function ShowDialogHabilities() {
    return await new Promise((resolve) => {
        new Dialog({
            title: "Bestow Curse",
            content: `Choose hability to give disadvantage on ability checks and saving throws`,
            buttons: {
                str: {
                    label: "STR",
                    callback: () => {
                        resolve("str");
                    }
                },
                dex: {
                    label: "DEX",
                    callback: () => {
                        resolve("dex");
                    }
                },
                con: {
                    label: "CON",
                    callback: () => {
                        resolve("con");
                    }
                },
                wis: {
                    label: "WIS",
                    callback: () => {
                        resolve("wis");
                    }
                },
                int: {
                    label: "INT",
                    callback: () => {
                        resolve("int");
                    }
                },
                cha: {
                    label: "CHA",
                    callback: () => {
                        resolve("cha");
                    }
                }
            },
            default: "str"
        }).render(true);
    })
}

function getAbilityDisadvantageEffectData(ability) {
    return [
        {
            "label": lastArg.item.name,
            "icon": lastArg.item.img,
            "changes": [
                {
                    "key": `flags.midi-qol.disadvantage.ability.save.${ability}`,
                    "mode": 2,
                    "value": "1",
                    "priority": 20
                },
                {
                    "key": `flags.midi-qol.disadvantage.ability.check.${ability}`,
                    "mode": 2,
                    "value": "1",
                    "priority": 20
                }
            ],
            "transfer": false,
            "duration": {
                "rounds": 10,
            },
            "origin": lastArg.item.uuid,
        }
    ]
}