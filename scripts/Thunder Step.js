if (args[0].macroPass === "preItemRoll") {
    const target = game.user.targets.find(i => canvas.grid.measureDistance(i.center, token.center) < 7.5)
    if (target)
        await DAE.setFlag(actor, "ThunderStepTarget", target.id)

}
if (args[0].macroPass === "postActiveEffects") {
    const token = await fromUuid(args[0].tokenUuid)
    const template = await fromUuid(args[0].templateUuid)
    const companion = canvas.tokens.get(await DAE.getFlag(actor, "ThunderStepTarget"))
    const center = token.object.center
    if (companion)
        await companion.document.update({ x: template.x, y: template.y + canvas.grid.size }, { animate: false })
    await token.update({ x: template.x, y: template.y }, { animate: false })
    template.delete()
    await DAE.unsetFlag(actor, "ThunderStepTarget")
    const targetUuids = canvas.tokens.placeables.filter(i => canvas.grid.measureDistance(i.center, center) <= 10).map(i => i.document.uuid)
    const tokenUuid = token.uuid
    if (targetUuids.length < 1) return
    game.messages.get(args[0].itemCardId).delete()
    useItem(tokenUuid, targetUuids, getItemData(args[0].spellLevel))
}


async function useItem(tokenUuid, targetUuids, itemData) {
    const token = await fromUuid(tokenUuid)
    const actor = token.actor ?? token
    let [item] = await actor.createEmbeddedDocuments("Item", [itemData])
    await MidiQOL.completeItemUse(item, {}, { targetUuids });
    await actor.deleteEmbeddedDocuments("Item", [item.id])
}


function getItemData(spellLevel) {
    return {
        name: args[0].item.name,
        type: "spell",
        img: args[0].item.img,
        system: {
            description:args[0].item.system.description,            
            actionType: "save",
            activation: { type: "none" },
            damage: { parts: [[`${spellLevel}d10`, `thunder`]] },
            save: { ability: "con", dc: null, scaling: "spell" },
            level: 0,
            school: "con",
        },
    };
}