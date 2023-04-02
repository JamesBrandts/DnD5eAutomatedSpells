const lastArg = args[args.length - 1];
const casterToken = await fromUuid(lastArg.tokenUuid)
const template = await fromUuid(lastArg.templateUuid)
const item = await fromUuid(lastArg.itemUuid)
const actor = await fromUuid(lastArg.actorUuid);
const hookId = Hooks.on("updateCombat", async (combat) => {
    const currentToken = canvas.tokens.get(combat.current.tokenId)
    const previousToken = canvas.tokens.get(combat.previous.tokenId)
    if (canvas.grid.measureDistance(previousToken.center, template) <= template.distance)
        await rollItemEnd(previousToken)
    if (canvas.grid.measureDistance(currentToken.center, template) <= template.distance)
        await rollItemStart(currentToken)
})
const endEffectHookId = Hooks.on("deleteActiveEffect", (effect) => {
    if (effect.label !== "Concentrating") return
    if (lastArg.itemUuid !== effect.origin) return
    Hooks.off("updateCombat", hookId)
    Hooks.off("deleteActiveEffect", endEffectHookId)
})

async function rollItemEnd(previousToken) {
    await applyDamageEnd(previousToken)
}

async function rollItemStart(currentToken) {
    await applyDamageStart(currentToken)
}

async function applyDamageStart(currentToken) {
    let tokenUuid = currentToken.uuid ?? currentToken.document.uuid
    let damageItem = await casterToken.actor.createEmbeddedDocuments("Item", [getItemDataStart()])
    await MidiQOL.completeItemUse(damageItem[0], {}, { targetUuids: [tokenUuid] });
    await casterToken.actor.deleteEmbeddedDocuments("Item", [damageItem[0].id])
}

async function applyDamageEnd(previousToken) {
    let tokenUuid = previousToken.uuid ?? previousToken.document.uuid
    let damageItem = await casterToken.actor.createEmbeddedDocuments("Item", [getItemDataEnd()])
    await MidiQOL.completeItemUse(damageItem[0], {}, { targetUuids: [tokenUuid] });
    await casterToken.actor.deleteEmbeddedDocuments("Item", [damageItem[0].id])
}

function getItemDataStart() {
    return {
        name: item.name + " Cold Damage",
        type: "spell",
        img: item.img,
        system: {
            activation: { type: "none" },
            damage: { parts: [[`2d6`, `cold`]] },
            level: 0,
            school: "con"
        },
    }
}

function getItemDataEnd() {
    return {
        name: item.name + " Acid Damage",
        type: "spell",
        img: item.img,
        system: {
            description: {
                value: ""
            },
            actionType: "save",
            activation: { type: "none" },
            damage: { parts: [[`2d6`, `acid`]] },
            save: { ability: "dex", dc: null, scaling: "spell" },
            level: 0,
            school: "con",
        },
        flags:{midiProperties:{nodam:true}}
    };
}
