

if (await ShowDialogCurse() === "disadvantageAbility") {
    await ShowDialogHabilities()
}
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
